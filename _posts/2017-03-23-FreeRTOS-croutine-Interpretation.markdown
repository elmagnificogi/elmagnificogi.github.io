---
layout:     post
title:      "FreeRTOS中croutine源文件分析(五)"
subtitle:   "嵌入式，FreeRTOS，croutine"
date:       2017-03-22
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## 协程

在FreeRTOS中中,使用到了一种C语言实现的多任务计数,专业的定义叫做协程(coroutine),顾名思义,这是一种协作的例程, 跟具有操作系统概念的线程不一样，协程是在用户空间利用程序语言的语法语义就能实现逻辑上类似多任务的编程技巧。

意思就是说协程不需要每次调用的时候都为任务准备一次空间,我们知道像ucos这种操作系统,它内置的多任务是需要在中断过程中切换堆栈的,开销较大,而协程的功能就是在尽量降低开销的情况下,实现能够保存函数上下文快速切换的办法,用操作系统的概念来说,一千个一万个协程对应的其实还是一个任务,也可以这样认为,对应的就是一个很长的函数,函数中途会返回,但是返回之后再次进入函数的时候,会从上次我们返回的地方继续执行.

## croutine源文件分析

croutine类似于task，可以进行类似的多任务调度。

它和task的区别在于croutine没有自己的栈空间，因此当进行多任务调度时，所有的局部变量都会无效，并且由于没有独立的栈空间，它的多任务调度也不能和task或者其他的通用性操作系统一样，通过压栈和切换栈的方式来进行多任务切换，croutine的切换方式很有意思，是通过swith的方式进行的，或者说是来模拟的。

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

#### 协程链表初始化

```c
static void prvInitialiseCoRoutineLists( void )
{
UBaseType_t uxPriority;

	for( uxPriority = 0; uxPriority < configMAX_CO_ROUTINE_PRIORITIES; uxPriority++ )
	{
		vListInitialise( ( List_t * ) &( pxReadyCoRoutineLists[ uxPriority ] ) );
	}

	vListInitialise( ( List_t * ) &xDelayedCoRoutineList1 );
	vListInitialise( ( List_t * ) &xDelayedCoRoutineList2 );
	vListInitialise( ( List_t * ) &xPendingReadyCoRoutineList );

	/* Start with pxDelayedCoRoutineList using list1 and the
	pxOverflowDelayedCoRoutineList using list2. */
	pxDelayedCoRoutineList = &xDelayedCoRoutineList1;
	pxOverflowDelayedCoRoutineList = &xDelayedCoRoutineList2;
}
```
初始化管理协程的链表。

首先是按照优先级顺序初始化好各个优先级的协程任务列表。

然后初始化2个延时任务列表，其中一个是存储超时的任务列表

初始化了等待事件驱动信号随时准备被执行的任务列表。

这样也就完成了整个协程的任务列表。

#### 协程创建函数

```c
BaseType_t xCoRoutineCreate( crCOROUTINE_CODE pxCoRoutineCode, UBaseType_t uxPriority, UBaseType_t uxIndex )
{
BaseType_t xReturn;
CRCB_t *pxCoRoutine;

	/* Allocate the memory that will store the co-routine control block. */
	pxCoRoutine = ( CRCB_t * ) pvPortMalloc( sizeof( CRCB_t ) );
	if( pxCoRoutine )
	{
		/* If pxCurrentCoRoutine is NULL then this is the first co-routine to
		be created and the co-routine data structures need initialising. */
		if( pxCurrentCoRoutine == NULL )
		{
			pxCurrentCoRoutine = pxCoRoutine;
			prvInitialiseCoRoutineLists();
		}

		/* Check the priority is within limits. */
		if( uxPriority >= configMAX_CO_ROUTINE_PRIORITIES )
		{
			uxPriority = configMAX_CO_ROUTINE_PRIORITIES - 1;
		}

		/* Fill out the co-routine control block from the function parameters. */
		pxCoRoutine->uxState = corINITIAL_STATE;
		pxCoRoutine->uxPriority = uxPriority;
		pxCoRoutine->uxIndex = uxIndex;
		pxCoRoutine->pxCoRoutineFunction = pxCoRoutineCode;

		/* Initialise all the other co-routine control block parameters. */
		vListInitialiseItem( &( pxCoRoutine->xGenericListItem ) );
		vListInitialiseItem( &( pxCoRoutine->xEventListItem ) );

		/* Set the co-routine control block as a link back from the ListItem_t.
		This is so we can get back to the containing CRCB from a generic item
		in a list. */
		listSET_LIST_ITEM_OWNER( &( pxCoRoutine->xGenericListItem ), pxCoRoutine );
		listSET_LIST_ITEM_OWNER( &( pxCoRoutine->xEventListItem ), pxCoRoutine );

		/* Event lists are always in priority order. */
		listSET_LIST_ITEM_VALUE( &( pxCoRoutine->xEventListItem ), ( ( TickType_t ) configMAX_CO_ROUTINE_PRIORITIES - ( TickType_t ) uxPriority ) );

		/* Now the co-routine has been initialised it can be added to the ready
		list at the correct priority. */
		prvAddCoRoutineToReadyQueue( pxCoRoutine );

		xReturn = pdPASS;
	}
	else
	{
		xReturn = errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY;
	}

	return xReturn;
}
```
创建一个协程，将其加入到其任务列表中去。

第一个参数指向任务函数，第二个参数是优先级

第三个参数是执行相同任务的区分ID

返回值，如果创建失败返回错误代码

再来看函数内部实现。

首先申请内存存储对应的任务块

##### 任务块结构体

```c
typedef struct corCoRoutineControlBlock
{
	crCOROUTINE_CODE 	pxCoRoutineFunction;
	ListItem_t			xGenericListItem;	/*< List item used to place the CRCB in ready and blocked queues. */
	ListItem_t			xEventListItem;		/*< List item used to place the CRCB in event lists. */
	UBaseType_t 		uxPriority;			/*< The priority of the co-routine in relation to other co-routines. */
	UBaseType_t 		uxIndex;			/*< Used to distinguish between co-routines when multiple co-routines use the same co-routine function. */
	uint16_t 			uxState;			/*< Used internally by the co-routine implementation. */
} CRCB_t; /* Co-routine control block.  Note must be identical in size down to uxPriority with TCB_t. */
```
```c
typedef void * CoRoutineHandle_t;

typedef void (*crCOROUTINE_CODE)( CoRoutineHandle_t, UBaseType_t );
```

可以看到这里的函数原型地址指针，非常特殊。

一个任务有其对应的阻塞队列，事件队列，优先级，区分ID，以及内部状态。

任务块申请失败的话会返回对应的失败代码。

然后给对应的结构体进行初始化，初始化对应的协程任务列表。

优先级超过上限的话，默认是最高优先级。

初始化了协程块中的链表

设置对应链表中的归属程序

将当前任务加入到协程的就绪任务列表中去。

#### 协程加入到延迟任务列表中

```c
void vCoRoutineAddToDelayedList( TickType_t xTicksToDelay, List_t *pxEventList )
{
TickType_t xTimeToWake;

	/* Calculate the time to wake - this may overflow but this is
	not a problem. */
	xTimeToWake = xCoRoutineTickCount + xTicksToDelay;

	/* We must remove ourselves from the ready list before adding
	ourselves to the blocked list as the same list item is used for
	both lists. */
	( void ) uxListRemove( ( ListItem_t * ) &( pxCurrentCoRoutine->xGenericListItem ) );

	/* The list item will be inserted in wake time order. */
	listSET_LIST_ITEM_VALUE( &( pxCurrentCoRoutine->xGenericListItem ), xTimeToWake );

	if( xTimeToWake < xCoRoutineTickCount )
	{
		/* Wake time has overflowed.  Place this item in the
		overflow list. */
		vListInsert( ( List_t * ) pxOverflowDelayedCoRoutineList, ( ListItem_t * ) &( pxCurrentCoRoutine->xGenericListItem ) );
	}
	else
	{
		/* The wake time has not overflowed, so we can use the
		current block list. */
		vListInsert( ( List_t * ) pxDelayedCoRoutineList, ( ListItem_t * ) &( pxCurrentCoRoutine->xGenericListItem ) );
	}

	if( pxEventList )
	{
		/* Also add the co-routine to an event list.  If this is done then the
		function must be called with interrupts disabled. */
		vListInsert( pxEventList, &( pxCurrentCoRoutine->xEventListItem ) );
	}
}
```
首先计算何时唤醒该任务

从就绪和阻塞列表中移除自身任务

如果唤醒时间小于当前时间，那么将其加入到超时任务列表

否则将其加入到延迟任务列表

如果其还有事件驱动任务，那么将其再加入到事件驱动列表中去。




#### 检测是否有任务应移动到就绪队列

```c
static void prvCheckPendingReadyList( void )
{
	/* Are there any co-routines waiting to get moved to the ready list?  These
	are co-routines that have been readied by an ISR.  The ISR cannot access
	the	ready lists itself. */
	while( listLIST_IS_EMPTY( &xPendingReadyCoRoutineList ) == pdFALSE )
	{
		CRCB_t *pxUnblockedCRCB;

		/* The pending ready list can be accessed by an ISR. */
		portDISABLE_INTERRUPTS();
		{
			pxUnblockedCRCB = ( CRCB_t * ) listGET_OWNER_OF_HEAD_ENTRY( (&xPendingReadyCoRoutineList) );
			( void ) uxListRemove( &( pxUnblockedCRCB->xEventListItem ) );
		}
		portENABLE_INTERRUPTS();

		( void ) uxListRemove( &( pxUnblockedCRCB->xGenericListItem ) );
		prvAddCoRoutineToReadyQueue( pxUnblockedCRCB );
	}
}
```
如果等待移动到就绪任务队列不为空的情况下，关中断。

然后获取其任务块，将其从事件链表中移除

开中断

从阻塞队列中移除，加入到就绪队列

#### 检查延迟列表

```c
static void prvCheckDelayedList( void )
{
CRCB_t *pxCRCB;

	xPassedTicks = xTaskGetTickCount() - xLastTickCount;
	while( xPassedTicks )
	{
		xCoRoutineTickCount++;
		xPassedTicks--;

		/* If the tick count has overflowed we need to swap the ready lists. */
		if( xCoRoutineTickCount == 0 )
		{
			List_t * pxTemp;

			/* Tick count has overflowed so we need to swap the delay lists.  If there are
			any items in pxDelayedCoRoutineList here then there is an error! */
			pxTemp = pxDelayedCoRoutineList;
			pxDelayedCoRoutineList = pxOverflowDelayedCoRoutineList;
			pxOverflowDelayedCoRoutineList = pxTemp;
		}

		/* See if this tick has made a timeout expire. */
		while( listLIST_IS_EMPTY( pxDelayedCoRoutineList ) == pdFALSE )
		{
			pxCRCB = ( CRCB_t * ) listGET_OWNER_OF_HEAD_ENTRY( pxDelayedCoRoutineList );

			if( xCoRoutineTickCount < listGET_LIST_ITEM_VALUE( &( pxCRCB->xGenericListItem ) ) )
			{
				/* Timeout not yet expired. */
				break;
			}

			portDISABLE_INTERRUPTS();
			{
				/* The event could have occurred just before this critical
				section.  If this is the case then the generic list item will
				have been moved to the pending ready list and the following
				line is still valid.  Also the pvContainer parameter will have
				been set to NULL so the following lines are also valid. */
				( void ) uxListRemove( &( pxCRCB->xGenericListItem ) );

				/* Is the co-routine waiting on an event also? */
				if( pxCRCB->xEventListItem.pvContainer )
				{
					( void ) uxListRemove( &( pxCRCB->xEventListItem ) );
				}
			}
			portENABLE_INTERRUPTS();

			prvAddCoRoutineToReadyQueue( pxCRCB );
		}
	}

	xLastTickCount = xCoRoutineTickCount;
}
```
计算下上次调度和本次调度间的时间差，然后根据时间差单步遍历所有的croutine，根据其延时确定是否该加入到就绪队列中。

如果xCoRoutineTickCount计数器溢出了，交换两个延迟队列。

如果延迟执行队列不为空的情况下，依次获取队列头任务

如果xCoRoutineTickCount还小于其设定值，说明没到执行时间，继续遍历。

否则说明超时了，关中断，从其队列移除，如果其还有事件驱动也一并移除，开中断

将其加入到就绪队列中。

#### 协程调度函数

```c
void vCoRoutineSchedule( void )
{
	/* See if any co-routines readied by events need moving to the ready lists. */
	prvCheckPendingReadyList();

	/* See if any delayed co-routines have timed out. */
	prvCheckDelayedList();

	/* Find the highest priority queue that contains ready co-routines. */
	while( listLIST_IS_EMPTY( &( pxReadyCoRoutineLists[ uxTopCoRoutineReadyPriority ] ) ) )
	{
		if( uxTopCoRoutineReadyPriority == 0 )
		{
			/* No more co-routines to check. */
			return;
		}
		--uxTopCoRoutineReadyPriority;
	}

	/* listGET_OWNER_OF_NEXT_ENTRY walks through the list, so the co-routines
	 of the	same priority get an equal share of the processor time. */
	listGET_OWNER_OF_NEXT_ENTRY( pxCurrentCoRoutine, &( pxReadyCoRoutineLists[ uxTopCoRoutineReadyPriority ] ) );

	/* Call the co-routine. */
	( pxCurrentCoRoutine->pxCoRoutineFunction )( pxCurrentCoRoutine, pxCurrentCoRoutine->uxIndex );

	return;
}
```

首先检查是否有基于事件驱动的任务可以被移动到就绪队列

然后检查是否有延时任务已经到了该执行的时候。

如果就绪队列不为空，那么检查就绪队列中最高优先级的任务。

获取其任务块，然后协程调用执行。

#### 从事件驱动中移除协程函数

```c
BaseType_t xCoRoutineRemoveFromEventList( const List_t *pxEventList )
{
CRCB_t *pxUnblockedCRCB;
BaseType_t xReturn;

	/* This function is called from within an interrupt.  It can only access
	event lists and the pending ready list.  This function assumes that a
	check has already been made to ensure pxEventList is not empty. */
	pxUnblockedCRCB = ( CRCB_t * ) listGET_OWNER_OF_HEAD_ENTRY( pxEventList );
	( void ) uxListRemove( &( pxUnblockedCRCB->xEventListItem ) );
	vListInsertEnd( ( List_t * ) &( xPendingReadyCoRoutineList ), &( pxUnblockedCRCB->xEventListItem ) );

	if( pxUnblockedCRCB->uxPriority >= pxCurrentCoRoutine->uxPriority )
	{
		xReturn = pdTRUE;
	}
	else
	{
		xReturn = pdFALSE;
	}

	return xReturn;
}
```
获取任务块，从事件列表中移除对应的任务

将其插入到准备移动到就绪任务列表的尾部

使用前提是要保证事件任务列表非空才能调用。

## 总结

第一次接触协程，其实还不是很明白怎么回事，之后再针对协程写一篇详细介绍协程的。

## Quote

> croutine.c
>
> http://cstriker1407.info/blog/freertos-croutine/
>
> http://blog.csdn.net/lqk1985/article/details/6535598

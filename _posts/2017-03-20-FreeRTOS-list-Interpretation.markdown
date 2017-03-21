---
layout:     post
title:      "FreeRTOS中list源文件分析"
subtitle:   "嵌入式，FreeRTOS，list"
date:       2017-03-20
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## list源文件分析

之所以先拿list分析，是因为list与其系统核心部分关联比较小，而且又只是链表，比较容易理解。

其实最重要的是list文件很短...

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

## 注释

老样子，先来看看文件注释说了什么，如何介绍这个文件的。

```c
/*
    FreeRTOS V9.0.0 - Copyright (C) 2016 Real Time Engineers Ltd.
    All rights reserved

    VISIT http://www.FreeRTOS.org TO ENSURE YOU ARE USING THE LATEST VERSION.

    This file is part of the FreeRTOS distribution.

    FreeRTOS is free software; you can redistribute it and/or modify it under
    the terms of the GNU General Public License (version 2) as published by the
    Free Software Foundation >>>> AND MODIFIED BY <<<< the FreeRTOS exception.

    ***************************************************************************
    >>!   NOTE: The modification to the GPL is included to allow you to     !<<
    >>!   distribute a combined work that includes FreeRTOS without being   !<<
    >>!   obliged to provide the source code for proprietary components     !<<
    >>!   outside of the FreeRTOS kernel.                                   !<<
    ***************************************************************************

    FreeRTOS is distributed in the hope that it will be useful, but WITHOUT ANY
    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE.  Full license text is available on the following
    link: http://www.freertos.org/a00114.html

    ***************************************************************************
     *                                                                       *
     *    FreeRTOS provides completely free yet professionally developed,    *
     *    robust, strictly quality controlled, supported, and cross          *
     *    platform software that is more than just the market leader, it     *
     *    is the industry's de facto standard.                               *
     *                                                                       *
     *    Help yourself get started quickly while simultaneously helping     *
     *    to support the FreeRTOS project by purchasing a FreeRTOS           *
     *    tutorial book, reference manual, or both:                          *
     *    http://www.FreeRTOS.org/Documentation                              *
     *                                                                       *
    ***************************************************************************

    http://www.FreeRTOS.org/FAQHelp.html - Having a problem?  Start by reading
    the FAQ page "My application does not run, what could be wrong?".  Have you
    defined configASSERT()?

    http://www.FreeRTOS.org/support - In return for receiving this top quality
    embedded software for free we request you assist our global community by
    participating in the support forum.

    http://www.FreeRTOS.org/training - Investing in training allows your team to
    be as productive as possible as early as possible.  Now you can receive
    FreeRTOS training directly from Richard Barry, CEO of Real Time Engineers
    Ltd, and the world's leading authority on the world's leading RTOS.

    http://www.FreeRTOS.org/plus - A selection of FreeRTOS ecosystem products,
    including FreeRTOS+Trace - an indispensable productivity tool, a DOS
    compatible FAT file system, and our tiny thread aware UDP/IP stack.

    http://www.FreeRTOS.org/labs - Where new FreeRTOS products go to incubate.
    Come and try FreeRTOS+TCP, our new open source TCP/IP stack for FreeRTOS.

    http://www.OpenRTOS.com - Real Time Engineers ltd. license FreeRTOS to High
    Integrity Systems ltd. to sell under the OpenRTOS brand.  Low cost OpenRTOS
    licenses offer ticketed support, indemnification and commercial middleware.

    http://www.SafeRTOS.com - High Integrity Systems also provide a safety
    engineered and independently SIL3 certified version for use in safety and
    mission critical applications that require provable dependability.

    1 tab == 4 spaces!
*/
```

让人生气的是，FreeRTOS的文件注释，丝毫没有对文件内容的说明，全部都是关于文件版权相关的问题。

## 源码

#### 头文件

```c
#include <stdlib.h>
#include "FreeRTOS.h"
#include "list.h"
```

首先是引用了标准头文件stdlib.h，系统头文件FreeRTOS.h（这里面内容特别多，以后再说），以及list.h，其实大多数函数说明都在这个头文件中了,所以后面配合头文件进行分析。

之前想看到的文件注释自然也在list.h中

```c
/*
 * This is the list implementation used by the scheduler.  While it is tailored
 * heavily for the schedulers needs, it is also available for use by
 * application code.
 *
 * list_ts can only store pointers to list_item_ts.  Each ListItem_t contains a
 * numeric value (xItemValue).  Most of the time the lists are sorted in
 * descending item value order.
 *
 * Lists are created already containing one list item.  The value of this
 * item is the maximum possible that can be stored, it is therefore always at
 * the end of the list and acts as a marker.  The list member pxHead always
 * points to this marker - even though it is at the tail of the list.  This
 * is because the tail contains a wrap back pointer to the true head of
 * the list.
 *
 * In addition to it's value, each list item contains a pointer to the next
 * item in the list (pxNext), a pointer to the list it is in (pxContainer)
 * and a pointer to back to the object that contains it.  These later two
 * pointers are included for efficiency of list manipulation.  There is
 * effectively a two way link between the object containing the list item and
 * the list item itself.
 *
 * \page ListIntroduction List Implementation
 * \ingroup FreeRTOSIntro
 */
```

这个是任务调度系统的list的实现，虽然是专门为调度系统写的，但是应用程序也是可以使用的。

list_ts只能用于存储list_item_ts的指针，每一个ListItem_t都有一个数值，多数时间这个list都是按照降序排列的

list在创建的时候就已经有了一个item，其存储的数值是该数据类型的最大值，所以这个item总是作为list的尾部，视为list的marker。
list的pxhead总是指向marker，marker作为链表尾部总是包含一个指向链表头的指针。

简单说这里的链表是一个双循环双指针链表，包含了指向下一个值得指针和上一个值得指针。同时尾指针还指向了头部，头部指向尾部，所以是双循环。


#### 初始化函数
```c
/*
 * Must be called before a list is used!  This initialises all the members
 * of the list structure and inserts the xListEnd item into the list as a
 * marker to the back of the list.
 *
 * @param pxList Pointer to the list being initialised.
 *
 * \page vListInitialise vListInitialise
 * \ingroup LinkedList
 */
void vListInitialise( List_t * const pxList )
{
	/* The list structure contains a list item which is used to mark the
	end of the list.  To initialise the list the list end is inserted
	as the only list entry. */
	pxList->pxIndex = ( ListItem_t * ) &( pxList->xListEnd );			
	/*lint !e826 !e740 The mini list structure is used as the list end to save RAM.  This is checked and valid. */

	/* The list end value is the highest possible value in the list to
	ensure it remains at the end of the list. */
	pxList->xListEnd.xItemValue = portMAX_DELAY;

	/* The list end next and previous pointers point to itself so we know
	when the list is empty. */
	pxList->xListEnd.pxNext = ( ListItem_t * ) &( pxList->xListEnd );	
	/*lint !e826 !e740 The mini list structure is used as the list end to save RAM.  This is checked and valid. */
	pxList->xListEnd.pxPrevious = ( ListItem_t * ) &( pxList->xListEnd );
	/*lint !e826 !e740 The mini list structure is used as the list end to save RAM.  This is checked and valid. */

	pxList->uxNumberOfItems = ( UBaseType_t ) 0U;

	/* Write known values into the list if
	configUSE_LIST_DATA_INTEGRITY_CHECK_BYTES is set to 1. */
	listSET_LIST_INTEGRITY_CHECK_1_VALUE( pxList );
	listSET_LIST_INTEGRITY_CHECK_2_VALUE( pxList );
}
```

list的初始化函数，初始化所有list结构体的成员，并且插入了第一个item，作为链表尾部，视为maker。

###### List_t结构体

首先看传入的参数List_t * const pxList的结构体List_t

```C
typedef struct xLIST
{
	listFIRST_LIST_INTEGRITY_CHECK_VALUE				/*< Set to a known value if configUSE_LIST_DATA_INTEGRITY_CHECK_BYTES is set to 1. */
	configLIST_VOLATILE UBaseType_t uxNumberOfItems;
	ListItem_t * configLIST_VOLATILE pxIndex;			/*< Used to walk through the list.  Points to the last item returned by a call to listGET_OWNER_OF_NEXT_ENTRY (). */
	MiniListItem_t xListEnd;							/*< List item that contains the maximum possible item value meaning it is always at the end of the list and is therefore used as a marker. */
	listSECOND_LIST_INTEGRITY_CHECK_VALUE				/*< Set to a known value if configUSE_LIST_DATA_INTEGRITY_CHECK_BYTES is set to 1. */
} List_t;
```

	listFIRST_LIST_INTEGRITY_CHECK_VALUE

这个是用于做越界检测的，如果configUSE_LIST_DATA_INTEGRITY_CHECK_BYTES == 0的情况下，那么这里就是空，没有任何影响。

	configLIST_VOLATILE UBaseType_t uxNumberOfItems;

这个变量就是指list中item的数量，其尾item不算

###### ListItem_t结构体

	ListItem_t * configLIST_VOLATILE pxIndex;

这其实是list表中的一个item，这个item的结构体如下

```c
	struct xLIST_ITEM
	{
		listFIRST_LIST_ITEM_INTEGRITY_CHECK_VALUE			/*< Set to a known value if configUSE_LIST_DATA_INTEGRITY_CHECK_BYTES is set to 1. */
		configLIST_VOLATILE TickType_t xItemValue;			/*< The value being listed.  In most cases this is used to sort the list in descending order. */
		struct xLIST_ITEM * configLIST_VOLATILE pxNext;		/*< Pointer to the next ListItem_t in the list. */
		struct xLIST_ITEM * configLIST_VOLATILE pxPrevious;	/*< Pointer to the previous ListItem_t in the list. */
		void * pvOwner;										/*< Pointer to the object (normally a TCB) that contains the list item.  There is therefore a two way link between the object containing the list item and the list item itself. */
		void * configLIST_VOLATILE pvContainer;				/*< Pointer to the list in which this list item is placed (if any). */
		listSECOND_LIST_ITEM_INTEGRITY_CHECK_VALUE			/*< Set to a known value if configUSE_LIST_DATA_INTEGRITY_CHECK_BYTES is set to 1. */
	};
	typedef struct xLIST_ITEM ListItem_t;					/* For some reason lint wants this as two separate definitions. */
```

	configLIST_VOLATILE TickType_t xItemValue;

list中用于排序的值

	struct xLIST_ITEM * configLIST_VOLATILE pxNext;
	struct xLIST_ITEM * configLIST_VOLATILE pxPrevious;

前指针和后指针

	void * pvOwner;	

这个是存储这个item的对象指针。

	void * configLIST_VOLATILE pvContainer;

指向存储这个item的list指针。

###### MiniListItem_t结构体

	MiniListItem_t xListEnd;

```c
struct xMINI_LIST_ITEM
{
	listFIRST_LIST_ITEM_INTEGRITY_CHECK_VALUE			/*< Set to a known value if configUSE_LIST_DATA_INTEGRITY_CHECK_BYTES is set to 1. */
	configLIST_VOLATILE TickType_t xItemValue;
	struct xLIST_ITEM * configLIST_VOLATILE pxNext;
	struct xLIST_ITEM * configLIST_VOLATILE pxPrevious;
};
typedef struct xMINI_LIST_ITEM MiniListItem_t;
```

这个其实是队尾item，存储了他可能存储的最大的值
他也是一个item对象，也有前后指针和值

总算是看完了这里用的结构体，然后来看初始化函数干了什么。

第一步让list中的第一个item成为list_end_item

第二步让enditem的值变成最大，其最大值定义如下，32位。

	#if( configUSE_16_BIT_TICKS == 1 )
		typedef uint16_t TickType_t;
		#define portMAX_DELAY ( TickType_t ) 0xffff
	#else
		typedef uint32_t TickType_t;
		#define portMAX_DELAY ( TickType_t ) 0xffffffffUL

第三步尾指针的前后指针都等于他自身，表示当前链表为空

第四步初始化list中item数量=0，尾item不算数量

第五步如果配置了越界的检查，那么这里会对越界做一次检查，否则就相当于什么都没有。

#### 初始化item函数

```c
/*
 * Must be called before a list item is used.  This sets the list container to
 * null so the item does not think that it is already contained in a list.
 *
 * @param pxItem Pointer to the list item being initialised.
 *
 * \page vListInitialiseItem vListInitialiseItem
 * \ingroup LinkedList
 */
void vListInitialiseItem( ListItem_t * const pxItem )
{
	/* Make sure the list item is not recorded as being on a list. */
	pxItem->pvContainer = NULL;

	/* Write known values into the list item if
	configUSE_LIST_DATA_INTEGRITY_CHECK_BYTES is set to 1. */
	listSET_FIRST_LIST_ITEM_INTEGRITY_CHECK_VALUE( pxItem );
	listSET_SECOND_LIST_ITEM_INTEGRITY_CHECK_VALUE( pxItem );
}
```

有了上面对于结构体的介绍，这里看就比较简单了。

传入了一个item，然后对pvContainer赋值为空，表示其没有存储在lsit中

然后是检测越界的

#### list尾部插入函数

```c
/*
 * Insert a list item into a list.  The item will be inserted in a position
 * such that it will be the last item within the list returned by multiple
 * calls to listGET_OWNER_OF_NEXT_ENTRY.
 *
 * The list member pxIndex is used to walk through a list.  Calling
 * listGET_OWNER_OF_NEXT_ENTRY increments pxIndex to the next item in the list.
 * Placing an item in a list using vListInsertEnd effectively places the item
 * in the list position pointed to by pxIndex.  This means that every other
 * item within the list will be returned by listGET_OWNER_OF_NEXT_ENTRY before
 * the pxIndex parameter again points to the item being inserted.
 *
 * @param pxList The list into which the item is to be inserted.
 *
 * @param pxNewListItem The list item to be inserted into the list.
 *
 * \page vListInsertEnd vListInsertEnd
 * \ingroup LinkedList
 */
void vListInsertEnd( List_t * const pxList, ListItem_t * const pxNewListItem )
{
	ListItem_t * const pxIndex = pxList->pxIndex;

	/* Only effective when configASSERT() is also defined, these tests may catch
	the list data structures being overwritten in memory.  They will not catch
	data errors caused by incorrect configuration or use of FreeRTOS. */
	listTEST_LIST_INTEGRITY( pxList );
	listTEST_LIST_ITEM_INTEGRITY( pxNewListItem );

	/* Insert a new list item into pxList, but rather than sort the list,
	makes the new list item the last item to be removed by a call to
	listGET_OWNER_OF_NEXT_ENTRY(). */
	pxNewListItem->pxNext = pxIndex;
	pxNewListItem->pxPrevious = pxIndex->pxPrevious;

	/* Only used during decision coverage testing. */
	mtCOVERAGE_TEST_DELAY();

	pxIndex->pxPrevious->pxNext = pxNewListItem;
	pxIndex->pxPrevious = pxNewListItem;

	/* Remember which list the item is in. */
	pxNewListItem->pvContainer = ( void * ) pxList;

	( pxList->uxNumberOfItems )++;
}
```
传入了list和要插入的item对象

	listTEST_LIST_INTEGRITY( pxList );
	listTEST_LIST_ITEM_INTEGRITY( pxNewListItem );

是对list和item的越界检测

接着就是把新item连接进来，但是这里还没有对list排序

然后给新的item的pvContainer赋值他所在的list。

list的item数量自增。

这其中pxList中的pxIndex一直都是尾指针，每次他的前一指针都是真正的尾部，所以这里是通过他把新item加入进去，然后让他再链接到新item的后面去。

#### list插入函数

```c
/*
 * Insert a list item into a list.  The item will be inserted into the list in
 * a position determined by its item value (descending item value order).
 *
 * @param pxList The list into which the item is to be inserted.
 *
 * @param pxNewListItem The item that is to be placed in the list.
 *
 * \page vListInsert vListInsert
 * \ingroup LinkedList
 */
void vListInsert( List_t * const pxList, ListItem_t * const pxNewListItem )
{
	ListItem_t *pxIterator;
	const TickType_t xValueOfInsertion = pxNewListItem->xItemValue;

	/* Only effective when configASSERT() is also defined, these tests may catch
	the list data structures being overwritten in memory.  They will not catch
	data errors caused by incorrect configuration or use of FreeRTOS. */
	listTEST_LIST_INTEGRITY( pxList );
	listTEST_LIST_ITEM_INTEGRITY( pxNewListItem );

	/* Insert the new list item into the list, sorted in xItemValue order.

	If the list already contains a list item with the same item value then the
	new list item should be placed after it.  This ensures that TCB's which are
	stored in ready lists (all of which have the same xItemValue value) get a
	share of the CPU.  However, if the xItemValue is the same as the back marker
	the iteration loop below will not end.  Therefore the value is checked
	first, and the algorithm slightly modified if necessary. */
	if( xValueOfInsertion == portMAX_DELAY )
	{
		pxIterator = pxList->xListEnd.pxPrevious;
	}
	else
	{
		/* *** NOTE ***********************************************************
		If you find your application is crashing here then likely causes are
		listed below.  In addition see http://www.freertos.org/FAQHelp.html for
		more tips, and ensure configASSERT() is defined!
		http://www.freertos.org/a00110.html#configASSERT

			1) Stack overflow -
			   see http://www.freertos.org/Stacks-and-stack-overflow-checking.html
			2) Incorrect interrupt priority assignment, especially on Cortex-M
			   parts where numerically high priority values denote low actual
			   interrupt priorities, which can seem counter intuitive.  See
			   http://www.freertos.org/RTOS-Cortex-M3-M4.html and the definition
			   of configMAX_SYSCALL_INTERRUPT_PRIORITY on
			   http://www.freertos.org/a00110.html
			3) Calling an API function from within a critical section or when
			   the scheduler is suspended, or calling an API function that does
			   not end in "FromISR" from an interrupt.
			4) Using a queue or semaphore before it has been initialised or
			   before the scheduler has been started (are interrupts firing
			   before vTaskStartScheduler() has been called?).
		**********************************************************************/

		for( pxIterator = ( ListItem_t * ) &( pxList->xListEnd ); pxIterator->pxNext->xItemValue <= xValueOfInsertion; pxIterator = pxIterator->pxNext ) /*lint !e826 !e740 The mini list structure is used as the list end to save RAM.  This is checked and valid. */
		{
			/* There is nothing to do here, just iterating to the wanted
			insertion position. */
		}
	}

	pxNewListItem->pxNext = pxIterator->pxNext;
	pxNewListItem->pxNext->pxPrevious = pxNewListItem;
	pxNewListItem->pxPrevious = pxIterator;
	pxIterator->pxNext = pxNewListItem;

	/* Remember which list the item is in.  This allows fast removal of the
	item later. */
	pxNewListItem->pvContainer = ( void * ) pxList;

	( pxList->uxNumberOfItems )++;
}
```
这个是list的插入函数，传入了list和要插入的item

先定义了一个item的迭代器，用来迭代

接着又做了越界检测

如果要插入的值等于最大值，那么迭代器直接指向真实尾部

如果不是最大值，那么就要做一个插入检测，

给迭代器赋值end_item,因为end_item的next其实指向的是头item，所以相当于这里是从头item开始遍历

找到那个比插入值大的位置，这时迭代器指向的item值刚好比插入的要小一点。

然后把新item链接进去。

给新的item的pvContainer赋值他所在的list。

list的item数量自增。

#### list删除函数

```c
/*
 * Remove an item from a list.  The list item has a pointer to the list that
 * it is in, so only the list item need be passed into the function.
 *
 * @param uxListRemove The item to be removed.  The item will remove itself from
 * the list pointed to by it's pxContainer parameter.
 *
 * @return The number of items that remain in the list after the list item has
 * been removed.
 *
 * \page uxListRemove uxListRemove
 * \ingroup LinkedList
 */
UBaseType_t uxListRemove( ListItem_t * const pxItemToRemove )
{
	/* The list item knows which list it is in.  Obtain the list from the list
	item. */
	List_t * const pxList = ( List_t * ) pxItemToRemove->pvContainer;

	pxItemToRemove->pxNext->pxPrevious = pxItemToRemove->pxPrevious;
	pxItemToRemove->pxPrevious->pxNext = pxItemToRemove->pxNext;

	/* Only used during decision coverage testing. */
	mtCOVERAGE_TEST_DELAY();

	/* Make sure the index is left pointing to a valid item. */
	if( pxList->pxIndex == pxItemToRemove )
	{
		pxList->pxIndex = pxItemToRemove->pxPrevious;
	}
	else
	{
		mtCOVERAGE_TEST_MARKER();
	}

	pxItemToRemove->pvContainer = NULL;
	( pxList->uxNumberOfItems )--;

	return pxList->uxNumberOfItems;
}
```

删除item对象，只需要传入item自身即可，因为item自身中存储了他所在的list

这里先用逻辑删除，把要删除的item，从链表中排除出去

因为有可能要删除的是最后一个节点，所以为了不把尾删除了，要检查一下。

然后逻辑里把这个item指向的list清空

list对应的item数量自减

返回list的item数量，从逻辑上删除了item

## 总结

总的来说这个list就是一个一般的list

单循环的双指针list

同时他使用了void指针，来兼容各种数据类型。

其实这里用c语言完成了多态，重载，封装的思想

而且还有对于越界的各种检测，大概这就是他能作为源码的理由吧

其实这里我还遗留了一个小问题，为什么删除item是逻辑删除，那这个被删除的item的内存由谁来回收？

这个需要我继续看源码才能知道他的内存管理机制。

其实还有一些细碎的内容在头文件中，大多数都是宏定义的，用来返回和list或者item相关的内容的函数，都比较简单，就不分析了。

## Quote

> list.c
> 
> list.h
> 
> http://xilinx.eetrend.com/blog/8219
> 
> http://blog.csdn.net/liyuanbhu/article/details/7562533
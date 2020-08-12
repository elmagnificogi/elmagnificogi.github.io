---
layout:     post
title:      "FreeRTOS中heap源文件分析(一)"
subtitle:   "嵌入式，FreeRTOS，heap"
date:       2017-03-21
author:     "elmagnifico"
header-img: "img/freertos.jpg"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## heap介绍

目前FreeRTOS提供了5种内存堆管理方案，分别对应heap1/2/3/4/5，五个文件，有复杂的也有简单的。其中最简单的管理策略也能满足很多应用的要求，比如对安全要求高的应用，这种应用不允许动态内存分配的。

FreeRTOS也允许你自己实现内存堆管理，甚至允许你同时使用两种内存堆管理方案。同时实现两种内存堆允许任务堆栈和其它RTOS对象放置到高速的内部RAM，应用数据放置到低速的外部RAM。

每当创建任务、队列、互斥量、软件定时器、信号量或事件组时，RTOS内核会为它们分配RAM。标准函数库中的malloc()和free()函数有些时候能够用于完成这个任务，但是：

- 在嵌入式系统中，它们并不总是可以使用的；
- 它们会占用更多宝贵的代码空间；
- 它们没有线程保护；
- 它们不具有确定性（每次调用执行的时间可能会不同）；

因此，提供一个替代的内存分配方案通常是必要的。

嵌入式/实时系统具有千差万别的RAM和时间要求，因此一个RAM内存分配算法可能仅属于一个应用的子集。为了避免这个问题，FreeRTOS在移植层保留内存分配API函数。移植层在RTOS核心代码源文件之外（不属于核心源代码），这使得不同的应用程序可以提供适合自己的应用实现。当RTOS内核需要RAM时，调用pvPortMallo()函数来代替malloc()函数。当RAM要被释放时，调用vPortFree()函数来代替free()函数。

FreeRTOS下载包中提供5种简单的内存分配实现，本文稍后会进行描述。用户可以适当的选择其中的一个，也可以自己设计内存分配策略。

FreeRTOS提供的内存分配方案分别位于不同的源文件（heap_1.c、heap_2.c、heap_3.c、heap_4.c、heap_5.c）之中，源文件位于下载包\FreeRTOS\Source\portable\MemMang文件夹中。其它实现方法可以根据需要增加。如果要使用FreeRTOS提供的内存堆分配方案，选中的源文件必须被正确的包含到工程文件中。

## heap源文件分析

本次先对heap1.c进行分析,这是所有实现中最简单的一个。一旦分配内存之后，它甚至不允许释放分配的内存。尽管这样，heap_1.c还是适用于大部分嵌入式应用程序。这是因为大多数深度嵌入式（deeplyembedded）应用只是在系统启动时创建所有任务、队列、信号量等，并且直到程序结束都会一直使用它们，永远不需要删除。

当需要分配RAM时，这个内存分配方案只是简单的将一个大数组细分出一个子集来。大数组的容量大小通过FreeRTOSConfig.h文件中的configTOTAL_HEAP_SIZE宏来设置。

API函数xPortGetFreeHeapSize()返回未分配的堆栈空间总大小，可以通过这个函数返回值对configTOTAL_HEAP_SIZE进行合理的设置。

### heap_1功能简介

- 用于从不会删除任务、队列、信号量、互斥量等的应用程序（实际上大多数使用FreeRTOS的应用程序都符合这个条件）
- 执行时间是确定的并且不会产生内存碎片
- 实现和分配过程非常简单，需要的内存是从一个静态数组中分配的，意味着这种内存分配通常只是适用于那些不进行动态内存分配的应用。

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

## 注释

```c
/*
 * The simplest possible implementation of pvPortMalloc().  Note that this
 * implementation does NOT allow allocated memory to be freed again.
 *
 * See heap_2.c, heap_3.c and heap_4.c for alternative implementations, and the
 * memory management pages of http://www.FreeRTOS.org for more information.
 */
```

老样子，先来看看文件注释说了什么，如何介绍这个文件的。

最简单的分配内存的实现，不允许释放内存。基本没说。

#### 内存分配函数

```c
void *pvPortMalloc( size_t xWantedSize )
{
	void *pvReturn = NULL;
	static uint8_t *pucAlignedHeap = NULL;

	/* Ensure that blocks are always aligned to the required number of bytes. */
	#if( portBYTE_ALIGNMENT != 1 )
	{
		if( xWantedSize & portBYTE_ALIGNMENT_MASK )
		{
			/* Byte alignment required. */
			xWantedSize += ( portBYTE_ALIGNMENT - ( xWantedSize & portBYTE_ALIGNMENT_MASK ) );
		}
	}
	#endif

	vTaskSuspendAll();
	{
		if( pucAlignedHeap == NULL )
		{
			/* Ensure the heap starts on a correctly aligned boundary. */
			pucAlignedHeap = ( uint8_t * ) ( ( ( portPOINTER_SIZE_TYPE ) &ucHeap[ portBYTE_ALIGNMENT ] ) & ( ~( ( portPOINTER_SIZE_TYPE ) portBYTE_ALIGNMENT_MASK ) ) );
		}

		/* Check there is enough room left for the allocation. */
		if( ( ( xNextFreeByte + xWantedSize ) < configADJUSTED_HEAP_SIZE ) &&
			( ( xNextFreeByte + xWantedSize ) > xNextFreeByte )	)/* Check for overflow. */
		{
			/* Return the next free byte then increment the index past this
			block. */
			pvReturn = pucAlignedHeap + xNextFreeByte;
			xNextFreeByte += xWantedSize;
		}

		traceMALLOC( pvReturn, xWantedSize );
	}
	( void ) xTaskResumeAll();

	#if( configUSE_MALLOC_FAILED_HOOK == 1 )
	{
		if( pvReturn == NULL )
		{
			extern void vApplicationMallocFailedHook( void );
			vApplicationMallocFailedHook();
		}
	}
	#endif

	return pvReturn;
}
```

传入参数，分配内存大小。

###### 内存对齐

```c
#if( portBYTE_ALIGNMENT != 1 )
{
	if( xWantedSize & portBYTE_ALIGNMENT_MASK )
	{
		/* Byte alignment required. */
		xWantedSize += ( portBYTE_ALIGNMENT - ( xWantedSize & portBYTE_ALIGNMENT_MASK ) );
	}
}
```
这里是内存的对齐设置，根据下面的宏定义，可以将输入的参数，取其最小可被8整除的数，进而内存对齐

```c
#define portBYTE_ALIGNMENT			8
#if portBYTE_ALIGNMENT == 8
	#define portBYTE_ALIGNMENT_MASK ( 0x0007 )
#endif
```
###### 挂起调度器

```c
vTaskSuspendAll();

//其函数原型

void vTaskSuspendAll( void )
{
	/* A critical section is not required as the variable is of type
	BaseType_t.  Please read Richard Barry's reply in the following link to a
	post in the FreeRTOS support forum before reporting this as a bug! -
	http://goo.gl/wu4acr */
	++uxSchedulerSuspended;
	//该变量 >=1 表示挂起 =0表示未挂起
}
```
挂起调度器，防止分配内存过程中被打断。

###### 分配内存

```c
if( pucAlignedHeap == NULL )
{
	/* Ensure the heap starts on a correctly aligned boundary. */
	pucAlignedHeap = ( uint8_t * ) ( ( ( portPOINTER_SIZE_TYPE ) &ucHeap[ portBYTE_ALIGNMENT ] ) & ( ~( ( portPOINTER_SIZE_TYPE ) portBYTE_ALIGNMENT_MASK ) ) );
}
```

如果pucAlignedHeap == NULL，表示当前是内存分配的头地址

这里的ucHeap是用户堆指针，但是系统要对内存做对齐，因为第一次内存自动分配给ucHeap的首地址可能不是8的倍数，也就是说ucHeap可能没对齐，那么这种情况下，要用对齐内存，就需要调整真实首地址位置。

首先是获取ucHeap的真实地址,然后屏蔽了低三位，表示地址低位都是8以下，然后ucHeap[ portBYTE_ALIGNMENT ]其实就是地址+8，就是在基础地址上+8之后，屏蔽，这样得到的地址结果一定是8的倍数。

比如基础地址低三位是3，+8之后是11，屏蔽低三位后是8，也就是8的倍数，对齐了，这样开头就有5个字节直接被抛弃了

当然这样也有一个小问题，就是如果低三位是0，也是对齐的情况下，这样就抛弃了8字节，

所以我感觉这里应该用+7 而不是+8， 这样第三位是0的情况下，不会抛弃对齐了的内存。

```c
static size_t xNextFreeByte = ( size_t ) 0;
```
这个变量用来记录分配了多少内存。

如果分配的大小+要分配大小比堆大小小的话，那么就开始分配内存

这里还做了溢出检测，因为xWantedSize+xNextFreeByte有可能直接溢出，溢出情况下他们的和比xNextFreeByte要小

这种情况就是请求空间太大了，无法分配。

如果可以分配，那么前面对齐的头指针+已分配的大小，就等于新配的内存的起始地址，将作为返回值，然后更新已分配内存大小

###### 恢复调度器

```c
( void ) xTaskResumeAll();
#if( configUSE_MALLOC_FAILED_HOOK == 1 )
{
	if( pvReturn == NULL )
	{
		extern void vApplicationMallocFailedHook( void );
		vApplicationMallocFailedHook();
	}
}
#endif
```

回复调度器，检查是否有分配内存失败的Hook函数，如果有的话，调用分配失败Hook函数，

分配成功返回分配内存首地址

#### 内存释放函数

```c
void vPortFree( void *pv )
{
	/* Memory cannot be freed using this scheme.  See heap_2.c, heap_3.c and
	heap_4.c for alternative implementations, and the memory management pages of
	http://www.FreeRTOS.org for more information. */
	( void ) pv;

	/* Force an assert as it is invalid to call this function. */
	configASSERT( pv == NULL );
}
```

由于heap_1是没有释放函数的，所以这里只有一个断言，判断释放地址是否为空

#### 堆初始化

```c
void vPortInitialiseBlocks( void )
{
	/* Only required when static memory is not cleared. */
	xNextFreeByte = ( size_t ) 0;
}
```

直接就是把初始化分配的字节数为0

#### 获取可用堆大小

```c
size_t xPortGetFreeHeapSize( void )
{
	return ( configADJUSTED_HEAP_SIZE - xNextFreeByte );
}
```

直接返回最大堆减去已分配的大小。

```c
#define configADJUSTED_HEAP_SIZE	( configTOTAL_HEAP_SIZE - portBYTE_ALIGNMENT )
```
这个计算的时候都用了调整后大小，而调整后的大小等于总大小减去最小对齐大小。

这也说明了为什么之前是只能+8 而不能+7 因为整个堆大小是8的倍数，对其首地址以后，浪费的空间肯定是8个大小。

如果用+7，那么这里都需要重写，这个大小的调整也是。

如果不用调整后的大小就会有一个bug，之前做内存首地址对齐的时候，抛弃的内存地址没有算到已分配内存中去。

那么这里返回可用堆的大小就有可能不准确，那么得到的结果可能是偏大了8个字节

最后的结果就是，调试的时候显示有可用空间，但是一分配就失败了。

## 总结

这就是heap_1.c的源码了，相对来说也很简单，有了这样的基础再看后面的heap就容易一些了。

总的来说有不好的地方大概就是+8还是+7的问题了，+8是默认认为分配的地址一定不是8的倍数，所以要+8，肯定会浪费8字节空间。

而+7则是需要多一些计算，但是有可能不浪费空间。

## Quote

> heap_1.c
> 
> http://blog.csdn.net/zhzht19861011/article/details/50248421
> 
> http://blog.csdn.net/zhzht19861011/article/details/51606068
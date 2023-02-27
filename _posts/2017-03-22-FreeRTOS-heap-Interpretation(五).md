---
layout:     post
title:      "FreeRTOS中heap源文件分析(五)"
subtitle:   "嵌入式，FreeRTOS，heap"
date:       2017-03-22
author:     "elmagnifico"
header-img: "img/freertos.jpg"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## heap源文件分析

heap_5.c 是在V8.1.0版本新增的

我们之前说了heap_4会出现的碎片问题，这个方案同样实现了heap_4.c中的合并算法，并且允许堆栈跨越多个非连续的内存区。

也就是说我们初始化设置的堆栈空间可以不连续，可以有多块堆栈空间共通作为内存来使用。

### heap_5.c功能简介

- 可用于重复分配、删除任务、队列、信号量、互斥量等等的应用程序。
- 可以用于分配和释放随机字节内存的情况，避免了碎片问题。
- 不具有确定性，但是它比标准库中的malloc函数具有高得多的效率。
- 可以使用不连续内存空间。

heap_5.c更加完备了，但是同样的，由于内存管理的复杂度增加了，开销自然也增加了很多。

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

## 注释

```c
/*
 * A sample implementation of pvPortMalloc() that allows the heap to be defined
 * across multiple non-contigous blocks and combines (coalescences) adjacent
 * memory blocks as they are freed.
 *
 * See heap_1.c, heap_2.c, heap_3.c and heap_4.c for alternative
 * implementations, and the memory management pages of http://www.FreeRTOS.org
 * for more information.
 *
 * Usage notes:
 *
 * vPortDefineHeapRegions() ***must*** be called before pvPortMalloc().
 * pvPortMalloc() will be called if any task objects (tasks, queues, event
 * groups, etc.) are created, therefore vPortDefineHeapRegions() ***must*** be
 * called before any other objects are defined.
 *
 * vPortDefineHeapRegions() takes a single parameter.  The parameter is an array
 * of HeapRegion_t structures.  HeapRegion_t is defined in portable.h as
 *
 * typedef struct HeapRegion
 * {
 *	uint8_t *pucStartAddress; << Start address of a block of memory that will be part of the heap.
 *	size_t xSizeInBytes;	  << Size of the block of memory.
 * } HeapRegion_t;
 *
 * The array is terminated using a NULL zero sized region definition, and the
 * memory regions defined in the array ***must*** appear in address order from
 * low address to high address.  So the following is a valid example of how
 * to use the function.
 *
 * HeapRegion_t xHeapRegions[] =
 * {
 * 	{ ( uint8_t * ) 0x80000000UL, 0x10000 }, << Defines a block of 0x10000 bytes starting at address 0x80000000
 * 	{ ( uint8_t * ) 0x90000000UL, 0xa0000 }, << Defines a block of 0xa0000 bytes starting at address of 0x90000000
 * 	{ NULL, 0 }                << Terminates the array.
 * };
 *
 * vPortDefineHeapRegions( xHeapRegions ); << Pass the array into vPortDefineHeapRegions().
 *
 * Note 0x80000000 is the lower address so appears in the array first.
 *
 */
```

老样子，先来看看文件注释说了什么，如何介绍这个文件的。

这次介绍超级多啊，总算是不一样了，同时也是表示heap_5确实很复杂了。

一个可以申请内存，其内存不一定是连续的，合并连续空闲内存的pvPortMalloc()。

#### 使用说明

vPortDefineHeapRegions() 必须在分配空间之前调用，完成初始化。

由于系统有很多API可能默认调用了pvPortMalloc() ，所以如果不先调用的话，整个系统就会崩溃。

vPortDefineHeapRegions() 只有一个传入参数，参数类型如下

```c
typedef struct HeapRegion
{
	uint8_t *pucStartAddress; << Start address of a block of memory that will be part of the heap.
	size_t xSizeInBytes;	  << Size of the block of memory.
} HeapRegion_t;
```
这个数组必须使用一个NULL指针和0字节元素作为结束，起始地址必须从小到大排列。

下面是一个调用实例：

```c
HeapRegion_t xHeapRegions[] =
{
	{ ( uint8_t * ) 0x80000000UL, 0x10000 }, //Defines a block of 0x10000 bytes starting at address 0x80000000
 	{ ( uint8_t * ) 0x90000000UL, 0xa0000 }, //Defines a block of 0xa0000 bytes starting at address of 0x90000000
 	{ NULL, 0 }                              //Terminates the array.
};
vPortDefineHeapRegions( xHeapRegions );      //Pass the array into vPortDefineHeapRegions().
```

#### 堆初始化函数

```c
void vPortDefineHeapRegions( const HeapRegion_t * const pxHeapRegions )
{
	BlockLink_t *pxFirstFreeBlockInRegion = NULL, *pxPreviousFreeBlock;
	size_t xAlignedHeap;
	size_t xTotalRegionSize, xTotalHeapSize = 0;
	BaseType_t xDefinedRegions = 0;
	size_t xAddress;
	const HeapRegion_t *pxHeapRegion;

	/* Can only call once! */
	configASSERT( pxEnd == NULL );

	pxHeapRegion = &( pxHeapRegions[ xDefinedRegions ] );

	while( pxHeapRegion->xSizeInBytes > 0 )
	{
		xTotalRegionSize = pxHeapRegion->xSizeInBytes;

		/* Ensure the heap region starts on a correctly aligned boundary. */
		xAddress = ( size_t ) pxHeapRegion->pucStartAddress;
		if( ( xAddress & portBYTE_ALIGNMENT_MASK ) != 0 )
		{
			xAddress += ( portBYTE_ALIGNMENT - 1 );
			xAddress &= ~portBYTE_ALIGNMENT_MASK;

			/* Adjust the size for the bytes lost to alignment. */
			xTotalRegionSize -= xAddress - ( size_t ) pxHeapRegion->pucStartAddress;
		}

		xAlignedHeap = xAddress;

		/* Set xStart if it has not already been set. */
		if( xDefinedRegions == 0 )
		{
			/* xStart is used to hold a pointer to the first item in the list of
			free blocks.  The void cast is used to prevent compiler warnings. */
			xStart.pxNextFreeBlock = ( BlockLink_t * ) xAlignedHeap;
			xStart.xBlockSize = ( size_t ) 0;
		}
		else
		{
			/* Should only get here if one region has already been added to the
			heap. */
			configASSERT( pxEnd != NULL );

			/* Check blocks are passed in with increasing start addresses. */
			configASSERT( xAddress > ( size_t ) pxEnd );
		}

		/* Remember the location of the end marker in the previous region, if
		any. */
		pxPreviousFreeBlock = pxEnd;

		/* pxEnd is used to mark the end of the list of free blocks and is
		inserted at the end of the region space. */
		xAddress = xAlignedHeap + xTotalRegionSize;
		xAddress -= xHeapStructSize;
		xAddress &= ~portBYTE_ALIGNMENT_MASK;
		pxEnd = ( BlockLink_t * ) xAddress;
		pxEnd->xBlockSize = 0;
		pxEnd->pxNextFreeBlock = NULL;

		/* To start with there is a single free block in this region that is
		sized to take up the entire heap region minus the space taken by the
		free block structure. */
		pxFirstFreeBlockInRegion = ( BlockLink_t * ) xAlignedHeap;
		pxFirstFreeBlockInRegion->xBlockSize = xAddress - ( size_t ) pxFirstFreeBlockInRegion;
		pxFirstFreeBlockInRegion->pxNextFreeBlock = pxEnd;

		/* If this is not the first region that makes up the entire heap space
		then link the previous region to this region. */
		if( pxPreviousFreeBlock != NULL )
		{
			pxPreviousFreeBlock->pxNextFreeBlock = pxFirstFreeBlockInRegion;
		}

		xTotalHeapSize += pxFirstFreeBlockInRegion->xBlockSize;

		/* Move onto the next HeapRegion_t structure. */
		xDefinedRegions++;
		pxHeapRegion = &( pxHeapRegions[ xDefinedRegions ] );
	}

	xMinimumEverFreeBytesRemaining = xTotalHeapSize;
	xFreeBytesRemaining = xTotalHeapSize;

	/* Check something was actually defined before it is accessed. */
	configASSERT( xTotalHeapSize );

	/* Work out the position of the top bit in a size_t variable. */
	xBlockAllocatedBit = ( ( size_t ) 1 ) << ( ( sizeof( size_t ) * heapBITS_PER_BYTE ) - 1 );
}
```
基本，改动最大的地方就是这个函数了。

所以heap_5能完成不相连内存的使用也是靠这里了。

初始化函数只能调用一次。

传入的参数就是不连续内存空间的数组指针。

第一步非常相似，把内存的起始地址对齐处理，得到实际可以用的内存空间大小

如果是第一个内存块，那么把他加入到头指针中去。

接着计算尾指针的位置。

把内存块加入到内存链表中去。

更新可用内存大小，指针后移，循环上面步骤直到把所有内存块都加入到了内存链表里

更新历史内存可用大小，剩余内存大小，这样就结束了。

基本上就是通过初始化函数把可用内存空间全部都加到内存链表中去

#### 内存分配函数

跟之前的一模一样，基本没啥可说的地方。

#### 空闲内存插入函数

跟之前的一模一样，基本没啥可说的地方。

#### 内存释放函数

跟之前的一模一样，基本没啥可说的地方。

## 总结

到这里FreeRTOS的内存管理方式基本都说明了。

可以看到，其实基本上就像操作系统书里说的一样，从一个最简单的内存管理，一直写到一个较为复杂的内存管理方式。

每次提出一个要求，每次前进一点，每次完成一点，基本就到了heap_5 的程度，所以如果日后FreeRTOS还有发展，那么其基础也是从这里开始。

## Quote

> heap_5.c
>
> http://blog.csdn.net/zhzht19861011/article/details/50248421
>
> http://blog.csdn.net/zhzht19861011/article/details/51606068

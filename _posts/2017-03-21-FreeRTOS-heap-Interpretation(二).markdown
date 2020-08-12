---
layout:     post
title:      "FreeRTOS中heap源文件分析(二)"
subtitle:   "嵌入式，FreeRTOS，heap"
date:       2017-03-21
author:     "elmagnifico"
header-img: "img/freertos.jpg"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## heap源文件分析

heap_2与heap_1不同，它使用最佳匹配算法，会选择最合适的内存大小来分配，但是他不会合并相邻的空闲内存，造成的后果自然就是会有内存碎片，或者说内存碎片多的情况下，可能造成无法分配的情况。

### heap_2功能简介

- heap_2可以释放内存，可以用于重复的分配和删除具有相同堆栈空间的任务、队列、信号量、互斥量等等，并且不考虑内存碎片的应用程序。
- 不能用在分配和释放随机字节堆栈空间的应用程序，以及较高频率的不同内存空间释放。
  - 如果一个应用程序动态的创建和删除任务，并且分配给任务的堆栈空间总是同样大小，那么大多数情况下heap_2.c是可以使用的。但是，如果分配给任务的堆栈不总是相等，那么释放的有效内存可能碎片化，形成很多小的内存块。最后会因为没有足够大的连续堆栈空间而造成内存分配失败。在这种情况下，heap_4.c是一个更好的选择。

  - 应用程序直接调用pvPortMalloc() 和 vPortFree()函数，而不仅是通过FreeRTOS API间接调用。

- 如果你的应用程序中的队列、任务、信号量、互斥量等等处在一个不可预料的顺序，则可能会导致内存碎片问题，虽然这是小概率事件，但必须要注意。

- 不具有确定性，但是它比标准库中的malloc函数具有高得多的效率。

heap_2.c适用于需要动态创建任务的大多数小型实时系统（smallreal time）。

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

## 注释

```c
/*
 * A sample implementation of pvPortMalloc() and vPortFree() that permits
 * allocated blocks to be freed, but does not combine adjacent free blocks
 * into a single larger block (and so will fragment memory).  See heap_4.c for
 * an equivalent that does combine adjacent blocks into single larger blocks.
 *
 * See heap_1.c, heap_3.c and heap_4.c for alternative implementations, and the
 * memory management pages of http://www.FreeRTOS.org for more information.
 */
```

老样子，先来看看文件注释说了什么，如何介绍这个文件的。

允许内存释放，但是不能把相连的块进行合并，所以将会有内存碎片，heap4中会对内存碎片进行合并。基本没说。

#### 碎片插入函数

```c
/*
 * Insert a block into the list of free blocks - which is ordered by size of
 * the block.  Small blocks at the start of the list and large blocks at the end
 * of the list.
 */
#define prvInsertBlockIntoFreeList( pxBlockToInsert )								\
{																					\
	BlockLink_t *pxIterator;															\
	size_t xBlockSize;																	\
																					\
	xBlockSize = pxBlockToInsert->xBlockSize;										\
																					\
	/* Iterate through the list until a block is found that has a larger size */	\
	/* than the block we are inserting. */											\
	for( pxIterator = &xStart; pxIterator->pxNextFreeBlock->xBlockSize < xBlockSize; pxIterator = pxIterator->pxNextFreeBlock )	\
	{																				\
		/* There is nothing to do here - just iterate to the correct position. */	\
	}																				\
																					\
	/* Update the list to include the block being inserted in the correct */		\
	/* position. */																	\
	pxBlockToInsert->pxNextFreeBlock = pxIterator->pxNextFreeBlock;					\
	pxIterator->pxNextFreeBlock = pxBlockToInsert;									\
}
```

首先这个list维护了一个由小到大的空闲内存块的链表，其中小块在头部，大块在尾部。

这是一个宏函数，传入了一个参数pxBlockToInsert，应该是被释放块的地址。

```c
/* Define the linked list structure.  This is used to link free blocks in order
of their size. */
typedef struct A_BLOCK_LINK
{
	struct A_BLOCK_LINK *pxNextFreeBlock;	/*<< The next free block in the list. */
	size_t xBlockSize;						/*<< The size of the free block. */
} BlockLink_t;
```

BlockLink_t 是一个内存块的结构体，包含内存的开始地址和其大小，然后定义了一个迭代器。

```c
/* Create a couple of list links to mark the start and end of the list. */
static BlockLink_t xStart, xEnd;
```

xStart是整个链表的头，xEnd是链表的尾。

遍历当前空闲块链表，找到合适插入的位置。

把传入的新空闲块插入到链表中。

#### 堆初始化

```c
static void prvHeapInit( void )
{
	BlockLink_t *pxFirstFreeBlock;
	uint8_t *pucAlignedHeap;

	/* Ensure the heap starts on a correctly aligned boundary. */
	pucAlignedHeap = ( uint8_t * ) ( ( ( portPOINTER_SIZE_TYPE ) &ucHeap[ portBYTE_ALIGNMENT ] ) & ( ~( ( portPOINTER_SIZE_TYPE ) portBYTE_ALIGNMENT_MASK ) ) );

	/* xStart is used to hold a pointer to the first item in the list of free
	blocks.  The void cast is used to prevent compiler warnings. */
	xStart.pxNextFreeBlock = ( void * ) pucAlignedHeap;
	xStart.xBlockSize = ( size_t ) 0;

	/* xEnd is used to mark the end of the list of free blocks. */
	xEnd.xBlockSize = configADJUSTED_HEAP_SIZE;
	xEnd.pxNextFreeBlock = NULL;

	/* To start with there is a single free block that is sized to take up the
	entire heap space. */
	pxFirstFreeBlock = ( void * ) pucAlignedHeap;
	pxFirstFreeBlock->xBlockSize = configADJUSTED_HEAP_SIZE;
	pxFirstFreeBlock->pxNextFreeBlock = &xEnd;
}
```

和之前看到的很类似，第一步都是对堆首地址的对齐

然后把堆首地址直接给空闲块链表，作为空闲块链表的开始块

从这里可以看出来xStart是作为头指针来用的，其自身的xBlockSize在链表中并没有实际的意义

然后是尾指针，尾指针记录了当前空闲块的大小。

最后把这一整块可用堆全部作为一块内存加入到了空闲块链表中

该块的下一个块则是xEnd

#### 内存分配函数

```c
void *pvPortMalloc( size_t xWantedSize )
{
	BlockLink_t *pxBlock, *pxPreviousBlock, *pxNewBlockLink;
	static BaseType_t xHeapHasBeenInitialised = pdFALSE;
	void *pvReturn = NULL;

	vTaskSuspendAll();
	{
		/* If this is the first call to malloc then the heap will require
		initialisation to setup the list of free blocks. */
		if( xHeapHasBeenInitialised == pdFALSE )
		{
			prvHeapInit();
			xHeapHasBeenInitialised = pdTRUE;
		}

		/* The wanted size is increased so it can contain a BlockLink_t
		structure in addition to the requested amount of bytes. */
		if( xWantedSize > 0 )
		{
			xWantedSize += heapSTRUCT_SIZE;

			/* Ensure that blocks are always aligned to the required number of bytes. */
			if( ( xWantedSize & portBYTE_ALIGNMENT_MASK ) != 0 )
			{
				/* Byte alignment required. */
				xWantedSize += ( portBYTE_ALIGNMENT - ( xWantedSize & portBYTE_ALIGNMENT_MASK ) );
			}
		}

		if( ( xWantedSize > 0 ) && ( xWantedSize < configADJUSTED_HEAP_SIZE ) )
		{
			/* Blocks are stored in byte order - traverse the list from the start
			(smallest) block until one of adequate size is found. */
			pxPreviousBlock = &xStart;
			pxBlock = xStart.pxNextFreeBlock;
			while( ( pxBlock->xBlockSize < xWantedSize ) && ( pxBlock->pxNextFreeBlock != NULL ) )
			{
				pxPreviousBlock = pxBlock;
				pxBlock = pxBlock->pxNextFreeBlock;
			}

			/* If we found the end marker then a block of adequate size was not found. */
			if( pxBlock != &xEnd )
			{
				/* Return the memory space - jumping over the BlockLink_t structure
				at its start. */
				pvReturn = ( void * ) ( ( ( uint8_t * ) pxPreviousBlock->pxNextFreeBlock ) + heapSTRUCT_SIZE );

				/* This block is being returned for use so must be taken out of the
				list of free blocks. */
				pxPreviousBlock->pxNextFreeBlock = pxBlock->pxNextFreeBlock;

				/* If the block is larger than required it can be split into two. */
				if( ( pxBlock->xBlockSize - xWantedSize ) > heapMINIMUM_BLOCK_SIZE )
				{
					/* This block is to be split into two.  Create a new block
					following the number of bytes requested. The void cast is
					used to prevent byte alignment warnings from the compiler. */
					pxNewBlockLink = ( void * ) ( ( ( uint8_t * ) pxBlock ) + xWantedSize );

					/* Calculate the sizes of two blocks split from the single
					block. */
					pxNewBlockLink->xBlockSize = pxBlock->xBlockSize - xWantedSize;
					pxBlock->xBlockSize = xWantedSize;

					/* Insert the new block into the list of free blocks. */
					prvInsertBlockIntoFreeList( ( pxNewBlockLink ) );
				}

				xFreeBytesRemaining -= pxBlock->xBlockSize;
			}
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

- 和之前一样，第一步挂起调度器

- 检查堆是否已经初始化了,没初始化的话，调用上面分析过的初始化堆，然后初始化标记改为true

  - 如果申请空间大于0，需要加上该块的标记大小，才是真正需要的大小。

因为申请的空间，第一个地址开始的地方不是申请空间要放的内容，而是对于该快空间的描述的结构体。

下面是对块大小的对齐操作，不用多说了。

- 接着检测是否有足够空间给申请块，这里的空间是调整后的整个堆大小，只能说明总空间是否够，而不能保证一定能分配。

  - 接着遍历一遍空闲块链表，寻找最小适合空间，也就是最佳匹配算法。

  - 如果pxBlock不等于尾节点，那么说明有合适的空间

  - 返回值设定为寻找到合适块地址+块描述结构体大小，就是实际程序使用的块空间地址

  - 从空闲块中删除已分配的块。

做到这里只是把块分配完了，但是如果分配的这个块特别大，其实应用程序用不到这么大，那么就需要对这个块再做一次剪裁，把剩下的块再添加回空闲列表。

- 如果分配的剩余大小超过了两个块描述结构体的大小的话，那么需要进一步分割，这个超额大小自然是可以修改的

```c
#define heapMINIMUM_BLOCK_SIZE	( ( size_t ) ( heapSTRUCT_SIZE * 2 ) )
```

- 新建一个块，块地址自然等于，刚分配地址+分配大小，块大小等于分配总大小-实际需要的大小

  - 然后用上面的插入块函数，把新的块插入进空闲表中

这里就能看出来，如果过大，就会分割，分割也是直接把多余的块全拿出来了，只有块剩余大小很小的情况下才会全分配。

当然这样有部分浪费无法避免。

- 更新剩余堆空间大小。

- 恢复调度器，返回申请内存地址。

#### 内存释放函数

```c
void vPortFree( void *pv )
{
	uint8_t *puc = ( uint8_t * ) pv;
	BlockLink_t *pxLink;

	if( pv != NULL )
	{
		/* The memory being freed will have an BlockLink_t structure immediately
		before it. */
		puc -= heapSTRUCT_SIZE;

		/* This unexpected casting is to keep some compilers from issuing
		byte alignment warnings. */
		pxLink = ( void * ) puc;

		vTaskSuspendAll();
		{
			/* Add this block to the list of free blocks. */
			prvInsertBlockIntoFreeList( ( ( BlockLink_t * ) pxLink ) );
			xFreeBytesRemaining += pxLink->xBlockSize;
			traceFREE( pv, pxLink->xBlockSize );
		}
		( void ) xTaskResumeAll();
	}
}
```

传入释放块地址

如果传入地址合法，那么首先需要找到这个块地址的头地址（块头是块描述结构体）

然后取这个结构体，挂起调度器

把这个块整个插入到空闲链表中去

更新空间空间大小，恢复调度器。

## 总结

heap_2基本就到这里，剩下的都是一些很简单的返回函数，从分配这里可以看到用的最佳匹配算法，可以自动分配释放内存，但是总体是不确定的，而且对于需要频繁分配不同大小内存的应用存在有空间但是无法分配的情况。

无法合并相邻内存，所以也有一定的局限性。

## Quote

> heap_2.c
> 
> http://blog.csdn.net/zhzht19861011/article/details/50248421
> 
> http://blog.csdn.net/zhzht19861011/article/details/51606068
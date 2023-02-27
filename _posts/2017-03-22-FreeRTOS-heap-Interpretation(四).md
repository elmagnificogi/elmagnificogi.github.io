---
layout:     post
title:      "FreeRTOS中heap源文件分析(四)"
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

总算到了heap_4,这个方案基本算是FreeRTOS中非常常用的内存管理方案了。

heap_4与heap_2一样都使用了最佳匹配算法，但不像方案2那样，不能合并相邻的空闲内存区域，它会将相邻的空闲内存块合并成一个更大的块（包含一个合并算法）。

### heap_4.c功能简介

- 可用于重复分配、删除任务、队列、信号量、互斥量等等的应用程序。
- 可以用于分配和释放随机字节内存的情况，并不像heap_2.c那样产生严重碎片。
- 不具有确定性，但是它比标准库中的malloc函数具有高得多的效率。

heap_4.c还特别适用于移植层代码，可以直接使用pvPortMalloc()和 vPortFree()函数来分配和释放内存。

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

## 注释

```c
/*
 * A sample implementation of pvPortMalloc() and vPortFree() that combines
 * (coalescences) adjacent memory blocks as they are freed, and in so doing
 * limits memory fragmentation.
 *
 * See heap_1.c, heap_2.c and heap_3.c for alternative implementations, and the
 * memory management pages of http://www.FreeRTOS.org for more information.
 */
```

老样子，先来看看文件注释说了什么，如何介绍这个文件的。

允许内存释放，会把相连的块进行合并，heap4中会对内存碎片进行合并，有效限制了内存碎片，基本没说。

#### 堆初始化函数

```c
static void prvHeapInit( void )
{

    ···

	/* Only one block exists - and it covers the entire usable heap space. */
	xMinimumEverFreeBytesRemaining = pxFirstFreeBlock->xBlockSize;
	xFreeBytesRemaining = pxFirstFreeBlock->xBlockSize;

	/* Work out the position of the top bit in a size_t variable. */
	xBlockAllocatedBit = ( ( size_t ) 1 ) << ( ( sizeof( size_t ) * heapBITS_PER_BYTE ) - 1 );
}
```

因为函数大部分其实和之前分析的一样，这里就只说与之前不一样，或者添加了的东西。

首先是多了用xFreeBytesRemaining和xMinimumEverFreeBytesRemaining来记录剩余的内存字节

后者更多描述的是历史最小剩余内存空间，用来显示整个内存使用的最差情况。在不确定的内存分配过程中了解到整个程序运行是否有内存危机。

```c
/* Keeps track of the number of free bytes remaining, but says nothing about
fragmentation. */
static size_t xFreeBytesRemaining = 0U;
static size_t xMinimumEverFreeBytesRemaining = 0U;
```

然后还有一个新的变量xBlockAllocatedBit 他是用来做内存块记录的，记录是否被分配出去了。

因为现在整个内存都被一个链表所管理，而节点对象又没有对应的用来记录是否被分配出去的变量，所以这里用改变xBlockSize的最高位来表示当前内存是分配出去了还是没分配。如果最高位为1则是已经被分配了，最高位为0则没被分配。

这个变量在第一次调用内存申请函数时被初始化，将它能表示的数值的最高位置1。比如对于32位系统，这个变量被初始化为0x80000000（最高位为1）。内存管理策略使用这个变量来标识一个内存块是否空闲。如果内存块被分配出去，则内存块链表结构成员xBlockSize按位或上这个变量（即xBlockSize最高位置1），在释放一个内存块时，会把xBlockSize的最高位清零。

```c
/* Gets set to the top bit of an size_t type.  When this bit in the xBlockSize
member of an BlockLink_t structure is set then the block belongs to the
application.  When the bit is free the block is still part of the free heap
space. */
static size_t xBlockAllocatedBit = 0;
```

#### 内存分配函数

```c
void *pvPortMalloc( size_t xWantedSize )
{
        ...

		/* Check the requested block size is not so large that the top bit is
		set.  The top bit of the block size member of the BlockLink_t structure
		is used to determine who owns the block - the application or the
		kernel, so it must be free. */
		if( ( xWantedSize & xBlockAllocatedBit ) == 0 )
		{

                    ...

					xFreeBytesRemaining -= pxBlock->xBlockSize;

					if( xFreeBytesRemaining < xMinimumEverFreeBytesRemaining )
					{
						xMinimumEverFreeBytesRemaining = xFreeBytesRemaining;
					}
					else
					{
						mtCOVERAGE_TEST_MARKER();
					}

					/* The block is being returned - it is allocated and owned
					by the application and has no "next" block. */
					pxBlock->xBlockSize |= xBlockAllocatedBit;
					pxBlock->pxNextFreeBlock = NULL;

        ...

	return pvReturn;
}
```
首先这里做与运算只是为了检测是否申请空间溢出而已

然后下面是对剩余内存空间的更新。

如果剩余空间小于了历史最低空间，那么更新历史最低空间。

最后则是用xBlockAllocatedBit把刚才分配的那块内存空间的最高位给置1，表示已经被分配出去了。

然后把指向下一个空闲块指针清空。

#### 空闲内存插入函数

```c
static void prvInsertBlockIntoFreeList( BlockLink_t *pxBlockToInsert )
{
    BlockLink_t *pxIterator;
    uint8_t *puc;

	/* Iterate through the list until a block is found that has a higher address
	than the block being inserted. */
	for( pxIterator = &xStart; pxIterator->pxNextFreeBlock < pxBlockToInsert; pxIterator = pxIterator->pxNextFreeBlock )
	{
		/* Nothing to do here, just iterate to the right position. */
	}

	/* Do the block being inserted, and the block it is being inserted after
	make a contiguous block of memory? */
	puc = ( uint8_t * ) pxIterator;
	if( ( puc + pxIterator->xBlockSize ) == ( uint8_t * ) pxBlockToInsert )
	{
		pxIterator->xBlockSize += pxBlockToInsert->xBlockSize;
		pxBlockToInsert = pxIterator;
	}
	else
	{
		mtCOVERAGE_TEST_MARKER();
	}

	/* Do the block being inserted, and the block it is being inserted before
	make a contiguous block of memory? */
	puc = ( uint8_t * ) pxBlockToInsert;
	if( ( puc + pxBlockToInsert->xBlockSize ) == ( uint8_t * ) pxIterator->pxNextFreeBlock )
	{
		if( pxIterator->pxNextFreeBlock != pxEnd )
		{
			/* Form one big block from the two blocks. */
			pxBlockToInsert->xBlockSize += pxIterator->pxNextFreeBlock->xBlockSize;
			pxBlockToInsert->pxNextFreeBlock = pxIterator->pxNextFreeBlock->pxNextFreeBlock;
		}
		else
		{
			pxBlockToInsert->pxNextFreeBlock = pxEnd;
		}
	}
	else
	{
		pxBlockToInsert->pxNextFreeBlock = pxIterator->pxNextFreeBlock;
	}

	/* If the block being inserted plugged a gab, so was merged with the block
	before and the block after, then it's pxNextFreeBlock pointer will have
	already been set, and should not be set here as that would make it point
	to itself. */
	if( pxIterator != pxBlockToInsert )
	{
		pxIterator->pxNextFreeBlock = pxBlockToInsert;
	}
	else
	{
		mtCOVERAGE_TEST_MARKER();
	}
}
```

首先自然是从堆头开始搜索块，但是这里不再像之前那样，用块大小来插入，也不维护整个链表是按照大小顺序的排列的。

这里的内存块的链表是按照块首地址来排序的，这样对于块合并也比较方便。

这里就是搜索到比目标地址小的那一块。

如果找到的这一块刚好和目标块是相连的，那么直接把二者合并。

如果目标块刚好和后一块是相连的，那么把二者合并。

如果都不相连，那么把这一块插入到链表中去。

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
		puc -= xHeapStructSize;

		/* This casting is to keep the compiler from issuing warnings. */
		pxLink = ( void * ) puc;

		/* Check the block is actually allocated. */
		configASSERT( ( pxLink->xBlockSize & xBlockAllocatedBit ) != 0 );
		configASSERT( pxLink->pxNextFreeBlock == NULL );

		if( ( pxLink->xBlockSize & xBlockAllocatedBit ) != 0 )
		{
			if( pxLink->pxNextFreeBlock == NULL )
			{
				/* The block is being returned to the heap - it is no longer
				allocated. */
				pxLink->xBlockSize &= ~xBlockAllocatedBit;

				vTaskSuspendAll();
				{
					/* Add this block to the list of free blocks. */
					xFreeBytesRemaining += pxLink->xBlockSize;
					traceFREE( pv, pxLink->xBlockSize );
					prvInsertBlockIntoFreeList( ( ( BlockLink_t * ) pxLink ) );
				}
				( void ) xTaskResumeAll();
			}
			else
			{
				mtCOVERAGE_TEST_MARKER();
			}
		}
		else
		{
			mtCOVERAGE_TEST_MARKER();
		}
	}
}
```
首先检查是否释放合法

然后获取真实的头地址

检查释放块最高位是否为1，下一块是否为空

清除最高位的1，挂起调度器

更新空间内存空间，调用上面的插入函数插入空闲块。

恢复调度器

## 总结

总体来说这就是heap_4了，依然是不确定性，依然还有碎片的风险（比如轮流申请一个大空间，一个小空间，然后释放了小空间）

最后内存大小可能够下一次申请，但是空闲链表里都是不连起来的小空间，依然会造成申请失败。

但是总体来说已经比heap_2好了太多了，所以这套方案很常用。绝大多数都在用这一套方案。

## Quote

> heap_4.c
>
> http://blog.csdn.net/zhzht19861011/article/details/50248421
>
> http://blog.csdn.net/zhzht19861011/article/details/51606068

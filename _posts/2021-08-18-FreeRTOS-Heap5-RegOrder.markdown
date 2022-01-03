---
layout:     post
title:      "FreeRTOS Heap5内存分配之顺序"
subtitle:   "FreeRTOS，Heap"
date:       2021-08-18
author:     "elmagnifico"
header-img: "img/bg7.jpg"
catalog:    true
tags:
    - FreeRTOS
    - Embedded
---

## Forward

一直使用的FreeRTOS heap5作为内存分配，最近刚好遇到一个bug，仔细看了一下发现heap5的实现，发现这种情况无法处理。



## 现象

我申请了一块150k的内存，但是实际上我分配给heap5的内存块中只有一块大于150k，其他都是小于150k的。而大于150k的又刚好被其他东西占用了，导致当需要分配150k的时候，没有判断返回值，然后内存访问0，就hardfault了。



## 分析

我实际的内存分配，只有一块464的，其他都是小于150k的

```c
MEMORY
{
    OSHEAP0(rw)    : ORIGIN = 0x2000C000, LENGTH =   80K   /* rtos heap0 */
    OSHEAP1(rw)    : ORIGIN = 0x2400C000, LENGTH =  464K   /* rtos heap1 */
    OSHEAP2(rw)    : ORIGIN = 0x30000000, LENGTH =  128K   /* rtos heap2 */
    OSHEAP3(rw)    : ORIGIN = 0x30020000, LENGTH =  128K   /* rtos heap3 */
    OSHEAP4(rw)    : ORIGIN = 0x30040000, LENGTH =   32K   /* rtos heap4 */ 
    OSHEAP5(rw)    : ORIGIN = 0x38000000, LENGTH =   64K   /* rtos heap5 */ 
}

HeapRegion_t xHeapRegions[7];
xHeapRegions[0].pucStartAddress = (uint8_t *)(&_osheap0_st);
xHeapRegions[0].xSizeInBytes    = (uint32_t)(&_osheap0_ed - &_osheap0_st);

xHeapRegions[1].pucStartAddress = (uint8_t *)(&_osheap1_st);
xHeapRegions[1].xSizeInBytes    = (uint32_t)(&_osheap1_ed - &_osheap1_st);

xHeapRegions[2].pucStartAddress = (uint8_t *)(&_osheap2_st);
xHeapRegions[2].xSizeInBytes    = (uint32_t)(&_osheap2_ed - &_osheap2_st);

xHeapRegions[3].pucStartAddress = (uint8_t *)(&_osheap3_st);
xHeapRegions[3].xSizeInBytes    = (uint32_t)(&_osheap3_ed - &_osheap3_st);

xHeapRegions[4].pucStartAddress = (uint8_t *)(&_osheap4_st);
xHeapRegions[4].xSizeInBytes    = (uint32_t)(&_osheap4_ed - &_osheap4_st);

xHeapRegions[5].pucStartAddress = (uint8_t *)(&_osheap5_st);
xHeapRegions[5].xSizeInBytes    = (uint32_t)(&_osheap5_ed - &_osheap5_st);

xHeapRegions[6].pucStartAddress = NULL;
xHeapRegions[6].xSizeInBytes    = 0;

vPortDefineHeapRegions( xHeapRegions );

```

当执行pvPortMalloc（150*1024）是就会出现错误。

```c++
/* Gets set to the top bit of an size_t type.  When this bit in the xBlockSize
member of an BlockLink_t structure is set then the block belongs to the
application.  When the bit is free the block is still part of the free heap
space. */
// 这个数值在内存分配的时候配置的
static size_t xBlockAllocatedBit = 0;

// 决定对齐字节数
#define portBYTE_ALIGNMENT			8

void *pvPortMalloc( size_t xWantedSize )
{
BlockLink_t *pxBlock, *pxPreviousBlock, *pxNewBlockLink;
void *pvReturn = NULL;

	/* The heap must be initialised before the first call to
	prvPortMalloc(). */
	configASSERT( pxEnd );

	vTaskSuspendAll();
	{
		/* Check the requested block size is not so large that the top bit is
		set.  The top bit of the block size member of the BlockLink_t structure
		is used to determine who owns the block - the application or the
		kernel, so it must be free. */
        //    153600            
		if( ( xWantedSize & xBlockAllocatedBit ) == 0 )
		{
			/* The wanted size is increased so it can contain a BlockLink_t
			structure in addition to the requested amount of bytes. */
			if( xWantedSize > 0 )
			{
                // 加上堆的结构字节8
				xWantedSize += xHeapStructSize;

                // 这里是对齐操作，8字节对齐 取决于宏的设置
				/* Ensure that blocks are always aligned to the required number
				of bytes. */
				if( ( xWantedSize & portBYTE_ALIGNMENT_MASK ) != 0x00 )
				{
					/* Byte alignment required. */
					xWantedSize += ( portBYTE_ALIGNMENT - ( xWantedSize & portBYTE_ALIGNMENT_MASK ) );
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

            // 检测总内存是否够分配
			if( ( xWantedSize > 0 ) && ( xWantedSize <= xFreeBytesRemaining ) )
			{
				/* Traverse the list from the start	(lowest address) block until
				one	of adequate size is found. */
				pxPreviousBlock = &xStart;
				pxBlock = xStart.pxNextFreeBlock;
                // 这里就是在检测内存块还剩余的空间是否能够放得下
				while( ( pxBlock->xBlockSize < xWantedSize ) && ( pxBlock->pxNextFreeBlock != NULL ) )
				{
					pxPreviousBlock = pxBlock;
					pxBlock = pxBlock->pxNextFreeBlock;
				}
				
                // 实际上由于464的内存可用空间已经低于150k了，所以最后这里直接等于pxEnd了
				/* If the end marker was reached then a block of adequate size
				was	not found. */
				if( pxBlock != pxEnd )
				{
					/* Return the memory space pointed to - jumping over the
					BlockLink_t structure at its start. */
					pvReturn = ( void * ) ( ( ( uint8_t * ) pxPreviousBlock->pxNextFreeBlock ) + xHeapStructSize );

					/* This block is being returned for use so must be taken out
					of the list of free blocks. */
					pxPreviousBlock->pxNextFreeBlock = pxBlock->pxNextFreeBlock;

					/* If the block is larger than required it can be split into
					two. */
					if( ( pxBlock->xBlockSize - xWantedSize ) > heapMINIMUM_BLOCK_SIZE )
					{
						/* This block is to be split into two.  Create a new
						block following the number of bytes requested. The void
						cast is used to prevent byte alignment warnings from the
						compiler. */
						//pxNewBlockLink = ( void * ) ( ( ( uint8_t * ) pxBlock ) + xWantedSize );
						pxNewBlockLink = (BlockLink_t * ) ( ( ( uint8_t * ) pxBlock ) + xWantedSize );

						/* Calculate the sizes of two blocks split from the
						single block. */
						pxNewBlockLink->xBlockSize = pxBlock->xBlockSize - xWantedSize;
						pxBlock->xBlockSize = xWantedSize;

						/* Insert the new block into the list of free blocks. */
						prvInsertBlockIntoFreeList( ( pxNewBlockLink ) );
					}
					else
					{
						mtCOVERAGE_TEST_MARKER();
					}

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
		else
		{
			mtCOVERAGE_TEST_MARKER();
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
		else
		{
			mtCOVERAGE_TEST_MARKER();
		}
	}
	#endif

	return pvReturn;
}
```

剩余空间足够的情况下，但是单片空间不够，heap5并不能降多块空间组合在一起使用。

由于我分配空间的时候没有把连续的内存空间划分到一起（实际上datasheet中认为是独立的），比如下面的heap2、heap3、heap4他们是可以连接在一起，成为一个大块的。

```
    OSHEAP0(rw)    : ORIGIN = 0x2000C000, LENGTH =   80K   /* rtos heap0 */
    OSHEAP1(rw)    : ORIGIN = 0x2400C000, LENGTH =  464K   /* rtos heap1 */
    OSHEAP2(rw)    : ORIGIN = 0x30000000, LENGTH =  128K   /* rtos heap2 */
    OSHEAP3(rw)    : ORIGIN = 0x30020000, LENGTH =  128K   /* rtos heap3 */
    OSHEAP4(rw)    : ORIGIN = 0x30040000, LENGTH =   32K   /* rtos heap4 */ 
    OSHEAP5(rw)    : ORIGIN = 0x38000000, LENGTH =   64K   /* rtos heap5 */ 
```

这是一种解决办法。

可能还有一种，但是这个FreeRTOS没有明说，具体原因不详

## 修改内存顺序

实际内存使用基本就是按照注册的顺序进行轮循的，找到哪一块里有合适的位置就先使用了。

如果我修改了内存块顺序，优先填满小块是否可行呢？

原生代码中表示这不行！

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

            // 主要是这里进行的检测，这里要求注册的地址必须是后一块地址比前一块大，否则就不给你过了
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

实际使用的时候，可以把configASSERT( xAddress > ( size_t ) pxEnd );直接注释掉，然后确实能正常跑过注册流程，后续的分配也没有问题。但也仅限于此，FreeRTOS里其他代码会不会刚好也检测了这个顺序，那就不好说了。所以建议不要用这种方法来进行解。



## End

FreeRTOS里heap5的内存注册需要按照顺序，这个隐含条件。平常看到的说明都说heap5支持不连续，但是这个不连续仅仅指硬件地址上的不连续，但是却没说要求顺序注册的这一条件。



## Quote

> https://percepio.com/gettingstarted-freertos/




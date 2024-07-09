---
layout:     post
title:      "FreeRTOS深入理解优先级翻转"
subtitle:   "互斥量、信号量、优先级继承"
date:       2024-07-08
update:     2024-07-09
author:     "elmagnifico"
header-img: "img/x12.jpg"
catalog:    true
tobecontinued: false
tags:
    - FreeRTOS
---

## Foreword

深入理解FreeRTOS中的互斥量、信号量、优先级反转、优先级继承等概念



## 理解基础

有一些知识基础才能看明白下为什么这么设计，这么说

- 中断不应该被阻塞
- 操作系统相关优先级远低于硬件中断，仅仅讨论操作系统内的情况，不考虑中断介入的更复杂情况



#### 优先级翻转

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202407082303481.png)

假设：

- 系统中有3个任务Task1，Task2和Task3，优先级分别为3，2，1，也就是Task1的优先级最高

- 任务Task1和Task3互斥访问串口打印printf，采用二值信号实现互斥访问。

- 起初Task3通过二值信号量正在调用printf，被任务Task1抢占，开始执行任务Task1。

  

问题产生：

- 任务Task1运行的过程需要调用函数printf，发现任务Task3正在调用，任务Task1会被挂起，等待Task3释放函数printf。
- 在调度器的作用下，任务Task3得到运行，Task3运行的过程中，由于任务Task2就绪，抢占了Task3的运行（Task1说：好家伙，被你小子偷鸡了）
- **优先级翻转问题就出在这里了**，从任务执行的现象上看，任务Task1需要等待Task2执行完毕才有机会得到执行，这个不符合抢占式调度的原理了，正常情况下应该是高优先级任务抢占低优先级任务的执行，这里成了高优先级任务Task1等待低优先级任务Task2完成，所以这种情况被称之为优先级翻转问题。
- 任务Task2执行完毕后，任务Task3恢复执行，Task3释放互斥资源后，任务Task1得到互斥资源，从而可以继续执行。

这里看起来好像只是Task1多等了一会，其实Task2可能不止一个，可能有很多，这就造成了Task1被延迟了非常久的情况，所以这个问题是不能忽略的。



#### 优先级继承

解决优先级反转，一般使用优先级继承这种机制来处理。优先级继承会在发现了上面的描述的情况时，将Task3的优先级提高到Task1的级别，从而防止此时被其他任务插足，从而可以在Task3



## 信号量

Semaphore，信号量，操作系统中非常常见的一种机制，一般来说用来表示当前可用资源的数量，0表示无资源，无法访问，而非0表示有资源，可以访问。比较常见的用途就是做任务之间同步、临界资源互斥访问。

信号量是一种比较大的说法，细分的话：

- 二值信号量，他只能管理一个资源。

- 计数信号量，他可以管理多个资源。
- 递归信号量，他主要是针对函数重入和资源释放时机的管理



#### 二值信号量

Semaphore，顾名思义，二值信号量就只有两种状态，比较常见的布尔类型就可以作为二值信号量，

```c
Bool semaphore;
semaphore = true;
semaphore = false;
```

普通说的二值信号量，就只有0和1这个概念，他会有优先级翻转的问题，但是没有优先级继承的能力（主要是他的实现比较简单）



二值信号量更适合做同步类型的应用



#### 互斥量

Mutex，互斥量，其实就是有了优先级继承能力的二值信号量，不再是简单的0和1就能表示的了，他内部还有额外的变量用来记录优先级变动的情况



互斥量更适合资源互斥访问的处理



类似的互斥锁、互斥信号量等，都是再说同一个事情



#### 何时使用

那么什么是同步，什么是互斥？

同步，从业务角度直接理解，需要对方达到我预期的地方，这就是同步

互斥，还是业务角度，我用，你不能用；你用，我不能用



再进一步理解，互斥时，是需要优先级继承的，为什么，以上面的Task为例，为了防止被人中间偷鸡，这个东西只能在你我之间，不许第三者插足。



同步时，为什么可以不需要优先级继承，因为我本身就是要等你的，我等你1s是等，等你2s也是等，对于这个任务而言，这个等待的时间并不是关键矛盾，甚至中间被别人抢了也不重要，等就是了，同步要处理的是我们步调一致

如果同步时使用互斥会造成什么情况？原本需要等待的任务被拔苗助长了，提前获得了高优先级，执行速率比平常更快了。时间是一定的，有人快了，必然会有人慢了，这种情况往往不是我们想看到的，所以同步时最好是不要有优先级继承的情况



## FreeRTOS



#### xSemaphore与MUTEX

先看一下FreeRTOS中的二值信号量

```c
 * Example usage:
 * @code{c}
 * SemaphoreHandle_t xSemaphore = NULL;
 *
 * void vATask( void * pvParameters )
 * {
 *  // Semaphore cannot be used before a call to xSemaphoreCreateBinary().
 *  // This is a macro so pass the variable in directly.
 *  xSemaphore = xSemaphoreCreateBinary();
 *
 *  if( xSemaphore != NULL )
 *  {
 *      // The semaphore was created successfully.
 *      // The semaphore can now be used.
 *  }
 * }
 * @endcode
 * \defgroup xSemaphoreCreateBinary xSemaphoreCreateBinary
 * \ingroup Semaphores
 */
#if ( configSUPPORT_DYNAMIC_ALLOCATION == 1 )
    #define xSemaphoreCreateBinary()    xQueueGenericCreate( ( UBaseType_t ) 1, semSEMAPHORE_QUEUE_ITEM_LENGTH, queueQUEUE_TYPE_BINARY_SEMAPHORE )
#endif
```

可以在代码里清晰的看到，二值信号量的内核直接就是一个Queue，这样的好处是代码重用率非常高，不需要额外去实现这个东西。



```c
#define xSemaphoreGive( xSemaphore )    xQueueGenericSend( ( QueueHandle_t ) ( xSemaphore ), NULL, semGIVE_BLOCK_TIME, queueSEND_TO_BACK )

#define xSemaphoreTake( xSemaphore, xBlockTime )    xQueueSemaphoreTake( ( xSemaphore ), ( xBlockTime ) )
```

二值的释放是队列操作，二值的获取用的是队列的特殊实现

```c
BaseType_t xQueueSemaphoreTake( QueueHandle_t xQueue,
                                TickType_t xTicksToWait )
{
    BaseType_t xEntryTimeSet = pdFALSE;
    TimeOut_t xTimeOut;
    Queue_t * const pxQueue = xQueue;

    #if ( configUSE_MUTEXES == 1 )
        BaseType_t xInheritanceOccurred = pdFALSE;
    #endif

    /* Check the queue pointer is not NULL. */
    configASSERT( ( pxQueue ) );

    /* Check this really is a semaphore, in which case the item size will be
     * 0. */
    configASSERT( pxQueue->uxItemSize == 0 );

    /* Cannot block if the scheduler is suspended. */
    #if ( ( INCLUDE_xTaskGetSchedulerState == 1 ) || ( configUSE_TIMERS == 1 ) )
    {
        configASSERT( !( ( xTaskGetSchedulerState() == taskSCHEDULER_SUSPENDED ) && ( xTicksToWait != 0 ) ) );
    }
    #endif

    /*lint -save -e904 This function relaxes the coding standard somewhat to allow return
     * statements within the function itself.  This is done in the interest
     * of execution time efficiency. */
    for( ; ; )
    {
        taskENTER_CRITICAL();
        {
            /* Semaphores are queues with an item size of 0, and where the
             * number of messages in the queue is the semaphore's count value. */
            const UBaseType_t uxSemaphoreCount = pxQueue->uxMessagesWaiting;

            /* Is there data in the queue now?  To be running the calling task
             * must be the highest priority task wanting to access the queue. */
            if( uxSemaphoreCount > ( UBaseType_t ) 0 )
            {
                traceQUEUE_RECEIVE( pxQueue );

                /* Semaphores are queues with a data size of zero and where the
                 * messages waiting is the semaphore's count.  Reduce the count. */
                pxQueue->uxMessagesWaiting = uxSemaphoreCount - ( UBaseType_t ) 1;

                #if ( configUSE_MUTEXES == 1 )
                {
                    if( pxQueue->uxQueueType == queueQUEUE_IS_MUTEX )
                    {
                        /* Record the information required to implement
                         * priority inheritance should it become necessary. */
                        pxQueue->u.xSemaphore.xMutexHolder = pvTaskIncrementMutexHeldCount();
                    }
                    else
                    {
                        mtCOVERAGE_TEST_MARKER();
                    }
                }
                #endif /* configUSE_MUTEXES */

                /* Check to see if other tasks are blocked waiting to give the
                 * semaphore, and if so, unblock the highest priority such task. */
                if( listLIST_IS_EMPTY( &( pxQueue->xTasksWaitingToSend ) ) == pdFALSE )
                {
                    if( xTaskRemoveFromEventList( &( pxQueue->xTasksWaitingToSend ) ) != pdFALSE )
                    {
                        queueYIELD_IF_USING_PREEMPTION();
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

                taskEXIT_CRITICAL();
                return pdPASS;
            }
            else
            {
                if( xTicksToWait == ( TickType_t ) 0 )
                {
                    /* The semaphore count was 0 and no block time is specified
                     * (or the block time has expired) so exit now. */
                    taskEXIT_CRITICAL();
                    traceQUEUE_RECEIVE_FAILED( pxQueue );
                    return errQUEUE_EMPTY;
                }
                else if( xEntryTimeSet == pdFALSE )
                {
                    /* The semaphore count was 0 and a block time was specified
                     * so configure the timeout structure ready to block. */
                    vTaskInternalSetTimeOutState( &xTimeOut );
                    xEntryTimeSet = pdTRUE;
                }
                else
                {
                    /* Entry time was already set. */
                    mtCOVERAGE_TEST_MARKER();
                }
            }
        }
        taskEXIT_CRITICAL();

        /* Interrupts and other tasks can give to and take from the semaphore
         * now the critical section has been exited. */

        vTaskSuspendAll();
        prvLockQueue( pxQueue );

        /* Update the timeout state to see if it has expired yet. */
        if( xTaskCheckForTimeOut( &xTimeOut, &xTicksToWait ) == pdFALSE )
        {
            /* A block time is specified and not expired.  If the semaphore
             * count is 0 then enter the Blocked state to wait for a semaphore to
             * become available.  As semaphores are implemented with queues the
             * queue being empty is equivalent to the semaphore count being 0. */
            if( prvIsQueueEmpty( pxQueue ) != pdFALSE )
            {
                traceBLOCKING_ON_QUEUE_RECEIVE( pxQueue );

                #if ( configUSE_MUTEXES == 1 )
                {
                    if( pxQueue->uxQueueType == queueQUEUE_IS_MUTEX )
                    {
                        taskENTER_CRITICAL();
                        {
                            xInheritanceOccurred = xTaskPriorityInherit( pxQueue->u.xSemaphore.xMutexHolder );
                        }
                        taskEXIT_CRITICAL();
                    }
                    else
                    {
                        mtCOVERAGE_TEST_MARKER();
                    }
                }
                #endif /* if ( configUSE_MUTEXES == 1 ) */

                vTaskPlaceOnEventList( &( pxQueue->xTasksWaitingToReceive ), xTicksToWait );
                prvUnlockQueue( pxQueue );

                if( xTaskResumeAll() == pdFALSE )
                {
                    portYIELD_WITHIN_API();
                }
                else
                {
                    mtCOVERAGE_TEST_MARKER();
                }
            }
            else
            {
                /* There was no timeout and the semaphore count was not 0, so
                 * attempt to take the semaphore again. */
                prvUnlockQueue( pxQueue );
                ( void ) xTaskResumeAll();
            }
        }
        else
        {
            /* Timed out. */
            prvUnlockQueue( pxQueue );
            ( void ) xTaskResumeAll();

            /* If the semaphore count is 0 exit now as the timeout has
             * expired.  Otherwise return to attempt to take the semaphore that is
             * known to be available.  As semaphores are implemented by queues the
             * queue being empty is equivalent to the semaphore count being 0. */
            if( prvIsQueueEmpty( pxQueue ) != pdFALSE )
            {
                #if ( configUSE_MUTEXES == 1 )
                {
                    /* xInheritanceOccurred could only have be set if
                     * pxQueue->uxQueueType == queueQUEUE_IS_MUTEX so no need to
                     * test the mutex type again to check it is actually a mutex. */
                    if( xInheritanceOccurred != pdFALSE )
                    {
                        taskENTER_CRITICAL();
                        {
                            UBaseType_t uxHighestWaitingPriority;

                            /* This task blocking on the mutex caused another
                             * task to inherit this task's priority.  Now this task
                             * has timed out the priority should be disinherited
                             * again, but only as low as the next highest priority
                             * task that is waiting for the same mutex. */
                            uxHighestWaitingPriority = prvGetDisinheritPriorityAfterTimeout( pxQueue );
                            vTaskPriorityDisinheritAfterTimeout( pxQueue->u.xSemaphore.xMutexHolder, uxHighestWaitingPriority );
                        }
                        taskEXIT_CRITICAL();
                    }
                }
                #endif /* configUSE_MUTEXES */

                traceQUEUE_RECEIVE_FAILED( pxQueue );
                return errQUEUE_EMPTY;
            }
            else
            {
                mtCOVERAGE_TEST_MARKER();
            }
        }
    } /*lint -restore */
}
/*-----------------------------------------------------------*/
```

再看这个二值的获取和释放，实际上这个队列甚至都没有真的存储数据，仅仅用`pxQueue->uxMessagesWaiting`来作为实际的翻转值，把对内存的吝啬做到了极致。

而明显同一个函数既作为二值信号量的处理也作为互斥量的处理函数



```c
                    if( pxQueue->uxQueueType == queueQUEUE_IS_MUTEX )
                    {
                        /* Record the information required to implement
                         * priority inheritance should it become necessary. */
                        pxQueue->u.xSemaphore.xMutexHolder = pvTaskIncrementMutexHeldCount();
                    }
```

互斥量的关键点就在于这里的`xMutexHolder`，保存了互斥量的使用者，剩下就是常规操作，看是否有任务在等这个信号量，如果这个任务级别够高，就会主动调度。



#### 优先级继承实现

```c
#if ( configUSE_MUTEXES == 1 )

    BaseType_t xTaskPriorityInherit( TaskHandle_t const pxMutexHolder )
    {
        TCB_t * const pxMutexHolderTCB = pxMutexHolder;
        BaseType_t xReturn = pdFALSE;

        /* If the mutex was given back by an interrupt while the queue was
         * locked then the mutex holder might now be NULL.  _RB_ Is this still
         * needed as interrupts can no longer use mutexes? */
        if( pxMutexHolder != NULL )
        {
            /* If the holder of the mutex has a priority below the priority of
             * the task attempting to obtain the mutex then it will temporarily
             * inherit the priority of the task attempting to obtain the mutex. */
            if( pxMutexHolderTCB->uxPriority < pxCurrentTCB->uxPriority )
            {
                /* Adjust the mutex holder state to account for its new
                 * priority.  Only reset the event list item value if the value is
                 * not being used for anything else. */
                if( ( listGET_LIST_ITEM_VALUE( &( pxMutexHolderTCB->xEventListItem ) ) & taskEVENT_LIST_ITEM_VALUE_IN_USE ) == 0UL )
                {
                    listSET_LIST_ITEM_VALUE( &( pxMutexHolderTCB->xEventListItem ), ( TickType_t ) configMAX_PRIORITIES - ( TickType_t ) pxCurrentTCB->uxPriority ); /*lint !e961 MISRA exception as the casts are only redundant for some ports. */
                }
                else
                {
                    mtCOVERAGE_TEST_MARKER();
                }

                /* If the task being modified is in the ready state it will need
                 * to be moved into a new list. */
                if( listIS_CONTAINED_WITHIN( &( pxReadyTasksLists[ pxMutexHolderTCB->uxPriority ] ), &( pxMutexHolderTCB->xStateListItem ) ) != pdFALSE )
                {
                    if( uxListRemove( &( pxMutexHolderTCB->xStateListItem ) ) == ( UBaseType_t ) 0 )
                    {
                        /* It is known that the task is in its ready list so
                         * there is no need to check again and the port level
                         * reset macro can be called directly. */
                        portRESET_READY_PRIORITY( pxMutexHolderTCB->uxPriority, uxTopReadyPriority );
                    }
                    else
                    {
                        mtCOVERAGE_TEST_MARKER();
                    }

                    /* Inherit the priority before being moved into the new list. */
                    pxMutexHolderTCB->uxPriority = pxCurrentTCB->uxPriority;
                    prvAddTaskToReadyList( pxMutexHolderTCB );
                }
                else
                {
                    /* Just inherit the priority. */
                    pxMutexHolderTCB->uxPriority = pxCurrentTCB->uxPriority;
                }

                traceTASK_PRIORITY_INHERIT( pxMutexHolderTCB, pxCurrentTCB->uxPriority );

                /* Inheritance occurred. */
                xReturn = pdTRUE;
            }
            else
            {
                if( pxMutexHolderTCB->uxBasePriority < pxCurrentTCB->uxPriority )
                {
                    /* The base priority of the mutex holder is lower than the
                     * priority of the task attempting to take the mutex, but the
                     * current priority of the mutex holder is not lower than the
                     * priority of the task attempting to take the mutex.
                     * Therefore the mutex holder must have already inherited a
                     * priority, but inheritance would have occurred if that had
                     * not been the case. */
                    xReturn = pdTRUE;
                }
                else
                {
                    mtCOVERAGE_TEST_MARKER();
                }
            }
        }
        else
        {
            mtCOVERAGE_TEST_MARKER();
        }

        return xReturn;
    }

#endif /* configUSE_MUTEXES */
```

检查互斥锁持有者的优先级是否低于请求者，如果低，会先把互斥锁对应的事件组先提起来，因为往往互斥锁可能是和该任务的事件组相关联的，要提就得一起提起来。如果当前持有者已经是就绪态了，那么直接更新他的优先级，把他插入到就绪任务中。



## Summary

FreeRTOS本身为了兼顾性能和内存使用，只是完成了部分的优先级继承的处理，足以应付多数情况，但是并不是完美的，涉及到多个互斥量，多层嵌套的时候，依然有可能会出现优先级翻转的问题。



二值信号量和互斥量在FreeRTOS中其实已经是老生常谈的东西了，但是很多使用者并不会区分二者，导致实际在工程中乱用，而FreeRTOS很早就在源码或者API接口上注释了`xTaskNotify`，多数情况使用xTaskNotify就足够完成通知同步等功能了，而不会乱用二值和互斥量



## Quote

>  https://github.com/FreeRTOS/FreeRTOS
>
>  https://www.cnblogs.com/lizhuming/p/16350240.html
>
>  https://forums.freertos.org/t/priority-inheritance-proposal/11175




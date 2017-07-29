---
layout:     post
title:      "FreeRTOS Delay Bug"
subtitle:   "STM32，FreeRTOS"
date:       2017-07-26
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## Foreword

首先是这样的一份代码，其含义很简单，通过使用 vTaskDelayUntil 函数 来保证这个 while 循
环是按照预设的频率执行，循环体需要严格保证时间间隔，频率过高可能会发生奇怪的有问题

```c
#define SENSOR_IMU_UPDATE_INTERVAL_MS               1    // 1000HZ

//in imu_init func

imu_last_update_time     = xTaskGetTickCount();
imu_last_publish_time    = xTaskGetTickCount();

//in imu_update func

while(1){
    vTaskDelayUntil(&imu_last_update_time, SENSOR_IMU_UPDATE_INTERVAL_MS/portTICK_RATE_MS);

    update_loop()
}
```

## Analysis

乍一看好像没有什么问题，如果上面的函数实际应用过程中只有这么多内容，可能真的不会有什么问题了，然而并不是。

如果在 init 与 update 函数之间存在一个很大的延迟，就有可能出现一些超出我们预期的问题了。

#### vTaskDelayUntil

先说这个函数

> Summary
Places the task that calls vTaskDelayUntil() into the Blocked state until an absolute time is
reached.
Periodic tasks can use vTaskDelayUntil() to achieve a constant execution frequency.

```c
/* Define a task that performs an action every 50 milliseconds. */
void vCyclicTaskFunction( void * pvParameters )
{
    TickType_t xLastWakeTime;
    const TickType_t xPeriod = pdMS_TO_TICKS( 50 );

    /* The xLastWakeTime variable needs to be initialized with the current tick
    count. Note that this is the only time the variable is written to explicitly.
    After this assignment, xLastWakeTime is updated automatically internally within
    vTaskDelayUntil(). */
    xLastWakeTime = xTaskGetTickCount();

    /* Enter the loop that defines the task behavior. */
    for( ;; )
    {
        /* This task should execute every 50 milliseconds. Time is measured
        in ticks. The pdMS_TO_TICKS macro is used to convert milliseconds
        into ticks. xLastWakeTime is automatically updated within vTaskDelayUntil()
        so is not explicitly updated by the task. */
        vTaskDelayUntil( &xLastWakeTime, xPeriod );

        /* Perform the periodic actions here. */
    }
}
```

从官方给的例程里也看不出来有什么问题，而且官方自己也说了传入的第一个参数，需要初始化，其值会在每次调用时被更新。

#### Source Code

看一下其源码

```c
void vTaskDelayUntil( TickType_t * const pxPreviousWakeTime, const TickType_t xTimeIncrement )
{
TickType_t xTimeToWake;
BaseType_t xAlreadyYielded, xShouldDelay = pdFALSE;

    configASSERT( pxPreviousWakeTime );
    configASSERT( ( xTimeIncrement > 0U ) );
    configASSERT( uxSchedulerSuspended == 0 );

    vTaskSuspendAll();
    {
        /* Minor optimisation.  The tick count cannot change in this
        block. */
        const TickType_t xConstTickCount = xTickCount;

        /* Generate the tick time at which the task wants to wake. */
        // 更新唤醒时间，可以看到，唤醒时间是给入的当前时间+时间间隔
        xTimeToWake = *pxPreviousWakeTime + xTimeIncrement;

        if( xConstTickCount < *pxPreviousWakeTime )
        {
            /* The tick count has overflowed since this function was
            lasted called.  In this case the only time we should ever
            actually delay is if the wake time has also	overflowed,
            and the wake time is greater than the tick time.  When this
            is the case it is as if neither time had overflowed. */
            if( ( xTimeToWake < *pxPreviousWakeTime ) && ( xTimeToWake > xConstTickCount ) )
            {
                xShouldDelay = pdTRUE;
            }
            else
            {
                mtCOVERAGE_TEST_MARKER();
            }
        }
        else
        {
            /* The tick time has not overflowed.  In this case we will
            delay if either the wake time has overflowed, and/or the
            tick time is less than the wake time. */
            if( ( xTimeToWake < *pxPreviousWakeTime ) || ( xTimeToWake > xConstTickCount ) )
            {
                xShouldDelay = pdTRUE;
            }
            else
            {
                mtCOVERAGE_TEST_MARKER();
            }
        }

        /* Update the wake time ready for the next call. */
        // 更新给入的当前时刻，当前时刻其实只是往前走了一个唤醒时间而已
        *pxPreviousWakeTime = xTimeToWake;

        if( xShouldDelay != pdFALSE )
        {
            traceTASK_DELAY_UNTIL( xTimeToWake );

            /* prvAddCurrentTaskToDelayedList() needs the block time, not
            the time to wake, so subtract the current tick count. */
            prvAddCurrentTaskToDelayedList( xTimeToWake - xConstTickCount, pdFALSE );
        }
        else
        {
            mtCOVERAGE_TEST_MARKER();
        }
    }
    xAlreadyYielded = xTaskResumeAll();

    /* Force a reschedule if xTaskResumeAll has not already done so, we may
    have put ourselves to sleep. */
    if( xAlreadyYielded == pdFALSE )
    {
        portYIELD_WITHIN_API();
    }
    else
    {
        mtCOVERAGE_TEST_MARKER();
    }
}
```

看过源码以后，就发现，哎这个更新好像有点奇怪，时间每次更新都只是更新一个时间间隔，而不是更新成当前时间。

这样会导致一个什么问题呢？

如果你在初始化的时候拿到了当前时间 c ，但是当调用 vTaskDelayUntil 的时候，已经过了很久，当前时间其实是 c1 了，那么 vTaskDelayUntil 就只会让 c += interval 而不是更新成 c1 的时间。 这么做就会导致循环体被快速执行了多次，直到 c 被更新到了当前时间才会正常延迟一定时间以后才执行循环体。

然而在上面的程序中需要严格保证每次循环的间隔时间，那么如果 init 距离实际使用 vTaskDelayUntil 有一定的延迟，就会造成这个循环体没有延迟的情况下运行若干个周期，这并不是我们预期的样子。

## Modification

```c
void vTaskDelayUntil( TickType_t * const pxPreviousWakeTime, const TickType_t xTimeIncrement )
{
TickType_t xTimeToWake;
BaseType_t xAlreadyYielded, xShouldDelay = pdFALSE;

    configASSERT( pxPreviousWakeTime );
    configASSERT( ( xTimeIncrement > 0U ) );
    configASSERT( uxSchedulerSuspended == 0 );

    vTaskSuspendAll();
    {
        /* Minor optimisation.  The tick count cannot change in this
        block. */
        const TickType_t xConstTickCount = xTickCount;

        /* Generate the tick time at which the task wants to wake. */
        xTimeToWake = *pxPreviousWakeTime + xTimeIncrement;

        if( xConstTickCount < *pxPreviousWakeTime )
        {
            /* The tick count has overflowed since this function was
            lasted called.  In this case the only time we should ever
            actually delay is if the wake time has also	overflowed,
            and the wake time is greater than the tick time.  When this
            is the case it is as if neither time had overflowed. */
            if( ( xTimeToWake < *pxPreviousWakeTime ) && ( xTimeToWake > xConstTickCount ) )
            {
                xShouldDelay = pdTRUE;
            }
            else
            {
                mtCOVERAGE_TEST_MARKER();
            }
        }
        else
        {
            /* The tick time has not overflowed.  In this case we will
            delay if either the wake time has overflowed, and/or the
            tick time is less than the wake time. */
            if( ( xTimeToWake < *pxPreviousWakeTime ) || ( xTimeToWake > xConstTickCount ) )
            {
                xShouldDelay = pdTRUE;
            }
            else
            {
                mtCOVERAGE_TEST_MARKER();
            }
        }

        if( xShouldDelay != pdFALSE )
        {
            /* if should delay, the PreviousWakeTime set to be the TimeToWake*/
            *pxPreviousWakeTime = xTimeToWake;

            traceTASK_DELAY_UNTIL( xTimeToWake );

            /* prvAddCurrentTaskToDelayedList() needs the block time, not
            the time to wake, so subtract the current tick count. */
            prvAddCurrentTaskToDelayedList( xTimeToWake - xConstTickCount, pdFALSE );
        }
        else
        {
            /* if should not delay, just set PreviousWakeTime to now */
            *pxPreviousWakeTime = xConstTickCount;
            //mtCOVERAGE_TEST_MARKER();
        }
    }
    xAlreadyYielded = xTaskResumeAll();

    /* Force a reschedule if xTaskResumeAll has not already done so, we may
    have put ourselves to sleep. */
    if( xAlreadyYielded == pdFALSE )
    {
        portYIELD_WITHIN_API();
    }
    else
    {
        mtCOVERAGE_TEST_MARKER();
    }
}
```

主要修改了在判断完是否应该 delay 后，具体是用什么来更新给入的当前时间。

- 如果判定需要delay，说明其被唤醒的时间，是给入的时间+interval。

- 如果判定不需要delay，说明其应该被更新为本次调用的当前时间

从而保证了使用 vTaskDelayUntil ，可以让循环体得到充分的延时。

## Summary

但是回顾整个函数，仔细想想，他为什么要这样写，vTaskDelayUntil 的作用到底是什么。

首先 vTaskDelayUntil 使用的是实际的时钟滴答数，他的源码里保证的是 vTaskDelayUntil
一定可以得到正确的调用频率，你的循环体需要执行的次数在给入时间追上当前时间这一过程中
可能频率非常高，远超过你的预期频率，但是他保证了你执行的次数是相对正确的，保证了长期的频
率是相对正确的。

经过魔改后的代码，保证的是循环体执行之间一定会有延迟，但是频率就无法保证了，如果有更高级
的任务进行了中断，那么会导致这里的频率低于预期目标。

所以具体想要保障循环体的频率还是间隔，要根据实际应用的情况来决定。

还有一种情况，就是在距离 vTaskDelayUntil 最近的地方，获取当前时间作为参数，然后传入，自
然就不会有上面说的问题了，又或者是使用 vTaskDelay 来保障每次循环体的间隔

当面对又需要保障循环体频率，又需要保障循环体间隔的时候，自然就会出现这个问题

## Quote

> http://www.freertos.org/

---
layout:     post
title:      "FreeRTOS移植到STM32F767(二)"
subtitle:   "嵌入式，FreeRTOS，STM32F767"
date:       2017-03-16
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
---

## 移植FreeRTOS到STM32F767

经过前面的移植，基本上已经有一个可用的工程了，但是这样还不够，目前也只是拿demo的剪裁版本来用，可能并不是我们想要的。

接下来就要介绍如何配置FreeRTOS，如何剪裁自己想要的系统。

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

#### 第三步.配置FreeRTOSConfig


##### config宏

###### config通用部分
```c
#define configUSE_PREEMPTION 1
```

设置为1表示是抢占式调度器，抢占式会在每个节拍中断的时候进行任务调度，有可能会切换任务

设置为0表示是协程，这时只有下面情况才会切换任务

1. 调用taskYIELD()
2. 调用了API阻塞函数
3. 明确规定了上下文切换

```c
#define configUSE_TIME_SLICING 1
```

默认情况下系统是认为为1的，并且系统是抢占式的，调度系统永远运行就绪态的优先级最高的任务，相同优先级的话，会自动在节拍中断的时候进行切换，这里如果配置为0的话，那么相同优先级则不会进行切换

```c
#define configUSE_PORT_OPTIMISED_TASK_SELECTION 1
```

有两种方法来选择下一个要执行的任务。

1. 通用方法，设置为0，硬件通用，完全用c实现，比特殊方法效率低，没有可用优先级的最大数量限制的时候选择这种
2. 特殊方法，设置为1，不完全通用，有特殊指令，有多个构架的汇编，效率高，32个优先级数量限制的时候，选择这种

其中特殊指令是指，有前导零计数指令（CLZ）

这个一般都是浮点数计算什么的才会用到，用于规格化浮点数什么的。

当前使用的板子是有这个需求的，所以要配1

```c
#define configUSE_TICKLESS_IDLE 0
```

1是打开低功耗模式，节拍中断是不一定有的，0则是保持一直会有节拍中断，同时也要看板子是否支持。

这里我们用的要一直有节拍中断，不需要节省能耗的。

```c
#define configUSE_QUEUE_SETS 1
```

是否使用队列功能，这里是用的，使用了自然也跟源文件的queue.c有关

```c
configCPU_CLOCK_HZ (SystemCoreClock)
```
设置产生节拍中断的那个时钟的频率，不一定等于硬件板子的最高频率

```c
#define configTICK_RATE_HZ (1000)  
```

设置任务调度频率 也就是之前配置的滴答定时器的中断频率 1000Hz

pdMS_TO_TICKS()及其相关配置只有在频率小于等于1000Hz的情况下才能使用

即使频率被改变了，但是这种方式确定的阻塞时间并不会因此而改变。

```c
#define configMAX_PRIORITIES (32)
```

如之前所说的，特殊模式下，优先级最多是32个，普通模式则没有限制。

其中0是最低级，configMAX_PRIORITIES-1是最高级

```c
#define configMAX_TASK_NAME_LEN (16) 
```

设置每个任务的任务名最大长度，主要用于调试而已，没什么太大意义

```c
#define configUSE_16_BIT_TICKS 0
```
设置系统节拍计数器变量数据类型，如果是1，就是16位计数器，为0就是32位计数器

```c
#define configIDLE_SHOULD_YIELD 1
```

定义了当其他任务和空闲任务同一优先级的时候，调度系统的行为。

为0，空闲任务不会让出cpu，为1的时候会让出cpu

当然由于空闲任务还是会在使用cpu之后才会切换任务，这样就会浪费一个切换任务的时间，影响不算太大吧

```c
#define configUSE_TASK_NOTIFICATIONS 1 
```
设置是否使用任务通知功能，开启的话，对应功能的API也会被编译,每个任务需要额外消耗8字节

```c
#define configUSE_MUTEXES 1	
```
设置是否使用互斥信号量功能，开启的话，对应功能的API也会被编译

```c
#define configQUEUE_REGISTRY_SIZE 8
```
设置可以注册的队列和信号量的最大数量，这个宏基本只有启用内核调试器才有用，而且需要配合使用队列和信号量注册，然后才能查看调试，平常来说其实可以设置为0

```c
#define configUSE_RECURSIVE_MUTEXES	1
```
设置是否使用递归信号量功能，开启的话，对应功能的API也会被编译

```c
#define configUSE_APPLICATION_TASK_TAG 0
```
设置为1 vTaskSetApplicationTaskTag() and xTaskCallApplicationTaskHook() 函数就会被作为API编译，否则反之

这个函数可以给一个任务分配一个标签值，然后对应的标签还有一个回调函数。

但是我个人完全没懂这里的标签值有什么用，有什么意思，日后理解了再添加解释吧。

```c
#define configUSE_COUNTING_SEMAPHORES 1
```
设置为1，表示启用计数型信号量。

###### config内存相关

```c
#define configMINIMAL_STACK_SIZE ((unsigned short)130)
```

因为，FreeRTOS给每个任务分配了自己的栈空间，这里就是设置其分配的最小空间是多少，单位是字！

```c
#define configSUPPORT_DYNAMIC_ALLOCATION 1
```
设置为1，动态分配内存，如果设置为0，需要手动分配占用RAM大小，自动分配的情况下，申请的堆空间来自于下面这个设定

```c
#define configTOTAL_HEAP_SIZE ((size_t)(46*1024))
```

设置系统堆的总大小，总的来说是通过heap_1/2/3/4/5.c中的函数申请这个空间的内容的。

###### config与Hook相关

```c
#define configCHECK_FOR_STACK_OVERFLOW 0
```
这个就是用来检测堆栈溢出的，如果设置为0，表示不检测。

如果设置为其他值，表示需要堆栈溢出检测，那么对应的需要一同一个Hook函数，进行溢出的处理。

下面是对应的Hook函数原型
```c
	void vApplicationStackOverflowHook( TaskHandle_t *pxTask,signed char *pcTaskName );
```
TaskHandle_t *pxTask 是溢出的任务句柄

signed char *pcTaskName 是溢出的任务名

但是溢出情况如果严重的话，那么这里传入的参数可能是无效的。

如果设置为1，使用方法一，就是对任务堆栈指针做一个检测，如果指向无效空间，那么就会调用Hook函数

如果设置为2，使用方法二，包括方法一，方法二是检测栈的后几字节，如果被改写了，就会调用Hook，当然如果溢出值和未改写值相同，则检测不出来。

```c
#define configUSE_MALLOC_FAILED_HOOK 0 
```
与上面的栈溢出相似，如果分配内存失败了，是否调用Hook函数

当然这个和系统API的获取空间有关，只有使用了系统内存分配的 heap_1/2/3/4/5.c的时候才能用这里

下面这个是函数原型
```c
	void vApplicationMallocFailedHook( void );
```
这里就关闭了

```c
#define configUSE_IDLE_HOOK	0    
```
设置为1时，使用空闲任务Hook函数，为0不使用

其函数原型如下：

```c
	void vApplicationIdleHook( void );
```

```c
#define configUSE_TICK_HOOK 0  
```
为1的时候使用时间片Hook函数，原型如下，为0不使用。
```c
	void vApplicationTickHook( void );
```
###### config运行和状态相关

```c
#define configGENERATE_RUN_TIME_STATS 0
```
设置为1，开启时间统计，对应功能的API也会被编译

时间统计的频率至少是节拍频率的十倍

|宏|含义|
|-|-|
|portCONFIGURE_TIMER_FOR_RUN_TIME_STATS()|用来初始化一个外设作为基础时钟|
|portGET_RUN_TIME_COUNTER_VALUE()or portALT_GET_RUN_TIME_COUNTER_VALUE(Time)|用来返回当前基础时钟的时间值|

```c
#define configUSE_TRACE_FACILITY 1
#define configUSE_STATS_FORMATTING_FUNCTIONS 1
```

这两个同时为1的时候vTaskList() 和 vTaskGetRunTimeStats()会被加入编译

为1启动了可视化跟踪调试

###### config协程相关

```c
#define configUSE_CO_ROUTINES 0
```

为1启动协程节省开销，适用于低内存的板子，但是功能有限。为0关闭协程

```c
#define configMAX_CO_ROUTINE_PRIORITIES ( 2 )
```
设置可以分配给协程的有效优先级数目，最高优先级为configMAX_CO_ROUTINE_PRIORITIES-1

###### config定时器相关

```c
#define configUSE_TIMERS 1   
```
设置为1，启用软件定时器，对应功能的API也会被编译，下面的三个宏定义也必须有。

```c
#define configTIMER_TASK_PRIORITY (configMAX_PRIORITIES-1)
```

设置软件定时器任务优先级，如果其过低，则需要等待其当前优先级为最高可执行时才会得到处理。

如果设置为最高，则会得到立即处理。而软件定时器的命令是存放在软件定时器的队列中。

```c
#define configTIMER_QUEUE_LENGTH 5
```
设置软件定时器命令的队列长度。

```c
#define configTIMER_TASK_STACK_DEPTH (configMINIMAL_STACK_SIZE*2)
```
设置定时器任务的栈空间大小

###### config中断相关

```c
#ifdef __NVIC_PRIO_BITS
	#define configPRIO_BITS       		__NVIC_PRIO_BITS
#else
	#define configPRIO_BITS       		4                  
#endif
```
这里设置是否定义了使用几位来设定优先级，如果没定义的话，默认使用4位

```c
#define configLIBRARY_LOWEST_INTERRUPT_PRIORITY	15
```

因为使用了4位，所以这里对应的最低优先级自然也就是15，这里是指硬件自身的最低优先级是多少。

我们知道STM32是越大优先级越低，FreeRTOS则是越大优先级越高，他自己为了换算优先级，所以需要知道硬件最低是多少。

```c
#define configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY	5
```
用来设置RTOS可以管理的最大优先级，其数目对应的是STM32的5优先级，也就是说0/1/2/3/4优先级的不归RTOS管理

```c
#define configKERNEL_INTERRUPT_PRIORITY (configLIBRARY_LOWEST_INTERRUPT_PRIORITY << (8 - configPRIO_BITS))
```
这里用来定义系统的滴答定时器中断的优先级，其实这里经过一些列计算然后把他们的优先级设置为最低。


```c
#define configMAX_SYSCALL_INTERRUPT_PRIORITY (configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY << (8 - configPRIO_BITS))
##### INCLUDE可选函数
```

这里经过一些计算得到了可以管理的最大优先级，进而防止板级高优先级被中断嵌套或者打断，使他们不受内核延迟的影响

##### 中断处理函数相关

```c
#define xPortPendSVHandler 	PendSV_Handler
#define vPortSVCHandler 	SVC_Handler
```
这里就是将FreeRTOS的中断函数和CMSIS中断函数映射起来而已

##### INCLUDE使能函数
```c
#define INCLUDE_xTaskGetSchedulerState          1                       
#define INCLUDE_vTaskPrioritySet		        1
#define INCLUDE_uxTaskPriorityGet		        1
#define INCLUDE_vTaskDelete				        1
#define INCLUDE_vTaskCleanUpResources	        1
#define INCLUDE_vTaskSuspend			        1
#define INCLUDE_vTaskDelayUntil			        1
#define INCLUDE_vTaskDelay				        1
#define INCLUDE_eTaskGetState			        1
#define INCLUDE_xTimerPendFunctionCall	        1
```

这里如果设置为1，则可以使用对应的函数

##### 断言相关

```c
#define vAssertCalled(char,int) printf("Error:%s,%d\r\n",char,int)
#define configASSERT(x) if((x)==0) vAssertCalled(__FILE__,__LINE__)
```
这里的断言类似于assert()函数，用于检测传入参数是否合理。

之前移植的时候，由于缺少vAssertCalled(char,int)的定义，导致编译过不去，所以暂时给屏蔽了。

那么真正使用的时候需要补充这个定义。

而一般这里的断言都是用于调试阶段的，可以用来显示发生错误的文件名和行号，如果不用调试了，那么可以关闭断言，减少开销，加快速度。

当然这里可以随你的想法来定义vAssertCalled函数。

## Quote

> http://blog.csdn.net/zhzht19861011/article/details/7745151
> 
> http://www.openedv.com/thread-77593-1-1.html
> 
> http://www.openedv.com/thread-85247-1-1.html
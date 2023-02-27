---
layout:     post
title:      "Tracealyzer FreeRTOS"
subtitle:   "FreeRTOS，Trace，setup"
date:       2020-03-14
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.jpg"
catalog:    true
tags:
    - FreeRTOS
    - Trace
    - Embedded
---

## Foreword

最近要用到Tracealyzer来分析一下当前FreeRTOS中的一些平常看不见的bug，之前已经遇到过sd卡随机延迟，几分钟才能触发一次，导致buffer缓冲不足，进而造成部分进程被阻塞，就从查了好久才搞清楚。

## 环境

- Tracealyzer4.3.5版本
- FreeRTOS 9.0
- STM32F767
- Windows

## 准备工作

需要的文件基本都在这个目录下

```
Tracealyzer 4\FreeRTOS\TraceRecorder
```

## 修改工程

1.将TraceRecorder目录下的源文件都加到工程中

```
trcKernelPort.c
trcSnapshotRecorder.c
trcStreamingRecorder.c
/include/中的所有文件
/config/中的所有文件
/streamports/Jlink_RTT/中的所有文件
 /streamports/Jlink_RTT/include/中的所有文件
```

2.修改trcConfig.h，左图是修改后的，右图是原生的

![](https://img.elmagnifico.tech/static/upload/elmagnifico/gaePLmTkGxriEdX.png)



加入库的头文件引用

```
#include "stm32f7xx.h"
```

设置实际硬件的内核构架,不同的架构在trcPortDefines.h中有显示

```
#define TRC_CFG_HARDWARE_PORT TRC_HARDWARE_PORT_ARM_Cortex_M
```

设置要用的模式，主要就是流模式和快照模式，这里使用流模式

```
#define TRC_CFG_RECORDER_MODE TRC_RECORDER_MODE_STREAMING
```

配置一下FreeRTOS的版本

```
#define TRC_CFG_FREERTOS_VERSION TRC_FREERTOS_VERSION_9_0_0
```

打开FreeRTOSConfig.h中的trace选项

```
#define configUSE_TRACE_FACILITY 1
#if(configUSE_TRACE_FACILITY == 1)
	#include "trcRecorder.h"
#endif
```

在系统启动以前开启trace

```
如果这里使用TRC_INIT会把系统挂起，直到收到了启动命令才会正常跑
vTraceEnable(TRC_INIT);
如果使用TRC_START，系统可以正常启动， Tracealyzer可以随时接入进去，不过可能系统一启动的部分信息记录不到而已
vTraceEnable(TRC_START);
```

弄完以后就可以编译了，有错解错，没错就可以尝试开启Tracealyzer看效果了

## 自定义信息通道

简单说就是注册一个通道，然后把你要发的内容通过这个通道发出去。

```
traceString chn = xTraceRegisterString("MyChannel"); 

vTracePrint(chn, "Hello World!"); 
vTracePrintF(chn, "Value: %d", myValue);
```

## 中断trace

默认情况下，trace是追不到系统的硬件中断，但是你可以手动添加中断的trace信息

中断稍微复杂一点，需要提前注册好中断信息，然后在中断中加上头尾信息

```
先要在中断注册运行之前，注册一下中断信息
#define PRIO_ISR_TIMER1 3 /* the hardware priority level */ 
traceHandle Timer1Handle = xTraceSetISRProperties("ISRTimer1", PRIO_ISR_TIMER1); 

然后在中断的开头和结尾加上vTraceStoreISRBegin和vTraceStoreISREnd
void ISR_handler(void)
{ 
    signed BaseType_t xHigherPriorityTaskWoken;
    vTraceStoreISRBegin(Timer1Handle); 

    /* Wakes up a pending task, causing a task-switch. */
    xSemaphoreGiveFromISR(xSemaphore, &xHigherPriorityTaskWoken); 

    vTraceStoreISREnd(xHigherPriorityTaskWoken); 
}
```

## Tracealyzer中使用jlink

首先设置成SEGGER RTT

![](https://img.elmagnifico.tech/static/upload/elmagnifico/2dzSv9LWGqlxwFn.png)

配置jlink，由于是流模式jlink的速度尽量高一些，太低的话数据流大了直接卡崩了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/YMDt5xGdjCr6yvK.png)

然后就能开启流模式，体验Tracealyzer了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3CqIQhSFe4DH1zR.png)

## End

基本和官方教程一样



## Quote

> https://percepio.com/gettingstarted-freertos/





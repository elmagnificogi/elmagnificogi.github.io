---
layout:     post
title:      "FreeRTOS移植到STM32F767"
subtitle:   "嵌入式，FreeRTOS，STM32F767"
date:       2017-03-15
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
---

## 移植FreeRTOS到STM32F767


#### 环境

编译环境：keil

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

#### 第一步.获取源码

首先是要下载源码：

> http://www.freertos.org/a00104.html 

解压出来以后，先介绍一下源码的目录结构

- FreeRTOS/source中是内核代码
- FreeRTOS/demo中是对各厂商各种板的移植好的demo(可能有你想要的)
- FreeRTOS-Plus中是含有FreeRTOS额外的部件以及第三方开发的开源部件
- FreeRTOS-Plus/Demo 自然就是增加了这些组件的demo了，多数demo都是运行在FreeRTOS windows simulator模拟器上的
- */License 中就是各种开源的License

STM32F767没有特别符合的demo，所以就自己新建一个。

那么主要的文件自然来源于FreeRTOS/source中了。

- FreeRTOS/Source中的list.c, queue.c and tasks.c 是整个内核共用的文件，也是最基础的队列，任务调度，链表，三个文件。
- FreeRTOS/Source中的timers.c，event_groups.c，croutine.c 分别是软件定时器，时间驱动管理，协程(功能可选配置文件，用于内存比较低的硬件)
- FreeRTOS/Source/include中就是对应的各种头文件
- FreeRTOS/Source/portable中是各种平台相关的文件，有的是可以不要的，但是./MemMang中是内存分配堆的文件，很重要不能删。
- ./Keil中要求我们去查看./RVDS
- ./RVDS中则是与ARM构架相关的文件了，明显我们这里用的M7，所以其他的文件就可以不用了。

到这里基本就确定了我们需要什么样的文件。

- FreeRTOS/Source/
- FreeRTOS/Source/include
- FreeRTOS/Source/portable/MemMang
- FreeRTOS/Source/portable/RVDS/ARM_CM7

基本最多需要这些源文件

其实上面还少一个文件，我后面进行到第二步的时候发现少了一个配置文件。

	#include "FreeRTOSConfig.h"

所以这里需要你再取一个跟你配置最接近的demo中的文件

- FreeRTOS\Demo\CORTEX_M7_STM32F7_STM32756G-EVAL_IAR_Keil\FreeRTOSConfig.h

这里就选择了最接近的STM32F756的配置文件。

这里我们先不管这个配置文件内容是什么，先复制过来而已

#### 第二步.建立工程

拿一个现成的工程模板，这里我用的是原点的工程模板

将上面的源码加入文件

将上面的头文件加入引索目录

> 10.关于float类型
在keil中,在不选择"Optimize for time"编译选项时,局部float变量占用8个字节(编译器默认自动扩展成double类型),如果你从Flash中读取一个float类型常量并放在局部float型变量中时,有可能发生意想不到的错误:Cortex-M3中可能会出现硬fault.因为字节对齐问题.
但有趣的是,一旦你使用"Optimize for time"编译选项,局部float变量只会占用4个字节

所以工程设置中需要勾选 Optimize for time

第一次编译前，还需要修改一个文件stm32f7xx_it.c

将下面的三个中断接口函数注释了

void SysTick_Handler(void)
void PendSV_Handler(void)
void SVC_Handler(void)

因为引入了FreeRTOS，不注释了会出现重定义的情况。

现在进行编译，还无法通过，因为FreeRTOSConfig.h文件还有问题，需要修改以后才能继续。

## Quote

> http://blog.csdn.net/zhzht19861011/article/details/7745151
> 
> http://www.openedv.com/thread-77593-1-1.html
> 
> http://www.openedv.com/thread-85247-1-1.html
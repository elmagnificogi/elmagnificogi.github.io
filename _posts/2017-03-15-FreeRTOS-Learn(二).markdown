---
layout:     post
title:      "FreeRTOS学习(二)"
subtitle:   "嵌入式，FreeRTOS，学习"
date:       2017-03-15
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
---

## 嵌入式操作系统

学习之前先了解一下，目前市面上都有些啥嵌入式操作系统

#### embOS

> embOS is a priority-controlled real time operating system, designed to be used as foundation for the development of embedded real-time applications. It is a zero interrupt latency, high-performance RTOS that has been optimized for minimum memory consumption in both RAM and ROM, as well as high speed and versatility.
> 
> Throughout the development process of embOS, the limited resources of microcontrollers have always been kept in mind. The internal structure of embOS has been optimized in a variety of applications with different customers, to fit the needs of different industries.
> 
> embOS is fully source-compatible on different platforms (8/16/32 bits), making it easy to port applications to different CPUs. Its highly modular structure ensures that only the functions needed are linked, keeping the ROM size very small. Tasks can easily be created and safely communicate with each other using the complete panoply of communication mechanisms such as semaphores, mailboxes, and events. Interrupt Service Routines (ISRs) can also take advantage of these communication mechanisms. 

简单说 embOS 最大的优势就是需要FLASH和RAM都非常小，很多上不了系统的板子也能上。

下面是其官网，当然也是收费的，试用版本是看不到源码的,这个系统是J-link的亲儿子

> https://www.segger.com/embos.html

#### RL-RTX

> The RTX kernel is a real time operating system (RTOS) that enables you to create applications that simultaneously perform multiple functions or tasks. This is very useful in embedded applications. While it is certainly possible to create real-time programs without an RTOS (by executing one or more tasks in a loop), there are numerous scheduling, maintenance, and timing issues that an RTOS like RTX can solve for you.
> 
> An RTOS enables flexible scheduling of system resources like CPU and memory, and offers ways to communicate between tasks. The RTX kernel is a powerful RTOS that is easy to use and works with microcontrollers that are based on the ARM7™TDMI, ARM9™, or Cortex™-M3 CPU core.
RTX programs are written using standard C constructs and compiled with the RealView® Compiler. The RTX.H header file defines the RTX functions and macros that allow you to easily declare tasks and access all RTOS features.
> http://www.keil.com/support/man/docs/rlarm/rlarm_ar_artxarm.htm

RL-RTX是ARM的亲儿子，想也知道肯定对自家的板子支持特别好。

#### uC/OS

> uC/OS-III(Micro C OS Three 微型的C 语言编写的操作系统第3版)是一个可升级的，可固化的，基于优先级的实时内核。它对任务的个数无限制。uC/OS-III 是第3代的系统内核，支持现代的实时内核所期待的大部分功能。例如资源管理，同步，任务间的通信等等。然而，uC/OS-III 提供的特色功能在其它的实时内核中是找不到的，比如说完备的运行时间测量性能，直接地发送信号或者消息到任务，任务可以同时等待多个内核对象等。

一般都喊做uCOS了，其中文资料特别多，当然它如果商用也是收费的，但是国内用的特别多，所以各种问题也都能及时得到解决。

#### FreeRTOS

> 作为一个轻量级的操作系统，FreeRTOS 提供的功能包括：任务管理、时间管理、信号量、消息队列、内存管理、记录功能等，可基本满足较小系统的需要。由于RTOS需占用一定的系统资源(尤其是RAM资源)，只有μC/OS、embOS、salvo、FreeRTOS等少数实时操作系统能在小RAM单片机上运行。相对μC/OS、embOS等商业操作系统，FreeRTOS操作系统是完全免费的操作系统，具有源码公开、可移植、可裁减、调度策略灵活的特点，可以方便地移植到各种单片机上运行。
> 
> http://www.freertos.org/index.html

想也不用想，为什么选择FreeRTOS了，就是因为它是免费的，而且开源，当前也算是比较火，虽然其操作系统附带的其他子系统较少，但是都是能移植过去的，而且官方也有给相应的例程。

#### RT-Thread OS

> RT-Thread是一款来自中国的开源嵌入式实时操作系统，由国内一些专业开发人员从2006年开始开发、维护，除了类似FreeRTOS和UCOS的实时操作系统内核外，也包括一系列应用组件和驱动框架，如TCP/IP协议栈，虚拟文件系统，POSIX接口，图形用户界面，FreeModbus主从协议栈，CAN框架，动态模块等，因为系统稳定，功能丰富的特性被广泛用于新能源，电网，风机等高可靠性行业和设备上，已经被验证是一款高可靠的实时操作系统。
> 
> RT-Thread实时操作系统遵循GPLv2+许可证，实时操作系统内核及所有开源组件可以免费在商业产品中使用，不需要公布应用源码，没有任何潜在商业风险。
> http://www.rt-thread.org/

这个是以前匿名四轴用了这么个操作系统才知道的，看它的使用案例就知道，非常小众，使用的也是很小的公司和个人而已。

维护上什么的也是相对较为简单的，跟上面的操作系统不具有竞争力吧。


## 对比

这么多操作系统，总有人喜欢对比一下优劣，以下所有对比都是引用

>　　一、freeRTOS比uCOS II优胜的地方：
>　　
　　1.内核ROM和耗费RAM都比uCOS 小，特别是RAM。 这在单片机里面是稀缺资源，uCOS至少要5K以上， 而freeOS用2~3K也可以跑的很好。
　　2.freeRTOS 可以用协程（Co-routine），减少RAM消耗（共用STACK）。uCOS只能用任务（TASK，每个任务有一个独立的STACK）。
　　3.freeRTOS 可以有优先度一样的任务，这些任务是按时间片来轮流处理，uCOSII 每个任务都只有一个独一无二的优先级。因此，理论上讲，freeRTOS 可以管理超过64个任务，而uCOS只能管理64个。
　　4.freeRTOS 是在商业上免费应用。uCOS在商业上的应用是要付钱的。
>
>　　二、freeRTOS 不如uCOS的地方：
　　1.比uSOS简单，任务间通讯freeRTOS只支持Queque， Semaphores， Mutex。 uCOS除这些外，还支持Flag, MailBox.
　　2.uCOS的支持比freeRTOS 多。除操作系统外，freeRTOS只支持TCPIP， uCOS则有大量外延支持，比如FS， USB， GUI， CAN等的支持3。uCOS可靠性更高，而且耐优化，freeRTOS 在我设置成中等优化的时候，就会出问题。

其实这个对比已经有点过时了，看上面uCOSIII的介绍就知道，那几个和freeRTOS不同的地方基本都相同了，唯一区别也就是商业化的问题了。

#### FLASH和RAM的需求对比

|      | RTX        | uCOS-II |FreeRTOS  |embOS     |uCOS-III  |
|------|------------|---------|----------|----------|----------|
|FLASH | <4.0 Kbytes|6K----26K|6K --- 10K|1.1K - 1.6K|6K----24K | 
|      |(Code Space)|(code footprint)|(ROM footprint )|(kernel)|(code footprint)| 
|RAM   |300bytes +128bytes|1K+|没找到|18-50bytes|1K+|
|      |(kernel)|(ram footprint)|没找到|(kernel)|(ram footprint)|

#### 实时性对比

这里提供一组实时性测试方面的数据，通过任务主动释放CPU权利来测试任务的切换速度

测试条件 ：

- STM32F103VET6，Cortex-M3内核，72Mhz，
- 软件用的MDK4.54,  1级优化。
- 测试10000次，2ms测试一次，然后求平均

|OS|版本|切换时间|
|---|---|---|
|RTX|V4.5|252个时钟周期|
|uCOS-II|V2.92.07|354个时钟周期|
|embOS|V3.86|389个时钟周期|
|FreeRTOS|V7.4.2|514个时钟周期（可能是这种测试方法对这个OS不太适合，另一个时间切换的时间是374个时钟周期）|
|uCOS-III|V3.03.01 |576个时钟周期|

#### 安全性对比

安全性的对比，比较的麻烦些，这里提供一下各个OS的安全认证

貌似FreeRTOS, embOS和RTX没有安全方面的认证

FreeRTOS的另一个版本SafeRTOS有安全方面的认证

## Quote

> http://bbs.armfly.com/read.php?tid=1531
> 
> http://blog.csdn.net/Airbnb/article/details/41248459
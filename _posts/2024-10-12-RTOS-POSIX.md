---
layout:     post
title:      "RTOS对比"
subtitle:   "操作系统"
date:       2024-10-16
update:     2024-12-20
author:     "elmagnifico"
header-img: "img/y8.jpg"
catalog:    true
tobecontinued: false
tags:
    - RTOS
---

## Foreword

总结一下嵌入式的小型RTOS，对比一下异同和近年的发展情况



## NuttX

> https://nuttx.apache.org/



![banner](https://img.elmagnifico.tech/static/upload/elmagnifico/202410121635542.png)

- 这里的Vela是小米基于NuttX的改进版本

NuttX的系统架构，从纵向看，NuttX和传统操作系统一样由调度子系统、文件子系统、网络子系统、图形子系统和驱动子系统组成。从横向看，NuttX向上给应用程序提供了POSIX和ANSI定义的标准C/C++接口。对于没有标准化的组件（比如各种外设），NuttX通常会提供兼容Linux的API。向下NuttX定义了Arch API、块设备驱动接口、网卡驱动接口、display驱动接口，以及各种总线和外设的lower half驱动接口，使得芯片厂商能够规范、快速地完成移植工作。上图中数量众多的蓝色模块就是NuttX实现的各种功能。

NuttX可以通过配置选择需要的组件虽然NuttX实现了传统操作系统的所有功能，但是最终生成的代码尺寸还是可以很小（最小配置不到32KB，最大配置不超过256KB）

- 其实32KB已经有点大了，很多更小的芯片已经有些放不下了



## Zephyr

> https://zephyrproject.org/

Zephyr操作系统基于小型内核，设计用于资源受限的嵌入式系统：从简单的嵌入式环境传感器和 LED 可穿戴设备到复杂的嵌入式控制器、智能手表和物联网无线应用。

![Zephyr 会成为物联网时代RTOS的佼佼者？_zephyr_03](https://img.elmagnifico.tech/static/upload/elmagnifico/202410161813907.png)

Zephyr 在IOT上面使用的比NuttX还要广泛一些，蓝牙类的使用比较广泛



## ChibiOS

> https://www.chibios.org/dokuwiki/doku.php

ChibiOS/RT是为8，16和32位微控制器设计的，ChibiOS/RT的小型内核支持：

- 抢占性多任务
- 128个优先级
- 同优先级线程按照时间片轮转调度
- 软件定时器
- 计数信号量
- 支持优先级继承的自旋锁
- 同步和异步信息，以及消息队列
- 事件标志和处理函数
- 支持的同步I/O和带超时的异步I/O
- 线程安全的堆或内存池分配器
- 支持多种底层硬件的硬件抽象层
- 支持lwIP和uIP协议栈
- 支持FatFS文件系统

所有的系统对象，比如线程、信号量等都能在运行时创建或者删除。除了可用内存的限制之外没有内核对象创建数量上限。为了增强可靠性，整个内核本身是静态编译的，并且不需要一个动态内存分配器；内核中也没有表或者数组的上限。

ChibiOS 稍微有点老，跟不上时代。ChibiOS是内置了自己的HAL层，需要硬件去适配他的接口，也内置了一些驱动模型，接口适配以后可以直接调用

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202410161841736.png)

目前主要是Ardupilot在用ChibiOS



## RT-Thread

> https://www.rt-thread.org/

RT-Thread 主要采用 C 语言编写，浅显易懂，方便移植。它把面向对象的设计方法应用到实时系统设计中，使得代码风格优雅、架构清晰、系统模块化并且可裁剪性非常好。针对资源受限的微控制器（MCU）系统，可通过方便易用的工具，裁剪出仅需要 3KB Flash、1.2KB RAM 内存资源的 NANO 版本（NANO 是 RT-Thread 官方于 2017 年 7 月份发布的一个极简版内核)；而对于资源丰富的物联网设备，RT-Thread 又能使用在线的软件包管理工具，配合系统配置工具实现直观快速地模块化裁剪，无缝地导入丰富的软件功能包，实现类似 Android 的图形界面及触摸滑动效果、智能语音交互效果等复杂功能

![RT-Thread 软件框架图](https://img.elmagnifico.tech/static/upload/elmagnifico/202410161909246.png)

最初的RT-Thread是对标FreeRTOS的，很多东西都写的非常像

目前来看RT-Thread在原来的生态位上干不过FreeRTOS，现在扩展了适用范围，有点想对标Zephyr

甚至RT-Thread还在原先的标准上又套了一层给做二次三次开发的使用，弄出来了一个RT-Thread Smart 的架构

![image-20241016192332477](https://img.elmagnifico.tech/static/upload/elmagnifico/202410161923555.png)

RT-Thread本身也使用了I/O设备的管理和驱动模型

![image-20241016193711892](https://img.elmagnifico.tech/static/upload/elmagnifico/202410161937963.png)



## FreeRTOS

FreeRTOS目前被Amazon接管

![image-20241206170202630](https://img.elmagnifico.tech/static/upload/elmagnifico/202412061702681.png)

FreeRTOS目前也有几个不同的版本，TCP顾名思义有了TCP/IP协议栈，主要是给物联网应用使用的。CLI则是一些外部模块，通过命令行控制的，Plus-IO，这个就升级到了统一应用层和硬件层接口的版本，各有各的好处，不知道有没有一个综合版本

除了三个版本的RTOS，还有很多相关Lab和Core库，比较好的是这些Core完全不依赖FreeRTOS，用于其他操作系统也是一样的

Lab库中相关性就高一些，但是有了POSIX的接口、FAT、统一的Boot等等



## 其他概念

#### POSIX

![image-20241012112743077](https://img.elmagnifico.tech/static/upload/elmagnifico/202410121127146.png)

当年操作系统百花齐放的年代，每个系统的接口各不相同，导致同一套代码要在不同系统上使用，就得兼容各种各样的系统接口，这样对于应用来说过于复杂了。

POSIX就定义了一个标准，应用层调用同一个接口就行了，比如print，malloc，socket等等

标准库只是提供了一个接口层，至于下面到了系统是怎么实现的，那就是系统的事情了。

在嵌入式这边大部分情况下是没有这个POSIX，很多print也是调用了标准库函数，但是下面重写了类似fput之类的接口，将其直接转向了硬件接口，从而完成了输出。

POSIX更注重的是在操作系统方面保持一致，而不是具体

#### ANSI

还有一个ANSI类似于POSIX，后期改名叫ISO。 这两个标准对应到语言就变成了常见的 ANSI C、POSIX C标准



#### BusyBox

Busybox是一个开源项目，遵循GPL v2协议。Busybox将众多的UNIX命令集合进一个很小的可执行程序中，可以用来替代GNU fileutils、shellutils等工具集。Busybox中各种命令与相应的GNU工具相比，所能提供的选项比较少，但是也足够一般的应用了。Busybox主要用于嵌入式系统。

Busybox在编写过程中对文件大小进行了优化，并考虑了系统资源有限(比如内存等)的情况。与一般的GNU工具集动辄几M的体积相比，动态链接的Busybox只有几百K，即使是采用静态链接也只有1M左右。Busybox按模块设计，可以很容易地加入、去除某些命令，或增减命令的某些选项。

在创建根文件系统的时候，如果使用Busybox的话，只需要在/dev目录下创建必要的设备节点，在/etc目录下增加一些配置文件即可，当然，如果Busybox使用动态链接，那么还需要再/lib目录下包含库文件。


Busybox虽然已经小到1M多，但是还是有点大，如果能更小就更好了



## Summary

后续可能还会对各个系统更深入体验，看他们的架构是如何搭建起来的



## Quote

> https://iot.mi.com/vela/detail.html
>
> https://wiki.seeedstudio.com/cnXIAO-SAMD21-Zephyr-RTOS/
>
> https://blog.csdn.net/cnzzs/article/details/140409697
>
> https://freertos.org/zh-cn-cmn-s/Documentation/01-FreeRTOS-quick-start/01-Beginners-guide/00-Overview

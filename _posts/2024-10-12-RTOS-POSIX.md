---
layout:     post
title:      "POSIX"
subtitle:   "操作系统"
date:       2024-10-27
update:     2024-10-27
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

Zephyr操作系统基于小型内核，设计用于资源受限的嵌入式系统：从简单的嵌入式环境传感器和 LED 可穿戴设备到复杂的嵌入式控制器、智能手表和物联网无线应用。



Zephyr 在IOT上面使用的比NuttX还要广泛一些，蓝牙类的使用比较广泛



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

 



## Summary



## Quote

> https://iot.mi.com/vela/detail.html
>
> https://wiki.seeedstudio.com/cnXIAO-SAMD21-Zephyr-RTOS/

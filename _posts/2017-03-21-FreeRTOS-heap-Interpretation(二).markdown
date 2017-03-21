---
layout:     post
title:      "FreeRTOS中heap源文件分析(二)"
subtitle:   "嵌入式，FreeRTOS，heap"
date:       2017-03-21
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
    - FreeRTOS
---

## heap源文件分析

heap_2与heap_1不同，它使用最佳匹配算法，会选择最合适的内存大小来分配，但是他不会合并相邻的空闲内存，造成的后果自然就是会有内存碎片，或者说内存碎片多的情况下，可能造成无法分配的情况。

### heap_2功能简介

- heap_2可以释放内存，可以用于重复的分配和删除具有相同堆栈空间的任务、队列、信号量、互斥量等等，并且不考虑内存碎片的应用程序。
- 不能用在分配和释放随机字节堆栈空间的应用程序，以及较高频率的不同内存空间释放。
  - 如果一个应用程序动态的创建和删除任务，并且分配给任务的堆栈空间总是同样大小，那么大多数情况下heap_2.c是可以使用的。但是，如果分配给任务的堆栈不总是相等，那么释放的有效内存可能碎片化，形成很多小的内存块。最后会因为没有足够大的连续堆栈空间而造成内存分配失败。在这种情况下，heap_4.c是一个更好的选择。

  - 应用程序直接调用pvPortMalloc() 和 vPortFree()函数，而不仅是通过FreeRTOS API间接调用。

- 如果你的应用程序中的队列、任务、信号量、互斥量等等处在一个不可预料的顺序，则可能会导致内存碎片问题，虽然这是小概率事件，但必须要注意。

- 不具有确定性，但是它比标准库中的malloc函数具有高得多的效率。

heap_2.c适用于需要动态创建任务的大多数小型实时系统（smallreal time）。

#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

## 注释



#### 



## 总结



## Quote

> heap_1.c
> 
> http://blog.csdn.net/zhzht19861011/article/details/50248421
> 
> http://blog.csdn.net/zhzht19861011/article/details/51606068
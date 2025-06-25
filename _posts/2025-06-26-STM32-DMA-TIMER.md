---
layout:     post
title:      "STM32 DMA数据丢失"
subtitle:   "Cursor，PWM，Bidir-DSHOT，Timer"
date:       2025-06-26
update:     2025-06-26
author:     "elmagnifico"
header-img: "img/welding.jpg"
catalog:    true
tobecontinued: false
tags:
    - STM32
---

## Foreword

STM32 DMA数据丢失，这个问题还挺常见的，之前我也遇到了，不过由于只是首数据丢一个字节的数据，对于整体不是很大影响，所以没在意这个事情，放过去了

之前遇到的"DMA PWM输出第一个bit bug"

> https://elmagnifico.tech/2020/06/03/Dshot-STM32-PWM-HAL/



## DMA

这次这个问题变得很严重了，每次数据传输都有比较大的概率丢一个bit的DMA数据，很是奇怪。还有一个小现象，似乎电压波动更大一点，丢的概率就更大一些，这个现象一度让我以为是电源问题，想丢给硬件去解决。



不过后面仔细看了一下现象，怀疑了一下问题发生的点，后续还是软件解决了。



#### 问题情景

还是发生在Bidir-DSHOT中，由于每次数据发送需要接收返回的内容，所以Timer 触发 GPIO的DMA并不是循环模式，而是单次模式，工作完成以后切回GPIO Input模式等待接收，收完再切回输出，以此循环

> https://elmagnifico.tech/2023/04/07/bi-directional-DSHOT/

相当于每次DMA传输都是首次DMA，这个首次发生数据丢失，这个数据本应该是0的，输出却是1，而后面的数据都是正确的，这个概率还不低，会直接影响到接收方的电调识别，导致这次的Telemetry无法返回。



#### 方案一

由于Bidir-DSHOT的特殊性，驱动中传输结尾本身就会发送一些没用占位符，那么同理，我们可以在传输前也发一些占位符，让首bit出错，出现在没用的地方，不影响后续电调的识别。

Bidir-DSHOT的波形本身也比较特殊，空闲时是高电平，那么基于此只要在DMA传输开始前先传输3个字节的高电平信号，再开始真正的

数据传输，那就可以了。

这个方案是最简单的，改动几个数组就行了



#### 方案二

也是突然灵机一动，想到这个DMA和Timer有一些特殊性，是不是二者的时间没有对齐导致的。

Timer启动，理论上第一次启动就立马会触发DMA搬运一次数据，但是如果此时DMA没有启动呢？所以DMA错过了一个bit的数据，下次Timer再次触发，此时给到DMA的搬运序号就递增了，那么DMA就开始搬运第二个数据，这个流程如果猜想正确，那么就完美符合我们当前的现象。

这个验证也比较简单，估计在DMA和Timer启动之间加一点延迟，让DMA启动延迟大一些。实际看到，确实可以造成100%的数据丢失，延迟足够大甚至有可能丢更多。

那么解决起来也比较简单，先让DMA启动，在确认启动的情况下，再去启动Timer，避免二者有配合间隙，实测后，DMA丢数据的情况基本消失了。



## Summary

我的突发奇想，也同时让Cursor去解决了一下，Cursor给的解决方案基本和我的想法一致，他两种方案同时都做了

![image-20250625232936283](https://img.elmagnifico.tech/static/upload/elmagnifico/202506252329384.png)

说明这个问题还是经常有人遇到的，之前放过去了属实不该

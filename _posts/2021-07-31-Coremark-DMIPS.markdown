---
layout:     post
title:      "单片机跑分"
subtitle:   "ST，GD，Coremark，DMIPS"
date:       2021-07-31
update:     2021-07-31
author:     "elmagnifico"
header-img: "img/cap-head-bg2.jpg"
catalog:    true
mathjax:    false
tags:
    - 嵌入式
---

## Foreword

平常桌面cpu或者gpu天梯跑分见多了，什么3dmark，Cinebench 之类的。其实嵌入式系统中常用的单片机也有跑分测试。现在比较多见的就是Coremark

> https://www.eembc.org/coremark/



## Coremark

​		`CoreMark`是由[EEMBC](http://www.eembc.org/)`(Embedded Microprocessor Benchmark Consortium)`的`Shay Gla-On`于`2009`年提出的一项基准测试程序，`CoreMark`的主要目标是简化操作，并提供一套测试**单核处理器核心**的方法。测试标准是在配置参数的组合下单位时间内运行的`CoreMark`程序次数（单位：`CoreMark/MHz`），该数字值越大则说明测试的性能越好。实际上现在也支持多核并行测试了。
  目前在嵌入式`CPU`行业中普遍公认的性能测试指标的标准主要使用以下三种，`MIPS`、`Dhrystone`、`Coremark`，而`CoreMark`与`Dhrystone`一样，拥有体积小、方便移植、易于理解、免费并且显示单个数字基准分数。与`Dhrystone`不同的是，`Dhrystone`的主要部分实际上暴露了编译器优化工作负载的能力，而不是实际[MCU](https://baike.baidu.com/item/MCU/62773)或[CPU](https://baike.baidu.com/item/中央处理器/284033)的能力，而`CoreMark`具有特定的运行和报告规则，从而可以避免由于所使用的编译库不同而导致的测试结果难以比较。

比如在Coremark官网上可以看到，一些板子的跑分详情，有一些是网友提供的，打勾的基本就算官方认证跑分了。

> https://www.eembc.org/coremark/scores.php

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/JT6Usb9iFPln5v4.png)

而现在基本新出的芯片大部分都会在详情页上标注自己的跑分

比如，GDF450是673分

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/OdI8EVhtDHCQmi3.png)



STMF429是608分

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/KiYO5wfhqr1etIj.png)



STMF743是2424分，F767大概1200分左右

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/YlWvtpEFTNaMmf9.png)

### 局限

#### 缺少浮点运算

CoreMark是一个综合基准，用于测量嵌入式系统中使用的中央处理器(CPU)的性能。它是在2009由eembc的shay gal-on开发的，旨在成为一个行业标准，取代过时的dehrystone基准。代码用C编写，包含以下算法：列表处理(增删改查和排序)、矩阵操作(公共矩阵操作)、状态机(确定输入流是否包含有效数字)和CRC。

它主要跑的就是这三个，而这3个基本涉及到的只有整数运算，所以衡量的也基本是mcu的基本指令集的运行情况，至于浮点运算这种，就完全不能衡量了。



CoreMark 也有浮点类型的测试，不过这个就是**CoreMark-Pro**了，不过这个就不是普通单片机就能运行的，大部分单片机应该都不适合了。



#### 缺少中断响应

单片机最主要的就是这个实时性，与此紧密相关的就是中断了。虽然不同单片机外设不同，但是对中断的响应非常重要，特别是某些单片机在高频采样或者负载较多的情况下，这个时候中断响应的速率就非常关键了。而由于单片机种类繁多，各种外设不同，中断不同，导致难以有一致的测试标准。但是光看一个CoreMark不足以评估中断响应是否能够来得及。



#### 缺少功耗评估

实际上小的MCU大部分都需要看功耗的，而CoreMark中不能体现功耗，类似于英特尔最近的发布会，将会以每瓦性能来评估工艺。



#### 运行位置

众所周知，一般直接把程序加载到sram里运行是比flash中直接运行要快的，而CoreMark中的评分中也带有对应运行位置的标记



#### 编译器有影响

CoreMark说是让编译环境没影响，但是实际上很难做到，嵌入式的编译环境各自不同，最终导致的实际执行效率也略有区别。这也是为啥排行榜的时候都带编译环境



#### 架构级的领先

架构上的领先，从跑分中也无法体现出来。特别是M7带Cache和不带Cache的M4，看起来跑分差距不大，实际应用的时候就会发现差距特别大。整体运行效率可能相差接近10倍。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/IiQZKgL4RAYXpHl.png)



## Summary

所以不要盲目的以跑分作为评估的基础，还是要拿个开发板测试一下看。



## Quote

>https://www.cnblogs.com/ImagineMiracle-wxn/p/CPU_CoreMark_test.html
>
>https://blog.csdn.net/l919898756/article/details/80987581
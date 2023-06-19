---
layout:     post
title:      "ArtNet协议入门"
subtitle:   "时间同步，Date，RouterOS，SNTP"
date:       2023-06-14
update:     2023-06-19
author:     "elmagnifico"
header-img: "img/y2.jpg"
catalog:    true
tobecontinued: false
tags:
    - Music
    - DMX512
---

## Foreword

众所周知DMX512由于是串行信号，本身传输不远，所以为了解决更远距离的灯光同步控制，所以需要更新的协议来完成

> https://elmagnifico.tech/2021/01/15/DMX512/

同时DMX512本身可以控制的灯的数量是有限的，而想要控制更多，就需要扩展协议本身了



## Art-Net

> https://art-net.org.uk/

ArtNet是一种灯光控制协议，ArtNet协议可看成传统DMX512数据与以太网数据的一座桥梁，通过支持ArtNet的设备， 将DMX512数据转成ArtNet网络数据，由于网络传输的快捷性和可连通性，ArtNet在灯光控制领域得到了广泛的应用，目前ArtNet的最新协议版本为ArtNet4。

ArtNet协议基于以太网UDP协议，所以只要可以收发UDP协议，理论上就能收发ArtNet协议，这比DMX512的实用性更广。



ArtNet 一代，包含有40个域，而一个域包含512个通道，每个通道包含256个数值。

ArtNet 二代，包含了一个主网络，一个主网络下又可以拥有16个子网络，一个子网络包含16个域。

ArtNet 三代，直接扩展了主网络，一共可以拥有128个主网络了。

ArtNet 四代，对整体进行扩展，并且向前兼容各个版本。

![image-20230614172233940](https://img.elmagnifico.tech/static/upload/elmagnifico/202306141727578.png)



下图是ArtNet协议文档中的ArbDmx报文定义部分:

![image-20230614164714177](https://img.elmagnifico.tech/static/upload/elmagnifico/202306141647317.png)

- 报文的前8个字节是字符串”Art-Net”
- 紧接着OpCode字段要设置位16进制的5000，表示这是一个ArtDmx报文。
- 接着的ProtVerHi字段和ProtVerLo字段对应协议版本，这里按照说明分别给定数值0和14。
- Sequence字段设置为0禁止报文顺序功能。
- Physical字段目前没用。
- SubUni和Net字段指定了Universe，也就是唯一的DMX512网络号码。
- LengthHi和Length字段指定了DMX数据也就是Data字段的长度。



## sACN

![image-20230614172315029](https://img.elmagnifico.tech/static/upload/elmagnifico/202306141723113.png)



## 搭建Art-Net

需要测试Art-Net接入和输出，所以要有双向的设备

- Art-Net控制器，主要负责把DMX512转成Art-Net，之后通过网络发给其他设备
- DMX512灯光控制台，主要是发出DMX512信号，通过DMX512输入口，传给Art-Net控制器，再转发给其他设备
- LED柔性像素屏或者其他灯具+适配的电源，作为被控设备，显示控制结果



Art-Net控制器，在这里同时只能处理某一个方向的控制，要么可以输入DMX512，要么是输出DMX512，不能既要又要。

拓扑如下，这里是作为输入设备

![image-20230619103431394](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619103431394.png)

作为输出设备

![image-20230619103223137](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619103223137.png)

有了设备以后就可以接入测试，拿数据做处理了



#### 灯光控制台

简单说灯光控制台的设计原理

首先是接入具体的灯具，设置好接入口、灯具的地址和通道数，一般灯具上会有说明。灯具上也可以调整自己的地址。

然后在控制台的编辑区，对灯具第一次接入进行配接，在这里可以调试灯具的通道，看看具体效果是什么样的。

看到效果以后，就可以把此时灯具的配置存储记录，作为一个效果片段，就可以在重演区进行调用了。



灯光控制台本身也有一些现成的对于灯具控制的命令，可以直接使用，比如画圆、闪烁、流水等等常用效果



#### 灯具

帕灯，Parabolic Aluminum Reflector，染色灯，核心是通过反光杯进行照射

![image-20230619154914694](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619154914694.png)

摇头灯，一般可以x、y轴转动，可以达成追光等效果

![image-20230619155056182](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619155056182.png)

光束灯，打出明亮光束的灯，可以打非常远，聚光效果比较好

切割灯，利用内部屏蔽，达成灯光出口切割的效果，所以命名为切割灯

![image-20230619154537514](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619154537514.png)

![image-20230619154818297](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619154818297.png)



## WYSIWYG

WYSIWYG，what you see is what you get

灯光模拟软件，所见即所得，和我之前的设计思路一样



## EasyView3D

灯光模拟软件



## Summary

Art-Net都是比较小众的东西，能搜到的内容比较少，相关从业的就更少了，后续如果实际使用了再补充



## Quote

> https://zhuanlan.zhihu.com/p/403662428
>
> https://www.bilibili.com/video/av421016527

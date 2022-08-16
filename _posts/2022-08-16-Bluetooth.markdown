---
layout:     post
title:      "蓝牙学习"
subtitle:   "Bluetooth"
date:       2022-08-16
update:     2022-08-16
author:     "elmagnifico"
header-img: "img/y4.jpg"
catalog:    true
tags:
    - Bluetooth
---

## Forward

蓝牙入门学习，不太明白的地方还是比较多的



## 历史

第一代蓝牙：关于短距离通讯早期的探索，使用的是BR（Basic Rate）技术，此时蓝牙的理论传输速率，只能达到721.2Kbps。1.1版本定义了蓝牙的物理层（PHY）和媒体访问控制（MAC）规范，之后1.2版本则是增加了硬件地址屏蔽、自适应跳频、快速链接等功能。

第二代蓝牙：2.0新增的 EDR（Enhanced Data Rate）技术，使得蓝牙设备的传输率可达 3Mbps。同时蓝牙可以连接多设备，并且同时双工工作了。2.1版本则是优化了通讯间隔从而节省电量，支持NFC通讯，从而可以实现蓝牙快速配对。
第三代蓝牙：3.0核心是 AMP（Generic Alternate MAC/PHY），这是一种全新的交替射频技术，支持动态地选择正确射频，同时Height Speed支持调用802.11 WiFi用来传输数据，速率高达 24Mbps

这里同时还有一个UCD技术，它可以单向广播无连接数据。

第四代蓝牙：主推`Low Energy`低功耗， BLE（Bluetooth Low Energy）低功耗功能，从BLE开始，蓝牙技术栈彻底发生变化，不再兼容之前的协议，BLE中分成了三种模式，高速、传统、低功耗，分别应对不同的需求。后续协议更新都是从安全性上做了一些提升。
第五代蓝牙：开启「物联网」时代大门，在低功耗模式下具备更快更远的传输能力，蓝牙加入Mesh，从而可以实现多对多的关系，进而可以自组网，并且兼容了4.0以后的协议。



## 架构

1. 单芯片解决方案，比如ESP32，CSR系列等
2. 蓝牙+MCU，各负责各的，通信靠自定义协议
3. 蓝牙host+controllor，兼容多种协议



## HCI架构

BT Controller：此部分指的是蓝牙芯片，包括BR/EDR芯片（蓝牙2.1芯片），AMP芯片（蓝牙3.0芯片），LE芯片（蓝牙4.0芯片），后续我们把4.0以下统称为传统蓝牙，4.0以上称为低功耗蓝牙

芯片层面会有2种模式，包括

单模蓝牙芯片：单一传统蓝牙芯片，单一低功耗蓝牙芯片

双模蓝牙芯片：同时支持传统蓝牙跟低功耗蓝牙的芯片

2）BT Host：蓝牙协议栈

HCI架构的蓝牙会有以下几种架构

![img](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202208161332362.png)



详细架构图

![img](https://img-blog.csdnimg.cn/20200720164649531.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1hpYW9YaWFvUGVuZ0Jv,size_16,color_FFFFFF,t_70)

## Classic

BR：Basic Rate是正宗的蓝牙技术，可以包括**可选（optional）的EDR（Enhanced Data Rate）技术，以及交替使用的（Alternate）**的MAC（Media Access Control）层和PHY层扩展（简称AMP（Alternate MAC and PHY layer extension））。

BR：最早期的蓝牙技术，速度只能达到721.2Kbps，在那个年代，已为高大上了。
EDR：随着技术的提升，使用EDR技术的蓝牙，理论速率可以达到2.1Mbps。
AMP：使用AMP技术的蓝牙，理论速率可以达到54Mbps。
AMP的Alternate交替使用体现在：由于蓝牙自身的物理层和AMP技术差异太明显，BR/EDR和AMP是不能同时使用的。

简单的说，就是：BR和EDR是可以同时存在的，但BR/EDR和AMP只能二选一


## BLE

上面所讲的BR技术的进化路线，就是传输速率的加快、加快、再加快。但能量是守恒的，你想传的更快，代价就是消耗更多的能量。而有很多的应用场景，并不关心传输速率，反而非常关心功耗。这就是Bluetooth LE（称作蓝牙低功耗）产生的背景。

从它的英文名字上就可以看出它是一种低功耗蓝牙技术，是蓝牙技术联盟设计和销售的一种个人局域网技术，旨在用于医疗保健、运动健身、信标、安防、家庭娱乐等领域的新兴应用。

低功耗蓝牙与经典蓝牙使用相同的2.4GHz无线电频率，因此双模设备可以共享同一个天线。低功耗蓝牙使用的调制系统更简单。

LE技术相比BR技术，差异非常大，或者说就是两种不同的技术，凑巧都加一个“蓝牙”的前缀而已。

目前BLE主要广泛应用于IoT产品领域。


## Summary

未完待续



## Quote

> https://github.com/espressif/esp-idf/tree/2761ad4865919693fcd02f4096711ba0fd0f6271/examples/bluetooth
>
> https://blog.csdn.net/XiaoXiaoPengBo/article/details/107462426


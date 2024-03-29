---
layout:     post
title:      "蓝牙学习"
subtitle:   "Bluetooth"
date:       2022-08-16
update:     2022-08-24
author:     "elmagnifico"
header-img: "img/y4.jpg"
catalog:    true
tags:
    - Bluetooth
---

## Foreword

蓝牙入门学习，不太明白的地方还是比较多的，所以翻看了一些蓝牙的blog，总结记录一下



## 历史

第一代蓝牙：关于短距离通讯早期的探索，使用的是BR（Basic Rate）技术，此时蓝牙的理论传输速率，只能达到721.2Kbps。1.1版本定义了蓝牙的物理层（PHY）和媒体访问控制（MAC）规范，之后1.2版本则是增加了硬件地址屏蔽、自适应跳频、快速链接等功能。

第二代蓝牙：2.0新增的 EDR（Enhanced Data Rate）技术，使得蓝牙设备的传输率可达 3Mbps。同时蓝牙可以连接多设备，并且同时双工工作了。2.1版本则是优化了通讯间隔从而节省电量，支持NFC通讯，从而可以实现蓝牙快速配对。
第三代蓝牙：3.0核心是 AMP（Generic Alternate MAC/PHY），这是一种全新的交替射频技术，支持动态地选择正确射频，同时Height Speed支持调用802.11 WiFi用来传输数据，速率高达 24Mbps

这里同时还有一个UCD技术，它可以单向广播无连接数据。

第四代蓝牙：主推`Low Energy`低功耗， BLE（Bluetooth Low Energy）低功耗功能，从BLE开始，蓝牙技术栈彻底发生变化，不再兼容之前的协议，BLE中分成了三种模式，高速、传统、低功耗，分别应对不同的需求。后续协议更新都是从安全性上做了一些提升。
第五代蓝牙：开启「物联网」时代大门，在低功耗模式下具备更快更远的传输能力，蓝牙加入Mesh，从而可以实现多对多的关系，进而可以自组网，并且兼容了4.0以后的协议。



简单说有两种模式的蓝牙，这是从协议上进行大的区分，Classic和BLE，不同的模式，导致实际应用完全不同，甚至芯片也不同。

#### Classic

BR：Basic Rate是正宗的蓝牙技术，可以包括**可选（optional）的EDR（Enhanced Data Rate）技术，以及交替使用的（Alternate）**的MAC（Media Access Control）层和PHY层扩展（简称AMP（Alternate MAC and PHY layer extension））。

BR：最早期的蓝牙技术，速度只能达到721.2Kbps，在那个年代，已为高大上了。
EDR：随着技术的提升，使用EDR技术的蓝牙，理论速率可以达到2.1Mbps。
AMP：使用AMP技术的蓝牙，理论速率可以达到54Mbps。
AMP的Alternate交替使用体现在：由于蓝牙自身的物理层和AMP技术差异太明显，BR/EDR和AMP是不能同时使用的。

简单的说，就是：BR和EDR是可以同时存在的，但BR/EDR和AMP只能二选一

#### BLE

BR技术的进化路线，就是传输速率的加快、加快、再加快。但能量是守恒的，你想传的更快，代价就是消耗更多的能量。而有很多的应用场景，并不关心传输速率，反而非常关心功耗。这就是Bluetooth LE（称作蓝牙低功耗）产生的背景。

从它的英文名字上就可以看出它是一种低功耗蓝牙技术，是蓝牙技术联盟设计和销售的一种个人局域网技术，旨在用于医疗保健、运动健身、信标、安防、家庭娱乐等领域的新兴应用。

低功耗蓝牙与经典蓝牙使用相同的2.4GHz无线电频率，因此双模设备可以共享同一个天线。低功耗蓝牙使用的调制系统更简单。

LE技术相比BR技术，差异非常大，或者说就是两种不同的技术，凑巧都加一个“蓝牙”的前缀而已，目前BLE主要广泛应用于IoT产品领域。



## 架构

1. 单芯片解决方案，比如ESP32，CSR系列等
2. 蓝牙+MCU，各负责各的，通信靠自定义协议
3. 蓝牙host+controllor，兼容多种协议。说白了就是把蓝牙拆开了，蓝牙芯片只做数据发送的部分，而主控自带了蓝牙协议栈，通过HCI来发送和接收数据然后处理，这样具体使用什么样的协议都是由主控自己决定，蓝牙芯片只管好发送就行了。



蓝牙的解决方案是多种多样的，不同架构可能不同，但是一般说的应该都是指第三种，就是Host的蓝牙协议栈+蓝牙芯片，一起组成一个完整的蓝牙。而常说的HCI，则是指协议栈和芯片之间的接口。协议栈往往也都是实现HCI的接口，所以大部分情况下都叫做了HCI。



## HCI架构

BT Controller：此部分指的是蓝牙芯片，包括BR/EDR芯片（蓝牙2.1芯片），AMP芯片（蓝牙3.0芯片），LE芯片（蓝牙4.0芯片），后续我们把4.0以下统称为传统蓝牙，4.0以上称为低功耗蓝牙

芯片层面会有2种模式，包括

单模蓝牙芯片：单一传统蓝牙芯片，单一低功耗蓝牙芯片

双模蓝牙芯片：同时支持传统蓝牙跟低功耗蓝牙的芯片

2）BT Host：蓝牙协议栈

HCI架构的蓝牙会有以下几种架构

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208161332362.png)



详细架构图

<img src="https://img.elmagnifico.tech/static/upload/elmagnifico/202208162111676.png" alt="img"  />

基于HCI的时候，总体上是APP-HOST-Transport（算是中间协议层）-HW。



#### HW

- RF是基础射频的部分，所有数据最后都需要转换成射频信号发送出去

  - BB，baseband，射频与数字或语音信号相互转化
    - LMP，链路管理层，主要是建立设备直接通信链路的
    - HCI，这里的HCI是主机控制层接口，将协议栈的各种数据转换成下面链路层的通信，以及将收到数据转换后传给上层

  - BLE PHY则是BLE的物理层
  - BLE LL 就是对应BLE的链路层

这里的BB和BLE级别就是4.0的区分的地方了



#### Transport

作为协议层，主要是提供接口给更上层，并且给下层一个统一接口。

- H2，基于USB的协议层
- H4，基于UART的协议层，H4是最简单的一种数据封装，他基本只在上面的HCI raw data前多了一个type数据，H4其实是串口带硬件流控制的串口，适合大量数据传输
- H5，也是基于UART的协议层，这种相当于是三线串口，适合小量数据传输
- BCSP，也是基于UART的协议层，三线串口，但是他主要是给存储卡使用的接口
- SDIO，基于SDIO的协议层

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208162151296.png)

HCI一共有5种数据类型

- HCI Command，命令，蓝牙协议栈控制芯片的，比如搜索、联机、取消等等
- HCI Event，蓝牙芯片上报事件给蓝牙协议栈，其实可以视作Command的回复，ACK或者是某些请求之类的东西
- HCI ACL，双向交互的普通数据
- hCI SCO，双向交互的语音类数据，部分芯片是跨越了Transport直接和HOST沟通的
- HCI ISO，LE 语音类数据



#### HOST

HOST这里就比较复杂了，HCI前面已经大概介绍了一下

- L2CAP，逻辑链路控制与适配协议，将ACL数据分组交换为便于高层应用的数据分组格式，并提供协议复用和服务质量交换等功能。通过协议多路复用、分段重组操作和组概念,向高层提供面向连接的和无连接的数据服务,L2CAP还屏蔽了低层传输协议中的很多特性，使得高层协议应用开发人员可以不必了解基层协议而进行开发



##### 经典蓝牙

- SDP，服务发现协议，服务发现协议(SDP)为应用程序提供了一种方法来发现哪些服务可用，并确定这些可用服务的特征

- RFCOMM，串口仿真协议，上层协议蓝牙电话，蓝牙透传SPP等协议都是直接走的RFCOMM

  - OBEX，对象交换协议，蓝牙电话本，蓝牙短信，文件传输等协议都是走的OBEX

    - PBAP，蓝牙电话本访问协议

    - MAP，蓝牙短信访问协议

    - OPP，对象推送协议

      

  - HFP，蓝牙免提协议，就是经典的windows蓝牙耳机可以看到Hands-Free和Stereo两种设备同时出现，其中Hands-Free就是对应的协议例子

  - HSP，早期蓝牙耳机的协议

  - SPP，蓝牙串口协议，两个蓝牙设备之间建立虚拟串口，走自定义协议,有些蓝牙串口走的就是这种方式

  - IAP，苹果的协议，IAP1和IAP2，主要是CarPlay和iPod使用的



- AVCTP，音视频控制传输协议，是AVRCP蓝牙音乐控制协议，简单说就是控制音乐启动停止上一首下一首之类的功能
- AVDTP，音频分布式传输协议，是A2DP蓝牙音乐协议的底层
- HID，人机接口协议，鼠标、键盘、手柄等等都是走这里的



##### BLE

- ATT，蓝牙属性协议，用于发现、读、写设备属性的协议，简单说属性主要是三个部分，类型、句柄、权限，主要是两个角色在其中，客户端和服务端，服务端暴露属性，让客户端访问，并且可以主动通知客户端
- GATT，通用属性协议，就是对ATT的封装
- SM，蓝牙BLE安全管理协议



这里关于BLE部分，缺少了一个GAP的说明，还是挺重要的，GAP是通用访问规范，定义了BLE设备的发现流程，设备管理和设备连接的建立，也就是说基本所有服务都需要用到它。



以上的介绍漏了一部分协议，就是3.0的AMP，由于蓝牙3.0某种程度上说其实不成熟或者说他给BLE打了个底，所以实际3.0应用比较少看到，要么是2.x，要么就是4.x起步了，3.x的反而很少。仔细看架构图，也会发现AMP直接重构了底层架构，这就导致了前期兼容了1.x和2.x的蓝牙如果要适配3.x就需要改芯片，那自然成本高了，没人弄了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208170051163.png)



##### 应用层

Bluetooth的一个很重要特性，就是所有的Bluetooth产品都无须实现全部 的Bluetooth规范，可能有的只实现了部分功能，比如部分手机根本不支持蓝牙HID。为了更容易的保持Bluetooth设备之间的兼容，Bluetooth规范中定义了Profile。Profile定义了设备如何实现一种连接或者应用，你可以把Profile理解为连接层或者应用层协。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208240045656.png)



在所有的Profile中，有四种是通用的Profile，这些Profile会被其它的Profile使用：

- GAP，用来蓝牙设备时间建立连接、匹配、搜索等基础操作和设置基础参数
- SDAP，一个Bluetooth设备可以找到其它Bluetooth设备提供的服务，以及查询相关的信息。
- SPP，能在蓝牙设备之间创建虚拟串口进行数据传输。
- GOEP，从一个设备向另一个设备传输对象的规范。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202208240043016.png)



## 蓝牙分析工具

### Btsnoop

Btsnoop用来记录蓝牙协议栈和芯片交互的数据，主要用来分析定位问题。



### 解析工具

一般Btsnoop只能记录数据，但是实际上还需要对应的解析工具来辅助查看对应的数据，可以使用`Wireshark`，也可以用`Frontline`，也可以用`Ellisys`



## 蓝牙协议栈

上面是通用的蓝牙架构，但是实际上实现的时候，各个地方可能按照标准，实现的并不一样，虽然都符合了蓝牙的规范。记录一些蓝牙比较有名的协议栈，和各种术语区分开，防止搞混



Bluedroid，Android官方的蓝牙协议栈，如果是安卓机器应该都用的是bluedroid，同时某些嵌入式硬件可能为了通用，也实现了bluedroid，比如esp32

Bluez，linux官方的蓝牙协议栈，基本上如果用linux，大部分都是用的是bluez，早期的安卓也是用的bluez，后来被替换了。

Btstack，BTstack is [BlueKitchen's](https://bluekitchen-gmbh.com/) implementation of the official Bluetooth stack. It is well suited for small, resource-constraint devices such as 8 or 16 bit embedded systems as it is highly configurable and comes with an ultra small memory footprint.Btstack，相当于是嵌入式设备常用的蓝牙协议栈，但是本身他支持跨平台，基本所有操作系统都支持。

Microsoft Bluetooth stack，不用说了，微软自家的蓝牙协议栈

BlueCove ，java的蓝牙协议栈，非常老了

NimBLE，Apache NimBLE is an open-source Bluetooth 5.1 stack (both Host & Controller) that completely replaces the proprietary SoftDevice on Nordic chipsets. It is part of [Apache Mynewt project](https://github.com/apache/mynewt-core).Nordic的蓝牙协议栈

Zephyr，RTOS，本身定位是支持蓝牙的，所以也有一套自己的蓝牙协议栈

AliOS-Things，同上，阿里的IoT操作系统，所以也有一套自己的蓝牙协议栈

可能其他xx系统也会有自己的蓝牙协议栈，就比较类似，不一一列举了。



## 蓝牙配对

这里详细区分一下，配对（paring）和绑定（bonding），配对是指两个完全陌生的蓝牙设备进行配对，而绑定则是指当他们完成一次配对以后，后续再次连接的时候如果有绑定信息，那么就可以快速完成连接，而不需要重复再走一遍配对流程。

同时很多设备一次配对以后，之后都是自动连接的，这其中也有绑定的关系。有些设备支持一对多甚至多对多，都是通过配对以后，将设备信息存储在本机（绑定），之后再进行连接的时候就直接使用。



## Summary

如果要开发蓝牙协议栈又或者是直接驱动底层蓝牙芯片可能需要对蓝牙树中的各种协议有所了解，如果不需要那么深入，只是做APP开发，知道一个大概的蓝牙框架，知道需要用什么样的协议，什么样的芯片就行了，剩下就是具体的实现细节了



## Quote

> https://github.com/espressif/esp-idf/tree/2761ad4865919693fcd02f4096711ba0fd0f6271/examples/bluetooth
>
> https://blog.csdn.net/XiaoXiaoPengBo/article/details/107462426
>
> https://www.cnblogs.com/zink623/p/15137259.html
>
> https://blog.csdn.net/m0_37618714/article/details/125404403
>
> https://www.testingcloud.club/wapi/ArticleTree/article/119/%E8%93%9D%E7%89%99%E5%8D%8F%E8%AE%AE%E6%A0%88


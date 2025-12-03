---
layout:     post
title:      "ArtNet协议入门"
subtitle:   "时间同步，Date，RouterOS，SNTP，舞台灯光，灯光设计"
date:       2023-06-14
update:     2025-12-03
author:     "elmagnifico"
header-img: "img/y2.jpg"
catalog:    true
tobecontinued: false
tags:
    - Music
    - DMX512
    - SFX
---

## Foreword

众所周知DMX512由于是串行信号，本身传输不远，所以为了解决更远距离的灯光同步控制，所以需要更新的协议来完成

> https://elmagnifico.tech/2021/01/15/DMX512/

同时DMX512本身可以控制的灯的数量是有限的，而想要控制更多，就需要扩展协议本身了



## Art-Net

### 主体框架

> https://art-net.org.uk/

ArtNet是一种灯光控制协议，ArtNet协议可看成传统DMX512数据与以太网数据的一座桥梁，通过支持ArtNet的设备， 将DMX512数据转成ArtNet网络数据，由于网络传输的快捷性和可连通性，ArtNet在灯光控制领域得到了广泛的应用，目前ArtNet的最新协议版本为ArtNet4。

ArtNet协议基于以太网UDP协议，所以只要可以收发UDP协议，理论上就能收发ArtNet协议，这比DMX512的实用性更广。



ArtNet 一代，包含有40个域，而一个域包含512个通道，每个通道包含256个数值。

ArtNet 二代，包含了一个主网络，一个主网络下又可以拥有16个子网络，一个子网络包含16个域。

ArtNet 三代，直接扩展了主网络，一共可以拥有128个主网络了。

ArtNet 四代，对整体进行扩展，并且向前兼容各个版本。

![image-20230614172233940](https://img.elmagnifico.tech/static/upload/elmagnifico/202306141727578.png)



### 网络封包

一般来说Art-Net的网络封包中包含以下几个：

- ArtPoll，Art设备发现
- ArtPollReply，对应搜索回复的包，设备需要实现
- ArtIpProg，Art设备IP修改包
- ArtIpProgReply，IP修改的回复包
- ArtDmx，携带DMX数据的包
- ArtTimeCode，用来传递时间的包
- 还有一些同步、触发、命令、调试诊断之类的功能包，不常用就不说了

只要实现以上的包，基本这个设备就可以被Art-Net软件识别到了



#### ArtPoll

ArtPoll设备发现一般是广播包，使用udp端口`0x1936`，也就是`6454`，如果收不到任何回复的话，一般情况下是3s超时。

![image-20230621172803042](https://img.elmagnifico.tech/static/upload/elmagnifico/202306211728111.png)

这个包比较复杂，很多详细定义要参考手册



#### ArtDmx

下图是Art-Net协议文档中的ArtDmx报文定义部分:

![image-20230614164714177](https://img.elmagnifico.tech/static/upload/elmagnifico/202306141647317.png)

- 报文的前8个字节是字符串”Art-Net”
- 紧接着OpCode字段要设置位16进制的5000，表示这是一个ArtDmx报文。
- 接着的ProtVerHi字段和ProtVerLo字段对应协议版本，这里按照说明分别给定数值0和14。
- Sequence字段设置为0禁止报文顺序功能。
- Physical字段目前没用。
- SubUni和Net字段指定了Universe，也就是唯一的DMX512网络号码。
- LengthHi和Length字段指定了DMX数据也就是Data字段的长度。



#### ArtTimeCode

ArtTimeCode的包，主要包含的就是时间信息，并且同时兼容了MIDI time code和 longitudinal time，LTC时间，这个包一般是广播包

![image-20230621171423819](https://img.elmagnifico.tech/static/upload/elmagnifico/202306211714906.png)

## sACN

![image-20230614172315029](https://img.elmagnifico.tech/static/upload/elmagnifico/202306141723113.png)

同为DMX512的网络封装模式，并且兼容了Art-Net 



## 搭建Art-Net

需要测试Art-Net接入和输出，所以要有双向的设备

- Art-Net控制器，主要负责把DMX512转成Art-Net，之后通过网络发给其他设备
- DMX512灯光控制台，主要是发出DMX512信号，通过DMX512输入口，传给Art-Net控制器，再转发给其他设备
- LED柔性像素屏WS2812或者其他灯具+适配的电源，作为被控设备，显示控制结果



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

灯具有非常多种，分类方法也不一样，有的是根据功能分的，有的是根据结构分的，还有根据光源区分的，只是记录一些关键或者经常提到的灯



帕灯，Parabolic Aluminum Reflector，染色灯、筒灯，也有一说叫wash light，核心是通过反光杯进行照射，这种灯主要是渲染环境用的

![image-20230619154914694](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619154914694.png)

摇头灯，一般可以x、y轴转动，可以达成追光等效果，其他灯也能做成摇头灯

![image-20230619155056182](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619155056182.png)

光束灯，打出明亮光束的灯，可以打非常远，聚光效果比较好

切割灯，利用内部屏蔽，达成灯光出口切割的效果，所以命名为切割灯，切割灯主要用来做场景区分、对比

![image-20230619154537514](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619154537514.png)

![image-20230619154818297](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230619154818297.png)



#### Art-Net 控制器

买的这个控制器稍微有点挫，竟然连网关和掩码都分不清楚，这就非常尴尬了。

设置个`172.16`网段，他竟然把所有`.1`网段都设置为了网关的默认ip，然后只要把控制器设置为`.1`ip，就失联了

![image-20230621110912328](https://img.elmagnifico.tech/static/upload/elmagnifico/202306211109466.png)

通过控制台连到Art-Net控制器，推杆以后数值可以正确变化。

这个控制器有两种模式：

Node模式，这种就是普通的接入点，网络包转成DMX512，向外输出

Server模式，这种情况下DMX512是作输入端，输入的DMX512转成网络包或者说输入的转成串行的灯带控制WS2812的格式进行输出。

也就是说如果要获取到第三方传入的DMX512信号，就需要使用Server模式，然后通过网络获取这个信号，执行对应命令即可。



#### DMX-Workshop

DMX-Workshop，是Art-Net的官方调试工具，主要是调试Art-Net用的

![image-20230621095403159](https://img.elmagnifico.tech/static/upload/elmagnifico/202306210954273.png)



#### 柔性屏WS2812

![image-20230621163926690](https://img.elmagnifico.tech/static/upload/elmagnifico/202306211639784.png)

柔性屏WS2812，本质上就是灯带拼成了一个软屏而已。

![image-20230621163411968](https://img.elmagnifico.tech/static/upload/elmagnifico/202306211634140.png)

Art-Net所谓的SPI口，在选择WS2812以后就变成串行输出了



## 灯光模拟软件

#### WYSIWYG

WYSIWYG，what you see is what you get

灯光模拟软件，所见即所得，和我之前的设计思路一样

基础设计，是通过CAD类似平面图的方式来设计安装布置灯具屏幕音响等设备，通过设置深度，可以将2D场景转换成3D场景，只是卡顿非常明显。

图层的设计又有点类似PS之类的，可以在不同的图层中安置灯具。

还有灯光模拟控制，实时渲染的功能，可以看到灯光设计效果。



#### EasyView3D

灯光模拟软件



#### Depence-R4

> https://www.syncronorm.com/depence-r4

Depence-R4也是一个舞台灯光模拟软件，支持了无人机灯光模拟，主要是来自于Skybrush的数据格式

最近搜了一下发现这个灯光模拟软件最近也非常火，比其他几个软件效果都要好很多



## 灯库制作软件

每个厂家的灯可能都略不相同，不同的灯就要不同的灯库文件，主要是用来描述灯各个通道的功能，多少值对应什么样的东西的。

制作完成以后，灯库文件就可以被灯光模拟软件使用，并且模拟了。



## 软件灯光控制器

基本上灯光控制器都是硬件实现的，有很多推子按钮之类的，但是为啥没有软件的方式直接控制，而不是实体按键的方式。

目前的控制台中，关于灯具的配置、效果组合，感觉完全可以软件操作，能做出更好的体验，更方便的使用和继承到之后的表演中。

并且软的方式也可以直接模拟效果，可以和现场的很多音乐视频等等做时间同步也很容易。

或者说软硬结合，软的部分做好以后，可以直接同步给硬件，硬件直接使用现成的配置就行了。



## Summary

Art-Net都是比较小众的东西，能搜到的内容比较少，相关从业的就更少了，后续如果实际使用了再补充



## Quote

> https://zhuanlan.zhihu.com/p/403662428
>
> https://www.bilibili.com/video/av421016527
>
> https://www.lightjams.com/sacn.html
>
> https://tigoe.github.io/DMX-Examples/dmx-intro.html
>
> https://artisticlicence.com/
>
> Art-Net specification.pdf
>
> https://mp.weixin.qq.com/s?__biz=MjM5MjEyMDg2MA==&mid=2649885224&idx=2&sn=a13368146972ce495357b4ea4f8ac38d&chksm=bead835b89da0a4dcb3343fe3c1e2238ba035fd452a3f4ed2dc493c13d90680e539137d6cd78&scene=27

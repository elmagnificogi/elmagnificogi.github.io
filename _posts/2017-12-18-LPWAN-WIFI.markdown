---
layout:     post
title:      "IoT-WIFI"
subtitle:   "无线物联网，WLAN，近距离"
date:       2017-12-18
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - LPWAN
---

# Foreword

最近寻找合适的网络方案,查询了不少无线传感网络的相关信息,这里一一举例其相关信息

下图基本列举出了目前在用的各种方案，下文将按照图中的顺序来进行介绍。

![](http://5b0988e595225.cdn.sohucs.com/images/20171127/de40efdafae04655a1bef0062b2950ce.png)

# 物联网无线通信技术

## 近距离无线局域网络

### WNAN

Wireless Neighborhood Area Network,无线邻域网络

#### Wi-SUN

#### ZigBee NAN

ZigBee NAN = JupiterMesh,其本质上是一个低功耗的工业级的mesh网络,传输速率6.25kbps到800kbps,最关键的在于其支持IPV6,可以将现有的ZigBee网络整合进mesh中.

![mark](http://p09tzvz74.bkt.clouddn.com/blog/171218/eA18JlDL7m.png?imageslim)

#### Wireless M-bus

Wireless M-Bus 标准用于定义水表、燃气表、热量表和电表与数据收集器件之间的射频通信链路。目前该标准广为欧洲市场所接受，用于智能计量或先进抄表基础设施 (AMI) 应用。无线 M-Bus 最初专为 868MHz 的运行频带而定义，该频带能够在射频范围和天线尺寸之间实现很好的平衡。后来，wM-Bus 规范还扩展到了另外两个新频带（169MHz 和 433MHz），这两个窄带解决方案具有更高的链路预算，从而能够提供比 868MHz 更远距离的解决方案。

![mark](http://p09tzvz74.bkt.clouddn.com/blog/171218/J4d3EFEfaI.png?imageslim)

本质上Wireless M-bus依然是一个窄带通信方案,其速率以及范围都有一定的限制,Wireless M-Bus 其实是M-Bus协议的无线版本.

#### WNaN

WNaN,Wireless Network after Next,下下代无线网络是美国国防高级研究计划局推出的,专门为军方所提供的自适应ad-hoc型网络,其使用频率从900mhz-6ghz,可容纳节点大概在100个左右,速率大于1mbps,提供aes256加密,最大功率下可以满负载连续工作8小时.其设备价格非常高(600刀一个节点,还是批量够买的情况下)

![mark](http://p09tzvz74.bkt.clouddn.com/blog/171218/38h76KijjA.png?imageslim)

### WLAN

WLAN,Wireless Local Area Network,无线局域网络。

#### Wi-Fi HaLow

其中WIFI也有意扩大范围,并且进入低频段,争一波物联网领域.

新一代的WIFI标准名为 Wi-Fi HaLow

> Wi-Fi HaLow将Wi-Fi扩展到了900MHz频段，从而可用来实现传感器、可穿戴设备等应用所必需的低功率互联。Wi-Fi HaLow的传送距离几乎是目前Wi-Fi的一倍，不仅能更远地传送信号，而且能在富有挑战性的环境中提供更加可靠的连接。

但是WIFI新标准大概要2020年才能确定,所以目前是没指望了.

#### V2X

这个是车联万物,所以一般只针对车用一用,其是以车为主体,主要分成下面四种:

- V2N,Vehicle-To-Network
- V2V,Vehicle-To-Vehicle
- V2I,Vehicle-To-Infrastructure
- V2P,Vehicle-To-Pedestrian

其和之前提过的 LTE-V 是一样的

#### White-Fi

White-Fi 是利用TV信道(200-600 MHz)基本已经不再使用了,所以在这一频段建立了IEEE 802.11af,来提供WIFI,实际上这个大部分用在了印度,其他地区很少有使用的.

White-Fi 类似于 Weightless-W，只是它提供的是WIFI网络而已。

### WFAN

WFAN,Wireless Factory Area Network,无线工业网络。

#### ISA 100.11a

这个是专门用于工业的无线传感网络,低延迟,高实时,高稳定性

#### WirelessHART

WirelessHART标准的无线网络，是依靠无线变送器本身路由来实现的；而ISA100工业无线标准的整个无线网络依靠节点路由来实现的,WirelessHART是基于HART(Highway Addressable Remote Transducer)协议来的.

### WHAN

WHAN,Wireless Home Area Network,无线家庭网络。

#### Zigbee

Zigbee,室内小范围内使用，大名鼎鼎，工作频率为868MHz、915MHz或2.4GHz.Zigbee是一种近程（10米~100米）、低速率（250Kbps标称速率）、低功耗的无线网络技术，主要用于近距离无线连接。具有低复杂度、低功耗、低速率、低成本、自组网、高可靠、超视距的特点。主要适合应用于自动控制和远程控制等领域，可以嵌入各种设备。

#### Z-wave

Z-Wave是一种新兴的基于射频的、低成本、低功耗、高可靠、适于网络的短距离无线通信技术。工作频带为908.42MHz(美国)~868.42MHz(欧洲)，采用FSK(BFSK/GFSK)调制方式，数据传输速率为9.6 kbps，信号的有效覆盖范围在室内是30m，室外可超过100m，适合于窄带宽应用场合。

简单来说Z-wave更加专注于家庭自动化使用，而Zigbee则是一直在拓展其广泛性，专注于全球市场，希望可以一统室内低功耗系无线通信的江湖.

#### Thread

Thread也是与Z-wave和Zigbee在家庭领域内竞争的,基于IEEE 802.15.4 MAC/PHY,同样支持IPV6,同样也是MESH网络,AES加密,

![mark](http://p09tzvz74.bkt.clouddn.com/blog/171218/akEB1E223h.png?imageslim)

#### EnOcean

多数协议都是基于低功耗和电池来使用的,而EnOcean则是无源无线,其不需要电池一直供电,而是通过采集环境中的能量来自供电,从而完成无线传输.

其使用的是低于1ghz的频段,速率也比Zigbee慢,可容纳终端数量较多,不过Zigbee在3.0标准以后与EnOcean合作了,并且推出了对应的无源Zigbee模块.

### WPAN

WPAN,Wireless Person Area Network,无线个人网络。

#### IrDA

IrDA是使用的红外进行通信的,其使用的范围比较小,而且也需要一定的瞄准操作等等限制.

#### Bluetooth

蓝牙技术,一直以来都不支持MESH网络,从而让蓝牙无法自组网,使用范围有限,随着蓝牙5.0MESH网络的推出,蓝牙不在受星型网络的限制,可以覆盖更大面积,从而可以和Zigbee正面交锋,不过目前来说应用还是很少.

#### ANT+/ANT

ANT基本只用在了运动领域中,出了这个领域基本很少人会知道,ANT基本就是一个劣质版蓝牙,但是ANT早起发展的早,而且其生产商被统一了ANT平台,所以导致在运动领域中蓝牙一直落后于ANT,本质上蓝牙的技术更加优秀,奈何ANT先行了一大步.

### NFC

NFC,Near Field Communication,近距离无线通讯技术

#### ISO/IEC 18092

RFID,所使用的协议,RFID其实也分距离的,近距离大概就是各种饭卡门卡等等,远距离的情况下可以达到10-30m的扫描范围,不过也是不能被遮挡,否则有大概率扫描不到.

#### GSMA NFC

NFC源起于RFID技术,其使用距离更近,同时支持读写,模块更加小,更合适移动使用,安全性也较RFID高

## Summary

目前来看小范围领域中Zigbee一家独大,WIFI使用比较广而且有差异化,蓝牙在个人使用的比较多,其他协议只能说是让这个世界更丰富了.

> http://www.ti.com.cn/tool/cn/wmbus
>
> http://www.21ic.com/app/rf/201205/123622.htm
>
> http://vertassets.blob.core.windows.net/download/244a6769/244a6769-b565-4e2f-8fed-fbd8e100b9dd/cobham-wnan.pdf
>
> http://www.qianjia.com/special/smarthomecn/sh-2013020/
>
> https://www.threadgroup.org/what-is-thread/home
>
> http://www.nfchome.org/different-nfc-rfid.html
>

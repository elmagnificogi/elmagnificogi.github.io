---
layout:     post
title:      "音频设备基础知识"
subtitle:   "XLR"
date:       2023-09-14
update:     2023-09-14
author:     "elmagnifico"
header-img: "img/bg3.jpg"
catalog:    true
tobecontinued: false
tags:
    - Audio
---

## Foreword

音频设备的基础知识，一些接口的科普



## Audio



### 物理接口

#### XLR

XLR接口，也叫卡侬头，常用于音响、调音台等设备，可以传输三芯（及以上）的平衡音频信号

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/8f593cc9df23437a9db3dd026bdfd855.png)

XLR有3口、4口、5口、6口的，平常3口最为常见

三口，左边为输入，右边为输出。1=接地/屏蔽，2=热（+），3=冷（－）。不平衡运行时极1和极3必须接通。

XLR散装线缆采用95%覆盖双屏蔽设计和坚固的24 AWG导线，有点类似与网络设备，都有固定架、线材标准、屏蔽设计。



#### TRS

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/0da92681c32149dea8ca4105a854083b.png)

TRS共有三种尺寸：2.5mm、3.5mm与6.3mm（也叫6.35或6.5），功能机时代oppo的手机都是2.5mm的音频接口和别人家的都不一样，3.5就是手机上被typec置换下去的耳机接口了，6.3的就是大音响上比较常见的接口

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/9a5188e4eab6439790537fe97246a6a3.png)

除了尺寸区别，还有环数（R），在日常使用中，我们一般依据具体环数不同而将这些接头分别称作TS、TRS、TRRS等。以TRS为例，其中的T、R、S分别对应三个部分，一般来说，T为左声道，R为右声道，而S负责接地，中间的黑色作为绝缘环，把接头分为了三个“芯”。



![img](https://img.elmagnifico.tech/static/upload/elmagnifico/0976257804ec4c359eca79872eb9414d.png)

TRRS则多了一个环，共有四个“芯”，可以用来传输麦克风信号（传输依据CTIA标准），很多用来连接手机和PC的3.5mm耳机线，就是TRRS。



#### RCA

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/01201d8731cf463983dc1d5b876c6972.jpeg)

RCA接口，它得名于美国无线电公司的英文缩写（Radio Corporation of America），而我们更熟悉的是它的另一个名字：莲花头

老式的电视和DVD等播放设备上都有RCA接口，RCA接口采用同轴传输信号的方式，中轴用来传输信号，外沿一圈的接触层用来接地，每一根线缆负责传输一个声道的音频信号，因此，想要双声道立体声就可以使用两根线缆来解决。



#### 传输距离

**2.5MM/3.5MM/¼“的TRS**

- 30米（常规），76（带扩展器，仅3.5毫米）

2.5毫米、3.5毫米（也称为耳机线）和¼“音频线的最大距离平均为45米。通过使用比平时更厚的电缆定制产品，可以走得更远。AWG越低，可以走的距离就越大。通过使用扩展器，3.5毫米可以达到76米。



**XLR**

- 30米（官方），300米（理论）

XLR通常与麦克风、放大器或类似设备一起使用。有了合适的设备，增强和屏蔽XLR线缆可以在不损失信号质量的情况下运行300米以上。线缆越长，故障发生的可能性就越大。



**复合RCA（COMPOSITE RCA）**

- 30米（常规），75米（带伸缩器）

RCA主要有两种类型，复合型和组件型。复合RCA（通常只称为“RCA”）是有三根电缆的类型：红色、白色和黄色。这种较旧的模拟信号经过了很好的测试，但在很大程度上被较新的数字电缆所取代。由于是模拟的，图像质量在较长的长度时会降低，但在30米或更短的长度时损失并不明显。普通电缆可以达到90米，但质量水平会有所不同。

巴伦可以用于使用以太网扩展复合RCA，但它只适用于音频（红色和白色）电缆。视频（黄色）电缆不可用。



#### Balun 巴伦

这个音频领域很常见，简单说就是一种设备把不平衡信号转化成平衡信号的变换器，差分输出，从而扩展音频线的传输距离



## Quote

> https://www.sohu.com/a/714819599_121466058
>
> https://blog.csdn.net/qq_39543984/article/details/121436422

---
layout:     post
title:      "遥控和香氛按钮接入米家失败"
subtitle:   "遥控、香薰、电容按键、压力传感器、马桶冲水"
date:       2024-11-11
update:     2024-11-11
author:     "elmagnifico"
header-img: "img/z8.jpg"
catalog:    true
tobecontinued: false
tags:
    - Crack
    - Goods
    - Equip
    - DIY
    - 米家
---

## Foreword

记录一下接入米家失败的几个案例



## 遥控器接入米家

![image-20241111000006292](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110000492.png)

遥控倒是挺好拆的，经过测试接入按钮是物理的，成功的概率应该很大了

接下来就翻车了，反复测试了好几次发现，直接把按钮接入地或者电源，都不能正常触发按键，被控对象有反应，但是不能正常工作。



仔细查了一下主控芯片：TLSR8366ET24

![image-20241111000909562](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110009602.png)

它实际可以当作GPIO的引脚其实不多，但是结合遥控器，要控的除了13个按键，其实还有5个led灯，不可能接18个GPIO去做独立按键控制的，所以他其实这里用了矩阵键盘，逆向了电路以后，发现他的按键两端IO确实都是接入了主控芯片，而不是地



实际遇到的情况：

![image-20241110232059813](https://img.elmagnifico.tech/static/upload/elmagnifico/202411102321941.png)

由于使用了矩阵键盘，这里又想保留原本的键盘、又想接入米家就无法做到了，除非米家模块支持Bypass模式，在输入的时候可以进行闭合/断开操作，平常保持断开/闭合，让扫描信号可以正常工作，从而可以模拟按键，否则无论怎么设计都没办法直接接入到米家中



所以遇到这种情况就没办法接入了，不过测试了一下米家模块，用2节7号电池，活不过一周就耗尽了，这个还是得配合电源一起使用。



### 迪富电子

> https://www.denvel.com

顺手查了一下遥控的生产厂家，迪富电子，专门做遥控的



## 香氛机接入米家

![image-20241111001712550](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110017592.png)

别问为什么不买接入米家的香氛机，就是爱折腾（眼瞎买错了，而且还是两次）

![image-20241111002007373](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110020441.png)

这个按键是电容的，所以用物理的方式肯定无法直接触发，而且这个还要做防水，实际无损拆开也不容易。

![image-20241111002110444](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110021519.png)

经过一番搜索 ，还是看到了可以控制电容屏的触摸按钮，但是店家也不能保证可以控制这种类型的按钮，只能说买来试试，不行就88会员免费退了

![image-20241111002349528](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110023637.png)

设计的还是挺简单的，看起来是通过PWM引起电容变化，进而被检测的，用的耳机接头，一个小板子可以控4个，支持typec供电，也给预留了电池供电口

![image-20241111002324729](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110023842.png)

经过测试，果然不行。如果用手拿着电容头，确实可以触发，但是如果按键触发电容头变化，就不行。

店家也挺好的，让我直接整个给他退回去，他再研究一下，看能否处理。经过他测试，试用了他们新的高频电容头，发现不行，只好给我退回来了。



这个电容触发模块本身的价格+香氛机比直接买接入米家的香氛还贵，成品还是更香啊



## 智能冲水改造

垃圾马桶盖太烂了，智能太差了，既不能接入米家，也不能自动冲水，妥妥的废物。

之前看了一些智能冲水的外部产品，虽然不能进米家但是也不错

![image-20241111002925404](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110029470.png)

![image-20241111003157048](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110031238.png)

触发逻辑很简单，被遮挡6s以上，释放时会自动进行冲水，同时还有一个触摸按键可以直接触发冲水

![image-20241111002903499](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110029714.png)

安装需要注意排水阀直径需要在60-80mm直接，否则这个环套不上去，同时水箱盖按钮长度有36mm，否则可能盖不上。

安装完以后，放好感应器基本完美了。



理想马桶盖+冲水的智能逻辑：

小的，检测到来人自动开盖（顶盖+座圈），离开后自动关盖，离开后6s自动冲水，触发香氛

大的，检测到来人自动开盖（顶盖），冲洗，冲洗完成后，自动关盖，离开后6s自动冲水，触发香氛



现实马桶盖+冲水的智能逻辑：

小的，检测到来人自动开盖（顶盖），手动按遥控器开座圈，离开后6s自动冲水

大的，检测到来人自动开盖（顶盖），冲洗，冲洗完成后，手动按遥控关盖，离开后6s自动冲水

- 由于是侧面检测，实际离开判定不是很准确，很容易在还没离开的情况下触发冲水



正常感应应该是安装在水箱上的，但是这个马桶盖很容易自动开合，那就会出现自动冲水，为了减少误触只好安装在侧面



## 压力传感器

![image-20241111005424604](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110054699.png)

这个不要买就行了，触发灵敏度不能调节，触发条件其实还是有点苛刻的，要求压感片被很明显的压变形才能触发，只有坐姿比较容易，其他方式，比如躺卧等比较难触发。

这个是拿电阻式薄膜压力带+门窗触发器改造来的，实际挺简单的

![image-20241111005646344](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110056487.png)

咸鱼上还有一种压力片的感应点更多一些，这种稍微好一些。



## YF-DR-CM-V2

![image-20241111004506656](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110045698.png)

![image-20241113150312432](https://img.elmagnifico.tech/static/upload/elmagnifico/202411131503617.png)

看了一下主要触发的方式，EL357N是一个光电耦合器模块，理论上是用来隔离输入和输出的，但是这里直接把输出给到了这个软的吸盘，而且这个吸盘竟然还导电

![image-20241113150337729](https://img.elmagnifico.tech/static/upload/elmagnifico/202411131503781.png)

主控是STC的8G1K08A，简单一个单片机，主要用来输出PWM给光电模块

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202411131504697.png)

给的PWM脉冲大概是3Hz，占空比是25%，然后就能触发屏幕的点击了

其他的方式触发点击，本质上是一样的方案，所以没有尝试

## 其他

![image-20241111005941319](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110059357.png)

还有纯机械的方式，直接模拟人手了，这种有点太弱智了，和拿个舵机直接控没啥区别了，不能接受

![image-20241111010028986](https://img.elmagnifico.tech/static/upload/elmagnifico/202411110100062.png)

电容按键一般后面都有芯片，其实可以看对应芯片是以什么方式输出结果的，如果I2C，类似之前升降桌的芯片，那种就很难从中间介入。但是如果输出结果也是简单的0/1信号，那也可以直接从芯片侧接入，来接入智能，同时还能保留原本的按键



## Summary

还是得尽量选择天生带接入的，后期改造很难做到理想



## Quote

> https://item.taobao.com/item.htm?id=771817542208


---

layout:     post
title:      "由于制裁，BLHeli停止开发，所有ESC产品停止支持"
subtitle:   "制裁，BLHeli逆向，电调，ESC"
date:       2024-06-03
update:     2024-06-03
author:     "elmagnifico"
header-img: "img/x7.jpg"
catalog:    true
tobecontinued: true
tags:
    - BLHeli
---

## Foreword

前段时间刚参加完无人机展会，各种为战争服务的无人机，百花齐放，热闹程度远超前几年，没想到刚转头，无人机行业就又被打击了



## BLHeli被制裁

![image-20240604095924947](https://img.elmagnifico.tech/static/upload/elmagnifico/202406040959986.png)

简单说由于BLHeli广泛被无人机使用，搭载BLH的ESC并不能确定最终用途，所以整个BLH数据被禁止出口，包括BLH自身收款的银行都受到了影响，所以BLH停止开发和维护了。

- 实际上BLH是先停止，然后才发出来相关公告



BLH大概在无人机市场里占90%，一个无人机就至少要搭载4个BLH电调，全世界大部分电调厂商都在国内，每年出货量大概几百上千万，BLH认可度之高，远超想象。

最初BLH大概是在2013年上线的，一上线就开源，其优异的性能和相对低廉的价格，一下就爆火了。而BLH初代还是8bit的单片机，成本低，性能也相对弱一些，随着时代的发展，16bit单片机本身发展不太好，被跳过去了，直接进入了32bit时代，BLH在初期估计是给各个制造商做技术支持，只是挣了点小钱。从2017年开始BLH进入32位时代，开始闭源，对应的所有new features都加在了32位上，8位停止维护。

8位电调依然可以使用，而且很多低性能领域都可以用，每年依然有不小的出货量。对应的32位电调，BLH开始针对各个制造商，对激活BLH固件的电调开始收费，大概在1RMB左右。

BLH就算什么都不开发，每年估计也能躺赚几百万，而市面上的竞争对手，抱歉，基本没有，8位的强有力的竞争对手大概20年才有（JESC BlueJay），32位的21年才有（AM32），闭源的选手有很多（SimonK，Kiss等），不过都不怎么火，而且他们的电调往往和自己的飞控要一起使用才能得到比较好的效果。



### 破局

BLH的认证模式是购买对应数量的Licenses，每激活一个电调会消耗一个，制造商都是前期一次性买n个，一次性支付n*m美刀，而此次停止维护，是直接在制造商还未使用完Licenses的情况下，就停止了服务，有的制造商手上可能还有几十万次激活未被消耗。



与正式激活相对的，BLH也有测试版本，测试版本是只有100次上电工作的限制，使用完以后就无法使用了。想都不用想这种测试版，必然是在FLASH中写入了一个使用次数，而这个次数大概率是很容易逆向的。BLH主要是在BOOT阶段进行的校验和限制，所以要突破这一层，在这里做点手脚应该就行了，主要是针对固件的HACK



BLH本身的上位机是Delphi写的，也没有做什么非常严格的加密或者保护，上位机这里也有突破口。



激活需要服务器，粗看了一下BLH用了https，所以这里要从接口上破解，需要先把https的接口给他逆向了，让他可以使用非https进行传输，然后直接抓包看接口请求是什么就行了。唯一的问题BLH的服务停了，不知道具体返回什么内容，需要结合上位机一起看回包内容。

这样劫持https就能做出来一个无感的上位替代版本



![image-20240603215033492](https://img.elmagnifico.tech/static/upload/elmagnifico/202406032150528.png)

国内制造商飞盈佳乐，直接打出一记，让我来开发，如果BLH作者敢头铁，直接把32位代码开源，那估计他人马上就没了



## 替代者

BLH32不开源，同时由于电调本身代码是汇编写的，基本就劝退了大部分人了，就算他开源了，也很少有人能修改，更别说适配其他MCU什么的了。

这次BLH停止维护，那么对应的开源社区的电调将迎来新生，比较有名的就是AM32和BlueJay

同样的AM32和BlueJay相对应用还是太少了，很多人对于他们的稳定性还是怀疑的，毕竟这是电调，出了一点问题就是坠机，BLH长达十一年的统治地位靠的就是稳定



### 上位替代：AM32

> https://github.com/am32-firmware/AM32

AM32相对还是比较小众的，支持的MCU比较少，但是有一部分电调是和BLH完全兼容的，但是当下阶段如果切换到AM32，那就再也不能切换回BLH了，你没有激活权限了



### 下位替代：BlueJay

> https://github.com/mathiasvr/bluejay

蓝鸟电调，他继承了BLH的8位电调，发扬光大，大部分32位电调的new features都移植过来了



## Summary

归根到底和俄乌战争脱不了干系，相信过不了几天老毛子就把他破了，更别说我看到这个消息发出来的人就叫`just hack it`

对于开源的AM32和BlueJay，如果形式愈演愈烈，可能他们也会被迫删库

制裁无人机没水平，直接制裁电调，这就让当前市场上给俄乌供货的制造商瞬间吃瘪，更别提其他正常使用的电调，DIY玩家用的电调，目前都被卡了不少货，这个事情已经发生一周了，今天才刚被曝出来，不知道国内其他几家做电调业务的现在打算怎么办。



## Quote

> https://www.youtube.com/watch?v=GU0RoH_Pof0
>
> https://www.youtube.com/watch?v=_PNuWXgYV74
>
> https://www.youtube.com/watch?v=AuBHXlWeUVc&ab_channel=JustHackIt
>
> https://www.facebook.com/share/p/tDjAETkfQXyj4kF4/
>
> https://oscarliang.com/am32-esc-firmware-an-open-source-alternative-to-blheli32/

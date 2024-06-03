---

layout:     post
title:      "由于制裁，BLHeli停止开发，结束所有ESC产品维护"
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

![image-20240603204939127](https://img.elmagnifico.tech/static/upload/elmagnifico/202406032049280.png)

简单说由于BLHeli广泛被无人机使用，搭载BLH的ESC并不能确定最终用途，所以整个BLH数据被禁止出口，包括BLH自身收款的银行都受到了影响，所以BLH停止开发和维护了。

- 实际上BLH是先停止，然后才发出来相关公告



BLH大概在无人机市场里占90%，一个无人机就至少要搭载4个BLH电调，全世界大部分电调厂商都在国内，每年出货量大概几百上千万，BLH认可度之高，远超想象。

最初BLH大概是在2013年上线的，一上线就开源，其优异的性能和相对低廉的价格，一下就爆火了。而BLH初代还是8bit的单片机，成本低，性能也相对弱一些，随着时代的发展，16bit单片机本身发展不太好，被跳过去了，直接进入了32bit时代，BLH在初期估计是给各个制造商做技术支持，只是挣了点小钱。从2017年开始BLH进入32位时代，开始闭源，对应的所有新feature都加在了32位上，8位停止维护。

8位电调依然可以使用，而且很多低性能领域都可以用，每年依然有不小的出货量。对应的32位电调，BLH开始针对各个制造商，对激活BLH固件的电调开始收费，大概在1RMB左右。

BLH就算什么都不开发，每年估计也能躺赚几百万，而市面上的竞争对手，抱歉，基本没有，8位的强有力的竞争对手大概20年才有（JESC BlueJay），32位的21年才有（AM32），闭源的选手有很多（SimonK，Kiss等），不过都不怎么火，而且他们的电调往往和自己的飞控要一起使用才能得到比较好的效果。



### 破局

BLH的认证模式是购买对应数量的Licenses，每激活一个电调会消耗一个，制造商都是前期一次性买n个，一次性支付n*m美刀，而此次停止维护，是直接在制造商还未使用完Licenses的情况下，就停止了服务，有的制造商手上可能还有几十万次激活未被消耗。





## 替代者



### AM32



### BlueJay





## Summary



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

---
layout:     post
title:      "NS 单片机以及相关配件选购指南"
subtitle:   "MCU，串口，采集卡，宝可梦"
date:       2020-08-04
update:     2021-04-30
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.png"
catalog:    true
tags:
    - NintendoSwitch
    - NS
    - EasyCon
---

## Foreword

指南其实早就写过了，只不过一直放在群里，这次转成文章吧

注意由于我放了链接，导致下面的链接中可能价格虚高，请自行搜索合适价格的，这个东西比你想象的便宜很多。

- 以下所有内容非广告，所有件都可以随你选店家，关键词都列举了，自己搜就行了，千万别带宝可梦相关关键词，都是溢价的。



## 单片机选择

以下单片机价格应该都是小于30的，甚至小于20，请自己估计好成本

- Leonardo 单片机,atmega32u4,插针是焊接好的，目前兼容性比较好的

> https://detail.tmall.com/item.htm?spm=a230r.1.14.13.58a9305cNOYKut&id=609081130524&cm_id=140105335569ed55e27b&abbucket=8&skuId=4276067136146



- Teensy2.0，不过需要diy的地方比较多，需要焊插针，可以找店家商量一下帮忙焊接

> https://item.taobao.com/item.htm?spm=a230r.1.14.178.2dae676001uQ3b&id=604283731942&ns=1&abbucket=8#detail



- Beetle Leonardo USB ATMEGA32U4，需要焊插针，可以找店家商量一下帮忙焊接

>https://item.taobao.com/item.htm?spm=a230r.1.14.73.31de6a7bHT8Dtq&id=546819855461&ns=1&abbucket=8#detail



- Teensy2.0++ 或者Teensy++2.0,最强性能，不过也要焊接插针，可以找店家商量一下帮忙焊接

>https://item.taobao.com/item.htm?spm=a230r.1.14.95.2ade6612kEAtx1&id=561407669565&ns=1&abbucket=19#detail



- Arduino uno r3 芯片ATmega16U2，最差选择,目前最不推荐的,能不买千万别买，难用，功能弱

> https://item.taobao.com/item.htm?spm=a230r.1.14.23.57cb78227BsvdS&id=558864992915&ns=1&abbucket=19#detail



如果不使用串口，单纯只是烧录固件使用，下面的都不用看

最后补充一点，teensy系列支持全平台，烧录方便，驱动安装傻瓜化，连号线烧好就能用

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/XuOarETMsIZnCp9.png)

## 串口

串口是使用伊机控联机模式必需品

- 串口,USB转TTL 转串口(3.3v)

> https://item.taobao.com/item.htm?spm=a1z10.3-c-s.w4002-21231326450.21.1e764569XMmEiW&id=587158124208



- 杜邦线,一般是买一排40根或者20根就够了，长度20cm，(ATmega16U2使用公对母，其他单片机焊接插针以后使用母对母，否则也是公对母)

> https://detail.tmall.com/item.htm?id=41254478179&ali_refid=a3_430583_1006:1109983619:N:MsF9mE9KLTC2IibWJh+K1A==:3da3efbb45cbe50afa26f63005f28d1d&ali_trackid=1_3da3efbb45cbe50afa26f63005f28d1d&spm=a230r.1.14.3&skuId=3108862773146



## 拓展坞

先说为什么需要拓展坞：由于原NS底座，当你接上以后，主机会进入**TV模式**自动息屏，所有画面必须从外接HDMI输出，这就会出现你边充电边用单片机刷刷刷的时候，看不到屏幕内容（不外接电视或者显示器的情况下），为了解决这个问题再加上原生底座不方便携带，太大了，所以才要选一个第三方拓展坞。

- 还有一个额外用处，散热，原装散热实在太差了，长时间使用会导致机器过热降频从而脚本跑飞



市面上各种拓展坞良莠不齐，所以买之前要问清楚，看清详情是否支持switch，询问清楚插入拓展坞以及充电以后switch是否会黑屏，黑屏的话看不到程序运行情况，别贪便宜，买别人买过的（确认没问题的）

下面介绍的都是有人买过或者确认过可以用的：



关键词：**CVK，NS switch底座**


> https://detail.tmall.com/item.htm?id=569517893726&spm=a1z09.2.0.0.32912e8dXPkHS4&_u=j1g76mj9507e&skuId=4199784447575

这个是我自己用的，笔记本和ns都能识别，自带网口各种功能比较全吧，适合笔记本+NS两用，但是也有小问题

- 拓展坞充电可能有点问题，需要先拓展坞插上电源以后再接入switch，否则可能无法充电



关键词：**谷粒，switch散热底座，NS DOCK，底座改装**


> https://item.taobao.com/item.htm?spm=a1z09.2.0.0.3f782e8d4BGDMW&id=599055652106&_u=18kgsnoca63
>

谷粒TV底座改装壳，只有壳！注意这个只是散热改造，黑屏还是会黑的。

- 某些电源不足以使他进入TV模式，原装或小米45W的可以进入TV模式，也算是支持了桌面模式吧。



关键词：**谷粒，switch迷你便携支架，一键切换充电模式**


> https://item.taobao.com/item.htm?spm=a1z0k.7386009.0.d4919233.5ff079achUbZQx&id=597578819768&_u=t2dmg8j26111

谷粒的switch迷你便携支架，可以在TV模式和掌机模式切换，黑屏就解决了。



关键词：**IVR，便携拓展坞**


> https://item.jd.com/42971297356.html

IVR便携拓展坞，小巧是最大特点（火柴盒大小）,不接HDMI不会进TV模式。



关键词：**Skull ，NS第三方便携底座**


> https://item.taobao.com/item.htm?spm=a1z0k.7385961.1997985097.d4918997.78e279aca0tuEj&id=611491382186&_u=t2dmg8j26111

 Skull Switch Dock，一款非常高级的拓展坞，本身类似上面的迷你支架，但是他又可以变成火柴盒大小的携带模式，很炫酷，可以变形（男人嘛，能变形就行了）



关键词：**毕亚兹，Switch游戏机充电支架**


> https://item.jd.com/100006077759.html

毕亚兹无HDMI底座，无HDMI输出接口！自然也不会进TV模式，自带2个USB接口，很小巧，能充电。



关键词：**CFROCE，便携式底座**

> https://detail.tmall.com/item.htm?spm=a1z10.5-b.w4011-22116311807.20.47a87195fZKS8l&id=611136019119&rn=7f23123fdf1390eb24ec19a8d85f135f&abbucket=11&skuId=4470266415992

C-FROCE也是可以用的



#### 最廉价的解决办法

- 如果不想买拓展坞，可以用下面的usb-a转type-c的转接头,方便携带，就可以单片机自带线插入到switch了，缺点就是不能用单片机的时候充电

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/C7Icau1Gm5oMkOq.png)

## 采集卡

伊机控推出了图像识别功能，这就需要采集卡支持。

采集卡，由于我自己的我感觉不是很满意，所以不推荐了，自己选吧，支持1080p，60hz，基本就能用，至于色偏，延迟什么的，本着一分钱一分货的原则去考虑就行了。

当然如果有采集卡，而且不需要带出去用，其实就不需要拓展坞了

- 采集卡品牌很多，伊机控这里无所谓什么牌子的，多少色偏，延迟，分辨率，基本都能支持

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/vkSANeDmjI2PUC7.png)

## 成品

当然也有各种成品单片机在卖，如果你想省钱就按教程走，如果不想折腾想有人服务那就买别人的吧。

成品也有一些缺点，比如极限类型脚本成品基本都做不到，比如刷帧6800帧/小时这样的，极限响应速度没有伊机控快，比如用的是最菜的16u2，日后也没啥拓展性，**具体功能上伊机控>成品，服务上伊机控<成品**



草句的便携一些，有显示屏，方便外出带着，价格88，据说日后还会涨（本身开源，可以自己DIY一样的）

> https://item.taobao.com/item.htm?spm=a230r.1.14.38.77a86bbat1M7FH&id=613383712791&ns=1&abbucket=5#detail

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/EeQAwlIWxgvRS4M.png)



丶clint的宝可梦自动化，价格嘛150，好像还有什么高级版还得要100，他们有售后，还有一些附加的服务啥的（无源码）

> https://item.taobao.com/item.htm?spm=a230r.1.14.28.77a86bbat1M7FH&id=611648312056&ns=1&abbucket=5#detail

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/joqCOYnkZz7LpVP.png)

其他可能还有很多，不过是互相抄而已就不介绍了，咸鱼随便搜搜宝可梦单片机，一堆一堆收智商税的



## Summary

最后组合一下类似下图中的样子

使用单片机+串口+拓展坞+伊机控模式：

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/sK2UB1hxzcH9ASI.png)

仅使用单片机+拓展坞：

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/1HhMPrl3jyUAEL2.png)



teensy2.0 + USB-A转Type-C ，固件模式：

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/O4nRY1uJHIzXgmP.jpg)

teensy2.0 + 拓展坞模式：

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/txKQw5eMITEpyXN.png)



**最后是我的NS群：**

NS宝可梦剑盾 一群 490570154 二群车主群27775142 三群伊机控单片机群946057081 四群乱数讨论群 755843002 五群动森岛主群383218664 六群不思议的皇冠1158816209，七群宝可梦大集结300155660
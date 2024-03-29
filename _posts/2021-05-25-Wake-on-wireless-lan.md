---
layout:     post
title:      "无线网络唤醒，从入门到放弃"
subtitle:   "wol,PCI Express WAKE,开机棒,AC Recover,米家mesh,ESP32"
date:       2021-05-25
update:     2023-04-19
author:     "elmagnifico"
header-img: "img/springboot.jpg"
catalog:    true
mathjax:    false
tags:
    - PC
---

## Foreword

最近需要在公司使用家里的电脑，出门忘记开机了，就导致无法远程，很麻烦，所以这次来探索一下如何远程唤醒。



## 唤醒的几种方式

### Wake on Lan

一般都是指通过有线网络唤醒，原理比较简单，实际上关机以后主板网口不断电，并且还运行着小型协议栈，它可以收包，如果收到了特定的包，就可以唤醒主板，启动。



**要求，能唤醒要求，主板支持，网卡支持，驱动支持，操作系统支持，路由器支持，中间任何一个不支持都不行。**



但是这种操作比较复杂，说一下要点：

1. BIOS中必须开启Wake on Lan的功能或者是 PCI Express/ PCI Wake，一般都在电源/网络/PCI选项中
2. 对应网卡驱动-属性-高级中开启有关唤醒的功能，关闭节能的功能
3. 网卡驱动-属性-电源管理-勾选允许计算机关闭此设备以节约电源，允许此设备唤醒计算机，只允许幻数包唤醒计算机（看情况）
4. 启用或关闭windows功能，勾选Simple TCPIP services（i.e.echo,daytime etc）,这个也是看情况开启
5. windwos电源管理中关闭快速启动（此项和具体的网卡主板有关系，有的需要有的可以无视）



![](https://img.elmagnifico.tech/static/upload/elmagnifico/3w4bGoMlWi1jnFc.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/UFuKh4Q5f89BcGz.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/LlQiGgP6sztOh2Z.png)



一般来说现在的主板基本都支持，只要设置正确了，大概率可以通过网络唤醒。只是很多时候可能主机没有连网线，也没办法连，那这就很尴尬了。



#### 排障

常见操作更新驱动，更新BIOS，或者是驱动退化等等就常规操作了。



**收不到wol包**

有可能是路由器中屏蔽了唤醒包，查看一下是否有相关防火墙设置，也有可能是windows自己的防火墙或者杀毒软件屏蔽了唤醒包。一般使用的是UDP 端口9



**IP与MAC地址不对应**

路由中将IP和MAC地址静态绑定，特别是穿透的时候容易出问题。



**唤醒包不同**

有的可能是第三方协议，不是幻数包，那么之前的只允许幻数包唤醒就不能勾选。



#### 查看设备是否允许唤醒

```
powercfg -devicequery wake_armed
```



#### 查看设备唤醒次数

```
powercfg -lastwake 
```

对应的结果类似下图

![](https://img.elmagnifico.tech/static/upload/elmagnifico/MgcJ6lavZ3r75q4.png)



## Wake on Wireless LAN

为了应对有线无法连接的问题，自然也就有了无线唤醒的方案，但是目前我基本没见人可以正常使用的。或多或少都有一些其他bug。

无线是工作在有线的基础上的，所以上文中的操作在无线这里都需要做一遍，并且还有一些额外的操作。



1. 对应网卡驱动-属性-高级中开启有关唤醒的功能，关闭节能的功能，WOWLAN和GTK，EAP等相关的都需要开启。

2. 注册表HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NativeWifiP\Parameters中添加EnableWoWLAN，类型是DWORD，值为1

![](https://img.elmagnifico.tech/static/upload/elmagnifico/74ebEgatcmCnQU6.png)

但是就算这些都做了，还是有大概率不能通过无线唤醒，具体原因嘛，我实在是找不到了。



#### 放弃过程

由于我是连不了网线，所以一直用一块PCIE的网卡，intel dual band wireless ac 8265，技嘉出品的，完全支持无线唤醒。



##### BIOS问题

猜想是BIOS的问题，一看BIOS还是16年的，基本是出厂状态，于是乎又开始了升级BIOS，Prime z270-ar主板竟然从官网消失了，nmd，这当年顶配主板，说没就没了，只能人工客服提供下载链接。

然而升级之后问题依旧。



##### 幻数包

首先是怀疑幻数包没发出来，因为几个wakeonlan的软件比较老了，很可能早就不行了，然后实验了一下，发现

- Wake On Lan(远程唤醒电脑软件) v2.11官方版，不能用，发不出来包



发现路由器有唤醒功能，直接用路由器的，还是不行，再怀疑我路由上发的幻数包实际上没发出来，然后装了个wireshark，分析

![](https://img.elmagnifico.tech/static/upload/elmagnifico/KTEx2zcMGCHtmg1.png)

可以看到，收到了，wireshark可以直接识别唤醒包，叫wol，实际上本质是个udp包，这说明没问题。



然后同时我还试了试，手机上的app wake on lan 来发送唤醒命令

![](https://img.elmagnifico.tech/static/upload/elmagnifico/iLfbgh3CaGD86MY.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/TtwPzgEM3pJSnsR.png)

可以看到一样收到了wol包，同时这个包的大小还是不一样的，但是内容都是差不多的。我也试了试其他app，大同小异，都是发送144字节的幻数包。



##### 网卡断电

然后怀疑关机以后，pcie的无线网卡没电，所以关机以后仔细查看，发现主板有一个小灯亮着，同时主板的rgb底灯也亮，不至于没电，但是pcie的网卡没有指示灯，无法辨别是否有电。

于是转而使用睡眠功能，这种情况下整个机箱都是亮的（ram的rgb亮着），看起来多数都带电状态，然后依然不行。关键是这个时候其实是能ping通的，也就是说网卡肯定还在正常工作。

同时我在睡眠前开启了wireshark，睡眠后还使用手机发送了唤醒包，等待了十几秒以后又发了一次，依然无法唤醒

![](https://img.elmagnifico.tech/static/upload/elmagnifico/zdrKEVu1s8GHZ4N.png)

可以看到我这里间隔了14秒，包是收到了，但是电脑没反应。

查看唤醒设备，pcie的网卡存在，查看唤醒次数，直接是0，说明这个包没被识别，这就排除了没电的问题。（同时我搜索到了，有人用了无线网卡以后出现了关机时连带其他pcie设备不断电的情况，我猜八成是由于开启了无线唤醒导致的不断电）

到这里基本可以肯定，无线网卡的这个功能没有正常工作。



##### 更新网卡驱动

之前用的是老驱动了，很久没更新过了，于是更新了一下，问题依旧。

到这里基本就可以放弃了，该做的都做了，剩下的就是具体系统和硬件兼容性问题了，已经不是我能解决的了。



## 其他唤醒方式



### 开机棒

其实就是AC recovery

比较常见的就是向日葵的开机插座，利用的方式比较简单，基本大多数主板都支持。主板中有一项上电检测的设置，相当于是说电源通电之后进行什么操作，可以是关机，可以是开机，也可以是断电前的状态。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/JbiUNwpf46Kuv2h.png)

而基本上市面上多数唤醒都是利用这个功能，BIOS中可能叫做AC recovery或者中文叫断电恢复后电源状态。而要实现智能插座唤醒，就需要设置为断电恢复后-开机，这样每次关机是正常关机，但是本质上主板还没断电，而你通过操控智能插座断电-复电，从而让原本关机的状态切换为了开机。

向日葵的开机插座或者其他智能插座也都能实现相同的目的，而向日葵的开机棒，本质上就是个透传的工具而已，实际上还是发wol包来唤醒的，只是要求pc必须是有线连接在网络中的，很多高级或者刷机路由器都能代替他。



#### ErP Ready

这个是用来符合能效要求的选项，默认是关闭的，也就是不节能。

S1，CPU开启，其他外设基本都还勉强活着，对应睡眠状态

S2，CPU关闭，但是其他外设都是好的，省电状态

S3，挂起状态，只有内存活着，其他的设备都断电了，对应快速启动

S4，内存内容存入硬盘中保存，用来快速恢复，对应休眠状态

S5，全部断电



### HomeKit

有一些HomeKit的开关，直接连接到主板可以做通断控制，就是模拟按下电源按键。



## AC recovery

最后买了一个Gosund智能排插，最多4孔可控，1个快充USB口，2个普充USB，本身可以连接2.4g网络，远程控制，断电记忆。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/x7ZSCJRqfu6kTKe.png)

然后他可以接入米家，就能智能控制了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/HW3JfmVkcA6Ks2I.png)



缺点嘛，我5月25号下的单，6月14号我才收到，然后快递盒子破的不成样子，真的菜。

可能的问题，如果来回切电源，切的太快了好像会导致跳闸？（我的情况是他接的另外一个小米排插直接跳了）



但总体来说远程启动电脑不再是问题了

（这里发现一个新问题，如果断电了，但是主板灯没灭，电容还有电，此时直接重新供电，这时无法启动。一定要主板耗尽电容里的电，然后再供电才能自动启动，这个过程大概要30-60s）

同时还发现一个坑点，小米排插（老款）断电以后不能恢复供电，一定要手动按开关，简直废物。



## 米家mesh

使用`AC recovery`有一点不好，就是沙雕键盘，每次都得重新插一下才能正常识别到，可能某些外设断电再上电可能会有影响，只是没发现。

2022.12.24更新

> https://item.taobao.com/item.htm?spm=a1z09.2.0.0.3aa32e8dpd1cS2&id=686930830876&_u=o1g76mj9ff46

简单说用个ESP32，然后做个底板，模仿PCIE的接口用来供电，然后给出引脚可以插主板的Power Switch，同时还多一组IO可以将原本的重新接回去，不影响实体按键，直接模拟实际按键进行开机、关机。

```
机箱按键引脚接->ESP32---ESP32另外2个引脚->主板开机引脚
```



- 这个东西必须要有mesh网关才能正常使用，否则只能蓝牙直连

![](https://img.elmagnifico.tech/static/upload/elmagnifico/RLhYevtpcKSrEwD.png)

需要注意如果没有多余的PCIe的红色短接口，用黄色的长接口也可以正常使用

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212242244459.png)



我还顺带买了无线开关，这样就可以用无线按钮（电脑可以放的比较远），远程的时候直接通过米家开机

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212242240342.png)



![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212242241095.png)



顺带实现了一个小智能触发，下班时间段如果发现有人移动，自动开机

![image-20230419102030846](https://img.elmagnifico.tech/static/upload/elmagnifico/202304191020912.png)



## Summary

基本上网上能看到的无线网络唤醒的例子或者视频都看过了，要么是帖子里语焉不详，我可以，我没问题，你有问题；要么就是视频模糊的要死，关键地方或者操作都马赛克，根本无法验证他是无线网络唤醒还是有线唤醒的。

而询问ASUS官方客服，也只能说WoLan试过，可以唤醒，但是WOWLan就不行了（我试过几次客服，基本都是套话，他们不是专业技术），于是客服帮我升级联系到技术那边了，然后等来的回复就是华硕主板没有任何无线唤醒的教程或者用例，具体要问无线的厂家。等于我没问。



至于其他能成功的人，大概率是出厂就带有无线网卡的主板，可能这个功能是正常的，经过测试的。而有些笔记本自带的无线网卡也是ok的，也能被唤醒（毕竟笔记本不会断电，有很多后门可以走）。至于其他的可以无线网络唤醒的，我猜如果是服务器级别，可能这个功能更好用一些，但是到消费级的时候可能就不行了。



## Quote

> https://www.cnblogs.com/sjqlwy/p/up_wol.html
>
> http://blog.chinaunix.net/uid/1784963/year-201311-list-1.html
>
> https://linustechtips.com/topic/1139953-configuring-wake-on-wireless-lan-wowlan/
>
> https://community.intel.com/t5/Wireless/dual-band-wireless-ac-8265-will-not-stay-asleep-WOWLAN-issues/td-p/715554?profile.language=es




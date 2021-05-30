---
layout:     post
title:      "CSR蓝牙适配器在windows上模拟NS手柄"
subtitle:   "controller,bluetooth dongle"
date:       2021-05-30
update:     2021-05-30
author:     "elmagnifico"
header-img: "img/pen-head-bg.jpg"
catalog:    true
mathjax:    false
tags:
    - NS
---

## Foreword

之前说过[ぼんじり](https://twitter.com/_3z8?s=20)搞出了一个新东西，用windows下CSR蓝牙直接模拟ns手柄。最初开始研究模拟手柄的时候都考虑过用蓝牙直接模拟，但是问题很多，ubuntu等linux下最高权限可以用一些开源库直接调用蓝牙驱动，只要芯片支持就可以完全模拟hid设备。但是windows这边就比较复杂了，windows拿到驱动级别的权限很麻烦，而且也没啥人熟悉windows的驱动编程，更别说还是蓝牙驱动了。所以windows的探索之路基本早早就死刑判定了，没啥人研究。

没想到过了一年，竟然有人把windows下的给搞出来了（仔细想一想肯定可以搞，蓝牙驱动本身调试阶段肯定要用一些特殊驱动，把蓝牙转成串口之类的东西来模拟操作或者debug，只是这个驱动可能都在专业人手里，不熟悉的根本拿不到）



## 设备需求

蓝牙适配器，最好直接买这个绿联的4.0，5.0可能不行，因为有驱动芯片的要求，有些芯片可能驱动不同，无法适配

<img src="https://i.loli.net/2021/05/30/ihJtnwUuOx7WC9y.png" alt="image-20210530132407096" style="zoom:80%;" />

芯片要求是CSR8510，也有可能叫CSR8510 a10（驱动对应a10的称呼）

<img src="https://i.loli.net/2021/05/30/mcEnJljp864bu2L.jpg" alt="img" style="zoom:50%;" />



## 软件

蓝牙控制有两个软件可以用。



#### AutoTalismanMelding

> https://drive.google.com/drive/folders/1iMORqLJzt35WOH1e5-2FpvnDm5JzgY-a

这个其实是给怪物猎人崛起（后面简称mhr）融珠子用的，但是作为使用入门足够了。

![image-20210530144148473](https://i.loli.net/2021/05/30/M6XyDJAeazY41KO.png)

首先第一次使用，需要安装第三方驱动替换原版的CSR蓝牙驱动（当然这样CSR的蓝牙就不能用了，但是如果你还有其他蓝牙，那不影响）

点击1，然后就能看到这里有一个对应的设备显示，如果蓝牙不符合要求，这里不会显示的。

![image-20210530144428239](https://i.loli.net/2021/05/30/m2VlhEAR6Jfp59i.png)

选中，点右下角替换当前驱动，提示选择是

![image-20210530144447111](https://i.loli.net/2021/05/30/P3dFS9pycCefXNm.png)

正常安装后就能在设备管理器中看到，CSR8510 A10的串口设备了。

![image-20210530144520281](https://i.loli.net/2021/05/30/HZGYg8MRcTvzxEe.png)

再回到主界面，切换到了Bluetooth，点击2连接（此处没有任何提示），打开NS，手动点开手柄-更改握法/顺序，过一会，会自动显示有一个手柄连接上了。（第一次按A退出匹配界面，可能会有点延迟，要按2下才有反应）

![image-20210530144706146](https://i.loli.net/2021/05/30/TR9uiyCh58JYkGo.png)

然后点击主界面3，按下A键。对应NS的A键被按下了，手柄匹配界面就消失了。

这个时候其实手柄就可以正常工作了。

![image-20210530144936042](https://i.loli.net/2021/05/30/QHcETJSVdq41ng7.png)

对应按下上面的功能，可以看到NS这边已经在运行了。

由于我没有mhr，所以这个实际运行的脚本功能，我没法用，但是手柄肯定是模拟成功，可以操控NS了。



#### NX Macro Controller Installer

> https://drive.google.com/drive/folders/199gVtGI1NMfFpoC-vtvXJju_KeUUtf_l

AutoTalismanMelding只能给mhr用，而想像伊机控一样，任何游戏都能用，就得用到NX Macro Controller Installer了。

同理，如果第一次使用，驱动都没安装的话需要像AutoTalismanMelding一样，点1，然后安装一下CSR驱动

![image-20210530145540787](https://i.loli.net/2021/05/30/By5uKd8gIZTnzC7.png)

后面安装好了以后，就可以直接2，bluetooth无线连接，然后NS那边切换到手柄-更改握法/顺序,等一下就会匹配了。

然后点开3，可以看到对应的按键映射，相当于是你键盘按了什么，对应模拟手柄就按了什么。

![image-20210530145722412](https://i.loli.net/2021/05/30/XWtiwJ7Lld5ZFjU.png)

设置好了以后，键盘控制，试一下就行了。（第一次按A退出匹配界面，可能会有点延迟，要按2下才有反应）



NX Macro Controller Installer 比较像伊机控，可以自己编写脚本，点击入力辅助，可以弹出来输入框，点击对应的操作就可以记录下来脚本了。然后执行即可，当然也可以像伊机控一样直接通过键盘操作录制脚本。

![image-20210530150021347](https://i.loli.net/2021/05/30/ERiIoyf5pwYgsX8.png)



##### 缺点

- 缺少伊机控的复杂命令，变量，条件判断等内容
- 蓝牙本身的稳定性比单片机usb连接还是差一些
- 控制ns的时候，失去原版蓝牙的功能



##### 优点

- 简单，没有单片机那么多需要diy的地方
- 标准，只要你是同款蓝牙适配器都可以用
- 便宜，不会被奸商哄抬物价
- 多用途，就算不拿来当ns手柄用了，也可以当个普通蓝牙用



## 恢复

如果要恢复CSR蓝牙适配器的功能，直接卸载驱动即可，然后重新插入或者扫描一下即可

![image-20210530151513361](https://i.loli.net/2021/05/30/N4Sg1JEPbMp8wTW.png)



## 视频流程

<iframe src="//player.bilibili.com/player.html?aid=803291072&bvid=BV1Ry4y1g7FT&cid=346268975&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="640px" height="480px"> </iframe>



## Summary

总体来说还是挺有意思的，后面会反编译一下看看源码和驱动是什么，有可能的话直接集成到伊机控那边去。



## Quote

> https://bzl.hatenablog.com/entry/2021/05/09/172646
>
> https://bzl.hatenablog.com/entry/2020/12/13/204230


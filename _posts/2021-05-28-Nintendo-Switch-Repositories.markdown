---
layout:     post
title:      "Nintendo Switch相关的代码仓库介绍"
subtitle:   "crack,dock,pro controllor"
date:       2021-05-28
update:     2021-05-28
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.png"
catalog:    true
mathjax:    false
tags:
    - Nintendo Switch
---

## Foreword

Nintendo Switch 相关的仓库有很多，但是可能你不知道就不知道了，这里总结一下，有的值得关注，有的可能太老了，早就停止维护了，有的可能还更新，只是非常偶尔了。

圈子太小了，偶尔有一些突破性的东西，不经常搜可能不知道。



## 逆向工程

#### Nintendo_Switch_Reverse_Engineering

算是最有名的仓库了，参与者非常多，有一些讨论长期有效，有问题艾特一下本人也能得到一些回应。

> https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering

这个仓库大概介绍了以下内容：

- switch使用了的一些芯片手册
- joycon的伪装读写器，固件，伪装程序的固件
- SPI通信的一些流程的数据
- 蓝牙、usb通信流程，信息包解
- joycon的引脚定义



我当初主要是看蓝牙相关的内容，反复看了好几次才看明白usb还有蓝牙他们的通信流程。



一些值得一看的issue，很多人在讨论，可以看看是否有自己寻找的

> https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering/issues/7



## Controllor 相关

主要是关于ns手柄，pro，joy-con相关的仓库



#### jc_toolkit

> https://github.com/CTCaer/jc_toolkit

joy-con的工具，可以用pc来修改joy-con的一些属性



#### Switch-Fightstick

> https://github.com/progmem/Switch-Fightstick

这个算是所有单片机模拟手柄的爷爷了，很多都是基于这个版本的。



> https://github.com/bertrandom/snowball-thrower

塞尔达推雪球，我之前的自动脚本也是基于此开始的



> https://github.com/shinyquagsire23/Switch-Fightstick

Splatoon 的自定义绘图



> https://github.com/elmagnificogi/nintendo_switch_auto_ctrl_script

我的，写了好几个宝可梦脚本，极致性能。



#### BlueCubeMod

> https://github.com/NathanReeves/BlueCubeMod

基于ESP32的蓝牙模拟普通手柄协议（不是pro），实际使用丢包挺严重的



> https://github.com/elmagnificogi/NS_joycon_auto_script_esp32

我基于BlueCubeMod的改版，修改成串口实时控制，修复BlueCubeMod的断连问题，同时多倍发包，提高整体稳定性。

整体比单片机性能差，但是比手机模拟pro要强一些，本体上还是很原始的阶段，由于esp-idf官方仓库说近期要支持classic hid，然后一等就是1年，没了下文，性能又不如单片机，导致后来弃坑了。只是图方便可以捡起来继续用。



但是我们基于ESP32有一个基础，修改了esp-idf库，让他能实现classic的HID设备，但是这个仓库有个bug，会导致内存溢出

> https://github.com/NathanReeves/esp-idf

我又修复了一个版本

> https://github.com/elmagnificogi/esp-idf



#### bluez-ns-controller

> https://github.com/mumumusuc/bluez-ns-controller

也是用蓝牙模拟pro手柄，不过他是在linux下或者支持bluez5的平台中使用，比如树莓派什么的。

作者人很好，那会指导了我很多协议方面的问题。



## 伊机控

> https://github.com/nukieberry/PokemonTycoon/tree/dev

之前介绍过了，PC端的NS按键精灵

> http://elmagnifico.tech/2020/08/05/NintendoSwitch-EasyCon/



## 宝可梦

宝可梦相关的仓库,下面是一些乱数工具的仓库

> https://github.com/rusted-coil/OneStar
>
> https://github.com/Leanny/leanny.github.io
>
> https://github.com/Leanny/SeedSearcher
>
> https://github.com/Admiral-Fish/RaidFinder



## Discord

一些值得关注的discord



> [discord.gg/FFepuDW](https://t.co/6WAsw6xNEC?amp=1)

乱数佬的大群，主要说日语



> https://www.discord.gg/d8JuAvg

乱数佬的小群，主要说英语



> https://discord.gg/gu6GMqa9

Joy-Con Droid的群，主要就是手机模拟pro app的群，有很多脚本作者或者是开发者在其中



## Twitter

twitter关注的比较少



> https://twitter.com/_3z8?s=20

这个人，ぼんじり，他是另外一个不开源的乱数软件（S.W）的作者，挺牛逼的，他的工具写的比较好一些，追求极致的性能。

最近还搞出来了一个windows下使用蓝牙dongle来模拟ns手柄的驱动，很猛。

他的blog，全日语的，他也有一个类似伊机控的软件，刚开始写的不行，后来慢慢比伊机控还牛逼了吧。

> https://bzl.hatenablog.com/

当然他也有些槽点，他代码根本没有国际化，不开源，sw英文版完全是硬编码进去的，而且还绑定了操作系统语言等等（别人反编译做翻译都贼麻烦）。同时完全不回复任何用英文跟他沟通的人，还必须得用日语。



## Summary

看情况维护，如果我新认识了一些库，也会继续加到这篇文章中。

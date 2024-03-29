---
layout:     post
title:      "ESP32与C#的串口流控导致的重启问题解析"
subtitle:   "EasyCon,joycontrol,nxbt"
date:       2022-09-12
update:     2022-09-12
author:     "elmagnifico"
header-img: "img/welding3.jpg"
catalog:    true
tags:
    - ESP32
    - C#
---

## Foreword

遇到一个奇葩问题，ESP32的板子接入串口的时候会自动重启



## 板子

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202209120023808.png)

主要就是这个板子，看他便宜，ESP32-WROOm-32



## 现象

当板子第一次插上USB，然后使用C#串口打开对应的串口时，就会出现板子自动重启的现象

代码非常简单，运行到open，就必然触发重启。

```c#
            _sport.StopBits = StopBits.One;
            _sport.Parity = Parity.None;
            _sport.DataBits = 8;
            _sport.Handshake = Handshake.None;
            _sport.DtrEnable = false;
            _sport.RtsEnable = false;

            _sport.Open();
```

但是当重启以后，后续再打开也不会触发板子重启



## ESP32的流控制

ESP32确实可以通过串口的流控制来让板子重启并进入boot，从而触发烧写等操作。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202209120028051.png)

通过电路可以看出来，只要控制DTR和RTS就能实现板子的上电和下电操作，非常简单。

同时ESP32自己的烧写工具，也是通过这个方法来实现烧写的。



C# 这边流控制协议是通过Handshake来实现的，理论上就四种情况，并且我也设置了None，也就是不适用流控制。

```c#
    public enum Handshake
    {
        None,
        XOnXOff,
        RequestToSend,
        RequestToSendXOnXOff
    }
```

却依然导致板子上下电。当我看到了下面的帖子发现，也有其他人遇到了相同的问题。

> https://esp32.com/viewtopic.php?f=30&p=47431

但是有一点使用SSCOM的时候，并不会导致板子上下电，而使用C#就会。为了排除是我写的有问题，专门试用了一个老牌的C#串口软件，发现他也一样会触发板子重启。

但是此时问题就来了为什么C#明明没有触发上下电，也没有流控制，会导致板子重启呢。



## 电路对比

运气比较好，我有2块板子，虽然不太一样，但是另外一块相同代码下完全不会触发

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202209120039875.png)

左侧是便宜的有问题的，右侧是Lily Go的板子。都是三极管处理的，但是质量并不同。

同时左侧使用的是CH340，而右侧是CP2104。我看过乐鑫官方的原理图，使用的是CP2102



## 猜测

> https://www.sparxeng.com/blog/software/must-use-net-system-io-ports-serialport

猜测是C#的`System.IO.Ports`库有问题，连带着串口的底层实现不正确，特别是open串口的时候。看到有个例子说串口打开的时候必然是`Xon/Xoff`，然后要等一会或者下次打开这个才会正常。

结合这里遇到的情况，猜测初次上电后，open会将IO从高阻态切换到高或者低电平，但是这会引起一个小小的抖动，便宜的板子扛不住这种小抖动，会造成GPIO0和EN被触发导致重启，当open过后，由于IO已经处于这个水平了，之后再次open就没有抖动了，所以不会重启了。

同比Lily Go的板子由于自带屏蔽了，所以不会受到这个小抖动的影响。

所以造成问题的根源应该是C#的底层实现初始化的时候USB协议沟通有问题，导致CH340触发了串口的硬件流控制，而便宜的板子又刚好不能抗住这个干扰，进而出现重启。



用SSCOM不触发重启，SSCOM打开发完信息以后，再切换成python发送信息，当场重启....

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202209122120737.png)

而如果插上以后，只用python打开过，那么就不会触发重启。



要具体解这个问题，应该需要Debug USB协议和Windows系统的IO log，这方面我暂时还不会，只能放弃。



## Summary

便宜没好货，也有可能是用的料太差了，根本达不到实际的要求，这种问题真的难查



## Quote

> https://blog.csdn.net/qq_37388044/article/details/111035944
>
> https://social.msdn.microsoft.com/Forums/en-US/f5ce0ec8-d128-4381-a87e-05111851ace7/serialport-xonxoff-handshake-state?forum=netfxcompact
>
> https://esp32.com/viewtopic.php?f=30&p=47431

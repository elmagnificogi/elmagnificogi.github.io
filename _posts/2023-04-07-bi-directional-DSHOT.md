---
layout:     post
title:      "单线DSHOT with RPM feedback全指南"
subtitle:   "bi-directional DSHOT，双向DSHOT"
date:       2023-04-07
update:     2023-04-07
author:     "elmagnifico"
header-img: "img/x1.jpg"
catalog:    true
tags:
    - DSHOT
    - BLHeli
---

## Foreword

很久之前写过DSHOT，这次捡起来实现单线DSHOT

> https://elmagnifico.tech/2020/06/03/DSHOT-STM32-PWM-HAL/

单线DSHOT由于单线复用，实现起来非常麻烦，要考虑的东西很多。而相关文章又非常少，只能挨个翻看git issues，搜索零星的信息组合在一起。

某种程度上说DSHOT+BLH ESC有点类似现在的FOC驱动器，只不过是比较挫、弱化版、便宜版的FOC，任何使用BLH ESC的电机都能使用的。

当然实际的DSHOT，无法精准控制电机的转速，得到的电机转速也是有限制的，不能趋近于0



## bi-directional DSHOT

> https://github.com/betaflight/betaflight/pull/8554#issuecomment-512507625

总结一下，这是birdir-DSHOT初次实现，反转了DSHOT协议，并且有些和标准的DSHOT实现是不一样的，其实可以认为是一个变种DSHOT，后续这种DSHOT也被BLH的最新固件支持，变成了DSHOT的基础实现。其实这个PR还有一个点也非强，他兼容了BLHS，以前老的16位单片机也能用上DSHOT，也能使用转速反馈，非常牛逼了。



#### 代码分析

```c
FAST_CODE uint16_t prepareDshotPacket(dshotProtocolControl_t *pcb)
{
    uint16_t packet;

    ATOMIC_BLOCK(NVIC_PRIO_DSHOT_DMA) {
        packet = (pcb->value << 1) | (pcb->requestTelemetry ? 1 : 0);
        pcb->requestTelemetry = false;    // reset telemetry request to make sure it's triggered only once in a row
    }

    // compute checksum
    unsigned csum = 0;
    unsigned csum_data = packet;
    for (int i = 0; i < 3; i++) {
        csum ^=  csum_data;   // xor data by nibbles
        csum_data >>= 4;
    }
    // append checksum
#ifdef USE_DSHOT_TELEMETRY
    if (useDshotTelemetry) {
        csum = ~csum;
    }
#endif
    csum &= 0xf;
    packet = (packet << 4) | csum;

    return packet;
}
```



飞控发送 DSHOT帧，但是最低的4bit，与另外4bit做异或

如果ESC检测到了这个情况，也就是最低一字节的上半字节和下半字节是异或关系，那么就会发送一个telemetry 包



然后这个telemetry包是这么解析的

```
c c c c e e e m m m m m m m m m
```

前4个c是异或和的校验码

中间3个e是预周期的位移量，叫做左移位数E

最后9个m是预周期值，这个值需要左移E次，才能得到实际的周期数值



这样实现了仅仅用12位表示接近16位整数的范围的值，实际能表示大概为1-65408，对应可以测量到的电机最小转速就是`1000000/65408=15.28886Hz`

然后这个16bit的数值，会被GCR转换成20bit，转成的20bit，还非常特殊，他会让二进制中不会出现两个连续的0



#### 死区

显然，用单线做收发，不可避免地要遇到死区的问题，PWM的死区比普通GPIO好一点，是相对优化过的，但是普通GPIO，从输出转换到输入，需要一定时间，并且连接的器件也要同时切换，否则有可能出现小短路的情况。



#### 名词解释

- GCR，应该是一种编码方式，可以用来扩大数值所需要的bit数或者缩小数值所需要的bit数
- bit bang/bit-bang 其实就是GPIO，比如软I2C，软SPI，这种用普通GPIO模拟某种协议的方式，就叫bit-bang
- 3x，一般来说如果你想解码一个信号，最低要求你获取信号的频率是原始信号的3倍，你才能得到一个比较好的解码效果
- 5/4，其实就是逆GCR，扩大数值的bit数
- bidir DSHOT，双向DSHOT，也就是单线DSHOT，实现转速可读
- Run-length limited，其实就是在带宽有限的通信链路上，如何压缩数据，并且还能保证数据长度的传输方式
- eRPM，电调回传的是磁极数，电机上磁极一定是成对出现的，一般电机是14或者12个，对应的数值也就需要/7或者/6得到RPM数



#### 实现方式

一般来说DSHOT都是通过PWM+DMA实现的，但是众所周知H7以下的STM32板子DMA通道都是固定的，如果一开始设计的时候没有考虑到这个事情，就很有可能会出现DMA冲突，PWM+DMA实现不了，进而导致DSHOT无法使用，也就没法推进了。



看了一下老的issues，发现他们提出来了一种解决办法，通过普通GPIO+DMA实现DSHOT，这相当于是说就算PWM用不了，他也能直接做GPIO去实现，或者直接利用空闲的GPIO实现DSHOT，而不需要被DMA或者PWM通道绑定给卡住。



## Run-length limited

几种常见的压缩方式



## 其他相关问题

如果ESC种设置了，`Auto Telemetry`，那么如果不使用Dshot协议，这个Telemetry也会自动返回相关信息，所以对其他协议更友好了。

![image-20230407182415582](https://img.elmagnifico.tech/static/upload/elmagnifico/202304071829272.png)

> https://github.com/iNavFlight/inav/issues/5165



单线Dshot 由于检测时间比较少，Dshot 600 出现了大量报错，导致Betaflight直接不再支持Dshot 600

> https://github.com/bitdump/BLHeli/issues/464
>
> https://github.com/betaflight/betaflight/issues/9886#issuecomment-655085419



## esc configurator

> https://esc-configurator.com/
>
> https://github.com/stylesuxx/esc-configurator

发现个有意思的，有人写了blh的配置器，还是web版本的，还开源，~~想想我的逆向，想死~~

仔细看了下是中转协议，也就是通过Betaflight传递的，所以并没有实现直接配置。



## Summary

未完待续



## Quote

> https://www.bilibili.com/read/cv16042826/
>
> https://github.com/betaflight/betaflight/pull/8554
>
> https://zhuanlan.zhihu.com/p/520878086
>
> https://en.wikipedia.org/wiki/Run-length_limited#GCR:_(0,2)_RLL
>
> https://github.com/iNavFlight/inav/issues/2710
>
> https://github.com/iNavFlight/inav/issues/5165
>
> https://github.com/iNavFlight/inav/pull/5674
>
> https://youtu.be/sPktdBh2Gcw
>
> https://github.com/mathiasvr/bluejay/issues/1
>
> https://github.com/bitdump/BLHeli/issues/513
>
> https://betaflight.com/docs/wiki/archive/DSHOT-ESC-Protocol
>
> https://betaflight.com/docs/development/Dshot
>
> https://betaflight.com/docs/tuning/4.2-Tuning-Notes#dshot-settings


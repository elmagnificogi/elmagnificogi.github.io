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



birdir-DSHOT的一些特性

- 单线
- Telemetry 只有转速信息
- 校验位和正常的是反的
- DSHOT 600 及以上不太支持，实现困难



#### 代码分析

查看Betaflight中关于Dshot部分的源码，默认开启了`DSHOT_TELEMETRY`就会使用bi-directional DSHOT

```c
FAST_CODE uint16_t prepareDshotPacket(dshotProtocolControl_t *pcb)
{
    uint16_t packet;

    ATOMIC_BLOCK(NVIC_PRIO_DSHOT_DMA) {
        packet = (pcb->value << 1) | (pcb->requestTelemetry ? 1 : 0);
        pcb->requestTelemetry = false;    // reset telemetry request to make sure it's triggered only once in a row
    }

    // 这里求解出来普通Dshot的后4位的异或和
    // compute checksum
    unsigned csum = 0;
    unsigned csum_data = packet;
    for (int i = 0; i < 3; i++) {
        csum ^=  csum_data;   // xor data by nibbles
        csum_data >>= 4;
    }
    // append checksum
#ifdef USE_DSHOT_TELEMETRY
    // 一旦使用了Telemetry 就会反转后四位
    if (useDshotTelemetry) {
        csum = ~csum;
    }
#endif
    csum &= 0xf;
    packet = (packet << 4) | csum;

    return packet;
}
```

飞控发送 DSHOT帧，但是最低的4bits=其他4bits做异或和，再取反

如果ESC检测到了这个情况，也就是最低4bits是反的，就会切换模式在同一根线上发送一个Telemetry帧



```c

```

然后这个telemetry包是这么解析的，Telemeter的原始数据，一共是21bits，其中第一bit一定是0，表示数据开始，而之后紧跟的20bits，其实是每4bits使用GCR转换成的，也就是每5bit解析成一个4bits，然后重新组装

```
0 aaaa bbbbb fffff ddddd
c c c c e e e m m m m m m m m m 解码后原始16bits
```



```
c c c c e e e m m m m m m m m m 解码后原始16bits
e e e m m m m m m m m m 校验成功以后的转速数据 12bits
```

前4个c是异或和的校验码

中间3个e是预周期的位移量，叫做左移位数E

最后9个m是预周期值，这个值需要左移E次，才能得到实际的周期数值



如果仅仅使用12bits来表示转速，还是有点不够，最低转速太高了（主要是这里定义的是两个电极之间的延迟，而不是直接的转速，这样实时性比较高，12bit最大就是4096us，算下来大概最低能检测转速是244RPM，还是很快的）

```c
static uint32_t dshot_decode_eRPM_telemetry_value(uint16_t value)
{
    // eRPM range
    if (value == 0x0fff) {
        return 0;
    }

    // Convert value to 16 bit from the GCR telemetry format (eeem mmmm mmmm)
    value = (value & 0x01ff) << ((value & 0xfe00) >> 9);
    if (!value) {
        return DSHOT_TELEMETRY_INVALID;
    }

    // Convert period to erpm * 100
    return (1000000 * 60 / 100 + value / 2) / value;
}
```

通过次方表示，这样实现了仅仅用12位表示接近16位整数的范围的值，实际能表示大概为1-65408，对应可以测量到的电机最小转速就是`1000000/65408=15.28886` 对于14电极的电机来说，大概相当于是转了2圈，2RPM



#### 死区

显然，用单线做收发，不可避免地要遇到死区的问题，PWM的死区比普通GPIO好一点，是相对优化过的，但是普通GPIO，从输出转换到输入，需要一定时间，并且连接的器件也要同时切换，否则有可能出现小短路的情况。



#### 名词解释

- GCR，应该是一种编码方式，可以用来扩大数值所需要的bit数或者缩小数值所需要的bit数
- bit bang/bit-bang 其实就是GPIO，比如软I2C，软SPI，这种用普通GPIO模拟某种协议的方式，就叫bit-bang
- 3x，一般来说如果你想解码一个信号，最低要求你获取信号的频率是原始信号的3倍，你才能得到一个比较好的解码效果
- 5/4，GCR编码从4bits变成了5bits，所以传输速度就提升了
- bidir DSHOT，双向DSHOT，也就是单线DSHOT，实现转速可读
- Run-length limited，其实就是在带宽有限的通信链路上，如何组织数据，从而提高数据传输速度
- eRPM，电调回传的是磁极数，电机上磁极一定是成对出现的，一般电机是14或者12个，对应的数值也就需要/7或者/6得到RPM数



#### 实现方式

一般来说DSHOT都是通过PWM+DMA实现的，但是众所周知H7以下的STM32板子DMA通道都是固定的，如果一开始设计的时候没有考虑到这个事情，就很有可能会出现DMA冲突，PWM+DMA实现不了，进而导致DSHOT无法使用，也就没法推进了。



看了一下老的issues，发现他们提出来了一种解决办法，通过普通GPIO+DMA实现DSHOT，这相当于是说就算PWM用不了，他也能直接做GPIO去实现，或者直接利用空闲的GPIO实现DSHOT，而不需要被DMA或者PWM通道绑定给卡住。



## Run-length limited

几种常见的编码方式



FM:(0,1) RLL，这种方式看起来只是多了一个`1`，实际上这个1可以作为时钟的`1`，从而可以形成差分编码的方式，这种方式让编码变长了。

其实是当年FM调配的物理实现有些不同，物理上写1的频率是写0的两倍，所以这里增加`1`刚好满足了写1的速度，让两边可以同步控制

```
0 -> 10
1 -> 11
```



GCR:(0,2) RLL，这个是IBM提出来的一种编码方式，主要是用来提高传输的速率，通过这种编码方式，将最多相邻的0，控制在了2个以内，从而提高了传输速度

```
0000 -> 11001
0001 -> 11011
0010 -> 10010
0011 -> 10011
0100 -> 11101
0101 -> 10101
0110 -> 10110
0111 -> 10111
1000 -> 11010
1001 -> 01001
1010 -> 01010
1011 -> 01011
1100 -> 11110
1101 -> 01101
1110 -> 01110
1111 -> 01111
```



比如传输下面的数据

```
1011 0010 -> 01011 10010
```

![image-20230410175001637](https://img.elmagnifico.tech/static/upload/elmagnifico/202304101750726.png)

就变成了图中所示情况



## 其他相关问题

如果ESC种设置了，`Auto Telemetry`，那么如果不使用Dshot协议，这个Telemetry也会自动返回相关信息，所以对其他协议更友好了。

![image-20230407182415582](https://img.elmagnifico.tech/static/upload/elmagnifico/202304071829272.png)

> https://github.com/iNavFlight/inav/issues/5165



单线Dshot 由于检测时间比较少，Dshot 600 出现了大量报错，导致Betaflight直接不再支持Dshot 600

> https://github.com/bitdump/BLHeli/issues/464
>
> https://github.com/betaflight/betaflight/issues/9886#issuecomment-655085419







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


---
layout:     post
title:      "i.MXRT1xxx系列启动分析"
subtitle:   "MXRT1052，BootROM，BootMode"
date:       2023-01-07
update:     2023-02-08
author:     "elmagnifico"
header-img: "img/bg8.jpg"
catalog:    true
tags:
    - Embedded
    - NXP
---

## Forward

与ST对比，i.MXRT1xxx系列的启动方式和流程都有很大不同，对比ST来说有一部分可以说相对麻烦。



## Armv7-M Address Map

![image-20230107154323300](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071543512.png)

一般来说 `0x00000000-0x1FFFFFFF`的范围程序ROM的地址，SRAM都是从`0x20000000-0x3FFFFFFF`开始的，一般这个空间上的RAM都是片内的RAM，之后紧接着的就是片上外设的地址。`0x60000000-0x7FFFFFFF`一般IMXRT系列用的外部RAM都分配在这个区域



对于ST来说官方提供了BootROM，也就是常用的ISP下载，提供了BootMode，可以选择是从官方Boot启动还是自定义启动，到了F7H7的时候，直接给了用户自定义启动地址。一般来说可以从内部Flash或者官方ROM启动，视为一级启动，即可以不借助其他设备的情况下直接启动。而SRAM或者是外部Flash启动，则是二级启动，是需要提前被写好的程序引导启动的，而不能独自完成启动。

IMXRT系列基本都是没有内部Flash的，所以他们都是二级启动，需要在执行内部Flash之前，先走一次引导程序。IMXRT也同样有BootROM，也支持ISP下载等。



## IMXRT Bootloader

不同的芯片外接的Flash芯片不同（NOR、NAND、SD Card、eMMC等），具体的Boot程序就需要先初始化芯片，让他能读写才行。这就导致了实际使用的时候要根据不同芯片，写不同的设置。如果是NAND Flash 就需要先copy到SRAM，然后才能执行，而NOR Flash就可以直接加载执行了。

同理，如果芯片没有内部SRAM，那么所用的外部RAM就也需要初始化，不过IMXRT 都是有内部SRAM的，这个问题就可以延后考虑，等系统起来以后再去初始化外部RAM什么的。

结合不同的Boot Mode、不同的Boot CFG以及Fuse中的配置，最终芯片可以通过不同的DCD配置，实现从不同的Flash中启动。



#### Memory Map

存储器一般可以分成8块，每块各自还有细分

![image-20230208155103118](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230208155103118.png)

0，一般是代码存储区域，片内存储，比如bootload

1，一般是内存存储区域，片内存储

2，一般是各种外设，寄存器地址什么的

3，如果片内内存不够用，需要扩展，那么就接在这里

4，同理，如果有外部设备，分配在这里

5，6，7不太常用，跳过



细分如下

![image-20230107161931504](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071619636.png)

从参考手册里可以看到 `0x00200000-0x00217FFF`这个范围被保留了，实际上是BootROM，而他之后接着的就是ITCM区域，`0x80000000-0xDFFFFFFF`和`0x60000000-0x7F7FFFFF`则是分配给外设的区域

![image6](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301101733596.png)

（这个图是从野火等国内拿过来的，实际官方找不到这张图）

ITCM和DTCM以及OCRAM，三者的大小在芯片内部其实是可以调整的，并不是各自占用这么大，FlexRAM机制让我们可以调整这三者所占大小。



可以被Boot的设备也有说明：

![image-20230107171511088](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071715183.png)

FLEXSPI_B接口是第二优先级，所以他不能作为启动接口

![image-20230107164617417](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071646492.png)



#### BootMode

![image-20230107165157575](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071651644.png)

一般情况下使用的都是`Boot From Fuses`，Fuse中存储的是关于芯片外部存储芯片的信息，从而让芯片知道该从哪个地址启动对应的外设，从而加载应用程序。

`Serial Downloader`也就是一般的ISP下载，由于支持的外设Flash比较多，所以具体要根据不同设备去下载对应的固件。

`Internal Boot`这种方式比较像Fuse，但是他多考虑了一个Boot_CFG的配置，来决定最终启动的是什么，感觉上是产品从测试阶段转向成品时方便切换Boot配置使用的，具体的要参考手册的详细说明了。

不同的CFG最终决定不同的Flash启动

![image-20230107171151496](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071711577.png)



#### Boot Fuse

Boot Fuse的具体配置比较复杂，根据外设的不同，Fuse中的很多设置也不一样。

![image-20230107171825262](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071718366.png)



#### Flexspi Nor SRAM示例分析





## Summary

未完待续



## Quote

> https://www.cnblogs.com/henjay724/p/9031655.html
>
> https://www.cnblogs.com/henjay724/p/9034563.html
>
> https://www.lmonkey.com/t/wLnkrWdBg


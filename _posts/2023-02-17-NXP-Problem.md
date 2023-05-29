---
layout:     post
title:      "NXP系列容易混淆的问题"
subtitle:   "MXRT1052，CFX，下载算法"
date:       2023-02-17
update:     2023-05-29
author:     "elmagnifico"
header-img: "img/bg4.jpg"
catalog:    true
tags:
    - Embedded
    - NXP
---

## Foreword

我开发的过程中也遇到了一堆堆的问题，看了好几个文档，没有一个说清楚的，所以自己总结一下，防止后人被坑



## DAP-Link与J-Link

默认MIMXRT1xxxx系列都有一个EVK的板子，一般情况下这个板子默认都带有DAP，官方推荐的调试下载也都是基于DAP-Link来说的。

DAP-Link开源，免费，对于厂商来说当然是愿意选择的，不用给J-Link付费，那可太好了。

但是DAP-Link不好的地方在于，它具有单一性，不通用，你有N家的板子就得有N个不同的DAP-Link，对于开发者来说，那当然很讨厌啊。



J-Link通用，但是NXP默认支持的都不是J-Link，MCUXPresso IDE 默认的也不是J-Link，甚至它的很多设置，看似是通用的，实则是只有DAP可以使用。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302171510329.png)

比如工程配置中的Flash驱动选择和他的算法，只有DAP才生效，用JLink，完全不起作用。可以看到很多教程都是教你用DAP，配好就能烧写，就能调试，而如果用J-Link，直接就不能用。



#### J-Link解决方案

新版J-Link驱动直接兼容所有QSPI芯片，没必要第三方了

~~这里就要推一下痞子衡做的工具了，还是非常好用的~~

> ~~https://github.com/JayHeng/RT-UFL~~

~~RT-UFL，这个是给J-Link写的下载算法，添加到J-Link驱动以后，J-Link就直接支持各种NXP芯片适配的各种Flash下载了。再也不会被卡了。~~

~~RT-UFL安装教程看这里，其实很简单，直接解压放进去就行了~~

> ~~https://www.cnblogs.com/henjay724/p/14942574.html~~



~~MCUXPresso IDE下使用看这里，主要就是给J-Link设置一下芯片型号就行了。~~

> ~~https://www.cnblogs.com/henjay724/p/15430619.html~~



~~关键点就只有一个，Device 这里手动输入，默认选项中根本没有具体的算法~~

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302171515959.png)



## HyperFlash与QspiFlash

这里也是容易弄错的地方，QSPI、OctalFlash、HyperFlash、EcoXipFlash等，他们都是不同类型的Flash，不同的Flash在烧写编程的细节上会略有不同，所以烧写的时候会针对性的做区分。

目前常用的一般就是Hyper和QSPI，其他的类型比较少见。现在只是基于类型来说，比较笼统，具体到烧写阶段的时候，一般需要烧写器（J-Link）做区分，比如Hyper的有一种算法，QSPI有一种算法

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302171523511.png)

所以一般会根据实际使用的类型，选择算法，算法的Size可以往大选，但是不能往小选

也有教程教你怎么自己写一个烧写算法，从而完成对不同种类的Flash进行烧写。

这个算法文件在Keil是`.FLM`后缀，在MCUXPresso IDE中是`.cfx`后缀，一般来说QSPI就能通用到所有QSPI类型的Flash上了，同理Hyper也是。在MCUXPresso IDE中基本也是这样的，EVK算是特例了（其实也能支持的）

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302171539143.png)



#### FlashConfig

上面是具体的某类Flash，这里再谈的就是某个Flash了，同类的Flash 在初始化阶段会略有不通，寄存器可能不一样，大小也有可能不同。

如果这里写错的话，会导致烧写正确，但是无法debug，芯片也跑不起来。

```c
#if defined(HYPERFLASH_BOOT)    
const flexspi_nor_config_t hyperflash_config =
{
    .memConfig =
    {
        .tag = FLEXSPI_CFG_BLK_TAG,
        .version = FLEXSPI_CFG_BLK_VERSION,
        .readSampleClkSrc = kFlexSPIReadSampleClk_ExternalInputFromDqsPad,
        .csHoldTime = 3u,
        .csSetupTime = 3u,
        .columnAddressWidth = 3u,
        // Enable DDR mode, Wordaddassable, Safe configuration, Differential clock
        .controllerMiscOption = (1u << kFlexSpiMiscOffset_DdrModeEnable) |
                                (1u << kFlexSpiMiscOffset_WordAddressableEnable) |
                                (1u << kFlexSpiMiscOffset_SafeConfigFreqEnable) |
                                (1u << kFlexSpiMiscOffset_DiffClkEnable),
        .sflashPadType = kSerialFlash_8Pads,
        .serialClkFreq = kFlexSpiSerialClk_133MHz,
        .sflashA1Size = 64u * 1024u * 1024u,
        .dataValidTime = {16u, 16u},
        .lookupTable =
            {
                // Read LUTs
                FLEXSPI_LUT_SEQ(CMD_DDR, FLEXSPI_8PAD, 0xA0, RADDR_DDR, FLEXSPI_8PAD, 0x18),
                FLEXSPI_LUT_SEQ(CADDR_DDR, FLEXSPI_8PAD, 0x10, DUMMY_DDR, FLEXSPI_8PAD, 0x06),
                FLEXSPI_LUT_SEQ(READ_DDR, FLEXSPI_8PAD, 0x04, STOP, FLEXSPI_1PAD, 0x0),
            },
    },
    .pageSize = 512u,
    .sectorSize = 256u * 1024u,
    .blockSize = 256u * 1024u,
    .isUniformBlockSize = true,
};

#else
const flexspi_nor_config_t Qspiflash_config =
{
    .memConfig =
    {
        .tag = FLEXSPI_CFG_BLK_TAG,
        .version = FLEXSPI_CFG_BLK_VERSION,
        .readSampleClkSrc = kFlexSPIReadSampleClk_LoopbackInternally,
        .csHoldTime = 3u,
        .csSetupTime = 3u,
        .deviceModeCfgEnable = true,
        .deviceModeType = 1,//Quad Enable command
        .deviceModeSeq.seqNum = 1,
        .deviceModeSeq.seqId = 4,				
        .deviceModeArg = 0x000200,//Set QE
        .deviceType = kFlexSpiDeviceType_SerialNOR,
        .sflashPadType = kSerialFlash_4Pads,
        .serialClkFreq = kFlexSpiSerialClk_100MHz,//80MHz for Winbond, 100MHz for GD, 133MHz for ISSI
        .sflashA1Size = 4u * 1024u * 1024u,//4MBytes
        .dataValidTime = {16u, 16u},
        .lookupTable =
        {
           //Quad Input/output read sequence
           [0] = FLEXSPI_LUT_SEQ(CMD_SDR, FLEXSPI_1PAD, 0xEB, RADDR_SDR, FLEXSPI_4PAD, 0x18),
           [1] = FLEXSPI_LUT_SEQ(DUMMY_SDR, FLEXSPI_4PAD, 0x06, READ_SDR, FLEXSPI_4PAD, 0x04),
           [2] = FLEXSPI_LUT_SEQ(0, 0, 0, 0, 0, 0),
           //Read Status
           [1*4] = FLEXSPI_LUT_SEQ(CMD_SDR, FLEXSPI_1PAD, 0x05, READ_SDR, FLEXSPI_1PAD, 0x04),
           //Write Enable
           [3*4] = FLEXSPI_LUT_SEQ(CMD_SDR, FLEXSPI_1PAD, 0x06, STOP, 0, 0),
           //Write status
           [4*4] = FLEXSPI_LUT_SEQ(CMD_SDR, FLEXSPI_1PAD, 0x01, WRITE_SDR, FLEXSPI_1PAD, 0x2),
	 },
    },
    .pageSize = 256u,
    .sectorSize = 4u * 1024u,
};

#endif
```



## SES动态分配FlexRam

先说动态分配FlexRam会导致一些莫名其妙的现象，猜测和内部的ram有关系

```assembly

/* Reset Handler */

    .thumb_func
    .align 2
    .globl   Reset_Handler
    .weak    Reset_Handler
    .type    Reset_Handler, %function

Reset_Handler:
    .equ __iomux_gpr14_adr, 0x400AC038
    .equ __iomux_gpr16_adr, 0x400AC040
    .equ __iomux_gpr17_adr, 0x400AC044


    .equ __flexram_itcm_size, 0x7       
    .equ __flexram_dtcm_size, 0x8       
    .equ __flexram_bank_cfg, 0x55555FAA

    /*.equ __flexram_bank_cfg,0xAAAA5555*/
    /*.equ __flexram_itcm_size, 0x0       /*   0KB*/
    /*.equ __flexram_dtcm_size, 0x9        /* 256KB*/
    /* adjust sram */
    CPSID I                
#define FLEXRAM_CFG_ENABLE
#ifdef FLEXRAM_CFG_ENABLE
    /*分配Bank，并且激活Bank配置*/
    LDR R0,=__iomux_gpr17_adr
    LDR R1,=__flexram_bank_cfg
    STR R1,[R0]
    LDR R0,=__iomux_gpr16_adr
    LDR R1,[R0]
    ORR R1,R1,#4
    STR R1,[R0]
//#define FLEXRAM_ITCM_ZERO_SIZE
#ifdef FLEXRAM_ITCM_ZERO_SIZE
    /*禁掉ITCM*/
    LDR R0,=__iomux_gpr16_adr
    LDR R1,[R0]
    AND R1,R1,#0xFFFFFFFE
    STR R1,[R0]
#endif

#ifdef FLEXRAM_DTCM_ZERO_SIZE
    /*禁掉DTCM*/
    LDR R0,=__iomux_gpr16_adr
    LDR R1,[R0]
    AND R1,R1,#0xFFFFFFFD
    STR R1,[R0]
#endif

    /*调整TCM容量*/
    LDR R0,=__iomux_gpr14_adr
    LDR R1,[R0]
    MOVT R1,#0x0000
    MOV R2,#__flexram_itcm_size
    MOV R3,#__flexram_dtcm_size
    LSL R2,R2,#16
    LSL R3,R3,#20
    ORR R1,R2,R3
    STR R1,[R0]
#endif

    /* reset handle */
    .equ    VTOR, 0xE000ED08
    ldr     r0, =VTOR
    ldr     r1, =__isr_vector
    str     r1, [r0]
    ldr     r2, [r1]
    msr     msp, r2
#ifndef __NO_SYSTEM_INIT
    ldr   r0,=SystemInit
    blx   r0
#endif
```



这里遇到的问题是官方文档里没有解释的，在SES中全都会出现问题

OC RAM必须在`IOMUXC_GPR_GPR17`的最高位处有一块，否则会出现无法烧写、debug的情况

ITCM 必须有一块64K大小的，否则也会出现无法烧写、debug的情况



然后仔细观察Fuse中一些默认的分配方式，怀疑和这个也有关系，如果ODI没有任何顺序问题，那为什么不是OODDII呢，而是这种奇奇怪怪的分布形式

![image-20230315092647223](https://img.elmagnifico.tech/static/upload/elmagnifico/202303150935990.png)

如果使用其他IDE可以正常烧写，唯独SES无法正常处理（~~还有一种可能是痞子衡写的烧写算法有问题，默认使用了ITCM，导致实际无法正常工作~~）



## 1062和1052互相替换

经过对比，两个芯片引脚是一模一样的，1062只是多了一个CAN，多了一个以太网的口，其他硬件和外设基本是一模一样的。

如果要替换，基本可以pin2pin，直接换片子就行了。

至于工程上，只是需要把烧写目标换一下，代码等各种宏定义甚至可以不用改动就能正常工作了。



## Summary

未完待续



## Quote

> https://blog.csdn.net/l3142600073/article/details/89551508
>
> https://www.cnblogs.com/henjay724/p/15028189.html
>
> https://github.com/SphinxEVK/openMV_on_RT1064
>
> https://community.nxp.com/t5/i-MX-RT/RT1050-QSPI-flash-change-to-Winbond-W25Q32JV-3-3V/m-p/904541/highlight/true


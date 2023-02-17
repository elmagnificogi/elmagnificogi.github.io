---
layout:     post
title:      "i.MXRT1xxx系列启动分析"
subtitle:   "MXRT1052，BootROM，BootMode"
date:       2023-01-07
update:     2023-02-16
author:     "elmagnifico"
header-img: "img/bg8.jpg"
catalog:    true
tags:
    - Embedded
    - NXP
---

## Foreword

与ST对比，i.MXRT1xxx系列的启动方式和流程都有很大不同，对比ST来说有一部分可以说相当麻烦。



## Armv7-M Address Map

![image-20230107154323300](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071543512.png)

一般来说 `0x00000000-0x1FFFFFFF`的范围程序ROM的地址，SRAM都是从`0x20000000-0x3FFFFFFF`开始的，一般这个空间上的RAM都是片内的RAM，之后紧接着的就是片上外设的地址。`0x60000000-0x7FFFFFFF`一般IMXRT系列用的外部RAM都分配在这个区域



对于ST来说官方提供了BootROM，也就是常用的ISP下载，提供了BootMode，可以选择是从官方Boot启动还是自定义启动，到了F7H7的时候，直接给了用户自定义启动地址。一般来说可以从内部Flash或者官方ROM启动，视为一级启动，即可以不借助其他设备的情况下直接启动。而SRAM或者是外部Flash启动，则是二级启动，是需要提前被写好的程序引导启动的，而不能独自完成启动。

IMXRT系列基本都是没有内部Flash的，所以他们都是二级启动，需要在执行内部Flash之前，先走一次引导程序。IMXRT也同样有BootROM，也支持ISP下载等。



## IMXRT Boot启动分析

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

5，主要是内核相关的寄存器分配位置，比如滴答定时器

6，7不太常用，跳过



细分如下

![image-20230107161931504](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071619636.png)

从参考手册里可以看到 `0x00200000-0x00217FFF`这个范围被保留了，实际上是BootROM，而他之后接着的就是ITCM区域，`0x80000000-0xDFFFFFFF`和`0x60000000-0x7F7FFFFF`则是分配给外设的区域

![image6](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301101733596.png)

（这个图是从野火等国内拿过来的，实际官方找不到这张图）

ROMCP是原厂的boot存储区域



#### RAM Bank

![image-20230215105217758](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215105217758.png)

ITCM和DTCM以及OCRAM，三者的大小在芯片内部其实是可以调整的，并不是各自占用这么大，FlexRAM机制让我们可以调整这三者所占大小。

三者是共享512KB的，有一个配置寄存器，可以调整各自的大小

![image-20230215104949848](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215104949848.png)

![image-20230215104929412](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215104929412.png)

- 但是有一点要注意，OCRAM是必须要配置的，因为实际上BOOROM启动时也需要内存，这个部分用的就是OCRAM的，而且大小也不能小于64KB



#### Boot Devices

可以被Boot的设备也有说明：

![image-20230107171511088](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071715183.png)

FLEXSPI_B接口是第二优先级，所以他不能作为启动接口

![image-20230107164617417](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071646492.png)



#### Boot Mode

![image-20230107165157575](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071651644.png)

一般情况下其实都是从`Internal Boot`启动，然后再根据选择不同有了不同走向

`Boot From Fuses`，Fuse中存储的是关于芯片外部存储芯片的信息，从而让芯片知道该从哪个地址启动对应的外设，从而加载应用程序。

`Serial Downloader`也就是一般的ISP下载，由于支持的外设Flash比较多，所以具体要根据不同设备去下载对应的固件。

`Internal Boot`这种方式比较像Fuse，但是他多考虑了一个Boot_CFG的配置，来决定最终启动的是什么，感觉上是产品从测试阶段转向成品时方便切换Boot配置使用的，具体的要参考手册的详细说明了。

![image-20230214181635364](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230214181635364.png)

图中还有一种特殊的方式，就是从SD启动



不同的CFG最终决定不同的Flash启动

![image-20230107171151496](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071711577.png)



#### Boot Fuse

Boot Fuse的具体配置比较复杂，根据外设的不同，Fuse中的很多设置也不一样。

![image-20230107171825262](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202301071718366.png)



比如启动设备的选择就是通过BOOT_CFG的选项中确定的，他们都是引脚直接确认，而不是烧写出来的

![image-20230215110654716](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215110654716.png)

![image-20230215110707986](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215110707986.png)

这里可以看出来，被映射到了哪个引脚上面。启动时会从这些引脚上获取信息

![image-20230215111528732](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215111528732.png)

配合电路上的连接，这里就很明显了

![image-20230215115843975](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215115843975.png)



#### Boot 流程

这里只说NorFlash的流程，这里是原厂BOOT ROM的启动流程

![image-20230215141120178](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215141120178.png)

1.第一步是根据引脚启动，然后时钟设置到30Mhz（低速率，为了兼容），读取配置信息，实际是从0x60000000中读取前512字节（Flash前512字节必然是配置信息）

2.从Flash中读取到对应的配置信息以后，再进行一次配置，这次其实就是提升总线速率，加载flash驱动，让这个flash可以工作在正常工作的频率下

3.Flash已经完全可用了，这时设置程序启动的地址，内存地址等等，准备开始加载启动。



对应的Flash 512字节是什么内容：

![image-20230215143205491](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215143205491.png)



在`fsl_flexspi_nor_flash.c`中可以看到关于这个512字节是如何定义的

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
        .sflashA1Size = 16u * 1024u * 1024u,//4MBytes
        .dataValidTime = {16u, 16u},
        .lookupTable =
        {
//         //Fast Read Sequence
//         [0]  = FLEXSPI_LUT_SEQ(CMD_SDR, FLEXSPI_1PAD, 0x0B, RADDR_SDR, FLEXSPI_1PAD, 0x18),
//         [1]  = FLEXSPI_LUT_SEQ(DUMMY_SDR, FLEXSPI_1PAD, 0x08, READ_SDR, FLEXSPI_1PAD, 0x08),
//         [2]  = FLEXSPI_LUT_SEQ(JMP_ON_CS, 0, 0, 0, 0, 0),
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



接着就是Image相关的内容，比如向量表、程序所在位置以及可能的外设配置和驱动

![image-20230215150358529](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20230215150358529.png)

这里前三个数据都存在`fls_flexspi_nor_boot.c`中

```c
/************************************* 
 *  IVT Data 
 *************************************/
typedef struct _ivt_ {
    /** @ref hdr with tag #HAB_TAG_IVT, length and HAB version fields
     *  (see @ref data)
     */
    uint32_t hdr;
    /** Absolute address of the first instruction to execute from the
     *  image
     */
    uint32_t entry;
    /** Reserved in this version of HAB: should be NULL. */
    uint32_t reserved1;
    /** Absolute address of the image DCD: may be NULL. */
    uint32_t dcd;
    /** Absolute address of the Boot Data: may be NULL, but not interpreted
     *  any further by HAB
     */
    uint32_t boot_data;
    /** Absolute address of the IVT.*/
    uint32_t self;
    /** Absolute address of the image CSF.*/
    uint32_t csf;
    /** Reserved in this version of HAB: should be zero. */
    uint32_t reserved2;
} ivt;

const ivt image_vector_table = {
  IVT_HEADER,                         /* IVT Header */
  0x60002000,                         /* Image  Entry Function */
  IVT_RSVD,                           /* Reserved = 0 */
  (uint32_t)DCD_ADDRESS,              /* Address where DCD information is stored */
  (uint32_t)BOOT_DATA_ADDRESS,        /* Address where BOOT Data Structure is stored */
  (uint32_t)&image_vector_table,      /* Pointer to IVT Self (absolute address */
  (uint32_t)CSF_ADDRESS,              /* Address where CSF file is stored */
  IVT_RSVD                            /* Reserved = 0 */
};

```

boot data 主要是定义了flash启动的空间和大小

```c
const BOOT_DATA_T boot_data = {
  FLASH_BASE,                 /* boot start location */
  (FLASH_END-FLASH_BASE),     /* size */
  PLUGIN_FLAG,                /* Plugin flag*/
  0xFFFFFFFF  				  /* empty - extra data word */
};
```

dcd数据比较多，而且也没有解释后续我再分析。

```c
const uint8_t dcd_sdram[1072] = {
	/*0000*/ 0xD2,
    0x04,
    0x30,
    0x41,
    0xCC,
    0x03,
    0xAC,
    0x04,
    0x40,
    0x0F,
    ...
}
```



## Summary

到这里基本整体的启动流程就看完了，这部分是NXP和ST不同的地方，至于分散加载什么的已经分析过了



## Quote

> https://www.cnblogs.com/henjay724/p/9031655.html
>
> https://www.cnblogs.com/henjay724/p/9034563.html
>
> https://www.lmonkey.com/t/wLnkrWdBg
>
> https://www.bilibili.com/video/BV1J54y1L7bJ
>
> https://blog.csdn.net/Oushuwen/article/details/109336329


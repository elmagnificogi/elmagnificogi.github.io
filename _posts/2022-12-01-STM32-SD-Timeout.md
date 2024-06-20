---
layout:     post
title:      "STM32 SD HAL库TimeOut问题"
subtitle:   "SDMMC、HAL_GetTick、时钟"
date:       2022-12-01
update:     2024-06-20
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - STM32
---

## Foreword

最近又被SD卡坑了，ST的底层库这里确实有一点问题，我已经看好几个人提相同问题了，但是官方就是不改，这就很尴尬



## SD



#### 超时问题

在st的sd hal驱动中存在非常多的，类似代码

```c
  while ((HAL_SD_GetCardState(hsd) != HAL_SD_CARD_TRANSFER))
  {
    if ((HAL_GetTick() - tickstart) >=  SDMMC_DATATIMEOUT)
    {
      hsd->ErrorCode = HAL_SD_ERROR_TIMEOUT;
      hsd->State = HAL_SD_STATE_READY;
      return HAL_TIMEOUT;
    }
  }
```

HAL_GetTick一般情况都是ms计时器，也就是这里是判断一个ms超时



但是从超时宏的定义来看，他是一个非常大的值，其实这个值会导致这里的超时几乎不可能生效，ms时间这里都已经超过一个月了

```c
#define SDMMC_DATATIMEOUT                  ((uint32_t)0xFFFFFFFFU)
```

老库中这个值是默认值，最新的库中将其修改为了可以由用户定义，但是基本没人会注意到这个，藏得太深了



但是这个并不足以解决问题，这个值还被其他地方相同调用了

```c
    /* Configure the SD DPSM (Data Path State Machine) */
    config.DataTimeOut   = SDMMC_DATATIMEOUT;
    config.DataLength    = BLOCKSIZE * NumberOfBlocks;
    config.DataBlockSize = SDMMC_DATABLOCK_SIZE_512B;
    config.TransferDir   = SDMMC_TRANSFER_DIR_TO_CARD;
    config.TransferMode  = SDMMC_TRANSFER_MODE_BLOCK;
    config.DPSM          = SDMMC_DPSM_DISABLE;
    (void)SDMMC_ConfigData(hsd->Instance, &config);
```

SD的寄存器配置中，也有一个TimeOut，而这个值，也使用了相同的宏。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212011116341.png)

如果SD的时钟也是和HAL_GetTick相同，那就没问题（并不是），但是实际根本不是这样

SD的时钟平常可能都会被设置为24Mhz或者12Mhz，没人会设置为1Mhz。

这个宏被公用了，而如果你想要的超时是5s，也就是

```
SDMMC_DATATIMEOUT = 5000U;
```

但是换算到24Mhz的时候，这就不是5s了，而是只有0.208ms

这里可能还会遇到另一个问题，就是SD初始化的时候，时钟不超过400Khz，这个时候对应的5s就变成了12.5ms

这个时间肯定不是我们想设置的时间，如果真的去配置SD卡，会发现，初始化可以过，但是在做读写操作的时候，这个地方就出问题了。读写基本都无法成功。



而默认的`0xFFFFFFFF`在SD的读写里面，对应的Timeout就是178s（24Mhz的情况），实际上我们根本不需要这么大的延迟，顶多要个5s就够了。

也就是说这值设置一个`119,971,153`就够用了。



这里的Timeout还让我联想到以前一个SD卡读写等待异常久的问题，可能也有这个有关系。



#### 其他论据支持

这个问题之前就有人反馈过了，但是ST的支持回答不足以让人信服，而且这还是个套路回答。

> Hi [@SGars](https://community.st.com/s/profile/0050X000007RVqhQAG) (Customer) ,
>
>  
>
> You are right. In some cases, it can takes few days to write a big size file into an SD card with low class and low frequency.
>
>  
>
> In fact, this timeout parameter is used in the Read/Write data from/to the SD card, and the necessary time of these actions depends on 3 parameters (configurable by the user):
>
> 1- the size of the data
>
> 2- the clock frequency used in the application
>
> 3- the SD card class
>
>  
>
> I think the DATATIMEOUT must be variable, to allow the user to define his own Timeout value depending on his application settings.
>
> So, I suggest this solution in order to have variable Timeout Value:
>
> ```
> ifndef SDMMC_DATATIMEOUT#define SDMMC_DATATIMEOUT      0xFFFFFFFFU#endif /* SDMMC_DATATIMEOUT */
> ```

下面提出问题的人说的也非常清楚了

> Unfortunatley I think you've misunderstood what I was reporting.
>
>  
>
> This timeout value SDMMC_**DATA**TIMEOUT is intended for use with the SDMMC peripheral register that specifies timeouts in SDMMC clock cycles - see the other uses in this SDMMC files. In this case the clock is typically 24MHz so the timeout value is 3 minutes which whilst a bit long for a single transaction is at least the right order of magnitude.
>
>  
>
> However the value has also been used for a timeout where it is compared with system ticks (typically 1 millisecond). In this case it is not approprate because this results in a single transaction timeout of 49 days, which is the error I was reporting. If we reduced SDMMC_DATATIMEOUT to a level where it is appropriate for system ticks then the perhiperal will timeout because it will be too short.
>
>  
>
> Note that this has nothing to do with writing big files, because this is a single status transaction that is being run here, *not* an entire file.
>
>  
>
> A constant SDMMC_**CMD**TIMEOUT exists in the header which is used in other places to time transactions and is clearly designed to be used as a tick timeout so it seems that this is simply a typo in the driver where in these cases the wrong constant has been used.
>
>  
>
> Regs,
>
>  
>
> Steve

最后讨论的结果就是变成了用户需要自定义

而Github的F7的库，也被提了相同issue，也被以相同的套路回答了。这就非常难顶了。

> https://github.com/STMicroelectronics/STM32CubeF7/issues/53

而从他的套路回答来反推这个问题

```
Class 2 
最小读取速度: 2 (MB/sec)
最小写入速度: 2 (MB/sec)

Class 4
最小读取速度: 4 (MB/sec)
最小写入速度: 4 (MB/sec)

Class 6
最小读取速度: 6 (MB/sec)
最小写入速度: 6 (MB/sec)

Class 10
最小读取速度: 10 (MB/sec)
最小写入速度: 10 (MB/sec)
```

最小的Class2 也有2MB每秒，这么低的速度，实际上不可能用多低频率的，4线的情况下，最少也要4MHz的频率。

其实还有一个`Class0`这种是指低于2MB/S的未标注的卡，也就是说确实存在非常低速的卡。

假如这个卡用了400Khz的时钟，那么`0xFFFFFFFF`超时时间变成了10,737s

反推花1天写入文件，时钟大概只有30Khz左右，这么推测的话，估计只有航天器等东西才会用这么慢的速度吧，普通客户是不太能有对应的环境吧。



## 解决方案

很简单，把所有非寄存器使用的`SDMMC_DATATIMEOUT`替换成另外一个宏，来设置超时时间



## 官方回应和修改

在我发现这个问题以后，就在github上提出了修改意见，经过几轮讨论，总算是说服了官方进一步确认此问题

> https://github.com/STMicroelectronics/STM32CubeF7/issues/78



时隔一年半，总算是回应了这个issue，并且按照我的想法修改了源码

> https://github.com/STMicroelectronics/STM32CubeF7/commit/043a9bf77465a9442127aac7307fdb36c9d47a36

至此算是小小为ST HAL库做了一点点贡献，总来地说这个问题早就有人提出并且发出修改意见了，但是每次都因为没有坚持被官方几句都糊弄回去了，我持续坚持下，总算得到了正确的结果



## Summary

我似乎记得好像，在SPI还是I2C等驱动内部还有类似的超时，不知道是否有类似问题。



## Quote

> https://community.st.com/s/question/0D53W00000Toup2SAB/error-with-timeouts-constants-in-stm32f7xxhalsdc-in-sdsendsdstatus-and-sdfindscr-cause-indefinite-hangs
>
> https://github.com/STMicroelectronics/STM32CubeF7/issues/53
>
> https://github.com/STMicroelectronics/STM32CubeF7/issues/54
>
> https://github.com/STMicroelectronics/STM32CubeF7/pull/55

---
layout:     post
title:      "STM32 I2C 在FreeRTOS中造成的死锁"
subtitle:   "HAL"
date:       2020-08-11
update:     2024-05-18
author:     "elmagnifico"
header-img: "img/freertos.jpg"
catalog:    true
tags:
    - STM32
    - FreeRTOS
---

## Foreword

先说一下遇到的问题，I2C的SDA或者SCL信号线，只要拉低一段时间，必然造成系统锁死，触发看门狗。

然后骂一句，坑爹的HAL库。



#### 环境

- stm32f7系列
- I2C使用stm32硬件的
- FreeRTOS9.0
- HAL库V1.2.2



## I2C自锁

先假设总线上只有2个设备，一个是主，一个是从。闲时，总线一直是拉高的，通信是由主设备给时钟信号开始，拉低给起始位，然后地址、数据、停止位，接着就是从设备回复信息，也一样是从拉低开始。

> 在I2C主设备进行读写操作的过程中，主设备在开始信号后控制SCL产生8个时钟脉冲，然后拉低SCL信号为低电平，在这个时候，从设备输出应答信号，将SDA信号拉为低电平。
>
> 如果这个时候主设备异常复位，SCL就会被释放为高电平。此时，如果从设备没有复位，就会继续I2C的应答，将SDA一直拉为低电平，直到SCL变为低电平，才会结束应答信号。
>
> 而对于I2C主设备来说.复位后检测SCL和SDA信号，如果发现SDA信号为低电平，则会认为I2C总线被占用，会一直等待SCL和SDA信号变为高电平。
>
> 这样，I2C主设备等待从设备释放SDA信号，而同时I2C从设备又在等待主设备将SCL信号拉低以释放应答信号，两者相互等待，I2C总线进人一种死锁状态。
>
> 同样，当I2C进行读操作，I2C从设备应答后输出数据，如果在这个时刻I2C主设备异常复位而此时I2C从设备输出的数据位正好为0，也会导致I2C总线进入死锁状态。

会造成自锁，有几个可能

1. 电路上有干扰，导致一个信号突变为低
2. 电路上短路，引脚直接接地了
3. 掉电，硬件处于电压临界点，引脚电平处于一个临界状态，可能高可能低

但是呢这种自锁，在我这里是可以恢复的，不是大问题吧。



## I2C HAL库

这里大概看一下HAL库中的 I2C的通信流程，这里以中断式通信为例

```c
HAL_StatusTypeDef HAL_I2C_Mem_Write_IT(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size)
{
  uint32_t tickstart = 0U;
  uint32_t xfermode = 0U;

  /* Check the parameters */
  assert_param(IS_I2C_MEMADD_SIZE(MemAddSize));

  if(hi2c->State == HAL_I2C_STATE_READY)
  {
    if((pData == NULL) || (Size == 0U))
    {
      return  HAL_ERROR;
    }
    
    if(__HAL_I2C_GET_FLAG(hi2c, I2C_FLAG_BUSY) == SET)
    {
      return HAL_BUSY;
    }

    /* Process Locked */
    __HAL_LOCK(hi2c);

    /* Init tickstart for timeout management*/
    tickstart = HAL_GetTick();

    hi2c->State       = HAL_I2C_STATE_BUSY_TX;
    hi2c->Mode        = HAL_I2C_MODE_MEM;
    hi2c->ErrorCode   = HAL_I2C_ERROR_NONE;

    /* Prepare transfer parameters */
    hi2c->pBuffPtr    = pData;
    hi2c->XferCount   = Size;
    hi2c->XferOptions = I2C_NO_OPTION_FRAME;
    hi2c->XferISR     = I2C_Master_ISR_IT;
    
    if(hi2c->XferCount > MAX_NBYTE_SIZE)
    {
      hi2c->XferSize = MAX_NBYTE_SIZE;
      xfermode = I2C_RELOAD_MODE;
    }
    else
    {
      hi2c->XferSize = hi2c->XferCount;
      xfermode = I2C_AUTOEND_MODE;
    }

    /* Send Slave Address and Memory Address */
    if(I2C_RequestMemoryWrite(hi2c, DevAddress, MemAddress, MemAddSize, I2C_TIMEOUT_FLAG, tickstart) != HAL_OK)
    {
      if(hi2c->ErrorCode == HAL_I2C_ERROR_AF)
      {
        /* Process Unlocked */
        __HAL_UNLOCK(hi2c);
        return HAL_ERROR;
      }
      else
      {
        /* Process Unlocked */
        __HAL_UNLOCK(hi2c);
        return HAL_TIMEOUT;
      }
    }

    /* Set NBYTES to write and reload if hi2c->XferCount > MAX_NBYTE_SIZE and generate RESTART */
    I2C_TransferConfig(hi2c,DevAddress, hi2c->XferSize, xfermode, I2C_NO_STARTSTOP);

    /* Process Unlocked */
    __HAL_UNLOCK(hi2c); 

    /* Note : The I2C interrupts must be enabled after unlocking current process 
              to avoid the risk of I2C interrupt handle execution before current
              process unlock */

    /* Enable ERR, TC, STOP, NACK, TXI interrupt */
    /* possible to enable all of these */
    /* I2C_IT_ERRI | I2C_IT_TCI| I2C_IT_STOPI| I2C_IT_NACKI | I2C_IT_ADDRI | I2C_IT_RXI | I2C_IT_TXI */
    I2C_Enable_IRQ(hi2c, I2C_XFER_TX_IT);

    return HAL_OK;
  }
  else
  {
    return HAL_BUSY;
  }
}
```

这里有几个关键点，可以看到这里I2C有一个超时时间，头文件中定义的式25ms，看起来还挺短的，好像没啥问题的样子。

实际仔细看一下这里的头文件中的几个超时的时间设置，其实他们都没用，真正被使用的只有I2C_TIMEOUT_FLAG和I2C_TIMEOUT_BUSY，其他都是个摆设。

```
/** @defgroup I2C_Private_Define I2C Private Define
  * @{
  */
#define TIMING_CLEAR_MASK   (0xF0FFFFFFU)  /*!< I2C TIMING clear register Mask */
#define I2C_TIMEOUT_ADDR    (10000U)       /*!< 10 s  */
#define I2C_TIMEOUT_BUSY    (25U)          /*!< 25 ms */
#define I2C_TIMEOUT_DIR     (25U)          /*!< 25 ms */
#define I2C_TIMEOUT_RXNE    (25U)          /*!< 25 ms */
#define I2C_TIMEOUT_STOPF   (25U)          /*!< 25 ms */
#define I2C_TIMEOUT_TC      (25U)          /*!< 25 ms */
#define I2C_TIMEOUT_TCR     (25U)          /*!< 25 ms */
#define I2C_TIMEOUT_TXIS    (25U)          /*!< 25 ms */
#define I2C_TIMEOUT_FLAG    (25U)          /*!< 25 ms */

if(I2C_RequestMemoryWrite(hi2c, DevAddress, MemAddress, MemAddSize, I2C_TIMEOUT_FLAG, tickstart) != HAL_OK)
```

再看一下I2C_RequestMemoryWrite具体怎么实现的

```c
/**
  * @brief  Master sends target device address followed by internal memory address for write request.
  * @param  hi2c Pointer to a I2C_HandleTypeDef structure that contains
  *                the configuration information for the specified I2C.
  * @param  DevAddress Target device address: The device 7 bits address value
  *         in datasheet must be shift at right before call interface
  * @param  MemAddress Internal memory address
  * @param  MemAddSize Size of internal memory address
  * @param  Timeout Timeout duration
  * @param  Tickstart Tick start value
  * @retval HAL status
  */
static HAL_StatusTypeDef I2C_RequestMemoryWrite(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint32_t Timeout, uint32_t Tickstart)
{
  I2C_TransferConfig(hi2c,DevAddress,MemAddSize, I2C_RELOAD_MODE, I2C_GENERATE_START_WRITE);

  /* Wait until TXIS flag is set */
  if(I2C_WaitOnTXISFlagUntilTimeout(hi2c, Timeout, Tickstart) != HAL_OK)
  {
    if(hi2c->ErrorCode == HAL_I2C_ERROR_AF)
    {
      return HAL_ERROR;
    }
    else
    {
      return HAL_TIMEOUT;
    }
  }

  /* If Memory address size is 8Bit */
  if(MemAddSize == I2C_MEMADD_SIZE_8BIT)
  {
    /* Send Memory Address */
    hi2c->Instance->TXDR = I2C_MEM_ADD_LSB(MemAddress);
  }
  /* If Memory address size is 16Bit */
  else
  {
    /* Send MSB of Memory Address */
    hi2c->Instance->TXDR = I2C_MEM_ADD_MSB(MemAddress);

    /* Wait until TXIS flag is set */
    if(I2C_WaitOnTXISFlagUntilTimeout(hi2c, Timeout, Tickstart) != HAL_OK)
    {
      if(hi2c->ErrorCode == HAL_I2C_ERROR_AF)
      {
        return HAL_ERROR;
      }
      else
      {
        return HAL_TIMEOUT;
      }
    }
    
    /* Send LSB of Memory Address */
    hi2c->Instance->TXDR = I2C_MEM_ADD_LSB(MemAddress);
  }

  /* Wait until TCR flag is set */
  if(I2C_WaitOnFlagUntilTimeout(hi2c, I2C_FLAG_TCR, RESET, Timeout, Tickstart) != HAL_OK)
  {
    return HAL_TIMEOUT;
  }

return HAL_OK;
}
```

主要延迟是I2C_WaitOnTXISFlagUntilTimeout来判断的，通过注释可以看到第一个是真的是判定TXIS的超时判定，而最后一个I2C_WaitOnFlagUntilTimeout也是用前文中提到的I2C_TIMEOUT_FLAG来设定超时，其他宏定义就没用了。

这两个函数的具体实现差不多

```c
/**
  * @brief  This function handles I2C Communication Timeout for specific usage of TXIS flag.
  * @param  hi2c Pointer to a I2C_HandleTypeDef structure that contains
  *                the configuration information for the specified I2C.
  * @param  Timeout Timeout duration
  * @param  Tickstart Tick start value
  * @retval HAL status
  */
static HAL_StatusTypeDef I2C_WaitOnTXISFlagUntilTimeout(I2C_HandleTypeDef *hi2c, uint32_t Timeout, uint32_t Tickstart)
{
  while(__HAL_I2C_GET_FLAG(hi2c, I2C_FLAG_TXIS) == RESET)
  {
    /* Check if a NACK is detected */
    if(I2C_IsAcknowledgeFailed(hi2c, Timeout, Tickstart) != HAL_OK)
    {
      return HAL_ERROR;
    }

    /* Check for the Timeout */
    if(Timeout != HAL_MAX_DELAY)
    {
      if((Timeout == 0U)||((HAL_GetTick() - Tickstart) > Timeout))
      {
        hi2c->ErrorCode |= HAL_I2C_ERROR_TIMEOUT;
        hi2c->State= HAL_I2C_STATE_READY;
        hi2c->Mode = HAL_I2C_MODE_NONE;

        /* Process Unlocked */
        __HAL_UNLOCK(hi2c);

        return HAL_TIMEOUT;
      }
    }
  }
  return HAL_OK;
}
```



```c
/**
  * @brief  This function handles I2C Communication Timeout.
  * @param  hi2c Pointer to a I2C_HandleTypeDef structure that contains
  *                the configuration information for the specified I2C.
  * @param  Flag Specifies the I2C flag to check.
  * @param  Status The new Flag status (SET or RESET).
  * @param  Timeout Timeout duration
  * @param  Tickstart Tick start value
  * @retval HAL status
  */
static HAL_StatusTypeDef I2C_WaitOnFlagUntilTimeout(I2C_HandleTypeDef *hi2c, uint32_t Flag, FlagStatus Status, uint32_t Timeout, uint32_t Tickstart)
{
  while(__HAL_I2C_GET_FLAG(hi2c, Flag) == Status)
  {
    /* Check for the Timeout */
    if(Timeout != HAL_MAX_DELAY)
    {
      if((Timeout == 0U)||((HAL_GetTick() - Tickstart ) > Timeout))
      {
        hi2c->State= HAL_I2C_STATE_READY;
        hi2c->Mode = HAL_I2C_MODE_NONE;

        /* Process Unlocked */
        __HAL_UNLOCK(hi2c);
        return HAL_TIMEOUT;
      }
    }
  }
  return HAL_OK;
}
```

问题就在这里了，HAL_I2C_Mem_Write_IT本身是在一个task中调用的，而这个延迟的判定是通过while循环轮询的。

这样轮询有啥问题呢？乍一看好像没啥事情，FreeRTOS会耗尽时间片，从而自动切换任务，这里轮询就轮询了呗。但是实际上不是这样，这一个task没有任何主动切换线程的行为，很有可能会让低于他等级的线程无法正常工作，进而整个系统出问题。



## 分析

首先假设系统里有1，2，3，4，4个任务，其中1，2是三级任务，3，4是二级任务，我们假设I2C是任务1，当他时间片消耗完后，切换到任务2运行。

当任务2运行结束后，由于I2C这里是个while，加上优先级是最高，就绪状态，那么调度排名永远是第一，只要他进入调度除非有其他三级任务，否则他一定是第一个执行的，他一直不释放cpu，那么所有2级任务就不能被执行。

可能会有人有疑问，这个不是有超时时间25ms吗？他肯定会释放cpu啊，但是实际上HAL_I2C_Mem_Write_IT被调用的频率是固定的，50Hz，也就是20ms执行一次，那么一旦出错了，这里TXIS标志位要等25ms。

当他超时退出以后，这个任务的下次执行时间又到了，那他又比其他2级任务高，那么他必然又是排第一，他又要执行，然后由于I2C这个被拉低，导致这里TXIS一定获取不到，一定会超时，那么这里就直接形成了一个死循环。



### Timeout

这里就不得不仔细看一下HAL库这里为什么把i2c的timeout设置的这么长

![企业微信截图_17177504277171](https://img.elmagnifico.tech/static/upload/elmagnifico/202406121902055.png)

HAL 库本身的I2C是可以支持256字节通信的，这个timeout其实只管了一个字节的传输时长的，对应到I2C的速度，一般常用的都是100Kbps

一个字节的时间其实非常短，1ms最多可以传输12.5字节，实际算上中间的stop或者ack之类的可能达不到这么多，但是传输个8字节/ms，还是很轻松的。

所以等待一次发送完成，完全用不了25ms，这里给的太多了。

基本上也没见过比100kbps低非常多的i2c了，这里建议官方库最好把这个内置的timeout调小一些，或者就让用户去设置，而不是内置。

但是在一些SMBus或者一些芯片手册中，这个出错判断的时延时间是很长的，如果调小了，然后立马开始第二次通讯，会导致从设备可能会卡到某个状态中不能正常跑出来，所以这里需要具体芯片具体分析。粗暴的单方面降低一方的timeout可能并不能解决问题



## 拓展

实际上不仅仅是I2C的标志位是用while来判定的，并且没有任何释放操作，在SPI，SDMMC等函数中涉及到标志位的一些判定基本都是一个死循环，像I2C的超时时间预设的还不是特别长，我印象里有的函数的超时时间预设的是0xFFFFFFF，相当于死等，进去只要错过了标志位那么系统必然卡死，所以用的时候还是要多注意一下具体库的内部细节，否则这种问题查起来真的是要命。



## Summary

当FreeRTOS与HAL库等结合的时候，能发生的问题是真的多，日后可能还会遇到各种奇怪的bug，建议以后用的时候最好都先单步走一遍全流程，确定一下没有涉及到cpu释放、多线程竞争的问题再用。

## Quote

> https://www.cnblogs.com/foxclever/p/6878588.html
>
> https://blog.csdn.net/dldw8816/article/details/51579781


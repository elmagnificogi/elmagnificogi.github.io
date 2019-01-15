---
layout:     post
title:      "STM32 HAL与FreeRTOS造成的死锁"
subtitle:   "Interrupt,I2C"
date:       2018-12-27
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - STM32
---

## Foreword

这次在底层发现了一个重大问题，死锁，实际上这种问题有很大一部分是HAL库设计造成的。

造成这个死锁有这么几点：

1. 在STM32的HAL库中，每个外设都有自己的外设锁
2. 中断处理函数，是需要解锁外设锁的，HAL库的中断处理可能不完备或者不正确
3. 系统中存在高级任务中断总线类任务，造成总线类任务超时，未重新被调度

## I2C死锁问题

#### 外设锁

```c++
typedef struct __I2C_HandleTypeDef
{
  I2C_TypeDef                *Instance;      /*!< I2C registers base address                */

  I2C_InitTypeDef            Init;           /*!< I2C communication parameters              */

  uint8_t                    *pBuffPtr;      /*!< Pointer to I2C transfer buffer            */

  uint16_t                   XferSize;       /*!< I2C transfer size                         */

  __IO uint16_t              XferCount;      /*!< I2C transfer counter                      */

  __IO uint32_t              XferOptions;    /*!< I2C sequantial transfer options, this parameter can
                                                  be a value of @ref I2C_XFEROPTIONS */

  __IO uint32_t              PreviousState;  /*!< I2C communication Previous state          */

  HAL_StatusTypeDef (*XferISR)(struct __I2C_HandleTypeDef *hi2c, uint32_t ITFlags, uint32_t ITSources); /*!< I2C transfer IRQ handler function pointer */

  DMA_HandleTypeDef          *hdmatx;        /*!< I2C Tx DMA handle parameters              */

  DMA_HandleTypeDef          *hdmarx;        /*!< I2C Rx DMA handle parameters              */

  HAL_LockTypeDef            Lock;           /*!< I2C locking object                        */

  __IO HAL_I2C_StateTypeDef  State;          /*!< I2C communication state                   */

  __IO HAL_I2C_ModeTypeDef   Mode;           /*!< I2C communication mode                    */

  __IO uint32_t              ErrorCode;      /*!< I2C Error code                            */

  __IO uint32_t              AddrEventCount; /*!< I2C Address Event counter                 */
}I2C_HandleTypeDef;
```

首先，HAL库是为了操作系统调用而生的，他设计的时候就考虑到了外设锁的问题，所以他有一个HAL_LockTypeDef            Lock 对象，用于保证不同线程下的总线安全

#### 总线操作

```c++
HAL_StatusTypeDef HAL_I2C_Mem_Read_IT(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size)
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

    hi2c->State       = HAL_I2C_STATE_BUSY_RX;
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
    if(I2C_RequestMemoryRead(hi2c, DevAddress, MemAddress, MemAddSize, I2C_TIMEOUT_FLAG, tickstart) != HAL_OK)
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
    I2C_TransferConfig(hi2c,DevAddress,hi2c->XferSize, xfermode, I2C_GENERATE_START_READ);

    /* Process Unlocked */
    __HAL_UNLOCK(hi2c);

    /* Note : The I2C interrupts must be enabled after unlocking current process
              to avoid the risk of I2C interrupt handle execution before current
              process unlock */

    /* Enable ERR, TC, STOP, NACK, RXI interrupt */
    /* possible to enable all of these */
    /* I2C_IT_ERRI | I2C_IT_TCI| I2C_IT_STOPI| I2C_IT_NACKI | I2C_IT_ADDRI | I2C_IT_RXI | I2C_IT_TXI */
    I2C_Enable_IRQ(hi2c, I2C_XFER_RX_IT);

    return HAL_OK;
  }
  else
  {
    return HAL_BUSY;
  }
}
```

补充一个内容

```c++
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
```

在I2C的总线操作中，有一个I2C_RequestMemoryRead函数，他有一个25ms的超时判断，而在系统中这个25ms太长了，在这里会自然会进行上下文切换

```c++
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

非常不巧的是，刚好在这个延迟判断里有关于总线锁的操作，如果任务一直无法被切回来，那么总线就会造成被锁住，无法释放。

#### 中断处理函数

在i2c的中断处理中，会调用对应外设的中断处理函数

```c++
void HAL_I2C_EV_IRQHandler(I2C_HandleTypeDef *hi2c)
{
  /* Get current IT Flags and IT sources value */
  uint32_t itflags   = READ_REG(hi2c->Instance->ISR);
  uint32_t itsources = READ_REG(hi2c->Instance->CR1);

  /* I2C events treatment -------------------------------------*/
  if(hi2c->XferISR != NULL)
  {
    hi2c->XferISR(hi2c, itflags, itsources);
  }
}
```

在这个中断处理函数中就可以看到，第一步需要拿到总线使用权

```c++
static HAL_StatusTypeDef I2C_Master_ISR_IT(struct __I2C_HandleTypeDef *hi2c, uint32_t ITFlags, uint32_t ITSources)
{
  uint16_t devaddress = 0U;

  /* Process Locked */
  __HAL_LOCK(hi2c);

  if(((ITFlags & I2C_FLAG_AF) != RESET) && ((ITSources & I2C_IT_NACKI) != RESET))
  {
    /* Clear NACK Flag */
    __HAL_I2C_CLEAR_FLAG(hi2c, I2C_FLAG_AF);

    /* Set corresponding Error Code */
    /* No need to generate STOP, it is automatically done */
    /* Error callback will be send during stop flag treatment */
    hi2c->ErrorCode |= HAL_I2C_ERROR_AF;

    /* Flush TX register */
    I2C_Flush_TXDR(hi2c);
  }
  else if(((ITFlags & I2C_FLAG_RXNE) != RESET) && ((ITSources & I2C_IT_RXI) != RESET))
  {
    /* Read data from RXDR */
    (*hi2c->pBuffPtr++) = hi2c->Instance->RXDR;
    hi2c->XferSize--;
    hi2c->XferCount--;
  }
  else if(((ITFlags & I2C_FLAG_TXIS) != RESET) && ((ITSources & I2C_IT_TXI) != RESET))
  {
    /* Write data to TXDR */
    hi2c->Instance->TXDR = (*hi2c->pBuffPtr++);
    hi2c->XferSize--;
    hi2c->XferCount--;
  }
  else if(((ITFlags & I2C_FLAG_TCR) != RESET) && ((ITSources & I2C_IT_TCI) != RESET))
  {
    if((hi2c->XferSize == 0U) && (hi2c->XferCount != 0U))
    {
      devaddress = (hi2c->Instance->CR2 & I2C_CR2_SADD);

      if(hi2c->XferCount > MAX_NBYTE_SIZE)
      {
        hi2c->XferSize = MAX_NBYTE_SIZE;
        I2C_TransferConfig(hi2c, devaddress, hi2c->XferSize, I2C_RELOAD_MODE, I2C_NO_STARTSTOP);
      }
      else
      {
        hi2c->XferSize = hi2c->XferCount;
        if(hi2c->XferOptions != I2C_NO_OPTION_FRAME)
        {
          I2C_TransferConfig(hi2c, devaddress, hi2c->XferSize, hi2c->XferOptions, I2C_NO_STARTSTOP);
        }
        else
        {
          I2C_TransferConfig(hi2c, devaddress, hi2c->XferSize, I2C_AUTOEND_MODE, I2C_NO_STARTSTOP);
        }
      }
    }
    else
    {
      /* Call TxCpltCallback() if no stop mode is set */
      if(I2C_GET_STOP_MODE(hi2c) != I2C_AUTOEND_MODE)
      {
        /* Call I2C Master Sequential complete process */
        I2C_ITMasterSequentialCplt(hi2c);
      }
      else
      {
        /* Wrong size Status regarding TCR flag event */
        /* Call the corresponding callback to inform upper layer of End of Transfer */
        I2C_ITError(hi2c, HAL_I2C_ERROR_SIZE);
      }
    }
  }
  else if(((ITFlags & I2C_FLAG_TC) != RESET) && ((ITSources & I2C_IT_TCI) != RESET))
  {
    if(hi2c->XferCount == 0U)
    {
      if(I2C_GET_STOP_MODE(hi2c) != I2C_AUTOEND_MODE)
      {
        /* Generate a stop condition in case of no transfer option */
        if(hi2c->XferOptions == I2C_NO_OPTION_FRAME)
        {
          /* Generate Stop */
          hi2c->Instance->CR2 |= I2C_CR2_STOP;
        }
        else
        {
          /* Call I2C Master Sequential complete process */
          I2C_ITMasterSequentialCplt(hi2c);
        }
      }
    }
    else
    {
      /* Wrong size Status regarding TC flag event */
      /* Call the corresponding callback to inform upper layer of End of Transfer */
      I2C_ITError(hi2c, HAL_I2C_ERROR_SIZE);
    }
  }

  if(((ITFlags & I2C_FLAG_STOPF) != RESET) && ((ITSources & I2C_IT_STOPI) != RESET))
  {
    /* Call I2C Master complete process */
    I2C_ITMasterCplt(hi2c, ITFlags);
  }

  /* Process Unlocked */
  __HAL_UNLOCK(hi2c);

  return HAL_OK;
}
```
##### 死锁1

由于上述的中断需要解锁状态下才能操作总线，导致中断标记无法被正常清除，无限进中断，整个系统的时间轮转，就由于中断，无法正常工作，系统基本执行不了一两句代码就得跳转执行中断，进而导致被挂起的总线超时线程，一直得不到响应，从而出现死机状态。

手动解锁后，整个系统恢复正常。

从这里可以看到，总线类的进程如果由于延迟等原因被切出，需要注意出现中断以后是否能立即被调度。

这里的处理办法：

1. 可以强制开锁，但是这样会破坏整体的架构，操作也很奇怪。
2. 提升总线类的线程的优先级，让他不会被打断，或者是让他的内部延迟得到最高级的响应

方法一可以彻底解决这个问题，但是带来的问题就是这样的话这个外设锁的意义就不明确了，中断拥有强制开锁的能力，而且由此是否会带来新的问题也是未知的。
方法二可以解决部分问题，但是不能彻底解决这个问题，中断的级别是高于任务切换的级别的，一定是优先响应中断，而方法二并无法保证一定能在中断的时候做出对应的处理。

本质上这里的问题是HAL库关于中断处理的设计是有问题的，以前使用STD标准库的时候中断处理就是直接清标志位，然后处理，回调？，完全没有设备锁的概念。

现在由于这个设备锁和操作系统的存在，就有可能会造成死锁的情况

我在这里使用了方法一，中断强制开锁进行处理。

##### 死锁2

如果只是上面的问题就解了，但是实际上还遇到了一个更让人无语的问题.

在I2C出错以后,抛出了错误中断,而在错误中断中呢,中断处理函数却在第一次处理的时候将应该的中断处理函数置为了NULL(虽然他就算不置NULL也有可能会有问题)

而对应的I2C_RequestMemoryRead中却对前期就发生了I2C中断中的问题不管不顾，只要他没超时那就一切正常，他超时就返回错误，这就导致了第二次再发生中断的时候，I2C的总线程没有检测到，还在正常跑，而第二次中断时对应的中断处理函数NULL，无法正常执行，就又出现了无限进中断的问题。

```c++
static void I2C_ITError(I2C_HandleTypeDef *hi2c, uint32_t ErrorCode)
{
  /* Reset handle parameters */
  hi2c->Mode          = HAL_I2C_MODE_NONE;
  hi2c->XferOptions   = I2C_NO_OPTION_FRAME;
  hi2c->XferCount     = 0U;

  /* Set new error code */
  hi2c->ErrorCode |= ErrorCode;

  /* Disable Interrupts */
  if((hi2c->State == HAL_I2C_STATE_LISTEN)         ||
     (hi2c->State == HAL_I2C_STATE_BUSY_TX_LISTEN) ||
     (hi2c->State == HAL_I2C_STATE_BUSY_RX_LISTEN))
  {
    /* Disable all interrupts, except interrupts related to LISTEN state */
    I2C_Disable_IRQ(hi2c, I2C_XFER_RX_IT | I2C_XFER_TX_IT);

    /* keep HAL_I2C_STATE_LISTEN if set */
    hi2c->State         = HAL_I2C_STATE_LISTEN;
    hi2c->PreviousState = I2C_STATE_NONE;
    hi2c->XferISR       = I2C_Slave_ISR_IT;
  }
  else
  {
    /* Disable all interrupts */
    I2C_Disable_IRQ(hi2c, I2C_XFER_LISTEN_IT | I2C_XFER_RX_IT | I2C_XFER_TX_IT);

    /* If state is an abort treatment on goind, don't change state */
    /* This change will be do later */
    if(hi2c->State != HAL_I2C_STATE_ABORT)
    {
      /* Set HAL_I2C_STATE_READY */
      hi2c->State         = HAL_I2C_STATE_READY;
    }
    hi2c->PreviousState = I2C_STATE_NONE;
    hi2c->XferISR       = NULL;
  }

  /* Abort DMA TX transfer if any */
  if((hi2c->Instance->CR1 & I2C_CR1_TXDMAEN) == I2C_CR1_TXDMAEN)
  {
    hi2c->Instance->CR1 &= ~I2C_CR1_TXDMAEN;

    /* Set the I2C DMA Abort callback :
       will lead to call HAL_I2C_ErrorCallback() at end of DMA abort procedure */
    hi2c->hdmatx->XferAbortCallback = I2C_DMAAbort;

    /* Process Unlocked */
    __HAL_UNLOCK(hi2c);

    /* Abort DMA TX */
    if(HAL_DMA_Abort_IT(hi2c->hdmatx) != HAL_OK)
    {
      /* Call Directly XferAbortCallback function in case of error */
      hi2c->hdmatx->XferAbortCallback(hi2c->hdmatx);
    }
  }
  /* Abort DMA RX transfer if any */
  else if((hi2c->Instance->CR1 & I2C_CR1_RXDMAEN) == I2C_CR1_RXDMAEN)
  {
    hi2c->Instance->CR1 &= ~I2C_CR1_RXDMAEN;

    /* Set the I2C DMA Abort callback :
       will lead to call HAL_I2C_ErrorCallback() at end of DMA abort procedure */
    hi2c->hdmarx->XferAbortCallback = I2C_DMAAbort;

    /* Process Unlocked */
    __HAL_UNLOCK(hi2c);

    /* Abort DMA RX */
    if(HAL_DMA_Abort_IT(hi2c->hdmarx) != HAL_OK)
    {
      /* Call Directly hi2c->hdmarx->XferAbortCallback function in case of error */
      hi2c->hdmarx->XferAbortCallback(hi2c->hdmarx);
    }
  }
  else if(hi2c->State == HAL_I2C_STATE_ABORT)
  {
    hi2c->State = HAL_I2C_STATE_READY;

    /* Process Unlocked */
    __HAL_UNLOCK(hi2c);

    /* Call the corresponding callback to inform upper layer of End of Transfer */
    HAL_I2C_AbortCpltCallback(hi2c);
  }
  else
  {
    /* Process Unlocked */
    __HAL_UNLOCK(hi2c);

    /* Call the corresponding callback to inform upper layer of End of Transfer */
    HAL_I2C_ErrorCallback(hi2c);
  }
}
```

###### 注释出错的地方

同样的操作，上面的是disable，下面就是enable了，应该是注释写错了
这个问题已经向官方反馈了,还未得到回应.

```c++
static HAL_StatusTypeDef I2C_Disable_IRQ(I2C_HandleTypeDef *hi2c, uint16_t InterruptRequest)
{
  uint32_t tmpisr = 0U;

  if((InterruptRequest & I2C_XFER_TX_IT) == I2C_XFER_TX_IT)
  {
    /* Disable TC and TXI interrupts */
    tmpisr |= I2C_IT_TCI | I2C_IT_TXI;

    if((hi2c->State & HAL_I2C_STATE_LISTEN) != HAL_I2C_STATE_LISTEN)
    {
      /* Disable NACK and STOP interrupts */
      tmpisr |= I2C_IT_STOPI | I2C_IT_NACKI | I2C_IT_ERRI;
    }
  }

  if((InterruptRequest & I2C_XFER_RX_IT) == I2C_XFER_RX_IT)
  {
    /* Disable TC and RXI interrupts */
    tmpisr |= I2C_IT_TCI | I2C_IT_RXI;

    if((hi2c->State & HAL_I2C_STATE_LISTEN) != HAL_I2C_STATE_LISTEN)
    {
      /* Disable NACK and STOP interrupts */
      tmpisr |= I2C_IT_STOPI | I2C_IT_NACKI | I2C_IT_ERRI;
    }
  }

  if((InterruptRequest & I2C_XFER_LISTEN_IT) == I2C_XFER_LISTEN_IT)
  {
    /* Disable ADDR, NACK and STOP interrupts */
    tmpisr |= I2C_IT_ADDRI | I2C_IT_STOPI | I2C_IT_NACKI | I2C_IT_ERRI;
  }

  if((InterruptRequest & I2C_XFER_ERROR_IT) == I2C_XFER_ERROR_IT)
  {
    /* Enable ERR and NACK interrupts */
    tmpisr |= I2C_IT_ERRI | I2C_IT_NACKI;
  }

  if((InterruptRequest & I2C_XFER_CPLT_IT) == I2C_XFER_CPLT_IT)
  {
    /* Enable STOP interrupts */
    tmpisr |= I2C_IT_STOPI;
  }

  if((InterruptRequest & I2C_XFER_RELOAD_IT) == I2C_XFER_RELOAD_IT)
  {
    /* Enable TC interrupts */
    tmpisr |= I2C_IT_TCI;
  }

  /* Disable interrupts only at the end */
  /* to avoid a breaking situation like at "t" time */
  /* all disable interrupts request are not done */
  __HAL_I2C_DISABLE_IT(hi2c, tmpisr);

  return HAL_OK;
}
```

## Summary

实际使用的过程中不只是I2C会有这个问题,其实串口,SPI,SDMC等等,使用中断的方式来进行通信的,在HAL库中他的中断处理函数可能是不完备的,这也是为什么从HAL库这里给出了对应的中断回调函数,大概是希望我们在中断回调中处理这些出问题的情况吧.

但是这个request的流程在与中断配合的时候是有问题的，遇到这种异常情况就会导致中断不能正常处理，而有时候这个情况又没有检测到。

从SPI的HAL库中的中断处理函数又可以看到，SPI处理的时候完全不考虑锁的情况，直接进行处理，
设计风格也明显并不相同。

## Quote

> stm32f7xx_hal_i2c.c
>
> stm32f7xx_hal_i2c.h
>
> stm32 CubeMX
>
> stm32f7xx_it.c
>
> https://community.st.com/s/question/0D50X0000ADB6NNSQ1/there-is-a-bug-in-stm32f7xxhali2cc
>
> https://community.st.com/s/question/0D50X0000ADDM7oSQH/there-is-a-problem-in-i2c-hal-library

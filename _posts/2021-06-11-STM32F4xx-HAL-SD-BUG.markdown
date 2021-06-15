---
layout:     post
title:      "STM32F4 CubeMX HAL库 SD初始化BUG"
subtitle:   "GD32F450"
date:       2021-06-11
update:     2021-06-11
author:     "elmagnifico"
header-img: "img/line-head-bg.jpg"
catalog:    true
mathjax:    false
tags:
    - 嵌入式
    - STM32
---

## Foreword

最近需要用GD32F450的芯片，然后听说可以直接用STM32F4xx的库直接开发。

我这里直接使用STM32F429，可能别的也行，比如：STM32F427，具体需要对比芯片手册确认一下异同。

但是调试SD卡的时候，发现了一奇怪bug，这里记录一下



## 环境

- Keil 5
- 芯片 GD32F450VI
- 库STM32F429VI HAL
- 代码生成：CubeMX，工作频率168M



## 现象

由于代码是Cube直接生成的，理论上应该是能直接跑的，但是实际观察看到LED不会闪烁，而是常亮了（初始化时的设置）

```c
  HAL_Init();
  SystemClock_Config();
  MX_GPIO_Init();
  MX_DMA_Init();
  MX_SDIO_SD_Init();
  MX_USART1_UART_Init();
  MX_USART2_UART_Init();
  MX_USB_OTG_FS_PCD_Init();

  // led 灭
  HAL_GPIO_WritePin(GPIOC, GPIO_PIN_3, GPIO_PIN_SET);
	
  while (1)
  {
    /* USER CODE END WHILE */
		HAL_GPIO_WritePin(GPIOC, GPIO_PIN_3, GPIO_PIN_SET);
		for(int j=0;j<100;j++)
		{
			for(int i=0;i<100000;i++)
			{
				i=i;
			}
		}
		
		HAL_GPIO_WritePin(GPIOC, GPIO_PIN_3, GPIO_PIN_RESET);
		for(int j=0;j<100;j++)
		{
			for(int i=0;i<100000;i++)
			{
				i=i;
			}
		}

    /* USER CODE BEGIN 3 */
  }
```



#### debug

debug了一下，发现代码跑到Error_Handler里面去了

```CQL
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}
```

追踪了一下发现是由于SD初始化失败了。

```c
HAL_StatusTypeDef HAL_SD_InitCard(SD_HandleTypeDef *hsd)
{
  uint32_t errorstate;
  HAL_StatusTypeDef status;
  SD_InitTypeDef Init;
  
  /* Default SDIO peripheral configuration for SD card initialization */
  Init.ClockEdge           = SDIO_CLOCK_EDGE_RISING;
  Init.ClockBypass         = SDIO_CLOCK_BYPASS_DISABLE;
  Init.ClockPowerSave      = SDIO_CLOCK_POWER_SAVE_DISABLE;
  Init.BusWide             = SDIO_BUS_WIDE_1B;
  Init.HardwareFlowControl = SDIO_HARDWARE_FLOW_CONTROL_DISABLE;
  Init.ClockDiv            = SDIO_INIT_CLK_DIV;

  /* Initialize SDIO peripheral interface with default configuration */
  status = SDIO_Init(hsd->Instance, Init);
  if(status != HAL_OK)
  {
    return HAL_ERROR;
  }

  /* Disable SDIO Clock */
  __HAL_SD_DISABLE(hsd);

  /* Set Power State to ON */
  (void)SDIO_PowerState_ON(hsd->Instance);

  /* Enable SDIO Clock */
  __HAL_SD_ENABLE(hsd);
	//HAL_Delay(2);

  /* Identify card operating voltage */
  errorstate = SD_PowerON(hsd);
  if(errorstate != HAL_SD_ERROR_NONE)
  {
    hsd->State = HAL_SD_STATE_READY;
    hsd->ErrorCode |= errorstate;
    return HAL_ERROR;
  }
```

继续定位，发现主要是SD_PowerON返回了失败，并且错误的内容是

```
HAL_SD_ERROR_UNSUPPORTED_FEATURE
```

这个错就非常奇怪，相当于是说这个SD卡不支持。

但是只要我不断电，reset一下，这个代码就没问题了。

就算断电，也有10%概率，可以正常初始化。

而基本上只要我进调试状态，都能跑过，只要我断点在里面就能跑过，我不断点有小概率会报错，追起来很麻烦。



#### USB电源

由于开发板是电脑USB电源供电的，怀疑可能供电不足，必须要有jlink连接的时候外部额外供电，让sd稳下来了。所以试了一下通过稳压电源直接供电，发现问题依旧。



#### 替换SD卡

怀疑是我SD卡不支持，当前使用的是闪迪16g的sd卡，具体型号如下：

``` 
准确型号：SDSQUNC-016G-ZN3MN
通用名：microSDH UHS-I class10 A1
```

然后换成一块8g的卡，8g的卡由于没有包装了没有具体型号了。

8g的卡，发现可以正常初始化，但是还是有小概率失败，于是我仔细看了一下初始化失败的位置。

```c
  /* SD CARD */
  /* Send ACMD41 SD_APP_OP_COND with Argument 0x80100000 */
  while((count < SDMMC_MAX_VOLT_TRIAL) && (validvoltage == 0U))
  {
    /* SEND CMD55 APP_CMD with RCA as 0 */
    errorstate = SDMMC_CmdAppCommand(hsd->Instance, 0);
    if(errorstate != HAL_SD_ERROR_NONE)
    {
			//continue;
      return errorstate;
    }

    /* Send CMD41 */
    errorstate = SDMMC_CmdAppOperCommand(hsd->Instance, SDMMC_VOLTAGE_WINDOW_SD | SDMMC_HIGH_CAPACITY | SD_SWITCH_1_8V_CAPACITY);
    if(errorstate != HAL_SD_ERROR_NONE)
    {
			//continue;
      return HAL_SD_ERROR_UNSUPPORTED_FEATURE;
    }

    /* Get command response */
    response = SDIO_GetResponse(hsd->Instance, SDIO_RESP1);

    /* Get operating voltage*/
    validvoltage = (((response >> 31U) == 1U) ? 1U : 0U);

    count++;
  }
```

可以看到这里发送CMD55和CMD41，但是一旦失败就直接整个初始化退出了，而这个有效电压的检测基本没生效，所以我这里加了continue，让他不断去尝试，直到检测到SD卡启动引脚上电再返回。

把这个位置加上以后发现16g的卡和8g的卡都能正常工作了。



#### 小概率失败

就算增加了continue，还是会小概率失败，大概5%左右。

再次定位，发现返回错误的地方已经不是while之中了，而是在一开始的地方

```c
  if( hsd->SdCard.CardVersion == CARD_V2_X)
  {
    /* SEND CMD55 APP_CMD with RCA as 0 */
    errorstate = SDMMC_CmdAppCommand(hsd->Instance, 0);
    if(errorstate != HAL_SD_ERROR_NONE)
    {
      return HAL_SD_ERROR_UNSUPPORTED_FEATURE;
    }
  }
```

在这里判定是2类卡，由于2类卡是按照CMD8超时无响应的情况下才去认定为2类卡的，所以这里根据初步判定，发了CMD55来准确判定2类卡。

但是如果这里2类卡判定失败了，那就整个初始化失败了。现在这个小概率失败就是在这里退出了。



#### 启动延迟

这非常奇怪，这里CMD55返回也报错？这里基本就无解了，就算你拿信号分析仪看，实际上也会发现这里芯片毛都没发出去，然后怀疑芯片是不是有问题之类的，而我突然想起以前用的F7的HAL库，然后就对比了一下。发现了一个小地方的不同。

这个是当前F4的SD初始化，可以看到在SD_PowerON之前，先开启了SDIO_PowerState_ON的电源，然后再开启SD的外设的时钟。

```
HAL_StatusTypeDef HAL_SD_InitCard(SD_HandleTypeDef *hsd)
{
  uint32_t errorstate;
  HAL_StatusTypeDef status;
  SD_InitTypeDef Init;
  
  /* Default SDIO peripheral configuration for SD card initialization */
  Init.ClockEdge           = SDIO_CLOCK_EDGE_RISING;
  Init.ClockBypass         = SDIO_CLOCK_BYPASS_DISABLE;
  Init.ClockPowerSave      = SDIO_CLOCK_POWER_SAVE_DISABLE;
  Init.BusWide             = SDIO_BUS_WIDE_1B;
  Init.HardwareFlowControl = SDIO_HARDWARE_FLOW_CONTROL_DISABLE;
  Init.ClockDiv            = SDIO_INIT_CLK_DIV;

  /* Initialize SDIO peripheral interface with default configuration */
  status = SDIO_Init(hsd->Instance, Init);
  if(status != HAL_OK)
  {
    return HAL_ERROR;
  }

  /* Disable SDIO Clock */
  __HAL_SD_DISABLE(hsd);

  /* Set Power State to ON */
  (void)SDIO_PowerState_ON(hsd->Instance);

  /* Enable SDIO Clock */
  __HAL_SD_ENABLE(hsd);
	//HAL_Delay(2);

  /* Identify card operating voltage */
  errorstate = SD_PowerON(hsd);
```

具体SD的电源里面有一个Delay，这里实际上delay是2ms，用来等待SD本身完成初始化。

```
HAL_StatusTypeDef SDIO_PowerState_ON(SDIO_TypeDef *SDIOx)
{  
  /* Set power state to ON */ 
  SDIOx->POWER = SDIO_POWER_PWRCTRL;

  /* 1ms: required power up waiting time before starting the SD initialization
  sequence */
  HAL_Delay(2);
  
  return HAL_OK;
}
```



但是对比F7的老SD库，就不一样了

```c
HAL_StatusTypeDef HAL_SD_InitCard(SD_HandleTypeDef *hsd)
{
  uint32_t errorstate = HAL_SD_ERROR_NONE;
  SD_InitTypeDef Init;
  
  /* Default SDMMC peripheral configuration for SD card initialization */
  Init.ClockEdge           = SDMMC_CLOCK_EDGE_RISING;
  Init.ClockBypass         = SDMMC_CLOCK_BYPASS_DISABLE;
  Init.ClockPowerSave      = SDMMC_CLOCK_POWER_SAVE_DISABLE;
  Init.BusWide             = SDMMC_BUS_WIDE_1B;
  Init.HardwareFlowControl = SDMMC_HARDWARE_FLOW_CONTROL_DISABLE;
  Init.ClockDiv            = SDMMC_INIT_CLK_DIV;

  /* Initialize SDMMC peripheral interface with default configuration */
  SDMMC_Init(hsd->Instance, Init);

  /* Disable SDMMC Clock */
  __HAL_SD_DISABLE(hsd); 
  
  /* Set Power State to ON */
  SDMMC_PowerState_ON(hsd->Instance);
  
  /* Enable SDMMC Clock */
  __HAL_SD_ENABLE(hsd);
  
  /* Required power up waiting time before starting the SD initialization sequence */
  HAL_Delay(2);
  
  /* Identify card operating voltage */
  errorstate = SD_PowerON(hsd);
```

可以看到，这里是先启动电源，打开时钟，然后等2ms。

F4的HAL中打开SD时钟没有任何等待，立马开始后面所有命令操作，巧的是前面判定SD power on的命令都是这种超时类型的，所以没有直接返回实质上错误。实际此时SD的时钟还没启动完成，这时的任何SD的操作其实都直接失败了。所以如果这个SD卡是个1类卡，CMD8的命令也会无响应，那后面怎么走都会报错。



单独提高SDMMC_PowerState_ON的内延迟，实际上还是会初始化失败，所以最终造成影响的肯定是SDMMC Clock的时钟，而不是Power没起来的问题



## 解决

开启时钟后增加2ms延迟，或者是将SDIO_PowerState_ON移动到__HAL_SD_ENABLE的后面都可以正常工作。

```c
  /* Set Power State to ON */
  (void)SDIO_PowerState_ON(hsd->Instance);

  /* Enable SDIO Clock */
  __HAL_SD_ENABLE(hsd);
	HAL_Delay(2);

  /* Identify card operating voltage */
  errorstate = SD_PowerON(hsd);
```

或者

```c
  /* Enable SDIO Clock */
  __HAL_SD_ENABLE(hsd);
  
  /* Set Power State to ON */
  (void)SDIO_PowerState_ON(hsd->Instance);

  /* Identify card operating voltage */
  errorstate = SD_PowerON(hsd);
```

就可以正常初始化了

如果需要再进一步提高健壮性，把return换成continue，基本可以让初始化失败的情况低到无法手动复现。

```c
static uint32_t SD_PowerON(SD_HandleTypeDef *hsd)
{
  __IO uint32_t count = 0U;
  uint32_t response = 0U, validvoltage = 0U;
  uint32_t errorstate;

  /* CMD0: GO_IDLE_STATE */
  errorstate = SDMMC_CmdGoIdleState(hsd->Instance);
  if(errorstate != HAL_SD_ERROR_NONE)
  {
    return errorstate;
  }

  /* CMD8: SEND_IF_COND: Command available only on V2.0 cards */
  errorstate = SDMMC_CmdOperCond(hsd->Instance);
  if(errorstate != HAL_SD_ERROR_NONE)
  {
    hsd->SdCard.CardVersion = CARD_V1_X;
    /* CMD0: GO_IDLE_STATE */
    errorstate = SDMMC_CmdGoIdleState(hsd->Instance);
    if(errorstate != HAL_SD_ERROR_NONE)
    {
      return errorstate;
    }

  }
  else
  {
    hsd->SdCard.CardVersion = CARD_V2_X;
  }

  if( hsd->SdCard.CardVersion == CARD_V2_X)
  {
    /* SEND CMD55 APP_CMD with RCA as 0 */
    errorstate = SDMMC_CmdAppCommand(hsd->Instance, 0);
    if(errorstate != HAL_SD_ERROR_NONE)
    {
      return HAL_SD_ERROR_UNSUPPORTED_FEATURE;
    }
  }
  /* SD CARD */
  /* Send ACMD41 SD_APP_OP_COND with Argument 0x80100000 */
  while((count < SDMMC_MAX_VOLT_TRIAL) && (validvoltage == 0U))
  {
    /* SEND CMD55 APP_CMD with RCA as 0 */
    errorstate = SDMMC_CmdAppCommand(hsd->Instance, 0);
    if(errorstate != HAL_SD_ERROR_NONE)
    {
			continue;
      //return errorstate;
    }

    /* Send CMD41 */
    errorstate = SDMMC_CmdAppOperCommand(hsd->Instance, SDMMC_VOLTAGE_WINDOW_SD | SDMMC_HIGH_CAPACITY | SD_SWITCH_1_8V_CAPACITY);
    if(errorstate != HAL_SD_ERROR_NONE)
    {
			continue;
      //return HAL_SD_ERROR_UNSUPPORTED_FEATURE;
    }

    /* Get command response */
    response = SDIO_GetResponse(hsd->Instance, SDIO_RESP1);

    /* Get operating voltage*/
    validvoltage = (((response >> 31U) == 1U) ? 1U : 0U);

    count++;
  }

  if(count >= SDMMC_MAX_VOLT_TRIAL)
  {
    return HAL_SD_ERROR_INVALID_VOLTRANGE;
  }

  if((response & SDMMC_HIGH_CAPACITY) == SDMMC_HIGH_CAPACITY) /* (response &= SD_HIGH_CAPACITY) */
  {
    hsd->SdCard.CardType = CARD_SDHC_SDXC;
  }
  else
  {
    hsd->SdCard.CardType = CARD_SDSC;
  }


  return HAL_SD_ERROR_NONE;
}
```



## HAL_SD_Init 缺失

有个别情况，比如开启了FreeRTOS和FATFS以后，SD的初始化函数会缺少对应的初始化函数的调用，很奇怪。

```c
static void MX_SDIO_SD_Init(void)
{

  /* USER CODE BEGIN SDIO_Init 0 */

  /* USER CODE END SDIO_Init 0 */

  /* USER CODE BEGIN SDIO_Init 1 */

  /* USER CODE END SDIO_Init 1 */
  hsd.Instance = SDIO;
  hsd.Init.ClockEdge = SDIO_CLOCK_EDGE_RISING;
  hsd.Init.ClockBypass = SDIO_CLOCK_BYPASS_DISABLE;
  hsd.Init.ClockPowerSave = SDIO_CLOCK_POWER_SAVE_DISABLE;
  hsd.Init.BusWide = SDIO_BUS_WIDE_1B;
  hsd.Init.HardwareFlowControl = SDIO_HARDWARE_FLOW_CONTROL_DISABLE;
  hsd.Init.ClockDiv = 0;
  /* USER CODE BEGIN SDIO_Init 2 */
  /* USER CODE END SDIO_Init 2 */

}

```

这里需要自己补充上

```c
  if (HAL_SD_Init(&hsd) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_SD_ConfigWideBusOperation(&hsd, SDIO_BUS_WIDE_4B) != HAL_OK)
  {
    Error_Handler();
  }
```



## Summary

引用里有一些老的SD卡的bug问题，是搜的时候看到的，对比看了一下，新的库里这两个问题都解决了。

只是我遇到的这个问题和时序相关，查起来需要一点运气。

而且这个可能还和我使用的是GD32F450而不是ST有关系，可能ST的时钟开启响应的速度比较快，这里不多等2ms，也能正常启动？

总而言之，有那么一点启动不了的话就不算好，所以留点延迟也没啥问题。

记得以前看很多代码示例都在时钟操作的时候加了一点延迟，当时还觉得多此一举，现在看来还真的不是多余的操作。



## Quote

> https://blog.csdn.net/wingceltis/article/details/103754250


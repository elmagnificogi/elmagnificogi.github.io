---
layout:     post
title:      "STM32 CubeMX HAL_Init与SystemClock_Config的矛盾"
subtitle:   "HID，CDC，VCP"
date:       2021-07-02
update:     2021-07-02
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
mathjax:    false
tags:
    - 嵌入式
    - STM32
---

## Foreword

最近突然发现CubeMX生成的HAL_Init和SystemClock_Config有矛盾，可能会导致时钟不对。



## CubeMX

```c

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_DMA_Init();
  MX_I2C2_Init();
  MX_SDIO_SD_Init();
  MX_SPI1_Init();
```

平常Cube生成的代码都是这种顺序的，都是先HAL_Init之后才有SystemClock_Config，但是HAL内部也需要一个定时器来计时，也是在HAL_Init的时候进行初始化的，但是后面时钟重新初始化了，这就可能会导致HAL内的定时器实际计时并不正确。



## HAL_Init

HAL的初始化比较简单，大部和常用的外设其实没啥关系，只是注释看着好像有大关系。

```c
HAL_StatusTypeDef HAL_Init(void)
{
  /* Configure Flash prefetch, Instruction cache, Data cache */ 
#if (INSTRUCTION_CACHE_ENABLE != 0U)
  __HAL_FLASH_INSTRUCTION_CACHE_ENABLE();
#endif /* INSTRUCTION_CACHE_ENABLE */

#if (DATA_CACHE_ENABLE != 0U)
  __HAL_FLASH_DATA_CACHE_ENABLE();
#endif /* DATA_CACHE_ENABLE */

#if (PREFETCH_ENABLE != 0U)
  __HAL_FLASH_PREFETCH_BUFFER_ENABLE();
#endif /* PREFETCH_ENABLE */

  /* Set Interrupt Group Priority */
  HAL_NVIC_SetPriorityGrouping(NVIC_PRIORITYGROUP_4);

  /* Use systick as time base source and configure 1ms tick (default clock after Reset is HSI) */
  HAL_InitTick(TICK_INT_PRIORITY);

  /* Init the low level hardware */
  HAL_MspInit();

  /* Return function status */
  return HAL_OK;
}
```

而HAL的时钟是在HAL_InitTick中进行初始化的，这里注释说是用systick，实际上我修改成了TIM6，但是自动生成的注释不会跟着变而已



```c
HAL_StatusTypeDef HAL_InitTick(uint32_t TickPriority)
{
  RCC_ClkInitTypeDef    clkconfig;
  uint32_t              uwTimclock = 0;
  uint32_t              uwPrescalerValue = 0;
  uint32_t              pFLatency;
  /*Configure the TIM6 IRQ priority */
  HAL_NVIC_SetPriority(TIM6_DAC_IRQn, TickPriority ,0);

  /* Enable the TIM6 global Interrupt */
  HAL_NVIC_EnableIRQ(TIM6_DAC_IRQn);
  /* Enable TIM6 clock */
  __HAL_RCC_TIM6_CLK_ENABLE();

  /* Get clock configuration */
  HAL_RCC_GetClockConfig(&clkconfig, &pFLatency);

  /* Compute TIM6 clock */
  uwTimclock = 2*HAL_RCC_GetPCLK1Freq();
  /* Compute the prescaler value to have TIM6 counter clock equal to 1MHz */
  uwPrescalerValue = (uint32_t) ((uwTimclock / 1000000U) - 1U);

  /* Initialize TIM6 */
  htim6.Instance = TIM6;

  /* Initialize TIMx peripheral as follow:
  + Period = [(TIM6CLK/1000) - 1]. to have a (1/1000) s time base.
  + Prescaler = (uwTimclock/1000000 - 1) to have a 1MHz counter clock.
  + ClockDivision = 0
  + Counter direction = Up
  */
  htim6.Init.Period = (1000000U / 1000U) - 1U;
  htim6.Init.Prescaler = uwPrescalerValue;
  htim6.Init.ClockDivision = 0;
  htim6.Init.CounterMode = TIM_COUNTERMODE_UP;
  if(HAL_TIM_Base_Init(&htim6) == HAL_OK)
  {
    /* Start the TIM time Base generation in interrupt mode */
    return HAL_TIM_Base_Start_IT(&htim6);
  }

  /* Return function status */
  return HAL_ERROR;
}
```

关键的地方在于这里获取PCLK1的时钟频率，可以看到最终这个频率是来自于SystemCoreClock这个变量的。

```c
uint32_t HAL_RCC_GetHCLKFreq(void)
{
  return SystemCoreClock;
}

uint32_t HAL_RCC_GetPCLK1Freq(void)
{
  /* Get HCLK source and Compute PCLK1 frequency ---------------------------*/
  return (HAL_RCC_GetHCLKFreq() >> APBPrescTable[(RCC->CFGR & RCC_CFGR_PPRE1)>> RCC_CFGR_PPRE1_Pos]);
}
```

再看SystemCoreClock变量是怎么被更新的。

```c
/** @addtogroup STM32F4xx_System_Private_Variables
  * @{
  */
  /* This variable is updated in three ways:
      1) by calling CMSIS function SystemCoreClockUpdate()
      2) by calling HAL API function HAL_RCC_GetHCLKFreq()
      3) each time HAL_RCC_ClockConfig() is called to configure the system clock frequency 
         Note: If you use this function to configure the system clock; then there
               is no need to call the 2 first functions listed above, since SystemCoreClock
               variable is updated automatically.
  */
uint32_t SystemCoreClock = 16000000;
const uint8_t AHBPrescTable[16] = {0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 6, 7, 8, 9};
const uint8_t APBPrescTable[8]  = {0, 0, 0, 0, 1, 2, 3, 4};
```

他只有3种情况下更新。

1. 调用SystemCoreClockUpdate，更新系统时钟
2. 调用HAL_RCC_GetHCLKFreq 更新系统时钟，这种方式应该是无效的，只能获取不能更新
3. 调用HAL_RCC_ClockConfig 来更新

所以实际上就只有2种更新方式。

而Cube生成代码的时候SystemCoreClock并不会自动修改成你时钟配置的速度

![image-20210702182855169](https://i.loli.net/2021/07/02/aUL2xG1qgvzleyK.png)

此时我时钟是168，调试也能看到是160

![image-20210702182803586](https://i.loli.net/2021/07/02/wHJtZmLp59jVnxP.png)

所以这个时候直接就把Timer6分频为了32，这都是基于160M的基础做的。





## Summary



## Quote

>
>


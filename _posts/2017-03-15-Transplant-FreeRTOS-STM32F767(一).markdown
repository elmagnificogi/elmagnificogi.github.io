---
layout:     post
title:      "FreeRTOS移植到STM32F767(一)"
subtitle:   "嵌入式，FreeRTOS，STM32F767"
date:       2017-03-15
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - 嵌入式
---

## 移植FreeRTOS到STM32F767


#### 环境

编译环境：keil

固件库：Keil.STM32F7xx_DFP.2.9.0

目标开发板：STM32F767IG

目标系统：FreeRTOS 9.0

#### 第一步.获取源码

首先是要下载源码：

> http://www.freertos.org/a00104.html 

解压出来以后，先介绍一下源码的目录结构

- FreeRTOS/source中是内核代码
- FreeRTOS/demo中是对各厂商各种板的移植好的demo(可能有你想要的)
- FreeRTOS-Plus中是含有FreeRTOS额外的部件以及第三方开发的开源部件
- FreeRTOS-Plus/Demo 自然就是增加了这些组件的demo了，多数demo都是运行在FreeRTOS windows simulator模拟器上的
- */License 中就是各种开源的License

STM32F767没有特别符合的demo，所以就自己新建一个。

那么主要的文件自然来源于FreeRTOS/source中了。

- FreeRTOS/Source中的list.c, queue.c and tasks.c 是整个内核共用的文件，也是最基础的队列，任务调度，链表，三个文件。
- FreeRTOS/Source中的timers.c，event_groups.c，croutine.c 分别是软件定时器，时间驱动管理，协程(功能可选配置文件，用于内存比较低的硬件)
- FreeRTOS/Source/include中就是对应的各种头文件
- FreeRTOS/Source/portable中是各种平台相关的文件，有的是可以不要的，但是./MemMang中是内存分配堆的文件，很重要不能删。
- ./Keil中要求我们去查看./RVDS
- ./RVDS中则是与ARM构架相关的文件了，明显我们这里用的M7，所以其他的文件就可以不用了。

到这里基本就确定了我们需要什么样的文件。

- FreeRTOS/Source/
- FreeRTOS/Source/include
- FreeRTOS/Source/portable/MemMang
- FreeRTOS/Source/portable/RVDS/ARM_CM7

基本最多需要这些源文件

其实上面还少一个文件，我后面进行到第二步的时候发现少了一个配置文件。

	#include "FreeRTOSConfig.h"

所以这里需要你再取一个跟你配置最接近的demo中的文件

- FreeRTOS\Demo\CORTEX_M7_STM32F7_STM32756G-EVAL_IAR_Keil\FreeRTOSConfig.h

这里就选择了最接近的STM32F756的配置文件。

这里我们先不管这个配置文件内容是什么，先复制过来而已

#### 第二步.建立工程

拿一个现成的工程模板，这里我用的是原点的工程模板

将上面的源码加入文件

将上面的头文件加入引索目录

> 10.关于float类型
在keil中,在不选择"Optimize for time"编译选项时,局部float变量占用8个字节(编译器默认自动扩展成double类型),如果你从Flash中读取一个float类型常量并放在局部float型变量中时,有可能发生意想不到的错误:Cortex-M3中可能会出现硬fault.因为字节对齐问题.
但有趣的是,一旦你使用"Optimize for time"编译选项,局部float变量只会占用4个字节

所以工程设置中需要勾选 Optimize for time

第一次编译前，还需要修改一个文件stm32f7xx_it.c

将下面的三个中断接口函数注释了

```c
void SysTick_Handler(void)
void PendSV_Handler(void)
void SVC_Handler(void)
```

因为引入了FreeRTOS，不注释了会出现重定义的情况。

然后编译，还是会提示

	Error: L6218E: Undefined symbol vAssertCalled (referred from event_groups.o).

这个是断言函数有关的内容，暂时不需要，屏蔽掉他，就是将其注释了就行

```c
	//extern void vAssertCalled( uint32_t ulLine, const char *pcFile );
	//#define configASSERT( x ) if( ( x ) == 0 ) vAssertCalled( __LINE__, __FILE__ )
```

除了上面这个未定义，还有下面的Hook函数也没定义，也需要我们去屏蔽一下

	Error: L6218E: Undefined symbol vApplicationStackOverflowHook (referred from tasks.o).
	Error: L6218E: Undefined symbol vApplicationTickHook (referred from tasks.o).
	Error: L6218E: Undefined symbol vApplicationMallocFailedHook (referred from heap_4.o).

将下面的几个宏定义修改为 0,就能屏蔽hook了

```c
#define configUSE_TICK_HOOK						0
#define configCHECK_FOR_STACK_OVERFLOW			0
#define configUSE_MALLOC_FAILED_HOOK			0
```

这时就能通过编译了，一般就没有什么错误了

但是到这里只是文件都加进来了，能通过编译了，但是其实系统还没有跟板子实际联系上。

还需要将上面说的三个中断函数接入进去。

首先将sys.h文件中的系统支持设定为1，表示支持RTOS

```c
#define SYSTEM_SUPPORT_OS		1		//定义系统文件夹是否支持OS	
```

然后是usart.c和修改包含的头文件

```c
#if SYSTEM_SUPPORT_OS
#include "FreeRTOS.h"					//os 使用	  
#endif
```

删除void USART1_IRQHandler(void)中断函数中的下面两个部分

```c
#if SYSTEM_SUPPORT_OS	 	//使用OS
	OSIntEnter();    
#endif

#if SYSTEM_SUPPORT_OS	 	//使用OS
	OSIntExit();  											 
#endif
```

然后是设定好FreeRTOS的系统时钟，通过滴答定时器中断调用xPortSysTickHandler()函数

delay_init(u8 SYSCLK)根据之前FreeRTOSConfig.h中的

```c
#define configTICK_RATE_HZ						( 1000 )
```

确定了系统的时钟节拍是1000Hz，也就是1ms中断一次，这里的滴答定时器自然也初始化为1ms周期

delay_us()和delay_xms()是硬等待，不切换任务的方式

delay_ms()=vTaskDelay()是等待阻塞，调用后会自动切换任务

delay.c文件修改为如下

```c
#include "delay.h"
#include "sys.h"
#if SYSTEM_SUPPORT_OS
#include "FreeRTOS.h"					
#include "task.h"
#endif

static u32 fac_us=0;							
//us延时倍乘数

#if SYSTEM_SUPPORT_OS		
    static u16 fac_ms=0;				        
//ms延时倍乘数,在os下,代表每个节拍的ms数
#endif

extern void xPortSysTickHandler(void);

//systick中断服务函数
void SysTick_Handler(void)
{	
    if(xTaskGetSchedulerState()!=taskSCHEDULER_NOT_STARTED)
	//系统已经运行
    {
        xPortSysTickHandler();	
    }
    HAL_IncTick();
}


//初始化延迟函数
//当使用ucos的时候,此函数会初始化ucos的时钟节拍
//SYSTICK的时钟固定为AHB时钟的1/8
//SYSCLK:系统时钟频率
void delay_init(u8 SYSCLK)
{
	u32 reload;
    HAL_SYSTICK_CLKSourceConfig(SYSTICK_CLKSOURCE_HCLK);
	//SysTick频率为HCLK
	fac_us=SYSCLK;						    
	//不论是否使用OS,fac_us都需要使用
	reload=SYSCLK;					        
	//每秒钟的计数次数 单位为K	   
	reload*=1000000/configTICK_RATE_HZ;	
	//根据delay_ostickspersec设定溢出时间
										
	//reload为24位寄存器,最大值:16777216,在216M下,约合77.7ms左右	
	fac_ms=1000/configTICK_RATE_HZ;			
	//代表OS可以延时的最少单位	   
	SysTick->CTRL|=SysTick_CTRL_TICKINT_Msk;
	//开启SYSTICK中断
	SysTick->LOAD=reload; 					
	//每1/OS_TICKS_PER_SEC秒中断一次	
	SysTick->CTRL|=SysTick_CTRL_ENABLE_Msk; 
	//开启SYSTICK
}								    

//延时nus
//nus:要延时的us数.	
//nus:0~204522252(最大值即2^32/fac_us@fac_us=21)	    								   
void delay_us(u32 nus)
{		
	u32 ticks;
	u32 told,tnow,tcnt=0;
	u32 reload=SysTick->LOAD;				
	//LOAD的值	    	 
	ticks=nus*fac_us; 						
	//需要的节拍数 
	told=SysTick->VAL;        				
	//刚进入时的计数器值
	while(1)
	{
		tnow=SysTick->VAL;	
		if(tnow!=told)
		{	    
			if(tnow<told)tcnt+=told-tnow;	
			//这里注意一下SYSTICK是一个递减的计数器就可以了.
			else tcnt+=reload-tnow+told;	    
			told=tnow;
			if(tcnt>=ticks)break;			
			//时间超过/等于要延迟的时间,则退出.
		}
	};									    
}  
 
//延时nms,会引起任务调度
//nms:要延时的ms数
//nms:0~65535
void delay_ms(u32 nms)
{	
	if(xTaskGetSchedulerState()!=taskSCHEDULER_NOT_STARTED)
	//系统已经运行
	{		
		if(nms>=fac_ms)						
		//延时的时间大于OS的最少时间周期 
		{ 
   			vTaskDelay(nms/fac_ms);	 		
			//FreeRTOS延时
		}
		nms%=fac_ms;						
		//OS已经无法提供这么小的延时了,采用普通方式延时    
	}
	delay_us((u32)(nms*1000));				
	//普通方式延时
}

//延时nms,不会引起任务调度
//nms:要延时的ms数
void delay_xms(u32 nms)
{
	u32 i;
	for(i=0;i<nms;i++) delay_us(1000);
}
```
FreeRTOSConfig.h中注释下面的部分,不然会提示重定义了

```c
//#define xPortSysTickHandler SysTick_Handler
```

到这里就算是整个移植成功了，之后再对移植的配置等文件进行详细介绍。

如果想测试可以随便用个任务开个流水灯什么的进行一下测试就行了。

## Quote

> http://blog.csdn.net/zhzht19861011/article/details/7745151
> 
> http://www.openedv.com/thread-77593-1-1.html
> 
> http://www.openedv.com/thread-85247-1-1.html
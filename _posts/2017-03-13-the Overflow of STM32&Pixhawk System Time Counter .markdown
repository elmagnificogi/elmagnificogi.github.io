---
layout:     post
title:      "Pixhawk与STM32中系统时间计数器溢出"
subtitle:   "嵌入式，串口，驱动"
date:       2017-03-13
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
tags:
    - 嵌入式
---

## 溢出代码

```cpp
static volatile uint32_t timerx_micros_counter = 0;
static volatile uint32_t timerx_millis_counter = 0;
void TIMX_IRQHandler(void)
{
    if(TIM_GetITStatus(TIMx, TIM_IT_Update)==SET) 
	{
		timerx_micros_counter += 20000; // 20000us each overflow=20ms
    	timerx_millis_counter += 20; // 20ms each overlflow	

		...省略

    }
    TIM_ClearITPendingBit(TIMx, TIM_IT_Update);  
}
uint32_t XXX_Scheduler::micros() 
{
	uint32_t time_micros, tcnt, current;
	do 
	{
	    time_micros = timerx_micros_counter;
	    tcnt = TIM_GetCounter(TIMx);
	} 
	while(time_micros != timerx_micros_counter);
	current = time_micros + tcnt;
	return current;
}
```
## 简要分析

首先,timerx_micros_counter是一个32位寄存器最大也就是4294967296。

其中每一个数表示1us，稍微计算一下就知道了，这里的timerx_micros_counter顶多会在71.58分钟的时候，溢出。

而micros()这个函数其自身意义是显示当前系统从启动开始到现在的时间。

在Pixhawk中的任务调度系统中起关键作用，所以如果这个函数出了问题，那么带来的就不是一点点问题了，可能整个系统都会挂掉。

而根据我对Pixhawk的感觉来说，写代码人和飞行的人大概都觉得71分钟溢出，太久了，飞行器电池根本撑不了那么久。

然而实际情况却不是这样的，很多时候调试时不断电，只是不起飞而已，那么这个系统时间依然在走。

如果你飞行时间都刚好在71分钟内，那肯定不会出问题，但是如果你刚好越过了它，那就是机毁人亡。

当然上面的分析是针对使用了32位的数据类型来做计数的，而且Timer每滴答一次是1us的基础上才会这样，其他情况要具体问题具体分析。

## 解决方案

#### 扩大数据类型

既然32位数据类型会溢出，那么使用64位不就可以了吗？

数据扩大了一倍，根本不可能出现问题了。

```c
	uint64_t
	
	long long
```

想也知道,修改了micros()的返回值类型，造成的结果就是，所有使用了micros()的地方，全部都需要修改数据类型。

整个系统和时间有关的函数基本都要改，修改量真的是非常大。

就算是封装了那么多的接口，面对这样的问题依然没办法。

除了这里有一个数据类型的问题，还要考虑STM32以及Keil对于64位数据类型的编译和运算问题，很有可能返回的时候出现问题。

> http://www.openedv.com/thread-82038-1-1.html

比如这里，虽然他是用了keil的自带模拟查看的结果，可能不够准确，需要去拿板子实际测试一下才行。这个等我测试以后再说。

#### 调整TIMER滴答时间

既然Timer是一次1us，那么我只要让他这个表示的时间久一点，那么带来的结果自然是溢出时间也变久了。

比如把Timer调整为0.5MHz，或者更低的情况，这样就可以在不动数据类型，不修改任何接口的情况下，完成溢出的问题。

但是这样也有一个无法避免的缺点，那就是统计时间的精度下降了，而且除了这一点，如果IMU连着也用了这个函数进行姿态积分

那么计算的精度变差了，漂移时间也多了一些，整个稳定度会有所降低，但是具体降低多少，这个要实际测试，结合Timer降低的频率来看。

#### 使用其他数据类型

既然不能保证64位数据类型运算时，不出一点错，还要考虑兼容的问题，那么就用一个Struct类型，包含更多的基础变量，从而保障这一结构体没有问题。

当然如果要这样做，和改成64位数据类型一样，也需要修改所有相关联的地方。

#### 时间对比

突然发现利用封装可以再封装一层，保证没有问题。

保存一次上一次使用这个函数时的上一次时间，对两次时间进行比较，进而保证没问题

```c
uint32_t XXX_Scheduler::micros() 
{
	uint32_t time_micros, tcnt, current;
	static uint32_t last_time_micros=0;
	
	do 
	{
	    time_micros = timerx_micros_counter;
	    tcnt = TIM_GetCounter(TIMx);
	} 
	while(time_micros != timerx_micros_counter);
	current = time_micros + tcnt;
	if(last_time_micros>current) 
	{
		current=current+0xffffffffffffffff-last_time_micros;
	}
	last_time_micros=current;
	return current;
}
```
## Quote

> https://www.arduino.cc/en/Reference/Micros
> 
> http://www.openedv.com/thread-82038-1-1.html
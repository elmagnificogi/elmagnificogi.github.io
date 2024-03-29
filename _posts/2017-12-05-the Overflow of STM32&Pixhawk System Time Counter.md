---
layout:     post
title:      "APM与STM32中系统时间计数器溢出"
subtitle:   "APM，Copter loop，Overflow"
date:       2017-12-05
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.jpg"
catalog:    true
tags:
    - 嵌入式
    - APM
---

# Overflow

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
# 简要分析

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

比如这里，虽然他是用了keil的自带模拟查看的结果，可能不够准确，需要去拿板子实际测试一下才行。

经过测试：

```c
static volatile uint64_t timer5_micros_counter = 0x600000000;
void TIM5_IRQHandler(void)
{
	//TIM5的中断
	if(TIM_GetITStatus(TIM5, TIM_IT_Update)==SET)
	{
		timer5_micros_counter += 20000; // 20000us each overflow
		timer5_millis_counter += 20; //    20ms each overlflow
	}
	TIM_ClearITPendingBit(TIM5, TIM_IT_Update);
}
uint64_t micros()
{

	uint64_t time_micros, tcnt, current;

	do
	{
	  time_micros = timer5_micros_counter;
	  tcnt = TIM_GetCounter(TIM5);
	}
	while(time_micros != timer5_micros_counter);

	current = time_micros + tcnt;

	return current;
}
int main(void)
{
	uint64_t timenow=0;
	uint32_t *first,*second;
	delay_init(168);
	uart_init(115200);
	//TIM5 20ms一次中断 每次+1=1us
	_init_timer(5, 20000-1, 84-1);
	while(1)
	{
		timenow=micros();
		first=(uint32_t*)&timenow;
		second=first+1;
		printf("\r\n 当前系统时间: %d %d %lld \r\n",*first,*second,timenow);
		delay_ms(500);
	}
}
```

测试结果：

	[13:46:44.325]收←◆
	 当前系统时间: 3042703 6 25772846479

	[13:46:44.829]收←◆
	 当前系统时间: 3546520 6 25773350296

	[13:46:45.333]收←◆
	 当前系统时间: 4050337 6 25773854113

	[13:46:45.837]收←◆
	 当前系统时间: 4554154 6 25774357930

	[13:46:46.340]收←◆
	 当前系统时间: 5057971 6 25774861747

	[13:46:46.843]收←◆
	 当前系统时间: 5561788 6 25775365564

	[13:46:47.350]收←◆
	 当前系统时间: 6065606 6 25775869382

说明使用64位是没有问题的，至少STM32F4这里是没问题的。

#### 调整TIMER滴答时间

既然Timer是一次1us，那么我只要让他这个表示的时间久一点，那么带来的结果自然是溢出时间也变久了。

比如把Timer调整为0.5MHz，或者更低的情况，这样就可以在不动数据类型，不修改任何接口的情况下，完成溢出的问题。

但是这样也有一个无法避免的缺点，那就是统计时间的精度下降了，而且除了这一点，如果IMU连着也用了这个函数进行姿态积分

那么计算的精度变差了，漂移时间也多了一些，整个稳定度会有所降低，但是具体降低多少，这个要实际测试，结合Timer降低的频率来看。

最重要的是，其实还是在使用micros()的时候，这里表示的意义，不再是系统启动后过了多少us

而是系统启动后过了多少2us，这个意义就和之前不同了。

而且中断也对应变成了40ms一次的中断了。

除了这里需要改一下，还有使用这个接口的地方也需要改，需要把得到的时间差*2，从而获得正确的时间差。

#### 复合数据类型

既然不能保证64位数据类型运算时，不出一点错，还要考虑兼容的问题，那么就用一个Struct类型，包含更多的基础变量，从而保障这一结构体没有问题。

当然如果要这样做，和改成64位数据类型一样，也需要修改所有相关联的地方。

#### 增加溢出标志

既然已知是会溢出的，那么加一个标志计数器，用来统计溢出次数。

将上面的程序稍微修改一下就行，只是接口部分还是需要修改加上检测溢出情况的。

# Exception

三月份就发现了溢出,但是这个异常直到12月份才抓到,所以才重写了这个部分

```c
void Copter::loop()
{
    // wait for an INS sample
	while( ins_sample_time + 2500 > micros() ) {
		if( (ins_sample_time+2500) - micros() > 1500 )
			delay(1);
		else if( (ins_sample_time+2500) - micros() > 200 )
			delay_microseconds(200);
		else if( (ins_sample_time+2500) - micros() > 20 )
			delay_microseconds(20);
		else
			delay_microseconds(1);
	}
    uint32_t timer 	= micros();
	ins_sample_time = timer;
```

整个系统发生错误就是在这里,这个作为整个飞控的主循环是要保证2500us执行一次的,如果执行时间短于2500us则要在这里做延迟,而如果超过了2500us则直接进行下一步.

乍一看好像代码没有错,但是如果计数器溢出并且刚好时间是超过2500us的情况,就会发生71分钟甚至更久的延时等待情况

比如:

    ins_sample_time = 0xFFFFDAF1
    这时 ins_sample_time+2500 = 0xFFFFE4B5

但是由于一次loop执行时间超过了2500us,当程序执行到这里的时候micros()已经发生了溢出,那么这时micros()的返回值必然会很小,0x00000001F

    ins_sample_time + 2500 > micros() 就会出现必然成立的情况,就会出现一直等待的问题,至于恢复时间则完全要看发生溢出时的值是多少了,最少也要等待71分钟才能恢复正常.

而事实上这里的代码完全可以换一种方式,就能直接避免出现这样的情况了

#### 减法做差

```c
while( micros() - ins_sample_time < 2500 ) {
    if( (micros() - ins_sample_time ) < 1500 )
        delay(1);
    else if( micros() - ins_sample_time ) < 2300 )
        delay_microseconds(200);
    else if( micros() - ins_sample_time ) < 2480 )
        delay_microseconds(20);
    else
        delay_microseconds(1);
}
```

事实上由于这里存储时间都使用的是32位无符号整数,所以在计算差值的时候,就不应该使用加法然后做差,永远保证使用较大的数去减较小的数来做判断,就不会出现上述的异常了

## 总结

从某种程度上来说，这个函数规划的的时候就没有做好导致了现在这个结果。

在关于系统时间，计数器上一定要注意是否会溢出的问题。

不能以当前系统电力可持续时间来估计，而是以其十倍甚至百倍的时间来估计时间是否会溢出问题。

差值判断使用减法,可以避免出现一些溢出性的错误

## Quote

> https://www.arduino.cc/en/Reference/Micros
>
> http://www.openedv.com/thread-82038-1-1.html

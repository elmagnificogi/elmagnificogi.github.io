---
layout:     post
title:      "嵌入式底层驱动中时序等待超时处理"
subtitle:   "嵌入式，驱动，Timeout"
date:       2017-03-14
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.jpg"
catalog:    true
tags:
    - 嵌入式
---

## 超时代码

```c
//来源于STM32F4系列官方标准例程
uint8_t sFLASH_SendByte(uint8_t byte)
{
  	/*!< Loop while DR register in not emplty */
  	while (SPI_I2S_GetFlagStatus(sFLASH_SPI, SPI_I2S_FLAG_TXE) == RESET);

  	/*!< Send byte through the SPI1 peripheral */
  	SPI_I2S_SendData(sFLASH_SPI, byte);

  	/*!< Wait to receive a byte */
  	while (SPI_I2S_GetFlagStatus(sFLASH_SPI, SPI_I2S_FLAG_RXNE) == RESET);

  	/*!< Return the byte read from the SPI bus */
	return SPI_I2S_ReceiveData(sFLASH_SPI);
}

//来源于STM32F1系列官方标准例程（很老的版本）
void Single_Write(unsigned char id,unsigned char write_address,unsigned char byte)
{
	I2C_GenerateSTART(I2C1,ENABLE);

	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));

	I2C_Send7bitAddress(I2C1,id,I2C_Direction_Transmitter);

	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));

	I2C_SendData(I2C1, write_address);

	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));

	I2C_SendData(I2C1, byte);

	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));

	I2C_GenerateSTOP(I2C1, ENABLE);
}

//来源于STM32F4系列官方标准例程
{
  	/* Test on I2C1 EV5 and clear it */
  	TimeOut = USER_TIMEOUT;
  	while ((!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_MODE_SELECT))&&(TimeOut != 0x00))
  	{} 
  	if(TimeOut == 0)
  	{
    	TimeOut_UserCallback();
  	}
  	/* Send Header to I2Cx for write or time out */
  	I2C_SendData(I2Cx, HEADER_ADDRESS_Write);
  	/* Test on I2Cx EV9 and clear it */
  	TimeOut = USER_TIMEOUT;
  	while ((!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_MODE_ADDRESS10))&&(TimeOut != 0x00))
  	{} 
  	if(TimeOut == 0)
  	{
    	TimeOut_UserCallback();
  	}
  	/* Send I2Cx slave Address for write */
  	I2C_Send7bitAddress(I2Cx, (uint8_t)SLAVE_ADDRESS, I2C_Direction_Transmitter);
}
```
## 简要分析

首先看上面的代码，基本在时序中需要等待的部分，都是用while循环等待

第一部分SPI的等待，直接就是死等，没有超时的判断，如果硬件出了问题，那么必然卡在这里。

第二部分是以前的IIC的写法，也是一样的使用了while等时序，IIC受了干扰或者怎样，也会死在这里

第三部分是刚刚发现，竟然F4系列中IIC有了超时判读，还有超时处理？

首先是在循环等待中加了一个计数器，用来判断是否超时的。

同时又在超时时，调用了一个callback函数，来处理超时问题。

```c
static void TimeOut_UserCallback(void)
{
  /* User can add his own implementation to manage TimeOut Communication failure */
  /* Block communication and all processes */
  while (1)
  {   
  }
}
```

这种已经算是仁至义尽了,其实也是很好的，如果出现异常，那么给回调函数去处理这个问题。

## 我的写法

我写的时候没想到回调函数，所以用了下面的这种需要调用者在使用函数的时候做判断。

首先是一个等待时序超时判断，如果等待时序超时了，那么有可能是一个短暂干扰，所以还可以继续尝试。

如果多次尝试失败，说明可能硬件出问题了，那么这个时候就返回传输失败的false

上层通过判断返回值，来进行异常处理，当然这种会不会出问题完全得看使用这个函数的人了。

如果他不可靠，那么这里也不可靠，就不如上面的使用回调函数，交给系统中的异常处理或者是什么其他子系统去处理这个问题。

```c
#define GetFlag_Timeout 840
#define Transfer_Timeout 3
bool transfer (uint8_t data,*uint8_t output)
{
	int timeout_T=0,timeout_W=0;
	
	while(timeout_T++<Transfer_Timeout)
	{
		timeout_W=0;
  		while (GetFlagStatus(FLAG_TXE) == RESET &&  timeout_W++ < GetFlag_Timeout){}
		if(timeout_W>GetFlag_Timeout)
			continue;
		else
			break;
	}
	if(timeout_T>Transfer_Timeout)
		return false;

	SendData(data);

	timeout_T=0
 	while(timeout_T++<Transfer_Timeout)
	{
		timeout_W=0;
		while (GetFlagStatus(FLAG_RXNE) == RESET && timeout_W++ < GetFlag_Timeout){} 
		if(timeout_W>GetFlag_Timeout)
			continue;
	}
	if(timeout_T>Transfer_Timeout)
		return false;

	ReceiveData(output)

	return true;
}
```

## 总结

这个问题不仅仅出现在SPI，IIC这里，在其他总线里也可能会出现，涉及时序的都有可能，那么出现这种问题的时候要如何处理，就很关键了。

这种地方真的出现问题的概率其实很低，而且多半都是硬件问题，比如短路了啊，接触不良啊什么的，但是只要一出现了那么问题就非常严重了，在四轴这种东西上基本就是直接掉下来了。

我个人感觉把异常给回调函数，然后通过回调函数再去处理或者是向上抛出异常，应该是更优秀的做法。

## Quote

> http://blog.csdn.net/mmhh3000/article/details/41644257
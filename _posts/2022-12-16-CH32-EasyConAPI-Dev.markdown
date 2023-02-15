---
layout:     post
title:      "CH32快速开发移植EasyConAPI"
subtitle:   "伊机控、NS、单片机"
date:       2022-12-16
update:     2022-12-25
author:     "elmagnifico"
header-img: "img/cap-head-bg2.jpg"
catalog:    true
tags:
    - CH32
    - EasyCon
---

## Foreword

开发一下CH32，快速移植一个EasyConAPI上去

![image-20221216220451721](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162204792.png)



## CH32环境

先从官网拉下来所有相关资料

> https://www.wch.cn/search?t=all&q=ch32f103



#### 安装

查看官方评估版资料，例程中的模拟HID和CDC串口就刚好是我们需要的，稍微修改一下应该就能用了。

![image-20221216210321083](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162103160.png)

先要安装`Keil.WCH32F1xx_DFP.1.0.1.pack`才能用keil正常打开工程，直接更新是没有WCH的

![image-20221216212321333](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162123371.png)

后来发现ISP软件也支持添加库，不过比起DFP还是麻烦了一点

![image-20221216220003154](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162200181.png)



#### 编译器不兼容



直接测试Demo USB工程，会发现编译直接报错了

```
ch32f103  ../../SRC/CMSIS/core_cm3.c(445): error: non-ASM statement in naked function is not supported
```

仔细看一下，其实是Keil版本更新了，最新的Keil只有Compiler 6，而没有5了，ch32是基于老版本构建的

![image-20221216213345880](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162133914.png)

##### 安装V5

两个办法，一个是直接下一个老版的ARM Compiler

> https://developer.arm.com/downloads/view/ACOMP5

这里很容易被恶心到，ARM必须要注册才能下载，并且注册还必须手机验证、邮箱验证，搞不好还会被提示地区要被审查，你暂时无法登录，就是不给你下载，所以我下了一个放到了我的工具里，直接下载就行了，这个东西官方也不会更新了，所以以后也不需要考虑换什么的。

> https://github.com/elmagnificogi/MyTools/tree/master/ARMCompiler_506



![image-20221217193604143](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212171936223.png)

- 一定要安装在这个目录中，否则会提示你没有授权

![image-20221217193829899](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212171938943.png)

![image-20221217193840852](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212171938882.png)

然后就能看到V5版本了



##### 修改工程

还有一个修改一下工程即可

修改语言标准

![image-20221216213759846](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162137878.png)

移除报错文件`core_m3.c`，再进行编译就完全正常了。



#### 下载

![image-20221216214134693](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162141737.png)

安装`WCHISPTool_Setup.exe`

![image-20221216214259707](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162142801.png)

需要板子进入boot模式，boot0接VCC，boot1接GND，然后重启连接，USB插HUSB，这个口默认是ISP接口

![image-20221216214646514](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162146538.png)

识别到以后还需要再安装一个驱动，CH32F103对应的是CH375的串口，所以要一个对应驱动就行了，官网就能下到（其实安装ISP的时候就带了，眼瞎没看到）![image-20221216215312234](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162153263.png)

> https://www.wch.cn/downloads/CH372DRV_ZIP.html

![image-20221216215043767](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162150793.png)

软件有点问题，太老了，高分辨率会导致UI错乱，只能全屏用了

![image-20221216215623514](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212162156590.png)

选好程序以后，直接就能下载了，还是比较方便的。

这里要注意，把读保护关闭，否则后面可能debug或者用st-link下载会出现无法烧写校验等情况

![image-20221217202737371](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212172027460.png)



后来发现新版的ISP下载软件有点挫，如果是老版本的UI就很ok，建议还是用老版的吧

![image-20221225203319565](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212252033610.png)



## USB例程问题

可能其他例程都能正常跑，但是CDC的例程只要连上，就提示无法识别

![image-20221222003310738](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212220033853.png)

代码中推荐用串口2作为调试串口，把串口1用来CDC转发。默认代码中是使用串口1作为调试串口的。我以为不改也没关系，就没管，然后怎么都不识别CDC串口。

![image-20221222003358443](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212220033505.png)

官方论坛又看到官方回复，`取消串口2作为调试口`，更坚定了我的想法。然而事实是，要用串口2作为调试串口，然后这个CDC例程才能正常工作，真是坑爹啊。

再仔细一看这个debug，是所有例程公用的，一改全改了。



## USB无法识别

如果在代码初始化的过程中，优先去执行一些耗时的操作

```c
int main(void)
{
	Delay_Init(); 
	NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
  	USART_Printf_Init(115200);
  	EasyCon_script_init();
    Delay_ms(1000)
	/* USB20 device init */
	UART1_ParaInit(1);
	USBHD_RCC_Init( );
	USBHD_Device_Init( ENABLE );
  
	/* Timer init */
  	TIM2_Init();
  	ledb_test();
  	/* USBD init */
	Set_USBConfig(); 
  	USB_Init();	    
 	USB_Interrupts_Config();    
}
```

比如delay了1秒或者是操作了flash，就会导致usb初始化直接失败。原因是USB的引脚在默认上电的情况下，就已经自带上拉了，会导致主机直接识别了USB插入，就会开始准备USB初始化了，而实际的MCU还在干别的事情，等MCU忙完了去初始化USB就会直接失败了。

解决这个问题也很简单，初始化第一步就是先把USB的引脚挂起，让他无法被识别即可，后续再让他初始化就行了。

```c
int main(void)
{
	Delay_Init(); 
	USB_Port_Set(DISABLE, DISABLE);
	USBHD_Device_Init( DISABLE );
	NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
	Delay_Init(); 
  	USART_Printf_Init(115200);
  	EasyCon_script_init();
	/* USB20 device init */
	UART1_ParaInit(1);
	USBHD_RCC_Init( );
	USBHD_Device_Init( ENABLE );
  
	/* Timer init */
  	TIM2_Init();
  	ledb_test();
  	/* USBD init */
	Set_USBConfig(); 
  	USB_Init();	    
 	USB_Interrupts_Config();    
}
```



## USB移植修改

![image-20221225205251970](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212252052004.png)

USB移植修改的时候，基本上这里的文件大部分都要改动，官方例程写的不是很好，很多很细节的东西都在一个个小函数里，不对比很难看出来问题

特别是Reset中设置了ENDP口，其他都改对了，但是这里不改的话是不能正常工作的

```c
/*********************************************************************
 * @fn      USBD_Reset
 *
 * @brief   Virtual_Com_Port Mouse reset routine
 *
 * @return  none
 */
void USBD_Reset(void)
{
    pInformation->Current_Configuration = 0;
    pInformation->Current_Feature = USBD_ConfigDescriptor[7];
    pInformation->Current_Interface = 0;

    SetBTABLE(BTABLE_ADDRESS);

    SetEPType(ENDP0, EP_CONTROL);
    SetEPTxStatus(ENDP0, EP_TX_STALL);
    SetEPRxAddr(ENDP0, ENDP0_RXADDR);
    SetEPTxAddr(ENDP0, ENDP0_TXADDR);
    Clear_Status_Out(ENDP0);
    SetEPRxCount(ENDP0, Device_Property.MaxPacketSize);
    SetEPRxValid(ENDP0);
    _ClearDTOG_RX(ENDP0);
    _ClearDTOG_TX(ENDP0);

    SetEPType(ENDP1, EP_INTERRUPT);
	  SetEPTxAddr(ENDP1, ENDP1_TXADDR);
    SetEPTxStatus(ENDP1, EP_TX_NAK);
    _ClearDTOG_TX(ENDP1);
    _ClearDTOG_RX(ENDP1);

    SetEPType(ENDP2, EP_INTERRUPT);
    SetEPRxAddr(ENDP2, ENDP2_RXADDR);
    SetEPTxStatus(ENDP2, EP_RX_DIS);
    SetEPRxStatus(ENDP2,EP_RX_DIS);
    _ClearDTOG_TX(ENDP2);
    _ClearDTOG_RX(ENDP2);
    
    SetDeviceAddress(0);

    bDeviceState = ATTACHED;
}
```



## USB HID查看工具

#### HIDDemonstrator_V1.0.2

他必须要vc++ 2005才能正常打开，实际上我打开了也用不了。不推荐



#### MyUSB.exe

![image-20221225205722084](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212252057124.png)

这个只能看个大概，不能打开USB看不到具体包，也不推荐



#### HID调试助手.exe

![image-20221225205819565](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212252058599.png)

直接打不开设备，淘汰



#### 纸飞机

![image-20221225210230723](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212252102775.png)

收费软件，也不是很贵，20多，第一次试用直接给了1个月，可以直接打开设备，也能调整分包什么的，简单用用还是不错的。

他的其他功能比较强大，画图什么的

#### USBlyzer

![image-20221225210904537](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212252109647.png)

这就比较强大了，可以查看各种包，会分类什么的

同时也能看到对应的USB描述符、配置等等内容，可以用来审查是否和自己的设置不同

![image-20221225211035314](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212252110348.png)



## EasyMCU_CH32

已经移植完成了

> https://github.com/EasyConNS/EasyMCU_CH32



## Summary

WCH不愧是专业搞USB相关的，确实很多东西做的很简单。



## Quote

> https://www.cnblogs.com/milton/p/15840921.html
>
> https://blog.csdn.net/CAImoontion/article/details/112565011
>
> https://www.yourcee.com/newsinfo/2928217.html
>
> https://blog.csdn.net/weixin_44775687/article/details/126843414
>
> CH32F103评估板说明书.pdf
>
> https://www.keil.com/appnotes/files/apnt_298.pdf
>
> https://www.wch.cn/bbs/thread-97775-1.html


---
layout:     post
title:      "STM32替代-MCU国产化-厂商介绍"
subtitle:   "STM32，单片机"
date:       2022-03-26
update:     2022-03-26
author:     "elmagnifico"
header-img: "img/docker-head-bg.jpg"
catalog:    true
tags:
    - Embedded
---

## Foreword

很烦，ST又发了涨价函，就没见过降价函。之前已经搜过，对比过一次替代的厂商，不过都是高性能方向的，这次都介绍一下，以后直接从这里面找。

目前总体来看，低性能芯片往往都能找到代替品，而靠近中端或者高端的芯片，则是没有替代品，国产的仿制水平还是差了些，估计还得再发展个几年才行。

![image-20220326100620363](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220326100620363.png)

由于近年芯片发展比较快，具体的产品型号要拿对应官网的最新选型表去确认，还要和销售二次确认是否有货，比较繁琐，就不列举了。



## 国内



### 平替

这部分公司的基本上可以直接平替ST的某些型号



#### 雅特力科技

> https://www.arterytek.com/cn/index.jsp

主要是对标ST32F4系列的产品，算是中性能MCU吧。



#### 航顺芯片

> http://www.hsxp-hk.com/

航顺涉及的比较多，从低端到高端基本都有，M0-M3-M4的，主要还是以低端为主，M4只有几个BLE的，所以主要是M0和M3的产品



#### 中微爱芯

> http://www.i-core.cn/

中微的则是以8bit为主，32位的仅有部分比较接近F1和F0的系列



#### 沁恒WCH

> http://www.wch.cn/

沁恒主要是F1和F2系列



#### 艾派克/极海半导体

> https://www.geehy.com/index

艾派克M0，M3，M4，M7都有产品，不过M4和M7都仅有一款产品。主要是F0、F1、F4系列的部分产品，M7的产品目前没有更多介绍，应该是还没有量产，不过值得期待吧。



#### 兆易创新

> https://www.gigadevice.com/zh-hans/

GD32，主要产品是M23、M3、M4、M33的部分，M4的部分比较多一些，由于之前用过，他们家M4的主频比较高



#### 中科芯

>http://www.cksmcu.com/cn/index.html

主要是M0、M3系列，替代F0、F1、F4的部分产品



#### 华大半导体

> https://www.hdsc.com.cn/

主要是M4和M0系列，对应F4和F0



#### 芯海科技

> https://www.chipsea.com/

主要是M0系列的F0



#### 国民科技

> https://www.nationstech.com/

主要是M4和M0系列，对应F4和F0



#### 贝特莱

> 官网挂了
>
> 贝特莱有基于ARM Cortex-M 系列的MCU。BLM32F103 已经大量在打印机，刷卡机，航模，独轮车，无人飞机，电机控制。经过在各大网站上搜索，能找到BLM32F103R8T6、BLM32F103CBT6、BLM32F103RBT6和BLM32F103C8T6，可直接替代对应STM32型号。



#### 华芯微特

> https://www.synwit.cn/

主要是M4和M0系列，对应F4和F0



#### 闪芯微

> http://www.flashchip.com.cn/

主要是M0系列，对应F1和F0



### 换方案

以下厂商基本就是整个方案替换了



#### STC

> https://www.stcmcudata.com/

STC就比较老了，以8位的为主，现在也有2款32位的，不过频率都是比较低的



#### ESP

> https://www.espressif.com/zh-hans

ESP勉强能加进来，毕竟主业不是传统MCU，主要是WIFI和蓝牙，只是有些需求不高的，可以考虑用ESP32的方案来做



## 国外

国外平替倒是没听说，所以基本上也都是换方案了



#### TI

> https://www.ti.com/

TI主要是M4F和M3，还有R4F



#### Freescale/NXP

> https://www.nxp.com/

恩智浦涉及的比较广，M0、M3、M33、M4、M4F、M7都有



#### 瑞萨

> https://www2.renesas.cn/cn/zh

瑞萨基本买不到，瑞萨本身涉及的范围类似恩智浦，基本上也都有，不过没有M7类型的



#### 英飞凌

> https://www.infineon.com/

英飞凌是M0、M3、M4都有，还有几个我看不懂的自由品牌的内核



#### Toshiba

> https://toshiba.semicon-storage.com/us/semiconductor/product/microcontrollers.html

主要是M0和M3、M4的部分MCU



#### ST

既然都是替换ST了，为啥还有ST，因为有些时候ST的某些低端型号的价格比高端的都高，那么直接用高端的不香嘛，所以有时候可以选择更高性能的款，可能价格反而便宜了。



## Summary

如果还有遗漏的话，日后再补充



## Quote

> https://blog.csdn.net/liht1634/article/details/115301476
>
> https://zhuanlan.zhihu.com/p/376895827
>
> https://blog.csdn.net/sphinz1/article/details/109602323


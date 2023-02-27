---
layout:     post
title:      "在VS中使用VisualGDB开发STM32"
subtitle:   "STM32，IDE"
date:       2022-03-16
update:     2022-03-16
author:     "elmagnifico"
header-img: "img/cap-head-bg2.jpg"
catalog:    true
tags:
    - Embedded
---

## Foreword

以下是使用VisualGDB在VS中建立一个STM32的工程



## VisualGDB

> https://visualgdb.com/



> Go cross-platform with comfort
>
> VisualGDB makes cross-platform development with Visual Studio easy and comfortable. It supports:
>
> - Barebone embedded systems and IoT modules ([see full list](https://visualgdb.com/hwsupport/devices/))
> - [C/C++ Linux Applications](https://visualgdb.com/?features=linux)
> - [Native Android Apps and Libraries](https://visualgdb.com/?features=android)
> - Raspberry Pi and other [Linux boards](https://visualgdb.com/hwsupport/linuxboards/)
> - Linux kernel modules (separate [VisualKernel](http://visualkernel.com/) product)
> - ESP32 and Arduino targets
>
> VS2008-2022 including the free Community Edition are supported.

简单说就是一个高度集成的插件，用来支持windows到linux等嵌入式开发的工具



### 安装

> https://visualgdb.com/download/

直接下载安装，有30天的免费试用



### 使用

由于是VS2022，所有有些教程中的选项现在反而找不到了。

创建新项目，使用gdb过滤，没有单独的VisualGDB的选项卡

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161529075.png)

这里选择`Embedded Project Wizard`

第一次新建会出现，激活30天试用

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161530643.png)

然后是一些工程配置，默认即可

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161531936.png)

工程类型，编译选择MSBuild

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161533897.png)

选择ARM工具链，第一次需要安装arm-eabi，这个也有点慢（大概要一两个小时才能下完），最好挂代理

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161534237.png)

选择芯片，然后安装STM32 Devices，一样可能比较慢

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161638903.png)

安装完以后

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161730070.png)

选择一个demo工程，亮个灯

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161731488.png)

选择调试方式，这里选J-Link，然后自动安装

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161732334.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161755192.png)

要选择J-Link目录，由于我这里实际没有，所以跳过了，切换到Full-custom mode 暂时跳过这个

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161755005.png)

生成的工程如下，编译正常

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161735238.png)

后期还可以通过工程属性修改Debug选项，本质上也是用arm-none-eabi的解决方案

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161737656.png)



## 问题

很明显，VisualGDB把`.s`的启动文件给隐藏了，关键是藏哪里了还找不到，整个工程里根本没有

其次RAM的编排文件好像没有，也就是每块RAM的分割或者分配，好像就控制不了。



#### 创建RTOS的工程

选择FreeRTOS，然后重建工程，其他流程相同

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161758303.png)

可以看到，原本的汇编启动文件，这里直接变成了C文件，然后启动流程上基本和汇编一样。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161759024.png)

在工程链接里总算找到了内存分块的地方

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202203161803664.png)

## Summary

总体上来说VisualGDB比起VS Code的集成度要高上不少，唯一的问题在于如果出了问题，想找解决方案比较困难。

VisualGDB他的工程模板直接就是C++的方式，所以他把C++需要用的库基本都整合进去了，那就比较方便C++开发

还有一点，就是我想做的方案是可以跨平台的，可以在其他地方部署，自动完成编译，目前来看如果选择了VisualGDB，那么就有些困难了



## Quote

> https://blog.csdn.net/fox0815/article/details/104418131




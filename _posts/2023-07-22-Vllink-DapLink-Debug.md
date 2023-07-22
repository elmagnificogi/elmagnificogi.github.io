---
layout:     post
title:      "Vllink无线调试上手体验"
subtitle:   "J-Link,CMSIS-DAP,SES,Keil,ST"
date:       2023-07-22
update:     2023-07-22
author:     "elmagnifico"
header-img: "img/y4.jpg"
catalog:    true
tobecontinued: false
tags:
    - Embedded
    - SES
    - Debug
---

## Foreword

想尝试一下无线版本的J-Link，仔细调研了一下发现，实际上是CMSIS-DAP来实现的。而无线版本的J-Link全都断货了，只好找一些其他厂家的，于是看到了Vllink。比较巧的Vllink是基于AIC8800的，之前刚好调研过。



## Vllink

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221530992.png)

> http://vllogic.com/

官方文档，介绍了主要功能。

Vllink可以用有线模式，也可以用无线模式。

有线的话就是一个DAP-Link，走CMSIS-DAP，无线需要两个模块，一个作为AP，一个做STA，二者配对以后才能进行无线调试（他竟然用的是wifi6的ap）。

用起来还是比较方便的，双击两下按钮就能切模式，AP配对也只需要几秒钟就行了。

Vllink 支持的IDE比较多，基本各个厂家的都支持了



购买链接

> https://vllogic.taobao.com/shop/view_shop.htm?shop_id=216739170



## 配合Keil使用

![image-20230722141652122](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221416243.png)

很简单，直接连好SWD三根线，切换到DAP v1或者v2版本就能正常使用了。

无线单步调试也比较流程

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221420327.gif)



## 配合SES使用

建议不要配合SES使用，实际体验并不行



首先需要刷固件，只需要修改连接USB的电脑端固件即可

![image-20230722142145181](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221421214.png)

SES作为J-Link官方IDE，对于CMSIS-DAP支持十分有限，仅支持DAP v1版本，所以需要固件变更到这个版本。

升级也非常简单，直接访问在线升级即可

> https://devanlai.github.io/webdfu/dfu-util/

![image-20230722153237120](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221532175.png)

实际进度条走满以后可能会报错，这里就可以忽略了，重启即可。



Vllink说只需要将工程的`Target Connection`修改为J-Link即可，默认就是了

![image-20230722142508529](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221425597.png)

实际上不止于此，SES对于J-Link的延迟要求很高，这里的Speed需要降速，否则会一直提示J-Link连接失败，DAP 初始化失败什么的

```
SWD selected. Executing JTAG -> SWD switching sequence.
Error: Failed to initialized DAP.
```

![image-20230722142524116](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221425187.png)

降速之后，就可以100%连接成功了。但是实际体验非常差，单步调试，每步都需要消耗三四秒才反应到下一步，非常的慢，基本可以说是不能用的级别了。





## 配合OpenOCD使用

首先下载OpenOCD

> https://gnutoolchains.com/arm-eabi/openocd/

然后将`openocd.exe`所在文件夹加入`path`路径，比如`D:\OpenOCD-20230712-0.12.0\bin`

- 注意新版的openocd只支持CMSIS-DAV v2 ，所以Vllink需要升级到新版本，而不能用v1的版本

将SES中的调试配置切换到`GDB Server`

![image-20230722155002389](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221550451.png)



GBD server这里，使用OpenOCD，并且要自己写命令行，后面必须指定interface和target是什么，否则可能识别不了。

![image-20230722155017902](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221550956.png)



```
openocd.exe -f interface\cmsis-dap.cfg  -f target\stm32h7x_dual_bank.cfg
```

interface一律都是`cmsis-dap.cfg`，而目标芯片根据需要改就行了。

interface和target等等，都在openocd安装路径中，多数常用的芯片都有，所以不需要额外自行配置，找到合适的即可



经过测试可以正常使用，并且单步调试延迟也非常低

![image-20230722155649283](https://img.elmagnifico.tech/static/upload/elmagnifico/202307221556344.png)

也有一点缺点，就是**OpenOCD下载或者是读取的时候，没有进度反馈，SES处于假死状态，只有下完了才会提示**



## Summary

Vllink基本可用，只是想要更深度配合SES有点困难了



## Quote

> https://vllogic.com/software/segger_embedded_studio
>
> https://wiki.segger.com/Embedded_Studio_with_GDB_Server

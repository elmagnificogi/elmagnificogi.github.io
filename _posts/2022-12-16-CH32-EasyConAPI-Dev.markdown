---
layout:     post
title:      "CH32快速开发移植EasyConAPI"
subtitle:   "伊机控、NS、单片机"
date:       2022-12-16
update:     2022-12-22
author:     "elmagnifico"
header-img: "img/cap-head-bg2.jpg"
catalog:    true
tags:
    - CH32
    - EasyCon
---

## Forward

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

> https://developer.arm.com/documentation/ka005184/latest

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



## USB例程问题

可能其他例程都能正常跑，但是CDC的例程只要连上，就提示无法识别

![image-20221222003310738](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212220033853.png)

代码中推荐用串口2作为调试串口，把串口1用来CDC转发。默认代码中是使用串口1作为调试串口的。我以为不改也没关系，就没管，然后怎么都不识别CDC串口。

![image-20221222003358443](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212220033505.png)

官方论坛又看到官方回复，`取消串口2作为调试口`，更坚定了我的想法。然而事实是，要用串口2作为调试串口，然后这个CDC例程才能正常工作，真是坑爹啊。

再仔细一看这个debug，是所有例程公用的，一改全改了。



## EasyMCU_CH32

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


---
layout:     post
title:      "2022年嵌入式开发环境介绍"
subtitle:   "STM32，IDE"
date:       2022-03-14
update:     2022-03-15
author:     "elmagnifico"
header-img: "img/blackboard.jpg"
catalog:    true
tags:
    - Embedded
---

## Foreword

嵌入式开发环境（偏向STM32）有非常多的选择了，这里就是介绍一个大概，有些被淘汰了的，可以直接忽略。

目前总的来说有3种模式，一种是带有官方属性的，集成化的，一种是半集成化的，需要通过插件支持完善开发环境，但总体来说还算方便，还有一种则是除了编辑器以外，编译调试等都需要借助外力来完成，搭建环境比较复杂。

后续会有几篇实际IDE的体验文字



## IAR Embedded Workbench

> https://www.iar.com/ewarm

![image-20220314165236150](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203141653902.png)

IAR 不必说，嵌入式老牌IDE了。但是由于当年对这个东西的厌恶，再加上现在和其他IDE比起来，也显得很老气，所以不推荐了。如非必要没必要选择IAR了。毕竟和Keil比起来不是亲儿子，编译虽然快了，但是又不如SES，而代码提示啥的又不如VS，代码优化不如Keil，总的来说非常中庸，各方面都不如别人，但是又没啥明显短板。



## Keil

> https://www2.keil.com/mdk5/uvision/

![image-20220314165717061](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203141657151.png)

keil 更不用说了，从当年一个人维护的IDE，到后来被ARM官方收购了，能选择keil的地方，基本就没必要选择IAR，但是keil还是太老了啊，跟不上节奏就算了，编译速度基本上是所有编译器里最慢的，快的能比他快七八倍，老大哥，当能饭否？

最近Keil出了一个免费版本，简单说还是那个Keil，只是这次给了一个社区版本，没有代码限制了，功能也比较全，只要注册一下就给社区激活码。



#### Keil Studio

![image-20220315173345057](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151733161.png)

> https://www.keil.arm.com/

现在只要官网注册，就可以拿到测试版的资格，目前来看就是一个云端IDE，基于Web的。目前的build应该也是云端build，编译速度比较快，实际上本地并没有执行编译。所以估计以后这个也是部署在服务器上的，然后开发者通过云端连接到服务器进行开发。

除了这个以外，目前Keil也支持将工程导出成Keil Studio或者反向导出，可能是用来给本地调试的，毕竟依赖云端，用远程gdb调试，估计可能延迟太高了。

但总的来说Keil能做出一点改变，太不容易了，这个云端的渲染比本地的看着舒服多了。



## Eclipse

![image-20220315145812053](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151458133.png)

Eclipse 本身就是大杂烩，他能作为嵌入式IDE的核心是 gcc_arm_none_eabi，靠着他实现了嵌入式开发。

> http://elmagnifico.tech/2021/04/24/Ubuntu-gcc_arm_none_eabi/

但是Eclipse已经日暮西山了，本身开源带来的大杂烩导致整体优化差，动不动出一些小bug，关键你还无法解。其编译速度虽然比keil快一些，但是挡不住IDE本身的卡顿，需要资源更多，虽然跨平台了，但是卡起来真是太难受了。如果他不能像VS一样，借着VS Code重新出发，那么最后被淘汰是无法避免的。

而在其本身的Java领域里，这些年 JetBrains 奋起直追，Eclipse早已失色，而JetBrains 也是开源，更加现代化。虽然现在 JetBrains 也饱受诟病，优化还不够好，但是总比Eclipse强多了。



### STM32CubeIDE

![image-20220315145849359](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151458410.png)

> https://www.st.com/zh/development-tools/stm32cubeide.html

由于Eclipse本身是开源的，而ST官方为了高集成度，则是基于Eclipse，结合CubeMX 打造了自己的IDE，整个UI上基本一毛一样，只是由于是针对ST的芯片，所以集成度比较高，基本上手就能用了，不过Eclipse有的毛病，他自然也都有，目前比较少有人将STM32CubeIDE作为第一选择吧。



### TrueSTUDIO

![image-20220315150438728](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151504840.png)

> https://www.st.com/zh/development-tools/truestudio.html

Atollic 之前被ST收购了，于是出了这么一个整合ST嵌入式开发的IDE，本质上还是Eclipse的变种而已。而STM32CubeIDE则是TrueSTUDIO与STM32CubeMX的结合体，所以这个东西已经过气了，再怎么选择都不会选择他了。



## Visual Studio

以 Visual Studio 作为主编辑器，而靠其他插件来支持嵌入式开发。



### VisualGDB

> https://visualgdb.com

![image-20220314180223747](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203141802778.png)

VisualGDB不能算是个IDE，他只是个插件，但是当他和Visual Studio结合到一起以后，就可以作为一个嵌入式IDE了。借助于VS的强大代码补全、查看等特性，让VisualGDB+VS 这一组合大受欢迎。

刚开始认识VisualGDB是听说他用过和linux虚拟机联调，但是总觉得很蠢，就没在意。后来这个也有的嵌入式方面的支持，但是早年的时候debug貌似有些问题，所以少有人用吧。而且它本身也不是免费开源的，而是收费软件，虽然比起来价格算是最便宜的收费软件了。

同时VisualGDB目前也结合了CubeMX的工程模板，创建工程来说也非常方便。



### Embedded Software Development

![image-20220315174547490](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151745601.png)

> https://devblogs.microsoft.com/cppblog/visual-studio-embedded-development/

简单说当前的Visual Studio 2022中包含了一个安装选项，可以添加嵌入式的开发环境，并且基于此可以对RTOS进行调试。而这个是官方支持的嵌入式开发和其他野生的可是大不相同。只是目前版本还比较低，可用性不高。

由于当前集成度还不够高，vs这边还不能当作工程对待，所以感觉起来就比较零散，各个功能很独立。目前是靠vcpkg来完成一些相关包的安装



## CLion

![image-20220315145938578](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151459629.png)

使用CLion，就比较复杂一些，毕竟本身CLion本身是不支持嵌入式的，编译需要额外安装指定gcc-arm-one-eabi，然后如果要debug还需要指定OpenOCD，而要调用还需要MinGW的支持，所以集成度比较低。

结合CubeMX 则需要生成 SW4STM32 的格式，其实本质上就是Eclipse的文件结构

总体来说效果一般，只是习惯了JetBrains全家桶的可能比较喜欢这种方式。



## VS Code

以VS Code 作为主编辑器，而靠其他插件来支持嵌入式开发。



### PlatformIO

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151511321.png)

> https://platformio.org/



PlatformIO的槽点在于他的很多东西需要翻墙才能获取到，这就导致一般人经常被安装一个小东西或者是获取板子等硬件信息卡很久，甚至创建个工程有人可能要几十分钟才能成功。

从PlatformIO的设计思路上来看，他是将环境分为了平台（硬件厂商）—框架（Arduino还是CubeMX）—开发板（具体硬件，也有评估板）—开发库（Std还是HAL库）。当你新建一个工程以后，默认情况下你是看不到关于开发库或者是框架相关的代码的，是隐藏的，也就是让你专注于用户侧的代码，而不必关系库的问题。这样对于只是简单DIY的玩家来说是够用的，但是对于深度研发，可能需要修改库之类的，可能就有点不够。

PlatformIO 本身没有编辑器，整个编辑器是靠VS Code来提供的，所以他也是以插件的形式存在的。



### gcc-arm-none-eabi

![image-20220315161026450](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151610513.png)

依靠gcc-arm-none-eabi 这种方式就类似于CLion了，也需要MinGW，如果调试可能还需要OpenOCD。配置流程类似于CLion，都比较复杂一些。



### Ozone

![image-20220315160843525](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151608781.png)

Ozone准确来说只是拿来调试的工具，很早的时候我倒是试过，不过后来就给忘记这个东西了。Ozone基本是一定要配合J-Link使用，毕竟亲儿子了。只要导入对应的elf、axf还有源码工程，就可以直接单步调试了，总体上还是很不错的。

很早的时候就已经支持操作系统调试了，可以看到对应的任务情况，还有一些额外功能是keil或者其他调试工具没有的，比如死机以后快照的保存等等，总的来说作为调试工具的话，Ozone是大而全的。



平常小打小闹可以用用OpenOCD，而有些比较难的问题就可以靠Ozone来解决。



### Keil Assistant

这也是一个插件，简单说就是用VS Code写代码，他支持直接打开Keil的工程文件，用Keil来编译和调试，集各家之所长吧，算是一个取巧方案。

这种方案不仅仅有Keil，而且还有IAR的版本，所以某种程度上可能是大家都是互通的，编辑用一个，编译调试用另外一个

IAR的版本就叫 IAR Embedded Workbench



### Embedded IDE

我之前开发的STM8等这种性能比较差的单片机，就可以使用这个插件

![image-20220315195410042](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151954128.png)

不过他本身不支持调试，只是可以用来写代码和烧写而已。



### Embedded Tools![image-20220315174810670](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151748762.png)

同理VS中有了嵌入式开发环境，对应的VS Code里也会有，最后实现的效果类似于VS中的。

VS Code本身通过这种方式达到的效果就不够一体化，所以实际用起来还是比较难受的。

目前是靠vcpkg来完成一些相关包的安装。



## SEGGER Embedded Studio

![image-20220315162635446](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151626499.png)

> https://www.segger.com/products/development-tools/embedded-studio/

前面既然提到了Ozone，那么SEGGER家官方的IDE自然也得安排上。当年由于SES使用的人太少了，所以官方早年就推出了个人免费License，这个是全功能的，基本没有限制，现在已经是主流之一了。



SEGGER Embedded Studio 似乎知道编译的问题，所以直接可以选择编译的工具链，甚至你可以用Keil的ARMCC，这样的话就算有不支持的MCU，也一样可以转而借用Keil的编译完成。



SES也有一点缺点，就是整体的高亮显示啊（其实是有点素，没有VS那么鲜艳），代码提示这些比起VS，那还是有点差距的。



### CrossStudios

![image-20220315165211130](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151652284.png)

> https://www.rowley.co.uk/arm/index.htm

简单说 SEGGER Embedder Studio 的爹，就是 CrossStudios ，现在官网一般般，有些内容也有所缺失，反倒是被继承的SEGGER越做越好了。



## Summary

IDE方面的内容实在是太多了，有些日后再说吧



## Quote

> https://www.armbbs.cn/forum.php?mod=viewthread&tid=111396
>
> https://www.taterli.com/2206/
>
> https://blog.smslit.cn/2019/03/30/what-is-pio/
>
> https://zhuanlan.zhihu.com/p/126194770
>
> https://www.armbbs.cn/forum.php?mod=viewthread&tid=95855
>
> https://www.cnblogs.com/heyxiaotang/p/5728054.html
>
> https://zhuanlan.zhihu.com/p/392364027
>
> https://www.armbbs.cn/forum.php?mod=viewthread&tid=111335&highlight=IDE
>
> https://www.armbbs.cn/forum.php?mod=viewthread&tid=93102&highlight=%B1%C8%BD%CF
>
> https://devblogs.microsoft.com/cppblog/vscode-embedded-development/
>
> https://devblogs.microsoft.com/cppblog/visual-studio-embedded-development/




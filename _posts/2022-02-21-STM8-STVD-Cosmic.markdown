---
layout:     post
title:      "STM8开发环境搭建"
subtitle:   "STVD，Cosmic"
date:       2022-02-21
update:     2022-03-02
author:     "elmagnifico"
header-img: "img/bg9.jpg"
catalog:    true
tags:
    - Embedded
    - STM8
---

## Foreword

这都2022年了，没想到STM8的开发环境竟然还这么落后，稍微折腾了一下，记录一下。

后续相关的都会在本篇更新。



## STM8

先说正确的开发环境搭建，首先来到官网，看到下图

> https://www.st.com/en/development-tools/stm8-software-development-tools.html

![image-20220221170537504](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220221170537504.png)

图中是可以点击的（哪个沙雕做的，乍一看都以为是张图，找半天没找到下载的地方），点击以后跳转到对应的区域（更恶心的是跳转以后的页面其实想找STVD也有点迷）。

每个工具和下面的说明其实是一样的，所以不要被工具名字误导了。



#### STVD

ST Visual Develop (STVD)  就是主要开发的IDE了，只是它本身集成度不够，还需要其他软件辅助。

> https://www.st.com/zh/development-tools/stvd-stm8.html#overview

下载完以后，只是有了IDE，实际编译还过不去，吐了，那这叫啥IDE。

整个软件风格比较像以前的Keil2，老的不行，在win10上还能运行，万幸。

![image-20220226151336175](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220226151336175.png)



#### STVP

ST Visual Programmer(STVD)，这个有点类似于 JLink 中的 JFlash ，主要是读取和修改固件的，但是他还有一个额外功能，修改引脚的复用。

![image-20220226151110068](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220226151110068.png)



#### STM8 CubeMX

不要下！我刚开始以为可以直接Cube生成代码，然后下完以后发现，只能生成report，毛用没有。这东西从17年出来到现在都5年了，根本没想集成STM8进去，所以别指望了。

![image-20220226151304608](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220226151304608.png)



#### STM Studio

看着名字还以为是类似Visual Studio的IDE，然后实际上是个Debug工具，用来读内存、实时显示，也很废物。

<video width=720 height=400 controls="controls" src='http://img.elmagnifico.tech:9514/static/upload/elmagnifico/STM32STM_Studio_-_.mp4' title=''></video>



#### Cosmic

STVD需要Comic的编译器来完成编译，好家伙，绕一圈。

> https://www.cosmicsoftware.com/download_stm8_32k.php

通过这里下载安装-注册-得到License-激活。

![image-20220222094527690](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220222094527690.png)

拿到的license是1年有效期，功能上没有任何限制



## 新建工程

STVD有点类似Eclipse，有一个工作环境的配置。

创建一个新的工作环境和工程

![image-20220221171622548](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220221171622548.png)

选择workspace的目录和名称

![image-20220221171703725](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220221171703725.png)

工程的名称和目录

![image-20220221171734723](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220221171734723.png)

- 注意这里选择Cosmic的目录是CXSTM8

![image-20220221171847859](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220221171847859.png)

选择对应芯片，然后创建工程

![image-20220221171934486](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220221171934486.png)

使用编译，会发现ok，无报错。



## 下载

![image-20220224155453276](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220224155453276.png)

通过IDE中的Programmer就可以下载，但是可能会出现闪退的情况。

> https://community.st.com/s/question/0D50X00009XkWxBSAV/st-visual-developer-says-out-of-memory-and-crashes-when-trying-to-launch-the-programming-tool

选择ST-LINK，选择SWIM

![image-20220224155723261](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220224155723261.png)

由于是从flash启动，所以选择program memory 选择对应debug或者release中生成的文件

![image-20220224155814685](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220224155814685.png)

切换到Program 页面，然后start即可

![image-20220224155905148](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220224155905148.png)



#### 闪退修复

如果闪退了，下载下面的tools.cnf文件，然后放置到以下目录即可

> https://st--c.eu10.content.force.com/sfc/dist/version/download/?oid=00Db0000000YtG6&ids=0680X000006HyEY&d=%2Fa%2F0X0000000b5C%2F1sIa3iUbq_l7hHViMuRMVO70mBHfGIeHGCYM2UsURVA&asPdf=false

![image-20220224155642450](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220224155642450.png)

#### stm8_interrupt_vector.c

这个文件是中断向量表，但是不要直接通过加文件的方式去添加，会导致他一直提示文件不存在，报错。

正确的添加方法是从工程设置中的Linker-Input里添加向量表，添加以后可能文件目录还是不显示。保存以后重启STVD就能正常显示了。

![image-20220225163454136](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220225163454136.png)



## 外设库 STM8S_StdPeriph_Driver

> https://www.st.com/zh/embedded-software/stsw-stm8069.html

这里就能下载到STM8S的固件库了,有了固件库以后就好写了。

外设库的用法和STM32差不多，把文件都加好，就能编译通过了。



## 注意事项

- STVD中编译顺序和左侧文件树的顺序是一样的，如果文件夹名称顺序不对，会出现main不是第一个编译的文件，进而会引起一些错误，调整顺序以后就正确了。
- STM8S_StdPeriph_Driver，库中包含的文件比较多，有一部分可能用不上，但是他也会强行编译报错，需要手动排除（这个标准库没有支持Low-Density，这种宏，也就是有些外设他分不清你实际对应的芯片里到底有没有，不像STM32的标准库能分清）
- 标准库的头文件是默认全添加的，可以自行注释掉一些不用的，同时对应的C文件也需要排除编译



## 管脚复用

STM8和STM32比起来还是麻烦了一些，STM32管脚复用直接配置就行了，但是STM8这里如果要复用，必须用STVP来进行修改

比如我这里需要使用TIM1的通道1，就需要将这里修改复用，并且这个复用会影响到其他几个引脚，所以做功能的时候要避开。



#### Light Programmer

通过Light Programmer修改，右键选择

![image-20220226152547342](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220226152547342.png)



#### STVP

下面是通过STVP修改

![image-20220226151435926](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220226151435926.png)



## 超行显示

毕竟是老东西了，分辨率比较低，一旦行比较长了，就会超行显示红色的背景

![image-20220225163647622](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220225163647622.png)

可以通过Tools-Options 取消超行显示或者是自己重新设置超行数

![image-20220225163735477](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220225163735477.png)



## @svlreg missing for function

```
Running Linker
clnk -lD:\COSMIC\FSE_Compilers\CXSTM8\Lib  -o Debug\receiver.sm8 -mDebug\receiver.map Debug\receiver.lkf 
#error clnk Debug\receiver.lkf:1 @svlreg missing for function f_TIM1_CAP_COM_IRQHandler
 The command: "clnk -lD:\COSMIC\FSE_Compilers\CXSTM8\Lib  -o Debug\receiver.sm8 -mDebug\receiver.map Debug\receiver.lkf " has failed, the returned value is: 1
exit code=1.
```

这个错比较常见，如果在中断函数里调用了其他函数，基本都会出现问题。



在Cosmic C Cross Compiler User’s Guide for ST Microelectronics STM8 的文档中可以看到

> The c_lreg area is not saved implicitly in such
> a case, in order to keep the interrupt function as efficient as possible. If
> any function called by the interrupt function uses longs or floats, the
> c_lreg area can be saved by using the type qualifier @svlreg on the
> interrupt function definition. Whatever the model used is, these copies
> are made directly on the stack.

简单说就是当右值是一个long或者float之类的超过16bit的类型，左值的变量必须是全局变量，否则默认情况下在中断中是不会把任何一个左值存储进栈的，这样保证了中断执行的效率。

而如果需要保存临时左值，那么就必须要加一个关键字 `@svlreg` 来告诉编译器，保存中断区域中的临时变量，其实就是把他们压入栈。

（这里不得不吐槽，之所以不喜欢用IVR就是因为，老是有人写代码，带着这种和编译器相关性特别高的额外关键字，没想到 Cosmic 里也有这种东西，很难受）



比如，下面的例子，就一定会报错

```c
void TIM_IC_CaptureCallback(void)
{
  int a =1;
  a+1;
  a++;
}

INTERRUPT_HANDLER(TIM1_CAP_COM_IRQHandler, 12)
{
  /* In order to detect unexpected events during development,
     it is recommended to set a breakpoint on the following instruction.
  */
	TIM_IC_CaptureCallback();
}
```



加上 @svlreg 就正常了

```c
void TIM_IC_CaptureCallback(void)
{
  int a =1;
  a+1;
  a++;
}

@svlreg INTERRUPT_HANDLER(TIM1_CAP_COM_IRQHandler, 12)
{
  /* In order to detect unexpected events during development,
     it is recommended to set a breakpoint on the following instruction.
  */
	TIM_IC_CaptureCallback();
}
```



同理如果函数里套函数，那么每层函数都必须要处理好他的返回值才行



## 不支持

#### Keil

开始的时候以为keil会支持STM8，然后发现ARM里没有，又下了一个51的，发现还没有，仔细一看人Keil根本不支持这玩意



## Summary

果然是越低端的越不受重视嘛，不过据说IAR可以直接全家桶解决，由于不喜欢IAR所以直接跳过。



## Quote

> https://jingyan.baidu.com/article/ea24bc399c91bada63b33162.html
>
> https://zhuanlan.zhihu.com/p/52811699




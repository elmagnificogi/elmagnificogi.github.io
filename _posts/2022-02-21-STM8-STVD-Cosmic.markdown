---
layout:     post
title:      "STM8开发环境搭建"
subtitle:   "STVD，Cosmic"
date:       2022-02-21
update:     2022-02-21
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



#### STM8 CubeMX

不要下！我刚开始以为可以直接Cube生成代码，然后下完以后发现，只能生成report，毛用没有。这东西从17年出来到现在都5年了，根本没想集成STM8进去，所以别指望了。



#### STM Studio

看着名字还以为是类似Visual Studio的IDE，然后实际上是个Debug工具，用来读内存、实时显示，也很废物。

<iframe src="http://img.elmagnifico.tech:9514/static/upload/elmagnifico/STM32STM_Studio_-_.mp4" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width = 720 height =640> </iframe>



#### Cosmic

STVD需要Comic的编译器来完成编译，好家伙，绕一圈。

> https://www.cosmicsoftware.com/download_stm8_32k.php

通过这里下载安装-注册-得到License-激活。



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



## 不支持

#### Keil

开始的时候以为keil会支持STM8，然后发现ARM里没有，又下了一个51的，发现还没有，仔细一看人Keil根本不支持这玩意



## Summary

果然是越低端的越不受重视嘛，不过据说IAR可以直接全家桶解决，由于不喜欢IAR所以直接跳过。



## Quote

> https://jingyan.baidu.com/article/ea24bc399c91bada63b33162.html
>
> https://zhuanlan.zhihu.com/p/52811699




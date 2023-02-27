---
layout:     post
title:      "新装显卡后AE、PR、MAYA、C4D等无法启动"
subtitle:   "OpenCL"
date:       2019-03-21
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Tools
    - Maya
---

## Foreword

之前都是在集显的情况下，安装的AE、PR、MAYA、C4D等程序，然后加了一张独立显卡以后发现全都打不开了，都是在启动阶段就直接报错推出了，而报错信息相当少，正常人根本无法查到对应的原因。

## maya

maya有一个解决办法

禁用 OpenCL 通过添加 MAYA_DISABLE_OPENCL = 1 到Maya.env文件中
文件位于以下位置 ：

    c:\users\你的用户名\documents\maya\2017

里面有一个Maya.env的文件，双击打开，复制上面的内容

然后maya就能正常打开了。

## AE、PR、C4D

但是在AE、PR、C4D等程序的时候没有这种类型的教程，根本找不到应该在哪里添加什么宏来解决这个问题。

而出这个问题的原因基本都在于OpenCL

#### IntelOpenCL64

What is IntelOpenCL64.dll?
IntelOpenCL64.dll is part of Intel(R) OpenCL(TM) SDK and developed by Intel Corporation according to the IntelOpenCL64.dll version information.

IntelOpenCL64.dll's description is "Intel(R) OpenCL(TM) Runtime"

IntelOpenCL64.dll is usually located in the 'C:\windows\system32\' folder.

OpenCL本身是异构系统的一个标准接口，但是由于之前使用的是集显，现在切换到了独显以后AE等程序在注册表中认定的异构接口都是IntelOpenCL，而且还是Intel的集显的版本，AE他们没有什么显式的切换这个接口的方式，所以需要手动修改，禁用OpenCL

## 禁用OpenCL

    regedit
    找到 \HKEY_LOCAL_MACHINE\SOFTWARE\Khronos\OpenCL\Vendors
    将IntelOpenCL64.dll的注册项修改为1，意思是关闭OpenCL，然后AE PR这些就可以正常加载工作了

## 显卡搜索

还有一个办法可以在不启动AE等程序的情况下运行，但是具体是否可行还需要验证。

找到对应目录下的GPUSniffer程序，然后检测一下GPU。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/5c92f9c4e38ba.png)

## Quote

> https://forums.adobe.com/thread/2438988
>
> https://www.freefixer.com/library/file/IntelOpenCL64.dll-170993/
>
> http://tieba.baidu.com/p/5727086747

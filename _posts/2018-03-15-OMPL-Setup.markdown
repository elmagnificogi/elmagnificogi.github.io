---
layout:     post
title:      "OMPL 安装"
subtitle:   "app,python,ubuntu"
date:       2018-03-15
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - pathfinding
    - OMPL
---

## Foreword

记录一下 OMPL 安装过程.

#### 环境

- Ubuntu 16.04

#### 安装

第一步,打开 http://ompl.kavrakilab.org/installation.html 然后,下载其中的 install-ompl-ubuntu.sh

第二步,看要安装什么版本的ompl,就装什么版本的就行.

    ./install-ompl-ubuntu.sh          # will install OMPL without Python bindings
    ./install-ompl-ubuntu.sh --python # will install OMPL with Python bindings
    ./install-ompl-ubuntu.sh --app    # will install OMPL.app with Python bindings

第三步,等,第一次安装中间会有两三个地方需要输入root密码来安装,所以要记得看一下,ompl安装十分慢,开发者自己都说经常安装七八个小时,做好心理准备.

如果出现安装失败或者安装的不能用,重新第二步即可(我安装omplapp失败了两次,最后总算成功了)

大多数出现的问题基本都是python-bingdings的问题，而这个问题官方的解释基本全是重新安装或者是make python-bingdings之类的

#### 测试

安装完成后,在install-ompl-ubuntu.sh的同目录下会有一个ompl文件夹.

在其中的./build/Release/bin 中有很多可以执行的文件

测试使用一个二维规划,就能看到目录下生成了一个图片文件,其中红色的就是规划路径.
    ./demo_Point2DPlanning

在./demos 中也有同样的demo可以测试,只不过这里留下的都是pyhon文件,可以修改

如果安装的是 ompl.app,那么需要进入到 ./build/gui 然后运行
    ./ompl_app.py

安装正确的情况下就会启动图形界面的规划器,否则会有各种错误信息提示.

在 ./resources 中存有对应的场景文件和对象文件,比如各种几何体以及四轴等模型,可以直接拿来用.

## Summary

日后可能还会用源码编译ompl,届时再添加相关的安装说明。

## Quote

> http://ompl.kavrakilab.org/core/
>
> http://ompl.kavrakilab.org/installation.html
>
> http://blog.csdn.net/gpeng832/article/details/73736225
>

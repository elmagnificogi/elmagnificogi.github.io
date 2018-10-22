---
layout:     post
title:      "VPS SpeedTest"
subtitle:   "centos 7"
date:       2018-08-14
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - vps
---

## Foreword

用vps，好不好，先跑个测试再说，网速测试，如果是原生的，测试的基本就是这个机器在国外的网速，但是多数情况下需要测试到国内的网速，那么这个时候就需要一个国内比较ok的测试脚本。

#### 测速

输入命令，然后等待测试结果

    wget -qO- git.io/superbench.sh | bash


这个选择不同的国内运营商进行测试

    wget -qO- https://raw.githubusercontent.com/wn789/Superspeed/master/superbench.sh | bash

#### 国内延迟

如果要大概的看一下国内延迟，用这个站长工具基本就可以了。

> http://ping.chinaz.com

#### 路由跟踪

不知道为什么上面网站的路由跟踪并不好用，我直接无法跟踪，没有任何提示。

    17monipdb.exe

推荐用这个小工具，还是蛮不错的，显示地理位置以及相关信息。

下面这个网站也可以，他还能指定测试地点。

> https://www.ipip.net/traceroute.php

## Summary

有什么日后再补充

## Quote

> https://www.oldking.net/599.html

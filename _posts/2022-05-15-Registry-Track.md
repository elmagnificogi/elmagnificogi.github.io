---
layout:     post
title:      "注册表追踪"
subtitle:   "Registry,regedit,监控"
date:       2022-05-15
update:     2022-05-15
author:     "elmagnifico"
header-img: "img/python-head-bg.jpg"
catalog:    true
tags:
    - Game
---

## Foreword

记录一下如何追查注册表是被谁修改的，如何修改的



C# 貌似自带的注册表Hook只能追踪Local的，超过范围的就完全不能追踪的，只能掉C++API来完成更多的追踪。

> https://www.jianshu.com/p/c0502c4b28b9?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation



## EaseFilterSDK

> https://github.com/EaseFilterSDK/RegistryFilterExample

RegistryFilterExample 是一个注册表事件过滤器，但是只是个Demo

> https://www.easefilter.com/Default.htm

EaseFilter 他们应该是做各种Windows 文件、进程、注册表等等追踪的。这个是他们官方给的例子，但是由于缺少测试License，所以虽然编译能过，但是实际无法测试代码。还是得用他们编译好的测试程序，测试程序应该是有点bug，过滤条件经常不生效，而不过滤反倒没问题。



## Process Monitor - Sysinternals

功能非常强大，在简单添加了几个过滤条件以后，就完成了注册表修改的过滤，可以看到具体是哪个程序修改了注册表。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202205150215882.png)

这个都是微软官方的工具，非常好用，可惜的是他缺少源码，只有Linux端的代码，而我想看的Windows是怎么实现的



## ProcMonX

> https://github.com/zodiacon/ProcMonX

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202205150229277.png)

ProcMonX虽然不更新了，但是他也做到了同样的事情，操作逻辑也挺简单，设置好需要Capture的Settings，然后再设置一下Filters，启动，等Events中的结果就行了。

关键是他开源，有了源码，我就能把这个监听部分移植到我的程序中了



## Process Monitor X v2

> https://github.com/zodiacon/ProcMonXv2

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202205150243982.png)

沿着上一个，又找到了他的新项目，试了一下过滤有点问题，监控倒是没问题。再看这个大佬的项目，各种工具，应该对Win32 Api熟悉得不得了。



## Summary

搜索了半天，看了好几个无关项目，基本都是windows 驱动级别或者内核级别的项目，编译不了，要不就是完全不知道怎么加载这个东西，总算最后找到了一个好用的，关键问题可以解决了。



## Quote

> https://www.nextofwindows.com/how-to-track-and-monitor-registry-changes-in-windows
>
> https://www.jianshu.com/p/c0502c4b28b9?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation


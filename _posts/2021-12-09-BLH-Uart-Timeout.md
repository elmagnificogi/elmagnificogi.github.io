---
layout:     post
title:      "BLHeli ESC启动时串口必然无响应"
subtitle:   "BLH32,Uart,ESC"
date:       2021-12-09
update:     2021-12-09
author:     "elmagnifico"
header-img: "img/welding2.jpg"
catalog:    true
tags:
    - BLHeli
    - ESC
    - BUG
---

## Foreword

万万没想到BLH竟然还有后续，这次遇到了一个算是恶性bug吧。



## BUG

由于需要在ESC上电时进行配置检测，如果不对需要重新设置ESC。而之前使用的版本都是100%没问题的，基本不会出现校准失败的情况。而新版发现了异常，每次上电后第一次通信，必然在连接阶段出现错误。现象就是发送连接信息以后

```
00 00 00 00 00 00 00 00 00 00 00 00 0D 42 4C 48 65 6C 69 F4 7D
```

正常情况下应该回复如下内容

```
34 37 31 6C 15 06 07 04 30 
```

但是实际上只要我发送了，必然超时 。由于是单根通信，所以当我发送完以后，立马切换到接收模式等待串口下降沿，而实际上一直等到超时，都等不到后续的下降沿。



## Debug

先是怀疑我自己接收有问题，错过了，下降沿。反复debug了好几次，各种打印时间，发现实际上肯定没有错误，就是没收到下降沿。

然后既然接收没问题，怀疑我发送有问题，单独接线出来，发现直接读串口完全没问题，数据也正确。说明发送也没问题。好家伙，那只能怀疑硬件有问题了，老硬件跑相同代码，确实不会出现这个奇葩问题，每次100%通过。对比半天，硬件连接上也没啥明显问题。

那只好拿逻辑分析仪看一下具体是啥情况了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/er3qT6aK5Az9JNO.png)

然后就看到了，当7D发完，就看到有一个下拉信号，然后显示了一次帧错误。但是在此以后，电调一直没有回复。



再看后面一次正常的操作，发现这里依然存在一个下拉信息，还是一样的帧错误，但是电调有回复了，后续流程都是正常的了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/hr5MPoYbG49aDcC.png)

仔细看了一下这个下拉是我写的，然后去掉了，但是该不回复还是不回复，和我拉不拉没关系。



当我把这个下拉去掉以后，帧错误就消失了。



而第二次必然正确，所以怀疑是电调的初始化状态机有问题，每次都要我试错，让他的状态机跑到正确的时候才能，正确读写。



## 临时解

BLH新版本电调的串口配置timeout目前看都在5s左右，一旦你连接失败了，都必须等5s再发送才能有反应，否则会一直没回应。而以前的版本完全没有超时时间这个概念，失败了，立马重发也能得到响应。



由于校准时是顺序执行，所以快不的，4个电调，让他失败一次就是20多秒过去了，启动时间就拖得太长了。

而电调本身启动大概需要4s左右，这4s内传输大概率都是失败的。这样一次校准下来就接近30s了。



由于这个状态机的错误，要绕过，只好提前将每个esc进行一次connect，然后直接disconnect，完全无视他是否成功。

然后下一轮循环再进行实际的connect和check。这样操作以后，大概校准一轮需要10s左右，目前只能做到这种程度了。



## Summary

BLH的31.80以后的版本貌似都有这个问题，暂时没得解。

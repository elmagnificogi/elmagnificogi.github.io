---
layout:     post
title:      "random:crng init done导致系统启动过长"
subtitle:   "rng-tools,haveged,kernel"
date:       2023-02-24
update:     2023-02-24
author:     "elmagnifico"
header-img: "img/bg2.jpg"
catalog:    true
tags:
    - OpenWrt
---

## Foreword

OpenWrt系列遇到一个问题

![](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230224162225028.png)

```
random:crng init done
```

这个会导致系统整体被卡住，在输出之前，任何CLI的修改命令都会等到他输出以后才会执行

这个问题比较常见，一般就是系统需要随机数，但是随机数熵值太小了，随机性无法保证，导致系统挂起等待熵值填充。

一般来说可以通过一些组件快速增熵，非加密设备或者对安全性要求特别高的，可以这么使用



## OpenWrt编译

更新所有相关包

```
sh scripts/xxxx-feed-setup.sh
```

配置内核

```
make kernel_menuconfig
```

配置各种应用

```
make menuconfig
```

编译，生成固件

```
make -j9 V=s
```

最终固件生成位置

```
./bin/targets/
```



## 解决方案

方案一，修改内核部分关于`crng_ready`的判定，让他直接返回，而不是阻塞硬等，不过没找到内核代码，所以这个方案没法执行。



方案二，增加`rng-tools`，通过`make menuconfig`中的`utilities`，选择`rng-tools`，然后保存，重新编译

实际操作以后，确认rngd的service已经启动了，但是依然不能解决crng问题



方案三，增加`haveged`，通过`make menuconfig`中的`utilities`，选择`haveged`，然后保存，重新编译

不取消`rng-tools`的情况下，增加`haveged`，总算成功启动了，并且`random:crng init done`只需要10s左右就能显示了。



## Summary

这一套编译还是相当复杂的，有些地方也没弄清，只是能用而已。不过这个问题还有一种老的kernel有问题，crng的判断出错了，这个bug会导致启动一直挂起，无法正常工作。



## Quote

> https://www.tiandeng.xyz/posts/%E5%85%B3%E4%BA%8Edevrandom%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98/
>
> https://blog.csdn.net/ldinvicible/article/details/123145069
>
> https://blog.csdn.net/yuangc/article/details/106135404


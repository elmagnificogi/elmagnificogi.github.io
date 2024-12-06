---
layout:     post
title:      "QEMU模拟运行FreeRTOS"
subtitle:   "STM32"
date:       2024-12-07
update:     2024-12-07
author:     "elmagnifico"
header-img: "img/bg7.jpg"
catalog:    true
tobecontinued: false
tags:
    - FreeRTOS
    - QEMU
---

## Foreword

测试一下QEMU模拟运行FreeRTOS



## QEMU

QEMU安装需要先安装MSYS2



直接下载安装

> https://www.msys2.org/



安装完成以后，QEMU使用pacman包进行安装

> https://www.qemu.org/download/#windows

```
pacman -S mingw-w64-x86_64-qemu
```

添加新的环境变量，把刚才安装的路径加进去

```
D:\msys64\mingw64\bin
```



查看版本，显示正确

```
qemu-system-arm -version
QEMU emulator version 9.1.1
Copyright (c) 2003-2024 Fabrice Bellard and the QEMU Project developers
```



## FreeRTOS

选择FreeRTOS 202212.01版本下载，包含所有演示项目的

> https://freertos.org/zh-cn-cmn-s/Documentation/02-Kernel/01-About-the-FreeRTOS-kernel/03-Download-freeRTOS/01-DownloadFreeRTOS



这里主要是测试使用`FreeRTOS/Demo/CORTEX_MPS2_QEMU_IAR_GCC/build/gcc`这个项目，需要至少arm-eabi-none-gcc的环境和make，否则进行不下去

进入到gcc目录，先编译一下

```
make
```

![image-20241206180747253](https://img.elmagnifico.tech/static/upload/elmagnifico/202412061807331.png)

正常编译完成



## 测试

qemu启动模拟

```
qemu-system-arm -machine mps2-an385 -cpu cortex-m3 -kernel ./output/RTOSDemo.out -monitor none -nographic -serial stdio
```

正常启动，并且task跑起来了，正在输出内容

![image-20241206191724456](https://img.elmagnifico.tech/static/upload/elmagnifico/202412061917507.png)



qemu这里的参数含义

- -machine mps2-an385，这个是ARM的原型版，开发板模型
- -cpu cortex-m3，指定cpu架构
- -kernel ./output/RTOSDemo.out 指定使用的镜像文件
- -monitor none，显示是否要监控，启用的话类似串口，可以使用中断输入输出一些状态信息
- -nographic，不使用图形界面
- -serial stdio，串口通过标准终端输入和输出
- -s -S，链接调试器



## Summary

挺简单的，只是问题QEMU支持的现成芯片、板子比较少，需要自己去找对应的开发板，甚至自己开发，有点麻烦



## Quote

> https://blog.csdn.net/weixin_42607526/article/details/142263258
>
> https://freertos.org/zh-cn-cmn-s/Documentation/02-Kernel/03-Supported-devices/04-Demos/03-Emulation-and-simulation/QEMU/freertos-on-qemu-mps2-an385-model
>
> https://www.cnblogs.com/asmer/p/16813129.html


---
layout:     post
title:      "keil debug 不重启连接硬件"
subtitle:   "嵌入式，debug，STM32"
date:       2017-12-01
author:     "elmagnifico"
header-img: "img/cap-head-bg.jpg"
catalog:    true
tags:
    - 嵌入式
    - STM32
---

## Foreword

默认keil下使用jlink在线调试的时候会自动重启硬件,虽然平时用着好像也行,但是关键时刻,硬件跑飞了,需要看一下具体为啥会跑飞,找到隐藏的bug,这种时候就会很坑爹,一重启就无法复现该情况了,这里记录一下如何修改keil 工程配置从而可以不重启的情况下进入在线调试.

## 注意

使用前一定要注意,在配置好工程之前最好不要接jlink并且连接到出错硬件上!!!

(因为配置中的Debug只要一点进去就会让硬件自动重启,如果连接了跑飞的硬件,那就没了)

## 修改配置

1\.  不要勾选 Load Application at Startup

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c00a87789ac1.png)

2\.  在Debug选项中不要勾选 Reset after Connect 并且Connect:Normal 选项

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c00a88948672.png)

3\.  不要勾选 Update Target before Debugging

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5c00a8a609c0d.png)

4\.  以上完成其实可以直接连接飞机了,但是这种连接模式下,无法跳转代码无法加断点,只能用于查看内存和各种寄存器的情况.如果要查看代码,则需要完成Load文件,新建一个文件,起名随意,内容入下:

```
LOAD %L INCREMENTAL
```

然后再刚才的Load Application at Startup 下的Initialization File中选择建好的文件.

点击仿真,就可以直连跑飞的硬件,并且查看到当前代码停在了哪里,所有信息都是完整的

## 总结

当然除了使用keil这种方法,还有更原始一点的办法,使用jlink commander 然后连接到硬件上,使用其命令:halt,go,mem 0x80xxxxxx xxx 等命令来读取内存或者寄存器的值,然后去找PC或者LR或者Stack,然后对应生成的map文件确定代码是在哪里,这种方法比较原始,但是万能.

## Quote

> http://www.keil.com/support/docs/3697.htm

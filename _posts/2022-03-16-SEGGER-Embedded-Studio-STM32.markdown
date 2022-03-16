---
layout:     post
title:      "使用SEGGER Embedded Studio开发STM32"
subtitle:   "STM32，IDE"
date:       2022-03-16
update:     2022-03-16
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tags:
    - Embedded
---

## Foreword





## SEGGER Embedded Studio

> https://www.segger.com/products/development-tools/embedded-studio/





### 安装

> https://www.segger.com/downloads/embedded-studio

直接下载安装，个人免费使用

安装完成之后，秒启动，速度特别快

![image-20220316162738954](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161627049.png)



## 激活

这个对话框只有第一次启动或者重新打开的时候才会显示，软件内找不到启动的按钮

![image-20220316195551438](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161955487.png)

以前版本还需要你去申请一下免费的License，现在版本不需要了，但是呢，你随便创建一个工程就会提示你需要PRO级别的License，

感觉被坑了，虽然说是免费License。

![image-20220316195914330](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161959365.png)

所以这里先用工具跳过这部分激活。



## 使用

创建一个新项目

![image-20220316163027936](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161630977.png)

选择内核

![image-20220316163131902](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161631945.png)

选择芯片

![image-20220316163300274](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161633315.png)

选择工具链以及代码区域还有调试方式

![image-20220316163345247](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161633285.png)

这里是默认添加的文件用来启动

![image-20220316163436732](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161634778.png)



第一次编译可能会报错

```
Error starting process $(ARMGCCDIR)/arm-none-eabi-gcc
```

![image-20220316164853770](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161648799.png)



安装支持包

![image-20220316170005780](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203161700828.png)

## Summary

目前编译过不去，基本工程都编译报错，还要研究一下具体怎么用。



## Quote

> https://blog.csdn.net/weixin_39303424/article/details/88171231




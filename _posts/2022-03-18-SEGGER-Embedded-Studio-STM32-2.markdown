---
layout:     post
title:      "使用SEGGER Embedded Studio开发STM32进阶"
subtitle:   "STM32，IDE"
date:       2022-03-18
update:     2022-03-18
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tags:
    - Embedded
---

## Foreword

主要是有些问题非常隐晦，也没看到啥相关的介绍，大部分文章也都只有一个创建工程的指南，实际使用的时候各种问题比较劝退，所以我自己写一个SES的进阶使用指南



## 参考手册

基本上关于SES的相关内容我都是参考手册或者是论坛的帖子，总结来的

> https://studio.segger.com/index.htm?https://studio.segger.com/home.htm



## 配置问题

首先得理解SES一个项目管理的结构，最底层是Solution，然后一个Solution中会有好几个Project。

配置文件的设计，他这里给了Solution若干个配置文件，而Solution本身没有任何实际的工程文件，它相当于是一个父类，Project的配置全都是从Solution中继承来的，在实际操作的时候经常可以看到这个设置会有一个tag提示是inherited的

![image-20220318181250149](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203181812211.png)



然后对于一个层级中，还有Public和Private的区别

![image-20220318182141212](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203181821240.png)



同一个配置之中还有Internal和Common的区别

![image-20220318182056908](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203181820951.png)





## 编译器问题



#### GCC



#### Clang



#### LLVM



### GNU





## SEGGER Embedded Studio





## Summary

To Be Continued



## Quote

> https://studio.segger.com/index.htm?https://studio.segger.com/home.htm
>
> https://www.armbbs.cn/forum.php?mod=forumdisplay&fid=28


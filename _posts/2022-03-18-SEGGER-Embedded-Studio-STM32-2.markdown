---
layout:     post
title:      "使用SEGGER Embedded Studio开发STM32进阶"
subtitle:   "STM32，IDE"
date:       2022-03-18
update:     2022-03-21
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



## 代理

由于SES也是从国外服务器下载，所以最好能开启代理，下载速度会快很多

打开Tools-Options-Environment，可以看到对应的http的代理设置，不需要的话留空就自动不生效了。

![image-20220321102522665](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321102522665.png)



## 目录树

目录树取消大小显示，很多余。打开的文件自动同步展开目录树位置，也有点多余，所以也去掉

![image-20220321155026990](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321155026990.png)



## 配置问题



#### Solution与Project

首先得理解SES一个项目管理的结构，最底层是Solution，然后一个Solution中会有好几个Project。

配置文件的设计，他这里给了Solution若干个配置文件，而Solution本身没有任何实际的工程文件，它相当于是一个父类，Project的配置全都是从Solution中继承来的，在实际操作的时候经常可以看到这个设置会有一个tag提示是inherited的

![image-20220318181250149](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203181812211.png)

从官方的解释来说，Project的所有路径都是相对的，而Solution则是绝对路径，基于继承关系，所以你可以自己弄出来多个Solution的配置，从而可以达到切换路径的效果，进而Project的路径不需要反复修改（当然，具体哪里用得上这种情况，我也不知道）



#### Public与Private

然后对于一个层级中，还有Public和Private的区别

![image-20220318182141212](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203181821240.png)

简单说就是Public 继承 Private Configuration，举个例子，如果一个项目里Private Configuration 就是搞框架的人 第一次配好的，一个相当通用的配置。如果和他的环境相同，基本就可以直接使用Public Configurations继承它，然后直接编译就行了。但是如果你和的环境略有区别，那么就比较适合你自己在Public的配置上略作修改，但是Private的保持原样，同时git也不追踪Public的部分，这样就能兼顾总体和个体。

类似的，比如文件路径就应该在Private里设置，而Public里只是继承一下就行了，有些预定义的宏也应该在Private里定义



#### Internal和External

![image-20220321145355790](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321145355790.png)

同一个配置之中还有Internal和Extern的区别，其实会造成这个的原样的是导入的问题，如果导入选择了外部GNU，那么就全都是External，同理如果选了内置的，那就是Internal，如果2个都选了，那么就会出现又有内部又有外部的情况，这种就是自动生成的配置，自己改改就行了

![image-20220321111448808](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321111448808.png)



#### 配置显示出错

偶尔会遇到你打开配置，但是看到的配置完全是错的。关闭以后，重新再打开，又是对的情况，这个比较诡异，也没法说，但是确实会发生。



## 编译器问题



#### GCC



#### Clang



#### LLVM



### GNU

#### gcc-arm-none-eabi

如果提前安装了gcc-arm-none-eabi，并且重新启动了SES，那么他会自动识别对应的GNU工具链

> https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads

![image-20220321111448808](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321111448808.png)





## 导入Eclipse工程

将目录转换成常规文件夹，只有这样才能使用右键排除编译或者排除文件夹

![image-20220321112733672](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220321112733672.png)





## Bug

屮，又遇到了bug，明明使用的是GNU，C和C++混合的，但是没想到他这里的标签直接就出错了

![image-20220321155906054](C:\Users\elmagnifico\Pictures\image-20220321155906054.png)

![image-20220321155938570](C:\Users\elmagnifico\Pictures\image-20220321155938570.png)

> https://forum.segger.com/index.php/Thread/8477-BUG-C-and-C-Language-Standard-upside-down/#post30892

官方目前已经确认了这个bug



## Summary

To Be Continued



## Quote

> https://studio.segger.com/index.htm?https://studio.segger.com/home.htm
>
> https://www.armbbs.cn/forum.php?mod=forumdisplay&fid=28
>
> https://blog.csdn.net/zhengyangliu123/article/details/54783443


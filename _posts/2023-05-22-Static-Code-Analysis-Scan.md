---
layout:     post
title:      "静态代码分析扫描工具"
subtitle:   "嵌入式， TscanCode，Helix QAC，SAST Coverity"
date:       2023-05-22
update:     2023-05-22
author:     "elmagnifico"
header-img: "img/x14.jpg"
catalog:    true
tobecontinued: false
tags:
    - Software Engineering
---

## Foreword

看到了一些静态代码检测工具，之前一直觉得没啥用，还不如IDE自带的好用。试了试，发现确实有些情况是IDE没检测到的，静态检查会提示。

找了一些比较知名的，体验测试一下



## 静态代码检测

一般来说这种工具都是辅助检测的，基础功能编译以后，用来查漏补缺的。

常见的一些检测目标：

- 内存溢出，index越界
- 空指针
- 未初始化
- 强制类型检查
- 弱定义
- 缩进管理...



#### 一些知名的检测工具

- SAST  Coverity 
- Helix QAC
- Parasoft 
- PGRelief
- PCLint
- TScanCode
- Cppcheck
- SonarQube



一些比较老的图了，新的没啥人测评，暂时看不出来

![图片描述](https://img.elmagnifico.tech/static/upload/elmagnifico/202305221432453.jpeg)

![图片描述](https://img.elmagnifico.tech/static/upload/elmagnifico/202305221432414.jpeg)

#### MISRA

检测标准



## TscanCode

> https://github.com/Tencent/TscanCode/tree/master

TscanCode是腾讯开源的一个静态检查，release不知道为什么exe被放在群里，仓库里没有

随手传一个到我的仓库里

> https://github.com/elmagnificogi/MyTools/blob/master/TscanCode/TscanCodeV2.14.24.windows.exe
>
> 【技术调研】TscanCode自定义规则开发.pdf

还有一个文档说明规则是如何自定义开发的



使用起来也非常简单，指定好项目文件夹，开始扫描即可

![image-20230522115355184](https://img.elmagnifico.tech/static/upload/elmagnifico/202305221416711.png)

规则，可以看到具体会检测什么类型的问题，还有示例

![image-20230522115521566](https://img.elmagnifico.tech/static/upload/elmagnifico/202305221155637.png)

由于是开源的，所以腾讯放进去的规则也不是很多，如果有需要可以二次开发，自己填充更多的规则进去



![image-20230522115504664](https://img.elmagnifico.tech/static/upload/elmagnifico/202305221155744.png)

扫描完成以后，就能看到各种报错了，当然有一些是误报，毕竟是静态检测，有些看不出来，很正常。

试了一下我们的项目，确实有一些地方写错了，而编译器没有提示出来的



## Coverity

> https://scan.coverity.com/

Coverity 目前业界使用比较广泛，很多公司都有使用流程，只是目前官方价格不透明，估计是买断制的

目前才联系销售，还未回应



Coverity 目前和Github有合作，可以直接用Github登录，然后使用Github的项目做检测分析



## Summary

未完待续



## Quote

> https://zhuanlan.zhihu.com/p/490064511?utm_id=0
>
> https://www.incredibuild.cn/blog/top-9-c-static-code-analysis-tools
>
> https://blog.csdn.net/wetest_tencent/article/details/51516347
>
> https://blog.csdn.net/yyz_1987/article/details/124589079

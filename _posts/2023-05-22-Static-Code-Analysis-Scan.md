---
layout:     post
title:      "静态代码分析扫描工具"
subtitle:   "嵌入式，代码扫描，TscanCode，Helix QAC，SAST Coverity"
date:       2023-05-22
update:     2025-12-02
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

目前才联系销售，还未回应，百万起步



Coverity 目前和Github有合作，可以直接用Github登录，然后使用Github的项目做检测分析



## Coding 代码扫描

以前我们集成了Coding的代码扫描，线上还是好用的，可以集成之前忽略掉的问题，新问题也会跟随每次代码提交提示出来，代码扫描也有点类似TscanCode，可以自定义规则，也可以自选规则，自由度还是可以的

可惜Coding下线了，转给了CNB，但是CNB直接没有代码扫描的业务

之前Coding下线前还升级了一次代码扫描，增加了企业自部署扫描节点给云端用，那后续这一块直接干没了，貌似内部也没有类似工具再做这类的处理了



## SonarQube

> https://www.sonarsource.com/plans-and-pricing/sonarqube/

![image-20251202160057512](https://img.elmagnifico.tech/static/upload/elmagnifico/20251202160057572.png)

SonarQube 支持社区版和付费版，社区版Java系使用一下没啥问题，但是如果给嵌入式用就不行了，缺少C系列语言的检测

要支持C系，就得买开发版，开发版本看了一下买断的方式，也不是很贵，700多刀一年，不过支持的代码量稍微小了点，只有10W行，超了就要你买企业版了

SonarQube 社区版是可以自己搭建在内部的，然后联动Jenkins或者是Gitlab即可



## Cursor

直接用Cursor作为代码扫描，但是只适合每次新代码提交前，不适合已经有很大代码量的存量代码扫描检测



## Helix QAC

Helix QAC改名叫Perforce QAC了

> https://www.shdsd.com/perforce/helixqac/index.html
>
> https://www.shdsd.com/perforce/klocwork/index.html#function1

目前看QAC应该是老的Helix，而新的平台是klocwork，目前主推也是klocwork



## Cppcheck

> http://cppcheck.net/

仅仅能检查C/C++，有点落后了，但是胜在免费、windows、linux都支持，语言标准啥的的追的比较慢

商业版的在这里，不过也仅仅是C/C++

> https://www.cppcheck.com



## Summary

没看到更好用的了，随着AI普及，代码类AI的出现，导致代码扫描直接变弱了，可以直接用AI来完成类似扫描的工作，虽然还是有差别，但是已经很不错了



本文写于23年，那会云代码检测还比较少，基本都是客户端为主的，25年末，基本都转向了云端或者云服务



## Quote

> https://zhuanlan.zhihu.com/p/490064511?utm_id=0
>
> https://www.incredibuild.cn/blog/top-9-c-static-code-analysis-tools
>
> https://blog.csdn.net/wetest_tencent/article/details/51516347
>
> https://blog.csdn.net/yyz_1987/article/details/124589079

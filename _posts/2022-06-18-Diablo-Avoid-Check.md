---
layout:     post
title:      "火绒防止D2R扫进程-实测无效"
subtitle:   "Diablo,Process"
date:       2022-06-18
update:     2022-06-18
author:     "elmagnifico"
header-img: "img/z4.jpg"
catalog:    true
tags:
    - Diablo
    - Game
---

## Forward

防止D2R扫进程，保护我们的隐私

![image-20220618212757225](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182127288.png)

火绒剑监控个大概10分钟，就能看到进行了一次扫描



## 准备

首先下一个火绒杀毒，如果你已经有了那更好了

> https://www.huorong.cn/person5.html



## 设置防护

进入防护中心

![img](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182050777.png)

进入高级防护

![qwe](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182050559.png)

开启自定义防护

![wr](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182051984.png)

进入自定义

![image-20220618205136470](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182051519.png)

## 设置规则

![image-20220618205214946](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182052991.png)

详细信息- 勾选上所有的保护动作

![img](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182052581.png)

![image-20220618205325345](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182053401.png)
确保这里开启了

![image-20220618205340579](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182053636.png)
自动处理这边也会有一条类似的



同理增加Battle.net的防护

![image-20220618205424437](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182054320.png)

同理增加自动防护

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182054320.png)



这样就得到2条规则和2条自动处理了

![img](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182054845.png)

如果觉得不够安全还可以增加agent进程，也进行防护



## 测试

主要是通过火绒的工具-火绒剑来监控系统

![image-20220618205602512](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182056557.png)
可以看到从我开启防护以后，到现在再也没成功读取过了

![image-20220618205651673](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182056737.png)

选到火绒的话会有防护提示

![image-20220618210939179](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202206182109215.png)

**但是多测试几次就发，会漏，D2R依然会锁定文件，不知道为什么有时候读文件会漏过去，甚至阻止了，但是D2R依然读到了文件。**

**此方法无法真正规避读进程和文件的情况**



## Summary

最后还是得去掉特征码，D2R就再也不会锁文件了，不然很容易就被判断封号了。

---
layout:     post
title:      "Origin Grok Bot体验"
subtitle:   "Cursor"
date:       2027-09-17
update:     2027-09-17
author:     "elmagnifico"
header-img: "img/g2.jpg"
catalog:    true
mermaid:    false
tobecontinued: true
tags:
    - Cursor
    - AI
---

## Foreword

Origin和Grok Bot体验



## Origin

前段时间Cursor也开始弄自己的代码托管平台了，Origin，刚好上线那天就是Github崩溃的时候

登录

>  cursor.com/codebase

第一次同步需要新建一个用户路径，我的常用名竟然还没人用，说明没啥人哦

![image-20260917005313325](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170053414.png)

可以同步Github所有仓库，一口气64个，就是这个同步实在是有点久了，十多分钟才同步完。

![image-20260917005517382](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170055411.png)



再解释一下为什么要同步仓库，因为Cursor的云端Agent，只能用它对应的云端仓库，Cursor没有本地Agent的移动端。举个例子：PC的Cursor Agent在干活，我可能外出了，但是这个时候任务做完了，我要看一下结果或者继续下一个任务或者改进点，此时就得回PC去继续。那有没有可能我可以通过移动端直接指挥Agent干活呢？

可以，就是云端Agent的业务。只是，他不能直接操控你的电脑，不像小龙虾那种集成到你的IM里能直接指挥，对应的生产类型的Agent能被远程指挥的还是比较少的，限制颇多。

![image-20260917011001113](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170110154.png)

同步完成以后，就可以直接在Cursor的云端进行仓库的修改或者内容更新了，对应如果我在旅途中，我的见闻、照片，都可以直接通过这里的Agent让他帮我写到游记中。等我有空了，再用电脑进行仔细校对和修改即可。



Cursor的云端Agent，对于安卓不太友好，目前没有专用APP，要用浏览器的方式打开，走的是PWA应用的方式。IOS就好一些，有专门的APP，可以直接用。



## Grok Bot

![image-20260917010530957](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170105061.png)

同理，Grok Bot业务推出以后，直接送了Cursor Plan一份，而且不消耗Plan的额度。这个Bot至少目前可以认为是类似小龙虾的那种Bot，但是同时他能操作Cursor云端的Agent干活，虽然还没完全打通本地和云端，但是已经非常接近了。



Grok Bot相当于是给了你一个独立的VPS，就是让他干活得要翻墙，这个比较麻烦。但是这个Bot也可以设置为使用本机来干活。这个VPS是共用的，你建多少个Bot都是在同一个机器上的。

![image-20260917011726501](https://img.elmagnifico.tech/static/upload/elmagnifico/202609170117541.png)

同时Bot还能在VPS和你的电脑直接建立隧道，从而转发他的流量，防止被封控，这有点东西。

对比Bot和Cursor本身，这个Bot还是比较慢的



## Summary



## Quote

> 

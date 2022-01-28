---
layout:     post
title:      "Typora配合PicGo（三）"
subtitle:   "图床，wolai，我来"
date:       2020-08-10
author:     "elmagnifico"
header-img: "img/line-head-bg.jpg"
catalog:    true
tags:
    - Tools
---

## Foreword

时间过的真快，距离上次写PicGo这个工具又过去了一年，这一年里我切换了主力Markdown编辑工具，使用Typora来写笔记、博客、交接文档，图床倒是一直没换还在用SM.MS，只是感觉好像比以前要慢一些了，PicGo也一直用的2.1版本，没有更新。最近突然看到别人分享的一个Typora和PicGo联动，感觉非常不错，记录一下。

## Typora & PicGo

#### 支持版本

首先时Typora，当前是0.9.93 beta版本

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/ZUK1mA7W4ogYTay.png)

可以看到在0.9.84版本，Typora支持了PicGo来上传图片！

同时PicGo当前是2.3.0 beta3

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/xqLmeNAujMOoFz9.png)

在2.2版本开始支持了，命令行或者后台server监听，进行图片上传

#### 如何使用

只需要在Typora的偏好设置中，选择使用PicGo app，然后选择好实际的PicGo.exe路径就可以使用了，直接复制图片或者拖拽进Typora，图片会自动进行上传，会提示一个upload，上传结束以后会自动切换成实际的链接。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/ZSphjMO5DwAm4YR.png)



#### 小问题

第一次打开Typora而没打开PicGo有概率会导致，第一张图上传失败，失败的时候右键一下图片上传即可。



这种自动上传的图片，不支持PicGo自定义格式了，就是上传返回替换的格式一定是

```
![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/ZSphjMO5DwAm4YR.png)
而我之前为了区分SM.MS的图床的图片，都设置为了
![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/xxxxx.xxxx)
```

如果这里的小细节能够改一下就好了。



这里再提一个Typora的小bug，有时候非常难受。平常都是在直接渲染编辑的界面，而不是源代码模式，但是如果文本比较长了，代码块比较多一些，如果这个时候切换到源码模式，然后点鼠标，切换focus，立马光标位置就自动跑偏到最上面的第一行，特别是代码多了以后非常容易复现，查了一下好像没啥人反馈这个问题。

> https://tieba.baidu.com/p/5891309792

类似，但是还是有些不同。

## wolai-我来

其实我自己一直想自己写一个类似notion的云笔记的服务的，可以整合图床、视频床、博客、笔记、翻墙的接口、临时文件分享、短链、ttrss甚至一些常用的服务于一体，然后部署在自己的vps上，同时这个支持多用户入口，就相当于是一个即可自己用，也可以分享给朋友一起用的一个多功能云服务吧，不过迟迟还没动手。

然后notion什么的就支持了大部分笔记类型的功能吧，由于被墙，加网速满，体验不是很好，不过立马就有一个仿notion的国产笔记出现-wolai

> https://www.wolai.com

总体来说现在功能还是太简单了，不过对比notion来说，他现在功能还不全，但是他有一个页面关系的图，可以看到你的知识脉络，感觉挺有意思的。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/VxjOqnMUrcgBywh.png)

不过这个功能，其他类似软件也有支持，只不过当你的知识量超级多的时候，这个图会超级复杂，密集程度max，导致实际不是很好用。看wolai最后能优化到什么程度吧。最好是这个图也能多出几个层级，不同层级不同图，这样扩展下去可能才有可读性，否则都密密麻麻堆一起，不如没有。

#### 邀请码

```
6ELTETP
```

这里放一下我的邀请码，目前是内测阶段，只能通过邀请码注册，目前还能用80次



#### 更新

当然目前来说我并没有打算用，还要等等看吧。

> https://www.wolai.com/wolai/k1Qgi1J2L9vWBQkkJz8j82

但是看这个作者的每日更新，确实挺吓人的，看过往的记录，基本每天一更，几个月不停的。

希望这么努力的作者能得到一个好结果吧



## Summary

Typora 与 PicGo 联动，其实越来越有notion类似的云笔记的味道了，日后如果再有一个视频床或者Typora支持的格式更丰富一些，能把PicGo内置进去，来个云图床什么的，Typora基本就是下一个notion了，还是挺香的



## Quote

> https://hoxis.github.io/typora-picgo.html

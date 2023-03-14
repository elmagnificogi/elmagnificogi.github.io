---
layout:     post
title:      "NVIDIA Shield 消失的解决办法和Moonlight串流"
subtitle:   "3080ti，Geforce experience"
date:       2022-01-16
update:     2023-03-14
author:     "elmagnifico"
header-img: "img/bg3.jpg"
catalog:    true
tags:
    - 3080TI
    - Nvidia
---

## Foreword

之前有用Moonlight串口pc的游戏到公司电脑，然后突然有一天串流就不可用了，NVIDIA Shield 就消失了，怎么都开不起来。串流就失败了。然后也记录一下Moonlight串流的操作。



**由于NVIDIA单方面宣布停止NVIDIA Shield Service，我之前一直以为是停止Shield硬件支持，没想到这个老黄直接把PC端的都干掉了，所以本篇Blog也成了历史的眼泪，新的串流方法是使用Sunshine，依然是Moonlight的，当然截止到今日20230-03-14 Shield依然正常工作**

> https://github.com/moonlight-stream/moonlight-docs/wiki/NVIDIA-GameStream-End-Of-Service-Announcement-FAQ

备胎方案看这里

> https://elmagnifico.tech/2023/03/14/Sunshine-moonlight/



## NVIDIA Shield 消失的解决办法

要想用Moonlight串流，就必须先解决 NVIDIA Shield 消失的问题，否则一定无法串流。



## 一般情况

一般情况下可能是Shield对应的进程或者服务没有启动，导致Shield不见了。

所以检查 NVIDIA Web Helper.exe 是否启动了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/8jQIt1TimGRed6P.png)

以及 NVIDIA 服务是否启动了，主要是看NVIDIA LocalSystem Container，服务是否正常。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/X5CI2JlF4Z3Ve9h.png)



## 远程桌面导致无法获取信息

RPD远程桌面的时候会出现无法获取信息！的故障提示，这个问题只能通过其他远程桌面比如AnyDesk或者TeamView等方式打开，他们打开就不会提示了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/byvUKOC1Jd9rFqE.png)



## 国内联网问题

如果以上进程和服务都没问题，那大概率是联网问题了

看了几个帖子，大概就是驱动升级以后 NVIDIA Shield 有一项关键服务是联网的，而他的地址不巧，被墙了，导致正常连接根本连不到。

要解决这个问题就是想办法连到，有人通过改DNS来连接，但是这个方法现在已经不好用了，所以还是得通过翻墙或者代理对应的连接才行。



我通过netch代理进程以后，查看log，反复重启 NVIDIA LocalSystem Container 服务，大概搜集到了以下连接

```
3.113.57.2:443 timeout
18.176.165.151:443 timeout
35.165.244.249:443 timeout
52.33.13.112:443 timeout
52.89.140.243:443 timeout
54.92.35.37:443 timeout
52.193.86.115:443 timeout
52.194.128.239:443 timeout
72.25.64.2:443
117.18.232.173:443
152.199.40.78:443 timeout
```

其中72.25.64.2和117.18.232.173都是能正常连接的，而其余连接则是全部timeout，这些timeout的连接也都是Shield的验证服务器，所以随便他们中哪个连接可以连通，那么Sheild就能正常显示。



所以接下来就是在路由里面设置白名单，强行要求代理以下ip即可(**有些路由更新DNS或者说PC更新DNS比较慢，建议添加以后手动重启路由器和PC，加速这个代理过程**)

```
# 以下IP选一个就行，但是最好都加上吧，防止万一哪天哪个IP掉了
3.113.57.2
18.176.165.151
35.165.244.249 
52.33.13.112
52.89.140.243
54.92.35.37
52.193.86.115
52.194.128.239
152.199.40.78
# 注意下面这两个ip虽然能正常连上，但是也需要代理，否则验证不通过，SHIELD依然不能显示
72.25.64.2
117.18.232.173
```

或者是加速器代理指定ip也行，然后重启一下 NVIDIA LocalSystem Container 服务，就可以看到SHIELD 正常显示出来了

只要SHIELD正常显示了，那么这个时候**断开他的代理也不会有问题**，这个服务只是做了一次验证，只要不重启就一直有效。



## MoonLight

再记录一下MoonLight 如何串流

> https://moonlight-stream.org/

首先是下载moonlight

> https://github.com/moonlight-stream/moonlight-qt/releases

然后正常安装即可，安好以后，确认你的Shield是正常能打开的状态，同时开启GAMESTREAM

![](https://img.elmagnifico.tech/static/upload/elmagnifico/WlvMY5iIphzmsUb.png)



#### ZeroTier

这里不得不提ZeroTier，因为串流本质上是要求局域网内才能这么操作的，但是当你在公网以后，需要串流就必须通过打洞来实现了。详细的看下面我的教程

> http://elmagnifico.tech/2020/09/23/NAS-ZeroTier/

当两台PC都加入到了同一个ZeroTier的局域网以后，就可以开始匹配了



#### 匹配

与串流PC进行配对

![](https://img.elmagnifico.tech/static/upload/elmagnifico/JWUvtVOXA4YCcHI.png)

串流PC会显示输入验证码，输入即可

![](https://img.elmagnifico.tech/static/upload/elmagnifico/L8tKD5CrZSVaXFs.png)

然后在显示PC上就看到了如下画面，已经正常连接了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/UYzN6wnrIjEs31H.png)

点进去就能看到当前可以串流的游戏，剩下就是点击就能玩了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/CQ7dqYUlp8ZrX42.png)



#### 设置

一般来说网速没问题，都设置成1080P 60fps，然后下面的视频码率，可以当作带宽来看到，建议不超过串流网络的上传速率，比如家里只有30M上传，那么就别超过30就行了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/bsQeydGA5xRZOnX.png)



#### 自定义串流软件

本质上说任何软件都能通过串流来显示，而默认情况下Shiedl只显示Geforce Experience扫描出来的游戏，如果你需要一些其他游戏，或者说这个游戏是通过一些软件或者平台启动的，就需要自定义添加。

在SHIELD这里，添加，然后指定exe即可，比如我这里D2R就是暗黑2，而mstsc就是windows RPD 远程桌面的exe，我也拿来串流了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/WlvMY5iIphzmsUb.png)



## RPD锁帧的问题

众所周知，当使用RPD远程桌面的时候，很多游戏会直接无法开启，甚至它本身不调用显卡，但是通过MoonLight则可以强制开启，并且解锁RPD桌面的锁帧问题。

比如我如果使用RPD打开暗黑2，那么必定锁30帧，而且无论怎么调整都无效。但是当我使用MoonLight开启RPD的时候，锁帧就被取消了，这就很舒服了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/ZTJHCW3d7RXLw68.png)



## 分辨率问题

注意修改分辨率，不要通过windows自带的，类似下图的地方修改，改了以后Moonlight可能识别不到，会导致串流的分辨率还是错误的。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/kFqMxQzwtXycLYP.png)

要通过NVIDIA的显示更新分辨率来设置，这样才能正确识别。如果已经改了，**可以先改个别的分辨率，再切过来就行了**

![](https://img.elmagnifico.tech/static/upload/elmagnifico/g2GAyEHup6UQi4F.png)

可能很多串流的机器已经不是1080p了，但是串流以后会发现图像特别小，甚至可能有黑边，然后鼠标也是错位的情况。

这个时候就需要你进到NVIDIA的控制面板-调整桌面尺寸和位置 然后设置成全屏，下面的分辨率也设置成1080P

![](https://img.elmagnifico.tech/static/upload/elmagnifico/Gc29dDSR6kiEMbl.png)

然后再重新开启串流，刚才变形的画面就正常了。



## Summary

总的来说还是非常爽的，有了MoonLight以后基本走到哪里都能串流，手机也行，平板也行，非常舒服，再配合一个远程插座、远程开启PC，简直完美。



## Quote

> https://tieba.baidu.com/p/7667214917#142649620547l
>
> https://tieba.baidu.com/p/7685678088
>
> https://tieba.baidu.com/p/7447444245
>
> https://bbs.a9vg.com/thread-5365751-1-1.html
>
> https://nvidia.custhelp.com/app/answers/detail/a_id/4581
>
> https://github.com/moonlight-stream/moonlight-docs/wiki/Setup-Guide




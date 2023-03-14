---
layout:     post
title:      "Sunshine替代NVIDIA Shiled串流"
subtitle:   "moonlight"
date:       2023-03-14
update:     2023-03-14
author:     "elmagnifico"
header-img: "img/z9.jpg"
catalog:    true
tags:
    - Game
---

## Foreword

**由于NVIDIA单方面宣布停止NVIDIA Shield Service，我之前一直以为是停止Shield硬件支持，没想到这个老黄直接把PC端的都干掉了，所以本篇Blog也成了历史的眼泪，新的串流方法是使用Sunshine，依然是Moonlight的，当然截止到今日20230-03-14 Shield依然正常工作，所以Sunshine只是备胎而已**

> https://github.com/moonlight-stream/moonlight-docs/wiki/NVIDIA-GameStream-End-Of-Service-Announcement-FAQ

尝试一下使用Sunshine替代NVIDIA Shiled串流



## Sunshine

Sunshine其实是一个推流方案，他会开启一个端口用来给Moonlight使用

> https://github.com/LizardByte/Sunshine
>
> https://app.lizardbyte.dev/



#### 安装

直接下最新版的安装包即可

> https://github.com/LizardByte/Sunshine/releases



#### 使用

安装完成以后，直接打开会显示一个后台端口

![image-20230314215110708](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142151756.png)



第一次打开会提示一个本地端口

```
https://localhost:47990
```

用网页打开

![image-20230314205647394](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142056503.png)

第一次要设置账号和密码，用来登录配置页面

登录以后就是这样的

![image-20230314205739158](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142057214.png)



- 由于此时Nvidia Shield还未关闭，所以想测试Sunshine，记得先关闭Gamestream，否则默认moonlight走的是Shield

![image-20230314215401009](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142154054.png)



关闭以后，在moonlight那边删除老的客户端（Shield），手动添加计算机，输入IP，等待提示密钥

![1123333](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142158782.png)

拿到密钥以后，在PIN里，可以看到配对，输入密钥即完成配对

![image-20230314210726196](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142107242.png)

Moonlight显示就像以前一样了

![1123](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142157701.png)



#### 添加游戏

Sunshine是通过Applications添加游戏的

![image-20230314215937625](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142159655.png)

点进来可以看到，他不能自己扫描，需要一个个手动添加

![image-20230314215926694](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142159768.png)



- 这里有很多问题，Sunshine由于不是管理员权限打开的，所以可能会遇到权限相关问题导致实际游戏根本无法打开的情况
- 唯一好的一点是你输入游戏名字，这个Image竟然有本地库可以推荐你封面图片



Sunshine这里其实单开游戏和开桌面区别不是很大，你可以直接切回到桌面，更像一个远程桌面的感觉，而不是串流



Sunshine有出一个转换游戏链接的工具，可有可无吧，Sunshine本质上不能提权，所以这个也不是很好用

> https://github.com/LizardByte/GSMS



## 问题

- Sunshine不会自动切分辨率，带鱼屏直接原样传给我的1080P
- 手柄支持还需要额外一个软件，由于我不用手柄就不试了
- 默认不需要安装音频等虚拟驱动，默认的声音很小，开大以后才听见
- Sunshine是有硬件限制的，可能部分老硬件需要额外驱动或者什么其他的



## Summary

Sunshine目前能用，但是不够优雅，一体化程度还是比较差，后面可能会再体验一下parsec的串流



## Quote

> https://tieba.baidu.com/p/8213275511
>
> https://youtu.be/Wb8j8Ojd4YQ
>
> https://docs.lizardbyte.dev/projects/sunshine/en/latest/about/usage.html#setup




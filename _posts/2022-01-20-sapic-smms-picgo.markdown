---
layout:     post
title:      "继SMMS图床要求登陆后，使用sapic自建图床"
subtitle:   "typora，picgo，图床"
date:       2022-01-20
update:     2022-01-20
author:     "elmagnifico"
header-img: "img/bg6.jpg"
catalog:    true
tags:
    - Typora
    - Picgo
    - 图床
---

## Forward

这几天写blog，发现图床突然就不能用了，找了半天原因，发现好像是smms必须要登陆了？然后Picgo更新以后，我忘记使用自己token来上传smms的图片了。

随便搜了一下发现一堆嘲讽smms的，讲道理有点离谱，我开始用smms的时候已经免费稳定运行了五六年了吧，到现在smms已经免费了10年？别人用爱发电还要嘲讽有点离谱了，且不说注册一下就能拿到Token了，又可以正常上传了。这个操作其实也挺好的，把这些非目标用户全都过滤出去，多数人都是临时图片或者是有问题的图片，还想占用别人免费的资源，就很离谱。

>https://hostloc.com/thread-959379-1-1.html
>
>https://hostloc.com/thread-960336-2-1.html
>
>https://www.v2ex.com/t/829201



SMMS也有他的问题，为了平衡，他得收费，而这就导致了网站的盈利点可能不够，所以免费存储的图片尺寸基本都是小的预览图，要看清得点进去，进去了里面，会有广告横幅，像牛皮癣一样，给人一种不好的感觉。

再加上最近SMMS的免费服务感觉也不太行了，经常打不开了，我的图又越来越多了，万一哪一天SMMS跑了，我的图就全没了，所以自建图床还是有必要的。



## 腾讯云COS

类似阿里云OSS，或者又是什么*Serverless* 流图床，本质上都差不多，直接买现成的存储服务就行了。这种花钱就能解决问题，多数情况下每个月几块钱就能够完成图片存储的任务了，可靠性还比较高。不过我不是很喜欢，还是想图片啥的都在自己手上。

> https://zhuanlan.zhihu.com/p/119250383



## Chevereto

随便搜一下图床，Chevereto 一大堆，不过我仔细看了一下，它本身功能超级复杂，有免费版和授权版，免费的本身功能就够用了，不过是php开发的，我估计我想改有点麻烦，我就跳过了

> https://www.eula.club/VPS%E6%90%AD%E5%BB%BAChevereto%E7%A7%81%E6%9C%89%E5%9B%BE%E5%BA%8A.html



## sapic

sapic 是python开发的，星数也不多，用的人也不多，不过稍微看了看，需要修改的话，我自己就行了，就决定用这个了（坑了我好几次，果然人少的项目被review的少，不少地方出错了）。还有一个sapic支持视频上传，其实后面我想作为文件分发的话，也完全可以改改就能用了。

> https://github.com/sapicd/sapic
>
> https://sapic.rtfd.vip/zh_CN/latest/index.html#sapic

但总体来说可以一键部署，问题还是不大的。



## 安装

其他方式都不推荐了，直接docker-compose就完事了

```
cd sapic
docker-compose up -d
```

一般情况下直接就能正常启动了（我sb，安全组设置错了，debug了好久，还麻烦作者帮我debug）

要吐槽的就是作者给出来的docker-compose的整体流程是gif的，我还用ps打开一帧帧看的，非常唇笔。还好作者人好，邮件回复很及时。



**如果有安全组、防火墙，记得放行9514端口**，否则后续无法访问到，如果上了nginx，那么自己写一下，转发到9514端口。



如果修改了配置，记得加上build参数，重新编译一下，官方教程里的操作写错了，实际上并不能启动编译流程。

```
cd sapic
docker-compose down
docker-compose up -d -build
```



#### 创建管理员

虽然已经可以访问了，但是实际上系统默认不允许匿名上传，而且没有默认用户，要新建一个管理员，正确设置以后，会提示注册成功

```
cd sapic
docker-compose exec webapp flask sa create -u 管理员账号 -p 密码 --isAdmin
注册成功！
```



## 访问

非nginx的情况下，直接访问

```
http://xxx.xxx.xx.xx:9514
```

然后就能看到首页了，这个时候直接拖拽上传还不行，因为设置里不允许匿名上传图片。先用刚才的管理身份登陆

![image-20220120163356836](https://s2.loli.net/2022/01/20/pGDVyMsQk3qAS5i.png)



#### api 访问

要使能，api访问，需要先建立一个token，进入到用户设置，然后个人资料里，创建token，保存

![image-20220120164551765](https://s2.loli.net/2022/01/20/VwrqylinKtfHZhv.png)

再进入到用户设置里，添加LinkToken，都默认即可。

![image-20220120164623689](https://s2.loli.net/2022/01/20/w8l7XnVtgvpyINx.png)

两种方式可以访问，一种是token，相当于root密码级别，一个是LinkToken，相当于分权后的子用户。随便用哪个都行，但是某些地方支持LinkToken，所以LinkToken是必须的。



#### Picgo

想要配合Picgo，需要先安装插件 web-uploader

![image-20220120164813106](https://s2.loli.net/2022/01/20/cjC92dS6YD4zxA1.png)

安装好了以后通过自定义图床接口来用，和以前还不支持SMMS的token一样。



##### token

使用token进行上传，配置如下

```
API地址: http[s]://你的sapic域名/api/upload

POST参数名: picbed

JSON路径: src

自定义请求头：留空即可

自定义Body: {"token": "你的token", "album": "test"}
```

- **注意官方教程里，写了请求头，实际上并没有任何用处，而且存在一点二义性，所以按照我的来写就行了**

- 官方教程里 "album" 漏了一个引号，导致如果你复制了，Picgo就会提示上传失败

![image-20220120170418103](https://s2.loli.net/2022/01/20/Gbji5H2MkC7LZ3A.png)



##### LinkToken

使用LinkToken 就必须填请求头

```
API地址: http[s]://你的sapic域名/api/upload

POST参数名: picbed

JSON路径: src

自定义请求头：{"Authorization": "LinkToken 你的LinkToken"}

自定义Body: {"album": "相册名或留空"}
```

![image-20220120170620434](https://s2.loli.net/2022/01/20/qmoTsl2Xfhc6OVe.png)



#### Typora配合sapicli使用

前面半天折腾不好Picgo，于是转而使用同项目的sapicli来配合Typora使用



把图像上传服务切换成Custom Command ，然后命令如下

```
你的sapicli的存储路径\sapicli.exe -u http://你的服务器/api/upload -t 你的LinkToken -s typora file ${filepath}
```

![image-20220120171058834](https://s2.loli.net/2022/01/20/K9aGV5tAJb3UgIY.png)



点击验证图片上传，就能看到类似的提示，说明服务可以用。

![image-20220120171452769](https://s2.loli.net/2022/01/20/YI5SxdGR9eTMBmZ.png)



## Summary

剩下就是我把整个blog的图片全都dump下来，然后转存到了我自己的服务器上，以后就不依赖SMMS了



## Quote

> https://sapic.rtfd.vip/zh_CN/latest/usage.html

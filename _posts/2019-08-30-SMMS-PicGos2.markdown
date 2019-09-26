---
layout:     post
title:      "SM.MS图床配合PicGo使用二"
subtitle:   "图床"
date:       2019-08-30
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Tools
---

## Foreword

经过了快一年，SM.MS也更新了，PicGo也更新了。

然后我发现我的需求也有一点小小的变化了。

## PicGo

PicGo，更新了几个小版本，这么一更新呢，增加了几个自己的插件，本身的功能没有太多的更新，然后插件是用来应对各种其他图床或者自定义图床之类的功能。

用了这么久也发现了一些问题

- 存储的上传记录中的图片，只有链接的形式或者说预览图的形式，没有本地文件，无法本地直接浏览也就无法批量转存到本地，虽然可以转存到其他图床
- 有时候SM.MS的图床会提示网络问题，其实对应的网络问题是遇到SM.MS的限制
- Picgo本身的图片记录无法云同步，不同机器之间的记录是分开的

## SM.MS

首先SM.MS有了用户系统，在使用用户Token上传的情况下，可以记录用户上传的所有图片信息了。

> https://sm.ms/doc/v2

但是SM.MS有每日图片限制，比如单日不超过30张图，好像还有一小时不超过多少张的限制吧。

之前Picgo无法云同步，这里SM.MS相当于是给出来了自己的云同步的图片库，那么接下来就是想办法让二者可以联系起来

## 云同步

首先Picgo可以安装插件，先安装一个自定义web图床的插件，叫web-uploader 1.1.0版本

- SM.MS 注册登录，并且生成API Token

  ![SMMS](https://i.loli.net/2019/08/30/XlhmCi9GDsbnJ2c.png)

- 查看SM.MS的API v2 版本

```
基本信息

Path： /api/v2/upload

Method： POST

接口描述：

图片上传接口

请求参数

Headers

参数名称	参数值	是否必须	示例	备注
Content-Type	multipart/form-data	是		
Authorization		否		参照 Authentication
Body

参数名称	参数类型	是否必须	示例	备注
smfile	file	是		上传文件
format	text	否	json	输出的格式。可选值有 json、xml。默认为 json
```

对应到PicGo这里，自定义图床里有一些设置需要补充

```
url:https://sm.ms/api/v2/upload
paramName:smfile (这个的意思是Body中的图片文件名，其他图床也是会有类似的名称)
customHeader：{"Content-Type":"multipart/form-data","Authorization":"你的token"}
jsonPath:data.url
```

![SMMS](https://i.loli.net/2019/08/30/9SjGaWRfu87HUPe.png)

其他几项可以不用填，然后切到上传区中的自定义Web图床，上传一下就能看到结果了。

##### 问题

也有个小问题，自定义图床的情况下就算上次失败，返回了失败的内容，但是PicGo返回的是正确的，这个时候复制粘贴的话，就看到的返回的body

#### 查看图片

![SMMS](https://i.loli.net/2019/08/30/3ZMjvTBNnQHms1h.png)

这里就能直接查看图片了，有点类似于以前七牛云的那个方式，这里可以直接查看图片或者删除。

如果这里能用预览小图的方式查看就更好了，不过那估计还得花另外的一些资源吧。

然后这里有一个东西要注意一下，这里的图片名其实是上传时你的图片名，而不是生成的url以后的图片名。

## Summary

感觉随着写的东西变多，可能需要图片的时候更多了，那会可能就要我自己搭建一个图床了，而不是再用这个图床，需求还是一点点增长的啊

## Quote

> https://sm.ms/vvbcvg   

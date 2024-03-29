---
layout:     post
title:      "开源项目免费获取JetBrains全家桶"
subtitle:   "github,license"
date:       2021-05-14
update:     2022-05-21
author:     "elmagnifico"
header-img: "img/welding2.jpg"
catalog:    true
mathjax:    false
tags:
    - OpenSource
---

## Foreword

之前用的 JetBrains 的学生license过期了，然后学校邮箱也被回收了，就白嫖了一段时间的网上的license，但是这个license三天两头的失效，还要再找激活，很麻烦。

听说 JetBrains 允许开源项目，然后换取对应的全家桶license，于是我也试了试。



## 获取免费license

首先是通过下面的网址，然后没注册的注册一下，注册了的就登陆一下。

> https://www.jetbrains.com/shop/eform/opensource

如实填写就行了，要注意开源的项目至少要建立了3个月，并且最近3个月有一些commit，并且commit的内容是code而不是类似文本或者非代码内容。

这里可以申请多个激活权限，具体多了不知道能不能通过。（目前已知我申请了一个激活次数，但是我在多个pc上都能激活）

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3J1VvLCNn2ZTXga.png)

这里可能还需要你的项目有一个license，github上的项目可以通过添加一个新文件，然后文件叫license就会自动出现右侧的Choose a license template，然后就可以选一个License。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/OwaHPxgtVDXB35S.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/Bs6ogzJTIcqWLK2.png)

然后提交，等待邮件即可。



## 失败

第一次我是把我的blog项目，提交了，然后过了2周才回复，说我提交的不是代码，而是text之类的东西，不能发license。我解释半天代码包含在markdown文件中，也不行，必须纯代码。

第二次是一个老仓库，创建时间超过3个月，只是最近几个月没有commit，然后也不通过，尴尬了。

第三次就是这个仓库了，把我常用的片段代码或者是修改的别人的代码以及blog里分享的代码都合并到这里了，然后2天多就回复了，我通过了。

> https://github.com/elmagnificogi/MyTools

目前有以下的代码片段

#### Tools

- find_all_picture,replace my blog img
- seed,update the seed libary
- maya,some shot script about maya
- Activation,software activation method
- RVO2_Example,replace the origin spheres example,visiualized by maya
- CodeSinppet,just some maya or c++ code sinppet for quick copy
- GetRSSI,get every remote client rssi by ssh
- Measure_Wind_Speed,get wind speed from log txt
- PDF2JPEG,cut pdf to jpeg
- Query_Subnet_IP,query all subnet ip,find which is online
- Raspberry_Auto_Change_IP,batch change Raspberry ip by ssh
- SSH_SCP,replace remote client file by SSH SCP
- Close_or_open_mav,a mix of Query_Subnet_IP and SSH_SCP
- 一键改IP,change local pc ip by one click
- 一键刷机,flash firmware by one click
- 一键提取特定文本内容,get specific content from a txt by batch
- delete,Recycle.exe could delete file into the recycle where the delete file could recover
- 蚁群算法-matlab,Ant Clony Optimization by matlab
- Artificial Potential Field Method, a particle goal target like maya particle goal,but it's awsful. It mix RVO and Artificial Potential Field
- ECE375,ECE375 Final Project report and asm,all work
- DeleteCode,it's about the code i deleted
- data analysis，use for ICAT color analysis terminal geting RGBI data
- plot_RGB_chromaticities_in_chromaticity_diagram_CIE1931,show RGB anchor on diagram CIE1931
- chaojiying_Python，chaojiying captcha demo
- AutoReplay_douban, auto replay douban and recgnize captcha
- graph coloring，graph vertex coloring, find white point and show rgb curve
- APF-Simulator, Artificial Potential Field simulator



## 拿到License

大概2到3天就能收到通过的邮件，当然也有可能不通过，不通过的我都是2周左右才收到回复。

这个License可以使用一年，一年后重新申请即可

![](https://img.elmagnifico.tech/static/upload/elmagnifico/PqiZAgxG3v8J6aB.png)

接着点开链接登陆账号就能拿到对应的激活权限了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/jcWn1gMdAqIvNxC.png)

接着正常登陆账号，就激活了



![](https://img.elmagnifico.tech/static/upload/elmagnifico/cetrCMVBf41vPXJ.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/VzmQRytWveIYkni.png)



## 反激活

如果是破解版，需要删除破解时弄得多余的设置，或者是去掉破解的插件。



如果是用的别人的激活码，则似乎通过Help-Register删除之前的License，然后改成自己的

![](https://img.elmagnifico.tech/static/upload/elmagnifico/MJ4rIA2LU8qdjoZ.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/sF7wZjPzITHmcoO.png)



#### 可能会遇到的问题

登陆账号的时候提示以下内容

```
Certificate used to sign the license is not signed by JetBrains root certifi
```

出现这个情况是因为之前用了破解工具，然后导致没取消破解，正版激活失败了。



简单说用everything搜索`jetbrains-agent`，然后删除对应的包即可

彻底一些，搜索 `.vmoptions` 然后将文件内容中的关于jetbrains的都注释了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/lTyD93cvtdUOL8b.png)

然后重启一下ide，再激活就正常了。



## 续签

一般会在到期前2周，给你发送续签的邮件，只要点链接再申请一下就行了，非常简单（然而我没看到邮件错过了）

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202205210000317.png)

如果忘记续签，其实他也会额外让你用一周，一周后才会真的到期。



我就是真的到期了，然后才发现没续，于是翻到了邮件，当天立马续签。大概五六个小时以后(可能是他们的早上八点)我就拿到了续签通知，又可以继续白嫖了，美滋滋

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202205210000890.png)



## Summary

开源yyds



## Quote

> https://www.cnblogs.com/evenyao/p/10290482.html
>
> https://blog.csdn.net/guangmo0123/article/details/109039456
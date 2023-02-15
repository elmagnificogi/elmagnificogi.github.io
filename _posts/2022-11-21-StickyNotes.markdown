---
layout:     post
title:      "解决便笺及其他UWP无法同步问题"
subtitle:   "Loopback,Sticky Notes,v2ray,uu"
date:       2022-11-21
update:     2023-02-04
author:     "elmagnifico"
header-img: "img/line-head-bg.jpg"
catalog:    true
tags:
    - SoftWare
---

## Foreword

便笺，windows自带的程序，非常好用，可以自动同步，也简单易用。



## Sticky Notes

Windows应用商店直接搜索安装

![image-20221121141020604](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211410681.png)



同步的便笺也可以直接通过outlook的邮箱，直接看到，也可以修改什么的

![image-20221121140840552](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211408641.png)



#### 同步失败

但是新装的便笺很容易出现无法同步或者失败的问题。由于Windows的APP本质上是在沙箱中运行的，这就导致本地代理不但代理不了，还会莫名其妙影响到沙箱的网络

一般情况下，只要不开启VPN，也就是V2ray，不使用局域网的代理设置，Windows商店就能正常打开，就可以正常同步

![image-20221121141306875](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211413946.png)



但是最近新装遇到了，就算什么都不开依然无法同步的情况，提示的这个错误也完全解不了，很多评论也是相同问题。

```
CorrelationVector: 2W/eRLgJ/E6kKZufCo2GZg.13

ServiceRequestId: f5485f82-cc74-4952-9c7d-6cee66549a7f

BackEndTarget: DM6PR15MB3194.namprd15.prod.outlook.com

AccountLogId: 9d493b4141273e43

Timestamp: 2022-11-18T22:41:22Z
```

由于之前有地平线之类的联机经验，大概率是windows内部的代理用普通VPN无法解决



#### UU加速

想起来我的uu加速，貌似可以代理windows商店应用，所以试了一下

![image-20221121141708027](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211417247.png)

Windows加速只有一个选项，就是Windows Xbox App，加速以后，再进行同步，果然全部正常了

![image-20221121141916686](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211419752.png)

## 解决代理问题

![Win10 App如何走代理?Win10应用代理教程](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211516727.jpeg)

比较有名的网络分析软件Fiddler有一个工具，`AppContainer Loopback Exemption Utility`，他可以实现将指定的windows uwp应用修改网络模式。当然也有一些命令行工具可以用，只是需要查询注册表，然后再去执行，比较麻烦



不过我嫌安装Fiddler也比较麻烦，所以搜了一下，刚好看到了一个项目

> https://github.com/tiagonmas/Windows-Loopback-Exemption-Manager

不过他没编译，所以我fork以后重新编译了一下

![image-20221121151908935](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211519989.png)

可以在这里直接下载编译好的exe

> https://github.com/elmagnificogi/Windows-Loopback-Exemption-Manager/releases/tag/V1



没开启前，使用v2ray和pac协议

![image-20221121154436558](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211544636.png)

![image-20221121154056991](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211540061.png)

可以看到有网络问题，搜索stick，勾选Exempt，然后Save

![image-20221121154538175](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211545212.png)

重新打开便笺，就看到同步正常了

![image-20221121154716343](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211547406.png)



#### V2rayN

后来发现原来新版的V2rayN就自带了这个UWP解除代理的工具，也非常好用

![image-20221203115605804](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212031156960.png)



## 代理也依然无效的情况

某次重装windows以后，由于自带了sticky notes，所以直接使用上述方法进行代理，发现无论怎样都不能正常同步。

默认自带的sticky notes在注册表中的名称更简洁，和上述的略微有些不同，后来直接删除sticky notes，重新从windows store下载，发现重下后的sticky notes的注册路径就比较正常了，再重新代理，同步就正确了。

然后还有一点，有可能sticky notes也需要windows store后台工作，所以随手把windows store也代理了



## Summary

同理此方法可以适用于所有uwp应用或者与此相关的



## Quote

>https://techcommunity.microsoft.com/t5/windows-10/microsoft-sticky-notes-sync-issue/m-p/2111908
>
>http://www.ddrfans.com/Html/1/32736.html
>
>http://bbs.csource.com.cn/index.php?c=read&id=395&page=1


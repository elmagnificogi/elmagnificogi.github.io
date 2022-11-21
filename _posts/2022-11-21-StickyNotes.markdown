---
layout:     post
title:      "解决便笺无法同步问题"
subtitle:   "windows,Sticky Notes,v2ray,uu"
date:       2022-11-21
update:     2022-11-21
author:     "elmagnifico"
header-img: "img/line-head-bg.jpg"
catalog:    true
tags:
    - SoftWare
---

## Forward

便笺，windows自带的程序，非常好用，可以自动同步，也简单易用。



## Sticky Notes

Windows应用商店直接搜索安装

![image-20221121141020604](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211410681.png)



同步的便笺也可以直接通过outlook的邮箱，直接看到，也可以修改什么的

![image-20221121140840552](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211211408641.png)



#### 同步失败

但是新装的便笺很容易出现无法同步或者失败的问题。

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



## Summary

未完待续



## Quote

>https://techcommunity.microsoft.com/t5/windows-10/microsoft-sticky-notes-sync-issue/m-p/2111908


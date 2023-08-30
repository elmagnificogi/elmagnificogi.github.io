---
layout:     post
title:      "UBNT的一些基础配置指南"
subtitle:   "UniFi，AC，Outdoor5，UAP-AC-M-Pro"
date:       2023-08-30
update:     2023-08-30
author:     "elmagnifico"
header-img: "img/y8.jpg"
catalog:    true
tobecontinued: false
tags:
    - UBNT
    - Network
---

## Foreword

记录一些折腾UniFi时遇到过的奇奇怪怪的问题



UniFi和RouterOS比起来，感觉贼难用，特别是采用，发现设备响应非常慢，急死个人。

经常会出现站点文件里的设备采用失败，对不上了。

虽然UniFi的AC设计的非常高大上，但是真正需要配置的东西却都隐藏起来，他面向的更多的是小型环境，小白环境。而他的易用程度如果和国内的比，那简直惨不忍睹，不知道为啥国外的设计思路都非常繁琐，不够直接。想做到易用却又端着自己的设计风格和程序框架上的思路，自我矛盾，而想要专业却又远不及真正专业的大厂。这也导致了UniFi处于市场中不上不下的位置。



## 采用

UniFi的AP设备新版本采用必须把**设备连接到有dhcp的网络**中才能正常采用，否则大概率采用会失败。

最老的设备恢复出厂设置以后是自带DHCP的，所以可以直接采用，反而是升级到了新版本DHCP没了，直接连接是无法快速采用的



掉采用，这是最烦人的事情了，掉采用多数情况是因为之前采用的站点文件变了，而站点文件包含一些我们不知道的信息

- 站点文件竟然包含了设置这个站点时你所用的IP，当你换个端口换了IP，这个站点文件会出现长时间显示无法采用的情况，而过了n久以后，他竟然又自动采用了？（我一脸懵，具体原因未知）

一旦采用后最好保存一下站点文件，方便后续使用。



## SSH认证后高级采用

新版的UBNT AC控制器中有了SSH认证，并且默认情况下就设置了

![image-20230830212138267](https://img.elmagnifico.tech/static/upload/elmagnifico/202308302121359.png)

以前的老设备，默认账号密码是

```
ubnt
ubnt
或者
root
ubnt
```

新设备采用以后，使用的就是SSH认证的账号密码了，如果知道这个就可以强制采用，无视之前的采用（但是实际情况却是我用SSH一直无法采用）。

- 目前最简单的办法就是直接重置，重新采用



## VLAN隔离

> https://www.edcwifi.com.cn/wiki/16.pdf



## UniFi 高级更新

> https://help.ui.com.cn/articles/204910064/



## UniFi APP

UniFi APP的App也非常难用，发现网络超级慢，每次都要等好久，不知道到底在干嘛。



## Summary

还有更多需要设置的东西，还会继续补充完善

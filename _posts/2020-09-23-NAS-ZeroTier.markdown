---
layout:     post
title:      "NAS与ZeroTier内网穿透"
subtitle:   "Frp，群晖"
date:       2020-09-23
author:     "elmagnifico"
header-img: "img/zerotier.jpg"
catalog:    true
tags:
    - nas
    - 群晖
---

## Forward

由于teamviewer的破解版不能用了，导致现在远程起来不是很方便，现在用的是AnyDesk,但是有个很明显的问题，AnyDesk服务器不支持BGP，遇到电信转联通，或者电信转移动的时候，非常卡，而以前的teamviewer明显没有这个问题。



由于时不时还需要远程到公司，加上群晖的Synology Drive 由于没划分每个个体，各个部门用各个部分的账号，导致实际从外部连接到NAS的时候如果只用Quick connect非常慢，而我开了DDNS以后基本可以跑满整个带宽了，但是为了把控使用的人以及外部连接到公司内网设备还是挺不安全的，而且Synology Drive Client的客户端不是非常好用，每次要重新连DDNS而不是Quick connect必须要删除所有同步任务，重新添加才能正常连上，否则就算你填了DDNS地址也会直接连Quick connect。



## 内网穿透

早就有听说内网穿透工具，只不过一直没尝试过。比较有名的就是ZeroTier，Frp等等。



ZeroTier One 本身有一个免费套餐，免费套餐可以使用的客户端个数有50个，非常多，而Frp的客户端只有10个，考虑到公司内部使用，虽然用的人少，但是10个可能不太够用，所以就选择了 ZeroTier One



其本身配置也非常简单，客户端只需要**Network ID** 就能正常工作了，而管理者也只需要在客户端加入后，点个授权就能直接内网穿透了。



## ZeroTier

> http://www.zerotier.com/

首先，注册一个账号，google可以直接登录，选择免费套餐，创建，记录一下Network ID就可以了。

ZeroTier 基本是全平台吧，各种NAS也支持，Windows和Android 基本都是下App，然后安装，装好以后基本就一个选项Join Network，然后填入刚才的Network ID就行了。

如果所在平台不支持，也可以通过源码自行编译一个。



#### windows

windows比较简单，直接右键弹起，Join Network即可

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/hkpXzAqyHr4u8Bt.png)

它本身没有多余的界面，双击也没有什么主界面弹出来，非常简洁

windows本身会添加一个虚拟网卡，这个网卡就是连入内网的虚拟设备了，类似sstap，提示是否发现网络内设备时，需要选择是

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/wyVJiOqRFbKD82A.png)



#### Android

同理安卓这边也是，简洁，高效

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/Uu8ZaRwQhqFvAj2.png)

填入以后，只需要开启即可

安卓这里会自动启动VPN标识



#### NAS-DS918+

我用的是白群晖，DS918+，NAS上安装稍微有点不一样，因为各个NAS可能芯片不一样，架构不一样，自然安装包也不一样，需要先手查看一下NAS的CPU或者架构是啥

首先开启NAS的SSH，记得稍后不用了把这个关了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/4a5ELDkdpuOK9s6.png)



ssh连接到NAS

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/e6LQvRnZrPDYaAI.png)



使用下面的命令，查看系统信息

```
uname -ar
```

可以看到这里是 synology_apollolake_918+,然后从下面的地址中寻找对应名称的

> https://download.zerotier.com/dist/synology/

我当前版本是 zerotier_apollolake-6.1_1.4.0-0.spk

打开套件中心，选择手动安装，上传刚得到的spk，然后下一步，应用即可

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/7MZlrbVG5xs8INO.png)



还是一样的简洁，输入Network ID 加入即可

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/F2SpHGR9AknjCTr.png)



#### 授权

上面三个个设备添加以后，刷新一下ZeroTier网站，然后可以看到对应3个设备，已经显示在Members中了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/3UlNaEq6WCRn4DH.png)

这里就需要勾选前面的Auth，这个设备就可以加入内网了，设备的ip或者是否在线，都能通过这里查看到。



#### 测试

直接通过ping一下，上面显示的ip，就知道是否已经连进内网了，非常简单



## 远程

#### windows

windows开启远程，打开控制面板，选择系统，选择远程设置

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/iydCYceT9zjfVMO.png)

然后允许远程连接到此计算机，如果不是用Microsoft账号登录的话，或者是其他账号登录的话，需要选择用户添加一下远程过来的账号，然后应用确定就行了。

如果是用Microsoft账号登录默认登录账号就开启了，无需设置用户。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/rvaWqk2z7OEYdl1.png)

然后开启ZeroTier，通过mstsc，输入要连接的目标内网地址，连接即可

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/VzpJTUwEKoYQlfL.png)



#### NAS

同理可以透过内网连接到NAS，公司内NAS以及连接到ZeroTier了，并且有内网地址

```
10.244.***.xxx
```

在Synology Drive Client连接的时候就可以通过搜索看到对应的内网设备IP，进而可以连接

- 注意，Synology Drive新建同步任务会认为你已经连接到了老的nas，所以需要删除所有原来的的同步任务再重新创建才能正常工作

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/VeaodnIZ4FS5BPM.png)

这样就能正常工作了

## Summary

**ZeroTier**有点好用，吹爆，吹爆，这个设计也很符合我的心意，这样远程到公司或者家里，都可以直接用windows自带的远程，只需要填对应内网地址即可，没有公网IP也能用，虽然我有公网IP，这样最大的好处是端口映射不需要在主路由上单独给每个设备开远程端口，也比较安全。 

甚至一些局域网游戏，类似游侠联机平台，这样的，都可以靠ZeroTier来解决

不知道ZeroTier支不支持手机端的热点接入内网，如果支持的话我感觉NS宝可梦甚至可以直接国内组个大局域网来玩了，都不需要官方网络了（其本身就是个大局域网）

下面的引用是我看的帖子，比较小白，每一步都有详细教程，看不懂的可以看看

## Quote

> https://post.smzdm.com/p/741270/p3/#comments


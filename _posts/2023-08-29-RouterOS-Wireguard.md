---
layout:     post
title:      "RouterOS配置WireGuard和ZeroTier"
subtitle:   "VPN,SD-WAN,Mikrotik,ZeroTier"
date:       2023-08-29
update:     2023-09-09
author:     "elmagnifico"
header-img: "img/y6.jpg"
catalog:    true
tobecontinued: false
tags:
    - RouterOS
    - Mikrotik
    - WireGuard
    - Network
    - ZeroTier
---

## Foreword

RouterOS 从7版本开始加入了WireGuard，方便用户做异地组网，当然如果有ZeroTier，也能组网，作为RouterOS 力推的组网方式，试一试看效果如何。



## SD-WAN

做异地组网还有一种方案就是使用SD-WAN，不过这个技术随便查查就知道了，基本是天价，运营商给的价格非常高，带宽又特别小，很不实用。



## WireGuard

> https://www.wireguard.com/

WireGuard最早听说是用来当VPN，翻墙用的，各种工具，UI封装以后拿来翻墙。不过随着封锁力度逐步增大，WireGuard也变得可以精准识别了，同时由于WireGuard本身是UDP，很容易被QOS，所以也没尝试过。由于他本身的一些特性，非常适合用来做异地组网，所以如果是国内做组网就可以简单的使用WireGuard来实现 。

较新的Linux内核中已经集成了WireGuard，所以大多数Linux系统已经是开箱即用的状态了，十分便捷。



## RouterOS配置WireGuard

> https://help.mikrotik.com/docs/display/ROS/WireGuard

这里是官方的wiki

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202308292327684.png)

他配置的比较复杂，额外配置了防火墙等内容，实际使用中不配置防火墙似乎也能正常使用。



![154-1.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202308292256187.png)

需要实现的拓扑图就是类似这样的，将异地两个地方的网络组网，让内部使用起来就像都在同一个局域网一样。



WireGuard本身不是C/S架构，所以主动发起连接的一方就作为客户端，而另一方就被动知道了对方是谁、在哪，就能建立起双向的链接。所以如果使用WireGuard至少要有一方是具有公网IP的，否则主动方就不知道找谁建立连接了。



如图所示，假设ROS-A的`10.1.0.1`是他的公网 IP，而`10.2.0.1`是ROS-B的公网IP。



分别在ROS-A和ROS-B上开启WireGuard

![154-2.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202308292311157.png)

- 注意，端口13231最好换一下，可能国内这个端口会被运营商屏蔽
- 如果有上级或同级路由，防火墙也要注意开启对应端口



开启WireGuard以后，还需要设置对应WireGuard网口（虚拟出来的网口）的IP地址

![154-3.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202308292315057.png)



分别在两边路由的Peers中添加对方，获取A的公钥

![154-4.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202308292316544.png)

将A的公钥填入B的Peer中，由于要知道对方是谁，Endpoint填写对方的IP地址，如果是非主动发起方，可以不填写。

![154-5.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202308292316703.png)

Endpoint Port填入对方的端口，Allowed Address写入允许连接的客户端的IP段，这里直接指定对方的真实IP即可。



同理将B的公钥也填入A中，其他设置差不多。



完成以后就可以ping对方的WireGuard的IP来测试是否组网成功了



WireGuard不好的地方就是必须要知道公网IP，这个东西很麻烦，公网IP本来就会变，这就要再加个DDNS才行，不够好。



## RouterOS配置ZeroTier

RouterOS安装ZeroTier比较简单，下载对应的Extra Packages 然后把里面ZeroTier的npk上传到File中，直接重启就自动安装好了

![image-20230904131621133](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904131621133.png)

输入Network ID然后在Instance中启动对应的controller即可

![image-20230904131632643](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904131632643.png)

通过ping工具已经可以ping通对方了

![image-20230904173439955](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904173439955.png)

但是这样有一个问题，只有部署了ZeroTier的路由才能ping通，他的下一级设备都无法直接ping通



### 静态路由

想做到对于主路由下面的设备无感，那就需要将两边的路由打通，利用Nat来通信，本身RouterOS在这里并不需要怎么配置了，都是ZeroTier端进行配置。



ZeroTier中添加一个静态路由，比如要访问`192.168.1.x`网络内的任意客户端，需要通过某个ZeroTier内的设备，这里是`10.244.179.68`

![image-20230904172753494](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904172753494.png)

这样就等于是建立了两个子网之间的桥梁，但是此时还是单向通道，同理如果要从另一个子网访问过去，也需要建立一个路由。

![image-20230904173152759](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904173152759.png)

网络部署的时候最好把两边的子网错开，这样静态路由不会冲突，这里反向访问就是`192.168.4.x`

![image-20230904191300074](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904191300074.png)

设置好以后就能在路由表中看到通过ZeroTier中获取到的路由表信息了



但是这样有一个小问题，如果要使用NAS，但是SMB服务的默认发现是不能跨网段的，所以底下的子设备是无法知道当前局域网中存在NAS的。

只能手动指定NAS的IP和存储路径，然后添加到网络位置中

```
\\10.244.179.68\公司xx
```

类似于这样，ip总是有点难记，这里还可以用域名处理一下，就变得更好记了。



如果想要可以直接发现到对应的设备，那么就需要底下的每个设备都加入ZeroTier中，每个设备都有自己的ZeroTier IP，那么就可以直接发现NAS设备了，这样不适合大型网络，就算了。



### 遇到问题

实际操作就遇到了问题

![image-20230908223458841](https://img.elmagnifico.tech/static/upload/elmagnifico/202309082234909.png)

拓扑如上所示：

尝试一，取消A的ZeroTier，直接用NAS与B组网，组网后B1同级的都可以通过10.244.179.68访问到NAS，但是无法通过192.168.1.7访问到。而A1同级则无法访问10.244.179.68，他确实实现了NAS异地共享，但是不够好，NAS连接要区分是A地还是B地，一套设置不能任何地方都使用。



先发现了一个小问题，从B ping NAS 就会出现下面的效果，延迟高的爆炸。其他设备的ping都只有3ms左右。

![image-20230908225442204](https://img.elmagnifico.tech/static/upload/elmagnifico/202309082254241.png)

非常奇怪的是这里Ping 应答的Host都是10.244.251.109，而超时的Host都是192.168.1.7

怀疑是和A网络中的被隔离的摄像头网络出现了冲突，于是修改NAS的IP地址到192.168.1.237，再重新测试，完全正常.... 



而奇怪的问题接踵而来

```
A1 可以到 A，A 可以到 B，B能到B1

B1 可以到B，B可以到A，A能到A1

A1 可以到B，A1 能到B1

B1 不能到A，B1 不能到A1
```

查看A1的路由表

![image-20230908234856751](https://img.elmagnifico.tech/static/upload/elmagnifico/202309082348782.png)

查看B1的路由表

![image-20230908234926001](https://img.elmagnifico.tech/static/upload/elmagnifico/202309082349034.png)

二者基本一模一样，判断没有问题。

再次怀疑是B网络中的摄像头有和A1冲突的IP，于是更换A的子网，重新测试发现完全正常....

```
B1 能到A，B1 能到A1
```

直接使用B1 连接NAS，正常

直接使用B1 连接NAS的ZeroTier IP，正常

到此ZeroTier完美实现了两边组网，两边子网可以互相ping通了



### 增加Moon

在RouterOS中增加Moon节点

进入zerotier中

```
zerotier/peer/
```



查看当前所有节点

```
print
```

![](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904192811527.png)

研究半天，发现RouterOS中的ZeroTier是不支持的Moon的，peer中没有增加的操作，这就非常尴尬了

![image-20230904194524109](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904194524109.png)



## Summary

总而言之，可以组网了。解决问题的过程中也获取到了一些额外的信息，比如在ZeroTier的链路上再进行一次OSPF加密之类的操作，挺多人提到ZeroTier的上限的，说是用其他的方式更好，比如sitetosite vpn 之类的方案，目前还没有需求，就不继续尝试了。



网络配置的时候没考虑摄像头的问题，导致这层被隔离的东西没有完全隔离干净，一直影响两边组网和各种ping的结果，差点就放弃了。



## Quote

> https://help.mikrotik.com/docs/display/ROS/WireGuard
>
> https://www.77bx.com/154.html
>
> https://zhuanlan.zhihu.com/p/623640331?utm_id=0
>
> https://zhuanlan.zhihu.com/p/447375895
>
> https://zhuanlan.zhihu.com/p/636198518
>
> http://www.irouteros.com/?p=1690
>
> http://www.irouteros.com/?p=1710
>
> https://help.mikrotik.com/docs/display/ROS/ZeroTier

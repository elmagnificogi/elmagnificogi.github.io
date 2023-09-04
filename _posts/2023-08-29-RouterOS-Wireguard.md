---
layout:     post
title:      "RouterOS配置WireGuard和ZeroTier"
subtitle:   "VPN,SD-WAN,Mikrotik,ZeroTier"
date:       2023-08-29
update:     2023-09-04
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



## RouterOS

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



## ZeroTier

RouterOS安装ZeroTier比较简单，下载对应的Extra Packages 然后把里面ZeroTier的npk上传到File中，直接重启就自动安装好了

![image-20230904131621133](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904131621133.png)

输入Network ID然后在Instance中启动对应的controller即可

![image-20230904131632643](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230904131632643.png)

实测电信的ZeroTier还是会被阻断，偶尔通一下，然后就阻断了，使用自建Moon节点都没用，直接阻断双方的端口



## Summary

实际组网不成功，Ping不通，还找不到原因



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

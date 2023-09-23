---
layout:     post
title:      "RouterOS配置GRE和OSPF"
subtitle:   "组网，RIP，静态路由,DDNS"
date:       2023-09-24
update:     2023-09-24
author:     "elmagnifico"
header-img: "img/bg6.jpg"
catalog:    true
tobecontinued: false
tags:
    - RouterOS
    - Mikrotik
    - Network
---

## Foreword

ZeroTier还是有点问题，莫名其妙会掉线，掉了以后还不会自动重连，还得要手动关闭再开启。

尝试一下GRE+OSPF的连接方式



掉线的问题，怀疑类似这里，但是掉线只有一端掉，另外一端完全没问题

> https://forum.mikrotik.com/viewtopic.php?t=184817



## GRE

通用路由封装(GRE) 是一种协议，用于将使用一个路由协议的数据包封装在另一协议的数据包中。“封装”是指将一个数据包包装在另一个数据包中，就像将一个盒子放在另一个盒子中一样。**GRE 是在网络上建立直接点对点连接的一种方法，目的是简化单独网络之间的连接**。它适用于各种网络层协议。

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232020482.gif)

运行Novell IPX协议的两个子网Group 1和Group 2分别在不同的城市，通过使用GRE隧道可以实现跨越广域网的VPN

GRE工作在第三层，网络层，有些层级比较低的协议也就能支持传递了。



#### 配置GRE隧道

配置GRE隧道，非常简单

![image-20230923204554417](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232045488.png)

在双方的`Interfaces`中新建一个GRE-Tunnel，然后填入对方的地址和密码（需要取消`Allow Fast Path`）

然后在`IP-Address`中给GRE端口新增一个IP

![image-20230923204904376](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232049413.png)

测试ping结果，已经连通了，非常简单

![image-20230923204955819](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232049867.png)



## OSPF

正常来说，两边通过GRE建立了连接，但是两边的路由情况是未知的，左边网络是不知道右边网络是什么样的，想要互相知晓，就需要有一个东西可以自动学习对方的网络拓扑结构，并补足自身的网络信息，从而达到组网的效果。



给双方设置`Router-Router ID`，ID值双方不同，并且只勾选静态

![image-20230923205456368](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232054399.png)



`OSPF-Instances`中新建，Router ID选择刚才建立的

![image-20230923205741332](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232057360.png)

`OSPF-Areas`中添加Area，默认设置即可

![image-20230923210013390](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232100418.png)

`OSPF-Interface Templates`中添加需要宣告的网络`10.255.255.0/24 10.1.0.0/24` ，想要组网后一个是本地的lan网络

![image-20230923210236731](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232102763.png)

正常的情况下就能看到如下，接口已经宣告成功了

![image-20230923230537417](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232305486.png)

如果正常就可以看到OSPF中，Neighbors中有对方宣告的端口了

![image-20230923230608296](https://img.elmagnifico.tech/static/upload/elmagnifico/202309232306326.png)

实际测试发现无法发现对方，组网失败，怀疑是Interface没有出现`bdr`标志，也就是宣告端口没有做广播，原因就不知道了。



## 静态组网

GRE 如果不配合OSPF，那可以配合静态路由进行组网

![image-20230924002030647](https://img.elmagnifico.tech/static/upload/elmagnifico/202309240020709.png)

分别在双方的路由表里加上对方的lan网络，端口就选择GRE的端口就行了

- 注意关闭ZeroTier，否则会有路由冲突



## RIP

RIP协议（Routing Information Protocol，路由信息协议）是内部网关协议IGP中最先得到广泛使用的协议。RIP是一种分布式的基于距离矢量的路由选择协议，是因特网的标准协议，RIP最大的优点是实现简单，开销较小。相比OSPF，RIP的缺点较多。

- RIP限制了网络的规模，能使用的最大距离为15（16表示为不可达）。
- 路由器交换的信息是路由器的完整路由表，随着网络规模的扩大，开销也就增加。
- “消息传播得慢”，使更新过程的收敛时间过长。所以规模较大的网络就应当使用OSPF协议。在规模较小的网络中，使用RIP协议的仍占多数。



**RIP与OSPF的区别**
1、适用范围不同，RIP适用于中小网络，比较简单。没有系统内外、系统分区，边界等概念。

OSPF适用于较大规模网络。它把自治系统分成若干个区域，通过系列内外路由的不同处理，区域内和区域间路由的不同处理方法，减少网络数据量大传输。

2、运行有区别，RIP运行时，首先向外发送请求报文，其他运行RIP的路由器收到请求后，马上把自己的路由表发送过去，在没收到请求时，会将路由删除，并广播自己新的路由表。

OSPF要求每个路由器周期性的发送链路状态信息，使得区域内所有路由器最终都能形成一个跟踪网络链路状态的链路状态数据库。利用链路状态数据库，每一个路由器都可以以自己为“根”，建立一个最短路径优先树，用来描述以自己出发，到达每个目的网络所需的开销。

3、使用情况不同，OSPF占用的实际链路带宽比RIP少，OSPF使用的CPU时间比RIP少，OSPF适用的内存比RIP大，RIP在网络上达到平衡用的时间比OSPF多。

总的来说能用OSPF就别用RIP，只是RIP配起来比较简单而已



## DDNS

由于GRE需要对方的公网IP，所以RouterOS能跑一个DDNS最好



RouterOS 7 新增了一个`IP-Cloud-DDNS`选项，开启以后就可以免费获得DDNS

![image-20230924003205463](https://img.elmagnifico.tech/static/upload/elmagnifico/202309240032499.png)

GRE中直接使用对方的DDNS域名即可直接组网了，方便了很多。



## Summary

网络问题真难搞啊



## Quote

> https://www.cloudflare.com/zh-cn/learning/network-layer/what-is-gre-tunneling/#:~:text=GRE%20%E6%98%AF%E4%B8%80%E7%A7%8D%E5%B0%86,LAN%EF%BC%89%E4%B9%8B%E9%97%B4%E5%BB%BA%E7%AB%8B%E8%BF%9E%E6%8E%A5%E3%80%82
>
> https://www.77bx.com/231.html
>
> https://blog.csdn.net/m0_73995538/article/details/131115178


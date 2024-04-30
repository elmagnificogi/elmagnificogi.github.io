---
layout:     post
title:      "RouterOS配置多WAN并根据IP分流"
subtitle:   "隔离,融合"
date:       2024-03-19
update:     2024-04-30
author:     "elmagnifico"
header-img: "img/bg4.jpg"
catalog:    true
tobecontinued: false
tags:
    - RouterOS
    - Mikrotik
    - Network
---

## Foreword

两路电信宽带接入，做一个网络分流，能访问同一个内网，但是外网隔离开。这样就可以轻易把一些可能会有问题的客户端都放到另外一个公网域中，主网中就不会有问题被人骚扰了



## 多WAN

先配置双WAN口

![image-20240319145449941](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191454041.png)

新建一个pppoe拨号，接口选择新WAN口所在的以太网口

![image-20240319155714148](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191557588.png)

填写账号密码，此处需要注意默认路由距离改为2，WAN1的距离是1，如果有更多线，依次增多

![image-20240319155546805](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191555845.png)

可能此时会提示`Client is on slave interface` 这是因为ether2还桥接在WAN上呢

![image-20240319155301455](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191553493.png)

桥接中取消ether2的桥接，现在WAN2是独立口了，稍微等一会slave的提示就消失了

到这里其实WAN2已经可以了，插上光猫的线，此时可以看拨号的log，如果一直提示错误，可以重启一下光猫，就能看到已经可以正常拨号连接了



同理，建立WAN3即可，有些变量对应增加即可



## IP分流

这里通过mangle进行分流



首先进入Routing-Tables中新建一个路由表

![image-20240319155919043](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191559070.png)

勾上FIB



进入IP-Route List

![image-20240430154246735](https://img.elmagnifico.tech/static/upload/elmagnifico/202404301542787.png)

路由中新建一个静态表，网关选择刚才的pppoe-out2，下面的路由表选择刚才新建的表，注意这里的Distance建议+1，变成2



![image-20240319160250672](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191602700.png)

默认的NAT伪装是只给WAN口的，现在是双WAN口了，所以要去掉这个限制



![image-20240319160525134](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191605178.png)

由于要允许内网访问，所以这里先新建一个Mangle，Firewall-Mangle，允许当前子网范围进行访问

![image-20240319172124176](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191721217.png)



到这里总算是可以设置最终目标了，比如让这个ip的所有流量走向WAN2，这里设置他的路由标记到新路由表即可

![image-20240319182318265](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191823312.png)

更进一步，可以通过地址列表Firewall-Address Lists，将需要的IP都加进列表里，然后一个规则就能把所有ip处理了



## 多线分流

主要是为了访问不同网络时自动选择最优路线，不是为了隔离的分流模式

> https://www.bilibili.com/read/cv30033107/



## 专线固定IP

固定IP都是直接分配IP的，也就不存在拨号等情况，所以要配置静态IP



先把专线网口断开桥接，这里是etner4-CMDL

![image-20240430152205605](https://img.elmagnifico.tech/static/upload/elmagnifico/202404301522808.png)



配置静态IP

![image-20240430152356760](https://img.elmagnifico.tech/static/upload/elmagnifico/202404301523818.png)



### 分流

分流和多线分流内容相同，但是做完以后还有额外2项需要添加

![image-20240430152548340](https://img.elmagnifico.tech/static/upload/elmagnifico/202404301525401.png)

增加一条静态路由，让系统知道有专线这个端口和main连起来，注意Distance要对应增加

![image-20240430154501681](https://img.elmagnifico.tech/static/upload/elmagnifico/202404301545727.png)

防火墙的NAT这里，需要单独给专线增加一个，之前使用的是all_ppp，也就是所有pppoe端口，这里指定出地址给ether4端口



剩下只需要在Adress Lists中添加需要走专线设备的IP即可



## WAN性能Debug

双WAN以后发现一个小问题，好像千兆跑不满了，任何一条单路千兆跑不满

经过技术支持的Debug，发现问题在于我之前设置的raw路由规则占据了大部分的cpu占用，导致实际1000M根本跑不满



性能Debug

![image-20240319182641034](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191826082.png)

首先是查看CPU占用，System-Resources，很明显网速测试的时候CPU接近100%了，而且4核都跑满了，直接导致网速跑不上去。



然后就是看为什么CPU跑满了，具体哪里非常吃性能

![image-20240319182820882](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191828923.png)

可以通过Tools-Profile工具，看到具体CPU是跑哪种任务消耗最多，实测中看到firewall占用最多。

那么就开始排除firewall中什么规则导致了cpu占用



![image-20240319183104192](https://img.elmagnifico.tech/static/upload/elmagnifico/202403191831230.png)

当把Raw规则中用来屏蔽windows更新的规则去掉以后，整个网速立马就上去了。

仔细看了下这个Raw基本就是基于封包底层的过滤，是要明文解析的匹配文本的，当流量一上去以后，每个包都要走8遍这个过滤，自然就非常慢了。

所以Raw规则是只有没有其他办法的情况下，不得不通过这种方式调用，才使用的，不然不推荐使用Raw过滤。



这种基于域名的过滤，也可以把域名加入到地址列表中，然后在Filter中直接对目标地址进行过滤就行了，这样不影响性能



## Summary

难得遇到一个比较细的技术支持，之前总遇到半桶水，各种问题一知半解。



## Quote

> https://wiki.edcwifi.com/index.php?title=RouterOS_%E6%BA%90%E5%9C%B0%E5%9D%80%E7%AD%96%E7%95%A5%E8%B7%AF%E7%94%B1
>
> https://www.bilibili.com/read/cv30033107/


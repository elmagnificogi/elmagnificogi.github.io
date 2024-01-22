---
layout:     post
title:      "RouterOS的一些基础配置指南"
subtitle:   "CAPsMAN,NStream,Bridge,Mikrotik,Roaming"
date:       2023-08-30
update:     2023-09-06
author:     "elmagnifico"
header-img: "img/y7.jpg"
catalog:    true
tobecontinued: false
tags:
    - RouterOS
    - Mikrotik
    - Network
---

## Foreword

记录一些折腾RouterOS时遇到过的奇奇怪怪的问题



RouterOS的工业设计水平很渣，但是流畅度max



## 基础配置

RouterOS的一些知识库，可以参考这里

> https://mp.weixin.qq.com/mp/homepage?__biz=MzIwOTIzMzA4OQ==&hid=4&sn=26ae13d6e36d090c7377faddfb70cdd9&scene=18



#### 桥接Fit AP模式

> https://docs.qq.com/doc/DYmdPcWRVU2hhcGty



#### 拨号路由

> https://docs.qq.com/doc/DYmV3a296Z1BrY0lS



#### 端口隔离

> https://wiki.edcwifi.com/index.php?title=Bridge_%E5%AE%9E%E7%8E%B0%E4%BA%8C%E5%B1%82%E7%AB%AF%E5%8F%A3%E9%9A%94%E7%A6%BB



#### 端口映射

IP-Firewall-NAT中，选择`dstnat`，选好协议和目的端口，入口是外网端口也就是ppppoe，然后Action中也是`dst-nat`，转发到内网的目标地址和目标端口

![image-20230906142952380](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20230906142952380.png)

这种方式被称为无回流模式，其实就是说在内网环境中直接用外网地址和IP访问会出现无法访问的情况，但是外网直接访问是可以的

- 如果想要外网可以正常访问，设置一下`Dst. Address`为公网IP即可



## 发射功率

发射功率这个实际测试，似乎不是很理想，翻看了多篇官方帖子，说的都不是很明白。

最后不如直接换小db的天线或者是直接上金属屏蔽罩来的快

> https://wiki.mikrotik.com/wiki/Manual:Wireless_FAQ#What_TX-power_values_can_I_use?



## 网桥

这种方式的网桥是基础网桥，也就是常见的无线中继，大多数无线路由器都具备这功能。

> https://docs.qq.com/doc/DYkZCRXl1c09JUEpz

还有专业的网桥模式和网桥协议，适合超远距离的网络传输



## WireGuard

组网必备

> http://www.irouteros.com/?p=1690
>
> https://help.mikrotik.com/docs/display/ROS/WireGuard



## CAPsMAN配置

CAPsMA基本就是RouterOS最接近AC的管理模式了，还有一个监控的关键软件那就是The Dude，不过dude还是以监控为主。



> https://mp.weixin.qq.com/s?__biz=MzIwOTIzMzA4OQ==&mid=502469133&idx=1&sn=a2aee8e5b1a8e58292a9eb5e83aace53&scene=19#wechat_redirect

使用CAPsMAN也有以下几点要注意

- 使用CAPsMAN最好都是同版本，否则可能会有兼容性问题
- WIFI Wave2和普通WIFI 5 是无法通用一个CAPsMAN的，各管各的，不能跨模式
- CAPsMAN中的DFS设置后，需要扫描一段时间后才能下发配置，刚开始用看起来就像没配置上

基本所有AP设置了DFS，都会出现启动以后可能对应的SSID并没有被辐射出来，因为实际需要几分钟扫描DFS信道，确认干净以后才能实际使用。当然也会出现使用过程中发现有雷达或者其他什么东西使用了DFS，而出现避让切换信道的情况，看起来就像所有设备同时掉线了。



### CAPsMAN和漫游相关问题

> https://mum.mikrotik.com/presentations/CN19/presentation_7181_1571792982.pdf

简单说官方没有任何关于CAPsMAN是可以漫游的说明，但是从普遍测试的结果来看，实际CAPsMAN，在切换地点的时候，是明显可以降低丢包的的程度的，好的情况下是可以0丢包的。



真正的漫游，应该是从支持 Wifi Wave2的设备开始，有了802.11 K、R协议以后才有可能支持漫游。



### CAPsMAN自动剔除低信号客户端

> https://timigate.com/2018/10/use-mikrotik-capsman-to-manage-all-access-points-and-enable-roaming.html



### Wave2 成功漫游

成功的参考对象，就是需要hAP ax3的新设备，老设备不太行

> https://forum.mikrotik.com/viewtopic.php?t=199764



成功漫游的log

```
0C:C6:FD:XX:XX:XX@distant-AP-wifi-2G roamed to 0C:C6:FD:XX:XX:XX@closer-AP-wifi-5G, signal strength -66
```



失败的漫游

```
0C:C6:FD:XX:XX:XX@distant-AP-wifi-5G disconnected, connection lost, signal strength -92
0C:C6:FD:XX:XX:XX@closer-AP-wifi-5G connected, signal strength -75
```



## 疑难问题



#### 无法发现设备

cAP XL ac 这种类型的设备，是专门用来给酒店或者医院、学校使用的，所以他有一入，一出的POE，而入口的POE这里默认情况下开启了防火墙，规则里设置了不允许从Eth1口发现设备，所以怎么都看不到。反而是无线可以发现设备，他的设计是串联使用的，所以Eth2口出来的可以发现设备。

遇到这种无法发现设备的，一般都是开启了防火墙，并且设置了对应的规则，取消就能正常发现设备了



还有一种情况，发现设备使用的端口被其他程序占用了。

大概率是打开了迅雷，迅雷会占用winbox用来寻找ap的端口，导致winbox无法正常工作(关闭迅雷，可能还有残留程序存在)

简单说就是打开任务管理器，结束所有以`Thunder`开头的程序，然后重新打开winbox就可以了，准确说就是`ThunderPlatform`进程导致的



#### winbox无法账号密码登录

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202208051749589.png)

将WinBox中的`Legacy Mode`打勾即可



#### 登录密码错误

![image-20230830215255966](https://img.elmagnifico.tech/static/upload/elmagnifico/202308302152025.png)

默认账号是admin，密码是空，但是hAP等设备不同，他们默认密码是不一样的，记录在硬件的抽拉信息块里，每次重置以后都会恢复这个密码



#### 国家不能切换

经常遇到国家是`etsi`的情况下，无法切换国家的问题

![image-20230830212419985](https://img.elmagnifico.tech/static/upload/elmagnifico/202308302124021.png)

这种是由于在快速向导的设置界面，有Bug，只要切换了就会自动切回来。

要正确修改国家可以去`Wireless`中单独对射频端口设置国家



#### DHCP关不干净

有时候直接把DHCP服务关闭，并不一定真的能关掉，最好直接把DHCP直接删掉，包括IP池也是，否则很容易出现DHCP ip依然在使用。



## Summary

还有更多需要设置的东西，还会继续补充完善



## Quote

> https://forum.mikrotik.com/viewtopic.php?t=188815
>
> https://timigate.com/2018/10/use-mikrotik-capsman-to-manage-all-access-points-and-enable-roaming.html
>
> https://forum.mikrotik.com/viewtopic.php?t=199764

---
layout:     post
title:      "树莓派无线网卡节能模式BUG"
subtitle:   "Wlan，power_save off"
date:       2019-10-16
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.png"
catalog:    true
tags:
    - RaspberryPi
---

## Forward

最近一直调试网络，一直有一个诡异情况无法解。

为了解这个问题，基本把无线网络看了个遍，最后发现是树莓派驱动的问题。

## 情况

树莓派被设定，一秒只发一个udp包，并且字节数也只有100多。

但是在接收端看到的结果就是，树莓派老是会莫名其妙掉线，而这个现象，在把树莓派的发包频率提高到了5hz的时候基本不出现了，只要频率一降低，掉线就一定会出现。

通过ping对应的ip，发现延迟不稳定，时高时低。

## 排解

首先最容易考虑的就是网络有问题，当时一个wifi下面带了100个客户端，很可能被撑爆了？

- 减少客户端数量，感觉好像有缓解的样子，但是实际上还是不断掉线
- 更换AP设备，无效
- 原本使用的是5G，802.11n协议，怀疑协议有问题，切换到a，ac，情况相同

通过抓包呢，确定应用程序没问题，该发的包都发出去了，但是回包的时候就不一定了

这个现象呢，又能用一个东西来解释，当然是我自己的想法。

#### ARP

首先ip需要被解析成对应的mac地址，然后才能进到二层去传输这个报文，那么如果是pc这边的ARP有问题，就会导致每次PC发包，都要重新去寻找对应IP的MAC地址，而在ARP的初次寻址时，其实发送的是一条广播报文，那么有可能是这个广播报文有问题？

只有一个设备的时候，发送广播绝对没问题，多个设备的时候可能会出现泛洪或者什么其他的问题，但是我们目前一个设备也会出问题，排除

由于每次都要ARP广播的话，那么相当于这个延迟就比较高，可能会造成Ping包延迟不稳定。

那这个现象要怎么解释呢，ARP由于错误的设置，导致ARP的MAC表，小于0.2s就会自动失效，导致每次都要重新寻MAC。

首先查找windows下arp更新时间

```
netsh interface ipv4 show interfaces 1(这个值是对应的网口)
```

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/lSfTFEJOu3rYZ7o.png)

可以看到这里是36s，所以arp这里有问题基本不可能，windows的arp更新时间大概是15-40s，是一个随机值，所以会出问题的可能性还是比较小的。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/jkhZDYIlge7QXor.png)

然后从抓包中，也单独查看了arp包，arp在查询未知ip时发的是广播，但是当他需要维护当前arp表的时候，他是直接询问已经记录的mac地址，然后等ack，如果有ack了，这个mac时间就刷新，否则就失效或者是继续问。

arp包呢，在路由或者交换里又是一个特殊报文，他是被cpu处理的，而不是走正常转发芯片，所以会占用cpu，如果ARP类型的报文比较多的话，相当于交换机的cpu占用率会比较高。

有些比较牛逼的AP里会自带ARP代理或者类似的服务，由于他们本身已知当前ip和mac的对应关系，所以部分ARP包可以由AP直接回复，而不需要再通过无线传输给客户端，然后再回传等等，相当于减轻了无线网络的占用，从而提高了效率。

当然ARP代理也会有一些问题，比如arp攻击或者什么的，比较常听说。

#### MAC表

既然ARP没问题，那么还有一个MAC表也有可能出现问题，这个MAC表就是路由或者交换中的MAC表，专门用来记录并转发的核心MAC表

如果这个MAC表的老化时间是小于0.2的，那么就也会出现类似ARP的情况下，每次转发都需要重新寻找MAC。

还有一个可能就是MAC表过小，导致记录不全，每次都被来回更新。

经过查询，MAC表的大小是4K，绝对不可能记录补全，然后MAC的老化时间基本都是在300s以上，小于这个时间的很少。

最关键的是当没有交换机的情况下，pc直连，这个现象依旧，说明不是MAC的问题。

#### 802.11n帧聚合

在这种情况下，怀疑AP中可能会有类似于包太小，或者缓冲太大，导致每次包并没有真的发出去，这个时候又突然想起来802.11n协议中新增了一些特性，比如帧聚合。

简单说就是如果此时有多个小包的情况下，如果多次占用信号并发送，会造成信道的无端浪费，而如果可以把小包合并在一起发送，那么显然可以节省很多信道资源。由于协议中同时也需要对每个包回ack，自然也有了对应的集合ACK的机制，Block Ack，一次性对之前多个报文块进行回复，进一步节省带宽。

有没有这种可能呢，由于发包太快，导致包都拥挤在一起发，从而导致部分包延迟了。

首先从pc发出去的包，虽然间隔非常短，大概只有15us-30us的样子，但是每个包的目的ip都是不一样的，不可能聚合在一起发。

从客户端发的包呢，由于只有一个包，那更不可能等若干秒后的几个包一起发。并且从抓包看到的到达时间，是不一致的，同时发的一对包时间上比较接近，而不同时的也很明显。

#### udp flood

当到这个时候，已经没啥头绪了，只能想怀疑啥怀疑啥，自然怀疑是不是pc发包速率过高，导致防火墙判定是在进行udp flood攻击呢？然而从头到尾的测试，pc的防火墙就是关的，而AP上没有相关设置，并且一个包也会有问题，基本可以排除这个可能

#### 骚操作

既然，只有树莓派发包频率在5hz才能稳定，如果反其道而行之，如果我主动给树莓派发包，让他达到5hz，是不是也能行呢？普通可能要改应用发送的频率，再附带上ack，然后我这里操作了一下。

我开了5个ping，5个ping本质上都需要树莓派进行回报。这个时候就发现，开始一个ping的时候延迟会跳，而当有5个ping的时候，反而稳定了，延迟不跳了，并且客户端还不掉线了？？？？？

所有的东西都怀疑完了，就剩树莓派自身了，怀疑树莓派可能由于省电，会0.2s没信息直接休眠？？但是我本身非常怀疑，0.2s就休眠基本不可能，谁家的wifi休眠时间也得是s级别的，怎么可能那么小呢，而且wifi应该还会定时唤醒来保持网络连接什么的，这些个机制不可能设置的那么弱智吧。

## 树莓派问题

首先查看树莓派的网络设置,然后啥也没看出来。

```
ifconfig

lo        Link encap:Local Loopback  
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:261 errors:0 dropped:0 overruns:0 frame:0
          TX packets:261 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1 
          RX bytes:21188 (20.6 KiB)  TX bytes:21188 (20.6 KiB)

wlan0     Link encap:Ethernet  HWaddr 0c:8c:24:c5:11:e7  
          inet addr:172.16.4.187  Bcast:172.16.255.255  Mask:255.255.0.0
          inet6 addr: fe80::506:a88a:f1a8:618b/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:85 errors:0 dropped:23 overruns:0 frame:0
          TX packets:94 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000 
          RX bytes:14479 (14.1 KiB)  TX bytes:13718 (13.3 KiB)
```

换一个方式来看

```
iwconfig

lo        no wireless extensions.

wlan0     IEEE 802.11bgn  ESSID:"xxxxxxx"  Nickname:"<WIFI@REALTEK>"
          Mode:Managed  Frequency:2.437 GHz  Access Point: 0C:4B:54:1C:64:C5   
          Bit Rate:300 Mb/s   Sensitivity:0/0  
          Retry:off   RTS thr:off   Fragment thr:off
          Power Management:off
          Link Quality=100/100  Signal level=100/100  Noise level=0/100
          Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0
          Tx excessive retries:0  Invalid misc:0   Missed beacon:0
```

然后这里有一个大大的 power management：off 这说明这个电源管理是关的啊，讲道理应该没有问题的。

但是呢，我当时通过iwconfig的其他命令时，我发现好像这个命令有错，比如我看一个ssid对应用了什么协议，我就发现，这个协议和我在ap上设置的协议完全不对，所以我怀疑iwconfig信息可能有误。那么这里的power可信度不高。所以我转而去查了是否还有其他的命令用来显示wifi相关的内容。

查了半天，发现好像iwconfig基本被弃用了？多数都是用iw了

```
iw dev wlan0 get power_save 
Power save: on
```

这就很明显了，这个是处于节电状态，然后修改这个设置，来试试看效果

```
sudo iw dev wlan0 set power_save off
```

改完以后，ping延迟全部稳定的了，最明显的就是ssh的时候不会出现卡顿的情况了，之前ssh到树莓派的时候会发现一卡一卡的，但有时候又很流畅。

由此可以确定是树莓派的wifi节能导致树莓派网络会在无流量的情况下快速进入休眠状态，这个快速是小于0.2s的

而树莓派的节能问题或者电源管理问题，貌似一直都有bug，再加上这个树莓派是老版本，树莓派2的年代，镜像什么的也都是老的了，所以有问题不奇怪吧，但是这个问题debug了好几天啊。

通过这里设置的power_save 并不会影响iwconfig中的显示，那里一直显示off模式。

如果去查这个问题，还有不少解释和一劳永逸的办法，但是在我这里基本都不生效，最实用的办法就是直接在启动的rc.local里加上关闭节电模式。

## The end

找这个沙雕问题，浪费了这么多时间，各种改程序，各种测试设备，而在最后一步的时候如果不怀疑iwconfig的显示的话，那估计就和电源问题擦肩而过了，那想再找到这个问题就非常难了。

如果不对这个显示的效果怀疑而是直接相信了，那多半这个问题是解不了了。由于树莓派wifi本身从省电模式切到了高效模式，直接就导致整体功耗提高了1W

## Quote

> https://superuser.com/questions/1345144/what-is-the-default-cache-refresh-rate-of-windows-8-and-ubuntu
>
> https://blog.csdn.net/sky619351517/article/details/84858757
>
> https://www.raspberrypi.org/forums/viewtopic.php?t=139407
>
> https://askubuntu.com/questions/85214/how-can-i-prevent-iwconfig-power-management-from-being-turned-on
>
> https://raspberrypi.stackexchange.com/questions/96606/make-iw-wlan0-set-power-save-off-permanent
>
> https://unix.stackexchange.com/questions/269661/how-to-turn-off-wireless-power-management-permanently





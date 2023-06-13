---
layout:     post
title:      "OpenWrt开启NTP同步"
subtitle:   "时间，Date"
date:       2023-06-13
update:     2023-06-13
author:     "elmagnifico"
header-img: "img/y1.jpg"
catalog:    true
tobecontinued: false
tags:
    - OpenWrt
---

## Foreword

局域网内的设备没有RTC时钟，同时也想要正确的时间，只能依赖于时间同步服务了。所以尝试使用局域网内搭建NTP服务器，让客户端访问并更新时间



## NTP



#### Win10开启NTP服务

修改注册表

```
HKEY_LOCAL_MACHINE-SYSTEM-CurrentControlSet-Services-W32Time-TimeProviders-NtpServer
```


将`NtpServer`项的右侧键值`Enablied`，将默认的0改为1，1为启用NTP服务器



```
HKEY_LOCAL_MACHINE-SYSTEM-CurrentControlSet-Services-W32Time-Config
```

将`Config`项的右侧键值`AnnounceFlags`，将默认的10改为5，将自身设置为可靠时钟源



重启`Windows Time`服务



如果对外访问的话，需要在高级防火墙设置中开放udp端口123



#### OpenWrt开启NTP服务端

```
uci set system.ntp.enable=1 
uci commit system
```

重启ntp或者系统重启

```
/etc/init.d/sysntpd restart
```



#### 测试

```
w32tm /stripchart /computer:127.0.0.1
```

看到如下显示，说明服务已经开启了

```
C:\Users\elmag>w32tm /stripchart /computer:127.0.0.1
正在跟踪 127.0.0.1 [127.0.0.1:123]。
当前时间是 2023/6/13 14:35:03。
14:35:03, d:+00.0003226s o:+00.0000873s  [                           *                           ]
14:35:05, d:+00.0008730s o:+00.0001674s  [                           *                           ]
```



#### NTP服务端同步

使用ntpd指定地址进行时间同步

```
ntpd -n -d -p 172.16.200.1
```



如果开启后台自动同步，需要这样或者默认开启系统的同步服务

```
ntpd -p 172.16.200.1
```



修改系统配置

```
vi /etc/config/system 
```

ntp同步服务器中加入自定义的windows服务器

```
config system
        option hostname 'OMEGA'
        option timezone 'CST'
        option ttylogin '1'
        option log_size '64'
        option urandom_seed '0'

config timeserver 'ntp'
        option enabled '1'
        option enable_server '0'
        list server '172.16.200.1'
        list server '0.openwrt.pool.ntp.org'
        list server '1.openwrt.pool.ntp.org'
        list server '2.openwrt.pool.ntp.org'
```



## OpenWrt同步问题

现在就出现了，已经看到ntpd同步了，但是系统的date时间依然是错误的

有一种说法是系统时区不正确，导致的不能同步，但是这里是正确的，都切换到了`CST`

还有一说要5分钟才能同步，根本不可能，半小时都没同步



## Summary

NTP服务暂时还用不起来



## Quote

> https://www.cnblogs.com/pipci/p/14672772.html
>
> https://blog.csdn.net/hzlarm/article/details/109765246
>
> https://forum.openwrt.org/t/solved-ntp-not-working/132671/6

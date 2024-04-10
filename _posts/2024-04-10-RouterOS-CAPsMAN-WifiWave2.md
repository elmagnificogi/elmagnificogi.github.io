---

layout:     post
title:      "RouterOS WifiWave2 配置CAPsMAN"
subtitle:   "wifi5，wifi6，wifi7"
date:       2024-04-10
update:     2024-04-10
author:     "elmagnifico"
header-img: "img/x2.jpg"
catalog:    true
tobecontinued: false
tags:
    - RouterOS
    - Mikrotik
    - Network
---

## Foreword

RouterOS的CAPsMAN一直非常难用，要配置的东西很多，自从RouterOS 开始搞Wave2，CAPsMAN就分化成了2种，就变得更难用了。

从RouterOS 7.13开始，总算是支持同时存在2种CAPsMAN了，一种老的WIFI4、WIFI5，另外一种WIFI5 Wave2和WIFI6



## CAPsMAN配置

CAPsMAN的好处是任何Mikrotik的设备都可以作为AC使用，Wave2的设备必须要安装Wave2的包才能使用，否则只支持Wifi5的老设备，也就是Wave1



#### AC端/CAPsMAN端

CAPsMAN端配置比较复杂，他需要下发配置文件，所以所有Wifi的配置都需要在这里进行设置



```bash
#create a security profile
/interface wifiwave2 security
add authentication-types=wpa3-psk name=sec1 passphrase=HaveAg00dDay
 
#create configuraiton profiles to use for provisioning
/interface wifiwave2 configuration
add country=Latvia name=5ghz security=sec1 ssid=CAPsMAN_5
add name=2ghz security=sec1 ssid=CAPsMAN2
add country=Latvia name=5ghz_v security=sec1 ssid=CAPsMAN5_v
 
#configure provisioning rules, configure band matching as needed
/interface wifiwave2 provisioning
add action=create-dynamic-enabled master-configuration=5ghz slave-configurations=5ghz_v supported-bands=\
    5ghz-n
add action=create-enabled master-configuration=2ghz supported-bands=2ghz-n
 
#enable CAPsMAN service
/interface wifiwave2 capsman
set ca-certificate=auto enabled=yes
```





#### AP端/CAP端

CAP端比较简单，建议直接Reset，然后使能CAP和keep users，重启以后就进入CAP模式了，其他倒是不需要怎么配置



```bash
#enable CAP service, in this case CAPsMAN is on same LAN, but you can also specify "caps-man-addresses=x.x.x.x" here
/interface/wifiwave2/cap set enabled=yes
 
#set configuration.manager= on the WifiWave2 interface that should act as CAP
/interface/wifiwave2/set wifi1,wifi2 configuration.manager=capsman-or-local
```



## Summary

Mikrotik不争气啊，落后别人2个大版本了



## Quote

> https://help.mikrotik.com/docs/pages/viewpage.action?pageId=46759946#WifiWave2(7.12andolder)-WifiWave2CAPsMAN

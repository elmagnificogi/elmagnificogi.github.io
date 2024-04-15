---

layout:     post
title:      "RouterOS WiFiWave2 配置CAPsMAN"
subtitle:   "WiFi5，WiFi6，WiFi7，漫游"
date:       2024-04-10
update:     2024-04-12
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

从RouterOS 7.13开始，总算是支持同时存在2种CAPsMAN了，一种老的WiFi4、WiFi5，另外一种WiFi5 Wave2和WiFi6



7.13之后，所有WiFI都叫WiFi了，不再区分Wave2了，同样的扩展包直接叫qcom，高通了

![image-20240412125115374](https://img.elmagnifico.tech/static/upload/elmagnifico/202404121251454.png)

7.12之前的版本，WiFi是区分Type的，之前都叫Wave2，并且升级包也是同名

![image-20240412125158324](https://img.elmagnifico.tech/static/upload/elmagnifico/202404121251353.png)

7.12以下的固件要先升级到7.12，才能升级到7.13以后的版本，否则无法直接跨越式升级



## CAPsMAN配置

CAPsMAN的好处是任何Mikrotik的设备都可以作为AC使用，Wave2的设备必须要安装Wave2的包才能使用，否则只支持WiFi5的老设备，也就是Wave1



### 7.12前设置方式

以下是7.12前的设置方式



#### AC端/CAPsMAN端

CAPsMAN端配置比较复杂，他需要下发配置文件，所以所有WiFi的配置都需要在这里进行设置



```bash
#create a security profile
/interface WiFiwave2 security
add authentication-types=wpa3-psk name=sec1 passphrase=HaveAg00dDay
 
#create configuraiton profiles to use for provisioning
/interface WiFiwave2 configuration
add country=Latvia name=5ghz security=sec1 ssid=CAPsMAN_5
add name=2ghz security=sec1 ssid=CAPsMAN2
add country=Latvia name=5ghz_v security=sec1 ssid=CAPsMAN5_v
 
#configure provisioning rules, configure band matching as needed
/interface WiFiwave2 provisioning
add action=create-dynamic-enabled master-configuration=5ghz slave-configurations=5ghz_v supported-bands=\
    5ghz-n
add action=create-enabled master-configuration=2ghz supported-bands=2ghz-n
 
#enable CAPsMAN service
/interface WiFiwave2 capsman
set ca-certificate=auto enabled=yes
```



##### UI版教程

![image-20240411095936505](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110959534.png)

新建一个Datapath



![image-20240411095523524](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110955570.png)

新建一个配置，国家可以选`United States Minor Outlying Islands`，射频功率会大一些，同理2.4G也建立一个一样的配置

![image-20240411095830539](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110958579.png)

频段设置，跳过DFS

![image-20240411095851800](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110958833.png)

配置密码

![image-20240412190025157](https://img.elmagnifico.tech/static/upload/elmagnifico/202404121900256.png)

这个一定要开，这是快速漫游的选项

- 有些设备可能漫游有问题，会在高低信号强度之间来回切换，导致实际体验变差，此时需要关闭



![image-20240411170738453](https://img.elmagnifico.tech/static/upload/elmagnifico/202404111707534.png)

正常启用的话可以看到设备漫游到另外一个设备上



![image-20240411095914582](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110959614.png)

选择刚才的Datapath

![image-20240411100002614](https://img.elmagnifico.tech/static/upload/elmagnifico/202404111000653.png)

添加一个Provisioning，配置支持的带宽，Action决定这个射频上线以后是开启还是关闭，选开启就行了，同理2.4G也要有一个



![image-20240411100345798](https://img.elmagnifico.tech/static/upload/elmagnifico/202404111003831.png)

AC管理端的开启CAPsMAN是在Remote CAP里，而不是在WiFi Wave2里，一定要区分清楚，这里开启即可

![image-20240411100255177](https://img.elmagnifico.tech/static/upload/elmagnifico/202404111002219.png)

正常的话，就可以看到远端射频一个个加入了

![image-20240411100440543](https://img.elmagnifico.tech/static/upload/elmagnifico/202404111004632.png)

WiFi Wave2中就可以看到具体射频的配置



##### 快速升级

![image-20240411101238114](https://img.elmagnifico.tech/static/upload/elmagnifico/202404111012172.png)

CAPsMAN本身对版本有要求，管理端这里可以快速给不同版本进行升级，这就很方便，不用一个个重传升级包了



#### AP端/CAP端

CAP端比较简单，建议直接Reset，然后使能CAP和keep users，重启以后就进入CAP模式了，其他倒是不需要怎么配置



```bash
#enable CAP service, in this case CAPsMAN is on same LAN, but you can also specify "caps-man-addresses=x.x.x.x" here
/interface/WiFiwave2/cap set enabled=yes
 
#set configuration.manager= on the WiFiWave2 interface that should act as CAP
/interface/WiFiwave2/set WiFi1,WiFi2 configuration.manager=capsman-or-local
```



##### UI版教程

![image-20240411092431763](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110924853.png)

首先在需要CAP的WiFi接口上设置管理为capsman

![image-20240411092543245](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110925298.png)

Datapath中新建一个配置，主要是桥接配置

![image-20240411092622398](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110926442.png)

回到主界面，启动CAP，发现接口为桥接，Datapath选刚才的，即可



更简单的做法：

![image-20240411092714844](https://img.elmagnifico.tech/static/upload/elmagnifico/202404110927877.png)

直接适用默认的CAPS Mode 就直接配好了



### 7.12后的设置方式

需要安装2个安装包

![image-20240412215219563](https://img.elmagnifico.tech/static/upload/elmagnifico/202404122152600.png)

然后就有两个WiFi设置

![image-20240412215400414](https://img.elmagnifico.tech/static/upload/elmagnifico/202404122154441.png)

看着非常奇怪，只能说UI统一上还没做好吧，上面的是Wave2，下面的是老的WiFi5的模式

![image-20240412215205644](https://img.elmagnifico.tech/static/upload/elmagnifico/202404122152738.png)

两种WiFi模式都正常加进来管理了



老的CAPsMAN参考

> https://mp.weixin.qq.com/s?__biz=MzIwOTIzMzA4OQ==&mid=502469133&idx=1&sn=a2aee8e5b1a8e58292a9eb5e83aace53&scene=19#wechat_redirect



## 疑难杂症

iPhone IOS 16.x版本，会出现无法正常搜索到WiFi，此问题暂时无解，必须要通过升级版本才能搜索到WiFi



## Summary

Mikrotik不争气啊，落后别人2个大版本了



## Quote

> https://help.mikrotik.com/docs/pages/viewpage.action?pageId=46759946#WiFiWave2(7.12andolder)-WiFiWave2CAPsMAN
>
> https://forum.mikrotik.com/viewtopic.php?t=199764


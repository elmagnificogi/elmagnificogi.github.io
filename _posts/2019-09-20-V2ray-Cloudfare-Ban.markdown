---
layout:     post
title:      "V2ray借助Cloudflare使用被墙IP"
subtitle:   "GF,BAN,WS,vps"
date:       2019-09-20
update:     2022-11-28
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.jpg"
catalog:    true
tags:
    - VPS
    - V2Ray

---

## Foreword

2019-09-16晚，我的阿里云香港VPS被墙

提交工单以后就是套话，后面无论你说什么都是让你换服务器，换弹性IP

我的是当时的9刀 1c1g 30M 1T流量，现在已经绝版了，1T的流量包再也买不到了，这就导致了就算被墙了也不能轻易放弃

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/oNmFpAYX1kQEtPz.png)



## 被墙检测

现在看来有两种情况，一种是直接整个IP国内ping不通，一种是端口被封



IP是否被封，可以通过全国ping检测看到对应的情况

> https://ping.chinaz.com/



端口是否被封可以通过下面的工具看到国内外的情况

> https://www.toolsdaquan.com/ipcheck/

一般来说端口被封是有概率复活的，只是还有可能会二进宫或者是直接导致IP被封



## Oracle Cloud 免费VPS

好巧不巧，刚好在被封的这天，Oracle Cloud 开启了活动可以白嫖永久免费的 1c1g的服务器，然而我并没有抢到，只是拿了一个1c8g的试用版本

Oracle Cloud的日本或者韩国的ping低一些，本质上现在也能抢，搞个脚本一直刷网页一直点建立实例就行了，就看谁不小心释放了就被抢走了，挂个一天还是能激活一台的。

然后这个有点小问题，速度有点慢，高峰期我感觉蛮卡的，就算我开了bbr也是卡，然后晚上的时候比如凌晨3点这样，我测了一下有时候能跑到10MB/s，而刚好由于阿里云被封了，就拿这个试用版本

## Xshell 使用代理

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/7lywGMKh2gEUL1F.png)

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/i8I9RXGSrYFEcCl.png)

给xshell中的连接添加对应的代理，代理这里有一点要注意，v2ray有一个设定，参数设置，这里直接监听的是1080端口，可能在IE选项里面常见到v2ray不是1080而是1081或者1082，这个是http代理端口的设置，不影响我们这里socks5的.

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/BVSpMN4bz3vxu9h.png)

同时还要注意一个问题，这里阿里云的主机IP也是直接用IP，用被封的IP，而不是域名，也不是后面Cloudflare给域名的CDN IP,否则会出现显示SSH连接上了，但是没有任何console回显信息。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/pA7YgMt4iWB1lc3.png)

有了以上方式就能正常登录到被封主机上了，当然也可以直接用阿里云的后台直接连接，但是阿里云的后台很卡，这种方式的虽然好一点，但是也比较卡

## Cloudflare

能使用被封IP的关键就是CDN中转，Cloudflare的作用就是当你选他作为你的域名DNS服务器的时候，它可以隐藏你的域名真实IP，你域名显示的IP实际上是Cloudflare分配的他们自己的IP，并且会把对VPS的所有东西转发到真正的VPS的IP上去，这样就变相多了一层代理，并且Cloudflare的IP是没有被墙的，这样就能正常访问被墙服务器了。当然，这个服务是免费的，这就很方便。

#### 缺点

- 速度会减慢
- 延迟增大，本身香港阿里云是9ms，现在直接150+

这种缺点无法避免，Cloudflare分配的CDN IP基本都是美国的，延迟比较高，也可以拿到国内的，但是需要备案，需要5000刀一年，非常贵，个人用户基本用不上。

#### 使用

当然要用Cloudflare必须要有一个域名，不然就没法用了

域名可以直接申请免费的或者找个喜欢的买一年也可以，然后等过期了再重买一年，这样比较便宜

> https://www.namesilo.com

首先注册一个cloudflare账号，然后输入二级域名

> https://www.cloudflare.com/

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/cNuGBaxWIpnmiPs.png)

然后选择免费的套餐，他会自动提示你要你把域名解析DNS给转换成他的。

然后就是登录到namesilo去修改DNS，修改完成以后，等一会，因为解析大概要个几分钟。

如果正常解析了会有邮件通知，或者直接ping一下你的域名，就能发现域名的IP已经变了，那基本就行了。

然后就可以添加对应的子域名了，将被封的VPS添加为一个子域名A记录

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/bUxAOLWRZcdkEKf.png)

![image-20221128141117249](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202211281411484.png)

同时SSL至少需要设置`Full或者strict`否则无法实现SSL流量代理

等几分后，ping一下子域名，发现ping通了，并且ip也改变了。

## V2ray 使用WebSocks

```
{
  "settings":{
    "clients":[
      {
        "id":"uuid自行生成",
        "alterId":64
      }
    ]
  },
  "protocol":"vmess",
  "port":80,
  "streamSettings":{
    "network":"ws"  
    "wsSettings":{
      "path":"/",
      "headers":{}
    },
  }
}
```

v2ray基本只要替换掉之前的shadowsocks或者vmess就行了，或者直接增加一个inbound，v2ray可以同时支持好几个协议同时工作，需要注意的是这里的80端口不能修改，network也必须是ws，如果用tls或者https另说。

加好了以后，记得检查一下配置，需要注意这个只能检测格式错误，如果json里面这个字段打错了，那是检测不出来的，我就打错了一个查了半天才发现。

```
/usr/bin/v2ray/v2ray -test -config /etc/v2ray/config.json

V2Ray 4.5.0 (Po) 20181116
A unified platform for anti-censorship.
Configuration OK.
```

完成了以后，重启 v2ray

```
sudo systemctl restart v2ray
```

如果有防火墙还要添加端口：

```
查看端口
firewall-cmd --zone=public --list-ports

添加端口
firewall-cmd --zone= public --remove-port=80/tcp --permanent
firewall-cmd --zone= public --remove-port=80/udp --permanent
```

防火墙搞完了，还有阿里云后端的网络规则里添加对应的80端口

做完以后，v2ray客户端的配置也对应改一下，切到ws，然后就又可以愉快的翻墙了，虽然速度慢了一点，只是看网页不是很明显吧，只是sstap的游戏加速用不了了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/C8JYgOjNIf1oBr4.png)

## 总结

> https://github.com/wulabing/V2Ray_ws-tls_bash_onekey

当我都弄好了以后发现还有更简单方法，有人写了一键脚本，直接做到了ws+tls+v2ray，这样的话只需要配置好cloudflare就可以直接用了，挺方便的，下次再重弄的时候可以用一下试试。

上了tls以后会有一个好处，更加隐蔽一些，而且走的是443端口了，不容易被封，不容易被发现，虽然现在cloudflare好像在处理证书的时候会暴露vps的真实ip

用了这个的好处我感觉基本上不管GF怎么闹，应该都不会导致不能翻墙了，在这段突然封闭的日子里我看了有很多人免费分享的配置里基本都是走的ws+cloudflare，这样应该会稳定许多。

## 参考

> https://blog.sprov.xyz/2019/03/11/cdn-v2ray-safe-proxy/
>
> http://www.xuxiaobo.com/?p=5509
>
> https://github.com/wulabing/V2Ray_ws-tls_bash_onekey
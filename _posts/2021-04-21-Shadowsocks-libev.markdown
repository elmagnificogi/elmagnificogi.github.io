---
layout:     post
title:      "适用于小内存vps的Shadowsocks-libev"
subtitle:   "小伞云,NAT,IPLC"
date:       2021-04-21
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tags:
    - vps
---

## Foreword

之前以为跑路的小伞云又回来了，我的48年付的传家宝也回来了，剩余时间还有8个月左右。虽然这个IPLC流量小，但是对我来说够用了。



## Shadowsocks

Shadowsocks有多个版本，不过不同的版本对应不同。

其中：

- Shadowsocks-go 占内存比较小，需要的东西也比较少
- Shadowsocks-rust 由于rust比较火，所以对应rust版本效率也比较高，接近原生级别的c
- shadowsocks-libev 占用内存最小的版本，适合小内存或者路由器上安装。



## Shadowsocks一键脚本

试用了几个Shadowsocks的一键脚本，发现要么能装上，但是是老版本的，udp转发有问题，要么就是直接在安装gcc或者非要强制给你装一个bbr，然后由于小内存vps，直接爆内存，安装失败，所以最好自己直接安装原版的就行了。



由于是直接用在国内IPLC的中转机上，所以直接上ss就行了，没必要再套更复杂的。当然也可以直接做转发而不套ss。



- 老版的shadowsocks-go或者shadowsocks-python 可能都有问题，udp转发异常



#### 不推荐脚本

```
bash <(curl -sL https://s.hijk.art/ss.sh)

https://github.com/hijkpw/scripts
```

hijk的脚本，会出现依赖安装失败的问题。主要是默认自动安装bbr，非常烦人。



```
wget --no-check-certificate -O shadowsocks-all.sh https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks-all.sh
chmod +x shadowsocks-all.sh
./shadowsocks-all.sh 2>&1 | tee shadowsocks-all.log
```

秋水逸冰的脚本，实际上早就不维护了，建议少用老的吧，也会出现gcc安装爆内存卡死。



```
wget -N --no-check-certificate https://raw.githubusercontent.com/veip007/doubi/master/ss-go.sh && chmod +x ss-go.sh && bash ss-go.sh
```

逗逼的ss-go一键脚本，这个go版本超级老。



## shadowsocks-libev 安装

```bash
yum install epel-release -y

# 这句看情况执行，过不去一般不影响下面的ss安装
yum install gcc gettext autoconf libtool automake make pcre-devel asciidoc xmlto udns-devel libev-devel -y

cd /etc/yum.repos.d/
wget https://copr.fedoraproject.org/coprs/librehat/shadowsocks/repo/epel-7/librehat-shadowsocks-epel-7.repo
yum update
yum install shadowsocks-libev

# 编辑ss配置
vi /etc/shadowsocks-libev/config.json
{
    "server":"0.0.0.0",
    "server_port":4396,
    "local_port":1080,
    "password":"asdiofjow",
    "timeout":60,
    "method":"chacha20-ietf-poly1305"
}

# 开启，运行，查看运行状态
systemctl enable shadowsocks-libev
systemctl start shadowsocks-libev
systemctl status shadowsocks-libev
chkconfig shadowsocks-libev on

# 更新防火墙规则
firewall-cmd --zone=public --add-port=4396/tcp --permanent
firewall-cmd --zone=public --add-port=4396/udp --permanent
firewall-cmd --reload
```



查看ss log

```
journalctl | grep ss-server
```



##  问题

中间还遇到一个ss莫名其妙block了一个内网，主要是由于握手失败，导致ss直接屏蔽了来源ip。然后由于所有来源都是来自于内网，等于直接把所有信息都屏蔽了。

```
Apr 21 00:38:14 qianxue2333 ss-server[1750]: 2021-04-21 00:38:14 ERROR: failed to handshake with 172.24.1.224: authentication error
Apr 21 00:38:14 qianxue2333 ss-server[1750]: 2021-04-21 00:38:14 ERROR: failed to handshake with 172.24.1.224: authentication error
Apr 21 00:38:14 qianxue2333 ss-server[1750]: 2021-04-21 00:38:14 ERROR: failed to handshake with 172.24.1.224: authentication error
Apr 21 00:38:14 qianxue2333 ss-server[1750]: 2021-04-21 00:38:14 ERROR: failed to handshake with 172.24.1.224: authentication error
Apr 21 00:38:14 qianxue2333 ss-server[1750]: 2021-04-21 00:38:14 ERROR: failed to handshake with 172.24.1.224: authentication error
Apr 21 00:38:15 qianxue2333 ss-server[1750]: 2021-04-21 00:38:15 ERROR: failed to handshake with 172.24.1.224: authentication error
Apr 21 00:38:15 qianxue2333 ss-server[1750]: 2021-04-21 00:38:15 ERROR: failed to handshake with 172.24.1.224: authentication error
...
Apr 21 00:38:15 qianxue2333 ss-server[1750]: 2021-04-21 00:38:15 ERROR: block all requests from 172.24.1.224
Apr 21 00:38:15 qianxue2333 ss-server[1750]: 2021-04-21 00:38:15 ERROR: block all requests from 172.24.1.224
Apr 21 00:38:15 qianxue2333 ss-server[1750]: 2021-04-21 00:38:15 ERROR: block all requests from 172.24.1.224
Apr 21 00:38:15 qianxue2333 ss-server[1750]: 2021-04-21 00:38:15 ERROR: block all requests from 172.24.1.224
Apr 21 00:38:18 qianxue2333 ss-server[1750]: 2021-04-21 00:38:18 ERROR: block all requests from 172.24.1.224
```

这个问题很好解决，直接重启一下机器就好了。重启ss可能并不行。



## Summary

如果可以的话尽量还是加一个落地vps然后IPLC转发流量，这样的话更快一些



## Quote

> https://gist.github.com/chuyik/d4069a170a409a0c4449acc8e85f4de1
>
> https://github.com/veip007/doubi


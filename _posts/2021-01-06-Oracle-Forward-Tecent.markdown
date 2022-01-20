---
layout:     post
title:      "Oracle用腾讯云中转"
subtitle:   "轻量云，v2ray，安全组"
date:       2021-01-06
update:     2021-10-27
author:     "elmagnifico"
header-img: "img/drone-head-bg.jpg"
catalog:    true
tags:
    - vps
    - Oracle

---

## Foreword

由于需要日本的ip，想起来之前白嫖的Oracle cloud 的日本服务器，还能用，那刚好拿来用用，不过速度也太慢了，要提高一下。



## Oracle

- Oracle cloud的韩国是cn2 gia级别的，电信访问非常快

- Oracle cloud的德国，适合联通
- Oracle cloud的日本，适合移动

我本来想注册韩国的，但是信用卡通不过，目前的策略是只要这个信用卡注册了一个账号了，就不能再次绑到其他账号上进行注册，会认证失败，所以要想同时注册韩国日本就得用2张卡来搞。



## 安全组

Oracle cloud 开安全组，找了半天。Oracle cloud 有个问题，如果你删了之前的机器，那么上次的子网的安全配置还在，如果你从网络那边进去，就看到一堆重名的安全组，根本分不出来谁是，配了半天没用，发现配错了。

实际通过下面方式找到的就是对应的

```
实例 - 实例详细信息：xxxx - 子网：公告子网xxxx - 安全列表xxxxx -  入站规则
```



除了安全组，可能还会出现根本没收到包的样子，主要是iptables和firewall都在工作，可能中间有谁没关闭或者没允许。

大概率是iptables的问题，直接把iptables全开，可以直接解决问题，剩下的端口开启还是关闭都在firewall里配置就行了

```
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
sudo iptables -F
```



## 中转

先说中转的目的，首先把所有包都发给一个中转机器，他连接国内比较快，同时连接到oracle的机器也比较快，然后他就作为一个跳板，帮我们跳到oracle来落地。

```
用户---（多线）--->中转机器（端口A）--->落地机器（端口B）--->目的地
```



开始我设想的是通过v2ray的配置直接配置中转，相当于是从某个inbound进来的全都从某个outbound出去，然后查了一下发现没有这种配置，只有一个多对多的配法，不是我想要的。

> https://github.com/v2ray/v2ray-core/issues/507



然后就看到了别人直接用iptable配置中转，fake ip，然后发包就行了，非常简单，再一找还有现成的脚本可以用，非常方便

> https://github.com/arloor/iptablesUtils



#### iptables 中转

拉下来脚本

```
wget --no-check-certificate -qO natcfg.sh http://www.arloor.com/sh/iptablesUtils/natcfg.sh && bash natcfg.sh
```

输出如下：

```
#############################################################
# Usage: setup iptables nat rules for domian/ip             #
# Website:  http://www.arloor.com/                          #
# Author: ARLOOR <admin@arloor.com>                         #
# Github: https://github.com/arloor/iptablesUtils           #
#############################################################

你要做什么呢（请输入数字）？Ctrl+C 退出本脚本
1) 增加转发规则          3) 列出所有转发规则
2) 删除转发规则          4) 查看当前iptables配置
#?
```

此时按照需要，输入1-4中的任意数字，然后按照提示即可

- 为了转发某些情况下：客户端不验证证书。

转发设置完成了以后，v2ray客户端那边**ip和端口都填中转机器**的，落地机器只要正常配置就行了，就能正常工作了



##### 不生效

有时候不生效，是因为iptables没有启用

```
service iptables status
Redirecting to /bin/systemctl status iptables.service
● iptables.service - IPv4 firewall with iptables
   Loaded: loaded (/usr/lib/systemd/system/iptables.service; disabled; vendor preset: disabled)
   Active: inactive (dead)
   
service iptables start
```



#### firewall 中转

先检查运行状态，firewall不运行的时候是没用的

```
firewall-cmd --state
```



设置端口转发，并且重新加载防火墙配置

```
sudo firewall-cmd --zone=public --permanent --add-port 本机端口号/tcp
sudo firewall-cmd --zone=public --permanent --add-port 本机端口号/udp
sudo firewall-cmd --zone=public --permanent --add-forward-port=port=本机端口号:proto=tcp:toport=目标端口号:toaddr=目标地址
sudo firewall-cmd --zone=public --permanent --add-forward-port=port=本机端口号:proto=udp:toport=目标端口号:toaddr=目标地址
sudo firewall-cmd --zone=public --permanent --add-masquerade
sudo firewall-cmd --reload
```

只要对方防火墙是放开的，那么就ok了



## iperf3

中转完成了以后，腾讯云和oracle都重新设置了一下安全组，开放了中转端口。

但是实际一测试，确实中转成功了，但是oracle都跑不到10M，那就要测试一下为什么了。

单独ping的话腾讯云到oracle也只有40多ms，iperf3可以用来测试服务器到客户端的速率

先安装

```
yum install iperf3 -y
```

服务端开启端口5201，并等待客户端测试

```
iperf3 -s
```

客户端，输入服务器ip，开始测试

```
iperf3 -c 服务器ip
```

#### 常见问题

客户端这边，测试服务器会提示：

```
unable to connect to server: No route to host
```

大概率是服务器防火墙的问题，关闭防火墙就可以了，测试完了以后再开启

```
systemctl stop firewalld
iperf3 -s
systemctl start firewalld
```



#### 测试结果

腾讯云香港到Oracle日本，可以看到这边可以跑超过30M，但是实际上由于香港只有30M，所以最多也就是能跑满香港而已。

![image-20210106143537678](https://i.loli.net/2021/01/06/FLedAXhRq7aKDpM.png)

同时延迟等于10ms+40多，比直接访问香港高多了，而且由于Oracle本身的限制有一些网站是访问不了的，比如p站等，但是同时也可以让某些中转无法访问的网站变成可以被访问的状态，比如谷歌学术等。



## certbot-auto

certbot-auto的脚本直接过期了，之前可以不用安装certbot-auto的命令行，直接用现成脚本就可以工作了，但是开发者把这个东西从脚本提升到了产品级别，就取消了对脚本的支持，然后强制所有用的人安装命令行，真的蛋疼

> https://github.com/certbot/certbot/issues/8535

首先要安装snap

```
yum install snap -y
```

然后安装certbot

```
yum install certbot -y
```

安装完成后发现还缺少东西，nginx的插件没有，继续装

```
yum install python3-certbot-nginx -y
```

然后才能用，然而还是会报错

```
certbot --nginx --register-unsafely-without-email -d 你的域名
```

他会问你是否注册了会员，是否加入了域名，然后如果失败次数多了就会导致锁定一小时，要等一小时才能尝试

```bash
An unexpected error occurred:
There were too many requests of a given type :: Error creating new order :: too many failed authorizations recently: see https://letsencrypt.org/docs/rate-limits/
```

> https://www.v2ex.com/t/408134

果然是验证了那句免费的套路，终究会来到，建议放弃这个东西，安装使用太麻烦了。



## 其他一键脚本



#### wulabing

最后选择一键安装v2ray+ws+tls+nginx+自动续期，不过这个脚本实在太洁癖了，基本所有库都是开源，然后重新编译，再编排文件，我就装这么个东西跑了至少半个小时，不适合机器性能差的。

> https://github.com/wulabing/V2Ray_ws-tls_bash_onekey



#### atrandys

> https://github.com/atrandys/v2ray-ws-tls

安装

```bash
curl -O https://raw.githubusercontent.com/atrandys/v2ray-ws-tls/master/v2ray_ws_tls1.3.sh 
chmod +x v2ray_ws_tls1.3.sh 
./v2ray_ws_tls1.3.sh
```

**这个脚本有一个bug，他安装以后生成的伪装域名是myws，但是实际上是错的，伪装域名是你自己的域名而不是myws，如果按照他给的link导入就会直接报错**



#### 233

233的一键脚本，集成功能比较多，直接选择就行了，目前大部分情况下都ok，推荐使用

> https://github.com/233boy/v2ray/wiki/V2Ray%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E8%84%9A%E6%9C%AC

安装

```
bash <(curl -s -L https://git.io/v2ray.sh)
```



#### BBR

BBR加速脚本

```bash
wget -N --no-check-certificate "https://raw.githubusercontent.com/chiakge/Linux-NetSpeed/master/tcp.sh" 
chmod +x tcp.sh 
./tcp.sh
```

**这个脚本也有一个bug，就是偶尔如果你卸载已有的多余内核，大概率会导致引导失败，所以建议不要卸载内核，可以的情况下直接安装新内核就行了**



## Summary

中转确实好用，后面感觉可以拯救一下有些慢的不行的机器，就是得有一个大口子中转机器才行

## Quote

> https://www.dazhuanlan.com/2019/12/18/5df99bff778ce/
>
> https://zhengkai.blog.csdn.net/article/details/106094890
>
> https://www.cnblogs.com/fallin/p/13186104.html
>
> https://www.v2ex.com/t/603319
>
> https://www.tkmiss.com/archives/vps_port_forward.html
>
> https://github.com/arloor/iptablesUtils
>
> https://blog.51cto.com/lifeng/2564211
>
> https://stackoverflow.com/questions/53223914/issue-using-certbot-with-nginx
>
> https://blog.chaos.run/dreams/nat-vps-port-forwarding/


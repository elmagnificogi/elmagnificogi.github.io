---
layout:     post
title:      "Netflix解锁尝试"
subtitle:   "流媒体,DNS"
date:       2022-11-14
update:     2022-11-14
author:     "elmagnifico"
header-img: "img/maze.jpg"
catalog:    true
tags:
    - VPS
---

## Foreword

突然Netflix的流媒体就失效了，然后折腾了半天，尝试了各种方法，总算找到了一个比较合适的办法



## warp

WARP是CloudFlare提供的一项基于WireGuard的网络流量安全及加速服务，能够让你通过连接到CloudFlare的边缘节点实现隐私保护及链路优化。

其连接入口为双栈（IPv4/IPv6均可），且连接后能够获取到由CF提供基于NAT的IPv4和IPv6地址，因此我们的单栈服务器可以尝试连接到WARP来获取额外的网络连通性支持。这样我们就可以让仅具有IPv6的服务器访问IPv4，也能让仅具有IPv4的服务器获得IPv6的访问能力。

其实稍微有点像是一个zerotier那种一个局域内网，但是CloudFlare相当于是给了你他的超级局域网，很多服务器在其中，你的流量可以走他的局域网内某个节点出去。相当于凭空你多了一张网卡，这个网卡具有一个外网IP，并且这张网卡还是可以随时换的。

之前这个服务被很多人用来直接翻墙了，后来被屏蔽了，同理Netflix也是一样，能翻墙自然也能直接代理Netflix。



有一点CentOS7是不支持的，warp装不上。

由于被滥用的有点厉害，所以现在基本上都是垃圾IP，需要刷IP，从万千IP里刷到一个能用的，然后坚持个几天或者更久就又要换一个。

虽然是免费的，但是总体上还是太麻烦了，而且IP掉了以后不是很快就能续上。



有一些脚本可以快速使用warp服务



> https://github.com/fscarmen/warp

这个脚本安装以后，搜索IP直接失败了，也懒得弄了，相当麻烦



> https://p3terx.com/archives/cloudflare-warp-configuration-script.html

这个脚本我基本装不上，总是提示

```
Cloudflare WARP network anomaly, WireGuard tunnel established failed
```



## DNS手动解锁

DNS解锁，要求你先要有一个可以解锁的服务器，然后可以使用DNS解锁的方式让其他不能解锁的解锁

```
好像目前Netflix解锁的服务器：
aws的新加坡
绿云的新加坡
甲骨文的新加坡
```



本质上就是让解锁的服务器自建一个DNS服务器，下面可以一键部署一个DNSMASQ和代理

```
wget --no-check-certificate -O dnsmasq_sniproxy.sh https://raw.githubusercontent.com/myxuchangbin/dnsmasq_sniproxy_install/master/dnsmasq_sniproxy.sh && bash dnsmasq_sniproxy.sh -i
```

然后记得安全组和防火墙等开启53端口



然后进到不能解锁的机器上，修改dns服务器

```
vi /etc/resolv.conf

nameserver x.x.x.x  #这里为已解锁服务器的IP地址
nameserver 8.8.8.8  #这是原来的DNS地址 不用修改
```

如有必要，加锁配置文件，防止重启就没了

```
chattr +i /etc/resolv.conf
```

在不能解锁的机器上测试，是否已经使用我们自己的DNS

```
yum install -y bind-utils
nslookup Netflix.com
```

正常的话，就可以看到得到的服务器地址是我们自己的



如果有必要，可以在解锁服务器这里，做一个权限，直接做成一个DNS解锁服务

```
iptables -I INPUT -p tcp --dport 53 -j DROP
iptables -I INPUT -s x.x.x.x -p tcp --dport 53 -j ACCEPT
```



## DNS解锁服务

如果没有已解锁的机器，可以买一个DNS解锁服务，实际上就是上面的这种方式，只不过有人做成服务卖了。

这种服务应该是会造成有部分流量是从解锁的服务器那边走，所以一般8块钱左右，都会限制IP，不限制流量。



可以直接修改本机的DNS服务，但是这样有点危险，容易被坑，不建议

```
echo -e "nameserver 解锁ip\nnameserver 8.8.8.8" > /etc/resolv.conf
```

检查解锁状态完毕后，给 DNS 配置文件加锁禁止修改，防止系统重启后 DNS 配置被重置，导致重启后解锁失效

```
chattr +i /etc/resolv.conf
```



只是本机解锁其实，对v2ray等等来说没用，他们可能根据你的设置还是走了其他DNS，这就需要修改一下对应的DNS信息

加一个DNS解锁的dns分流，这样所有流量都正常了

```json
"dns": {
    "servers": [
      "1.1.1.1",
      "8.8.8.8", 
      {
        "address": "解锁ip", 
        "port": 53,
        "domains": [
           "geosite:netflix"
        ]
      }
    ]
  }
```



## V2ray流量转发Netflix

本来我想买一个解锁服务，然后再利用自建DNS服务做个二次转发，发现好像不行，只好用V2ray二次完全转发来实现了

实现比较简单，直接在原来的direct下面添加一个出口，出口则是解锁的v2ray服务器的信息，解锁服务器那边什么都不用改。

```json
	"outbounds": [
		{
			"protocol": "freedom",
			"settings": {
				"domainStrategy": "UseIP"
			},
			"tag": "direct"
		},
		{
			"tag": "netflix",
			"port": 443,
			"protocol": "vmess",
			"settings": {
                "vnext": [
                    {
                        "port": 443,
                        "address": "xxxx",
                        "users": [
                            {
                                "alterId": 0,
                                "security": "auto",
                                "id": "xxxxx"
                            }
                        ]
                    }
                ]
			},
            "streamSettings": {
                "network": "ws",
                "security": "tls",
				"tlsSettings": {
					"allowInsecure": false,
					"serverName": "xxxx"
				},
                "wsSettings": {
                    "path": "/xxxx",
                    "headers": {
                        "host": "xxxx"
                    }
                }
            }
		},
```



然后在rules里面，添加一个对应的netflix的规则，会根据netflix网站，全部走对应的出口

```json
	"routing": {
		"domainStrategy": "IPOnDemand",
		"rules": [
			{
				"type": "field",
				"ip": [
					"0.0.0.0/8",
					"10.0.0.0/8",
					"100.64.0.0/10",
					"127.0.0.0/8",
					"169.254.0.0/16",
					"172.16.0.0/12",
					"192.0.0.0/24",
					"192.0.2.0/24",
					"192.168.0.0/16",
					"198.18.0.0/15",
					"198.51.100.0/24",
					"203.0.113.0/24",
					"::1/128",
					"fc00::/7",
					"fe80::/10"
				],
				"outboundTag": "blocked"
			},
			{
                "type": "field",
                "domain": [
                  "geosite:netflix"
                          ],
                "outboundTag": "netflix"
            },
```

这样一个v2ray转发就完成了，经过测试全都正常工作了。



## 测试

> https://www.netflix.com/title/70143836

如果能看到绝命毒师，说明解锁ok，如果打不开或者找不到说明解锁还是有问题，注意需要提前登陆Netflix，否则也会提示找不到的



## Summary

看以后还有没有更好的办法解锁吧



## Quote

> https://hostloc.com/thread-551706-4-1.html
>
> https://www.duangvps.com/archives/1850

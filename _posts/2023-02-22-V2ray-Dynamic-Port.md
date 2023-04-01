---
layout:     post
title:      "V2ray ws tls Caddy使用动态端"
subtitle:   "VMESS,V2RAYN,nginx"
date:       2023-02-22
update:     2023-03-21
author:     "elmagnifico"
header-img: "img/bg3.jpg"
catalog:    true
tags:
    - V2ray
    - VPS
---

## Foreword

新买的2个BWG，没挺过一个月，443端口就被墙了，还有一个CN2的也是莫名其妙被墙了，套了CF，感觉还是非常浪费的，于是打算做个实验，试一试动态端口是否还会被墙。

以目前的经验来看，墙是基于他的检测周期内（他的检测时间未知），如果有不明的大流量，tls套tls，那么这种不明流量，大概率会被直接封端口。但是他的检测到底是基于某一ip的总流量呢，还是某一端口的总流量，那就不知道了。最坏的情况也就是IP被封，然后再套CF，既然不能更差，那就试试动态端口吧。



## 配置动态端口

平常用动态端口的比较少，可以参考的ws+tls+caddy或者nginx的配置都很少，所以试了几次才弄好。



配置动态端口，只需要服务端设置即可，客户端基本可以不变。首次通信还是原协议，然后沟通以后，通过detour重新约定协议和端口，之后就按照新端口进行通信了。



首先修改V2ray的配置，增加一个detour的配置

```json
{
	"log": {
		"access": "/var/log/v2ray/access.log",
		"error": "/var/log/v2ray/error.log",
		"loglevel": "warning"
	},
	"inbounds": [
		{
            # 这个是原端口，客户端也是用这个端口
			"port": 63966,
			"protocol": "vmess",
			"settings": {
				"clients": [
					{
						"id": "我的动态端口服务器",
						"level": 1,
						"alterId": 0
					}
				],
                # 这里需要指定detour，重新沟通端口
				"detour": {
					"to": "dynamicPort"
				}
			},
			"streamSettings": {
				"network": "ws"
			},
			"sniffing": {
				"enabled": true,
				"destOverride": [
					"http",
					"tls"
				]
			}
		},
		# 这一整条配置都是重新沟通的设置
		{
			"protocol": "vmess",
            # 使用动态端口
			"port": "30000-60000",
			"tag": "dynamicPort",
            # 下面的设置和前面初始端口一样即可
			"settings": {
				"clients": [
					{
						"id": "我的动态端口服务器",
						"level": 1,
						"alterId": 0
					}
				]
			},
			"streamSettings": {
				"network": "ws"
			},
			"sniffing": {
				"enabled": true,
				"destOverride": [
					"http",
					"tls"
				]
			},
			# 多一个动态分配设置
			"allocate": {
				"strategy": "random",
                # 设置一次随机使用多少个端口
				"concurrency": 20,
                # 设置端口多久更换一次，这里是300分钟
				"refresh": 300
			}
		}
	],
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
						"address": "我的netflix服务器",
						"users": [
							{
								"alterId": 0,
								"security": "auto",
								"id": "我的netflix服务器"
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
					"serverName": "我的netflix服务器"
				},
				"wsSettings": {
					"path": "我的netflix服务器",
					"headers": {
						"host": "我的netflix服务器"
					}
				}
			}
		},
		{
			"protocol": "blackhole",
			"settings": {},
			"tag": "blocked"
		}
	],
	"dns": {
		"servers": [
			"https+local://dns.google/dns-query",
			"8.8.8.8",
			"1.1.1.1",
			"localhost"
		]
	},
	"routing": {
		"domainStrategy": "IPOnDemand",
		"rules": [
			{
				"type": "field",
				"ip": [
					"geoip:private"
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
			{
				"type": "field",
				"domain": [
					"domain:epochtimes.com",
					"domain:epochtimes.com.tw",
					"domain:epochtimes.fr",
					"domain:epochtimes.de",
					"domain:epochtimes.jp",
					"domain:epochtimes.ru",
					"domain:epochtimes.co.il",
					"domain:epochtimes.co.kr",
					"domain:epochtimes-romania.com",
					"domain:erabaru.net",
					"domain:lagranepoca.com",
					"domain:theepochtimes.com",
					"domain:ntdtv.com",
					"domain:ntd.tv",
					"domain:ntdtv-dc.com",
					"domain:ntdtv.com.tw",
					"domain:minghui.org",
					"domain:renminbao.com",
					"domain:dafahao.com",
					"domain:dongtaiwang.com",
					"domain:falundafa.org",
					"domain:wujieliulan.com",
					"domain:ninecommentaries.com",
					"domain:shenyun.com"
				],
				"outboundTag": "blocked"
			},
			{
				"type": "field",
				"protocol": [
					"bittorrent"
				],
				"outboundTag": "blocked"
			}
		]
	},
	"transport": {
		"kcpSettings": {
			"uplinkCapacity": 100,
			"downlinkCapacity": 100,
			"congestion": true
		}
	}
}
```

随机端口不能超过总端口的1/3，其实可以给很多很多端口出去的



有了以上设置以后，v2ray基本就能多端口运行了，但是这里还有tls和ws的问题，用了caddy反代，所以反代也需要修改一下对应的端口

```
{
        http_port 80
        # 443被封了，所以可以换成别的端口继续用
        https_port 4396
}
我的动态端口服务器 {
    reverse_proxy 我的web服务器 {
        header_up Host {upstream_hostport}
        header_up X-Forwarded-Host {host}
    }
    handle_path /转发路径 {
    	# 初次沟通端口
        reverse_proxy 127.0.0.1:63966
        # 最终的动态端口
        reverse_proxy 127.0.0.1:30000-60000
    }
}
import sites/*


```

以上配置完成以后就可以测试使用了，如果是nginx同理，设置一下动态端口范围即可



## 测试

已经可以正常上网了

```bash
[root@rave-push-1 ~]# netstat -anp | grep v2ray
tcp        0      0 我的服务器:58916     91.108.56.138:443       ESTABLISHED 26785/v2ray         
tcp        0      0 我的服务器:40658     142.251.2.188:5228      ESTABLISHED 26785/v2ray         
tcp        0      0 我的服务器:41290     142.250.68.110:443      ESTABLISHED 26785/v2ray         
tcp        0      0 我的服务器:58918     91.108.56.138:443       ESTABLISHED 26785/v2ray         
tcp        0      0 我的服务器:41288     142.250.68.110:443      ESTABLISHED 26785/v2ray         
tcp        0      0 我的服务器:43942     203.205.254.34:443      ESTABLISHED 26785/v2ray         
tcp        0      0 我的服务器:40824     8.8.8.8:443             ESTABLISHED 26785/v2ray                
unix  3      [ ]         STREAM     CONNECTED     866036   26785/v2ray          

```

可以看到已经有不同的端口连接着了，不过这都是出的端口，得看入口



看到所有入口的ip，依然是4396端口，而实际上v2rayN根本没做多端口

```
tcp        0     36 我的服务器:29499     我的客户端:60503   ESTABLISHED 28295/sshd: root@pt 
tcp6       0      0 我的服务器:4396      我的客户端:60338   ESTABLISHED 26768/caddy         
tcp6       0      0 我的服务器:4396      我的客户端:59386   ESTABLISHED 26768/caddy         
tcp6       0   2004 我的服务器:4396      我的客户端:59397   ESTABLISHED 26768/caddy         
tcp6       0      0 我的服务器:4396      我的客户端:59993   ESTABLISHED 26768/caddy         
tcp6       0      0 我的服务器:4396      我的客户端:59296   ESTABLISHED 26768/caddy
```



本地抓包发现，好像所有依然走的是4396，其他端口并没有走

```
  TCP    192.168.1.163:59386    我的服务器:4396     ESTABLISHED     5732
  TCP    192.168.1.163:59397    我的服务器:4396     ESTABLISHED     5732
  TCP    192.168.1.163:59993    我的服务器:4396     ESTABLISHED     5732
  TCP    192.168.1.163:60338    我的服务器:4396     ESTABLISHED     5732
  TCP    192.168.1.163:60503    我的服务器:29499    ESTABLISHED     438
```

29499是我的ssh端口，所以并不是v2ray



## 客户端不支持动态端口

之前从没注意过竟然不支持

> https://github.com/2dust/v2rayN/issues/3342



新版本种的V2rayN会一直报错，而老版本的V2rayN虽然不报错，但是实际上并没有走动态端口

```
2023/02/24 20:29:34 [Warning] [1402096796] app/proxyman/outbound: failed to process outbound traffic 
> proxy/vmess/outbound: failed to find an available destination 
> common/retry: [transport/internet/websocket: failed to dial WebSocket 
> transport/internet/websocket: failed to dial to (wss://我的服务器:44378/us6): 
> tls: first record does not look like a TLS handshake transport/internet/websocket: failed to dial WebSocket 
> transport/internet/websocket: failed to dial to (wss://我的服务器:31978/us6): 
> tls: first record does not look like a TLS handshake transport/internet/websocket: failed to dial WebSocket 
> transport/internet/websocket: failed to dial to (wss://我的服务器:56840/us6): 
> tls: first record does not look like a TLS handshake transport/internet/websocket: failed to dial WebSocket 
> transport/internet/websocket: failed to dial to (wss://我的服务器:34497/us6): 
> tls: first record does not look like a TLS handshake transport/internet/websocket: failed to dial WebSocket 
> transport/internet/websocket: failed to dial to (wss://我的服务器:40583/us6): 
> tls: first record does not look like a TLS handshake] > common/retry: all retry attempts failed
```



**实测Clash也不支持动态端口的设置**



## iptables动态端口方式

还有看到别人直接用iptable将所有动态端口的流量转发给v2ray工作端口



如下是将本机的4444端口流量转发给本地的22端口

```
iptables -t nat -A PREROUTING -p tcp --dport 4444 -j REDIRECT --to-ports 22
```

删除刚才的规则

```
iptables -t nat -D PREROUTING -p tcp --dport 4444 -j REDIRECT --to-ports 22
```



批量转发，将40000到60000的端口全部转发给443端口（nginx或者caddy所在）

```
iptables -t nat -A PREROUTING -p tcp --dport 40000:60000 -j REDIRECT --to-ports 443
```

**实测，这样以后v2rayn在40000-60000端口之间随便选择一个端口即可，被封了换一个就是了**，也可以像评论里的办法，直接批量加一些端口，来回切就是了

最差的情况就是整个IP被封了，动态端口就没啥用了。



## 防封手段

总结一些其他的防封手段，或许以后可以用得上

- naiveproxy，一个小众的新协议，只是目前用的人少，没被针对，但是同样的各个软件的支持还不够好，不够普及，鲜少听到被封的
- 禁止回国流量，总有小白开全局，导致大量回国流量，会带来额外风险吧
- 启用fingerprint，目前只有较新版本的软件支持，老版本的还不支持，而且这个设置还没被加到订阅分享链接中
- 禁止使用老版本的软件和core，可能有各种bug或者特征带来风险（其实反过来说也有可能，老协议可能没人针对了，反而放得松）
- 不要用443端口，前置nginx或者其他代理伪装一个网页出来（其实没用，我被封的都是这种带伪装的）
- 转发流量，国内使用某一个固定地址并做好备案等操作，然后出国到各种vps上
- IPLC，直接不过墙，但其实也有监管，出问题的时候会被清退
- REALITY ，最新的协议，可惜目前支持不够全，很多客户端不支持



2023.3.21，距离本文发布刚好一个月后，新换的端口又被封了，后续还是得换成比较通用的小众协议或者换IP，否则还是会经常遇到被封端口



## Summary

可惜的是客户端普遍不支持动态端口的设定，如果能自动随机选一个端口，那就好了



## Quote

> https://github.com/v2ray/v2ray-core/issues/2410
>
> https://github.com/v2ray/v2ray-core/issues/634
>
> https://toutyrater.github.io/advanced/dynamicport.html
>
> https://v2xtls.org/xtls-vision%E4%BB%8B%E7%BB%8D%E5%8F%8A%E5%AE%89%E8%A3%85%E4%BD%BF%E7%94%A8/


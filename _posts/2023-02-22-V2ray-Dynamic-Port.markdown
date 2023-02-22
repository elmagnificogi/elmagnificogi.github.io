---
layout:     post
title:      "V2ray ws tls Caddy使用动态端口"
subtitle:   "VMESS,V2RAYN,nginx"
date:       2023-02-22
update:     2023-02-22
author:     "elmagnifico"
header-img: "img/bg3.jpg"
catalog:    true
tags:
    - V2ray
    - VPS
---

## Foreword

新买的2个BWG，没挺过一个月，443端口就被墙了，套了CF，感觉还是非常浪费的，于是打算做个实验，试一试动态端口是否还会被墙



## 配置动态端口

配置动态端口，只需要服务端设置即可，客户端基本可以不变



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
tcp6       0      0 :::32788                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::32470                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::51926                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::58103                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::31322                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::57948                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::63966                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::41378                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::47075                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::40387                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::56644                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::56326                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::50790                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::40616                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::33738                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::41099                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::30220                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::35532                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::56717                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::37777                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 :::55987                :::*                    LISTEN      26785/v2ray         
tcp6       0      0 127.0.0.1:63966         127.0.0.1:33524         ESTABLISHED 26785/v2ray         
unix  3      [ ]         STREAM     CONNECTED     866036   26785/v2ray          

```

可以看到已经有不同的端口连接着了，说明没问题



## Summary

使用动态端口也会有点顾虑，万一下次是封IP呢？



## Quote

> https://github.com/v2ray/v2ray-core/issues/2410
>
> https://github.com/v2ray/v2ray-core/issues/634
>
> https://toutyrater.github.io/advanced/dynamicport.html


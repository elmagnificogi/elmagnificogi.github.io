---
layout:     post
title:      "ZeroTier使用自建Moon服务器加速"
subtitle:   "p2p，nat"
date:       2023-02-04
update:     2023-02-04
author:     "elmagnifico"
header-img: "img/bg6.jpg"
catalog:    true
tags:
    - VPS
    - ZeroTier
---

## Forward

最近老是出现奇怪的情况，家里的主机总是连不上，公司和笔记本都没问题，但是家里的经常出现开机以后要等很久很久，zerotier才能ping通，然后中间可能还会又ping不通了，只要ping不通基本rdp就连不上。

怀疑可能是zerotier从国外打洞失败了，可能某个ip被墙了，但是平常看不出来，而ZeroTier可以自建服务器，加速p2p的访问，就想着试一试。

看了一些评论说，有些运营商好像直接ban了zerotier的服务器，导致永久无法连接，但是如果使用moon中转的话，就没这个问题了。



## Moon

一般Moon服务直接安装在国内的vps上就行了，只要自己能很轻松访问即可，走流量什么的都很少。



### 安装zerotier

安装zerotier

```
curl -s https://install.zerotier.com/ | sudo bash
```

确认是否安装成功

```
[root@VM-12-13-centos ~]# zerotier-cli info
200 info eb444ec0d8 1.10.2 ONLINE
```

将vps加入到zerotier中，加入成功以后，去官网授权

```
zerotier-cli join 你创建的网络分配的id
200 join OK
```



### 创建moon

这里创建moon配置，并且修改

```
chmod 777 /var/lib/zerotier-one
cd /var/lib/zerotier-one
sudo zerotier-idtool initmoon identity.public > moon.json
vi moon.json
```

这里面需要修改stableEndpoints，将你的提供moon服务的ip和端口加入

```
{
 "id": "eb444ec0d8",
 "objtype": "world",
 "roots": [
  {
   "identity": "eb444ec0d8:0:55f55633d3234c76d69dfe19742c6e002f2dada7e03f1a6e756353ed5c933171c8543a2a1796134c034a5c189def154cd8d465f05298d16c358746f2c2075ece",
   "stableEndpoints": ["你vps的ip/9993"]
  }
 ],
 "signingKey": "f0c4f0b645f480be69054f6eb04fbba53d1b61c617cbf489df544956a5c0fa39a16b13882099f98a91011e817da2b1c8d15032d300f10e2d4629e333fa4459c8",
 "signingKey_SECRET": "9af8bb728b9aaa258108dadc203abeccb82bd563411054c78196da3aa02e6dd6d3535407d7ae3363734628f65b968db98220933d978d47906d0f9403eb720361",
 "updatesMustBeSignedBy": "f0c4f0b645f480be69054f6eb04fbba53d1b61c617cbf489df544956a5c0fa39a16b13882099f98a91011e817da2b1c8d15032d300f10e2d4629e333fa4459c8",
 "worldType": "moon"
}
```

需要注意如果vps有防火墙之类的，9993的端口也要对应给放行，否则可能不成功



这里就是根据配置生成对应的签名配置

```
sudo zerotier-idtool genmoon moon.json
wrote 000000eb444ec0d8.moon (signed world with timestamp 1675475060380)
```

将配置文件放到moons.d的文件夹中，每个人配置文件名可能不同

```
mkdir moons.d
mv 000000eb444ec0d8.moon moons.d/
```

重启zerotier

```
systemctl restart zerotier-one.service
```



### 测试

Windows客户端测试，首先查看是否能找到中转节点，windows cmd可能需要管理员权限打开

```
zerotier-cli.bat listpeers
```

![image-20230204095437208](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202302040954269.png)

一般这里会看到一个你的moon所在的vps的地址，那个的ztaddr就是我们要找的，比如我这里最后一条就是我实际的vps地址

指定使用中转节点

```
zerotier-cli.bat orbit ztaddr ztaddr
zerotier-cli.bat orbit 你的ztaddr 你的ztaddr
200 orbit OK
```

确认是否加入，可以看到他又之前的LEAF变成了MOON，就是正确加入了

![image-20230204101600667](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202302041016717.png)



使用之前我是根本连不上家里的主机的，使用之后，直接就可以ping了

ping检测，可以看到我的ping很低了，平常可以ping时会跳80-90甚至非常高，不是很稳定。

![image-20230204094907635](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202302040949764.png)

ping的表现这么好以后，后续使用moonlight等其他服务的时候也变得异常丝滑



## Summary

早知道就早点搭建了，简直不要太好用了

如果有各种zerotier连不上的，我估计也可以直接通过中转加速来实现打洞。



## Quote

> https://www.cnblogs.com/NanKe-Studying/p/16343774.html
>
> https://post.smzdm.com/p/a7nxv3ql/


---
layout:     post
title:      "群晖NAS ESTAT扩容"
subtitle:   "Synology，SSL，证书"
date:       2024-01-15
update:     2024-01-23
author:     "elmagnifico"
header-img: "img/z5.jpg"
catalog:    true
tobecontinued: false
tags:
    - NAS
    - 群晖
---

## Foreword

老群晖D918+只有4盘位，已经升级了一次，4张8T依然不够用，新搭的服务器的硬盘竟然是2.5的，还只能上固态，上普通硬盘没啥性价比。

无意间发现群晖竟然还能扩容



## ESTAT

群晖ESATA是群晖网络存储设备中的一种接口，它是一种高速的数据传输接口，可以提供比USB和Firewire更快的传输速度。群晖ESATA接口可以通过连接ESATA设备来扩展存储容量，如硬盘、光驱等



### DX517

![image-20240115160336363](https://img.elmagnifico.tech/static/upload/elmagnifico/202401151603402.png)

群晖官方的ESATA硬盘扩展柜，但是价格十分离谱，基本就是一个5盘位的新NAS的价格，如果这种价格我为什么不再买一个NAS呢



### 魅视 M517

![image-20240115160234695](https://img.elmagnifico.tech/static/upload/elmagnifico/202401151602847.png)

只有DX517一半不到的价格，但是同样扩展5盘位，性价比拉满



### 优越者 5盘位RAID USB3.0 ESATA接口

![image-20240115161610668](https://img.elmagnifico.tech/static/upload/elmagnifico/202401151616722.png)

更便宜一些，可惜支持最多5盘位，更多就不行了



## 证书

群晖添加证书

![image-20240123155419033](https://img.elmagnifico.tech/static/upload/elmagnifico/202401231554107.png)

这里的私钥和证书都用APACHE的格式，crt和key即可

![image-20240123155440736](https://img.elmagnifico.tech/static/upload/elmagnifico/202401231554790.png)

导入完成以后修改系统默认证书配置，然后使用域名登录即可看到证书已经被使用了

![image-20240123155543801](https://img.elmagnifico.tech/static/upload/elmagnifico/202401231555847.png)



## Summary

最多9盘位，一个盘20T，也就是最多可用容量160T，一年就要用接近20T



## Quote

> https://post.smzdm.com/p/awo33l4m/
>
> https://www.cnblogs.com/xiaoyou2018/p/17571430.html
>
> https://detail.tmall.com/item.htm?id=541473511350
>
> https://item.taobao.com/item.htm?id=672111503063
>
> https://www.bilibili.com/read/cv7094852/


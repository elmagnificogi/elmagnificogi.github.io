---
layout:     post
title:      "Doprax搭建免费V2ray节点"
subtitle:   "CloudFlare，WS，TLS，V2ray"
date:       2023-03-16
update:     2023-03-16
author:     "elmagnifico"
header-img: "img/z7.jpg"
catalog:    true
tags:
    - VPS
---

## Foreword

Doprax也是个容器云，类似Heroku，号称永不删容器，Heroku那会基本被滥用，下一个估计就是Doprax了



## Doprax

> https://www.doprax.com/

Doprax是可以直接使用Docker的，所以只要导入对应Docker构建文件就可以了



#### 搭建流程

参考这里，已经非常详细了

> https://www.hicairo.com/post/55.html



搭建完成以后他会给出来`xxxx.eu-xxxx.dopraxrocks.net`的域名，国内可以ping通，但是打不开，443直接被墙了

由于默认给的域名大概率是被墙的，所以要套一层CDN才能正常使用



#### 增加自定义域名套CF

添加域名以后会让你建立记录并验证

![image-20230315113843859](https://img.elmagnifico.tech/static/upload/elmagnifico/202303151138907.png)

加上域名以后还需要重启一下，然后使用自定义域名访问，正常就能看到nginx页面了，那么v2ray基本也是正常的

- 验证域名以后再开启proxy

![image-20230315114926285](https://img.elmagnifico.tech/static/upload/elmagnifico/202303151149330.png)

#### 测速

白天youtube，要跑一会速度才能起来

![image-20230315113602041](https://img.elmagnifico.tech/static/upload/elmagnifico/202303151138535.png)

Fast测速，速度也还不错

![image-20230315113803747](https://img.elmagnifico.tech/static/upload/elmagnifico/202303151138820.png)

以上都是非高峰，无优选ip的情况下测试的，可以作为一个备份节点



## Summary

....



## Quote

> https://github.com/hiifeng/V2ray-for-Doprax
>
> https://iweec.com/705.html
>
> https://www.hicairo.com/post/55.html


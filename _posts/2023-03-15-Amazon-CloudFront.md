---
layout:     post
title:      "Amazon免费12个月体验和CloudFront替代CF"
subtitle:   "CloudFlare，WS，TLS，V2ray"
date:       2023-03-15
update:     2023-03-16
author:     "elmagnifico"
header-img: "img/z8.jpg"
catalog:    true
tags:
    - VPS
---

## Foreword

Amazon新用户可以可以免费用12个月的EC2和3个月的lightsail，以及永久的CloudFront等服务

> 1、实例结算周期：
>
> ​	1）EC2的12个月免费按自然月结算，并且在账号注册后就开始计算，和是否创建实例无关；
>
> ​	2）比如：1月25日注册账号，1月31日24点就算1个月，12月31日24点就完全消耗12个月免费额度；
>
> ​	3）停用实例依然会计费，只有终止实例、删除弹性IP、删除卷(默认自动删除)后才会不再计费；
>
> ​	4）EC2实例免费750小时/月，Linux和Win两种类型独立计算，各自均可累积免费750小时；
>
> ​	5）但坑点是硬盘一共就30G免费共用，win占用30G意味着linux硬盘要收钱；
>
> ​	6）时间上比如同时建5个Linux实例和3个Win实例，则单个Linux实例免费750/5=150小时，单个Win实例免费750/3=250小时；
>
> ​	7）Lightsail的免费3个月不区分win和linux，所有实例共享750小时/月时间；
>
> 2、流量结算周期
>
> ​	1）EC2注意：Win和Linux虽然免费750h/月的额度是独立的，但100G/月的免费流量额度不独立，由所有区域实例共享；
>
> ​	2）EC2的所有入站流量免费，出站流量免费100G/月，所有服务和区域合并计算(中国区和美国东部GovCloud区除外)；
>
> ​	3）Lightsail的套餐流量和EC2的100G/月流量按自然月结算，且月底清零不转移到下个月；
>
> ​	4）Lightsail在流量包内双向计算流量，超出流量包后出站收费(此时入站流量免费)；
>
> ​	5）比如：3.5刀套餐里有1T流量，这1T入站、出站都算进去，超出1T后开始按流量计费，此时只收出站的钱，入站免费。
>
> 3、公网IP：
>
> ​	1）lightsail和ec2的动态公网IPv4每次重启都会变化，可申请免费的弹性IPv4并绑定实例固定不变化；
>
> ​	2）绑定实例的弹性ipv4地址都免费，但超过1小时未绑定实例的IPv4地址会收费，删除实例后记得删弹性ip；
>
> ​	3）Lightsail会分配固定的公网ipv6，但在删除实例或手动禁用ipv6后，原ipv6地址也将释放无法找回；
>
> ​	4）EC2默认不带IPv6地址，可按教程免费开通，另附文档；
>
> 4、TIPS：
>
> ​	1）所有付费服务都会按当月天数均分计价，比如硬盘，创建30G，假设每G为0.1美元，当月30天，则后台显示为30G/30天=每天1G使用量，每过一天增加1G使用费，假设使用了10天后删除实例和硬盘，则实际使用量为1G*10天=10G，收费0.1美元/G*10G=1美元；
>
> ​	2）免费套餐文档：https://aws.amazon.com/cn/free/free-tier-faqs
>
> ​	3）EC2计费文档：https://aws.amazon.com/cn/ec2/pricing/on-demand/
>
> ​	4）Lightsail文档：https://lightsail.aws.amazon.com/ls/docs/zh_cn/articles/amazon-lightsail-frequently-asked-questions-faq

简单说EC2可以同时有2个实例，一个windows一个linux，共享每月100G流量，共享一个30G的免费硬盘



## EC2

EC2对电信非常不友好，基本ping都在150以上，日本最低，新加坡起步200，香港疯狂绕路也是200多，移动和联通都是直连，体验都不错。

这里可以看到各个区的可用ip，大概能看一下延迟

> http://ec2-reachability.amazonaws.com/

开了一个新加坡的，第一次就被墙了，第二次250+ping，第三次才轮到个200ping的

![image-20230314235532568](https://img.elmagnifico.tech/static/upload/elmagnifico/202303142358268.png)



## Lightsail

就是轻量服务器，和腾讯云的很像，只是带宽给的比较高，流量也多有1T，不过网络是相同情况，电信拉闸，移动联通还不错

很多机场都是弄了很多月抛，用着Lightsail



## CloudFront

今日重点是CloudFront，Cloudflare用的人比较多，据说CloudFront效果更好

CloudFront每月有1T流量，基本用不完。



首先是设置需要加速的域名，直接填进去，仅仅处理HTTPS，最低的SSL选择TLSv1

![image-20230315004632678](https://img.elmagnifico.tech/static/upload/elmagnifico/202303150046726.png)

取消压缩和使用传统缓存模式

![image-20230315004509686](https://img.elmagnifico.tech/static/upload/elmagnifico/202303150045732.png)

设置里使用所有边缘站点，支持的HTTP都勾上

![image-20230315004729675](https://img.elmagnifico.tech/static/upload/elmagnifico/202303150047729.png)

然后创建分配，等待他启用即可

![image-20230315004849508](https://img.elmagnifico.tech/static/upload/elmagnifico/202303150048543.png)

启用以后会得到一个cloudfront.net的域名，这个域名就是加速后的域名

启动以后就可以直接访问这个域名，看看是不是可以进到加速的网址里

同理代理中使用的域名就修改成这个域名即可，如果还想隐藏一下CDN，可以加个CNAME，再套一层

![image-20230315010222264](https://img.elmagnifico.tech/static/upload/elmagnifico/202303150102305.png)

然后就正常工作啦

- 注意，如果开了cloudflare的proxy，那么需要关闭才能用cloudfront，不能同时使用2个CDN

不优选的情况下，延迟感还是非常明显的，至于速度，我感觉和cloudflare差不多，可能还是看优选ip的情况吧



#### 优选IP

cloudfront和cloudflare都可以优选ip，来源参考这里

> https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips

优选以后速度会有提升，但是这个选ip太麻烦了，懒得弄



#### 自定义端口

cloudfront比cloudflare强的一点就是它可以自定义端口，也就是不会锁死你在某些特定的端口上

众所周知cloudflare的https只能使用下面这些端口

```
443
2053
2083
2087
2096
8443
```

如果服务器的443被封了或者整个ip被封了，那么就可以通过修改这里的端口设置，改到任意端口

- cloudfront可以支持80, 443, 1024到65535中的任意端口



![image-20230315233429618](https://img.elmagnifico.tech/static/upload/elmagnifico/202303152334684.png)

注意这样修改完了以后，是访问cloudfront给出来的域名就等于直接访问你的源域名+端口了，所以代理里不需要设置你源域名的端口，而是设置为443，这一点非常关键

![image-20230315233747063](https://img.elmagnifico.tech/static/upload/elmagnifico/202303152337099.png)



## Summary

优选IP还是太麻烦了



## Quote

> https://hostloc.com/thread-1136724-1-1.html
>
> https://youtu.be/4O5k5HVZB_o


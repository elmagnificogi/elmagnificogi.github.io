---
layout:     post
title:      "TTRSS迁移到腾讯云"
subtitle:   "轻量服务器"
date:       2020-07-13
update:     2022-02-14
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tags:
    - VPS
    - TTRSS
---

## Foreword

从6月30日开始，阿里云国际新加坡2.5刀再也没了，然后由于是月底买的所以续费了一下个月，也就是七月多就要没了，至于阿里云国际的新手套餐3.0的轻量，实在不太行所以一直在观望，本来之前想买水墨云的香港，但是只有年付而且不稳，所以一直没下手。

好巧不巧，腾讯云轻量竟然出了国外的服务器，一个硅谷一个新加坡，毫无疑问，上新加坡。

据说后面还会出轻量香港，延迟会更低一些，等出了再说吧



香港已出，并且也申请到了购买资格，比新加坡的延迟还是低非常多的

```
腾讯云轻量IP
新加坡
119, Netflix(x) , Youtube Premium(✓), 谷歌学术(×)
129, Netflix(√,新加坡区) , Youtube Premium(✓), 谷歌学术(√)
150, Netflix(√,新加坡区) , Youtube Premium(√), 谷歌学术(×)
129C段192-223 YouTube premium(x)

香港
119, Netflix(×) , Youtube Premium(√,香港区), 谷歌学术(×)
101, Netflix(√,新加坡区) , Youtube Premium(√), 谷歌学术(√)
124, Netflix(√,新加坡区) , Youtube Premium(√), 谷歌学术(×)
129,Netflix(√,新加坡区) , Youtube Premium(√), 谷歌学术(√)
150, Netflix(√,新加坡区) , Youtube Premium(√), 谷歌学术(×)
129，C段8～15Youtube Premium(X)

硅谷
49,Netflix(×) , Youtube Premium(√,香港区), 谷歌学术(×)
170.106.X.X，奈菲（新加坡区），Youtube Premium（X，原来是GB区，现在被认为中国区了），谷歌学术（X）
```

## 轻量新加坡

150 ip开头，感觉速度稍微有点不稳吧，30M，1c，2g，34月付，还是挺实惠的，加上之前用阿里云的0.5g内存，每天不定时卡死，真的难受坏了，所以挑了2g的内存。

如果是水墨云，大概45/月，1c，1g，100M，但是必须年付， 有点危险，虽然也挺好的，不过有腾讯大厂，还是先耍腾讯吧，不过水墨云最近天天被攻击，导致实际上嘛，效果也就那样吧。

当然二者都是CN2 gia，不过水墨对移动和联通用户可能更友好一些，腾讯差了点。

## 轻量香港

101开头的ip，实测延迟10ms左右，非常舒服，youtube也能跑满，甚至能超速，实际没有开任何bbr或者锐速相关加速，完全原生。

从前面的表里也能看到，101支持Netflix，也支持youtube，还有谷歌学术。

然后之前101非常难开，一直都只能开出来119的，但是119的网络也非常好，除了ip这几个地方有限制，其他都很完美，由于不支持换IP，工单投诉了几波以后，101ip大量放出来了，随便买就能买到了

#### 移除腾讯监控

当然这个只是部分，据说如果要全移除还是得在线重装系统，不过我也不干啥就不折腾了。

```
/usr/local/qcloud/stargate/admin/uninstall.sh
/usr/local/qcloud/YunJing/uninst.sh
/usr/local/qcloud/monitor/barad/admin/uninstall.sh
rm -fr /usr/local/qcloud
```

接着就是bbr+v2ray+ws全套搞上去，测试正常就行了。

## TTRSS迁移

其实之前已经迁移过一次了，不过还是记录一下吧，防止找不到了

#### Postgres 数据库迁移

首先数据库有两种办法迁移，第一种就是直接复制粘贴整个数据库本地存储的内容，但是非常大，我有大概1个多g，迁移起来有点麻烦（而且会出现一个问题，就是如果你的TTRSS很久没更新，直接copy过去的数据库版本对不上，就会导致启动报错，一堆问题，建议还是导出迁移）

在迁移之前先做好备份：

1. 停止所有服务容器：

   ```bash
   docker-compose stop
   ```

2. 复制 Postgres 数据卷 `~/postgres/data/`（或者你在 docker-compose 中指定的目录）至其他任何地方作为备份

3. 在启动一次

   ```
   docker-compose up 或者 只启动 postgres的容器
   ```

4. 执行如下命令来导出所有数据：

   ```bash
   docker exec postgres pg_dumpall -c -U 数据库用户名 > export.sql
   如果没修改过数据库名，就用下面的:
   docker exec postgres pg_dumpall -c -U postgres > export.sql
   ```

5. 根据最新docker-compose.yml中的

   ```
   database.postgres
   ```

   部份来更新你的 docker-compose 文件（注意: `DB_NAME` 不可更改），并启动：

   ```bash
   docker-compose up -d
   ```

6. 执行如下命令来导入所有数据：

   ```bash
   cat export.sql | docker exec -i postgres psql -U 数据库用户名
   如果没修改过数据库名，就用下面的:
   cat export.sql | docker exec -i postgres psql -U postgres
   ```

7. 测试所有服务是否正常工作

这样就基本可以正常工作了，啥配置基本都在，如果是老版本升级可能有些配置需要重新再配一下，最新版的基本没啥问题了。



#### 保持老版本Postgres 

源码目录下有好几个docker-compose.yml文件，其中docker-compose.pg12.yml就是老版本的，不选择升级，留在老版本一样没有什么大问题，由于主分支升级太快了，所以我选择老版的docker-compose文件。



#### 6 Could not resolve host

突然遇到了整个ttrss不更新的情况，然后看了一下信息是无法解析域名了，任何host都不行。

> https://github.com/HenryQW/Awesome-TTRSS/issues/336

检查dns设置发现没问题

```
 cat /etc/resolv.conf 
```

检查防火墙，发现防火墙好像出问题了，彻底关闭了，理论上也没问题。

开启防火墙以后，又发现NAT确实没开启，于是开启NAT，问题依然存在

```
firewall-cmd --query-masquerade
no
firewall-cmd --zone=public --add-masquerade --permanent
firewall-cmd --reload
```

然后重启了整个docker，就好了....



## Quote

> http://ttrss.henry.wang/zh/
>


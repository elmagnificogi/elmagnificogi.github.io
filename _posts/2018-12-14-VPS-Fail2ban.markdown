---
layout:     post
title:      "Fail2ban-处理vps暴力登陆"
subtitle:   "centos 7,Firewall"
date:       2018-12-14
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - vps
    - firewall
---

## Foreword

之前一直没注意过vps的ssh暴力破解有多严重，无意间发现我闲置的腾讯云里面竟然登陆失败信息有10M大？？？？

一般1M就认为有人在暴力破解了，一查看详细信息更是吓人，根本停不下来。

#### 查看是否有暴力登陆迹象

查看之前成功登陆的信息，reboot是系统管理员，比如阿里云后台重置密码什么的，就是这个用户登陆了。

    last

![SMMS](https://i.loli.net/2018/12/14/5c131004820f7.png)

查看失败登陆的信息，这里面基本全都是来暴力破解的选手

    lastb

![SMMS](https://i.loli.net/2018/12/14/5c131056b852a.png)

查看每日登陆失败的次数

    cat /var/log/secure* | grep 'Failed password' | grep sshd | awk '{print $1,$2}' | sort | uniq -c

查看登陆log文件大小：

    du -h /var/log/secure

#### Fail2ban

##### 安装

    yum -y install epel-release        #已经安装，请自动略过。
    yum install fail2ban fail2ban-systemd
    cp -pf /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    vi /etc/fail2ban/jail.local

修改如下内容：

    before = paths-fedora.conf        # 36行
    
    ignoreip = 127.0.0.1/8            # 50行，不封禁的IP及IP段，多段用空格隔开。
    
    bantime  = 8640000                # 59行，封禁时间100天
    findtime  = 600                   # 63行，单位秒，暴力破解IP的查询窗口时间
                                      # 意为10分钟内失败次数达到封禁界限将被封禁
    maxretry = 6                      # 66行 尝试猜测6次用户名，封禁此IP
    backend = gamin                   # 87行
    
    vim /etc/fail2ban/jail.d/sshd.local

修改内容如下：

    [sshd]
    enabled = true                # 打开监控
    port = ssh                    # 监视端口ssh
    logpath = %(sshd_log)s
    maxretry = 6                  # 尝试猜测6次用户名，封禁此IP
    bantime = 8640000             # 封禁时间100天

##### 启动

更新SeLinux，并启动

    yum update selinux-policy*
    systemctl start fail2ban.service
    systemctl start firewalld

开机自启动

    systemctl enable fail2ban.service
    systemctl enable firewalld

##### 查看

检查被ban IP

    fail2ban-client status sshd

![SMMS](https://i.loli.net/2018/12/14/5c131433ebef0.png)

查看登陆失败日志

    cat /var/log/secure | grep 'Failed password'

误操作被ban以后解锁ip

    fail2ban-client set sshd unbanip IPADDRESS

清空last和lastb中的记录

    echo > /var/log/wtmp;echo > /var/log/btmp;history -c;

#### firewalld

需要注意由于这里开启了防火墙，那意味着处理后台网站的安全组里要设置开端口，那么防火墙也需要设置开端口，否则之前的服务可能不能正常运行或者无法访问

显示已打开端口

    firewall-cmd --zone=public --list-ports

添加一个tcp/udp端口，重启后也有效

    firewall-cmd --zone=public --add-port=80/tcp --permanent
    firewall-cmd --zone=public --add-port=80/udp --permanent

添加完成后，重载才会生效

    firewall-cmd --reload

删除一个添加的端口

    firewall-cmd --zone=public --remove-port=80/tcp --permanent

## Summary

这样配置了以后，在lastb中还是能看到有破解的迹象，但是暴力破解基本不存在了。

这个配置是10分钟内6次失败就自动ban，但是如果是想针对所有暴力破解的需要把这个十分钟延长，
延长到一周或者是三四天，这样的话大时间范围内所有登陆失败的对象都会被直接封禁，比较符合更安全的设定。

当然还有两种方式，一个是改变ssh端口，让对方找不到你端口，也就无从暴力破解，另一种就是密钥登陆的模式，更安全的密码，让这样的暴力破解基本无效。

## 后记

2018-12-21

国内还是牛逼啊，腾讯云一周时间ban了455个IP

阿里云国际，一周ban了11个IP

## Quote

> https://cloud.tencent.com/info/240589cfb7d7ea5475917b1b536afe09.html
>
> https://www.cnblogs.com/anech/p/6867589.html
>
> https://www.longger.net/article/270a0c33.html
>
> https://www.cnblogs.com/zdz8207/p/linux-systemctl.html
>
> https://www.cnblogs.com/moxiaoan/p/5683743.html

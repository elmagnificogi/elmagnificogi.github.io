---
layout:     post
title:      "Centos8.2安装Xfce，配置VNC远程桌面"
subtitle:   "AP,Router"
date:       2022-07-01
update:     2022-07-01
author:     "elmagnifico"
header-img: "img/z3.jpg"
catalog:    true
tags:
    - CentOS
    - VPS
---

## Forward

Centos8.2安装Xfce，配置VNC远程桌面



## 准备

更新一下包

```shell
sudo yum grouplist
sudo dnf upgrade --refresh -y
```



安装epel-release

```bash
yum install epel-release -y

sudo dnf --enablerepo=epel group
```



启动PowerTools，这个东西不同版本名字好像还不同，有的是powertools 

```bash
sudo dnf config-manager --set-enabled PowerTools
```

确认PowerTools已经启动了

```bash
sudo dnf repolist
```

![image-20220701113154348](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220701113154348.png)



## 安装Xfce

安装xfce组件

```bash
yum groupinstall xfce -y
```

确认xfce已经安装了

```bash
sudo dnf group list
```

![image-20220701113224375](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220701113224375.png)

安装桌面

```bash
sudo dnf groupinstall "Xfce" "base-x"
```

启动xfce

```bash
systemctl isolate graphical.target
```



## 安装VNC

安装vnc server

```bash
yum install tigervnc tigervnc-server
```

复制配置模板文件，编辑配置文件

```bash
sudo cp /lib/systemd/system/vncserver@.service /etc/systemd/system/vncserver@:1.service
sudo vim /etc/systemd/system/vncserver@:1.service
```

将内容替换成root用户的信息

```bash
ExecStart=/usr/sbin/runuser -l root -c "/usr/bin/vncserver %i"
PIDFile=/root/.vnc/%H%i.pid
```

重新加载配置文件

```bash
sudo systemctl daemon-reload
```

设置vnc账户密码

```bash
vncpasswd root
```

启动vnc server

```bash
vncserver
```

查看启动后的端口是否正常 5901

```bash
netstat -ntlp
```

![img](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/6fb9a3858bc7451983ec6c16f3e38d7b.png)

安全组开启5901的端口



## windows 安装VNC

直接安装64位版本，一路默认即可

> https://www.tightvnc.com/download.php



## 测试

![img](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/56bbdc3d1e144fabb97129a1cbf181d2.png)

已经可以成功连上了

![image-20220701113341518](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/image-20220701113341518.png)



## 安装arm-none-eabi-gcc

yum没有 gcc-arm-none-eabi ， 所以只能通过wget安装了

```
wget https://developer.arm.com/-/media/Files/downloads/gnu-rm/10.3-2021.10/gcc-arm-none-eabi-10.3-2021.10-x86_64-linux.tar.bz2
```



```

```



## Summary

还有很多其他的相关配置，可以看引用，写的比较详细，我只是用来确保桌面环境库存在，能安装SES而已，其他的倒是无所谓了



## Quote

> https://blog.csdn.net/weixin_45621014/article/details/124773109
>
> https://serverfault.com/questions/997896/how-to-enable-powertools-repository-in-centos-8
>
> https://blog.csdn.net/qq_33899456/article/details/119704171

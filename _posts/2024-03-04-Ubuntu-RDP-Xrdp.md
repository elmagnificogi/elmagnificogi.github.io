---
layout:     post
title:      "Ubuntu Xrdp"
subtitle:   "远程"
date:       2024-03-04
update:     2024-03-04
author:     "elmagnifico"
header-img: "img/bg3.jpg"
catalog:    true
tobecontinued: false
tags:
    - Ubuntu
---

## Foreword

Ubuntu 使用window的rdp协议进行远程



## Xrdp

Ubuntu 使用 18.04版本



先更新一下，否则可能拉不到包

```
sudo apt update
sudo apt-get upgrade
```



### 安装

安装xrdp

```
sudo apt install xrdp -y
sudo apt install xfce4 xfce4-goodies xorg dbus-x11 x11-xserver-utils -y
```



打开xrdp

```
sudo systemctl enable xrdp 
sudo systemctl start xrdp 
```



防火墙放行3389远程端口

```
sudo ufw enable

sudo ufw allow 3389

sudo ufw reload
```



添加启动后的桌面，否则会一直青屏，好像没登录一样

```
vi ~/.xsessionrc
```



输入以下内容

```
export GNOME_SHELL_SESSION_MODE=ubuntu
export XDG_CURRENT_DESKTOP=ubuntu:GNOME
export XDG_CONFIG_DIRS=/etc/xdg/xdg-ubuntu:/etc/xdg

```

重启xrdp，让配置生效

```
sudo systemctl restart xrdp
```



检测xrdp是否启动

```
sudo systemctl status xrdp

● xrdp.service - xrdp daemon
   Loaded: loaded (/lib/systemd/system/xrdp.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2024-03-04 00:57:52 PST; 15min ago
     Docs: man:xrdp(8)
           man:xrdp.ini(5)
 Main PID: 2430 (xrdp)
    Tasks: 2 (limit: 9453)
   CGroup: /system.slice/xrdp.service
           ├─2430 /usr/sbin/xrdp
           └─3422 /usr/sbin/xrdp

```



### 测试

使用mstsc登录

![image-20240304171748785](https://img.elmagnifico.tech/static/upload/elmagnifico/202403041717826.png)

![image-20240304171217163](https://img.elmagnifico.tech/static/upload/elmagnifico/202403041712236.png)

输入对应的账号和密码即可



需要注意，xrdp登录需要把虚拟机或者其他方式已经登录的同账号`logout` 否则会一直卡黑屏，进不去。



## Summary

一直没配启动桌面，导致青屏了好久，找不到原因



## Quote

> https://docs.e2enetworks.com/guides/ubuntu_xrdp.html
>
> https://linuxize.com/post/how-to-install-xrdp-on-ubuntu-18-04/
>
> https://cloud.tencent.com/developer/article/2355160


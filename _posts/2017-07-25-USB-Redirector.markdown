---
layout:     post
title:      "USB-Redirector"
subtitle:   "Tools"
date:       2017-07-25
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.png"
catalog:    true
tags:
    - Ubuntu
    - Tools
---

## Foreword

之前的工作环境是在 ubuntu 下，由于经常要切换 ubuntu 和 win10 非常麻烦，所以用了虚拟机,
一直用的都是 VMware，但是 VMware 的图像显示能力太差了，加上机器自身也没有独显只有集显，Gvim中拖动分屏，各种马赛克，为了解决这个试用了 Hyper-V ，发现效果还可以，但是也有问题， Hyper-V 在 ubuntu 下不支持更高级的 Guest 模式，就无法使用物理机的各种USB设备，为了解决这个问题就有了本篇。

### USB over Network

> USB over Network 5 is a major update of our flagship product for working with remote USB devices over LAN or the Internet. The remote USB devices can be shared for several users. When you connect remotely shared USB devices, they are recognized as if they were connected directly to your local machine.
>
> http://www.usb-over-network.com

简单说就是可以通过局域网或者是网络，共享某个主机上的USB设备

### Usb over Ip

USB over Network 的前生

### USB Network Gate

> USB Network Gate (former USB over Ethernet Connector) easily connects one or more remote USB devices to your computer over Network (Internet/LAN/WAN) as if the device was plugged into your own machine. Doesn't matter if you are in other country or in next door office, you can always use remote scanner, printer, webcam, modem, USB dongle or anything else as if they were connected directly to your PC.
>
> http://www.usb-over-network.com/

### USB over Ethernet

USB Network Gate 的前生

### USB Redirector

>USB Redirector - Powerful Solution for Remoting USB Devices
This software product allows to use shared USB devices remotely through a LAN, WLAN or Internet, just as if they were attached to your computer directly! USB Redirector provides quick resolution of your remote USB needs! It can act as both USB server and USB client, as well as there is a separate light-weight FREE client available. USB Redirector uses a regular TCP/IP connection for communication.
>
> http://www.incentivespro.com/usb-redirector.html

### 选择

这三款软件都能实现在 hyper-v 中进行 USB分享，不过看一下价格就知道了，每个都很贵，150$以
上，其中 USB over Network 无法下载 linux 的客户端，服务端倒是能下载 ，我想试用一下都不
行。

USB Redirector 自带15天的试用期，而且他的客户端都是免费的，只有服务端是需要收费的，而且
客户端和服务端都能下载， 于是就选择了它

### 安装

##### windows

windows下一路next 就ok了，就是需要重启一次。

如果重启以后还打不开，那有可能是他服务被关闭了

    打开 services.msc
    找到 USB Redirector Service
    启动 -- 自动

##### linux

```
解压安装包
安装客户端
sudo ./install install-client
如果需要安装服务端的话
sudo ./install install-server
```
当然前提是你要有 gcc make 以及Kernel  sources 或 kernel headers

### 使用

##### windows

选择需要共享的USB设备，共享就好了

##### linux


首先添加服务端

    usbclnt -addserver 192.168.0.10:32032

端口也能改，不过一般都是32032，就填对应的服务器IP

添加好以后，就可以查看可用USB设备和服务器

```
usbclnt -l

================= USB CLIENT OPERATION SUCCESSFUL ===============
List of USB servers and devices:

  2: USB server at 192.168.2.157:32032
     Mode: manual-connect   Status: connected
  |
  `-   5: J-Link
          Vid: 1366   Pid: 0101   Serial: 000269402504
          Mode: manual-connect   Status: not available
===================== ======================= ===================
```

连接对应的设备

```
usbclnt -c 2-5

====================== OPERATION SUCCESSFUL =====================
USB device connected
===================== ======================= ===================
```

每次开机自动连接对应的设备

```
usbclnt -autoconnect on 2-5

====================== OPERATION SUCCESSFUL =====================
Device switched to auto-connect mode
===================== ======================= ===================
```

这样以后就能在 hyper-v 中正常使用任何你想要用的usb了，跟实际的usb体验差不多，当然速度上会慢一些

### 异常处理

一次异常断电以后出现了下面的问题，只要使用 usbclbnt ，就会有下面的提示

```
******************** ERROR ***********************
Cannot connect to USB Redirector daemon.
Please make sure usbsrvd is loaded. If the module
is not loaded, please contact our support team.
Error log can be found at /var/log/tusbserver.log
**************** **************** ****************
```

查看过 log ，并没有任何异常的提示

查看是否服务开启了

```
ls /etc/init.d/ | sort | grep usb
rc.usbsrvd
```

重启服务
```
sudo /etc/init.d/rc.usbsrvd restart
Starting USB Redirector:  /sbin/insmod /usr/local/usb-redirector/bin/tusbd.ko
insmod: error inserting '/usr/local/usb-redirector/bin/tusbd.ko': -1 Invalid module format
                          Cannot load stub driver! Please reinstall the software.
```

发现错误
```
root@ricardo-desktop:/home/ricardo/usb-redirector-linux-arm# dmesg
...
[    7.268520] tusbd: version magic '4.8.0-58-generic SMP mod_unload modversions ' should be '4.10.0-27-generic SMP mod_unload '
...
```

出现这个问题有可能是某个 kernel headers文件损坏了，也有可能是内核更新了，和当时安装所用的内核文件不一致了

要解决这个问题，就需要先删除当前的头文件并且卸载当前的usb-redirector，然后重装

卸载
```
sudo apt remove linux-headers-`uname -r`
sudo apt autoremove
sudo ./uninstall.sh uninstall
```

重装
```
sudo apt-get install linux-headers-`uname -r`
sudo ./install install-client
```

重装之后恢复正常

## Summary

试用期的15天内都使用正常，除了异常断电后出了上面的问题，再就没有遇到其他问题了

目前最新版是6.7，然而实际上6.1版本也能与6.7适配混合使用。

## Quote

> http://www.incentivespro.com/forum/viewtopic.php?p=1213

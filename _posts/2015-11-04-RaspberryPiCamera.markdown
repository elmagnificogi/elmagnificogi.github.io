---
layout:     post
title:      "树莓派 & Camera"
subtitle:   "树莓派，vlc,网络流视频"
date:       2015-11-04
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.png"
tags:
    - 树莓派
    - RaspberrryPi
---


## 环境

Camera：树莓派原装的摄像头

system：2015-09-24-raspbian-jessie

RaspberryPi：Raspberry Pi 2

## 摄像头安装

在RJ-45的网络口旁边的一排就是摄像头

上面是有标camera的

装的时候要稍微用力捏两边的卡子就能打开了

摄像头排线蓝色的一面对着网口

一定要对齐，插入，然后把卡子合紧按下去。

## 摄像头测试

老系统需要先升级一下，防止没有摄像头相关程序

	sudo apt-get update 
	sudo apt-get upgrade 

然后配置一下树莓派，确保摄像头是开启的

	sudo raspi-config

测试摄像头，这会显示5s的动态摄像头画面，然后将最后的结果保存到test.jpg中去

	raspistill -v -o test.jpg

通过以上测试，确保你的摄像头没问题，然后开始下一步

## vlc摄像头网络视频流

首先在你的树莓派上装上vlc

	sudo apt-get install vlc

装好以后，启动vlc视频流

使用PI官方的raspivid捕获视频工具把视频流输出到vlc，通过vlc转码成h264网络视频流通过http协议以ts的形式封装，然后输出到8090端口

	sudo raspivid -o - -t 0 -w 640 -h 360 -fps 25|cvlc\
	 -vvv stream:///dev/stdin --sout '#standard{access=http,mux=ts,dst=:8090}'\
	 :demux=h264

这时你的树莓派如果接了屏幕，就会看到全屏的摄像头画面

如果你用windows 下一个vlc

然后选择媒体-流-网络

输入

	http://192.168.1.102:8090

前面的ip地址则是你树莓派的静态ip地址

不要用串流，直接选择播放就可以看摄像头的画面了

## 禁用摄像头开启的红色Led

可以用来禁止摄像头开启时，会有红色led亮（貌似可以干什么坏事？）

	sudo nano /boot/config.txt
	disable_camera_led=1

## The end

最后如果想网络直播？貌似可以做一个视频服务器转发到网络上就可以了？

我最终的目的是想，让树莓派成为机器的一个外置摄像头（因为我笔记本摄像头坏了，虽然有手机），可以直接在qq等地方打开的当作本地视频摄像头用（额，有点大材小用），等我学会了再来更这篇文章

## Quote

> https://www.rpicn.org/?s=%E6%91%84%E5%83%8F%E5%A4%B4
> http://bbs.ickey.cn/group-topic-id-14728-page-1





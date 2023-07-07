---
layout:     post
title:      "Sony-WF1000XM4降级指南"
subtitle:   "降级，Headphones，MDR_Proxy"
date:       2023-07-07
update:     2023-07-07
author:     "elmagnifico"
header-img: "img/y3.jpg"
catalog:    true
tobecontinued: false
tags:
    - Equip
    - Goods
    - Share
---

## Foreword

Sony-WF1000XM4之前升级到了2.0，没想到降噪真的降低了，人声听的清清楚楚，拉跨啊，和Apple Airpods Pro 比起来差远了，甚至最简单的空调声音都不能滤干净了。

无意间看到了一个降级帖子，没想到还挺多人用的，就来试试。

> https://tieba.baidu.com/p/8348981777



## MDR_Proxy

> https://github.com/lzghzr/MDR_Proxy

简单说耳机升级是通过APP升级的，要降级自然也是通过APP，不过这个APP已经被破解了，可以使用不安全地址来获取固件信息。

MDR_Proxy就是用来代理升级链接的。



先下载`MDR_Proxy.zip`和`Headphones_9.4.0_unsafe.zip`

> https://github.com/lzghzr/MDR_Proxy/releases/tag/0.2.0



电脑上解压MDR_Proxy，手机上先删除老的Headphones，并且安装这个老的破解版本，打开Headphones，各种条款允许，各种跳过和稍后，一直到可以进入仪表板为止，然后就可以把程序终止运行了，为后续操作准备。



下载固件，非常全，大部分Sony耳机的固件都有

![image-20230708000135474](https://img.elmagnifico.tech/static/upload/elmagnifico/202307080001528.png)



> https://mega.nz/file/a3hzGBDC#47OBi4Vr02NSKlD6KL-g9Z5NlefErDe_jeunzcwhcbY

下载下来以后解压到`MDR_Proxy\custom`路径中

![image-20230708000100373](https://img.elmagnifico.tech/static/upload/elmagnifico/202307080001465.png)



接着启动`run.cmd`，选择强刷自定义固件，然后根据耳机选择对应的固件，这里选了1.6.1版本

- 如果选择2强制切换固件会让你选择地区，我建议体验一下日本，中国我已经体验过了，烂透了。

![image-20230708000324647](https://img.elmagnifico.tech/static/upload/elmagnifico/202307080003676.png)



确保手机和电脑在同一个网络中，然后手机Wifi选择高级，修改代理选项，选择手动

![image-20230708000733335](https://img.elmagnifico.tech/static/upload/elmagnifico/202307080007377.png)



主机名填启动MDR_Proxy的PC的IP地址，端口填上面提示的`8848`，其他地方留空，然后保存连接即可



打开手机Headphones，这时会提示有新固件的信息，选择开始即可

![image-20230708000701158](https://img.elmagnifico.tech/static/upload/elmagnifico/202307080007244.png)



当正确连接就能看到如下图提示

![image-20230708000220340](https://img.elmagnifico.tech/static/upload/elmagnifico/202307080002378.png)

![image-20230708002938605](https://img.elmagnifico.tech/static/upload/elmagnifico/202307080029669.png)

剩下就是等升级完成

![image-20230708004106326](https://img.elmagnifico.tech/static/upload/elmagnifico/202307080041424.png)

传输完成以后开始升级，66%左右会提示更新失败，实际上已经成功了，此时耳机提示重启开机了，再度连接查看版本，就能看到是1.6.1了



**降级会有一个问题，左耳的触控语音会变成固定的`替换蓝牙设备2`，原本的功能可能是降噪和蓝牙切换的语音**

解决办法，首先把耳机恢复出厂设置，然后在APP上关闭语音助手，这个功能会导致一直播报替换蓝牙设备2的语音，注意不能关闭语音向导，关闭会导致这个错误的播报又出现了。

如果要使用语音助手，再次打开，多操作几次就会发现错误的语音消失了（但是首次使用依稀还是能听到错误的语音）



**要彻底改变这个问题，就是切换语音向导的语言，从中文切换到英文，所有功能都会正常！**



## Summary

强行给1000XM4续命，垃圾产品



## Quote

> https://www.mrwalkman.com/p/mdrproxyfwsidegradetool.html
>
> https://www.coolapk.com/feed/35048130

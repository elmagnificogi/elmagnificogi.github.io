---

layout:     post
title:      "山特UPS控制群晖关机"
subtitle:   "C6K，关机，SSH"
date:       2024-04-18
update:     2024-04-18
author:     "elmagnifico"
header-img: "img/x4.jpg"
catalog:    true
tobecontinued: false
tags:
    - NAS
    - 群晖
    - UPS
---

## Foreword

山特的UPS给ESXi用了，就一路串口，只能二选一，但是同时群晖NAS也需要对应关机，还好winpower里也给出来了网络关机接口



## 群晖开启SSH

![image-20240418163736157](https://img.elmagnifico.tech/static/upload/elmagnifico/202404181637202.png)

默认群晖是未开启SSH，同时root是不允许ssh登录的



先使用默认账号登录进去



切换到root

```
sudo -i
```

可能要输入密码，再次输入管理员密码即可



修改root密码

```
synouser --setpw root 新密码
```



修改ssh，允许root登录

```
vi /etc/ssh/sshd_config
```

![image-20240418164510608](https://img.elmagnifico.tech/static/upload/elmagnifico/202404181645661.png)

然后重启一下ssh即可，面板上去掉勾应用，再勾上ssh就重启了，此时root就可以正常登录了



## winpower

![image-20240418170745089](https://img.elmagnifico.tech/static/upload/elmagnifico/202404181707174.png)

winpower中使用SSH进行远程关机（shutdown -h now），输入ip和账号密码，之后就可以了



## 脚本关机

还有一种关机方式也非常简单，不依赖UPS控制，群晖自主决定关机，当断电的时候，交换机肯定是第一个罢工的，那么此时网口是down的，就能判断是断电了

![image-20240418165627675](https://img.elmagnifico.tech/static/upload/elmagnifico/202404181656711.png)

可以看到eth0就是目前在用的网口



```bash
#!/bin/bash                                                                                                                                 
logFile=~sa/poweroff.log;

eth0=$(cat /sys/class/net/eth0/operstate);
eth1=$(cat /sys/class/net/eth1/operstate);

# 判断4张网卡是不是都是离线的状态，如果离线了，说明交换机没电了，就要关机了
if [[ "$eth0" == 'up' || "$eth1" == 'up' ]]; then
    # 网卡有在线，交换机有电，则记录在线状态到文件
    #$(echo "on-line" > $statusFile);
    echo "Power supply is normal, system is normal.";
else
    #$(echo "off-line" > $statusFile);

    # 所有的网卡都离线了，马上关机
    log="Network offline power supply abnormal, system shutdown now!";
    echo "[`date`]$log" >> $logFile;
    $(shutdown -h now);
fi
```

然后用一个计划任务去执行就行了，但是这种有点不好，如果只是单纯的拔了网线，他这里也会出现自动关机的情况



同理，如果用ping来ping那个ups的主机，同样也会有这个问题，网线拔了，机器自己就关机了（还不止，来电启动的时候也会有类似的问题，主机启动比较慢，能ping的时间有延后，等主机起来可能群晖已经开关机三四次了）



## Summary

还是得专用的UPS配上去更合适



## Quote

> https://post.smzdm.com/p/aevwqww3/
>
> https://blog.csdn.net/2301_81547508/article/details/135365338
>
> https://blog.csdn.net/Linux7985/article/details/131252868

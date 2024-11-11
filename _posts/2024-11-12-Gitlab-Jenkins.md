---
layout:     post
title:      "Gitlab联动Jenkins"
subtitle:   "集成、action、构建"
date:       2024-11-12
update:     2024-11-12
author:     "elmagnifico"
header-img: "img/z9.jpg"
catalog:    true
tobecontinued: false
tags:
    - Jenkins
    - Gitlab
---

## Foreword

Gitlab联动Jenkins完成CI\CD流程



## Jenkins



### Jenkins升级

Jenkins自动升级，完成以后Jenkins就无法启动了，查log可以看到提示说明java版本太老了

Jenkins升级后不再支持java11的，需要安装java17或者21，我这里直接选择21

![image-20241111172051911](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111720958.png)

进入Jenkins目录下，修改jenkins.xml文件，将其中的jdk修改为新安装的jdk，然后重启一点电脑，重启jenkins服务即可



### Gitlab插件

首先Jenkins需要安装Gitlab插件，否则收不到Gitlab的请求

![image-20241111171933060](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111719184.png)

然后在Credentials中添加Gitlab的账号

![image-20241111175616864](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111756898.png)

用户名和密码的形式即可

- 这个操作只要做一次即可

  

![image-20241111175641965](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111756001.png)

创建一个空配置，前面的Gitlab相关选项都不选择，直接选Git 仓库中填入对应地址，选择刚才创建的Gitlab账号

![image-20241111175748241](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111757302.png)

分支选好

![image-20241111180004280](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111800326.png)

选择当推送时进行build，记录下旁边写的webhook的url，有些时候端口可以不要（如果端口是对外使用的），展开下面的高级选项

![image-20241111180030191](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111800264.png)

点击生成token，记录下这个token值，剩下执行脚本或者命令部分就正常填写，没有大差别了，弄好以后保存



## Gitlab

回到Gitlab，由于是内网机器，所以需要开启内网连接的请求

管理员权限，进入设置-网络管理

![image-20241111180351796](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111803867.png)

出站请求中允许本地网络，必要的话可以把本地的域名或者是ip直接给进去，防止被拦截

- 这个操作只需要做一次即可



![image-20241111180528806](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111805906.png)

回到工程中，设置-Webhooks，新建一个，URL使用刚才记录的URL，Secret令牌使用刚才的token，保存

![image-20241111180640920](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111806957.png)

测试，点击推送事件

![image-20241111180631205](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111806250.png)

可以看到正常返回200

![image-20241111180720767](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111807818.png)

Jenkins侧也有正确的响应



## Summary

到这里整个webhook的触发方式就可以正常使用了



## Quote

> https://blog.csdn.net/weixin_63294004/article/details/143671722

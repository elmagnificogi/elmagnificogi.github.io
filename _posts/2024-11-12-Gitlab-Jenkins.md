---
layout:     post
title:      "GitLab联动Jenkins"
subtitle:   "集成、action、构建"
date:       2024-11-12
update:     2024-11-12
author:     "elmagnifico"
header-img: "img/z9.jpg"
catalog:    true
tobecontinued: false
tags:
    - Jenkins
    - GitLab
---

## Foreword

GitLab联动Jenkins完成CI\CD流程



## webhooks方式

### Jenkins



#### Jenkins升级

Jenkins自动升级，完成以后Jenkins就无法启动了，查log可以看到提示说明java版本太老了

Jenkins升级后不再支持java11的，需要安装java17或者21，我这里直接选择21

![image-20241111172051911](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111720958.png)

进入Jenkins目录下，修改jenkins.xml文件，将其中的jdk修改为新安装的jdk，然后重启一点电脑，重启jenkins服务即可



#### GitLab插件

首先Jenkins需要安装GitLab插件，否则收不到GitLab的请求

![image-20241111171933060](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111719184.png)

然后在Credentials中添加GitLab的账号

![image-20241111175616864](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111756898.png)

用户名和密码的形式即可

- 这个操作只要做一次即可

  

![image-20241111175641965](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111756001.png)

#### GitLab API token

还有一种方式创建GitLab API token，这种是有使用年限的

![image-20241111183756934](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111837996.png)

系统设置中的GitLab，然后添加Credentials，选择GitLab API token

![image-20241111183824235](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111838308.png)

这个token可以从GitLab用户设置中创建

![image-20241111183919335](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111839391.png)

- 注意token有效期只有1年

然后把token复制到jenkins那边，通过右侧的`Test Connection`就能测试出来token是否可以使用

![image-20241111184053987](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111840013.png)

正常的话就显示Success

这种方式创建的token，在配置CI的时候，可以不选择credentials，Jenkins会自动帮你匹配对应的GitLab库的token



#### 测试配置

创建一个空配置，前面的GitLab相关选项都不选择，直接选Git 仓库中填入对应地址，选择刚才创建的GitLab账号

![image-20241111175748241](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111757302.png)

分支选好

![image-20241111180004280](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111800326.png)

选择当推送时进行build，记录下旁边写的webhook的url，有些时候端口可以不要（如果端口是对外使用的），展开下面的高级选项

![image-20241111180030191](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111800264.png)

点击生成token，记录下这个token值，剩下执行脚本或者命令部分就正常填写，没有大差别了，弄好以后保存



### GitLab

回到GitLab，由于是内网机器，所以需要开启内网连接的请求

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

到这里整个webhook的触发方式就可以正常使用了



## 集成方式

按道理说GitLab和Jenkins还有另外一个集成的地方，但是前面几次测试都提示缺少Token，导致并不能触发。

按理来说集成方式应该是最简单的，这里重新参考了官方的配置指南，并且重试了一遍流程以后发现可以走通

Webhook中的GitLab API token的配置操作需要提前做完，然后才能接着操作

![image-20241111192137585](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111921643.png)

Jenkins中新建一个配置，这次选择GitLab连接和仓库名称，千问不要写错了

![image-20241111192228739](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111922811.png)

下面的配置里勾上tag和merge触发，其实不勾也行。

注意高级中，一定要确保下面的secret token是空白的，如果不是使用clear清空他

![image-20241111192327327](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111923363.png)

![image-20241111192346776](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111923817.png)

最后构建选择Publish build status to GitLab，就可以把状态返回回来了



![image-20241111192605510](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111926565.png)

回到GitLab的仓库中，在集成-Jenkins中启用集成，并且输入Jenkins的URL，然后输入Jenkins的配置名称

- 注意是Jenkins的配置名称，不是项目名称

![image-20241111192705639](https://img.elmagnifico.tech/static/upload/elmagnifico/202411111927685.png)

接着输入Jenkins的账号和密码，保存，测试设置，就能看到正常工作了



## Summary

还得是官方文档，全网大部分都是一通乱操作，最后都走到了webhooks的方式中去了，而集成是最简单的



## Quote

> https://blog.csdn.net/weixin_63294004/article/details/143671722
>
> https://blog.csdn.net/weixin_43546282/article/details/129130533
>
> https://www.cnblogs.com/ygbh/p/17483811.html#_label3_1_3_2
>
> https://docs.GitLab.com/ee/integration/jenkins.html#grant-jenkins-access-to-the-GitLab-project

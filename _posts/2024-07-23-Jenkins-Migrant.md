---
layout:     post
title:      "Jenkins迁移"
subtitle:   "windows，linux，腾讯云，镜像"
date:       2024-07-23
update:     2024-07-23
author:     "elmagnifico"
header-img: "img/x13.jpg"
catalog:    true
tobecontinued: false
tags:
    - Jenkins
---

## Foreword

迁移Jenkins



## 腾讯云镜像导出

如果腾讯云镜像是windows，无法下载到本地，无论怎么弄都不行，所以只能手动迁移

![image-20240723182041459](https://img.elmagnifico.tech/static/upload/elmagnifico/202407231820525.png)



如果腾讯云轻量镜像是Linux，可以通过几个间接的办法把整个镜像下载下来

1. 选择轻量服务器，制作镜像
2. 轻量服务器的镜像菜单中的共享镜像，共享给云服务器CVM
3. 进入云服务器的镜像菜单，同地域复制，随便复制到一个地方，它就变成了自定义镜像
4. 此时就可以通过自定义镜像进行下载

![image-20240723182058595](https://img.elmagnifico.tech/static/upload/elmagnifico/202407231820634.png)



## Windows Jenkins迁移

首先确保Jenkins版本一致，如果不一致迁移会导致很多错误，还不如直接重建

- 强烈建议每次保存一下Jenkins等相关环境的安装包，下次再迁移的时候可以直接安一样的版本

![image-20240723112329435](https://img.elmagnifico.tech/static/upload/elmagnifico/202407231123466.png)

版本一致以后，看一下老的Jenkins存储路径在哪里

![image-20240723112249027](https://img.elmagnifico.tech/static/upload/elmagnifico/202407231141848.png)3

停止jenkins服务，将其整个打包，复制粘贴到新的路径下

- 打包的时候会发现.jenkins非常大，可以用一些在线工具进行传输，直接复制粘贴大文件可能会失败



找了半天的在线直传，只有这个比较好用

> https://www.ppzhilian.com/receiver

![image-20240723144628490](https://img.elmagnifico.tech/static/upload/elmagnifico/202407231446560.png)

启动新的jenkins，理论上和以前是一样的了，可以直接进入，所有配置都一样



## 配置迁移

如果选择不复制，而是导入导出配置，可以通过`jenkins-cli.jar`工具包完成

```
java -jar jenkins-cli.jar -s http://你的服务器:8080/ get-job auth> auth.xml
```



```
java -jar jenkins-cli.jar -s http://你的服务器:8080/ get-job auth < auth.xml
```



还有一种办法，直接复制jobs

linux下目录

```
/root/.jenkins/jobs
$JENKINS_HOME/jobs
```



> https://www.ppzhilian.com/receiver



## Linux Jenkins迁移

Linux 就更简单了，路径比较稳定，直接复制粘贴就行了



## Summary

Jenkins自己没有导出或者迁移相关的选项还是挺奇怪的，不过也有可能是docker用多了，迁移起来也不麻烦吧



## Quote

>  https://blog.csdn.net/u010715243/article/details/118518797
>
>  https://blog.csdn.net/WatcherNight/article/details/135552420
>
>  https://blog.csdn.net/m0_53889456/article/details/132804105




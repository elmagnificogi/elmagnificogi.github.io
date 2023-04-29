---
layout:     post
title:      "Windows下SSH和Jenkins"
subtitle:   "Publish Over SSH，SSH plugin，openSSH，CI"
date:       2023-04-29
update:     2023-04-29
author:     "elmagnifico"
header-img: "img/x7.jpg"
catalog:    true
tobecontinued: false
tags:
    - Jenkins
    - Embedded
---

## Foreword

Github的Action用多了，反过来用Jenkins，发现难用的地方还真多，特别是涉及到了SSH的地方



## SSH

![image-20230429152048908](https://img.elmagnifico.tech/static/upload/elmagnifico/202304291520980.png)

一般来说Jenkins默认是没有远程SSH的能力的

必须要通过插件增加SSH执行脚本的能力，一般是使用`Publish Over SSH`或者是`SSH plugin`，不过这两个插件基本都是五六年没有更新的了，可能会有安全方面的问题



#### Publish Over SSH

这个插件会增加`Send files or execute commands over SSH`功能，但是这个功能执行的SSH完全不会验证是否执行成功

![image-20230429153631321](https://img.elmagnifico.tech/static/upload/elmagnifico/202304291536390.png)

就算Exec command中有命令执行失败了，他依然会正常CI成功，实在是不知道这东西是拿来干嘛的



#### SSH plugin

SSH plugin增加的是`Execute shell script on remote host using ssh`

![image-20230429153827143](https://img.elmagnifico.tech/static/upload/elmagnifico/202304291538193.png)

这个可以正常执行命令，并且会验证命令是否成功，如果返回非0的话，会提示CI失败

但是以上情况都仅限于Linux系统，如果设计的是Windows，那么就又变成了不验证成功，直接返回。

除此以外还有一个Bug，当他连接到SSH的时候，在你的命令执行之前，他会先执行一条命令

```sh
CI=True
```

要知道Windows下面可没有CI这么个变量，执行这条命令必然报错

我通过把`notepad.exe`变成`CI.exe`，让这条命令不再失败了，但是依然会出现后续命令直接返回的情况。

基本上想要Jenkins通过SSH控制Windows执行命令基本不可能了。

插件里也没有任何其他可以SSH windows的插件，要执行Windows BAT就必须原生Jenkins在Windows



## Windows使用Jenkins

Windows下使用Jenkins需要提前装一些东西

```
jdk-11.0.19_windows-x64_bin
jenkins
```

jdk目前支持11和17，太低的版本Jenkins不支持了



最容易出问题的地方就是用户验证这里，需要输入windows的用户名和密码

![在这里插入图片描述](https://img.elmagnifico.tech/static/upload/elmagnifico/202304291549430.png)

验证有可能过不去，这是由于没有开启作为远程服务登录，需要去本地策略组里开启，然后测试才能通过

![在这里插入图片描述](https://img.elmagnifico.tech/static/upload/elmagnifico/202304291550920.png)



后续就能直接使用Windows batch command 直接完成命令，这种调用失败了，就会提示CI失败

![image-20230429155502328](https://img.elmagnifico.tech/static/upload/elmagnifico/202304291612128.png)



## Windows 使用SSH

> https://github.com/PowerShell/Win32-OpenSSH

直接安装OpenSSH-Win64-v9.2.2.0，一路next，然后使用Windows的账号和密码就能远程上去了



## Jenkins增加SSL证书

Jenkins增加证书看起还挺麻烦的，实际操作非常简单



#### windows

首先进入jenkins的安装目录

```
C:\Program Files\Jenkins
```

可以看到下面有一个`jenkins.xml`的文件，这个是主要配置文件

主要修改的就是这个`arguments`

```xml
<arguments>-Xrs -Xmx256m -Dhudson.lifecycle=hudson.lifecycle.WindowsServiceLifecycle -jar "C:\Program Files\Jenkins\jenkins.war" --httpPort=80 --httpsPort=443 --httpsKeyStore="C:\Program Files\Jenkins\证书.jks" --httpsKeyStorePassword=证书密码 --webroot="%LocalAppData%\Jenkins\war"</arguments>
```

证书其实直接使用证书包里tomcat的jks文件就行了

如果不启用http那么直接`--httpPort=-1`即可



完成以后重启或者重载配置

```
http://localhost:80/restart
```



```
http://localhost:80/reload
```

启动以后就能看到证书正常运行了

![image-20230429162017641](https://img.elmagnifico.tech/static/upload/elmagnifico/202304291620685.png)

#### linux

linux下可能经常要配合nginx使用



## Summary

Jenkins折腾的人还是比较少的，windows就更别说了



## Quote

> https://blog.csdn.net/xiaoxin_OK/article/details/122441071
>
> https://www.cnblogs.com/EasonJim/p/6648552.html


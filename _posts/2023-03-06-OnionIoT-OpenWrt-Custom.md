---
layout:     post
title:      "OnionIoT编译"
subtitle:   "OpenWrt，make menuconfig，make kernel_menuconfig"
date:       2023-03-06
update:     2023-03-06
author:     "elmagnifico"
header-img: "img/api-bg.jpg"
catalog:    true
tags:
    - OpenWrt
---

## Foreword

记录一下编译Onion Pi镜像遇到的各种问题



## 编译环境搭建



必须使用`Ubuntu, 18.04`，然后更新软件，安装以下依赖

```
sudo apt-get update
sudo apt-get install -y build-essential vim git wget curl subversion build-essential libncurses5-dev zlib1g-dev gawk flex quilt git-core unzip libssl-dev python-dev python-pip libxml-parser-perl default-jdk rsync time
```



拉取编译源

```
git clone https://github.com/OnionIoT/source.git
cd source
```



更新所有feed，将所有依赖包都设置到对应的仓库

```
sh scripts/onion-feed-setup.sh
python scripts/onion-setup-build.py
```



配置系统

```
make kernel_menuconfig
make menuconfig
```



编译

```
make -j9
```

- 多线程编译，但是报错的话不容易看出来哪里出错了
- 第一次建议使用单线程编译，成功一次以后再用多线程



```
make -j1 V=s
```

`V=s`是为了更好的显示出错的位置在哪里



## Custom

更新feeds

```
./scripts/feeds update onion
```



设置编译的配置文件

```
python scripts/onion-setup-build.py -c .config.O2-minimum
```



如果想把自己的文件直接编译到镜像里，可以把文件放在`files`目录下，这个目录等同于openwrt的`/`目录，如果有同名文件就会被替换



```
make menuconfig
```

配置中，有一些包是可以选择直接编译进内核或者是编译成一个`.ko`或者`.o`文件的，这种文件相当于是一个独立包，使用启动脚本加载模块即可，比如写在`rc.local`中

```
insmod xxx.ko
```

- stand-alone package 存在的意义是可以动态选择是否加载这个模块，而不是每次一定被内核加载

所以非必要模块是不需要编译进Image的



## Docker

目前来看，OnionIOT维护的source也会有一些仓库过期或者不存在，更新feed时会有对应的提示。

官方推荐的是使用Docker镜像直接编译，Docker镜像如果维护的比较好的话，确实会比自己搭建环境好一些



拉取镜像

```
docker pull onion/omega2-source
```

启动

```
docker run -it onion/omega2-source /bin/bash
```

剩下就是进入镜像执行编译配置等操作



docker拉下来的镜像文件存储位置

```
/var/lib/docker/containers
```



当前用户加入docker组中，需要重启

```
sudo usermod -a -G docker $USER
```



- docker镜像是不会走代理翻墙的，需要去config中指定代理才行



## 配置

### feeds

feeds负责管理可能用到的源码包，由于所有包都是在变化中的，当某些包缺失以后，可以添加自定义的源，从而避免缺少源无法编译



独立安装

```
./scripts/feeds install libpam
```



更新某个源

```
./scripts/feeds update luci
./scripts/feeds install -a -p luci
```



清空当前的源，防止历史信息有干扰（其实会删除缓冲，慎用）

```
./scripts/feeds clean
```



### menuconfig

menuconfig修改的内容全都存储在.config.xxx中，具体取决于设置的是谁



通过脚本指定编译的配置文件

```
python scripts/onion-setup-build.py -c .config.xxx
```



也可以手改config，但是容易出现依赖等相关问题，还是建议使用menuconfig去生成

某些libraries或者utilities去不掉，是因为被其他包或者功能引用了，这种情况下可以输入`/`然后输入对应的名称，查看具体是谁引用了。`selected`部分是谁引用的，同时也能看到`select`，是这个包需要引用到谁



## 问题

#### server certificate verification failed

feed的时候很容易出现这个问题，然后就带着各种库缺失

```
fatal: server certificate verification failed. CAfile: /etc/ssl/certs/ca-certificates.crt CRLfile: none
```

简单的关闭git的https验证，就可以解决

```
git config --global http.sslverify false
```



报这种问题，基本都是本机源有问题，导致一部分库找不到，建议不要使用任何国内源，翻墙使用原生的源

```
package/feeds.onion/bluez/makefile has a dependency on udev
```



## Summary

首次编译是真的麻烦



## Quote

> https://blog.csdn.net/l00102795/article/details/128648842
>
> https://github.com/OnionIoT/source
>
> https://blog.csdn.net/weixin_42399752/article/details/97135405
>
> https://openwrt.org/docs/guide-developer/start
>
> https://blog.csdn.net/qq_41035283/article/details/124058657
>
> https://blog.csdn.net/qq_36741413/article/details/124045156
>
> https://zhuanlan.zhihu.com/p/114424172
>
> https://community.onion.io/topic/3411/github-source-openwrt-18-06-branch/14

---
layout:     post
title:      "OnionIoT编译"
subtitle:   "OpenWrt，make menuconfig，make kernel_menuconfig"
date:       2023-03-06
update:     2023-03-09
author:     "elmagnifico"
header-img: "img/api-bg.jpg"
catalog:    true
tags:
    - Onion
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

- 建议重新弄一个虚拟机，硬盘记得稍微给多一点，编译一次大概整体在20G左右



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



设置编译的配置文件

```
python scripts/onion-setup-build.py -c .config.O2
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



#### 使用本地源

如果是常年不需要更新的源，那么可以选择使用本地的源，防止远端更新造成各种不能编译的情况。还有一种好处就是把可以编译过去的源备份了，不至于远端库都不存在了，备份都找不到

```shell
src-link packages /home/feeds_local/packages
src-link luci /home/feeds_local/luci
src-link routing /home/feeds_local/routing
src-link telephony /home/feeds_local/telephony
src-link onion /home/feeds_local/onion

# online source
#src-git packages https://git.openwrt.org/feed/packages.git;openwrt-18.06
#src-git luci https://git.openwrt.org/project/luci.git;openwrt-18.06
#src-git routing https://git.openwrt.org/feed/routing.git;openwrt-18.06
#src-git telephony https://git.openwrt.org/feed/telephony.git;openwrt-18.06
#src-git onion https://github.com/OnionIoT/OpenWRT-Packages.git;openwrt-18.06
```

比较简单，修改feed.conf，改为`src-link`，并且修改为本地路径，需要注意本地路径必须使用绝对路径，否则无法正常工作



完成以后就可以使用feeds更新所有源

```
./scripts/feeds update -a
```



还有一种就是保存`./dl`文件夹和`package`文件夹，让这些文件有备份



#### 某个包源失效

如果遇到某个包失效了，整体编译走不下去怎么弄

比如我这里的遇到`i2c-tools3.1.2.tar.bz2`，怎么都下不下来

通过确认这个包属于哪个源，然后打开对应的feeds下的这个文件夹，找到对应包名文件夹，查看`Makefile`

```makefile
#
# Copyright (C) 2007-2011 OpenWrt.org
#
# This is free software, licensed under the GNU General ic License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk
include $(INCLUDE_DIR)/kernel.mk

PKG_NAME:=i2c-tools
PKG_VERSION:=3.0.3
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.bz2
#PKG_SOURCE_URL:=http://dl.lm-sensors.org/i2c-tools/releases
# 替换成有效链接
PKG_SOURCE_URL:=https://sources.openwrt.org
#PKG_MD5SUM:=f15019e559e378c6e9d5d6299a00df21

PKG_BUILD_DEPENDS:=PACKAGE_python-smbus:python

include $(INCLUDE_DIR)/package.mk
$(call include_mk, python-package.mk)

define Package/i2c-tools
        SECTION:=utils
        CATEGORY:=Utilities
        TITLE:=I2C tools for Linux
        # 还要改这里的链接
        URL:=https://sources.openwrt.org
endef

define Package/python-smbus
        SUBMENU:=Python
        SECTION:=lang
        CATEGORY:=Languages
        TITLE:=Python bindings for the SMBUS
        URL:=https://sources.openwrt.org
        DEPENDS:= +PACKAGE_python-smbus:python-mini +i2c-tools
endef
```

可以看到实际链接是由这个合成的，而实际上这个链接失效了

```
http://dl.lm-sensors.org/i2c-tools/releases
```

![image-20230307092054537](https://img.elmagnifico.tech/static/upload/elmagnifico/202303070921648.png)

找了一下发现openwrt自己的sources还是好的，所以直接从这里下载即可

```
https://sources.openwrt.org/i2c-tools-3.1.2.tar.bz2
```



后来发现由于feeds是后期生成的，所以也可以在前面的环节修改

实际上所有包都来自于package目录，进入这个目录`package\feeds\packages\i2c-tools`就能看到源头的makefile了，在这里直接修改链接即可

```makefile
# Copyright (C) 2007-2015 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=i2c-tools
PKG_VERSION:=3.1.2
PKG_RELEASE:=1

PKG_SOURCE_URL:=http://dl.lm-sensors.org/i2c-tools/releases/ \
                http://fossies.org/linux/misc/

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.bz2
PKG_HASH:=db5e69f2e2a6e3aa2ecdfe6a5f490b149c504468770f58921c8c5b8a7860a441

PKG_BUILD_PARALLEL:=1
PKG_BUILD_DEPENDS:=PACKAGE_python-smbus:python

PKG_MAINTAINER:=Daniel Golle <daniel@makrotopia.org>
PKG_LICENSE:=GPLv2

```



### menuconfig

menuconfig修改的内容全都存储在.config.xxx中，具体取决于设置的是谁



通过脚本指定编译的配置文件

```
python scripts/onion-setup-build.py -c .config.xxx
```



也可以手改config，但是容易出现依赖等相关问题，还是建议使用menuconfig去生成

某些libraries或者utilities去不掉，是因为被其他包或者功能引用了，这种情况下可以输入`/`然后输入对应的名称，查看具体是谁引用了。`selected`部分是谁引用的，同时也能看到`select`，是这个包需要引用到谁



### OpenWrt目录结构

![openwrt目录结构](https://img.elmagnifico.tech/static/upload/elmagnifico/202303070952430.png)

蓝色目录是后期生成的



### build_dir

build和stageing这两个概念比较容易混淆，这里仔细区分一下



```
 build_dir/host，主机工具，构建系统的其他部分，其实就是编译本地工具的
 build_dir/toolchain-mipsel_24kc_gcc-7.3.0_musl,musl交叉编译的工具链，这里也是本地编译可能需要用到的工具链库等
 build_dir/target-mipsel_24kc_musl，编译后实际的包和内核等
```

简单说就是host是主机工具、toolchain是主机编译的工具链、target是编译后的目标文件，包含目标平台的工具链和内核



### staging_dir

```
staging_dir/host，主机工具安装的路径，
staging_dir/toolchain-mipsel_24kc_gcc-7.3.0_musl,目标平台的各种编译工具链，后期会被合并到Image中
staging_dir/target-mipsel_24kc_musl，目标平台的各种应用程序，后期会被合并到Image中
```

build相当于是在主机中新建了一个linux环境，用来搭建编译目标平台的一些工具和编译链，staging则是建立了一个目标的linux环境，用来编译目标环境下的packages和各种应用

```
build/host+build/toolchain->build/target->staging_dir/host+staging_dir/toolchain->staging_dir/target
```

甚至可以理解为build是一个虚拟机、stageing也是一个虚拟机，前者生成了后者



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
>
> https://stackoverflow.com/questions/26030670/openwrt-buildroot-build-dir-and-staging-dir
>
> https://openwrt.org/docs/guide-developer/overview
>
> https://blog.csdn.net/weixin_43025071/article/details/85265049
>
> https://openwrt.org/docs/guide-developer/feeds




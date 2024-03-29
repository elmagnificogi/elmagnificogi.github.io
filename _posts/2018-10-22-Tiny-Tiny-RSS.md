---
layout:     post
title:      "Tiny Tiny RSS"
subtitle:   "docker,mercury,vps"
date:       2018-10-22
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - VPS
---

## Foreword

RSS是个好东西，只是由于他会分走网站流量，减少广告收入，导致这个东西越来越不受厂商欢迎，走向没落。

但是本身还是非常好用的信息订阅读方式，目前比较广泛的就是feedly和inoreader,但是他们多少都有一些问题。

比如本身他们都是收费的，一个月大概30左右，免费的版本订阅有限制，还有一些其他功能也无法使用。

基于此找到了其他的RSS，比如RSSHub，TinyTinyRSS。

## RSSHub

已知有很多网站或者信息源本质上不支持RSS，这个时候就需要有一个可以把其他信息源转成可订阅RSS的东西，如果你需要这样的东西，那么RSSHub就是你要找的东西了。

RSSHub的部署，使用docker当然是最简单的方式，通过这里就能看到是否正常部署了。

    docker pull diygod/rsshub

    docker run -d --name rsshub -p 1200:1200 diygod/rsshub

    http://127.0.0.1:1200/
    或者
    http://你vps的ip:1200/

部署之后使用官方给定的API进行对应的平台用户访问，就能看到其生成的RSS源信息

https://rsshub.app/bilibili/user/coin/2267573?filterout=微小微|赤九玖|暴走大事件

![](https://img.elmagnifico.tech/static/upload/elmagnifico/5bffc33b563ce.png)

他支持的信息源非常多，具体去官网查询吧。

> https://docs.rsshub.app/

我目前并不需要一些奇怪的源，所以暂时并不会使用这个，而且这个源基本上你直接用官方的也是可以的，其实就是可以省掉自己搭，用别人的就行了。

## TinyTinyRSS

TinyTinyRSS，可以认为他就是一个可以自定义的feedly，它本身是开源的，完全可以自建。

当然搭建他需要有一个国内或者国外的VPS，国外的最好，防止有一些信息源抓不到。

自己搭建的话，依然建议用docker的形式，主要是省事，而且有些东西有人帮你集成好了，不用再去鼓捣。

我用的是：

> https://github.com/HenryQW/docker-ttrss-plugins

好处在于他帮你集成了几个常用的插件，然后主题也帮你设置好了，并且也自带更新，不需要你再去费时间管理维护。

按照他给的搭建docker的方式，我就没成功，总是有一些奇怪的错误，导致我没办法只好用docker-compose的方式来完成。

使用docker-compose

    wget https://raw.githubusercontent.com/HenryQW/docker-ttrss-plugins/master/docker-compose.yml
    修改docker-compose.yml中的数据库postgres的密码，有两个地方需要修改
    修改docker-compose.yml中的http://你vps的ip:181/
    docker-compose up -d 后台部署
    http://你vps的ip:181/ 访问ttrss

其中 ttrss的默认账户: admin 密码: password，登陆上去以后立马修改其账号密码。

具体的端口号不限于181可以是80，具体都在docker-compose.yml中修改。

登陆之后就可以通过OMPL导入之前的订阅源了，或者是添加自定义源进去。

TTRSS本身的主题是比较难看的，然后HenryQW 则是使用nextcloud主题，是基于Feedly的。

https://github.com/dugite-code/tt-rss-nextcloud-theme

#### Mercury

完成搭建以后，有些信息源获取不到全文，需要使用一些插件，比如Mercury

首先申请一个Mercury的API key，这个需要翻墙并且全局代理，否则很有可能会导致API key一直拿不到。

> https://mercury.postlight.com/web-parser/

申请地址，本质上登陆一下google就能完成注册拿key，就是fetch key的时候要等一会。

拿到key以后，首先进入Preferences/Preferences/General 使能API Access，保存

然后进入Preferences/Plugins中勾选mercury_fulltext，使能。

进入Feeds tab就可以看到Mercury API key的填写地方，填入刚才的key，保存。

全文订阅的源一般来说不是很多，Mercury需要你在feed中选择源然后编辑，勾选Get fulltext via Mercury Parser，从而获取全文

#### docker

记录一下docker的安装

    # 确保内核版本够高
    uname -r
    # 更新系统 删除老版本的
    sudo yum update
    sudo yum remove docker  docker-common docker-selinux docker-engine
    # 安装支持软件包
    sudo yum install -y yum-utils device-mapper-persistent-data lvm2
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    yum list docker-ce --showduplicates | sort -r
    # 安装docker 最新版
    sudo yum install docker-ce
    # 开机自启动
    sudo systemctl start docker
    sudo systemctl enable docker
    # 验证是否安装好了
    docker version

docker的基本操作：

    # 查看所有正在运行容器
    docker ps
    # 停止指定容器 containerId 是容器的ID
    docker stop containerId

    # 查看所有容器
    docker ps -a
    # 查看所有容器ID
    docker ps -a -q

    # stop 停止所有容器
    docker stop $(docker ps -a -q)
    # remove 删除所有容器,删之前要先停止
    docker  rm $(docker ps -a -q)

#### Docker Compose

Docker Compose 的好处在于有些需要多个docker容器组成的应用，可以使用docker-compose.yml直接完成，而不需要一步一步去配。

    # 首先安装python-pip
    yum -y install epel-release
    yum -y install python-pip
    # 升级pip
    pip install --upgrade pip
    # 安装docker-compose
    pip install docker-compose

#### Mobile APP

安卓移动端可以直接在谷歌商店找到Tiny Tiny RSS的应用，有试用版，收费的也是一次性买断450日元，也不超过30块，还可以速度很快。

我平时用的是Palabre，它本身不支持TTRSS的订阅源，但是有一个插件在谷歌商店里可以看到，免费的，安装以后Palabre就能持支TTRSS了，本身也挺好用的，但是不知道什么原因，第一次用还挺好的，后来必须要开启readbility才能显示全文，而且速度很慢。

换了手机重新安装了TTRSS以及APP以后发现Palabre貌似效果还不错，关键是免费可用。

Tiny Tiny RSS的试用版APP也可以，收费版也不是很贵

News+ 配合对应的News+ TTRSS的插件也可以使用TTRSS，并且其可以利用网页的加载模式打开很多在TTRSS里显示不全的信息，但是他的问题在于如果使用带图的预览模式，就会出现闪烁的情况，图片闪烁，非常别扭，如果是小图或者是无图模式就不存在，其免费版的自带广告，收费版本的没有，价格是540日语，还有一点就是其TTRSS插件已经四五年没有更新了，虽然还能用，但是News+其自身也是多年没有大更新过了，多少还是有些bug的

#### 其他问题

如果是手动安装TTRSS，然后使用Feedly的主题发现在设置里根本看不到对应的主题，本质上原因是二者版本并不匹配，找这个问题找了好久，可以在Tiny Tiny RSS 设置的底部看到当前TTRSS的版本号，
在主题的 css 文件里写着 /* supports-version:xx.x */ ，基本就是二者版本对不上导致的问题，可以暴力直接修改版本号，但是可能会有小问题，目前看来不是很明显。

## feedocean

完全可以自定义源的网站，目前还处于测试阶段，但是非常好用

> https://feedocean.com/

缺点还是有的，有些网站他不能正常解析，所以不是万能的

## Summary

TTRSS与feedly相比还是有一点差距，就是feedly添加源的时候只需要直接搜索对应的网址就行，完全无视其是否拥有feed，而ttrss还需要手动添加其对应的feed页面才可以正常抓取，除了这个以外还有一个问题，有些网站信息源在用国外vps直接就获取不到，而有些则可以，这个问题在feedly和ttrss都有发生，无法互补，比较尴尬

## Quote

> https://mercury.postlight.com/web-parser/
>
> https://henry.wang/2018/04/25/ttrss-docker-plugins-guide.html
>
> https://github.com/HenryQW/docker-ttrss-plugins
>
> https://www.cnblogs.com/yufeng218/p/8370670.html
>
> https://blog.csdn.net/chinrui/article/details/79155688
>
> https://blog.csdn.net/pushiqiang/article/details/78682323
>
> https://sspai.com/post/47100
>
> https://www.cnblogs.com/YatHo/p/7815400.html
>
> https://fixatom.com/tiny-tiny-rss/
>
> http://itindex.net/detail/57567-rss-%E6%9C%8D%E5%8A%A1-%E4%BF%A1%E6%81%AF

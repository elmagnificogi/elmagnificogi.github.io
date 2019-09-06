---
layout:     post
title:      "Docker下编译部署springboot web"
subtitle:   "docker-compose,centos,maven,java"
date:       2019-09-04
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - java
    - mysql
---

## Forward

写完的springboot web 应用要结合docker部署到ECS上，然后ECS的环境大概看了一下，免费的里面大部分和我的应用需要的环境不太搭，于是自己从零开始配置环境。

## 环境

- 操作系统： CentOS 7.6 64位

- ECS：阿里云

- 配置：4c 8g 5M（其实用不上这么高的环境，实际上估计1c 2g 2M应该就够用了，也就是个学生配置）

- 终端：Xshell 6 开启log，每次连接时自动记录所有终端的操作，用来回顾之前遇到过的问题

## docker

#### 安装

一般来说docker需要3.8以上内核才能支持，现在一般都不会选非常古老的内核基本都没啥大问题，不再解释了。

```bash
yum update
yum install docker-ce
```

验证

```bash
docker -v

Docker version 1.13.1, build 7f2769b/1.13.1
```

启动

```bash
service docker start
```

开机启动

```bash
systemctl enable docker
```

#### mysql

需要mysql环境，由于用的是最新的mysql，所以不需要指定什么老版本，直接拉最新的就行了

```bash
docker pull mysql
```

## git

安装git 非常简单

```
yum git
```

但是这样的git是没有自动补全的，用起来就是有点别扭

要补全比较麻烦，需要git源码

```bash
git clone https：//github.com/git/git
cp contrib/completion/git-completion.bash /etc/bash_completion.d/
. /etc/bash_completion.d/git-completion.bash
```

然后要加入补全

```bash
#编辑 /etc/profile 和 ~/.bashrc 文件，加入下面的代码。
# Git bash autoload
if [ -f /etc/bash_completion.d/git-completion.bash ]; then
. /etc/bash_completion.d/git-completion.bash
fi
```

## java

java其实可以不安装，但是为了确保在docker出问题的情况下还能用mvn等相关来启动或者编译，所以这里安装了java

```bash
cd /usr/local
mkdir java
cd java
```

这里需要wget一下 java的压缩文件，但是这个压缩文件必须要从网上下，而且获取下载连接还必须登录oracle,非常麻烦，但是由不得不这样

https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html

wget以后继续下面的安装

```bash
wget 安装包路径
tar -xzvf jdk-8u171-linux-x64.tar.gz
mv jdk1.8.0_171 jdk1.8
```

设置路径

```bash
vim /etc/profile

JAVA_HOME=/usr/local/java/jdk1.8
JRE_HOME=/usr/local/java/jdk1.8/jre
PATH=$PATH:$JAVA_HOME/bin:$JRE_HOME/bin
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JRE_HOME/lib
export JAVA_HOME JRE_HOME PATH CLASSPATH
```

配置生效

```bash
source /etc/profile
```

验证

```bash
java -version

java version "1.8.0_221"
Java(TM) SE Runtime Environment (build 1.8.0_221-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.221-b11, mixed mode)
```

## maven

maven 主要是拿来检测是否在服务器上的版本可以正常运行编译通过的，其实也能不要。

同理，maven也需要单独去官网下载

https://maven.apache.org/download.cgi

```bash
cd /usr/local
mkdir maven
cd maven
wget http://mirror.bit.edu.cn/apache/maven/maven-3/3.6.1/binaries/apache-maven-3.6.1-bin.tar.gz
tar -zxvf apache-maven-3.6.1-bin.tar.gz
```

修改环境变量

```bash
vim /etc/profile

export PATH="/usr/local/maven/apache-maven-3.6.1/bin:$PATH"
```

配置生效

```bash
source /etc/profile
```

检测

```bash
mvn -v 

Apache Maven 3.6.1 (d66c9c0b3152b2e69ee9bac180bb8fcc8e6af555; 2019-04-05T03:00:29+08:00)
Maven home: /usr/local/maven/apache-maven-3.6.1
Java version: 1.8.0_221, vendor: Oracle Corporation, runtime: /usr/local/java/jdk1.8.0_221/jre
Default locale: en_US, platform encoding: UTF-8
OS name: "linux", version: "3.10.0-957.27.2.el7.x86_64", arch: "amd64", family: "unix"
```

## docker-compose

docker-compose的安装

https://docs.docker.com/compose/install/

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

检测

```bash
docker-compose version

docker-compose version 1.24.1, build 4667896b
docker-py version: 3.7.3
CPython version: 3.6.8
OpenSSL version: OpenSSL 1.1.0j  20 Nov 2018
```
## rng-tools

用来补充熵池，解决tomcat启动慢，session阻塞的问题

```bash
yum install rng-tools      #安装rngd熵服务
systemctl start rngd       #启动服务
cp /usr/lib/systemd/system/rngd.service /etc/systemd/system
cd /etc/systemd/system/
vim rngd.service 

ExecStart=/sbin/rngd -f 改为 
ExecStart=/sbin/rngd -f -r /dev/urandom

systemctl daemon-reload   #重新载入服务 
systemctl restart rngd    #重启服务
```

## 总结

目前就记录了这些，一个月后还会重新再建一次镜像，那时还会对照个再来一遍，对细节部分会再补充一次

之后就把这些build的部分写成sh脚本，新环境自动build环境

## 参考

> https://blog.51cto.com/9291927/2310444
>
> https://docs.docker.com/compose/install/
>
> https://github.com/PI-KA-CHU/PIKACHU-JAVA-Notebook/issues/76
>
> https://medium.com/@noethiger.mike/how-to-deploy-a-webapp-with-docker-5149204e35f2
>
> https://medium.com/@bajracharya.kshitij/thanks-for-your-response-mike-n%C3%B6thiger-baf30968163e
>
> https://www.cnblogs.com/moxiaoan/p/9299404.html

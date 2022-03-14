---
layout:     post
title:      "Springboot部署后WEB登录延迟很高"
subtitle:   "random,tomcat"
date:       2019-09-06
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Tomcat
    - Springboot

---

## Forward

之前在mySql、web的多个docker实例中说到部署了多个实例以后导致出现springboot启动正常，但是web的登录页面延迟非常高，点了登录，但是页面没有反应，大概等个几分钟以后才能正常进去，但是如果只是访问公开的接口，相当于没有session的接口，那么反而不受影响。这就让我很奇怪到底是为啥会这样。

## 错误提示

```
2019-09-06 10:26:16.755  WARN 44 --- [https-jsse-nio-443-exec-5] o.a.c.util.SessionIdGeneratorBase        : Creation of SecureRandom instance for session ID generation using [SHA1PRNG] took [6,392] milliseconds.
2019-09-06 12:27:51.958  WARN 44 --- [https-jsse-nio-443-exec-1] o.a.c.util.SessionIdGeneratorBase        : Creation of SecureRandom instance for session ID generation using [SHA1PRNG] took [168,832] milliseconds.
2019-09-06 12:27:51.958  WARN 44 --- [https-jsse-nio-443-exec-3] o.a.c.util.SessionIdGeneratorBase        : Creation of SecureRandom instance for session ID generation using [SHA1PRNG] took [223,998] milliseconds.
2019-09-06 12:27:51.958  WARN 44 --- [https-jsse-nio-443-exec-10] o.a.c.util.SessionIdGeneratorBase        : Creation of SecureRandom instance for session ID generation using [SHA1PRNG] took [211,643] milliseconds.
2019-09-06 12:27:51.959  WARN 44 --- [https-jsse-nio-443-exec-2] o.a.c.util.SessionIdGeneratorBase        : Creation of SecureRandom instance for session ID generation using [SHA1PRNG] took [23,484] milliseconds.
2019-09-06 12:27:51.958  WARN 44 --- [https-jsse-nio-443-exec-4] o.a.c.util.SessionIdGeneratorBase        : Creation of SecureRandom instance for session ID generation using [SHA1PRNG] took [214,974] milliseconds.
```

类似的提示非常多，而且经常出现，我之前没注意，只是个warn而已，而且也没注意后面的单位，我看是个毫秒就没注意。

我想解这个问题的时候，突然发现这个是个六位数，我去那就是200多秒，对应到这个页面的反应上就和现象一致了。

## session

简单说这个是由于每个登录用户需要有一个session，而每隔session又都需要随机生成，而java里面这个随机生成的种子的算法需要环境噪声，而由于某些原因导致环境太过稳定了，刚开始启动的时候环境噪声根部不够，导致在获取随机数的时候就会阻塞住，一直要等到这个噪声数量够高了才能正常生成一个session，从而用户才能正常登录。

而那些不需要session的页面，没有这个需求，自然可以直接访问到。

然后呢，网上关于这个怎么改的说法贼多，但是以我目前实测，貌似都没法用，也有可能我用错了，但是确实没效果。

## 解决方案

#### 一般的解决方案

```
$JAVA_PATH/jre/lib/security/java.security文件中
将
securerandom.source=file:/dev/random
修改为
securerandom.source=file:/dev/./urandom
```

不要问为什么有一个. 这个是个奇怪的bug，如果直接写/dev/urandom，并不能生效，实际上还是会使用random，只有在tomcat prod的时候出现，test等情况下都是正常的。

urandom是非阻塞随机数，而random是阻塞式的

除了上面的方法以外，还可以通过配置环境的时候增加参数来完成对应的修改

##### tomcat

在Tomcat环境中解决，可以通过配置JRE使用非阻塞的Entropy Source。

在catalina.sh中加入这么一行：-Djava.security.egd=file:/dev/./urandom  

##### dockfile

增加环境变量

```
FROM tomcat
ENV JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom"
```

或者启动时增加参数

```
FROM java:8 
VOLUME /tmp 
ADD dalaoyang_mgr.jar /dalaoyang.jar
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/dalaoyang.jar"]
```

或者 直接是在docker之类的命令行中增加-Djava.security.egd=file:/dev/./urandom   也能完成对应的修改

比如：

```
docker run -d -p 8080:8080--name tomcat tomcat \
-e JAVA_OPTS="-Duser.timezone=Asia/Shanghai -Djava.security.egd=file:/dev/./urandom" \
-v /etc/localtime:/etc/localtime:ro \
-v /mnt/home/udocker/tomcat/conf:/usr/local/tomcat/conf \
-v /mnt/home/udocker/tomcat/logs:/usr/local/tomcat/logs \
-v /mnt/home/udocker/tomcat/webapps:/usr/local/tomcat/webapps \
tomcat:latest
```

##### 无效方案

通过dockerfile，失败，无论加点还是不加都无法修改

```
FROM maven:3.6-jdk-8
ENV JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom"
```

docker-compose文件中增加环境参数，一样失败，加不加点都无效，该卡的还是卡

```
    environment:
      - TZ=Asia/Shanghai
      - JAVA_OPTS=-Djava.security.egd=file:/dev/./urandom
```

可能这两个方法我写的不太对导致最后没起作用。

查看$JAVA_PATH/jre/lib/security/java.security文件可以看到下面的说明

```
# By default, an attempt is made to use the entropy gathering device
# specified by the "securerandom.source" Security property.  If an
# exception occurs while accessing the specified URL:
#
#     SHA1PRNG:
#         the traditional system/thread activity algorithm will be used.
#
#     NativePRNG:
#         a default value of /dev/random will be used.  If neither
#         are available, the implementation will be disabled.
#         "file" is the only currently supported protocol type.
#
# The entropy gathering device can also be specified with the System
# property "java.security.egd". For example:
#
#   % java -Djava.security.egd=file:/dev/random MainClass
#
# Specifying this System property will override the
# "securerandom.source" Security property.
```

官方也是说明了需要添加启动参数，然后这里的文件会对应的修改，但是从我实际的测试情况来看，并没有修改，也没生效，这就非常尴尬。

#### 自动补充熵池

由于是熵池不够，所以自然有人想办法补充熵池，从而避免这个问题

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

这个直接对自身的环境产生影响，并且就算是用了docker也会产生影响，本质上docker中这个部分也是从主机本身获取到的而不是纯虚拟的

但是自动补充熵池也有潜在风险。本身这个随机数就是为了安全而用的，环境噪声不够，就通过外部工具去补充熵池，这样的话随机性可能无法保证，而且根据之前的记录有的自动补充熵池会导致一些要求严格的安全性服务直接无法启动或者存在问题，所以还是要根据业务情况确定是否能用这个东西。

## 总结

自动补充熵池感觉可以加到环境部署里面去了，省的后面还要为这个问题找半天

## 参考

> https://security.stackexchange.com/questions/89/feeding-dev-random-entropy-pool
>
> https://www.digitalocean.com/community/tutorials/how-to-setup-additional-entropy-for-cloud-servers-using-haveged
>
> https://blog.longyb.com/2019/06/09/tomcat_hang_creation_of_securerandom_instance_for_sessionid_english/
>
> https://www.bbsmax.com/A/rV57bLZjJP/
>
> https://www.jianshu.com/p/30aa8e43a396
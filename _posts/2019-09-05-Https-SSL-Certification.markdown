---
layout:     post
title:      "HTTPS自签证书与阿里云免费证书"
subtitle:   "springboot,java"
date:       2019-09-05
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - https
    - springboot
---

## Forward

由于是后台使用，需要更安全一些，所以打算上一个https，先说自签证书，再说阿里云免费证书

## 自签名证书

进入cmd窗口

```bash
keytool -genkey -alias https -keyalg RSA -keystore D:/https.keystore 

输入密钥库口令:123456
再次输入新口令:123456
您的名字与姓氏是什么?
  [Unknown]:  caixukun
您的组织单位名称是什么?
  [Unknown]:  caibijihe
您的组织名称是什么?
  [Unknown]:  choujihe
您所在的城市或区域名称是什么?
  [Unknown]:  ailanqiu
您所在的省/市/自治区名称是什么?
  [Unknown]:  aiyinyue
该单位的双字母国家/地区代码是什么?
  [Unknown]:  us
CN=caixukun, OU=caixukun, O=choujihe, L=ailanqiu, ST=aiyinyue, C=us是否正确?
  [否]:  y

输入 <https> 的密钥口令
        (如果和密钥库口令相同, 按回车):
再次输入新口令:
```

这样在D盘下就会生成对应的https.keystore 的密钥文件

接下来把https.keystore文件放置到和pom.xml同级的目录中

然后在application.yml中修改对应的端口，并且添加ssl配置

```
server:
  port: 4396
  ssl:
    key-store: https.keystore
    key-store-password: 123456
    key-store-type: JKS
    key-alias: https
```

正常这里就可以启动了，然后就发现了可以直接在https://locahost:4396 访问了。

#### 端口占用

但是也会遇到4396或者443端口被占用的情况，通过下面的命令查询占用端口的程序

```
tasklist|findstr 443
```

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/alSiqIc9ZoY78A4.png)

这样找到对应的线程PID号，然后去任务管理器里找是谁占用的，一般都是vmhost.exe

有两种办法，一个是关闭vmhost.exe，一个是修改vmhost的端口，建议修改其端口比较方便一些。

#### 修改端口

通过虚拟机编辑-首选项-共享虚拟机-更改设置-禁用共享-修改端口

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/ZzpwH6ctr714EFu.png)

然后在重新启动就发现不会提示端口占用了。

## 阿里云免费证书

阿里云有提供免费的为期一年的证书，这种可以https，但是会少一些高级https才有的特性吧，并且他只能绑定到一个二级域名的子域名中，二级域名本身并不能用。当然要安装这个必须要有域名，没有的话就别想了。除此以外还需要可以管理域名的CDN，不然无法完成认证.

#### 购买

通过阿里云盾,选择免费DV SSL,这个同一个账号最多能开20个免费的SSL认证

> https://www.aliyun.com/product/cas?spm=5176.12825654.eofdhaal5.19.5e052c4anZplci

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/x6MvjAtoJie3T7p.png)

#### 申请

绑定一个域名,比如dev.elmagnifico.me 这样的二级子域名

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/zjQw1Hn4kG7sXRI.png)

由于选了DNS的验证方式,所以需要你进到域名管理里面添加一条,对应的信息,如果域名本身就是阿里云的就能自动完成,剩下等他通过就行了,但是如果域名本身不是阿里云的,需要手动添加这个内容到域名管理中

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/ueBcOfVCQNitH38.png)

#### 安装

域名通过审核以后,可以就能下载对应的证书文件了.

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/RBF74ItNn5QSxDd.png)

这里pfx的密码只对这个压缩包里的pfx生效,如果重新下载得到的就是另一个密码了,必须匹配使用

然后继续使用keytool来完成对应的密钥生成

```
keytool -importkeystore -srckeystore D:\https\214215109110451.pfx -destkeystore https.jks -srcstoretype PKCS12 -deststoretype JKS
```

会提示输入密钥,密钥和压缩包内的相同即可

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/HBjbtcrsXy2VT83.png)

需要留意这里的别名是 alias,配置的时候这里的别名也要填的相同

- 这里key-store-password最好是和上一步输入口令的时候保持一致，否则需要通过keytool 修改password和口令相同，不然tomcat启动不了

```
server:
  port: 4396
  ssl:
    key-store: https.jks
    key-store-password: 123456
    key-store-type: JKS
    key-alias: alias
```

完成以后还需要把对应https.jks放到pom.xml相同的目录下,然后部署上去就能看到已经可以https访问了

## 总结

总体来说还是比较简单的,只是突然发现部署了https,我之前的labcurl竟然不能用了,因为没有加ssl上去,还需要重新编译,蛋疼

## 参考

> https://help.aliyun.com/document_detail/98576.html?spm=5176.2020520163.cas.15.1f4d56a7AyeYvN
>
> https://www.cnblogs.com/jxch/p/9378274.html
>
> https://blog.csdn.net/sinat_40399893/article/details/79860942
>
> https://www.jianshu.com/p/8d4aba3b972d
>
> https://blog.csdn.net/zhanghao143lina/article/details/79566666

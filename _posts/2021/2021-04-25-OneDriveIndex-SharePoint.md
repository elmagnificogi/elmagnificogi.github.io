---
layout:     post
title:      "搭建Cloudreve、挂载SharePoint"
subtitle:   "同济,世纪互联,Oneindex"
description: "搭建Cloudreve、挂载SharePoint，同济、世纪互联、Oneindex、挂载方案。"
date:       2021-04-25
update:     2021-04-27
author:     "elmagnifico"
header-img: "img/bg5.jpg"
catalog:    true
tags:
    - VPS
---

## Foreword

突然有了一个世纪互联的1T OneDrive，听说还能挂载SharePoint 25T，于是就来折腾一下看看有什么方案可以用。



- SharePoint，简单说就是提供了一个站点服务，并且给了非常大的空间，有的可能在建立站点以后第二天自动升级到25T容量，也有可能是填满1T容量以后自动升级到25T，总而言之就是白嫖



## 挂载方案

#### Cloudreve

> https://github.com/cloudreve/Cloudreve

Cloudreve支持本机、从机、七牛、阿里云 OSS、腾讯云 COS、又拍云、OneDrive (包括世纪互联版) 作为存储端

- 📤 上传/下载 支持客户端直传，支持下载限速
- 💾 可对接 Aria2 离线下载
- 📚 在线 压缩/解压缩、多文件打包下载
- 💻 覆盖全部存储策略的 WebDAV 协议支持
- ⚡ 拖拽上传、目录上传、流式上传处理
- 🗃️ 文件拖拽管理
- 👩‍👧‍👦 多用户、用户组
- 🔗 创建文件、目录的分享链接，可设定自动过期
- 👁️‍🗨️ 视频、图像、音频、文本、Office 文档在线预览

~~可以说功能非常强悍了，但是不支持SharePoint 挂载~~

最新的3.3版本开始支持SharePoint了，牛皮



所以就有了下面的魔改版本，支持SharePoint了

> https://github.com/moeYuiYui/Cloudreve/

教程在下面

> https://www.lizi.tw/web/19826.html



#### YukiDrive

> https://github.com/YukiCoco/YukiDrive

YukiDrive一个 Onedrive & SharePoint 文件浏览程序，支持国际版和世纪互联版。后端采用 .net core 3.1，前端使用 Vue ，前后端分离，无刷新加载。无需搭建运行环境，下载并配置完成后直接运行。

目前不支持加密和多用户。

但是他有演示站，比较方便看效果：

> https://drive.kurisu.moe



#### sharelist

> https://github.com/reruin/sharelist

ShareList 是一个易用的网盘工具，支持快速挂载 GoogleDrive、OneDrive ，可通过插件扩展功能。扩展之后可以挂载天翼云、和彩云、蓝奏云、本地文件、WebDav、阿里云盘、百度云盘等等

需要注意他不支持SharePoint的挂载，但是总体集成度比较高，较为方便



#### Oneindex

最初原版的Oneindex是被删除了，但是还有其他各种基于此的版本



**onedrive-cf-index**

>https://github.com/spencerwooo/onedrive-cf-index

演示站：

> https://storage.spencerwoo.com/

教程

> https://gaominn.com/index.php/archives/odcfinedx.html



**oneindex-j**

> https://github.com/jialezi/oneindex-j

教程有点老了，但是意思差不多

> https://blog.jialezi.net/?post=157

同时也有2个演示站，音频可以直接播放

>https://odrive.azurewebsites.net/odc/
>
>https://od.xkx.me/



#### rclone

> https://rclone.org/

这个方案可以挂载很多知名网盘

挂载教程

> https://www.daniao.org/12259.html



## 魔改版Cloudreve搭建

我选择使用魔改版Cloudreve，当然也可以直接用最新版3.3来搭建，剩下的都类似

搭建流程非常简单，随便上个vps，然后按照下面的开始就行了

```bash
wget  https://github.com/moeYuiYui/Cloudreve/releases/download/3.2.0/cloudreve_sp_3.2.0_linux_amd64.tar.gz
# 解压程序包
tar -zxvf cloudreve_sp_3.2.0_linux_amd64.tar.gz
# 赋予执行权限
chmod +x ./cloudreve
# 启动 Cloudreve
./cloudreve
```

启动以后，就能看到对应的管理员账号和密码了，记得安全组里打开5212的端口，udp和tcp我都打开了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3VTpC4lxIU5Qq9f.png)

然后访问vps的5212端口，即可登陆，看效果了

> https://vps_id:5212



#### SSL

但是如果要挂载onedrive，还需要ssl。SSL可以申请免费的Let's Encrypt，也可以直接申请阿里云的免费ssl证书

> http://elmagnifico.tech/2019/09/05/Https-SSL-Certification/

现在阿里云可以直接申请20个免费的证书，但是这20个免费证书，如果没有使用，那么在每年12月31日24点就会自动失效，但是如果你证书到期了，还有免费证书的额度的话，那么之前的证书就可以自动续期。也就是说要你每年1月1号以后重新购买20个免费证书，然后就可以自动续期了。

有了证书以后，下载对应的nginx版本，上传到vps等待使用。



#### nginx

这里默认使用nginx来反向代理，如果不需要nginx可以直接在Cloudreve的同目录下修改conf.ini，来添加ssl证书。

```
[System]
Mode = master
Listen = :5212
SessionSecret = GhXTBH8gasdigjasdjfoiasXbHnj5eUVt0yfUS4Z
HashIDSalt = m1XcBSwscl6Q500mOpUDVasdpfjalsdfjoaisdfVbAja8BIRwgTFfRh

; SSL 相关
[SSL]
; SSL 监听端口
Listen = :443
; 证书路径
CertPath = /root/ssl/fullchain.pem
; 私钥路径
KeyPath = /root/ssl/privkey.key
```

然后重新启动cloudreve，就可以用https登陆了。



不过如果原本使用了nginx，那就要通过增加nginx配置来反向代理了。

假如原本的nginx的配置是这样的

```bash
server {
    listen 443 ssl http2;
    server_name 你的域名;
    root /etc/nginx/html;
    index index.php index.html;
    ssl_certificate /etc/nginx/ssl/你的证书.cer;
    ssl_certificate_key /etc/nginx/ssl/你的证书.key;
    #TLS 版本控制
    ssl_protocols   TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers     'TLS13-AES-256-GCM-SHA384:TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:TLS13-AES-128-CCM-8-SHA256:TLS13-AES-128-CCM-SHA256:EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+ECDSA+AES128:EECDH+aRSA+AES128:RSA+AES128:EECDH+ECDSA+AES256:EECDH+aRSA+AES256:RSA+AES256:EECDH+ECDSA+3DES:EECDH+aRSA+3DES:RSA+3DES:!MD5';
    ssl_prefer_server_ciphers   on;
    # 开启 1.3 0-RTT
    ssl_early_data  on;
    ssl_stapling on;
    ssl_stapling_verify on;
    #add_header Strict-Transport-Security "max-age=31536000";
    #access_log /var/log/nginx/access.log combined;
    location /cb24 {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:11234;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
    }
}

```

那么就需要再增加一个location，在上面的server中添加下面的代码

```bash
    location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_redirect off;
    proxy_pass http://127.0.0.1:5212;

    # 如果您要使用本地存储策略，请将下一行注释符删除，并更改大小为理论最大文件尺寸
    client_max_body_size 20000m;
    }
```

这里就是将访问根目录/的，都转发给本地5212端口。

当然这里可以随意修改/，改成你想要的即可。

然后试一下用https访问，看是否能够正常登陆访问。

大概率会提示你当前URL和设置中的不同，要你修改，那就如下操作即可：

控制面板/参数设置/站点信息/修改站点URL为带https的



#### 存储策略

接着就是在存储策略中添加onedrive

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3FOSI6yWu9XPjb7.png)

选择onedrive

![](https://img.elmagnifico.tech/static/upload/elmagnifico/t8NVKmRJPqb5FAv.png)

这里可以看到以及给你了每一步如何做，按照对应的操作去建立一个应用，然后获取到应用程序ID和客户端密码。

这里还要注意一下，其实还有一个API权限添加，应该在第5步以后（貌似不添加也能正常工作），这里没有说，我补充一下

![](https://img.elmagnifico.tech/static/upload/elmagnifico/sXob18cahzlMUHZ.png)

通过上述操作添加权限，一共需要手动添加3个权限

- Files.Read
- Files.Read.All
- offline_access

剩下的权限是自动添加的，添加完成后如图所示

![](https://img.elmagnifico.tech/static/upload/elmagnifico/hNlra4pAdc5GJin.png)

这里完成以后，剩下就是选择你对应的OneDrive账号类型了。

这里很多地方没说明，我详细说一下.

如果你是**国际版**的OneDrive，那么刚才的这个应用也必须用**国际版**的某个账号本来建立，然后这里选择的也是**国际版**，然后一直下一步，到授权的时候，这个时候会提示你使用**国际版**的账号登陆，你可以切换成其他的**国际版**账号，这样这个策略里使用的就是刚才授权的那个账号的OneDrive空间。



如果你是**世纪互联**的OneDrive，那么刚才的这个应用也必须用**世纪互联**的某个账号本来建立，然后这里选择的也是**世纪互联**，然后一直下一步，到授权的时候，这个时候会提示你使用**世纪互联**的账号登陆，你可以切换成其他的**世纪互联**账号，这样这个策略里使用的就是刚才授权的那个账号的OneDrive空间。



建立应用的账号所属和授权的账号所属必须是同一个组织的，比如国际、世纪互联，否则会直接提示你找不到对应的应用ID

```
登录
抱歉，登录时遇到问题。

AADSTS700016: Application with identifier '211f238d-4057-4134-9d3d-69731c63e3a0' was not found in the directory 'e20c4664-0335-46c1-8043-3c1b77fac445'. This can happen if the application has not been installed by the administrator of the tenant or consented to by any user in the tenant. You may have sent your authentication request to the wrong tenant.
```

![](https://img.elmagnifico.tech/static/upload/elmagnifico/rTt5ZHfg3dX6uSO.png)



如果正常，就会提示你授权成功，然后就可以欢快的上传了。



#### 用户存储策略

要注意一下，如果不修改默认用户策略，那么用户上传是直接上传到了vps的本机上。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/2UBH4j6wxE8mVzX.png)

需要在用户组中修改存储策略，由于是免费版，单用户组只支持单存储策略。

要多存储策略，需要pro版本。pro版本看下面说明

> https://forum.cloudreve.org/d/1587



#### 测试

用注册用户登陆，然后随便上传一个文件，就可以看到对应OneDrive网盘的upload下按照年月日的目录中多出了一个文件。



注意，如果你直接通过pc同步的OneDrive，往这个文件夹中添加文件，并不会显示给用户，也不会显示在cloudreve系统中。一定是通过cloudreve上传的文件才会显示出来



## 其他没有应用注册权限的解决办法

如果单独只有一个世纪互联的账号，还不具有管理员权限，无法创建应用，你可能会看到下面的错误提示

```
无访问权限
摘要
会话 ID
e9f656ffd01a4b4bb0e6412d8721c2c2
资源 ID
不可用
扩展
Microsoft_AAD_IAM
内容
ActiveDirectoryMenuBlade
错误代码
403
```

![](https://img.elmagnifico.tech/static/upload/elmagnifico/zGjIcaeMFHAmRd2.png)

如果是这种情况，可以通过下面的商业试用，来新建一个世纪互联的账号，并且此账号会具有创建API的权限，用这个账号创建应用以后，授权给无法创建的账号使用即可

> https://signup.microsoftonline.cn/Signup?OfferId=e1ff4ab7-2e5e-429d-a860-1cf9b5249f95&dl=O365_BUSINESS_PREMIUM&culture=zh-CN&Country=CN&ali=1#0



## 挂载SharePoint

挂载前先保证可以正常建立世纪互联的存储策略，否则后面都无法工作。

首先是新建一个SharePoint站点，通过世纪互联登陆。

1. 点击SharePoint
2. 创建网站
3. 团队网站
4.  起一个不重复的名字，然后记录下来站点地址，非常重要

![](https://img.elmagnifico.tech/static/upload/elmagnifico/cR4eSPXL6yjtJ1x.png)

后面就随意下一步，直到完成即可。



此时回到之前的OneDrive存储策略中，然后用同样的应用id和密码再新建一条存储策略，并且通过编辑配置切换到专家模式，然后记录下来此时的AccessKey / 刷新Token

![](https://img.elmagnifico.tech/static/upload/elmagnifico/xiE1GSF9XYvy5Ok.png)

回到vps，我们需要获取SharePoint的siteid。

通过下面小工具来获取siteid

```
wget https://github.com/moeYuiYui/Cloudreve/releases/download/3.2.0/siteid.tar.gz
tar -xzf siteid.tar.gz
./siteid
```

大致流程如下：

```
[root@C20210319238684 ~]# ./siteid

==================================================
          微软SharePoint SiteID获取小工具
==================================================

国际版请输入：1 世纪互联请输入：2 : 
2
你选择了世纪互联版。
请输入 应用程序（客户端）ID : 
8b81ebfb-711b-40d5-aff2-3274asdfdc7
应用程序（客户端）ID : 8b81ebfb-711b-40d5-aff2-3274asdfdc7
请输入 客户端密码 : 
Rxasdfasdfasdfw4asdfasdf2lTA~R~
客户端密码 : Rxasdfasdfasdfw4asdfasdf2lTA~R~
请输入 OneDrive 重定向地址 : 
https://你的vps/api/v3/callback/onedrive/auth
OneDrive 重定向地址 : https://你的vps/api/v3/callback/onedrive/auth
请输入 刷新Token（Refresh_Token） : 
0.AAAAZEYM4jUDwUaAQzwbd_rERfvrgYsbcdVAr_IydN0nDccBAGE.AQABAAAAAADF8uhbdqMKTqrrFtoyDhmYPbqB0p1qnTlTU1Fm-ZWGBm5Ret_hjaQnAYp6jS-xsdcORE_o-LtF7lVEIdccjUB5EWhakYgkgs_dv95A5qvL1QbZP4ln58jw5RHGoqCwqLHFmopARpJ_DfEsYO9QP-v0T3rfwyzlbXCVO9Rh4ARyjn-797dVj5FXrTVeFDHKLe3nM4i0EET1Ckv_YW375Y1OHsdAb5f13m3M9Zwm-Ov5NZN-asdfasdfadsgqwejjtroqweior
...asdfasdf
asdfasdfasdf
请输入你的SharePoint域名 xxx.sharepoint.com或者xxx.sharepoint.cn : 
universitytongji.sharepoint.cn
你的SharePoint域名 : universitytongji.sharepoint.cn
请输入你的SharePoint网站地址 sites/xxx或者teams/xxx : 
teams/asdfa
你的SharePoint网站地址 : teams/asdfa
你输入的SharePoint完整域名为:
https://universitytongji.sharepoint.cnteams/asdfa
你的SiteID为:
universitytongji.sharepoint.cn,f0f1c212-01dasd2-4a43-asdbad4-97112asdfasdf53f,deasdf1c35-9ae4-4c66-a716asd
```

拿到了以后就可以合成我们SharePoint的server地址了

```
https://microsoftgraph.chinacloudapi.cn/v1.0/sites/{siteid}
实际的像这样：
https://microsoftgraph.chinacloudapi.cn/v1.0/sites/universitytongji.sharepoint.cn,f0f1c212-0asdfasdfgbad4-97112345853f,deb1asdfasdfa6-a716-eecaeaa79f87
```

替换原来的server地址

![](https://img.elmagnifico.tech/static/upload/elmagnifico/Dg2BJZhzG9UbQ4a.png)

然后保存即可，给用户切换到SharePoint策略，上传一个文件，可以看到对应的站点中添加了这个文件。



#### 小问题

实际用了一下之后感觉偶尔会遇到一些小问题：

- 网页端偶尔会bug，上传失败
- 前端里视频/图片等分类，都是相当于一个搜索页面，在搜索页面不可以直接拖拽上传。而其他网盘给你的是一个文件的操作互动，他这里这个逻辑就非常奇怪，要么你去点+号上传，要么就要回到根目录去上传
- 集成度还是稍微低了一点，如果要离线下载，如果要自动发邮件，其实都得单独再去搞每个模块，没有集成在一起，做不到开箱即用。
- 这里安装只是一个编译好的版本，但是如果你稍微想改一些东西，就会发现就得用源码重新编译，直接跑的版本只能当个demo演示站。



## Summary

大概就是这样，挺麻烦的，但是总算是可以正常工作了，白嫖了一个超大网盘，而且世纪互联到国内的速度比较好。Onedrive比较稳定一些，多数情况下都不会出问题，国际的更是稳，而校友之类的有概率翻车。Sharepoint和校友Onedrive由于其稳定性和私密性不够高，本质上管理员可以审核你上传的文件，所以要长久用还是多掂量掂量。

当然实际上也可以不挂在OneDrive，直接挂载本地硬盘也可以，或者是其他比较稳定的网盘，会更好一些。



## Quote

> http://www.dwf135.cn/1589.html
>
> https://shikey.com/2020/12/25/sharepoint-to-cloudreve.html
>
> https://docs.cloudreve.org/getting-started/install
>
> https://docs.cloudreve.org/getting-started/config
>
> https://gaominn.com/index.php/archives/odcfinedx.html


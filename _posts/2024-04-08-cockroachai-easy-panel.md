---

layout:     post
title:      "easy-panel基于cockroachai的chatGPT plus多人分享"
subtitle:   "chatGPT"
date:       2024-04-08
update:     2024-04-09
author:     "elmagnifico"
header-img: "img/x1.jpg"
catalog:    true
tobecontinued: false
tags:
    - chatGPT
---

## Foreword

由于前一个项目cws的依赖项目暴死，根基不存，这个项目也没办法正常使用了，他的作者又基于另外一个非开源的分享项目，二开了一个管理面板

> https://github.com/chatpire/chatgpt-web-share



## cockroachai

> https://github.com/cockroachai/cockroachai

cockroachai 最大的问题就是不开源，但是看到目前基于他分享站，还是非常多的



可以看到很多免费分享的地址，体验和原生一样

> https://share.freegpts.org/



#### 安装

```
git clone https://github.com/cockroachai/cockroachai.git
cd cockroachai
```



修改配置

```
vim config/config.yaml
```

主要修改一下，ADMIN_PASSWORD，USERTOKENS其实是允许使用的用户账号，随便添加即可，更新REFRESHCOOKIE

REFRESHCOOKIE获取和之前一样，通过以下方式获取

> https://chat.openai.com/api/auth/session

![image-20240409012822177](https://img.elmagnifico.tech/static/upload/elmagnifico/202404090128221.png)

这个cookie也需要填写到`config/session.json`中

- 注释cookie不是做左侧的token，二者不一样



cookie也可以在系统启动以后登录以下网址，用账号和密码自动刷新

> [http://服务器](http://xn--zfru1ggxt/) IP:9000/getsession

![image-20240409002424972](https://img.elmagnifico.tech/static/upload/elmagnifico/202404090024060.png)

- 这里会遇到一个问题，如果gpt是用谷歌登陆的，那么这里是无法使用这种邮箱+密码的方式完成获取token的



然后启动即可

```
docker-compose up -d
```



登录下面的地址，输入user token即可使用

```
http://服务器IP:9000
```



#### 测试

![image-20240409013005698](https://img.elmagnifico.tech/static/upload/elmagnifico/202404090130729.png)

到这里cockroachai已经可以用了，界面和原生的一样

唯一的问题就是加用户，需要去config里加，加完了还需要重启什么的，稍微麻烦了一点



## Easy Panel

> https://github.com/chatpire/easy-panel

一个快速基于cockroachai的管理面板，主要是对cockroachai的实例进行管理，同时也可以多用户，每个用户分配不同的cockroachai使用



#### 安装

创建docker环境变量，填一下密码和相关配置信息

```sh
mv .env.example .env.docker
```



初始化

```sh
docker-compose run --rm easy-panel yarn docker:db-migrate
docker-compose run --rm easy-panel yarn docker:create-admin
```



启动

```sh
docker-compose up -d
```



#### 测试

登录

> http://服务器ip:3010

然后新建一个instance，这里填写上面创建的cockroachai即可

![image-20240409014739886](https://img.elmagnifico.tech/static/upload/elmagnifico/202404090147946.png)

创建完以后会提示你配置Cockroachai，再去修改Cockroachai的config



![image-20240409015007025](https://img.elmagnifico.tech/static/upload/elmagnifico/202404090150056.png)

修改完以后，重启Cockroachai，再来到Easy Panel就能看到已经识别到对应的实例了



一旦接入Easy Panel，那么Cockroachai里的user token都会失效

![image-20240409015700396](https://img.elmagnifico.tech/static/upload/elmagnifico/202404090157448.png)

要正确接入，就需要在Easy Panel中创建一个新用户，然后用他登录，登录以后就能看到对应的跳转链接了，稍微有点麻烦，但是可以用



## Summary

略微有点麻烦，还好能用，建议Easy Panel直接内部集成一个cockroachai，一键部署好了，多个实例再说多个实例的部署方案



## Quote

> https://github.com/cockroachai/cockroachai
>
> https://github.com/chatpire/easy-panel/wiki/%E5%BF%AB%E9%80%9F%E9%83%A8%E7%BD%B2#%E4%BD%BF%E7%94%A8-vercel-%E4%B8%80%E9%94%AE%E9%83%A8%E7%BD%B2

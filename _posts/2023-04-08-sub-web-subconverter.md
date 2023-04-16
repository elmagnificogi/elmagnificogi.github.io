---
layout:     post
title:      "自建订阅转换"
subtitle:   "sub-web，subconverter"
date:       2023-04-08
update:     2023-04-08
author:     "elmagnifico"
header-img: "img/x2.jpg"
catalog:    true
tags:
    - V2ray
    - Vps
---

## Foreword

现成的订阅转换不安全，所以自建一个，也顺便提供服务给我车上的人。

订阅转换又分为前端和后端，都要分别搭建。



## sub-web

![image-20230408172250642](https://img.elmagnifico.tech/static/upload/elmagnifico/202304081722752.png)

> https://github.com/CareyWang/sub-web

主要参考sub-web项目，这里主要是前端，后端需要另外搭建



先安装nodejs和yarn

```
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
yum install -y nodejs
```



```
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo -o /etc/yum.repos.d/yarn.repo
yum install -y yarn
```

检测版本是否正常，node需要16+，centos自带的太低了

```
node -v
yarn -v
```



克隆项目

```
git clone https://github.com/CareyWang/sub-web.git
```

安装

```
yarn install
```

先本地搭建一个测试一下

```
yarn serve
```

访问，应该能看到正常了

```
http://localhost:8080/
```



略作修改，默认后端用的是`https://api.wcc.best`不安全，所以这里改成自己的

```
vi .env
```

内容如下：

```

VUE_APP_PROJECT = "https://github.com/CareyWang/sub-web"

VUE_APP_BOT_LINK = "https://t.me/CareyWong_bot"

VUE_APP_BACKEND_RELEASE = "https://github.com/tindy2013/subconverter/releases"

VUE_APP_SUBCONVERTER_REMOTE_CONFIG = "https://raw.githubusercontent.com/tindy2013/subconverter/master/base/config/example_external_config.ini"

# API 后端
VUE_APP_SUBCONVERTER_DEFAULT_BACKEND = "https://替换成我自己的"

# 短链接后端
VUE_APP_MYURLS_DEFAULT_BACKEND = "https://suo.yt"

# 文本托管后端
VUE_APP_CONFIG_UPLOAD_BACKEND = "https://api.wcc.best"

# 页面配置
VUE_APP_USE_STORAGE = true 
VUE_APP_CACHE_TTL = 86400
```



然后还修改了 以下面的一点内容，去掉了短链和修改默认后端是我自己的

```
./src/views/Subconverter.vue
```



编译成本地的静态文件

```
yarn build
```



静态网址输出路径

```
/root/sub-web/dist
```



## subconverter

> https://github.com/tindy2013/subconverter

核心后端就是这个项目，直接用docker跑起来就行了



```
docker run -d --restart=always -p 25500:25500 tindy2013/subconverter:latest
```



启动以后做个检测，可以得到类似的返回结果，说明正常启动了

```
curl http://localhost:25500/version
subconverter v0.7.2-4205dee backend
```



## caddy

再把前端和后端都加入caddy，允许直接外部访问

```
sub.elmagnifico.tech {
    root * /root/sub-web/dist
    file_server
}
cov.elmagnifico.tech {
    reverse_proxy 127.0.0.1:25500
}

```

重启

```
systemctl restart caddy
```



![image-20230408172324438](https://img.elmagnifico.tech/static/upload/elmagnifico/202304081723497.png)

到这里我的订阅转换就ok了，欢迎使用，修改也一起开源

> https://sub.elmagnifico.tech/
>
> https://github.com/elmagnificogi/sub-converter



## Summary

啦啦啦



## Quote

> https://github.com/CareyWang/sub-web
>
> https://github.com/tindy2013/subconverter
>
> https://www.myfreax.com/how-to-install-node-js-on-centos-7/
>
> https://github.com/tindy2013/subconverter
>
> https://ednovas.xyz/2021/06/06/subs/

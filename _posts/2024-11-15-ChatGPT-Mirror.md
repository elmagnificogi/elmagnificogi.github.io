---
layout:     post
title:      "ChatGPT-Mirror部署和体验"
subtitle:   "cws、dairoot、oaifree"
date:       2024-11-15
update:     2024-12-03
author:     "elmagnifico"
header-img: "img/bg2.jpg"
catalog:    true
tobecontinued: false
tags:
    - ChatGPT
---

## Foreword

cws一直有问题，而且只支持access token，经常要换很麻烦。之前有关注到dairoot的mirror，这次刚好试一下，发现体验还行



## ChatGPT-Mirror

> https://github.com/dairoot/ChatGPT-Mirror

项目很简单

> https://chatgpt.dairoot.cn/

官方体验站，也可以使用免费账号测试，基本都差不多



### 部署

脚本内是docker，所以机器需要提前安好docker

```shell
git clone https://github.com/dairoot/ChatGPT-Mirror.git

cd ChatGPT-Mirror/

# 修改管理后台账号密码
cp .env.example .env && vi .env


chmod +x ./deploy.sh
# 可能的话需要改一下 把启动脚本的docker compose改成docker-compose
vi ./deploy.sh
# 启动
./deploy.sh
```



caddy 反代一下

```
gpt.你的域名.com {
    reverse_proxy 127.0.0.1:50002
}
```



### 测试

> http://你的ip:50002

可以正常访问了

![image-20241115151616816](https://img.elmagnifico.tech/static/upload/elmagnifico/202411151516893.png)

管理员账号先进去添加使用者账号和ChatGPT账号

![image-20241115151723399](https://img.elmagnifico.tech/static/upload/elmagnifico/202411151517454.png)

- 支持独立会话，支持指定号池，也能单独冻结

账号支持使用session token，可以维持30天，还是比较好的

![image-20241115151759671](https://img.elmagnifico.tech/static/upload/elmagnifico/202411151517707.png)

可以把一些账号绑定给某一个号池，这样方便管理

![image-20241115151930401](https://img.elmagnifico.tech/static/upload/elmagnifico/202411151519442.png)

访问起来和GPT差不多，还可以

![image-20241115152054561](https://img.elmagnifico.tech/static/upload/elmagnifico/202411151520610.png)



### 403 Forbidden

![image-20241203143206491](https://img.elmagnifico.tech/static/upload/elmagnifico/202412031432543.png)

> https://github.com/dairoot/ChatGPT-Mirror/blob/main/docs/faq-cn.md

文档里有相关说明，换IP是最简单的，但是成本也是最高的，剩下就是用代理的方式

测试了一下wrap可以用，直接用wrap代理

直接启动wrap代理

```
docker-compose -f docker-compose-warp.yml up -d
```

验证局部模式的 warp 是否安装成功，如果 warp=off 则 warp 安装失败

```
curl -s --socks5-hostname 127.0.0.1:1080 https://cloudflare.com/cdn-cgi/trace |grep warp
```



如果验证成功了，修改环境变量，增加代理链接，然后重新启动

```
vi .env

PROXY_URL_POOL=socks5://warp:1080

./deploy.sh
```



外部验证代理成功的链接

```
http://你的域名/api/check-proxy?admin_password=环境变量中的ADMIN_PASSWORD
https://你的域名/api/check-proxy?admin_password=环境变量中的ADMIN_PASSWORD
```

正确的话就会返回类似下面的200提示

![image-20241203143325990](https://img.elmagnifico.tech/static/upload/elmagnifico/202412031433021.png)

再登录ChatGPT-Mirror，已经可以正常登录了



## Summary

团队内部使用足够了，后续把套餐再升级到team那就更方便了



类似的镜像站还有始皇的，之前看好像也可以通过权限分享

> new.oaifree.com



## Quote

> https://dairoot.cn/2024/07/02/install-chatgpt-mirror/


---
layout:     post
title:      "ChatGPT-Mirror部署和体验"
subtitle:   "cws、dairoot、oaifree"
date:       2024-11-15
update:     2024-11-15
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



## Summary

团队内部使用足够了，后续把套餐再升级到team那就更方便了



类似的镜像站还有始皇的，之前看好像也可以通过权限分享

> new.oaifree.com



## Quote

> https://dairoot.cn/2024/07/02/install-chatgpt-mirror/


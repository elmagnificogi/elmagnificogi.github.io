---
layout:     post
title:      "为什么我们需要一个NAS"
subtitle:   "健康码、开源、悬浮图片"
date:       2022-11-26
update:     2022-12-16
author:     "elmagnifico"
header-img: "img/led.jpg"
catalog:    true
tags:
    - Equip
    - Software
---

## Foreword

以前总觉得自己这么点数据也没啥用，也不出了什么大问题，都是存在自己电脑上或者云盘里，经历了一次次软件丢失以后，觉得是该有个地方用来存储自己的私人信息。

这里不是指什么账号密码，而是自己想存储的内容，有必要的时候可以分享给其他人，而不被审查等



## 为什么你需要一个NAS

我遇到的情况，你也有可能会遇到：

曾经存储的资源链接，失效了，并且再也找不到对应的资源了

某些破解资源，动不动就被防火墙或者审查机构删除了

存在云盘上的资源某一天变成了无法下载的情况

存在云盘上的资源某一天直接消失了，就好像从来没有上传过一样

分享的资源由于转发或者下载过多，导致被下架或者删除

分享的资源由于稀缺性，你的免费，变成了别人的收费资源

GitHub的Release可能会消失，比如开发时用到的Cython的某个release版本就被删除了，导致我还需要的时候就必须重新编译回退或者是找曾经下载的副本

GitHub的仓库可能也会凭空消失，某些你关注的内容，说不好哪一天仓库就没了，涉及到DMCA、密码库、社工库等等内容，都会被审核删除。

GitHub不安全，任何fork的仓库，当作者需要的时候，他都可以通过申请，将所有fork仓库删除。更不用说GitHub本身无法排除政治立场，总会遇到无法使用的情况



曾经有过的东西：

某云网盘：很多资源消失了

某教育edu邮箱附带的OneDrive：本质上可以被管理员看到一切内容

移动硬盘：坏过一块了，还是不保险



## 使用权与所有权

有的时候不得不用盗版，不是付不起钱，而是订阅版有时候确实会坑爹，缺少网络或者重装或者换机器的时候都会遇到订阅版出现问题。

我们真的想要的是什么，是一个付费后，授权给我个人的东西，是我任何时候想用都可以用的东西，可以不允许分享，但是必须是我个人无限授权使用的东西。

类似的网络游戏、社交软件等，大家希望得到的是数据所有权，而不是使用权，本质上应该归属于玩家而不是运营商，就算游戏停运了，也应该有对应的单机版本和玩家的直接数据绑定。

人们想要的是类似于实体的商品，买到的时候他的使用权和所有权都是我们的，而不是仅仅只有使用权。



## 健康码

就比如臭名昭著的健康码，之前的仓库都被GitHub删除了，剩下的都是一些自用级别的。

现在转到了codeberg，但是说不好哪天也会没了

> https://codeberg.org/ilovexjp/health-code-simulator

不得不说这个健康码非常不错，同时也支持行程码，场所码等等

> https://ilovexjp.pages.dev/

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202211262308546.png)

也有一些不好的地方，首先他要联网，虽然可以离线，但是第一次必须联网这就有点蠢。

然后部署他也需要单独的服务器，这就有点麻烦



部署倒是还算简单，直接安装Ubuntu就能部署了

```bash
npm i -g uglify-js clean-css-cli html-minifier sass
make build
apt install python3 -y
npm i -g sass
make serve
```



如果使用caddy的话，可以这样部署

```
xxx.xxx.xx {
   root * /root/health-code-simulator/src
   file_server
}
import sites/*

```

重启caddy

```
systemctl restart caddy
```

重启caddy，就可以看到效果非常好了



## 悬浮健康码

还有一种方式，也非常简单，就是直接悬浮一个核酸检测结果就行，一般不会仔细看里面的时间

这需要一个悬浮APP配合，可以悬浮任意图片即可



#### 悬浮图片

> https://github.com/XFY9326/FloatPicture

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202211270301421.png)

透明度设置为1，最好是打开触摸移动和允许超出屏幕，不用的时候可以将其拖到屏幕边缘，不影响，也不容易被发现

需要使用的时候，直接拖到原来核酸检测结果上覆盖即可，操作起来也很简单。



- 这个APP很久没维护了，也有一点问题，不能编辑设置，一点编辑就崩溃了



#### Gallery:Floating Image and Vi

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202211270307674.png)

这个APP也能悬浮图片，他不能移动到屏幕外，但是可以双击让图片消失，可以双指缩放图片

- 缺点也非常明显，会弹广告，还好都是谷歌的广告，没开vpn的时候基本都打不开



## Summary

世事无常，只有捏在自己手里的才是真的吧

没过一周，健康码和行程码基本都下线了，转变的也太快了。



## Quote

> https://zhuanlan.zhihu.com/p/407133025

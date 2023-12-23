---
layout:     post
title:      "Copilot单账号共享合租服务"
subtitle:   "OpenAI，CoCopilot"
date:       2023-12-23
update:     2023-12-23
author:     "elmagnifico"
header-img: "img/z1.jpg"
catalog:    true
tobecontinued: false
tags:
    - Copilot
    - OpenAI
---

## Foreword

同ChatGPT，一个账号的Copilot分享给多人使用。默认Copilot单账号可以多端不同时使用，大概是3-4端没明显问题的。

由于通过某些渠道可以让Copilot直接访问到ChatGPT4，而Copilot只需要10刀，比直接买ChatGPT Plus便宜多了，就让很多人动起了Copilot转发到GPT的心思，这也导致了很多账号被彻底封禁。我这里不适用任何转发，只是单纯的作为代码辅助工具使用。



Copilot账号在开启时，建议关闭代码分享，否则可能涉及泄密等严重的问题



## CoCopilot

> https://cocopilot.org/dash

CoCopilot可以把原本的Copilot的账号分享给大概10个人左右的小团队使用而无需额外的操作。CoCopilot提供的公用token可以直接使用，但是还是建议使用自己的，更稳定一些

由于这个操作等于是在白嫖Github，所以原作者相关的仓库和账号都被直接ban了



首先开车，需要有一个开启Copilot的账号，先获取到Copilot的token

![image-20231223173036579](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20231223173036579.png)



授权登录获取到Copilot的token，填入其中，让其他用户也打开相同的页面，查看他的用户ID，给他对应的授权即可

> https://cocopilot.org/dash

![image-20231223173345294](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20231223173345294.png)



### VScode

VScode也需要使用CoCopilot的插件来完成共享，但是这个插件也被VScode下线了，所以要手动安装

![image-20231223170250976](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20231223170250976.png)



VScode安装插件的链接

> https://cocopilot.org/static/assets/files/cocopilot-0.0.6.vsix



安装完成以后，下载配置脚本，输入自己的token，替换到CoCopilot中，运行替换token

> https://cocopilot.org/static/assets/files/cocopilot_scripts.zip



![image-20231223172816975](https://img.elmagnifico.tech/static/upload/elmagnifico/image-20231223172816975.png)



### 激活

Cocopilot安装完成以后，在命令行中使能他，注意是`Enable CoCopilot`不是Copilot

![image-20231223214829024](https://img.elmagnifico.tech/static/upload/elmagnifico/202312232148050.png)

看到如下提示

![image-20231223214805154](https://img.elmagnifico.tech/static/upload/elmagnifico/202312232148233.png)

重新加载IDE，再次使能CoCopilot

![image-20231223215100993](https://img.elmagnifico.tech/static/upload/elmagnifico/202312232151020.png)

打开cocopilot的网页授权界面

![image-20231223215407199](https://img.elmagnifico.tech/static/upload/elmagnifico/202312232154220.png)

注意这里的验证码，后续需要使用

![image-20231223215422321](https://img.elmagnifico.tech/static/upload/elmagnifico/202312232154343.png)

填写验证码

![image-20231223215443441](https://img.elmagnifico.tech/static/upload/elmagnifico/202312232154468.png)

授权成功

![image-20231223215453311](https://img.elmagnifico.tech/static/upload/elmagnifico/202312232154335.png)



## 测试

可以自动提示整个代码了

![image-20231223215344909](https://img.elmagnifico.tech/static/upload/elmagnifico/202312232153944.png)



### 其他IDE

目前Copilot支持的IDE只有VScode、Visual Studio、Jetbrains全家桶、Neovim，使用方法类似，直接安装Copilot，然后使用token替换脚本后重启即可



## Summary

Copilot加入共享



## Quote

> https://zhile.io/
>
> https://cocopilot.org/dash


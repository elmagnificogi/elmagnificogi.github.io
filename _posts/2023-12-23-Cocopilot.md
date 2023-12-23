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



## CoCopilot

> https://cocopilot.org/dash

CoCopilot可以把原本的Copilot的账号分享给大概10个人左右的小团队使用而无需额外的操作



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



### 测试

可以自动提示整个代码了

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/image.png)



### 其他IDE

其他IDE类似的操作即可，安装Copilot，然后使用Token脚本即可



## Summary

Copilot加入共享



## Quote

> https://zhile.io/
>
> https://cocopilot.org/dash


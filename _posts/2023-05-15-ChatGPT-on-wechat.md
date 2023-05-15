---
layout:     post
title:      "基于企业微信搭建一个ChatGPT应用"
subtitle:   "微信、railway"
date:       2023-05-15
update:     2023-05-15
author:     "elmagnifico"
header-img: "img/x12.jpg"
catalog:    true
tobecontinued: false
tags:
    - ChatGPT
---

## Foreword

基于企业微信搭建一个ChatGPT服务，比较巧妙的是刚好这个GPT是不想公开的，又想限制权限，又怕被滥用，在企微里使用刚刚好。



## chatgpt-on-wechat

![image-20230515174157512](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151742617.png)

主要是基于以下项目

> https://github.com/zhayujie/chatgpt-on-wechat

Wechat robot based on ChatGPT, which using OpenAI api and itchat library. 使用ChatGPT搭建微信聊天机器人，基于GPT3.5/4.0 API实现，支持个人微信、公众号、企业微信部署，能处理文本、语音和图片，访问操作系统和互联网。



官方的说明文档还是有点迷，有些地方说的很模糊，两种方法混在一起，试了好几次才成功

> https://github.com/zhayujie/chatgpt-on-wechat/blob/master/channel/wechatcom/README.md

这里重新总结一下我的流程



## 使用railway搭建

首先需要有企业微信，并且拥有最高的管理权限，分级管理员是不行的，就是要企业创建者才行。没有的话可以自己新建一个企业。



#### 企微后台

通过创建人扫码，进入企微后台管理界面

> https://work.weixin.qq.com/



开始收集信息：

进入`我的企业`->`企业信息`，记住`企业ID`

![image-20230515175254907](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151752957.png)

进入`应用管理`, 在`自建区`选`创建应用`来创建企业自建应用，上传应用logo，填写应用名称等，创建应用后进入应用详情页面，记住`AgentId`和`Secret`

![image-20230515181341547](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151813583.png)

Secret需要创建者号登录企微后查看系统发送的密钥



设置应用的`可见范围`，哪些人可以使用

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151812561.png)



查看刚才创建的应用详情，在接收消息处，启用API接口，并进入编辑

![image-20230515175425103](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151754143.png)

进入这个页面以后，可以先生成一个`Token`和`EncodingAESKey`并且记住，暂时先别关闭，切去其他操作

![image-20230515175203477](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151752521.png)



#### Openai

进入openai获取api key，记下`KEY`

> https://platform.openai.com/account/api-keys

![image-20230515180457800](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151804858.png)



#### Railway

进入Deploy on Railway

> https://railway.app/template/-FHS--?referralCode=RC3znh

需要填写的参数如下

![image-20230515175748884](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151757951.png)

将刚才收集到的信息全都填进去，然后Deploy即可，等待服务启动



一般这会不会报错，启动以后可以在Settings中看到对应的web

![image-20230515175952755](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151759810.png)

也可以自定义域名，填好域名以后，他会自动提示你CName填什么的，修改即可



#### 回到企微

完成了部署以后回到企微，继续填写刚才的接收消息服务器配置

将URL填入刚才启动分配得到的URl并加上wxcomapp，如下

```
https://xxxxx.up.railway.app/wxcomapp
```

 然后点击保存，如果URL等有问题，会提示回调出错的

- 虽然说没有认证的企业不能用域名，但是我实测是可以的
- 虽然说可以用http，但是实测只要用http必然报错，只能用https



#### 回调测试

企微有一个回调测试，不通过的话，这个app无法使用的，上面的接收信息设置也就无法保存，可以通过官方测试接口查看

> https://open.work.weixin.qq.com/wwopen/devtool/interface/combine



可以看到成功的回调必须能正常返回你输入的`EchoStr`，会失败的都是提示失败或者没有返回的

![image-20230515180933462](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151809516.png)



#### 企业可信IP

先去APP，随便发一个消息，然后去Railway查看log

![image-20230515181809095](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151818153.png)

可以看到报了一个错，然后有提示IP是来自哪里的，需要将这个IP添加到企业可信IP中



![image-20230515181503452](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151819972.png)

添加完成以后，就可以正常使用了，理论上也不会有报错的情况了。

- 注意这个IP每次重启Railway的服务的时候会变，需要重新设置



#### 正常使用

![image-20230515181236528](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151812561.png)

最后给到所有人权限，就能在工作台里直接使用了

![image-20230515181109433](https://img.elmagnifico.tech/static/upload/elmagnifico/202305151811493.png)



## Summary

默认的OpenAI拿到的key，其实是GPT3的接口，而3.5和4的接口都需要额外申请，并且还不一定能过

申请链接在这里，我的过了一个多月了还是没反应。

> https://openai.com/waitlist/gpt-4-api



## Quote

> https://github.com/zhayujie/chatgpt-on-wechat
>
> https://github.com/zhayujie/chatgpt-on-wechat/issues/1017
>
> https://github.com/zhayujie/chatgpt-on-wechat/issues/1093

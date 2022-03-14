---
layout:     post
title:      "百度地图LBS云V4踩坑记录"
subtitle:   "api,maps，v3，云检索，javascript"
date:       2020-09-30
author:     "elmagnifico"
header-img: "img/baidu.jpg"
catalog:    true
tags:
    - JavaScript
    - baidu
---

## Forward

最近要做一个地图应用，所以想尝试使用现成的地图API，就看了一下百度地图的，主要是用LBS云，这里记录一下遇到的坑点



## LBS云

简单说，就是百度把基础位置信息和地图都给你搞好了，首先你只需要在他的数据平台里添加你需要的独立数据进去，字段什么的可以自建，然后后面可以靠云检索来搜索这些数据，由于百度云检索比较强大，搜索条件多样化，很好用。

其次这种方式下数据不是存在自己的数据库的，是存储在百度云中的，所以无需自建数据库，数据库的操作可以通过API进行，也可以手动在数据管理平台添加，比较自由。业务数据的展示也比较简单，基本就是JavaScript调百度API，然后显示数据即可，同时支持三端使用，当然这样并发等问题都不需要我们考虑，只要我们出钱就行了，如果访问量不大我觉得直接调用就行了，我只是轻量使用，所以感觉可以用。

上面说的都是好处，下面细说坑都有哪些。



## 虎鲸数据管理平台

> http://lbsyun.baidu.com/data/mydata#/?_k=viahay

默认百度的数据管理平台是虎鲸数据管理平台，然后默认进入是v3版本的，坑就在这里了，首先从17年开始，就推出V4版本了，而V3与V4的接口并不相同，并且数据不互通。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/X5i4MWdLNbUAZek.png)



#### 云检索

除此以外，V3是可以支持云检索的，而V4目前不支持！！！你没看错，上线3年了，不支持云检索。

而这个信息在LBS云是看不到的，只有在云检索才能看到，然后云检索的V3与V4就对应数据平台的V3与V4，他们是捆绑在一起的。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/YO4dAwKXCRm18hZ.png)



#### 准入

由于不支持云检索，但你又想用，那就只能用V3，而V3目前不支持新用户！！

V3的文档也要快没了，这非常坑爹啊。

所以要用只能用V4的版本，但是V4云存储又不支持V4的云检索。



#### 文档

> http://lbsyun.baidu.com/index.php?title=lbscloud/guide/explanation

默认文档里好多链接都是V3的，显示的API也是V3的，这个问题就很多，我参考V3弄了半天V4，然后各种问题，后来发现V4文档是单独存在的

> http://lbsyun.baidu.com/index.php?title=lbscloud/api/geodataV4



## LBS API

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/CIXDq8ZBbNPSsmr.png)

要用LBS云服务，首先肯定得建个表，这个表的基础字段是不能修改的，能改的只有自定义字段

虽然V4不能用云检索，但是LBS本身有一个查询API，但是查询API有个问题，这个很坑，现在工单都还没回我。

- 基本字段里我测试，可以通过LBS poi查询的只有title，剩下属性一概无法查询
- 自定义自动可以查询，但是也有限制，同时默认是不能查询的，需要修改一个属性，这个属性无法通过UI修改



#### poi 查询指定条件数据

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/XiqAcrCEUfNudFZ.png)

虽然这里写的请求参数设置指定参数名，然后查询，实际上其他属性只要一查就返回所有数据，根本不过滤。

而自定义属性默认的is_search_field可以通过UI设置，但是V4不支持云检索，所以设置其实没用，is_index_field属性默认是0，也就是不支持云存储查询

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5p8UqH63urTRlbF.png)

而这个东西是在自定义列的属性里说明的，如果你没看到这个API，那你根本不会知道为啥不能poi查询自定义字段

而要修改这个is_index_field字段，又必须先知道这个字段的id，而这个字段的id从管理平台里看不到，必须先用查询列把他查出来，真的坑爹，来回折腾人

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/4OMLIGX1rbA5pCy.png)

#### 正确使用云存储查询的办法

总结一下，要使用云存储的查询：

1. 删除所有数据
2. 首先创建自定义列，
3. 创建好以后查询自定义列的id
4. 然后拿id去修改自定义列的is_index_field属性
5. 最后才能条件查询这个字段。



#### 查询列（list column）

首先这个列仅指自定义字段，默认建表的基础字段无法查询，而文档上都没写，所以才会出现基础字段大部分不能条件搜索，只有title可以查询，但是即使查询也是字符串匹配而已，不能和云检索相比



#### 存在数据无法对表进行修改

你没听说错，只要这个表存在数据，那么无论你是删表，还是修改字段，都是不允许的，强行操作直接失败。

关键是删表都不允许，必须要你把数据全删了以后才能删表。

而修改字段属性比如is_index_field，那也必须要删了所有数据，然后才能操作字段属性。



## 工单

百度工单是真的有点差，工单的图片无法直接显示，要拖链下载。

工单不支持上传除图片以外任何其他东西。

工单回复极慢

最让人难受的就是工单客服不识字，我反馈了半天v4的API问题，客服跟我疯狂回复V3的问题和云检索的问题，我API和V4链接反复贴了老半天，客服总算是睁眼识字了。



## Summary

百度云在用的人也比较少，能找的参考也少，同时官网的示例也是老版本的，感觉有点难受啊，唯一能用的大概也就只有数据展示这一块的JavaScript了。

最后再吐槽一下，v3版本的api好歹还是RESTful风格的，v4一下所有请求全变成post了，我让感觉一脸懵逼，这是咋设计的



## Quote

> http://lbsyun.baidu.com/index.php?title=%E9%A6%96%E9%A1%B5


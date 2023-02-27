---
layout:     post
title:      "根据IP获取地区API"
subtitle:   "淘宝"
date:       2020-09-02
author:     "elmagnifico"
header-img: "img/api-bg.jpg"
catalog:    true
tags:
    - Java
    - Springboot
---

## Foreword

最近需要通过IP获取对应的地区，然后搜了一下发现有淘宝现成的，而且多数帖子里的淘宝api早就失效了，这种重新记录一下



## 淘宝API

淘宝IP地址库如下

> http://ip.taobao.com/index



淘宝当前通过ip地址查询位置的api如下

```
/outGetIpInfo?ip=[ip地址]&accessKey=[访问密匙]
比如:
http://ip.taobao.com/outGetIpInfo?ip=113.110.227.81&accessKey=alibaba-inc
```

这里直接使用网络的公钥,alibaba-inc,然后这个接口有限制,qps只有1,只是偶尔用用可以用这个



返回数据格式如下:

```json
{"data":
 {
     "area":"",
     "country":"中国",
     "isp_id":"100017",
     "queryIp":"113.110.227.81",
     "city":"深圳",
     "ip":"113.110.227.81",
     "isp":"电信",
     "county":"",
     "region_id":"440000",
     "area_id":"",
     "county_id":null,
     "region":"广东",
     "country_id":"CN",
     "city_id":"440300"
 },
 "msg":"query success",
 "code":0
}
```

其中code的值的含义为，0：成功，1：服务器异常，2：请求参数异常，3：服务器繁忙，4：个人qps超出。



## IP地理位置库

实际上阿里云也有对应的云库可以使用

> https://www.aliyun.com/product/dns/geoip

唯一的问题就是,云库太贵了,实际调用上限1万次,我又用不完,一个月得要70,而这个免费的库qps又低的要死

![](https://img.elmagnifico.tech/static/upload/elmagnifico/zyQWomAapLbVDJO.png)

## 其他IP库

百度的API,可以返回城市中心经纬度

> http://lbsyun.baidu.com/index.php?title=webapi/ip-api

太平洋网络IP地址查询,这里会同时检测是否代理了

> http://whois.pconline.com.cn/

站长之家的IP查询接口,需要注册成为会员,然后申请API,问题是申请API后台卡爆,感觉也活不久

>http://ip.chinaz.com/



都可以用,但是稳定不稳定,就不知道了

## Quote

> http://ip.taobao.com/index
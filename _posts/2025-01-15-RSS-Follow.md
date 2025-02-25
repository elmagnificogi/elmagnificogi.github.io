---
layout:     post
title:      "RSS Follow体验"
subtitle:   "TTRss，RSS，RSSHub，订阅，激活码"
date:       2025-01-21
update:     2025-01-21
author:     "elmagnifico"
header-img: "img/blackboard.jpg"
catalog:    true
tobecontinued: false
tags:
    - RSS
---

## Foreword

RSS难得新增一员，体验一下Follow，看看和TTRss有啥不一样的，有啥改进的点



## Follow

> https://follow.is/

![image-20250121163433442](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121163433541.png)

Follow支持opml导入，所以TTRSS的内容可以直接导进来，对应也有配套的APP，不用自己去找支持TTRSS的订阅APP，生态整体比较完整

Follow整个界面也更加现代一些，TTRSS则是更简洁，更快，动效上明显多了很多内容

相比TTRSS可能需要设置各种插件来爬取文章内容，Follow似乎把这一块都简化了，更容易上手一些

![image-20250121163729432](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121163729488.png)

打开某一个blog的文章，是可以看到有多少人也一起订阅了这个网站的内容

![image-20250121164005886](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121164005927.png)

甚至可以看到我自己的的网站被多少人订阅了，我可以看到具体谁阅读过我的文章



## 认证

如果这是你的订阅源，需要本人认证，可以通过下面的三种方式

![image-20250121164539778](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121164539835.png)

大致看了下，内容和描述都要插入一些奇怪的东西，不喜欢，还是插入RSS标签好一点



对应我Blog中的feed.xml增加标签即可



```xml
{% raw %}
---
layout: null
---
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{{ site.title | xml_escape }}</title>
    <description>{{ site.description | xml_escape }}</description>
    <link>{{ site.url }}{{ site.baseurl }}/</link>
    <atom:link href="{{ "/feed.xml" | prepend: site.baseurl | prepend: site.url }}" rel="self" type="application/rss+xml" />
    <pubDate>{{ site.time | date_to_rfc822 }}</pubDate>
    <lastBuildDate>{{ site.time | date_to_rfc822 }}</lastBuildDate>
    <generator>Jekyll v{{ jekyll.version }}</generator>
    <follow_challenge>
        <feedId>55855418052542483</feedId>
        <userId>101522814280570880</userId>
    </follow_challenge>    
    {% for post in site.posts limit:10 %}
      <item>
        <title>{{ post.title | xml_escape }}</title>
        <description>{{ post.content | xml_escape }}</description>
        <pubDate>{{ post.date | date_to_rfc822 }}</pubDate>
        <link>{{ post.url | prepend: site.baseurl | prepend: site.url }}</link>
        <guid isPermaLink="true">{{ post.url | prepend: site.baseurl | prepend: site.url }}</guid>
        {% for tag in post.tags %}
        <category>{{ tag | xml_escape }}</category>
        {% endfor %}
        {% for cat in post.categories %}
        <category>{{ cat | xml_escape }}</category>
        {% endfor %}
      </item>
    {% endfor %}
  </channel>
</rss>
{% endraw %}
```



认证完成以后就会有一个小勾了

![image-20250121165407063](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121165407096.png)



## 分享

这是我多年积攒下来的一些订阅源，直接用Follow就可以分享，甚至还可以出售

> https://app.follow.is/share/lists/104444993002142720



![image-20250121165600901](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121165600955.png)

看起来似乎Follow想通过这种订阅或者说活跃转化成对应的虚拟货币进而维持或者是激励？？



这里是我自己的归类，似乎和上面的一样，只是订阅这个人可以订阅到他设置的所有订阅源？

> https://app.follow.is/share/users/101522814280570880



![image-20250121171022818](https://img.elmagnifico.tech/static/upload/elmagnifico/20250121171022882.png)

看了下RSSHub，在这里竟然是有人提供RSSHub实例然后收费，帮你爬取一些内容，普通人部署了RSSHub也可以加入其中，目前官方应该是免费给你用的，可能某一天官方就不免费了，就要你自己去爬取内容了？那我为什么不用TTRSS，直接全集成好了，还不要去给别人掏钱，费这个鸟劲。



## Summary

目前Follow已经是公测阶段，可以免费加入了，但是功能不是完全体的，要完全功能还是得邀请码激活，这个比较麻烦，我也是问人要了一个才能导入甚至分享订阅的

目前看Follow有点意思，但是不多，比我的TTRSS其实没好多少，很多页面也是完全爬不到，还得配合RSSHub来一起使用抓取内容，那我感觉就没啥必要了，不能直接整合这个东西，体验上还是差一点的



目前看起来这个生态只是个金字塔，只有顶端流量大的人有的赚，其他人只能被收割，看起来并不是一个能循环起来的东西。前一段时间的火爆，现在很少看到相关内容了，估计后续生态起不来依然会沉寂到死

他只能对现有RSS的订阅再次划分，而不能产生新的内容，甚至想依靠这种划分来收割一波，信息差这么好利用吗，而至于你订阅源是否能得到利益，那就很难说了，订阅源作为核心的产出者，没有得到应有的流量，反而把利润分给了分发者和服务部署的人。生产者和消费者被剥削了，中介从中获利？

## Quote

> https://app.follow.is/share/lists/104444993002142720


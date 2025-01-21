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

```
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

```



## 分享

这是我多年积攒下来的一些订阅源，直接用Follow就可以分享，甚至还可以出售

> https://app.follow.is/share/lists/104444993002142720



## Summary

目前Follow已经是公测阶段，可以免费加入了，但是功能不是完全体的，要完全功能还是得邀请码激活，这个比较麻烦，我也是问人要了一个才能导入甚至分享订阅的



## Quote

> https://app.follow.is/share/lists/104444993002142720


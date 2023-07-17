## 注意

PS：Hux的blog有点对不起这么多star，长期不更新，而且讲道理某种程度上说他就是`startbootstrap-clean-blog`的中国化，现在由于他肉身在国外了，所以他的blog抛弃了很多中文特性。和开始的易用性相比，反而变差了，又向`startbootstrap-clean-blog`发展了。说得再难听一点，Hux自己都没写几篇，很多问题都没有解决，看issue就知道了，Blog的水平没咋提升，星星数量倒是翻了十倍。所以如果是新人建议就别模仿他的blog了，很容易撞，还有很多更好看，简洁的blog可以参考

> https://github.com/kitian616/jekyll-TeXt-theme

如果只是想体验一下，玩票性质，可以试一试，认真做建议去看看其他模板或者自己写一个



#### 自用功能

- update.sh和update_proxy.sh，用于平常小修小改的更新文章
- deploy.sh，用于自动部署更新的脚本，注意：该脚本无法自己更新自己





**2023.7.17**

- 修复目录栏滚动条
- 修复引用链接过长，未分行处理



**2023.4.10**

- 增加水印功能



**2023.3.25**

- 支持Mermaid
- 增加导航页的顺序（about和tag顺序就可以设置了）
- 增加统计偏移量



**2023.2.4**

- 增加置顶功能



**2022.12.14**

- 增加网站统计
- 增加页面统计
- 增加动态效果
- 增加顶部进度条
- 增加返回顶部按钮
- 增加页面谷歌翻译
- 背景显示彩带



#### 2022.2.23

- 替换Google追踪的代码，移除无用的相关代码
- 整理网站tag，所有图片替换成自己的图床
- 修改License，使用GPL
- 切换CDN为cloudflare
- 切换fontawesome-webfont为4.7.0，支持qq telgram等图标



#### 2021.4.30

- 添加latex公式支持（Hux自己的挂了2年了）
- 移除less等编译时用的内容
- 增加页面导航显示的排序

详细可以看这里

> http://github.elmagnifico.tech/2021/04/30/Typora-LaTex-Mathjax/



#### 2021.4.28

- Hux长期不更新，Hux用的js的cdn基本国内都挂了（导致网页加载时间极长），所以将部分link转成bootcdn部分直接作为本地文件存储了

- 修改代码中注释的渲染方式，看起来更明显了(之前的灰色斜体中文简直不是给人看的)

- 删除了一些没啥用的文件

- 移除Hux残留的一些编译文件

- 移除代码中早已过期的注释的内容



#### 2018.2.9

首先Hux的blog有问题:
1. c与c++代码,与注释相关的地方会出现不换行的情况
2. Hux强行支持双语结构,带来的后果就是非双语文章的catalog全部出错,只有双语的正常
3. 双语结构,完全破坏了原本完美的Post文章结构.

由于之前多说关闭了，Hux有支持网易云和disqus，然后网易云也关闭了，所以现在用的是disqus.

disqus在国内基本加载不出来，所以想要国内使用可以使用gitment

详情参考

> https://github.com/Huxpro/huxpro.github.io/issues/205
>
> https://imsun.net/posts/gitment-introduction/
>
> https://standhr.github.io/2017/12/15/Build-Vultr-vps-on-Shadowsocks/



- 当前版本删除了双语文章支持
- catalog正常工作
- 修改了head字体颜色为黑色
- 删除了Hux的portfolio等
- 修复c/c++代码注释问题(可能引起tab和space造成的不对齐的情况)

从今开始不再跟随Hux更新，由我自己更新



#### 2017.1.9

我的blog来自于Hux的博客，但是下面Hux说的稳定模板，由于更新不及时，显示有问题，建议直接fork他的原本的就行了

还有一个问题:
在about.html文件中:

```
<!-- 多说评论框 start -->
<div class="comment">
    <!-- This id is used for indexing my loss comments forcedly -->
    <div class="ds-thread"
    {% if site.duoshuo_username == "huxblog" %}
        data-thread-id="1187623191091085319"
    {% else %}
    <!-- U can just use this key generated to index comments at page about -->
        data-thread-key="{{site.duoshuo_username}}/about"
    {% endif %}

    data-title="{{page.title}}"
    data-url="{{site.url}}/about/"></div>
</div>
<!-- 多说评论框 end -->
```

这里面Hux是他自己的ID，这个duoshuo_username其实没啥用，关键是: data-thread-id ，实际的效果大概就是会把热评给显示出来.
具体为什么我没找到多说里详细解释

但是这个大概功能就是在about里面，由于其页面没有什么可评论的，所以他在这里放了一个其他文章的热评(猜测)，实际我的里面我把他删除了



Hux的head.html中有一个

```html
<meta name="google-site-verification" content="xBT4GhYoi5qRD5tr338pgPM5OWHHIDR6mNg1a3euekI" />
```

注意替换这个谷歌网站管理员的识别标签，会影响收录



## Ref

Hux的博客

> http://huxpro.github.io

Hux参考的博客

>https://github.com/StartBootstrap/startbootstrap-clean-blog-jekyll
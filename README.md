# 注意

2021.4.28

长期不更新，黄玄用的js的cdn基本国内都挂了（导致网页加载时间极长），所以将部分link转成bootcdn部分直接作为本地文件存储了



2018.2.9. 13:45:39

首先黄玄自己的blog有问题:
1. c与c++代码,与注释相关的地方会出现不换行的情况
2. 黄玄强行支持双语结构,带来的后果就是非双语文章的catalog全部出错,只有双语的正常
3. 双语结构,完全破坏了原本完美的Post文章结构.

由于之前多说关闭了,所以黄玄有支持网易云和disqus,然后网易云也关闭了,所以现在用的是disqus.

disqus在国内基本加载不出来.所以想要国内使用可以使用gitment

详情参考

> https://github.com/Huxpro/huxpro.github.io/issues/205
>
> https://imsun.net/posts/gitment-introduction/
>
> https://standhr.github.io/2017/12/15/Build-Vultr-vps-on-Shadowsocks/

###### 当前更新:

- 当前版本删除了双语文章支持
- catalog正常工作
- 修改了head字体颜色为黑色
- 删除了黄玄的portfolio等
- 修复c/c++代码注释问题(可能引起由于tab和space造成的不对齐的情况)

从今开始不再跟随黄玄更新,由我自己更新.

###### 待解决问题:

- c/c++代码注释问题

2017年1月9日 15:22:46

我的blog来自于Hux的博客,但是下面Hux说的稳定模板,由于更新不及时,显示有问题,建议直接fork他的原本的就行了.

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

这里面Hux是他自己的ID,这个duoshuo_username其实没啥用,关键是: data-thread-id ,实际的效果大概就是会把热评给显示出来.
具体为什么我没找到多说里详细解释.

但是这个大概功能就是在about里面,由于其页面没有什么可评论的,所以他在这里放了一个其他文章的热评(猜测),实际我的里面我把他删除了

# Hux blog 模板

### [我的博客在这里 &rarr;](http://huxpro.github.io)


### 关于收到"Page Build Warning"的email

由于jekyll升级到3.0.x,对原来的pygments代码高亮不再支持，现只支持一种-rouge，所以你需要在 `_config.yml`文件中修改`highlighter: rouge`.另外还需要在`_config.yml`文件中加上`gems: [jekyll-paginate]`.

同时,你需要更新你的本地jekyll环境.

使用`jekyll server`的同学需要这样：

1. `gem update jekyll` # 更新jekyll
2. `gem update github-pages` #更新依赖的包

使用`bundle exec jekyll server`的同学在更新jekyll后，需要输入`bundle update`来更新依赖的包.

参考文档：[using jekyll with pages](https://help.github.com/articles/using-jekyll-with-pages/) & [Upgrading from 2.x to 3.x](http://jekyllrb.com/docs/upgrading/2-to-3/)


## 关于模板(beta)

我的博客仓库——`huxpro.github.io`，是经常修改的，而且还会有人乱提交代码，因此给大家做了一个稳定版的模板。大家可以直接fork模板——`huxblog-boilerplate`,要改的地方我都说明了。或者可以直接下载zip到本地自己去修改。

```
$ git clone git@github.com:Huxpro/huxblog-boilerplate.git
```

**[在这里预览模板 &rarr;](http://huangxuan.me/huxblog-boilerplate/)**


## 致谢

1. 这个模板是从这里[IronSummitMedia/startbootstrap-clean-blog-jekyll](https://github.com/IronSummitMedia/startbootstrap-clean-blog-jekyll)  fork 的。 感谢这个作者
2. 感谢[@BrucZhaoR](https://github.com/BruceZhaoR)的中文翻译

3. 感谢 Jekyll、Github Pages 和 Bootstrap!

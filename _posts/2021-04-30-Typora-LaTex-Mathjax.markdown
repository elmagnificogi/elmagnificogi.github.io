---
layout:     post
title:      "Typora下使用LaTex公式，Jekyll使用Mathjax显示公式"
subtitle:   "Markdown,blog"
date:       2021-04-30
update:     2021-04-30
author:     "elmagnifico"
header-img: "img/bg7.jpg"
catalog:    true
mathjax:    true
tags:
    - blog
---

## Foreword

写RVO的时候就发现公式有点处理不了，都是贴图，然后贴图大小不好控制，实际看起来也很难看。

搜了一下发现Typora可以直接使用Latex公式，那就很简单了



## Typora

#### 准备

首先，Typora显示公式，必须要使用Markdown 扩展语法，启用内联公式

![image-20210430145827055](https://i.loli.net/2021/04/30/Z3B9G4TrKgyNPJQ.png)



#### 使用

使用比较简单，如果是嵌入在同行中的公式，就用 `$` 开头即可

如果是独占一行的公式，就用`$$`开头

如果用快捷键就是`Ctrl-Shift-m`



具体公式语法可以查：

> https://www.cnblogs.com/wreng/articles/13514391.html



#### 测试

独行公式

```
VO\frac {A } {B }（ { V_B }）
```

$$
VO\frac {A } {B }（ { V_B }）
$$

同行公式

```
A = \{ \langle G \rangle \vert G \text{ is a connected undirected graph}\}
```

比如   $ A = \{ \langle G \rangle \vert G \text{ is a connected undirected graph}\} $  



## jekyll 支持公式

#### MathJax

默认的jekyll的markdown是不支持显示公式的

推荐使用下面的脚本，嵌入到你的post loyout中

```html
<script type="text/x-mathjax-config">
    MathJax.Hub.Config({
        tex2jax: {
            inlineMath: [ ["$","$"]],
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            processEscapes: true
        }
    });
    MathJax.Hub.Queue(function() {
        var all = MathJax.Hub.getAllJax();
        for (var i = 0; i < all.length; ++i)
            all[i].SourceElement().parentNode.className += ' has-jax';
    });
</script>

<script src="https://cdn.bootcdn.net/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML"></script>
```



#### page.mathjax

因为这个mathjax挺消耗性能的，而且比较慢，如果文章里根本没有公式，最好就别加载了。

对应的最好再添加一个开关，如果文章里用了公式，多添加一笔即可。

```
<!-- add support for mathjax by voleking-->
{% if page.mathjax %}
  {% include mathjax_support.html %}
{% endif %}
```

文章开头添加上mathjax:    true即可，如下：

```
layout:     post
title:      "RVO算法详解"
subtitle:   "RVO2,OV"
date:       2021-04-19
update:     2021-04-29
author:     "elmagnifico"
header-img: "img/zerotier.jpg"
catalog:    true
mathjax:    true
tags:
    - pathfinding
```



## 花括号问题

#### Typora和web显示不兼容

由于是jekyll，他要优先解析post的内容，而定位又是通过花括号来完成的，如果正文或者哪里带有花括号，容易出现报错的情况，一般这种情况下就要用下面的方式来强制不解析。

```
{% raw %}

xxx...

{% endraw %}
```

但是当jekyll遇到markdown，又遇到latex的时候，这个花括号就非常复杂了



比如我们想要显示下面的这个公式

$ \Sigma= \lbrace 0, 1 \rbrace $

如果你直接输入，下面的内容，在typora里显示是正确的

```
$ \Sigma= \{ 0, 1 \} $
```

显示：$ \Sigma= \{ 0, 1 \} $



但是如果你直接去对应的页面查看，就会发现显示的是$ \Sigma=  0, 1  $，你的花括号都被吃了

这种情况下就算使用raw也无法阻挡jekyll和markdow会解析花括号的问题，要防止解析必须套2层

也就是说你必须写出下面这样，web页面解析显示才能正确

```
$ \Sigma= \\{ 0, 1 \\} $
```

可是这样在typora中又会显示错误，类似于这样：

![image-20210430152558521](https://i.loli.net/2021/04/30/y2JbXqmCTODv31B.png)

#### 解决办法

要解决这个问题，也很简单

使用 `/brace` 代替花括号，还是上面的公式，我们写出下面这样：

```
$ \Sigma= \lbrace 0, 1 \rbrace $
```

然后你就看到$ \Sigma= \lbrace 0, 1 \rbrace $ 无论是typora还是web显示，都是正确的了



类似的一些符号，由于潜在的解析问题，都可以通过直接输入对应的符号名称来代替，从而解决符号不兼容的情况

这样能让typora和web解析后的保持一致就很舒服了。



## Summary

一开始没想到符号代替，找了半天代码的解决办法，发现都不行。



## Quote

> http://cn.voidcc.com/question/p-bzhlwrjt-py.html
>
> https://github.com/Huxpro/huxpro.github.io/pull/398/commits
>
> https://brucezhaor.github.io/blog/2016/01/07/Mathjax-with-jekyll/
>
> https://www.zhihu.com/question/343751976/answer/809450524
>
> https://segmentfault.com/q/1010000007941694/a-1020000011904225
>
> https://www.bilibili.com/read/cv1578688/


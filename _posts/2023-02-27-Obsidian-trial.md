---
layout:     post
title:      "Obsidian踩坑"
subtitle:   "格式,链接,主题"
date:       2023-02-27
update:     2023-02-28
author:     "elmagnifico"
header-img: "img/bg1.jpg"
catalog:    true
tags:
    - Markdown
---

## Foreword

Obsidian很早之前就听说了，忍着很久都没用，也没试过，这次试一试，看看能否替换当前的组合

## Obsidian
![image.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202302280012678.png)

知识谱系图，可惜我的现在还没有链接起来

> https://obsidian.md/

下载安装总体都非常快，启动甚至比typora都快，给人第一感还是非常不错的。

意外发现Obsidian的白板非常好用，可以插入文字、文章、视频、图片等等内容，可以联系在一起，用来开会或者头脑风暴，非常不错

![image.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202302280018039.png)


但是后面的体验只能说非常糟糕了，不得不吐槽，他距离开箱即用还是有不少差距的。



## 吐槽

### 视频链接不兼容

比如B站视频链接，一定是类似的格式，但是在Obsidian那边直接无法显示

```
<iframe src="//player.bilibili.com/player.html?aid=525182724&bvid=BV1vM411j7rT&cid=1029478945&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

[[2020-09-28-Typora-Video]]


必须显式加入`https:`才能正常显示

```
<iframe src="https://player.bilibili.com/player.html?aid=525182724&bvid=BV1vM411j7rT&cid=1029478945&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

这一点还好，我通过脚本把所有视频链接全都替换了



### 页面不能自动调整宽度

后来想了想Obsidian的宽度这么窄，有一个好处，就是当你打开2个页面的时候，这种比较窄的宽度，排版看起来就比较适合，但是对于我这种带鱼屏，这种显示方式简直不要太难受。

![image-20230227231015936](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272310336.png)

可以看到文本内容两边有很大空白，不能调整



#### Zoom

可以通过字体和zoom缩放调整，但是这种方式明显会导致比例失调，也不能解决问题

![image-20230227231153105](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272311144.png)



#### 取消缩减栏宽

多数人可能会选择取消缩减栏宽，但是这个选项会导致文本特别长不说，而且会导致原本居中的图片靠左对齐，非常难看

![image-20230227231315397](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272313443.png)

就会变成这样，基本所有行他都要占满，一点空白都不给留

![image-20230227231436391](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272314507.png)

服了，咋就没个折衷一点的选项呢



#### 自定义CSS

![image-20230227232922634](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272329676.png)

在`.obsidian\snippets\`中增加自定义css片段，可以直接影响最终结果

```css
body {
    --file-line-width: calc(82vh);
  }
```

我加了一个调整宽度的代码以后，总算宽度好了点，虽然还是不能跟随边缘自动调整

这个选项完全可以做成一个设置，而不需要我手动操作这么一下。



### 主题

基本所有主题都翻了一遍，似乎没有特别适合中文的主题，很奇怪啊，这么久了连个像样的中文主题都没有。

测试的主题中只有`Typora-Vue` `Gitsidian`稍微好一点，其他的中文字体都非常难受

![image-20230227233339262](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272333295.png)



### Markdown语法

Markdown语法千千万，而我只认Github的，Obsidian只能把别人的语法转成Obsidian的，而不能把自己的转成别人的。

我就想用Github的语法模板，可惜不能设置

![image-20230227233638006](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272336037.png)

有第三方的插件可以做Markdown的语法规范，就有点类似于`ctrl+k+f`代码自动整理格式的东西，但是这个也是只能适配Obsidian，非Obsidian 的东西就没办法了。

Obsidian中的换行逻辑非常奇怪，3个换行只显示了1个空行，Typora中一个换行，在Obsidian中直接没有效果。



### 文件后缀

Obsidian只能识别`.md`后缀的文件，而`.markdown`就无法识别了，真的离谱。如果强行识别，就是用默认应用打开，服了，多识别一个不行嘛。
我只好又通过脚本把所有后缀改成`.md`



### 图床

![image.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272344069.png)
图床方面倒是有第三方插件，可以直接使用Picgo上传图片，这点还好



#### 图片显示源码bug

上面的图片在编辑模式下无法显示图片源链接了，而上上个图片是正常的，估计是图片宽度太宽了会导致这里出错吧



### 双向链接

![image.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202302272357945.png)
链接比较简单，可以直接用双方括号就能出现文件检索框，链接对应文件即可，然后就能看到知识谱系图也连上了

```
[[2020-09-28-Typora-Video]]
```

同样在对应的文章中也能看到反向链接，从而知道谁引用了本文
![image.png](https://img.elmagnifico.tech/static/upload/elmagnifico/202302280005703.png)

但是这个语法，没办法直接转换给Github pages使用，无法作为一个超链接直接加入进去，所以我的Blog在这里基本就没啥用了

#### 兼容双链
首先关闭`wiki链接`，这样插入的双链会自动转换成超链接形式
刚开始是直接把`_posts`作为Obsidian的根目录了，实际上我应该用blog的根目录，这样产生的双链接就可以使用相对路径
[2020-09-28-Typora-Video](_posts/2020-09-28-Typora-Video.md)


#### Jekyll

> https://github.com/Jekyll-Garden/jekyll-garden.github.io
>
> https://forum-zh.obsidian.md/t/topic/8852
>
> https://github.com/oldwinter/knowledge-garden

发现了一个Jekyll的解决方案，他可以支持把Obsidian的双链接转换成对应的超链接，如果想和我自己的blog结合，确实可以用这种方案。

oldwinter写的比较细，所以打算尝试一下他的用法，看看是否真的ok


### 滚动条定位不准确

基本Obsidian中的大部分跳转，在返回时都无法返回到之前的位置，要么错位，要么直接返回到了文章开始，体感非常差。

这个跳转、链接是核心，如果他的体验不能做到完美，那我觉得这个软件就不太行。回过头来想想，代码跳转是相同思路，如果跳过去再回来的时候不能返回原位置，是个人都会觉得难受。



### 白板

媒体资源不能直接打开文件，必须要先把文件放到仓库下，才能被引用，就不能学学Typora图片上传直接copy一份不好吗



## Summary

本文一半基于Typora书写，一半基于Obsidian完成，只能说Obsidian发展了这么久，距离上手就能用，还是有不小的差距。
想要把这个变成比较完美适合个人使用的状态，还有太多的东西需要折腾了，如果Obsidian想要出圈，产品经理还需要把这个东西设计的更小白化一些，目前来看还是太复杂了，很多还能再设计优化的地方，还是没做到位。
作为一个知识管理软件，对比竞品notion、wolai之流，Obsidian还是落后的有点多了。Markdown体验不如Typora，知识管理现在应该是不如notion的，集成度也不如notion。

Obsidian的出路在哪里，目前我看不到，至少我基本不会再用了。



从某种程度上说写一个Obsidian真的难吗？一个纯前端的东西，大部分都是用HTML的特性就能完成了，把一些平常看不到的东西显示出来就能做好了（链接和大纲）至于notion和wolai，他们就是支持任何地点使用，可以分享，但是一样也会有限制，wolai最后很明显的就是会被审核内容，否则分享肯定会出问题。notion其实也有审核的问题，只是不明显而已。再一个就是数据安全的问题，notion就不会丢数据嘛？对于我等，我宁愿相信我自己不会丢。




## Quote

> https://forum-zh.obsidian.md/t/topic/6161
>
> https://github.com/Jekyll-Garden/jekyll-garden.github.io
>
> https://forum-zh.obsidian.md/t/topic/8852
>
> https://github.com/oldwinter/knowledge-garden
> 
> https://publish.obsidian.md/chinesehelp

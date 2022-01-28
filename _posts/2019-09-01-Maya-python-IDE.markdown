---
layout:     post
title:      "maya python脚本编辑器"
subtitle:   "IDE，Script editor"
date:       2019-09-01
update:     2021-05-07
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - maya
    - python
---

## Forward

由于很多问题吧，现在工作的maya script editor，虽然不好用，但是我主要代码是在vs里开发的，当然开发整个过程中完全没用代码提示或者什么其他的，全靠ctrl-cv，还是有点蛋疼的，加上目前开发的这个文件已经太大了，我又想把这个工程拆解重构一下文件结构，所以有必要有一个好用一点的IDE，vs显然是不行的，很多地方相当麻烦

## python编辑器

#### script editor

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/9HglFrwbeidxPqc.png)

原版的剧本编辑器呢，实在是有点难用，代码没有提示就算了，最近还经常出一个问题，不能复制粘贴，整个maya都不能了，不知道是怎么回事。

经常maya崩溃的时候会导致前面写的代码没了，maya没存住，这就很麻烦，短代码还好，长代码简直要死

还有一点就是这个东西代码不能写长，或者说存到内容不能太多了，太多了就会出现打开脚本编辑器非常慢，要等好一会才能完全打开。

#### Charcoal Editor

> http://zurbrigg.com/charcoal-editor-2

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/HiCwlX4WzvLsabI.png)

这个编辑器比较有名，相当于是script editor的一个加强版，有了导航，补全，高亮。

这个是内嵌在maya剧本编辑器里面的，相当于直接取代了原来的剧本编辑器，一体化程度很高。

不过这个也有一些缺点吧，比如：

- 单步调试这种功能基本就没有，然后虽然有了导航，但是本质上的代码加载和maya崩溃什么的也会影响到他，所以还是会受限制。

- 这个还有一个大问题，那就是不支持中文，不支持utf8，导致中文的输出也好，输入也好都会出现乱码的情况

- 这个软件本身是收费的，当然也有破解版

#### Sublime MayaSublime

> https://packagecontrol.io/packages/MayaSublime

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/aRsjb4rdwch8k3p.png)

Sublime就是相当有名的编辑器了，然后有人基于他开发了maya的 script editor

maya本身支持从外界获取命令，或者说maya在本地开了一个端口，可以通过socket进程间通信什么的直接把命令转发给maya的剧本编辑器，并由其执行。

MayaSublime 这个插件自然就是通过这个端口来完成充当剧本编辑器的操作。

对应的自然也有什么自动补全或者语法高亮的插件，一起用，得到最佳体验。

不过这样的也不够好吧，本身是一个比较轻型的编辑器，全副武装以后，可以得到一个功能比较全的编辑器。

而且脱离了maya，maya崩溃也不会影响自身

不过呢 sublime也在走向衰退，与之对应的就是这个插件本身也已经2年没更新了，虽然作者还在

> https://github.com/justinfx/MayaSublime

#### VS code

新时代的弄潮儿，VS code，从插件库里轻松一搜，就能看到对应的maya脚本的插件，其原理和sublime是一毛一样的

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/yTVreDzHbPh7wtg.png)

#### WingIDE

上面的编辑器，在这些python专用的IDE面前基本都是弟弟了，WingIDE也比较强，官方有专门的说明如何给maya使用，这支持力度就不一般。

> http://www.wingware.com/doc/howtos/maya

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/QN7vDU2g5YJOkEu.png)

Wing就具备了一般编辑器没有的调试功能，给maya编辑器调试的功能，自然打断点，单步调试，过程调试什么的就都有了，就不是其他轻型编辑器可以比拟的了。

## Pycharm

除了Wing，还有Pycharm算是老牌python IDE了，pycharm和IDEA是一家的，所以有很多地方比较相似吧，刚好这个项目也用了IDEA，一家人就刚好团团圆圆的。而且目前的主流就是他了，所以不用想，当然要选他作为最后写maya python的IDE了

无论是wing还是Pycharm想要支持高级的调试功能，那就必须是类似pro版本或者说高级版本，那就必然是收费的。

安装就是正常安装就行了



#### pycharm 关联 maya python

maya的开发包必须要有

> https://www.autodesk.com/developer-network/platform-technologies/maya

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/EjptgalBcDIw9oW.png)

在pycharm的settings中选择工程，然后设置project Interperter，第一次肯定是没有检测到maya python的，所以需要点加号手动添加mayapy的路径。

如图选择已有环境添加mayapy.exe，勾选使其可以被所有工程使用

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/OIaRyHjZC1gnTAp.png)

添加完了以后，就可以选择正确的interperter了，然后就会自动搜索看到这个python里安装了哪些包，maya本身的python当然没有这些包，这都是我后来自己加上去的。



#### maya devkit

有可能新maya环境没有devkit，会出现找不到下一步的目录，所以要先下载解压devkit包

> https://s3-us-west-2.amazonaws.com/autodesk-adn-transfer/ADN+Extranet/M%26E/Maya/devkit+2017/Maya2017_DEVKIT_Windows.zip



#### 删除默认python路径

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/kcgEW7uRAdaGLeB.png)

将这一条选中，然后点减号，之后会自动将该路径排除，这样才能正确解析mayapy

- 一定要先删除，再增加，pycharm好像对这个顺序有bug，导致如果先增加再删除会导致自动补全非常卡或者说整个pycharm会很卡



#### 添加maya python 扩展包

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/5LnM8couAEUri2t.png)

在对应的interperters中可以增加其扩展路径

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/XiJjrvmBZcKIH6f.png)

主要是把 这个目录下的的东西加到解释器中，这样代码自动补全才能正常工作

```
\Maya2017\devkit\other\pymel\extras\completion\py
```





#### 添加mayacharm

- 需要注意这里的mayacharm目前最新支持到pycharm2019.2.4（2020.2.10），最新版本不支持

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/l91HQs6tbdIjp2A.png)

在插件中搜索maya，就能直接找到mayacharm，安装完成以后重启IDE

然后在tools中就可以看到类似于MayaSublime的地方，这里就是通过maya的进程通信进行代码控制

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/PdiRr8CHDeZbAsN.png)

#### 测试

新建一个python文件，然后对世界问好，在run里面就能看到对应的maya执行命令

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/lANFYI9crqputf2.png)

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/uqDioS4lYhrJQBZ.png)

这里如果点了connect to maya's log 那么就可以看到剧本编辑器里的内容，同样会输出到pycharm中的mayalog中，这样的话代码如果执行有问题，一眼就能看到出来了。

我这里为什么把内容输出到了Output Window，那是因为我之前的python脚本重定向了print

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/GUvlhtdKMuEO2Nj.png)

这里就能看到 pycharm 作为IDE级别的强大了

#### 自启动脚本

每次要启动maya的端口，最好有一个自启动脚本，而maya本身也提供了这个接口，一般来说maya中自启动脚本都存放在

```
C:\Users\用户名\Documents\maya\2017\zh_CN\scripts
```

需要注意的的是其maya或者是maya\2017目录下都存在scripts，但是实际上工作的目录是zh_CN下面的目录

最好是通过查询，确定是该目录，这个是MEL

```
internalVar -usd
```


usersetup.py，自启动脚本必须命名为usersetup.py,然后填一下内容

```
import maya.cmds as cmds

if not cmds.commandPort(':4434', query=True):
    cmds.commandPort(name=':4434')
print "set the command port at 4434"
```

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/prhagYJofES1ZFb.png)

这样就能看到了自动开启了命令端口

#### Debug

> https://github.com/cmcpasserby/MayaCharm

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/tSoGqcDn9Haj1MZ.png)

理论上还是使用mayaCharm，新建一个mayaCharm调试器，然后选择启动文件，ok就行了

剩下的无论是debug还是run，亦或者是打断点什么的，他都帮你自动完成了，完全不需要我们再关心。

##### 问题

但是我在这里遇到了一个问题，只要我进入debug模式，必然maya报一个runtime error的错误，并且这个错误还没办法解决。

再去官方看了看，貌似最新版的pycharm全都无法正常工作，虽然他们报错的原因与我不同，但是2019版全都不行，这就很蛋疼了。

我感觉我应该不是这个问题，但是查不到为什么，我发现只要我在maya中导入

```
import pydevd_pycharm
```

必然会出现运行错误，而这个库我已经在mayapy里用pip安装了，理论上不可能再报错了

## 总结

折腾了这么半天，目前看到可行的方案都是pycharm2018.2+各种版本的maya能正常使用，就是找老版本挺麻烦的，暂时先不回退了，本身我用来debug就比较少，等作者更新一波再说吧。

如果不想折腾的话，还可以试试wing，万一wing好用呢？

## 参考

> https://zhuanlan.zhihu.com/p/29455376
>
> http://zurbrigg.com/charcoal-editor-2
>
> https://blog.csdn.net/weixin_43912248/article/details/88028761
>
> http://www.zdfans.com/html/25815.html
>
> https://www.cnblogs.com/snow-l/p/9548313.html
>
> https://qiita.com/paty-6991/items/cdb59416761e9f35008f

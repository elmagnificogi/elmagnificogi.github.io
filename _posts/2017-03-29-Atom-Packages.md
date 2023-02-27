---
layout:     post
title:      "Atom插件"
subtitle:   "pdf,packages,view"
date:       2017-03-29
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Markdown
---
## Atom安装

首先Atom虽然安装很快，而且安装包很小，但是其依赖项却很大很多。

通过cmd窗口 apm -v 可以查看atom需要的依赖项有什么

    >apm -v
    apm  1.15.3
    npm  3.10.5
    node 4.4.5 x64
    python
    git 2.12.0.windows.1
    visual studio

在Windows平台上 Visual studio 基本是必须的，或者说其核心编译组件是必备的，你不安一个
还真不行，我这里没有显示vs版本，因为我装了最新版的vs17，但是实际上没有问题。

python和nodejs 没有也行，但是很有可能有很多插件都需要他们支持，所以你也得装。

java虽 然上面没有说，但是需要的地方太多了，不安一个不行。

git 必须要有，不然连插件都没法安装。

#### 新安装可能碰到的问题

    Compiler tools not found
    Packages that depend on modules that contain C/C++ code will fail to install.
    Read here for instructions on installing Python and Visual Studio.
    Run apm install --check after installing to test compiling a native module

这个想都不想，肯定没有安 visual studio，安一个基本就没有这个问题了。


    xxx.xxx.xxx.xxx timeout

此类错误，想都不用想,肯定是网络有问题，但是这个要看情况，时好时坏的。

有的时候需要挂vpn，有的时候又不需要，需要的时候ss就可以，不需要的时候直连就行。

Atom挂ss其是有两种办法，先说麻烦的。

##### ss

###### 方法一

在.atom的目录下创建一个名为.apmrc的文件，自然是用git vi 来弄了，文件内容如下

    strict-ssl = false
    http_proxy = socks5://127.0.0.1:1080
    https_proxy = socks5://127.0.0.1:1080

然后开着ss代理就行了，这样就发现可以下载安装packages了

###### 方法二

ss设置全局代理，然后浏览器里勾选使用ie代理

说白了就是internet属性-局域网设置-代理服务器打勾-地址127.0.0.1端口1080，这样的话

可以不用任何修改文件就能直接代理安装packages，比较简单，如果是其他vpn就需要修改方法一的地址了。

#### Editor Setting

tab的制表符，atom默认是2个，一般用4个，如果需要修改直接从settings-editor-Tab Length 修改就可以了

## Packages

日后常用的Packages的添加都更新在这里

## markdown-pdf

有时候需要把内容导出成pdf或者什么jpeg或者png等图片格式，这个时候就需要用markdown转pdf了

> https://github.com/travs/markdown-pdf

今天网络极好，竟然settings中的install可以用了，直接搜索markdown-pdf就能安装了

安好以后设置了一下，其对应的快捷键，一键转换。

    '.platform-win32 .editor, .platform-linux atom-text-editor':
      'F7': 'markdown-pdf:convert'

在markdown-pdf的设置中可以设置对应转换的格式应该是什么。

需要注意的是他需要其他组件支付，一个是 tree-view ，一个是 markdown-preview ,这两个安装Atom就自带了

但是其是这还不够，还有可能出现下面的问题

#### 无法转换问题

    markdown-pdf: AssertionError: html-pdf: Failed to load PhantomJS module. You have to set the path to the PhantomJS binary using 'options.phantomPath'

遇到这个问题，其是是系统少了几个框架。

###### node.js

先要装 node.js ，其官网如下：

> http://nodejs.cn/

默认安装即可

###### phantomjs-prebuilt

cmd 命令行输入：(注意一定不要是管理员模式)

    npm install phantomjs-prebuilt

如果上面安装不动，那么手动下载吧：

> http://phantomjs.org/download.html

把下的安装包扔到下面这个目录里

    C:\Users\你的用户名\AppData\Local\Temp\phantomjs

再执行一次安装命令，很快就能安装完。

    PhantomJS not found on PATH
    Download already available at C:\Users\ELMAGN~1\AppData\Local\Temp\phantomjs\phantomjs-2.1.1-windows.zip
    Verified checksum of previously downloaded file
    Extracting zip contents
    Removing C:\Users\elmagnifico\node_modules\phantomjs-prebuilt\lib\phantom
    Copying extracted folder C:\Users\ELMAGN~1\AppData\Local\Temp\phantomjs\phantomjs-2.1.1-windows.zip-extract-1490592067250\phantomjs-2.1.1-windows -> C:\Users\elmagnifico\node_modules\phantomjs-prebuilt\lib\phantom
    Writing location.js file
    Done. Phantomjs binary available at C:\Users\elmagnifico\node_modules\phantomjs-prebuilt\lib\phantom\bin\phantomjs.exe
    C:\Users\elmagnifico
    `-- phantomjs-prebuilt@2.1.14
    ...
      `-- which@1.2.14
        `-- isexe@2.0.0

    npm WARN enoent ENOENT: no such file or directory, open 'C:\Users\elmagnifico\package.json'
    npm WARN elmagnifico No description
    npm WARN elmagnifico No repository field.
    npm WARN elmagnifico No README data
    npm WARN elmagnifico No license field.

Done 了就行了，剩下的警告无视就好。

这里 elmagnifico是我的用户名，而如果你用管理员模式安装，那么最后安装的路径是不对的，导致Atom实际上还是找不到你安装的phantomjs，我之前就以为管理员安装怎么都对，然后发现安装完根没安差不多。

错误安装如下：

    Writing location.js file
    Done. Phantomjs binary available at C:\Windows\system32\node_modules\phantomjs-prebuilt\lib\phantom\bin\phantomjs.exe
    C:\Windows\system32
    `-- phantomjs-prebuilt@2.1.14
      +-- es6-promise@4.0.5
      +-- extract-zip@1.5.0
      ...
      +-- request-progress@2.0.1
      | `-- throttleit@1.0.0
      `-- which@1.2.14
        `-- isexe@2.0.0

    npm WARN enoent ENOENT: no such file or directory, open 'C:\Windows\system32\package.json'
    npm WARN system32 No description
    npm WARN system32 No repository field.
    npm WARN system32 No README data
    npm WARN system32 No license field.

当然其实这种安装也不能说绝对错了，只是如果这么安装了需要你配置一下环境变量，才行。非管理员模式就不用配置环境变量。

重开一下Atom，然后再次转换，应该就不会有上面的错误提示了。

每次生成路径无法指定，都是被生成文档的同目录下同文件名，只有后缀不同而已。

#### image format issue

    Uncaught Error converting to image format. Check console for more information.

    C:\Users\********\.atom\packages\markdown-pdf\lib\markdown-pdf.js:166

    The error was thrown from the markdown-pdf package. This issue has already been reported.

其实这个转换器还是有一个问题，我刚好也遇到了，如果遇到图片，而且格式什么的还有问题，那么就自然会发生这个错误。

比如本文就有好几个动态图，根本无法转换，其他没图的就没事，点开View Issue，可以看到也有很多人都有这个问题。

所以，markdown-pdf 就介绍到这里，如果没有发生错误的情况下，可以用他，所见即所得，很好。

当然其实图片也不一定一定会出错，同一个文档有时候生成就出错了，有时候又不出错，非常奇怪，感觉生成不是很稳定。

#### 不出错小窍门

会出错应该是他调用动态生成的html或者js文件出错了，想要不出错就关闭预览，重新打开，直接生成，好像就不会报错。

## markdown-themeable-pdf

有了上面的经验，用 markdown-themeable-pdf 就很轻松了。

但是他虽然没有了图片转换的问题，他转换的结果和 markdownpad 2 基本是一致的，这就导致所见不是所得

当然也只是部分格式可能和 markdown-view 里所看到的不一样，大部分还是一样的。

所以其实也不是太完美，他转换完成以后会需要自动打开pdf然后看一下，其实就需要下面的这个插件支持了

除了上面说的问题，他的生成pdf的快捷键修改以后没有反应，这个我也不知道为什么，其他的都可以就他的不行。

    'atom-workspace, atom-workspace atom-text-editor':
      'ctrl-shift-E': 'markdown-themeable-pdf:export'

他还有一个好处，就是可以支持页脚和页头等格式编辑，具体目录在

    C:\Users\你的用户名\.atom\markdown-themeable-pdf

可以对应修改成你要的格式

## pdf-view

pdf-view 支持pdf预览，这样转换完成以后就可以直接打开看是否满意了。

## 红色虚线

打字的时候，一直都有各种红色虚线在下面，就跟word的拼写检查的错误一样，非常讨厌。

要取消拼写检查

    packages--->spell check--->disable

讨厌的红线再也没有了。

## Language Markdown

其实如果不想取消拼写检查，其实可以添加这个包，这个可以给markdown文本加上对应语言的拼写检查

红线相对会消失很多

## Markdown Scroll Sync

使用预览的时候发现，旁边的预览和当前写的地方，并没有对上，需要手动拖动才能看到。

而且每次一修改就会自动移动到头部去，就很烦。

那么有了 Markdown Scroll Sync 就可以自动跟随了。

相当于两个文档的滚轮会同步了，只是每次修改默认渲染会移动到最上方，会导致预览界面无限鬼畜的情况。

这一点不如 markdown pad2 的实时渲染。

## markdown-preview-enhanced

markdown的拓展, 虽然没用但是动态图看着非常强大。

需要一些外部库的支持，同时作者是国人，下面有中文介绍

> https://github.com/shd101wyy/markdown-preview-enhanced/blob/0.10.11/docs/README_CN.md

这个插件太强大了，他基本把本篇说的所有功能都合在了一起。

可以生成plantuml，可以直接右键导出pdf，可以设置同步滚动条等等功能。

然后突然发现，Atom自带的markdown+Markdown Scroll Sync的功能会在他的强大干扰下无法使用了

## plantuml

plantuml用的人还是比较少的，能找到配置的人也很少

首先如果使用Atom来写uml是不需要 graphviz 支持也行的。

当然最好是有支持，不然可能会出现有一些图无法支持，显示不出来的情况。

而上面提到的 markdown 的拓展插件就可以支持在 markdown 中写plantuml 非常强大，不过其需要 graphviz 的支持。

要在Atom环境下使用 plantuml 下面的插件各有不同但都能支持

### plantuml

    apm install plantuml

首先他不能预览，只有生成功能，也就是说你按照 plantuml 格式写的.pu 或者.puml 文本都可以利用他的快捷键直接生成.

然而由于他原生于Mac OSX，所以windows基本不支持，我用不了。

### language-plantuml

    apm install language-plantuml

这个是拼写支持，也就是书写语法，如果要自己写，还是必须要安装的

### plantuml-viewer

    apm install plantuml-viewer

这个就可以对写的plantuml进行预览，同时支持导出，拖动，缩放等功能

同时设置：

    Charset：UTF-8

就能支持中文字符/日语什么的其实也是可以的

这个需要Graphviz的支持，从下面下载，建议下 graphviz-2.38.msi ，一路默认安装就行。

> http://www.graphviz.org/Download_windows.php

如果被墙进不去，下面的方法也可以

管理员模式开Cmd，然后

    @powershell -NoProfile -ExecutionPolicy unrestricted -Command "iex ((new-object net.webclient).DownloadString('http://bit.ly/psChocInstall'))" && SET PATH=%PATH%;%systemdrive%\chocolatey\bin

    choco install Graphviz

    yes

    //如果没有java，也一并安装了吧
    cinst jdk8 -y

在这里我安java多次出问题，安完以后必须管理员开Atom才不会显示java找不到，不然就一直有下面的错，导致无法生成预览，最后下了一个jdk8，然后安装重启以后才正常。

    'java' could not be spawned. Is it installed and on your path? If so please open an issue on the package spawning the process.

在设置里写入你的Graphviz的dot.exe的路径

    Graphviz Dot Executable：C:\Program Files (x86)\Graphviz2.38\bin\dot.exe

这样以后就能正常生成了，但是这个插件有一个bug，如果你以前生成过，然后下次打开atom打开某个你生成过的文件，无论你怎么写入都无法实时更新预览的内容,除非你重新激活预览窗口才行.

这个问题见下面：

> https://github.com/markushedvall/plantuml-viewer/issues/11
>
> https://github.com/markushedvall/plantuml-viewer/pull/16

虽然说是有解决办法，但实际上这个版本还是有这个问题。

快捷键设置如下:

    'atom-workspace':
      'f7': 'plantuml-viewer:toggle'

需要保存对应的 plantuml 的直接右键save as 就可以了，建议保存为svg，其他格式一放大就失真了。

### plantuml-preview

    apm install plantuml-preview
    apm install plantuml

这个plantuml 没有上面说的bug，而且可以配合 plantuml 的插件的生成快捷键来激活生成(本质上这个插件就当了快捷键的角色，他自身的生成其实还是无效的)，或者是用保存的快捷键来刷新预览界面和生成。而且他可以选择生成png还是svg，png有一个问题，就是放大一点就很模糊，但是svg就非常清楚。

但是他也有明显的缺点，就是不支持预览界面拖动和缩放，必须要用快捷键ctr-+这种来缩放，而且keybind无法修改成使用滚轮来完成这个，所以使用上就感觉不如前一个预览插件了。

plantuml-preview 可以不需要graphz的支持，但是必须要有 plantuml.jar 的支持。

所以需要先从官网下载以后，放到某个安全路径里面

> http://plantuml.com/download

然后设置其路径，比如我就放在了下面这个位置

    C:\Users\elmagnifico\.atom\packages\plantuml-support\plantuml.jar

我是win10环境下的配置，其他环境官方就有文档教你怎么弄，除了win系统基本都能按照下面的来

> http://trevershick.github.io/atom/2015/12/04/plantuml-snippets.html

设置里的 Use Temp Directory 建议不要勾选，让他自己生成到和 .pu 文件相同目录下就好了。

快捷键也建议自己设定，因为用的插件多了，太容易冲突了。

### 解决快捷键冲突

使用各种插件变多以后，会出现各种快捷键冲突的问题，记录一下如何快速解决快捷键冲突问题

1. 用 Ctrl-. 打开 Keybinding Resolver
2. 按发生冲突的快捷键，可以看到高亮的就是当前快捷键对应的功能，其他的则是被冲掉的
3. 打开 keybindings，寻找到该快捷键对应高亮的这个功能，然后使用复制
4. 打开 keymap.cson 粘贴，然后把功能改成要触发的功能就行了

要注意上面一定是要复制完整，冲突的快捷键所在的整个使用环境，不然就会出现就算替换了，但是
无效的情况,比如下面的 find-next 功能键对应的是f3 他的环境是 .platform-win32 atom-text-editor, .platform-linux atom-text-editor ，想要替换他，那么必须要保证环境一致的情况，进行替换

```
'.platform-win32 atom-text-editor, .platform-linux atom-text-editor':
  'f3': 'find-and-replace:find-next'
```

保证上面的环境相同，然后使用 tree-view 替换，只有这样才能真正的替换f3对应的功能

```
'.platform-win32 atom-text-editor, .platform-linux atom-text-editor':
  'f3': 'tree-view:toggle'
```

像下面这样，使用其他环境去替换f3就会失败，原因大概是由于 f3 是先注册到了上面的两个环境中
虽然 keymap.cson 是最后注册的，但是无法改变 f3 的使用环境，就会造成 f3 覆盖命令无效

```
'atom-workspace, atom-workspace atom-text-editor':
  'f3': 'tree-view:toggle'
```

还有一种使用 unset! 来取消某个键的绑定，实际上并不好用

## 总结

plantuml国内用的还是挺少的，反而一搜好多日本blog里都有记录怎么用，让我参考了一下win下的设置。

## Quote

> http://blog.csdn.net/mishifangxiangdefeng/article/details/53308343
>
> http://ask.csdn.net/questions/247824
>
> http://blog.csdn.net/dream_an/article/details/51800523
>
> http://v7sky.iteye.com/blog/2314072
>
> http://www.jianshu.com/p/e92a52770832
>
> https://segmentfault.com/a/1190000004991637
>
> http://qiita.com/nakahashi/items/3d88655f055ca6a2617c
>
> https://www.zhihu.com/question/38098629
>
> https://atom-china.org/t/topic/428

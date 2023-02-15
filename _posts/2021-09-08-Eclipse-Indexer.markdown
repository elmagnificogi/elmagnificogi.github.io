---
layout:     post
title:      "Eclipse 无法保存 Use active build configuration 的解决办法"
subtitle:   "CDT，Indexer，exclude"
date:       2021-09-08
author:     "elmagnifico"
header-img: "img/bg2.jpg"
catalog:    true
tags:
    - IDE
    - Embedded
---

## Foreword

用eclipse合并好几个项目的时候发现保存索引设置的配置文件，无法正确保存。



## 现象

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/wJMx97gzP5Wu6yQ.png)

通过 C/C++ General 里的 indexer 选择 Use active build configuration ，并且勾上 Reindex project on change of active build configuration 然后应用，关闭。

在本次的使用中都没问题，切换配置，indexer也正确切换了。但是只要一关闭eclipse然后重新打开，就会发现这里变成了 Use a fixed build configuration ，还得手动改一次。不管怎么设置，这里都无法保存这个配置。



## 解决

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/Yq2SI5K7ZjOdQfp.png)

最后发现，只有通过 Configura Workspace Setting 修改对应的 Indexer，使用 Use active build configuration 。 然后关闭eclipse之后，再打开就会发现工程的配置变成了自动切换了，不再使用某个单一配置了。



不知道为什么project本身的配置被workspace给覆盖了，很奇怪的行为，只能这样绕过了，很多人问这个，但是都解决不了。



## debug问题

由这个我联想到一个相同问题。

如果配置了 eclipse 的 debug，比如 J-Link Debugging ，使用下面的配置

```
${config_name:${project_name}}/demo.elf
```

如果第一次打开eclipse，直接运行debug，立马会提示你找不到config_name，然后Debug进程就当场卡住，无法中止，无法debug，只能关闭eclipse重开。

如果第一次打开eclipse，并且双击了要debug的工程，还是会出现上述情况，这个时候必须要build一下当前工程，才能正确debug。

猜想，这个config_name和project_name实际上直到你点build的时候才被确定下来，刚打开的项目实际上并不知道（你咋能不知道上次编译的是啥呢，默认下拉里明明显示正确）, 这就导致了报错。

而对应的我这里的Indexer的问题，也是项目加载的时候这里本应该自动选择配置文件，由于实际上不知道当前配置名，导致他直接恢复了默认配置。



## Summary

蛋疼的eclipse cdt，相关问题可以搜到好多个，再看看时间，有的问题过了十几年都还有，贼离谱。



## Quote

>https://bugs.eclipse.org/bugs/show_bug.cgi?id=515826
>
>https://bugs.eclipse.org/bugs/show_bug.cgi?id=401667
>
>https://bugs.eclipse.org/bugs/show_bug.cgi?id=205299


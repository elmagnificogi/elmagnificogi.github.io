---
layout:     post
title:      "移除PDF的Security"
subtitle:   "安全，Foxit"
date:       2021-08-13
update:     2021-08-13
author:     "elmagnifico"
header-img: "img/cap-head-bg.jpg"
catalog:    true
mathjax:    false
tags:
    - Tools
    - Crack
---

## Foreword

最近看PDF，顺便就加点批注，高亮啥的，做个小笔记，方便日后再翻阅的时候找重点。然后就发现PDF被锁住了，处于安全状态，无法编辑。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/v6Uy2YTOzXNQb5D.png)

本身PDF就带了水印，还这么处理一下有点麻烦，找了半天没看到有啥快速便捷的办法。



## Foxit PDF Page Organizer

然后就发现了这个小工具，虽然年代久远，但是极其好用。

打开以后，首先改成所有文件，然后选择需要去掉安全选项的pdf

![](https://img.elmagnifico.tech/static/upload/elmagnifico/Ghtui1MOzARWkVf.png)

接着选中这个pdf，然后文件导出

![](https://img.elmagnifico.tech/static/upload/elmagnifico/xGRIpNQdnauoqOF.png)

这些都勾上，有可能会提示可能有些内容没有导出或者什么之类的，无视即可

![](https://img.elmagnifico.tech/static/upload/elmagnifico/3USzEMdt1lgrD28.png)

然后打开刚才导出的，就可以看到安全属性已经没有了，可以随意添加注释了。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/TxGQMucE5vpaXnI.png)



## 下载

放了一个在我的工具里

>https://github.com/elmagnificogi/MyTools/tree/master/Foxit%20PDF%20Page%20Organizer



## Summary

这种办法不需要什么解密，完全无视原先的，也不是pdf格式转换，可以最大可能的保留pdf的原样。

---
layout:     post
title:      "VSCode Kconfig插件"
subtitle:   "Kconfig、VScode、Extension"
date:       2025-01-23
update:     2025-01-23
author:     "elmagnifico"
header-img: "img/bg9.jpg"
catalog:    true
tobecontinued: true
tags:
    - build
---

## Foreword

还是决定自己写一个Kconfig通用插件，这里记录一下相关的内容



## KconfigLib

- [Kconfig](https://www.kernel.org/doc/html/latest/kbuild/kconfig-language.html#introduction) ：是一款Linux可视化配置文件格式。
- [Kconfiglib](https://github.com/ulfalizer/Kconfiglib)：是一款基于Kconfig格式实现的Linux可视化配置工具。

还是先玩明白目前的python系是怎么显示和处理Kconfig的

查了一下guiconfig.py 似乎可以以更好的形式来显示Kconfig配置内容



### 安装

```
pip install kconfiglib
pip install windows-curses
```



### 测试

正常情况下可以通过这种方式调用menuconfig，从而显示kconfig内容

```
python D:\\Python\\Python312\\Lib\\site-packages\\menuconfig.py
```

移除绝对地址以后，可以使用下面这种方式调用

```
python -m menuconfig
```

![image-20250113171459928](https://img.elmagnifico.tech/static/upload/elmagnifico/20250113171500061.png)



如果使用guiconfig，可以看到界面是类似QT的形式了，可以直接选择而不是嵌入在命令行中了

```
python -m guiconfig
```

![image-20250113171851173](https://img.elmagnifico.tech/static/upload/elmagnifico/20250113171851216.png)

突然发现这种方式似乎就够目前使用了，VSCode的版本甚至可以往后放一下



生成配置时使用下面的命令就可以生成一个config.h文件

```
python -m genconfig
```

也可以自定义一个.h的配置

```
python -m genconfig --header-path hello.h
```



## kconfig-frontends

深入调研以后发现，kconfig还有qt的版本，那理论上也有windows的版本，qt转windows还是比较简单的

理论上这些kconfig都是来源于kconfig-frontends

> https://github.com/uvc-ingenieure/kconfig-frontends

NuttX似乎都是基于kconfig-qconf的



目前看到各个框架似乎都抛弃了kconfig-frontends，迎接KconfigLib去了

> https://github.com/RT-Thread/rt-thread/pull/9050

kconfig-frontends似乎长年不更新，而KconfigLib里有一些新特性可以简化Kconfig



## Summary

先凑活用，日后还有需要再继续在这里完善



## Quote

> https://zhuanlan.zhihu.com/p/6068151451
>
> https://github.com/LuckkMaker/apm32-kconfig-example
>
> https://blog.csdn.net/wenbo13579/article/details/127464764
>
> https://boozlachu.medium.com/using-kconfig-for-own-projects-deb21e0d1804
>
> https://www.jianshu.com/p/00ce218ab598
>
> https://bbs.21ic.com/icview-3412466-1-1.html


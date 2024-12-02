---
layout:     post
title:      "宏管理工具之lite-manager"
subtitle:   "Kconfig、menuconfig、makefile、macro"
date:       2024-12-22
update:     2024-12-22
author:     "elmagnifico"
header-img: "img/bg5.jpg"
catalog:    true
tobecontinued: false
tags:
    - build
---

## Foreword

体验一下群友的宏管理工具



## lite-manager

> https://gitee.com/li-shan-asked/lite-manager

群友的宏管理工具，主要在gitee上更新，github更新不及时，release文件可能不能用



### 环境

至少需要一个make和gun c的环境，之前系统里一直有一个MinGW32 13年的版本，gcc大概只有6，编译过不去



通过下面的方式在线安装MinGW64

```
https://github.com/Vuniverse0/mingwInstaller/releases/download/1.2.1/mingwInstaller.exe
```

安装完成以后添加环境路径

如果环境里没有多的make，可以把`mingw32-make.exe`复制一个改名叫`make.exe`，不然最好还是保持原样，否则会影响到系统里其他地方的make使用



### 链接脚本问题

测试demo，发现无法正常运行，链接脚本无法识别-M的参数

![image-20241202191533410](https://img.elmagnifico.tech/static/upload/elmagnifico/202412021915442.png)



仔细看了一下Makefile，是生产的链接参数就是`-M`而不是`-Map`

![image-20241202191650116](https://img.elmagnifico.tech/static/upload/elmagnifico/202412021916144.png)

还好lite-manager源码也是有的，修改一下生成脚本

![image-20241202191633425](https://img.elmagnifico.tech/static/upload/elmagnifico/202412021916464.png)

再把生成的lm.exe拖到对应的测试目录下，进行测试，一切正常了

![image-20241202191619373](https://img.elmagnifico.tech/static/upload/elmagnifico/202412021916406.png)

- 如果不修改lm，make config时也显示不出来当前宏的状态



## Summary

lite-manager 总体还是挺小的，显示也还凑活，代码是开放的，完全可以自定义一些



## Quote

> https://gitee.com/li-shan-asked/lite-manager/tree/noui/


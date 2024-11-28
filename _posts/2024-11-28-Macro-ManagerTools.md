---
layout:     post
title:      "构建工具"
subtitle:   "Kconfig、menuconfig、makefile、macro"
date:       2024-12-28
update:     2024-12-28
author:     "elmagnifico"
header-img: "img/bg4.jpg"
catalog:    true
tobecontinued: false
tags:
    - build
---

## Foreword

当一套代码兼容了多个软件、硬件，需要面对不同情况下，进行不同的build的时候，就需要额外的工具来辅助完成这一个事情。



## 通常IDE构建

多数情况下，我们使用的各种IDE都有自己的一套UI或者配置文件来完成这个事情。

以VS为例，一般情况对于一个项目的整体构建的配置大概是这样的

![image-20241128162827009](https://img.elmagnifico.tech/static/upload/elmagnifico/202411281628088.png)

顶级就是Solution 一个解决方案，一个方案下面可能有多个工程共同构成，比如某些工程依赖的库、依赖的测试工程、依赖的一些子应用。解决方案里必然也有一个配置，用来指定各个工程在解决方案级别进行构建时，各个工程适用什么配置来进行组合构建。



单独的工程来说，有一个或者多个配置文件，比如debug和release，这种最常见的，剩下就是对于整个项目的源码文件、库文件、依赖文件、资源文件的组合，可能不同配置用到了不同的组合。

下面实际组织代码和编译的工具链也有可能是不同的，最终把结果输出到指定目录

类似于成品IDE来说，这些配置或者架构都是基础，实际去操作或者修改这些的东西，表面上看都是在UI界面上去填写或者勾选，实际最终都需要通过各种渠道或者命令参数，转化到最底层的工具链中，往往高级的IDE都会封装自有的工具里，不允许外部工具链介入



## Linux系构建工具

类似一个*Linux Distribution*的构建，不仅仅是要编译内核，还有boot、各种app、各种工具链，对应一整套Build工具就非常复杂，而且要统一在一起，才能实现后续的自动化测试或者发布等要求

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202411281640490.png)

一般来说buildroot这一套用的比较多一些，很多开发板或者芯片厂商也会使用这一套来维护自己的sdk等

![image-20241128171517768](https://img.elmagnifico.tech/static/upload/elmagnifico/202411281715827.png)

Buildroot是将一个个工程或者说应用，当作一个package单元，本质上就是把所有package编译好，打包到一起就得到了一个镜像，就可以烧给对应系统使用了

一般工作流程是先拉下来所有需要依赖的源码或者包，然后进行配置，核心配置工具就是menuconfig，他就类似于VS中的整个Solution的配置，规定了各个工程要以什么样的方式进行编译，而之后进入到每个工程以后还有各自详细的makefile去管理这个工程怎么编译，最终编译完成输出到output中。

kconfig就是用来描述各种包的依赖关系、配置选型的，最终由menuconfig具象化。

一些SDK也是使用了类似的机制，比如ESP-idf，就通过kconfig来选择组件等。



## 构建底层原理

无论是何种方式进行的构建，大都逃不过这么几个构建的组合，文件、宏、脚本。本质上就是选择文件，修改替换文件的部分内容，以及通过宏选择文件内容，就能完成整个构建的目的了。

而负责处理这部分的程序就是Make、Cmake、Ninja、Meson、Xmake等

![image-20241128180628200](https://img.elmagnifico.tech/static/upload/elmagnifico/202411281806253.png)

说来也比较搞笑，最初大家都用Make Makefile这一套流程，但是写Makefile是个麻烦事，而且随着工程越来越大，平台越来越多，这个东西就更麻烦了，为了解决这个问题，于是引入了CMake，但是CMake也需要用户输入啊，CMake需要写CMakelist。

同时期也出现了make本身很多时候都没有在做代码编译的事情，而是在组织安排代码，并且效率很低，所以出现了Ninja，Ninja借鉴了很多make的问题，做了大幅简化，速度是很快了，不过可能功能上就有些情况不能处理了。而Ninja也要写.Ninja，这也是个麻烦事，还好后续Cmake也支持了Ninja，所以那就都只写CMakelist就行了



在编译构建工具发展的过程中还是存在一些小问题，比如Makefile、.Ninja、CMakelist他们无论怎么简化，他们都有各自的语法，你都要学一下才能写，而且这种小众语法，很多时候不常用，经常要查，对应的他们的官方文档又写的不是很好，很多奇巧淫技都是从别人代码里看来的。

到这里就有人想到了为什么我不能用我自己熟悉语言来写规则呢，那不是更简单？

于是乎就有了xmake，xmake主要用lua来写脚本，lua相比其他语言来说更加轻量，依赖非常少。xmake还有一些其他方面的功能

```
Xmake ≈ Make/Ninja + CMake/Meson + Vcpkg/Conan + distcc + ccache/sccache
```

> https://gitee.com/tboox/xmake



同样的国外也有人觉得脚本语法难用，所以他用python也做了一套，叫Meson，现在基本上人手一个python，你要是不会python，多少都有点奇怪。

> https://mesonbuild.com/
>
> https://github.com/mesonbuild/meson

虽然用python简单，但是python本身稍微有点重，还是不够好



作为工具链的头头GNU也有一套构建工具GNU Autotools，但是对于其他平台的支持就不太行了



## Summary





## Quote

> https://www.cnblogs.com/zxdplay/p/17768181.html
>
> https://www.cnblogs.com/zzb-Dream-90Time/p/7111435.html
>
> https://cloud.tencent.com/developer/article/1825589


---
layout:     post
title:      "构建工具之xmake"
subtitle:   "Kconfig、menuconfig、makefile、macro"
date:       2024-12-02
update:     2024-12-02
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

一般工作流程是先拉下来所有需要依赖的源码或者包，然后进行配置，核心配置工具就是menuconfig，他就类似于VS中的整个Solution的配置，规定了各个工程要以什么样的方式进行编译，还有需要使用什么样的编译器来编译，同时对应的编译工具链都会直接拉到工程内，之后进入到每个工程以后还有各自详细的makefile去管理这个模块怎么编译，最终编译完成输出到output中。

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



SCons也做了类似的事情，使用python来写

> https://scons.org/



作为工具链的头头GNU也有一套构建工具GNU Autotools，但是对于其他平台的支持就不太行了



## xmake

试用一下xmake，主要是看看他的menu图形化是怎么做的，文档里也没有详细说明



### 部署

安装xmake，windows直接下载exe版本即可

> https://github.com/xmake-io/xmake/releases



## 测试

#### hello

拉下来xmake的代码，测试工程都在test/project中

> https://github.com/xmake-io/xmake



创建一个hello工程

```
xmake create -l c -P ./hello
```



如果正常的话，可以直接xmake，但是实际可能不行

```
xmake
```

xmake会自动检测设备环境，自动关联查找各种库，由于默认的xmake.lua中没有设定环境，所以导致实际上自动找的工具链大概率是错的，编译过不去



首先指定环境

```shell
xmake f -p windows -a x64
```

他会自动找到对应安装的环境

```shell
checking for Microsoft Visual Studio (x64) version ... 2022
checking for Microsoft C/C++ Compiler (x64) version ... 19.35.32019
```

再次xmake，这次编译成功了

```shell
[ 50%]: compiling.release src\main.c
[ 75%]: linking.release hello.exe
[100%]: build ok, spent 1.032s
```

运行程序，直接输出hello world

```
xmake run
```



再测试一下嵌入式环境，进入到`xmake\tests\projects\embed\mdk\hello\`路径中

嵌入式环境比较复杂，xmake都算作交叉编译，参考这部分文档

- -p是指定平台，比如交叉编译、windows、linux、mac，这种大平台级别
- -a 基本可以理解为系统架构，比如x86、x64、cortex-m3、cortex-m4这样的
- --toolchain 自动搜索对应的工具链，并且使用 `xmake show -l toolchains`可以显示当前支持的工具链
- --sdk指定具体的工具链的库地址，根目录，大部分会自动识别库内结构，找到对应工具

cross这里默认就是指交叉编译的库

```
xmake f -p cross -a cortex-m3 --toolchain=armcc -c
xmake
```

armcc的方式可以正常编译过



```
xmake f -p cross -a cortex-m3 --toolchain=armclang -c
xmake
```

armclang，也就是keil的v6编译，过不去



cross这里默认就是指交叉编译的库，具体sdk路径最好带上引号

```
xmake f -p cross --toolchain=gnu-rm --sdk="D:\GNU Arm Embedded Toolchain\10 2021.10"
xmake
```



如果遇到这种问题，实际就是你的编译工具链不完整，缺少内容

```
note: the following packages are unsupported on msys/x86_64:
  -> gnu-rm 2021.10 [host]
```



#### menu

看似可以一键直接使用

```
xmake f --menu
```

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202412021540966.png)

但实际上不行，这里需要tui支持，windows这边的git bash客户端不支持这个界面，但是如果直接用cmd反而支持tui

xmake.lua中添加下面的几个选型，即可在菜单中增加一些选型，后续可以和实际编译关联在一起

```
-- 'boolean' option
option("test1")
    set_default(true)
    set_showmenu(true)
    set_category("root menu/test1")

-- 'choice' option with values: "a", "b", "c"
option("test2")
    set_default("a")
    set_values("a", "b", "c")
    set_showmenu(true)
    set_category("root menu/test2")

-- 'string' option
option("test3")
    set_default("xx")
    set_showmenu(true)
    set_category("root menu/test3/test3")

-- 'number' option
option("test4")
    set_default(6)
    set_showmenu(true)
    set_category("root menu/test4")
```



![image-20241202160200487](https://img.elmagnifico.tech/static/upload/elmagnifico/202412021602539.png)

实际这个menu中除了用户自定义的这一部分，剩下的选型基本就是xmake的参数配置，可以在menu中一层层配置好，就是操作起来有点麻烦。



## Summary

回归初心，实际如果用类似这样的menu做构建，真的比直接用现成的IDE好了嘛，只能说这样的menu是一种通用的交互手段，可以跨平台服务各种代码，但是对于本身不太需要跨平台的项目来说，menu就是一种倒退。

类似的linux，menu能用起来是建立在完善的配置项上，各种模块之间耦合或者冲突都需要完善到配置文件中，否则别人用起来也会出一堆问题。



## Quote

> https://www.cnblogs.com/zxdplay/p/17768181.html
>
> https://www.cnblogs.com/zzb-Dream-90Time/p/7111435.html
>
> https://cloud.tencent.com/developer/article/1825589
>
> https://tboox.org/cn/2018/02/03/update-v2.1.9/


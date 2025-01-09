---
layout:     post
title:      "Zephyr build 架构"
subtitle:   "Kconfig、CMake、nRF SDK"
date:       2024-12-20
update:     2024-12-20
author:     "elmagnifico"
header-img: "img/bg7.jpg"
catalog:    true
tobecontinued: false
tags:
    - build
---

## Foreword

Zephyr 工程的整个构建体系是怎样的，这里做一个具体的分析和学习

最近小米的Vele 也开源了，不过由于缺少文档，而且架构非常庞大，光是仓库就传了两三百个，想看明白不太容易，但是基础的CMake、Kconfig等等全都有。



## CMake

1. **创建构建目录**：保持源代码目录整洁。
2. **使用 CMake 生成构建文件**：配置项目并生成适合平台的构建文件。
3. **编译和构建**：使用生成的构建文件执行编译和构建。
4. **清理构建文件**：删除中间文件和目标文件。
5. **重新配置和构建**：处理项目设置的更改。

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202412191052534.png)

CMake 推荐使用 **"Out-of-source"** 构建方式，即将构建文件放在源代码目录之外的独立目录中



### CMake例程

![image-20241219113430856](https://img.elmagnifico.tech/static/upload/elmagnifico/202412191134890.png)

一个比较简单的CMake例程

> https://github.com/elmagnificogi/MyTools/tree/master/CMake/MyProject1

```c++
#include <iostream>

int main() {
    std::cout << "Hello, CMake!" << std::endl;
    return 0;
}
```

cpp文件

```c++
#ifndef MAIN_H
#define MAIN_H

// Declarations of module functions

#endif // MAIN_H
```

头文件 

```cmake
# 指定最低 CMake 版本
cmake_minimum_required(VERSION 3.10)   
# 定义项目名称和版本
project(MyProject1 VERSION 1.0)          

# 设置 C++ 标准
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(${PROJECT_SOURCE_DIR}/include)

# 创建可执行文件目标
add_executable(MyExecutable ${PROJECT_SOURCE_DIR}/src/main.cpp)
```

比较简单的CMakeLists.txt定义

新建build目录，将源码和编译路径分开

生成一个MinGW的Makefiles文件

```
D:\CMake\bin\cmake.exe .. -G "MinGW Makefiles"
```

- 不指定的话，默认是VS的工程文件

编译

```
mingw32-make.exe
```

测试

```
I:\cmake\CMakeTutorialCN\MyProject\build\src>MyExecutable.exe
Hello, CMake!
```



稍微复杂一些，但是包含了库，移除了测试库，windows下拉不到这个测试库

> https://github.com/elmagnificogi/MyTools/tree/master/CMake/MyProject0



CMake确实稍微步骤多了一些，组织编排就要跑一会，还是这么简单的工程



## 基于nRF untiled例程分析

```cmake
cmake_minimum_required(VERSION 3.20.0)
# 寻找依赖包Zephyr
# $ENV{Zephyr_BASE} 设置了 Zephyr 的根目录路径
find_package(Zephyr REQUIRED HINTS $ENV{Zephyr_BASE})

project(untitled)

# target_sources 指令用于为 CMake 目标添加源文件。这种方法的优点在于它可以将源文件添加到目标中，并且可以在 CMake 的生成阶段自动更新。
# target: 要添加源文件的目标，通常是通过 add_executable 或 add_library 定义的目标。
# INTERFACE: 指定这些源文件对其他目标是可见的，但不会包含在目标本身的构建中。这通常用于接口库。
# PUBLIC: 指定这些源文件对其他链接到该目标的目标是可见的，同时也包含在目标本身的构建中。
# PRIVATE: 指定这些源文件仅对目标本身可见，不会传播到链接到该目标的其他目标。
target_sources(app PRIVATE src/main.c)
```

编译时执行的 `build.py` 脚本中引用了 `Zephyr\scripts\west_commands\Zephyr_ext_common.py`，在这个脚本中设置了 **Zephyr_BASE** 的宏。

- 宏的值被设置为了之前sdk安装路径，比如I:\ncs\v2.7.0\Zephyr

untiled内容比较少，还是需要去看Zephyr内的CMake

![image-20241219155330509](https://img.elmagnifico.tech/static/upload/elmagnifico/202412191553570.png)

先看一眼nRF的SDK包构成

- west 是Zephyr的生成工具
- modules里面是hal、lab库、文件系统、加密等等模块
- test测试库
- Zephyr的主要内容

Zephyr的包主要存储在这里，通过上面的CMake搜索到这里

![image-20241219160421036](https://img.elmagnifico.tech/static/upload/elmagnifico/202412191604069.png)

Zephyr的CMake主要调用逻辑

```
Zephyr/share/Zephyr-package/cmake/ZephyrConfigVersion.cmake
 Zephyr/share/Zephyr-package/cmake/Zephyr_package_search.cmake
 Zephyr/cmake/modules/version.cmake
    Zephyr/share/Zephyr-package/cmake/ZephyrConfig.cmake
```

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/20241219163220232.jpeg)







Zephyr主要是两个阶段，配置阶段、编译阶段

![Zephyr's build configuration phase](https://img.elmagnifico.tech/static/upload/elmagnifico/build-config-phase.svg)

根据这个图来说，最终Kconfig生成了autoconf.h，同时持久化了一个.config配置方便后续使用

Zephyr同时也生成了一个设备树，这个概念基本和Linux一样，都是通过设备树来注册驱动进去的，类似的设备树也有同样的一个.h文件。

最终这部分生成文件和产生的Makefile一起进行最后的编译，生成对应固件



## 自定义Kconfig

在untiled下面新建Kconfig文件，输入以下内容

```
menu "Test Params setting"
config TEST_ENABLE
    bool "Enable test work"
    default n
    help
        Will print debug information if enable.

config TEST_SHOW_STRING
    string "The show string info"
    default "Test 123"

config TEST_SHOW_INT
    int "The show int info"
	range 0 255
    default 123


config TEST_TOP_ENABLE
	bool "Test Top Func"
    default n
    help
        Function Test Top

config TEST_SUB_0_ENABLE
	bool "Test Sub 0 Func"
    default n
    help
        Function Test Sub 0

config TEST_SUB_1_ENABLE
	bool "Test Sub 1 Func"
    default n
    depends on TEST_TOP_ENABLE
    help
        Function Test Sub 1

config TEST_SHOW_SUB_INT
    int
    default 456 if TEST_SUB_0_ENABLE && TEST_SUB_1_ENABLE
    default 123


endmenu

# 注意一定要引用这个，不然加不进去，并且CMake不了
source "Kconfig.zephyr"
```

重新build一下，然后打开Kconfig GUI就能看到对应显示了

![image-20250102155527389](https://img.elmagnifico.tech/static/upload/elmagnifico/20250102155527462.png)

这里比较麻烦的地方就是这个工程每次重新打开，这个GUI就打不开了，必须要点开nRF Connect才能重新打开，非常难受



## Summary

工程越大越复杂，还是希望能稍微控制一下复杂度



参考这个教程，但是这个教程写的一坨屎，为什么还会有人点星

> https://github.com/shendeguize/CMakeTutorialCN

## Quote

> https://blog.csdn.net/qq_37805392/article/details/141337664
>
> https://zhuanlan.zhihu.com/p/705640074
>
> https://docs.Zephyrproject.org/latest/build/index.html
>
> https://blog.csdn.net/My_CSDN_IT/article/details/118180074
>
> https://lgl88911.github.io/2020/03/08/Zephyr%E6%9E%84%E5%BB%BA%E8%BF%87%E7%A8%8B%E7%AE%80%E8%BF%B0/
>
> https://www.cnblogs.com/jayant97/articles/17794813.html

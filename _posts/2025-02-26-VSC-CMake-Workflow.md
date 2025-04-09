---
layout:     post
title:      "VSCode CMake工作流"
subtitle:   "CPack,CTest,launch,workflow"
date:       2025-02-27
update:     2025-02-27
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.jpg"
catalog:    true
tobecontinued: false
tags:
    - Kconfig
    - CMake
    - VS Code
---

## Foreword

之前看到CMake有这么多选项，感觉不简单，还是看下别人在这里设计了多少东西



## CMake

整体来说CMake遵循这样一套结构

```
操作-操作预设（如果有的话）-操作目标（如果有的话）
```

比如

```
Configure-ConfigurePreset
Build-BuildPreset-Build_Target
Launch-Launch_Target
Test-TestPreset
Pack-PackPreset
Workflow-WorkflowPreset
```

### Configure

这个不用多说，最基础的配置了

#### Kit

Kit是作为configure中的一个环境，也就是编译工具链的配置

![image-20250226173151815](https://img.elmagnifico.tech/static/upload/elmagnifico/20250226173151876.png)

同时默认的CMake把工具链和生成配置类型，这个区分开了，实际我之前做的demo也区分开了二者

而这个Kit是不需要你写的，直接通过扫描环境就能识别，感觉这样更好，可以去掉自己写的工具链

- 不过这样的话，脱离了这个环境就失去编译工具链的选择了

#### Variant

简单说Variant就是允许你对Kit和优化输出等级进行打包和重命名，这样的话不同编译工具链+优化输出等级就形成了一个新组合，这个组合就叫Variant，这样用起来其实就更灵活了

![_images/custom_variant_selector.png](https://img.elmagnifico.tech/static/upload/elmagnifico/20250226181547102.png)

这只有2种元素进行组合，如果元素多了，这个组合就非常恐怖了，但是它可以自动帮你排列组合好

对于那种超级兼容性的大工程，做自动化流程的时候就比较方便



### Build

Build就不说了，正常配置，Build内可以选择Target，这样的话其实很多东西都能写到配置文件里去，通过Target选择不同的编译结果

### Launch

Launch包含调试和运行，也可以选择调试的目标

Debug都是调用外部程序完成的，本身没这个能力，launch可以做一些调试前或者后的操作



### CTest

| 特性 / 框架      | CTest                              | JUnit              | PyTest                     | Google Test                     |
| ---------------- | ---------------------------------- | ------------------ | -------------------------- | ------------------------------- |
| **语言支持**     | C/C++                              | Java               | Python                     | C++                             |
| **集成度**       | 与CMake紧密集成，适合CMake项目     | 与Java开发环境集成 | Python生态中集成度高       | 良好的C++环境集成               |
| **测试类型支持** | 支持单元测试、集成测试、性能测试   | 主要支持单元测试   | 支持多种类型的测试         | 主要支持单元测试                |
| **可扩展性**     | 通过CMake脚本可扩展                | 可以通过插件扩展   | 强大的插件系统             | 可以通过宏和参数化扩展          |
| **测试发现**     | 自动化测试发现                     | 一般               | 强大的自动化测试发现       | 自动化测试发现                  |
| **结果报告**     | 详细的测试结果报告                 | 结果报告清晰       | 结果报告详细且支持插件扩展 | 结果报告详细                    |
| **社区和文档**   | 较小的社区，文档适中               | 大社区，丰富的文档 | 大社区，丰富的文档         | 大社区，丰富的文档              |
| **适用场景**     | 适用于需要CMake构建系统的C/C++项目 | 适用于Java项目     | 适用于Python项目           | 适用于需要详细测试报告的C++项目 |

```cmake
add_executable(TestInstantiator TestInstantiator.cxx)
target_link_libraries(TestInstantiator vtkCommon)
add_test(NAME TestInstantiator
         COMMAND TestInstantiator)
```

简单说就是可以直接执行测试指令，类似VS里面的单元测试，只不过这个测试是调用外部的程序完成的

实际上直接做代码覆盖测试也可以，需要引入gtest等额外的模块，同样的对于测试目标，也可以debug

![image-20250226210212091](https://img.elmagnifico.tech/static/upload/elmagnifico/20250226210212162.png)

简单的编译完成以后，运行一下自己，就看到了测试结果

CTest只是一个调用方，不是具体的测试框架，测试框架可能得需要gtest之类的东西来做



### CPack

CPack有两个作用，第一个自动添加缺少的包

```cmake
cmake_policy(SET CMP0135 NEW)
find_package(GTest)
if(NOT GTest_FOUND)
message("GTest not found, download it...")
include(FetchContent)
FetchContent_Declare(googletest URL https://github.com/google/googletest/archive/refs/heads/main.zip)
FetchContent_MakeAvailable(googletest)
endif()
```

比如这里自动下载gtest的包



第二个就是自动打包，当编译测试都做完了，那就还剩下打包发布了，CPack就是用来将生成结果进行打包的，支持很多类型的打包

```cmake
cmake_minimum_required(VERSION 3.0) 
project(MyProject) 
# 添加源代码
add_executable(MyProject main.cpp)
# 添加依赖库 
find_package(Boost REQUIRED)
target_link_libraries(MyProject PRIVATE Boost::boost)
# 安装文件
install(TARGETS MyProject DESTINATION bin)
# 打包 
set(CPACK_PACKAGE_NAME "MyProject")
set(CPACK_PACKAGE_VERSION "1.0.0") 
set(CPACK_GENERATOR "ZIP") 
include(CPack) 
```

运行之后就会自动打包为zip

### Workflow

简单说workflow就可以把前面所有的东西组合在一起，他们可以一一对应起来变成一个个工作流

```
配置-构建-测试-打包
```

下面就是工作流的预设，这样的工作流可以简单的配置很多个

```
    "workflowPresets": [
        {
            "name": "wf",
            "description": "",
            "displayName": "工作流",
            "steps": [
                {
                    "type": "configure",
                    "name": "gcc13"
                },
                {
                    "type": "build",
                    "name": "all"
                },
                {
                    "type": "test",
                    "name": "test_Project"
                },
                {
                    "type": "package",
                    "name": "all"
                }
            ]
        }
    ]
```

点一下就可以把上面的步骤来一遍，直接实现CICD流程

![image-20250227000640588](https://img.elmagnifico.tech/static/upload/elmagnifico/20250227000640621.png)

## Summary

VSCode中CMake Tools相关的教程还是太少了，很多东西都对不上，而VSCode把各个之间的一些参数或者设置隐藏了，导致实际如果出问题想要调试找到具体位置有些困难，不如原生的CMake，是啥就是啥都能看到



## Quote

> https://blog.csdn.net/witton/article/details/130170686
>
> https://blog.csdn.net/witton/article/details/130216777
>
> https://blog.csdn.net/witton/article/details/145307607?spm=1001.2014.3001.5502
>
> https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/cmake-presets.md#test
>
> https://cmake.org/cmake/help/latest/manual/ctest.1.html#ctest-1
>
> https://blog.csdn.net/m0_49302377/article/details/130264041


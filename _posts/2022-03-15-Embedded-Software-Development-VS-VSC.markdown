---
layout:     post
title:      "在VS或者VS Code中做嵌入式开发"
subtitle:   "STM32，IDE，VS官方支持"
date:       2022-03-15
update:     2022-03-15
author:     "elmagnifico"
header-img: "img/cap-head-bg.jpg"
catalog:    true
tags:
    - Embedded
---

## Foreword

>https://devblogs.microsoft.com/cppblog/visual-studio-embedded-development/
>
>https://devblogs.microsoft.com/cppblog/vscode-embedded-development/

本篇比较像以上两个文字的翻译，外加一些针对国内的对应修改，和我实测之后的体验。

先说结论，当前这个东西应该说只是个demo演示，实际并不可用，虽然能编译和debug，但如果要自己配置，有些东西没给出来或者说还不能充分设置。



## Visual Studio 2022

### 安装依赖

![image-20220315175535479](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151755541.png)

启动Visual Studio Installer，然后勾选上`使用C++的Linux开发`



简单说不同项目使用不同的编译器或者工具链，在嵌入式开发中比较常见，所以为了支持这一特性需要额外对vcpkg进行一些操作，由于当前是测试版本，等到正式release以后都会集成到一起，不再要我们额外操作了。



先下载一个demo工程，比较大，东西很多。这里建议使用 PowerShell，后续的操作符都是基于windows的

```
git clone --recursive https://github.com/azure-rtos/getting-started.git
cd .\getting-started\MXChip\AZ3166\
```

安装vcpkg

```
iex (iwr -useb https://aka.ms/vcpkg-init.ps1)
```

在当前目录下，已经有写好的 vcpkg_configuration.json 文件，这里面记录了编译和调试需要用的工具。

然后通过下面的命令，启动vcpkg，如果所需要的工具缺失，会自动下载，第一次安装用时比较长，需要等好一会

```
vcpkg activate
```

有可能国内PowerShell 实在是太慢了，建议启动代理（代理地址自己修改一下），启动以后重新下载快多了

```
$env:HTTP_PROXY="http://127.0.0.1:1081"
$env:HTTPS_PROXY="https://127.0.0.1:1081"
```



### 使用VS开发

由于当前还没集成到一起，所以通过命令行的方式启动VS，由于可能每个人都装了好几个VS，所以最好指定一下具体是从哪里启动

```
Start-Process "D:\Microsoft Visual Studio\2022\Community\Common7\IDE\devenv" .
```

启动以后就能看到，整个工程正在对应CMake，配置相关内容，然后就可以随便打开其他内容进行编辑修改调试了。

![image-20220315183808349](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151838437.png)

整个代码基本都可以按照VS的玩法来玩了

![image-20220315184024781](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151840909.png)

编译生成

![image-20220315185407253](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151854303.png)

### debug

将调试启动目标修改为Launch就可以刷写并调试了

![image-20220315185125719](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151851753.png)



## 额外信息

其实从工程中的一些其他文件里可以看到，官方实际背后用的是什么

下面的是`flash.bat`，本质上是调用了openocd

```bash
:: Copyright (c) Microsoft Corporation.
:: Licensed under the MIT License.

setlocal
cd /d %~dp0\..

openocd -f board/stm32f4discovery.cfg -c "program build/app/mxchip_azure_iot.elf verify reset exit"
```



`vcpkg-configuration.json`以及`CMakePresets.json`中可以看到，实际上也是通过arm-gcc编译的

```json
{
  "registries": [
    {
      "name": "microsoft",
      "location": "https://aka.ms/vcpkg-ce-default",
      "kind": "artifact"
    }
  ],
  "requires": {
    "microsoft:compilers/arm/gcc": "* 2020.10.0",
    "microsoft:tools/compuphase/termite": "* 3.4.0",
    "microsoft:tools/microsoft/openocd": "0.11.0-ms1",
    "microsoft:tools/kitware/cmake": "* 3.20.1",
    "microsoft:tools/ninja-build/ninja": "* 1.10.2"
  }
}
```

```json
{
    "version": 2,
    "configurePresets": [
        {
            "name": "arm-gcc-cortex-m4",
            "generator": "Ninja",
            "binaryDir": "${sourceDir}/build",
            "cacheVariables": {
                "CMAKE_BUILD_TYPE": "Debug",
                "CMAKE_INSTALL_PREFIX": "${sourceDir}/install",
                "CMAKE_TOOLCHAIN_FILE": {
                    "type": "FILEPATH",
                    "value": "${sourceDir}/../../cmake/arm-gcc-cortex-m4.cmake"
                }
            },
            "architecture": {
                "value": "unspecified",
                "strategy": "external"
            },
            "vendor": {
                "microsoft.com/VisualStudioSettings/CMake/1.0": {
                    "intelliSenseMode": "linux-gcc-arm"
                }
            }
        }
    ],
    "buildPresets": [
        {
            "name": "arm-gcc-cortex-m4",
            "configurePreset": "arm-gcc-cortex-m4"
        }
    ]
}
```



工程debug的Launch以及工程的debug配置选项等信息，都是无法查看也无法编辑，甚至加一个新的都不可以。

唯一能修改的工程预设就是跳转给你`CMakePresets.json`文件

```json
{
    "version": 2,
    "configurePresets": [
        {
            "name": "arm-gcc-cortex-m4",
            "generator": "Ninja",
            "binaryDir": "${sourceDir}/build",
            "cacheVariables": {
                "CMAKE_BUILD_TYPE": "Debug",
                "CMAKE_INSTALL_PREFIX": "${sourceDir}/install",
                "CMAKE_TOOLCHAIN_FILE": {
                    "type": "FILEPATH",
                    "value": "${sourceDir}/../../cmake/arm-gcc-cortex-m4.cmake"
                }
            },
            "architecture": {
                "value": "unspecified",
                "strategy": "external"
            },
            "vendor": {
                "microsoft.com/VisualStudioSettings/CMake/1.0": {
                    "intelliSenseMode": "linux-gcc-arm"
                }
            }
        }
    ],
    "buildPresets": [
        {
            "name": "arm-gcc-cortex-m4",
            "configurePreset": "arm-gcc-cortex-m4"
        }
    ]
}
```

Launch具体启动刷写和debug是调用了什么，现在还是隐藏的。这个流程可能日后可以给我们修改吧。

结合startup中的文件，文件的格式和ld这些，其实和Eclipse那边用的gcc-arm-none-eabi一模一样，目前来说用这个来开发还是太早了点，很多东西都缺失。

![image-20220315190021932](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151900960.png)



## Visual Studio Code



### 安装

启动Visual Studio Code，然后添加Embedded Tools插件

![Embedded Tools extension page screenshot](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202203151830144.png)

由于同样是测试版，所以也需要额外安装vcpkg和对应的工具包，下面的流程基本和VS一样



先下载一个demo工程，比较大，东西很多。这里建议使用 PowerShell，后续的操作符都是基于windows的

```
git clone --recursive https://github.com/azure-rtos/getting-started.git
cd .\getting-started\MXChip\AZ3166\
```

安装vcpkg

```
iex (iwr -useb https://aka.ms/vcpkg-init.ps1)
```

在当前目录下，已经有写好的 vcpkg_configuration.json 文件，这里面记录了编译和调试需要用的工具。

然后通过下面的命令，启动vcpkg，如果所需要的工具缺失，会自动下载，第一次安装用时比较长，需要等好一会

```
vcpkg activate
```

有可能国内PowerShell 实在是太慢了，建议启动代理（代理地址自己修改一下），启动以后重新下载快多了

```
$env:HTTP_PROXY="http://127.0.0.1:1081"
$env:HTTPS_PROXY="https://127.0.0.1:1081"
```



### 使用VS Code开发





## Summary

简单说，能用倒是能用，还得等VS官方再完善完善。



## Quote

> https://devblogs.microsoft.com/cppblog/vscode-embedded-development/
>
> https://devblogs.microsoft.com/cppblog/visual-studio-embedded-development/




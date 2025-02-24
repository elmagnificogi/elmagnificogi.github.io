---
layout:     post
title:      "Kconfig与CMake初步模块化工程3"
subtitle:   "APM32,ST,CMakeLists,arm-none-eabi"
date:       2025-03-24
update:     2025-03-24
author:     "elmagnifico"
header-img: "img/drone-head-bg.jpg"
catalog:    true
tobecontinued: false
tags:
    - Kconfig
    - CMake
---

## Foreword

继续上篇，解决一些未完成的问题



## VSCode



适配VSCode

![image-20250224184343397](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224184343455.png)

VSCode只需要一个CMake Tools，不需要安装其他插件

![image-20250224191713665](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224191713697.png)

Kconfig格式化和代码高亮，还是用nRF的好一些，另外那个Kconfig会识别出错



#### 缺少 Select a Kit

vscode cmake 缺少选择`Select a Kit`，主要原因是目录已经有了`CMakePresets.json`，有预设的情况下不会给你选kit，这个问题找了半天，发现官方文档就写了

![image-20250224174751611](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224174758705.png)

但是你搜索的命令又有，只能说官方弄的有点乱，而且本身使用预设和可以选kit我觉得也不矛盾

```
CMake:Scan for compiles
```

去掉预设文件以后，这个kit果然就有了，就可以正常选择了

![image-20250224174840500](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224174840528.png)

实际上这一步根本不需要，建议不要浪费实际调整这个，预设文件早就把这些设置好了，唯一需要处理的就是搜索本地的编译器，否则VSCode不知道编译的gcc在哪里

```
CMake:Scan for compiles
```



#### 修改status bar

默认的 status bar 实在是冗余太多了，从config，build，pack，ctest，cpack，workflow，很多用不上的我就给他隐藏了，而CMake Tools也支持自定义

```json
{
    "cmake.options.statusBarVisibility": "visible",
    "cmake.options.advanced": { 

        "folder": { 
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden",  
            "statusBarLength": 20,
            "projectStatusVisibility": "hidden", 
        }, 
        "configure": { 
            "projectStatusVisibility": "visible", 
        }, 
        "configurePreset": { 
            "statusBarVisibility": "visible",
            "inheritDefault": "visible", 
            "statusBarLength": 20
        }, 
        "kit": { 
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
            "statusBarLength": 20 
        }, 
        "variant": { 
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
        }, 
        "build": { 
            "statusBarVisibility": "visible", 
            "inheritDefault": "hidden", 
            "projectStatusVisibility": "visible", 
        }, 
        "buildPreset": { 
            "statusBarVisibility": "hidden",
            "inheritDefault": "hidden", 
            "statusBarLength": 20 
        }, 
        "buildTarget": { 
            "statusBarVisibility": "hidden",
            "inheritDefault": "hidden", 
            "statusBarLength": 20 
        }, 
        "ctest": { 
            "statusBarVisibility": "hidden",
            "inheritDefault": "hidden", 
            "statusBarLength": 20, 
            "color": true,
            "projectStatusVisibility": "hidden", 
        }, 
        "cpack": { 
            "statusBarVisibility": "hidden",
            "inheritDefault": "hidden", 
            "statusBarLength": 20, 
            "color": true,
            "projectStatusVisibility": "hidden", 
        }, 
        "testPreset": { 
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
            "statusBarLength": 20
        },
        "launchTarget": { 
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
            "statusBarLength": 20 
        }, 
        "debug": { 
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
            "projectStatusVisibility": "hidden", 
        },
        "launch": {
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
            "projectStatusVisibility": "hidden", 
        },
        "workflow": {
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
            "projectStatusVisibility": "hidden", 
        },
        "workflowPreset": {
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
            "projectStatusVisibility": "hidden", 
        },
        "packagePreset": {
            "statusBarVisibility": "hidden", 
            "inheritDefault": "hidden", 
            "projectStatusVisibility": "hidden", 
        }
}
}

```

将上面代码加入到setting.json就可以隐藏大部分没用的细节了



#### 宏未识别

常用方法修改c_cpp_properties.json

![image-20250224193655583](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224193655632.png)

在其中手动加入对应的宏即可

![image-20250224195104640](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224195104674.png)

如果我们有多个配置，那就可以有多个配置不同的宏，然后通过右下角去切换C/C++的配置项，从而切换整体的宏定义

![image-20250224201248076](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224201248134.png)

- 这里如果可以把CMake的defines输出给到c++那样就比较完美了



对于一般的宏（区分feature、驱动等等，用来选择文件的宏），这样还是有点傻了，其实我们生成了"autoconf.h"，只需要把他引入项目就可以自动识别宏了

可能有些宏是用户自定义的，类似这样的

```cmake
    # macro defines
    set(USER_MACRO_DEFINES
        "HSE_VALUE=8000000"
        "USE_HAL_DRIVER"
        "USE_FULL_LL_DRIVER"
        "USE_USB_OTG_FS"
        "STM32F767xx"
    )
```

这种方式稍微有点傻了，其实只要把他们全部加入到Kconfig里，利用Kconfig去生成这个宏即可，虽然Kconfig的宏是包含了`CONFIG_`这个头的，但是我们可以在CMake里通过一些手段去掉`CONFIG_`

还有一种办法是不去掉CONFIG，但是通过引入一个万能的头文件，里面预埋一个宏和其对应即可

```
#ifdef CONFIG_USE_HAL_DRIVER
	#define USE_HAL_DRIVER
#endif

#ifdef HSE_VALUE8000000
	#define HSE_VALUE 8000000
#endif
```



## Debug

有时候需要调试一下，为什么某些文件被加入了，可以通过下面的代码输出当前加入的源文件，进而确定问题

```cmake
# 输出当前目标的所有源文件
get_target_property(TARGET_SOURCES ${CMAKE_PROJECT_NAME} SOURCES)
message(STATUS "Current target sources:")
foreach(source ${TARGET_SOURCES})
    message(STATUS "  ${source}")
endforeach()
```





## Summary



## Quote

> https://blog.csdn.net/weixin_39306574/article/details/103763144
>
> https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html#id1
>
> https://github.com/microsoft/vscode-cmake-tools/blob/fad04c8b3fef0ba80b61df1856bc747770042dc9/docs/cmake-settings.md


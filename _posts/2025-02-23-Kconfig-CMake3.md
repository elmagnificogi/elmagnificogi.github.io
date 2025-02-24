---
layout:     post
title:      "Kconfig与CMake初步模块化工程3"
subtitle:   "APM32,ST,CMakeLists,arm-none-eabi"
date:       2025-03-25
update:     2025-03-25
author:     "elmagnifico"
header-img: "img/drone-head-bg.jpg"
catalog:    true
tobecontinued: false
tags:
    - Kconfig
    - CMake
---

## Foreword

本篇解决一下CMake和VScode怎么整合到一起



## VSCode

适配VSCode

![image-20250224184343397](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224184343455.png)

VSCode只需要一个CMake Tools，不需要安装其他CMake插件

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



### 宏未识别

#### 修改配置文件

常用方法修改c_cpp_properties.json

![image-20250224193655583](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224193655632.png)

在其中手动加入对应的宏即可

![image-20250224195104640](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224195104674.png)

如果我们有多个配置，那就可以有多个配置不同的宏，然后通过右下角去切换C/C++的配置项，从而切换整体的宏定义

![image-20250224201248076](https://img.elmagnifico.tech/static/upload/elmagnifico/20250224201248134.png)

- 这里如果可以把CMake的defines输出给到c++那样就比较完美了

切换C++的配置和编译的configure不是一个配置，而且他们也不能联动，这就导致你改一下必须得手动切换配置才行



#### Kconfig的宏

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

```c++
#ifdef CONFIG_USE_HAL_DRIVER
	#define USE_HAL_DRIVER
#endif

#ifdef HSE_VALUE8000000
	#define HSE_VALUE 8000000
#endif
```



#### EXPORT_COMPILE_COMMANDS

经过一番研究，发现其实CMAKE有一个生成`compile_commands.json`的操作，这个会生成每个文件的编译命令，如果C++补全或者是高亮读取了这个文件，那么他就知道具体这个文件编译的时候使用了什么宏，那么对应宏是亮起还是灰掉，他就能智能识别

下面的命令就是在cmake编译的时候传递一个参数，让他自己生成这个json

```json
"cmake.configureOnOpen": true,
"cmake.configureArgs": [
    "-DCMAKE_EXPORT_COMPILE_COMMANDS=ON"
],
"C_Cpp.default.configurationProvider": "ms-vscode.cmake-tools"
```

实际上这个命令在我们CMakeLists的前几句就写了

![image-20250225002207493](https://img.elmagnifico.tech/static/upload/elmagnifico/20250225002207548.png)

~~但是目前看效果不明显，似乎不会生效，感觉他需要额外再配置一下这个路径才能正确识别~~（前面的配置文件和自动识别会冲突）

![image-20250225002812759](https://img.elmagnifico.tech/static/upload/elmagnifico/20250225002812793.png)

经过测试发现他自动识别了在CMakeLists中增加宏，但是Kconfig的.config里的宏并没有识别，还是需要将头文件引入，才能正常识别

如果把同样的宏放到被排除编译的文件中，会发现所有宏都处于不被激活的状态

![image-20250225003002026](https://img.elmagnifico.tech/static/upload/elmagnifico/20250225003002062.png)

反查`compile_commands.json`也可以知道，这个文件直接就不存在，自然不会有任何反应



继续优化，可以通过C_CPP配置手动将某些文件夹或者文件给排除出去（这里理论上靠compile_commands.json应该也能实现啊）

```json
{
    "C_Cpp.default.configurationProvider": "ms-vscode.cmake-tools",
    "C_Cpp.exclusionPolicy": "checkFilesAndFolders",
    "C_Cpp.files.exclude": {
        "**/node_modules": true,
        "**/build": true,
        "**/*.min.js": true
    },
    "cmake.configureOnOpen": true
}
```



#### 文件排除

项目里一些不需要显示的内容可以通过配置进行排除，让整个目录看起来更清爽

```
    "files.exclude": {
        "**/Battery": true,
        "**/*.jlink": true,
        "**/*.emProject": true,
        "**/*.emSession": true,
        "**/*.bin": true,
        "**/*.bat": true,
        "**/Boot": true
    },
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



## 不整合

如果不整合到VSCode中，也有一些办法可以用来简化工作量

```bash
#!/bin/bash

# 提示用户选择预设
echo "请选择一个预设:"
options=("Debug" "Release" "Test")

# 设置自定义提示符
PS3="请输入选项编号: "

select opt in "${options[@]}"
do
    case $opt in
        "Debug"|"Release"|"Test")
            PRESET=$opt
            break
            ;;
        *) echo "无效选项 $REPLY";;
    esac
done

echo "您选择了 $PRESET, 开始构建项目...请先确认config变换"

CONFIG_FILE="./$PRESET.config"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "配置文件 $CONFIG_FILE 不存在，创建一个空白文件..."
    touch "$CONFIG_FILE"
fi

# change project properties
export KCONFIG_CONFIG=./$PRESET.config
python -m guiconfig
# generate .config file
echo "生成config文件..."
python tools/kconfig.py Kconfig $PRESET.config autoconf.h kconfigLog.txt $PRESET.config
# create a build directory and make project
echo "创建预设目录..."
cmake --preset $PRESET
# build project
echo "开始build..."
cmake --build --preset $PRESET
```

相当于是一键build，只需要选好build的配置和确认Kconfig配置就可以自动进行下一步了



## Summary

VSCode作为一个独立编辑器，距离IDE还是有点差距，整体性就是差了那么一点。想要做到完美，那就得自己开发插件，把好几个插件结合到一起，把他们之间的数据传递给弥补上



## Quote

> https://blog.csdn.net/weixin_39306574/article/details/103763144
>
> https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html#id1
>
> https://github.com/microsoft/vscode-cmake-tools/blob/fad04c8b3fef0ba80b61df1856bc747770042dc9/docs/cmake-settings.md


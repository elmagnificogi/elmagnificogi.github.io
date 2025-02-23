---
layout:     post
title:      "Kconfig与CMake初步模块化工程2"
subtitle:   "APM32,ST,CMakeLists,arm-none-eabi"
date:       2025-02-23
update:     2025-02-23
author:     "elmagnifico"
header-img: "img/drone.jpg"
catalog:    true
tobecontinued: false
tags:
    - Kconfig
    - CMake
---

## Foreword

继续上篇，解决一些未完成的问题



## 遗留问题

#### 模块化

Linux内有一些模块化的操作，但是如果直接模仿，会发现无效。

比如类型中的`tristate`是三状态，比如y、m、n，表示启用模块、动态加载 、禁用，三种情况，但是如果直接像下面这么写是无法启用的，你会看到怎么设都是启动和禁止，没有动态加载的选项

```kconfig
menu "New Module Configuration"
    config NewModule
        tristate "NewModule"

    choice
        prompt "Feature selection"
        tristate

        config Feature1
            tristate "Feature 1"
            help
                "This is the first feature"
        config Feature2
            tristate "Feature 2"
            help
                "This is the second feature"
    endchoice
endmenu
```



只有开启modules 才能在三态中增加显示m状态

```kconfig
menu "New Module Configuration"
    config MODULES
        prompt "Enable Modules"
        def_bool y
        option modules

    config NewModule
        tristate "NewModule"

    choice
        prompt "Feature selection"
        tristate "Choose a feature"

        config Feature1
            tristate "Feature 1"
            help
                "This is the first feature"
        config Feature2
            tristate "Feature 2"
            help
                "This is the second feature"
    endchoice
endmenu
```

![image-20250223144501643](https://img.elmagnifico.tech/static/upload/elmagnifico/202502231445732.png)

开启以后就有了M选项，否则只有X和空

不过这种模块化，在MCU这里用不上，建议不要增加复杂度



#### 自动加载Kconfig

现在如果新加了一个module，希望可以不改动架构的Kconfig的情况下，自动完成新文件夹内Kconfig的识别和加入

```kconfig
menu "Module Configuration"
  config Motors
      bool "Motors"

  config Flash
      bool "Flash"
source "module/*/Kconfig"
endmenu
```

通过通配符的方式可以自动索引第一级子目录的kconfig

据说这种方式可以索引所有子目录，但是实际我这里不行

```
source "module/**/Kconfig"
```

至于第二级、第三级就必须要在其上一级这么写了才能索引到，source只能索引从主kconfig出发的路径，就必须要写全所有路径，这就有点不合理

```
source "module/NewModule/*/Kconfig"
source "module/NewModule2/*/Kconfig"
```

第三级就要写更多了

```
source "module/NewModule/SubModule/*/Kconfig"
```



但是kconfiglib有拓展，它支持rsource，顾名思义，他就是相对路径，从当前kconfig路径开始算，上级路径会自动帮你引用

```
menu "Module Configuration"
  config Motors
      bool "Motors"

  config Flash
      bool "Flash"
rsource "*/Kconfig"
endmenu
```

这样就有效解决了，未知新模块需要写所有路径的问题，只需要写好引用下层路径即可



#### 自动加载CMake

上面解决了Kconfig，同时还有一个CMake也得自动引用，二者才能搭配完成目的

一般作为独立模块，有可能其内部是一个xxx.cmake，也有可能是一个CMakeLists，先说两者差别。

如果是CMakeLists，那么这个模块是可以独立编译的，完全不依赖当前工程他就能自己编译完成。

如果是一个xxx.cmake，那这个模块是非独立的，他需要依赖当前工程中的一些东西，需要和工程整体一起编译



先说xxx.cmake，还是利用相对路径取下一级的所有cmake，然后被引用

```cmake
# sources
if(CONFIG_FLASH)
    message(STATUS "Flash module is enabled")
    file(GLOB_RECURSE DRIVER_SOURCES
        # 加入文件夹
        ${CMAKE_CURRENT_LIST_DIR}/Flash/*.*
    )
    target_sources(${CMAKE_PROJECT_NAME} PRIVATE ${DRIVER_SOURCES})

    # include
    target_include_directories(${CMAKE_PROJECT_NAME} PRIVATE 
        ${CMAKE_CURRENT_LIST_DIR}/Flash
    )
endif()

# 引入当前路径下的所有CMake文件
message(STATUS "CMAKE_CURRENT_LIST_DIR: ${CMAKE_CURRENT_LIST_DIR}")
file(GLOB CMAKE_FILES "${CMAKE_CURRENT_LIST_DIR}/*/*.cmake")
foreach(CMAKE_FILE ${CMAKE_FILES})
    include(${CMAKE_FILE})
endforeach()
```

对应的模块内的NewModule.cmake，就可以写成这样，将自己内部的文件加入，如果还需要套娃，那么继续使用上面的方式即可

```cmake
message(STATUS "NewModule Add")
# sources
if(CONFIG_NewModule)
    file(GLOB_RECURSE DRIVER_SOURCES
        # 加入文件夹
        ${CMAKE_CURRENT_LIST_DIR}/*
    )
    target_sources(${CMAKE_PROJECT_NAME} PRIVATE ${DRIVER_SOURCES})

    # include
    target_include_directories(${CMAKE_PROJECT_NAME} PRIVATE 
        ${CMAKE_CURRENT_LIST_DIR}
    )
endif()
```

demo对应工程里的NewModule和SubModule



如果是CMakeLists，那么要用下面的方式加入CMakeLists

```cmake
# 引入当前路径下的所有子目录中的CMakeLists.txt文件
file(GLOB SUBDIRS RELATIVE ${CMAKE_CURRENT_LIST_DIR} ${CMAKE_CURRENT_LIST_DIR}/*)
foreach(SUBDIR ${SUBDIRS})
    if(IS_DIRECTORY ${CMAKE_CURRENT_LIST_DIR}/${SUBDIR})
        if(EXISTS ${CMAKE_CURRENT_LIST_DIR}/${SUBDIR}/CMakeLists.txt)
            add_subdirectory(${CMAKE_CURRENT_LIST_DIR}/${SUBDIR})
        endif()
    endif()
endforeach()
```

demo对应工程里的NewModule2和SubModule2



## Summary

以上解决方案或者示例都加入到了演示的[仓库](https://github.com/elmagnificogi/CMake_Kconfig_Example)中



## Quote

> https://github.com/LuckkMaker/apm32-kconfig-example
>
> https://docs.zephyrproject.org/latest/build/kconfig/extensions.html


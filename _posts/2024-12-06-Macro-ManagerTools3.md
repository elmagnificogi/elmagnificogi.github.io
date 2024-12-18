---
layout:     post
title:      "配置管理工具之kconfig"
subtitle:   "Kconfig、menuconfig、makefile、macro、nRF SDK"
date:       2024-12-18
update:     2024-12-18
author:     "elmagnifico"
header-img: "img/bg6.jpg"
catalog:    true
tobecontinued: false
tags:
    - build
---

## Foreword

绕了这么大一圈，似乎只有kconfig是比较成熟的，能与之相媲美的管理工具很少



## Kconfig



### 安装

在windows下使用Kconfig，至少得有python，否则界面等内容无法正常显示

python需要先安装这几个包

```
python -m pip install windows-curses
python -m pip install kconfiglib
```



测试安装，可以正常显示命令

```
menuconfig -h
```



### 测试

参考工程sample_1

> https://github.com/bobwenstudy/test_kconfig_system

编译所有

```
make all
```

修改配置

```
menuconfig
```

运行`main.exe`就能看到结果了

```
hello, world
CONFIG_TEST_ENABLE
CONFIG_TEST_SHOW_STRING: Test 123
CONFIG_TEST_SHOW_INT: 123
CONFIG_TEST_SUB_0_ENABLE
CONFIG_TEST_SHOW_SUB_INT: 123
```



可能会报错，这个是因为curses库他需要终端执行，但是不识别你当前使用的终端，换一个就行了，比如cmd

```
make 提示Redirection is not supported.
```

这个例子里还只有一种config，还不能支持多config配置，可以看到主要就只能生成一个autoconfig.h

```makefile
all: main.o
	gcc main.o -o main
main.o: main.c autoconfig.h
	gcc main.c -c -o main.o
clean:
	del main.o main.exe

autoconfig.h:.config
	python ../scripts/kconfig.py Kconfig .config autoconfig.h log.txt .config
.config:
	menuconfig
menuconfig:
	menuconfig
```



### 多config

```makefile
# 默认编译test1
APP ?= app/test1
OUTPUT_PATH := output

INCLUDE_PATH := -I$(APP) -Idriver -I$(OUTPUT_PATH)

# 主要用户定义的配置是在每个app下的，这里也可以单独提取一个对应的版本目录来做
# define user .config setting
USER_CONFIG_SET := 
USER_CONFIG_SET += $(APP)/prj.conf

# define menuconfig .config path
DOTCONFIG_PATH := $(OUTPUT_PATH)/.config

# 用户文件追踪
# define user merged path
USER_RECORD_CONFIG_PATH := $(OUTPUT_PATH)/user_record.conf

# define autoconfig.h path
AUTOCONFIG_H := $(OUTPUT_PATH)/autoconfig.h

#define Kconfig path
KCONFIG_ROOT_PATH := Kconfig


#For windows work.
FIXPATH = $(subst /,\,$1)


all: $(APP)/main.o driver/driver_test.o
	gcc $^ -o $(OUTPUT_PATH)/main.exe
$(APP)/main.o: $(APP)/main.c
	gcc $< $(INCLUDE_PATH) -c -o $@
driver/driver_test.o: driver/driver_test.c $(AUTOCONFIG_H)
	gcc $< $(INCLUDE_PATH) -c -o $@

clean:
	del /q /s $(call FIXPATH, $(APP)/main.o driver/driver_test.o $(OUTPUT_PATH))

# 根据对应的autoconfig的目录来生成
$(AUTOCONFIG_H):$(DOTCONFIG_PATH)
	python ../scripts/kconfig.py $(KCONFIG_ROOT_PATH) $(DOTCONFIG_PATH) $(AUTOCONFIG_H) $(OUTPUT_PATH)/log.txt $(DOTCONFIG_PATH)

# 从用户的项目路径里拿刀用户定义的config
$(USER_RECORD_CONFIG_PATH): $(USER_CONFIG_SET)
	@echo Using user config.
#	create user_record.conf to record current setting.
	@copy $(call FIXPATH, $^) $(call FIXPATH, $@)
#	create .config by user config setting.
	python ../scripts/kconfig.py --handwritten-input-configs $(KCONFIG_ROOT_PATH) $(DOTCONFIG_PATH) $(AUTOCONFIG_H) $(OUTPUT_PATH)/log.txt $(USER_CONFIG_SET)

export KCONFIG_CONFIG=$(DOTCONFIG_PATH)
$(DOTCONFIG_PATH):$(USER_RECORD_CONFIG_PATH)
	@echo .config updated

menuconfig:$(DOTCONFIG_PATH)
#	set KCONFIG_CONFIG=$(DOTCONFIG_PATH)
	menuconfig $(KCONFIG_ROOT_PATH)
```



对应这样的配置就可以使用下面的方式来独立生成每个APP的配置，这样就可以同时维护多个版本，而要多一个APP，就再加一个配置就行了

```
make APP=app\test1
make APP=app\test2
```

上面这个配置还少了一点，生成的都是同一个文件，同一个目录，互相覆盖，其实可以参考OpenWRT，每次不同配置生成都在不同文件夹里，然后对应文件名就更好了



### 再次改进

```makefile
APP ?= app/test1
OUTPUT_PATH := output/$(APP)
TARGET    := main

INCLUDE_PATH := -I$(APP) -Idriver -I$(OUTPUT_PATH)

# define user .config setting
USER_CONFIG_SET := 
USER_CONFIG_SET += $(APP)/prj.conf

# define menuconfig .config path
DOTCONFIG_PATH := $(OUTPUT_PATH)/.config

# define user merged path
USER_RECORD_CONFIG_PATH := $(OUTPUT_PATH)/user_record.conf

# define autoconfig.h path
AUTOCONFIG_H := $(OUTPUT_PATH)/autoconfig.h

#define Kconfig path
KCONFIG_ROOT_PATH := Kconfig


#For windows work.
FIXPATH = $(subst /,\,$1)

all: $(APP)/main.o driver/driver_test.o
	gcc $^ -o $(OUTPUT_PATH)/$(TARGET).exe

$(APP)/main.o: $(APP)/main.c | $(OUTPUT_PATH)
	gcc $< $(INCLUDE_PATH) -c -o $@

driver/driver_test.o: driver/driver_test.c $(AUTOCONFIG_H)
	gcc $< $(INCLUDE_PATH) -c -o $@

$(OUTPUT_PATH):
	@mkdir $(call FIXPATH, $@)

clean:
	del /q /s $(call FIXPATH, $(APP)/main.o driver/driver_test.o $(OUTPUT_PATH))

$(AUTOCONFIG_H):$(DOTCONFIG_PATH)
	python ../scripts/kconfig.py $(KCONFIG_ROOT_PATH) $(DOTCONFIG_PATH) $(AUTOCONFIG_H) $(OUTPUT_PATH)/log.txt $(DOTCONFIG_PATH)

$(USER_RECORD_CONFIG_PATH): $(USER_CONFIG_SET)
	@echo Using user config.
#	create user_record.conf to record current setting.
	@copy $(call FIXPATH, $^) $(call FIXPATH, $@)
#	create .config by user config setting.
	python ../scripts/kconfig.py --handwritten-input-configs $(KCONFIG_ROOT_PATH) $(DOTCONFIG_PATH) $(AUTOCONFIG_H) $(OUTPUT_PATH)/log.txt $(USER_CONFIG_SET)

export KCONFIG_CONFIG=$(DOTCONFIG_PATH)
$(DOTCONFIG_PATH):$(USER_RECORD_CONFIG_PATH)
	@echo .config updated

menuconfig:$(DOTCONFIG_PATH)
#	set KCONFIG_CONFIG=$(DOTCONFIG_PATH)
	menuconfig $(KCONFIG_ROOT_PATH)
```

稍微修改一下，增加路径自动创建，这样后续就可以不同配置生成到不同目录中，不会互相覆盖了。同时也自动适配生成的文件名和路径分割符

当然这个Makefile还是有一些缺点，比如所有要编译的.c和.o都得一个个加，还是有点傻



### 可视化

Kconfig发展了这么久，难道没有人想着用VScode来做一下可视化嘛，事实上是有的，但是也都有限，不是很通用

![image-20241206163640263](https://img.elmagnifico.tech/static/upload/elmagnifico/202412061636312.png)

第一个插件只能提供kconfig的语法高亮，不能解决显示问题

第二个就是nRF Kconfig，下面的Konfig for Zephyr Project也停止开发，转而使用nRF Kconfig了

> https://marketplace.visualstudio.com/items?itemName=nordic-semiconductor.nrf-kconfig

nRF Kconfig想要用起来还稍微有点麻烦，直接启动不了，所以单独开个段落说明如何使用。



#### ESP-IDF

其他Kconfig，比如ESP-IDF，就可以很好的体现esp的kconfig内容

![nRF Kconfig GUI](https://img.elmagnifico.tech/static/upload/elmagnifico/202412061638409.gif)

但是ESP是专用的，并不适用于其他开发环节或者板子，而且体积很大



## nRF SDK Demo

### Demo体验

由于要启动kconfig必须要配置完工程才能启动，所以记录一下nRF SDK是怎么启动、编译的

- nRF也从SES逃离了，投入VSCode的怀抱了，我SES反馈的问题，SES官方就改了一个，其他的问题都视而不见，无语



首先安装nRF Connect Extendtion Pack

![image-20241217170434968](https://img.elmagnifico.tech/static/upload/elmagnifico/202412171704070.png)

其实相当于是插件包，我细看了一下，基本上需要的开发环境他都给你打包整合好了，设备树、Kconfig、Cmake、调试、Flash等等工具都有，相当于就是一个IDE了



![image-20241217170753692](https://img.elmagnifico.tech/static/upload/elmagnifico/202412171707735.png)

选择一个工具链，然后等安装完成，这里直接选最新的就行了

![image-20241217171334285](https://img.elmagnifico.tech/static/upload/elmagnifico/202412171713349.png)

继续安装SDK，选择一个路径安装，回车后等待完成

- SDK都有点大，会拉很多Tag进来，最好提前准备好翻墙相关内容
- 2.8.0的SDK貌似拉不下来？，所以切换到2.7.0才正常，对应前一步的toolchains也需要调整到2.7.0

![image-20241217175825913](https://img.elmagnifico.tech/static/upload/elmagnifico/202412171758016.png)

新建一个应用，然后添加编译配置，选择板子，构建配置，开始编译

![image-20241217184447275](https://img.elmagnifico.tech/static/upload/elmagnifico/202412171844334.png)

编译完成，但是注意一下新工程里面没有Kconfig，但是ACtion里已经可以显示Kconfig UI了

![image-20241217184632182](https://img.elmagnifico.tech/static/upload/elmagnifico/202412171846273.png)

### untitled

经过测试nRF的Kconfig GUI无法直接打开前面的sample_2工程，显示非nRF工程

这里详细分析一下untitled的默认工程

untitled一共三个文件

```
mian.c
CMakeLists.txt
prj.conf
```

prj.conf中直接是空白的，main中也没啥特殊内容，主要就是CMakeLists可以被识别？

```cmake
cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})

project(untitled)

target_sources(app PRIVATE src/main.c)
```

实际CMakeLists中的内容也非常少

实际把prj.conf直接复制到sample_2中，Kconfig就可以打开了，但是发现打开的还是untitled的config，而不是sample_2的

![image-20241218152800544](https://img.elmagnifico.tech/static/upload/elmagnifico/202412181528609.png)

关掉其他文件，再打开GUI，就无法启动了。

这里绑定有点深，必须CMakeLists，必须要在build以后才能用GUI，否则无法直接打开GUI界面

而添加Build Config以后，Build文件夹中的内容非常复杂，非常多内容



### nordic-semiconductor.nrf-kconfig

![image-20241218173215879](https://img.elmagnifico.tech/static/upload/elmagnifico/202412181732021.png)

看了一眼nRF Kconfig，源码竟然还是python，也就是跑这个必须有对应的python环境，否则还跑不起来，怪不得那个工具链安装好久，原来在下python。python本质上还是调用kconfiglib库来完成kconfig的解析，最后再转成数据送给VS 前端去加载显示



目前看起来源码没有做加密或者混淆，所以要改一个非nRF强关联的版本，应该是比较容易的



## vscode-kconfig

回过头再看Zephyr的kconfig，这个竟然是开源项目，那么只需要搞定他的入口，就可以显示任何kconfig了

> https://github.com/trond-snekvik/vscode-kconfig

后续计划一下改出来一个带UI的通用版本



## Summary

目前看只有Zephyr和nRF的Kconfig结合比较深，后续可能还会详细分析一下Zephyr的整体架构是什么样的，整个build是怎么串起来的



## Quote

> https://github.com/bobwenstudy/test_kconfig_system
>
> https://stackoverflow.com/questions/68748824/how-to-fix-redirection-is-not-supported
>
> https://docs.nordicsemi.com/bundle/nrf-connect-vscode/page/get_started/install.html
>
> https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/installation/install_ncs.html


---
layout:     post
title:      "宏管理工具之lite-manager"
subtitle:   "Kconfig、menuconfig、makefile、macro"
date:       2024-12-03
update:     2024-12-05
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

主要是用来方便管理宏定义和生成Makefile，但是大部分设置还是要熟悉Makefile本身，你才能完成lm的配置文件编写，本质上并没有变换脚本语言或者什么的流程

lite-manager在这里有点类似于Kconfig



### 环境

至少需要一个make和gun c的环境，之前系统里一直有一个MinGW32 13年的版本，gcc大概只有6，编译过不去（后来发现应该不是这个问题）

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



先生成Makefile

```
./lm.exe -g Makefile -p hello
```

然后可以生成config文件，并且查看宏定义情况

```
make config
```

编译

```
make
```



### 规则

![image-20241203110700613](https://img.elmagnifico.tech/static/upload/elmagnifico/202412031107687.png)

lm.cfg，用来定义宏的定义以及宏之间的关系

proj.cfg，用户定义实际想要的宏

.lm.mk，缓存

config.h，最终处理完约束条件后实际定义出来的宏



lm.cfg中判断条件是自上而下的，遇到冲突点，首先会关闭自身，然后文件之间是从左向右流动的

其中n，表示宏关闭，‘n’是正常使用n这个关键字

同时下面的文件编译的约束也可以同时使用宏来管控



多模块、多组件的工程目录

```
├───build
├───subdirA
|   ├───mac_a.c
|   └───lm.cfg
├───subdirB
|   ├───mac_b.c
|   └───lm.cfg
└───lm.cfg
```

可以使用include直接把下面的配置加载进去

```
include "subdirA/lm.cfg"
include "subdirB/lm.cfg"
```



lm的工程实例可以参考这里，有些技巧example里没有用到，可以看看实例是怎么跑的

> https://gitee.com/li-shan-asked/ebraid



lite-manager 同时也有类似tui的交互版本，不过作者说比较老、过时，所以不推荐用了

![img](https://img.elmagnifico.tech/static/upload/elmagnifico/202412031159028.png)



### Makefile解析

```makefile
# 自顶向下来看Makefile的设计
# 首先目标是hello 然后编译输出到build目录
TARGET    := hello
BUILD_DIR := build

# 定义一个伪指令，主要用来检测是否从lm的config中生成的
# 简单说基本上只要不是最终生成的目标，那都是伪指令
# 伪指令主要是完成一些辅助性的工作，比如clean，检测，切换配置，生成配置等等
# 检测是否有.lm.mk文件
.PHONY: check_lmmk
# wildcard自动寻找.lm.mk的文件 
ifneq ($(wildcard .lm.mk),)
-include .lm.mk
else
check_lmmk:
	@echo "Please run 'make config'"
endif

# 主要涉及使用的工具链，比如 arm-none-eabi-, 这里用默认gcc即可
CC_PREFIX ?= 
CC = $(CC_PREFIX)gcc
# 汇编编译的文件来源是C++ 支持的是.S 如果要支持.s 也在这里修改
AS = $(CC_PREFIX)gcc -x assembler-with-cpp
# copy命令
CP = $(CC_PREFIX)objcopy
# 文件size section 字段分析
SZ = $(CC_PREFIX)size
# 调试 debug的工具
OD = $(CC_PREFIX)objdump
# 生成hex文件
HEX = $(CP) -O ihex
# 生成bin文件
BIN = $(CP) -O binary -S
# 以上工具写的比较多，实际是为了以后适配使用，demo里可能没用到

# 定义额外的宏、库、等路径
CFLAGS    := $(C_PATH) $(C_DEFINE) $(C_FLAG) $(CPP_FLAG)
# 同上，定义链接文件的来源和参数
# 链接时生成map文件
LDFLAGS   := $(LD_FLAG) $(LIB_PATH) -Wl,-Map=$(BUILD_DIR)/$(TARGET).map


# 这里定义生成全部的目标
.PHONY: all
all: $(BUILD_DIR)/$(TARGET).exe elf_info


#获取到所有要编译的目标对象，这里是从build目录中获取所有c和c++目标
OBJECTS = $(addprefix $(BUILD_DIR)/,$(notdir $(patsubst %.c, %.o, $(patsubst %.cpp, %.o, $(C_SOURCE)))))
# 指定具体的.c文件的搜索路径
vpath %.c $(sort $(dir $(C_SOURCE)))
vpath %.cpp $(sort $(dir $(C_SOURCE)))
#获取到所有要编译的汇编对象
OBJECTS += $(addprefix $(BUILD_DIR)/,$(notdir $(ASM_SOURCE:.S=.o)))
vpath %.S $(sort $(dir $(ASM_SOURCE)))

# 创建存储.o和.c文件依赖关系的.d文件
# -MMD -MP -MF $(@:%.o=%.d) 是利用gcc自动生成依赖关系
# 将build路径下的所有c文件编译成.o文件
# Makefile文件自身也是依赖文件，如果Makefile文件发生变动，也需要重新编译
# -Wa,-a,-ad,-alms=$(BUILD_DIR)/$(notdir $(<:.c=.lst))：生成临时中间文件
# -c 仅仅编译，不进行链接
# $@是指这条指令的所有操作对象
# $<是第一个文件
$(BUILD_DIR)/%.o: %.c Makefile | $(BUILD_DIR)
	@echo "CC   $<"
	@$(CC) -c $(CFLAGS) -MMD -MP \
		-MF  $(BUILD_DIR)/$(notdir $(<:.c=.d)) \
		-Wa,-a,-ad,-alms=$(BUILD_DIR)/$(notdir $(<:.c=.lst)) $< -o $@

# 同上，只不过此处仅编译c++文件
$(BUILD_DIR)/%.o: %.cpp Makefile | $(BUILD_DIR)
	@echo "CC   $<"
	@$(CC) -c $(CFLAGS) -MMD -MP \
		-MF  $(BUILD_DIR)/$(notdir $(<:.cpp=.d)) \
		-Wa,-a,-ad,-alms=$(BUILD_DIR)/$(notdir $(<:.cpp=.lst)) $< -o $@

# 同上，此处仅编译.S的汇编文件
$(BUILD_DIR)/%.o: %.S Makefile | $(BUILD_DIR)
	@echo "AS   $<"
	@$(AS) -c $(CFLAGS) -MMD -MP  \
		-MF $(BUILD_DIR)/$(notdir $(<:.S=.d)) $< -o $@

# 生成exe文件
$(BUILD_DIR)/$(TARGET).exe: $(OBJECTS) Makefile
	@echo "LD   $@"
	@$(CC) $(OBJECTS) $(LDFLAGS) -o $@
	@$(OD) $(BUILD_DIR)/$(TARGET).exe -xS > $(BUILD_DIR)/$(TARGET).s $@
	@echo ''
	@echo "Build Successful!"
	@echo "ELF   $@"


elf_info: $(BUILD_DIR)/$(TARGET).exe
	@echo "=================================================================="
	@$(SZ) $<
	@echo "=================================================================="


# 生成build文件夹
$(BUILD_DIR):
	@mkdir $@


# 清除指令
.PHONY: config clean

# 如果工程配置文件存在，那么就调用lm重新生成配置
# 这里主要是生成对应的 config.h，不是重新生成Makefile
config: proj.cfg
	@./lm.exe --projcfg proj.cfg --lmcfg lm.cfg --out config.h --mem 50
	@./lm.exe --rmdir $(BUILD_DIR)


# 清空编译
clean:
	@./lm.exe --rmdir $(BUILD_DIR)


```



### lm.cfg解析

实际在hello的lm.cfg中只有一行，就是加了一个文件进去

```
SRC  += hello.c
```

这里指定了生成的目标是hello

```
./lm.exe -g Makefile -p hello
```

剩下的Makefile全都靠lm内部自动生成



以stm32f103的工程为例，相当于Makefile是一个通用的Makefile，而lm.cfg 相当于是一个PreMakefile，在这里直接定义Makefile要用的一些参数即可，剩下就是Makefile足够项目通用即可

```makefile
# 添加link文件
LDS       += stm32f10x_64KB_flash.ld
# 添加汇编文件
ASM       += startup_stm32f10x_md.s
# 添加一些关联文件路径
PATH      += lib/cmsis
PATH      += ./

# 添加源文件
SRC       += stm32f10x_it.c
SRC       += main.c

# 增加宏定义
DEFINE    += STM32F10X_HD USE_STDPERIPH_DRIVER
# 编译参数
CFLAG     += -g -O2 -mthumb -mcpu=cortex-m3 -march=armv7-m -Wl,-Bstatic -ffunction-sections -fdata-sections -nostdlib -ffreestanding
# 链接参数
LDFLAG    += -lnosys -Wl,--cref -Wl,--no-relax -Wl,--gc-sections -ffreestanding -Wl,-Bstatic -Wl,--no-warn-rwx-segments
# 汇编参数
ASFLAG    += -Wl, -Bstatic

# 引入库文件里的lm
include   "hal/STM32F10x_StdPeriph_Driver/lm.cfg"

```



### 问题

使用当前比较通用的`arm-none-eabi`的老库

```
GNU Arm Embedded Toolchain\10 2021.10
```

STM32F103的工程是无法正常编译的

如果没有看过类似的例子或者直接参考Makefile原工程，不可能上手直接使用

如果使用`Arm GNU Toolchain arm-none-eabi\13.3 rel1` 确实可以直接编译过



## Summary

lite-manager 总体还是挺小的，显示也还凑活，代码是开放的，完全可以自定义一些



## Quote

> https://gitee.com/li-shan-asked/lite-manager/tree/noui/
>
> 


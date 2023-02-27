---
layout:     post
title:      "NXP的ARM-GCC编译分析与转SES工程"
subtitle:   "Makefile、cmake、Ninja"
date:       2022-12-15
update:     2023-02-18
author:     "elmagnifico"
header-img: "img/desk-head-bg.jpg"
catalog:    true
tags:
    - NXP
    - SES
---

## Foreword

NXP的ARM-GCC编译脚本分析

基于`SDK_2.6.0_EVKB-IMXRT1050`进行分析



## build_debug.bat

```bat
cmake -DCMAKE_TOOLCHAIN_FILE="../../../../../tools/cmake_toolchain_files/armgcc.cmake" -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=debug  .
mingw32-make -j4 2> build_log.txt 
IF "%1" == "" ( pause ) 

```

这里比较简单，直接指定cmake编译配置文件路径，指定生成器是`MinGW Makefiles`，生成debug类型的makefile文件

最后调用mingw32进行编译，最多4线程运行并把编译信息输出到`build_log.txt`



有一点比较巧妙，NXP的指南中让你使用短名称代替默认Arm工具链冗长的地址（其实应该是地址太长了会导致某些目录特别深的代码编译报错）

```
for %I in (.) do echo %~sI
```



可以从执行结果看到，原本55个字符的路径变成了31个字符路径，多的这点字符可能就够某些深层路径使用了。

```
D:\GNU Arm Embedded Toolchain\10 2021.10\arm-none-eabi>for %I in (.) do echo %~sI

D:\GNU Arm Embedded Toolchain\10 2021.10\arm-none-eabi>echo D:\GNUARM~1\102021~1.10\ARM-NO~1
D:\GNUARM~1\102021~1.10\ARM-NO~1

D:\GNU Arm Embedded Toolchain\10 2021.10\arm-none-eabi>

```

一般来说当单目录名或者文件名超过16字节的时候，都可以通过这种方法来缩短路径



## armgcc.cmake

接着就是看cmake配置怎么写的了

{% raw %}

```cmake
# 引入指定编译器工具
INCLUDE(CMakeForceCompiler)

# 根据平台决定运行程序后缀
# TOOLCHAIN EXTENSION
IF(WIN32)
    SET(TOOLCHAIN_EXT ".exe")
ELSE()
    SET(TOOLCHAIN_EXT "")
ENDIF()

# 生成文件后缀
# EXECUTABLE EXTENSION
SET (CMAKE_EXECUTABLE_SUFFIX ".elf")

# 指定工具链路径，这个是环境变量，其实就是 D:\GNU Arm Embedded Toolchain\10 2021.10
# TOOLCHAIN_DIR AND NANO LIBRARY
SET(TOOLCHAIN_DIR $ENV{ARMGCC_DIR})
# 处理路径分隔符
STRING(REGEX REPLACE "\\\\" "/" TOOLCHAIN_DIR "${TOOLCHAIN_DIR}")

# 路径不存在报错
IF(NOT TOOLCHAIN_DIR)
    MESSAGE(FATAL_ERROR "***Please set ARMGCC_DIR in envionment variables***")
ENDIF()

# 显示工具链路径
MESSAGE(STATUS "TOOLCHAIN_DIR: " ${TOOLCHAIN_DIR})

# TARGET_TRIPLET
# 设置三元路径
SET(TARGET_TRIPLET "arm-none-eabi")

SET(TOOLCHAIN_BIN_DIR ${TOOLCHAIN_DIR}/bin)
SET(TOOLCHAIN_INC_DIR ${TOOLCHAIN_DIR}/${TARGET_TRIPLET}/include)
SET(TOOLCHAIN_LIB_DIR ${TOOLCHAIN_DIR}/${TARGET_TRIPLET}/lib)

# 设置编译目标系统名称，这里是通用
SET(CMAKE_SYSTEM_NAME Generic)
# 设置编译目标架构是arm架构
SET(CMAKE_SYSTEM_PROCESSOR arm)

# 指定编译器
CMAKE_FORCE_C_COMPILER(${TOOLCHAIN_BIN_DIR}/${TARGET_TRIPLET}-gcc${TOOLCHAIN_EXT} GNU)
CMAKE_FORCE_CXX_COMPILER(${TOOLCHAIN_BIN_DIR}/${TARGET_TRIPLET}-g++${TOOLCHAIN_EXT} GNU)
SET(CMAKE_ASM_COMPILER ${TOOLCHAIN_BIN_DIR}/${TARGET_TRIPLET}-gcc${TOOLCHAIN_EXT})

# 设置copy和dump工具
SET(CMAKE_OBJCOPY ${TOOLCHAIN_BIN_DIR}/${TARGET_TRIPLET}-objcopy CACHE INTERNAL "objcopy tool")
SET(CMAKE_OBJDUMP ${TOOLCHAIN_BIN_DIR}/${TARGET_TRIPLET}-objdump CACHE INTERNAL "objdump tool")

# 设置debug编译优化级别和link标记
SET(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} -O0 -g" CACHE INTERNAL "c compiler flags debug")
SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 -g" CACHE INTERNAL "cxx compiler flags debug")
SET(CMAKE_ASM_FLAGS_DEBUG "${CMAKE_ASM_FLAGS_DEBUG} -g" CACHE INTERNAL "asm compiler flags debug")
SET(CMAKE_EXE_LINKER_FLAGS_DEBUG "${CMAKE_EXE_LINKER_FLAGS_DEBUG}" CACHE INTERNAL "linker flags debug")

# 设置release编译优化级别和link标记
SET(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -O3 " CACHE INTERNAL "c compiler flags release")
SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 " CACHE INTERNAL "cxx compiler flags release")
SET(CMAKE_ASM_FLAGS_RELEASE "${CMAKE_ASM_FLAGS_RELEASE}" CACHE INTERNAL "asm compiler flags release")
SET(CMAKE_EXE_LINKER_FLAGS_RELESE "${CMAKE_EXE_LINKER_FLAGS_RELESE}" CACHE INTERNAL "linker flags release")

# 设置根路径 EXTRA_FIND_PATH是额外指定的查找路径，这里没有写
SET(CMAKE_FIND_ROOT_PATH ${TOOLCHAIN_DIR}/${TARGET_TRIPLET} ${EXTRA_FIND_PATH})
# FIND_PROGRAM 不从根路径搜索
SET(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
# FIND_LIBRARY 只从根路径查找
SET(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
#FIND_INCLUDE 只从根路径查找
SET(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

# 设置普通输出路径
SET(EXECUTABLE_OUTPUT_PATH ${PROJECT_BINARY_DIR}/${CMAKE_BUILD_TYPE})
# 设置库输出路径
SET(LIBRARY_OUTPUT_PATH ${PROJECT_BINARY_DIR}/${CMAKE_BUILD_TYPE})

# 显示当前build的类型
MESSAGE(STATUS "BUILD_TYPE: " ${CMAKE_BUILD_TYPE})

```

{% endraw %}

总体看还是非常简单的，先是指定具体的编译器路径，程序、库、include路径，设置编译级别和link路径，以及编译后输出路径。和IDE联系在一起，也是设置类似的东西即可。



#### 测试

看一下cmake以后的结果

```bash

F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc>cmake -DCMAKE_TOOLCHAIN_FILE="../../../../../tools/cmake_toolchain_files/armgcc.cmake" -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=debug  .
# 这里是没有设置工程名称，造成的警告，可以无视也可以补充上定义
CMake Warning (dev) in CMakeLists.txt:
  No project() command is present.  The top-level CMakeLists.txt file must
  contain a literal, direct call to the project() command.  Add a line of
  code such as

    project(ProjectName)

  near the top of the file, but after cmake_minimum_required().

  CMake is pretending there is a "project(Project)" command on the first
  line.
This warning is for project developers.  Use -Wno-dev to suppress it.

# 回显工具链路径 正确
-- TOOLCHAIN_DIR: D:/GNU Arm Embedded Toolchain/10 2021.10
# CMAKE_FORCE_C_COMPILER的宏已经太老了，现在直接指定即可，不是什么大问题
CMake Deprecation Warning at D:/CMake/share/cmake-3.25/Modules/CMakeForceCompiler.cmake:75 (message):
  The CMAKE_FORCE_C_COMPILER macro is deprecated.  Instead just set
  CMAKE_C_COMPILER and allow CMake to identify the compiler.
Call Stack (most recent call first):
  F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/tools/cmake_toolchain_files/armgcc.cmake:33 (CMAKE_FORCE_C_COMPILER)
  D:/CMake/share/cmake-3.25/Modules/CMakeDetermineSystem.cmake:121 (include)
  CMakeLists.txt

# 同上
CMake Deprecation Warning at D:/CMake/share/cmake-3.25/Modules/CMakeForceCompiler.cmake:89 (message):
  The CMAKE_FORCE_CXX_COMPILER macro is deprecated.  Instead just set
  CMAKE_CXX_COMPILER and allow CMake to identify the compiler.
Call Stack (most recent call first):
  F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/tools/cmake_toolchain_files/armgcc.cmake:34 (CMAKE_FORCE_CXX_COMPILER)
  D:/CMake/share/cmake-3.25/Modules/CMakeDetermineSystem.cmake:121 (include)
  CMakeLists.txt

# 回显编译类型
-- BUILD_TYPE: debug
# 回显路径
-- TOOLCHAIN_DIR: D:/GNU Arm Embedded Toolchain/10 2021.10
CMake Deprecation Warning at D:/CMake/share/cmake-3.25/Modules/CMakeForceCompiler.cmake:75 (message):
  The CMAKE_FORCE_C_COMPILER macro is deprecated.  Instead just set
  CMAKE_C_COMPILER and allow CMake to identify the compiler.
Call Stack (most recent call first):
  F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/tools/cmake_toolchain_files/armgcc.cmake:33 (CMAKE_FORCE_C_COMPILER)
  CMakeFiles/3.25.1/CMakeSystem.cmake:6 (include)
  CMakeLists.txt


CMake Deprecation Warning at D:/CMake/share/cmake-3.25/Modules/CMakeForceCompiler.cmake:89 (message):
  The CMAKE_FORCE_CXX_COMPILER macro is deprecated.  Instead just set
  CMAKE_CXX_COMPILER and allow CMake to identify the compiler.
Call Stack (most recent call first):
  F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/tools/cmake_toolchain_files/armgcc.cmake:34 (CMAKE_FORCE_CXX_COMPILER)
  CMakeFiles/3.25.1/CMakeSystem.cmake:6 (include)
  CMakeLists.txt


-- BUILD_TYPE: debug
CMake Deprecation Warning at CMakeLists.txt:5 (CMAKE_MINIMUM_REQUIRED):
  Compatibility with CMake < 2.8.12 will be removed from a future version of
  CMake.

  Update the VERSION argument <min> value or use a ...<max> suffix to tell
  CMake that the project does not need compatibility with older versions.

# 汇编路径回显
-- The ASM compiler identification is GNU
-- Found assembler: D:/GNU Arm Embedded Toolchain/10 2021.10/bin/arm-none-eabi-gcc.exe
-- Configuring done
-- Generating done
-- Build files have been written to: F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc

```

一共会生成5个内容

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212151117068.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212151117428.png)

CMakeCache.txt可以看到CMake相关的各种定义的值，可以修改，下次编译的时候还会使用这个缓存信息。

cmake_install.cmake是反射你当前的cmake环境，当把这个build结果给到别人的时候，别人可以通过安装和你相同的环境，来复现相同的编译

```
cmake -P cmake_install.cmake
```

Makefile，编译文件，后续分析

CMakeFiles，自动生成一堆MakeFile，用来辅助编译



## Makefile

```makefile
# CMAKE generated file: DO NOT EDIT!
# Generated by "MinGW Makefiles" Generator, CMake Version 3.25

# Default target executed when no arguments are given to make.
default_target: all
.PHONY : default_target

# Allow only one "make -f Makefile2" at a time, but pass parallelism.
.NOTPARALLEL:

#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:

# Disable VCS-based implicit rules.
% : %,v

# Disable VCS-based implicit rules.
% : RCS/%

# Disable VCS-based implicit rules.
% : RCS/%,v

# Disable VCS-based implicit rules.
% : SCCS/s.%

# Disable VCS-based implicit rules.
% : s.%

.SUFFIXES: .hpux_make_needs_suffix_list

# Command-line flag to silence nested $(MAKE).
$(VERBOSE)MAKESILENT = -s

#Suppress display of executed commands.
$(VERBOSE).SILENT:

# A target that is always out of date.
cmake_force:
.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

SHELL = cmd.exe

# The CMake executable.
CMAKE_COMMAND = D:\CMake\bin\cmake.exe

# The command to remove a file.
RM = D:\CMake\bin\cmake.exe -E rm -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc

#=============================================================================
# Targets provided globally by CMake.

# Special rule for the target edit_cache
edit_cache:
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --cyan "Running CMake cache editor..."
	D:\CMake\bin\cmake-gui.exe -S$(CMAKE_SOURCE_DIR) -B$(CMAKE_BINARY_DIR)
.PHONY : edit_cache

# Special rule for the target edit_cache
edit_cache/fast: edit_cache
.PHONY : edit_cache/fast

# Special rule for the target rebuild_cache
rebuild_cache:
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --cyan "Running CMake to regenerate build system..."
	D:\CMake\bin\cmake.exe --regenerate-during-build -S$(CMAKE_SOURCE_DIR) -B$(CMAKE_BINARY_DIR)
.PHONY : rebuild_cache

# Special rule for the target rebuild_cache
rebuild_cache/fast: rebuild_cache
.PHONY : rebuild_cache/fast

# The main all target
all: cmake_check_build_system
	$(CMAKE_COMMAND) -E cmake_progress_start F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc\CMakeFiles F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc\\CMakeFiles\progress.marks
	$(MAKE) $(MAKESILENT) -f CMakeFiles\Makefile2 all
	$(CMAKE_COMMAND) -E cmake_progress_start F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc\CMakeFiles 0
.PHONY : all

# The main clean target
clean:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\Makefile2 clean
.PHONY : clean

# The main clean target
clean/fast: clean
.PHONY : clean/fast

# Prepare targets for installation.
preinstall: all
	$(MAKE) $(MAKESILENT) -f CMakeFiles\Makefile2 preinstall
.PHONY : preinstall

# Prepare targets for installation.
preinstall/fast:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\Makefile2 preinstall
.PHONY : preinstall/fast

# clear depends
depend:
	$(CMAKE_COMMAND) -S$(CMAKE_SOURCE_DIR) -B$(CMAKE_BINARY_DIR) --check-build-system CMakeFiles\Makefile.cmake 1
.PHONY : depend

#=============================================================================
# Target rules for targets named hello_world.elf

# Build rule for target.
hello_world.elf: cmake_check_build_system
	$(MAKE) $(MAKESILENT) -f CMakeFiles\Makefile2 hello_world.elf
.PHONY : hello_world.elf

# fast build rule for target.
hello_world.elf/fast:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/build
.PHONY : hello_world.elf/fast

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.obj: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.obj

# target to build an object file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.obj

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.i: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.i

# target to preprocess a source file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.i

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.s: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.s

# target to generate assembly for a file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.s

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.obj: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.obj

# target to build an object file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.obj

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.i: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.i

# target to preprocess a source file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.i

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.s: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.s

# target to generate assembly for a file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.s

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.obj: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.obj

# target to build an object file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.obj

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.i: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.i

# target to preprocess a source file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.i

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.s: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.s

# target to generate assembly for a file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.s

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.obj: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.obj

# target to build an object file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.obj

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.i: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.i

# target to preprocess a source file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.i

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.s: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.s

# target to generate assembly for a file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.s

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.obj: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.obj

# target to build an object file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.obj

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.i: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.i

# target to preprocess a source file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.i

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.s: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.s

# target to generate assembly for a file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.s

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.obj: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.obj

# target to build an object file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.obj

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.i: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.i

# target to preprocess a source file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.i

06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.s: 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.s

# target to generate assembly for a file
06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.s

06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.obj: 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.obj

# target to build an object file
06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.obj
.PHONY : 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.obj

06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.i: 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.i

# target to preprocess a source file
06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.i
.PHONY : 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.i

06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.s: 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.s

# target to generate assembly for a file
06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.s
.PHONY : 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.S.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.S.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.S.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.S.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.s

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.obj: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.obj

# target to build an object file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.obj
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.obj

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.i: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.i

# target to preprocess a source file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.i
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.i

F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.s: F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.s

# target to generate assembly for a file
F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.s
.PHONY : F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.s

e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.obj: e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.obj
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.obj

# target to build an object file
e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.obj
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.obj

e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.i: e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.i
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.i

# target to preprocess a source file
e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.i
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.i

e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.s: e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.s
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.s

# target to generate assembly for a file
e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.s
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.s

e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.obj: e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.obj
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.obj

# target to build an object file
e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.obj:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.obj
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.obj

e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.i: e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.i
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.i

# target to preprocess a source file
e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.i:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.i
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.i

e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.s: e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.s
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.s

# target to generate assembly for a file
e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.s:
	$(MAKE) $(MAKESILENT) -f CMakeFiles\hello_world.elf.dir\build.make CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.s
.PHONY : e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.s

# Help Target
help:
	@echo The following are some of the valid targets for this Makefile:
	@echo ... all (the default if no target is provided)
	@echo ... clean
	@echo ... depend
	@echo ... edit_cache
	@echo ... rebuild_cache
	@echo ... hello_world.elf
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.obj
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.i
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.s
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.obj
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.i
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.s
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.obj
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.i
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.s
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.obj
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.i
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.s
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.obj
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.i
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.s
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.obj
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.i
	@echo ... 06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.s
	@echo ... 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.obj
	@echo ... 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.i
	@echo ... 06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.s
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.obj
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.i
	@echo ... F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.s
	@echo ... e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.obj
	@echo ... e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.i
	@echo ... e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.s
	@echo ... e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.obj
	@echo ... e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.i
	@echo ... e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.s
.PHONY : help



#=============================================================================
# Special targets to cleanup operation of make.

# Special rule to run CMake to check the build system integrity.
# No rule that depends on this can have commands that come from listfiles
# because they might be regenerated.
cmake_check_build_system:
	$(CMAKE_COMMAND) -S$(CMAKE_SOURCE_DIR) -B$(CMAKE_BINARY_DIR) --check-build-system CMakeFiles\Makefile.cmake 0
.PHONY : cmake_check_build_system


```

自动生成的Makefile，主要是看下有什么文件被引用了，以及路径是怎么设置的。



## 编译

```bash
F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc>mingw32-make -j4 2> build_log.txt
[  4%] Building C object CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.obj
[  9%] Building C object CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.obj[ 14%]
Building C object CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.obj
[ 19%] Building C object CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.obj
[ 28%] [ 28%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.objBuilding C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.obj

[ 33%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.obj
[ 38%] Building C object CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.obj
[ 42%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.obj
[ 47%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.obj
[ 52%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.obj
[ 57%] Building C object CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.obj
[ 61%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.obj
[ 66%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.obj
[ 71%] Building ASM object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.S.obj
[ 76%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.obj
[ 80%] [ 85%] Building C object CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.objBuilding C object CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.obj

[ 90%] Building C object CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.obj
[ 95%] Building C object CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.obj
[100%] Linking C executable debug\hello_world.elf
[100%] Built target hello_world.elf
```

编译完成以后还会输出一些文件

build_log.txt，编译时的log和各种问题显示

output.map，内存映射，用来debug

debug/hello_world.elf，结果



## Ninja

如果要转SES工程，会发现，SES只支持从keil、iar、ninja等工程配置转换过来。

而如果要手动创建一个工程，就很麻烦，很多东西需要设置，大概率不能直接弄好，那不如用一用官方的转换。

我想直接使用外部的编译，而不是SES自带的，如果从keil转就做不到了。官方刚好给了这个arm-gcc的，只不过他是用MinGW来生成的，SES需要用Ninja，Ninja使用也非常简单。



#### Ninja转SES

直接下载Ninja，然后放到一个目录中

> https://github.com/ninja-build/ninja/releases

比如我这里是

```
D:\ninja\ninja.exe
```

然后将ninja的路径添加到`path`中，这样让cmake可以找到这个ninja

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212151844538.png)

然后修改编译的`build_debug.bat`，替换成Ninja

```
cmake -DCMAKE_TOOLCHAIN_FILE="../../../../../tools/cmake_toolchain_files/armgcc.cmake" -G "Ninja" -DCMAKE_BUILD_TYPE=debug  .
```

直接运行，就可以正常生成对应的Ninja文件了

```bash
F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc>cmake -DCMAKE_TOOLCHAIN_FILE="../../../../../tools/cmake_toolchain_files/armgcc.cmake" -G "Ninja" -DCMAKE_BUILD_TYPE=debug  .
CMake Warning (dev) in CMakeLists.txt:
  No project() command is present.  The top-level CMakeLists.txt file must
  contain a literal, direct call to the project() command.  Add a line of
  code such as

    project(ProjectName)

  near the top of the file, but after cmake_minimum_required().

  CMake is pretending there is a "project(Project)" command on the first
  line.
This warning is for project developers.  Use -Wno-dev to suppress it.

-- TOOLCHAIN_DIR: D:/GNU Arm Embedded Toolchain/10 2021.10
CMake Deprecation Warning at D:/CMake/share/cmake-3.25/Modules/CMakeForceCompiler.cmake:75 (message):
  The CMAKE_FORCE_C_COMPILER macro is deprecated.  Instead just set
  CMAKE_C_COMPILER and allow CMake to identify the compiler.
Call Stack (most recent call first):
  F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/tools/cmake_toolchain_files/armgcc.cmake:33 (CMAKE_FORCE_C_COMPILER)
  CMakeFiles/3.25.1/CMakeSystem.cmake:6 (include)
  CMakeLists.txt


CMake Deprecation Warning at D:/CMake/share/cmake-3.25/Modules/CMakeForceCompiler.cmake:89 (message):
  The CMAKE_FORCE_CXX_COMPILER macro is deprecated.  Instead just set
  CMAKE_CXX_COMPILER and allow CMake to identify the compiler.
Call Stack (most recent call first):
  F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/tools/cmake_toolchain_files/armgcc.cmake:34 (CMAKE_FORCE_CXX_COMPILER)
  CMakeFiles/3.25.1/CMakeSystem.cmake:6 (include)
  CMakeLists.txt


-- BUILD_TYPE: debug
CMake Deprecation Warning at CMakeLists.txt:5 (CMAKE_MINIMUM_REQUIRED):
  Compatibility with CMake < 2.8.12 will be removed from a future version of
  CMake.

  Update the VERSION argument <min> value or use a ...<max> suffix to tell
  CMake that the project does not need compatibility with older versions.


-- The ASM compiler identification is GNU
-- Found assembler: D:/GNU Arm Embedded Toolchain/10 2021.10/bin/arm-none-eabi-gcc.exe
-- Configuring done
-- Generating done
CMake Warning:
  Manually-specified variables were not used by the project:

    CMAKE_TOOLCHAIN_FILE


-- Build files have been written to: F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc
```

然后SES这里直接导入Ninja

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212151846249.png)

导入以后有两个地方需要修改一下，build中关于ARMGCC的路径宏是不正确的，需要自己重新设置一下

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212161630040.png)

外部编译的路径也不正确，需要修改

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212151849820.png)

这样以后，就能正常编译过了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212151854154.png)



后来发现实际上转换出来的工程还是有点小问题的，SES处理的时候用了一些UI没有显示的东西

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202212211602242.png)

比如所有头文件的引用，正常应该是写在某个配置中的，但是从Ninja转换过来的直接写在了文件夹的属性里，并且这个属性是不能通过UI显示出来的，只看到文件都继承了一个值，但是去看文件夹又没有这个值，就非常奇怪，应该是SES目前还是不完善造成的。

我把工程再移植以后，发现Ninja转换过来的路径全都是写死的，还需要手动改一遍，变成相对路径。

转换后的工程开源在我的工具中，有需要可以参考

> https://github.com/elmagnificogi/MyTools/tree/master/NXP_IMXRT1052_SES_hello_world



#### Ninja分析

再看一下生成的Ninja内容

```
# CMAKE generated file: DO NOT EDIT!
# Generated by "Ninja" Generator, CMake Version 3.25

# This file contains all the build statements describing the
# compilation DAG.

# =============================================================================
# Write statements declared in CMakeLists.txt:
# 
# Which is the root file.
# =============================================================================

# =============================================================================
# Project: Project
# Configurations: debug
# =============================================================================

#############################################
# Minimal version of Ninja required by this file

ninja_required_version = 1.5


#############################################
# Set configuration variable for custom commands.

CONFIGURATION = debug
# =============================================================================
# Include auxiliary files.


#############################################
# Include rules file.

include CMakeFiles/rules.ninja

# =============================================================================

#############################################
# Logical path to working directory; prefix for absolute paths.

cmake_ninja_workdir = F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/
# =============================================================================
# Object build statements for EXECUTABLE target hello_world.elf


#############################################
# Order-only phony target for hello_world.elf

build cmake_object_order_depends_target_hello_world.elf: phony || CMakeFiles/hello_world.elf.dir

build CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\demo_apps\hello_world\hello_world.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
# 这里是一些需要引用的路径，后续可以参考
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\demo_apps\hello_world

build CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\demo_apps\hello_world\pin_mux.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\demo_apps\hello_world

build CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/board.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\demo_apps\hello_world\board.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\demo_apps\hello_world

build CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\demo_apps\hello_world\clock_config.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\demo_apps\hello_world

build CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\drivers\fsl_clock.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\drivers

build CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\drivers\fsl_common.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\drivers

build CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\system_MIMXRT1052.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052

build CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\devices\MIMXRT1052\utilities\debug_console\fsl_debug_console.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\devices\MIMXRT1052\utilities\debug_console

build CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\e80b1e64208fade1e56dcc745157207a\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\utilities\str\fsl_str.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\e80b1e64208fade1e56dcc745157207a\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\utilities\str

build CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\components\uart\lpuart_adapter.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\components\uart

build CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\e80b1e64208fade1e56dcc745157207a\SDK_2.6.0_EVKB-IMXRT1050\components\serial_manager\serial_manager.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\e80b1e64208fade1e56dcc745157207a\SDK_2.6.0_EVKB-IMXRT1050\components\serial_manager

build CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\e80b1e64208fade1e56dcc745157207a\SDK_2.6.0_EVKB-IMXRT1050\components\serial_manager\serial_port_uart.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\e80b1e64208fade1e56dcc745157207a\SDK_2.6.0_EVKB-IMXRT1050\components\serial_manager

build CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\drivers\fsl_lpuart.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\drivers

build CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\components\lists\generic_list.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\components\lists

build CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.S.obj: ASM_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.S || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\e80b1e64208fade1e56dcc745157207a\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\gcc\startup_MIMXRT1052.S.obj.d
  FLAGS = -g -g -g -DDEBUG -D__STARTUP_CLEAR_BSS -D__STARTUP_INITIALIZE_NONCACHEDATA -g -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\e80b1e64208fade1e56dcc745157207a\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\gcc

build CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\utilities\fsl_assert.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\utilities

build CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\drivers\fsl_gpio.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\F_\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\devices\MIMXRT1052\drivers

build CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\devices\MIMXRT1052\xip\fsl_flexspi_nor_boot.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\devices\MIMXRT1052\xip

build CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\xip\evkbimxrt1050_flexspi_nor_config.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\xip

build CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.obj: C_COMPILER__hello_world.2eelf_debug F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c || cmake_object_order_depends_target_hello_world.elf
  DEP_FILE = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\xip\evkbimxrt1050_sdram_ini_dcd.c.obj.d
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  INCLUDES = -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../.. -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../CMSIS/Include -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/drivers -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052 -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/str -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/utilities/debug_console -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/uart -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/serial_manager -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../components/lists -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../../../devices/MIMXRT1052/xip -IF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/../../../xip
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  OBJECT_FILE_DIR = CMakeFiles\hello_world.elf.dir\06b4f722f0096b8e831cef3a518bd843\boards\evkbimxrt1050\xip


# =============================================================================
# Link build statements for EXECUTABLE target hello_world.elf


#############################################
# Link the executable debug\hello_world.elf

build debug/hello_world.elf: C_EXECUTABLE_LINKER__hello_world.2eelf_debug CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/hello_world.c.obj CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/pin_mux.c.obj CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/board.c.obj CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/demo_apps/hello_world/clock_config.c.obj CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_clock.c.obj CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_common.c.obj CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/system_MIMXRT1052.c.obj CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/utilities/debug_console/fsl_debug_console.c.obj CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/str/fsl_str.c.obj CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/uart/lpuart_adapter.c.obj CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_manager.c.obj CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/components/serial_manager/serial_port_uart.c.obj CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_lpuart.c.obj CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/components/lists/generic_list.c.obj CMakeFiles/hello_world.elf.dir/e80b1e64208fade1e56dcc745157207a/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/gcc/startup_MIMXRT1052.S.obj CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/utilities/fsl_assert.c.obj CMakeFiles/hello_world.elf.dir/F_/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/devices/MIMXRT1052/drivers/fsl_gpio.c.obj CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/devices/MIMXRT1052/xip/fsl_flexspi_nor_boot.c.obj CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_flexspi_nor_config.c.obj CMakeFiles/hello_world.elf.dir/06b4f722f0096b8e831cef3a518bd843/boards/evkbimxrt1050/xip/evkbimxrt1050_sdram_ini_dcd.c.obj
  FLAGS = -O0 -g -O0 -g -O0 -g -DDEBUG -DCPU_MIMXRT1052DVL6B -DPRINTF_FLOAT_ENABLE=0 -DSCANF_FLOAT_ENABLE=0 -DPRINTF_ADVANCED_ENABLE=0 -DSCANF_ADVANCED_ENABLE=0 -g -O0 -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 -mthumb -MMD -MP -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mapcs -std=gnu99
  LINK_FLAGS = -g -mcpu=cortex-m7 -Wall -mfloat-abi=hard -mfpu=fpv5-d16 --specs=nano.specs --specs=nosys.specs -fno-common -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -mthumb -mapcs -Xlinker --gc-sections -Xlinker -static -Xlinker -z -Xlinker muldefs -Xlinker -Map=output.map -TF:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc/MIMXRT1052xxxxx_ram.ld -static
  LINK_LIBRARIES = -Wl,--start-group  -lm  -lc  -lgcc  -lnosys  -Wl,--end-group
  OBJECT_DIR = CMakeFiles\hello_world.elf.dir
  POST_BUILD = cd .
  PRE_LINK = cd .
  TARGET_FILE = debug\hello_world.elf
  TARGET_PDB = hello_world.elf.dbg


#############################################
# Utility command for edit_cache

build CMakeFiles/edit_cache.util: CUSTOM_COMMAND
  COMMAND = cmd.exe /C "cd /D F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc && D:\CMake\bin\cmake-gui.exe -SF:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc -BF:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc"
  DESC = Running CMake cache editor...
  pool = console
  restat = 1

build edit_cache: phony CMakeFiles/edit_cache.util


#############################################
# Utility command for rebuild_cache

build CMakeFiles/rebuild_cache.util: CUSTOM_COMMAND
  COMMAND = cmd.exe /C "cd /D F:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc && D:\CMake\bin\cmake.exe --regenerate-during-build -SF:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc -BF:\NXP\ref\SDK_2.6.0_EVKB-IMXRT1050\SDK_2.6.0_EVKB-IMXRT1050\boards\evkbimxrt1050\demo_apps\hello_world\armgcc"
  DESC = Running CMake to regenerate build system...
  pool = console
  restat = 1

build rebuild_cache: phony CMakeFiles/rebuild_cache.util

# =============================================================================
# Target aliases.

build hello_world.elf: phony debug/hello_world.elf

# =============================================================================
# Folder targets.

# =============================================================================

#############################################
# Folder: F:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/boards/evkbimxrt1050/demo_apps/hello_world/armgcc

build all: phony debug/hello_world.elf

# =============================================================================
# Unknown Build Time Dependencies.
# Tell Ninja that they may appear as side effects of build rules
# otherwise ordered by order-only dependencies.

# =============================================================================
# Built-in targets


#############################################
# Re-run CMake if any of its inputs changed.

build build.ninja: RERUN_CMAKE | CMakeCache.txt CMakeFiles/3.25.1/CMakeASMCompiler.cmake CMakeFiles/3.25.1/CMakeCCompiler.cmake CMakeFiles/3.25.1/CMakeCXXCompiler.cmake CMakeFiles/3.25.1/CMakeSystem.cmake CMakeLists.txt D$:/CMake/share/cmake-3.25/Modules/CMakeASMCompiler.cmake.in D$:/CMake/share/cmake-3.25/Modules/CMakeASMInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeCCompiler.cmake.in D$:/CMake/share/cmake-3.25/Modules/CMakeCInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeCXXCompiler.cmake.in D$:/CMake/share/cmake-3.25/Modules/CMakeCXXInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeCommonLanguageInclude.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeCompilerIdDetection.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineASMCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineCCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineCXXCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineCompilerId.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeFindBinUtils.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeForceCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeGenericSystem.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeInitializeConfigs.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeLanguageInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeNinjaFindMake.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeSystemSpecificInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeSystemSpecificInitialize.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeTestASMCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeTestCCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeTestCXXCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/CMakeCommonCompilerMacros.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU-ASM.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU-C.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU-CXX.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU-FindBinUtils.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU.cmake D$:/CMake/share/cmake-3.25/Modules/Platform/Generic.cmake F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/tools/cmake_toolchain_files/armgcc.cmake
  pool = console


#############################################
# A missing CMake input file is not an error.

build CMakeCache.txt CMakeFiles/3.25.1/CMakeASMCompiler.cmake CMakeFiles/3.25.1/CMakeCCompiler.cmake CMakeFiles/3.25.1/CMakeCXXCompiler.cmake CMakeFiles/3.25.1/CMakeSystem.cmake CMakeLists.txt D$:/CMake/share/cmake-3.25/Modules/CMakeASMCompiler.cmake.in D$:/CMake/share/cmake-3.25/Modules/CMakeASMInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeCCompiler.cmake.in D$:/CMake/share/cmake-3.25/Modules/CMakeCInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeCXXCompiler.cmake.in D$:/CMake/share/cmake-3.25/Modules/CMakeCXXInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeCommonLanguageInclude.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeCompilerIdDetection.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineASMCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineCCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineCXXCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeDetermineCompilerId.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeFindBinUtils.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeForceCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeGenericSystem.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeInitializeConfigs.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeLanguageInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeNinjaFindMake.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeSystemSpecificInformation.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeSystemSpecificInitialize.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeTestASMCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeTestCCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/CMakeTestCXXCompiler.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/CMakeCommonCompilerMacros.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU-ASM.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU-C.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU-CXX.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU-FindBinUtils.cmake D$:/CMake/share/cmake-3.25/Modules/Compiler/GNU.cmake D$:/CMake/share/cmake-3.25/Modules/Platform/Generic.cmake F$:/NXP/ref/SDK_2.6.0_EVKB-IMXRT1050/SDK_2.6.0_EVKB-IMXRT1050/tools/cmake_toolchain_files/armgcc.cmake: phony


#############################################
# Clean all the built files.

build clean: CLEAN


#############################################
# Print all primary targets available.

build help: HELP


#############################################
# Make the all target the default.

default all

```

Ninja相当于是直接把每个要编译的文件和对应的编译参数全都列出来了



## 问题

后续发现就算NXP转成了SES，可以编译过，但是作为IDE，一体化的程度还是不够，最大的问题在于MIMXRT系列的板子都可以自定义FLASH或者RAM，这就导致要flash或者debug必须带有对应的驱动(cfx)，而SES并不具有烧写cfx的功能。

同理如果debug在SES这里也不方便，相对比NXP自己的IDE MUCXpresso本身就具有cfx插件功能，并且在flash和ram的设置阶段就可以直接设置对应的文件，开发人员基本可以免去复杂的重写驱动之类的操作，这就很方便了。

MUCXpresso也有不好的地方，首先他是eclipse的二次开发，卡顿感还是非常明显的，然后调试的时候也是延迟非常明显，很难受。

同比，Keil没有以上说的缺点，但是本身工程架构太过恶心，实在不想选择他



目前看来最好的方法就是调试的时候用一下MUCXpresso，平常CICD流程的时候使用arm-none-eabi完成



#### 柳暗花明

通过痞子衡的J-Link算法，已经解决了J-Link下载缺少算法的问题，但是又遇到另外一个bUG，SES中JLink的设置无法生效

已经在设置中设置了目标设备的具体名称，但是实际使用的时候发现JLink依然连接的是默认设备，导致实际算法应用不上去。

然后就无法下载和调试，非常蛋疼，如果使用J-Link Commander 一切正常。

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302181001048.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302181001052.png)

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302181001435.png)

Commander 正常工作

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302181001580.png)

就差一点点就能完全正常工作了。



关于这个问题已经在SES官方论坛提出了，就看什么时候能给解决一下

> https://forum.segger.com/index.php/Thread/8928-SES-JLink-Device-config-not-work-in-Connect-download-or-debug/



#### 临时解决

通过临时将JLink脚本中的设备名修改为新算法的，并且用`JLinkDLLUpdater.exe`更新了目前的SES的dll以后，发现可以正常烧写了

![](https://img.elmagnifico.tech/static/upload/elmagnifico/202302181506240.png)

至此使用SES来开发NXP已经不是什么问题了，基本通路都打通了



## Summary

通过这种方式了就可以将所有NXP的例程都转换成SES的工程，只是这里路径还是有点不够优雅，看看后续是否还有更好的方式。但是基于此创建基础工程和拓展已经可以了。



## Quote

> https://blog.csdn.net/weixin_42491857/article/details/80741060
>
> https://blog.csdn.net/zxyhhjs2017/article/details/79061263
>
> https://blog.csdn.net/smart_jackli/article/details/128041406
>
> https://www.w3cschool.cn/doc_cmake_3_5/cmake_3_5-module-cmakeforcecompiler.html
>
> https://blog.csdn.net/June_we/article/details/122713530
>
> https://www.cnblogs.com/uestc-mm/p/15666249.html
>
> https://stackoverflow.com/questions/25669919/what-is-cmake-install-cmake
>
> https://github.com/FrankHB/pl-docs/blob/master/zh-CN/mingw-vs-mingw-v64.md

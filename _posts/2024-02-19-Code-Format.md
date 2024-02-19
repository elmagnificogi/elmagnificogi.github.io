---
layout:     post
title:      "代码格式化工具"
subtitle:   "Astyle、Artistic Style、Clang-Format、CoolFormat"
date:       2024-02-19
update:     2024-02-19
author:     "elmagnifico"
header-img: "img/z9.jpg"
catalog:    true
tobecontinued: false
tags:
    - Format
    - Git
---

## Foreword

测试一下目前常用的一些代码格式化的工具，后续将其引入到CI流程中



## Format



### Artistic Style

Astyle，一个经典代码格式化的工具，在一些比较老的编译器或者是嵌入式中用的比较多

> https://astyle.sourceforge.net/



本身支持命令行直接调用，所以很适合集成到一些CI流程中

```
Usage:
------
            astyle [OPTIONS] File1 File2 File3 [...]

            astyle [OPTIONS] < Original > Beautified

    When indenting a specific file, the resulting indented file RETAINS
    the original file-name. The original pre-indented file is renamed,
    with a suffix of '.orig' added to the original filename.

    Wildcards (* and ?) may be used in the filename.
    A 'recursive' option can process directories recursively.
    Multiple file extensions may be separated by a comma.

    By default, astyle is set up to indent with four spaces per indent,
    a maximal indentation of 40 spaces inside continuous statements,
    a minimum indentation of eight spaces inside conditional statements,
    and NO formatting options.
```



```
AStyle --mode=语言 --style=风格（类似大括号换行还是不换） 文件
```

详细的样式可以参考官方文档说明

> https://astyle.sourceforge.net/astyle.html



简易把AStyle.exe所在路径直接加入到系统环境变量中的path，方便全局调用



简单总结一下：

- 支持多语言
- 支持多种风格
- 支持文件内部分格式化、部分不格式化
- 支持工程配置文件
- 支持换行、空格、tab、多种对齐模式等等细节格式修改
- 支持格式化流重定向
- 支持批量，支持个别排除



#### 批量化

类似的使用下面的脚本就可以将所在目录中的所有指定格式的文件都进行格式化了

```
for /R %%f in (*.c;*.h;*.cpp;*.hpp) do AStyle.exe --style=allman --indent=spaces=4 --pad-oper --pad-header --unpad-paren --suffix=none --align-pointer=name --lineend=windows --convert-tabs --verbose %%f
pause
```



```
for /R %%f in (*.c;*.h;*.cpp;*.hpp) do D:\astyle-3.4.12-x64\AStyle.exe --style=allman --indent=spaces=4 --pad-oper --pad-header --unpad-paren --suffix=none --align-pointer=name --lineend=windows --convert-tabs --verbose %%f
pause
```



也可以利用命令行的`recursive` 来完成批量格式化

```
D:\astyle-3.4.12-x64\AStyle.exe --style=allman --indent=spaces=4 --pad-oper --pad-header --unpad-paren --suffix=none --align-pointer=name --lineend=windows --convert-tabs --verbose --recursive .\*.cpp,*.h,*.hpp
```



利用`exclude`排除部分文件夹或者文件

```
D:\astyle-3.4.12-x64\AStyle.exe --style=allman --indent=spaces=4 --pad-oper --pad-header --unpad-paren --suffix=none --align-pointer=name --lineend=windows --convert-tabs --verbose --recursive .\*.cpp,*.h,*.hpp --exclude=vfs --exclude=FreeRTOS --exclude=ST_HAL
```



### Clang-Format

> https://clang.llvm.org/docs/ClangFormat.html

Clang-Format是LLVM组织下的官方格式化工具，他被大面积集成在使用了LLVM的编译器或者各类IDE中，VScode、Clion等都有相关的插件可以使用。



安装

```
 apt install clang-format
```

安装验证

```
clang-format --version
```



Clang-Format和Astyle类似，都有统一的格式化配置管理文件

Clang-Format可以很轻易地集成到各种使用了linux的环境中，git中也是，要把他和CI联系在一起，可以通过git hook 在commit的时候自动进行格式化，然后再进行提交。

唯一不太好的地方就是Clang-Format对于windows环境支持不太行，没有专门的release，需要整个LLVM



如果想在windows下使用Clang-Format，可以下载一个之前的镜像版本

> https://prereleases.llvm.org/win-snapshots/clang-format-6923b0a7.exe

然后将clang-format放到一个被系统环境变量引用的路径就能直接调用了



如果想做到嵌入git，还需要从官方下载一个脚本

```
https://github.com/llvm/llvm-project/blob/main/clang/tools/clang-format/
```

这个目录下是git联动的脚本，本质上就是跑python3，可以看到就算是windows也只是直接调用了pyton的脚本

通过这种方式就能用下面这种方式调用了

```
git clang-format -h
```

- 这样显得有点多此一举



格式化main文件

```
D:\Git\bin\clang-format.exe -i main.c
```

使用默认配置文件，在main路径下建立一个名为`.clang-format`格式的文件即可

这个是yaml格式的文件，默认会加载路径中的格式化配置文件

```yaml
---
# 语言: None, Cpp, Java, JavaScript, ObjC, Proto, TableGen, TextProto
Language:	Cpp
BasedOnStyle:	google
# 访问说明符(public、private等)的偏移
AccessModifierOffset:	-4
# 开括号(开圆括号、开尖括号、开方括号)后的对齐: Align, DontAlign, AlwaysBreak(总是在开括号后换行)
AlignAfterOpenBracket:	Align
# 连续赋值时，对齐所有等号
AlignConsecutiveAssignments:	false
# 连续声明时，对齐所有声明的变量名
AlignConsecutiveDeclarations:	false

# 水平对齐二元和三元表达式的操作数
AlignOperands:	true
# 对齐连续的尾随的注释
AlignTrailingComments:	false

# 允许短的case标签放在同一行
AllowShortCaseLabelsOnASingleLine:	false
# 允许短的函数放在同一行: None, InlineOnly(定义在类中), Empty(空函数), Inline(定义在类中，空函数), All
AllowShortFunctionsOnASingleLine:	Empty
# 允许短的if语句保持在同一行
AllowShortIfStatementsOnASingleLine:	false
# 允许短的循环保持在同一行
AllowShortLoopsOnASingleLine:	false

# 总是在返回类型后换行: None, All, TopLevel(顶级函数，不包括在类中的函数),
#   AllDefinitions(所有的定义，不包括声明), TopLevelDefinitions(所有的顶级函数的定义)
AlwaysBreakAfterReturnType:	None
# 总是在多行string字面量前换行
AlwaysBreakBeforeMultilineStrings:	false
# 总是在template声明后换行
AlwaysBreakTemplateDeclarations:	false
# false表示函数实参要么都在同一行，要么都各自一行
BinPackArguments:	true
# false表示所有形参要么都在同一行，要么都各自一行
BinPackParameters:	true

# 在二元运算符前换行: None(在操作符后换行), NonAssignment(在非赋值的操作符前换行), All(在操作符前换行)
BreakBeforeBinaryOperators:	NonAssignment
# 在大括号前换行: Attach(始终将大括号附加到周围的上下文), Linux(除函数、命名空间和类定义，与Attach类似),
#   Mozilla(除枚举、函数、记录定义，与Attach类似), Stroustrup(除函数定义、catch、else，与Attach类似),
#   Allman(总是在大括号前换行), GNU(总是在大括号前换行，并对于控制语句的大括号增加额外的缩进), WebKit(在函数前换行), Custom
#   注：这里认为语句块也属于函数
#总是在大括号前换行
BreakBeforeBraces:	Allman
# 在三元运算符前换行
BreakBeforeTernaryOperators:	false

# 在构造函数的初始化列表的逗号前换行
BreakConstructorInitializersBeforeComma:	false
BreakConstructorInitializers: BeforeColon
# 每行字符的限制，0表示没有限制
ColumnLimit:	80
# 描述具有特殊意义的注释的正则表达式，它不应该被分割为多行或以其它方式改变
CommentPragmas:	'^ IWYU pragma:'
CompactNamespaces: false
# 构造函数的初始化列表要么都在同一行，要么都各自一行
ConstructorInitializerAllOnOneLineOrOnePerLine:	false
# 构造函数的初始化列表的缩进宽度
ConstructorInitializerIndentWidth:	4
# 延续的行的缩进宽度
ContinuationIndentWidth:	4
# 去除C++11的列表初始化的大括号{后和}前的空格
Cpp11BracedListStyle:	true
# 继承最常用的指针和引用的对齐方式
DerivePointerAlignment:	false
# 关闭格式化
DisableFormat:	false
# 自动检测函数的调用和定义是否被格式为每行一个参数(Experimental)
ExperimentalAutoDetectBinPacking:	false
# 需要被解读为foreach循环而不是函数调用的宏
ForEachMacros:	[ foreach, Q_FOREACH, BOOST_FOREACH ]
# 缩进case标签
IndentCaseLabels:	false

# 宏#define的缩进
IndentPPDirectives:  None
# 缩进宽度
IndentWidth:	4
# 函数返回类型换行时，缩进函数声明或函数定义的函数名
IndentWrappedFunctionNames:	false
# 保留在块开始处的空行
KeepEmptyLinesAtTheStartOfBlocks:	true
# 开始一个块的宏的正则表达式
MacroBlockBegin:	''
# 结束一个块的宏的正则表达式
MacroBlockEnd:	''
# 连续空行的最大数量
MaxEmptyLinesToKeep:	1
# 命名空间的缩进: None, Inner(缩进嵌套的命名空间中的内容), All
NamespaceIndentation:	Inner
# 使用ObjC块时缩进宽度
ObjCBlockIndentWidth:	4
# 在ObjC的@property后添加一个空格
ObjCSpaceAfterProperty:	false
# 在ObjC的protocol列表前添加一个空格
ObjCSpaceBeforeProtocolList:	true

# 指针和引用的对齐: Left, Right, Middle
PointerAlignment:	Right
# 允许重新排版注释
#ReflowComments:	true
# 允许排序#include
SortIncludes:	true

# 在C风格类型转换后添加空格
SpaceAfterCStyleCast:	false

SpaceAfterTemplateKeyword: true

# 在赋值运算符之前添加空格
SpaceBeforeAssignmentOperators:	true
# 开圆括号之前添加一个空格: Never, ControlStatements, Always
SpaceBeforeParens:	ControlStatements
# 在空的圆括号中添加空格
SpaceInEmptyParentheses:	false
# 在尾随的评论前添加的空格数(只适用于//)
SpacesBeforeTrailingComments:	2
# 在尖括号的<后和>前添加空格
SpacesInAngles:	false
# 在容器(ObjC和JavaScript的数组和字典等)字面量中添加空格
SpacesInContainerLiterals:	false
# 在C风格类型转换的括号中添加空格
SpacesInCStyleCastParentheses:	false
# 在圆括号的(后和)前添加空格
SpacesInParentheses:	false
# 在方括号的[后和]前添加空格，lamda表达式和未指明大小的数组的声明不受影响
SpacesInSquareBrackets:	false
# tab宽度
TabWidth:	4
# 使用tab字符: Never, ForIndentation, ForContinuationAndIndentation, Always
UseTab:	Never

```



#### git hook 自动格式化

在工程的git目录下新建hook

```
.git\hooks\pre-commit
```

内容如下

```sh
#!/bin/bash

STYLE=$(git config --get hooks.clangformat.style)
if [ -n "${STYLE}" ] ; then
    STYLEARG="-style=${STYLE}"
else
    # try source root dir
    STYLE=$(git rev-parse --show-toplevel)/.clang-format
    if [ -n "${STYLE}" ] ; then
        STYLEARG="-style=file"
    else
        STYLEARG=""
    fi
fi

# 确保clang-format已经可以调用了
format_file() {
    file="${1}"
    if [ ! -z "${STYLEARG}" ]; then
        #echo "format ${file}"
        clang-format -i ${STYLEARG} ${1}
        git add ${1}
    fi
}

# 注意这里对格式化的文件做了限制，test1、2、3文件目录下的文件不格式化，另外非.cpp/.h的文件不格式化
is_need_format() {
    need=1
    file=$1

    # ignore /test/*
    if [[ "${file}" == */test/* ]]; then
        need=0
    fi

    # ignore /test1/*
    if [[ "${file}" == */test1/* ]]; then
        need=0
    fi

    # ignore /test3/*
    if [[ "${file}" == */test2/* ]]; then
        need=0
    fi

    # ignore /test3/*
    if [[ "${file}" == */test3/* ]]; then
        need=0
    fi			

    if [[ $need -eq 1 ]]; then
        # only c/c++ source file
        if [ x"${file##*.}" != x"cpp" -a x"${file##*.}" != x"h" ]; then
            #echo "not cpp source"
            need=0
        fi
    fi

    return $need
}

case "${1}" in
    --about )
        echo "Runs clang-format on source files"
        ;;
    * )
        for file in `git diff-index --cached --name-only HEAD` ; do
            is_need_format ${file}
            if [[ $? -eq 1 ]]; then
                format_file "${file}"
            fi
        done
        ;;
esac

```

然后提交一下main.cpp就能看到对应的文件已经自动格式化了



这种用法比较适合直接给CI的本地化程序去执行，git hook不能被git本身追踪，也就无法分享这个配置给其他人使用



### CoolFormat

> https://github.com/akof1314/CoolFormat

这个是个国内开源的格式化工具，不过也多年没更新了，只是用还是可以的



## Summary

目前来看两种都可以完成CI过程中的自动格式化，相比还是比较简单的



## Quote

> https://zhuanlan.zhihu.com/p/55565716
>
> https://blog.csdn.net/weixin_43717839/article/details/129382657
>
> https://zhuanlan.zhihu.com/p/641846308
>
> https://blog.csdn.net/zmlovelx/article/details/105196415
>
> https://blog.csdn.net/libaineu2004/article/details/104985934
>
> https://blog.csdn.net/xuyouqiang1987/article/details/128410408


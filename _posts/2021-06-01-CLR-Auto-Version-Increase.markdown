---
layout:     post
title:      "C++ CLI/CLR版本号自动增加"
subtitle:   "c#,c++"
date:       2021-06-01
update:     2021-06-01
author:     "elmagnifico"
header-img: "img/maze.jpg"
catalog:    true
mathjax:    false
tags:
    - c#
    - c++
---

## Foreword

经常需要编译以后自动增加版本号，网上也有很多种解决办法，基本都是额外执行一个脚本去修改版本号或者是一个插件直接提供ui给你操作，但是框架都做的这么完善了，vs或者框架自身提供的版本号自增到底在哪里呢？总不至于没有吧。

这次主要研究的是c++ CLR的版本号自增，CLR本身资料就少得可怜，非常冷门。



## C++ 宏定义

我们知道C++有几个特殊宏定义

```
__LINE__：在源代码中插入当前源代码行号；
__FILE__：在源文件中插入当前源文件名；
__DATE__：在源文件中插入当前的编译日期
__TIME__：在源文件中插入当前编译时间；
__STDC__：当要求程序严格遵循ANSI C标准时该标识被赋值为1；
__cplusplus：当编写C++程序时该标识符被定义。
```

如果需要版本号的话，可以直接用 `__TIME__` 和`__DATE__`转换成数字就自动变成自增的数值了，他就可以直接拿来作为版本号，这不是完美嘛？

> Visual Studio C++ >> __DATE__ and __TIME__ in a resource file?
> \> Is there some way to get the __DATE__ and __TIME__ (or
> \> their equivalent) to work with the resource compiler
>
> No. The MSDN documentation says these don't work
> for RC.
>
> "RC does not support the ANSI C predefined macros (__DATE__,
> __FILE__, __LINE__, __STDC__, __TIME__, __TIMESTAMP__). Therefore,
> you cannot include these macros in header files that you will
> include in your resource script."

然而现实是残酷的，这东西不能在资源文件中使用（仅限在VS的体系下，出了VS，可能是可以的）



## CLR

C++ CLI/CLR 是个非常特殊的存在，虽然工程默认给了你AssemblyInfo.cpp，内容如下：

```c++
#include "pch.h"

using namespace System;
using namespace System::Reflection;
using namespace System::Runtime::CompilerServices;
using namespace System::Runtime::InteropServices;
using namespace System::Security::Permissions;

[assembly:AssemblyTitleAttribute(L"test")];
[assembly:AssemblyDescriptionAttribute(L"test")];
[assembly:AssemblyConfigurationAttribute(L"")];
[assembly:AssemblyCompanyAttribute(L"test")];
[assembly:AssemblyProductAttribute(L"test")];
[assembly:AssemblyCopyrightAttribute(L"版权所有(c)  2021")];
[assembly:AssemblyTrademarkAttribute(L"")];
[assembly:AssemblyCultureAttribute(L"")];

[assembly:AssemblyVersionAttribute("1.0.*")];

//[assembly:AssemblyVersion("1.0.*")]
//[assembly:AssemblyFileVersion("1.0.*")]

[assembly:ComVisible(false)];

```

但是它并不能直接被用来生成dll的文件信息和版本信息，如果是c#，仅仅是下面的代码就足够自动生成版本号，自动+1了。

```
[assembly:AssemblyVersionAttribute("1.0.*")];
[assembly:AssemblyVersion("1.0.*")];
[assembly:AssemblyFileVersion("1.0.*")];
```

C++ CLI 这里基本就是个摆设，基本不能用，要增加版本信息还是得通过资源文件（这个AssemblyInfo.cpp的问题貌似已经快10年了都没解决）



#### 添加资源文件

![image-20210601101522451](https://i.loli.net/2021/06/01/pTltGEQWz7uinHA.png)

然后选择Version，新建

![image-20210601101603396](https://i.loli.net/2021/06/01/DgqbXPWZ2ueGMOj.png)

这样就得到了一个资源文件，在CLR中叫app.rc

```c++
// Microsoft Visual C++ generated resource script.
//
#include "resource.h"

#define APSTUDIO_READONLY_SYMBOLS
/////////////////////////////////////////////////////////////////////////////
//
// Generated from the TEXTINCLUDE 2 resource.
//
#include "afxres.h"

/////////////////////////////////////////////////////////////////////////////
#undef APSTUDIO_READONLY_SYMBOLS

/////////////////////////////////////////////////////////////////////////////
// 中文(简体，中国) resources

#if !defined(AFX_RESOURCE_DLL) || defined(AFX_TARG_CHS)
LANGUAGE LANG_CHINESE, SUBLANG_CHINESE_SIMPLIFIED

/////////////////////////////////////////////////////////////////////////////
//
// Icon
//

// Icon with lowest ID value placed first to ensure application icon
// remains consistent on all systems.
1                       ICON                    "app.ico"


#ifdef APSTUDIO_INVOKED
/////////////////////////////////////////////////////////////////////////////
//
// TEXTINCLUDE
//

1 TEXTINCLUDE 
BEGIN
    "resource.h\0"
    "\0"
END

2 TEXTINCLUDE 
BEGIN
    "#include ""afxres.h""\r\n"
    "\0"
END

3 TEXTINCLUDE 
BEGIN
    "\0"
END

#endif    // APSTUDIO_INVOKED


/////////////////////////////////////////////////////////////////////////////
//
// Version
//

VS_VERSION_INFO VERSIONINFO
 FILEVERSION 1,0,0,1
 PRODUCTVERSION 1,0,0,1
 FILEFLAGSMASK 0x3fL
#ifdef _DEBUG
 FILEFLAGS 0x1L
#else
 FILEFLAGS 0x0L
#endif
 FILEOS 0x40004L
 FILETYPE 0x2L
 FILESUBTYPE 0x0L
BEGIN
    BLOCK "StringFileInfo"
    BEGIN
        BLOCK "080404b0"
        BEGIN
            VALUE "CompanyName", "test"
            VALUE "FileDescription", "test"
            VALUE "FileVersion", "1.0.0.1"
            VALUE "InternalName", "test.dll"
            VALUE "LegalCopyright", "Copyright (C) 2021"
            VALUE "OriginalFilename", "test.dll"
            VALUE "ProductName", "test"
            VALUE "ProductVersion", "1.0.0.1"
        END
    END
    BLOCK "VarFileInfo"
    BEGIN
        VALUE "Translation", 0x804, 1200
    END
END

#endif    // 中文(简体，中国) resources
/////////////////////////////////////////////////////////////////////////////



```



不过这里要注意一下，如果是通过windows直接右键属性查看信息会有一些地方不一样，比如我上面的值设置为4下面设置为3，最终的结果是文件版本受上面的控制，而产品版本受下面的控制。

```
 FILEVERSION 1,0,0,4
 PRODUCTVERSION 1,0,0,4
            VALUE "FileVersion", "1.0.0.3"
            VALUE "ProductVersion", "1.0.0.3"
```

![image-20210601193640547](https://i.loli.net/2021/06/01/1qYLBmuJ8OlUTjC.png)

同时`FILEVERSION`和`PRODUCTVERSION`都必须是正规版本号的形式，也就是一定是`x,x,x,x`，而下面的key值，可以是任意字符串。



#### 自增版本号

简单说，自动生成的资源文件内容都写死了，而vs生成前事件也好，还是其他地方也好，都没有可以直接拿来用的方法。

一般来说有以下几种解决方案

- 安装vs插件，辅助完成
- 自写一个脚本bat或者python或者exe或者vbs script等等来完成版本号修改的操作
- 外部调用编译并且传入编译时的版本号，替代当前值

第一种过于依赖插件，不喜欢，无法保持大家同步。第三种需要外部调用，不熟悉而且跳出了本来简单的编译流程。

也就第二种算是用的最多的。

第二种也有很多种方式可以实现，我建议还是直接用bat，这样就算切换了环境也不至于无法使用，只要是windows就都能用。当然也能用shell脚本，这样linux下也能用，windows只要安装了git也能用。



```shell
if [[ $#=<0 ]]; then
	echo "command=>$0, no parameters"
	#exit 1
fi
echo $@


now=`date +'%Y-%m-%d %H:%M:%S'`
echo $now

now_seconds=$(date --date="$now" +%s);
echo $now_seconds

int1=$(($now_seconds%65536))
int2=$(($now_seconds/65536))
int3=$(($int2/65536))
int4=$(($int3/65536))

echo $int1,$int2,$int3,$int4

filepath=$1
echo filepath

git_commit_id=`git rev-parse --short HEAD`
echo $git_commit_id

# delte the old line
sed -i '/FILEVERSION/d' $filepath
# add git commit id as new version
sed -i '/VS_VERSION_INFO/a\ FILEVERSION '$int4,$int3,$int2,$int1 $filepath

# delte the old line
sed -i '/PRODUCTVERSION/d' $filepath
# add git commit id as new version
sed -i '/FILEVERSION/a\ PRODUCTVERSION '$int4,$int3,$int2,$int1 $filepath

# delte the old line
sed -i '/VALUE \"FileVersion\"/d' $filepath
# add git commit id as new version
sed -i '/VALUE \"FileDescription\"/a\            VALUE \"FileVersion\",  \"'$git_commit_id"\"" $filepath

# delte the old line
sed -i '/VALUE \"ProductVersion\"/d' $filepath
# add git commit id as new version
sed -i '/VALUE \"ProductName\"/a\            VALUE \"ProductVersion\",  \"'$git_commit_id"\"" $filepath

```

简单说`FILEVERSION`与`PRODUCTVERSION`我使用当前时间秒数作为版本号，所以上面有除65536的操作，因为实际上版本号一位是int16，不能超过这个数，这个版本号可以快速通过比大小来判定新旧。

而`FileVersion`和`ProductVersion`使用git commit id来作为最终的版本号，这样可以追溯编译版本。

![image-20210601200920441](https://i.loli.net/2021/06/01/nFAGw6QX5Iqcj8J.png)

最终结果如图所示，这样整个dll的自动版本控制就算完成了，在windows和linux下都可以正常工作。

剩下的就是在每次编译之前调用这个sh脚本，然后就能正常工作了。

不过这里有个小问题，就是每次编译后的版本号其实都是对应的已经提交的commit，如果没有提交的话，那就是错误的了。所以最好再跟一个sh脚本自动commit，并且自动tag，这样无论何时这个release都是可以追溯到的。



## app.rc bug

这个资源文件比较特殊，他不允许同时打开。

如果在解决方案里通过F7查看代码打开了，那么在资源视图里，他就直接报错了

![image-20210601104716842](https://i.loli.net/2021/06/01/hCBzGmYHVKyAcE6.png)

就必须先关闭之前的代码，然后点这个小三角不显示，再点一下显示，他才能正常。

![image-20210601105310552](https://i.loli.net/2021/06/01/Ox5PbMTd7N3yDEU.png)

还不仅如此，如果修改了version.h中的内容，但是这个资源中的VS_VERSION_INFO是不会更新的，就算你已经重编译了。

必须将文件关闭，并且切换到解决方案以后用F7查看代码-关闭文件-再切回资源视图，再打开，他的内容才会显示更新后的内容。当然实际上编译后的文件已经变了，但是VS里这个文件显示的却没变。



## Summary

脚本里用sed来写是真的麻烦，查了半天sed怎么用。如果是python或者其他语言可能几下就写好了，只是为了通用性选择了shell。



## Quote

> http://www.databaseforum.info/2/18/80484bd07754cf1e.html
>
> https://www.cnblogs.com/x-poior/p/7069689.html
>
> https://stackoverflow.com/questions/807999/is-assemblyinfo-cpp-necessary
>
> https://stackoverflow.com/questions/810827/lnk2022-metadata-operation-failed-driving-me-insane


---
layout:     post
title:      "Cython的坑"
subtitle:   "python，加密，混淆"
date:       2020-12-30
author:     "elmagnifico"
header-img: "img/bg6.jpg"
catalog:    true
tags:
    - maya
    - cython
    - python
---

## Foreword

之前的[文章](http://elmagnifico.tech/2017/12/01/Python-obfuscate/)写过了，我平常都是用下面的混淆来加密python代码，但是这种混淆总是可以被看到运行逻辑的，只是分析起来困难一点而已。

> https://pyob.oxyry.com/

pyob的混淆商业购买要1998刀，以前很便宜30刀的时候没买，现在没机会了。

所以基于这种不是很安全的python代码形式，我才用了cython来对纯python进行加密，但是国内对于cython的介绍也好，使用也好都比较简单，实际该怎么用没有非常详尽的指导，这里记录一下我的使用场景。



## Cython

> https://cython.org/

首先由于python本身是个动态语言，运行效率比较低，而又经常有一些从事科学计算或者需要大量计算的人需要做一些简单，但是比较需要效率的工作的时候，python无法满足，虽然python又各种科学计算的库，这个时候cython就站出来，表示我可以，其本质上是把纯python先是变成pyx，然后再编译成c/c++，最后变成动态链接库，经过这样的转换以后，效率提升从几倍到上百倍不等，非常可观。不过有一点，如果是纯python的提升，基本只有30%左右，如果可以把变量类型固定，在代码中加入各种明确性的条件或者标志，可以进一步提升效率。当然效率最高还是从c开始写起，最后编译成python的动态库。



同时，编译成动态库又有一个好处，就是原本python需要解释运行的明文代码，给隐藏起来了，这样就不会出现python难以商业化分发的问题了，而我这里主要是需要解决这个商业化分发的问题。



#### 不支持同名文件

Cython编译的时候，无法处理同名文件，比如下面的目录结构：

```
test
-test1
--test1.py
--test2.py
-test2
--test1.py
--test2.py

```

由于存在相同的文件名，就会导致在编译的时候module名称的入口函数名（入口函数名是init+module名）重复，最后导致同名文件只能打包一个pyd，要解决这个问题必须一个文件夹一个文件夹的编译



#### 不支持package

由于这个同名问题，本身就会导致package内可能出现同名module冲突的情况，而实际上python在识别package的时候靠的是

```
__init__.py
```

而这个文件，在每个python的package中都存在，那么自然就会遇到同名文件问题了。



#### 不支持原地生成

生成的时候基本都用这样的生成命令，之前我一直以为inplace是可以直接在源文件旁边生成pyd文件的，然而实际上不是，他是生成在执行该命令的目录下，也就是setup.py文件的同目录中，这样的话我就算可以打包，生成的pyd文件全都在同个目录下，这个打包就失去意义了

```
python setup.py build_ext --inplace
```



## 解决办法

实际上可以修改cython源码，解决入口函数的问题，从而可以解决这个重名问题，但是我本来也不熟这部分代码，就不想浪费时间。



为了实现能正常打包，并且不修改源码的情况下，我大概是按照下面的逻辑写了一个打包脚本

1. 每个package中init.py文件复制后删除
2. 每个package文件夹自动生成对应的setup.py，并且其内容自动对应到这个package的文件内容
3. 每个package文件自动进行编译，直到所有setup.py都被执行
4. 清理整个目录中生成的无用文件以及原始py文件
5. 恢复每个package中的init.py文件
6. 打包成zip进行发布



#### 打包脚本

```python
#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import re
import time
import shutil
import codecs
import zipfile
import sys
import os


def del_file(path_data):
    for i in os.listdir(path_data):
        file_data = path_data + "\\" + i
        print file_data
        if os.path.isfile(file_data) == True:
            os.system('Recycle.exe "' + file_data + "\"")
            # os.remove(file_data)
        else:
            os.system('Recycle.exe "' + file_data + "\"")
            # shutil.rmtree(file_data)

            
if __name__ == "__main__":

    curpath = ""
    if getattr(sys, 'frozen', False):
        curpath = os.path.dirname(sys.executable)
    elif __file__:
        curpath = os.path.dirname(__file__)
    print("curpath = %s" % curpath)

    output_file_path = curpath + "/Output_pyd"
    print output_file_path
    if os.path.exists(output_file_path):
        # os.system('Recycle.exe '+ output_file_path)
        del_file(output_file_path)
        # shutil.rmtree(output_file_path)
    else:
        os.makedirs(output_file_path)

    # clean the project
    print("clean pyc cache")
    os.system('del *.pyc /s')

    # set the file source
    soure_file_path = curpath + "/Test.py"
    print soure_file_path
    
    # new file with time stamp
    output_time = time.strftime('%Y-%m-%d %H%M%S', time.localtime(time.time()))

    print("copy all file")
    # copy the source file to the git repository
    shutil.copy(soure_file_path, output_file_path + "/Test.py")
    shutil.copytree(curpath + "/TestPackage", output_file_path + "/TestPackage")

    # remove the code template
    shutil.rmtree(output_file_path + "/TestPackage/package_template")

    setuppy_str_head = '''from distutils.core import setup
from Cython.Build import cythonize
setup(
    ext_modules = cythonize(['''
    setuppy_str_tail = '''])
    )'''

    print("remove unit_test and __init__.py")
    # remove no use file in cython
    for path, dirnames, filenames in os.walk(output_file_path + "/TestPackage"):
        # print path, dirnames, filenames
        fpath = path.replace(output_file_path, '')
        # print fpath

        path_files_str = ""
        for filename in filenames:
            # jump the uniit_test file
            print "--" + os.path.join(path, filename)
            if filename == 'unit_test.py' or filename == "__init__.py":
                # print "--"+os.path.join(path, filename)
                os.remove(os.path.join(path, filename))
                continue
            else:
                path_files_str += "'" + path.replace('\\', "/") + "/" + filename + "',"
                # path_files_str+="'"+os.path.join(path, filename)+"',"
                # path_files.append(os.path.join(path, filename))

        # create the setup.py in every package
        if len(path_files_str)==0:
            continue

        path_files_str = path_files_str[:-1]
        # print path_files_str
        # print setuppy_str_head+setuppy_str_tail
        print setuppy_str_head + path_files_str + setuppy_str_tail

        f = open(os.path.join(path, "setup.py"), "w")
        f.write(setuppy_str_head + path_files_str + setuppy_str_tail)
        f.close()

    print("generate setup.py and del no use files")
    for path, dirnames, filenames in os.walk(output_file_path + "/TestPackage"):
        fpath = path.replace(output_file_path, '')
        os.chdir(path)
        print path
        if "setup.py" in filenames:
            print filenames
            os.system("D:/Autodesk/Maya2017/bin/mayapy.exe setup.py build_ext --inplace")
            os.system('del *.py /s')
            os.system('del *.c /s')
            shutil.rmtree(path + "/build")
            f = open(path + "/__init__.py", "w")
            f.close()

    print "compile ok,start zip"
    z = zipfile.ZipFile(output_file_path+'/Dmd_UAVC_Version' + output_time + '.zip', 'w', zipfile.ZIP_DEFLATED)
    z.write(output_file_path + "/Test.py", "./Test.py")
    z.write(output_file_path + "/TestPackage", "./TestPackage")
    for path, dirnames, filenames in os.walk(output_file_path + "/Dmd_drama_editor_py"):
        print path
        fpath = path.replace(output_file_path, '')
        # print fpath
        for filename in filenames:
            # jump the uniit_test file
            print filename
            z.write(os.path.join(path, filename), os.path.join(fpath, filename))
    z.close()
    print "zip ok"

    print "Release package success"

```



这里面用的Recycle.exe是一个用来删除文件的exe，可以通过命令行直接调用，比os的remove好用一点，可以替换成对应的删除，主要通过Recycle.exe删除的文件会进回收站，而os和shutil删除的不进入回收站

```python
def del_file(path_data):
    for i in os.listdir(path_data):
        file_data = path_data + "\\" + i
        print file_data
        if os.path.isfile(file_data) == True:
            os.system('Recycle.exe "' + file_data + "\"")
            # os.remove(file_data)
        else:
            os.system('Recycle.exe "' + file_data + "\"")
            # shutil.rmtree(file_data)
```



#### 修改源码

如果要修改源码，重新编译Cython可以看下面的文章，写的很详细了

> https://paper.seebug.org/1139/



## Summary

大概就是这些，有变动再补充



## Quote

> https://paper.seebug.org/1139/


---
layout:     post
title:      "Python PDF to JPEG"
subtitle:   "Wand, PIL, PyPDF2"
date:       2017-07-31
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - python
---

## Foreword

需要截取多个PDF中一部分内容变成图片，本来代码就是现成的，奈何环境实在是太难搭了，记录一
下。

先说思路，首先是使用 PyPDF 截取需要的内容保存为新的 pdf 文件，然后使用 Wand 将新的 pdf
转换为 jpeg。

#### PyPDF2

PyPDF2
> In 2005, Mathieu Fenniak launched pyPdf "as a PDF toolkit ..." focused on
>
> At the end of 2011, after consultation with Mathieu and others, Phaseit sponsored PyPDF2 as a fork of pyPdf on GitHub. The initial impetus was to handle a wider range of input PDF instances; Phaseit's commercial work often encounters PDF instances "in the wild" that it needs to manage (mostly concatenate and paginate), but that deviate so much from PDF standards that pyPdf can't read them. PyPDF2 reads a considerably wider range of real-world PDF instances.
>
>Neither pyPdf nor PyPDF2 aims to be universal, that is, to provide all possible PDF-related functionality; here are descriptions of other PDF libraries, including Python-based ones. Note that the similar-appearing pyfpdf of Mariano Reingart is most comparable to ReportLab, in that both ReportLab and pyfpdf emphasize document generation. Interestingly enough, pyfpdf builds in a basic HTML->PDF converter; while PyPDF2 has no knowledge of HTML, HTML->PDF conversion is another interest of Phaseit's.
>
> http://pybrary.net/pyPdf/
> http://mstamy2.github.io/PyPDF2/

简单说 PyPDF 太老了，基本是十年前的代码了，一直没人维护，后来又有人需要，就接着之前作者
的代码继续维护了，从而有了 PyPDF2

###### 安装

不得不说 PyPdf2 的安装还是非常简单的，直接使用 pip 工具就可以了

    pip install PyPDF2

#### Wand

Wand 0.4.4

> Wand is a ctypes-based simple ImageMagick binding for Python, supporting 2.6, 2.7, 3.2--3.5, and PyPy. Currently, not all functionalities of MagickWand API are implemented in Wand yet.
>
> http://wand-py.org/

###### 安装

    pip install Wand

看起来，好像很简单的样子，但是多数时间都被坑在这里了

#### ImageMagick

首先，Wand 需要 ImageMagick 的支持，而当前 ImageMagick 已经是 7.x版本了

> Use ImageMagick® to create, edit, compose, or convert bitmap images. It can read and write images in a variety of formats (over 200) including PNG, JPEG, JPEG-2000, GIF, TIFF, DPX, EXR, WebP, Postscript, PDF, and SVG. Use ImageMagick to resize, flip, mirror, rotate, distort, shear and transform images, adjust image colors, apply various special effects, or draw text, lines, polygons, ellipses and Bézier curves.
>
> https://www.imagemagick.org/script/index.php

###### 安装

但是当前的Wand 不支持 7.x 版本的 ImageMagick ，所以需要安装一个 6.9 版本的

    Windows 32-bit
        ImageMagick-6.9.3-1-Q16-x86-dll.exe
    Windows 64-bit
        ImageMagick-6.9.3-1-Q16-x64-dll.exe

安装过程中，还需要勾选上 Install development headers and libraries for C and C++ ，
防止可能缺少的依赖库文件

除此以外还需要设置环境变量，在系统环境变量下添加如下

    MAGICK_HOME
    C:\Program Files\ImageMagick-6.9.3-Q16

其他环境看这里

> http://docs.wand-py.org/en/0.4.4/guide/install.html#

当这两样都完成了以后，大多数人都以为就可以了，其实并不行，我以为可以了调试了半天的代码，
就是各种库报错。

打开 cmd 然后随便调用一下

    convert --version
    Version: ImageMagick 6.9.2-1 Q16 x86_64 2017-08-08 http://www.imagemagick.org
    Copyright: Copyright (C) 1999-2015 ImageMagick Studio LLC
    License: http://www.imagemagick.org/script/license.php
    Features: Cipher DPC Modules
    Delegates (built-in): bzlib freetype gvc jng jpeg ltdl lzma png tiff xml zlib

发现结果都正确？调用下面的缩放图片

    convert -resize 200×100 src.jpg dest.jpg

结果也正确？，那就继续调用下面的命令，你就知道结果了

    convert -density 600 123.pdf -alpha off sample.png

直接报错，提示你没装 Ghostscript

#### Ghostscript

> an interpreter for the PostScript language and for PDF.
>
> https://www.ghostscript.com/download/gsdnld.html

###### 安装

下载 ghostscript 对应版本，然后安装，再运行上面的 pdf2png 就发现运行成功了

之所以能发现，全靠下面的博文

> http://www.jianshu.com/p/1754ad695377

只是随意看了一下 Mac 的安装过程，发现他竟然会安装 gs？？？ 然后调用了他的转换命令
直接就提示没有安装 ghostscript ，安装之后再一测试，直接成功，之前各种库函数出错的情况
全解决了

## SourceCode

```python
from PyPDF2.pdf import PdfFileReader, PdfFileWriter
from wand.image import Image
from wand.color import Color
from PIL import Image as im
import os

def pdf2jpg(source_file, target_file, dest_width, dest_height):
    RESOLUTION    = 200
    ret = True
    try:
        with Image(filename=source_file, resolution=(RESOLUTION, RESOLUTION)) as img:
            img.background_color = Color('white')
            img.format = 'jpeg'
            img.save(filename = target_file)
    except Exception as e:
        ret = False
        print(e)
    return ret

path = "./sourcepdf"
files= os.listdir(path)
for f in files:
     if not os.path.isdir(f):
        print(f)
        input1 = PdfFileReader(open(path+"/"+f, "rb"))
        output = PdfFileWriter()

        numPages = input1.getNumPages()
        print("document has %s pages." %(numPages))

        # cut the part we need
        for i in range(numPages):
            page = input1.getPage(i)
            print(page.mediaBox.getUpperRight_x(), page.mediaBox.getUpperRight_y())
            page.trimBox.lowerLeft = (0, 0)
            page.trimBox.upperRight = (125, 225)
            page.cropBox.lowerLeft = (100, 150)
            page.cropBox.upperRight = (180, 250)
            output.addPage(page)

        # save the part as new pdf then u can use pdf2jpg func
        outputStream = open(path+"_target_pdf/"+str(count)+".pdf", "wb")
        output.write(outputStream)
        outputStream.close()

        # pdf2jpg(source_file, target_file, dest_width, dest_height)

print("OK")
a = input()
```

## Summary

就这么几行代码，大部分时间都用在解决这个包的安装上了

## Quote

> http://www.jianshu.com/p/1754ad695377
>
> http://www.programcreek.com/python/example/82689/wand.image.Image
>
> https://nedbatchelder.com/blog/200712/extracting_jpgs_from_pdfs.html
>
> https://www.binpress.com/tutorial/manipulating-pdfs-with-python/167
>
> http://www.cnblogs.com/mengyu/p/6638975.html
>
> http://docs.wand-py.org/en/0.4.4/guide/install.html#install-imagemagick-on-windows
>
> http://blog.csdn.net/github_25679381/article/details/50907016

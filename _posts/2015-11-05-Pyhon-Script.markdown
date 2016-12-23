---
layout:     post
title:      "Python学习第三章（脚本）"
subtitle:   "optparse，脚本，subprocess，正则表达式"
date:       2015-11-05
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
tags:
    - python
    - 学习
    - 脚本
---

## 代码环境

System：Raspberry Pi 

IDE：IDLE3

需要：语言基础

## subprocess

在python中要与系统底层交互需要使用subprocess模块

### 简单调用

	import subprocess
	subprocess.call("ls")

就可以调用到bash命令了

### 信息分离处理
	
这里使用了Popen，就是通过管道的方式进行信息通信。

将命令的标准输出（正确的）、标准错误输出（发生错误）分开了，其实还有一个标准的输入stdin

从而针对不同的信息各自进行对应的处理，但是查过后，如果返回信息量过大，会出现一个管道堵塞的情况

这个是Popen的一个缺陷

	import subprocess
	p=subprocess.Popen(["cat","/proc/cpuinfo"],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
	text=p.stdout.read().decode()
	print(text)
	for line in text.splitlines():
	    if line[:9]=="processor":
	        print(line)
	text=p.stderr.read().decode()
	print(text)

## optparse

通过optparse 可以在调用py脚本的时候 附加上一些命令，就好像自己在用其他命令一样

这里通过parser 添加了-f --file 同时parser还自带了help 你只需要对应编辑其内容就可以了

	import subprocess
	from optparse import OptionParser
	parser=OptionParser()
	parser.add_option("-f","--file",dest="filename",help="The file to display")
	options,arguments=parser.parse_args()
	if options.filename:
	    p=subprocess.Popen(["cat",options.filename],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
	    text=p.stdout.read().decode()
	    error=p.stderr.read().decode()
	else:
	    test=""
	    error="Filename not got"
	if  len(error)>0:
	    print("error")
	else:
	    print(text)

## 正则表达式

这里导入了re 正则表达式模块，从而可以在命令中附加正则表达式从而达到搜索某特定信息内容

最后一行加入了正则表达式搜索：

如果没有正则就正常输入了

如果有正则表达式，则通过search找到匹配项，存入line输出

正则表达式搜索有两种，serch是从字符串任何位置匹配就输出

match则是从字符串头匹配，头匹配了才会输出

	import subprocess
	from optparse import OptionParser
	import re
	parser=OptionParser()
	parser.add_option("-f","--file",dest="filename",help="123")
	parser.add_option("-r","--regex",dest="regex",help="1234")
	options,arguments=parser.parse_args()
	if options.filename:
	    p=subprocess.Popen(["cat",options.filename],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
	    text=p.stdout.read().decode()
	    error=p.stderr.read().decode()
	else:
	    test=""
	    error="Filename not got"
	if  len(error)>0:
	    print("error")
	else:
		for line in text.splitlines():
			if not options.regex or (options.regex and re.search(options.regex,line)):
				print(line)	
通过调用：

	python3 程序文件名.py -f /var/log/syslog -r "synergy"

可以查找到所有关于synergy的信息，如果没有就返回空了

### 正则表达式特性

- [^abc]除了abc以外的字符
- [a-c]a到c的字符
- a{x,y}a连续出现x次到y次的
- [ab]*所有ab的组合
- a+ 所有a连续出现的情况
- .*所有字符
- .+所有非空行
- a？所有有a或者无a的情况

### 正则表达式转义字符

|转义字符|说明|
| ---|:---:| 
| \n | 换行 |
| \t | 制表符 | 
| \d | 任意数字 |
| \D | 任意非数字字符 |
| \s | 任意空白符 | 
| \w | 字母/数字/下划线/汉字 | 
| \W | 上面的取补集 |
| \  | 转义有特殊定义的字符 |


## 文件读写

通过打开myfile文件，然后写入abcde 每写一个加一个换行符

然后通过读取这个文件，输出 

	- mode -w清空并写入，-a追加到文件尾写入
	with open("myfile.txt",mode="w",encoding="utf-8") as file_a:
		for letter in "abcde":
			file_a.write(letter+"\n")
	with open("myfile.txt",encoding="utf-8") as file_a:
		for line in file_a:
			print(line.strip())


## The end

这一章只学习Python的脚本部分

日后有空将各种用到的脚本写到这里，作为记录

## Quote

>http://shelly-kuang.iteye.com/blog/797713

>http://blog.chinaunix.net/uid-14833587-id-76547.html

>http://blog.csdn.net/menglei8625/article/details/7494094


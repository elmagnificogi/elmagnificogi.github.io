---
layout:     post
title:      "C++中坑人的fstream(二)"
subtitle:   "c/c++，fstream"
date:       2017-02-18
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - C++
---

#### 编译环境

Visual Studio 2013

标准C++控制台程序


## 我的问题

紧接着上一篇,在这里发出我遇到的问题

```cpp
#include "stdafx.h"

#include <iostream>
#include <fstream>
#include <string>

using namespace std;

int _tmain(int argc, _TCHAR* argv[])
{

	fstream file1, file2;
	file1.open("out.txt", ios::in | ios::out);
	file2.open("out1.txt", ios::in | ios::out);
	string s[10];
	string content = "34";
	unsigned char c;
	file1.seekg(0, ios::end);       
	streampos sp = file1.tellg(); 
	int filesize = sp;//获取最后一个字符位置
	cout << "当前文件大小:" << sp << endl;

	file1.seekg(0, ios::end);//移动写指针到文件尾部
	file1 << content;//增加内容;

	file1.seekg(0, ios::end);       
	sp = file1.tellg(); 
	int nfilesize = sp;//扩展后文件大小
	cout << "扩展后文件大小:" << sp << endl;

	while (filesize!=0)
	{
		file1.clear();
		file1.seekg(filesize-1, ios::beg);//读指针跳转到原文件尾部之前的字节
		//读取原最后一个字节
		c = file1.get();
		cout << c << endl;

		file1.clear();
		file1.seekp(nfilesize-1, ios::beg);//移动写指针到文件尾部
		file1.put(c);
		nfilesize--;
		filesize--;
	}
	file1.close();
	system("pause");
	return 0;
}

```

原文件out.txt的内容是:

	1
	2

对应的二进制是:

	31 0d 0a 32

增加内容之后变成:

	31 0d 0a 32 33 34

使用上面代码移动之后:

	31 0d 31 0d 0a 0a

正确结果应该是:

	31 0d 31 0d 0a 32

而程序了正常输出的字符是正确的最后一个是2,但是写入的时候就出现了2被替换成了0a

为了防止是尾部的异常情况,我把这里改成前一个字符保留尾部的4

	file1.seekp(nfilesize-2, ios::beg);//移动写指针到文件尾部

其结果依然是这样

	31 31 0d 0a 0a 34

2被莫名其妙的原因替换成了0a

## Debug

既然写回原文件有问题,那么测试直接写入新文件中.

新文件结果:

	32 0d 0a 0d 0a 31

实际上读取的字节是:

	32 0a 0a 31

#### 猜测

为什么会出现两次0a,我猜测是读取文件函数.get()导致的,当读第一次的时候读到了0a,正常输出

第二次读到0d的时候 get函数私自把0d替换成了0a,进而读取的时候出现了两个0a

输出的时候:

由于txt文件0a必须和0d一起出现,所以就导致了,自动补齐0d的情况,进而出现了两个换行符

那么就是get的问题了.我换而使用>>流操作符

使用流操作符,第一次没注意忽略回车等问题,直接就没有输出任何0a或0d的情况

	file1 >> noskipws;//设置不忽略空格等
	file1 >> c;

设置不忽略回车之后,显示的读取结果和上面是一样

	32 0a 0a 31

基于流操作符也会这样,我感觉如果用文本操作,这种情况基本无法避免,只能手动写在代码里每2个0a屏蔽掉一个.

#### Bug?

基于上面的猜测,我好像明白了为什么会出现2写入后却被0a代替的情况了.

	31 0d 0a 32 33 34 增大后的文件
	31 0d 0a 32 33 32 第一次写入32
	31 0d 0a 32 0a 32 第二次写入0a
	31 0d 0a 32 0d 0a 32 第二次写入0a后自动修改
	31 0d 0a 0a 0d 0a 32 第三次写入0a
	31 0d 0a 0d 0a 0d 0a 32 第三次写入0a后自动修改
	31 0d 31 0d 0a 0d 0a 32第四次写入31

这时由于0a不能单独出现必然绑定了0d的情况,这个文件会自动扩展

	31 0d 31 0d 0a 0d 0a 32 自动扩展
	                 |文件结束位置 
	31 0d 31 0d 0a 0d 进而得到这样的结果

由此可见为了防止文件尾部溢出,文件会自动截断,从而把后面的0d 32丢掉了,进而出错.

(这样虽然没有得到上面的出错结果,最后一位不同,但是已经是能找到的错误原因了,至于之前为什么得到的是31 0d 31 0d 0a 0a

这个太诡异了,测试不出来,上面的自动修改的结果都是在单步测试中可以观察到的)


#### 0a屏蔽代码

如果遇到了换行符,那么原文件内容位置朝前移动两个单位,写指针位置也是朝前移动两个单位,然后再写入0a,即会自动填入0d 0a

```cpp
if (c == 0x0a)
{
	filesize -= 2;
	file1.seekp(nfilesize - 2, ios::beg);//移动写指针到文件尾部
	file1.put(0x0a);
	nfilesize -= 2;
	file1.sync();
	continue;
}
```

## 完整平移源代码

下面代码,会对out.txt之类的文本文件的第10行插入catalog:    true,而其他内容完整平移.

```cpp
#include "stdafx.h"
#include <iostream>
#include <fstream>
#include <string>

using namespace std;

int _tmain(int argc, _TCHAR* argv[])
{

	fstream file1;
	file1.open("out.txt", ios::in | ios::out);
	string s[10];
	string content = "catalog:    true\n";
	unsigned char c;

	//首先获得文件的大小
	file1.seekg(0, ios::end);
	streampos sp = file1.tellg();
	int filesize = sp;//文件大小
	//cout <<"当前文件大小:"<< sp << endl;

	//文件尾部添加新内容,扩大文件
	file1.seekg(0, ios::end);
	file1 << content;

	//获取新文件大小
	file1.seekg(0, ios::end);
	sp = file1.tellg();
	int nfilesize = sp;
	//cout << "扩展后文件大小:" << sp << endl;

	//保存前10行内容
	file1.seekg(0, ios::beg);
	for (int i = 0; i < 10; i++)
	{
		getline(file1, s[i]);
	}

	//平移文件内容
	while (filesize != 0)
	{
		//读原文件尾部的字节
		file1.clear();
		file1.seekg(filesize - 1, ios::beg);
		c=file1.get();
		//cout <<c << endl;

		//屏蔽换行符
		if (c == 0x0a)
		{
			//超前一个位置写入换行符
			filesize -= 2;
			file1.seekp(nfilesize - 2, ios::beg);
			file1.put(0x0a);
			nfilesize -= 2;
			file1.sync();
			file1.clear();
			continue;
		}

		//将c的内容写入新文件尾部
		file1.clear(); 
		file1.seekp(nfilesize - 1, ios::beg);
		file1.put(c);
		file1.sync();

		//修改位置
		filesize--;
		nfilesize--;
	}

	//写指针移动到文件头
	file1.seekp(0, ios::beg);

	//用新的11行覆盖原来的内容
	//先覆盖了前9行不变的内容
	for (int i = 0; i < 9; i++)
	{
		file1 << s[i]+"\n"; cout << s[i] << endl;
	}

	//添加新内容进去
	file1 << content;

	//添加老内容进去
	file1 << s[9] + "\n";

	//到这里完成了插入新行.
	file1.close();
	return 0;
}
```

## 总结

利用文本的方式做平移,确实是太吃饱了撑着了,且不说被这个问题卡了两天,但是这里面确实是有很多东西没有注意到的.

而且用fstream的人本来就不多,更不用说还用文本方式来读写文件,更少了,只能是玩玩而已.

想要做到指定行,指定列或者是某个规律位置置入内容,其实用fstream二进制读写的方式或者是直接用c的读写API等等都比这个效果要好.

## Quote

> http://www.cplusplus.com/reference/fstream/fstream/
> 
> http://www.cplusplus.com/reference/ios/ios/clear/
> 
> http://www.cplusplus.com/reference/ios/ios/fail/
> 
> http://stackoverflow.com/questions/22984956/tellg-function-give-wrong-size-of-file
> 
> https://segmentfault.com/q/1010000004040190
> 
> http://pnig0s1992.blog.51cto.com/393390/563152
> 
> http://ask.csdn.net/questions/225582
> 
> http://bbs.csdn.net/topics/360156447
> 
> http://blog.csdn.net/kingstar158/article/details/6859379
> 
> http://qimo601.iteye.com/blog/1569230
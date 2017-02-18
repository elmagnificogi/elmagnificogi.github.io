---
layout:     post
title:      "C++中坑人的fstream"
subtitle:   "c/c++，fstream"
date:       2017-02-17
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - C++
---

#### 编译环境

Visual Studio 2013

标准C++控制台程序


## 起因

我只是想写一个简单,可以往已有文本文件中添加一行内容而已.

比如:

往所有的markdown文件中添加"catalog:    true"使老的文章中也能自动出现侧面目录栏

	---
	layout:     post
	title:      "C++中坑人的fstream"
	subtitle:   "c/c++，fstream"
	date:       2017-02-17
	author:     "elmagnifico"
	header-img: "img/python-head-bg.png"
	catalog:    true
	tags:
	    - C++
	---

看起来很简单的操作.

#### 思路

最简单的想法:逐行读取,然后输出到一个新文件中,在第10行位置上加入目录栏,把剩余内容也转移一遍.最后删除源文件,重命名新文件.

这么做是最好想的了,但是呢只为了这么一行内容,要新建一个文件,然后转移,感觉太浪费了.

那么我想的就是:

1. 先扩大文件,然后把文件在第二个"---"以下的内容,整体后移sizeof("catalog:    true")个单位.

2. 在第二个"---"的位置上覆盖输入"catalog:    true",这样就没有复制文件的情况下完成了.

这次打算直接用C++的fstream类来完成,原因无他,就是需要同时进行读写操作.

整体平移的思路也很简单:

1. 在扩大文件之前,记录下原文件尾的位置
2. 扩大文件,再记录下新文件的尾的位置.
3. 利用输入输出流函数,直接将原文件从尾部一字节一字节移动到新尾部即可.

思路很简单,然而实际写完整个流程以后,不管怎么调试都会出现意外的错误,读取没问题,但是读取完之后写入的时候就出现了各种没写入的情况.

除了没写入,文件尾的判断eof()也出现各种奇怪问题,甚至越界.

## 别人的问题

查了半天,看到了一个别人的问题,也出现了类似的情况.

	out.txt文件内容(前后都无回车空格),原问题里数据长度不一样,为了防止意外,我弄成一样了
	12345678
	12344111
	41422334

程序目的很简单,就是把文件中每行的4用A替换了

```cpp
#include "stdafx.h"
#include<iostream>
#include<fstream>
using namespace std;

int _tmain(int argc, _TCHAR* argv[])
{
	fstream fio("out.txt", ios::in | ios::out);
	//事先建好了文件
	if (fio.fail())
	{
		cout << "error!" << endl;
	}
	char a[20];
	int i;
	while (1)
	{
		if (fio.eof())
			break;
		int pos1 = fio.tellg();//获取读前文件指针位置
		fio.getline(a, 20, '\n');
		int pos2 = fio.tellg();//获取读后文件指针位置
		cout << a << endl;//显示获取内容
		for (i = 0; a[i] != '\0'; ++i)
		{
			if ('4' == a[i])//替换
			{
				a[i] = 'A';
			}
		}
		//fio.clear();
		fio.seekp(pos1);//修改写入指针位置
		fio << a << '\n';//替换原内容
		//fio.flush();
		//fio.sync();
		//fio.seekg(pos2);
	}
	fio.close();
	system("pause");
	return 0;
}
```

## 看明白fstream

首先fstream是既可以控制文件的输入也能控制文件的输出

	ios::in | ios::out  

设置了文件读写模式

	.eof()

用于判断是否到文件尾,文件尾返回true,非文件尾false

	.tellg()

返回当前文件读取位置

	.seekp()

	第二参数:
	ios::beg 文件开始位置,绝对0
	ios::end 文件尾
	ios::cur 当前位置

单参数是设置文件绝对的写位置,双参数则是相对于参考位置偏移多少,第二参数是参考位置

	.clear()

重置错误或者文件尾.打开失败等标记位

	.sync()

用于同步写操作,这里需要先了解到fstream的写与读都是将硬盘文件先拉入内存的缓冲区中,然后读写的都是缓冲区部分.

而通过sync()就可以强制同步内存与硬盘的文件内容,相当于变相强制写入文件.

	.seekg()

	第二参数:
	ios::beg 文件开始位置,绝对0
	ios::end 文件尾
	ios::cur 当前位置

单参数是设置文件绝对的读位置,双参数则是相对于参考位置偏移多少,第二参数是参考位置

	.getline(a, 20, '\n');

获取文件流一行的内容,输入到a中,获取最大长度为20字节,若文件遇到'\n'也就是换行符提前结束.

每次读取或者写入,都会自动修改文件的读或写位置,使其移动到本次操作内容的后一位上.


有了上面的函数解释就能明白原程序的思路:

1. 打开文件,打开失败报错
2. 遇到文件尾退出循环
3. 读取文件前,先保存当前读取位置
4. 读取一行内容,再次保存读取后的文件位置.显示读到的内容
5. 遍历数组,用A替换4
6. 修改写入指针为读取前的位置,写入替换后的内容

按道理说这样就可以了,写位置和读位置应该是分开的各不干扰,当到达最大读位置的时候eof应该判断为true,然后结束循环(这都是以我的理解为基础的)

## Bug?

而然实际上,第一次读取,写入以后,再次读取,再次写入后,就会出现问题:

	12345678    123A5678   123A5678
	12344111 -> 12344111-> 123AA111
	41422334    41422334   41422334

无法读取到第三行的内容,每次读取到的都是第二次写入的内容,以此重复,甚至超出了文件长度也无法触发eof.

换而言之,这里出现了程序把第二次写入的内容当作了第三行的内容.

而从单步测试中每次pos1的位置来看,每次都是正确的位置,但是读的内容却不正确

我猜想应该是先读后写在缓冲区里产生了错位的问题,导致每次读取错误.

那么这里就可以用强制读写每次来同步缓冲区的内容.

	.sync()

使用了sync之后,出现下面的结果
	
	123A5678
	123AA111
	41422334

单步测试的结果显示,正常读了3行,正常写了2行,甚至从程序执行来看,第三行的覆盖写也执行了.

然而最后的结果确是第三行没正常写入进去,可喜的是这次读到文件尾是正确判断出来了.

而第三行与其他行的写入有什么区别呢?

只有一个,第三行写入的时候,由于读到了文件尾,所以触发了eof,eof被置位了,还有什么其他相关的吗?这我并不知道.

为了测试是否有可能是因为什么被置位的情况

这里使用

	.clear()

来重置位.

结果是可喜的,第三行被正确输入进去,但是由于eof被重置了导致循环无法结束,成为了死循环.

先来观察clear函数清除了什么位,然后逐一测试,看是什么位出错了.

	goodbit	No errors (zero value iostate)          无错位	
	eofbit	End-of-File reached on input operation	读取到文件尾位
	failbit	Logical error on i/o operation	        i/o操作失败位,有可能是文件未打开
	badbit	Read/writing error on i/o operation		读写错误位.

> Reaching the End-of-File sets the eofbit. But note that operations that reach the End-of-File may also set the failbit if this makes them fail (thus setting both eofbit and failbit).

通过测试和查clear相关位得到了上面的解释,当到达文件尾的时候,会同时使得eofbit和failbit同时置位,从而出现了读写错误,那么之后读写操作不被认可.

#### 解决BUG

```cpp
	if (fio.eof())
	{
		fio.clear();
		fio.seekp(pos1);//修改写入指针位置
		fio << a;//替换原内容
		break;
	}
```

那么在最后判断的时候判断一下eof,然后重置位,写入内容后再跳出循环,那么就解决了这个问题.

## 待解决

然而别人的问题解决了,我自己的却并没有.

使用fstream文本方式读txt换行位置时会出现读出2个换行符,而不是0x0d 0x0a两个字符,这个很奇怪.

使用文本方式读写文件,在原位置上部位内容往后平移若干个单位非常麻烦,如果只有一行内容不会有问题.

只要出现换行位置就会出现奇怪的现象,还没想好怎么处理换行问题.

## fstream的小细节

#### 文本文件与二进制文件

文本文件类似于txt或者什么其他的以可读形式显示的文本,然而由于windows和linux平台的不同,其中换行符在两个平台中显示不同.

- UNIX格式，每行的行尾都是用一个0x0a字符（换行字符LF）表示

- WINDOWS/DOS下每行的行尾都是用0x0d 0x0a两个字符（回车字符CR，换行字符LF）表示的
 
- MAC机，每行的行尾都是0x0d字符表示，即回车字符CR。

二进制文件顾名思义完全不考虑文件字符所表示内容,相当于内存中存储是什么样,操作起来就是什么样的.

对于fstream来说操作文本文件与二进制文件完全是不同的操作函数,不能相互使用,用了会产生一些奇怪的情况.

##### 读写二进制文件使用

	write ( char * buffer, streamsize size )
	read  ( char * buffer, streamsize size )

##### 读写文本文件使用

	getline (char* s, streamsize n );
	getline (char* s, streamsize n, char delim );	
	get (char& c);	
	get (char* s, streamsize n);
	get (char* s, streamsize n, char delim);	
	get (streambuf& sb);
	get (streambuf& sb, char delim);
	<<()
	>>()

#### 获取文件大小

	file1.seekg(0, ios::end);     //基地址为文件结束处，偏移地址为0，于是指针定位在文件结束处
	streampos sp = file1.tellg(); //sp为定位指针，因为它在文件结束处，所以也就是文件的大小
	cout <<"当前文件大小:"<< sp << endl;

> tellg does not report the size of the file, nor the offset from the beginning in bytes. It reports a token value which can later be used to seek to the same place, and nothing more. (It's not even guaranteed that you can convert the type to an integral type.)

所以这里用tellg得到的不一定是文件大小,虽然我自己验证的时候,和文件大小一样.

正确得到文件大小应该按下面的这个来.

	file.ignore( std::numeric_limits<std::streamsize>::max() );
	std::streamsize length = file.gcount();
	file.clear();   //  Since ignore will have set eof.
	file.seekg( 0, std::ios_base::beg );

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
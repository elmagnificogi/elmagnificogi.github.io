---
layout:     post
title:      "C++中Enum与array的最后一个逗号"
subtitle:   "c/c++，enum,array,comma"
date:       2017-03-13
author:     "elmagnifico"
header-img: "img/python-head-bg.png"
catalog:    true
tags:
    - C++
---

#### 编译环境

Visual Studio 2013

标准C++控制台程序

Keil 5 STM32F407 C++工程

## 编译没报错？？

在检查飞控工程的时候，在usb程序里的头文件，突然发现竟然有enum类型，最后多了一个逗号，竟然还通过了编译没报错，搞得我还以为是keil的bug

```cpp
typedef enum 
{
  HC_IDLE = 0,
  HC_XFRC,
  HC_HALTED,
  HC_NAK,
  HC_NYET,
  HC_STALL,
  HC_XACTERR,  
  HC_BBLERR,   
  HC_DATATGLERR,  
}HC_STATUS;
```

## 单独测试

还单独拿VS测试了一下，发现竟然没有错。

```cpp
#include "stdafx.h"
#include<iostream>
using namespace System;
using namespace std;
typedef enum {
	HC_IDLE = 0,
	HC_XFRC,
	HC_HALTED,
	HC_NAK,
	HC_NYET,
	HC_STALL,
	HC_XACTERR,
	HC_BBLERR,
	HC_DATATGLERR,
}HC_STATUS;

int main(array<System::String ^> ^args)
{
	HC_STATUS a; 
	int b[] = { 1, 2, 3, 4, 5, };
	cout <<a<< endl;
	cout <<b[4]<< endl;
	system("pause");
    return 0;
}
```

## C99的enum标准

再一查，除了这种方式，连数组初始化的时候多一个逗号也不会报错。

在C99的标准里，就有对于enum的规定

	enum-specifier:
	    enum identifieropt { enumerator-list }
	    enum identifieropt { enumerator-list , }
	    enum identifier
	enumerator-list:
	    enumerator
	    enumerator-list , enumerator
	enumerator:
	    enumeration-constant
	    enumeration-constant = constant-expression


## 总结

> 关于这个逗号的问题其实有比较深层次考虑，在标准C#书写规范中沿袭C++规范最后一个枚举都要求不写最后一个逗号，但是所有C#编译器，对于序列语法（枚举，初始化序列等）的统一处理为都不检查最后一项是否存在逗号，这是由于DOM中存在代码自动生成相关语法，如果强制要求最后一项没有逗号则会在序列语法检查逻辑中出现独特的对最后一项的处理逻辑，这就是为什么所有的C#编译器都不会检查枚举最后一项是否有逗号，其实就是为了自动生成代码不出错和处理方便，我觉得这是一种语法上的进步！

当然，从一开始受到的编程规范我的感觉就是最后一项都不写逗号的，自然而然感觉最后一个有逗号是错误的。

enum类型最后带一个逗号，其实好处比较多。

这样你如果对enum类型有更改，添加的时候，只需要继续添加一个新行，或者删除某一行，而无须在意是否上一行有逗号这个问题。

很多语言和编译器都对enum多一个逗号编译都是可以正常通过的，所以以后enum类型我的写法都会带最后一个逗号。

## Quote

> https://my.oschina.net/orion/blog/41249?catalog=70564
> 
> http://stackoverflow.com/questions/3850203/java-array-initialization-list-ending-with-a-comma
> 
> http://stackoverflow.com/questions/792753/is-the-last-comma-in-c-enum-required
> 
> http://blog.csdn.net/whl0070179/article/details/22873839


---
layout:     post
title:      "rapidjson helper"
subtitle:   "对象序列化与反序列化"
date:       2020-11-13
author:     "elmagnifico"
header-img: "img/bg3.jpg"
catalog:    true
tags:
    - C++
    - JSON
---

## Foreword

有感于之前的rapidjson实在是太难用了，这个api接口要写非常多的代码，比起python和java的json实在是太难了



比如下面的代码里，如果嵌套了多层，每次必须要有EndObject或者EndArray，相当于手写一个json，逻辑是简单了，但是嵌套多了以后保不齐哪里忘记了一个两个，写了非常多无意义的代码。最好能整体优化一下，

```c++
	rapidjson::StringBuffer buf;
	//rapidjson::Writer<rapidjson::StringBuffer> writer(buf);
	rapidjson::PrettyWriter<rapidjson::StringBuffer> writer(buf); // it can word wrap

	writer.StartObject();

	writer.Key("agadg"); writer.String("spring");
	writer.Key("sfgh"); writer.String("北京");
	writer.Key("data"); 

	writer.StartArray();
	for (unsigned int index = 0; index < objs_lambert.length(); index++)
	{
		writer.StartObject();
		writer.Key("agds"); writer.Int(index);
		writer.Key("adsg"); writer.String("北京");
		writer.Key("asdaf"); writer.String("北京");
		writer.Key("asdg"); writer.String("北京");

		writer.Key("pos");
		writer.StartArray();
		for (unsigned int index2 = 0; index2 < poss[index].length(); index2++)
		{
			writer.StartObject();
			writer.Key("x"); writer.Double(poss[index][index2].x);
			writer.Key("y"); writer.Double(poss[index][index2].y);
			writer.Key("z"); writer.Double(poss[index][index2].z);
			writer.EndObject();
		}
		writer.EndArray();

		writer.Key("lgiht");
		writer.StartArray();
		for (unsigned int index2 = 0; index2 < lights[index].length(); index2++)
		{
			writer.StartObject();
			writer.Key("r"); writer.Double(lights[index][index2].r);
			writer.Key("g"); writer.Double(lights[index][index2].g);
			writer.Key("b"); writer.Double(lights[index][index2].b);
			writer.EndObject();
		}
		writer.EndArray();

		writer.EndObject();
	}
	writer.EndArray();
	writer.EndObject();

```



## RapidjsonHelper

```
https://blog.csdn.net/lightspear/article/details/54836656
```

原帖如上，他写了一个C++ rapidjson 对类序列化的封装，下载地址在下面，但是这个csdn要的积分非常多，我重新修改以后转了一份github的版本

```
https://download.csdn.net/detail/lightspear/9746091
```

接下来分析一下源码，直接从这里copy也行，不过工程要自己组织一下



#### 源码分析

主要是这两个文件起作用，可以看一下具体的实现

###### RapidjsonHelper.h

```c++

#ifndef  PB_UTILSRAPIDJSON
#define PB_UTILSRAPIDJSON

#include <iostream>
#include <vector>
#include <list>
#include <functional>
#include <algorithm>
#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"

#define ARRAY_SIZE(a) (sizeof(a)/sizeof(a[0]))

#define RapidjsonWriteBegin(writer) {writer.StartObject();
#define RapidjsonWriteEnd()   writer.EndObject();}
/*
前面这一部分就是用宏封装writer的操作或者各种数据类型
如果有没有覆盖的数据类型，也是在这里添加就行了
这部分宏主要是给基类用的，用于简化书写,和java那种直接注解带来的便利还是有区别的
*/
#define RapidjsonWriteString(XXX) writer.Key(#XXX);writer.String(XXX.data());
#define RapidjsonWriteChar(XXX) writer.Key(#XXX);writer.String(XXX,strlen(XXX));
#define RapidjsonWriteInt(XXX) writer.Key(#XXX);writer.Int(XXX);
#define RapidjsonWriteInt64(XXX) writer.Key(#XXX);writer.Int64(XXX);
//这里有个笔误 原来写的是UInt
#define RapidjsonWriteUInt(XXX) writer.Key(#XXX);writer.Uint(XXX);
#define RapidjsonWriteUint64(XXX) writer.Key(#XXX);writer.Uint64(XXX);
#define RapidjsonWriteDouble(XXX) writer.Key(#XXX);writer.Double(XXX);
#define RapidjsonWriteClass(XXX) writer.Key(#XXX);((JsonBase*)(&XXX))->ToWrite(writer);	

#define RapidjsonParseBegin(val) for (Value::ConstMemberIterator itr = val.MemberBegin(); itr != val.MemberEnd(); ++itr){
#define RapidjsonParseEnd()  }
#define RapidjsonParseToString(XXX) if (strcmp(itr->name.GetString(), #XXX) == 0)XXX = itr->value.GetString();
#define RapidjsonParseToInt(XXX) if (strcmp(itr->name.GetString(), #XXX) == 0)XXX = itr->value.GetInt();
#define RapidjsonParseToInt64(XXX) if (strcmp(itr->name.GetString(), #XXX) == 0)XXX = itr->value.GetInt64();
#define RapidjsonParseToUInt(XXX)  if (strcmp(itr->name.GetString(), #XXX) == 0)XXX = itr->value.GetUint();
#define RapidjsonParseToUint64(XXX) if (strcmp(itr->name.GetString(), #XXX) == 0)XXX = itr->value.GetUint64();
#define RapidjsonParseToDouble(XXX) if (strcmp(itr->name.GetString(),#XXX) == 0)XXX = itr->value.GetDouble();
#define RapidjsonParseToClass(XXX)if (strcmp(itr->name.GetString(), #XXX) == 0)((JsonBase*)(&XXX))->ParseJson(itr->value);
#define RapidjsonParseToChar(XXX)if (strcmp(itr->name.GetString(), #XXX) == 0)\
{\
	int size = ARRAY_SIZE(XXX);\
	const char *s = itr->value.GetString();\
	int len = strlen(s);\
	strncpy(XXX, s, std::min(size, len));\
}\


namespace PBLIB
{
	namespace RapidJsonHelper
	{
		using namespace rapidjson;
		/*
		这里是需要序列化或者反序列化类的基类
		*/
		class JsonBase
		{
		public:

			JsonBase() {}
			~JsonBase() {}

			std::string ToJson();
			static void FromJson(JsonBase *p, const std::string &json);

		protected:
            /*
            用了一个模板类来处理各种类的数据，其他基础数据可以通过下面的重载函数完成对应的类型的转换
            */
			template<typename T>
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, T &val) {
				JsonBase *p = &val;
				p->ToWrite(writer);
			}
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, int32_t &val);
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, int64_t &val);
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, uint32_t &val);
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, uint64_t &val);
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, double &val);
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, bool &val);
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, std::string &val);
			static	void ToWriteEvery(Writer<StringBuffer>  &writer, char * val);

			// 同理解析
			template<typename T>
			static	void ToParseEvery(const Value &val, T &t)
			{
				JsonBase *p = &t;
				p->ParseJson(val);
			}

			static	void ToParseEvery(const Value &val, int32_t &t);
			static	void ToParseEvery(const Value &val, int64_t &t);
			static	void ToParseEvery(const Value &val, uint32_t &t);
			static	void ToParseEvery(const Value &val, uint64_t &t);
			static	void ToParseEvery(const Value &val, double &t);
			static	void ToParseEvery(const Value &val, bool &t);
			static	void ToParseEvery(const Value &val, std::string &t);
			static	void ToParseEvery(const Value &val, char t[]);

		public:
            // 这两个接口是留给具体的业务类去实现序列化和反序列化的细节的
			virtual void ToWrite(Writer<StringBuffer>  &writer);
			virtual void ParseJson(const Value& val);
		};

        // 这里是写了一个数组，用来处理list的
		template<typename T>
		class JsonArray :public JsonBase
		{
		public:
			// 这里原本用的list 但是我喜欢下标访问 所以换成了vector
			std::vector<T> arr;
			JsonArray() {}
			~JsonArray() {}

		public:
            
            // 追加了几个操作，可以把这个直接当成队列来用
            void append(T t)
            {
                internalArray.push_back(t);
            }
			
            // 返回大小
            size_t len()
            {
                return internalArray.size();
            }
			
            // 重载[]运算符
            T& operator[](size_t index)
            {
                if( index > internalArray.size() )
                {
                    cerr << "索引超过最大值" <<endl; 
                    // 返回第一个元素
                    return internalArray.front();
                }
                return internalArray[index];
            }

            virtual void ToWrite(Writer<StringBuffer>  &writer)
            {
                writer.StartArray();
                for each (T ent in internalArray)
                {
                    ToWriteEvery(writer, ent);
                }
                writer.EndArray();
            }

            virtual void ParseJson(const Value& val)
            {
                SizeType len = val.Size();
                for (SizeType i = 0; i < len; i++)
                {
                    const Value &f = val[i];
                    T t;
                    ToParseEvery(f, t);
                    internalArray.push_back(t);
                }
            }
		};
	}
}


#endif
```



###### RapidjsonHelper.cpp

```c++
#include "RapidjsonHelper.h"


namespace PBLIB
{
	namespace RapidJsonHelper
	{
		using namespace rapidjson;
		// 这里就是具体的实现了，比较简单
		void JsonBase::ToWriteEvery(Writer<StringBuffer>  &writer, int32_t &val)
		{
			writer.Int(val);
		}
		void JsonBase::ToWriteEvery(Writer<StringBuffer>  &writer, int64_t &val)
		{
			writer.Int64(val);
		}
		void JsonBase::ToWriteEvery(Writer<StringBuffer>  &writer, uint32_t &val)
		{
			writer.Uint(val);
		}
		void JsonBase::ToWriteEvery(Writer<StringBuffer>  &writer, uint64_t &val)
		{
			writer.Uint64(val);
		}
		void JsonBase::ToWriteEvery(Writer<StringBuffer>  &writer, double &val)
		{
			writer.Double(val);
		}
		void JsonBase::ToWriteEvery(Writer<StringBuffer>  &writer, bool &val)
		{
			writer.Bool(val);
		}
		void JsonBase::ToWriteEvery(Writer<StringBuffer>  &writer, std::string &val)
		{
			writer.String(val.data());
		}
		void JsonBase::ToWriteEvery(Writer<StringBuffer>  &writer, char * val)
		{
			writer.String(val, strlen(val));
		}

		void JsonBase::ToParseEvery(const Value &val, int32_t &t)
		{
			t = val.GetInt();
		}
		void JsonBase::ToParseEvery(const Value &val, int64_t &t)
		{
			t = val.GetInt64();
		}
		void JsonBase::ToParseEvery(const Value &val, uint32_t &t)
		{
			t = val.GetUint();
		}
		void JsonBase::ToParseEvery(const Value &val, uint64_t &t)
		{
			t = val.GetUint64();
		}
		void JsonBase::ToParseEvery(const Value &val, double &t)
		{
			t = val.GetDouble();
		}
		void JsonBase::ToParseEvery(const Value &val, bool &t)
		{
			t = val.GetBool();
		}
		void JsonBase::ToParseEvery(const Value &val, std::string &t)
		{
			t = val.GetString();
		}
		void JsonBase::ToParseEvery(const Value &val, char t[])
		{
			int size = ARRAY_SIZE(t);
			const char *s = val.GetString();
			int len = strlen(s);
			strncpy(t, s, std::min(size, len));
		}

        // 最终的序列化输出
		std::string JsonBase::ToJson(){
			StringBuffer s;
			Writer<StringBuffer> writer(s);
			this->ToWrite(writer);
			return s.GetString();
		}

        // 反序列化输出
		void JsonBase::FromJson(JsonBase *p, const std::string &json){
			Document document;
			document.Parse(json.data());
			const Value &val = document;
			p->ParseJson(val);
		}

		void	JsonBase::ToWrite(Writer<StringBuffer>  &writer)
		{

		}
		void JsonBase::ParseJson(const Value& val)
		{

		}
	}
}
```



#### 实现例子

###### MyClass.h

```c++

#include "RapidjsonHelper.h"
#include "MyClass3.h"

using namespace PBLIB::RapidJsonHelper;

// 这是一个具体的业务类，必须要继承JsonBase，从而可以使用类对象的序列化和反序列化
class MyClass :public JsonBase
{
public:
	MyClass(){
		memset(name, 0, ARRAY_SIZE(name));
	}
	~MyClass(){}

	int age;
	char name[100];
	std::string text;
	double money;
    // 测试数组对象
	JsonArray<int> lst;
    // 测试类中类
	JsonArray<MyClass3> lst2;

    // 这里实现哪些数据需要被序列化，哪些不需要
	void ToWrite(Writer<StringBuffer> &writer)
	{
		RapidjsonWriteBegin(writer);
		RapidjsonWriteString(text);
		RapidjsonWriteChar(name);
		RapidjsonWriteInt(age);
		RapidjsonWriteDouble(money);
		RapidjsonWriteClass(lst);
		RapidjsonWriteClass(lst2);
		RapidjsonWriteEnd();
	}

    // 这里实现哪些数据需要被反序列化，哪些不需要
	void ParseJson(const Value& val)
	{
		RapidjsonParseBegin(val);
		RapidjsonParseToString(text);
		RapidjsonParseToInt(age);
		RapidjsonParseToDouble(money);
		RapidjsonParseToChar(name);
		RapidjsonParseToClass(lst);
		RapidjsonParseToClass(lst2);
		RapidjsonParseEnd();
	}
};
```



###### MyClass3.h

```c++
#pragma once
#include "RapidjsonHelper.h"
using namespace PBLIB::RapidJsonHelper;

// 类中类，也对应需要实现他的序列化和反序列化内容
class MyClass3 :public JsonBase
{
public:
	int age;
	char name[100];
	std::string text;
	double money;

	MyClass3(){
		memset(name, 0, ARRAY_SIZE(name));
	}
	~MyClass3(){}

	void ToWrite(Writer<StringBuffer> &writer)
	{
		RapidjsonWriteBegin(writer);
		RapidjsonWriteString(text);
		RapidjsonWriteChar(name);
		RapidjsonWriteInt(age);
		RapidjsonWriteDouble(money);
		RapidjsonWriteEnd();
	}

	void ParseJson(const Value &val)
	{
		RapidjsonParseBegin(val);
		RapidjsonParseToString(text);
		RapidjsonParseToInt(age);
		RapidjsonParseToDouble(money);
		RapidjsonParseToChar(name);
		RapidjsonParseEnd();
	}

};


```



#### 测试

###### PB_RapidJsonHelper.cpp

```c++
#include "MyClass.h"
#include <iostream>

using namespace std;
int main(int argc, _TCHAR* argv[])
{

	MyClass mylclass2;
	mylclass2.age = 10;
	strcpy(mylclass2.name, "pengbo");
	mylclass2.text = "123456";
	mylclass2.money = 1.123;
	for (unsigned i = 0; i < 4; i++)
	{
		MyClass3 tmp;
		tmp.age = 10;
		strcpy(tmp.name, "pengbo");
		tmp.text = "12345我6";
		tmp.money = 1.123;
		mylclass2.lst2.arr.push_back(tmp);
	}
	for (unsigned i = 0; i < 4; i++)
	{
		mylclass2.lst.arr.push_back(i);
	}
	//构造完成

	string str2= mylclass2.lst2.ToJson();
	cout << str2.data() << endl;

	cout << "-----" << endl;

	//Json序列化
	string str = mylclass2.ToJson();//序列化完成

	cout << str.data() << endl;

	MyClass mylclassnew;
	MyClass::FromJson(&mylclassnew, str);//反序列化完成

	while (true)
	{

	}
	return 0;
}
```



## Summary

RapidjsonHelper大概就这么多内容，写的比较简单，算是一个起点，本身对比java那种用起来还是有点弱，而且基本所有操作都认为会成功，异常处理没有，而且由于使用的是内存的流方式，所以可能遇到大文件的时候不合适需要修改整个接口，这个就只能轻度使用吧。

正常使用中基于RapidjsonHelper加了一些操作或者函数，方便自己使用。

## Quote

> https://blog.csdn.net/lightspear/article/details/54836656


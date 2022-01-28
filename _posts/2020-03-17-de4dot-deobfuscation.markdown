---
layout:     post
title:      "de4dot 反混淆"
subtitle:   "crack，de-obfuscate"
date:       2020-03-17
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - crack
---

## Forward

之前想汉化SW Seed Calculator，然后发现字符串都被混淆了，然后我就不明白了，最近搞了tracealyzer以后发现好像可以通过de4dot做点什么，于是尝试了一下，发现非常好用。

## 环境

- de4dot
- SW Seed Calculator
- dnSpy

## 分析

直接用dnSpy加载SW Seed Calculator看到的就是混淆后的代码，所有字符串和变量名类名之类的都被混淆了一下，而且由于SW Seed Calculator用了Costura，所以dll啥的都是直接被压在exe里面的。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/BMgrt6aOJqwGdjT.png)

可以看到全都是类似的混淆后的代码

点进去每个字符串前的调用函数，发现这是一个解析函数，用来将混淆后的字符串解析成正确的

```c#
using System;

// Token: 0x02000035 RID: 53
public class ?994?
{
	// Token: 0x0600034A RID: 842 RVA: 0x0002FA2C File Offset: 0x0002DC2C
	public static string ?995?(string ?995?)
	{
		int length = ?995?.Length;
		char[] array = new char[length];
		for (int i = 0; i < array.Length; i++)
		{
			char c = ?995?[i];
			byte b = (byte)((int)c ^ length - i);
			byte b2 = (byte)((int)(c >> 8) ^ i);
			array[i] = (char)((int)b2 << 8 | (int)b);
		}
		return string.Intern(new string(array));
	}
}
```

如果要自己手动解混淆，那工作量就非常大了，由于之前用了de4dot来反混淆，所以这里想是否也可以使用这个来操作。

## 反混淆

找了一下，发现de4dot的新手教程里就有说如何解字符串类型的混淆。需要找解密的函数，并且作为一个委托+tok传进去，然后让de4dot来自动调用解混淆，解了以后代码就非常易读了。



指定字符串解混淆，需要知道对应的函数tok，其实我们上面在看到解混淆的函数的时候就已经有了

```
	// Token: 0x0600034A RID: 842 RVA: 0x0002FA2C File Offset: 0x0002DC2C
	public static string ?995?(string ?995?)
```

这个0x0600034A就是我们需要传入的

然后在命令行中输入以下代码，-p un是指所有符合正则表达式的都进行反混淆

```
de4dot-x64.exe "E:\Download\sw\SW Seed Calculator.exe" -p un --strtyp delegate --strtok 0x0600034A
```

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/ZPmvXMUDheluTCb.png)

我们就拿到了，反混淆后的exe了

## 反编译

将生成的SW Seed Calculator-cleaned.exe拖进dnSpy

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/1qPwSdiHVb23kxF.png)

就能看到原本的字符串已经被正确的反混淆了，代码可读性立马max

## End

可以看到SW Seed Calculator本身没啥必要混淆字符串，混淆了以后反而导致其代码里的变量名之类的都被反混淆成了原本的名字，反而更容易阅读，更容易判断程序结构了。

其次SW Seed Calculator的多语言写的也太弱智了，所有不是日语的地方就加个ifelse判断成英语，讲道理c#国际化也没有这么麻烦吧，这代码改起来得多蠢。

## Quote

> https://www.52pojie.cn/thread-762674-1-1.html





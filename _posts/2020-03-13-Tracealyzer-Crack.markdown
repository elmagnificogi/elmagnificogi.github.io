---
layout:     post
title:      "Tracealyzer Crack"
subtitle:   "FreeRTOS，Trace"
date:       2020-03-13
author:     "elmagnifico"
header-img: "img/Embedded-head-bg.jpg"
catalog:    true
tags:
    - FreeRTOS
    - Embedded
    - Trace
---

## Foreword

最近要用到Tracealyzer来分析FreeRTOS，又刚好看到了新手破解文，所以尝试了一下，几经折腾总算是成功了。

不过由于本身没有接触过反编译这种操作，所以可能有些地方直接看他们的原帖看不懂，或者是原帖里破解的次序非常奇怪，一会这一会那的。这里记录一下详细的过程。

## 前提

有两个前提，第一是大佬们已经提前用了UniExtract或者是DotNetHelper之类的工具分析出了Tracealyzer本身是用c#来编写的，并且已经被混淆了一次了。然后才能使用下面的工具来操作。

基于操作的Tracealyzer版本应该是<=4.3.5，最好是4.3.5这样的话反编译以后程序结构会和后面的截图一模一样。

更新的版本可能也可以，不过要尝试以后才知道，我并没有试过。

## 准备工作

- de4dot，这个是c#反混淆工具

> https://github.com/0xd4d/de4dot/releases

- dnSpy6.1.3,这个是用来反编译c#的工具

> https://github.com/0xd4d/dnSpy/releases

- 下载安装Tracealyzer 4.3.5

官方可能是最新的，但是只要改一下链接就可以下到老版本的了。

（这里其实应该是一个官方的问题，官方好像没有提供历史版本，要下就得自己操作一下，当然某种程序上说这个地方是有问题的，应该给的下载链接是带时效性的，并且最好把后面的版本或者路径混淆一下再给出来，而不是这样的能直接被我拉下来的）

下载的时候最好是申请一下评估的license，不然一会没有基础license比较麻烦。

安装完以后打开激活一下，就能在下面的目录下看到对应的license

```
C:\ProgramData\Tracealyzer Data
```

打开license可以看到类似下面的内容

```xml
<SignedLicense>
<License>
<HashedKey>H2m6G0Bf37sJ+LJFJRqVpjog5PQ=</HashedKey>
<Product>Tracealyzer - Evaluation Edition</Product>
<ProductId>{CCC61B47-F14E-4D71-80B3-D3DCA2E62271}</ProductId>
<EditionId>{F5780CA8-1FC7-4AA4-9B1E-C7F7D6E19496}</EditionId>
<LicensedTo>123</LicensedTo>
<ExpiresOn>2030-03-22</ExpiresOn>
<SupportThrough>2031-03-12</SupportThrough>
<Components>
<Component>
<Id>{B1CF5B88-ADA5-4B2A-81AF-257054106205}</Id>
<Name>Tracealyzer Application</Name>
</Component>
<Component>
<Id>{469D108A-B824-4C27-99ED-98B8629BFCE0}</Id>
<Name>FreeRTOS Support</Name>
</Component>
</Components>
<Nodes>
<Node>
<Id>
yb2ydnYzlM4qLq6poX76Lar3ET+xugv2ajhZu+yYyRRCeg6gDgQJ1aEDvrQ1HluadyK1LNg5DLNxy7FttBU5rg==
</Id>
<Name>123</Name>
</Node>
</Nodes>
</License>
<Signature>
C6fCEgbluol7lgyhYc8xRi//whsIeMYbNGxY87ol6jYb0z6bea2GujwLfnM3vSVUujKfEZFKz0ycyjq33IfztOEgE1zmfksBlqHAsyI9LN5Gr3mrKxPsSICTZb63NSU1DIpRy3PKxoINn/WGFqxGP1jiRSVxkk2twRqOgpKuqEk2PrtMzG3CoxA7v5dszsENs9gH1L/LS97oHS7OPFZ2AgQ4uHjR3NIoVR+zJgSamIa+Rtll6Dc890z1Qet8YzUVxN1qoFMXSYnTTCj/P7osxdOw80ON1BWq57ftHRTNIUiYaJijhdqN3VF26n6hjEpUbAVSmkjNlKWe9lu2KsKeMA==
</Signature>
</SignedLicense>
```

先分析一下

- EditionId，这个就是版本号，官方有标准版，专业版，学术版，免费版，评估版
- ProductId，这个是产品号，大概跟版本有关系，所以这个应该不用改
- HashedKey，这个大概率是激活码，不过是Hash以后的。

剩下的就是激活有效期之类的东西了。

## 分析

这一步其实可以跳过，直接到反编译环境，正式操作就能完成破解，但是这里还是要说一下，由于之前的帖子里他们都把分析和操作混在一起，导致有时候说的莫名其妙的。

1. 由于提前知道了license在哪里，那么想一想程序启动的时候肯定会读取本地的这个文件，然后读取里面的内容，去判定软件是否启动，软件各种功能是否可以加载使用。
2. 那么反编译找的时候，就应该根据license中的内容去找，已经说了EditionId是和版本有关系的，这个其实变化比较小，所以反编译的时候优先找是否存在这个字符串之类的东西应该就能找到读取license的入口函数附近。（当然这个是大佬们已经提前告诉你的，如果是一个全新的软件，那还是得一步一步分析，看每一步大概是什么意思做了什么）
3. 找到了license函数的入口附近，那么再向上或者向下一步步追踪，并且看是什么操作大概就能知道具体的读取和判断license合法还是不合法的位置了。
4. 然后就是编译修改，让原本不合法的地方合法，让他能一步一步走向一个正确的初始化流程。
5. 如果改错了，那就得倒退回去然后重来一遍，最终程序就能正常跑起来了，并且license非法也会识别成合法的。



## 反混淆

先根据自己的程序判断你到底是要用32位的还是64位的，这个比较重要，否则可能反混淆以后的结果是错的，就很尴尬了。

进入到de4dot目录下，输入下面的命令

```
de4dot-x64.exe -r D:\Tracealyzer4 -ro D:\Tracealyzer4\cleaned
```

-r用来指定Tracealyzer的目录，后面的-ro是指定生成的反混淆后的结果，单独存在一个文件夹里，如果不指定的话就会覆盖掉原本正常的程序。

这样我们就得到了反混淆后的程序，这个程序此时可以被我们重编译，如果少了这一步直接反编译源程序里面的大部分指针的地方都成了一串数字， 没法重编译的，当然可以修改IL之类的，可以跳过步骤或者改变内容，不过这个就比较麻烦一些要对汇编比较熟悉才行。



## 反编译

打开dnSpy，也区分32位和64位，然后把刚才生成的Tracealyzer.exe拖进去，一定是cleaned中的，不是原本的那个，我就是一直拖原来的那个然后疯狂看不懂，还以为我软件有问题呢。



从这里开始下面的图中的变量名字可能会与你操作的不同，但是程序结构是一模一样的，这个名字是反编译自动加的，不一定是什么

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/vynV3Yg5lfTHGjx.png)



然后我们直接搜索SignedLicense 就能找到读取License的入口位置，到了这个位置就可以

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/cpD86JlOykeYHXA.png)

到了这里就可以开始，启动调试，中断于入口点，然后就能单步调试了，不过我们在这个位置加个断点，直接让他跑过来。（这里直接跑会提示缺少p.ico,从原目录下复制粘贴一个过来就行了）

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/lrnJxbeWPIq1XfQ.png)

下面带一点分析

```c#
	internal GEnum46 method_1(byte[] byte_0, string string_0, DateTime dateTime_0, out GClass631 gclass631_0)
	{
		gclass631_0 = null;
		XmlElement xmlElement = this.xmlDocument_0.smethod_17("/SignedLicense/License");
		XmlNode xmlNode = this.xmlDocument_0.smethod_17("/SignedLicense/Signature");
		byte[] bytes = Encoding.UTF8.GetBytes(xmlElement.OuterXml);
		byte[] byte_ = Convert.FromBase64String(xmlNode.InnerText);
		XmlElement xmlElement2 = this.xmlDocument_0.smethod_17("/SignedLicense/License/ProductId");
		if (string_0 != xmlElement2.InnerText)
		{
			return GEnum46.const_3;
		}
		// 单步调试发现第一次，直接返回是这里，然后去看这个smethod_0是干什么的函数
		// 发现他是RSA的解析函数，最后返回True或者False，我直接让他返回True，强制正确
		if (!GClass634.smethod_0(byte_0, bytes, byte_))
		{
			return GEnum46.const_1;
		}
```

点进去smethod_0，然后修改为下面的return true，编译

```
	// Token: 0x06004F9C RID: 20380 RVA: 0x001C1624 File Offset: 0x001BF824
	public static bool smethod_0(byte[] byte_0, byte[] byte_1, byte[] byte_2)
	{
		using (RSACryptoServiceProvider rsacryptoServiceProvider = new RSACryptoServiceProvider())
		{
			rsacryptoServiceProvider.ImportCspBlob(byte_0);
			rsacryptoServiceProvider.VerifyData(byte_1, GClass634.sha512Managed_0, byte_2);
		}
		return true;
	}
```

编译完成了以后，再重新加载所有模块，然后再跑一遍，跑到这个位置发现他正常跑过去了，没有返回了，那就继续往下走。

```c#
		XmlElement xmlElement5 = this.xmlDocument_0.smethod_17("/SignedLicense/License/EditionId");
		XmlNode xmlNode2 = this.xmlDocument_0.smethod_17("/SignedLicense/License/Nodes");
		string b = GClass635.smethod_1();
		string b2 = GClass635.smethod_3();
		bool flag = false;
		foreach (object obj in xmlNode2.ChildNodes)
		{
			if (obj is XmlElement)
			{
				foreach (object obj2 in ((XmlElement)obj).ChildNodes)
				{
					if (obj2 is XmlElement)
					{
						XmlElement xmlElement6 = (XmlElement)obj2;
						//会发现这里要求达不到，导致flag一直是false
						if (xmlElement6.Name == "Id" && (xmlElement6.InnerText == b || xmlElement6.InnerText == b2))
						{
							flag = true;
							break;
						}
						if (xmlElement6.Name == "Id" && xmlElement6.InnerText == "ANY")
						{
							flag = true;
							break;
						}
					}
				}
				if (flag)
				{
					break;
				}
			}
		}
		if (!flag)
		{
            // 然后就从这里出去了
			return GEnum46.const_6;
		}
```

那么这个地方就需要让他能正常跑出去，我们就在这个函数里添加一句

```
xmlElement6.InnerText = b2;
```

下图中的text就是b2，只是两次反编译时变量名不同而已

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/hoOiNBzARYj2cWd.png)

然后编译，保存模块，重新加载所有模块，再跑一次，发现正常跑通了。

然后继续跑肯定会提示缺少什么，由于我们反编译的是反混淆后的部分文件，所以肯定缺少东西。

现在就可以把cleaned中的所有东西覆盖源路径下的文件，算是反编译结束了。

## 版本信息获取

最后再说一下版本信息是怎么获取到的，随便搜这里任何一个序列号，都能在代码中搜到对应的字符串

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/GksJqgQnNOlrS2P.png)

然后你就可以看到这里写了各个版本的对应是什么。

Free Edition - FA52DADE-887B-495D-8258-898B39E189CB

Standard Edition - 050C587E-D34F-4361-B344-F8FCC4473477

空-应该是专业版 - 07DA2EBE-0932-44C2-AC8C-F11ED48DD0AB

Academic Edition - 20478608-C79A-48A9-A969-35541787D2C0

Evaluation Edition - F5780CA8-1FC7-4AA4-9B1E-C7F7D6E19496

既然版本信息找到了，程序也破解了，下面就是把License中的版本替换成你想要的版本，然后再启动程序，就能正确看到注册信息了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/BDPzNghfS7sL3E5.png)

## The end

最后，总结一下，其实Traceralyzer的破解应该是非常非常简单的了，从license一路找代码找到最终破解。

可以看到对于本地文件操作，文件夹，文件名字或者是xml中的一个标签，都可以成为突破的关键点吧。而Traceralyzer本身对于license没有加密，直接以xml的形式存在本地，导致门槛低了很多。当然就算他加密了其实也会被通过路径中的关键字或者xml中的关键字再次被找到，只是路径再绕一些而已。



这应该说是最简单了破解了，先分析辨别程序是用什么编译生成的，然后是否需要脱壳，脱了壳以后再反编译，调试，一直到最终可以正常启动。



Traceralyzer是非常专业化的软件了，平常用的人少，所以也疏于对于软件的防护，希望官方能提升一下软件的安全性吧。

## Quote

> https://www.52pojie.cn/thread-1020667-1-1.html
>
> https://www.52pojie.cn/thread-575525-1-1.html
>
> http://www.stmcu.org.cn/module/forum/forum.php?mod=viewthread&tid=620069&extra=page%3D&page=1





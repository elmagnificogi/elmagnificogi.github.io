---
layout:     post
title:      "Crypto++中的padding"
subtitle:   "c++"
date:       2021-01-08
author:     "elmagnifico"
header-img: "img/zerotier.jpg"
catalog:    true
tags:
    - c++

---

## Foreword

Crypto++中的pading似乎有点奇怪的问题，这里记录一下



## Pading

首先知道，既然要加密，加密都是一定长度进行加密，和你的组大小有关系，一般都是16字节，那么内容不足16字节的时候就必须要填充一些内容进去，那么这里就需要padding了，具体怎么填充，不同的协议有不同的要求。

这里是Crypto的源码中关于padding模式的枚举

```c++
struct BlockPaddingSchemeDef
{
	/// \enum BlockPaddingScheme
	/// \brief Padding schemes used for block ciphers.
	/// \details DEFAULT_PADDING means PKCS_PADDING if <tt>cipher.MandatoryBlockSize() > 1 &&
	///   cipher.MinLastBlockSize() == 0</tt>, which holds for ECB or CBC mode. Otherwise,
	///   NO_PADDING for modes like OFB, CFB, CTR, CBC-CTS.
	/// \sa <A HREF="http://www.weidai.com/scan-mirror/csp.html">Block Cipher Padding</A> for
	///   additional details.
	/// \since Crypto++ 5.0
	enum BlockPaddingScheme {
		/// \brief No padding added to a block
		/// \since Crypto++ 5.0
		NO_PADDING,
		/// \brief 0's padding added to a block
		/// \since Crypto++ 5.0
		ZEROS_PADDING,
		/// \brief PKCS padding added to a block
		/// \since Crypto++ 5.0
		PKCS_PADDING,
		/// \brief 1 and 0's padding added to a block
		/// \since Crypto++ 5.0
		ONE_AND_ZEROS_PADDING,
		/// \brief W3C padding added to a block
		/// \sa <A HREF="http://www.w3.org/TR/2002/REC-xmlenc-core-20021210/Overview.html">XML
		///   Encryption Syntax and Processing</A>
		/// \since Crypto++ 6.0
		W3C_PADDING,
		/// \brief Default padding scheme
		/// \since Crypto++ 5.0
		DEFAULT_PADDING
	};
};
```

这里的DEFAULT_PADDING非常特殊，当时CBC或者ECB的情况下，只要分组大小时大于1并且剩余字节等于0的情况下，那么就用PKCS的模式，否则就都用无填充。

但是我实际这里测试的结果并不是，反而相反了，后面会具体说明



#### PKCS7

填充的字符是相同的，这个字符是剩余要填充的值，比如要填充4个字节，那么这个填充的值就是4

例子：

```
假设字符源串16进制为 : 
DD DD DD DD DD DD DD DD | DD DD DD DD
那么padding后为：
DD DD DD DD DD DD DD DD | DD DD DD DD | 04 04 04 04 |
```

这样填充完成以后才会进行加密操作。

但是有个特殊情况，比如加密长度刚好是16的整数倍，那么这个时候依然要填充，这时填充值就是10了



#### PKCS5

和7不同的是，PKCS5固定填充长度为8字节，但是实际处理的时候8字节太慢了，这个时候需要其他长度，因而扩展出了PKCS7，PKCS7可以指定1-255内任何长度的包，剩下的填充规则相同



#### zeros

顾名思义，就是填充0即可



#### None或者No_padding

不填充



#### ISO 10126 与 ANSI X9.23

填充随机值，但是最后一字节永远是填充的长度，下面是一个包8字节，4字节需要填充

```
| DD DD DD DD DD DD DD DD | DD DD DD DD : 81 A6 23 04 |
```

不同的地方是ANSI X9.23的协议中很多实现是填充的0，而不是真随机值

```
| DD DD DD DD DD DD DD DD | DD DD DD DD : 00 00 00 04 |
```

在Crypto++中W3C_PADDING就是这种方法



#### ISO/IEC 7816-4

他是强制填充一字节的80，然后后面跟00,当然这种模式下这个80相当于不能是内容的结尾字符，否则会出错

其实这里填充的内容最小单元是以bit来算的，他是第一个bit填1，其余全填0，就变成了从80开始，后面全0的情况

比如8字节的包，这里需要填充4字节

```
| DD DD DD DD DD DD DD DD | DD DD DD DD 80 00 00 00 |
```

比如8字节的包，这里需要填充1字节

```
| DD DD DD DD DD DD DD DD | DD DD DD DD DD DD DD 80 |
```

在Crypto++中ONE_AND_ZEROS_PADDING就是指代这种模式 



#### Block Cipher Modes

> Symmetric block cipher modes fall into two categories: block-oriented and byte-oriented. For block-oriented modes, the plaintext or ciphertext can only be processed one block at a time. This means that a "padding scheme" is needed to specify how to handle the last block of a message, i.e. the standard algorithm name will be of the form "`cipher/mode/padding`". If messages are always an exact number of blocks in length, "`NoPadding`" may be specified as the padding scheme.
>
> For byte-oriented modes, the plaintext or ciphertext can be processed one byte at a time (by use of internal buffering if necessary). This means that a padding scheme is not required, i.e. the standard name will be of the form "`cipher/mode`". For backward compatibility, however, any of the forms "`cipher/mode`", "`cipher/mode/NoPadding`", and "`cipher/mode/NONE`" should be accepted when the mode is byte-oriented. The last two of these are deprecated.

Crypto中关于组填充的模式中有这样的说明，如果是字节流模式的情况下，密文内容可以被逐字节处理，这种情况下，是不需要padding的。但是为了兼容其本身接口上还是保留了padding



## 指定填充模式

**DEFAULT_PADDING 默认情况下都是使用PKCS来填充的，但是如果他发现这次数据长度刚好，不需要填充，那么他会直接切到NO_PADDING，而如果对方使用的是PKCS，显然不填充会在这里报错，这就导致后面全都出错了**。

这个情况与crypto的注释写的刚好相反了，怀疑他们应该是搞错了。



#### 出错代码

之前使用的时候，没有注意到这个padding模式，导致我没有填这个值，直接使用了默认值，但是偶尔会发生一次解密出错的情况，概率也是挺小的，反复调试总算找到了实际出错的地方就是这个padding。

```c++
bool CBC_AESEncryptFile(std::string aesKey, std::string sIV, const std::string & input_filename,const std::string & output_filename)
{
	try
	{
		// first set aes key
		SecByteBlock key(AES::MAX_KEYLENGTH);  
		memset(key,0x30,key.size() );  
		aesKey.size()<=AES::MAX_KEYLENGTH?memcpy(key,aesKey.c_str(),aesKey.size()):memcpy(key,aesKey.c_str(),AES::MAX_KEYLENGTH);  

		// set iv
		byte iv[AES::BLOCKSIZE];  
		memset(iv,0x30,AES::BLOCKSIZE); 
		sIV.size()<=AES::BLOCKSIZE?memcpy(iv,sIV.c_str(),sIV.size()):memcpy(iv,sIV.c_str(),AES::BLOCKSIZE);

		// create a ase encryption
		AES::Encryption aesEncryption((byte *)key, AES::MAX_KEYLENGTH);  
		CBC_Mode_ExternalCipher::Encryption cbcEncryption(aesEncryption, iv);  

		// set the filter
		//StreamTransformationFilter ecbEncryptor(ecbEncryption, new HexEncoder(new StringSink(outstr))); 
		FileSource(input_filename.c_str(), true,new StreamTransformationFilter(cbcEncryption,new FileSink(output_filename.c_str())));
		return true;
	}
	catch (...)
	{
		return false;
	}
}
```

给进去的文件大小是不满16字节的，给出来的直接是16的整数倍，而当给出16字节的文件的时候，使用pkcs就直接解不开了，反而使用不填充可以解开



```c++
		BlockPaddingSchemeDef::BlockPaddingScheme padding = BlockPaddingSchemeDef::BlockPaddingScheme::PKCS_PADDING;
		FileSource(input_filename.c_str(), true,new StreamTransformationFilter(cbcDecryption,new FileSink(output_filename.c_str()),padding));
```

正确的做法，增加padding参数。



## Summary

以后调这种api，一定要注意一下这个默认值，没想到他会有这个让人误解的地方



## Quote

> https://www.cnblogs.com/AloneSword/p/3491466.html
>
> https://www.cnblogs.com/solohac/p/4284424.html
>
> https://en.wikipedia.org/wiki/Padding_(cryptography)
>
> https://tools.ietf.org/html/rfc2315
>
> https://tools.ietf.org/html/rfc2898


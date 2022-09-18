---
layout:     post
title:      "Amiibo Fake"
subtitle:   "Nintendo Switch,EasyCon"
date:       2022-09-13
update:     2022-09-19
author:     "elmagnifico"
header-img: "img/typora.jpg"
catalog:    true
tags:
    - ESP32
    - EasyCon
    - Nintendo Switch
---

## Forward

由于Amiibo被破解了，所以理论上我可以直接生成任意一个Amiibo（按我现在的理解）



## Amiibo

#### NTAG215

> https://wiki.gbatemp.net/wiki/Amiibo

Amiibo本质上就是一个NTAG215标签，以前弄过超远距离RFID，所以这个倒是了解一点。

NTAG215本身具有540字节的存储空间，其中Amiibo使用的空间和定义如下

![image-20220913000427636](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209130004683.png)

Amiibo有一些共性，如下

```
UID 0 is 0x04 on all Amiibo (and possible all NTAG21x).
BCC 0 is always equal to UID0 ⊕ UID 1 ⊕ UID 2 ⊕ 0x88
BCC 1 is always equal to UID3 ⊕ UID 4 ⊕ UID 5 ⊕ UID6
⊕ is XOR

Byte 1 of Page 2 is an internal value that is permanently set to 0x48 on all Mifare Ultralight chips (except some "magic Chinese" chips). All Amiibo also have this value set to 0x48 so using a different value would probably be pointless.

The lock bytes on all Amiibo are set to 0x0F and 0xE0. This means pages 4-10 are locked. Once these bits are set to 1, they cannot be reset to 0.

Page 21 and 22 set what character is being used. For example, Kirby is 0x1F000000 and 0x000A0002 while Link is 0x01000000 and 0x00040002.

The dynamic lock bytes on all Amiibo are set to 0x01, 0x00, and 0x0F. This locks pages 16-17 and blocks 16-31.

Byte 3 of Page 130 is always 0xBD.

Configuration 0 is set to 0x00000004 and Configuration 1 is set to 0x5F000000 on all Amiibo.
```

UID是一个卡的唯一标识，理论上不会重复，但是国内存在很多具有后门的读写卡器，手机也算，他们直接自己写一个一样内容的卡，就能被NS识别了。

现在的Amiibo模拟，都是通过copy一个被dump的Amiibo，然后写入和他一样的内容，来进行模拟的。

但是我现在遇到的就是空间有限的情况下，如何直接生成一个Amiibo，并且能通过NS识别。



#### Libamiibo

首先根据这里的说法，一般来说检查一个NTAG需要先检验签名，但是NS并不会检查签名，这就导致所有复制的bin可以被识别到

> https://github.com/Falco20019/libamiibo/issues/5
>
> To completely verify or emulate an amiibo, you need to match the correct encrypted payload (540 bytes) AND have the correct signature for the tag (32 bytes). Nintendo is not checking the tag on any console. So emulating the data by just using the payload is done by most emulation devices.
>
> Nintendo could easily fix fake amiibos by requesting the signature and validating it against the NTAG public key. I am wondering why Nintendo is not doing it since this is even in the NTAGs application best practice documents. This would break most of the existing emulation devices and only leave emulations that use 572 byte dumps or re-encrypted data written to real NTAGs. The first one would be somewhat legal as no encryption was broken and data is only repeated without tampering. The later one might be considered more illegal since it needs the crypto keys from Nintendo which might be considered Nintendo‘s intellectual property.
>
> I saw that a couple years ago during my research as missing piece and therefore added the signature to the dump format. I just felt that this was missing to have a real valid dump, even if there is no necessity for it for validating or reading the data or even emulation at the moment.

所以为啥在Joycontrol中有572字节的NTAG，就是540加了32字节的签名。而现实情况是，NS只传递了540字节。



简单解析一个NTAG，直接运行即可，但是只能解析非加密的信息

```
byte[] encryptedNtagData = System.IO.File.ReadAllBytes("mario.bin");
LibAmiibo.Data.AmiiboTag amiiboTag = LibAmiibo.Data.AmiiboTag.FromNtagData(encryptedNtagData)
```

要解密加密的信息，必须要有2个东西，一个是AmiiboKeys，一个是CDNKeys



能直接下到的就是这个两个key，一个是Locked-Secret.bin，一个是Unfixed-Info.bin

>https://drive.google.com/file/d/1cBveUfIyNMGBP9Ygs32-EQVMZJMs19OS/view?usp=drivesdk
>
>https://drive.google.com/file/d/15_J6M7nNEhPeHTcB6Uy3x0lAFxJEsjiS/view?usp=drivesdk



又找到了一个大全，号称所有都有，包括key_retail.bin

> https://drive.google.com/drive/u/0/folders/1TCEmF5alHGCbg5gSk4qRLmJYHIzgYUJH?sort=13&direction=a

这样就有了对应的Key了



Libamiibo跑不起来，可以解析未加密的内容，但是加密内容的key传不进去，调用不上。卡尔又提供了新思路，所以跳过去看看。



## amiitool

> https://github.com/socram8888/amiitool

amiitool 直接用c实现了，我直接省事了

这个仓库从18年就再没更新过了，应该是稳定了，加解密流程稳定了。

先看一下issue，大概确定了

> https://github.com/socram8888/amiitool/issues/4

首先加解密必须要有`mbedTLS `

> https://github.com/Mbed-TLS/mbedtls

`mbedTLS`是个相当大的库，amiitool里是直接使用的静态库，也就是源码编译的。

主要是完成2个加密算法 HMAC-SHA256 和 AES

> - Calculating a HMAC-SHA256 as part of the DRBG
> - Checking and generating the fixed part HMAC-SHA256
> - Checking and generating the user content's HMAC-SHA256
> - Decrypting and encrypting the user contents using AES



上一秒还在考虑`mbedTLS`要移植2个算法出来太麻烦了，下一秒就看到了ESP32直接内部已经移植了这个库，可以直接调用了。

![image-20220917013025615](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209170130700.png)



然后他这里是需要前面提到的Locked-Secret.bin和Unfixed-Info.bin

> - Decryption "mario.bin" and displaying hex to terminal:
>
>   > amiitool -d -k retail.bin -i "mario.bin" | xxd
>
> - Encryption "modified.bin" to "signed.bin":
>
>   > amiitool -e -k retail.bin -i "modified.bin" -o "signed.bin"
>
> - Copy "mario2.bin" Saves (AppData) into "mario1.bin" and save to "mario3.bin"
>
>   > amiitool -c -k retail.bin -i "mario1.bin" -s "mario2.bin" -o "mario3.bin"

仔细查看以后发现，其实

```
key_retail.bin = Unfixed-Info.bin + Locked-Secret.bin
```

所以他 -k 的参数是直接使用的retail.bin



#### 测试amiitool

```
amiitool.exe -d -k amiibo_key_retail.bin -i Mipha.bin -o mipha_decryption.bin
```

然后就得到了解密以后的bin，直接拉进对比

![image-20220917021259620](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209170212686.png)

可以看到只有最后一部分是相同的，也就是以下部分是固定值

![image-20220917021505602](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209170215627.png)



再试一下加密，将刚才的解密bin加密回去

```
amiitool.exe -e -k amiibo_key_retail.bin -i mipha_decryption.bin -o mipha_en.bin
```

经过对比，加密后和原来的bin是一样的。

那么这个东西肯定就能用，



#### 测试Amiibo Id

```
amiitool.exe -d -k amiibo_key_retail.bin -i "Link (Rider).bin" -o Rider.bin
amiitool.exe -d -k amiibo_key_retail.bin -i "Link (Archer).bin" -o Archer.bin
```

可以看到0x58的地方实际上是对应的amiibo的识别位置

![image-20220917024243393](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209170242446.png)



同样解密以后，他们58的地方也是不同的，现在试着把他们修改成相同的，看一下结果

![image-20220917024358081](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209170243130.png)

加密回去右边的

```
amiitool.exe -e -k amiibo_key_retail.bin -i Archer.bin -o archer_en.bin
```

加密以后发现，amiibo的位置其实没有变，依然是03 53，没有变成想象的03 54



仔细看了一下，发现其实03 54 不在0x58这个位置了，而是在0x1E0

![image-20220917025354271](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209170253308.png)

所以我应该改这个地方，重新调整以后再加密，已经修改为0x54了

![image-20220917025458260](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209170254319.png)

测试一下是否有效，测试修改为54以后，正确识别了，但是现在不能区分识别到的这个Amiibo到底是不是0x54 还是识别的是0x53

经过cale纠正，一个amiibo的识别码，不仅仅是`0354`这么一点，实际上是

![image-20220918224614698](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209182246729.png)

这里的8字节共同决定的，所以要替换的内容还要再多一点。要实际看到Amiibo到底是哪个，可以借助动森或者是喷2、喷3，他们会显示具体是哪个amiibo。我这里就借用喷2试一下。



#### 喷射2测试

```
amiitool.exe -d -k amiibo_key_retail.bin -i "Inkling Boy.bin" -o boy_d.bin
amiitool.exe -d -k amiibo_key_retail.bin -i "Inkling Girl.bin" -o girl_d.bin
```

解密前

![image-20220918235612084](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209182356119.png)

结合amiibo api的数据一起看

> https://amiiboapi.com/api/amiibo/

```json
    {
      "amiiboSeries": "Splatoon", 
      "character": "Inkling", 
      "gameSeries": "Splatoon", 
      "head": "08000100", 
      "image": "https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_08000100-003e0402.png", 
      "name": "Inkling Girl", 
      "release": {
        "au": "2015-05-30", 
        "eu": "2015-05-29", 
        "jp": "2015-05-28", 
        "na": "2015-05-29"
      }, 
      "tail": "003e0402", 
      "type": "Figure"
    }, 
    {
      "amiiboSeries": "Splatoon", 
      "character": "Inkling", 
      "gameSeries": "Splatoon", 
      "head": "08000200", 
      "image": "https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_08000200-003f0402.png", 
      "name": "Inkling Boy", 
      "release": {
        "au": "2015-05-30", 
        "eu": "2015-05-29", 
        "jp": "2015-05-28", 
        "na": "2015-05-29"
      }, 
      "tail": "003f0402", 
      "type": "Figure"
    }, 
```

我将girl的数值改成了boy的，其他内容不变，重新再加密

```
amiitool.exe -e -k amiibo_key_retail.bin -i girl_d.bin -o girl_en.bin
```

![image-20220919000131197](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209190001244.png)

单纯和boy比的话，基本全都变了

![image-20220919000200677](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209190002735.png)

进入喷2，使用刚才伪造的boy，进入游戏，正常识别到了，但是这个对话名称稍微有点问题，男性角色却是女性名称了

![image-20220919000952739](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209190009995.png)

正常girl，应该是这样的

![image-20220919001106908](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202209190011148.png)

验证成功，所以剩下的只要移植代码就行了，比较简单了。



## pyamiibo

> https://pypi.org/project/pyamiibo/

这个是amiitool的作者推荐的python的库，实现的功能也是一样的



## Summary

如果只是用来弄 Amiibo 基本就是完美方案了，比nfc更快的识别速度，而且可以存下任意数量的Amiibo，也能通过伊机控更新。

ESP32这个方案就测试到这里，暂时不会relese bin 也不会移植了，方案肯定是可行的。



## Quote

> https://wiki.gbatemp.net/wiki/Amiibo
>
> https://github.com/Falco20019/libamiibo
>
> https://hax0kartik.github.io/amiibo-generator/
>
> https://kevinbrewster.github.io/Amiibo-Reverse-Engineering/

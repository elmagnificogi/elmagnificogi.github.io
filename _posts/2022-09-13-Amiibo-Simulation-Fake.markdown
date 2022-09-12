---
layout:     post
title:      "Amiibo Fake"
subtitle:   "Nintendo Switch,EasyCon"
date:       2022-09-13
update:     2022-09-13
author:     "elmagnifico"
header-img: "img/typora.jpg"
catalog:    true
tags:
    - C
    - C#
---

## Forward

由于Amiibo被破解了，所以理论上我可以直接生成任意一个Amiibo（按我现在的理解）



## Amiibo

#### NTAG215

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



## Summary

未完待续



## Quote

> https://wiki.gbatemp.net/wiki/Amiibo
>
> https://github.com/Falco20019/libamiibo
>
> https://hax0kartik.github.io/amiibo-generator/

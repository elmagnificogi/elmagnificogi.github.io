---
layout:     post
title:      "BLHeli 自定义音乐与乐理常识"
subtitle:   "esc"
date:       2020-06-12
author:     "elmagnifico"
header-img: "img/drone-head-bg.png"
catalog:    true
tags:
    - esc
    - BLHeli
---

## Foreword

BLHeli支持自定义启动音乐，这样就可以玩出很多花样来，这里记录一下关于其音乐部分的参数含义的记录以及基础乐理

## 参数含义

BLH里的参数或者说明都存于每次更新的log中，但是具体说明是作者自己回帖说的，log里说i的非常少

![SMMS](https://i.loli.net/2020/06/12/zjWuqrf4xbZQvwT.png)



- **Gen. Length** 节拍速度,可以理解为播放速度,8表示正常速度，也就是一个音0.5秒，小于8就是更块，大于8就是更慢
- **Gen. Interval **就是指音符之间的间隔时间,就是一个音唱完以后等多久唱下一个
- Length与Interval的组合最大值是15，14或者14，15，不能同时15
- BLH目前最多支持48个音节，包括暂停

#### 音乐格式

首先是一个音的组成是：

```
[Note][Octave] [Length]
 音名    音组      音符  
```

##### 音名

BLH支持的音调就是下面的这些，基本符合乐理常识

- C
- C#（Db）
- D
- D#（Eb）
- E
- F
- F#（Gb）
- G
- G#（Ab）
- A
- A#（Bb）
- B

实际对应简谱的就是1，2，3，4，5，6，7,唱起来就是do,re,mi,fa,so,la,xi七个音

##### 音组

有效音组只有4个，平常称之为key

- 4
- 5
- 6
- 7

##### 音符

BLH支持的音符有4个

- 1/1
- 1/2
- 1/4
- 1/8

然后呢这里将音符的长短直接给定死了，1/1的时间是0.5秒，那么对应1/2的时间就是0.25秒，以此类推

那么1秒就是2拍，对应一分钟就是120拍，当然实际上并不能唱一分钟

##### 暂停

除了上面的基础符号，还有一个常见的，那就是暂停或者说默音

默音使用P来表示，可以有以下停顿

```
P 1/1, P 1/2, P 1/4, P 1/8, P 1/16, P 1/32, P 1/64, P 1/128
```

##### 省略1

然后上面的音符中的1/x中的1，由于都有1，所以在书写的时候可以直接省略

那么就可以写成

```
P1 默音一个音符的时间，等于P 1/1
A42 就是A4 1/2
```

## 电调音乐例子

有了上面的参数基础就可以开始搞音乐了？

比如：两只老虎 

```
C52 D52 E52 C52 C52 D52 E52 C52 E52 F52 G51 E52 F52 G51
```

![SMMS](https://i.loli.net/2020/06/12/WdQHYLrc9vs4lRh.png)

打开音乐编辑，然后输入上面的内容，设置好速度和间隔以后就可以点击播放了，这里都是通过电脑来播放的，实际电调播放需要烧写进去以后断开连接就会听到具体电调发出的音乐了。

这只是初步的，他只能播放一个旋律，如果别人混音以后的歌曲可能比较复杂，又或者比较长，那就需要用到其他电调了，最大支持8个电调，也就是可以8个不同的声音同时播放。

比如 let it go，可以看到其中3个电调都是不一样的声音，1和4是主旋律，而2和3都是伴奏

```
### Motor 1 ###
Set Music On 
Set Gen. Length 15
Set Gen. Interval 0    
Paste these notes:
B5 4 C#6 4 D6 1 P2 A5 8 P8 A5 8 P8 E6 1 P2 P4 D6 2 B5 8 P8 B5 8 P8 B5 8 P4 P8 B5 4 C#6 2 D6 1

### Motor 2 ###
Set Music On 
Set Gen. Length 15
Set Gen. Interval 0    
Paste these notes:
P2 P4 D5 2 D5 4 P4 D5 2 D5 4 P4 A4 2 A4 4 P4 A4 2 A4 4 P4 B4 2 B4 4 P4 B4 2 B4 4 B4 1

### Motor 3 ###
Set Music On 
Set Gen. Length 15
Set Gen. Interval 0    
Paste these notes:
P2 P4 A5 2 P2 A5 2 P2 E5 2 P2 E5 2 P2 F#5 2 P2 F#5 2 P4 D5 1

### Motor 4 ###
Set Music On 
Set Gen. Length 15
Set Gen. Interval 0    
Paste these notes:
B5 4 C#6 4 D6 1 P2 A5 8 P8 A5 8 P8 E6 1 P2 P4 D6 2 B5 8 P8 B5 8 P8 B5 8 P4 P8 B5 4 C#6 2 D6 1

```

当然也可以让4个电调都放主旋律，这样主旋律的声音会比较强，听起来明显，如果主旋律只有一个，很有可能和伴奏重叠在一起以后声音比较小。

也可以通过单独设置每个电调的启动声音大小，从而调节主旋律和伴奏的声音大小比例，不过比较麻烦而已



官方自带的权游片头的例子，length=8 Interval=0

```
E6 1/2 A5 1/2 C6 1/4 D6 1/4 E6 1/2 A5 1/2 C6 1/4 D6 1/4 E6 1/2 A5 1/2 C6 1/4 D6 1/4 E6 1/2 A5 1/2 C6 1/4 D6 1/4 B5 1/2 E5 1/2 G5 1/4 A5 1/4 B5 1/2 E5 1/2 G5 1/4 A5 1/4 B5 1/2 E5 1/2 G5 1/4 A5 1/4 B5 1/2 E5 1/2 G5 1/4 A5 1/4 B5 1/2 E5 1/2 G5 1/2 D6 1/1 D6 1/2 G5 1/1 G5 1/2 C6 1/4 B5 1/4 D6 1/1 G5 1/1
```

超级马里奥，length=10 Interval=0

```
A6 8 P8 A6 8 P4 P8 A6 8 P4 P8 F6 8 P8 A6 8 P4 P8 C7 8 P4 P4 P4 P8 C6 8
```

Axel F theme a.k.a Crazy Frog，length=15 Interval=0

```
F5 4 P4 G#5 4 P8 F5 8 P8 F5 8 A#5 4 F5 4 D#5 4 F5 4 P4 C6 4 P 8 F5 8 P8 F5 8 C#6 4 C6 4 G#5 4 F5 4 C6 4 F6 4 F5 8 D#5 8 P8 D#5 8 C5 4 G5 4 F5 1
```

Frozen - Let It Go theme，length=15 Interval=0

```
B5 4 C#6 4 D6 1 P2 A5 8 P8 A5 8 P8 E6 1 P2 P4 D6 2 B5 8 P8 B5 8 P8 B5 8 P4 P8 B5 4 C#6 2 D6 1
```

Europe - Final Countdown ，length=15 Interval=0

```
P2 P4 D#6 8 C#6 8 D#6 2 G#5 2 P2 P4 E6 8 D#6 8 E6 8 P8 D#6 8 P8 C#6 2 P2 P4 E6 8 D#6 8 E6 2 G#5 2 P2 P4 C#6 8 B5 8 C#6 8 P8 B5 8 P8 A#5 8 P8 F#6 8 P8 G#6 4
```

Pirates of the Caribbean，length=9 Interval=0

```
D5 4 F5 4 G5 4 P4 G5 4 P4 G5 4 A5 4 A#5 4 P4 A#5 4 P4 A#5 4 C6 4 A5 4 P4 A5 4 P 4 G5 4 F5 4 F5 4 G5 4
```

Super Mario got Mushroom，length=5 Interval=0

```
C6 8 G5 8 C6 8 E6 8 G6 8 C7 8 G6 8 G#5 8 C6 8 D#6 8 G#6 8 D#6 8 G#6 8 C7 8 D#7 8 G#7 8 D#7 8 D6 8 F6 8 A#6 8 F6 8 A#6 8 D7 8 F7 8 D7 8 F7 8 A#7 8 F7 8
```

fireworks，length=13 Interval=1

```
G#6 4 D#7 4 C#7 4 C7 4 A#6 4 A#6 1 P2 G#6 4 C7 1 P4 D#7 4 C#7 4 C7 4 A#6 4 A#6 1 P2 G#6 4 C7 1 P4 D#7 4 C#7 4 C7 4 A#6 4 A#6 2 P4 A#6 2 P4 A#6 1 P4 G#6 4 D#7 4 C#7 4 C7 4 A#6 4 A#6 2 P4 A#6 2 P4 A#6 4 G#6 1 P4 P1
```

学猫叫，length=10 Interval=0
```
电调①:
F#6 2 G#6 2 A#6 2 C#6 2 F#6 2 A#6 2 A#6 1 G#6 2 F#6 2 P1 P1 C#7 1 F#6 2 F6 2 P1 P1 F#6 1 F6 2 F#6 2 F6 2 F#6 2 F6 2 D#6 2 C#6 1 P1 P1 P1 D#6 1 C#6 2 A#5 2 C#6 2 A#5 2 C#6 2 G#6 2 F#6 1 P2 C#6 2 P1 P1 C#7 2 F#6 2 F#6 2 A#6 2 G#6 1 G#6 1 

电调②：
P1 P1 P1 P1 P1 G#6 2 C#7 2 C#7 2 C#7 2 P1 P1 D#4 2 A#5 2 D#5 2 A#5 2 F5 2 A#5 2 F#5 2 A#5 2 P1 P1 P1 C#6 2 C#6 2 B4 2 F#5 2 B5 2 F#5 2 C#5 2 F#5 2 D#5 2 F#5 2 P1 P1 P1 P1 G#4 2 D#5 2 G#5 2 D#5 2 A#5 2 D#5 2 B5 2 D#5 2 P1 P1

电调③：
P1 P1 P1 P1 P1 F4 2 C#5 2 F5 2 C#5 2 G#5 2 C#5 2 F5 2 C#5 2 F#6 2 F#6 2 F#6 2 F#6 2 P1 P1 P1 P1 P1 P1 D#6 2 D#6 2 D#6 2 D#6 2 P1 P1 A#4 2 F#5 2 A#5 2 F#5 2 C#5 2 F#5 2 A#5 2 F#5 2 A#6 2 A#6 2 A#6 2 B6 2 P1 P1 P1 P1

电调④:
P1 F#4 2 C#5 2 F#5 2 C#5 2 G#5 2 C#5 2 A#5 2 C#5 2 G#6 2 C#7 2 C#7 2 C#7 2 P1 P1 P1 P1 P1 P1 C#4 2 A#5 2 C#5 2 A#5 2 F5 2 A#5 2 C#5 2 A#5 2 P1 P1 P1 P1 P1 P1 P1 P1 P1 P1 P1 P1 P1 P1 
```



## Youtube 音乐库

有现成的做好的音乐，可以直接拿来使用，下面是两个佬的连接，可以试听，然后再用下面的代码去配置音乐

Rox Wolf

> https://www.youtube.com/channel/UCXSNkOZTJRTYxLasw243LFw

Ninja Sause

> https://www.youtube.com/channel/UC06UShFSJWiSjZNX3aycY0g/featured



## 乐理基础

说了半天，其实BLH也是基于乐理来设置的声音，所以这里学习一下基础乐理，这样就可以自己把简谱直接翻译成BLH的电调音乐了

- note 音名
- tempo 节拍速度 对应的就是 **Gen. Length**
- note spacing 就是指音符之间的间隔时间 对应的就是**Gen. Interval**
- Octave 八度，音组，或者说是key

#### 音名

音名分为 C、D、E、F、G、A、B，对应成简谱中的 1，2，3，4，5，6，7

如果发生半音变化，高半音用升号，也就是#来表示，比如 C#

低半音用降记号b来表示，比如Db

而相邻的音相差了一个全音，所以C# 就等于 Db

这之中有两个特殊的，E与F只相差了半音，所以没有E# Fb，同理B与C也相差半音，所以也没有

#### 音符

音符有很多

```
1/1
1/2
1/4
1/8
1/16
```

音符表示时间长短，但是这个时间是相对的

而一个谱中在开头的地方一般会标明是4/4，3/4，2/4后面的4说的就是以谁为一拍

比如4/4，就是以1/4音符为一拍，那么对应的1/2就是2拍时间，一小节是4拍

而如果是3/8，那就是以1/8音符为一拍，那么对应的1/4音符就是2拍时间，一小节是3拍

而有了这些，并不知道一拍的具体时间，一般谱子上会再标记一个，每分钟多少拍。

比如每分钟120拍，那么就是0.5秒为一拍的时间，对应这个音也就是小于等于0.5秒的时间

####  音组

音组是基于C也就是1的调，基于他升多少个调，如果升4，也就是C4 = F调，同理5、6、7

#### 其他

- 下点：降调，也就是降一个八度，从5->4
- 上点：升调，也就是升一个八度，从4->5
- 一个下划线是除2，也就是变成1/8音符
- 二个下划线就是除4，也就是变成1/16音符
- ---是相同的音，但是BLH不能表现这种连音，所以只能用一个来表示
- 弧线是连音，BLH也不能表现这种，所以就发相同的好了
- |表示小节的划分，一个小节根据规定好的是几个拍子
- 2/4 3/4 4/4 表示以几分音符作为一个小节并且一个小节有几拍

懂了这些基本就可以开始dump一个简谱或者几个小节了

## 简谱自动转换成BLH电音

![SMMS](https://i.loli.net/2020/06/12/rlgDSeYWsh1by2n.png)



这里以打上火花的这几个小节为例子，说明具体转换，首先简谱首部给出了这个使用F调，其实也就是C4，对应的音组也就是4，然后4/4以4分音符为一拍

![SMMS](https://i.loli.net/2020/06/12/IBzfLh3MWdYUwsk.png)

可以看到这个谱中，音符最低都是1/16了，而BLH不支持，那么为了解决这个呢，可以选择升音符，让原本的1/4变成1/2，而1/8就变成了1/4，对应的这个1/16音符也就能表示出来的，下面给出两个升和不升的版本，不升的版本直接使用1/8音符代替所有1/16音符，然后可以看到实际是96拍一分钟，也就是说实际比length=8的0.5秒一拍，要慢一些大概是0.625一拍，那么对应的大概length=10左右吧

```
# 前俩小节
C48 E48 A48 C48 D48 E48 P8 C48 D48 E48 D48 C48 C48 A48 B48 C48 B48 A48 G48 E48 G48

# 前俩小节-音符提升
C44 E44 A44 C44 D44 E44 P4 C48 D48 E44 D48 C48 C44 A48 B48 C44 B48 A48 G44 E48 G48
```

不过由于这一小节没啥抓耳的地方，所以我又改了下面一段

![SMMS](https://i.loli.net/2020/06/12/XOb1NsTWIH8PZ4x.png)

由于是简体，对于我这个不熟悉音乐的人来说要从123转换到CDE还是有点麻烦的，所以这里记录一下这里音乐的raw数据

规则如下:

- 第一个数字表示1234567的音名
- 第二个数字表示key，实际中遇到低音的时候（下点）我将他们降了一个八度，也就是key值-1，所以dump的时候要注意一下如果低8，那就直接降值，但是最后用升key方式来解决原本不存在的音组
- 第三个数字表示实际音符，比如1/8或者1/4或者1/16，而16实际表示不出来，所以这里用F来表示
- 使用空格来区分每个音

```
348 54F 34F 248 148 63F 148 24F 248 08 348 54F 34F 248 148 63F 148 14F 148 08 348 54F 34F 248 08 34F 548 54F 54F 648 54F 44F 348
```

然后有了以上的raw数据，我就可以转换成下面的BLH数据，同时我参考了一下原版唱的时候的速度，发现这一段大概用了10秒，而BLH实际上用最长的Length和最长的interval也就勉强8-9秒吧

key4版本，这个版本试听还可以，但是实际电调播放的时候声音非常小，低沉的不行，所以才有后面的版本

Length = 15,Interval=14或者Length = 14,Interval=15

```
E44 G48 E48 D44 C44 A48 C44 D48 D44 P4 E44 G48 E48 D44 C44 A48 C44 C48 C44 P4 E44 G48 E48 D44 P4 E48 G44 G48 G48 A44 G48 F48 E44
```

key5版本，升key以后就都还行

```
E54 G58 E58 D54 C54 A48 C54 D58 D54 P4 E54 G58 E58 D54 C54 A48 C54 C58 C54 P4 E54 G58 E58 D54 P4 E58 G54 G58 G58 A54 G58 F58 E54
```

key6版本

```
E64 G68 E68 D64 C64 A58 C64 D68 D64 P4 E64 G68 E68 D64 C64 A58 C64 C68 C64 P4 E64 G68 E68 D64 P4 E68 G64 G68 G68 A64 G68 F68 E64
```

key7版本

```
E74 G78 E78 D74 C74 A68 C74 D78 D74 P4 E74 G78 E78 D74 C74 A68 C74 C78 C74 P4 E74 G78 E78 D74 P4 E78 G74 G78 G78 A74 G78 F78 E74
```



基于以上的使用，写了一个python小脚本，负责处理从简谱dump下来的数据，将其转换为BLH的音乐格式

- 简谱dump的数据保存在raw_music中
- 生成的BLH数据保存在BLH_music中

```python
import sys
import os

# up key,default is 0 replace "4"
key = 0
# it's depends on wether use 1/16 or F
up_note = True

f = open(os.path.dirname(__file__) + "/raw_music.txt")
raw_music = f.read()
f.close()
print raw_music

note_list = raw_music.split(' ')

pitch_names = {"1": "C", "2": "D", "3": "E", "4": "F", "5": "G", "6": "A", "7": "B","0":"P"}
up_notes = {"1": "1", "2": "1", "4": "2", "8": "4", "F": "8"}

new_note_list = []
for note in note_list:
    print note
    if note[0] != "0":
        # a regular note
        new_note = pitch_names[note[0]]
        if note[1] < "7":
            new_note +=chr(ord(note[1])+key)
        else:
            new_note += note[1]

        if up_note:
            new_note += up_notes[note[2]]
        else:
            new_note += note[2]
    else:
        # a silent note
        # a regular note
        new_note = pitch_names[note[0]]
        if up_note:
            new_note += up_notes[note[1]]
        else:
            new_note += note[1]
    new_note_list.append(new_note)

print new_note_list

f = open(os.path.dirname(__file__) + "/BLH_music.txt", 'w')
data = ' '
f.write(data.join(new_note_list))
f.close()

```

## BLH music协议包

通过写入马里奥的音乐，验证，实际上音乐也是包含在之前的256字节的包中的，所以只要dump到256的设置包，音乐就能设置了，如果要不同电调不同音乐那么就是多dump几次而已，下面协议包和我之前分析的一样。

```
FD 00 40 90 C1 
FD 00 40 90 C1 
FD 00 40 90 C1 
#第一次读
FF 00 7C 00 10 D4 
30

03 00 00 F0 
E2 7F B0 FF 6D 76 C1 A9 67 CF 16 5E F9 AD 80 39 9C BA 5D 8A A0 7C 79 F6 1D 29 08 91 43 98 E7 11 71 D0 AA EA DF B5 BF 4A 9C 83 9B F5 D4 59 61 CD A6 58 CF 84 E7 32 F0 46 8E 9B 7B 9C 57 0D DE 9E 85 08 4C A9 E0 7A 55 63 8D 70 A0 55 C2 30 D3 2B 86 3E D8 1C EA A4 04 07 20 EA 44 DB EC 0B 91 9B 0D D8 7D 99 83 49 6F 31 53 A7 5A C7 AD AC 1B DF 6E BA 6A AF 05 A0 AF 1F CF 91 46 DC 00 CC 3F 3B 82 25 8F C0 81 E8 C1 7C 57 27 20 B0 97 F8 3F D8 15 C1 14 DC 1B 7A FC 73 57 84 0C 58 3A 3C 3A 4D 68 0B 10 33 40 B5 72 F8 6C 64 0B C5 C0 06 C8 40 54 77 33 E9 E8 3B 85 39 83 D9 E5 8B 9B D4 DB AE 31 35 40 E1 48 AF 78 A1 47 7A 62 94 E7 4B E4 5C 9B A0 C5 2E FE 34 87 2E D4 3A 54 13 E2 F1 32 8F A9 D3 AC 20 16 1D FB 69 86 8E 59 A5 66 6B AD 07 8E 91 23 44 0D 01 64 ED D2 E5 80 7C 51 60 F3 D5 4F BC 
30 

FF 00 EB 00 7E E4 
30 

03 10 01 3C 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
30 

FF 00 F7 AC 76 59 
30 
03 10 01 3C 
41 00 4F 00 11 57 42 46 36 36 34 20 DE 06 EC 05 26 BF 
30 

#第一次写
FF 00 7C 00 10 D4 
30 

FE 00 01 00 30 78 
22 A5 13 73 57 A2 1D C5 52 F2 B4 37 37 ED 02 B6 CB EF 27 8B F5 F4 35 C7 4A C5 7B AC 56 FA 8D 54 05 2D 32 BD B4 1E A2 8D 16 56 29 A5 BB C3 1F C9 06 4E 20 37 7B BD DC 0F A4 DD B5 E4 1E 9D E0 69 E3 40 A8 04 EB E3 13 3B B5 EC 91 A9 A1 44 73 00 B7 31 61 01 F1 A0 C2 03 13 1B D0 96 63 D0 A3 8E 03 A7 A2 0B 6C 6A 12 9C B2 6F F8 C0 9C 8F 27 7A 67 5B C3 3B 85 9F D5 1E 5B EE C9 B7 9E F2 43 0D B9 23 E2 98 8E C5 94 4C 02 7B 0D 58 93 E2 E5 FB C5 0D AA 39 77 35 4E 01 64 1E 61 B5 54 9C D8 15 CE BC 85 A7 13 47 01 5B 74 B6 BF 9C 8A E0 35 99 12 61 FD AE 6D 8F E8 02 E9 A0 06 3D 7F F4 49 9C C9 88 C3 98 57 DE B4 FE 70 BA 1A 6B EA 46 36 90 0A 99 0F 1D D2 AF E9 2B 00 1D 19 DA 03 A2 40 56 19 F4 62 D0 07 EB AE 12 AC 0D DB 45 AD F4 00 0F 77 EF 93 D4 E5 AB C7 1D A0 FB E2 F9 EA 0C 83 0E 5E EB 
30 

01 01 C0 50 
30 

#第二次读
FF 00 7C 00 10 D4 
30 

03 00 00 F0 
02 A2 16 6A CC 47 0A BA D2 B9 61 64 01 08 9A FD E1 7F CB 85 46 40 93 EC 4C 22 5B EC 92 F1 82 ED DD 22 00 31 4F 48 4D 60 76 C2 F5 08 AB AE 76 0B 7F 40 59 07 A5 82 1F 77 E3 AB 21 DA 8B 4E 0C 53 8F E5 AD C3 37 51 89 E6 D9 F4 03 8F BD 43 6B 19 82 96 21 91 5A 63 F1 D9 9B BF 5A 0D 05 2A 5A E9 D9 EB 8E F3 F1 57 5D 17 FC B1 1A 2C 16 74 B8 7E 98 A6 0F B4 13 B0 01 9C F8 B9 8E D9 05 69 EE E6 C0 28 AF 9F 97 8D A8 B3 B9 52 EC EF FA 7C 33 C4 BA 6E B5 70 73 3E B5 F9 3D 23 7B A1 12 90 4C B7 65 D9 FB 0F C2 F5 53 99 49 64 44 49 88 42 97 51 A4 C9 22 0E C2 5E BC 8D 20 31 B4 C9 B1 08 A0 D0 76 7F 67 B7 83 CC 65 FC CE A4 0A A4 64 F2 B3 F3 9F 59 D4 2C 66 97 E5 7E C8 CF FA 05 8F DF 93 DE B8 25 36 60 0A D0 03 75 65 8B DF F2 E3 F3 B9 60 8A C6 6F 9A A3 48 0F 49 42 CB 59 1E FB 05 27 66 D4 8F 
30 

FF 00 EB 00 7E E4 
30 

03 10 01 3C 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
30 

FF 00 F7 AC 76 59 
30 

03 10 01 3C 
41 00 4F 00 11 57 42 46 36 36 34 20 DE 06 EC 05 26 BF 
30

FD 00 40 90 C1 

#第三次读
FF 00 7C 00 10 D4 
30 

03 00 00 F0 
D9 4C 3B 8F 09 6C F1 1F 8C C5 6B D4 CF 9E 86 A1 DF FF 60 F3 17 74 AA 37 72 8E 26 11 B2 5F 2E D6 3D A7 62 C1 50 F3 A2 F5 2C 75 37 D1 FA 84 75 6F CD 44 F0 DA 1B 9F DA 40 FB E1 ED 6E 59 F3 DB 1E 9C 22 92 A0 01 B0 E8 5C 99 37 E5 1E 50 EF D9 F5 B3 1C 47 0C 8C 42 CA 8B 42 BC DF 2F CE 6C E8 B4 B8 2B 80 88 F4 CE 86 89 5E 9A A5 96 4C 3F 24 EB C4 3B 08 16 B7 41 90 AC 99 06 A4 17 04 B0 00 EC F5 52 4C BF 9B FC 96 8A 61 9E 4D C1 46 9E 4E 39 4A A2 F6 49 AF 11 E4 36 4E A9 D5 61 89 B0 A1 0B 1A FD 3B 5B 60 00 DF 89 FF D4 38 11 0F B1 AF D8 C4 11 DF 1A 24 E8 A8 82 7F BD F1 AC 91 1A 43 18 88 24 AC A5 E8 8A 2D 3B 4D 90 74 88 0F CF A5 F3 DE 04 4F E4 69 44 5F 79 50 B2 13 DB 9C 31 BE A8 D3 91 9B 56 AB B9 D2 F0 BD 0E 53 12 9E EF 1D 9D A8 D2 78 5C 2D 3D D1 3B 03 D8 8A D5 B8 80 CE 3E FF 83 
30 

FF 00 EB 00 7E E4 
30 

03 10 01 3C 
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 
30 

FF 00 F7 AC 76 59 
30 
03 10 01 3C 
41 00 4F 00 11 57 42 46 36 36 34 20 DE 06 EC 05 26 BF 
30 

FD 00 40 90 C1 
FD 00 40 90 C1 
FD 00 40 90 C1 
FD 00 40 90 C1 

00 01 C1 C0 
30 
```

## Summary

弄完以后回头再看发现，其实还有一些小细节可以提升一下，比如实际dump的时候，不指定key，key的位置变成0，低于当前key是-1，高于则是1，这样的话，在代码里指定基础key，然后根据实际效果来看是否ok

最后感谢一下我群里的小伙伴，悠世、追梦北、银佬帮我解答乐理问题

## Quote

> https://oscarliang.com/blheli-32-custom-startup-tone-music/
>
> http://www.5imx.com/forum.php?mod=viewthread&tid=1446372&_dsign=10da974d
>
> https://www.rcgroups.com/forums/showthread.php?2864611-BLHeli_32-Power-to-perform/page151


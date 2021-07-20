---
layout:     post
title:      "BLHeliSuite32逆向（三）"
subtitle:   "Crack，Reverse"
date:       2021-07-20
update:     2021-07-20
author:     "elmagnifico"
header-img: "img/docker-head-bg.jpg"
catalog:    true
mathjax:    false
tags:
    - crack
    - BLHeli
---

## Foreword

继续之前的，这里开始对配置内容进行解析，由于破解总是头尾一起开始的，所以之前已经先行看到了具体配置是怎么解读的了，只是没详细看内容而已。



## 配置解读

### SetupToControls

这里就比较关键了，找到了数据来源，这里理论上就是数据解析了

```assembly
_Unit139.TBLHeliInterfaceManager.SetupToControls
007D2C78        push        ebx
007D2C79        cmp         word ptr [eax+35A],0;TBLHeliInterfaceManager.?f35A:word
007D2C81>       je          007D2C91
007D2C83        mov         ebx,eax
007D2C85        mov         eax,dword ptr [ebx+35C];TBLHeliInterfaceManager.?f35C:dword
007D2C8B        call        dword ptr [ebx+358];TBLHeliInterfaceManager.FOnSetupToControls
007D2C91        pop         ebx
007D2C92        ret

```

看到这么几句代码，当场自闭，显然这么几句不足以解释清楚这个数据是怎么显示到UI的。

猜测这里有点类似于C#的委托，这里只是允许UI进行更新，实际上UI在另一个线程里已经拿到了数据，并且进行了解析。

```assembly
007D2C8B        call        dword ptr [ebx+358];TBLHeliInterfaceManager.FOnSetupToControls
```

关键是这一句，运行以后，UI才会真的更新，但是这里这是啥意思，我不知道，追的话，基本就看到了各个UI的控件的库函数好像被调用了。



到这里就不行了，必须要看一看SetupToControls和Send_cmd_DeviceReadBLHeliSetupSection之间的内容，看看拿到的这个256字节的数据他是怎么用的。看到这里再跳回到ReadSetupAll去看整个流程。



### 256字节处理

通过分析ReadSetupAll可以看到，从读取到数据到更新UI，只有2个函数，中间流程也很短，这里一步一步分析看看到底做了什么

```assembly
007D5B31        movzx       edx,byte ptr [ebp-5]
007D5B35        mov         eax,dword ptr [ebp-4]
# 读取设置信息，这里就读到了256字节了
007D5B38        call        TBLHeliInterfaceManager.ReadDeviceSetupSection

# 将al中的值给到[ebp-7]的地址中
# OD中显示的实际上是：
# 007D5B3D        mov         byte ptr ss:[ebp-7],al
# 也就是将al的值，存入下面的地址中：从堆栈段寻址ebp-7，然后将这个地址对应的值转换成32位的数据
# 此时 eax的值是1，所以这里al自然就是1
# 此时 ebp的值是0x19F288
007D5B3D        mov         byte ptr [ebp-7],al
# 这里是读取[ebp-4]的给到eax中，应该是在传递参数
# ebp-4对应的地址是0x2864D00
007D5B40        mov         eax,dword ptr [ebp-4]
# 存储信息，这里意义不明，可能需要追看
007D5B43        call        TBLHeliInterfaceManager.BLHeliStored
# 此时eax=0x289D380 ebp=19F288  19F284中存储的是2864D00
007D5B48        mov         edx,dword ptr [ebp-4]
# edx=2864D00 处理后变成2864D44 再次变成0289D000
# 这里理论上应该就是把TBLHeli对象给进去了
007D5B4B        mov         edx,dword ptr [edx+44];TBLHeliInterfaceManager.FBLHeliWork:TBLHeli
# 这里已经写了7D5CE0这里是3，ecx=3
007D5B4E        movzx       ecx,byte ptr ds:[7D5CE0];0x3 gvar_007D5CE0
# 这里这个CopyTo是什么东西，也有可能是处理数据的地方
007D5B55        call        TBLHeli.CopyTo
007D5B5A        mov         eax,dword ptr [ebp-4]
# 将信息显示到控件
# 经过OD调试，发现拿到数据以后，在运行了TBLHeliInterfaceManager.SetupToControls之后UI就更新了，所以数据解析就在这个里面
007D5B5D        call        TBLHeliInterfaceManager.SetupToControls
007D5B62        mov         eax,dword ptr [ebp-4]
```

通过od，可以看到ebp此时的值其实是显示了一个字符串提示，这里应该不是关键

![image-20210713111114465](https://i.loli.net/2021/07/13/LBXIxZ35zqDTHMA.png)

0x2864D00地址的内容：

![image-20210713111309919](https://i.loli.net/2021/07/13/ulMUQykG6fTcRSA.png)



#### BLHeliStored

Stored这里就很简单做了一个字节处理

```assembly
_Unit139.TBLHeliInterfaceManager.BLHeliStored
# 此时eax是0x2564D00，+54以后是0x2564D54 对应的值是0x01
# edx是24003a000b5741539363920的一串数字，不知道是什么
007CC5DC        movzx       edx,byte ptr [eax+54];TBLHeliInterfaceManager.FCurrentESCNum:byte
# 执行完以后edx直接变成1了，所以这里对应注释就是当前esc数量 1
# eax=2864D00 edx=1
# 这里应该是返回值，[eax+edx*4+174]的值是2864E78
# 这里仔细一看其实不就是对象内存大小和ESC的数量有关系，每多一个那么对应大小就要多4个字节
007CC5E0        mov         eax,dword ptr [eax+edx*4+174]
# 执行完以后eax是0x289D380
007CC5E7        ret
```



![image-20210713113317443](https://i.loli.net/2021/07/13/KTCbFRLAny7wdOm.png)

这里数据是大端模式，80是低字节保存在内存的高地址上，而02是数据高字节，保存在内存低地址中

![image-20210713113600249](https://i.loli.net/2021/07/13/ueVkv3TH9FswLmr.png)



#### CopyTo

进入的时候，此时寄存器的值为：

![image-20210713115712289](https://i.loli.net/2021/07/13/u5OabnvVyYQC3wF.png)

额外发现这个CopyTo是经常被调用的，当

![image-20210713154615425](https://i.loli.net/2021/07/13/uk8pNzfZ2RdV7Ov.png)

这两个Tab页面切换的时候，就会自动调用CopyTo.

我仔细对比了这两个Tab的内容，发现其实他们是一模一样的，只是在Setup页面可以设置，而Overview只能查看而已

```assembly
_Unit102.TBLHeli.CopyTo
006E5490        push        ebp
006E5491        mov         ebp,esp
006E5493        add         esp,0FFFFFFF8
006E5496        push        ebx
006E5497        push        esi
006E5498        xor         ebx,ebx
006E549A        mov         dword ptr [ebp-4],ebx
006E549D        mov         byte ptr [ebp-5],cl
006E54A0        mov         esi,edx
006E54A2        mov         ebx,eax
006E54A4        xor         eax,eax
006E54A6        push        ebp
006E54A7        push        6E555C
006E54AC        push        dword ptr fs:[eax]
006E54AF        mov         dword ptr fs:[eax],esp
006E54B2        test        esi,esi
006E54B4>       je          006E5540
006E54BA        call        006DB734
006E54BF        test        al,al
006E54C1>       je          006E54C8
006E54C3        call        006DB87C
006E54C8        cmp         byte ptr [ebx+0C0],1;TBLHeli.FStatus:TSetupStatus
006E54CF>       ja          006E5534
006E54D1        lea         edx,[ebp-4]
006E54D4        mov         eax,ebx
# 这里比较可疑，通过上面的分析，大概指导了这里变成String，其实就是给overview去显示的
006E54D6        call        TBLHeli.WriteSetupToString
006E54DB        test        byte ptr [ebp-5],2
006E54DF>       je          006E54EE
006E54E1        movzx       eax,byte ptr [ebx+0D3];TBLHeli.FBootloaderRev:byte
006E54E8        mov         byte ptr [esi+0D3],al;TBLHeli.FBootloaderRev:byte
006E54EE        xor         ecx,ecx
006E54F0        mov         edx,dword ptr [ebp-4]
006E54F3        mov         eax,esi
# 这里也比较可疑，这里的ReadSetup自然就是给Setup UI界面去显示用的，所以二者是相同的，只需要分析一个即可
006E54F5        call        TBLHeli.ReadSetupFromBinString
006E54FA        test        byte ptr [ebp-5],1
006E54FE>       je          006E553B
006E5500        movzx       eax,byte ptr [ebx+0B9];TBLHeli.FActivationStatus:TActivationStatus
006E5507        mov         byte ptr [esi+0B9],al;TBLHeli.FActivationStatus:TActivationStatus
006E550D        mov         eax,dword ptr [ebx+0C4];TBLHeli.FDshotGoodFrames:Cardinal
006E5513        mov         dword ptr [esi+0C4],eax;TBLHeli.FDshotGoodFrames:Cardinal
006E5519        mov         eax,dword ptr [ebx+0C8];TBLHeli.FDshotBadFrames:Cardinal
006E551F        mov         dword ptr [esi+0C8],eax;TBLHeli.FDshotBadFrames:Cardinal
006E5525        movzx       eax,byte ptr [ebx+0D0];TBLHeli.FInputProtocol:byte
006E552C        mov         byte ptr [esi+0D0],al;TBLHeli.FInputProtocol:byte
# 1.这里会跳转
006E5532>       jmp         006E553B
006E5534        mov         eax,esi
006E5536        call        TBLHeli.Init
# 1.跳转到这里
006E553B        call        006DB89C
006E5540        xor         eax,eax
006E5542        pop         edx
006E5543        pop         ecx
006E5544        pop         ecx
006E5545        mov         dword ptr fs:[eax],edx
006E5548        push        6E5563
006E554D        lea         eax,[ebp-4]
006E5550        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006E5556        call        @DynArrayClear
# 到这里就退出了
006E555B        ret
006E555C>       jmp         @HandleFinally
006E5561>       jmp         006E554D
006E5563        pop         esi
006E5564        pop         ebx
006E5565        pop         ecx
006E5566        pop         ecx
006E5567        pop         ebp
006E5568        ret

```



##### WriteSetupToString

此时寄存器为：

![image-20210713194856526](https://i.loli.net/2021/07/13/dqiIkw8MULOKNCP.png)

```assembly
_Unit102.TBLHeli.WriteSetupToString
006EA9C8        push        ebx
006EA9C9        push        esi
006EA9CA        push        edi
006EA9CB        push        ebp
006EA9CC        add         esp,0FFFFFFF8
006EA9CF        mov         dword ptr [esp],edx
006EA9D2        mov         esi,eax
006EA9D4        push        0C0
006EA9D9        mov         eax,dword ptr [esp+4]
006EA9DD        mov         ecx,1
006EA9E2        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA9E8        call        @DynArraySetLength
006EA9ED        add         esp,4
006EA9F0        mov         ecx,dword ptr ds:[841290];^gvar_00839100
006EA9F6        movzx       ecx,byte ptr [ecx]
006EA9F9        mov         eax,dword ptr [esp]
006EA9FC        mov         eax,dword ptr [eax]
006EA9FE        mov         edx,0C0
006EAA03        call        @FillChar
006EAA08        mov         edi,dword ptr [esp]
006EAA0B        mov         edi,dword ptr [edi]
# 这里是版本修订号 可以看到数据是来自于esi的，而转换就是把数据转存到edi对应的地址里
# 实际上显示只有一个修订好， BLHeli Rev:32.6
# 这里不明确，猜测Main有可能是32
006EAA0D        movzx       eax,byte ptr [esi+4];TBLHeli.FEep_FW_Main_Revision:byte
006EAA11        mov         byte ptr [edi],al
# 猜测这个Sub是.6，二者组合起来形成了32.6的修订号
006EAA13        movzx       eax,byte ptr [esi+5];TBLHeli.FEep_FW_Sub_Revision:byte
006EAA17        mov         byte ptr [edi+1],al
```

![image-20210713171311227](https://i.loli.net/2021/07/13/dsWjTn3G1kqNFOR.png)

OD动态调试看到，esi+4对应的地址值是20，那么也就是32

esi+5，对应的值也就是3C，对应的也就是60，所以版本号应该是32.60,只是UI显示的时候去掉了尾巴的0



```assembly
# 猜测FEep_Layout_Revision 对应的显示是 HAKRC_35A，但是实际上这个值是2A
006EAA1A        movzx       eax,byte ptr [esi+6];TBLHeli.FEep_Layout_Revision:byte
006EAA1E        mov         byte ptr [edi+2],al
# 电压检测，对应的应该是low voltage protectin，这里读取到的是00
006EAA21        movzx       eax,byte ptr [esi+26];TBLHeli.FEep_Hw_Voltage_Sense_Capable:byte
006EAA25        mov         byte ptr [edi+30],al
# 电流检测 这个没找到对应的数据，这里读到的实际上是FF
006EAA28        movzx       eax,byte ptr [esi+27];TBLHeli.FEep_Hw_Current_Sense_Capable:byte
006EAA2C        mov         byte ptr [edi+31],al
006EAA2F        mov         dl,15
006EAA31        mov         eax,esi
# 这个不知道是干嘛的，看里面实现好像也是和电流有关系的
006EAA33        call        TBLHeli.IsParameterHardEnabled
006EAA38        test        al,al
006EAA3A>       je          006EAA5A
# led 0
006EAA3C        movzx       eax,byte ptr [esi+28];TBLHeli.FEep_Hw_LED_Capable_0:byte
006EAA40        mov         byte ptr [edi+32],al
# led 1
006EAA43        movzx       eax,byte ptr [esi+29];TBLHeli.FEep_Hw_LED_Capable_1:byte
006EAA47        mov         byte ptr [edi+33],al
# led 2
006EAA4A        movzx       eax,byte ptr [esi+2A];TBLHeli.FEep_Hw_LED_Capable_2:byte
006EAA4E        mov         byte ptr [edi+34],al
# led 3
006EAA51        movzx       eax,byte ptr [esi+2B];TBLHeli.FEep_Hw_LED_Capable_3:byte
006EAA55        mov         byte ptr [edi+35],al
006EAA58>       jmp         006EAA6A
# 不知道是什么全设置为了0
```

![image-20210713172521627](https://i.loli.net/2021/07/13/tyWd2vlFI5J93SL.png)

这里是led是否存在，00表示不存在，最多可以支持4个led，我这里只有3个，所以是01，02，03，00

```assembly
006EAA5A        mov         byte ptr [edi+32],0
006EAA5E        mov         byte ptr [edi+33],0
006EAA62        mov         byte ptr [edi+34],0
006EAA66        mov         byte ptr [edi+35],0
# 这里是判定版本号，如果和29相等，就跳过这里的Note的配置，其实就是不支持音乐
006EAA6A        cmp         byte ptr [esi+6],29;TBLHeli.FEep_Layout_Revision:byte
006EAA6E>       jb          006EAA94
# 无阻尼模式，实际值01
006EAA70        movzx       eax,byte ptr [esi+2F];TBLHeli.FEep_Nondamped_Capable:byte
006EAA74        mov         byte ptr [edi+3F],al
# 这里是音乐的节拍速率 对应 Music Note Config，实际值为50，而我选的是长度为5，interval为0
006EAA77        movzx       eax,byte ptr [esi+20];TBLHeli.FEep_Note_Config:byte
006EAA7B        mov         byte ptr [edi+1C],al
006EAA7E        lea         edx,[edi+90]
# 这里的这个是音乐节拍的速度 对应 Startup Music Data
006EAA84        lea         eax,[esi+80];TBLHeli.FEep_Note_Array:TEep_Note_Array
006EAA8A        mov         ecx,30
# 很奇怪的函数，先标注一下
006EAA8F        call        Move
```

这里应该是edx和eax，ecx都作为参数传入到Move里面，然后Move就是把eax地址的值搬运到edx中，搬运长度为ecx个，也就是0x30个字节

![image-20210713174328881](https://i.loli.net/2021/07/13/omGb87KYdqzkT9P.png)

那么图中的高亮部分，就是实际音乐的节拍数组，下面是我的实际节拍，就会发现他是一一对应的，剩余的FF是没使用到的

![image-20210713175101811](https://i.loli.net/2021/07/13/QhOYsw4RFSzimqp.png)

但是分析到这里，我又对了一下发送的256数据，发现hex的内容和实际接收发送的数据对不上，而ESI地址中的数值又是谁赋进去的，需要找到这个，发现ESI是在CopyTo时EDX给进来的，然后edx又是ebp给进来的，实际上又是来自于ebp，从堆栈中取出来的。到这里就发现虽然数据可以解析了，但是解析的数据并不是原生的256字节，所以又要回去找读取的时候数据是怎么处理的（关键变成谁给0x2864D00或者0x289D000地址赋得值）

```assembly
# 这里判定FEep_Layout_Revision<2C,所以跳转了
006EAA94        cmp         byte ptr [esi+6],2C;TBLHeli.FEep_Layout_Revision:byte
# 1.这里跳转了
006EAA98>       jb          006EAAB4
# 这里判断pwm频率是否大于最大或者小于最小值，是的话就不会设置这个值，不是的话才会读取这个pwm频率
006EAA9A        cmp         byte ptr [esi+2C],0FF;TBLHeli.FEep_Hw_Pwm_Freq_Min:byte
006EAA9E>       jae         006EAAB4
006EAAA0        cmp         byte ptr [esi+2D],0FF;TBLHeli.FEep_Hw_Pwm_Freq_Max:byte
006EAAA4>       jae         006EAAB4
# 读取pwm的最大最小频率
006EAAA6        movzx       eax,byte ptr [esi+2C];TBLHeli.FEep_Hw_Pwm_Freq_Min:byte
006EAAAA        mov         byte ptr [edi+36],al
006EAAAD        movzx       eax,byte ptr [esi+2D];TBLHeli.FEep_Hw_Pwm_Freq_Max:byte
006EAAB1        mov         byte ptr [edi+37],al
# 1.跳到这里 感觉像是一个if else if 的判断，这里FEep_Layout_Revision<2D 所以继续
006EAAB4        cmp         byte ptr [esi+6],2D;TBLHeli.FEep_Layout_Revision:byte
# 2.继续跳转
006EAAB8>       jb          006EAAC1
# 说白了这个电调就没有运动模式，所以这个设置不存在
006EAABA        movzx       eax,byte ptr [esi+2E];TBLHeli.FEep_SPORT_Capable:byte
006EAABE        mov         byte ptr [edi+3E],al
# 2.跳到这里继续
006EAAC1        lea         edx,[edi+40]
006EAAC4        lea         eax,[esi+30];TBLHeli.FEep_ESC_Layout:TESC_Layout
006EAAC7        mov         ecx,20
006EAACC        call        Move
# 把对应地址写入
006EAAD1        lea         edx,[edi+60]
# 这里加载了MCU的类型还是什么？
006EAAD4        lea         eax,[esi+50];TBLHeli.FEep_ESC_MCU:TESC_MCU
006EAAD7        mov         ecx,20
006EAADC        call        Move
# 这里应该是循环初始化 bl一开始等于4，后续结束循环需要看bl<0x1F
006EAAE1        mov         bl,4
# 感觉这里应该是有一个公用参数表，这里依次对各个参数进行初始化的样子
# 5.跳转到这里，下一步走到3，继续跳转
006EAAE3        mov         eax,ebx
006EAAE5        call        006DEB4C
006EAAEA        movzx       eax,al
006EAAED        mov         dword ptr [esp+4],eax
006EAAF1        cmp         dword ptr [esp+4],0FF
006EAAF9>       je          006EAB91
006EAAFF        mov         bp,0FFFF
006EAB03        mov         edx,ebx
006EAB05        mov         eax,esi
# 检测是否是有效参数
006EAB07        call        TBLHeli.IsParameterValid
006EAB0C        test        al,al
006EAB0E>       je          006EAB2B
006EAB10        mov         edx,ebx
006EAB12        mov         eax,esi
# 如果有效，那么获取参数的值
006EAB14        call        TBLHeli.GetParameterValue
006EAB19        mov         ebp,eax
006EAB1B        cmp         bl,0E
# 3.这里跳转
006EAB1E>       jne         006EAB62
006EAB20        test        bp,bp
006EAB23>       jbe         006EAB62
006EAB25        add         bp,18
006EAB29>       jmp         006EAB62
006EAB2B        mov         edx,ebx
006EAB2D        mov         eax,esi
# 这里判定参数是否存在，不是很明白什么意思
006EAB2F        call        TBLHeli.IsParameterExisting
006EAB34        test        al,al
006EAB36>       je          006EAB62
006EAB38        mov         eax,ebx
006EAB3A        sub         al,0F
006EAB3C>       je          006EAB48
006EAB3E        sub         al,6
006EAB40>       je          006EAB57
006EAB42        sub         al,3
006EAB44>       je          006EAB57
006EAB46>       jmp         006EAB62
006EAB48        mov         eax,esi
# 这里理解为 为了保护而故意强制使能某个参数，看了一眼里面的实现还是和电流相关的，这里应该没有这个问题，跳过吧。
006EAB4A        call        TBLHeli.IsCurrentProtectionFalselyHardEnabled
006EAB4F        test        al,al
006EAB51>       je          006EAB62
006EAB53        xor         ebp,ebp
006EAB55>       jmp         006EAB62
006EAB57        mov         edx,ebx
006EAB59        mov         eax,esi
# 相当于是说获取这个参数的默认值
006EAB5B        call        TBLHeli.GetParameterValueDefault
006EAB60        mov         ebp,eax
# 3.跳到这里继续
006EAB62        mov         eax,dword ptr [esp]
006EAB65        mov         eax,dword ptr [eax]
006EAB67        mov         edx,dword ptr [esp+4]
006EAB6B        mov         ecx,ebp
006EAB6D        and         cl,0FF
006EAB70        mov         byte ptr [eax+edx],cl
006EAB73        mov         eax,ebx
006EAB75        call        006DEB58
006EAB7A        cmp         al,1
# 4.这里跳转
006EAB7C>       jbe         006EAB91
006EAB7E        mov         eax,dword ptr [esp]
006EAB81        mov         eax,dword ptr [eax]
006EAB83        mov         edx,dword ptr [esp+4]
006EAB87        mov         ecx,ebp
006EAB89        shr         cx,8
006EAB8D        mov         byte ptr [eax+edx+1],cl
# 4.这里继续
006EAB91        inc         ebx
006EAB92        cmp         bl,1F
# 5.这里继续跳
006EAB95>       jne         006EAAE3
# 当上面3-5的循环完成以后，继续往下走
006EAB9B        lea         eax,[edi+80]
006EABA1        mov         cx,20
006EABA5        mov         edx,10
006EABAA        call        @FillChar
006EABAF        lea         edx,[edi+80]
# 这里才是ESC Name的赋值
006EABB5        lea         eax,[esi+70];TBLHeli.FEep_Name:TESC_Name
006EABB8        mov         ecx,10
006EABBD        call        Move
006EABC2        mov         al,1
006EABC4        pop         ecx
006EABC5        pop         edx
006EABC6        pop         ebp
006EABC7        pop         edi
006EABC8        pop         esi
006EABC9        pop         ebx
006EABCA        ret

```



## Summary

未完待续...



## Quote

>https://www.52pojie.cn/thread-615448-1-1.html
>
>http://www.youngroe.com/2019/07/01/Windows/delphi_reverse_summary/
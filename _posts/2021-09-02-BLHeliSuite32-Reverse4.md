---
layout:     post
title:      "BLHeliSuite32逆向（四）"
subtitle:   "Crack，Reverse"
date:       2021-09-02
update:     2022-02-16
author:     "elmagnifico"
header-img: "img/bg5.jpg"
catalog:    true
mathjax:    false
tags:
    - Crack
    - BLHeli
---

## Foreword

本来以为继上次破解之后，就不需要再破了。哎呀，没想到BLH竟然还有一个测试版本的软件：BLHeliSuite32TestActivator。

最强的还是他存在测试版本的固件，测试固件是无法使用正式版进行写参数，个别固件可以直接读取参数，但是不能写，也不能刷Flash。

而由于需要使用测试固件，所以又需要把他给整合进去。测试协议发现，协议只有一点小变动，估计是和测试有关系的。而关键的读写配置基本保持了一致，所以直接dump了一份raw数据进行破解。



然而解密后的数据，发现完全对不上，找不到熟悉的字符串了。直接把之前的配置信息强行写入也会发现电调出现奇怪的声音，明显是写错配置了。

基于这样只好再来一次破解了，不过有经验以后就简单多了。



## 参考流程

由于有之前的流程，所以这里直接参考

```
actReadSetupExecute 按键act
 DoBtnReadSetup 按键具体操作
  ReadSetupAll 读取配置信息
   ReadDeviceSetupSection 这里是操作去读
    Send_cmd_DeviceReadBLHeliSetupSection 发送读取命令，执行后就拿到了256字节
    ReadSetupFromBinString 这里就是关键，解析读上来的字符串，然后赋值给了BLHeli的各个参数
     TBLHeli.Init 参数存储的对象初始化
     BLHeliSu.006EA090 解密开始的函数
      BLHeliSu.006E1B48 解密循环函数
       BLHeliSu.006E1960 内存可读的开始
        BLHeliSu.006D5A78 偏移操作的函数
    ReadSetupFromBinString 的后续内容会读取所有配置，然后给BLHeli对象赋值
    
    ReadDeviceActivationStatus 第二次读，由于和电调配置无关,具体数据没解析
    ReadDeviceUUID_Str 第三次读，由于和电调配置无关,具体数据没解析
    
   CopyTo 这里就开始涉及显示的东西，其实就是给参数赋值
    WriteSetupToString
    ReadSetupFromBinString
   SetupToControls 这里是把内容处理，显示到ui上
    OnSetupToControls 刷新UI
```



## 二次破解

不过这里发现有写函数找不到了。比如：actReadSetupExecute，DoBtnReadSetup，ReadSetupAll，ReadDeviceSetupSection，这些上层函数入口我都没找到了，但是关键的ReadSetupFromBinString还是存在的。于是直接从ReadSetupFromBinString入手，目标是BLHeliSu.006E1B48的对应函数。



### ReadSetupFromBinString

```assembly
_Unit109.TBLHeli.ReadSetupFromBinString
007213BC        push        ebp
007213BD        mov         ebp,esp
007213BF        push        ecx
007213C0        mov         ecx,0A
007213C5        push        0
007213C7        push        0
007213C9        dec         ecx
007213CA>       jne         007213C5
007213CC        push        ecx
007213CD        xchg        ecx,dword ptr [ebp-4]
007213D0        push        ebx
007213D1        push        esi
007213D2        push        edi
007213D3        mov         byte ptr [ebp-0D],cl
007213D6        mov         ebx,edx
007213D8        mov         dword ptr [ebp-8],eax
007213DB        xor         eax,eax
007213DD        push        ebp
007213DE        push        721A0F
007213E3        push        dword ptr fs:[eax]
007213E6        mov         dword ptr fs:[eax],esp
007213E9        mov         eax,dword ptr [ebp-8]
007213EC        call        TBLHeli.Init
007213F1        mov         byte ptr [ebp-0E],4
007213F5        xor         ecx,ecx
007213F7        push        ebp
007213F8        push        7219C0
007213FD        push        dword ptr fs:[ecx]
00721400        mov         dword ptr fs:[ecx],esp
00721403        mov         edx,ebx
00721405        mov         eax,edx
00721407        test        eax,eax
00721409>       je          00721410
0072140B        sub         eax,4
0072140E        mov         eax,dword ptr [eax]
00721410        mov         dword ptr [ebp-0C],eax
00721413        cmp         dword ptr [ebp-0C],0F800
0072141A>       jle         0072144B
0072141C        mov         eax,edx
0072141E        test        eax,eax
00721420>       je          00721427
00721422        sub         eax,4
00721425        mov         eax,dword ptr [eax]
00721427        sub         eax,0F800
0072142C        mov         dword ptr [ebp-0C],eax
0072142F        mov         eax,dword ptr [ebp-0C]
00721432        push        eax
00721433        lea         eax,[ebp-4]
00721436        push        eax
00721437        mov         ecx,0F800
0072143C        mov         edx,dword ptr ds:[404BA0];TArray<System.Byte>
00721442        mov         eax,ebx
00721444        call        @DynArrayCopyRange
00721449>       jmp         0072149A
0072144B        cmp         dword ptr [ebp-0C],7C00
00721452>       jle         00721483
00721454        mov         eax,edx
00721456        test        eax,eax
00721458>       je          0072145F
0072145A        sub         eax,4
0072145D        mov         eax,dword ptr [eax]
0072145F        sub         eax,7C00
00721464        mov         dword ptr [ebp-0C],eax
00721467        mov         eax,dword ptr [ebp-0C]
0072146A        push        eax
0072146B        lea         eax,[ebp-4]
0072146E        push        eax
0072146F        mov         ecx,7C00
00721474        mov         edx,dword ptr ds:[404BA0];TArray<System.Byte>
0072147A        mov         eax,ebx
0072147C        call        @DynArrayCopyRange
00721481>       jmp         0072149A
00721483        mov         eax,dword ptr [ebp-0C]
00721486        push        eax
00721487        lea         eax,[ebp-4]
0072148A        push        eax
0072148B        xor         ecx,ecx
0072148D        mov         edx,dword ptr ds:[404BA0];TArray<System.Byte>
00721493        mov         eax,ebx
00721495        call        @DynArrayCopyRange
0072149A        cmp         dword ptr [ebp-0C],90
007214A1>       jge         007214B1
007214A3        mov         byte ptr [ebp-0E],6
007214A7        call        @TryFinallyExit
007214AC>       jmp         007219CA
007214B1        mov         edx,dword ptr ds:[9E0C6C];^gvar_009DA2B8
007214B7        movzx       edx,byte ptr [edx]
007214BA        mov         eax,dword ptr [ebp-4]
007214BD        call        0070AA50
007214C2        test        al,al
007214C4>       je          007214D4
007214C6        mov         byte ptr [ebp-0E],5
007214CA        call        @TryFinallyExit
007214CF>       jmp         007219CA
007214D4        push        ebp
007214D5        call        00720EA0

```

经过位置对比，调用解密的函数应该就是这个00720EA0



### sub_00720EA0

```assembly
_Unit109.sub_00720EA0
00720EA0        push        ebp
00720EA1        mov         ebp,esp
00720EA3        push        0
00720EA5        push        ebx
00720EA6        xor         eax,eax
00720EA8        push        ebp
00720EA9        push        7213AE
00720EAE        push        dword ptr fs:[eax]
00720EB1        mov         dword ptr fs:[eax],esp
00720EB4        mov         eax,dword ptr [ebp+8]
00720EB7        mov         eax,dword ptr [eax-8]
00720EBA        mov         byte ptr [eax+0BA],0
00720EC1        mov         eax,dword ptr [ebp+8]
00720EC4        mov         eax,dword ptr [eax-4]
00720EC7        lea         edx,[eax+60]
00720ECA        mov         eax,dword ptr [ebp+8]
00720ECD        mov         eax,dword ptr [eax-8]
00720ED0        call        TBLHeli.ReadMCU
00720ED5        mov         ebx,eax
00720ED7        cmp         bl,4
00720EDA>       jne         00721390
00720EE0        mov         eax,dword ptr [ebp+8]
00720EE3        cmp         dword ptr [eax-0C],0C0
00720EEA>       jl          00721390
00720EF0        mov         eax,dword ptr [ebp+8]
00720EF3        mov         eax,dword ptr [eax-0C]
00720EF6        push        eax
00720EF7        lea         eax,[ebp-4]
00720EFA        push        eax
00720EFB        mov         eax,dword ptr [ebp+8]
00720EFE        mov         eax,dword ptr [eax-4]
00720F01        xor         ecx,ecx
00720F03        mov         edx,dword ptr ds:[404BA0];TArray<System.Byte>
00720F09        call        @DynArrayCopyRange
00720F0E        push        0
00720F10        push        0
00720F12        mov         eax,dword ptr [ebp+8]
00720F15        lea         edx,[eax-4]
00720F18        mov         cx,7C00
00720F1C        xor         eax,eax
00720F1E        call        00719364

```

这里相似位置看到了00719364，和之前的006E1B48的位置非常像



### sub_00719364

进来以后发现看到的竟然还不是解密的循环，但是总体上只是调用了2个函数，都看一下好了

```assembly
_Unit109.sub_00719364
00719364        push        ebp
00719365        mov         ebp,esp
00719367        push        ecx
00719368        push        esi
00719369        mov         esi,ecx
0071936B        mov         byte ptr [ebp-1],al
0071936E        mov         ecx,dword ptr [ebp+8]
00719371        mov         eax,dword ptr [ebp+0C]
00719374        cmp         byte ptr [ebp-1],0
00719378>       je          00719387
0071937A        push        ecx
0071937B        mov         ecx,esi
0071937D        xchg        eax,edx
0071937E        xchg        ecx,edx
00719380        call        007191BC
00719385>       jmp         00719392
00719387        push        ecx
00719388        mov         ecx,esi
0071938A        xchg        eax,edx
0071938B        xchg        ecx,edx
0071938D        call        00718E7C
00719392        pop         esi
00719393        pop         ecx
00719394        pop         ebp
00719395        ret         8
```



#### sub_007191BC

看到这个，似乎很像之前的解密啊

```assembly
_Unit109.sub_007191BC
007191BC        push        ebp
007191BD        mov         ebp,esp
007191BF        add         esp,0FFFFFFD0
007191C2        push        ebx
007191C3        push        esi
007191C4        push        edi
007191C5        mov         ebx,ecx
007191C7        mov         esi,edx
007191C9        mov         dword ptr [ebp-4],eax
007191CC        movzx       edx,byte ptr [ebp+8]
007191D0        mov         eax,esi
007191D2        call        00718C68
007191D7        mov         byte ptr [ebp-15],al
007191DA        movzx       eax,byte ptr [ebp-15]
007191DE        sub         al,1
007191E0>       jb          007191ED
007191E2>       je          007191F9
007191E4        dec         al
007191E6>       je          00719225
007191E8>       jmp         00719315
007191ED        mov         eax,71932C;'Address'
007191F2        call        007168DC
007191F7>       jmp         00719237
007191F9        test        bl,bl
007191FB>       je          00719211
007191FD        lea         edx,[ebp-30]
00719200        mov         eax,9DA858
00719205        mov         ecx,10
0071920A        call        Move
0071920F>       jmp         00719237
00719211        lea         edx,[ebp-30]
00719214        mov         eax,9DA848
00719219        mov         ecx,10
0071921E        call        Move
00719223>       jmp         00719237
00719225        lea         edx,[ebp-30]
00719228        mov         eax,9DA818
0071922D        mov         ecx,10
00719232        call        Move
00719237        xor         eax,eax
00719239        mov         dword ptr [ebp-10],eax
0071923C>       jmp         007192C8
00719241        mov         ebx,0C6EF3720
00719246        mov         eax,dword ptr [ebp-4]
00719249        mov         eax,dword ptr [eax]
0071924B        mov         edx,dword ptr [ebp-10]
0071924E        add         eax,edx
00719250        lea         edx,[ebp-0C]
00719253        mov         ecx,8
00719258        call        Move
0071925D        mov         eax,[009DA868];0x20 gvar_009DA868
00719262        test        eax,eax
00719264>       jle         007192AC
00719266        mov         dword ptr [ebp-1C],eax
00719269        mov         esi,dword ptr [ebp-0C]
0071926C        mov         eax,esi
0071926E        shl         eax,4
00719271        add         eax,dword ptr [ebp-28]
00719274        mov         edx,esi
00719276        add         edx,ebx
00719278        xor         eax,edx
0071927A        shr         esi,5
0071927D        add         esi,dword ptr [ebp-24]
00719280        xor         eax,esi
00719282        sub         dword ptr [ebp-8],eax
00719285        mov         edi,dword ptr [ebp-8]
00719288        mov         eax,edi
0071928A        shl         eax,4
0071928D        add         eax,dword ptr [ebp-30]
00719290        mov         edx,edi
00719292        add         edx,ebx
00719294        xor         eax,edx
00719296        shr         edi,5
00719299        add         edi,dword ptr [ebp-2C]
0071929C        xor         eax,edi
0071929E        sub         dword ptr [ebp-0C],eax
007192A1        sub         ebx,dword ptr ds:[9DA86C];gvar_009DA86C
007192A7        dec         dword ptr [ebp-1C]
007192AA>       jne         00719269
007192AC        mov         eax,dword ptr [ebp-4]
007192AF        mov         eax,dword ptr [eax]
007192B1        mov         edx,dword ptr [ebp-10]
007192B4        lea         edx,[eax+edx]
007192B7        lea         eax,[ebp-0C]
007192BA        mov         ecx,8
007192BF        call        Move
007192C4        add         dword ptr [ebp-10],8
007192C8        mov         eax,dword ptr [ebp-4]
007192CB        mov         eax,dword ptr [eax]
007192CD        mov         dword ptr [ebp-20],eax
007192D0        cmp         dword ptr [ebp-20],0
007192D4>       je          007192E1
007192D6        mov         eax,dword ptr [ebp-20]
007192D9        sub         eax,4
007192DC        mov         eax,dword ptr [eax]
007192DE        mov         dword ptr [ebp-20],eax
007192E1        mov         eax,dword ptr [ebp-20]
007192E4        dec         eax
007192E5        sub         eax,7
007192E8        cmp         eax,dword ptr [ebp-10]
007192EB>       jge         00719241
007192F1        lea         eax,[ebp-30]
007192F4        xor         ecx,ecx
007192F6        mov         edx,10
007192FB        call        @FillChar
00719300        movzx       eax,byte ptr [ebp-15]
00719304        call        00718CB4
00719309        test        al,al
0071930B>       je          00719315
0071930D        mov         eax,dword ptr [ebp-4]
00719310        call        00718C38
00719315        pop         edi
00719316        pop         esi
00719317        pop         ebx
00719318        mov         esp,ebp
0071931A        pop         ebp
0071931B        ret         4

```



#### sub_00718E7C

再看另一个函数，和之前的流程基本是一模一样

```assembly
_Unit109.sub_00718E7C
00718E7C        push        ebp
00718E7D        mov         ebp,esp
00718E7F        add         esp,0FFFFFFCC
00718E82        push        ebx
00718E83        push        esi
00718E84        push        edi
00718E85        mov         ebx,ecx
00718E87        mov         word ptr [ebp-6],dx
00718E8B        mov         dword ptr [ebp-4],eax
00718E8E        movzx       edx,byte ptr [ebp+8]
00718E92        movzx       eax,word ptr [ebp-6]
00718E96        call        00718C68
00718E9B        mov         byte ptr [ebp-19],al
00718E9E        movzx       eax,byte ptr [ebp-19]
00718EA2        sub         al,1
00718EA4>       jb          00718EB1
00718EA6>       je          00718EBD
00718EA8        dec         al
00718EAA>       je          00718EE9
00718EAC>       jmp         00719001
00718EB1        mov         eax,719018;'Address'
00718EB6        call        007168DC
00718EBB>       jmp         00718EFB
00718EBD        test        bl,bl
00718EBF>       je          00718ED5
00718EC1        lea         edx,[ebp-34]
00718EC4        mov         eax,9DA838
00718EC9        mov         ecx,10
00718ECE        call        Move
00718ED3>       jmp         00718EFB
00718ED5        lea         edx,[ebp-34]
00718ED8        mov         eax,9DA828
00718EDD        mov         ecx,10
00718EE2        call        Move
00718EE7>       jmp         00718EFB
00718EE9        lea         edx,[ebp-34]
00718EEC        mov         eax,9DA808
00718EF1        mov         ecx,10
00718EF6        call        Move
00718EFB        xor         eax,eax
00718EFD        mov         dword ptr [ebp-14],eax
00718F00>       jmp         00718FB4
00718F05        mov         ebx,dword ptr ds:[9DA86C];0x9E3779B9 gvar_009DA86C
00718F0B        imul        ebx,dword ptr ds:[9DA868];0x20 gvar_009DA868
00718F12        mov         eax,dword ptr [ebp-4]
00718F15        mov         eax,dword ptr [eax]
00718F17        mov         edx,dword ptr [ebp-14]
00718F1A        add         eax,edx
00718F1C        lea         edx,[ebp-10]
00718F1F        mov         ecx,8
00718F24        call        Move
00718F29        mov         eax,[009DA868];0x20 gvar_009DA868
00718F2E        test        eax,eax
00718F30>       jle         00718F93
00718F32        mov         dword ptr [ebp-20],eax
00718F35        mov         esi,dword ptr [ebp-10]
00718F38        mov         eax,esi
00718F3A        shl         eax,4
00718F3D        mov         edx,esi
00718F3F        shr         edx,5
00718F42        xor         eax,edx
00718F44        add         eax,esi
00718F46        mov         edx,ebx
00718F48        shr         edx,0B
00718F4B        and         edx,3
00718F4E        mov         edx,dword ptr [ebp+edx*4-34]
00718F52        add         edx,ebx
00718F54        movzx       ecx,word ptr [ebp-6]
00718F58        add         edx,ecx
00718F5A        xor         eax,edx
00718F5C        sub         dword ptr [ebp-0C],eax
00718F5F        sub         ebx,dword ptr ds:[9DA86C];gvar_009DA86C
00718F65        mov         edi,dword ptr [ebp-0C]
00718F68        mov         eax,edi
00718F6A        shl         eax,4
00718F6D        mov         edx,edi
00718F6F        shr         edx,5
00718F72        xor         eax,edx
00718F74        add         eax,edi
00718F76        mov         edx,3
00718F7B        and         edx,ebx
00718F7D        mov         edx,dword ptr [ebp+edx*4-34]
00718F81        add         edx,ebx
00718F83        movzx       ecx,word ptr [ebp-6]
00718F87        add         edx,ecx
00718F89        xor         eax,edx
00718F8B        sub         dword ptr [ebp-10],eax
00718F8E        dec         dword ptr [ebp-20]
00718F91>       jne         00718F35
00718F93        mov         eax,dword ptr [ebp-4]
00718F96        mov         eax,dword ptr [eax]
00718F98        mov         edx,dword ptr [ebp-14]
00718F9B        lea         edx,[eax+edx]
00718F9E        lea         eax,[ebp-10]
00718FA1        mov         ecx,8
00718FA6        call        Move
00718FAB        add         dword ptr [ebp-14],8
00718FAF        add         word ptr [ebp-6],8
00718FB4        mov         eax,dword ptr [ebp-4]
00718FB7        mov         eax,dword ptr [eax]
00718FB9        mov         dword ptr [ebp-24],eax
00718FBC        cmp         dword ptr [ebp-24],0
00718FC0>       je          00718FCD
00718FC2        mov         eax,dword ptr [ebp-24]
00718FC5        sub         eax,4
00718FC8        mov         eax,dword ptr [eax]
00718FCA        mov         dword ptr [ebp-24],eax
00718FCD        mov         eax,dword ptr [ebp-24]
00718FD0        dec         eax
00718FD1        sub         eax,7
00718FD4        cmp         eax,dword ptr [ebp-14]
00718FD7>       jge         00718F05
00718FDD        lea         eax,[ebp-34]
00718FE0        xor         ecx,ecx
00718FE2        mov         edx,10
00718FE7        call        @FillChar
00718FEC        movzx       eax,byte ptr [ebp-19]
00718FF0        call        00718CB4
00718FF5        test        al,al
00718FF7>       je          00719001
00718FF9        mov         eax,dword ptr [ebp-4]
00718FFC        call        00718C38
00719001        pop         edi
00719002        pop         esi
00719003        pop         ebx
00719004        mov         esp,ebp
00719006        pop         ebp
00719007        ret         4
```



#### 在线调试

通过在线调试看到了，实际上调用的是和之前一模一样的流程：sub_00718E7C，而这里有4个存储密钥或者解密的key与之前不同了。



```
正式版中：
mem[local10] = 0x318234B4  # 需要
mem[local11] = 0x29A1FA54  # [ebp+edx*4-0x34] 需要
mem[local12] = 0x9E81C901  # 需要
mem[local13] = 0x81FBC617  # 0x19F134 需要

测试版中：
mem[local10] = 0x315534B4  # need
mem[local11] = 0x20A5F454  # [ebp+edx*4-0x34] need
mem[local12] = 0x1E88C901  # need
mem[local13] = 0x71F1C617  # 0x19F134 need

这里的local对应的就是epb的值，10就是epb-10*4
```

更换这四个密钥以后就正常可以解析出测试版的配置了。



## 额外的key

这里面还有一个额外的key

```
00718F54        movzx       ecx,word ptr [ebp-6]
```

这个值是ebp-6，我之前测试的2个电调里，这个值都是固定的，都是0x7c00

```
mem[0x19F168 - 6] = 0x7C00
```

而当我拿到了一个类型是4703的电调的时候，这个值变了，最让人奇怪的是，解密的时候，上位机竟然执行了2次解密，第一次用0x7c00进行解密，然后第二次用的是0xF800进行解密，然后才拿到正确的数值。

```
mem[0x19F168 - 6] = 0xF800
```

所以这个初始值也需要作为key的一员。

其实还有一个值

```
ds[0x839634] = 0x9E3779B9
```

这个值由于每次都是固定位置拿的，并且后续都是乘以20的固定值，所以一直没作为key，其实也可以加入到key里。



结合电调在读写时命令的不同，**0x7C00和0xF800都是对应的读写地址**，也就是配置保存的起始地址。所以当出这个问题的时候，其实读写协议也变了，也需要修改对应的地址。



## Summary

有了前一次的破解经验，确实让后面的破解变得太轻松了，不到5分钟就能找到解密的地方。这也是为啥破解这种东西破一次就等于破好多次了吧。



发现额外的key是由于按照两种方式解析出来的内容都不正确，然后重新又debug了一遍，发现流程都正确，但是就是一个值的初始化不同了，导致整个内容变了。
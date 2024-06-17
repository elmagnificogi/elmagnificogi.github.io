---
layout:     post
title:      "BLHeliSuite32逆向（五）"
subtitle:   "Crack，Reverse"
date:       2024-06-17
update:     2024-06-17
author:     "elmagnifico"
header-img: "img/x9.jpg"
catalog:    true
tobecontinued: false
tags:
    - Crack
    - BLHeli
---

## Foreword

BLH在停止维护以后给厂商给出了离线版本，离线版本不兼容之前的上位机了，再次破解看一下具体是哪里出现了异同



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
```



这次破解发现IDR和Ollydbg的地址又不一样了，所以直接使用IDR生成Map，然后用Ollydbg加载map文件

![image-20240617180329673](https://img.elmagnifico.tech/static/upload/elmagnifico/202406171803754.png)

![image-20240617180357725](https://img.elmagnifico.tech/static/upload/elmagnifico/202406171803768.png)

加载完发现，好像还是有点不够好用，有些东西还是找不到

似乎map文件加载以后也不能匹配，甚至直接错位了，暂时无解，怀疑BLH中有了什么保护机制？需要进一步学习一下



## 二次破解

借鉴之前的经验，发现函数名有变更，看了一下UI的调用逻辑，目前判断应该是在这个函数内

![image-20240617113021823](https://img.elmagnifico.tech/static/upload/elmagnifico/202406171130912.png)



调用栈

```
actReadSetupExecute 按键act
 DoBtnReadSetup
  _DoBtnReadSetup
   ReadSetupCurrentESC
    DoConnectInterface
    TBLHeli.Init
    ReadDeviceSetupSection
     ReadSetupByteBlocks
     ReadSetupBytes
```

同一个函数中有两个读取的地方，这里要单独分析两个read



### ReadSetupBytes

先看ReadSetupBytes

```assembly
BLHeli.TBLHeli.ReadSetupBytes
006F56B4        push        ebp
006F56B5        mov         ebp,esp
006F56B7        add         esp,0FFFFFFF8
006F56BA        push        ebx
006F56BB        push        esi
006F56BC        push        edi
006F56BD        mov         ebx,ecx
006F56BF        mov         esi,edx
006F56C1        mov         edi,eax
006F56C3        lea         eax,[ebp-8]
006F56C6        mov         edx,dword ptr ds:[6DB86C];TByteBlocks
006F56CC        call        0040C438
006F56D1        xor         eax,eax
006F56D3        push        ebp
006F56D4        push        6F5720
006F56D9        push        dword ptr fs:[eax]
006F56DC        mov         dword ptr fs:[eax],esp
006F56DF        xor         eax,eax
006F56E1        mov         dword ptr [ebp-8],eax
006F56E4        lea         eax,[ebp-4]
006F56E7        mov         edx,esi
006F56E9        mov         ecx,dword ptr ds:[404CB0];TArray<System.Byte>
006F56EF        call        @DynArrayAsg
006F56F4        lea         edx,[ebp-8]
006F56F7        mov         ecx,ebx
006F56F9        mov         eax,edi
006F56FB        call        TBLHeli.ReadSetupByteBlocks
006F5700        mov         ebx,eax
006F5702        xor         eax,eax
006F5704        pop         edx
006F5705        pop         ecx
006F5706        pop         ecx
006F5707        mov         dword ptr fs:[eax],edx
006F570A        push        6F5727
006F570F        lea         eax,[ebp-8]
006F5712        mov         edx,dword ptr ds:[6DB86C];TByteBlocks
006F5718        call        0040C824
006F571D        pop         eax
006F571E        jmp         eax
006F5720>       jmp         @HandleFinally
006F5725>       jmp         006F570F
006F5727        mov         eax,ebx
006F5729        pop         edi
006F572A        pop         esi
006F572B        pop         ebx
006F572C        pop         ecx
006F572D        pop         ecx
006F572E        pop         ebp
006F572F        ret
```

发现ReadSetupBytes也调用了ReadSetupByteBlocks



#### 0040C438

0040C438，感觉非常像加密的程序，先放着，后面再来看

```assembly
System.sub_0040C438
0040C438        push        ebp
0040C439        mov         ebp,esp
0040C43B        add         esp,0FFFFFFEC
0040C43E        push        ebx
0040C43F        push        esi
0040C440        push        edi
0040C441        mov         dword ptr [ebp-8],edx
0040C444        mov         dword ptr [ebp-4],eax
0040C447        mov         eax,dword ptr [ebp-8]
0040C44A        movzx       ebx,byte ptr [eax+1]
0040C44E        add         ebx,eax
0040C450        mov         edx,dword ptr [ebx+6]
0040C453        lea         edx,[ebx+edx*8+0A]
0040C457        cmp         byte ptr [eax],16
0040C45A>       jne         0040C474
0040C45C        cmp         byte ptr [edx],1
0040C45F>       jbe         0040C474
0040C461        cmp         dword ptr [edx+5],0
0040C465>       je          0040C474
0040C467        mov         ebx,edx
0040C469        mov         eax,dword ptr [ebp-4]
0040C46C        call        dword ptr [ebx+5]
0040C46F>       jmp         0040C5CB
0040C474        cmp         dword ptr [ebx+6],0
0040C478>       jbe         0040C5CB
0040C47E        xor         eax,eax
0040C480        mov         dword ptr [ebp-0C],eax
0040C483        xor         eax,eax
0040C485        mov         dword ptr [ebp-10],eax
0040C488        cmp         byte ptr [edx],0
0040C48B>       jbe         0040C4AE
0040C48D        test        byte ptr [edx+1],2
0040C491>       je          0040C4AE
0040C493        mov         esi,dword ptr [ebx+6]
0040C496        dec         esi
0040C497        cmp         esi,0
0040C49A>       jb          0040C4AE
0040C49C        cmp         dword ptr [ebx+esi*8+0A],0
0040C4A1>       jne         0040C4A8
0040C4A3        mov         dword ptr [ebp-10],esi
0040C4A6>       jmp         0040C4AE
0040C4A8        dec         esi
0040C4A9        cmp         esi,0FFFFFFFF
0040C4AC>       jne         0040C49C
0040C4AE        xor         edx,edx
0040C4B0        push        ebp
0040C4B1        push        40C579
0040C4B6        push        dword ptr fs:[edx]
0040C4B9        mov         dword ptr fs:[edx],esp
0040C4BC        mov         edi,dword ptr [ebx+6]
0040C4BF        dec         edi
0040C4C0        test        edi,edi
0040C4C2>       jb          0040C56F
0040C4C8        inc         edi
0040C4C9        xor         esi,esi
0040C4CB        mov         eax,dword ptr [ebx+esi*8+0A]
0040C4CF        test        eax,eax
0040C4D1>       je          0040C567
0040C4D7        mov         dword ptr [ebp-0C],esi
0040C4DA        mov         eax,dword ptr [eax]
0040C4DC        mov         edx,dword ptr [ebx+esi*8+0E]
0040C4E0        add         edx,dword ptr [ebp-4]
0040C4E3        mov         dword ptr [ebp-14],edx
0040C4E6        movzx       edx,byte ptr [eax]
0040C4E9        add         edx,0FFFFFFF6
0040C4EC        cmp         edx,0C
0040C4EF>       ja          0040C560
0040C4F1        movzx       edx,byte ptr [edx+40C4FF]
0040C4F8        jmp         dword ptr [edx*4+40C50C]
0040C4FF        db          1
0040C500        db          1
0040C501        db          2
0040C502        db          3
0040C503        db          4
0040C504        db          1
0040C505        db          0
0040C506        db          1
0040C507        db          1
0040C508        db          0
0040C509        db          0
0040C50A        db          0
0040C50B        db          4
0040C50C        dd          0040C560
0040C510        dd          0040C520
0040C514        dd          0040C529
0040C518        dd          0040C53A
0040C51C        dd          0040C554
0040C520        mov         eax,dword ptr [ebp-14]
0040C523        xor         edx,edx
0040C525        mov         dword ptr [eax],edx
0040C527>       jmp         0040C567
0040C529        mov         edx,dword ptr [ebp-14]
0040C52C        mov         ecx,edi
0040C52E        mov         edi,edx
0040C530        xor         eax,eax
0040C532        stos        dword ptr [edi]
0040C533        stos        dword ptr [edi]
0040C534        stos        dword ptr [edi]
0040C535        stos        dword ptr [edi]
0040C536        mov         edi,ecx
0040C538>       jmp         0040C567
0040C53A        movzx       edx,byte ptr [eax+1]
0040C53E        add         edx,eax
0040C540        mov         eax,edx
0040C542        mov         ecx,dword ptr [eax+6]
0040C545        mov         eax,dword ptr [eax+0A]
0040C548        mov         edx,dword ptr [eax]
0040C54A        mov         eax,dword ptr [ebp-14]
0040C54D        call        @AddRefArray
0040C552>       jmp         0040C567
0040C554        mov         edx,eax
0040C556        mov         eax,dword ptr [ebp-14]
0040C559        call        0040C438
0040C55E>       jmp         0040C567
0040C560        mov         al,2
0040C562        call        Error
0040C567        inc         esi
0040C568        dec         edi
0040C569>       jne         0040C4CB
0040C56F        xor         eax,eax
0040C571        pop         edx
0040C572        pop         ecx
0040C573        pop         ecx
0040C574        mov         dword ptr fs:[eax],edx
0040C577>       jmp         0040C5CB
0040C579>       jmp         @HandleAnyException
0040C57E        mov         eax,dword ptr [ebp-0C]
0040C581        cmp         eax,dword ptr [ebp-10]
0040C584>       jbe         0040C58C
0040C586        mov         eax,dword ptr [ebp-10]
0040C589        mov         dword ptr [ebp-0C],eax
0040C58C        mov         eax,dword ptr [ebp-8]
0040C58F        movzx       ebx,byte ptr [eax+1]
0040C593        add         ebx,eax
0040C595        cmp         dword ptr [ebp-0C],0
0040C599>       jbe         0040C5C1
0040C59B        dec         dword ptr [ebp-0C]
0040C59E        mov         eax,dword ptr [ebp-0C]
0040C5A1        mov         eax,dword ptr [ebx+eax*8+0A]
0040C5A5        mov         edx,dword ptr [eax]
0040C5A7        mov         eax,dword ptr [ebp-0C]
0040C5AA        mov         eax,dword ptr [ebx+eax*8+0E]
0040C5AE        add         eax,dword ptr [ebp-4]
0040C5B1        mov         ecx,1
0040C5B6        call        @FinalizeArray
0040C5BB        cmp         dword ptr [ebp-0C],0
0040C5BF>       ja          0040C59B
0040C5C1        call        @RaiseAgain
0040C5C6        call        @DoneExcept
0040C5CB        pop         edi
0040C5CC        pop         esi
0040C5CD        pop         ebx
0040C5CE        mov         esp,ebp
0040C5D0        pop         ebp
0040C5D1        ret

```



#### 0040C824

```assembly
System.sub_0040C824
0040C824        push        ebp
0040C825        mov         ebp,esp
0040C827        add         esp,0FFFFFFE4
0040C82A        push        ebx
0040C82B        push        esi
0040C82C        push        edi
0040C82D        mov         dword ptr [ebp-4],eax
0040C830        mov         eax,edx
0040C832        movzx       ecx,byte ptr [eax+1]
0040C836        add         ecx,eax
0040C838        mov         dword ptr [ebp-8],ecx
0040C83B        mov         ecx,dword ptr [ebp-8]
0040C83E        add         ecx,0A
0040C841        mov         ebx,dword ptr [ebp-8]
0040C844        mov         ebx,dword ptr [ebx+6]
0040C847        shl         ebx,3
0040C84A        add         ecx,ebx
0040C84C        cmp         byte ptr [eax],16
0040C84F>       jne         0040C86C
0040C851        cmp         byte ptr [ecx],2
0040C854>       jbe         0040C86C
0040C856        cmp         dword ptr [ecx+9],0
0040C85A>       je          0040C86C
0040C85C        mov         ebx,ecx
0040C85E        mov         eax,dword ptr [ebp-4]
0040C861        call        dword ptr [ebx+9]
0040C864        mov         ebx,dword ptr [ebp-4]
0040C867>       jmp         0040CB4A
0040C86C        mov         eax,dword ptr [ebp-8]
0040C86F        mov         eax,dword ptr [eax+6]
0040C872        test        eax,eax
0040C874>       jbe         0040CB47
0040C87A        mov         byte ptr [ebp-19],0
0040C87E        cmp         byte ptr [ecx],0
0040C881>       jbe         0040C88B
0040C883        test        byte ptr [ecx+1],2
0040C887        setne       byte ptr [ebp-19]
0040C88B        mov         dword ptr [ebp-10],eax
0040C88E        xor         edx,edx
0040C890        push        ebp
0040C891        push        40C9C8
0040C896        push        dword ptr fs:[edx]
0040C899        mov         dword ptr fs:[edx],esp
0040C89C        mov         eax,dword ptr [ebp-8]
0040C89F        mov         edx,dword ptr [ebp-10]
0040C8A2        lea         edi,[eax+edx*8+0A]
0040C8A6        cmp         byte ptr [ebp-19],0
0040C8AA>       je          0040C8DF
0040C8AC        sub         edi,8
0040C8AF        dec         dword ptr [ebp-10]
0040C8B2        mov         eax,dword ptr [edi]
0040C8B4        test        eax,eax
0040C8B6>       je          0040C8DB
0040C8B8        mov         esi,dword ptr [edi+4]
0040C8BB        add         esi,dword ptr [ebp-4]
0040C8BE        mov         ebx,eax
0040C8C0        mov         eax,dword ptr [ebx]
0040C8C2        movzx       eax,byte ptr [eax]
0040C8C5        sub         al,0F
0040C8C7>       jne         0040C8D2
0040C8C9        mov         eax,esi
0040C8CB        call        00411350
0040C8D0>       jmp         0040C8AC
0040C8D2        mov         al,2
0040C8D4        call        Error
0040C8D9>       jmp         0040C8AC
0040C8DB        mov         byte ptr [ebp-19],0
0040C8DF        cmp         dword ptr [ebp-10],0
0040C8E3>       jbe         0040C9BB
0040C8E9        sub         edi,8
0040C8EC        dec         dword ptr [ebp-10]
0040C8EF        mov         ebx,dword ptr [edi]
0040C8F1        mov         esi,dword ptr [edi+4]
0040C8F4        add         esi,dword ptr [ebp-4]
0040C8F7        mov         eax,dword ptr [ebx]
0040C8F9        movzx       eax,byte ptr [eax]
0040C8FC        add         eax,0FFFFFFF6
0040C8FF        cmp         eax,0C
0040C902>       ja          0040C9AA
0040C908        jmp         dword ptr [eax*4+40C90F]
0040C90F        dd          0040C943
0040C913        dd          0040C94C
0040C917        dd          0040C95E
0040C91B        dd          0040C967
0040C91F        dd          0040C98B
0040C923        dd          0040C996
0040C927        dd          0040C9AA
0040C92B        dd          0040C99F
0040C92F        dd          0040C955
0040C933        dd          0040C9AA
0040C937        dd          0040C9AA
0040C93B        dd          0040C9AA
0040C93F        dd          0040C98B
0040C943        mov         eax,esi
0040C945        call        @LStrClr
0040C94A>       jmp         0040C9B1
0040C94C        mov         eax,esi
0040C94E        call        @WStrClr
0040C953>       jmp         0040C9B1
0040C955        mov         eax,esi
0040C957        call        @UStrClr
0040C95C>       jmp         0040C9B1
0040C95E        mov         eax,esi
0040C960        call        @VarAddRef
0040C965>       jmp         0040C9B1
0040C967        mov         eax,dword ptr [ebx]
0040C969        mov         edx,dword ptr [ebx]
0040C96B        movzx       edx,byte ptr [edx+1]
0040C96F        add         eax,edx
0040C971        mov         dword ptr [ebp-0C],eax
0040C974        mov         eax,dword ptr [ebp-0C]
0040C977        mov         ecx,dword ptr [eax+6]
0040C97A        mov         eax,dword ptr [ebp-0C]
0040C97D        mov         eax,dword ptr [eax+0A]
0040C980        mov         edx,dword ptr [eax]
0040C982        mov         eax,esi
0040C984        call        @FinalizeArray
0040C989>       jmp         0040C9B1
0040C98B        mov         edx,dword ptr [ebx]
0040C98D        mov         eax,esi
0040C98F        call        0040C824
0040C994>       jmp         0040C9B1
0040C996        mov         eax,esi
0040C998        call        @IntfClear
0040C99D>       jmp         0040C9B1
0040C99F        mov         edx,dword ptr [ebx]
0040C9A1        mov         eax,esi
0040C9A3        call        DynArrayClear
0040C9A8>       jmp         0040C9B1
0040C9AA        mov         al,2
0040C9AC        call        Error
0040C9B1        cmp         dword ptr [ebp-10],0
0040C9B5>       ja          0040C8E9
0040C9BB        xor         eax,eax
0040C9BD        pop         edx
0040C9BE        pop         ecx
0040C9BF        pop         ecx
0040C9C0        mov         dword ptr fs:[eax],edx
0040C9C3>       jmp         0040CB47
0040C9C8>       jmp         @HandleAnyException
0040C9CD        mov         eax,dword ptr [ebp-8]
0040C9D0        mov         edx,dword ptr [ebp-10]
0040C9D3        lea         eax,[eax+edx*8+0A]
0040C9D7        mov         dword ptr [ebp-14],eax
0040C9DA        cmp         byte ptr [ebp-19],0
0040C9DE>       je          0040CA3A
0040C9E0>       jmp         0040CA32
0040C9E2        sub         dword ptr [ebp-14],8
0040C9E6        dec         dword ptr [ebp-10]
0040C9E9        xor         eax,eax
0040C9EB        push        ebp
0040C9EC        push        40CA28
0040C9F1        push        dword ptr fs:[eax]
0040C9F4        mov         dword ptr fs:[eax],esp
0040C9F7        mov         eax,dword ptr [ebp-14]
0040C9FA        mov         esi,dword ptr [eax+4]
0040C9FD        add         esi,dword ptr [ebp-4]
0040CA00        mov         eax,dword ptr [ebp-14]
0040CA03        mov         ebx,dword ptr [eax]
0040CA05        mov         eax,dword ptr [ebx]
0040CA07        movzx       eax,byte ptr [eax]
0040CA0A        sub         al,0F
0040CA0C>       jne         0040CA17
0040CA0E        mov         eax,esi
0040CA10        call        00411350
0040CA15>       jmp         0040CA1E
0040CA17        mov         al,2
0040CA19        call        Error
0040CA1E        xor         eax,eax
0040CA20        pop         edx
0040CA21        pop         ecx
0040CA22        pop         ecx
0040CA23        mov         dword ptr fs:[eax],edx
0040CA26>       jmp         0040CA32
0040CA28>       jmp         @HandleAnyException
0040CA2D        call        @DoneExcept
0040CA32        mov         eax,dword ptr [ebp-14]
0040CA35        cmp         dword ptr [eax],0
0040CA38>       jne         0040C9E2
0040CA3A        cmp         dword ptr [ebp-10],0
0040CA3E>       jbe         0040CB3D
0040CA44        sub         dword ptr [ebp-14],8
0040CA48        dec         dword ptr [ebp-10]
0040CA4B        mov         eax,dword ptr [ebp-14]
0040CA4E        mov         ebx,dword ptr [eax]
0040CA50        xor         eax,eax
0040CA52        push        ebp
0040CA53        push        40CB29
0040CA58        push        dword ptr fs:[eax]
0040CA5B        mov         dword ptr fs:[eax],esp
0040CA5E        mov         eax,dword ptr [ebp-14]
0040CA61        mov         esi,dword ptr [eax+4]
0040CA64        add         esi,dword ptr [ebp-4]
0040CA67        mov         edi,dword ptr [ebx]
0040CA69        movzx       eax,byte ptr [edi]
0040CA6C        add         eax,0FFFFFFF6
0040CA6F        cmp         eax,0C
0040CA72>       ja          0040CB18
0040CA78        jmp         dword ptr [eax*4+40CA7F]
0040CA7F        dd          0040CAB3
0040CA83        dd          0040CABC
0040CA87        dd          0040CACE
0040CA8B        dd          0040CAD7
0040CA8F        dd          0040CAF9
0040CA93        dd          0040CB04
0040CA97        dd          0040CB18
0040CA9B        dd          0040CB0D
0040CA9F        dd          0040CAC5
0040CAA3        dd          0040CB18
0040CAA7        dd          0040CB18
0040CAAB        dd          0040CB18
0040CAAF        dd          0040CAF9
0040CAB3        mov         eax,esi
0040CAB5        call        @LStrClr
0040CABA>       jmp         0040CB1F
0040CABC        mov         eax,esi
0040CABE        call        @WStrClr
0040CAC3>       jmp         0040CB1F
0040CAC5        mov         eax,esi
0040CAC7        call        @UStrClr
0040CACC>       jmp         0040CB1F
0040CACE        mov         eax,esi
0040CAD0        call        @VarAddRef
0040CAD5>       jmp         0040CB1F
0040CAD7        mov         eax,edi
0040CAD9        movzx       edx,byte ptr [edi+1]
0040CADD        add         eax,edx
0040CADF        mov         dword ptr [ebp-18],eax
0040CAE2        mov         eax,dword ptr [ebp-18]
0040CAE5        mov         ecx,dword ptr [eax+6]
0040CAE8        mov         eax,dword ptr [ebp-18]
0040CAEB        mov         eax,dword ptr [eax+0A]
0040CAEE        mov         edx,dword ptr [eax]
0040CAF0        mov         eax,esi
0040CAF2        call        @FinalizeArray
0040CAF7>       jmp         0040CB1F
0040CAF9        mov         edx,edi
0040CAFB        mov         eax,esi
0040CAFD        call        0040C824
0040CB02>       jmp         0040CB1F
0040CB04        mov         eax,esi
0040CB06        call        @IntfClear
0040CB0B>       jmp         0040CB1F
0040CB0D        mov         edx,edi
0040CB0F        mov         eax,esi
0040CB11        call        DynArrayClear
0040CB16>       jmp         0040CB1F
0040CB18        mov         al,2
0040CB1A        call        Error
0040CB1F        xor         eax,eax
0040CB21        pop         edx
0040CB22        pop         ecx
0040CB23        pop         ecx
0040CB24        mov         dword ptr fs:[eax],edx
0040CB27>       jmp         0040CB33
0040CB29>       jmp         @HandleAnyException
0040CB2E        call        @DoneExcept
0040CB33        cmp         dword ptr [ebp-10],0
0040CB37>       ja          0040CA44
0040CB3D        call        @RaiseAgain
0040CB42        call        @DoneExcept
0040CB47        mov         ebx,dword ptr [ebp-4]
0040CB4A        mov         eax,ebx
0040CB4C        pop         edi
0040CB4D        pop         esi
0040CB4E        pop         ebx
0040CB4F        mov         esp,ebp
0040CB51        pop         ebp
0040CB52        ret

```

0040C824，也有点像解密过程，调用之前有Array相关的内容，所以也贴上，先挂着



### ReadSetupByteBlocks

```assembly
BLHeli.TBLHeli.ReadSetupByteBlocks
006F5C34        push        ebp
006F5C35        mov         ebp,esp
006F5C37        push        ecx
006F5C38        mov         ecx,11
006F5C3D        push        0
006F5C3F        push        0
006F5C41        dec         ecx
006F5C42>       jne         006F5C3D
006F5C44        push        ecx
006F5C45        xchg        ecx,dword ptr [ebp-4]
006F5C48        push        ebx
006F5C49        push        esi
006F5C4A        push        edi
006F5C4B        mov         byte ptr [ebp-11],cl
006F5C4E        mov         ebx,edx
006F5C50        mov         dword ptr [ebp-0C],eax
006F5C53        lea         eax,[ebp-8]
006F5C56        mov         edx,dword ptr ds:[6DB86C];TByteBlocks
006F5C5C        call        0040C438
006F5C61        xor         eax,eax
006F5C63        push        ebp
006F5C64        push        6F64D7
006F5C69        push        dword ptr fs:[eax]
006F5C6C        mov         dword ptr fs:[eax],esp
006F5C6F        mov         dl,1
006F5C71        mov         eax,dword ptr [ebp-0C]
# 熟悉的初始化
006F5C74        call        TBLHeli.Init
006F5C79        mov         eax,dword ptr [ebp-0C]
006F5C7C        add         eax,0C0;TBLHeli.FErrMsg:string
006F5C81        call        @UStrClr
006F5C86        mov         byte ptr [ebp-12],4
006F5C8A        xor         edx,edx
006F5C8C        push        ebp
006F5C8D        push        6F6478
006F5C92        push        dword ptr fs:[edx]
006F5C95        mov         dword ptr fs:[edx],esp
006F5C98        mov         eax,dword ptr [ebx]
006F5C9A        mov         dword ptr [ebp-8],eax
006F5C9D        mov         eax,dword ptr [ebx+4]
006F5CA0        test        eax,eax
006F5CA2>       je          006F5CA9
006F5CA4        sub         eax,4
006F5CA7        mov         eax,dword ptr [eax]
006F5CA9        mov         dword ptr [ebp-10],eax
006F5CAC        cmp         dword ptr [ebp-10],0F800
# 这个地方应该是跳转了
006F5CB3>       jle         006F5CF8
006F5CB5        mov         eax,dword ptr [ebx+4]
006F5CB8        test        eax,eax
006F5CBA>       je          006F5CC1
006F5CBC        sub         eax,4
006F5CBF        mov         eax,dword ptr [eax]
006F5CC1        sub         eax,0F800
006F5CC6        mov         dword ptr [ebp-10],eax
006F5CC9        mov         eax,dword ptr [ebp-10]
006F5CCC        push        eax
006F5CCD        lea         eax,[ebp-4]
006F5CD0        mov         ecx,1
006F5CD5        mov         edx,dword ptr ds:[404CB0];TArray<System.Byte>
006F5CDB        call        @DynArraySetLength
006F5CE0        add         esp,4
006F5CE3        mov         eax,dword ptr [ebx+4]
006F5CE6        add         eax,0F800
006F5CEB        mov         ecx,dword ptr [ebp-10]
006F5CEE        mov         edx,dword ptr [ebp-4]
006F5CF1        call        Move
006F5CF6>       jmp         006F5D6C
# 这里继续
006F5CF8        cmp         dword ptr [ebp-10],7C00
006F5CFF>       jle         006F5D44
006F5D01        mov         eax,dword ptr [ebx+4]
006F5D04        test        eax,eax
006F5D06>       je          006F5D0D
006F5D08        sub         eax,4
006F5D0B        mov         eax,dword ptr [eax]
006F5D0D        sub         eax,7C00
006F5D12        mov         dword ptr [ebp-10],eax
006F5D15        mov         eax,dword ptr [ebp-10]
006F5D18        push        eax
006F5D19        lea         eax,[ebp-4]
006F5D1C        mov         ecx,1
006F5D21        mov         edx,dword ptr ds:[404CB0];TArray<System.Byte>
006F5D27        call        @DynArraySetLength
006F5D2C        add         esp,4
006F5D2F        mov         eax,dword ptr [ebx+4]
006F5D32        add         eax,7C00
006F5D37        mov         ecx,dword ptr [ebp-10]
006F5D3A        mov         edx,dword ptr [ebp-4]
006F5D3D        call        Move
006F5D42>       jmp         006F5D6C
# 继续2
006F5D44        mov         eax,dword ptr [ebp-10]
006F5D47        push        eax
006F5D48        lea         eax,[ebp-4]
006F5D4B        mov         ecx,1
006F5D50        mov         edx,dword ptr ds:[404CB0];TArray<System.Byte>
006F5D56        call        @DynArraySetLength
006F5D5B        add         esp,4
006F5D5E        mov         eax,dword ptr [ebx+4]
006F5D61        mov         ecx,dword ptr [ebp-10]
006F5D64        mov         edx,dword ptr [ebp-4]
006F5D67        call        Move
006F5D6C        cmp         dword ptr [ebp-10],90
# 跳转3
006F5D73>       jge         006F5D83
006F5D75        mov         byte ptr [ebp-12],6
006F5D79        call        @TryFinallyExit
006F5D7E>       jmp         006F6482
# 继续4
006F5D83        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F5D89        movzx       edx,byte ptr [edx]
006F5D8C        mov         eax,dword ptr [ebp-4]
# 以前没看过这个函数，放过
006F5D8F        call        006DAC28
006F5D94        test        al,al
# 跳4
006F5D96>       je          006F5DA6
006F5D98        mov         byte ptr [ebp-12],5
006F5D9C        call        @TryFinallyExit
006F5DA1>       jmp         006F6482
# 继续
006F5DA6        push        ebp
# 以前关键函数就是这个位置
006F5DA7        call        006F578C
006F5DAC        pop         ecx
006F5DAD        mov         byte ptr [ebp-12],al
006F5DB0        cmp         byte ptr [ebp-12],4
006F5DB4>       jb          006F5DC0
006F5DB6        call        @TryFinallyExit
006F5DBB>       jmp         006F6482
006F5DC0        mov         eax,dword ptr [ebp-0C]
006F5DC3        lea         edx,[eax+33];TBLHeli.FEep_ESC_Layout:TESC_Layout
006F5DC6        mov         eax,dword ptr [ebp-4]
006F5DC9        add         eax,40
006F5DCC        mov         ecx,20
# 这里就是曾经的ReadSetupFromBinString中的移动内存地址的操作，32个字节
006F5DD1        call        Move
006F5DD6        lea         edx,[ebp-1C]
006F5DD9        mov         eax,dword ptr [ebp-0C]
006F5DDC        call        006F15CC
006F5DE1        mov         edx,dword ptr [ebp-1C]
006F5DE4        mov         eax,dword ptr [ebp-0C]
006F5DE7        add         eax,0B4;TBLHeli.FESC_Layout_Org_Str:string
006F5DEC        call        @UStrAsg
006F5DF1        cmp         byte ptr [ebp-12],1
006F5DF5>       jbe         006F5E01
006F5DF7        call        @TryFinallyExit
006F5DFC>       jmp         006F6482
006F5E01        mov         eax,dword ptr [ebp-4]
006F5E04        movzx       eax,byte ptr [eax]
006F5E07        mov         edx,dword ptr [ebp-0C]
006F5E0A        mov         byte ptr [edx+4],al;TBLHeli.FEep_FW_Main_Revision:?
006F5E0D        mov         eax,dword ptr [ebp-4]
006F5E10        movzx       eax,byte ptr [eax+1]
006F5E14        mov         edx,dword ptr [ebp-0C]
006F5E17        mov         byte ptr [edx+5],al;TBLHeli.FEep_FW_Sub_Revision:byte
006F5E1A        mov         eax,dword ptr [ebp-0C]
006F5E1D        call        006F2290
006F5E22        cmp         byte ptr [ebp-12],1
006F5E26>       je          006F5E34
006F5E28        mov         eax,dword ptr [ebp-0C]
006F5E2B        call        006F2320
006F5E30        test        al,al
006F5E32>       je          006F5E48
006F5E34        mov         eax,dword ptr [ebp-0C]
006F5E37        mov         byte ptr [eax+0BC],1;TBLHeli.FIsAlternateSettingsKey:Boolean
006F5E3E        call        @TryFinallyExit
006F5E43>       jmp         006F6482
006F5E48        mov         ebx,dword ptr [ebp-4]
006F5E4B        movzx       eax,byte ptr [ebx+2]
006F5E4F        mov         edx,dword ptr [ebp-0C]
006F5E52        mov         byte ptr [edx+6],al;TBLHeli.FEep_Layout_Revision:byte
006F5E55        mov         eax,dword ptr [ebp-0C]
006F5E58        movzx       eax,byte ptr [eax+4];TBLHeli.FEep_FW_Main_Revision:?
006F5E5C        cmp         al,28
006F5E5E>       ja          006F5E64
006F5E60        cmp         al,1F
006F5E62>       jae         006F5E85
006F5E64        mov         byte ptr [ebp-12],4
006F5E68        mov         eax,dword ptr [ebp-0C]
006F5E6B        lea         edx,[eax+0C0];TBLHeli.FErrMsg:string
006F5E71        mov         eax,6EFD3C;^gvar_009C363C:HINST
006F5E76        call        UTF8Encode
006F5E7B        call        @TryFinallyExit
006F5E80>       jmp         006F6482
006F5E85        mov         eax,dword ptr [ebp-0C]
006F5E88        call        006F2248
006F5E8D        test        al,al
006F5E8F>       jne         006F5EB2
006F5E91        mov         byte ptr [ebp-12],4
006F5E95        mov         eax,dword ptr [ebp-0C]
006F5E98        lea         edx,[eax+0C0];TBLHeli.FErrMsg:string
006F5E9E        mov         eax,6EFD34;^gvar_009C363C:HINST
006F5EA3        call        UTF8Encode
006F5EA8        call        @TryFinallyExit
006F5EAD>       jmp         006F6482
006F5EB2        mov         eax,dword ptr [ebp-0C]
006F5EB5        call        006F22EC
006F5EBA        test        al,al
006F5EBC>       je          006F5ECC
006F5EBE        mov         byte ptr [ebp-12],2
006F5EC2        call        @TryFinallyExit
006F5EC7>       jmp         006F6482
006F5ECC        mov         eax,dword ptr [ebp-0C]
006F5ECF        lea         edx,[eax+73];TBLHeli.FEep_Name:TESC_Name
006F5ED2        lea         eax,[ebx+80]
006F5ED8        mov         ecx,10
006F5EDD        call        Move
006F5EE2        xor         eax,eax
006F5EE4        mov         edx,dword ptr [ebp-0C]
006F5EE7        cmp         byte ptr [edx+eax+73],0FF
006F5EEC>       jne         006F5F0F
006F5EEE        mov         byte ptr [ebp-12],4
006F5EF2        mov         eax,dword ptr [ebp-0C]
006F5EF5        lea         edx,[eax+0C0];TBLHeli.FErrMsg:string
006F5EFB        mov         eax,6EFD2C;^gvar_009C363C:HINST
006F5F00        call        UTF8Encode
006F5F05        call        @TryFinallyExit
006F5F0A>       jmp         006F6482
006F5F0F        inc         eax
006F5F10        cmp         eax,10
006F5F13>       jne         006F5EE4
006F5F15        movzx       eax,byte ptr [ebx+32]
006F5F19        mov         edx,dword ptr [ebp-0C]
006F5F1C        mov         byte ptr [edx+2B],al;TBLHeli.FEep_Hw_LED_Capable_0:byte
006F5F1F        movzx       eax,byte ptr [ebx+33]
006F5F23        mov         edx,dword ptr [ebp-0C]
006F5F26        mov         byte ptr [edx+2C],al;TBLHeli.FEep_Hw_LED_Capable_1:byte
006F5F29        movzx       eax,byte ptr [ebx+34]
006F5F2D        mov         edx,dword ptr [ebp-0C]
006F5F30        mov         byte ptr [edx+2D],al;TBLHeli.FEep_Hw_LED_Capable_2:byte
006F5F33        movzx       eax,byte ptr [ebx+35]
006F5F37        mov         edx,dword ptr [ebp-0C]
006F5F3A        mov         byte ptr [edx+2E],al;TBLHeli.FEep_Hw_LED_Capable_3:byte
006F5F3D        mov         eax,dword ptr [ebp-0C]
006F5F40        cmp         byte ptr [eax+2B],0FF;TBLHeli.FEep_Hw_LED_Capable_0:byte
006F5F44>       jne         006F5F4D
006F5F46        mov         eax,dword ptr [ebp-0C]
006F5F49        mov         byte ptr [eax+2B],0;TBLHeli.FEep_Hw_LED_Capable_0:byte
006F5F4D        mov         eax,dword ptr [ebp-0C]
006F5F50        cmp         byte ptr [eax+2C],0FF;TBLHeli.FEep_Hw_LED_Capable_1:byte
006F5F54>       jne         006F5F5D
006F5F56        mov         eax,dword ptr [ebp-0C]
006F5F59        mov         byte ptr [eax+2C],0;TBLHeli.FEep_Hw_LED_Capable_1:byte
006F5F5D        mov         eax,dword ptr [ebp-0C]
006F5F60        cmp         byte ptr [eax+2D],0FF;TBLHeli.FEep_Hw_LED_Capable_2:byte
006F5F64>       jne         006F5F6D
006F5F66        mov         eax,dword ptr [ebp-0C]
006F5F69        mov         byte ptr [eax+2D],0;TBLHeli.FEep_Hw_LED_Capable_2:byte
006F5F6D        mov         eax,dword ptr [ebp-0C]
006F5F70        cmp         byte ptr [eax+2E],0FF;TBLHeli.FEep_Hw_LED_Capable_3:byte
006F5F74>       jne         006F5F7D
006F5F76        mov         eax,dword ptr [ebp-0C]
006F5F79        mov         byte ptr [eax+2E],0;TBLHeli.FEep_Hw_LED_Capable_3:byte
006F5F7D        movzx       eax,byte ptr [ebx+30]
006F5F81        mov         edx,dword ptr [ebp-0C]
006F5F84        mov         byte ptr [edx+29],al;TBLHeli.FEep_Hw_Voltage_Sense_Capable:byte
006F5F87        movzx       eax,byte ptr [ebx+31]
006F5F8B        mov         edx,dword ptr [ebp-0C]
006F5F8E        mov         byte ptr [edx+2A],al;TBLHeli.FEep_Hw_Current_Sense_Capable:byte
006F5F91        mov         eax,dword ptr [ebp-0C]
006F5F94        cmp         byte ptr [eax+6],29;TBLHeli.FEep_Layout_Revision:byte
006F5F98>       jb          006F5FC9
006F5F9A        movzx       eax,byte ptr [ebx+3F]
006F5F9E        mov         edx,dword ptr [ebp-0C]
006F5FA1        mov         byte ptr [edx+32],al;TBLHeli.FEep_Nondamped_Capable:byte
006F5FA4        movzx       eax,byte ptr [ebx+1C]
006F5FA8        mov         edx,dword ptr [ebp-0C]
006F5FAB        mov         byte ptr [edx+20],al;TBLHeli.FEep_Note_Config:byte
006F5FAE        mov         eax,dword ptr [ebp-0C]
006F5FB1        lea         edx,[eax+83];TBLHeli.FEep_Note_Array:TEep_Note_Array
006F5FB7        lea         eax,[ebx+90]
006F5FBD        mov         ecx,30
006F5FC2        call        Move
006F5FC7>       jmp         006F5FD7
006F5FC9        mov         eax,[009BE900];^gvar_009B7CE4
006F5FCE        movzx       eax,byte ptr [eax]
006F5FD1        mov         edx,dword ptr [ebp-0C]
006F5FD4        mov         byte ptr [edx+32],al;TBLHeli.FEep_Nondamped_Capable:byte
006F5FD7        mov         eax,dword ptr [ebp-0C]
006F5FDA        cmp         byte ptr [eax+6],2C;TBLHeli.FEep_Layout_Revision:byte
006F5FDE>       jb          006F6002
006F5FE0        cmp         byte ptr [ebx+36],0FF
006F5FE4>       jae         006F6002
006F5FE6        cmp         byte ptr [ebx+37],0FF
006F5FEA>       jae         006F6002
006F5FEC        movzx       eax,byte ptr [ebx+36]
006F5FF0        mov         edx,dword ptr [ebp-0C]
006F5FF3        mov         byte ptr [edx+2F],al;TBLHeli.FEep_Hw_Pwm_Freq_Min:byte
006F5FF6        movzx       eax,byte ptr [ebx+37]
006F5FFA        mov         edx,dword ptr [ebp-0C]
006F5FFD        mov         byte ptr [edx+30],al;TBLHeli.FEep_Hw_Pwm_Freq_Max:byte
006F6000>       jmp         006F601E
006F6002        mov         eax,[009BE900];^gvar_009B7CE4
006F6007        movzx       eax,byte ptr [eax]
006F600A        mov         edx,dword ptr [ebp-0C]
006F600D        mov         byte ptr [edx+2F],al;TBLHeli.FEep_Hw_Pwm_Freq_Min:byte
006F6010        mov         eax,[009BE900];^gvar_009B7CE4
006F6015        movzx       eax,byte ptr [eax]
006F6018        mov         edx,dword ptr [ebp-0C]
006F601B        mov         byte ptr [edx+30],al;TBLHeli.FEep_Hw_Pwm_Freq_Max:byte
006F601E        mov         eax,dword ptr [ebp-0C]
006F6021        cmp         byte ptr [eax+6],2D;TBLHeli.FEep_Layout_Revision:byte
006F6025>       jb          006F6033
006F6027        movzx       eax,byte ptr [ebx+3E]
006F602B        mov         edx,dword ptr [ebp-0C]
006F602E        mov         byte ptr [edx+31],al;TBLHeli.FEep_SPORT_Capable:byte
006F6031>       jmp         006F6041
006F6033        mov         eax,[009BE900];^gvar_009B7CE4
006F6038        movzx       eax,byte ptr [eax]
006F603B        mov         edx,dword ptr [ebp-0C]
006F603E        mov         byte ptr [edx+31],al;TBLHeli.FEep_SPORT_Capable:byte
006F6041        movzx       eax,byte ptr [ebx+2F]
006F6045        mov         edx,dword ptr [ebp-0C]
006F6048        mov         byte ptr [edx+28],al;TBLHeli.FEep_FlashCounter:byte
006F604B        mov         bl,4
006F604D        mov         eax,ebx
006F604F        call        006E52DC
006F6054        movzx       edi,al
006F6057        cmp         edi,0FF
006F605D>       je          006F60F4
006F6063        mov         si,0FFFF
006F6067        mov         edx,ebx
006F6069        mov         eax,dword ptr [ebp-0C]
006F606C        call        TBLHeli.IsParameterValid
006F6071        test        al,al
006F6073>       jne         006F6086
006F6075        cmp         bl,0F
006F6078>       jne         006F60E8
006F607A        mov         eax,dword ptr [ebp-0C]
006F607D        call        TBLHeli.IsCurrentProtectionFalselyHardEnabled
006F6082        test        al,al
006F6084>       je          006F60E8
006F6086        mov         eax,dword ptr [ebp-4]
006F6089        movzx       esi,byte ptr [eax+edi]
006F608D        cmp         bl,0E
006F6090>       jne         006F60A3
006F6092        cmp         si,0FF
006F6097>       jae         006F60A3
006F6099        cmp         si,18
006F609D>       jb          006F60A3
006F609F        sub         si,18
006F60A3        mov         eax,ebx
006F60A5        call        006E52E8
006F60AA        cmp         al,1
006F60AC>       jbe         006F60BC
006F60AE        mov         eax,dword ptr [ebp-4]
006F60B1        movzx       eax,byte ptr [eax+edi+1]
006F60B6        shl         eax,8
006F60B9        add         si,ax
006F60BC        cmp         bl,11
006F60BF>       jne         006F60E8
006F60C1        mov         eax,dword ptr [ebp-0C]
006F60C4        call        TBLHeli.IsProgrammableBrakeForceCapable
006F60C9        test        al,al
006F60CB>       jne         006F60E8
006F60CD        mov         dl,11
006F60CF        mov         eax,dword ptr [ebp-0C]
006F60D2        call        TBLHeli.GetParameterMin
006F60D7        cmp         si,ax
006F60DA>       jbe         006F60E8
006F60DC        mov         dl,11
006F60DE        mov         eax,dword ptr [ebp-0C]
006F60E1        call        TBLHeli.GetParameterMax
006F60E6        mov         esi,eax
006F60E8        mov         edx,ebx
006F60EA        mov         ecx,esi
006F60EC        mov         eax,dword ptr [ebp-0C]
006F60EF        call        TBLHeli.SetParameterValueOrDefault
006F60F4        inc         ebx
006F60F5        cmp         bl,21
006F60F8>       jne         006F604D
006F60FE        mov         byte ptr [ebp-12],0
006F6102        mov         eax,dword ptr [ebp-0C]
006F6105        call        TBLHeli.FixMissingTempProt
006F610A        xor         eax,eax
006F610C        pop         edx
006F610D        pop         ecx
006F610E        pop         ecx
006F610F        mov         dword ptr fs:[eax],edx
006F6112        push        6F6482
006F6117        lea         edx,[ebp-20]
006F611A        mov         eax,dword ptr [ebp-0C]
006F611D        call        006F1544
006F6122        mov         edx,dword ptr [ebp-20]
006F6125        mov         eax,dword ptr [ebp-0C]
006F6128        add         eax,0DC;TBLHeli.FDetectedESCLayout:string
006F612D        call        @UStrAsg
006F6132        mov         eax,dword ptr [ebp-0C]
006F6135        add         eax,0DC;TBLHeli.FDetectedESCLayout:string
006F613A        mov         dword ptr [ebp-18],eax
006F613D        mov         eax,dword ptr [ebp-18]
006F6140        cmp         dword ptr [eax],0
006F6143>       jne         006F6158
006F6145        mov         eax,dword ptr [ebp-0C]
006F6148        lea         edx,[eax+0DC];TBLHeli.FDetectedESCLayout:string
006F614E        mov         eax,[009BE564];^SResString2126:TResStringRec
006F6153        call        UTF8Encode
006F6158        movzx       eax,byte ptr [ebp-12]
006F615C        cmp         eax,6
006F615F>       ja          006F642D
006F6165        jmp         dword ptr [eax*4+6F616C]
006F616C        dd          006F6188
006F6170        dd          006F619A
006F6174        dd          006F61AC
006F6178        dd          006F637E
006F617C        dd          006F6295
006F6180        dd          006F6329
006F6184        dd          006F6341
006F6188        mov         eax,dword ptr [ebp-0C]
006F618B        add         eax,0C0;TBLHeli.FErrMsg:string
006F6190        call        @UStrClr
006F6195>       jmp         006F642D
006F619A        mov         eax,dword ptr [ebp-0C]
006F619D        add         eax,0C0;TBLHeli.FErrMsg:string
006F61A2        call        @UStrClr
006F61A7>       jmp         006F642D
006F61AC        lea         eax,[ebp-24]
006F61AF        push        eax
006F61B0        lea         eax,[ebp-30]
006F61B3        push        eax
006F61B4        lea         edx,[ebp-34]
006F61B7        mov         eax,[009BE868];^SResString2117:TResStringRec
006F61BC        call        UTF8Encode
006F61C1        mov         eax,dword ptr [ebp-34]
006F61C4        push        eax
006F61C5        mov         eax,dword ptr [ebp-0C]
006F61C8        mov         eax,dword ptr [eax+0DC];TBLHeli.FDetectedESCLayout:string
006F61CE        mov         dword ptr [ebp-3C],eax
006F61D1        mov         byte ptr [ebp-38],11
006F61D5        lea         edx,[ebp-3C]
006F61D8        xor         ecx,ecx
006F61DA        pop         eax
006F61DB        call        006DA6D8
006F61E0        mov         eax,dword ptr [ebp-30]
006F61E3        mov         dword ptr [ebp-2C],eax
006F61E6        mov         byte ptr [ebp-28],11
006F61EA        lea         edx,[ebp-2C]
006F61ED        xor         ecx,ecx
006F61EF        mov         eax,6F64F8;'%s.\n'
006F61F4        call        006DA6D8
006F61F9        push        dword ptr [ebp-24]
006F61FC        lea         eax,[ebp-40]
006F61FF        push        eax
006F6200        lea         edx,[ebp-44]
006F6203        mov         eax,[009BE478];^SResString2115:TResStringRec
006F6208        call        UTF8Encode
006F620D        mov         eax,dword ptr [ebp-44]
006F6210        mov         dword ptr [ebp-54],1F
006F6217        mov         byte ptr [ebp-50],0
006F621B        mov         dword ptr [ebp-4C],64
006F6222        mov         byte ptr [ebp-48],0
006F6226        lea         edx,[ebp-54]
006F6229        mov         ecx,1
006F622E        call        006DA6D8
006F6233        push        dword ptr [ebp-40]
006F6236        lea         eax,[ebp-58]
006F6239        push        eax
006F623A        lea         edx,[ebp-5C]
006F623D        mov         eax,dword ptr [ebp-0C]
006F6240        call        006F1824
006F6245        mov         eax,dword ptr [ebp-5C]
006F6248        mov         dword ptr [ebp-2C],eax
006F624B        mov         byte ptr [ebp-28],11
006F624F        lea         eax,[ebp-2C]
006F6252        push        eax
006F6253        lea         edx,[ebp-64]
006F6256        mov         eax,[009BE9E0];^SResString2116:TResStringRec
006F625B        call        UTF8Encode
006F6260        mov         ecx,dword ptr [ebp-64]
006F6263        lea         eax,[ebp-60]
006F6266        mov         edx,6F6510;'\n'
006F626B        call        @UStrCat3
006F6270        mov         eax,dword ptr [ebp-60]
006F6273        xor         ecx,ecx
006F6275        pop         edx
006F6276        call        006DA6D8
006F627B        push        dword ptr [ebp-58]
006F627E        mov         eax,dword ptr [ebp-0C]
006F6281        add         eax,0C0;TBLHeli.FErrMsg:string
006F6286        mov         edx,3
006F628B        call        @UStrCatN
006F6290>       jmp         006F642D
006F6295        mov         eax,dword ptr [ebp-0C]
006F6298        cmp         dword ptr [eax+0C0],0;TBLHeli.FErrMsg:string
006F629F>       jne         006F62B4
006F62A1        mov         eax,dword ptr [ebp-0C]
006F62A4        lea         edx,[eax+0C0];TBLHeli.FErrMsg:string
006F62AA        mov         eax,[009BE0F8];^SResString2123:TResStringRec
006F62AF        call        UTF8Encode
006F62B4        lea         eax,[ebp-68]
006F62B7        push        eax
006F62B8        lea         eax,[ebp-6C]
006F62BB        push        eax
006F62BC        lea         edx,[ebp-70]
006F62BF        mov         eax,[009BE868];^SResString2117:TResStringRec
006F62C4        call        UTF8Encode
006F62C9        mov         eax,dword ptr [ebp-70]
006F62CC        push        eax
006F62CD        mov         eax,dword ptr [ebp-0C]
006F62D0        mov         eax,dword ptr [eax+0DC];TBLHeli.FDetectedESCLayout:string
006F62D6        mov         dword ptr [ebp-2C],eax
006F62D9        mov         byte ptr [ebp-28],11
006F62DD        lea         edx,[ebp-2C]
006F62E0        xor         ecx,ecx
006F62E2        pop         eax
006F62E3        call        006DA6D8
006F62E8        mov         eax,dword ptr [ebp-6C]
006F62EB        mov         dword ptr [ebp-54],eax
006F62EE        mov         byte ptr [ebp-50],11
006F62F2        mov         eax,dword ptr [ebp-0C]
006F62F5        mov         eax,dword ptr [eax+0C0];TBLHeli.FErrMsg:string
006F62FB        mov         dword ptr [ebp-4C],eax
006F62FE        mov         byte ptr [ebp-48],11
006F6302        lea         edx,[ebp-54]
006F6305        mov         ecx,1
006F630A        mov         eax,6F6524;'%s\n%s'
006F630F        call        006DA6D8
006F6314        mov         edx,dword ptr [ebp-68]
006F6317        mov         eax,dword ptr [ebp-0C]
006F631A        add         eax,0C0;TBLHeli.FErrMsg:string
006F631F        call        @UStrAsg
006F6324>       jmp         006F642D
006F6329        mov         eax,dword ptr [ebp-0C]
006F632C        lea         edx,[eax+0C0];TBLHeli.FErrMsg:string
006F6332        mov         eax,[009BEAEC];^SResString2122:TResStringRec
006F6337        call        UTF8Encode
006F633C>       jmp         006F642D
006F6341        lea         eax,[ebp-74]
006F6344        push        eax
006F6345        lea         edx,[ebp-78]
006F6348        mov         eax,[009BEFA8];^SResString2121:TResStringRec
006F634D        call        UTF8Encode
006F6352        mov         eax,dword ptr [ebp-78]
006F6355        mov         edx,dword ptr [ebp-10]
006F6358        mov         dword ptr [ebp-2C],edx
006F635B        mov         byte ptr [ebp-28],0
006F635F        lea         edx,[ebp-2C]
006F6362        xor         ecx,ecx
006F6364        call        006DA6D8
006F6369        mov         edx,dword ptr [ebp-74]
006F636C        mov         eax,dword ptr [ebp-0C]
006F636F        add         eax,0C0;TBLHeli.FErrMsg:string
006F6374        call        @UStrAsg
006F6379>       jmp         006F642D
006F637E        lea         eax,[ebp-7C]
006F6381        push        eax
006F6382        lea         edx,[ebp-80]
006F6385        mov         eax,dword ptr [ebp-0C]
006F6388        call        006F16AC
006F638D        mov         eax,dword ptr [ebp-80]
006F6390        mov         dword ptr [ebp-2C],eax
006F6393        mov         byte ptr [ebp-28],11
006F6397        lea         eax,[ebp-2C]
006F639A        push        eax
006F639B        lea         edx,[ebp-84]
006F63A1        mov         eax,[009BE4D4];^SResString2114:TResStringRec
006F63A6        call        UTF8Encode
006F63AB        mov         eax,dword ptr [ebp-84]
006F63B1        xor         ecx,ecx
006F63B3        pop         edx
006F63B4        call        006DA6D8
006F63B9        mov         eax,dword ptr [ebp-7C]
006F63BC        push        eax
006F63BD        lea         eax,[ebp-88]
006F63C3        push        eax
006F63C4        lea         eax,[ebp-8C]
006F63CA        push        eax
006F63CB        lea         edx,[ebp-90]
006F63D1        mov         eax,[009BE868];^SResString2117:TResStringRec
006F63D6        call        UTF8Encode
006F63DB        mov         eax,dword ptr [ebp-90]
006F63E1        push        eax
006F63E2        mov         eax,dword ptr [ebp-0C]
006F63E5        mov         eax,dword ptr [eax+0DC];TBLHeli.FDetectedESCLayout:string
006F63EB        mov         dword ptr [ebp-3C],eax
006F63EE        mov         byte ptr [ebp-38],11
006F63F2        lea         edx,[ebp-3C]
006F63F5        xor         ecx,ecx
006F63F7        pop         eax
006F63F8        call        006DA6D8
006F63FD        mov         eax,dword ptr [ebp-8C]
006F6403        mov         dword ptr [ebp-2C],eax
006F6406        mov         byte ptr [ebp-28],11
006F640A        lea         edx,[ebp-2C]
006F640D        xor         ecx,ecx
006F640F        mov         eax,6F6540;'%s\n'
006F6414        call        006DA6D8
006F6419        mov         edx,dword ptr [ebp-88]
006F641F        mov         eax,dword ptr [ebp-0C]
006F6422        add         eax,0C0;TBLHeli.FErrMsg:string
006F6427        pop         ecx
006F6428        call        @UStrCat3
006F642D        cmp         byte ptr [ebp-12],4
006F6431>       jb          006F6468
006F6433        call        006E13F0
006F6438        test        al,al
006F643A>       je          006F644A
006F643C        mov         eax,dword ptr [ebp-0C]
006F643F        mov         eax,dword ptr [eax+0C0];TBLHeli.FErrMsg:string
006F6445        call        006E1CD0
006F644A        cmp         byte ptr [ebp-11],0
006F644E>       je          006F645E
006F6450        mov         eax,dword ptr [ebp-0C]
006F6453        mov         eax,dword ptr [eax+0C0];TBLHeli.FErrMsg:string
006F6459        call        006E3F40
006F645E        xor         edx,edx
006F6460        mov         eax,dword ptr [ebp-0C]
006F6463        call        TBLHeli.Init
006F6468        movzx       eax,byte ptr [ebp-12]
006F646C        mov         edx,dword ptr [ebp-0C]
006F646F        mov         byte ptr [edx+0C4],al;TBLHeli.FStatus:TSetupStatus
006F6475        pop         eax
006F6476        jmp         eax
006F6478>       jmp         @HandleFinally
006F647D>       jmp         006F6117
006F6482        xor         eax,eax
006F6484        pop         edx
006F6485        pop         ecx
006F6486        pop         ecx
006F6487        mov         dword ptr fs:[eax],edx
006F648A        push        6F64DE
006F648F        lea         eax,[ebp-90]
006F6495        mov         edx,0F
006F649A        call        @UStrArrayClr
006F649F        lea         eax,[ebp-44]
006F64A2        mov         edx,2
006F64A7        call        @UStrArrayClr
006F64AC        lea         eax,[ebp-34]
006F64AF        mov         edx,2
006F64B4        call        @UStrArrayClr
006F64B9        lea         eax,[ebp-24]
006F64BC        mov         edx,3
006F64C1        call        @UStrArrayClr
006F64C6        lea         eax,[ebp-8]
006F64C9        mov         edx,dword ptr ds:[6DB86C];TByteBlocks
006F64CF        call        0040C824
006F64D4        pop         eax
006F64D5        jmp         eax
006F64D7>       jmp         @HandleFinally
006F64DC>       jmp         006F648F
006F64DE        movzx       eax,byte ptr [ebp-12]
006F64E2        pop         edi
006F64E3        pop         esi
006F64E4        pop         ebx
006F64E5        mov         esp,ebp
006F64E7        pop         ebp
006F64E8        ret

```

可以看到Block的流程中也有0040C438，而且还发现了一个关键地址`0F800和7C00` ，这个是读取寄存器的地址，也是密钥计算中的一环

这里的F800的代码片段同时和以前的` ReadSetupFromBinString`中的片段是一模一样的



#### 006F578C

熟悉的结构又回来了，就是这里

```assembly
BLHeli.sub_006F578C
006F578C        push        ebp
006F578D        mov         ebp,esp
006F578F        add         esp,0FFFFFFF8
006F5792        push        ebx
006F5793        lea         eax,[ebp-8]
006F5796        mov         edx,dword ptr ds:[6DB86C];TByteBlocks
006F579C        call        0040C438
006F57A1        xor         eax,eax
006F57A3        push        ebp
006F57A4        push        6F5C26
006F57A9        push        dword ptr fs:[eax]
006F57AC        mov         dword ptr fs:[eax],esp
006F57AF        mov         eax,dword ptr [ebp+8]
006F57B2        mov         eax,dword ptr [eax-0C]
006F57B5        mov         byte ptr [eax+0BA],0
006F57BC        mov         eax,dword ptr [ebp+8]
006F57BF        mov         eax,dword ptr [eax-4]
006F57C2        lea         edx,[eax+60]
006F57C5        mov         eax,dword ptr [ebp+8]
006F57C8        mov         eax,dword ptr [eax-0C]
006F57CB        call        TBLHeli.ReadMCU
006F57D0        mov         ebx,eax
006F57D2        cmp         bl,4
006F57D5>       jne         006F5C08
006F57DB        mov         eax,dword ptr [ebp+8]
006F57DE        cmp         dword ptr [eax-10],0C0
006F57E5>       jl          006F5C08
006F57EB        lea         edx,[ebp-8]
006F57EE        mov         eax,dword ptr [ebp+8]
006F57F1        add         eax,0FFFFFFF8
006F57F4        call        006F5730
006F57F9        push        0
006F57FB        push        0
006F57FD        mov         eax,dword ptr [ebp+8]
006F5800        lea         edx,[eax-8]
006F5803        mov         cx,7C00
006F5807        xor         eax,eax
# 熟悉的位置，这里应该是具体解密的算法流程
006F5809        call        006ECD68
006F580E        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F5814        movzx       edx,byte ptr [edx]
006F5817        mov         eax,dword ptr [ebp+8]
006F581A        mov         eax,dword ptr [eax-4]
006F581D        call        006DAC28
006F5822        test        al,al
006F5824>       je          006F582D
006F5826        mov         bl,5
006F5828>       jmp         006F5C08
006F582D        mov         eax,dword ptr [ebp+8]
006F5830        mov         eax,dword ptr [eax-4]
006F5833        lea         edx,[eax+60]
006F5836        mov         eax,dword ptr [ebp+8]
006F5839        mov         eax,dword ptr [eax-0C]
006F583C        call        TBLHeli.ReadMCU
006F5841        mov         ebx,eax
006F5843        cmp         bl,4
006F5846>       je          006F586F
006F5848        mov         eax,dword ptr [ebp+8]
006F584B        mov         eax,dword ptr [eax-0C]
006F584E        mov         byte ptr [eax+0BA],1
006F5855        mov         eax,dword ptr [ebp+8]
006F5858        mov         eax,dword ptr [eax-4]
006F585B        test        eax,eax
006F585D>       je          006F5864
006F585F        sub         eax,4
006F5862        mov         eax,dword ptr [eax]
006F5864        mov         edx,dword ptr [ebp+8]
006F5867        mov         dword ptr [edx-10],eax
006F586A>       jmp         006F5C08
006F586F        mov         eax,dword ptr [ebp+8]
006F5872        lea         edx,[eax-8]
006F5875        lea         eax,[ebp-8]
006F5878        call        006F5730
006F587D        push        0
006F587F        push        1
006F5881        mov         eax,dword ptr [ebp+8]
006F5884        lea         edx,[eax-8]
006F5887        mov         cx,0F800
006F588B        xor         eax,eax
006F588D        call        006ECD68
006F5892        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F5898        movzx       edx,byte ptr [edx]
006F589B        mov         eax,dword ptr [ebp+8]
006F589E        mov         eax,dword ptr [eax-4]
006F58A1        call        006DAC28
006F58A6        test        al,al
006F58A8>       je          006F58B1
006F58AA        mov         bl,5
006F58AC>       jmp         006F5C08
006F58B1        mov         eax,dword ptr [ebp+8]
006F58B4        mov         eax,dword ptr [eax-4]
006F58B7        lea         edx,[eax+60]
006F58BA        mov         eax,dword ptr [ebp+8]
006F58BD        mov         eax,dword ptr [eax-0C]
006F58C0        call        TBLHeli.ReadMCU
006F58C5        mov         ebx,eax
006F58C7        cmp         bl,4
006F58CA>       je          006F58F3
006F58CC        mov         eax,dword ptr [ebp+8]
006F58CF        mov         eax,dword ptr [eax-0C]
006F58D2        mov         byte ptr [eax+0BA],1
006F58D9        mov         eax,dword ptr [ebp+8]
006F58DC        mov         eax,dword ptr [eax-4]
006F58DF        test        eax,eax
006F58E1>       je          006F58E8
006F58E3        sub         eax,4
006F58E6        mov         eax,dword ptr [eax]
006F58E8        mov         edx,dword ptr [ebp+8]
006F58EB        mov         dword ptr [edx-10],eax
006F58EE>       jmp         006F5C08
006F58F3        mov         eax,dword ptr [ebp+8]
006F58F6        lea         edx,[eax-8]
006F58F9        lea         eax,[ebp-8]
006F58FC        call        006F5730
006F5901        push        1
006F5903        push        0
006F5905        mov         eax,dword ptr [ebp+8]
006F5908        lea         edx,[eax-8]
006F590B        mov         cx,7C00
006F590F        xor         eax,eax
006F5911        call        006ECD68
006F5916        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F591C        movzx       edx,byte ptr [edx]
006F591F        mov         eax,dword ptr [ebp+8]
006F5922        mov         eax,dword ptr [eax-4]
006F5925        call        006DAC28
006F592A        test        al,al
006F592C>       je          006F5935
006F592E        mov         bl,5
006F5930>       jmp         006F5C08
006F5935        mov         eax,dword ptr [ebp+8]
006F5938        mov         eax,dword ptr [eax-4]
006F593B        lea         edx,[eax+60]
006F593E        mov         eax,dword ptr [ebp+8]
006F5941        mov         eax,dword ptr [eax-0C]
006F5944        call        TBLHeli.ReadMCU
006F5949        mov         ebx,eax
006F594B        cmp         bl,4
006F594E>       je          006F5979
006F5950        mov         eax,dword ptr [ebp+8]
006F5953        mov         eax,dword ptr [eax-0C]
006F5956        mov         byte ptr [eax+0BA],1
006F595D        mov         eax,dword ptr [ebp+8]
006F5960        mov         eax,dword ptr [eax-4]
006F5963        test        eax,eax
006F5965>       je          006F596C
006F5967        sub         eax,4
006F596A        mov         eax,dword ptr [eax]
006F596C        mov         edx,dword ptr [ebp+8]
006F596F        mov         dword ptr [edx-10],eax
006F5972        mov         bl,1
006F5974>       jmp         006F5C08
006F5979        mov         eax,dword ptr [ebp+8]
006F597C        lea         edx,[eax-8]
006F597F        lea         eax,[ebp-8]
006F5982        call        006F5730
006F5987        push        1
006F5989        push        1
006F598B        mov         eax,dword ptr [ebp+8]
006F598E        lea         edx,[eax-8]
006F5991        mov         cx,0F800
006F5995        xor         eax,eax
006F5997        call        006ECD68
006F599C        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F59A2        movzx       edx,byte ptr [edx]
006F59A5        mov         eax,dword ptr [ebp+8]
006F59A8        mov         eax,dword ptr [eax-4]
006F59AB        call        006DAC28
006F59B0        test        al,al
006F59B2>       je          006F59BB
006F59B4        mov         bl,5
006F59B6>       jmp         006F5C08
006F59BB        mov         eax,dword ptr [ebp+8]
006F59BE        mov         eax,dword ptr [eax-4]
006F59C1        lea         edx,[eax+60]
006F59C4        mov         eax,dword ptr [ebp+8]
006F59C7        mov         eax,dword ptr [eax-0C]
006F59CA        call        TBLHeli.ReadMCU
006F59CF        mov         ebx,eax
006F59D1        cmp         bl,4
006F59D4>       je          006F59FF
006F59D6        mov         eax,dword ptr [ebp+8]
006F59D9        mov         eax,dword ptr [eax-0C]
006F59DC        mov         byte ptr [eax+0BA],1
006F59E3        mov         eax,dword ptr [ebp+8]
006F59E6        mov         eax,dword ptr [eax-4]
006F59E9        test        eax,eax
006F59EB>       je          006F59F2
006F59ED        sub         eax,4
006F59F0        mov         eax,dword ptr [eax]
006F59F2        mov         edx,dword ptr [ebp+8]
006F59F5        mov         dword ptr [edx-10],eax
006F59F8        mov         bl,1
006F59FA>       jmp         006F5C08
006F59FF        mov         eax,dword ptr [ebp+8]
006F5A02        lea         edx,[eax-8]
006F5A05        lea         eax,[ebp-8]
006F5A08        call        006F5730
006F5A0D        push        0
006F5A0F        push        0
006F5A11        mov         eax,dword ptr [ebp+8]
006F5A14        lea         edx,[eax-8]
006F5A17        mov         cx,7C00
006F5A1B        mov         al,1
006F5A1D        call        006ECD68
006F5A22        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F5A28        movzx       edx,byte ptr [edx]
006F5A2B        mov         eax,dword ptr [ebp+8]
006F5A2E        mov         eax,dword ptr [eax-4]
006F5A31        call        006DAC28
006F5A36        test        al,al
006F5A38>       je          006F5A41
006F5A3A        mov         bl,5
006F5A3C>       jmp         006F5C08
006F5A41        mov         eax,dword ptr [ebp+8]
006F5A44        mov         eax,dword ptr [eax-4]
006F5A47        lea         edx,[eax+60]
006F5A4A        mov         eax,dword ptr [ebp+8]
006F5A4D        mov         eax,dword ptr [eax-0C]
006F5A50        call        TBLHeli.ReadMCU
006F5A55        mov         ebx,eax
006F5A57        cmp         bl,4
006F5A5A>       je          006F5A83
006F5A5C        mov         eax,dword ptr [ebp+8]
006F5A5F        mov         eax,dword ptr [eax-0C]
006F5A62        mov         byte ptr [eax+0BA],1
006F5A69        mov         eax,dword ptr [ebp+8]
006F5A6C        mov         eax,dword ptr [eax-4]
006F5A6F        test        eax,eax
006F5A71>       je          006F5A78
006F5A73        sub         eax,4
006F5A76        mov         eax,dword ptr [eax]
006F5A78        mov         edx,dword ptr [ebp+8]
006F5A7B        mov         dword ptr [edx-10],eax
006F5A7E>       jmp         006F5C08
006F5A83        mov         eax,dword ptr [ebp+8]
006F5A86        lea         edx,[eax-8]
006F5A89        lea         eax,[ebp-8]
006F5A8C        call        006F5730
006F5A91        push        0
006F5A93        push        1
006F5A95        mov         eax,dword ptr [ebp+8]
006F5A98        lea         edx,[eax-8]
006F5A9B        mov         cx,0F800
006F5A9F        mov         al,1
006F5AA1        call        006ECD68
006F5AA6        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F5AAC        movzx       edx,byte ptr [edx]
006F5AAF        mov         eax,dword ptr [ebp+8]
006F5AB2        mov         eax,dword ptr [eax-4]
006F5AB5        call        006DAC28
006F5ABA        test        al,al
006F5ABC>       je          006F5AC5
006F5ABE        mov         bl,5
006F5AC0>       jmp         006F5C08
006F5AC5        mov         eax,dword ptr [ebp+8]
006F5AC8        mov         eax,dword ptr [eax-4]
006F5ACB        lea         edx,[eax+60]
006F5ACE        mov         eax,dword ptr [ebp+8]
006F5AD1        mov         eax,dword ptr [eax-0C]
006F5AD4        call        TBLHeli.ReadMCU
006F5AD9        mov         ebx,eax
006F5ADB        cmp         bl,4
006F5ADE>       je          006F5B07
006F5AE0        mov         eax,dword ptr [ebp+8]
006F5AE3        mov         eax,dword ptr [eax-0C]
006F5AE6        mov         byte ptr [eax+0BA],1
006F5AED        mov         eax,dword ptr [ebp+8]
006F5AF0        mov         eax,dword ptr [eax-4]
006F5AF3        test        eax,eax
006F5AF5>       je          006F5AFC
006F5AF7        sub         eax,4
006F5AFA        mov         eax,dword ptr [eax]
006F5AFC        mov         edx,dword ptr [ebp+8]
006F5AFF        mov         dword ptr [edx-10],eax
006F5B02>       jmp         006F5C08
006F5B07        mov         eax,dword ptr [ebp+8]
006F5B0A        lea         edx,[eax-8]
006F5B0D        lea         eax,[ebp-8]
006F5B10        call        006F5730
006F5B15        push        1
006F5B17        push        0
006F5B19        mov         eax,dword ptr [ebp+8]
006F5B1C        lea         edx,[eax-8]
006F5B1F        mov         cx,7C00
006F5B23        mov         al,1
006F5B25        call        006ECD68
006F5B2A        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F5B30        movzx       edx,byte ptr [edx]
006F5B33        mov         eax,dword ptr [ebp+8]
006F5B36        mov         eax,dword ptr [eax-4]
006F5B39        call        006DAC28
006F5B3E        test        al,al
006F5B40>       je          006F5B49
006F5B42        mov         bl,5
006F5B44>       jmp         006F5C08
006F5B49        mov         eax,dword ptr [ebp+8]
006F5B4C        mov         eax,dword ptr [eax-4]
006F5B4F        lea         edx,[eax+60]
006F5B52        mov         eax,dword ptr [ebp+8]
006F5B55        mov         eax,dword ptr [eax-0C]
006F5B58        call        TBLHeli.ReadMCU
006F5B5D        mov         ebx,eax
006F5B5F        cmp         bl,4
006F5B62>       je          006F5B8A
006F5B64        mov         eax,dword ptr [ebp+8]
006F5B67        mov         eax,dword ptr [eax-0C]
006F5B6A        mov         byte ptr [eax+0BA],1
006F5B71        mov         eax,dword ptr [ebp+8]
006F5B74        mov         eax,dword ptr [eax-4]
006F5B77        test        eax,eax
006F5B79>       je          006F5B80
006F5B7B        sub         eax,4
006F5B7E        mov         eax,dword ptr [eax]
006F5B80        mov         edx,dword ptr [ebp+8]
006F5B83        mov         dword ptr [edx-10],eax
006F5B86        mov         bl,1
006F5B88>       jmp         006F5C08
006F5B8A        mov         eax,dword ptr [ebp+8]
006F5B8D        lea         edx,[eax-8]
006F5B90        lea         eax,[ebp-8]
006F5B93        call        006F5730
006F5B98        push        1
006F5B9A        push        1
006F5B9C        mov         eax,dword ptr [ebp+8]
006F5B9F        lea         edx,[eax-8]
006F5BA2        mov         cx,0F800
006F5BA6        mov         al,1
006F5BA8        call        006ECD68
006F5BAD        mov         edx,dword ptr ds:[9BE900];^gvar_009B7CE4
006F5BB3        movzx       edx,byte ptr [edx]
006F5BB6        mov         eax,dword ptr [ebp+8]
006F5BB9        mov         eax,dword ptr [eax-4]
006F5BBC        call        006DAC28
006F5BC1        test        al,al
006F5BC3>       je          006F5BC9
006F5BC5        mov         bl,5
006F5BC7>       jmp         006F5C08
006F5BC9        mov         eax,dword ptr [ebp+8]
006F5BCC        mov         eax,dword ptr [eax-4]
006F5BCF        lea         edx,[eax+60]
006F5BD2        mov         eax,dword ptr [ebp+8]
006F5BD5        mov         eax,dword ptr [eax-0C]
006F5BD8        call        TBLHeli.ReadMCU
006F5BDD        mov         ebx,eax
006F5BDF        cmp         bl,4
006F5BE2>       je          006F5C08
006F5BE4        mov         eax,dword ptr [ebp+8]
006F5BE7        mov         eax,dword ptr [eax-0C]
006F5BEA        mov         byte ptr [eax+0BA],1
006F5BF1        mov         eax,dword ptr [ebp+8]
006F5BF4        mov         eax,dword ptr [eax-4]
006F5BF7        test        eax,eax
006F5BF9>       je          006F5C00
006F5BFB        sub         eax,4
006F5BFE        mov         eax,dword ptr [eax]
006F5C00        mov         edx,dword ptr [ebp+8]
006F5C03        mov         dword ptr [edx-10],eax
006F5C06        mov         bl,1
006F5C08        xor         eax,eax
006F5C0A        pop         edx
006F5C0B        pop         ecx
006F5C0C        pop         ecx
006F5C0D        mov         dword ptr fs:[eax],edx
006F5C10        push        6F5C2D
006F5C15        lea         eax,[ebp-8]
006F5C18        mov         edx,dword ptr ds:[6DB86C];TByteBlocks
006F5C1E        call        0040C824
006F5C23        pop         eax
006F5C24        jmp         eax
006F5C26>       jmp         @HandleFinally
006F5C2B>       jmp         006F5C15
006F5C2D        mov         eax,ebx
006F5C2F        pop         ebx
006F5C30        pop         ecx
006F5C31        pop         ecx
006F5C32        pop         ebp
006F5C33        ret

```



#### 006ECD68

```assembly
BLHeli.sub_006ECD68
006ECD68        push        ebp
006ECD69        mov         ebp,esp
006ECD6B        add         esp,0FFFFFFEC
006ECD6E        push        ebx
006ECD6F        push        esi
006ECD70        push        edi
006ECD71        xor         ebx,ebx
006ECD73        mov         dword ptr [ebp-4],ebx
006ECD76        mov         dword ptr [ebp-8],ebx
006ECD79        mov         word ptr [ebp-0C],cx
006ECD7D        mov         esi,edx
006ECD7F        mov         byte ptr [ebp-9],al
006ECD82        xor         eax,eax
006ECD84        push        ebp
006ECD85        push        6ECF39
006ECD8A        push        dword ptr fs:[eax]
006ECD8D        mov         dword ptr fs:[eax],esp
006ECD90        mov         edx,dword ptr [esi]
006ECD92        test        edx,edx
006ECD94>       jne         006ECD9A
006ECD96        mov         al,1
006ECD98>       jmp         006ECDAB
006ECD9A        mov         eax,dword ptr [esi+4]
006ECD9D        test        eax,eax
006ECD9F>       je          006ECDA6
006ECDA1        sub         eax,4
006ECDA4        mov         eax,dword ptr [eax]
006ECDA6        cmp         eax,edx
006ECDA8        setle       al
006ECDAB        test        al,al
006ECDAD>       je          006ECDCE
006ECDAF        movzx       eax,byte ptr [ebp+0C]
006ECDB3        push        eax
006ECDB4        movzx       eax,byte ptr [ebp+8]
006ECDB8        push        eax
006ECDB9        lea         edx,[esi+4]
006ECDBC        movzx       ecx,word ptr [ebp-0C]
006ECDC0        movzx       eax,byte ptr [ebp-9]
006ECDC4        call        006ECD34
006ECDC9>       jmp         006ECF16
006ECDCE        mov         word ptr [ebp-12],0
006ECDD4        mov         word ptr [ebp-0E],0
006ECDDA        lea         eax,[ebp-8]
006ECDDD        mov         edx,dword ptr ds:[404CB0];TArray<System.Byte>
006ECDE3        call        DynArrayClear
006ECDE8        movzx       edx,byte ptr [ebp+8]
006ECDEC        movzx       eax,word ptr [ebp-0C]
006ECDF0        call        006EC638
006ECDF5        call        006EC684
006ECDFA        mov         byte ptr [ebp-0F],al
006ECDFD        mov         eax,dword ptr [esi+4]
006ECE00        test        eax,eax
006ECE02>       je          006ECE09
006ECE04        sub         eax,4
006ECE07        mov         eax,dword ptr [eax]
006ECE09        mov         edi,eax
006ECE0B        cmp         edi,1
006ECE0E>       jle         006ECEBE
006ECE14        mov         ebx,edi
006ECE16        cmp         ebx,dword ptr [esi]
006ECE18>       jle         006ECE1C
006ECE1A        mov         ebx,dword ptr [esi]
006ECE1C        push        ebx
006ECE1D        lea         eax,[ebp-4]
006ECE20        mov         ecx,1
006ECE25        mov         edx,dword ptr ds:[404CB0];TArray<System.Byte>
006ECE2B        call        @DynArraySetLength
006ECE30        add         esp,4
006ECE33        movzx       eax,word ptr [ebp-12]
006ECE37        mov         edx,dword ptr [esi+4]
006ECE3A        lea         eax,[edx+eax]
006ECE3D        mov         ecx,ebx
006ECE3F        mov         edx,dword ptr [ebp-4]
006ECE42        call        Move
006ECE47        cmp         byte ptr [ebp-9],0
006ECE4B>       je          006ECE68
006ECE4D        movzx       eax,byte ptr [ebp+8]
006ECE51        push        eax
006ECE52        movzx       edx,word ptr [ebp-0C]
006ECE56        add         dx,word ptr [ebp-0E]
006ECE5A        lea         eax,[ebp-4]
006ECE5D        movzx       ecx,byte ptr [ebp+0C]
006ECE61        call        006ECB8C
006ECE66>       jmp         006ECE81
006ECE68        movzx       eax,byte ptr [ebp+8]
006ECE6C        push        eax
006ECE6D        movzx       edx,word ptr [ebp-0C]
006ECE71        add         dx,word ptr [ebp-0E]
006ECE75        lea         eax,[ebp-4]
006ECE78        movzx       ecx,byte ptr [ebp+0C]
006ECE7C        call        006EC84C
006ECE81        add         word ptr [ebp-12],bx
006ECE85        sub         edi,ebx
006ECE87        cmp         byte ptr [ebp-0F],0
006ECE8B>       je          006ECEA0
006ECE8D        test        ebx,ebx
006ECE8F>       jns         006ECE94
006ECE91        add         ebx,3
006ECE94        sar         ebx,2
006ECE97        lea         eax,[ebx+ebx*2]
006ECE9A        add         word ptr [ebp-0E],ax
006ECE9E>       jmp         006ECEA4
006ECEA0        add         word ptr [ebp-0E],bx
006ECEA4        lea         eax,[ebp-8]
006ECEA7        mov         edx,dword ptr [ebp-4]
006ECEAA        mov         ecx,dword ptr ds:[404CB0];TArray<System.Byte>
006ECEB0        call        0040E258
006ECEB5        cmp         edi,1
006ECEB8>       jg          006ECE14
006ECEBE        mov         ebx,dword ptr [ebp-8]
006ECEC1        test        ebx,ebx
006ECEC3>       je          006ECECA
006ECEC5        sub         ebx,4
006ECEC8        mov         ebx,dword ptr [ebx]
006ECECA        push        ebx
006ECECB        lea         eax,[esi+4]
006ECECE        mov         ecx,1
006ECED3        mov         edx,dword ptr ds:[404CB0];TArray<System.Byte>
006ECED9        call        @DynArraySetLength
006ECEDE        add         esp,4
006ECEE1        mov         eax,dword ptr [ebp-8]
006ECEE4        test        eax,eax
006ECEE6>       je          006ECEED
006ECEE8        sub         eax,4
006ECEEB        mov         eax,dword ptr [eax]
006ECEED        mov         edx,dword ptr [esi+4]
006ECEF0        mov         ecx,eax
006ECEF2        mov         eax,dword ptr [ebp-8]
006ECEF5        call        Move
006ECEFA        mov         eax,dword ptr [ebp-8]
006ECEFD        test        eax,eax
006ECEFF>       je          006ECF06
006ECF01        sub         eax,4
006ECF04        mov         eax,dword ptr [eax]
006ECF06        xor         ecx,ecx
006ECF08        mov         edx,eax
006ECF0A        mov         eax,dword ptr [ebp-8]
006ECF0D        call        @FillChar
006ECF12        xor         eax,eax
006ECF14        mov         dword ptr [esi],eax
006ECF16        xor         eax,eax
006ECF18        pop         edx
006ECF19        pop         ecx
006ECF1A        pop         ecx
006ECF1B        mov         dword ptr fs:[eax],edx
006ECF1E        push        6ECF40
006ECF23        lea         eax,[ebp-8]
006ECF26        mov         edx,dword ptr ds:[404CB0];TArray<System.Byte>
006ECF2C        mov         ecx,2
006ECF31        call        @FinalizeArray
006ECF36        pop         eax
006ECF37        jmp         eax
006ECF39>       jmp         @HandleFinally
006ECF3E>       jmp         006ECF23
006ECF40        pop         edi
006ECF41        pop         esi
006ECF42        pop         ebx
006ECF43        mov         esp,ebp
006ECF45        pop         ebp
006ECF46        ret         8

```

这里就是新的解密的代码，对比了一下之前的结构，这里变化比较大，不太一样了



## Summary


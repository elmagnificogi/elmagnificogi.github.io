---
layout:     post
title:      "BLHeliSuite32逆向（二）"
subtitle:   "Crack，Reverse"
date:       2021-07-16
update:     2021-07-16
author:     "elmagnifico"
header-img: "img/drone.jpg"
catalog:    true
mathjax:    false
tags:
    - crack
    - BLHeli
---

## Foreword

继续上篇，markdown内容一多了，typora里再写就非常卡了，复制粘贴也不舒服，大概也有20000词而已，所以这里再开一篇



## 串口读取

### CheckStrACK

找了半天没看到实际收串口数据的代码，最后才发现好像这个CheckStrAck的地方里面有串口数据相关的内容。这个函数名简直坑爹。

```assembly
_Unit108.TBootloader.CheckStrACK
00704390        push        ebp
00704391        mov         ebp,esp
00704393        push        ecx
00704394        mov         ecx,0B
00704399        push        0
0070439B        push        0
0070439D        dec         ecx
0070439E>       jne         00704399
007043A0        xchg        ecx,dword ptr [ebp-4]
007043A3        push        ebx
007043A4        push        esi
007043A5        push        edi
007043A6        mov         dword ptr [ebp-10],ecx
# ecx=0x103 刚好是传输时 电调发送来的259个字节
007043A9        mov         esi,edx
007043AB        mov         ebx,eax
007043AD        xor         eax,eax
007043AF        push        ebp
007043B0        push        704AF9
007043B5        push        dword ptr fs:[eax]
007043B8        mov         dword ptr fs:[eax],esp
007043BB        mov         byte ptr [ebp-11],0
007043BF        mov         byte ptr [ebp-17],0
007043C3        lea         eax,[ebp-4]
007043C6        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
007043CC        call        @DynArrayClear
007043D1        mov         word ptr [ebp-16],0
007043D7        mov         byte ptr [ebx+0A1],0FF;TBootloader.FLastACK:byte
007043DE        cmp         byte ptr [ebx+0B4],0FD;TBootloader.FLastCMD:byte
007043E5>       je          007043EE
007043E7        mov         eax,ebx
007043E9        call        00704198
007043EE        call        006DB734
007043F3        test        al,al
007043F5>       je          0070445C
007043F7        call        006D91CC
007043FC        mov         dword ptr [ebx+108],eax;TBootloader.FStartTime:Int64
00704402        mov         dword ptr [ebx+10C],edx;TBootloader.?f10C:Integer
00704408        cmp         byte ptr [ebp+8],0
0070440C>       je          00704418
0070440E        mov         eax,1
00704413        call        006DBF4C
00704418        cmp         byte ptr [ebx+0B4],0B;TBootloader.FLastCMD:byte
# 1.跳转
0070441F>       je          00704448
00704421        push        704B1C;'<'
00704426        push        dword ptr [ebx+0E8];TBootloader.FInfName:string
0070442C        push        704B2C;': '
00704431        lea         eax,[ebp-28]
00704434        mov         edx,3
00704439        call        @UStrCatN
0070443E        mov         eax,dword ptr [ebp-28]
00704441        call        006DC07C
00704446>       jmp         00704452
# 1.继续
00704448        mov         eax,704B40;'<BOOLOADER ANSWER: '
0070444D        call        006DC07C
00704452        mov         eax,1
00704457        call        006DBF4C
0070445C        mov         eax,ebx
0070445E        call        TBootloader.GetReadTimeOut
00704463        mov         word ptr [ebp-14],ax
00704467        cmp         byte ptr [ebx+0B4],0B;TBootloader.FLastCMD:byte
# 2.跳转
0070446E>       jne         007044ED
00704470        cmp         byte ptr [ebx+0E4],0;TBootloader.FFVTLinkerMode:Boolean
00704477>       jne         007044ED
00704479        mov         edx,32
0070447E        mov         eax,ebx
00704480        call        TBootloader.SetReadTimeOut
00704485        lea         ecx,[ebp-2C]
00704488        mov         edx,1
0070448D        mov         eax,ebx
0070448F        call        TBootloader.RecvString
00704494        mov         edx,dword ptr [ebp-2C]
00704497        mov         eax,esi
00704499        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
0070449F        call        @DynArrayAsg
007044A4        mov         eax,dword ptr [esi]
007044A6        test        eax,eax
007044A8>       je          007044AF
007044AA        sub         eax,4
007044AD        mov         eax,dword ptr [eax]
007044AF        test        eax,eax
007044B1>       jle         0070451D
007044B3        mov         edx,dword ptr [ebp-10]
007044B6        add         edx,32
007044B9        mov         eax,ebx
007044BB        call        TBootloader.SetReadTimeOut
007044C0        lea         ecx,[ebp-34]
007044C3        mov         edx,dword ptr [ebp-10]
007044C6        dec         edx
007044C7        mov         eax,ebx
007044C9        call        TBootloader.RecvString
007044CE        mov         edx,dword ptr [ebp-34]
007044D1        lea         ecx,[ebp-30]
007044D4        mov         eax,dword ptr [esi]
007044D6        call        006D5954
007044DB        mov         edx,dword ptr [ebp-30]
007044DE        mov         eax,esi
007044E0        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
007044E6        call        @DynArrayAsg
007044EB>       jmp         0070451D
# 2.继续
007044ED        mov         edx,dword ptr [ebp-10]
007044F0        mov         eax,ebx
007044F2        call        TBootloader.CalcCMDAckTimeOut
007044F7        mov         edx,eax
007044F9        mov         eax,ebx
007044FB        call        TBootloader.SetReadTimeOut
00704500        lea         ecx,[ebp-38]
00704503        mov         edx,dword ptr [ebp-10]
00704506        mov         eax,ebx
# 上面的edx 是读取长度 eax应该是存放的数组或者地址
00704508        call        TBootloader.RecvString
# 结束以后 这句就是把地址给回来，edx中存储的内容就是真正的数据
0070450D        mov         edx,dword ptr [ebp-38]
```

这个数据和我用串口同时监听到的数据一样

- 实际上这个串口buff地址每次启动都会不一样，但是总体每次运行到这个位置的时候，某个寄存器里面一定存的就是这个地址

![image-20210716172235050](https://i.loli.net/2021/07/16/3L4fjtRnQhHbCc1.png)



```assembly
00704510        mov         eax,esi
00704512        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
00704518        call        @DynArrayAsg
0070451D        call        006DB734
00704522        test        al,al
00704524>       je          00704537
00704526        call        006D91CC
0070452B        mov         dword ptr [ebx+110],eax;TBootloader.FEndTime:Int64
00704531        mov         dword ptr [ebx+114],edx;TBootloader.?f114:Pointer
00704537        mov         edx,dword ptr [esi]
00704539        mov         eax,edx
0070453B        test        eax,eax
0070453D>       je          00704544
0070453F        sub         eax,4
00704542        mov         eax,dword ptr [eax]
00704544        test        eax,eax
00704546>       jle         00704681
0070454C        mov         eax,edx
0070454E        test        eax,eax
00704550>       je          00704557
00704552        sub         eax,4
00704555        mov         eax,dword ptr [eax]
# 这里exa=0x103 而[ebp-10]也是103，所以这里跳转了
# 此时edx指向了串口buff，所以关注edx就行了
00704557        cmp         eax,dword ptr [ebp-10]
# 3.跳转
0070455A>       jge         0070461A
00704560        lea         ecx,[ebp-8]
00704563        mov         edx,0A
00704568        mov         eax,ebx
0070456A        call        TBootloader.RecvString
0070456F        mov         eax,dword ptr [ebp-8]
00704572        test        eax,eax
00704574>       je          0070457B
00704576        sub         eax,4
00704579        mov         eax,dword ptr [eax]
0070457B        test        eax,eax
0070457D>       jle         007045D3
0070457F        lea         ecx,[ebp-3C]
00704582        mov         eax,dword ptr [esi]
00704584        mov         edx,dword ptr [ebp-8]
00704587        call        006D5954
0070458C        mov         edx,dword ptr [ebp-3C]
0070458F        mov         eax,esi
00704591        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
00704597        call        @DynArrayAsg
0070459C        call        006DB734
007045A1        test        al,al
007045A3>       je          007045D3
007045A5        mov         edi,dword ptr [ebp-8]
007045A8        test        edi,edi
007045AA>       je          007045B1
007045AC        sub         edi,4
007045AF        mov         edi,dword ptr [edi]
007045B1        lea         edx,[ebp-44]
007045B4        mov         eax,edi
007045B6        call        IntToStr
007045BB        mov         ecx,dword ptr [ebp-44]
007045BE        lea         eax,[ebp-40]
007045C1        mov         edx,704B74;'Repeated Read: '
007045C6        call        @UStrCat3
007045CB        mov         eax,dword ptr [ebp-40]
007045CE        call        006DBFB4
007045D3        mov         eax,dword ptr [esi]
007045D5        test        eax,eax
007045D7>       je          007045DE
007045D9        sub         eax,4
007045DC        mov         eax,dword ptr [eax]
007045DE        cmp         eax,dword ptr [ebp-10]
007045E1>       jl          007045E7
007045E3        mov         al,1
007045E5>       jmp         007045F8
007045E7        mov         eax,dword ptr [ebp-8]
007045EA        test        eax,eax
007045EC>       je          007045F3
007045EE        sub         eax,4
007045F1        mov         eax,dword ptr [eax]
007045F3        test        eax,eax
007045F5        sete        al
007045F8        test        al,al
007045FA>       je          00704560
00704600        call        006DB734
00704605        test        al,al
00704607>       je          0070461A
00704609        call        006D91CC
0070460E        mov         dword ptr [ebx+110],eax;TBootloader.FEndTime:Int64
00704614        mov         dword ptr [ebx+114],edx;TBootloader.?f114:Pointer
# 3.继续
0070461A        mov         eax,dword ptr [esi]
0070461C        test        eax,eax
0070461E>       je          00704625
00704620        sub         eax,4
00704623        mov         eax,dword ptr [eax]
00704625        dec         eax
00704626        mov         edx,dword ptr [esi]
# 这里eax是最后一个字符 也就是 30 ack
00704628        movzx       eax,byte ptr [edx+eax]
0070462C        mov         byte ptr [ebx+0A1],al;TBootloader.FLastACK:byte
# 这里就是判定是否接收到了ack，因为是30，不同，所以跳转了
00704632        cmp         byte ptr [ebx+0A0],0;TBootloader.FbrOK:byte
# 4.跳转
00704639>       jne         00704656
0070463B        movzx       eax,byte ptr [ebx+0A1];TBootloader.FLastACK:byte
00704642        cmp         al,30
00704644>       jb          00704681
00704646        cmp         al,3F
00704648>       ja          00704681
0070464A        mov         byte ptr [ebx+0A0],al;TBootloader.FbrOK:byte
00704650        mov         byte ptr [ebp-11],1
00704654>       jmp         00704681
# 4.继续
00704656        movzx       eax,byte ptr [ebx+0A1];TBootloader.FLastACK:byte
# 这里就发现实际上是OK，和30相等，所以继续
0070465D        cmp         al,byte ptr [ebx+0A0];TBootloader.FbrOK:byte
00704663>       jne         0070466B
00704665        mov         byte ptr [ebp-11],1
# 这里小跳了一下
00704669>       jmp         00704681
0070466B        cmp         byte ptr [ebx+0A1],0C1;TBootloader.FLastACK:byte
00704672>       jne         00704681
00704674        cmp         byte ptr [ebx+0B4],0FD;TBootloader.FLastCMD:byte
0070467B>       jne         00704681
0070467D        mov         byte ptr [ebp-11],1
# 这里继续
00704681        mov         edx,dword ptr [esi]
00704683        mov         eax,edx
00704685        test        eax,eax
00704687>       je          0070468E
00704689        sub         eax,4
0070468C        mov         eax,dword ptr [eax]
0070468E        cmp         eax,3
00704691>       jle         00704889
# 这里又比较了一下ack 不相等，所以继续
00704697        cmp         byte ptr [ebx+0B4],0B;TBootloader.FLastCMD:byte
0070469E>       je          0070478D
007046A4        mov         byte ptr [ebp-17],1
007046A8        mov         edi,edx
007046AA        test        edi,edi
007046AC>       je          007046B3
007046AE        sub         edi,4
007046B1        mov         edi,dword ptr [edi]
007046B3        mov         dword ptr [ebp-1C],edx
007046B6        cmp         dword ptr [ebp-1C],0
007046BA>       je          007046C7
007046BC        mov         eax,dword ptr [ebp-1C]
007046BF        sub         eax,4
007046C2        mov         eax,dword ptr [eax]
007046C4        mov         dword ptr [ebp-1C],eax
007046C7        dec         edi
007046C8        mov         eax,dword ptr [esi]
007046CA        movzx       eax,byte ptr [eax+edi-2]
007046CF        mov         byte ptr [ebp-48],al
007046D2        mov         eax,dword ptr [ebp-1C]
007046D5        dec         eax
007046D6        mov         edx,dword ptr [esi]
007046D8        movzx       eax,byte ptr [edx+eax-1]
007046DD        mov         byte ptr [ebp-47],al
007046E0        lea         eax,[ebp-48]
007046E3        lea         ecx,[ebp-4]
007046E6        mov         edx,1
007046EB        call        006D59C4
007046F0        mov         eax,dword ptr [esi]
007046F2        test        eax,eax
007046F4>       je          007046FB
007046F6        sub         eax,4
007046F9        mov         eax,dword ptr [eax]
007046FB        mov         edx,dword ptr [esi]
007046FD        mov         dword ptr [ebp-20],edx
00704700        cmp         dword ptr [ebp-20],0
00704704>       je          00704711
00704706        mov         edx,dword ptr [ebp-20]
00704709        sub         edx,4
0070470C        mov         edx,dword ptr [edx]
0070470E        mov         dword ptr [ebp-20],edx
00704711        dec         eax
00704712        mov         edx,dword ptr [esi]
00704714        movzx       eax,byte ptr [edx+eax-1]
00704719        shl         eax,8
0070471C        mov         edx,dword ptr [ebp-20]
0070471F        dec         edx
00704720        mov         ecx,dword ptr [esi]
00704722        movzx       edx,byte ptr [ecx+edx-2]
00704727        add         ax,dx
# 上面搞了半天就是把最后2个校验的值，拼到了一起，变成了一个16bits的数据
0070472A        mov         word ptr [ebp-16],ax
0070472E        mov         edi,dword ptr [esi]
00704730        test        edi,edi
00704732>       je          00704739
00704734        sub         edi,4
00704737        mov         edi,dword ptr [edi]
00704739        sub         edi,3
0070473C        push        edi
0070473D        mov         eax,esi
0070473F        mov         ecx,1
00704744        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
0070474A        call        @DynArraySetLength
0070474F        add         esp,4
00704752        mov         edx,dword ptr [esi]
00704754        mov         eax,ebx
# 操作这么一通就是为了计算crc，不过至少这里追到了串口buff，后面就好找了。
00704756        call        TBootloader.StringCrc
0070475B        mov         word ptr [ebx+0BE],ax;TBootloader.LastInCRC:word
00704762        movzx       eax,word ptr [ebx+0BE];TBootloader.LastInCRC:word
00704769        cmp         ax,word ptr [ebp-16]
# 这里是crc校验通过了，所以跳走了
# 5.跳转
0070476D>       je          0070478D
0070476F        mov         byte ptr [ebp-11],0
00704773        mov         byte ptr [ebx+0A1],0CA;TBootloader.FLastACK:byte
0070477A        call        006DB734
0070477F        test        al,al
00704781>       je          0070478D
00704783        mov         eax,704BA0;'Wrong CRC of received String'
00704788        call        006DBFB4
# 5.继续
0070478D        call        006DB734
00704792        test        al,al
00704794>       je          00704A51
0070479A        lea         ecx,[ebp-4C]
0070479D        mov         eax,dword ptr [esi]
0070479F        mov         edx,dword ptr [ebp-4]
007047A2        call        006D5954
007047A7        mov         eax,dword ptr [ebp-4C]
007047AA        push        eax
007047AB        mov         eax,ebx
007047AD        call        TBootloader.AllowLog
007047B2        mov         edx,eax
007047B4        mov         ecx,800
# 这里就是恢复了串口buff 
007047B9        pop         eax
007047BA        call        006DC174
007047BF        cmp         byte ptr [ebp-17],0
007047C3>       je          007047D9
007047C5        push        1
007047C7        movzx       ecx,word ptr [ebx+0BE];TBootloader.LastInCRC:word
007047CE        movzx       edx,word ptr [ebp-16]
007047D2        mov         eax,ebx
007047D4        call        00706584
007047D9        lea         eax,[ebp-0C]
007047DC        push        eax
007047DD        movzx       edx,byte ptr [ebx+0A1];TBootloader.FLastACK:byte
007047E4        xor         ecx,ecx
007047E6        mov         eax,ebx
007047E8        call        00705B90
007047ED        mov         eax,704BE8;'ACK: '
007047F2        call        006DC090
007047F7        mov         eax,dword ptr [ebp-0C]
007047FA        call        006DC0A4
007047FF        mov         eax,704C00;'Time elapsed (ms): '
00704804        call        006DBFA0
00704809        mov         eax,dword ptr [ebx+110];TBootloader.FEndTime:Int64
0070480F        mov         edx,dword ptr [ebx+114];TBootloader.?f114:Pointer
00704815        sub         eax,dword ptr [ebx+108]
0070481B        sbb         edx,dword ptr [ebx+10C]
00704821        push        edx
00704822        push        eax
00704823        lea         eax,[ebp-50]
# 这里基本上都是在做log相关的内容，把数据转string 显示出来
00704826        call        IntToStr
0070482B        mov         eax,dword ptr [ebp-50]
0070482E        call        006DC004
00704833        mov         eax,1
00704838        call        006DBF64
0070483D        mov         esi,dword ptr [esi]
0070483F        test        esi,esi
00704841>       je          00704848
00704843        sub         esi,4
00704846        mov         esi,dword ptr [esi]
00704848        lea         edx,[ebp-54]
0070484B        mov         eax,esi
0070484D        call        IntToStr
00704852        mov         eax,dword ptr [ebp-54]
00704855        or          ecx,0FFFFFFFF
00704858        mov         edx,0FF
0070485D        call        006DBD18
00704862        or          ecx,0FFFFFFFF
00704865        mov         edx,0FF0000
0070486A        mov         eax,704C34;' Bytes '
0070486F        call        006DBD18
00704874        or          ecx,0FFFFFFFF
00704877        mov         edx,0FF00FF
0070487C        mov         eax,dword ptr [ebp-0C]
0070487F        call        006DBD18
# 6.跳转
00704884>       jmp         00704A51
00704889        mov         eax,edx
0070488B        test        eax,eax
0070488D>       je          00704894
0070488F        sub         eax,4
00704892        mov         eax,dword ptr [eax]
00704894        dec         eax
00704895>       jle         007048C0
00704897        mov         byte ptr [ebp-11],0
0070489B        call        006DB734
007048A0        test        al,al
007048A2>       je          007048AE
007048A4        mov         eax,704C50;'Wrong Size of received String'
007048A9        call        006DBFB4
007048AE        mov         eax,esi
007048B0        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
007048B6        call        @DynArrayClear
007048BB>       jmp         00704A51
007048C0        mov         eax,edx
007048C2        test        eax,eax
007048C4>       je          007048CB
007048C6        sub         eax,4
007048C9        mov         eax,dword ptr [eax]
007048CB        dec         eax
007048CC>       jne         0070499F
007048D2        call        006DB734
007048D7        test        al,al
007048D9>       je          00704A51
007048DF        mov         eax,[0084158C];^gvar_0085C668
007048E4        cmp         dword ptr [eax],4
007048E7>       jge         007048FF
007048E9        cmp         byte ptr [ebx+0A1],0C1;TBootloader.FLastACK:byte
007048F0>       jne         007048FF
007048F2        cmp         byte ptr [ebx+0B4],0FD;TBootloader.FLastCMD:byte
007048F9>       je          00704A51
007048FF        mov         eax,ebx
00704901        call        TBootloader.AllowLog
00704906        mov         edx,eax
00704908        mov         eax,dword ptr [esi]
0070490A        mov         ecx,800
0070490F        call        006DC174
00704914        lea         eax,[ebp-0C]
00704917        push        eax
00704918        movzx       edx,byte ptr [ebx+0A1];TBootloader.FLastACK:byte
0070491F        xor         ecx,ecx
00704921        mov         eax,ebx
00704923        call        00705B90
00704928        mov         eax,704BE8;'ACK: '
0070492D        call        006DC090
00704932        mov         eax,dword ptr [ebp-0C]
00704935        call        006DC0A4
0070493A        mov         eax,704C00;'Time elapsed (ms): '
0070493F        call        006DBFA0
00704944        mov         eax,dword ptr [ebx+110];TBootloader.FEndTime:Int64
0070494A        mov         edx,dword ptr [ebx+114];TBootloader.?f114:Pointer
00704950        sub         eax,dword ptr [ebx+108]
00704956        sbb         edx,dword ptr [ebx+10C]
0070495C        push        edx
0070495D        push        eax
0070495E        lea         eax,[ebp-58]
00704961        call        IntToStr
00704966        mov         eax,dword ptr [ebp-58]
00704969        call        006DC004
0070496E        mov         eax,1
00704973        call        006DBF64
00704978        or          ecx,0FFFFFFFF
0070497B        mov         edx,80
00704980        mov         eax,704C98;' ACK: '
00704985        call        006DBD18
0070498A        or          ecx,0FFFFFFFF
0070498D        mov         edx,0FF00FF
00704992        mov         eax,dword ptr [ebp-0C]
00704995        call        006DBD18
0070499A>       jmp         00704A51
0070499F        mov         dword ptr [ebp-24],edx
007049A2        cmp         dword ptr [ebp-24],0
007049A6>       je          007049B3
007049A8        mov         eax,dword ptr [ebp-24]
007049AB        sub         eax,4
007049AE        mov         eax,dword ptr [eax]
007049B0        mov         dword ptr [ebp-24],eax
007049B3        cmp         dword ptr [ebp-24],0
007049B7>       jne         00704A51
007049BD        call        006DB734
007049C2        test        al,al
007049C4>       je          00704A51
007049CA        mov         eax,[0084158C];^gvar_0085C668
007049CF        cmp         dword ptr [eax],3
007049D2>       jge         007049DD
007049D4        cmp         byte ptr [ebx+0B4],0B;TBootloader.FLastCMD:byte
007049DB>       je          00704A51
007049DD        mov         eax,704C00;'Time elapsed (ms): '
007049E2        call        006DBFA0
007049E7        mov         eax,dword ptr [ebx+110];TBootloader.FEndTime:Int64
007049ED        mov         edx,dword ptr [ebx+114];TBootloader.?f114:Pointer
007049F3        sub         eax,dword ptr [ebx+108]
007049F9        sbb         edx,dword ptr [ebx+10C]
007049FF        push        edx
00704A00        push        eax
00704A01        lea         eax,[ebp-5C]
00704A04        call        IntToStr
00704A09        mov         eax,dword ptr [ebp-5C]
00704A0C        call        006DC004
00704A11        mov         eax,1
00704A16        call        006DBF64
00704A1B        lea         eax,[ebp-0C]
00704A1E        push        eax
00704A1F        movzx       edx,byte ptr [ebx+0A1];TBootloader.FLastACK:byte
00704A26        xor         ecx,ecx
00704A28        mov         eax,ebx
00704A2A        call        00705B90
00704A2F        or          ecx,0FFFFFFFF
00704A32        mov         edx,80
00704A37        mov         eax,704C98;' ACK: '
00704A3C        call        006DBD18
00704A41        or          ecx,0FFFFFFFF
00704A44        mov         edx,0FF00FF
00704A49        mov         eax,dword ptr [ebp-0C]
00704A4C        call        006DBD18
# 6.继续
00704A51        call        006DB734
00704A56        and         al,byte ptr [ebp+8]
00704A59>       je          00704A65
00704A5B        mov         eax,1
00704A60        call        006DBF64
00704A65        cmp         byte ptr [ebx+0B4],0FD;TBootloader.FLastCMD:byte
00704A6C>       je          00704A75
00704A6E        mov         eax,ebx
00704A70        call        00704154
00704A75        mov         eax,ebx
00704A77        call        TBootloader.GetReadTimeOut
00704A7C        movzx       esi,word ptr [ebp-14]
00704A80        cmp         eax,esi
00704A82>       je          00704A8D
00704A84        mov         edx,esi
00704A86        mov         eax,ebx
00704A88        call        TBootloader.SetReadTimeOut
00704A8D        xor         eax,eax
00704A8F        pop         edx
00704A90        pop         ecx
00704A91        pop         ecx
00704A92        mov         dword ptr fs:[eax],edx
00704A95        push        704B00
00704A9A        lea         eax,[ebp-5C]
00704A9D        mov         edx,4
00704AA2        call        @UStrArrayClr
00704AA7        lea         eax,[ebp-4C]
00704AAA        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00704AB0        call        @DynArrayClear
00704AB5        lea         eax,[ebp-44]
00704AB8        mov         edx,2
00704ABD        call        @UStrArrayClr
00704AC2        lea         eax,[ebp-3C]
00704AC5        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00704ACB        mov         ecx,5
00704AD0        call        @FinalizeArray
00704AD5        lea         eax,[ebp-28]
00704AD8        call        @UStrClr
00704ADD        lea         eax,[ebp-0C]
00704AE0        call        @UStrClr
00704AE5        lea         eax,[ebp-8]
00704AE8        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00704AEE        mov         ecx,2
00704AF3        call        @FinalizeArray
00704AF8        ret
00704AF9>       jmp         @HandleFinally
00704AFE>       jmp         00704A9A
00704B00        movzx       eax,byte ptr [ebp-11]
00704B04        pop         edi
00704B05        pop         esi
00704B06        pop         ebx
00704B07        mov         esp,ebp
00704B09        pop         ebp
00704B0A        ret         4

```



### ReadFlash

这里结束了以后又回到了TBootloader.ReadFlash

```assembly
_Unit108.TBootloader.ReadFlash
...
# 设置地址
00702CEB        call        TBootloader.SendCMDSetAddress
00702CF0        test        al,al
00702CF2>       je          00702D8A
00702CF8        mov         edx,ebx
00702CFA        mov         eax,dword ptr [ebp-8]
# 开始读
00702CFD        call        TBootloader.SendCMDFlashRead
00702D02        test        al,al
00702D04>       je          00702D8A
00702D0A        push        1
00702D0C        lea         ecx,[edi+3]
00702D0F        lea         edx,[ebp-4]
00702D12        mov         eax,dword ptr [ebp-8]
# 检测是否有ack,这里之前漏掉了，实际上这里非常重要
00702D15        call        TBootloader.CheckStrACK
00702D1A        test        al,al
00702D1C>       je          00702D8A
00702D1E        inc         dword ptr [ebp-0C]
00702D21        call        006DB734
00702D26        test        al,al
00702D28>       je          00702DA6
00702D2A        mov         eax,dword ptr [ebp-4]
00702D2D        mov         dword ptr [ebp-1C],eax
00702D30        cmp         dword ptr [ebp-1C],0
00702D34>       je          00702D41
00702D36        mov         eax,dword ptr [ebp-1C]
00702D39        sub         eax,4
00702D3C        mov         eax,dword ptr [eax]
00702D3E        mov         dword ptr [ebp-1C],eax
# 应该是log 显示读了多少字节内容
00702D41        push        702EFC;'('
00702D46        lea         edx,[ebp-28]
00702D49        mov         eax,dword ptr [ebp-1C]
00702D4C        call        IntToStr
00702D51        push        dword ptr [ebp-28]
00702D54        push        702F0C;' Bytes)'
00702D59        lea         eax,[ebp-24]
00702D5C        mov         edx,3
00702D61        call        @UStrCatN
00702D66        mov         eax,dword ptr [ebp-24]
00702D69        or          ecx,0FFFFFFFF
00702D6C        mov         edx,0FF0000
00702D71        call        006DBD18
00702D76        or          ecx,0FFFFFFFF
00702D79        mov         edx,8000
# 依然是log显示ok
00702D7E        mov         eax,702F28;'OK'
00702D83        call        006DBD18
# 1.这里跳转
00702D88>       jmp         00702DA6
00702D8A        inc         esi
00702D8B        call        006DB734
00702D90        test        al,al
00702D92>       je          00702DA6
00702D94        or          ecx,0FFFFFFFF
00702D97        mov         edx,0FF
00702D9C        mov         eax,702F3C;'FAILED'
00702DA1        call        006DBD18
# 1.这里继续
00702DA6        cmp         dword ptr [ebp-0C],0
00702DAA>       jg          00702DB5
00702DAC        cmp         esi,3
00702DAF>       jle         00702CE4
00702DB5        cmp         dword ptr [ebp-0C],0
00702DB9>       jle         00702DEA
00702DBB        lea         ecx,[ebp-2C]
00702DBE        mov         eax,dword ptr [ebp+8]
00702DC1        mov         eax,dword ptr [eax]
00702DC3        mov         edx,dword ptr [ebp-4]
00702DC6        call        006D5954
00702DCB        mov         edx,dword ptr [ebp-2C]
00702DCE        mov         eax,dword ptr [ebp+8]
00702DD1        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
# 这里好像在动态申请内存？想把串口buff内容拿走？
00702DD7        call        @DynArrayAsg
# 这里结束以后 就让0x19F1F0中存储的就是串口buff的地址了
00702DDC        add         word ptr [ebp-18],di
00702DE0        sub         dword ptr [ebp-10],edi
00702DE3        mov         eax,edi
00702DE5        call        006F50FC
00702DEA        cmp         dword ptr [ebp-10],0
00702DEE>       je          00702DFA
00702DF0        cmp         dword ptr [ebp-0C],1
00702DF4>       jge         00702CC4
00702DFA        xor         eax,eax
00702DFC        pop         edx
00702DFD        pop         ecx
00702DFE        pop         ecx
00702DFF        mov         dword ptr fs:[eax],edx
00702E02        push        702E69
00702E07        movzx       eax,byte ptr [ebp-15]
00702E0B        call        006F5204
00702E10        cmp         dword ptr [ebp-10],0
00702E14>       jne         00702E1C
00702E16        cmp         dword ptr [ebp-0C],1
# 2.这里跳转
00702E1A>       jge         00702E59
00702E1C        lea         eax,[ebp-30]
00702E1F        push        eax
00702E20        lea         eax,[ebp-3C]
00702E23        push        eax
00702E24        mov         eax,dword ptr [ebp-8]
00702E27        movzx       edx,byte ptr [eax+0A1];TBootloader.FLastACK:byte
00702E2E        mov         cl,1
00702E30        mov         eax,dword ptr [ebp-8]
00702E33        call        00705B90
00702E38        mov         eax,dword ptr [ebp-3C]
00702E3B        mov         dword ptr [ebp-38],eax
00702E3E        mov         byte ptr [ebp-34],11
00702E42        lea         edx,[ebp-38]
00702E45        xor         ecx,ecx
00702E47        mov         eax,702F58;'Error reading from Flash!\n(%s)'
00702E4C        call        006D5800
00702E51        mov         eax,dword ptr [ebp-30]
00702E54        call        006DF680
# 2.这里继续
00702E59        mov         eax,dword ptr [ebp-8]
00702E5C        call        00704114
00702E61        ret
00702E62>       jmp         @HandleFinally
00702E67>       jmp         00702E07
00702E69        xor         eax,eax
00702E6B        pop         edx
00702E6C        pop         ecx
00702E6D        pop         ecx
00702E6E        mov         dword ptr fs:[eax],edx
00702E71        push        702EB7
00702E76        lea         eax,[ebp-3C]
00702E79        call        @UStrClr
00702E7E        lea         eax,[ebp-30]
00702E81        call        @UStrClr
00702E86        lea         eax,[ebp-2C]
00702E89        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00702E8F        call        @DynArrayClear
00702E94        lea         eax,[ebp-28]
00702E97        mov         edx,3
00702E9C        call        @UStrArrayClr
00702EA1        lea         eax,[ebp-4]
00702EA4        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00702EAA        call        @DynArrayClear
00702EAF        ret
00702EB0>       jmp         @HandleFinally
00702EB5>       jmp         00702E76
00702EB7        pop         edi
00702EB8        pop         esi
00702EB9        pop         ebx
00702EBA        mov         esp,ebp
00702EBC        pop         ebp
00702EBD        ret         4

```



### Send_cmd_DeviceReadFlash

继续返回就回到了 Send_cmd_DeviceReadFlash

```assembly
_Unit108.TBLBInterface.Send_cmd_DeviceReadFlash
...
0070822F        lea         eax,[ebp-10]
00708232        push        eax
00708233        mov         eax,dword ptr [ebp-4]
00708236        mov         eax,dword ptr [eax+40];TBLBInterface.FBootloader:TBootloader
00708239        mov         ecx,ebx
0070823B        mov         edx,esi
# 主要是这里读flash
0070823D        call        TBootloader.ReadFlash
# 这里基本就能看出来，前面动态申请的内存在这里又放出来了
00708242        mov         edx,dword ptr [ebp-10]
00708245        mov         eax,dword ptr [ebp-8]
00708248        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
0070824E        call        @DynArrayAsg
00708253        mov         eax,dword ptr [ebp-4]
00708256        call        00709C6C
0070825B        mov         eax,dword ptr [ebp-8]
0070825E        mov         eax,dword ptr [eax]
00708260        test        eax,eax
00708262>       je          00708269
00708264        sub         eax,4
00708267        mov         eax,dword ptr [eax]
# 不过到这里的时候，串口buff中尾巴上的ack还有crc都被去掉了，所以数据头也变成了100而不是103了
# 这应该就是后面处理的256字节数据了
00708269        movzx       edx,bx
0070826C        cmp         eax,edx
0070826E        sete        byte ptr [ebp-9]
00708272        xor         eax,eax
00708274        pop         edx
00708275        pop         ecx
00708276        pop         ecx
00708277        mov         dword ptr fs:[eax],edx
0070827A        push        70835A
0070827F        call        006DB734
00708284        test        al,al
00708286>       je          0070833A
0070828C        mov         eax,[0084158C];^gvar_0085C668
00708291        cmp         dword ptr [eax],1
00708294>       jle         007082E5
00708296        mov         eax,dword ptr [ebp-4]
00708299        mov         eax,dword ptr [eax+40];TBLBInterface.FBootloader:TBootloader
0070829C        call        TBootloader.AllowLog
007082A1        test        al,al
# 1.这里跳转
007082A3>       je          007082E5
...
# 1.这里继续
007082E5        mov         eax,1
007082EA        call        006DBF64
007082EF        mov         ebx,dword ptr [ebp-8]
007082F2        mov         ebx,dword ptr [ebx]
007082F4        test        ebx,ebx
007082F6>       je          007082FD
007082F8        sub         ebx,4
007082FB        mov         ebx,dword ptr [ebx]
007082FD        push        7083EC;'('
00708302        lea         edx,[ebp-20]
00708305        mov         eax,ebx
00708307        call        IntToStr
0070830C        push        dword ptr [ebp-20]
0070830F        push        7083FC;' Bytes)'
00708314        lea         eax,[ebp-1C]
00708317        mov         edx,3
0070831C        call        @UStrCatN
00708321        mov         eax,dword ptr [ebp-1C]
00708324        or          ecx,0FFFFFFFF
00708327        mov         edx,0FF0000
0070832C        call        006DBD18
00708331        movzx       eax,byte ptr [ebp-9]
00708335        call        006DBE1C
0070833A        ret
0070833B>       jmp         @HandleFinally
00708340>       jmp         0070827F
00708345        lea         edx,[ebp-24]
00708348        mov         eax,708418;'Bootloader version does not support reading of flash memory!'
0070834D        call        006D5894
00708352        mov         eax,dword ptr [ebp-24]
00708355        call        006DF5E4
0070835A        xor         eax,eax
0070835C        pop         edx
0070835D        pop         ecx
0070835E        pop         ecx
0070835F        mov         dword ptr fs:[eax],edx
00708362        push        70838A
00708367        lea         eax,[ebp-24]
0070836A        mov         edx,5
0070836F        call        @UStrArrayClr
00708374        lea         eax,[ebp-10]
00708377        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
0070837D        call        @DynArrayClear
00708382        ret
00708383>       jmp         @HandleFinally
00708388>       jmp         00708367
0070838A        movzx       eax,byte ptr [ebp-9]
0070838E        pop         esi
0070838F        pop         ebx
00708390        mov         esp,ebp
00708392        pop         ebp
00708393        ret         4
```

后面就是一连串的返回，又回到了ReadDeviceSetupSection



### ReadDeviceSetupSection

```assembly
007D8611        call        TBLBInterface.Send_cmd_DeviceReadBLHeliSetupSection
# OD调试，发现当Send_cmd_DeviceReadBLHeliSetupSection执行完成以后，256字节就读取上来了，所以要追他
007D8616        mov         byte ptr [ebp-9],al
007D8619>       jmp         007D8632
...
007D8632        cmp         byte ptr [ebp-9],0
007D8636>       je          007D878B
007D863C        mov         eax,dword ptr [ebp-8]
007D863F        call        TBLHeliInterfaceManager.DeviceBootloaderRev
007D8644        push        eax
007D8645        mov         eax,dword ptr [ebp-8]
007D8648        call        TBLHeliInterfaceManager.BLHeliStored
007D864D        pop         edx
007D864E        mov         byte ptr [eax+0D3],dl;TBLHeli.FBootloaderRev:byte
007D8654        mov         eax,dword ptr [ebp-8]
007D8657        call        TBLHeliInterfaceManager.BLHeliStored
007D865C        mov         edx,dword ptr [ebp-8]
007D865F        mov         edx,dword ptr [edx+32C];TBLHeliInterfaceManager.FLastReadSetupMem:TArray<System.Byte>
007D8665        mov         ecx,ebx
# 前面edx已经存储了串口buff的地址，然后这里就带着这个地址进入到了 ReadSetupFromBinString
007D8667        call        TBLHeli.ReadSetupFromBinString
...
```



### ReadSetupFromBinString

```assembly
_Unit102.TBLHeli.ReadSetupFromBinString
006EA350        push        ebp
006EA351        mov         ebp,esp
006EA353        push        ecx
006EA354        mov         ecx,0A
006EA359        push        0
006EA35B        push        0
006EA35D        dec         ecx
006EA35E>       jne         006EA359
006EA360        push        ecx
006EA361        xchg        ecx,dword ptr [ebp-4]
006EA364        push        ebx
006EA365        push        esi
006EA366        push        edi
006EA367        mov         byte ptr [ebp-0D],cl
006EA36A        mov         ebx,edx
006EA36C        mov         dword ptr [ebp-8],eax
006EA36F        xor         eax,eax
006EA371        push        ebp
006EA372        push        6EA99F
006EA377        push        dword ptr fs:[eax]
006EA37A        mov         dword ptr fs:[eax],esp
# 这里的 eax = 289d380 [289d380] = 6e2bbc
006EA37D        mov         eax,dword ptr [ebp-8]
```

看起来是个程序地址，我跳过去看了一下

![image-20210717111029804](https://i.loli.net/2021/07/17/CfnLhwjqMUOHpIJ.png)

这里倒是没什么，但是再往下，可以看到这里的名字基本上全都是对应的参数值！

![image-20210717111042758](https://i.loli.net/2021/07/17/Dh24BXzT9dJ3ntM.png)



```assembly

# TBLHeli中就是存储配置的对象，这里进行了初始化
006EA380        call        TBLHeli.Init
006EA385        mov         byte ptr [ebp-0E],4
006EA389        xor         ecx,ecx
006EA38B        push        ebp
006EA38C        push        6EA952
006EA391        push        dword ptr fs:[ecx]
006EA394        mov         dword ptr fs:[ecx],esp
006EA397        mov         edx,ebx
006EA399        mov         eax,edx
006EA39B        test        eax,eax
006EA39D>       je          006EA3A4
006EA39F        sub         eax,4
006EA3A2        mov         eax,dword ptr [eax]
006EA3A4        mov         dword ptr [ebp-0C],eax
# 这里是在比 串口数据长度，如果是F800 就是往下走
# 这里是100，所以跳转了
006EA3A7        cmp         dword ptr [ebp-0C],0F800
# 0.跳转
006EA3AE>       jle         006EA3DF
...
# 0.继续 这里继续不相等，继续跳转
006EA3DF        cmp         dword ptr [ebp-0C],7C00
# 跳转
006EA3E6>       jle         006EA417
...
# 继续
006EA417        mov         eax,dword ptr [ebp-0C]
006EA41A        push        eax
006EA41B        lea         eax,[ebp-4]
006EA41E        push        eax
006EA41F        xor         ecx,ecx
006EA421        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA427        mov         eax,ebx
006EA429        call        @DynArrayCopyRange
006EA42E        cmp         dword ptr [ebp-0C],90
# 跳转
006EA435>       jge         006EA445
...
# 继续
006EA445        mov         edx,dword ptr ds:[841290];^gvar_00839100
006EA44B        movzx       edx,byte ptr [edx]
006EA44E        mov         eax,dword ptr [ebp-4]
# 这个函数不知道是干啥的，先放着
006EA451        call        006D5CE4
006EA456        test        al,al
# 跳转
006EA458>       je          006EA468
...
# 继续
006EA468        push        ebp
# 关键点
006EA469        call        006EA090
```

这个没名字函数开始跳过了，然后往下走的时候发现TESC_Layout的值就直接有了，都直接存在内存里了，大概就在串口buff地址上面的0xA0个地址左右，但是却没看到解析过程，这个地址每次都不会清，导致你就算再读一次，这个地址东西还是在，所以每次重启以后，重新找这个地址，然后就能看到了。

上面的是解析内容，下面的是串口raw值，总算找到了解析的地方

![image-20210717115950567](https://i.loli.net/2021/07/17/1HctWPrebpIMaJB.png)



```assembly

006EA46E        pop         ecx
006EA46F        mov         byte ptr [ebp-0E],al
006EA472        cmp         byte ptr [ebp-0E],4
# 跳转
006EA476>       jb          006EA482
...
# 继续
006EA482        mov         eax,dword ptr [ebp-8]
006EA485        lea         edx,[eax+30];TBLHeli.FEep_ESC_Layout:TESC_Layout
006EA488        mov         eax,dword ptr [ebp-4]
006EA48B        add         eax,40
006EA48E        mov         ecx,20
# 这里是在移动内存，eax是源地址，移动0x20个字节 32字节
006EA493        call        Move
006EA498        lea         edx,[ebp-14]
006EA49B        mov         eax,dword ptr [ebp-8]
006EA49E        call        006E6554
006EA4A3        mov         edx,dword ptr [ebp-14]
006EA4A6        mov         eax,dword ptr [ebp-8]
006EA4A9        add         eax,0B0;TBLHeli.FESC_Layout_Org_Str:string
006EA4AE        call        @UStrAsg
006EA4B3        cmp         byte ptr [ebp-0E],1
006EA4B7>       jbe         006EA4C3
006EA4B9        call        @TryFinallyExit
006EA4BE>       jmp         006EA95C
006EA4C3        mov         eax,dword ptr [ebp-4]
006EA4C6        movzx       eax,byte ptr [eax]
006EA4C9        mov         edx,dword ptr [ebp-8]
006EA4CC        mov         byte ptr [edx+4],al;TBLHeli.FEep_FW_Main_Revision:byte
006EA4CF        mov         eax,dword ptr [ebp-4]
006EA4D2        movzx       eax,byte ptr [eax+1]
006EA4D6        mov         edx,dword ptr [ebp-8]
006EA4D9        mov         byte ptr [edx+5],al;TBLHeli.FEep_FW_Sub_Revision:byte
006EA4DC        cmp         byte ptr [ebp-0E],1
006EA4E0>       je          006EA4EE
006EA4E2        mov         eax,dword ptr [ebp-8]
006EA4E5        call        006E7280
006EA4EA        test        al,al
006EA4EC>       je          006EA502
006EA4EE        mov         eax,dword ptr [ebp-8]
006EA4F1        mov         byte ptr [eax+0BA],1;TBLHeli.FIsAlternateSettingsKey:Boolean
006EA4F8        call        @TryFinallyExit
006EA4FD>       jmp         006EA95C
006EA502        mov         ebx,dword ptr [ebp-4]
006EA505        movzx       eax,byte ptr [ebx+2]
006EA509        mov         edx,dword ptr [ebp-8]
006EA50C        mov         byte ptr [edx+6],al;TBLHeli.FEep_Layout_Revision:byte
006EA50F        mov         eax,dword ptr [ebp-8]
006EA512        movzx       eax,byte ptr [eax+4];TBLHeli.FEep_FW_Main_Revision:byte
006EA516        cmp         al,28
006EA518>       ja          006EA527
006EA51A        cmp         al,1F
006EA51C>       jb          006EA527
006EA51E        mov         eax,dword ptr [ebp-8]
006EA521        cmp         byte ptr [eax+5],63;TBLHeli.FEep_FW_Sub_Revision:byte
006EA525>       jbe         006EA535
006EA527        mov         byte ptr [ebp-0E],4
006EA52B        call        @TryFinallyExit
006EA530>       jmp         006EA95C
006EA535        mov         eax,dword ptr [ebp-8]
006EA538        call        006E71CC
006EA53D        test        al,al
006EA53F>       jne         006EA54F
006EA541        mov         byte ptr [ebp-0E],4
006EA545        call        @TryFinallyExit
006EA54A>       jmp         006EA95C
006EA54F        mov         eax,dword ptr [ebp-8]
006EA552        call        006E724C
006EA557        test        al,al
006EA559>       je          006EA569
006EA55B        mov         byte ptr [ebp-0E],2
006EA55F        call        @TryFinallyExit
006EA564>       jmp         006EA95C
006EA569        mov         eax,dword ptr [ebp-8]
006EA56C        lea         edx,[eax+70];TBLHeli.FEep_Name:TESC_Name
006EA56F        lea         eax,[ebx+80]
006EA575        mov         ecx,10
006EA57A        call        Move
006EA57F        movzx       eax,byte ptr [ebx+32]
006EA583        mov         edx,dword ptr [ebp-8]
006EA586        mov         byte ptr [edx+28],al;TBLHeli.FEep_Hw_LED_Capable_0:byte
006EA589        movzx       eax,byte ptr [ebx+33]
006EA58D        mov         edx,dword ptr [ebp-8]
006EA590        mov         byte ptr [edx+29],al;TBLHeli.FEep_Hw_LED_Capable_1:byte
006EA593        movzx       eax,byte ptr [ebx+34]
006EA597        mov         edx,dword ptr [ebp-8]
006EA59A        mov         byte ptr [edx+2A],al;TBLHeli.FEep_Hw_LED_Capable_2:byte
006EA59D        movzx       eax,byte ptr [ebx+35]
006EA5A1        mov         edx,dword ptr [ebp-8]
006EA5A4        mov         byte ptr [edx+2B],al;TBLHeli.FEep_Hw_LED_Capable_3:byte
006EA5A7        mov         eax,dword ptr [ebp-8]
006EA5AA        cmp         byte ptr [eax+28],0FF;TBLHeli.FEep_Hw_LED_Capable_0:byte
006EA5AE>       jne         006EA5B7
006EA5B0        mov         eax,dword ptr [ebp-8]
006EA5B3        mov         byte ptr [eax+28],0;TBLHeli.FEep_Hw_LED_Capable_0:byte
006EA5B7        mov         eax,dword ptr [ebp-8]
006EA5BA        cmp         byte ptr [eax+29],0FF;TBLHeli.FEep_Hw_LED_Capable_1:byte
006EA5BE>       jne         006EA5C7
006EA5C0        mov         eax,dword ptr [ebp-8]
006EA5C3        mov         byte ptr [eax+29],0;TBLHeli.FEep_Hw_LED_Capable_1:byte
006EA5C7        mov         eax,dword ptr [ebp-8]
006EA5CA        cmp         byte ptr [eax+2A],0FF;TBLHeli.FEep_Hw_LED_Capable_2:byte
006EA5CE>       jne         006EA5D7
006EA5D0        mov         eax,dword ptr [ebp-8]
006EA5D3        mov         byte ptr [eax+2A],0;TBLHeli.FEep_Hw_LED_Capable_2:byte
006EA5D7        mov         eax,dword ptr [ebp-8]
006EA5DA        cmp         byte ptr [eax+2B],0FF;TBLHeli.FEep_Hw_LED_Capable_3:byte
006EA5DE>       jne         006EA5E7
006EA5E0        mov         eax,dword ptr [ebp-8]
006EA5E3        mov         byte ptr [eax+2B],0;TBLHeli.FEep_Hw_LED_Capable_3:byte
006EA5E7        movzx       eax,byte ptr [ebx+30]
006EA5EB        mov         edx,dword ptr [ebp-8]
006EA5EE        mov         byte ptr [edx+26],al;TBLHeli.FEep_Hw_Voltage_Sense_Capable:byte
006EA5F1        movzx       eax,byte ptr [ebx+31]
006EA5F5        mov         edx,dword ptr [ebp-8]
006EA5F8        mov         byte ptr [edx+27],al;TBLHeli.FEep_Hw_Current_Sense_Capable:byte
006EA5FB        mov         eax,dword ptr [ebp-8]
006EA5FE        cmp         byte ptr [eax+6],29;TBLHeli.FEep_Layout_Revision:byte
006EA602>       jb          006EA633
006EA604        movzx       eax,byte ptr [ebx+3F]
006EA608        mov         edx,dword ptr [ebp-8]
006EA60B        mov         byte ptr [edx+2F],al;TBLHeli.FEep_Nondamped_Capable:byte
006EA60E        movzx       eax,byte ptr [ebx+1C]
006EA612        mov         edx,dword ptr [ebp-8]
006EA615        mov         byte ptr [edx+20],al;TBLHeli.FEep_Note_Config:byte
006EA618        mov         eax,dword ptr [ebp-8]
006EA61B        lea         edx,[eax+80];TBLHeli.FEep_Note_Array:TEep_Note_Array
006EA621        lea         eax,[ebx+90]
006EA627        mov         ecx,30
006EA62C        call        Move
006EA631>       jmp         006EA641
006EA633        mov         eax,[00841290];^gvar_00839100
006EA638        movzx       eax,byte ptr [eax]
006EA63B        mov         edx,dword ptr [ebp-8]
006EA63E        mov         byte ptr [edx+2F],al;TBLHeli.FEep_Nondamped_Capable:byte
006EA641        mov         eax,dword ptr [ebp-8]
006EA644        cmp         byte ptr [eax+6],2C;TBLHeli.FEep_Layout_Revision:byte
006EA648>       jb          006EA66C
006EA64A        cmp         byte ptr [ebx+36],0FF
006EA64E>       jae         006EA66C
006EA650        cmp         byte ptr [ebx+37],0FF
006EA654>       jae         006EA66C
006EA656        movzx       eax,byte ptr [ebx+36]
006EA65A        mov         edx,dword ptr [ebp-8]
# 这里对pwm的频率进行了解释
006EA65D        mov         byte ptr [edx+2C],al;TBLHeli.FEep_Hw_Pwm_Freq_Min:byte
006EA660        movzx       eax,byte ptr [ebx+37]
006EA664        mov         edx,dword ptr [ebp-8]
006EA667        mov         byte ptr [edx+2D],al;TBLHeli.FEep_Hw_Pwm_Freq_Max:byte
006EA66A>       jmp         006EA688
006EA66C        mov         eax,[00841290];^gvar_00839100
006EA671        movzx       eax,byte ptr [eax]
006EA674        mov         edx,dword ptr [ebp-8]
006EA677        mov         byte ptr [edx+2C],al;TBLHeli.FEep_Hw_Pwm_Freq_Min:byte
006EA67A        mov         eax,[00841290];^gvar_00839100
006EA67F        movzx       eax,byte ptr [eax]
006EA682        mov         edx,dword ptr [ebp-8]
006EA685        mov         byte ptr [edx+2D],al;TBLHeli.FEep_Hw_Pwm_Freq_Max:byte
006EA688        mov         eax,dword ptr [ebp-8]
006EA68B        cmp         byte ptr [eax+6],2D;TBLHeli.FEep_Layout_Revision:byte
006EA68F>       jb          006EA69D
006EA691        movzx       eax,byte ptr [ebx+3E]
006EA695        mov         edx,dword ptr [ebp-8]
# 运动模式？
006EA698        mov         byte ptr [edx+2E],al;TBLHeli.FEep_SPORT_Capable:byte
006EA69B>       jmp         006EA6AB
006EA69D        mov         eax,[00841290];^gvar_00839100
006EA6A2        movzx       eax,byte ptr [eax]
006EA6A5        mov         edx,dword ptr [ebp-8]
006EA6A8        mov         byte ptr [edx+2E],al;TBLHeli.FEep_SPORT_Capable:byte
006EA6AB        mov         bl,4
# 1. 循环
006EA6AD        mov         eax,ebx
006EA6AF        call        006DEB4C
006EA6B4        movzx       edi,al
006EA6B7        cmp         edi,0FF
006EA6BD>       je          006EA754
006EA6C3        mov         si,0FFFF
006EA6C7        mov         edx,ebx
006EA6C9        mov         eax,dword ptr [ebp-8]
006EA6CC        call        TBLHeli.IsParameterValid
006EA6D1        test        al,al
006EA6D3>       jne         006EA6E6
006EA6D5        cmp         bl,0F
006EA6D8>       jne         006EA748
006EA6DA        mov         eax,dword ptr [ebp-8]
006EA6DD        call        TBLHeli.IsCurrentProtectionFalselyHardEnabled
006EA6E2        test        al,al
006EA6E4>       je          006EA748
006EA6E6        mov         eax,dword ptr [ebp-4]
006EA6E9        movzx       esi,byte ptr [eax+edi]
006EA6ED        cmp         bl,0E
006EA6F0>       jne         006EA703
006EA6F2        cmp         si,0FF
006EA6F7>       jae         006EA703
006EA6F9        cmp         si,18
006EA6FD>       jb          006EA703
006EA6FF        sub         si,18
006EA703        mov         eax,ebx
006EA705        call        006DEB58
006EA70A        cmp         al,1
006EA70C>       jbe         006EA71C
006EA70E        mov         eax,dword ptr [ebp-4]
006EA711        movzx       eax,byte ptr [eax+edi+1]
006EA716        shl         eax,8
006EA719        add         si,ax
006EA71C        cmp         bl,11
006EA71F>       jne         006EA748
006EA721        mov         eax,dword ptr [ebp-8]
006EA724        call        TBLHeli.IsProgrammableBrakeForceCapable
006EA729        test        al,al
006EA72B>       jne         006EA748
006EA72D        mov         dl,11
006EA72F        mov         eax,dword ptr [ebp-8]
006EA732        call        TBLHeli.GetParameterMin
006EA737        cmp         si,ax
006EA73A>       jbe         006EA748
006EA73C        mov         dl,11
006EA73E        mov         eax,dword ptr [ebp-8]
006EA741        call        TBLHeli.GetParameterMax
006EA746        mov         esi,eax
006EA748        mov         edx,ebx
006EA74A        mov         ecx,esi
006EA74C        mov         eax,dword ptr [ebp-8]
006EA74F        call        TBLHeli.SetParameterValueOrDefault
006EA754        inc         ebx
006EA755        cmp         bl,1F
# 1.这里是个大循环结尾
006EA758>       jne         006EA6AD
006EA75E        mov         byte ptr [ebp-0E],0
006EA762        xor         eax,eax
006EA764        pop         edx
006EA765        pop         ecx
006EA766        pop         ecx
006EA767        mov         dword ptr fs:[eax],edx
006EA76A        push        6EA95C
006EA76F        movzx       eax,byte ptr [ebp-0E]
006EA773        cmp         eax,6
006EA776>       ja          006EA905
006EA77C        jmp         dword ptr [eax*4+6EA783]
006EA783        dd          006EA79F
006EA787        dd          006EA7B1
006EA78B        dd          006EA7C3
006EA78F        dd          006EA8C0
006EA793        dd          006EA859
006EA797        dd          006EA871
006EA79B        dd          006EA886
006EA79F        mov         eax,dword ptr [ebp-8]
006EA7A2        add         eax,0BC;TBLHeli.FErrMsg:string
006EA7A7        call        @UStrClr
006EA7AC>       jmp         006EA905
006EA7B1        mov         eax,dword ptr [ebp-8]
006EA7B4        add         eax,0BC;TBLHeli.FErrMsg:string
006EA7B9        call        @UStrClr
006EA7BE>       jmp         006EA905
006EA7C3        lea         eax,[ebp-18]
006EA7C6        push        eax
006EA7C7        lea         edx,[ebp-24]
006EA7CA        mov         eax,dword ptr [ebp-8]
006EA7CD        call        006E678C
006EA7D2        mov         eax,dword ptr [ebp-24]
006EA7D5        mov         dword ptr [ebp-20],eax
006EA7D8        mov         byte ptr [ebp-1C],11
006EA7DC        lea         eax,[ebp-20]
006EA7DF        push        eax
006EA7E0        lea         edx,[ebp-2C]
006EA7E3        mov         eax,[0084135C];^SResString428:TResStringRec
006EA7E8        call        LoadResString
006EA7ED        mov         ecx,dword ptr [ebp-2C]
006EA7F0        lea         eax,[ebp-28]
006EA7F3        mov         edx,6EA9C0;'\n'
006EA7F8        call        @UStrCat3
006EA7FD        mov         eax,dword ptr [ebp-28]
006EA800        xor         ecx,ecx
006EA802        pop         edx
006EA803        call        006D5800
006EA808        mov         eax,dword ptr [ebp-18]
006EA80B        push        eax
006EA80C        lea         eax,[ebp-30]
006EA80F        push        eax
006EA810        lea         edx,[ebp-34]
006EA813        mov         eax,[00840EA4];^SResString427:TResStringRec
006EA818        call        LoadResString
006EA81D        mov         eax,dword ptr [ebp-34]
006EA820        mov         dword ptr [ebp-44],20
006EA827        mov         byte ptr [ebp-40],0
006EA82B        mov         dword ptr [ebp-3C],46
006EA832        mov         byte ptr [ebp-38],0
006EA836        lea         edx,[ebp-44]
006EA839        mov         ecx,1
006EA83E        call        006D5800
006EA843        mov         edx,dword ptr [ebp-30]
006EA846        mov         eax,dword ptr [ebp-8]
006EA849        add         eax,0BC;TBLHeli.FErrMsg:string
006EA84E        pop         ecx
006EA84F        call        @UStrCat3
006EA854>       jmp         006EA905
006EA859        mov         eax,dword ptr [ebp-8]
006EA85C        lea         edx,[eax+0BC];TBLHeli.FErrMsg:string
006EA862        mov         eax,[00840BFC];^SResString434:TResStringRec
006EA867        call        LoadResString
006EA86C>       jmp         006EA905
006EA871        mov         eax,dword ptr [ebp-8]
006EA874        lea         edx,[eax+0BC];TBLHeli.FErrMsg:string
006EA87A        mov         eax,[00841438];^SResString433:TResStringRec
006EA87F        call        LoadResString
006EA884>       jmp         006EA905
006EA886        lea         eax,[ebp-48]
006EA889        push        eax
006EA88A        lea         edx,[ebp-4C]
006EA88D        mov         eax,[00841824];^SResString432:TResStringRec
006EA892        call        LoadResString
006EA897        mov         eax,dword ptr [ebp-4C]
006EA89A        mov         edx,dword ptr [ebp-0C]
006EA89D        mov         dword ptr [ebp-20],edx
006EA8A0        mov         byte ptr [ebp-1C],0
006EA8A4        lea         edx,[ebp-20]
006EA8A7        xor         ecx,ecx
006EA8A9        call        006D5800
006EA8AE        mov         edx,dword ptr [ebp-48]
006EA8B1        mov         eax,dword ptr [ebp-8]
006EA8B4        add         eax,0BC;TBLHeli.FErrMsg:string
006EA8B9        call        @UStrAsg
# 2. 这里跳转
006EA8BE>       jmp         006EA905
...
# 2. 这里继续
006EA905        cmp         byte ptr [ebp-0E],4
# 3. 跳转
006EA909>       jb          006EA936
# 3. 继续
006EA936        cmp         byte ptr [ebp-0E],4
006EA93A>       jb          006EA944
006EA93C        mov         eax,dword ptr [ebp-8]
006EA93F        call        TBLHeli.Init
006EA944        movzx       eax,byte ptr [ebp-0E]
006EA948        mov         edx,dword ptr [ebp-8]
006EA94B        mov         byte ptr [edx+0C0],al;TBLHeli.FStatus:TSetupStatus
006EA951        ret
006EA952>       jmp         @HandleFinally
006EA957>       jmp         006EA76F
006EA95C        xor         eax,eax
006EA95E        pop         edx
006EA95F        pop         ecx
006EA960        pop         ecx
006EA961        mov         dword ptr fs:[eax],edx
006EA964        push        6EA9A6
006EA969        lea         eax,[ebp-58]
006EA96C        mov         edx,5
006EA971        call        @UStrArrayClr
006EA976        lea         eax,[ebp-34]
006EA979        mov         edx,5
006EA97E        call        @UStrArrayClr
006EA983        lea         eax,[ebp-18]
006EA986        mov         edx,2
006EA98B        call        @UStrArrayClr
006EA990        lea         eax,[ebp-4]
006EA993        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA999        call        @DynArrayClear
006EA99E        ret
006EA99F>       jmp         @HandleFinally
006EA9A4>       jmp         006EA969
006EA9A6        movzx       eax,byte ptr [ebp-0E]
006EA9AA        pop         edi
006EA9AB        pop         esi
006EA9AC        pop         ebx
006EA9AD        mov         esp,ebp
006EA9AF        pop         ebp
006EA9B0        ret

```



## 串口数据格式

![image-20210716180115583](https://i.loli.net/2021/07/16/Y3JrM1ikpVmAoNE.png)

从0x50F6BE4开始，前四个字节描述数据长度，所以这里就是0x0000 0103，也就是259字节数据



这里有一个奇怪的值是从404B48 那个奇怪的地址读出来的

![image-20210716182847388](https://i.loli.net/2021/07/16/V7FMc45UHIr1dKx.png)



## 总体调用流程

```
actReadSetupExecute 按键act
 DoBtnReadSetup 按键具体操作
  ReadSetupAll 读取配置信息
   ReadDeviceSetupSection 这里是操作去读
    Send_cmd_DeviceReadBLHeliSetupSection 发送读取命令，执行后就拿到了256字节
    ReadSetupFromBinString 这里就是关键，解析读上来的字符串，然后赋值给了BLHeli的各个参数
   CopyTo 这里就开始涉及显示的东西，其实就是给参数赋值
   SetupToControls 这里是把内容处理，显示到ui上
```





## Summary



未完待续....



## Quote

>https://www.52pojie.cn/thread-615448-1-1.html
>
>http://www.youngroe.com/2019/07/01/Windows/delphi_reverse_summary/
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



## CheckStrACK

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
00704628        movzx       eax,byte ptr [edx+eax]
0070462C        mov         byte ptr [ebx+0A1],al;TBootloader.FLastACK:byte
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
0070465D        cmp         al,byte ptr [ebx+0A0];TBootloader.FbrOK:byte
00704663>       jne         0070466B
00704665        mov         byte ptr [ebp-11],1
00704669>       jmp         00704681
0070466B        cmp         byte ptr [ebx+0A1],0C1;TBootloader.FLastACK:byte
00704672>       jne         00704681
00704674        cmp         byte ptr [ebx+0B4],0FD;TBootloader.FLastCMD:byte
0070467B>       jne         00704681
0070467D        mov         byte ptr [ebp-11],1
00704681        mov         edx,dword ptr [esi]
00704683        mov         eax,edx
00704685        test        eax,eax
00704687>       je          0070468E
00704689        sub         eax,4
0070468C        mov         eax,dword ptr [eax]
0070468E        cmp         eax,3
00704691>       jle         00704889
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
00704756        call        TBootloader.StringCrc
0070475B        mov         word ptr [ebx+0BE],ax;TBootloader.LastInCRC:word
00704762        movzx       eax,word ptr [ebx+0BE];TBootloader.LastInCRC:word
00704769        cmp         ax,word ptr [ebp-16]
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



## Summary



未完待续....



## Quote

>https://www.52pojie.cn/thread-615448-1-1.html
>
>http://www.youngroe.com/2019/07/01/Windows/delphi_reverse_summary/
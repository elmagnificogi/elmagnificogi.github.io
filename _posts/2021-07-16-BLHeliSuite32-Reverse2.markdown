---
layout:     post
title:      "BLHeliSuite32逆向（二）"
subtitle:   "Crack，Reverse"
date:       2021-07-16
update:     2021-10-18
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

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/3L4fjtRnQhHbCc1.png)



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

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/CfnLhwjqMUOHpIJ.png)

这里倒是没什么，但是再往下，可以看到这里的名字基本上全都是对应的参数值！

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/Dh24BXzT9dJ3ntM.png)



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

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/1HctWPrebpIMaJB.png)



#### 解析函数sub_006EA090

看一下这里是怎么解析的

```assembly
_Unit102.sub_006EA090
006EA090        push        ebp
006EA091        mov         ebp,esp
006EA093        push        0
006EA095        push        ebx
006EA096        xor         eax,eax
006EA098        push        ebp
006EA099        push        6EA340
006EA09E        push        dword ptr fs:[eax]
006EA0A1        mov         dword ptr fs:[eax],esp
006EA0A4        mov         eax,dword ptr [ebp+8]
006EA0A7        mov         eax,dword ptr [eax-8]
006EA0AA        mov         byte ptr [eax+0B8],0
006EA0B1        mov         eax,dword ptr [ebp+8]
006EA0B4        mov         eax,dword ptr [eax-4]
006EA0B7        lea         edx,[eax+60]
006EA0BA        mov         eax,dword ptr [ebp+8]
006EA0BD        mov         eax,dword ptr [eax-8]
# 这里先跳过，不知道是干嘛
006EA0C0        call        TBLHeli.ReadMCU
```



##### ReadMCU

```assembly
_Unit102.TBLHeli.ReadMCU
006E9BF4        push        ebp
006E9BF5        mov         ebp,esp
006E9BF7        add         esp,0FFFFFFB4
006E9BFA        push        esi
006E9BFB        push        edi
006E9BFC        xor         ecx,ecx
# 这里就是清空内容
006E9BFE        mov         dword ptr [ebp-4],ecx
006E9C01        mov         dword ptr [ebp-8],ecx
006E9C04        mov         dword ptr [ebp-0C],ecx
006E9C07        mov         dword ptr [ebp-10],ecx
006E9C0A        mov         dword ptr [ebp-14],ecx
006E9C0D        mov         dword ptr [ebp-18],ecx
006E9C10        mov         dword ptr [ebp-1C],ecx
006E9C13        mov         dword ptr [ebp-20],ecx
# 这里esi=buff[96]
006E9C16        mov         esi,edx
006E9C18        lea         edi,[ebp-4C]
006E9C1B        mov         ecx,8
# 这里就是在赋值，把buff内容移动到堆栈里，重复8次，符合上面的清空操作
# 具体为堆栈的19f120-19f13c中
006E9C20        rep movs    dword ptr [edi],dword ptr [esi]
006E9C22        mov         dword ptr [ebp-24],eax
006E9C25        xor         eax,eax
006E9C27        push        ebp
006E9C28        push        6EA07D
006E9C2D        push        dword ptr fs:[eax]
006E9C30        mov         dword ptr fs:[eax],esp
006E9C33        mov         byte ptr [ebp-25],4
006E9C37        mov         eax,dword ptr [ebp-24]
# 287d380 这里理论上是BLHeli的基址
# +50 就变成了ESC_MCU的变量位置
006E9C3A        add         eax,50;TBLHeli.FEep_ESC_MCU:TESC_MCU
006E9C3D        mov         ecx,0FF
006E9C42        mov         edx,20
# 这里就是用FF填充0x20个字节，说白了就是在给ESC_MUC的string初始化
006E9C47        call        @FillChar
006E9C4C        mov         eax,dword ptr [ebp-24]
006E9C4F        lea         edx,[eax+50];TBLHeli.FEep_ESC_MCU:TESC_MCU
006E9C52        lea         eax,[ebp-4C]
006E9C55        mov         ecx,20
# 这里就是把堆栈里刚才拿到的8个字节 又给放回到了ESC_MUC的位置上
006E9C5A        call        Move
```

这部分数据是直接平移过来的

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/ph4F5uVWXUgIKbm.png)



```assembly

006E9C5F        push        20
006E9C61        lea         eax,[ebp-4]
006E9C64        mov         ecx,1
006E9C69        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006E9C6F        call        @DynArraySetLength
006E9C74        add         esp,4
006E9C77        lea         eax,[ebp-4C]
006E9C7A        mov         ecx,20
006E9C7F        mov         edx,dword ptr [ebp-4]
# 这里大概就是又申请了一个空间，然后把刚才的32个字节又传进去了
006E9C82        call        Move
006E9C87        mov         eax,dword ptr [ebp-24]
006E9C8A        xor         edx,edx
# 这里进行初始化 edx=0
006E9C8C        mov         dword ptr [eax+0B4],edx;TBLHeli.FMCU_DeviceID:Integer
006E9C92        mov         eax,dword ptr [ebp-24]
006E9C95        mov         byte ptr [eax+0D2],0;TBLHeli.FMCUManufacturer:TMCUManufacturer
006E9C9C        mov         eax,dword ptr [ebp-24]
006E9C9F        mov         byte ptr [eax+0D1],0;TBLHeli.FIs_64k:Boolean
006E9CA6        xor         edx,edx
006E9CA8        push        ebp
006E9CA9        push        6E9D00
006E9CAE        push        dword ptr fs:[edx]
006E9CB1        mov         dword ptr fs:[edx],esp
006E9CB4        xor         eax,eax
006E9CB6        mov         dword ptr [ebp-8],eax
006E9CB9        lea         edx,[ebp-8]
006E9CBC        mov         eax,[00839640];^'#BLHeli_32*'
006E9CC1        call        0043691C
006E9CC6        mov         eax,[00839640];^'#BLHeli_32*'
006E9CCB        test        eax,eax
006E9CCD>       je          006E9CD4
006E9CCF        sub         eax,4
006E9CD2        mov         eax,dword ptr [eax]
006E9CD4        mov         ecx,eax
006E9CD6        mov         edx,dword ptr [ebp-8]
006E9CD9        mov         eax,dword ptr [ebp-4]
006E9CDC        call        CompareMem
006E9CE1        mov         byte ptr [ebp-26],al
006E9CE4        xor         eax,eax
006E9CE6        pop         edx
006E9CE7        pop         ecx
006E9CE8        pop         ecx
006E9CE9        mov         dword ptr fs:[eax],edx
006E9CEC        push        6E9D07
006E9CF1        lea         eax,[ebp-8]
006E9CF4        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
# 这里是又把这个变量清空了
006E9CFA        call        @DynArrayClear
006E9CFF        ret
006E9D00>       jmp         @HandleFinally
006E9D05>       jmp         006E9CF1
# 这里判定相同了，所以跳转
006E9D07        cmp         byte ptr [ebp-26],0
# 跳转
006E9D0B>       je          006EA061
006E9D11        mov         byte ptr [ebp-25],3
006E9D15        mov         eax,[00839640];^'#BLHeli_32*'
006E9D1A        test        eax,eax
006E9D1C>       je          006E9D23
006E9D1E        sub         eax,4
006E9D21        mov         eax,dword ptr [eax]
006E9D23        lea         edx,[ebp-4]
006E9D26        mov         ecx,eax
006E9D28        xor         eax,eax
006E9D2A        xchg        eax,edx
006E9D2B        call        006D5A78
006E9D30        xor         edx,edx
006E9D32        push        ebp
006E9D33        push        6E9D8A
006E9D38        push        dword ptr fs:[edx]
006E9D3B        mov         dword ptr fs:[edx],esp
006E9D3E        xor         eax,eax
006E9D40        mov         dword ptr [ebp-0C],eax
006E9D43        lea         edx,[ebp-0C]
006E9D46        mov         eax,[00839644];^'STM32F051x6#'
006E9D4B        call        0043691C
006E9D50        mov         eax,[00839644];^'STM32F051x6#'
006E9D55        test        eax,eax
006E9D57>       je          006E9D5E
006E9D59        sub         eax,4
006E9D5C        mov         eax,dword ptr [eax]
006E9D5E        mov         ecx,eax
006E9D60        mov         edx,dword ptr [ebp-0C]
006E9D63        mov         eax,dword ptr [ebp-4]
006E9D66        call        CompareMem
006E9D6B        mov         byte ptr [ebp-27],al
006E9D6E        xor         eax,eax
006E9D70        pop         edx
006E9D71        pop         ecx
006E9D72        pop         ecx
006E9D73        mov         dword ptr fs:[eax],edx
006E9D76        push        6E9D91
006E9D7B        lea         eax,[ebp-0C]
006E9D7E        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006E9D84        call        @DynArrayClear
006E9D89        ret
006E9D8A>       jmp         @HandleFinally
006E9D8F>       jmp         006E9D7B
006E9D91        cmp         byte ptr [ebp-27],0
006E9D95>       je          006E9DB3
006E9D97        mov         eax,dword ptr [ebp-24]
006E9D9A        mov         dword ptr [eax+0B4],3306;TBLHeli.FMCU_DeviceID:Integer
006E9DA4        mov         eax,dword ptr [ebp-24]
006E9DA7        mov         byte ptr [eax+0D2],1;TBLHeli.FMCUManufacturer:TMCUManufacturer
006E9DAE>       jmp         006EA051
006E9DB3        xor         edx,edx
006E9DB5        push        ebp
006E9DB6        push        6E9E0D
006E9DBB        push        dword ptr fs:[edx]
006E9DBE        mov         dword ptr fs:[edx],esp
006E9DC1        xor         eax,eax
006E9DC3        mov         dword ptr [ebp-10],eax
006E9DC6        lea         edx,[ebp-10]
006E9DC9        mov         eax,[00839648];^'STM32F031x6#'
006E9DCE        call        0043691C
006E9DD3        mov         eax,[00839648];^'STM32F031x6#'
006E9DD8        test        eax,eax
006E9DDA>       je          006E9DE1
006E9DDC        sub         eax,4
006E9DDF        mov         eax,dword ptr [eax]
006E9DE1        mov         ecx,eax
006E9DE3        mov         edx,dword ptr [ebp-10]
006E9DE6        mov         eax,dword ptr [ebp-4]
006E9DE9        call        CompareMem
006E9DEE        mov         byte ptr [ebp-28],al
006E9DF1        xor         eax,eax
006E9DF3        pop         edx
006E9DF4        pop         ecx
006E9DF5        pop         ecx
006E9DF6        mov         dword ptr fs:[eax],edx
006E9DF9        push        6E9E14
006E9DFE        lea         eax,[ebp-10]
006E9E01        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006E9E07        call        @DynArrayClear
006E9E0C        ret
006E9E0D>       jmp         @HandleFinally
006E9E12>       jmp         006E9DFE
006E9E14        cmp         byte ptr [ebp-28],0
006E9E18>       je          006E9E36
006E9E1A        mov         eax,dword ptr [ebp-24]
006E9E1D        mov         dword ptr [eax+0B4],1F06;TBLHeli.FMCU_DeviceID:Integer
006E9E27        mov         eax,dword ptr [ebp-24]
006E9E2A        mov         byte ptr [eax+0D2],1;TBLHeli.FMCUManufacturer:TMCUManufacturer
006E9E31>       jmp         006EA051
006E9E36        xor         edx,edx
006E9E38        push        ebp
006E9E39        push        6E9E90
006E9E3E        push        dword ptr fs:[edx]
006E9E41        mov         dword ptr fs:[edx],esp
006E9E44        xor         eax,eax
006E9E46        mov         dword ptr [ebp-14],eax
006E9E49        lea         edx,[ebp-14]
006E9E4C        mov         eax,[00839650];^'GD32F150x6#'
006E9E51        call        0043691C
006E9E56        mov         eax,[00839650];^'GD32F150x6#'
006E9E5B        test        eax,eax
006E9E5D>       je          006E9E64
006E9E5F        sub         eax,4
006E9E62        mov         eax,dword ptr [eax]
006E9E64        mov         ecx,eax
006E9E66        mov         edx,dword ptr [ebp-14]
006E9E69        mov         eax,dword ptr [ebp-4]
006E9E6C        call        CompareMem
006E9E71        mov         byte ptr [ebp-29],al
006E9E74        xor         eax,eax
006E9E76        pop         edx
006E9E77        pop         ecx
006E9E78        pop         ecx
006E9E79        mov         dword ptr fs:[eax],edx
006E9E7C        push        6E9E97
006E9E81        lea         eax,[ebp-14]
006E9E84        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006E9E8A        call        @DynArrayClear
006E9E8F        ret
006E9E90>       jmp         @HandleFinally
006E9E95>       jmp         006E9E81
006E9E97        cmp         byte ptr [ebp-29],0
006E9E9B>       je          006E9EB9
006E9E9D        mov         eax,dword ptr [ebp-24]
006E9EA0        mov         dword ptr [eax+0B4],3406;TBLHeli.FMCU_DeviceID:Integer
006E9EAA        mov         eax,dword ptr [ebp-24]
006E9EAD        mov         byte ptr [eax+0D2],2;TBLHeli.FMCUManufacturer:TMCUManufacturer
006E9EB4>       jmp         006EA051
006E9EB9        xor         edx,edx
006E9EBB        push        ebp
006E9EBC        push        6E9F13
006E9EC1        push        dword ptr fs:[edx]
006E9EC4        mov         dword ptr fs:[edx],esp
006E9EC7        xor         eax,eax
006E9EC9        mov         dword ptr [ebp-18],eax
006E9ECC        lea         edx,[ebp-18]
006E9ECF        mov         eax,[00839654];^'GD32F350x6#'
006E9ED4        call        0043691C
006E9ED9        mov         eax,[00839654];^'GD32F350x6#'
006E9EDE        test        eax,eax
006E9EE0>       je          006E9EE7
006E9EE2        sub         eax,4
006E9EE5        mov         eax,dword ptr [eax]
006E9EE7        mov         ecx,eax
006E9EE9        mov         edx,dword ptr [ebp-18]
006E9EEC        mov         eax,dword ptr [ebp-4]
006E9EEF        call        CompareMem
006E9EF4        mov         byte ptr [ebp-2A],al
006E9EF7        xor         eax,eax
006E9EF9        pop         edx
006E9EFA        pop         ecx
006E9EFB        pop         ecx
006E9EFC        mov         dword ptr fs:[eax],edx
006E9EFF        push        6E9F1A
006E9F04        lea         eax,[ebp-18]
006E9F07        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006E9F0D        call        @DynArrayClear
006E9F12        ret
006E9F13>       jmp         @HandleFinally
006E9F18>       jmp         006E9F04
006E9F1A        cmp         byte ptr [ebp-2A],0
006E9F1E>       je          006E9F3C
006E9F20        mov         eax,dword ptr [ebp-24]
006E9F23        mov         dword ptr [eax+0B4],3506;TBLHeli.FMCU_DeviceID:Integer
006E9F2D        mov         eax,dword ptr [ebp-24]
006E9F30        mov         byte ptr [eax+0D2],2;TBLHeli.FMCUManufacturer:TMCUManufacturer
006E9F37>       jmp         006EA051
006E9F3C        xor         edx,edx
006E9F3E        push        ebp
006E9F3F        push        6E9F96
006E9F44        push        dword ptr fs:[edx]
006E9F47        mov         dword ptr fs:[edx],esp
006E9F4A        xor         eax,eax
006E9F4C        mov         dword ptr [ebp-1C],eax
006E9F4F        lea         edx,[ebp-1C]
006E9F52        mov         eax,[0083964C];^'STM32L431x6#'
006E9F57        call        0043691C
006E9F5C        mov         eax,[0083964C];^'STM32L431x6#'
006E9F61        test        eax,eax
006E9F63>       je          006E9F6A
006E9F65        sub         eax,4
006E9F68        mov         eax,dword ptr [eax]
006E9F6A        mov         ecx,eax
006E9F6C        mov         edx,dword ptr [ebp-1C]
006E9F6F        mov         eax,dword ptr [ebp-4]
006E9F72        call        CompareMem
006E9F77        mov         byte ptr [ebp-2B],al
006E9F7A        xor         eax,eax
006E9F7C        pop         edx
006E9F7D        pop         ecx
006E9F7E        pop         ecx
006E9F7F        mov         dword ptr fs:[eax],edx
006E9F82        push        6E9F9D
006E9F87        lea         eax,[ebp-1C]
006E9F8A        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006E9F90        call        @DynArrayClear
006E9F95        ret
006E9F96>       jmp         @HandleFinally
006E9F9B>       jmp         006E9F87
006E9F9D        cmp         byte ptr [ebp-2B],0
006E9FA1>       je          006E9FC9
006E9FA3        mov         eax,dword ptr [ebp-24]
006E9FA6        mov         dword ptr [eax+0B4],2B06;TBLHeli.FMCU_DeviceID:Integer
006E9FB0        mov         eax,dword ptr [ebp-24]
006E9FB3        mov         byte ptr [eax+0D2],1;TBLHeli.FMCUManufacturer:TMCUManufacturer
006E9FBA        mov         eax,dword ptr [ebp-24]
006E9FBD        mov         byte ptr [eax+0D1],1;TBLHeli.FIs_64k:Boolean
006E9FC4>       jmp         006EA051
006E9FC9        xor         edx,edx
006E9FCB        push        ebp
006E9FCC        push        6EA023
006E9FD1        push        dword ptr fs:[edx]
006E9FD4        mov         dword ptr fs:[edx],esp
006E9FD7        xor         eax,eax
006E9FD9        mov         dword ptr [ebp-20],eax
006E9FDC        lea         edx,[ebp-20]
006E9FDF        mov         eax,[00839658];^'STM32G071x6#'
006E9FE4        call        0043691C
006E9FE9        mov         eax,[00839658];^'STM32G071x6#'
006E9FEE        test        eax,eax
006E9FF0>       je          006E9FF7
006E9FF2        sub         eax,4
006E9FF5        mov         eax,dword ptr [eax]
006E9FF7        mov         ecx,eax
006E9FF9        mov         edx,dword ptr [ebp-20]
006E9FFC        mov         eax,dword ptr [ebp-4]
006E9FFF        call        CompareMem
006EA004        mov         byte ptr [ebp-2C],al
006EA007        xor         eax,eax
006EA009        pop         edx
006EA00A        pop         ecx
006EA00B        pop         ecx
006EA00C        mov         dword ptr fs:[eax],edx
006EA00F        push        6EA02A
006EA014        lea         eax,[ebp-20]
006EA017        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA01D        call        @DynArrayClear
006EA022        ret
006EA023>       jmp         @HandleFinally
006EA028>       jmp         006EA014
006EA02A        cmp         byte ptr [ebp-2C],0
006EA02E>       je          006EA051
006EA030        mov         eax,dword ptr [ebp-24]
006EA033        mov         dword ptr [eax+0B4],4706;TBLHeli.FMCU_DeviceID:Integer
006EA03D        mov         eax,dword ptr [ebp-24]
006EA040        mov         byte ptr [eax+0D2],1;TBLHeli.FMCUManufacturer:TMCUManufacturer
006EA047        mov         eax,dword ptr [ebp-24]
006EA04A        mov         byte ptr [eax+0D1],1;TBLHeli.FIs_64k:Boolean
006EA051        mov         eax,dword ptr [ebp-24]
006EA054        cmp         dword ptr [eax+0B4],0;TBLHeli.FMCU_DeviceID:Integer
006EA05B>       jle         006EA061
006EA05D        mov         byte ptr [ebp-25],0
# 继续
006EA061        xor         eax,eax
006EA063        pop         edx
006EA064        pop         ecx
006EA065        pop         ecx
006EA066        mov         dword ptr fs:[eax],edx
006EA069        push        6EA084
006EA06E        lea         eax,[ebp-4]
006EA071        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA077        call        @DynArrayClear
006EA07C        ret
006EA07D>       jmp         @HandleFinally
006EA082>       jmp         006EA06E
006EA084        movzx       eax,byte ptr [ebp-25]
006EA088        pop         edi
006EA089        pop         esi
006EA08A        mov         esp,ebp
006EA08C        pop         ebp
006EA08D        ret

```

这个ReadMCU，就这么没头没尾的结束了，也就赋值了一下，初始化了一下变量，然后没有任何判定就出去。



#### 继续 sub_006EA090

```assembly

006EA0C5        mov         ebx,eax
006EA0C7        cmp         bl,4
006EA0CA>       jne         006EA324
006EA0D0        mov         eax,dword ptr [ebp+8]
006EA0D3        cmp         dword ptr [eax-0C],0C0
006EA0DA>       jl          006EA324
006EA0E0        mov         eax,dword ptr [ebp+8]
006EA0E3        mov         eax,dword ptr [eax-0C]
006EA0E6        push        eax
006EA0E7        lea         eax,[ebp-4]
006EA0EA        push        eax
006EA0EB        mov         eax,dword ptr [ebp+8]
006EA0EE        mov         eax,dword ptr [eax-4]
006EA0F1        xor         ecx,ecx
006EA0F3        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA0F9        call        @DynArrayCopyRange
006EA0FE        push        0
# 这个是传入的变量 串口buff地址
006EA100        mov         eax,dword ptr [ebp+8]
006EA103        add         eax,0FFFFFFFC
006EA106        xor         ecx,ecx
# edx=0x407C00 应该是某个变量地址或者返回的变量地址 
006EA108        mov         dx,7C00
# 这里面是整个内存就解析完成了
# 这里eax传入的buff地址，edx应该是新申请的地址
006EA10C        call        006E1B48
```



##### 006E1B48

```assembly
_Unit102.sub_006E1B48
006E1B48        push        ebp
006E1B49        mov         ebp,esp
006E1B4B        add         esp,0FFFFFFCC
006E1B4E        push        ebx
006E1B4F        push        esi
006E1B50        push        edi
006E1B51        mov         ebx,ecx
006E1B53        mov         word ptr [ebp-6],dx
006E1B57        mov         dword ptr [ebp-4],eax
006E1B5A        movzx       edx,byte ptr [ebp+8]
006E1B5E        movzx       eax,word ptr [ebp-6]
006E1B62        call        006E1CF4
006E1B67        mov         byte ptr [ebp-19],al
006E1B6A        movzx       eax,byte ptr [ebp-19]
# od这里提示是switch case，al这里就是1，所以继续
006E1B6E        sub         al,1
006E1B70>       jb          006E1B7D
# 1.跳转
006E1B72>       je          006E1B89
...
# 1.继续 case 1
006E1B89        test        bl,bl
# 2.跳转
006E1B8B>       je          006E1BA1
...
# 2.继续
006E1BA1        lea         edx,[ebp-34]
006E1BA4        mov         eax,839620
006E1BA9        mov         ecx,10
# 这里是把一个内容给移动过来了，不知道有什么用
006E1BAE        call        Move
# 3.jump
006E1BB3>       jmp         006E1BC7
...
# 3.here
006E1BC7        xor         eax,eax
006E1BC9        mov         dword ptr [ebp-14],eax
# 4.jump
006E1BCC>       jmp         006E1C80
# 5.here 双循环，这里是最外侧
006E1BD1        mov         ebx,dword ptr ds:[839634];0x9E3779B9* gvar_00839634
# 这里很奇怪 ebx = 0x9E3779B9*0x20 = 0xC6EF3720 这个很重要后面要考
006E1BD7        imul        ebx,dword ptr ds:[839630];0x20 gvar_00839630
# 这里eax又等于buff地址了
006E1BDE        mov         eax,dword ptr [ebp-4]
006E1BE1        mov         eax,dword ptr [eax]
# edx=0 当个计数器？
006E1BE3        mov         edx,dword ptr [ebp-14]
# 这里其实就是eax地址往前走，应该是在遍历了
006E1BE6        add         eax,edx
006E1BE8        lea         edx,[ebp-10]
006E1BEB        mov         ecx,8
# 这里是把eax中的8字节 赋值到edx的堆栈中，edx的堆栈是19f158，固定的
006E1BF0        call        Move
006E1BF5        mov         eax,[00839630];0x20 gvar_00839630
# 这句很迷啊，这个外部变量一定是20，然后这个与操作，必然成立啊
006E1BFA        test        eax,eax
006E1BFC>       jle         006E1C5F
006E1BFE        mov         dword ptr [ebp-20],eax
# 7.here 这里是内循环

# 这里第一步就是把前面赋值的8字节中，前4字节给了esi 也就是buff的前4个字节
006E1C01        mov         esi,dword ptr [ebp-10]
006E1C04        mov         eax,esi
# 这里eax就是前4字节，然后左移4位
006E1C06        shl         eax,4
006E1C09        mov         edx,esi
# edx右移5位
006E1C0B        shr         edx,5
# 然后eax和edx取异或
006E1C0E        xor         eax,edx
#再加回原来的值
006E1C10        add         eax,esi
# 这里ebx = C6EF3720 这个ebx就是前面从外部拿出来的值
006E1C12        mov         edx,ebx
006E1C14        shr         edx,0B
006E1C17        and         edx,3
# 这里突然来了ebp ，这个ebp之前没注意是什么
006E1C1A        mov         edx,dword ptr [ebp+edx*4-34]
# 这里又让原始值加上了这个新得到的值
006E1C1E        add         edx,ebx
# ecx=0x7c00
006E1C20        movzx       ecx,word ptr [ebp-6]
# edx 又加上了这个值
006E1C24        add         edx,ecx
# 还有一个异或
006E1C26        xor         eax,edx
# 这里把eax给回写了 整个计算的结果1存在这里
006E1C28        sub         dword ptr [ebp-0C],eax
006E1C2B        sub         ebx,dword ptr ds:[839634];gvar_00839634
006E1C31        mov         edi,dword ptr [ebp-0C]
006E1C34        mov         eax,edi
006E1C36        shl         eax,4
006E1C39        mov         edx,edi
006E1C3B        shr         edx,5
006E1C3E        xor         eax,edx
006E1C40        add         eax,edi
006E1C42        mov         edx,3
006E1C47        and         edx,ebx
006E1C49        mov         edx,dword ptr [ebp+edx*4-34]
006E1C4D        add         edx,ebx
006E1C4F        movzx       ecx,word ptr [ebp-6]
006E1C53        add         edx,ecx
006E1C55        xor         eax,edx
# 上面的计算类似，结果2存储在这里
006E1C57        sub         dword ptr [ebp-10],eax
006E1C5A        dec         dword ptr [ebp-20]
# 7.jump
006E1C5D>       jne         006E1C01
# 当一轮循环结束以后
006E1C5F        mov         eax,dword ptr [ebp-4]
006E1C62        mov         eax,dword ptr [eax]
006E1C64        mov         edx,dword ptr [ebp-14]
006E1C67        lea         edx,[eax+edx]
006E1C6A        lea         eax,[ebp-10]
006E1C6D        mov         ecx,8
# 这里是将刚才计算完成的数据给移动到新地方 其实就在原buff数据的上面一点就是
006E1C72        call        Move
# 每次移动8个字节，刚好
# 这里让这两个变量+8了
006E1C77        add         dword ptr [ebp-14],8
006E1C7B        add         word ptr [ebp-6],8
# 4.here
# 重新读出来buff的地址
006E1C80        mov         eax,dword ptr [ebp-4]
006E1C83        mov         eax,dword ptr [eax]
006E1C85        mov         dword ptr [ebp-24],eax
# 这里是判定是否串口地址为0，也就是指针为空的情况
[ebp-24] 是buff的长度 0x100
006E1C88        cmp         dword ptr [ebp-24],0
006E1C8C>       je          006E1C99
006E1C8E        mov         eax,dword ptr [ebp-24]
006E1C91        sub         eax,4
006E1C94        mov         eax,dword ptr [eax]
006E1C96        mov         dword ptr [ebp-24],eax
006E1C99        mov         eax,dword ptr [ebp-24]
# 不知道为什么这里长度先-1，再-7，其实也就是减了8，但是这里没看到处理数据啊，怎么就减了呢
006E1C9C        dec         eax
006E1C9D        sub         eax,7
# 然后判定是否把buff遍历完了，没有就跳转 这里每次都是0x100-8和[ebp-14]比较，好奇怪，虽然[ebp-14]每次循环结束以后都会自动+8
006E1CA0        cmp         eax,dword ptr [ebp-14]
# 5.jump
006E1CA3>       jge         006E1BD1
006E1CA9        lea         eax,[ebp-34]
006E1CAC        xor         ecx,ecx
006E1CAE        mov         edx,10
006E1CB3        call        @FillChar
006E1CB8        movzx       eax,byte ptr [ebp-19]
006E1CBC        call        006E1D40
006E1CC1        test        al,al
006E1CC3>       je          006E1CCD
006E1CC5        mov         eax,dword ptr [ebp-4]
# 这个函数也很关键，他直接把内存给变得可读了，前面的循环内存还不太能读的样子
006E1CC8        call        006E1960
006E1CCD        pop         edi
006E1CCE        pop         esi
006E1CCF        pop         ebx
006E1CD0        mov         esp,ebp
006E1CD2        pop         ebp
006E1CD3        ret         4

```

这里基本就把所有数据解密完成了，但是解密只是解开了，但是后面还有一个流程把数据又整理了一下，整理之后数据的可读性一下就变强了很多很多，主要就是靠下面的函数实现的。



##### sub_006E1960

那就看一下他是怎么做的，发现核心好像是在这里啊

```assembly
_Unit102.sub_006E1960
006E1960        push        ebx
006E1961        push        esi
006E1962        push        edi
006E1963        mov         edi,eax
006E1965        xor         esi,esi
# 1.跳转
006E1967>       jmp         006E197A
# 2.继续
006E1969        mov         eax,edi
006E196B        mov         ecx,2
006E1970        mov         edx,esi
# 这里应该是每次给定削减2个字节
006E1972        call        006D5A78
# 这里是字节指针+=6，他是基于给进去的指针+6，相当于是原字符的每8字节
006E1977        add         esi,6
# 1.继续
006E197A        mov         ebx,dword ptr [edi]
006E197C        test        ebx,ebx
006E197E>       je          006E1985
006E1980        sub         ebx,4
006E1983        mov         ebx,dword ptr [ebx]
# ebx只是一个计数器
006E1985        dec         ebx
006E1986        dec         ebx
# 判断结尾的
006E1987        cmp         esi,ebx
# 2.跳转
006E1989>       jl          006E1969
006E198B        pop         edi
006E198C        pop         esi
006E198D        pop         ebx
006E198E        ret

```



##### sub_006D5A78

这个比较短小

```assembly
_Unit96.sub_006D5A78
006D5A78        push        ebx
006D5A79        mov         ebx,dword ptr ds:[404B48];TArray<System.Byte>
006D5A7F        push        ebx
# 只是单纯的把 404B48这个数组给进去了
006D5A80        call        0040D0EC
006D5A85        pop         ebx
006D5A86        ret

```

主要是下面这个函数，这个函数基本全程在赋值粘贴

```assembly
System.sub_0040D0EC
0040D0EC        push        ebp
0040D0ED        mov         ebp,esp
0040D0EF        add         esp,0FFFFFFE4
0040D0F2        push        ebx
0040D0F3        push        esi
0040D0F4        push        edi
0040D0F5        mov         dword ptr [ebp-8],ecx
0040D0F8        mov         dword ptr [ebp-4],edx
0040D0FB        mov         ebx,eax
0040D0FD        cmp         dword ptr [ebx],0
# 判0，继续
0040D100>       je          0040D1D2
0040D106        mov         eax,dword ptr [ebx]
0040D108        sub         eax,8
# 拿到数组长度
0040D10B        mov         eax,dword ptr [eax+4]
0040D10E        cmp         dword ptr [ebp-4],0
0040D112>       jl          0040D1D2
0040D118        cmp         eax,dword ptr [ebp-4]
0040D11B>       jle         0040D1D2
0040D121        cmp         dword ptr [ebp-8],0
0040D125>       jle         0040D1D2
0040D12B        mov         edx,eax
0040D12D        sub         edx,dword ptr [ebp-4]
0040D130        sub         edx,dword ptr [ebp-8]
0040D133        mov         dword ptr [ebp-0C],edx
0040D136        cmp         dword ptr [ebp-0C],0
# 1.跳转
0040D13A>       jge         0040D141
0040D13C        xor         edx,edx
0040D13E        mov         dword ptr [ebp-0C],edx
# 1.继续
0040D141        mov         edx,dword ptr [ebp+8]
0040D144        movzx       edi,byte ptr [edx+1]
0040D148        add         edi,edx
0040D14A        mov         edx,edi
0040D14C        mov         esi,dword ptr [edx+2]
0040D14F        cmp         dword ptr [edx+6],
# 2.跳转
0040D153>       je          0040D15C
0040D155        mov         edx,dword ptr [edx+6]
0040D158        mov         edi,dword ptr [edx]
0040D15A>       jmp         0040D15E
# 2.继续
0040D15C        xor         edi,edi
0040D15E        mov         edx,dword ptr [ebp-4]
0040D161        imul        edx,esi
0040D164        mov         ecx,dword ptr [ebx]
0040D166        lea         edx,[ecx+edx]
0040D169        mov         dword ptr [ebp-18],edx
0040D16C        sub         eax,dword ptr [ebp-0C]
0040D16F        imul        esi
0040D171        mov         edx,dword ptr [ebx]
0040D173        lea         eax,[edx+eax]
0040D176        mov         dword ptr [ebp-14],eax
0040D179        test        edi,edi
# 3.跳转
0040D17B>       je          0040D1A5
0040D17D        mov         eax,dword ptr [ebp-0C]
0040D180        test        eax,eax
0040D182>       jle         0040D1B6
0040D184        mov         dword ptr [ebp-1C],eax
0040D187        push        1
0040D189        mov         ecx,edi
0040D18B        mov         edx,dword ptr [ebp-14]
0040D18E        mov         eax,dword ptr [ebp-18]
0040D191        call        CopyArray
0040D196        mov         eax,esi
0040D198        add         dword ptr [ebp-18],eax
0040D19B        add         dword ptr [ebp-14],eax
0040D19E        dec         dword ptr [ebp-1C]
0040D1A1>       jne         0040D187
0040D1A3>       jmp         0040D1B6
# 3.继续
0040D1A5        mov         ecx,dword ptr [ebp-0C]
0040D1A8        imul        ecx,esi
0040D1AB        mov         edx,dword ptr [ebp-18]
0040D1AE        mov         eax,dword ptr [ebp-14]
# 其实这里就是把整体256个字节，往左集体移动2个字节，后面不够的字符自动补0xFF
0040D1B1        call        Move
0040D1B6        mov         eax,dword ptr [ebp-4]
0040D1B9        add         eax,dword ptr [ebp-0C]
0040D1BC        mov         dword ptr [ebp-10],eax
0040D1BF        lea         eax,[ebp-10]
0040D1C2        push        eax
0040D1C3        mov         eax,ebx
0040D1C5        mov         ecx,1
0040D1CA        mov         edx,dword ptr [ebp+8]
0040D1CD        call        DynArraySetLength
0040D1D2        pop         edi
0040D1D3        pop         esi
0040D1D4        pop         ebx
0040D1D5        mov         esp,ebp
0040D1D7        pop         ebp
0040D1D8        ret         4

```

最后实现的结果就是，将原本解析出来的256字节，每8字节的前2字节给抛弃了，然后用剩下的字节重新对齐，拼成一个新的256字节，不够的字节用0xFF补齐



![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/yLN16TCoRMYdVBb.png)

内存对比，完全符合，我就懒得看具体代码了。唯一这里担心一点，那就是他把抛弃的前2个字节重新在某个地方又拼接了一下，然后又合成了一个新信息，如果有这样的话就坑爹了。



#### 继续sub_006EA090

```assembly

006EA111        mov         edx,dword ptr ds:[841290];^gvar_00839100
006EA117        movzx       edx,byte ptr [edx]
006EA11A        mov         eax,dword ptr [ebp+8]
006EA11D        mov         eax,dword ptr [eax-4]
006EA120        call        006D5CE4
006EA125        test        al,al
006EA127>       je          006EA130
006EA129        mov         bl,5
006EA12B>       jmp         006EA324
006EA130        mov         eax,dword ptr [ebp+8]
006EA133        mov         eax,dword ptr [eax-4]
006EA136        lea         edx,[eax+60]
006EA139        mov         eax,dword ptr [ebp+8]
006EA13C        mov         eax,dword ptr [eax-8]
# 这里又调用了一次读
006EA13F        call        TBLHeli.ReadMCU
006EA144        mov         ebx,eax
006EA146        cmp         bl,4
006EA149>       je          006EA172
006EA14B        mov         eax,dword ptr [ebp+8]
006EA14E        mov         eax,dword ptr [eax-8]
006EA151        mov         byte ptr [eax+0B8],1
006EA158        mov         eax,dword ptr [ebp+8]
006EA15B        mov         eax,dword ptr [eax-4]
006EA15E        test        eax,eax
006EA160>       je          006EA167
006EA162        sub         eax,4
006EA165        mov         eax,dword ptr [eax]
006EA167        mov         edx,dword ptr [ebp+8]
006EA16A        mov         dword ptr [edx-0C],eax
006EA16D>       jmp         006EA324
006EA172        mov         eax,dword ptr [ebp+8]
006EA175        mov         eax,dword ptr [eax-0C]
006EA178        push        eax
006EA179        mov         eax,dword ptr [ebp+8]
006EA17C        add         eax,0FFFFFFFC
006EA17F        push        eax
006EA180        xor         ecx,ecx
006EA182        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA188        mov         eax,dword ptr [ebp-4]
006EA18B        call        @DynArrayCopyRange
006EA190        push        1
006EA192        mov         eax,dword ptr [ebp+8]
006EA195        add         eax,0FFFFFFFC
006EA198        xor         ecx,ecx
006EA19A        mov         dx,0F800
006EA19E        call        006E1B48
006EA1A3        mov         edx,dword ptr ds:[841290];^gvar_00839100
006EA1A9        movzx       edx,byte ptr [edx]
006EA1AC        mov         eax,dword ptr [ebp+8]
006EA1AF        mov         eax,dword ptr [eax-4]
006EA1B2        call        006D5CE4
006EA1B7        test        al,al
006EA1B9>       je          006EA1C2
006EA1BB        mov         bl,5
# 1.跳转
006EA1BD>       jmp         006EA324
...
# 1.继续 基本就结束了
006EA324        xor         eax,eax
006EA326        pop         edx
006EA327        pop         ecx
006EA328        pop         ecx
006EA329        mov         dword ptr fs:[eax],edx
006EA32C        push        6EA347
006EA331        lea         eax,[ebp-4]
006EA334        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA33A        call        @DynArrayClear
006EA33F        ret
006EA340>       jmp         @HandleFinally
006EA345>       jmp         006EA331
006EA347        mov         eax,ebx
006EA349        pop         ebx
006EA34A        pop         ecx
006EA34B        pop         ebp
006EA34C        ret

```



#### 继续ReadSetupFromBinString

篇幅太长了，所以下一篇，配置解析



## 串口数据格式

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/Y3JrM1ikpVmAoNE.png)

从0x50F6BE4开始，前四个字节描述数据长度，所以这里就是0x0000 0103，也就是259字节数据



这里有一个奇怪的值是从404B48 那个奇怪的地址读出来的

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/V7FMc45UHIr1dKx.png)



## 总体调用流程

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
   SetupToControls 这里是把内容处理，显示到ui上
```



## 变量内存表

```
TBLHeli 基址为0x287D380
偏移
0xB4 MCU_DeviceID:Integer
0xD2 MCU_Manufacturer:
0xD1 Is_64K:Boolean
0x18 MCU:string 应该是名字之类的东西

串口buff 基址为 4FEA1C8或者52FA2D8 这片内存中有非常多的副本
他的上4个字节是长度00 01 00 00 256字节

```



## 数据解密流程

```
解密逻辑
原值为A，以4字节为单位
I = ( (A<<4) xor (A>>5) ）+ A = eax

外部密钥设为 B = 0xC6EF3720=ebx 每次在循环开头更新
C = ( (B>>11) & 0x3 ) 这样拿到的C只是一个偏移量

ebp是什么呢？ 应该是个变量基址，从外部传进来的，主要是存储堆栈地址
D = [ebp+C*4-34]的值
E = D + B
设 F = 0x7C00
G = E + F = edx
H = I  xor G

更新基址内容

外部变量 J=0x9E3779B9
local.3 -=H
B -= J = ebx

K = local.3
eax = L = (K<<4) xor (K>>5) + K
M = 3 & B
N = [ebp+M*4-0x34]
O = N + B
O += F
L = L xor O
local.4 -= L 

这样每次计算的内容都存储在local.3和local.4中了
每轮计算结束以后，将他们转存到了另一个地方，然后继续下8个字节计算。
当256字节全部计算完成以后，每8字节去掉前2字节后将其余字节拼在一起，然后形成可读配置
```



将核心循环转换成python就是这样了

```python
import os
import sys

ds = {}
ds[0x839634] = 0x9E3779B9
ds[0x839630] = 0x20
local0 = 0x19F168
local1 = 0x19F164
local2 = 0x19F160  # [ebp-0x6]
local3 = 0x19F15C
local4 = 0x19F158
local5 = 0x19F154
local6 = 0x19F150
local7 = 0x19F14C
local8 = 0x19F148
local9 = 0x19F144
local10 = 0x19F140
local11 = 0x19F13C  # [ebp+edx*4-0x34]
local12 = 0x19F138
local13 = 0x19F134
local14 = 0x19F130
local15 = 0x19F12C
mem = {}
# uart buff addr
mem[local1] = 0x19F20C
mem[local2] = 0x7C00A1C8
mem[local3] = 0xD3617DCA  # buff 前4字节
mem[local4] = 0x154369FC  # buff 后4字节
mem[local5] = 0  # 这个值每次也+8
mem[local6] = 0x4
mem[local7] = 0x1513F8C
mem[local8] = 0x20  # count 
mem[local9] = 0x100
mem[local10] = 0x318234B4 # must need
# 这个值来源不明
mem[local11] = 0x29A1FA54 # [ebp+edx*4-0x34] # must need
mem[local12] = 0x9E81C901 # must need
mem[local13] = 0x81FBC617 # must need
mem[local14] = 0x4
mem[local15] = 0x513F8C
mem[0x19F168 - 6] = 0x7C00  # [ebp-0x6] 这个值每次+8

mem[0x19F20C] = 0x4FEA1C8

ebp = 0x19F168

ebx = ds[0x839634]
ebx = ebx * ds[0x839630] & 0xFFFFFFFF
eax = mem[local1]
eax = mem[eax]  # 0x4FEA1C8
edx = mem[local5]
eax = eax + edx
edx = mem[local4]
ecx = 0x8
# move 准备工作
# mem[local4] = 0x7EAB1EA0
# mem[local5] = 0x625214C8
eax = ds[0x839630]  # 20

# uart buff
uart_buff = []
f = open(os.path.dirname(__file__) + "/rawdata.txt")
hex_data = f.read()
print(hex_data)
start = None
end = None

state = 0
for i in range(0, len(hex_data), 3):
    if (hex_data[i] + hex_data[i + 1]) == "03" and state == 0:
        state = 1
    elif (hex_data[i] + hex_data[i + 1]) == "00" and state == 1:
        state = 2
    elif (hex_data[i] + hex_data[i + 1]) == "00" and state == 2:
        state = 3
    elif (hex_data[i] + hex_data[i + 1]) == "F0" and state == 3:
        state = 4
        start = i + 3
        break
    else:
        state = 0
if start == None:
    print("no start,exit")
    sys.exit(0)

print(len(hex_data))
output_data = ""

n = 4
for i in range(start, start + 256 * 3, 3):
    print(hex_data[i], hex_data[i + 1])
    uart_buff.append("" + hex_data[i] + hex_data[i + 1])
    # uart_buff.append(int(""+hex_data[i] + hex_data[i + 1],base=16))

f.close()

print(uart_buff)

decrypt_mem = []

# loop1
mem[local8] = eax
for i in range(0, 0x100, 8):
    mem[local4] = int(uart_buff[i + 3] + uart_buff[i + 2] + uart_buff[i + 1] + uart_buff[i + 0], base=16)
    mem[local3] = int(uart_buff[i + 7] + uart_buff[i + 6] + uart_buff[i + 5] + uart_buff[i + 4], base=16)
    ebx = ds[0x839634]
    ebx = ebx * ds[0x839630] & 0xFFFFFFFF
    eax = mem[local1]
    eax = mem[eax]  # 0x4FEA1C8
    edx = mem[local5]
    eax = eax + edx
    edx = mem[local4]
    ecx = 0x8

    for i in range(32):
        # loop2
        esi = mem[local4]
        eax = esi
        eax = eax << 4 & 0xFFFFFFFF
        edx = esi
        edx = edx >> 5 & 0xFFFFFFFF
        eax = eax ^ edx
        eax = (eax + esi) & 0xFFFFFFFF
        edx = ebx
        edx = edx >> 0xB & 0xFFFFFFFF
        edx = edx & 0x3
        edx = mem[ebp + edx * 4 - 0x34]
        edx = (edx + ebx) & 0xFFFFFFFF
        ecx = mem[ebp - 0x6]
        edx = (edx + ecx) & 0xFFFFFFFF
        eax = eax ^ edx
        mem[local3] = (mem[local3] - eax) & 0xFFFFFFFF
        ebx = (ebx - ds[0x839634]) & 0xFFFFFFFF
        edi = mem[local3]
        eax = edi
        eax = eax << 4 & 0xFFFFFFFF
        edx = edi
        edx = edx >> 5 & 0xFFFFFFFF
        eax = eax ^ edx
        eax = (eax + edi) & 0xFFFFFFFF
        edx = 0x3
        edx = edx & ebx
        edx = mem[ebp + edx * 4 - 0x34]
        edx = (edx + ebx) & 0xFFFFFFFF
        ecx = mem[ebp - 0x6]
        edx = (edx + ecx) & 0xFFFFFFFF
        eax = eax ^ edx
        mem[local4] = (mem[local4] - eax) & 0xFFFFFFFF
        mem[local8] -= 1
        # loop2 end
    mem[local5] += 8
    mem[0x19F168 - 6] += 8

    decrypt_mem.append(mem[local4])
    decrypt_mem.append(mem[local3])

    # print(hex(mem[local4]))
    # print(hex(mem[local3]))

print(decrypt_mem)

def byte2hex(data):
    lin = '%02X' % data
    return "0x"+"".join(lin)

pd = ""
for i in range(0, 64, 2):
    #print ((decrypt_mem[i + 0] & 0x00FF0000) >> 16)
    data = byte2hex((decrypt_mem[i + 0] & 0x00FF0000) >> 16)
    pd = data+" "
    #print(data)    
    data = byte2hex((decrypt_mem[i + 0] & 0xFF000000) >> 24)
    pd += data+" "
    #print(data)
    data = byte2hex((decrypt_mem[i + 1] & 0x000000FF) >> 0)
    pd += data+" "
    #print(data)
    data = byte2hex((decrypt_mem[i + 1] & 0x0000FF00) >> 8)
    pd += data+" "
    #print(data)
    data = byte2hex((decrypt_mem[i + 1] & 0x00FF0000) >> 16)
    pd += data+" "
    #print(data)
    data = byte2hex((decrypt_mem[i + 1] & 0xFF000000) >> 24)
    pd += data
    #print(data)
    print(pd)

```

rawdata.txt中是本次读取的数据，类似于这样就行，可以自动解析出来正确的256字节配置

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/mtyoDsR8fNIEKF9.png)

目前每次解出来的数据是和反汇编看到的一模一样。最后的输出我将每8字节的前2字节去掉，然后就变成可读的字符串了，和内存的排布是一样的。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/IKRnv1Ab9li4FBz.png)

当解密完成以后，如果有相关经验的可能可以从算法推出来是用什么加密的。至于为什么每次加密后的密文都不同，那就不知道了，难道是每次随机给进来的前2个字节是随机的？所以加密以后导致密文每次都不同？加密的那一段代码由于我没啥需求，就不继续破解了



这几个值是核心用来解密的密钥，不同版本可能密钥会出现不同，需要调试看

```
mem[local10] = 0x318234B4 # must need
mem[local11] = 0x29A1FA54 # [ebp+edx*4-0x34] # must need
mem[local12] = 0x9E81C901 # must need
mem[local13] = 0x81FBC617 # must need
```



## Summary

总算是看到了解密流程，但是这个解密算法真的好复杂啊，看的我一脸懵逼，还好是找到了，也成功破解了加密的算法。剩下的就是把明文转换成对应的实际配置参数了。



## Quote

>https://www.52pojie.cn/thread-615448-1-1.html
>
>http://www.youngroe.com/2019/07/01/Windows/delphi_reverse_summary/
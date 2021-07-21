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



### ReadSetupFromBinString

继续接着解密后看他是怎么赋值的

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
# 这里就是给出了ESC_Layout的值
# 可以看到解密后配置的0x40开始，0x20个字节都是layout的字符串的值
# 我这里实际上是#HAKRC_35A#
006EA493        call        Move
006EA498        lea         edx,[ebp-14]
006EA49B        mov         eax,dword ptr [ebp-8]
```



![image-20210721174338240](https://i.loli.net/2021/07/21/PIbCyT6QjzlvfYG.png)



继续看下一个值

```assembly

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
```

可以看到这里直接取解密后第一个字节作为了 主版本号，也就是0x20，对应字符串的显示其实他是用32

![image-20210721174741578](https://i.loli.net/2021/07/21/R7i8NArMleY4DtJ.png)

```assembly

006EA4CF        mov         eax,dword ptr [ebp-4]
006EA4D2        movzx       eax,byte ptr [eax+1]
006EA4D6        mov         edx,dword ptr [ebp-8]
006EA4D9        mov         byte ptr [edx+5],al;TBLHeli.FEep_FW_Sub_Revision:byte
```

同理下一个字符，子版本号，0x3C，对应成字符串显示就是60，实际显示的时他是主.子 然后还去掉了尾巴的0，实际显示出来就是32.6



```assembly

006EA4DC        cmp         byte ptr [ebp-0E],1
006EA4E0>       je          006EA4EE
006EA4E2        mov         eax,dword ptr [ebp-8]
006EA4E5        call        006E7280
006EA4EA        test        al,al
# 1.跳转
006EA4EC>       je          006EA502
006EA4EE        mov         eax,dword ptr [ebp-8]
006EA4F1        mov         byte ptr [eax+0BA],1;TBLHeli.FIsAlternateSettingsKey:Boolean
006EA4F8        call        @TryFinallyExit
006EA4FD>       jmp         006EA95C
# 1.继续
006EA502        mov         ebx,dword ptr [ebp-4]
006EA505        movzx       eax,byte ptr [ebx+2]
006EA509        mov         edx,dword ptr [ebp-8]
006EA50C        mov         byte ptr [edx+6],al;TBLHeli.FEep_Layout_Revision:byte
```

这里拿第三字节作为layout的版本号，0x2A

![image-20210721175352324](https://i.loli.net/2021/07/21/SrVnxUg48DHfQEF.png)



```assembly

006EA50F        mov         eax,dword ptr [ebp-8]
006EA512        movzx       eax,byte ptr [eax+4];TBLHeli.FEep_FW_Main_Revision:byte
006EA516        cmp         al,28
006EA518>       ja          006EA527
006EA51A        cmp         al,1F
006EA51C>       jb          006EA527
006EA51E        mov         eax,dword ptr [ebp-8]
006EA521        cmp         byte ptr [eax+5],63;TBLHeli.FEep_FW_Sub_Revision:byte
# 2.跳转
006EA525>       jbe         006EA535
006EA527        mov         byte ptr [ebp-0E],4
006EA52B        call        @TryFinallyExit
006EA530>       jmp         006EA95C
# 2.继续
006EA535        mov         eax,dword ptr [ebp-8]
006EA538        call        006E71CC
006EA53D        test        al,al
# 3.跳转
006EA53F>       jne         006EA54F
006EA541        mov         byte ptr [ebp-0E],4
006EA545        call        @TryFinallyExit
006EA54A>       jmp         006EA95C
# 3.继续
006EA54F        mov         eax,dword ptr [ebp-8]
006EA552        call        006E724C
006EA557        test        al,al
# 4.跳转
006EA559>       je          006EA569
006EA55B        mov         byte ptr [ebp-0E],2
006EA55F        call        @TryFinallyExit
006EA564>       jmp         006EA95C
# 4.继续
006EA569        mov         eax,dword ptr [ebp-8]
006EA56C        lea         edx,[eax+70];TBLHeli.FEep_Name:TESC_Name
006EA56F        lea         eax,[ebx+80]
006EA575        mov         ecx,10
006EA57A        call        Move
```

可以看到偏移0x80个字节后的10个字节是ESC Name，由于我这里是没明名的，所以全空

![image-20210721175912398](https://i.loli.net/2021/07/21/vwURXtEmZ7sLB25.png)



```assembly

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
# 5.跳转
006EA5AE>       jne         006EA5B7
```

偏移0x32，0x33，0x34，0x35字节，他们都是LED使能字节，填入的LED的序号，我有3个，所以是123

![image-20210721180133333](https://i.loli.net/2021/07/21/R5GZoQlx9vLwrfq.png)



```assembly

006EA5B0        mov         eax,dword ptr [ebp-8]
006EA5B3        mov         byte ptr [eax+28],0;TBLHeli.FEep_Hw_LED_Capable_0:byte
# 继续 这里其实在判定是否这个led没有使能
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
```

偏移0x30个字节，这个是Voltage_Sense_Capable 是否使能的标记



```assembly

006EA5F1        movzx       eax,byte ptr [ebx+31]
006EA5F5        mov         edx,dword ptr [ebp-8]
006EA5F8        mov         byte ptr [edx+27],al;TBLHeli.FEep_Hw_Current_Sense_Capable:byte
```

偏移0x31个字节，这个是Current_Sense_Capable 是否使能的标记



```assembly
006EA5FB        mov         eax,dword ptr [ebp-8]
006EA5FE        cmp         byte ptr [eax+6],29;TBLHeli.FEep_Layout_Revision:byte
006EA602>       jb          006EA633
006EA604        movzx       eax,byte ptr [ebx+3F]
006EA608        mov         edx,dword ptr [ebp-8]
006EA60B        mov         byte ptr [edx+2F],al;TBLHeli.FEep_Nondamped_Capable:byte
```

偏移0x3F个字节，这个是Nondamped_Capable是否使能的标记，我这里是0x01 使能



```assembly
006EA60E        movzx       eax,byte ptr [ebx+1C]
006EA612        mov         edx,dword ptr [ebp-8]
006EA615        mov         byte ptr [edx+20],al;TBLHeli.FEep_Note_Config:byte
```

偏移0x1C个字节，这个是Note_Config 就是音乐的配置，我这里速度是5间隔是0，所以是 0x50



```assembly

006EA618        mov         eax,dword ptr [ebp-8]
006EA61B        lea         edx,[eax+80];TBLHeli.FEep_Note_Array:TEep_Note_Array
006EA621        lea         eax,[ebx+90]
006EA627        mov         ecx,30
006EA62C        call        Move
```

这里是音乐的编码，偏移0x90，然后之后0x30个字节都是乐谱，这个和我使用的音乐是完全可以对的上的，没有使用的字节就是0xFF

![image-20210721181750911](https://i.loli.net/2021/07/21/HP1zU5TcrDJWfxh.png)



```assembly
# 跳转
006EA631>       jmp         006EA641
006EA633        mov         eax,[00841290];^gvar_00839100
006EA638        movzx       eax,byte ptr [eax]
006EA63B        mov         edx,dword ptr [ebp-8]
006EA63E        mov         byte ptr [edx+2F],al;TBLHeli.FEep_Nondamped_Capable:byte
# 继续
006EA641        mov         eax,dword ptr [ebp-8]
006EA644        cmp         byte ptr [eax+6],2C;TBLHeli.FEep_Layout_Revision:byte
# 跳转
006EA648>       jb          006EA66C
...
# 继续
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
# 跳转
006EA68F>       jb          006EA69D
```

这里不知道为什么，PWM Freq Min和Max 都是0xFF，这个值也不是从解密中读出来的，虽然解密中也有这个内容



但是我从解密后的buff中直接转换成短整型，就可以看到我pwm的设置，最低1040，中值1500，最高1960，但是没找到哪里调用了这部分数据

![image-20210721185550996](https://i.loli.net/2021/07/21/iXg8pt1ThqlAzOm.png)





同理下面的FEep_SPORT_Capable，也都是0xFF，难道说是不限制？这里只是一个限制选项？

```assembly

006EA691        movzx       eax,byte ptr [ebx+3E]
006EA695        mov         edx,dword ptr [ebp-8]
# 运动模式？
006EA698        mov         byte ptr [edx+2E],al;TBLHeli.FEep_SPORT_Capable:byte
006EA69B>       jmp         006EA6AB
# 继续
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
# 2.跳转 应该是参数有效
006EA6D3>       jne         006EA6E6
006EA6D5        cmp         bl,0F
006EA6D8>       jne         006EA748
006EA6DA        mov         eax,dword ptr [ebp-8]
006EA6DD        call        TBLHeli.IsCurrentProtectionFalselyHardEnabled
006EA6E2        test        al,al
006EA6E4>       je          006EA748
# 2.继续
006EA6E6        mov         eax,dword ptr [ebp-4]
006EA6E9        movzx       esi,byte ptr [eax+edi]
006EA6ED        cmp         bl,0E
# 3.跳转
006EA6F0>       jne         006EA703
006EA6F2        cmp         si,0FF
006EA6F7>       jae         006EA703
006EA6F9        cmp         si,18
006EA6FD>       jb          006EA703
006EA6FF        sub         si,18
# 3.继续
006EA703        mov         eax,ebx
006EA705        call        006DEB58
006EA70A        cmp         al,1
# 4.跳转
006EA70C>       jbe         006EA71C
006EA70E        mov         eax,dword ptr [ebp-4]
006EA711        movzx       eax,byte ptr [eax+edi+1]
006EA716        shl         eax,8
006EA719        add         si,ax
# 4.继续
006EA71C        cmp         bl,11
# 5.跳转
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
# 5.继续
006EA748        mov         edx,ebx
006EA74A        mov         ecx,esi
006EA74C        mov         eax,dword ptr [ebp-8]
006EA74F        call        TBLHeli.SetParameterValueOrDefault
006EA754        inc         ebx
# 这里大概是要循环 0x1F-0x04个
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



参数解析

```
第一个参数偏移 0x3
```





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
# 这里比较可疑，通过上面的分析，大概知道了这里变成String，其实就是给overview去显示的
006E54D6        call        TBLHeli.WriteSetupToString
006E54DB        test        byte ptr [ebp-5],2
006E54DF>       je          006E54EE
006E54E1        movzx       eax,byte ptr [ebx+0D3];TBLHeli.FBootloaderRev:byte
006E54E8        mov         byte ptr [esi+0D3],al;TBLHeli.FBootloaderRev:byte
006E54EE        xor         ecx,ecx
006E54F0        mov         edx,dword ptr [ebp-4]
006E54F3        mov         eax,esi
# 这里虽然是解密，其实我感觉应该是恢复了一次解密内容
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
    WriteSetupToString
    ReadSetupFromBinString
   SetupToControls 这里是把内容处理，显示到ui上
    OnSetupToControls 刷新UI
```



## 变量内



## Summary

未完待续...



## Quote

>https://www.52pojie.cn/thread-615448-1-1.html
>
>http://www.youngroe.com/2019/07/01/Windows/delphi_reverse_summary/
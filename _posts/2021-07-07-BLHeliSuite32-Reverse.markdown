---
layout:     post
title:      "BLHeliSuite32逆向"
subtitle:   "Crack，Reverse"
date:       2021-07-07
update:     2021-07-07
author:     "elmagnifico"
header-img: "img/drone-head-bg.jpg"
catalog:    true
mathjax:    false
tags:
    - crack
    - BLHeli
---

## Foreword

继之前说过的BLH协议，感觉最近反编译技能上升，可以尝试将电调的源程序给逆向了，然后直接拿到实际的协议进行校准，而不再通过固定字符串进行校准。

> http://elmagnifico.tech/2020/06/03/BLHeli-Uart-Usb-Protocol/



## 查壳

第一步是查壳，看看BLH到底是啥写的

通过DIE查壳，发现BLH这个exe是Delphi写的，Delphi我没接触过，只是听闻很多老程序或者病毒木马之类的都是出自Delphi。

![image-20210707152920628](https://i.loli.net/2021/07/07/kUSBmWV3gJGctpr.png)

接下里就是查找到底什么软件可以反编译Delphi



## 反编译工具

找到有几个工具是用来Delphi反编译的，挨个尝试。

#### DarkDe4

DarkDe4，当场报错，整个处理完以后，forms，event啥的全都看不了，只好再换一个

![image-20210707153303901](https://i.loli.net/2021/07/07/Nl7XiFxTo2SUkWD.png)



#### DelphiDecompiler

DelphiDecompiler也是一样，当场报错

![image-20210707153440130](https://i.loli.net/2021/07/07/HfonjmFUcJrK24y.png)



#### IDR

Interactive Delphi Reconstructor，真神来了，反编译过程中没报错，查看各个Forms也都正常

![image-20210707153640201](https://i.loli.net/2021/07/07/qY6myESCkLMAVfT.png)



## 反编译

工具ok了，就可以开始反编译了，连接串口什么的就不看了，直接进入正文，Read Setup，看看实际上他是怎么读取配置信息的。



由于和实现的协议有关系，最好先复看一下之前的协议分析，其中具体的通信流程什么的，都会对这里的反编译有帮助



### Read Setup

记一下这个button叫啥名字，actReadSetup，TBitBtn

然后跳到对应的事件，看看是执行了什么

```assembly
_Unit141.TfrmBLHeliSuiteMain.actReadSetupExecute
0081C404        push        ebp
0081C405        mov         ebp,esp
0081C407        push        ecx
0081C408        mov         dword ptr [ebp-4],eax
0081C40B        xor         edx,edx
0081C40D        mov         eax,dword ptr [ebp-4]
0081C410        call        00821718
0081C415        xor         eax,eax
0081C417        push        ebp
0081C418        push        81C449
0081C41D        push        dword ptr fs:[eax]
0081C420        mov         dword ptr fs:[eax],esp
0081C423        mov         eax,dword ptr [ebp-4]
0081C426        mov         eax,dword ptr [eax+63C];TfrmBLHeliSuiteMain.Fifm:TBLHeliInterfaceManager
## 基本直接看这里就行了,直接调用了下面的函数,跳转去看下
0081C42C        call        TBLHeliInterfaceManager.DoBtnReadSetup
0081C431        xor         eax,eax
0081C433        pop         edx
0081C434        pop         ecx
0081C435        pop         ecx
0081C436        mov         dword ptr fs:[eax],edx
0081C439        push        81C450
0081C43E        mov         dl,1
0081C440        mov         eax,dword ptr [ebp-4]
0081C443        call        00821718
0081C448        ret
0081C449>       jmp         @HandleFinally
0081C44E>       jmp         0081C43E
0081C450        pop         ecx
0081C451        pop         ebp
0081C452        ret
```



一些注意事项：

>Delphi遵循_fastcall调用约定，但是与Windows的_fastcall略有不同，参数顺序为eax为第一个参数、edx为第二个参数、ecx为第三个参数，大于3个的参数通过堆栈传递，大于三个的堆栈顺序从左到右依次压栈，堆栈由被调用者恢复。
>
>Delphi的按钮事件地址是通过按钮名字和地址绑定的，具体为一个按钮名称对应一个按钮事件响应函数地址。而按钮名称可以在Delphi的RCDATA资源中找到，具体为通过PE Explorer打开资源RC数据，找到相应界面的Form，找到按钮名称的字符串值。



```assembly
_Unit139.TBLHeliInterfaceManager.DoBtnReadSetup
007CA1F8        push        ebx
007CA1F9        mov         ebx,eax
007CA1FB        mov         dl,1
007CA1FD        mov         eax,ebx
007CA1FF        call        TBLHeliInterfaceManager.DoConnectInterface
007CA204        test        al,al
007CA206>       je          007CA250
007CA208        mov         eax,ebx
007CA20A        call        TBLHeliInterfaceManager.InterfaceMultiESCEnabled
007CA20F        test        al,al
007CA211>       je          007CA236
007CA213        mov         eax,ebx
007CA215        call        TBLHeliInterfaceManager.GetESCTargetsCount
007CA21A        test        al,al
007CA21C>       je          007CA22B
007CA21E        mov         dl,1
007CA220        mov         eax,ebx
007CA222        call        TBLHeliInterfaceManager.DoCheckDeviceIsPresent
007CA227        test        al,al
007CA229>       jne         007CA236
007CA22B        mov         dl,1
007CA22D        mov         eax,ebx
007CA22F        call        TBLHeliInterfaceManager.DoBtnCheckMultiESC
007CA234>       jmp         007CA249
007CA236        call        TStringComparer.Ordinal
007CA23B        call        TFirmwareHexFiles.ClearServerTimoutList
007CA240        mov         dl,1
007CA242        mov         eax,ebx
# 关键是这里
007CA244        call        TBLHeliInterfaceManager.ReadSetupAll
007CA249        mov         eax,ebx
007CA24B        call        TBLHeliInterfaceManager.UpdateInterfaceConnectionState
007CA250        pop         ebx
007CA251        ret

```

函数调用关系比较明显，以上来就是连接接口（串口或者usb等），然后设置多电调，获取电调连接个数，检测电调是否在线，清空超时列表（猜测是检测在线时开启的timer），接着读取所有配置信息，最后更新UI上的连接状态

接着去看TBLHeliInterfaceManager.ReadSetupAll

```assembly
_Unit139.TBLHeliInterfaceManager.ReadSetupAll
007D5A2C        push        ebp
007D5A2D        mov         ebp,esp
007D5A2F        xor         ecx,ecx
007D5A31        push        ecx
007D5A32        push        ecx
007D5A33        push        ecx
007D5A34        push        ecx
007D5A35        push        ecx
007D5A36        push        ecx
007D5A37        push        ecx
007D5A38        push        ebx
007D5A39        mov         byte ptr [ebp-5],dl
007D5A3C        mov         dword ptr [ebp-4],eax
007D5A3F        xor         eax,eax
007D5A41        push        ebp
007D5A42        push        7D5C9E
007D5A47        push        dword ptr fs:[eax]
007D5A4A        mov         dword ptr fs:[eax],esp
007D5A4D        mov         byte ptr [ebp-6],0
007D5A51        mov         dl,1
007D5A53        mov         eax,dword ptr [ebp-4]
007D5A56        call        TBLHeliInterfaceManager.DoConnectInterface
007D5A5B        test        al,al
007D5A5D>       je          007D5C83
007D5A63        call        006DB734
007D5A68        test        al,al
007D5A6A>       je          007D5A80
007D5A6C        mov         eax,7D5CBC;'Reading Setup for'
007D5A71        call        006DC004
007D5A76        mov         eax,1
007D5A7B        call        006DBF4C
007D5A80        xor         edx,edx
007D5A82        mov         eax,dword ptr [ebp-4]
007D5A85        call        TBLHeliInterfaceManager.SetLastResultMsg
007D5A8A        xor         eax,eax
007D5A8C        push        ebp
007D5A8D        push        7D5C79
007D5A92        push        dword ptr fs:[eax]
007D5A95        mov         dword ptr fs:[eax],esp
007D5A98        mov         eax,dword ptr [ebp-4]
007D5A9B        call        TBLHeliInterfaceManager.GetESCSelectedMasterOrFirstTarget
007D5AA0        mov         edx,eax
007D5AA2        xor         ecx,ecx
007D5AA4        mov         eax,dword ptr [ebp-4]
007D5AA7        call        TBLHeliInterfaceManager.SetCurrentESCNum
007D5AAC        mov         eax,dword ptr [ebp-4]
007D5AAF        call        TBLHeliInterfaceManager.BLHeliStored
007D5AB4        call        TBLHeli.Init
007D5AB9        call        006DB734
007D5ABE        test        al,al
007D5AC0>       je          007D5AE4
007D5AC2        lea         edx,[ebp-0C]
007D5AC5        mov         eax,dword ptr [ebp-4]
007D5AC8        call        TBLHeliInterfaceManager.GetESCNumStr
007D5ACD        mov         eax,dword ptr [ebp-0C]
007D5AD0        push        eax
007D5AD1        call        006DBF04
007D5AD6        mov         ecx,eax
007D5AD8        dec         ecx
007D5AD9        mov         edx,0FF0000
007D5ADE        pop         eax
007D5ADF        call        006DBD18
007D5AE4        xor         ebx,ebx
007D5AE6        xor         ecx,ecx
007D5AE8        mov         dl,1
007D5AEA        mov         eax,dword ptr [ebp-4]
# 前面基本都是获取已有信息或者参数，这里开始连接
007D5AED        call        TBLHeliInterfaceManager.DoConnectDevice
007D5AF2        test        al,al
007D5AF4>       je          007D5B04
007D5AF6        mov         dl,1
007D5AF8        mov         eax,dword ptr [ebp-4]
007D5AFB        call        TBLHeliInterfaceManager.DoCheckDeviceIsPresent
007D5B00        test        al,al
007D5B02>       jne         007D5B31
007D5B04        mov         eax,dword ptr [ebp-4]
007D5B07        movzx       eax,byte ptr [eax+54];TBLHeliInterfaceManager.FCurrentESCNum:byte
007D5B0B        mov         ecx,eax
007D5B0D        mov         edx,eax
007D5B0F        mov         eax,dword ptr [ebp-4]
007D5B12        call        TBLHeliInterfaceManager.ClearMultiESC
007D5B17        mov         eax,dword ptr [ebp-4]
007D5B1A        call        TBLHeliInterfaceManager.UpdateMultiESCInfo
007D5B1F        mov         eax,dword ptr [ebp-4]
007D5B22        call        TBLHeliInterfaceManager.SetupToControls
007D5B27        call        @TryFinallyExit
007D5B2C>       jmp         007D5C83
007D5B31        movzx       edx,byte ptr [ebp-5]
007D5B35        mov         eax,dword ptr [ebp-4]
# 读取设置信息
007D5B38        call        TBLHeliInterfaceManager.ReadDeviceSetupSection
007D5B3D        mov         byte ptr [ebp-7],al
007D5B40        mov         eax,dword ptr [ebp-4]
# 存储信息？
007D5B43        call        TBLHeliInterfaceManager.BLHeliStored
007D5B48        mov         edx,dword ptr [ebp-4]
007D5B4B        mov         edx,dword ptr [edx+44];TBLHeliInterfaceManager.FBLHeliWork:TBLHeli
007D5B4E        movzx       ecx,byte ptr ds:[7D5CE0];0x3 gvar_007D5CE0
007D5B55        call        TBLHeli.CopyTo
007D5B5A        mov         eax,dword ptr [ebp-4]
# 将信息显示到控件？
007D5B5D        call        TBLHeliInterfaceManager.SetupToControls
007D5B62        mov         eax,dword ptr [ebp-4]
# 检测电调内部的Flash状态
007D5B65        call        TBLHeliInterfaceManager.CheckInTargetFlashState
007D5B6A        test        al,al
007D5B6C>       je          007D5B94
007D5B6E        mov         eax,dword ptr [ebp-4]
# 检测Flash并且提示是否烧写新固件？
007D5B71        call        TBLHeliInterfaceManager.CheckOnFlashStateAndAsk
007D5B76        test        al,al
007D5B78>       je          007D5B90
007D5B7A        mov         eax,dword ptr [ebp-4]
# 这里应该是选择了烧写，进行烧写处理
007D5B7D        call        TBLHeliInterfaceManager.FlashESC
007D5B82        test        eax,eax
007D5B84>       jle         007D5B8A
007D5B86        mov         bl,1
007D5B88>       jmp         007D5B94
007D5B8A        mov         byte ptr [ebp-5],0
007D5B8E>       jmp         007D5B94
007D5B90        mov         byte ptr [ebp-5],0
007D5B94        test        bl,bl
007D5B96>       jne         007D5AE4
007D5B9C        cmp         byte ptr [ebp-7],0
007D5BA0>       je          007D5BA6
007D5BA2        mov         byte ptr [ebp-6],1
007D5BA6        xor         eax,eax
007D5BA8        pop         edx
007D5BA9        pop         ecx
007D5BAA        pop         ecx
007D5BAB        mov         dword ptr fs:[eax],edx
007D5BAE        push        7D5C83
007D5BB3        call        006DB734
007D5BB8        test        al,al
007D5BBA>       je          007D5BCF
007D5BBC        mov         eax,1
007D5BC1        call        006DBF64
007D5BC6        movzx       eax,byte ptr [ebp-6]
007D5BCA        call        006DBE1C
007D5BCF        cmp         byte ptr [ebp-6],0
007D5BD3>       je          007D5C05
007D5BD5        lea         edx,[ebp-14]
007D5BD8        mov         eax,dword ptr [ebp-4]
# 再次获取ESC数量，显示读取成功
007D5BDB        call        TBLHeliInterfaceManager.GetESCNumStr
007D5BE0        lea         eax,[ebp-14]
007D5BE3        mov         edx,7D5CF0;' setup read successfully'
007D5BE8        call        @UStrCat
007D5BED        mov         eax,dword ptr [ebp-14]
007D5BF0        lea         edx,[ebp-10]
007D5BF3        call        006D5894
007D5BF8        mov         edx,dword ptr [ebp-10]
007D5BFB        mov         eax,dword ptr [ebp-4]
# 设置成功的状态信息
007D5BFE        call        TBLHeliInterfaceManager.SetLastResultMsg
007D5C03>       jmp         007D5C33
007D5C05        lea         edx,[ebp-1C]
007D5C08        mov         eax,dword ptr [ebp-4]
# 报错失败了，更新ESC数量
007D5C0B        call        TBLHeliInterfaceManager.GetESCNumStr
007D5C10        lea         eax,[ebp-1C]
007D5C13        mov         edx,7D5D30;' setup read failed'
007D5C18        call        @UStrCat
007D5C1D        mov         eax,dword ptr [ebp-1C]
007D5C20        lea         edx,[ebp-18]
007D5C23        call        006D5894
007D5C28        mov         edx,dword ptr [ebp-18]
007D5C2B        mov         eax,dword ptr [ebp-4]
# 设置失败的信息
007D5C2E        call        TBLHeliInterfaceManager.SetLastResultMsg
007D5C33        mov         eax,dword ptr [ebp-4]
007D5C36        movzx       eax,byte ptr [eax+54];TBLHeliInterfaceManager.FCurrentESCNum:byte
007D5C3A        lea         eax,[eax+eax*8]
007D5C3D        mov         edx,dword ptr [ebp-4]
007D5C40        lea         eax,[edx+eax*4+4C]
007D5C44        mov         edx,dword ptr [ebp-4]
007D5C47        mov         edx,dword ptr [edx+320];TBLHeliInterfaceManager.FLastResultMsg:string
007D5C4D        call        @UStrAsg
007D5C52        cmp         byte ptr [ebp-5],0
007D5C56>       je          007D5C78
007D5C58        cmp         byte ptr [ebp-6],0
007D5C5C>       je          007D5C78
007D5C5E        mov         eax,dword ptr [ebp-4]
007D5C61        cmp         byte ptr [eax+338],0;TBLHeliInterfaceManager.FShowSuccessMsg:Boolean
007D5C68>       je          007D5C78
007D5C6A        mov         eax,dword ptr [ebp-4]
007D5C6D        mov         eax,dword ptr [eax+320];TBLHeliInterfaceManager.FLastResultMsg:string
007D5C73        call        006DF698
007D5C78        ret
007D5C79>       jmp         @HandleFinally
007D5C7E>       jmp         007D5BB3
007D5C83        xor         eax,eax
007D5C85        pop         edx
007D5C86        pop         ecx
007D5C87        pop         ecx
007D5C88        mov         dword ptr fs:[eax],edx
007D5C8B        push        7D5CA5
007D5C90        lea         eax,[ebp-1C]
007D5C93        mov         edx,5
007D5C98        call        @UStrArrayClr
007D5C9D        ret
007D5C9E>       jmp         @HandleFinally
007D5CA3>       jmp         007D5C90
007D5CA5        movzx       eax,byte ptr [ebp-6]
007D5CA9        pop         ebx
007D5CAA        mov         esp,ebp
007D5CAC        pop         ebp
007D5CAD        ret

```



#### ReadDeviceSetupSection

继续追TBLHeliInterfaceManager.ReadDeviceSetupSection，看看他具体怎么做的

```assembly
_Unit139.TBLHeliInterfaceManager.ReadDeviceSetupSection
007D8560        push        ebp
007D8561        mov         ebp,esp
007D8563        add         esp,0FFFFFFF0
007D8566        push        ebx
007D8567        xor         ecx,ecx
007D8569        mov         dword ptr [ebp-10],ecx
007D856C        mov         dword ptr [ebp-4],ecx
007D856F        mov         ebx,edx
007D8571        mov         dword ptr [ebp-8],eax
007D8574        xor         eax,eax
007D8576        push        ebp
007D8577        push        7D8804
007D857C        push        dword ptr fs:[eax]
007D857F        mov         dword ptr fs:[eax],esp
007D8582        mov         byte ptr [ebp-9],0
007D8586        mov         eax,dword ptr [ebp-8]
007D8589        add         eax,32C;TBLHeliInterfaceManager.FLastReadSetupMem:TArray<System.Byte>
007D858E        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
# 这里是在清空上次的内存
007D8594        call        @DynArrayClear
007D8599        call        006DB734
007D859E        test        al,al
007D85A0>       je          007D85B6
007D85A2        mov         eax,7D8820;'DeviceReadSetup:'
007D85A7        call        006DBF8C
007D85AC        mov         eax,1
007D85B1        call        006DBF4C
007D85B6        xor         edx,edx
007D85B8        push        ebp
007D85B9        push        7D87D7
007D85BE        push        dword ptr fs:[edx]
007D85C1        mov         dword ptr fs:[edx],esp
007D85C4        xor         ecx,ecx
007D85C6        mov         dl,1
007D85C8        mov         eax,dword ptr [ebp-8]
# 再次检测连接
007D85CB        call        TBLHeliInterfaceManager.DoConnectDevice
007D85D0        test        al,al
007D85D2>       je          007D8632
007D85D4        mov         eax,dword ptr [ebp-8]
007D85D7        movzx       eax,byte ptr [eax+55];TBLHeliInterfaceManager.FESCInterfaceType:TESCInterfaceType
007D85DB        sub         al,0C
007D85DD>       je          007D85E9
007D85DF        dec         al
007D85E1>       je          007D8602
007D85E3        dec         al
007D85E5>       je          007D861B
007D85E7>       jmp         007D8632
007D85E9        mov         eax,dword ptr [ebp-8]
007D85EC        lea         edx,
# 具体的读内存
[eax+32C];TBLHeliInterfaceManager.FLastReadSetupMem:TArray<System.Byte>
007D85F2        mov         eax,dword ptr [ebp-8]
007D85F5        mov         eax,dword ptr [eax+50];TBLHeliInterfaceManager.FUniSerialInterf:TUniSerialInterface
# 这里应该是选择通过单线读取电调配置
007D85F8        call        TUniSerialInterface.Send_cmd_DeviceReadBLHeliSetupSection
007D85FD        mov         byte ptr [ebp-9],al
007D8600>       jmp         007D8632
007D8602        mov         eax,dword ptr [ebp-8]
007D8605        lea         edx,[eax+32C];TBLHeliInterfaceManager.FLastReadSetupMem:TArray<System.Byte>
007D860B        mov         eax,dword ptr [ebp-8]
007D860E        mov         eax,dword ptr [eax+48];TBLHeliInterfaceManager.FBLBInterf:TBLBInterface
# 这里BLB其实就是指对应的电调类型，对应的就是BetaFlight或者CleanFlight之类的实现
007D8611        call        TBLBInterface.Send_cmd_DeviceReadBLHeliSetupSection
007D8616        mov         byte ptr [ebp-9],al
007D8619>       jmp         007D8632
007D861B        mov         eax,dword ptr [ebp-8]
007D861E        lea         edx,[eax+32C];TBLHeliInterfaceManager.FLastReadSetupMem:TArray<System.Byte>
007D8624        mov         eax,dword ptr [ebp-8]
007D8627        mov         eax,dword ptr [eax+4C];TBLHeliInterfaceManager.FCfIntf:TFlightCtrlIntf
# 最后这个FlightCtr 估计是直接控制电调的那种接口方式了，类似4way-if
007D862A        call        TFlightCtrlIntf.Send_cmd_DeviceReadBLHeliSetupSection
007D862F        mov         byte ptr [ebp-9],al
007D8632        cmp         byte ptr [ebp-9],0
007D8636>       je          007D878B
007D863C        mov         eax,dword ptr [ebp-8]
# 接收boot
007D863F        call        TBLHeliInterfaceManager.DeviceBootloaderRev
007D8644        push        eax
007D8645        mov         eax,dword ptr [ebp-8]
007D8648        call        TBLHeliInterfaceManager.BLHeliStored
007D864D        pop         edx
007D864E        mov         byte ptr [eax+0D3],dl;TBLHeli.FBootloaderRev:byte
007D8654        mov         eax,dword ptr [ebp-8]
007D8657        call        TBLHeliInterfaceManager.BLHeliStored
007D865C        mov         edx,dword ptr [ebp-8]
# 这里直接读取配置内存
007D865F        mov         edx,dword ptr [edx+32C];TBLHeliInterfaceManager.FLastReadSetupMem:TArray<System.Byte>
007D8665        mov         ecx,ebx
#从bin中直接读取string？
007D8667        call        TBLHeli.ReadSetupFromBinString
007D866C        cmp         al,4
007D866E>       jae         007D87AD
007D8674        mov         eax,dword ptr [ebp-8]
007D8677        call        TBLHeliInterfaceManager.BLHeliStored
007D867C        call        006E7228
007D8681        test        al,al
007D8683>       jne         007D86C6
007D8685        mov         eax,dword ptr [ebp-8]
007D8688        call        TBLHeliInterfaceManager.BLHeliStored
007D868D        call        006E7280
007D8692        test        al,al
007D8694>       jne         007D86C6
007D8696        mov         eax,dword ptr [ebp-8]
007D8699        call        TBLHeliInterfaceManager.BLHeliStored
007D869E        mov         edx,eax
007D86A0        mov         eax,dword ptr [ebp-8]
# 读取设备激活状态
007D86A3        call        TBLHeliInterfaceManager.ReadDeviceActivationStatus
007D86A8        lea         edx,[ebp-4]
007D86AB        mov         eax,dword ptr [ebp-8]
# 获取设备uuid
007D86AE        call        TBLHeliInterfaceManager.ReadDeviceUUID_Str
007D86B3        mov         byte ptr [ebp-9],al
007D86B6        mov         eax,dword ptr [ebp-8]
007D86B9        call        TBLHeliInterfaceManager.BLHeliStored
007D86BE        mov         edx,dword ptr [ebp-4]
007D86C1        call        006E5974
007D86C6        call        006DB734
007D86CB        test        al,al
007D86CD>       je          007D870C
007D86CF        mov         eax,dword ptr [ebp-8]
007D86D2        call        TBLHeliInterfaceManager.BLHeliStored
# 电流保护是否启动
007D86D7        call        TBLHeli.IsCurrentProtectionFalselyHardEnabled
007D86DC        test        al,al
007D86DE>       je          007D870C
007D86E0        mov         eax,7D8850;'ESC '
007D86E5        call        006DBFA0
007D86EA        mov         eax,dword ptr [ebp-8]
007D86ED        call        TBLHeliInterfaceManager.BLHeliStored
007D86F2        lea         edx,[ebp-10]
007D86F5        call        006E64CC
007D86FA        mov         eax,dword ptr [ebp-10]
007D86FD        call        006DBFF0
# 没看懂
007D8702        mov         eax,7D8868;' with falsely indicating current sensor firmware.'
007D8707        call        006DC004
007D870C        mov         eax,dword ptr [ebp-8]
007D870F        call        TBLHeliInterfaceManager.BLHeliStored
007D8714        call        006E7280
007D8719        test        al,al
007D871B>       jne         007D87AD
007D8721        mov         eax,dword ptr [ebp-8]
007D8724        call        TBLHeliInterfaceManager.BLHeliStored
007D8729        call        006E71A8
007D872E        test        al,al
007D8730>       jne         007D87AD
007D8732        mov         eax,dword ptr [ebp-8]
007D8735        call        TBLHeliInterfaceManager.BLHeliStored
007D873A        call        006E724C
007D873F        test        al,al
007D8741>       jne         007D87AD
007D8743        mov         eax,dword ptr [ebp-8]
007D8746        call        TBLHeliInterfaceManager.BLHeliStored
007D874B        call        006E7228
007D8750        test        al,al
007D8752>       jne         007D87AD
007D8754        mov         eax,dword ptr [ebp-8]
007D8757        call        TBLHeliInterfaceManager.BLHeliStored
007D875C        call        006E9304
007D8761        test        al,al
007D8763>       jne         007D87AD
007D8765        mov         eax,dword ptr [ebp-8]
# 分析ESC的主从数据
007D8768        call        TBLHeliInterfaceManager.AnalyzeESCMasterSlaveData
007D876D        mov         eax,dword ptr [ebp-8]
007D8770        movzx       eax,byte ptr [eax+54];TBLHeliInterfaceManager.FCurrentESCNum:byte
007D8774        lea         eax,[eax+eax*8]
007D8777        mov         edx,dword ptr [ebp-8]
007D877A        cmp         byte ptr [edx+eax*4+44],0
007D877F>       jne         007D87AD
007D8781        mov         edx,dword ptr [ebp-8]
007D8784        mov         byte ptr [edx+eax*4+48],1
007D8789>       jmp         007D87AD
007D878B        mov         byte ptr [ebp-9],0
007D878F        mov         eax,dword ptr [ebp-8]
007D8792        call        TBLHeliInterfaceManager.BLHeliStored
007D8797        call        TBLHeli.Invalidate
007D879C        mov         eax,dword ptr [ebp-8]
007D879F        call        TBLHeliInterfaceManager.BLHeliStored
007D87A4        xor         ecx,ecx
007D87A6        xor         edx,edx
007D87A8        call        TBLHeli.ReadSetupFromBinString
007D87AD        xor         eax,eax
007D87AF        pop         edx
007D87B0        pop         ecx
007D87B1        pop         ecx
007D87B2        mov         dword ptr fs:[eax],edx
007D87B5        push        7D87DE
007D87BA        call        006DB734
007D87BF        test        al,al
007D87C1>       je          007D87D6
007D87C3        mov         eax,1
007D87C8        call        006DBF64
007D87CD        movzx       eax,byte ptr [ebp-9]
007D87D1        call        006DBE1C
007D87D6        ret
007D87D7>       jmp         @HandleFinally
007D87DC>       jmp         007D87BA
007D87DE        mov         eax,dword ptr [ebp-8]
007D87E1        call        TBLHeliInterfaceManager.UpdateMultiESCInfo
007D87E6        xor         eax,eax
007D87E8        pop         edx
007D87E9        pop         ecx
007D87EA        pop         ecx
007D87EB        mov         dword ptr fs:[eax],edx
007D87EE        push        7D880B
007D87F3        lea         eax,[ebp-10]
007D87F6        call        @UStrClr
007D87FB        lea         eax,[ebp-4]
007D87FE        call        @UStrClr
007D8803        ret
007D8804>       jmp         @HandleFinally
007D8809>       jmp         007D87F3
007D880B        movzx       eax,byte ptr [ebp-9]
007D880F        pop         ebx
007D8810        mov         esp,ebp
007D8812        pop         ebp
007D8813        ret

```



##### TUniSerialInterface.Send_cmd_DeviceReadBLHeliSetupSection

```assembly
_Unit109.TUniSerialInterface.Send_cmd_DeviceReadBLHeliSetupSection
0070E4DC        push        ebx
0070E4DD        push        esi
0070E4DE        push        edi
0070E4DF        mov         esi,edx
0070E4E1        mov         edi,eax
0070E4E3        xor         ebx,ebx
0070E4E5        mov         eax,esi
0070E4E7        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
0070E4ED        call        @DynArrayClear
0070E4F2        movzx       eax,byte ptr [edi+0E0];TUniSerialInterface.FInterfaceMode:TUniInterfaceMode
0070E4F9        sub         al,4
0070E4FB>       jne         0070E51B
0070E4FD        push        100
0070E502        mov         eax,edi
0070E504        call        00712910
0070E509        call        006D7C34
0070E50E        mov         ecx,eax
0070E510        mov         edx,esi
0070E512        mov         eax,edi
# 所以变成了读取Flash
0070E514        call        TUniSerialInterface.Send_cmd_DeviceReadFlash
0070E519        mov         ebx,eax
0070E51B        mov         eax,ebx
0070E51D        pop         edi
0070E51E        pop         esi
0070E51F        pop         ebx
0070E520        ret

```

看一下单线串口读取信息是怎么读的，TUniSerialInterface.Send_cmd_DeviceReadBLHeliSetupSection

```assembly
_Unit109.TUniSerialInterface.Send_cmd_DeviceReadBLHeliSetupSection
0070E4DC        push        ebx
0070E4DD        push        esi
0070E4DE        push        edi
0070E4DF        mov         esi,edx
0070E4E1        mov         edi,eax
0070E4E3        xor         ebx,ebx
0070E4E5        mov         eax,esi
0070E4E7        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
0070E4ED        call        @DynArrayClear
0070E4F2        movzx       eax,byte ptr [edi+0E0];TUniSerialInterface.FInterfaceMode:TUniInterfaceMode
0070E4F9        sub         al,4
0070E4FB>       jne         0070E51B
0070E4FD        push        100
0070E502        mov         eax,edi
0070E504        call        00712910
0070E509        call        006D7C34
0070E50E        mov         ecx,eax
0070E510        mov         edx,esi
0070E512        mov         eax,edi
# 所以变成了读取Flash
0070E514        call        TUniSerialInterface.Send_cmd_DeviceReadFlash
0070E519        mov         ebx,eax
0070E51B        mov         eax,ebx
0070E51D        pop         edi
0070E51E        pop         esi
0070E51F        pop         ebx
0070E520        ret

```



TUniSerialInterface.Send_cmd_DeviceReadFlash，再看下flash是怎么读的

```assembly
_Unit109.TUniSerialInterface.Send_cmd_DeviceReadFlash
0070DF30        push        ebp
0070DF31        mov         ebp,esp
0070DF33        push        ebx
0070DF34        movzx       ebx,word ptr [ebp+8]
0070DF38        push        ebx
0070DF39        call        TUniSerialInterface.Send_cmd_DeviceRead
0070DF3E        pop         ebx
0070DF3F        pop         ebp
0070DF40        ret         4

```



##### TUniSerialInterface.Send_cmd_DeviceRead

继续追TUniSerialInterface.Send_cmd_DeviceRead，这里应该是具体的实现了，这么长

```assembly
_Unit109.TUniSerialInterface.Send_cmd_DeviceRead
0070D798        push        ebp
0070D799        mov         ebp,esp
0070D79B        push        ecx
0070D79C        mov         ecx,7
0070D7A1        push        0
0070D7A3        push        0
0070D7A5        dec         ecx
0070D7A6>       jne         0070D7A1
0070D7A8        xchg        ecx,dword ptr [ebp-4]
0070D7AB        push        ebx
0070D7AC        push        esi
0070D7AD        push        edi
0070D7AE        mov         ebx,ecx
0070D7B0        mov         dword ptr [ebp-8],edx
0070D7B3        mov         dword ptr [ebp-4],eax
0070D7B6        xor         eax,eax
0070D7B8        push        ebp
0070D7B9        push        70DA7F
0070D7BE        push        dword ptr fs:[eax]
0070D7C1        mov         dword ptr fs:[eax],esp
0070D7C4        mov         eax,dword ptr [ebp-8]
0070D7C7        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
0070D7CD        call        @DynArrayClear
0070D7D2        mov         byte ptr [ebp-9],0
0070D7D6        mov         eax,dword ptr [ebp-4]
0070D7D9        cmp         byte ptr [eax+4C],0;TUniSerialInterface.FDeviceConnected:Boolean
0070D7DD>       je          0070DA3C
0070D7E3        call        006DB734
0070D7E8        test        al,al
0070D7EA>       je          0070D80B
0070D7EC        lea         edx,[ebp-18]
0070D7EF        mov         eax,70DAA0;'Send_cmd_DeviceRead:'
0070D7F4        call        006D5894
0070D7F9        mov         eax,dword ptr [ebp-18]
0070D7FC        call        006DBF8C
0070D801        mov         eax,1
0070D806        call        006DBF4C
0070D80B        xor         edx,edx
0070D80D        push        ebp
0070D80E        push        70DA17
0070D813        push        dword ptr fs:[edx]
0070D816        mov         dword ptr fs:[edx],esp
0070D819        movzx       eax,word ptr [ebp+8]
0070D81D        mov         dword ptr [ebp-10],eax
0070D820        push        0
0070D822        push        0
0070D824        push        1
0070D826        cmp         dword ptr [ebp-10],100
0070D82D        setg        dl
0070D830        xor         ecx,ecx
0070D832        mov         eax,dword ptr [ebp-10]
0070D835        call        006F5090
0070D83A        mov         byte ptr [ebp-12],al
0070D83D        xor         edx,edx
0070D83F        push        ebp
0070D840        push        70D94A
0070D845        push        dword ptr fs:[edx]
0070D848        mov         dword ptr fs:[edx],esp
0070D84B        lea         edx,[ebp-1C]
0070D84E        mov         eax,70DAD8;'Reading Flash ...'
0070D853        call        006D5894
0070D858        mov         eax,dword ptr [ebp-1C]
0070D85B        call        006F5154
0070D860        mov         eax,dword ptr [ebp-4]
0070D863        add         eax,90;TUniSerialInterface.FLastUniSerErr:string
0070D868        call        @UStrClr
0070D86D        mov         word ptr [ebp-14],bx
0070D871        mov         edi,dword ptr [ebp-10]
0070D874        mov         eax,dword ptr [ebp-4]
0070D877        mov         eax,dword ptr [eax+0F8];TUniSerialInterface.FMaxRXByteCount:Integer
0070D87D        cmp         edi,eax
0070D87F>       jle         0070D883
0070D881        mov         edi,eax
0070D883        cmp         edi,100
0070D889>       jne         0070D891
0070D88B        mov         byte ptr [ebp-11],0
0070D88F>       jmp         0070D896
0070D891        mov         eax,edi
0070D893        mov         byte ptr [ebp-11],al
0070D896        xor         esi,esi
0070D898        xor         ebx,ebx
0070D89A        movzx       eax,word ptr [ebp-14]
0070D89E        push        eax
0070D89F        lea         edx,[ebp-20]
0070D8A2        movzx       eax,byte ptr [ebp-11]
0070D8A6        call        006D59F4
0070D8AB        mov         ecx,dword ptr [ebp-20]
0070D8AE        mov         dl,0D
0070D8B0        mov         eax,dword ptr [ebp-4]
0070D8B3        call        0070C7AC
0070D8B8        test        al,al
0070D8BA>       je          0070D8BF
0070D8BC        inc         ebx
0070D8BD>       jmp         0070D8C0
0070D8BF        inc         esi
0070D8C0        test        ebx,ebx
0070D8C2>       jg          0070D8C9
0070D8C4        cmp         esi,1
0070D8C7>       jle         0070D89A
0070D8C9        test        ebx,ebx
0070D8CB>       jle         0070D902
0070D8CD        lea         ecx,[ebp-24]
0070D8D0        mov         eax,dword ptr [ebp-4]
0070D8D3        mov         edx,dword ptr [eax+0BC];TUniSerialInterface.I_PARAM:TArray<System.Byte>
0070D8D9        mov         eax,dword ptr [ebp-8]
0070D8DC        mov         eax,dword ptr [eax]
0070D8DE        call        006D5954
0070D8E3        mov         edx,dword ptr [ebp-24]
0070D8E6        mov         eax,dword ptr [ebp-8]
0070D8E9        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
0070D8EF        call        @DynArrayAsg
0070D8F4        add         word ptr [ebp-14],di
0070D8F8        sub         dword ptr [ebp-10],edi
0070D8FB        mov         eax,edi
0070D8FD        call        006F50FC
0070D902        cmp         dword ptr [ebp-10],0
0070D906>       je          0070D911
0070D908        cmp         ebx,1
0070D90B>       jge         0070D871
0070D911        cmp         dword ptr [ebp-10],0
0070D915>       jne         0070D921
0070D917        test        ebx,ebx
0070D919>       jle         0070D921
0070D91B        mov         byte ptr [ebp-9],1
0070D91F>       jmp         0070D933
0070D921        mov         eax,dword ptr [ebp-4]
0070D924        add         eax,90;TUniSerialInterface.FLastUniSerErr:string
0070D929        mov         edx,70DB08;'Error verifying flash!'
0070D92E        call        @UStrAsg
0070D933        xor         eax,eax
0070D935        pop         edx
0070D936        pop         ecx
0070D937        pop         ecx
0070D938        mov         dword ptr fs:[eax],edx
0070D93B        push        70D951
0070D940        movzx       eax,byte ptr [ebp-12]
0070D944        call        006F5204
0070D949        ret
0070D94A>       jmp         @HandleFinally
0070D94F>       jmp         0070D940
0070D951        xor         eax,eax
0070D953        pop         edx
0070D954        pop         ecx
0070D955        pop         ecx
0070D956        mov         dword ptr fs:[eax],edx
0070D959        push        70DA21
0070D95E        call        006DB734
0070D963        test        al,al
0070D965>       je          0070DA16
0070D96B        mov         eax,dword ptr [ebp-4]
0070D96E        movzx       edx,byte ptr [eax+0B8];TUniSerialInterface.I_CMD_ID:TSerialInterfaceCmd_ID
0070D975        mov         eax,dword ptr [ebp-4]
0070D978        call        00710D24
0070D97D        test        al,al
0070D97F>       je          0070D9CB
0070D981        mov         eax,[0084158C];^gvar_0085C668
0070D986        cmp         dword ptr [eax],1
0070D989>       jle         0070D9CB
0070D98B        push        70DB44;'"'
0070D990        lea         edx,[ebp-2C]
0070D993        mov         eax,dword ptr [ebp-8]
0070D996        mov         eax,dword ptr [eax]
0070D998        call        006D5B9C
0070D99D        push        dword ptr [ebp-2C]
0070D9A0        push        70DB44;'"'
0070D9A5        lea         eax,[ebp-28]
0070D9A8        mov         edx,3
0070D9AD        call        @UStrCatN
0070D9B2        mov         eax,dword ptr [ebp-28]
0070D9B5        call        006DBFDC
0070D9BA        mov         eax,dword ptr [ebp-8]
0070D9BD        mov         eax,dword ptr [eax]
0070D9BF        mov         ecx,800
0070D9C4        mov         dl,1
0070D9C6        call        006DC174
0070D9CB        mov         eax,1
0070D9D0        call        006DBF64
0070D9D5        mov         ebx,dword ptr [ebp-8]
0070D9D8        mov         ebx,dword ptr [ebx]
0070D9DA        test        ebx,ebx
0070D9DC>       je          0070D9E3
0070D9DE        sub         ebx,4
0070D9E1        mov         ebx,dword ptr [ebx]
0070D9E3        lea         eax,[ebp-30]
0070D9E6        push        eax
0070D9E7        mov         dword ptr [ebp-38],ebx
0070D9EA        mov         byte ptr [ebp-34],0
0070D9EE        lea         edx,[ebp-38]
0070D9F1        xor         ecx,ecx
0070D9F3        mov         eax,70DB54;'(%d Bytes)'
0070D9F8        call        006D5800
0070D9FD        mov         eax,dword ptr [ebp-30]
0070DA00        or          ecx,0FFFFFFFF
0070DA03        mov         edx,0FF0000
0070DA08        call        006DBD18
0070DA0D        movzx       eax,byte ptr [ebp-9]
0070DA11        call        006DBE1C
0070DA16        ret
0070DA17>       jmp         @HandleFinally
0070DA1C>       jmp         0070D95E
0070DA21        cmp         byte ptr [ebp-9],0
0070DA25>       jne         0070DA3C
0070DA27        lea         edx,[ebp-3C]
0070DA2A        mov         eax,70DB78;'Failed to read Flash!'
0070DA2F        call        006D5894
0070DA34        mov         eax,dword ptr [ebp-3C]
0070DA37        call        006DF680
0070DA3C        xor         eax,eax
0070DA3E        pop         edx
0070DA3F        pop         ecx
0070DA40        pop         ecx
0070DA41        mov         dword ptr fs:[eax],edx
0070DA44        push        70DA86
0070DA49        lea         eax,[ebp-3C]
0070DA4C        call        @UStrClr
0070DA51        lea         eax,[ebp-30]
0070DA54        mov         edx,3
0070DA59        call        @UStrArrayClr
0070DA5E        lea         eax,[ebp-24]
0070DA61        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
0070DA67        mov         ecx,2
0070DA6C        call        @FinalizeArray
0070DA71        lea         eax,[ebp-1C]
0070DA74        mov         edx,2
0070DA79        call        @UStrArrayClr
0070DA7E        ret
0070DA7F>       jmp         @HandleFinally
0070DA84>       jmp         0070DA49
0070DA86        movzx       eax,byte ptr [ebp-9]
0070DA8A        pop         edi
0070DA8B        pop         esi
0070DA8C        pop         ebx
0070DA8D        mov         esp,ebp
0070DA8F        pop         ebp
0070DA90        ret         4

```



#### TBLHeli.ReadSetupFromBinString

看一下这里是怎么读的，感觉接近解读参数了，可是参数又不全，部分也对不上

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
006EA37D        mov         eax,dword ptr [ebp-8]
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
006EA3A7        cmp         dword ptr [ebp-0C],0F800
006EA3AE>       jle         006EA3DF
006EA3B0        mov         eax,edx
006EA3B2        test        eax,eax
006EA3B4>       je          006EA3BB
006EA3B6        sub         eax,4
006EA3B9        mov         eax,dword ptr [eax]
006EA3BB        sub         eax,0F800
006EA3C0        mov         dword ptr [ebp-0C],eax
006EA3C3        mov         eax,dword ptr [ebp-0C]
006EA3C6        push        eax
006EA3C7        lea         eax,[ebp-4]
006EA3CA        push        eax
006EA3CB        mov         ecx,0F800
006EA3D0        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA3D6        mov         eax,ebx
006EA3D8        call        @DynArrayCopyRange
006EA3DD>       jmp         006EA42E
006EA3DF        cmp         dword ptr [ebp-0C],7C00
006EA3E6>       jle         006EA417
006EA3E8        mov         eax,edx
006EA3EA        test        eax,eax
006EA3EC>       je          006EA3F3
006EA3EE        sub         eax,4
006EA3F1        mov         eax,dword ptr [eax]
006EA3F3        sub         eax,7C00
006EA3F8        mov         dword ptr [ebp-0C],eax
006EA3FB        mov         eax,dword ptr [ebp-0C]
006EA3FE        push        eax
006EA3FF        lea         eax,[ebp-4]
006EA402        push        eax
006EA403        mov         ecx,7C00
006EA408        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA40E        mov         eax,ebx
006EA410        call        @DynArrayCopyRange
006EA415>       jmp         006EA42E
006EA417        mov         eax,dword ptr [ebp-0C]
006EA41A        push        eax
006EA41B        lea         eax,[ebp-4]
006EA41E        push        eax
006EA41F        xor         ecx,ecx
006EA421        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
006EA427        mov         eax,ebx
006EA429        call        @DynArrayCopyRange
006EA42E        cmp         dword ptr [ebp-0C],90
006EA435>       jge         006EA445
006EA437        mov         byte ptr [ebp-0E],6
006EA43B        call        @TryFinallyExit
006EA440>       jmp         006EA95C
006EA445        mov         edx,dword ptr ds:[841290];^gvar_00839100
006EA44B        movzx       edx,byte ptr [edx]
006EA44E        mov         eax,dword ptr [ebp-4]
006EA451        call        006D5CE4
006EA456        test        al,al
006EA458>       je          006EA468
006EA45A        mov         byte ptr [ebp-0E],5
006EA45E        call        @TryFinallyExit
006EA463>       jmp         006EA95C
006EA468        push        ebp
006EA469        call        006EA090
006EA46E        pop         ecx
006EA46F        mov         byte ptr [ebp-0E],al
006EA472        cmp         byte ptr [ebp-0E],4
006EA476>       jb          006EA482
006EA478        call        @TryFinallyExit
006EA47D>       jmp         006EA95C
006EA482        mov         eax,dword ptr [ebp-8]
006EA485        lea         edx,[eax+30];TBLHeli.FEep_ESC_Layout:TESC_Layout
006EA488        mov         eax,dword ptr [ebp-4]
006EA48B        add         eax,40
006EA48E        mov         ecx,20
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
# 这里是版本号
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
# 子版本号
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
# ESC名字，说明这里就是实际显示的参数了
006EA56C        lea         edx,[eax+70];TBLHeli.FEep_Name:TESC_Name
006EA56F        lea         eax,[ebx+80]
006EA575        mov         ecx,10
006EA57A        call        Move
006EA57F        movzx       eax,byte ptr [ebx+32]
006EA583        mov         edx,dword ptr [ebp-8]
# LED的使能
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
# 电压
006EA5EE        mov         byte ptr [edx+26],al;TBLHeli.FEep_Hw_Voltage_Sense_Capable:byte
006EA5F1        movzx       eax,byte ptr [ebx+31]
006EA5F5        mov         edx,dword ptr [ebp-8]
# 电流
006EA5F8        mov         byte ptr [edx+27],al;TBLHeli.FEep_Hw_Current_Sense_Capable:byte
006EA5FB        mov         eax,dword ptr [ebp-8]
006EA5FE        cmp         byte ptr [eax+6],29;TBLHeli.FEep_Layout_Revision:byte
006EA602>       jb          006EA633
006EA604        movzx       eax,byte ptr [ebx+3F]
006EA608        mov         edx,dword ptr [ebp-8]
# e2p 无阻尼？
006EA60B        mov         byte ptr [edx+2F],al;TBLHeli.FEep_Nondamped_Capable:byte
006EA60E        movzx       eax,byte ptr [ebx+1C]
006EA612        mov         edx,dword ptr [ebp-8]
# e2p note 配置？
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
# e2p 版本号
006EA644        cmp         byte ptr [eax+6],2C;TBLHeli.FEep_Layout_Revision:byte
006EA648>       jb          006EA66C
006EA64A        cmp         byte ptr [ebx+36],0FF
006EA64E>       jae         006EA66C
006EA650        cmp         byte ptr [ebx+37],0FF
006EA654>       jae         006EA66C
006EA656        movzx       eax,byte ptr [ebx+36]
006EA65A        mov         edx,dword ptr [ebp-8]
# 最大最小PWM 频率
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
# 刹车
006EA724        call        TBLHeli.IsProgrammableBrakeForceCapable
006EA729        test        al,al
006EA72B>       jne         006EA748
006EA72D        mov         dl,11
006EA72F        mov         eax,dword ptr [ebp-8]
# 获取最小参数
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
006EA8BE>       jmp         006EA905
006EA8C0        lea         eax,[ebp-50]
006EA8C3        push        eax
006EA8C4        lea         edx,[ebp-54]
006EA8C7        mov         eax,dword ptr [ebp-8]
006EA8CA        call        006E6634
006EA8CF        mov         eax,dword ptr [ebp-54]
006EA8D2        mov         dword ptr [ebp-20],eax
006EA8D5        mov         byte ptr [ebp-1C],11
006EA8D9        lea         eax,[ebp-20]
006EA8DC        push        eax
006EA8DD        lea         edx,[ebp-58]
006EA8E0        mov         eax,[00840EF0];^SResString426:TResStringRec
006EA8E5        call        LoadResString
006EA8EA        mov         eax,dword ptr [ebp-58]
006EA8ED        xor         ecx,ecx
006EA8EF        pop         edx
006EA8F0        call        006D5800
006EA8F5        mov         edx,dword ptr [ebp-50]
006EA8F8        mov         eax,dword ptr [ebp-8]
006EA8FB        add         eax,0BC;TBLHeli.FErrMsg:string
006EA900        call        @UStrAsg
006EA905        cmp         byte ptr [ebp-0E],4
006EA909>       jb          006EA936
006EA90B        call        006DB734
006EA910        test        al,al
006EA912>       je          006EA922
006EA914        mov         eax,dword ptr [ebp-8]
006EA917        mov         eax,dword ptr [eax+0BC];TBLHeli.FErrMsg:string
006EA91D        call        006DBFB4
006EA922        cmp         byte ptr [ebp-0D],0
006EA926>       je          006EA936
006EA928        mov         eax,dword ptr [ebp-8]
006EA92B        mov         eax,dword ptr [eax+0BC];TBLHeli.FErrMsg:string
006EA931        call        006DF680
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



## Summary

未完待续....



## Quote

>https://www.52pojie.cn/thread-615448-1-1.html
>
>http://www.youngroe.com/2019/07/01/Windows/delphi_reverse_summary/
---
layout:     post
title:      "BLHeliSuite32逆向"
subtitle:   "Crack，Reverse"
date:       2021-07-07
update:     2021-07-13
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

第一步是查壳，看看BLH到底是啥写的。

这里出现了问号，说明这个东西可能不准确，还要再查

![image-20210708174454402](https://i.loli.net/2021/07/08/sg8rfFEcya5IbeU.png)

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
# 这里应该是一些ui的设置
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



继续追

```assembly
_Unit139.TBLHeliInterfaceManager.DoBtnReadSetup
007CA1F8        push        ebx
007CA1F9        mov         ebx,eax
007CA1FB        mov         dl,1
007CA1FD        mov         eax,ebx
# 这里是开始连接
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
# 这里面检测了是否连接，并且保持连接
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
# 这里是log的显示内容 在拼字符串
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
# 将信息显示到控件
# 经过OD调试，发现拿到数据以后，在运行了TBLHeliInterfaceManager.SetupToControls之后UI就更新了，所以数据解析就在这个里面
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
# 这里符合log的显示
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
# 这里不知道是什么口，可能是4way-if
007D85F8        call        TUniSerialInterface.Send_cmd_DeviceReadBLHeliSetupSection
007D85FD        mov         byte ptr [ebp-9],al
007D8600>       jmp         007D8632
# OD动态调试，发现走到了这里，也就是按照BLB类型进行读取了
007D8602        mov         eax,dword ptr [ebp-8]
007D8605        lea         edx,[eax+32C];TBLHeliInterfaceManager.FLastReadSetupMem:TArray<System.Byte>
007D860B        mov         eax,dword ptr [ebp-8]
007D860E        mov         eax,dword ptr [eax+48];TBLHeliInterfaceManager.FBLBInterf:TBLBInterface
# 由于log显示我的esc是BLB Connect to ESC，所以这里应该走的是下面这个调用
# 这里BLB其实就是指对应的电调类型，对应的就是BetaFlight或者CleanFlight之类的实现，实际上平常的也是这种方式
007D8611        call        TBLBInterface.Send_cmd_DeviceReadBLHeliSetupSection
# OD调试，发现当Send_cmd_DeviceReadBLHeliSetupSection执行完成以后，256字节就读取上来了，所以要追他
007D8616        mov         byte ptr [ebp-9],al
007D8619>       jmp         007D8632
007D861B        mov         eax,dword ptr [ebp-8]
007D861E        lea         edx,[eax+32C];TBLHeliInterfaceManager.FLastReadSetupMem:TArray<System.Byte>
007D8624        mov         eax,dword ptr [ebp-8]
007D8627        mov         eax,dword ptr [eax+4C];TBLHeliInterfaceManager.FCfIntf:TFlightCtrlIntf
# 最后这个FlightCtr 估计是直接控制电调的那种接口方式了
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
# al中是返回值
007D866C        cmp         al,4
# 大于等于4就跳转到007D87AD
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



##### Send_cmd_DeviceReadBLHeliSetupSection

```assembly
_Unit108.TBLBInterface.Send_cmd_DeviceReadBLHeliSetupSection
00708184        push        ebx
00708185        push        esi
00708186        mov         esi,edx
00708188        mov         ebx,eax
0070818A        push        100
0070818F        mov         eax,ebx
00708191        call        00709B08
00708196        call        006D7C34
0070819B        mov         ecx,eax
0070819D        mov         edx,esi
0070819F        mov         eax,ebx
# 所以还是追他的TBLBInterface.Send_cmd_DeviceReadFlash
007081A1        call        TBLBInterface.Send_cmd_DeviceReadFlash
007081A6        pop         esi
007081A7        pop         ebx
007081A8        ret

```



##### Send_cmd_DeviceReadFlash

追一下BLB的读flash操作

```assembly
_Unit108.TBLBInterface.Send_cmd_DeviceReadFlash
007081AC        push        ebp
007081AD        mov         ebp,esp
007081AF        push        ecx
007081B0        mov         ecx,4
007081B5        push        0
007081B7        push        0
007081B9        dec         ecx
007081BA>       jne         007081B5
007081BC        xchg        ecx,dword ptr [ebp-4]
007081BF        push        ebx
007081C0        push        esi
007081C1        mov         esi,ecx
007081C3        mov         dword ptr [ebp-8],edx
007081C6        mov         dword ptr [ebp-4],eax
007081C9        mov         ebx,dword ptr [ebp+8]
007081CC        xor         eax,eax
007081CE        push        ebp
007081CF        push        708383
007081D4        push        dword ptr fs:[eax]
007081D7        mov         dword ptr fs:[eax],esp
007081DA        mov         eax,dword ptr [ebp-8]
007081DD        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
007081E3        call        @DynArrayClear
007081E8        mov         byte ptr [ebp-9],0
007081EC        mov         eax,dword ptr [ebp-4]
007081EF        call        00709B68
007081F4        test        al,al
007081F6>       je          00708345
007081FC        call        006DB734
00708201        test        al,al
00708203>       je          00708219
# 依然符合log的显示
00708205        mov         eax,7083A4;'cmd_DeviceReadFlash:'
0070820A        call        006DBF8C
0070820F        mov         eax,1
00708214        call        006DBF4C
00708219        xor         edx,edx
0070821B        push        ebp
0070821C        push        70833B
00708221        push        dword ptr fs:[edx]
00708224        mov         dword ptr fs:[edx],esp
00708227        mov         eax,dword ptr [ebp-4]
0070822A        call        00709C84
0070822F        lea         eax,[ebp-10]
00708232        push        eax
00708233        mov         eax,dword ptr [ebp-4]
00708236        mov         eax,dword ptr [eax+40];TBLBInterface.FBootloader:TBootloader
00708239        mov         ecx,ebx
0070823B        mov         edx,esi
# 主要是这里读flash
0070823D        call        TBootloader.ReadFlash
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
007082A3>       je          007082E5
007082A5        push        7083DC;'"'
007082AA        lea         edx,[ebp-18]
007082AD        mov         eax,dword ptr [ebp-8]
007082B0        mov         eax,dword ptr [eax]
007082B2        call        006D5B9C
007082B7        push        dword ptr [ebp-18]
007082BA        push        7083DC;'"'
007082BF        lea         eax,[ebp-14]
007082C2        mov         edx,3
007082C7        call        @UStrCatN
007082CC        mov         eax,dword ptr [ebp-14]
007082CF        call        006DBFDC
007082D4        mov         eax,dword ptr [ebp-8]
007082D7        mov         eax,dword ptr [eax]
007082D9        mov         ecx,800
007082DE        mov         dl,1
007082E0        call        006DC174
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



TBootloader.ReadFlash，接着就是读Flash的操作了

```assembly
_Unit108.TBootloader.ReadFlash
00702C04        push        ebp
00702C05        mov         ebp,esp
00702C07        add         esp,0FFFFFFC4
00702C0A        push        ebx
00702C0B        push        esi
00702C0C        push        edi
00702C0D        xor         ebx,ebx
00702C0F        mov         dword ptr [ebp-30],ebx
00702C12        mov         dword ptr [ebp-3C],ebx
00702C15        mov         dword ptr [ebp-2C],ebx
00702C18        mov         dword ptr [ebp-24],ebx
00702C1B        mov         dword ptr [ebp-28],ebx
00702C1E        mov         dword ptr [ebp-20],ebx
00702C21        mov         dword ptr [ebp-4],ebx
00702C24        mov         esi,ecx
00702C26        mov         ebx,edx
00702C28        mov         dword ptr [ebp-8],eax
00702C2B        xor         eax,eax
00702C2D        push        ebp
00702C2E        push        702EB0
00702C33        push        dword ptr fs:[eax]
00702C36        mov         dword ptr fs:[eax],esp
00702C39        mov         eax,dword ptr [ebp+8]
00702C3C        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00702C42        call        @DynArrayClear
00702C47        mov         eax,dword ptr [ebp-8]
00702C4A        call        00703D94
00702C4F        test        al,al
00702C51>       je          00702E69
00702C57        mov         dword ptr [ebp-14],100
00702C5E        mov         eax,dword ptr [ebp-8]
00702C61        call        007040E8
00702C66        movzx       eax,si
00702C69        mov         dword ptr [ebp-10],eax
00702C6C        cmp         dword ptr [ebp-10],0
00702C70>       jne         00702C7B
00702C72        mov         eax,dword ptr [ebp-8]
00702C75        mov         eax,dword ptr [eax+70];TBootloader.FDeviceInfo:TDeviceInfo
00702C78        mov         dword ptr [ebp-10],eax
00702C7B        push        0
00702C7D        push        0
00702C7F        push        1
00702C81        cmp         dword ptr [ebp-10],100
00702C88        setg        dl
00702C8B        xor         ecx,ecx
00702C8D        mov         eax,dword ptr [ebp-10]
00702C90        call        006F5090
00702C95        mov         byte ptr [ebp-15],al
00702C98        xor         eax,eax
00702C9A        mov         dword ptr [ebp-0C],eax
00702C9D        xor         eax,eax
00702C9F        push        ebp
00702CA0        push        702E62
00702CA5        push        dword ptr fs:[eax]
00702CA8        mov         dword ptr fs:[eax],esp
00702CAB        lea         edx,[ebp-20]
00702CAE        mov         eax,702ECC;'Reading Flash...'
00702CB3        call        006D5894
00702CB8        mov         eax,dword ptr [ebp-20]
00702CBB        call        006F5154
00702CC0        mov         word ptr [ebp-18],bx
00702CC4        mov         edi,dword ptr [ebp-10]
00702CC7        cmp         edi,dword ptr [ebp-14]
00702CCA>       jle         00702CCF
00702CCC        mov         edi,dword ptr [ebp-14]
00702CCF        cmp         edi,100
00702CD5>       jne         00702CDB
00702CD7        xor         ebx,ebx
00702CD9>       jmp         00702CDD
00702CDB        mov         ebx,edi
00702CDD        xor         esi,esi
00702CDF        xor         eax,eax
00702CE1        mov         dword ptr [ebp-0C],eax
00702CE4        movzx       edx,word ptr [ebp-18]
00702CE8        mov         eax,dword ptr [ebp-8]
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
# 检测是否有ack
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
00702D88>       jmp         00702DA6
00702D8A        inc         esi
00702D8B        call        006DB734
00702D90        test        al,al
00702D92>       je          00702DA6
00702D94        or          ecx,0FFFFFFFF
00702D97        mov         edx,0FF
00702D9C        mov         eax,702F3C;'FAILED'
00702DA1        call        006DBD18
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
00702DD7        call        @DynArrayAsg
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



###### SendCMDSetAddress

继续追

```assembly
_Unit108.TBootloader.SendCMDSetAddress
00705A44        push        ebp
00705A45        mov         ebp,esp
00705A47        xor         ecx,ecx
00705A49        push        ecx
00705A4A        push        ecx
00705A4B        push        ecx
00705A4C        push        ecx
00705A4D        push        ecx
00705A4E        push        ebx
00705A4F        push        esi
00705A50        mov         esi,edx
00705A52        mov         ebx,eax
00705A54        xor         eax,eax
00705A56        push        ebp
00705A57        push        705B54
00705A5C        push        dword ptr fs:[eax]
00705A5F        mov         dword ptr fs:[eax],esp
00705A62        call        006DB734
00705A67        test        al,al
00705A69>       je          00705ABA
00705A6B        lea         ecx,[ebp-4]
00705A6E        mov         dl,0FF
00705A70        mov         eax,ebx
00705A72        call        0070608C
00705A77        mov         eax,dword ptr [ebp-4]
00705A7A        call        006DC040
# 这里是在拼字符串，显示设置的地址是什么
00705A7F        push        705B70;' ($'
00705A84        lea         ecx,[ebp-0C]
00705A87        mov         edx,4
00705A8C        mov         eax,esi
00705A8E        call        IntToHex
00705A93        push        dword ptr [ebp-0C]
00705A96        push        705B84;') : '
00705A9B        lea         eax,[ebp-8]
00705A9E        mov         edx,3
00705AA3        call        @UStrCatN
00705AA8        mov         eax,dword ptr [ebp-8]
00705AAB        call        006DC004
00705AB0        mov         eax,1
00705AB5        call        006DBF4C
00705ABA        mov         byte ptr [ebx+0B4],0FF;TBootloader.FLastCMD:byte
00705AC1        movzx       eax,byte ptr [ebx+0B4];TBootloader.FLastCMD:byte
00705AC8        mov         byte ptr [ebp-14],al
00705ACB        mov         eax,esi
00705ACD        shr         eax,10
00705AD0        mov         byte ptr [ebp-13],al
00705AD3        mov         eax,esi
00705AD5        shr         eax,8
00705AD8        mov         byte ptr [ebp-12],al
00705ADB        mov         eax,esi
00705ADD        mov         byte ptr [ebp-11],al
00705AE0        lea         eax,[ebp-14]
00705AE3        lea         ecx,[ebp-10]
00705AE6        mov         edx,3
00705AEB        call        006D59C4
00705AF0        mov         edx,dword ptr [ebp-10]
00705AF3        mov         eax,ebx
# 发送CRC
00705AF5        call        TBootloader.SendStrCRC
00705AFA        test        al,al
00705AFC>       je          00705B09
00705AFE        mov         eax,ebx
# 等待ACK
00705B00        call        TBootloader.CheckAck
00705B05        test        al,al
00705B07>       jne         00705B0D
00705B09        xor         eax,eax
00705B0B>       jmp         00705B0F
00705B0D        mov         al,1
00705B0F        mov         ebx,eax
00705B11        call        006DB734
00705B16        test        al,al
00705B18>       je          00705B2B
00705B1A        mov         eax,1
00705B1F        call        006DBF64
00705B24        mov         eax,ebx
00705B26        call        006DBE1C
00705B2B        xor         eax,eax
00705B2D        pop         edx
00705B2E        pop         ecx
00705B2F        pop         ecx
00705B30        mov         dword ptr fs:[eax],edx
00705B33        push        705B5B
00705B38        lea         eax,[ebp-10]
00705B3B        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00705B41        call        @DynArrayClear
00705B46        lea         eax,[ebp-0C]
00705B49        mov         edx,3
00705B4E        call        @UStrArrayClr
00705B53        ret
00705B54>       jmp         @HandleFinally
00705B59>       jmp         00705B38
00705B5B        mov         eax,ebx
00705B5D        pop         esi
00705B5E        pop         ebx
00705B5F        mov         esp,ebp
00705B61        pop         ebp
00705B62        ret

```



###### SendCMDFlashRead

flash读

```assembly
_Unit108.TBootloader.SendCMDFlashRead
007051BC        push        ebx
007051BD        xor         ecx,ecx
007051BF        movzx       ebx,byte ptr [eax+0DC];TBootloader.FDeviceBrand:TFirmwareBrand
007051C6        cmp         bl,3
007051C9>       jne         007051D8
007051CB        mov         ecx,edx
007051CD        mov         dl,3
# 先发送读命令，这里应该是根据传入的参数，决定如何传参给发送参数命令
# 经过OD动态调试，发现实际上调用的就是第一个TBootloader.SendCMD_Param
007051CF        call        TBootloader.SendCMD_Param
007051D4        mov         ecx,eax
007051D6>       jmp         007051FA
007051D8        cmp         bl,1
007051DB>       jne         007051EA
007051DD        mov         ecx,edx
007051DF        mov         dl,3
007051E1        call        TBootloader.SendCMD_Param
007051E6        mov         ecx,eax
007051E8>       jmp         007051FA
007051EA        cmp         bl,2
007051ED>       jne         007051FA
007051EF        mov         ecx,edx
007051F1        mov         dl,7
007051F3        call        TBootloader.SendCMD_Param
007051F8        mov         ecx,eax
007051FA        mov         eax,ecx
007051FC        pop         ebx
007051FD        ret


```



###### SendCMD_Param

```assembly
_Unit108.TBootloader.SendCMD_Param
00704D80        push        ebp
00704D81        mov         ebp,esp
00704D83        push        0
00704D85        push        0
00704D87        push        0
00704D89        push        0
00704D8B        push        0
00704D8D        push        0
00704D8F        push        0
00704D91        push        ebx
00704D92        push        esi
00704D93        push        edi
00704D94        mov         ebx,ecx
00704D96        mov         byte ptr [ebp-5],dl
00704D99        mov         dword ptr [ebp-4],eax
00704D9C        xor         eax,eax
00704D9E        push        ebp
00704D9F        push        704F66
00704DA4        push        dword ptr fs:[eax]
00704DA7        mov         dword ptr fs:[eax],esp
00704DAA        call        006DB734
00704DAF        test        al,al
00704DB1>       je          00704E06
00704DB3        lea         ecx,[ebp-0C]
00704DB6        movzx       edx,byte ptr [ebp-5]
00704DBA        mov         eax,dword ptr [ebp-4]
00704DBD        call        0070608C
00704DC2        mov         eax,dword ptr [ebp-0C]
00704DC5        call        006DC040
# 这里是在拼地址
00704DCA        push        704F84;'[$'
00704DCF        lea         ecx,[ebp-14]
00704DD2        movzx       eax,bl
00704DD5        mov         edx,2
00704DDA        call        IntToHex
00704DDF        push        dword ptr [ebp-14]
00704DE2        push        704F98;']'
00704DE7        lea         eax,[ebp-10]
00704DEA        mov         edx,3
00704DEF        call        @UStrCatN
00704DF4        mov         eax,dword ptr [ebp-10]
00704DF7        call        006DC054
00704DFC        mov         eax,1
00704E01        call        006DBF4C
00704E06        xor         eax,eax
00704E08        push        ebp
00704E09        push        704E61
00704E0E        push        dword ptr fs:[eax]
00704E11        mov         dword ptr fs:[eax],esp
00704E14        mov         eax,dword ptr [ebp-4]
00704E17        movzx       edx,byte ptr [ebp-5]
00704E1B        mov         byte ptr [eax+0B4],dl;TBootloader.FLastCMD:byte
00704E21        mov         eax,dword ptr [ebp-4]
00704E24        mov         byte ptr [eax+0B5],bl;TBootloader.FLastCMDParam:Byte
00704E2A        lea         ecx,[ebp-18]
00704E2D        mov         eax,dword ptr [ebp-4]
00704E30        movzx       eax,byte ptr [eax+0B4];TBootloader.FLastCMD:byte
00704E37        mov         byte ptr [ebp-1C],al
00704E3A        mov         byte ptr [ebp-1B],bl
00704E3D        lea         eax,[ebp-1C]
00704E40        mov         edx,1
00704E45        call        006D59C4
00704E4A        mov         edx,dword ptr [ebp-18]
00704E4D        mov         eax,dword ptr [ebp-4]
# 发送crc
00704E50        call        TBootloader.SendStrCRC
00704E55        mov         ebx,eax
00704E57        xor         eax,eax
00704E59        pop         edx
00704E5A        pop         ecx
00704E5B        pop         ecx
00704E5C        mov         dword ptr fs:[eax],edx
00704E5F>       jmp         00704E6D
00704E61>       jmp         @HandleAnyException
00704E66        xor         ebx,ebx
00704E68        call        @DoneExcept
00704E6D        test        bl,bl
00704E6F>       jne         00704E9F
00704E71        call        006DB734
00704E76        test        al,al
00704E78>       je          00704F3D
00704E7E        mov         eax,1
00704E83        call        006DBF64
00704E88        or          ecx,0FFFFFFFF
00704E8B        mov         edx,0FF
00704E90        mov         eax,704FA8;'FAILED'
00704E95        call        006DBD18
00704E9A>       jmp         00704F3D
00704E9F        movzx       edx,byte ptr [ebp-5]
00704EA3        mov         eax,dword ptr [ebp-4]
# 这里应该是根据命令区分了到底需不需要ack，有的不需要等ack
00704EA6        call        TBootloader.CMDNeedsNoACK
00704EAB        test        al,al
00704EAD>       je          00704EDA
00704EAF        call        006DB734
00704EB4        test        al,al
00704EB6>       je          00704F3D
00704EBC        mov         eax,1
00704EC1        call        006DBF64
00704EC6        or          ecx,0FFFFFFFF
00704EC9        mov         edx,8000
00704ECE        mov         eax,704FC4;'OK'
00704ED3        call        006DBD18
00704ED8>       jmp         00704F3D
00704EDA        movzx       edx,byte ptr [ebp-5]
00704EDE        mov         eax,dword ptr [ebp-4]
00704EE1        call        TBootloader.CMDNeedsSimpleACK
00704EE6        test        al,al
00704EE8>       je          00704F33
00704EEA        mov         eax,dword ptr [ebp-4]
# 需要ack的这里进行检测
00704EED        call        TBootloader.CheckAck
00704EF2        mov         ebx,eax
00704EF4        call        006DB734
00704EF9        test        al,al
00704EFB>       je          00704F3D
00704EFD        mov         eax,1
00704F02        call        006DBF64
00704F07        test        bl,bl
00704F09>       je          00704F1F
00704F0B        or          ecx,0FFFFFFFF
00704F0E        mov         edx,8000
00704F13        mov         eax,704FC4;'OK'
00704F18        call        006DBD18
00704F1D>       jmp         00704F3D
00704F1F        or          ecx,0FFFFFFFF
00704F22        mov         edx,0FF
00704F27        mov         eax,704FA8;'FAILED'
00704F2C        call        006DBD18
00704F31>       jmp         00704F3D
00704F33        mov         eax,1
00704F38        call        006DBF64
00704F3D        xor         eax,eax
00704F3F        pop         edx
00704F40        pop         ecx
00704F41        pop         ecx
00704F42        mov         dword ptr fs:[eax],edx
00704F45        push        704F6D
00704F4A        lea         eax,[ebp-18]
00704F4D        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00704F53        call        @DynArrayClear
00704F58        lea         eax,[ebp-14]
00704F5B        mov         edx,3
00704F60        call        @UStrArrayClr
00704F65        ret
00704F66>       jmp         @HandleFinally
00704F6B>       jmp         00704F4A
00704F6D        mov         eax,ebx
00704F6F        pop         edi
00704F70        pop         esi
00704F71        pop         ebx
00704F72        mov         esp,ebp
00704F74        pop         ebp
00704F75        ret

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



### 心跳维持

TBLHeliInterfaceManager.DeviceConnected 这个函数被调用的太频繁了，猜测这个是用来维持心跳的

```assembly
_Unit139.TBLHeliInterfaceManager.DeviceConnected
007CCCB0        xor         edx,edx
007CCCB2        movzx       ecx,byte ptr [eax+55];TBLHeliInterfaceManager.FESCInterfaceType:TESCInterfaceType
007CCCB6        sub         cl,0C
007CCCB9>       je          007CCCC5
007CCCBB        dec         cl
007CCCBD>       je          007CCCCF
007CCCBF        dec         cl
007CCCC1>       je          007CCCDC
007CCCC3>       jmp         007CCCE6
007CCCC5        mov         eax,dword ptr [eax+50];TBLHeliInterfaceManager.FUniSerialInterf:TUniSerialInterface
007CCCC8        movzx       edx,byte ptr [eax+4C];TUniSerialInterface.FDeviceConnected:Boolean
007CCCCC        mov         eax,edx
007CCCCE        ret
007CCCCF        mov         eax,dword ptr [eax+48];TBLHeliInterfaceManager.FBLBInterf:TBLBInterface
007CCCD2        call        00709A58
007CCCD7        mov         edx,eax
007CCCD9        mov         eax,edx
007CCCDB        ret
007CCCDC        mov         eax,dword ptr [eax+4C];TBLHeliInterfaceManager.FCfIntf:TFlightCtrlIntf
007CCCDF        call        007166E4
007CCCE4        mov         edx,eax
007CCCE6        mov         eax,edx
007CCCE8        ret

```

可以看到这里应该是判定具体是啥接口，然后对应接口发送



DeviceConnectionAlive 这个明显就是发送命令，维持在线了

```assembly
_Unit108.TBLBInterface.DeviceConnectionAlive
00709108        push        ebx
00709109        push        esi
0070910A        mov         esi,eax
0070910C        mov         eax,dword ptr [esi+40];TBLBInterface.FBootloader:TBootloader
0070910F        call        00703D94
00709114        test        al,al
00709116>       je          00709132
00709118        mov         eax,esi
0070911A        call        00709C84
0070911F        mov         eax,dword ptr [esi+40];TBLBInterface.FBootloader:TBootloader
00709122        call        TBootloader.SendCMDKeepAlive
00709127        mov         ebx,eax
00709129        mov         eax,esi
0070912B        call        00709C6C
00709130>       jmp         00709134
00709132        xor         ebx,ebx
00709134        mov         eax,ebx
00709136        pop         esi
00709137        pop         ebx
00709138        ret

```

SendCMDKeepAlive 这里完全是底层TBootloader的实现了

```assembly
_Unit108.TBootloader.SendCMDKeepAlive
# ebx 入栈
0070559C        push        ebx
# ebx = eax
0070559D        mov         ebx,eax
# 这里实际上是从内存85C678读了一个什么东西到eax
0070559F        call        006DB734
# test = al & al 这里应该是一个断言检测
007055A4        test        al,al
# 根据test导致的ZF标记决定跳转，这个跳转应该是退出函数了
007055A6>       je          007055D5
007055A8        mov         eax,[0084158C];^gvar_0085C668
007055AD        cmp         dword ptr [eax],4
007055B0>       jge         007055B7
007055B2        call        006DB87C
007055B7        xor         ecx,ecx
# 看到这个FD 这不就是保持在线的FD00嘛，下面的发送参数应该是自动做了一个CRC，把校验加到了后面
007055B9        mov         dl,0FD
007055BB        mov         eax,ebx
007055BD        call        TBootloader.SendCMD_Param
007055C2        mov         ebx,eax
007055C4        mov         eax,[0084158C];^gvar_0085C668
007055C9        cmp         dword ptr [eax],4
007055CC>       jge         007055E2
007055CE        call        006DB89C
007055D3>       jmp         007055E2
# ecx 异或 ecx 直接=0
007055D5        xor         ecx,ecx
# dl = 0xFD
007055D7        mov         dl,0FD
# eax = ebx 这里应该是恢复了eax的值，之前由ebx存着
007055D9        mov         eax,ebx
# 调用发送参数
007055DB        call        TBootloader.SendCMD_Param
# 这两句感觉好像没用
007055E0        mov         ebx,eax
007055E2        mov         eax,ebx
# 把ebx给恢复回来
007055E4        pop         ebx
007055E5        ret

```



### SendCMD_Param

看一下这个底层，到底是怎么实现的

```assembly
_Unit108.TBootloader.SendCMD_Param
00704D80        push        ebp
00704D81        mov         ebp,esp
00704D83        push        0
00704D85        push        0
00704D87        push        0
00704D89        push        0
00704D8B        push        0
00704D8D        push        0
00704D8F        push        0
00704D91        push        ebx
00704D92        push        esi
00704D93        push        edi
00704D94        mov         ebx,ecx
00704D96        mov         byte ptr [ebp-5],dl
00704D99        mov         dword ptr [ebp-4],eax
00704D9C        xor         eax,eax
00704D9E        push        ebp
00704D9F        push        704F66
00704DA4        push        dword ptr fs:[eax]
00704DA7        mov         dword ptr fs:[eax],esp
00704DAA        call        006DB734
00704DAF        test        al,al
00704DB1>       je          00704E06
00704DB3        lea         ecx,[ebp-0C]
00704DB6        movzx       edx,byte ptr [ebp-5]
00704DBA        mov         eax,dword ptr [ebp-4]
00704DBD        call        0070608C
00704DC2        mov         eax,dword ptr [ebp-0C]
00704DC5        call        006DC040
00704DCA        push        704F84;'[$'
00704DCF        lea         ecx,[ebp-14]
00704DD2        movzx       eax,bl
00704DD5        mov         edx,2
00704DDA        call        IntToHex
00704DDF        push        dword ptr [ebp-14]
00704DE2        push        704F98;']'
00704DE7        lea         eax,[ebp-10]
00704DEA        mov         edx,3
00704DEF        call        @UStrCatN
00704DF4        mov         eax,dword ptr [ebp-10]
00704DF7        call        006DC054
00704DFC        mov         eax,1
00704E01        call        006DBF4C
00704E06        xor         eax,eax
00704E08        push        ebp
00704E09        push        704E61
00704E0E        push        dword ptr fs:[eax]
00704E11        mov         dword ptr fs:[eax],esp
00704E14        mov         eax,dword ptr [ebp-4]
00704E17        movzx       edx,byte ptr [ebp-5]
00704E1B        mov         byte ptr [eax+0B4],dl;TBootloader.FLastCMD:byte
00704E21        mov         eax,dword ptr [ebp-4]
00704E24        mov         byte ptr [eax+0B5],bl;TBootloader.FLastCMDParam:Byte
00704E2A        lea         ecx,[ebp-18]
00704E2D        mov         eax,dword ptr [ebp-4]
00704E30        movzx       eax,byte ptr [eax+0B4];TBootloader.FLastCMD:byte
00704E37        mov         byte ptr [ebp-1C],al
00704E3A        mov         byte ptr [ebp-1B],bl
00704E3D        lea         eax,[ebp-1C]
00704E40        mov         edx,1
00704E45        call        006D59C4
00704E4A        mov         edx,dword ptr [ebp-18]
00704E4D        mov         eax,dword ptr [ebp-4]
00704E50        call        TBootloader.SendStrCRC
00704E55        mov         ebx,eax
00704E57        xor         eax,eax
00704E59        pop         edx
00704E5A        pop         ecx
00704E5B        pop         ecx
00704E5C        mov         dword ptr fs:[eax],edx
00704E5F>       jmp         00704E6D
00704E61>       jmp         @HandleAnyException
00704E66        xor         ebx,ebx
00704E68        call        @DoneExcept
00704E6D        test        bl,bl
00704E6F>       jne         00704E9F
00704E71        call        006DB734
00704E76        test        al,al
00704E78>       je          00704F3D
00704E7E        mov         eax,1
00704E83        call        006DBF64
00704E88        or          ecx,0FFFFFFFF
00704E8B        mov         edx,0FF
00704E90        mov         eax,704FA8;'FAILED'
00704E95        call        006DBD18
00704E9A>       jmp         00704F3D
00704E9F        movzx       edx,byte ptr [ebp-5]
00704EA3        mov         eax,dword ptr [ebp-4]
00704EA6        call        TBootloader.CMDNeedsNoACK
00704EAB        test        al,al
00704EAD>       je          00704EDA
00704EAF        call        006DB734
00704EB4        test        al,al
00704EB6>       je          00704F3D
00704EBC        mov         eax,1
00704EC1        call        006DBF64
00704EC6        or          ecx,0FFFFFFFF
00704EC9        mov         edx,8000
00704ECE        mov         eax,704FC4;'OK'
00704ED3        call        006DBD18
00704ED8>       jmp         00704F3D
00704EDA        movzx       edx,byte ptr [ebp-5]
00704EDE        mov         eax,dword ptr [ebp-4]
00704EE1        call        TBootloader.CMDNeedsSimpleACK
00704EE6        test        al,al
00704EE8>       je          00704F33
00704EEA        mov         eax,dword ptr [ebp-4]
00704EED        call        TBootloader.CheckAck
00704EF2        mov         ebx,eax
00704EF4        call        006DB734
00704EF9        test        al,al
00704EFB>       je          00704F3D
00704EFD        mov         eax,1
00704F02        call        006DBF64
00704F07        test        bl,bl
00704F09>       je          00704F1F
00704F0B        or          ecx,0FFFFFFFF
00704F0E        mov         edx,8000
00704F13        mov         eax,704FC4;'OK'
00704F18        call        006DBD18
00704F1D>       jmp         00704F3D
00704F1F        or          ecx,0FFFFFFFF
00704F22        mov         edx,0FF
00704F27        mov         eax,704FA8;'FAILED'
00704F2C        call        006DBD18
00704F31>       jmp         00704F3D
00704F33        mov         eax,1
00704F38        call        006DBF64
00704F3D        xor         eax,eax
00704F3F        pop         edx
00704F40        pop         ecx
00704F41        pop         ecx
00704F42        mov         dword ptr fs:[eax],edx
00704F45        push        704F6D
00704F4A        lea         eax,[ebp-18]
00704F4D        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00704F53        call        @DynArrayClear
00704F58        lea         eax,[ebp-14]
00704F5B        mov         edx,3
00704F60        call        @UStrArrayClr
00704F65        ret
00704F66>       jmp         @HandleFinally
00704F6B>       jmp         00704F4A
00704F6D        mov         eax,ebx
00704F6F        pop         edi
00704F70        pop         esi
00704F71        pop         ebx
00704F72        mov         esp,ebp
00704F74        pop         ebp
00704F75        ret

```

到这里基本走不下去了，已经越来越复杂了，关键还是看不到最终实现加密的逻辑，很迷惑



## 框架

边反编译，边看一下程序的框架。



TBootloader 是各种接口下，最底层的协议，主要是读写Flash和E2PROM



## Logged Messages

把BLH的log功能打开

![image-20210708194723871](https://i.loli.net/2021/07/08/5jQ9DUfCwYgr3t1.png)



然后就能看到右侧窗口的日志了，不得不说这个日志有点东西，这个树状结构挺好的

![image-20210708194624122](https://i.loli.net/2021/07/08/vBVFR2uGHo5ltxP.png)

![image-20210708194648621](https://i.loli.net/2021/07/08/VZ1JP7CNiX3Ub4Y.png)

仔细一看这里实际上走的是BLB的模式，而不是UniSerial（我第一次追错地方了），也就是说我前面追的代码不太对。特别好的是这个树状结构其实和我从汇编里看到的调用层次是一致的。

然后这里还能看到对应的地址信息，第一次读的地址是0x7C00，第二次是0xEB00，第三次是0xF7AC。

之前的文章里说过只有第一次读取的信息有用，而后两次信息基本不包括设置参数，从这里就能看到，第二次读取的是激活状态信息，第三次是又读了一次Flash信息，只是具体有啥用没有说明。



## Summary

未完待续....



## Quote

>https://www.52pojie.cn/thread-615448-1-1.html
>
>http://www.youngroe.com/2019/07/01/Windows/delphi_reverse_summary/
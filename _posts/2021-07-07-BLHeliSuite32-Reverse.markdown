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

#### ReadSetupAll

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
# 1.这里会跳转到下面，这里之前全都是顺序执行的
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
# 1.从上面跳到这里，继续往下执行
007D5B31        movzx       edx,byte ptr [ebp-5]
007D5B35        mov         eax,dword ptr [ebp-4]
# 读取设置信息，这里就读到了256字节了
007D5B38        call        TBLHeliInterfaceManager.ReadDeviceSetupSection
007D5B3D        mov         byte ptr [ebp-7],al
007D5B40        mov         eax,dword ptr [ebp-4]
# 存储信息，这里意义不明，可能需要追看
007D5B43        call        TBLHeliInterfaceManager.BLHeliStored
007D5B48        mov         edx,dword ptr [ebp-4]
007D5B4B        mov         edx,dword ptr [edx+44];TBLHeliInterfaceManager.FBLHeliWork:TBLHeli
007D5B4E        movzx       ecx,byte ptr ds:[7D5CE0];0x3 gvar_007D5CE0
# 这里这个CopyTo是什么东西，也有可能是处理数据的地方
007D5B55        call        TBLHeli.CopyTo
007D5B5A        mov         eax,dword ptr [ebp-4]
# 将信息显示到控件
# 经过OD调试，发现拿到数据以后，在运行了TBLHeliInterfaceManager.SetupToControls之后UI就更新了，所以数据解析就在这个里面
007D5B5D        call        TBLHeliInterfaceManager.SetupToControls
007D5B62        mov         eax,dword ptr [ebp-4]
# 检测电调内部的Flash状态
007D5B65        call        TBLHeliInterfaceManager.CheckInTargetFlashState
007D5B6A        test        al,al
# 2.这里会进行跳转，也就是说不需要提示烧写Flash什么的
007D5B6C>       je          007D5B94
007D5B6E        mov         eax,dword ptr [ebp-4]
007D5B71        call        TBLHeliInterfaceManager.CheckOnFlashStateAndAsk
007D5B76        test        al,al
007D5B78>       je          007D5B90
007D5B7A        mov         eax,dword ptr [ebp-4]
007D5B7D        call        TBLHeliInterfaceManager.FlashESC
007D5B82        test        eax,eax
007D5B84>       jle         007D5B8A
007D5B86        mov         bl,1
007D5B88>       jmp         007D5B94
007D5B8A        mov         byte ptr [ebp-5],0
007D5B8E>       jmp         007D5B94
007D5B90        mov         byte ptr [ebp-5],0
# 2.跳转到这里继续顺序执行
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
# 3.这里会进行跳转，这里应该是根据读取状态判断是成功还是失败了，对应提示的位置
007D5C03>       jmp         007D5C33
007D5C05        lea         edx,[ebp-1C]
007D5C08        mov         eax,dword ptr [ebp-4]
007D5C0B        call        TBLHeliInterfaceManager.GetESCNumStr
007D5C10        lea         eax,[ebp-1C]
007D5C13        mov         edx,7D5D30;' setup read failed'
007D5C18        call        @UStrCat
007D5C1D        mov         eax,dword ptr [ebp-1C]
007D5C20        lea         edx,[ebp-18]
007D5C23        call        006D5894
007D5C28        mov         edx,dword ptr [ebp-18]
007D5C2B        mov         eax,dword ptr [ebp-4]
007D5C2E        call        TBLHeliInterfaceManager.SetLastResultMsg
# 3.跳转到这里，继续进行，后面就是弹窗读取成功了，基本不用看了
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
# 1.这里跳转
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



##### ReadFlash

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
# 1.跳转
00704E5F>       jmp         00704E6D
00704E61>       jmp         @HandleAnyException
00704E66        xor         ebx,ebx
00704E68        call        @DoneExcept
# 1.继续
00704E6D        test        bl,bl
# 2.跳转
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
# 2.继续
00704E9F        movzx       edx,byte ptr [ebp-5]
00704EA3        mov         eax,dword ptr [ebp-4]
# 这里应该是根据命令区分了到底需不需要ack，有的不需要等ack
00704EA6        call        TBootloader.CMDNeedsNoACK
00704EAB        test        al,al
# 3.跳转
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
# 3.继续
00704EDA        movzx       edx,byte ptr [ebp-5]
00704EDE        mov         eax,dword ptr [ebp-4]
00704EE1        call        TBootloader.CMDNeedsSimpleACK
00704EE6        test        al,al
# 4.跳转
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
# 4.继续
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



##### SendStrCRC

```assembly
_Unit108.TBootloader.SendStrCRC
0070673C        push        ebp
0070673D        mov         ebp,esp
0070673F        push        ecx
00706740        push        ebx
00706741        mov         dword ptr [ebp-4],edx
00706744        mov         ebx,eax
00706746        mov         eax,dword ptr [ebp-4]
00706749        call        @DynArrayAddRef
0070674E        xor         eax,eax
00706750        push        ebp
00706751        push        706786
00706756        push        dword ptr fs:[eax]
00706759        mov         dword ptr fs:[eax],esp
0070675C        mov         cl,1
0070675E        mov         edx,dword ptr [ebp-4]
00706761        mov         eax,ebx
00706763        call        TBootloader.SendStr
00706768        mov         ebx,eax
0070676A        xor         eax,eax
0070676C        pop         edx
0070676D        pop         ecx
0070676E        pop         ecx
0070676F        mov         dword ptr fs:[eax],edx
00706772        push        70678D
00706777        lea         eax,[ebp-4]
0070677A        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00706780        call        @DynArrayClear
00706785        ret
00706786>       jmp         @HandleFinally
0070678B>       jmp         00706777
0070678D        mov         eax,ebx
0070678F        pop         ebx
00706790        pop         ecx
00706791        pop         ebp
00706792        ret

```



###### SendStr

```assembly
_Unit108.TBootloader.SendStr
00706794        push        ebp
00706795        mov         ebp,esp
00706797        push        ecx
00706798        mov         ecx,6
0070679D        push        0
0070679F        push        0
007067A1        dec         ecx
007067A2>       jne         0070679D
007067A4        xchg        ecx,dword ptr [ebp-4]
007067A7        push        ebx
007067A8        push        esi
007067A9        push        edi
007067AA        mov         byte ptr [ebp-0D],cl
007067AD        mov         dword ptr [ebp-4],edx
007067B0        mov         esi,eax
007067B2        mov         eax,dword ptr [ebp-4]
007067B5        call        @DynArrayAddRef
007067BA        xor         eax,eax
007067BC        push        ebp
007067BD        push        706C8A
007067C2        push        dword ptr fs:[eax]
007067C5        mov         dword ptr fs:[eax],esp
007067C8        xor         ebx,ebx
007067CA        mov         eax,dword ptr [ebp-4]
007067CD        test        eax,eax
007067CF>       je          007067D6
007067D1        sub         eax,4
007067D4        mov         eax,dword ptr [eax]
007067D6        test        eax,eax
007067D8>       jle         00706C2B
007067DE        cmp         byte ptr [esi+0E4],0;TBootloader.FFVTLinkerMode:Boolean
007067E5>       je          007067F6
007067E7        mov         eax,dword ptr [esi+0E0];TBootloader.FLinker:TFVT_USBLinker
007067ED        call        006EF740
007067F2        test        al,al
007067F4>       jne         00706813
007067F6        cmp         byte ptr [esi+0E4],0;TBootloader.FFVTLinkerMode:Boolean
007067FD>       jne         00706C2B
00706803        mov         eax,dword ptr [esi+48];TBootloader.FComPort:TSerialPort
00706806        call        006FE934
0070680B        test        al,al
0070680D>       je          00706C2B
00706813        cmp         byte ptr [esi+0B4],0FD;TBootloader.FLastCMD:byte
0070681A>       je          00706823
0070681C        mov         eax,esi
0070681E        call        00704198
00706823        call        006DB734
00706828        test        al,al
0070682A>       je          0070685B
0070682C        push        706CA8;'>'
00706831        push        dword ptr [esi+0E8];TBootloader.FInfName:string
00706837        push        706CB8;': '
0070683C        lea         eax,[ebp-14]
0070683F        mov         edx,3
00706844        call        @UStrCatN
00706849        mov         eax,dword ptr [ebp-14]
0070684C        call        006DC004
00706851        mov         eax,1
00706856        call        006DBF4C
0070685B        cmp         byte ptr [esi+0E4],0;TBootloader.FFVTLinkerMode:Boolean
00706862>       jne         0070686C
00706864        mov         eax,dword ptr [esi+48];TBootloader.FComPort:TSerialPort
00706867        call        TSerialPort.Clear
0070686C        cmp         byte ptr [ebp-0D],0
00706870>       je          007068B8
00706872        mov         edx,dword ptr [ebp-4]
00706875        mov         eax,esi
00706877        call        TBootloader.StringCrc
0070687C        mov         ebx,eax
0070687E        mov         word ptr [esi+0BC],bx;TBootloader.LastOutCRC:word
00706885        movzx       eax,byte ptr [esi+0BC];TBootloader.LastOutCRC:word
0070688C        and         al,0FF
0070688E        mov         byte ptr [ebp-18],al
00706891        shr         bx,8
00706895        mov         byte ptr [ebp-17],bl
00706898        lea         eax,[ebp-18]
0070689B        lea         ecx,[ebp-0C]
0070689E        mov         edx,1
007068A3        call        006D59C4
007068A8        lea         ecx,[ebp-8]
007068AB        mov         edx,dword ptr [ebp-0C]
007068AE        mov         eax,dword ptr [ebp-4]
007068B1        call        006D5954
007068B6>       jmp         007068C9
007068B8        lea         eax,[ebp-8]
007068BB        mov         edx,dword ptr [ebp-4]
007068BE        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
007068C4        call        @DynArrayAsg
007068C9        cmp         byte ptr [esi+0E4],0;TBootloader.FFVTLinkerMode:Boolean
007068D0>       je          0070691E
007068D2        mov         eax,dword ptr [ebp-8]
007068D5        test        eax,eax
007068D7>       je          007068DE
007068D9        sub         eax,4
007068DC        mov         eax,dword ptr [eax]
007068DE        mov         edx,dword ptr [esi+0E0];TBootloader.FLinker:TFVT_USBLinker
007068E4        mov         ecx,eax
007068E6        mov         eax,dword ptr [ebp-8]
007068E9        xchg        eax,edx
007068EA        call        TFVT_USBLinker.Write
007068EF        mov         edx,eax
007068F1        mov         eax,dword ptr [ebp-8]
007068F4        test        eax,eax
007068F6>       je          007068FD
007068F8        sub         eax,4
007068FB        mov         eax,dword ptr [eax]
007068FD        cmp         eax,edx
007068FF        sete        bl
00706902        test        bl,bl
00706904>       je          00706912
00706906        mov         byte ptr [esi+0A1],30;TBootloader.FLastACK:byte
0070690D>       jmp         00706A37
00706912        mov         byte ptr [esi+0A1],0C7;TBootloader.FLastACK:byte
00706919>       jmp         00706A37
0070691E        mov         eax,dword ptr [esi+48];TBootloader.FComPort:TSerialPort
# 跳到这里开始
00706921        call        TSerialPort.ClearInput
00706926        mov         eax,dword ptr [esi+48];TBootloader.FComPort:TSerialPort
00706929        mov         edx,dword ptr [ebp-8]
# 这里就发送了最后的crc内容
0070692C        call        TSerialPort.WriteBytes
00706931        mov         ebx,eax
00706933        test        bl,bl
00706935>       je          00706A30
0070693B        cmp         byte ptr [esi+0D0],0;TBootloader.FOneWire:Boolean
00706942>       je          00706A27
00706948        mov         eax,esi
# 获取读的超时时间
0070694A        call        TBootloader.GetReadTimeOut
0070694F        mov         edi,eax
00706951        mov         eax,dword ptr [ebp-8]
00706954        test        eax,eax
00706956>       je          0070695D
00706958        sub         eax,4
0070695B        mov         eax,dword ptr [eax]
0070695D        mov         edx,eax
0070695F        add         edx,edx
00706961        add         edx,0FA
00706967        mov         eax,esi
# 设置读超时
00706969        call        TBootloader.SetReadTimeOut
0070696E        call        006D91CC
# 这里应该是开了个线程还是啥东西的，用来记录读开始时间的
00706973        mov         dword ptr [esi+108],eax;TBootloader.FStartTime:Int64
00706979        mov         dword ptr [esi+10C],edx;TBootloader.?f10C:Integer
0070697F        mov         ebx,dword ptr [ebp-8]
00706982        test        ebx,ebx
00706984>       je          0070698B
00706986        sub         ebx,4
00706989        mov         ebx,dword ptr [ebx]
0070698B        lea         ecx,[ebp-1C]
0070698E        mov         edx,ebx
00706990        mov         eax,esi
# 开始接收串口数据
00706992        call        TBootloader.RecvString
00706997        mov         edx,dword ptr [ebp-1C]
0070699A        lea         eax,[esi+100];TBootloader.FLastEcho:TArray<System.Byte>
007069A0        mov         ecx,dword ptr ds:[404B48];TArray<System.Byte>
007069A6        call        @DynArrayAsg
007069AB        call        006DB734
007069B0        test        al,al
007069B2>       je          007069C5
007069B4        call        006D91CC
007069B9        mov         dword ptr [esi+110],eax;TBootloader.FEndTime:Int64
007069BF        mov         dword ptr [esi+114],edx;TBootloader.?f114:Pointer
007069C5        mov         edx,edi
007069C7        mov         eax,esi
007069C9        call        TBootloader.SetReadTimeOut
007069CE        mov         eax,dword ptr [esi+100];TBootloader.FLastEcho:TArray<System.Byte>
007069D4        test        eax,eax
007069D6>       je          007069DD
007069D8        sub         eax,4
007069DB        mov         eax,dword ptr [eax]
007069DD        mov         ecx,dword ptr [ebp-8]
007069E0        mov         edx,ecx
007069E2        test        edx,edx
007069E4>       je          007069EB
007069E6        sub         edx,4
007069E9        mov         edx,dword ptr [edx]
007069EB        cmp         edx,eax
007069ED>       jne         00706A0D
007069EF        mov         eax,ecx
007069F1        test        eax,eax
007069F3>       je          007069FA
007069F5        sub         eax,4
007069F8        mov         eax,dword ptr [eax]
007069FA        mov         edx,dword ptr [esi+100];TBootloader.FLastEcho:TArray<System.Byte>
00706A00        mov         ecx,eax
00706A02        mov         eax,dword ptr [ebp-8]
00706A05        xchg        eax,edx
00706A06        call        CompareMem
00706A0B>       jmp         00706A0F
00706A0D        xor         eax,eax
00706A0F        mov         ebx,eax
00706A11        test        bl,bl
00706A13>       jne         00706A1E
00706A15        mov         byte ptr [esi+0A1],0C9;TBootloader.FLastACK:byte
00706A1C>       jmp         00706A37
00706A1E        mov         byte ptr [esi+0A1],30;TBootloader.FLastACK:byte
00706A25>       jmp         00706A37
00706A27        mov         byte ptr [esi+0A1],30;TBootloader.FLastACK:byte
00706A2E>       jmp         00706A37
00706A30        mov         byte ptr [esi+0A1],0C7;TBootloader.FLastACK:byte
00706A37        call        006DB734
00706A3C        test        al,al
00706A3E>       je          00706C1B
00706A44        test        bl,bl
00706A46>       je          00706AB3
00706A48        mov         eax,706CA8;'>'
00706A4D        call        006DC018
00706A52        mov         eax,esi
00706A54        call        TBootloader.AllowLog
00706A59        mov         edx,eax
00706A5B        mov         ecx,800
00706A60        mov         eax,dword ptr [ebp-8]
00706A63        call        006DC174
00706A68        cmp         byte ptr [ebp-0D],0
00706A6C>       je          00706A80
00706A6E        push        0
00706A70        movzx       edx,word ptr [esi+0BC];TBootloader.LastOutCRC:word
00706A77        xor         ecx,ecx
00706A79        mov         eax,esi
00706A7B        call        00706584
00706A80        mov         eax,1
00706A85        call        006DBF64
00706A8A        lea         eax,[ebp-20]
00706A8D        push        eax
00706A8E        movzx       edx,byte ptr [esi+0A1];TBootloader.FLastACK:byte
00706A95        mov         cl,1
00706A97        mov         eax,esi
00706A99        call        00705B90
00706A9E        mov         eax,dword ptr [ebp-20]
00706AA1        or          ecx,0FFFFFFFF
00706AA4        mov         edx,8000
00706AA9        call        006DBD18
00706AAE>       jmp         00706C1B
00706AB3        mov         eax,706CCC;'>: '
00706AB8        call        006DC018
00706ABD        mov         edi,dword ptr [ebp-8]
00706AC0        test        edi,edi
00706AC2>       je          00706AC9
00706AC4        sub         edi,4
00706AC7        mov         edi,dword ptr [edi]
00706AC9        lea         edx,[ebp-24]
00706ACC        mov         eax,edi
00706ACE        call        IntToStr
00706AD3        mov         eax,dword ptr [ebp-24]
00706AD6        call        006DBFC8
00706ADB        mov         eax,706CE0;' Bytes = '
00706AE0        call        006DC018
00706AE5        mov         eax,esi
00706AE7        call        TBootloader.AllowLog
00706AEC        mov         edx,eax
00706AEE        mov         ecx,800
00706AF3        mov         eax,dword ptr [ebp-8]
00706AF6        call        006DC174
00706AFB        cmp         byte ptr [ebp-0D],0
00706AFF>       je          00706B13
00706B01        push        0
00706B03        movzx       edx,word ptr [esi+0BC];TBootloader.LastOutCRC:word
00706B0A        xor         ecx,ecx
00706B0C        mov         eax,esi
00706B0E        call        00706584
00706B13        cmp         byte ptr [esi+0A1],0C9;TBootloader.FLastACK:byte
00706B1A>       jne         00706BED
00706B20        mov         eax,706D00;'E: '
00706B25        call        006DC068
00706B2A        mov         eax,dword ptr [esi+100];TBootloader.FLastEcho:TArray<System.Byte>
00706B30        mov         edi,eax
00706B32        test        edi,edi
00706B34>       je          00706B3B
00706B36        sub         edi,4
00706B39        mov         edi,dword ptr [edi]
00706B3B        lea         edx,[ebp-28]
00706B3E        mov         eax,edi
00706B40        call        IntToStr
00706B45        mov         eax,dword ptr [ebp-28]
00706B48        call        006DBFC8
00706B4D        mov         eax,706CE0;' Bytes = '
00706B52        call        006DC018
00706B57        mov         eax,esi
00706B59        call        TBootloader.AllowLog
00706B5E        mov         edx,eax
00706B60        mov         eax,dword ptr [esi+100];TBootloader.FLastEcho:TArray<System.Byte>
00706B66        mov         ecx,800
00706B6B        call        006DC174
00706B70        cmp         byte ptr [ebp-0D],0
00706B74>       je          00706BB9
00706B76        mov         eax,dword ptr [esi+100];TBootloader.FLastEcho:TArray<System.Byte>
00706B7C        mov         edi,eax
00706B7E        test        edi,edi
00706B80>       je          00706B87
00706B82        sub         edi,4
00706B85        mov         edi,dword ptr [edi]
00706B87        push        0
00706B89        sub         edi,2
00706B8C        push        edi
00706B8D        lea         eax,[ebp-2C]
00706B90        push        eax
00706B91        mov         eax,dword ptr [esi+100];TBootloader.FLastEcho:TArray<System.Byte>
00706B97        xor         ecx,ecx
00706B99        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00706B9F        call        @DynArrayCopyRange
00706BA4        mov         edx,dword ptr [ebp-2C]
00706BA7        mov         eax,esi
00706BA9        call        TBootloader.StringCrc
00706BAE        mov         edx,eax
00706BB0        xor         ecx,ecx
00706BB2        mov         eax,esi
00706BB4        call        00706584
00706BB9        mov         eax,706D14;'Time elapsed (ms): '
00706BBE        call        006DBFA0
00706BC3        mov         eax,dword ptr [esi+110];TBootloader.FEndTime:Int64
00706BC9        mov         edx,dword ptr [esi+114];TBootloader.?f114:Pointer
00706BCF        sub         eax,dword ptr [esi+108]
00706BD5        sbb         edx,dword ptr [esi+10C]
00706BDB        push        edx
00706BDC        push        eax
00706BDD        lea         eax,[ebp-30]
00706BE0        call        IntToStr
00706BE5        mov         eax,dword ptr [ebp-30]
00706BE8        call        006DC004
00706BED        mov         eax,1
00706BF2        call        006DBF64
00706BF7        lea         eax,[ebp-34]
00706BFA        push        eax
00706BFB        movzx       edx,byte ptr [esi+0A1];TBootloader.FLastACK:byte
00706C02        xor         ecx,ecx
00706C04        mov         eax,esi
00706C06        call        00705B90
00706C0B        mov         eax,dword ptr [ebp-34]
00706C0E        or          ecx,0FFFFFFFF
00706C11        mov         edx,0FF
00706C16        call        006DBD18
00706C1B        cmp         byte ptr [esi+0B4],0FD;TBootloader.FLastCMD:byte
# 最后直接到这里
00706C22>       je          00706C2B
00706C24        mov         eax,esi
00706C26        call        00704154
00706C2B        xor         eax,eax
00706C2D        pop         edx
00706C2E        pop         ecx
00706C2F        pop         ecx
00706C30        mov         dword ptr fs:[eax],edx
00706C33        push        706C91
00706C38        lea         eax,[ebp-34]
00706C3B        mov         edx,2
00706C40        call        @UStrArrayClr
00706C45        lea         eax,[ebp-2C]
00706C48        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00706C4E        call        @DynArrayClear
00706C53        lea         eax,[ebp-28]
00706C56        mov         edx,3
00706C5B        call        @UStrArrayClr
00706C60        lea         eax,[ebp-1C]
00706C63        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00706C69        call        @DynArrayClear
00706C6E        lea         eax,[ebp-14]
00706C71        call        @UStrClr
00706C76        lea         eax,[ebp-0C]
00706C79        mov         edx,dword ptr ds:[404B48];TArray<System.Byte>
00706C7F        mov         ecx,3
00706C84        call        @FinalizeArray
00706C89        ret
00706C8A>       jmp         @HandleFinally
00706C8F>       jmp         00706C38
00706C91        mov         eax,ebx
00706C93        pop         edi
00706C94        pop         esi
00706C95        pop         ebx
00706C96        mov         esp,ebp
00706C98        pop         ebp
00706C99        ret

```

这里追了半天，都找不到对应串口返回时的读取操作，看起来有，实际上并不是。



##### CheckStrACK

最后通过类中成员函数，看到这个ReadByte，发现log中对应的读取都是来自于这里，猜测这个应该是实际的读，只是不知道是谁调用的

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
00704508        call        TBootloader.RecvString
0070450D        mov         edx,dword ptr [ebp-38]
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



##### ReadSetupFromBinString

读取配置信息给Setup From来显示，不做具体分析了，实际上类似于上面的ToString

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
# 1.这里是个大循环
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
# 2. 这里继续
006EA905        cmp         byte ptr [ebp-0E],4
# 3. 跳转
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



## 框架

边反编译，边看一下程序的框架。



`TBLHeliInterfaceManager` 则是整个接口的抽象类，主要逻辑是在他来控制



这三个是不同方式的读取具体实现

![image-20210713102713173](https://i.loli.net/2021/07/13/qsplANMCH5OeUtL.png)

```
TUniSerialInterface
TBLBInterface
TFlightCtrlIntf
```



`TBootloader` 是各种接口下，最底层的协议，主要是读写Flash和E2PROM



`TBLHeliInterfaceManager.FBLHeliWork`的数据类型是 `TBLHeli` 也就是电调设置对象



### TBLHeli

TBLHeli中记录的就是所有配置的参数什么的，显示或者操作的时候，他就是真正的后端对象。

从`TBLHeli.Init`就能看出他初始化了什么东西。

```assembly
_Unit102.TBLHeli.Init
006E5044        push        ebx
006E5045        push        esi
006E5046        mov         esi,eax
006E5048        lea         eax,[esi+0BC];TBLHeli.FErrMsg:string
006E504E        call        @UStrClr
006E5053        mov         byte ptr [esi+0C0],4;TBLHeli.FStatus:TSetupStatus
006E505A        mov         byte ptr [esi+0BA],0;TBLHeli.FIsAlternateSettingsKey:Boolean
006E5061        mov         byte ptr [esi+0D1],0;TBLHeli.FIs_64k:Boolean
006E5068        mov         byte ptr [esi+0B9],0;TBLHeli.FActivationStatus:TActivationStatus
006E506F        xor         eax,eax
006E5071        mov         dword ptr [esi+0C4],eax;TBLHeli.FDshotGoodFrames:Cardinal
006E5077        xor         eax,eax
006E5079        mov         dword ptr [esi+0C8],eax;TBLHeli.FDshotBadFrames:Cardinal
006E507F        xor         eax,eax
# mcu类型
006E5081        mov         dword ptr [esi+0B4],eax;TBLHeli.FMCU_DeviceID:Integer
006E5087        mov         byte ptr [esi+0D2],0;TBLHeli.FMCUManufacturer:TMCUManufacturer
006E508E        lea         eax,[esi+0CC];TBLHeli.FUUID:string
006E5094        call        @UStrClr
006E5099        lea         eax,[esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E509F        call        @UStrClr
006E50A4        lea         eax,[esi+30];TBLHeli.FEep_ESC_Layout:TESC_Layout
006E50A7        mov         ecx,0FF
006E50AC        mov         edx,20
006E50B1        call        @FillChar
# esc name
006E50B6        lea         eax,[esi+70];TBLHeli.FEep_Name:TESC_Name
006E50B9        mov         ecx,20
006E50BE        mov         edx,10
006E50C3        call        @FillChar
# 版本号
006E50C8        mov         byte ptr [esi+6],2C;TBLHeli.FEep_Layout_Revision:byte
006E50CC        mov         byte ptr [esi+4],20;TBLHeli.FEep_FW_Main_Revision:byte
006E50D0        mov         byte ptr [esi+5],46;TBLHeli.FEep_FW_Sub_Revision:byte
006E50D4        lea         eax,[esi+50];TBLHeli.FEep_ESC_MCU:TESC_MCU
006E50D7        mov         ecx,0FF
006E50DC        mov         edx,20
006E50E1        call        @FillChar
# 这里就是音乐的配置了
006E50E6        lea         eax,[esi+80];TBLHeli.FEep_Note_Array:TEep_Note_Array
006E50EC        mov         ecx,0FF
006E50F1        mov         edx,30
006E50F6        call        @FillChar
006E50FB        mov         bl,4
006E50FD        cmp         bl,1F
006E5100>       je          006E510B
006E5102        mov         edx,ebx
006E5104        mov         eax,esi
# 这里很关键，他把通用的部分设置作为了parameter，初始化这里就是给这些参数一个默认值
006E5106        call        TBLHeli.SetParameterValueToDefault
006E510B        inc         ebx
006E510C        cmp         bl,2A
006E510F>       jne         006E50FD
006E5111        pop         esi
006E5112        pop         ebx
006E5113        ret

```



#### SetParameterValueToDefault

这里比较简单就是获取参数，然后设置参数值

```assembly
_Unit102.TBLHeli.SetParameterValueToDefault
006E5954        push        ebx
006E5955        push        esi
006E5956        mov         ebx,edx
006E5958        mov         esi,eax
006E595A        mov         edx,ebx
006E595C        mov         eax,esi
006E595E        call        TBLHeli.GetParameterValueDefault
006E5963        mov         edx,ebx
006E5965        mov         ecx,eax
006E5967        mov         eax,esi
006E5969        call        TBLHeli.SetParameterValue
006E596E        pop         esi
006E596F        pop         ebx
006E5970        ret

```



获取默认值这里参数显示的还是比较少，这里应该只是枚举类型或者和版本有关系的参数才会在这里

```assembly
_Unit102.TBLHeli.GetParameterValueDefault
006E7430        push        ebx
006E7431        push        esi
006E7432        push        edi
006E7433        push        ebp
006E7434        mov         ebx,edx
006E7436        mov         esi,eax
006E7438        mov         edi,dword ptr ds:[840DF4];^gvar_00839102
006E743E        movzx       edi,word ptr [edi]
006E7441        mov         edx,ebx
006E7443        mov         eax,esi
# 这里应该是枚举那个Layout Rev的版本号
006E7445        call        TBLHeli.IsParameterExisting
006E744A        test        al,al
006E744C>       je          006E7817
006E7452        movzx       eax,bl
006E7455        cmp         eax,2D
006E7458>       ja          006E7812
006E745E        jmp         dword ptr [eax*4+6E7465]
006E7465        dd          006E7812
006E7469        dd          006E7817
006E746D        dd          006E7817
006E7471        dd          006E7817
006E7475        dd          006E7522
006E7479        dd          006E752B
006E747D        dd          006E7534
006E7481        dd          006E75B8
006E7485        dd          006E761E
006E7489        dd          006E7627
006E748D        dd          006E7647
006E7491        dd          006E7650
006E7495        dd          006E7670
006E7499        dd          006E7679
006E749D        dd          006E76C4
006E74A1        dd          006E76EA
006E74A5        dd          006E7701
006E74A9        dd          006E775D
006E74AD        dd          006E7764
006E74B1        dd          006E776D
006E74B5        dd          006E7776
006E74B9        dd          006E777F
006E74BD        dd          006E7786
006E74C1        dd          006E778D
006E74C5        dd          006E77BD
006E74C9        dd          006E77C3
006E74CD        dd          006E77CE
006E74D1        dd          006E77D2
006E74D5        dd          006E7802
006E74D9        dd          006E7808
006E74DD        dd          006E780E
006E74E1        dd          006E7812
006E74E5        dd          006E7817
006E74E9        dd          006E7817
006E74ED        dd          006E7817
006E74F1        dd          006E7817
006E74F5        dd          006E7817
006E74F9        dd          006E7817
006E74FD        dd          006E7817
006E7501        dd          006E7817
006E7505        dd          006E7817
006E7509        dd          006E7817
006E750D        dd          006E7812
006E7511        dd          006E7812
006E7515        dd          006E7812
006E7519        dd          006E7817
006E751D>       jmp         006E7817
006E7522        mov         di,1
006E7526>       jmp         006E7817
006E752B        mov         di,32
006E752F>       jmp         006E7817
006E7534        mov         eax,esi
006E7536        call        TBLHeli.IsProgrammablePwmFreqMinMaxCapable
006E753B        test        al,al
006E753D>       je          006E7545
006E753F        movzx       edi,byte ptr [esi+2C];TBLHeli.FEep_Hw_Pwm_Freq_Min:byte
006E7543>       jmp         006E7549
006E7545        mov         di,18
006E7549        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E754F        mov         edx,dword ptr ds:[8396A4];^'RF1'
006E7555        call        @UStrEqual
006E755A>       jne         006E7565
006E755C        mov         di,20
006E7560>       jmp         006E7817
006E7565        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E756B        mov         edx,dword ptr ds:[8396A8];^'XILO_ESC'
006E7571        call        @UStrEqual
006E7576>       jne         006E7581
006E7578        mov         di,30
006E757C>       jmp         006E7817
006E7581        cmp         byte ptr [esi+6],2C;TBLHeli.FEep_Layout_Revision:byte
006E7585>       jb          006E7817
006E758B        mov         ebp,18
006E7590        mov         ebx,8396AC;^'FL1_Afterburner'
006E7595        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E759B        mov         edx,dword ptr [ebx]
006E759D        call        @UStrEqual
006E75A2>       jne         006E75AD
006E75A4        movzx       edi,word ptr [ebx+4]
006E75A8>       jmp         006E7817
006E75AD        add         ebx,8
006E75B0        dec         ebp
006E75B1>       jne         006E7595
006E75B3>       jmp         006E7817
006E75B8        mov         di,10
006E75BC        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E75C2        mov         edx,dword ptr ds:[839668];^'Hobbywing_XRotor_BLHeli32'
006E75C8        call        @UStrEqual
006E75CD>       je          006E75E2
006E75CF        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E75D5        mov         edx,dword ptr ds:[839664];^'Hobbywing_XRotor_40A_BLHeli32'
006E75DB        call        @UStrEqual
006E75E0>       jne         006E75E9
006E75E2        xor         edi,edi
006E75E4>       jmp         006E7817
006E75E9        cmp         byte ptr [esi+6],2C;TBLHeli.FEep_Layout_Revision:byte
006E75ED>       jb          006E7817
006E75F3        mov         ebp,15
006E75F8        mov         ebx,839778;^'FL1_Afterburner'
006E75FD        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E7603        mov         edx,dword ptr [ebx]
006E7605        call        @UStrEqual
006E760A>       jne         006E7613
006E760C        xor         edi,edi
006E760E>       jmp         006E7817
006E7613        add         ebx,4
006E7616        dec         ebp
006E7617>       jne         006E75FD
006E7619>       jmp         006E7817
006E761E        mov         di,2
006E7622>       jmp         006E7817
006E7627        mov         eax,esi
006E7629        call        006E677C
006E762E        cmp         eax,0CA8
006E7633>       jl          006E763E
006E7635        mov         di,410
006E7639>       jmp         006E7817
006E763E        mov         di,3E8
006E7642>       jmp         006E7817
006E7647        mov         di,5DC
006E764B>       jmp         006E7817
006E7650        mov         eax,esi
006E7652        call        006E677C
006E7657        cmp         eax,0CA8
006E765C>       jl          006E7667
006E765E        mov         di,7A8
006E7662>       jmp         006E7817
006E7667        mov         di,7D0
006E766B>       jmp         006E7817
006E7670        mov         di,1
006E7674>       jmp         006E7817
006E7679        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E767F        mov         edx,dword ptr ds:[839698];^'HAKRC_45A'
006E7685        call        @UStrEqual
006E768A>       je          006E76B2
006E768C        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E7692        mov         edx,dword ptr ds:[83969C];^'HAKRC_E45A'
006E7698        call        @UStrEqual
006E769D>       je          006E76B2
006E769F        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E76A5        mov         edx,dword ptr ds:[8396A0];^'HAKRC_E50A'
006E76AB        call        @UStrEqual
006E76B0>       jne         006E76BB
006E76B2        mov         di,78
006E76B6>       jmp         006E7817
006E76BB        mov         di,8C
006E76BF>       jmp         006E7817
006E76C4        movzx       eax,byte ptr [esi+26];TBLHeli.FEep_Hw_Voltage_Sense_Capable:byte
006E76C8        cmp         al,0FF
006E76CA>       jae         006E76E3
006E76CC        test        al,al
006E76CE>       jbe         006E76DC
006E76D0        movzx       edi,al
006E76D3        sub         di,18
006E76D7>       jmp         006E7817
006E76DC        xor         edi,edi
006E76DE>       jmp         006E7817
006E76E3        xor         edi,edi
006E76E5>       jmp         006E7817
006E76EA        movzx       eax,byte ptr [esi+27];TBLHeli.FEep_Hw_Current_Sense_Capable:byte
006E76EE        cmp         al,0FF
006E76F0>       jae         006E76FA
006E76F2        movzx       edi,al
006E76F5>       jmp         006E7817
006E76FA        xor         edi,edi
006E76FC>       jmp         006E7817
006E7701        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E7707        mov         edx,dword ptr ds:[839680];^'Sunrise_DHCrop_ST'
006E770D        call        @UStrEqual
006E7712>       je          006E774D
006E7714        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E771A        mov         edx,dword ptr ds:[839684];^'Sunrise_DHCrop_GD'
006E7720        call        @UStrEqual
006E7725>       je          006E774D
006E7727        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E772D        mov         edx,dword ptr ds:[839688];^'Empire_ST'
006E7733        call        @UStrEqual
006E7738>       je          006E774D
006E773A        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E7740        mov         edx,dword ptr ds:[83968C];^'Empire_GD'
006E7746        call        @UStrEqual
006E774B>       jne         006E7754
006E774D        xor         edi,edi
006E774F>       jmp         006E7817
006E7754        mov         di,1
006E7758>       jmp         006E7817
006E775D        xor         edi,edi
006E775F>       jmp         006E7817
006E7764        mov         di,28
006E7768>       jmp         006E7817
006E776D        mov         di,50
006E7771>       jmp         006E7817
006E7776        mov         di,258
006E777A>       jmp         006E7817
006E777F        xor         edi,edi
006E7781>       jmp         006E7817
006E7786        xor         edi,edi
006E7788>       jmp         006E7817
006E778D        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E7793        mov         edx,dword ptr ds:[839688];^'Empire_ST'
006E7799        call        @UStrEqual
006E779E>       je          006E77B3
006E77A0        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E77A6        mov         edx,dword ptr ds:[83968C];^'Empire_GD'
006E77AC        call        @UStrEqual
006E77B1>       jne         006E77B9
006E77B3        mov         di,1
006E77B7>       jmp         006E7817
006E77B9        xor         edi,edi
006E77BB>       jmp         006E7817
006E77BD        mov         di,64
006E77C1>       jmp         006E7817
006E77C3        mov         edi,dword ptr ds:[841854];^gvar_0083922C
006E77C9        movzx       edi,byte ptr [edi]
006E77CC>       jmp         006E7817
006E77CE        xor         edi,edi
006E77D0>       jmp         006E7817
006E77D2        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E77D8        mov         edx,dword ptr ds:[83967C];^'FrESC_80A'
006E77DE        call        @UStrEqual
006E77E3>       je          006E77F8
006E77E5        mov         eax,dword ptr [esi+0B0];TBLHeli.FESC_Layout_Org_Str:string
006E77EB        mov         edx,dword ptr ds:[839774];^'WINGTRA'
006E77F1        call        @UStrEqual
006E77F6>       jne         006E77FE
006E77F8        mov         di,1
006E77FC>       jmp         006E7817
006E77FE        xor         edi,edi
006E7800>       jmp         006E7817
006E7802        mov         di,1
006E7806>       jmp         006E7817
006E7808        mov         di,11
006E780C>       jmp         006E7817
006E780E        xor         edi,edi
006E7810>       jmp         006E7817
006E7812        call        0042E5A8
006E7817        mov         eax,edi
006E7819        pop         ebp
006E781A        pop         edi
006E781B        pop         esi
006E781C        pop         ebx
006E781D        ret

```



设置参数的值就能看到基本所有UI上的参数了

```assembly
_Unit102.TBLHeli.SetParameterValue
006E56B8        push        ebx
006E56B9        push        esi
006E56BA        push        edi
006E56BB        push        ecx
006E56BC        mov         esi,ecx
006E56BE        mov         ebx,edx
006E56C0        mov         edi,eax
006E56C2        mov         byte ptr [esp],1
006E56C6        mov         eax,ebx
006E56C8        call        006DEB58
006E56CD        cmp         al,2
006E56CF>       jae         006E56D8
006E56D1        mov         eax,esi
006E56D3        movzx       eax,al
006E56D6        mov         esi,eax
006E56D8        movzx       eax,bl
006E56DB        cmp         eax,29
006E56DE>       ja          006E5904
006E56E4        jmp         dword ptr [eax*4+6E56EB]
006E56EB        dd          006E5904
006E56EF        dd          006E5793
006E56F3        dd          006E579D
006E56F7        dd          006E57A7
006E56FB        dd          006E57B1
006E56FF        dd          006E57BB
006E5703        dd          006E57C5
006E5707        dd          006E57CF
006E570B        dd          006E57D9
006E570F        dd          006E57E3
006E5713        dd          006E57EC
006E5717        dd          006E57F5
006E571B        dd          006E57FE
006E571F        dd          006E5808
006E5723        dd          006E5812
006E5727        dd          006E581C
006E572B        dd          006E5826
006E572F        dd          006E5830
006E5733        dd          006E5855
006E5737        dd          006E585F
006E573B        dd          006E5869
006E573F        dd          006E5872
006E5743        dd          006E587C
006E5747        dd          006E5886
006E574B        dd          006E588D
006E574F        dd          006E5894
006E5753        dd          006E589B
006E5757        dd          006E58A2
006E575B        dd          006E58A9
006E575F        dd          006E58B0
006E5763        dd          006E58B7
006E5767        dd          006E5904
006E576B        dd          006E58BE
006E576F        dd          006E58C5
006E5773        dd          006E58CC
006E5777        dd          006E58D3
006E577B        dd          006E58DA
006E577F        dd          006E58E1
006E5783        dd          006E58E8
006E5787        dd          006E58EF
006E578B        dd          006E58F6
006E578F        dd          006E58FD
006E5793        mov         eax,esi
006E5795        mov         byte ptr [edi+4],al;TBLHeli.FEep_FW_Main_Revision:byte
006E5798>       jmp         006E5908
006E579D        mov         eax,esi
006E579F        mov         byte ptr [edi+5],al;TBLHeli.FEep_FW_Sub_Revision:byte
006E57A2>       jmp         006E5908
006E57A7        mov         eax,esi
006E57A9        mov         byte ptr [edi+6],al;TBLHeli.FEep_Layout_Revision:byte
006E57AC>       jmp         006E5908
006E57B1        mov         eax,esi
006E57B3        mov         byte ptr [edi+7],al;TBLHeli.FEep_Pgm_Direction:byte
006E57B6>       jmp         006E5908
006E57BB        mov         eax,esi
006E57BD        mov         byte ptr [edi+8],al;TBLHeli.FEep_Pgm_Rampup_Pwr:byte
006E57C0>       jmp         006E5908
006E57C5        mov         eax,esi
006E57C7        mov         byte ptr [edi+9],al;TBLHeli.FEep_Pgm_Pwm_Frequency:byte
006E57CA>       jmp         006E5908
006E57CF        mov         eax,esi
006E57D1        mov         byte ptr [edi+0A],al;TBLHeli.FEep_Pgm_Comm_Timing:byte
006E57D4>       jmp         006E5908
006E57D9        mov         eax,esi
006E57DB        mov         byte ptr [edi+0B],al;TBLHeli.FEep_Pgm_Demag_Comp:byte
006E57DE>       jmp         006E5908
006E57E3        mov         word ptr [edi+0C],si;TBLHeli.FEep_Pgm_Min_Throttle:word
006E57E7>       jmp         006E5908
006E57EC        mov         word ptr [edi+0E],si;TBLHeli.FEep_Pgm_Center_Throttle:word
006E57F0>       jmp         006E5908
006E57F5        mov         word ptr [edi+10],si;TBLHeli.FEep_Pgm_Max_Throttle:word
006E57F9>       jmp         006E5908
006E57FE        mov         eax,esi
006E5800        mov         byte ptr [edi+12],al;TBLHeli.FEep_Pgm_Enable_Throttle_Cal:Boolean
006E5803>       jmp         006E5908
006E5808        mov         eax,esi
006E580A        mov         byte ptr [edi+13],al;TBLHeli.FEep_Pgm_Temp_Prot:byte
006E580D>       jmp         006E5908
006E5812        mov         eax,esi
006E5814        mov         byte ptr [edi+14],al;TBLHeli.FEep_Pgm_Volt_Prot:byte
006E5817>       jmp         006E5908
006E581C        mov         eax,esi
006E581E        mov         byte ptr [edi+15],al;TBLHeli.FEep_Pgm_Curr_Prot:byte
006E5821>       jmp         006E5908
006E5826        mov         eax,esi
006E5828        mov         byte ptr [edi+16],al;TBLHeli.FEep_Pgm_Enable_Power_Prot:byte
006E582B>       jmp         006E5908
006E5830        mov         eax,edi
006E5832        call        TBLHeli.IsProgrammableBrakeForceCapable
006E5837        test        al,al
006E5839>       jne         006E584B
006E583B        test        si,si
006E583E>       jbe         006E584B
006E5840        mov         dl,11
006E5842        mov         eax,edi
006E5844        call        TBLHeli.GetParameterMax
006E5849        mov         esi,eax
006E584B        mov         eax,esi
006E584D        mov         byte ptr [edi+17],al;TBLHeli.FEep_Pgm_Brake_On_Stop:byte
006E5850>       jmp         006E5908
006E5855        mov         eax,esi
006E5857        mov         byte ptr [edi+18],al;TBLHeli.FEep_Pgm_Beep_Strength:byte
006E585A>       jmp         006E5908
006E585F        mov         eax,esi
006E5861        mov         byte ptr [edi+19],al;TBLHeli.FEep_Pgm_Beacon_Strength:byte
006E5864>       jmp         006E5908
006E5869        mov         word ptr [edi+1A],si;TBLHeli.FEep_Pgm_Beacon_Delay:word
006E586D>       jmp         006E5908
006E5872        mov         eax,esi
006E5874        mov         byte ptr [edi+1C],al;TBLHeli.FEep_Pgm_LED_Control:byte
006E5877>       jmp         006E5908
006E587C        mov         eax,esi
006E587E        mov         byte ptr [edi+1D],al;TBLHeli.FEep_Pgm_Max_Acceleration:byte
006E5881>       jmp         006E5908
006E5886        mov         eax,esi
006E5888        mov         byte ptr [edi+1E],al;TBLHeli.FEep_Pgm_Nondamped_Mode:byte
006E588B>       jmp         006E5908
006E588D        mov         eax,esi
006E588F        mov         byte ptr [edi+1F],al;TBLHeli.FEep_Pgm_Curr_Sense_Cal:byte
006E5892>       jmp         006E5908
006E5894        mov         eax,esi
006E5896        mov         byte ptr [edi+20],al;TBLHeli.FEep_Note_Config:byte
006E5899>       jmp         006E5908
006E589B        mov         eax,esi
006E589D        mov         byte ptr [edi+21],al;TBLHeli.FEep_Pgm_Sine_Mode:byte
006E58A0>       jmp         006E5908
006E58A2        mov         eax,esi
006E58A4        mov         byte ptr [edi+22],al;TBLHeli.FEep_Pgm_Auto_Tlm_Mode:byte
006E58A7>       jmp         006E5908
006E58A9        mov         eax,esi
006E58AB        mov         byte ptr [edi+23],al;TBLHeli.FEep_Pgm_Stall_Prot:byte
006E58AE>       jmp         006E5908
006E58B0        mov         eax,esi
006E58B2        mov         byte ptr [edi+24],al;TBLHeli.FEep_Pgm_SBUS_Channel:byte
006E58B5>       jmp         006E5908
006E58B7        mov         eax,esi
006E58B9        mov         byte ptr [edi+25],al;TBLHeli.FEep_Pgm_SPORT_Physical_ID:byte
006E58BC>       jmp         006E5908
006E58BE        mov         eax,esi
006E58C0        mov         byte ptr [edi+26],al;TBLHeli.FEep_Hw_Voltage_Sense_Capable:byte
006E58C3>       jmp         006E5908
006E58C5        mov         eax,esi
006E58C7        mov         byte ptr [edi+27],al;TBLHeli.FEep_Hw_Current_Sense_Capable:byte
006E58CA>       jmp         006E5908
006E58CC        mov         eax,esi
006E58CE        mov         byte ptr [edi+28],al;TBLHeli.FEep_Hw_LED_Capable_0:byte
006E58D1>       jmp         006E5908
006E58D3        mov         eax,esi
006E58D5        mov         byte ptr [edi+29],al;TBLHeli.FEep_Hw_LED_Capable_1:byte
006E58D8>       jmp         006E5908
006E58DA        mov         eax,esi
006E58DC        mov         byte ptr [edi+2A],al;TBLHeli.FEep_Hw_LED_Capable_2:byte
006E58DF>       jmp         006E5908
006E58E1        mov         eax,esi
006E58E3        mov         byte ptr [edi+2B],al;TBLHeli.FEep_Hw_LED_Capable_3:byte
006E58E6>       jmp         006E5908
006E58E8        mov         eax,esi
006E58EA        mov         byte ptr [edi+2C],al;TBLHeli.FEep_Hw_Pwm_Freq_Min:byte
006E58ED>       jmp         006E5908
006E58EF        mov         eax,esi
006E58F1        mov         byte ptr [edi+2D],al;TBLHeli.FEep_Hw_Pwm_Freq_Max:byte
006E58F4>       jmp         006E5908
006E58F6        mov         eax,esi
006E58F8        mov         byte ptr [edi+2E],al;TBLHeli.FEep_SPORT_Capable:byte
006E58FB>       jmp         006E5908
006E58FD        mov         eax,esi
006E58FF        mov         byte ptr [edi+2F],al;TBLHeli.FEep_Nondamped_Capable:byte
006E5902>       jmp         006E5908
006E5904        mov         byte ptr [esp],0
006E5908        movzx       eax,byte ptr [esp]
006E590C        pop         edx
006E590D        pop         edi
006E590E        pop         esi
006E590F        pop         ebx
006E5910        ret

```



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

走了好多弯路，先是看完了IDR逆向后的代码，然后发现根本找不到具体的数据解析，只好选择用动态调试。然后动态调试，发现代码位置和IDR对不上，导致我根本断点断不住读取配置的地方。后来发现是IDR逆向的客户端和OD调试的不是一个，弄成同一个之后代码地址啥的都一样了。

然后追代码发现有些地方走向和我之前想的不一样，我之前追的太过底层了，陷入其中出不来，动态调试以后发现关键的不是读，而是读以后的处理流程。

追踪处理流程，又发现整个数据的来源并不是当初读上来的原数据而是被加工后的数据，又得退回到读取得地方再去找raw数据的处理



未完待续....



## Quote

>https://www.52pojie.cn/thread-615448-1-1.html
>
>http://www.youngroe.com/2019/07/01/Windows/delphi_reverse_summary/
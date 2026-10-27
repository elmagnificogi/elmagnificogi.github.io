---
layout:     post
title:      "BepInEx-Mod"
subtitle:   "Doorstop、winhttp、Mono、IL2CPP"
description: "BepInEx 靠游戏目录里的同名 DLL 进进程。Mono 在静态构造里加载插件，IL2CPP 则在进程里另起一个 CoreCLR。"
date:       2027-10-23
update:     2027-10-23
author:     "elmagnifico"
header-img: "img/seo-head-bg.jpg"
catalog:    true
mermaid:    false
tobecontinued: false
tags:
    - Game
    - Crack
---

## Foreword

上一篇把龙窟破坏者的数据从磁盘上读出来了。那个客户端是 Unity `6000.3.18f1`，脚本走 IL2CPP，玩法不在 Managed 的 C# 程序集里，而在 `GameAssembly.dll`。包能对上表和坐标，改不了正在跑的方法。要挂钩，得先把代码注入进程。Unity 游戏上做这件事，常见的加载器是 BepInEx。

它不改游戏原来的文件。多出来的是一个和系统 DLL 同名的文件，加上一个 `BepInEx` 目录。



## 注入

Windows 加载 exe 时会处理导入表，里面写着需要哪个 DLL 的哪个函数。查找时，Unity 会导入 `winhttp.dll`，exe 所在目录排在 `System32` 前面，游戏目录里如果放了一份同名文件，进程起来拿到的就是这个，这样dll是被修改过的，所以游戏一用，自然就注入了。

这份文件里没有 HTTP。它是 [UnityDoorstop](https://github.com/NeighTools/UnityDoorstop)，BepInEx 用来Hook进程的原生库。导出函数转给 `System32\winhttp.dll`，自己的入口是`doorstop_config.ini`，再去改导入地址表。

Mono 游戏的导入表里没有 `mono_jit_init_version`。`UnityPlayer.dll` 跑起来以后，自己 `LoadLibrary` 加载 `mono-2.0-bdwgc.dll`，再调用 `GetProcAddress`，按名字把这个函数的地址要出来，用它创建脚本域。

Doorstop 改的是 `UnityPlayer.dll` 导入表里、指向 `kernel32.dll` 的 `GetProcAddress` 那一格。找不到 `UnityPlayer.dll` 就改 exe 自己的那一格。日志里的 `Installing IAT hooks` 是这一步。游戏之后再按名字要 `mono_jit_init_version`，进的是 Doorstop 的包装：先打 `Got mono_jit_init_version`，用系统原来的 `GetProcAddress` 把 mono 里的函数地址存下来，再把包装函数的地址交回去。

游戏拿到的指针其实是 `init_mono`。它调用时，包装函数先执行真正的 `mono_jit_init_version`，日志是 `Starting mono domain "Unity Root Domain"`。域建好以后，按 `doorstop_config.ini` 里的 `target_assembly` 把那个 DLL 整份读进内存，用 `mono_image_open_from_data_with_name` 打开，再 `mono_runtime_invoke` 调用里面的 `Doorstop.Entrypoint:Start`。日志对应 `Opening assembly`、`Invoking method`、`Done`。

同一个 DLL 改名为 `version.dll` 或 `dxgi.dll` 也能当代理，看播放器实际导入的是哪一个。

常见的 5 发行包，配置段还叫 `UnityDoorstop`，目标程序集是 `BepInEx\core\BepInEx.Preloader.dll`。6 用 Doorstop 4，Mono 指向 `BepInEx.Unity.Mono.Preloader.dll`，IL2CPP 指向 `BepInEx.Unity.IL2CPP.dll`。入口都是没有参数的 `static void Doorstop.Entrypoint.Start()`。



## 静态构造里才加载插件

`mono_jit_init_version` 返回的时候，托管运行时刚起来，引擎物体还没有。这时去 `new GameObject` 会失败，所以 `Start` 里只做预加载。

它先从 `BepInEx\core` 把 `Mono.Cecil`、`MonoMod.RuntimeDetour`、`0Harmony` 用 `Assembly.LoadFile` 读进来。游戏的 Managed 里有时会自带同名程序集，不先占住，后面的解析会走到游戏那一份上。

接着用 Mono.Cecil 打开 Managed 里的程序集，改 IL。结果留在内存里再交给 Mono 加载，不写回磁盘。bepis 写过这个取舍：游戏更新、文件校验对不上的是旁边多出来的文件，不是原来的程序集。带反作弊的游戏仍可能拒绝 exe 旁边的代理 DLL，那是在查谁被加载进来，不是在查托管补丁改没改字节。

插件要等引擎能创建物体。做法是在某个类型的静态构造函数开头插入调用。类型第一次被用到，运行时会先跑这个构造。6 的默认目标，Unity 2017 以后是 `UnityEngine.CoreModule.dll` 里的 `Application..cctor`。Unity 5 到 2017 之前是 `UnityEngine.dll` 的 `Application`。再早是 `MonoBehaviour..cctor`。没有这个构造函数就造一个，里面原来只有一条 `ret`。插进去的是 `ldnull`，然后 `call UnityChainloader.StaticStart`。那个 null 是游戏路径，路径在预加载时已经从 Doorstop 的环境变量读过了。

5 没有拆出 `UnityChainloader`，静态构造里调用的是无参的 `Chainloader.Start`。这个方法会检查预加载有没有先初始化过，没有就直接抛错。

有的游戏这个构造跑得太早，或者根本碰不到 `Application`。`BepInEx.cfg` 里的 `Preloader.Entrypoint` 可以换成别的类型和方法，文档里用过 `Camera..cctor`。换的方法必须真的会被调用。预加载日志是齐的、插件一个都没有，经常就是入口没跑到。

`StaticStart` 里创建一个叫 `BepInEx_Manager` 的 `GameObject`，并 `DontDestroyOnLoad`。6 直接加上 `HideFlags.HideAndDontSave`。5 默认不隐藏，`HideManagerGameObject` 打开才隐藏。有的游戏会扫场景里不认识的物体。



## plugins 里的 DLL 怎么挂上

Chainloader 扫 `BepInEx\plugins`。先用 Cecil 看类型，不跑构造函数。Mono 插件要继承 `BaseUnityPlugin`，并带 `BepInPlugin`。GUID、名字、版本缺一就跳过。同一个 GUID 只留版本号更高的那份。`BepInProcess` 对不上当前进程名的也跳过。剩下的按 `BepInDependency` 做拓扑排序，硬依赖没装，这份以及依赖它的都会跳过。

通过检查的用 `Assembly.LoadFile` 载入，再 `ManagerObject.AddComponent`。`BaseUnityPlugin` 就是 `MonoBehaviour`，所以 `Awake`、`Update`、`OnGUI` 是 Unity 自己的回调。配置写到 `BepInEx\config` 下以 GUID 命名的 cfg，日志在 `BepInEx\LogOutput.log`。

改游戏方法用的是 HarmonyX，底下是 MonoMod.RuntimeDetour。Prefix 在原方法前面跑，返回 false 就不进入原方法。Postfix 在后面，可以改返回值。Transpiler 换的是方法里的 IL。Unity 自带的 Mono 经常没有完整的 `System.Reflection.Emit`，`DynamicMethod` 会抛 `NotImplementedException`。把 Preloader 的 `HarmonyBackend` 设成 `cecil`，补丁改由 Cecil 生成，不走 Reflection.Emit。

`BepInEx\patchers` 比这更早。程序集还没进 CLR，这些 DLL 就用 Cecil 改类型结构，可以加字段、加类，或者换掉整个程序集。Harmony 做不到，它面对的是已经加载的方法，多个插件改同一处时还要能叠在一起。能用 Harmony 的地方，官方也不建议再写 patcher。



## IL2CPP 得自己带运行时

龙窟破坏者走这条。Managed 里没有可执行的游戏程序集，C# 在打包时编成了 C++，再进 `GameAssembly.dll`，类型和方法名留在 `global-metadata.dat`。Doorstop 换成包装 `il2cpp_init`。原函数返回之后，配置里如果写了 CoreCLR 的路径，就把 `dotnet\coreclr.dll` 载入进程，用 `coreclr_initialize` 建一个叫 `Doorstop Domain` 的应用程序域，再 `coreclr_create_delegate` 调到 `Doorstop.Entrypoint.Start`。`doorstop_config.ini` 的 `Il2Cpp` 段里，`coreclr_path` 默认是 `dotnet\coreclr.dll`，`corlib_dir` 默认是 `dotnet`。文件不在就跳过，不会去调用 `Start`。

这个 CoreCLR 和 IL2CPP 不是同一个运行时。插件是普通的 .NET 程序集，看不到游戏里的类型。`Il2CppInteropManager` 用 Cpp2IL 读 `GameAssembly.dll`（有的包是 `UserAssembly.dll`，Linux 上是 `libil2cpp.so`）和 metadata，把类和方法的形状还原出来，再生成代理。代理方法转到 `il2cpp_` 那组原生接口。生成前对 `GameAssembly.dll`、引擎引用库和生成器版本做 MD5，写在 `BepInEx\interop\assembly-hash.txt`。对得上就用 `BepInEx\interop` 里的缓存，对不上才重新生成，所以第一次启动会在这里停很久。引擎引用库游戏包自己不带，按 Unity 版本从 `unity.bepinex.dev/libraries/{版本}.zip` 下载，放到 `BepInEx\unity-libs`。

IL2CPP 插件的基类是 `BasePlugin`，入口是 `Load`，不是 `MonoBehaviour.Awake`。CoreCLR 里创建不了引擎物体。要逐帧跑，用 Il2CppInterop 的 `ClassInjector` 把行为类注册进 IL2CPP，再挂到游戏那边的物体上。

Harmony 在这里也补不到 IL，方法体已经是机器码。`Il2CppInterop` 注册的是 `Il2CppInteropDetourProvider`，补丁写成函数入口上的跳转。编译时被内联掉的那段没有入口，拦不住。

5 的稳定包覆盖的是 Mono。IL2CPP 用 6，Doorstop 升到 4。进程内自带 CoreCLR 是 2022 年那次改动加上的，更早的 IL2CPP 包宿主还是 Mono。



## Summary

Mono 的包和 IL2CPP 的包不能换着放。一边等的是 `mono_jit_init_version`，另一边等的是 `il2cpp_init`，挂错了，`plugins` 目录里的东西不会被加载。



## Quote

> https://github.com/BepInEx/BepInEx
>
> https://github.com/NeighTools/UnityDoorstop
>
> https://bepis.io/blog/binding-redirects/
>
> https://docs.bepinex.dev/articles/dev_guide/preloader_patchers.html

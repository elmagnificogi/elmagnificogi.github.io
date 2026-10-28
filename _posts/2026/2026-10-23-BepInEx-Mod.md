---
layout:     post
title:      "BepInEx Mod入门"
subtitle:   "Doorstop、IL2CPP、Harmony、配置、热加载"
description: "BepInEx-Mod，UnityDoorstop、IL2CPP、CoreCLR、Harmony、Config.Bind、热加载。"
date:       2026-10-29
update:     2026-10-29
author:     "elmagnifico"
header-img: "img/z1.jpg"
catalog:    true
mermaid:    false
tobecontinued: false
tags:
    - Game
    - Unity
    - BepInEx
    - Crack
---

## Foreword

上一篇把龙窟破坏者的 Wiki 做出来了，还没想过弄 mod。人家好歹全程联网，mod 听起来就不合适。

没想到你不做就有别人做，还是 AI 做的。看了一眼，基本全是生成的，东西也能用。那就顺着 BepInEx 把mod的执行流程弄清楚。




## BepInEx

[BepInEx](https://github.com/BepInEx/BepInEx) 是 Unity 游戏里很常见的插件框架，解压到游戏根目录就能用。自带配置和日志，改游戏方法主要靠 Harmony；真正把代码塞进进程的是底下的 [UnityDoorstop](https://github.com/NeighTools/UnityDoorstop)。

它分 Mono 和 IL2CPP 两套包，不能换着放。龙窟破坏者走 IL2CPP，要用 6。

以前玩雨中冒险 2、护核纪元等等，打 mod 其实就是这一套。

怪猎世界、曙光、荒野是另外一路。它们不是 Unity，BepInEx 插不进去；常见是 [Fluffy Mod Manager](https://www.nexusmods.com/site/mods/818) 管安装，Rise / 荒野再叠 [RE Framework](https://github.com/praydog/REFramework)。RE Framework 用的是根目录里的 `dinput8.dll` 代理；BepInEx 这边常见是 `winhttp.dll`。本质都是 DLL 劫持，只是系统库不一样。



## BepInEx 6 结构

把 BepInEx 6 的 IL2CPP 包解到游戏根目录（和 `Vaultbreakers.exe` 同级），大致会多出这些东西：

| 名字 | 作用 |
| --- | --- |
| `winhttp.dll`（有的包是 `version.dll` / `dxgi.dll`） | Doorstop 的代理 DLL，游戏一加载这个导入名就进了你的库 |
| `doorstop_config.ini` | 告诉 Doorstop 去跑哪个托管入口、IL2CPP 时 CoreCLR 在哪 |
| `BepInEx\core\` | 预加载器、Harmony、Cecil 这些核心程序集 |
| `BepInEx\plugins\` | 你自己或别人的插件 DLL 放这里 |
| `BepInEx\patchers\` | 比插件更早、用 Cecil 改程序集结构的东西；多数情况用不到 |
| `BepInEx\config\` | 第一次跑起来之后生成的配置 |
| `BepInEx\LogOutput.log` | 总日志；注入成没成、插件挂没挂 |
| `dotnet\` | IL2CPP 包自带的 CoreCLR，给插件当托管运行时 |

第一次启动往往会停很久。IL2CPP 要生成 `BepInEx\interop` 里那一堆代理程序集，下一次启动就可以用这个缓存了。



## 注入

### Mono/IL2CPP

|         | Mono                                                      | IL2CPP                                                       |
| :------ | :-------------------------------------------------------- | :----------------------------------------------------------- |
| 打包    | 游戏目录里常有 `Managed\`，里面一堆 `.dll`                | 脚本被提前编译成 C/C++，再编进 `GameAssembly.dll`，旁边是 `il2cpp_data\Metadata\global-metadata.dat` |
| 运行时  | 进程里跑 Mono（或新一点的 .NET），能直接加载/反射这些 DLL | 跑的是原生代码；没有可执行的游戏 C# DLL 给你随便 `Assembly.Load` |
| 识别    | 有 `Managed`，有 `Assembly-CSharp.dll` 一类               | 有大体积 `GameAssembly.dll`，根目录通常看不到游戏脚本 DLL    |
| BepInEx | 5 / 6 的 Mono 包                                          | 必须用 6 的 IL2CPP 包，还要自带 CoreCLR + 生成 interop       |

龙窟破坏者是 **IL2CPP**：玩法脚本编进了 `GameAssembly.dll`，旁边是 `il2cpp_data\Metadata\global-metadata.dat`。

Windows 加载 exe 时会处理导入表。查找时，exe 所在目录排在 `System32` 前面。Unity 会导入 `winhttp.dll`，游戏目录里放一份同名文件，进程起来拿到的就是这份——代理 DLL 就这么进来了。

文件名是 `winhttp.dll`，内容却不是微软那套 HTTP 库，而是 UnityDoorstop：把自己的导出转给真正的 `System32\winhttp.dll`，再读 `doorstop_config.ini` 去做 hook。游戏要的是「名叫 winhttp 的 DLL」，不管里面是不是真 HTTP，所以会加载。有的播放器导入的是 `version.dll` / `dxgi.dll`，就把同一份代理改成对应文件名，原理一样。



### Doorstop

Doorstop 找的是 `il2cpp_init`，原函数返回之后，若 ini 里写了 CoreCLR 路径，就把 `dotnet\coreclr.dll` 载入进程，`coreclr_initialize` 建一个叫 `Doorstop Domain` 的应用程序域，再 `coreclr_create_delegate` 调到 `Doorstop.Entrypoint.Start`。目标程序集是 `BepInEx.Unity.IL2CPP.dll`。`doorstop_config.ini` 的 `Il2Cpp` 段里，`coreclr_path` 默认 `dotnet\coreclr.dll`，`corlib_dir` 默认 `dotnet`。文件不在就跳过，不会去调 `Start`。

入口仍是无参的 `static void Doorstop.Entrypoint.Start()`。



### CoreCLR

游戏这边的脚本已经是原生码了，直接看不到 `GameAssembly` 里的类。BepInEx 在进程里另起 CoreCLR，专门跑插件。

`Il2CppInteropManager` 用 Cpp2IL 读 `GameAssembly.dll`（有的包是 `UserAssembly.dll`）和 metadata，把类和方法的形状还原成代理程序集，调用时再转到 `il2cpp_` 那组原生接口。生成前对 `GameAssembly.dll`、引擎引用库和生成器版本做 MD5，写在 `BepInEx\interop\assembly-hash.txt`。引擎引用库游戏包不带，按 Unity 版本从 `unity.bepinex.dev/libraries/{版本}.zip` 下载到 `BepInEx\unity-libs`。



## plugins

BepInEx 自己的 Chainloader 会去翻 `BepInEx\plugins` 目录。它先只读 DLL 里有哪些类型，找到挂了 `[BepInPlugin]` 的才认作插件

- 上面要写 GUID、名字、版本。同一个 GUID 出现多份时只留版本更高的；
- 如果还标了 `[BepInProcess]`，进程名对不上当前游戏 exe 的直接跳过。

龙窟中，插件基类是 `BasePlugin`，入口是 `Load`。配置写到 `BepInEx\config\<GUID>.cfg`，总日志在 `LogOutput.log`。

改游戏方法用 HarmonyX。IL2CPP 下方法体已经是机器码，补丁在函数入口跳转上；常见写法：

| 写法 | 干什么 |
| --- | --- |
| Prefix | 原方法前面跑；返回 `false` 就不进原方法 |
| Postfix | 原方法后面跑，可以改返回值 |

CoreCLR 里创建不了引擎物体。要逐帧跑，用 Il2CppInterop 的 `ClassInjector` / `AddComponent` 把行为注册进 IL2CPP，再挂到游戏那边的物体上。

另外还有个目录叫 `BepInEx\patchers`，和 `plugins` 不是一回事。里面的 DLL 会在插件 `Load` 之前跑，用 Mono.Cecil 直接改程序集长什么样——比如加字段、加类、整份换掉某个程序集。

Harmony 做的是「方法已经被加载之后，在入口挂跳转」；patcher 动的是更早、更底层的结构。多数自己写的功能用 Harmony 就够了，官方也更建议能不用 patcher 就别用，难调试，也难和别人的模组一起使用。



## Mod

注入链路清楚以后，自己要的功能就是：找到游戏里的类和方法，写一个插件 DLL，丢进 `plugins`。



### 确认框架可注入

1. 游戏根目录放的是 **IL2CPP** 包，不是 Mono 包。
2. 启动一次，等 `BepInEx\interop` 生成完。
3. 打开 `BepInEx\LogOutput.log`，能看到 Doorstop / Preloader / Chainloader 正常跑完。

日志齐全、插件目录却是空的，先别写业务代码——入口没起来，后面怎么编译都白扯。



### 找要改的点

和做 Wiki 同一条路：

1. 用 Il2CppDumper 出 `dump.cs`，搜你关心的类名、方法名。
2. 第一次启动之后，到 `BepInEx\interop` 里用 dnSpy / ILSpy 对照代理程序集。字段、方法在代理里常常是公开的，跟 `dump.cs` 对得上就能在插件里直接引用。

想改掉落、UI、某次网络回包，先在名单里把「谁在什么时候被调用」定位到，再决定用 Prefix 拦掉、还是Postfix 改返回值。



### 建插件工程

官方模板：

```bash
dotnet new install BepInEx.Templates --nuget-source https://nuget.bepinex.dev/v3/index.json
dotnet new bep6plugin_unity_il2cpp -n VaultbreakersSomething
```

IL2CPP 插件骨架大致是：

```csharp
using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;

[BepInPlugin("com.example.vb.something", "Vaultbreakers Something", "1.0.0")]
public class Plugin : BasePlugin
{
    public override void Load()
    {
        Log.LogInfo("loaded");
        Harmony.CreateAndPatchAll(typeof(Patches));
    }
}

// TargetType / TargetMethod 换成 dump / interop 里看到的名字
[HarmonyPatch(typeof(TargetType), nameof(TargetType.TargetMethod))]
class Patches
{
    // Prefix：原方法还没跑。返回 false 就跳过原方法；true 或不写返回值则继续进原方法
    [HarmonyPrefix]
    static bool Before(TargetType __instance)
    {
        // 拦掉、改参数、或只打日志
        return true;
    }

    // Postfix：原方法已经跑完。__result 是返回值，可以改
    [HarmonyPostfix]
    static void After(TargetType __instance, ref bool __result)
    {
        // 改状态、改 __result、或只打日志
    }
}
```

类上的 `[HarmonyPatch]` 指定要钩哪一个方法；下面用 `[HarmonyPrefix]` / `[HarmonyPostfix]` 分别挂到前面说的两种时机。`__result` 的类型要和原方法返回值一致，没有返回值就别写这个参数。

工程里要引用游戏生成出来的 interop 程序集，以及 BepInEx / Harmony 相关包。模板会带一部分；游戏逻辑那部分指到 `BepInEx\interop` 里对应的 dll。

编出来的插件 DLL 拷到 `BepInEx\plugins`，再开一次游戏。`LogOutput.log` 里出现你的 GUID 和 `loaded`，说明Chainloader 正常加载了。



### 配置

`BasePlugin` 自带 `Config`（类型是 `ConfigFile`）。第一次 `Bind` 并跑起来之后，会在 `BepInEx\config\` 下生成以插件 **GUID** 命名的文件，例如 GUID 是 `com.example.vb.something`，文件就是：

`BepInEx\config\com.example.vb.something.cfg`

格式接近 ini：`[段名]` 分组，下面 `键 = 值`。`##` 是给人看的说明，`#` 开头那几行是类型和默认值注释，改的时候一般只动等号右边。

```ini
[General]

## 启动时是否启用本插件逻辑
# Setting type: Boolean
# Default value: True
Enabled = true

## 倍率一类的数字配置
# Setting type: Single
# Default value: 1
Multiplier = 1.5
```

程序里不用自己读文件。在 `Load` 里 `Bind` 一次，以后用返回的 `ConfigEntry<T>.Value` 取值；改 `.Value` 也会写回同一个 cfg。

```csharp
using BepInEx.Configuration;

ConfigEntry<bool> enabled;
ConfigEntry<float> multiplier;

public override void Load()
{
    enabled = Config.Bind(
        "General",           // 对应 cfg 里的 [General]
        "Enabled",           // 键名
        true,                // 默认值；文件不存在或没有这一项时用它
        "启动时是否启用本插件逻辑"); // 写进 ## 说明

    multiplier = Config.Bind("General", "Multiplier", 1f, "倍率一类的数字配置");

    if (!enabled.Value)
        return;

    Log.LogInfo($"multiplier={multiplier.Value}");
    Harmony.CreateAndPatchAll(typeof(Patches));
}
```

`Bind` 四个参数就是：段名、键名、默认值、说明。Harmony 的 Prefix / Postfix 里要用的话，把 `ConfigEntry` 做成 `static`，或在 `Load` 里存到静态字段，补丁里读 `enabled.Value` 即可。手改 cfg 之后，默认要重启才会重新读进内存；想边改边试，看下一节热加载。



### 热加载

正式给玩家用的 mod，几乎都是**冷加载**：游戏启动时 Doorstop → BepInEx → Chainloader 扫 `plugins`，DLL的加载就定了。关游戏再开，才能加载新的dll。

自己调试时这套很烦。改一行 Prefix，就要退回桌面、等 IL2CPP / interop、再进主菜单，几分钟没了。所以才需要**热加载**：游戏还开着，把旧逻辑卸掉，再把新编出来的 DLL 装进去。

思路就两步，和语言无关：

1. **卸干净**：Harmony 补丁 `UnpatchSelf`，自己创建的物体毁掉，静态字段、事件订阅、计时器清掉。卸不干净，下一次再挂就会叠两层 Prefix，或者旧对象还在场景里。
2. **再装一份**：重新 `Assembly.Load`（或等价加载）新 DLL，再跑入口、再 `CreateAndPatchAll`。CLR 里已经加载过的程序集名通常卸不掉，调试器用的加载器往往会给程序集加时间戳后缀，等于每次当新程序集。

cfg 的 `.Value` 只能热改「开关和数字」；**改的是 C# 代码**，必须走上面这套卸了再装。



#### Mono 游戏

官方调试套件 [BepInEx.Debug](https://github.com/BepInEx/BepInEx.Debug) 里的 ScriptEngine 就是干这个的：

1. 把 `ScriptEngine.dll` 放进 `BepInEx\plugins`（常驻，只装一次）。
2. 正在开发的插件不要放 `plugins`，改放到 `BepInEx\scripts`。
3. 游戏里默认按 **F6** 重载；也可以开文件监视，DLL 一覆盖就自动重载。

插件里必须写清理。Mono 上常见是 `OnDestroy`：

```csharp
Harmony harmony;

void Awake()
{
    harmony = Harmony.CreateAndPatchAll(typeof(Patches));
}

void OnDestroy()
{
    harmony?.UnpatchSelf();
    // 自己 new 出来、又没挂在 ScriptEngine 父物体下的东西，这里一并清掉
}
```

重载后调试器里看到的程序集名会变（带一串后缀）。需要断点时，打开 ScriptEngine 的 `DumpAssemblies`，从倒出来的 DLL 再附着，或者在入口打 `Debugger.Break()`。



#### IL2CPP

龙窟是 IL2CPP，ScriptEngine 那套 Mono 宿主用不了。思路一样，换一个会监视文件的常驻插件，例如 [BepInEx.IL2CPP.AssemblyLoader](https://github.com/zongjingyao/BepInEx.IL2CPP.AssemblyLoader)：

1. `AssemblyLoader.dll` 放 `BepInEx\plugins`，游戏开着时它一直在。
2. 你正在改的代码编成 `Payload.dll`，丢进 `BepInEx\assembly`。
3. 加载器调 `static void Main()` 当作入口；文件一变就先调 `static void Unload()`，再加载新 DLL。

`Unload` 里同样要拆 Harmony、拆自己挂上去的组件，否则热加载等于泄漏。

```csharp
static Harmony harmony;

public static void Main()
{
    harmony = Harmony.CreateAndPatchAll(typeof(Patches));
}

public static void Unload()
{
    harmony?.UnpatchSelf();
    harmony = null;
}
```

工程上可以加 `PostBuild`，编译完自动拷到游戏的 `assembly` 目录，省得每次手拖。



#### 边界

| 能热加载 | 不能 |
| --- | --- |
| 自己插件里的 Harmony、逻辑、大部分配置开关 | Doorstop / BepInEx 本体、第一次生成的 `interop` |
| 反复改 Prefix / Postfix 试效果 | 已经写进存档、已经发给服务器的状态 |
| 开发期放 `scripts` / `assembly` | 给别人分发时仍应回到普通 `plugins` 冷加载 |

热加载是开发加速，不是发布形态。发出去的包还是放 `plugins`，让玩家正常启动加载；`Unload` / `OnDestroy` 就算发布包里留着也无妨，只是冷启动用不上。



## Summary

对BepInEx有了一些了解，后续自己做mod或者给AI去工作，也可以快速完成我想要的东西。



## Quote

> https://github.com/BepInEx/BepInEx
>
> https://github.com/NeighTools/UnityDoorstop
>
> https://www.nexusmods.com/site/mods/818
>
> https://github.com/praydog/REFramework
>
> https://github.com/BepInEx/BepInEx.Templates
>
> https://docs.bepinex.dev/master/articles/dev_guide/plugin_tutorial/2_plugin_start.html
>
> https://docs.bepinex.dev/master/articles/dev_guide/plugin_tutorial/4_configuration.html
>
> https://github.com/BepInEx/BepInEx.Debug
>
> https://github.com/zongjingyao/BepInEx.IL2CPP.AssemblyLoader

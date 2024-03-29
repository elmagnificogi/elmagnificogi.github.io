---
layout:     post
title:      "unity入门与金庸群侠传"
subtitle:   "cg，jynew"
date:       2021-08-14
update:     2021-08-17
author:     "elmagnifico"
header-img: "img/blackboard.jpg"
catalog:    true
mathjax:    false
tags:
    - Unity 3D
---

## Foreword

看到了金庸群侠传的3d重置，刚好也是unity入门的机会，于是试一试。



## 金庸群侠传3D重制版

金庸群侠传3D重制版是一个非盈利游戏项目，重制经典游戏《[金庸群侠传](https://zh.wikipedia.org/wiki/金庸群俠傳)》（[在线玩DOS原版](https://dos.zczc.cz/games/金庸群侠传/)）并支持后续一系列MOD和二次开发。

我们承诺：除了爱好者的自愿捐款以外，不会在任何渠道取得收入，游戏亦不会在任何游戏平台进行发布。最终的代码、资源、包体都仅供学习使用，请勿用于任何商业目的。一切再度商用均不被本项目允许和授权，如果有任何侵犯您的权益，欢迎与我们取得联系。

> https://github.com/jynew/jynew
>
> # 我如何为此项目做贡献？
>
> 本项目对社区完全开放，希望有兴趣的朋友都参与本项目，你可以参阅[金庸群侠传3D重制版 社区贡献指南](https://github.com/jynew/jynew/blob/main/CONTRIBUTING.md)来了解如何向本项目贡献代码及资源。
>
> 如果您从未使用过github，我们也专门准备了教程：[（0基础科普）写给新手的金群重制版github使用教程](https://github.com/jynew/jynew/wiki/写给新手的金群重制版github使用教程)



简单说主制作人是汉家松鼠成功，非商业化，全凭兴趣而作，当然真商业化也搞不定这个金庸的版权问题，太难了。视频介绍啥的我大概都过了一遍，总体来说比较简单，基本上是当年DOS原版的1：1复刻，而成功这样开源出来，也可以当作是制作类似游戏的一个模板，甚至包装包装，加一些辅助工具，就可以做成一个RPG maker了。



成功专门开了一个群：金庸群侠传3D重制开发 gayhub狱友俱乐部，然后400多人，实际github上共享就22个人，可以说非常真实了。其实还有另外一个问题，游戏开发还没有简单到可以任何小白没基础就能参与，至少仅仅凭借当前的这点资料和视频讲解是不够的。

现在武侠题稍微有点老了(大概只有60-95以前的人关注稍微多一些)，主流现在开始往仙侠之类的方向发展了，比如硅谷八荒，修仙模拟器。



### 入门

> https://github.com/jynew/jynew/wiki/1.1%E5%87%86%E5%A4%87%E5%BC%80%E5%A7%8B

主要看这里，先把unity环境弄下来，然后拉代码，就是代码有点大，挂着梯子还下了老半天。

然后第一次打开工程，崩溃了两次（主要是unity联网被拒绝了，单独开防火墙才正常），才正常打开。

然后没啥问题的话，直接P就能玩了。



### 工程目录介绍

拿到一个工程得先弄清楚，各个目录下面都是些什么，了解清楚整体框架再说，这个GitHub上没有详细介绍，说的比较零散，我自己总结一下

- COMMUNITY_LICENSE_FOR_JYX2，这个主要是开源协议之类的东西，非专业人士就别管理



- docs，相关文档存储的地方
  - UI整理
  - 战斗加载流程
  - 其他系统架构之类的文档



- jyx2，这里就是主要的unity工程目录
  - Assets
  
    - XLua，主要用来对Lua封装一次
  
    - Scripts
      - LuaCore，lua的核心，每个api也在这里实现
  
  - data
    - Cache
    - data
    - Debug
    - HSConfig Table
    - lua，主要的lua脚本存放在这里
      - jygame，存放游戏内的每个事件脚本，命名规则为ka[事件id]
      - main.lua  这里进行新脚本api的注册
    - Scripts
    - Translate
    
  - excel，简单说游戏里的一些静态信息，比如人物位置，场景位置，词条，属性等等，他们多数都是通过一个excel配置而成的，每个都有各自的格式，只需要模仿对应的格式就可以增删改查了，类似数据库的概念。只是游戏这里常常用excel，方便策划等非专业的进行修改。更高级一些可能会用一些高级工具来修改属性，最后导出excel或者其他格式的数据来给游戏使用。(这里发现个小疑问，游戏里柜子宝箱中的物品是在哪里配置的)
  
  - Library
  
  - Logs
  
  - Packages
  
  - ProjectSettings
  
  - reg
  
  - Temp
  
  - Tools
  
  - UserSettings



- tools，一些实用工具，但是都是别人的作品，所以外链自己下吧



### 游戏机制



#### 触发器

简单说就是一个小场景中，地图里预埋了各种触发器，比如位置触发器（根据位置响应事件，触发剧情，拾取道具，触发下一个触发器等等，甚至你可以认为NPC也是一个触发器，他们共同作用推动游戏进程）,操作触发（对话，交互等）



DOS版的触发器基本是基于人物位置，而3D版本重置后，触发器是基于空间碰撞（看起来像是3维，其实还是2维，因为人物不能做出超过本身碰撞体积的动作，所以还是2D位置触发）。DOS版本的动画就是一个个预先做好的小图一帧一帧显示而已。

> https://github.com/jynew/jynew/wiki/1.2%E6%B8%B8%E6%88%8F%E8%BF%90%E8%A1%8C%E6%9C%BA%E5%88%B6



#### 脚本、事件、蓝图

经常听说脚本，不过这里的脚本只是指游戏里触发后执行的流程而已，也有人叫事件，意思是一个意思。只不过脚本更口语，事件更专业一些。而蓝图我觉得直接理解为一个可以用来串联各种子动作或者子事件的工具或者说编辑器，更为合适。当然蓝图以图的形式展现脚本流程，看起来更容易理解一些，类似于houdini或者maya他们的连接节点，也是为了方便策划或者非专业的进行游戏中流程制作。

> https://github.com/jynew/jynew/wiki/%E6%B8%B8%E6%88%8F%E4%BA%8B%E4%BB%B6%E8%84%9A%E6%9C%AC



- lua脚本，简单说就是语法精炼，简单，功能有限的一个脚本语言，适合在游戏中使用，适合新手学习使用。

> https://www.zhihu.com/question/21717567

jyx2\data\lua\jygame目录中就是每个对应事件的lua脚本，同时游戏的控制台中可以直接使用lua指令进行调试，比如获取物品，瞬移之类的操作。



- 蓝图，快速可视化脚本编辑，看起来就比较简单

`项目快速导航/游戏事件脚本/蓝图脚本` 打开对应目录，在空白处右键选择 `Create > Jyx2 Node Graph` 进行新建，文件名即对应脚本id。



蓝图也好，lua脚本也好，他们的每个操作可能都需要游戏支持，这就是lua api，游戏内的指令。需要自定义指令的时候也可以看看有没有已经有的，或者可以通过组合完成。

详细指令看连接

> https://github.com/jynew/jynew/wiki/%E6%B8%B8%E6%88%8F%E4%BA%8B%E4%BB%B6%E6%8C%87%E4%BB%A4



## Unity

> 在[开发文档](https://github.com/jynew/jynew/wiki)中，我们除了程序篇以外的部分，都是为`不会程序`的朋友准备，但你可能需要了解一些Unity的基本操作知识；
>
> 接触本项目的程序篇文档，要求对`C#编程`、`Unity的资源加载机制`、`基础的场景管理`、`Unity面向组件的设计模式`、`Monobehavior的生命周期`等概念有基础的了解，否则可能会阅读比较吃力。
>
> [视频教程](https://github.com/jynew/jynew/wiki/金庸群侠传3d重制版视频操作教程)则完全面向0编程基础受众，你只需了解Unity的基础操作，简单了解`lua`编程语言的语法，即可对游戏内容进行调整和创作。

C#编程及不说了，基础，其他的我看看是啥



### Unity的资源加载机制

> 例如纹理转变为Texture2D或Sprite，音效文件转变为AudioClip，预制体变成了GameObject等等。这个由Asset(资源文件)转变为Object(对象)，从磁盘进入内存的过程，就是实例化。而对资源进行的管理，本质上是对Object的管理。

为了实现资源管理和加载，unity的Assets文件夹中的每个文件都会有一个同名的*.meta的文件，其内容主要就是记录这个文件的File GUID和他的相关属性。文件所映射的对象，也是通过这个File GUID来进行引用的。这里的文件自然包括文件夹自己。

而由于对象众多，很多时候一个文件也并不是只有一个对象，可能会有很多个对象，这个时候就通过Local ID进行文件内对象的引用。



又由于他们都是对象，为了方便引用，同时对内存进行管理，File GUID和Local ID又生成了 **Instance ID** ，方便在内存中进行管理。



对于资源文件，Assets，最好是直接在unity中进行操作，这样unity会自动生产对应的GUID等索引文件。同理删除的时候也最好这样，unity才会更新其他引用到这个文件的文件。



> 1.卸载上一个场景的ab资源（可选）
>
> 2.打开场景过渡界面或过渡场景
>
> 3.通知ui退出当前场景的界面，关闭场景ui，回收资源（缓存的gameobject，正在加载的资源）
>
> 4.加载当前场景的ab包（可选）
>
> 5.加载场景（调用unity的SceneManager.LoadScene或SceneManager.LoadSceneAsync接口）
>
> 6.预加载资源（可选）
>
> 7.清理gc，清除无用的资源
>
> 8.通知ui进入新的场景，打开场景ui
>
> 9.关闭场景过渡界面或过渡场景



#### AssetBundle

这个比较关键，但是平时又不太需要关注他。简单说面对庞杂的资源，不可能启动时就全部加载到内存中，所以会先加载一个Header，或者说加载一个目录列表，记录了都有些啥资源，他们的依赖关系。当真的需要用到这个资源的时候，再去实例化到内存中，否则他们都默默躺在硬盘就行了。而对于已经加载过的资源，会对应有缓存机制，从而减少加载的时间，节约内



以上的资源概念都是针对，编译前来说的，编译之后他们会被打包，使用更快更方便的映射方式。



### 场景管理

Scene Manager，主要是提供了一个通用的场景管理的接口。

有2种场景概念，一个是Screen，一个是Level。

- Screen，相当于是一个单独的界面，或者相对独立的场景，不与其他场景有严格的以来关系。

- Level，则是一个有依赖约束关系的场景。



简单说有了场景还不够，还有场景之间的问题。

SMSceneManager，主要是负责切换场景之间的接口

SMLevelProgress，保存场景之间的关系和属性

SMTransition，切换场景的方式，动画效果等



### Unity面向组件的设计模式

简单说，就是设计模式，只是拿到了Unity，如何实践而已。

按我的原则，非性能相关只做最小子集功能，剩下的去排列组合。

没有必要不进行抽象，只会凭空多几个文件，功能又不实现，不如没有。



### Monobehavior的生命周期

0. Reset ：组件首次加载成对象时

1. Awake 函数 :在加载场景时运行 , 即在游戏开始之前初始化变量或者游戏状态 . 只执行一次

2. OnEnable 函数 :在激活当前脚本时调用 , 每激活一次就调用一次该方法

3. Start 函数 :在第一次启动时执行 , 用于游戏对象的初始化 , 在Awake 函数之后执行,只执行一次

4. Fixed Update : 固定频率调用 , 与硬件无关, 可以在 Edit -> Project Setting -> Time -> Fixed Time Step 修改

5. Update : 几乎每一帧都在调用 , 取决于实际的fps

6. LateUpdate : 在Update函数之后调用 , 一般用作摄像机跟随
7. OnWillRenderObject：一个对象将要被显示时调用。

7. OnGUI 函数 : 一般来说至少会又两次调用，一次是layout设置布局，一次是repaint重绘

8. OnDisable 函数 : 和 OnEnable 函数成对出现 , 只要从激活状态变为取消激活状态 , 就会执行一次 (和 OnEnable互斥)

9. OnDestroy 函数 : 当前游戏对象或游戏组件被销毁时执行

![](https://img.elmagnifico.tech/static/upload/elmagnifico/uga7WeCX1xHnJPk.png)



## Summary

今天大概就这么多，后续再添加吧。



## Quote

> https://www.jianshu.com/p/2a7c4a48aaee
>
> https://blog.csdn.net/u012400885/article/details/80035492
>
> https://www.cnblogs.com/zhaoqingqing/p/4288454.html
>
> https://www.cnblogs.com/meteoric_cry/p/7373023.html
>
> https://www.cnblogs.com/wang-jin-fu/p/11128974.html

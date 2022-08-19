---
layout:     post
title:      "回顾我的敏捷流开发"
subtitle:   "Agile Development,AM"
date:       2022-07-08
update:     2022-07-08
author:     "elmagnifico"
header-img: "img/z2.jpg"
catalog:    true
tags:
    - DEV
---

## Forward

基本都学过软件工程，把工程的思想融入到实际的工作中，并且可以从事物的发展之中，再重新提炼出以前学到的工程管理之法，取其精华，去其糟粕。



## 何为敏捷

说敏捷之前，先说瀑布模型，经典的软件生命周期模型，在启动前就需要非常明确的目标和需求，启动以后按照固有的分析、设计、编码、测试、运维等流程进行，同时瀑布流也有着每个阶段明确的文档，所以每个阶段可以是解耦的，只要完成规定的要求即可。但是瀑布也有对应的问题，本身需求可能不明确，可能会变化，面对频繁变动或者理解不完全的项目来说并不适合，而且一个项目的实际分析设计到执行都需要花非常多的时间，前期并不能预见所有可能的问题。实际开发的过程中，完全理解需求或者完整准确的目标基本不存在，所以一开始计划的再大，也赶不上变化更大。瀑布模型于是就变成了其他模型中的一个子环节，大项目下的子目标可能是明确完整的，所以可以按照瀑布流完成。



而为了应对频繁变更的需求和不能准确掌握未来的需求的情况，敏捷应运而生了。敏捷是迭代式的，可以看到高楼平地而起的每一份变化，做足了应对一切的准备。如果说瀑布是面向计划的，那么敏捷就是面向变化的。

敏捷开发以用户的需求进化为核心，采用迭代、循序渐进的方法进行软件开发。在敏捷开发中，软件项目在构建初期被切分成多个子项目，各个子项目的成果都经过测试，具备可视、可集成和可运行使用的特征。换言之，就是把一个大项目分为多个相互联系，但也可独立运行的小项目，并分别完成，在此过程中软件一直处于可使用状态。

经常可以看到说敏捷是缺乏设计和文档，这个不尽然。由于敏捷更新快，所以缺乏文档？这根本说不通。只能说敏捷如果要维护文档，那么敏捷的文档更新频率会非常高而已。同理缺乏设计也是不存在的，每次迭代都需要设计，只是变更的更快而已。

敏捷是面向变化的，所以每次迭代都需要有人拍板定下来的当前要做的需求和最终实现的效果，类似一个小瀑布。但是如果拍板的人对于项目或者需求理解不足，可能就会造成后续多次迭代和反复，所以敏捷非常依赖于拍板的人，一个好的领头可以让效率充分提高。同时敏捷也充分发挥了领头人的主观能动性，避免瀑布模型前期计划时多数人碌碌无为、成天吵架却又定不下来的情况。相对而言敏捷容错性更好，它允许领头人犯错，也有足够多的机会去修正错误。



#### 核心原则

- 主张简单
  - 不要过度设计，经常有一些框架或者一些模型，都设计的大而全，但是实际上当前你只需要10%的功能，未来可能也只需要15%，剩下的设计基本都是冗余。所以建议模型设计的时候不要过度，保持简单，本身是可迭代的，日后再丰满即可。
- 拥抱变化
  - 核心原则
- 可持续性
  - 设计不是一次性的，结合简单模型，让日后有更多的可能，给下次设计留下空白。
- 递增的变化
  - 模型不是一步就膨胀到最终的模样，对应的软件也是一点点变化的，由简到繁，再由繁到简的过程。
- 快速反馈
  - 一个东西持续进步，一定是有反馈的，快速反馈才能及时修正当前前进的方向。



## 我的敏捷

回顾我自己的开发过程，先拿到一个明确的需求，然后快速实现一个简版，在实现的过程中去自我反馈，修正我的设计，快速给出来一个前期等待反馈的版本和简易说明，然后再进行几次小迭代，把一个功能做到尽善尽美的程度，然后再去更新设计文档和使用文档。



## 何时使用敏捷

- 需求不明确
- 没有具体规划

用敏捷主要就是这两点决定的，没有明确需求，所以可以用敏捷来试，寻找真实需求。同理，没有明确规划的情况下，也可以先用敏捷，让子弹飞一会，让小树先长大一些再去规划未来。有的项目能不能活下去都不知道，可以先用敏捷试试，就算凉了，付出的成本也是可接受的范围。



何时不适用敏捷，一个对性能有极致要求的软件不适合敏捷，敏捷的这种开发模式，注定了他与性能无缘，他的迭代和膨胀模式，都会导致性能受到影响。所以如果要开发高性能的东西，就不要过度敏捷了。



## Summary

没有什么绝对的方法论，无论敏捷也好，瀑布也罢，他们只是一种工程上的经验教训的极致总结。实际项目并不都是外包，或者目标不明确的情况，每个项目都得顺势改变一些。

---
layout:     post
title:      "文心一言与ChatGPT短评"
subtitle:   "NewBing，GPT3，GPT3.5，GPT4"
date:       2023-03-18
update:     2023-03-19
author:     "elmagnifico"
header-img: "img/z6.jpg"
catalog:    true
tags:
    - Comment
---

## Foreword

最近类ChatGPT非常火爆，但是百度也要跟着凑热闹，但是我并不看好，谈一谈我自己的观点



## 对比

<iframe src="//player.bilibili.com/player.html?aid=653698039&bvid=BV1hY4y1X7Cs&cid=1057694575&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="720" height="680">  </iframe>



## 文心一言

文心一言是16号发布的，我十七号拿到了测试资格

![image-20230318133614656](https://img.elmagnifico.tech/static/upload/elmagnifico/202303181336764.png)

> https://yiyan.baidu.com/



简单的解释一下人工势场，测试结果只能说十分离谱了。

![image-20230318133755284](https://img.elmagnifico.tech/static/upload/elmagnifico/202303181337367.png)

不是很清楚百度的数据源到底是什么，但是很明显百度这个实在是差太远了，基本等于胡扯。

自然语言的理解也很明显，比ChatGPT差远了



## ChatGPT初级阶段

以目前来说，ChatGPT对自然语音的理解已经非常不错了。但是这个东西真正投入使用，不仅仅是对语言的理解，目前阶段我们只是对ChatGPT进行输入，而貌似我们得到的输出只是语言文字、图片之类东西。但是如果要商用，那么ChatGPT就需要输出分解后的用户的实际需求，然后再对接到第三方进行实现，这个东西才是真正可以商用的内容



这就好比你需要咨询xx，于是找到了一个行业资深的从业者（AI），描述了你的需求，于是他给出了一通分析、给出了一些可能的推荐，最终你从这些推荐中选择了一个你满意的，并进行尝试。



目前ChatGPT提供的API还只是自然语言的理解和回答，商业需要的是能输出对应的指令，就比如简单的智能家居命令

```
目前的语音助手：
小爱同学，请开灯
小爱同学，请关灯，打开空调，保持26度

自然语言
好黑，看不见了
别浪费电了，关灯吧，好热啊，开个空调吧
```

自然语言肯定不会说的这么标准，那么就希望ChatGPT可以理解并且将其转换成对应的API指令，传递给第三方，实现最终的效果

```
灯，打开
灯，关闭
空调，打开
空调，温度，26
```

当然现在直接教ChatGPT，告诉他按照某些规则进行输出，做角色扮演是可以的，只是目前实现肯定还是不够优雅，能满足的情况并不够好。

实际上各种图片或者视频之类的处理，本质上就是我上面说的将用户的输入转换成了API指令，然后调用了其他模型，返回结果后再转给用户。

至于使用ChatGPT写代码，那就大可不必了，简单的代码确实能写，不过这种程度的我还需要你吗？Code Pilot不香嘛

目前我能想到的应用场景大部分都和搜索和顾问、咨询、客服一类的东西相关，以前可能需要人去理解的东西，大部分情况可以让AI去理解或者说让AI做80%的普通问题，剩下20%交给专业的人。



我估计下一阶段ChatGPT会开放更加商业化的API，可以轻易的将指令传输到第三方。

![image-20230319173140568](https://img.elmagnifico.tech/static/upload/elmagnifico/202303191731654.png)

## 搜索与担忧

如果有一天ChatGPT代替了搜索，那么担忧就来了。首先ChatGPT的内容是训练的，那么他的数据库里有什么就非常关键了，不想你搜到的，那你就绝对找不到。甚至ChatGPT自己就可以做过滤，直接将一些内容彻底屏蔽。

如果只是屏蔽，倒是罢了。可怕的是他在无形之中将推广、营销、各种广告概念也融入其中，那么最终出现的这个到底是个什么东西？现在来看百度水平不够，还没走到那一步，技术不会做恶，但是人会，终有一天他会拿这个来牟利，那时你得到的又是什么？

现在搜索好歹还有一个小小的`广告`标签，当那一天到来的时候，还会有吗？



ChatGPT目前不仅仅是搬运文字而已，他是带有一定的推理和理解能力的，从目前来说这里还有非常大的漏洞，可以被用来做很多灰色、黑色的事情。同样的，ChatGPT的进化过程中，如何能让他不过分推理理解，不在原本的内容上胡说八道，这我觉得更重要。如果我想要的仅仅是一个ChatGPT作为知识库的助手，那么就更不能让他过分理解和二次解释。



## Summary

让时间走起来



## Quote

> http://www.taodudu.cc/news/show-4811339.html
>
> http://pg.jrj.com.cn/acc/Res/CN_RES/INDUS/2023/2/14/5be2a09e-5ab3-41af-940d-0fdc97240d38.pdf
>
> https://hub.baai.ac.cn/view/24531
>
> https://zhuanlan.zhihu.com/p/613378443
>
> https://orangeblog.notion.site/GPT-4-AGI-8fc50010291d47efb92cbbd668c8c893
>
> https://www.bilibili.com/video/BV1Tc411L7UA

---
layout:     post
title:      "Youtube 自动英文字幕"
subtitle:   "GreasyFork,Tampermonkey,AutoSubtitles"
date:       2019-03-27
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Tools
---

## Foreword

最近看Youtube，有时候还是需要英文字幕辅助一下，纯靠听力有时候听不懂，看视频的时候就发现点一个视频就要重新打开一次英文字幕，Youtube没有默认的自动开字幕的设置所以想弄个脚本自动打开字幕就行了。

查了一圈油猴脚本发现都没有合适的，都是自动翻译、双字幕脚本等，我只要英文字幕就可以了。

## Script

```Java
// ==UserScript==
// @name         自动英文字幕
// @namespace    http://elmagnifico.me/
// @version      0.1
// @description  show english subtitles automatically.
// @author       elmagnifico
// @match        https://www.youtube.com/watch*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function translateToChinese(){
        var sub = $('[role="menuitem"]:contains("字幕")');
        if(!sub.length) return;
        console.log("点击")
        sub.click();
        var subc = $('[role="menuitemradio"]:contains("英语（自动生成）")');
        if (subc.length) {
            subc.click();
        } else {
            // clouse
            sub.click();
            var autoTrans = $('[role="menuitemradio"]:contains("英语（自动生成）")');
            if (!autoTrans.length) return;
            autoTrans.click();
        }
    }

    function onLoadStart(){
        $('.ytp-subtitles-button[aria-pressed="false"]').click();
        $('.ytp-settings-button').click();
        translateToChinese();
        $('.ytp-settings-button').click();
    }
    $('video').on('loadstart', onLoadStart).trigger('loadstart');
})();
```

## GreasyFork

> https://greasyfork.org/zh-CN/scripts/380989-%E8%87%AA%E5%8A%A8%E8%8B%B1%E6%96%87%E5%AD%97%E5%B9%95

我把脚本发布到了 GreasyFork 上面，这样可以直接安装

#### GreasyFork 发布脚本

GreasyFork的发布太难找了，网站上看了一圈都没看到任何一个和发布相关的内容

找了半天帮助才看到要从用户页面进去才能看到发布按钮

![](https://img.elmagnifico.tech/static/upload/elmagnifico/5c9af4334de76.png)

在用户界面的控制台下才有提交脚本相关内容

![](https://img.elmagnifico.tech/static/upload/elmagnifico/5c9af45071bbc.png)

## Quote

> https://greasyfork.org/zh-CN
>
> https://greasyfork.org/zh-CN/help/writing-user-scripts
>
> https://juejin.im/post/5aa7703c6fb9a028d663d649
>
> https://blog.csdn.net/Senreme/article/details/79939249

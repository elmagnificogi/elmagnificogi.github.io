---
layout:     post
title:      "Youtube 自动英文字幕"
subtitle:   "GreasyFork,Tampermonkey,AutoSubtitles"
date:       2019-03-27
update:     2024-04-04
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - JS
    - Chrome
    - Tampermonkey
---

## Foreword

最近看Youtube，有时候还是需要英文字幕辅助一下，纯靠听力有时候听不懂，看视频的时候就发现点一个视频就要重新打开一次英文字幕，Youtube没有默认的自动开字幕的设置所以想弄个脚本自动打开字幕就行了。

查了一圈油猴脚本发现都没有合适的，都是自动翻译、双字幕脚本等，我只要英文字幕就可以了。

## Script

```Java
// ==UserScript==
// @name         自动英文字幕
// @namespace    http://elmagnifico.tech/
// @version      1.5
// @description  show english subtitles automatically.
// @author       elmagnifico
// @match        https://www.youtube.com/watch*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/380989/%E8%87%AA%E5%8A%A8%E8%8B%B1%E6%96%87%E5%AD%97%E5%B9%95.user.js
// @updateURL https://update.greasyfork.org/scripts/380989/%E8%87%AA%E5%8A%A8%E8%8B%B1%E6%96%87%E5%AD%97%E5%B9%95.meta.js
// ==/UserScript==

(function() {
    'use strict';

    function checkChinese(){
        var sub = $('[role="menuitem"]:contains("字幕")');
        if(!sub.length) return false;
        // show subtitles
        sub.click();
        console.log("打开设置");

        var subc = $('[role="menuitemradio"]:contains("中文")');
        if (subc.length) {
            console.log("原片是中文,退出");
            console.log("关闭字幕");
            var close_btn = $('[role="menuitemradio"]:contains("关闭")');
            if (!close_btn.length) return true;
            close_btn.click();
            return true;
        }else{
            console.log("没有中文");
        }
        return false;
    }

    function translateToEnglish(){
        var sub = $('[role="menuitem"]:contains("字幕")');
        if(!sub.length) return false;
        // show subtitles
        sub.click();
        console.log("打开设置");
        var success = false;

        var subc = $('[role="menuitemradio"]:contains("英语")');
        if (subc.length) {
            console.log("切换到英语(美国)字幕");
            subc.click();
            success = true;
        } else {
            console.log("关闭字幕1");
            var close_btn = $('[role="menuitemradio"]:contains("关闭")');
            if (!close_btn.length) return false;
            close_btn.click();
        }

        if(success == false)
        {
            subc = $('[role="menuitemradio"]:contains("英语 (自动生成)")');
            if (subc.length) {
                console.log("切换到英语(自动生成)字幕");
                subc.click();
                success = true;
            } else {
                console.log("关闭字幕2");
                close_btn = $('[role="menuitemradio"]:contains("关闭")');
                if (!close_btn.length) return false;
                close_btn.click();
            }
        }

        if(success == false)
        {
            subc = $('[role="menuitemradio"]:contains("英语")');
            if (subc.length) {
                console.log("切换到英语字幕");
                subc.click();
            } else {
                console.log("关闭字幕3");
                close_btn = $('[role="menuitemradio"]:contains("关闭")');
                if (!close_btn.length) return false;
                close_btn.click();
            }
        }
    }

    function onLoadStart(){
        $('.ytp-subtitles-button[aria-pressed="false"]').click();
        $('.ytp-settings-button').click();
        if(checkChinese() == false)
        {
            $('.ytp-settings-button').click();
            translateToEnglish();
            $('.ytp-settings-button').click();
        }
        console.log("关闭设置");
        $('.ytp-settings-button').click();
    }
    $('video').on('loadstart', onLoadStart).trigger('loadstart');
})();
```

2024年更新了一下，之前中文也会默认点出来字幕很蠢，这次给他去掉了



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

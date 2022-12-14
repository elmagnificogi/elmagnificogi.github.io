---
layout:     post
title:      "博客增加文章点击统计和显示"
subtitle:   "统计、不蒜子、LeanCloud"
date:       2022-12-14
update:     2022-12-14
author:     "elmagnifico"
header-img: "img/docker-head-bg.jpg"
catalog:    true
tags:
    - Blog
---

## Forward

想给文章增加点击量的显示以及静态的Blog总的访问量和运行天数等信息，对于静态的Github Pages来说就做不到了，必须得要用一些其他服务来完成这个事情。



## 运行时间

合适的位置嵌入一下内容即可

```html
<span id="timeDate">载入天数...</span><span id="times">载入时分秒...</span>
<script>
    var now = new Date(); 
    function createtime() { 
        var grt= new Date("08/10/2018 17:38:00");//在此处修改你的建站时间，格式：月/日/年 时:分:秒
        now.setTime(now.getTime()+250); 
        days = (now - grt ) / 1000 / 60 / 60 / 24; dnum = Math.floor(days); 
        hours = (now - grt ) / 1000 / 60 / 60 - (24 * dnum); hnum = Math.floor(hours); 
        if(String(hnum).length ==1 ){hnum = "0" + hnum;} minutes = (now - grt ) / 1000 /60 - (24 * 60 * dnum) - (60 * hnum); 
        mnum = Math.floor(minutes); if(String(mnum).length ==1 ){mnum = "0" + mnum;} 
        seconds = (now - grt ) / 1000 - (24 * 60 * 60 * dnum) - (60 * 60 * hnum) - (60 * mnum); 
        snum = Math.round(seconds); if(String(snum).length ==1 ){snum = "0" + snum;} 
        document.getElementById("timeDate").innerHTML = "本站已安全运行 "+dnum+" 天 "; 
        document.getElementById("times").innerHTML = hnum + " 小时 " + mnum + " 分 " + snum + " 秒"; 
    } 
setInterval("createtime()",250);
</script>
```

效果还行

![image-20221214175437773](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212141754884.png)

## 不蒜子



## LeanCloud







## Summary



## Quote

> https://shangzg.top/zh-cn/2021-10-19-hugo-personal-blog-adds-valine-comment-system/
>
> https://imooner.com/2019/06/08/%E5%8D%9A%E5%AE%A2%E6%90%AD%E5%BB%BA%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/
>
> https://docs.leancloud.app/sdk_setup-js.html
>
> https://blog.whuzfb.cn/
>
> https://github.com/zfb132/zfb132.github.com/blob/master/index.html
>
> 




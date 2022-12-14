---
layout:     post
title:      "博客增加文章点击统计和显示"
subtitle:   "不蒜子、LeanCloud、谷歌翻译、动态效果"
date:       2022-12-14
update:     2022-12-14
author:     "elmagnifico"
header-img: "img/docker-head-bg.jpg"
catalog:    true
tags:
    - Blog
---

## Forward

想给文章增加点击量的显示以及静态的Blog总的访问量和运行天数等信息，对于静态的Github Pages来说就做不到了，必须得要用一些其他服务来完成这个事情。顺带也增加一下网站的视觉效果



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

## 统计文章字数

字数很简单就能统计了，如果想要阅读时间做个比例换算就行了。

{% raw %}

```
Words:&nbsp;{{ post.content | number_of_words }}
```

{% endraw %}



## 不蒜子

> https://busuanzi.ibruce.info/



```html
<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
            <span id="busuanzi_container_site_pv">本站总访问量<span id="busuanzi_value_site_pv"></span>次</span>
            <span id="busuanzi_container_site_uv">本站总访客数<span id="busuanzi_value_site_uv"></span>人</span>
            <span id="busuanzi_container_page_pv">本页总访问量<span id="busuanzi_value_page_pv"></span>次</span>
```



总体来说非常简单易用，但是唯一的问题是，数据不在你手上，而且如果有一天不蒜子没了，那么你的所有统计信息都没有了。

同时如果已经运行了很久，就无法再统计数量了，不蒜子暂停注册了，不能修改初始值了，所以就有点困难。



如果有一天不蒜子没了，也有下面的替代品，可以自己部署，自己存储

> https://github.com/soxft/busuanzi
>
> https://github.com/zkeq/Busuanzi
>
> https://github.com/zkeq/Busuanzi_backend_self
>
> https://github.com/qiushaocloud/site-counter



## LeanCloud

使用LeanCloud的数据统计服务

> https://www.leancloud.cn/



LeanCloud经历了比较多的变动，之前出现了一次域名被禁止解析，然后js文件直接拉不到，很多人都选择了把js存本地，然后又能用了

> https://forum.leancloud.cn/t/av-core-mini-0-6-4-js-av-min-js/22777

但是后来，直接停止国内未绑定域名的服务，就导致很多人又搬去了国外站，再接着就是国外依然能访问国内，LeanCloud国际为了合规，不允许国内使用了，直接把国外的访问屏蔽了。

> https://forum.leancloud.cn/t/2022-8/25408



现状就是如果使用CND的js，各方面都配置正确了依然会提示错误，他要求你绑定域名

```
Access to XMLHttpRequest at 'https://recukngv.api.lncldglobal.com/1.1/classes/Counter?where=%7B%22time%22%3A%7B%22%24gte%22%3A0%7D%7D' from origin 'http://elmagnifico.tech' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
(index):1383 query error:Request has been terminated
Possible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc. [N/A GET https://recukngv.api.lncldglobal.com/1.1/classes/Counter]

https://recukngv.api.lncldglobal.com/1.1/classes/Counter?where=%7B%22time%22%3A%7B%22%24gte%22%3A0%7D%7D net::ERR_FAILED
```



## badge

一个可以用来统计任何一个页面的标签，不好的点就是这个标签需要每次手动申请，挺麻烦的

> https://www.v2ex.com/t/702702



## 其他修改

#### 动态波纹

很简单的效果就能给网页加一点动态

```html
    <!-- wave  -->
    <link rel="stylesheet" href="/css/wave.css"/>
    
	<!-- waveoverlay start -->
    <div class="preview-overlay">
        <svg class="preview-waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
        </defs>
        <g class="preview-parallax">
            <use xlink:href="#gentle-wave" x="48" y="0" fill=var(--gentle-wave1)></use>
            <use xlink:href="#gentle-wave" x="48" y="3" fill=var(--gentle-wave2)></use>
            <use xlink:href="#gentle-wave" x="48" y="5" fill=var(--gentle-wave3)></use>
            <use xlink:href="#gentle-wave" x="48" y="7" fill=var(--gentle-wave)></use>
        </g>
        </svg>
    </div>
    <!-- waveoverlay end -->
```

![image-20221214223410764](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212142234937.png)

引用自

> https://sysin.org/



#### 背景增加彩带

```
<!-- ribbon -->
<script type="text/javascript" src="/js/ribbonDynamic.js"></script>
```

类似的效果

![image-20221215014909539](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212150149640.png)



#### 增加顶部进度条



{% raw %}

```html
    <!-- top processbar -->
    <link rel="preload" href="{{ site.BASE_PATH }}/css/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link href="{{ site.BASE_PATH }}/css/style.css" rel="stylesheet"></noscript>

    <!-- 文章进度条 -->
    <div class="progress-indicator" style="width: 0%;"></div>
    
    <!-- 文章进度条：在style.css里面更改进度条样式 -->
<script type="module">
  /* 顶部进度条 */
  (function() {
    var $w = $(window);
    var $prog2 = $('.progress-indicator');
    var wh = $w.height();
    var h = $('body').height();
    var sHeight = h - wh;
    $w.on('scroll', function() {
    window.requestAnimationFrame(function(){
      var perc = Math.max(0, Math.min(1, $w.scrollTop() / sHeight));
      updateProgress(perc);
    });
    });

    function updateProgress(perc) {
    $prog2.css({width: perc * 100 + '%'});
    }
  }());
</script>
```

{% endraw %}



![image-20221215012240725](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212150122905.png)

引用自

> https://blog.whuzfb.cn/



#### 返回顶部按钮



{% raw %}

```html
    <!-- back-to-top -->
    <div id="back-top">
        <a href="#section" data-toggle="tooltip" data-placement="top" title="top">
        <i class="fa fa-chevron-up" aria-hidden="true"></i>
        </a>
    </div>
    
    <script type="module">
        $('#back-top').hide();
        $(document).ready(function () {
        $(window).scroll(function () {
        if ($(this).scrollTop() > 250) {
          $('#back-top').fadeIn();
        } else {
          $('#back-top').fadeOut();
        }
        });
        $('#back-top a').click(function () {
        $('body,html').animate({
          scrollTop: 0
        }, 800);
        return false;
        });
      });
      </script>
```

{% endraw %}

效果如下：

![image-20221215012155801](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212150121828.png)



#### 内置谷歌翻译

有些老外看不懂，还要内置翻译一下

首先修改CSS，替换谷歌翻译的原生UI，有点难看

{% raw %}

```css
#google_translate_element .goog-te-gadget-simple {
  background-color: #fff0;
  border-left: none; 
  border-top: none; 
  border-bottom: none; 
  border-right: none; 
  font-size: none; 
  padding-top: none; 
  padding-bottom: none;
  zoom: 1;
  display: inline;
}

#google_translate_element .goog-te-gadget-simple img:first-child{display: none;}

#google_translate_element .goog-te-gadget-simple .goog-te-menu-value span:first-child{display: none;}

#google_translate_element .goog-te-gadget-simple .goog-te-menu-value:before {
  content: 'Translate'
}
```

{% endraw %}



然后加入谷歌翻译

{% raw %}

```html
<div id="google-translate">
<div id="google_translate_element"></div>
</div>

<!-- google-translate -->
<script async="async" type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
<script type="text/javascript">
var userLang = navigator.language || navigator.userLanguage || navigator.languages;
function googleTranslateElementInit() {
new google.translate.TranslateElement({
    includedLanguages: 'en,hi,es,zh-TW,fr,ar,bn,ru,pt,de,ja,ko,it',
    autoDisplay: true,
    pageLanguage: 'zh-CN',
    multilanguagePage: false,
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    //layout: google.translate.TranslateElement.FloatPosition.TOP_RIGHT
}, 'google_translate_element');
}
</script>
```

{% endraw %}

效果还行，至少UI上统一了

![image-20221215012111815](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202212150121858.png)



## Summary

更新了一下视觉效果，感觉好像比以前加载慢了一点



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
> https://qchaha.github.io/2018/09/19/homepageStatistics.html
>
> https://www.cnblogs.com/zfb132/p/10665385.html
>
> https://stackoverflow.com/questions/9306015/modifying-element-from-google-translate-translateelement-results/46306852#46306852
>
> https://github.com/zfb132/zfb132.github.com




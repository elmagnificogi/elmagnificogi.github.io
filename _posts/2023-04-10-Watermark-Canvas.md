---
layout:     post
title:      "给Blog增加水印"
subtitle:   "Canvas，js"
date:       2023-04-10
update:     2023-04-10
author:     "elmagnifico"
header-img: "img/x3.jpg"
catalog:    true
tobecontinued: true
tags:
    - Canvas
    - Blog
---

## Foreword

突发奇想，想给没写完的Blog加个水印，表示未完工，谨慎查看



## 水印

```javascript
// 页面添加水印效果
const setWatermark = (str,width,height,font) => {
    const id = 'watermarkbyelmagnifico';
    if (document.getElementById(id) !== null) document.body.removeChild(document.getElementById(id));
    const can = document.createElement('canvas');
    can.width = width;
    can.height = height;
    const cans = can.getContext('2d');
    cans.rotate((-20 * Math.PI) / 180);
    cans.font = font;
    cans.fillStyle = 'rgba(200, 200, 200, 0.30)';
    cans.textBaseline = 'Middle';
    cans.fillText(str, can.width / 10, can.height / 2);
    const div = document.createElement('div');
    div.id = id;
    div.style.pointerEvents = 'none';
    div.style.top = '15px';
    div.style.left = '0px';
    div.style.position = 'fixed';
    div.style.zIndex = '10000000';
    div.style.width = `${document.documentElement.clientWidth}px`;
    div.style.height = `${document.documentElement.clientHeight}px`;
    div.style.background = `url(${can.toDataURL('image/png')}) left top repeat`;
    document.body.appendChild(div);
    return id;
};



/**

 * 页面添加水印效果
 * @method set 设置水印
 * @method del 删除水印
 */
const watermark = {

    // 设置水印
    set: (str,width,height,font) => {
        let id = setWatermark(str,width,height,font);;
        if (document.getElementById(id) === null) id = setWatermark(str,width,height,font);;
    },

    // 删除水印
    del: () => {
        let id = 'watermarkbyelmagnifico';
        if (document.getElementById(id) !== null) document.body.removeChild(document.getElementById(id));
    },
};
```



```javascript
// 开启水印
watermark.set('To be continued...未完待续',300,250,"23px Brush Script MT")

// 关闭水印
watermark.del()
```



## 增加到Blog页面

将上面的代码改成JS，加到页面底部



再增加一个标签用来激活水印，没写完的时候就激活



{% raw %}

```js
{% if if page.tobecontinued %}
<!-- Global site tag (gtag.js) - Google Analytics -->
<script type="text/javascript" src="/js/watermark.js"></script>
<script>
    watermark.set('To be continued...未完待续',300,250,"23px Brush Script MT")
</script>
{% endif %}
```

{% endraw %}

## Summary

未完待续，测试一下，本页面就是样例，还是挺好看的



## Quote

{% raw %}

> https://www.enjoytoday.cn/2022/09/08/%E5%A6%82%E4%BD%95%E7%BB%99web%E9%A1%B5%E9%9D%A2%E6%B7%BB%E5%8A%A0%E4%B8%80%E4%B8%AA%E6%B0%B4%E5%8D%B0/

{% endraw %}

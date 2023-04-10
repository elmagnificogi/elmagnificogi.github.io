---
layout:     post
title:      "给Blog增加水印"
subtitle:   "Canvas，js"
date:       2023-04-10
update:     2023-04-10
author:     "elmagnifico"
header-img: "img/x3.jpg"
catalog:    true
tags:
    - Canvas
    - Blog
---

## Foreword

突发奇想



## 水印

```javascript
// 页面添加水印效果
const setWatermark = (str) => {
    const id = '1.99654.234';
    if (document.getElementById(id) !== null) document.body.removeChild(document.getElementById(id));
    const can = document.createElement('canvas');
    can.width = 200;
    can.height = 130;
    const cans = can.getContext('2d');
    cans.rotate((-20 * Math.PI) / 180);
    cans.font = '12px Vedana';
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
    set: (str) => {
        let id = setWatermark(str);
        if (document.getElementById(id) === null) id = setWatermark(str);
    },

    // 删除水印
    del: () => {
        let id = '1.99654.234';
        if (document.getElementById(id) !== null) document.body.removeChild(document.getElementById(id));
    },
};
```



```javascript
// 开启水印
watermark.set('Enjoytoday.cn')

// 关闭水印
watermark.del()
```



## Summary

未完待续



## Quote

> https://www.enjoytoday.cn/2022/09/08/%E5%A6%82%E4%BD%95%E7%BB%99web%E9%A1%B5%E9%9D%A2%E6%B7%BB%E5%8A%A0%E4%B8%80%E4%B8%AA%E6%B0%B4%E5%8D%B0/


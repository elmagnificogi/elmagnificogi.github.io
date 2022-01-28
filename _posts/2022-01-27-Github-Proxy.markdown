---
layout:     post
title:      "搭建GitHub加速站"
subtitle:   "proxy，Cloudflare，Workers"
date:       2022-01-27
update:     2022-01-27
author:     "elmagnifico"
header-img: "img/bg7.jpg"
catalog:    true
tags:
    - GitHub
    - Proxy
    - Cloudflare
---

## Foreword

今天看到了一个加速GitHub下载的，有点意思，操作了一下，很快，5分钟不到就好了



## CloudFlare Workers

首先反代本质上是靠CloudFlare的国内CDN加速，然后通过Workers创建无服务的程序，主要是靠JS完成代理。

本身免费的服务一天可以有10w次请求，只是小范围使用完全够用了。



先创建一个服务，服务名称随意，选择显示简单HTML网页的Woker处理程序，创建服务

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/hgAzRQ3Pp5LNXfd.png)

然后进入快速编辑页面

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/6JjA15y4zX9betD.png)



将以下内容复制到左侧代码区域，然后点击保存并部署

```javascript
'use strict'

/**
 * static files (404.html, sw.js, conf.js)
 */
const ASSET_URL = 'https://hunshcn.github.io/gh-proxy/'
// 前缀，如果自定义路由为example.com/gh/*，将PREFIX改为 '/gh/'，注意，少一个杠都会错！
const PREFIX = '/'
// git使用cnpmjs镜像、分支文件使用jsDelivr镜像的开关，0为关闭，默认开启
const Config = {
    jsdelivr: 1,
    cnpmjs: 1
}

/** @type {RequestInit} */
const PREFLIGHT_INIT = {
    status: 204,
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
}


const exp1 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i
const exp2 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:blob|raw)\/.*$/i
const exp3 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i
const exp4 = /^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+?\/.+$/i
const exp5 = /^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+$/i
const exp6 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/tags.*$/i

/**
 * @param {any} body
 * @param {number} status
 * @param {Object<string, string>} headers
 */
function makeRes(body, status = 200, headers = {}) {
    headers['access-control-allow-origin'] = '*'
    return new Response(body, {status, headers})
}


/**
 * @param {string} urlStr
 */
function newUrl(urlStr) {
    try {
        return new URL(urlStr)
    } catch (err) {
        return null
    }
}


addEventListener('fetch', e => {
    const ret = fetchHandler(e)
        .catch(err => makeRes('cfworker error:\n' + err.stack, 502))
    e.respondWith(ret)
})


function checkUrl(u) {
    for (let i of [exp1, exp2, exp3, exp4, exp5, exp6 ]) {
        if (u.search(i) === 0) {
            return true
        }
    }
    return false
}

/**
 * @param {FetchEvent} e
 */
async function fetchHandler(e) {
    const req = e.request
    const urlStr = req.url
    const urlObj = new URL(urlStr)
    let path = urlObj.searchParams.get('q')
    if (path) {
        return Response.redirect('https://' + urlObj.host + PREFIX + path, 301)
    }
    // cfworker 会把路径中的 `//` 合并成 `/`
    path = urlObj.href.substr(urlObj.origin.length + PREFIX.length).replace(/^https?:\/+/, 'https://')
    if (path.search(exp1) === 0 || path.search(exp5) === 0 || path.search(exp6) === 0 || !Config.cnpmjs && (path.search(exp3) === 0 || path.search(exp4) === 0)) {
        return httpHandler(req, path)
    } else if (path.search(exp2) === 0) {
        if (Config.jsdelivr) {
            const newUrl = path.replace('/blob/', '@').replace(/^(?:https?:\/\/)?github\.com/, 'https://cdn.jsdelivr.net/gh')
            return Response.redirect(newUrl, 302)
        } else {
            path = path.replace('/blob/', '/raw/')
            return httpHandler(req, path)
        }
    } else if (path.search(exp3) === 0) {
        const newUrl = path.replace(/^(?:https?:\/\/)?github\.com/, 'https://github.com.cnpmjs.org')
        return Response.redirect(newUrl, 302)
    } else if (path.search(exp4) === 0) {
        const newUrl = path.replace(/(?<=com\/.+?\/.+?)\/(.+?\/)/, '@$1').replace(/^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com/, 'https://cdn.jsdelivr.net/gh')
        return Response.redirect(newUrl, 302)
    } else {
        return fetch(ASSET_URL + path)
    }
}


/**
 * @param {Request} req
 * @param {string} pathname
 */
function httpHandler(req, pathname) {
    const reqHdrRaw = req.headers

    // preflight
    if (req.method === 'OPTIONS' &&
        reqHdrRaw.has('access-control-request-headers')
    ) {
        return new Response(null, PREFLIGHT_INIT)
    }

    const reqHdrNew = new Headers(reqHdrRaw)

    let urlStr = pathname
    if (urlStr.startsWith('github')) {
        urlStr = 'https://' + urlStr
    }
    const urlObj = newUrl(urlStr)

    /** @type {RequestInit} */
    const reqInit = {
        method: req.method,
        headers: reqHdrNew,
        redirect: 'manual',
        body: req.body
    }
    return proxy(urlObj, reqInit)
}


/**
 *
 * @param {URL} urlObj
 * @param {RequestInit} reqInit
 */
async function proxy(urlObj, reqInit) {
    const res = await fetch(urlObj.href, reqInit)
    const resHdrOld = res.headers
    const resHdrNew = new Headers(resHdrOld)

    const status = res.status

    if (resHdrNew.has('location')) {
        let _location = resHdrNew.get('location')
        if (checkUrl(_location))
            resHdrNew.set('location', PREFIX + _location)
        else {
            reqInit.redirect = 'follow'
            return proxy(newUrl(_location), reqInit)
        }
    }
    resHdrNew.set('access-control-expose-headers', '*')
    resHdrNew.set('access-control-allow-origin', '*')

    resHdrNew.delete('content-security-policy')
    resHdrNew.delete('content-security-policy-report-only')
    resHdrNew.delete('clear-site-data')

    return new Response(res.body, {
        status,
        headers: resHdrNew,
    })
}
```

透过预览刷新，就能看到页面了，这个url就可以分享给其他人了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/S9MKPg7nDjaucAf.png)



然后就可以通过worker给出来的链接进行加速访问了。

> https://proxygithub.elmagnificoheroku.workers.dev/



## gh-proxy

> https://github.com/hunshcn/gh-proxy

这个项目来自于gh-proxy，github release、archive以及项目文件的加速项目，支持clone，有Cloudflare Workers无服务器版本以及Python版本。

默认配置下clone走github.com.cnpmjs.org，项目文件会走jsDeliver，如需走worker，修改Config变量即可

python的版本功能更强大一些，只不过需要vps来搭建，不能用这种serverless了



如果想修改展示出来的静态页面，可以fork这个仓库，然后改一下index就行了。

> https://github.com/hunshcn/hunshcn.github.io



## 自定义Worker域名

想把刚才使用的worker域名替换成自己的，需要把自己的域名托管在CloudFlare上才行，否则就算你CNAME这个域名一样是无法跳转显示的index的（下载文件不受影响）

> https://proxygithub.elmagnificoheroku.workers.dev/



首先自定义一个域名，比如gitproxy，内容无所谓是什么，主要是要切换成代理状态即可，剩下的交给CF就行了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/T8V4kUCa2DeMyPO.png)

然后在Workers中添加路由，选择刚才建好的服务和环境，就可以直接通过自定义的域名进行访问了

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/UP6rM8eQNHZEC9j.png)

最后通过下面的链接就能访问的一样的加速页面了

> http://gitproxy.elmagnifico.tech/



## Summary

以后再遇到翻不了墙，下不了的就可以把这个链接丢给他，或者是直接在分享的github的链接前加上这个就行了。



## Quote

> https://www.abskoop.com/11425/
>
> https://vircloud.net/exp/cf-worker-domain.html




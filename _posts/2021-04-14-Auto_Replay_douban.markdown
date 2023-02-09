---
layout:     post
title:      "豆瓣自动回复，自动顶帖"
subtitle:   "超级鹰,验证码识别"
date:       2021-04-14
update:     2023-02-09
author:     "elmagnifico"
header-img: "img/Raspberrypi-head-bg.jpg"
catalog:    true
tags:
    - python
    - Script
---

## Foreword

> 无论是咸鱼也好，58也好（赶集也是58的），租房信息基本都沦陷了。
>
> 58上自己发的二房东的租房信息或者是合租的信息明显不如中介验证过的或者有房产证直接验证过的信息推广的更广，甚至很久都无人问津。
>
> 由于自己当了二房东所以不得不想办法招租啊，然后发现豆瓣上比58什么的要靠谱一点，但是依然逃不过那些公寓啊、中介的毒手，很多帖子说的很好，然后仔细一看都是各种公寓的招租贴，很坑，描述的房子贼好，价格贼便宜基本都是实际价格1/3到1/2的样子，等你去问有没有他说有，让你看房，带你看完以后告诉你便宜的都租了，现在就剩这个贵的，你要不要吧，巨坑无比。
>
> 然后这些个人呢，还成天刷贴，只要一刷帖就会导致我们这种普通人发的帖子沉下去了，想找的人也看不到了，为了不让我帖子下沉只好自己刷贴，然后我加了好几个团体，都分别有发一样的帖子，为了方便自然要有一个顶帖的东西。

以上来自于两年前的我，之前以为我不会再用这玩意了，没想到还是得用。

2年后再用豆瓣，发现豆瓣沦陷的更严重了，公寓中介都学奸了，一个个伪装转租，伪装合租，等你加了再告诉你没了，带你去看其他的。

热门租房的团体里，基本每秒都在更新，如果你只翻看前5-10页，会发现看了半天好像都是这些帖子啊，可见刷帖的疯狂程度有多少。



要解决这个问题，就要再升级一下之前刷帖器



## 前情

> https://juejin.cn/post/6844903668412579847

之前参考他的帖子做的，当然他后来更新了很多，还单独做了放到了服务器上去刷。只是时间久了他的那边基本失效了（其实就是几个链接少了https而已），改改还是能用。但是我自己的也没差太多，就加个验证码就行了。



## 代码

> https://github.com/elmagnificogi/AutoReplay_douban

代码里只需要配好帖子链接，cookie，回复内容，超级鹰用户名，密码，软id就能工作了

```python
import re
from lxml import html
import requests
from PIL import Image
import os
from hashlib import md5


# 来自官方demo
class Chaojiying_Client(object):

    def __init__(self, username, password, soft_id):
        self.username = username
        password = password.encode('utf8')
        self.password = md5(password).hexdigest()
        self.soft_id = soft_id
        self.base_params = {
            'user': self.username,
            'pass2': self.password,
            'softid': self.soft_id,
        }
        self.headers = {
            'Connection': 'Keep-Alive',
            'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
        }

    def PostPic(self, im, codetype):
        """
        im: 图片字节
        codetype: 题目类型 参考 http://www.chaojiying.com/price.html
        """
        params = {
            'codetype': codetype,
        }
        params.update(self.base_params)
        files = {'userfile': ('ccc.jpg', im)}
        r = requests.post('http://upload.chaojiying.net/Upload/Processing.php', data=params, files=files,
                          headers=self.headers)
        return r.json()

    def ReportError(self, im_id):
        """
        im_id:报错题目的图片ID
        """
        params = {
            'id': im_id,
        }
        params.update(self.base_params)
        r = requests.post('http://upload.chaojiying.net/Upload/ReportError.php', data=params, headers=self.headers)
        return r.json()


def main():
    # 需要回帖的url 去掉后面那些有的没的后缀，但是最后这个斜杠需要
    db_url = "https://www.douban.com/group/topic/218863065/"
    # 你的cookie
    Cookie = 'bid=LnTf54vt3i0; douban-fav-remind=1; ll="118282"; dbcl2="164776595:8akuwQXyElQ"; push_doumail_num=0; __utmv=30149280.16477; push_noty_num=0; ck=qSzc; ap_v=0,6.0; __utma=30149280.882459586.1616824928.1617868431.1618382459.9; __utmc=30149280; __utmz=30149280.1618382459.9.6.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; __utmt=1; __utmb=30149280.85.5.1618382967262'
    # 回复内容
    replay_comment = "up 来自elmagnifico的自动回复"

    # 首先超级鹰官方注册，同时微信关注一下官方然后绑定你的账号，获取1000题分
    # 豆瓣验证码部分存在超过6位的英文，1元的资源包无法识别，需要更高级，就需要消耗题分。
    # 1元试用资源包（8001官方不保证全能识别），豆瓣的验证码基本都不能识别，很坑，建议别买，就试用一下，1000题分够了
    # 如果有必要再买3008类型的题分吧，我下面的代码是兼容了8001和3008类型，实际上可以去掉8001的

    # 超级鹰用户名
    Chaojiying_user_name = "你的用户名"
    # 超级鹰密码
    Chaojiying_password = "你的密码"
    # 用户中心>>软件ID 生成一个，替换这里的
    Chaojiying_software_id = "914754"

    headers = {
        "Host": "www.douban.com",
        "Referer": "",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        "Cookie": ''
    }
    params = {
        "ck": " ",
        "rv_comment": " ",
    }

    headers['Referer'] = db_url + '?start=0'
    headers['Cookie'] = Cookie
    # print(headers['Referer'])

    ck_index = Cookie.find('ck=')
    # print(ck)
    ck_str = Cookie[ck_index + 3:ck_index + 7]
    # print(ck_str)

    params['ck'] = ck_str
    params['rv_comment'] = replay_comment

    db_url_rpl = db_url + 'add_comment'
    # print(db_url_rpl)

    # get captcha
    response = requests.post(db_url, headers=headers, data=params, verify=False).content.decode()
    selector = html.fromstring(response)
    captcha_image = selector.xpath("//img[@id=\"captcha_image\"]/@src")
    if (captcha_image):
        # print(captcha_image)
        captcha_id = selector.xpath("//input[@name=\"captcha-id\"]/@value")
        # print(captcha_id)

        captcha_name = re.findall("id=(.*?):", captcha_image[0])  # findall返回的是一个列表
        filename = "douban_%s.jpg" % (str(captcha_name[0]))
        print("验证码文件名为：" + filename)
        captcha_image[0] = 'https:' + captcha_image[0]

        # 创建文件名
        with open(filename, 'wb') as f:
            # 以二进制写入的模式在本地构建新文件
            header = {
                'User-Agent': '"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",'
                , 'Referer': captcha_image[0]}
            f.write(requests.get(captcha_image[0], headers=header).content)
            print("%s下载完成" % filename)
        print(os.path.dirname(os.path.realpath(__file__)) + r'\\' + filename)
        img = Image.open(os.path.dirname(os.path.realpath(__file__)) + r'\\' + filename)
        # img.show()

        captcha_veryfy = ""
        # captcha_veryfy = input("输入验证码:").replace('\n', '').replace('\n', '')

        chaojiying = Chaojiying_Client(Chaojiying_user_name, Chaojiying_password, Chaojiying_software_id)
        im = open(filename, 'rb').read()

        ret = (chaojiying.PostPic(im, 8001))
        if ret != None:
            if ret['pic_str'] == '':
                print("8001无法识别，切换到3008尝试识别")
                ret = chaojiying.PostPic(im, 3008)
            if ret['pic_str'] != '':
                captcha_veryfy = ret['pic_str']
            else:
                print("验证码识别错误")
                return
        else:
            print("验证码接口错误")
            return

        print("识别验证码：" + captcha_veryfy)
        params['captcha-solution'] = captcha_veryfy
        params['captcha-id'] = captcha_id[0]
        params['start'] = 0

        # replay
        requests.post(db_url_rpl, headers=headers, data=params, verify=False)

    else:
        # 无需验证码，直接回复即可
        requests.post(db_url_rpl, headers=headers, data=params, verify=False)

    # input


if __name__ == '__main__':
    main()

```



#### 如何获得你的cookie

首先登陆豆瓣，然后

https://jingyan.baidu.com/article/5d368d1ea6c6e33f60c057ef.html



#### 验证码规则

同一个ip请求超过100次以后，就需要验证码了，这个请求包括所有（比如拉图片，看帖子，回复帖子等等，一个动作里可能有好多个请求），连续回复基本3次就弹验证码了。



要避开验证码，要么直接套一个http代理，通过各种不同ip进行回复，访问，这样可以避免验证码，但是可能会有异地登陆异常等情况。



#### 超级鹰

所以最简单的不如直接买一个或者试用一下验证码识别平台，超级鹰

> https://www.chaojiying.com/

也有人用百度的ocr识别，不过不是很准，或者自己拿opencv之类的训练一下，也不是不行。



豆瓣的验证码是纯英文单词，大部分都是8个字母以内吧，不排除会有更长的，识别一次需要20题分，一元钱=1000题分

一天顶25次，就需要500分，也就是5毛钱，租房实际上你也用不了10天吧？5块钱肯定能解决问题，如果5块还不能解决问题，就翻倍10块总可以吧。

![](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/neIxDr7qtvAOpVa.png)



## 其他

> https://github.com/gulico/DoubanBot

豆瓣自动回帖机器人，他这里就用了ip代理池，跳过了验证码的问题



> https://github.com/yaodi833/rental_house_douban

豆瓣特定信息，自动订阅，推送，方便特定位置找房，主要还是豆瓣的搜索过滤不好用，不然也不用这样



> https://blog.csdn.net/sxf1061700625/article/details/106652129

手机版本的自动回复，但是手机也会弹验证码



## Summary

代码里只写了一个完整流程，如果有必要的话，随便改改就能变成多贴批量回复，回复内容随机。再扩展一下，自动发帖回帖一条龙也不是不行。

然后再配合一下vps+screen 之类的，就可以直接部署上去全自动回复了，然后等租客联系就行了。

ps：我不用豆瓣，只是拿来当代替58的租房工具而已



## Quote

> https://github.com/gangfang/robo-commenter-for-douban
>
> https://juejin.cn/post/6844903668412579847


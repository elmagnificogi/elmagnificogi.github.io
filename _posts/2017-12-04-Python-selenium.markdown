---
layout:     post
title:      "Python selenium"
subtitle:   "auto test,Firefox,"
date:       2017-12-04
author:     "elmagnifico"
header-img: "img/python-head-bg.jpg"
catalog:    true
tags:
    - python
---

# Foreword

selenium 一般都是作为web自动化测试工具的一部分,当然也可以拿来当网页爬虫(只不过效率上比较低),这里我也只是用来自动获取网页混淆后的代码而已.

## selenium

#### 安装

python 下使用他还比较简单,直接

    pip install selenium

即可完成安装.

但是selenium除了需要python安装以外,还需要对应浏览器的驱动.

比如我使用的是Firefox,其对应驱动名为geckodriver.exe

> https://github.com/mozilla/geckodriver/releases

这里可以下载到.

同时也可以通过这里直接下载到Firefox的对应selenium-ide 可视化界面的插件,如果只是轻量使用的话,完全可以通过插件完成各种自动化.

https://addons.mozilla.org/zh-CN/firefox/addon/selenium-ide/

这个插件可以直接录制脚本,并且脚本的代码也可以转换为各种不同语言来使用,也可以拿来当作定位元素来使用.

定位元素最好还配合浏览器的审查元素(类似功能)来使用.

## code

这是一个自动读取本地python文件,然后去http://pyob.oxyry.com进行混淆的脚本

```python
import sys
import re
import time
import shutil
import codecs
from selenium import webdriver

if __name__ == "__main__":
    # set the file source
    soure_file_path = str(r"F:\Editor.py")
    git_file_path   = str(r"F:\git\Editor.py")

    # new file with time stamp
    output_time = time.strftime('%Y-%m-%d %H%M%S',time.localtime(time.time()))
    output_file_path = str(r'F:\output\Editor'+ output_time+'.py')
    # print(output_time)

    # copy the source file to the git repository
    shutil.copy(soure_file_path, git_file_path)

    # add record of the version
    newfile = ''
    with open(soure_file_path, 'r+',encoding= 'utf-8') as f:
        for line in f:
            if re.search("version = '",line):
                line= "    version = " + "'" + output_time + "'" + '\n'
            newfile += line

    # create a gbk file then decode the newfile to gbk
    f = codecs.open(git_file_path,'w','gbk')
    f.write(newfile)

    driver = webdriver.Firefox(executable_path = 'F:/geckodriver.exe')
    driver.get("http://pyob.oxyry.com/")

    driver.find_element_by_xpath("//form[@id='obfuscate-form']/div/div/textarea").click()
    driver.find_element_by_xpath("//form[@id='obfuscate-form']/div/div/textarea").clear()

    #driver.find_element_by_xpath("//form[@id='obfuscate-form']/div/div/textarea").send_keys(newfile)
    # use the JS for input ,the setkey need a long time for that
    input_text_element = driver.find_element_by_xpath("//form[@id='obfuscate-form']/div/div/textarea")
    driver.execute_script("arguments[0].value = arguments[1];", input_text_element,newfile)

    driver.find_element_by_xpath("//button[@type='submit']").click()
    time.sleep(10)

    output_text_element = driver.find_element_by_xpath("//form[@id='obfuscate-form']/div[2]/div/textarea")

    newfile = output_text_element.get_attribute("value")

    # create a gbk file then decode the newfile to gbk
    f = codecs.open(output_file_path,'w','gbk')
    # just delete the web text tail
    f.write(newfile[:-235])
    f.close()
    driver.quit()
```

#### 注意

这个地方经常会出错,因为虽然你下载了驱动,但是他依然找不到驱动在哪里,这就需要你手动指定驱动位置或者在系统环境变量中添加驱动的地址

```python
driver = webdriver.Firefox(executable_path = 'F:/geckodriver.exe')
```

## 模拟按键与发送文本

平常看到的多数都是这样的发送文本方式,使用sendKeys来发送文本内容.

```python
driver.find_element_by_xpath("//form[@id='obfuscate-form']/div/div/textarea").sendKeys("send text");
```

其实这种操作是不正确的,sendKeys本质上调用的是模拟按键输入,他调用的是系统API,应该用来模拟各种按键操作,如果只是发送少量的字符内容,这没啥问题,但是如果发送的内容非常大比如我这里的这个python文件,有123KB,发送完成用时9分多钟,整个程序都卡死在那里,要不是我吃了个饭回来发现他发送完成了,我肯定早早就把他结束任务了.

而我也没查到任何直接输入接口,所以这里要通过python注入JS来完成对应的赋值操作

```python
input_text_element = driver.find_element_by_xpath("//form[@id='obfuscate-form']/div/div/textarea")
driver.execute_script("arguments[0].value = arguments[1];", input_text_element,newfile)
```

这里就直接将对应的元素的值赋值为我输入的文件,其输入延迟基本可以忽略不计.

其实还有一种办法,使用剪贴板操作,将文本内容先输入到剪贴板中,然后再对文本框进行复制操作,进而完成文本的输入,这不过这样绕的太多了,没有特殊限制的情况下没必要.

## Htmlunit

在使用上面的webdriver接口的时候就会发现,执行过程是有一个浏览器操作的过程的,如果不要浏览器执行过程,轻量化快速化,那么就需要用HtmlUnit或PhantomJs,这里直接介绍Htmlunit接口,他本身就被封装在了selenium中,可以直接调用.

#### 安装

在使用Htmlunit之前还需要先开启java的专用服务器才可以正常操作

首先在这里下载对应的jar包,selenium-server-standalone-x.x.x.jar

> http://www.seleniumhq.org/download/

而这里的selenium服务器必须和python pip list中的selenium相同版本

#### 启动

通过cmd(当然需要提前装好java)

    java -jar selenium-server-standalone-x.x.x.jar

就能看到服务器正常启动:

    11:13:48.385 INFO - Selenium build info: version: '3.7.0', revision: '2321c73'
    11:13:48.385 INFO - Launching a standalone Selenium Server
    2017-12-04 11:13:48.422:INFO::main: Logging initialized @304ms to org.seleniumhq.jetty9.util.log.StdErrLog
    11:13:48.471 INFO - Driver class not found: com.opera.core.systems.OperaDriver
    11:13:48.512 INFO - Driver provider class org.openqa.selenium.safari.SafariDriver registration is skipped:
     registration capabilities Capabilities {browserName: safari, platform: MAC, version: } does not match the current platform WIN10
    11:13:48.569 INFO - Using the passthrough mode handler
    2017-12-04 11:13:48.593:INFO:osjs.Server:main: jetty-9.4.5.v20170502
    2017-12-04 11:13:48.611:WARN:osjs.SecurityHandler:main: ServletContext@o.s.j.s.ServletContextHandler@11438d26{/,null,STARTING} has uncovered http methods for path: /
    2017-12-04 11:13:48.615:INFO:osjsh.ContextHandler:main: Started o.s.j.s.ServletContextHandler@11438d26{/,null,AVAILABLE}
    2017-12-04 11:13:48.794:INFO:osjs.AbstractConnector:main: Started ServerConnector@63440df3{HTTP/1.1,[http/1.1]}{0.0.0.0:4444}
    2017-12-04 11:13:48.795:INFO:osjs.Server:main: Started @677ms
    11:13:48.795 INFO - Selenium Server is up and running

服务器启动之后,修改上面的代码,添加新的引入

```python
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
```

然后修改驱动接口,使用HTMLUNIT,其他内容保持不变,继续运行.

```python
driver = webdriver.Remote(desired_capabilities=DesiredCapabilities.HTMLUNIT)
```

可以看到得到了正确的结果,并且cmd中会有对应操作的输出回显

# Summary

按键精灵当然也可以完成类似的功能,其网页的操作有可能就是封装了selenium来完成的.

selenium本身的Firefox接口就是用于显示化的自动化测试,如果你想要用不显示执行过程的方式来实现,那么需要使用HtmlUnit或PhantomJs来做.

# Quote

> https://www.zhihu.com/question/49568096
>
> https://www.v2ex.com/t/264077
>
> https://www.zhihu.com/question/24141510
>
> http://blog.csdn.net/dubingo/article/details/51643747
>
> http://blog.csdn.net/nhudx061/article/details/43601065/
>
> http://blog.csdn.net/nhudx061/article/details/43305599
>
> https://www.cnblogs.com/hanxiaobei/p/6108677.html
>
> https://segmentfault.com/q/1010000000208623
>
> https://www.v2ex.com/t/356473
>
> http://www.cnblogs.com/we8fans/p/6934592.html
>
> https://www.cnblogs.com/Test-road-me/p/4907156.html

---
layout:     post
title:      "测试管理工具"
subtitle:   "test、management、autotest、unit test"
date:       2026-06-03
update:     2026-06-03
author:     "elmagnifico"
header-img: "img/bg2.jpg"
catalog:    true
mermaid:    true
tobecontinued: false
tags:
    - Test
---

## Foreword

测试用例的管理，测试用例一定是关联到某一个需求的，基于这个需求产生的测试用例

但是呢，需求是一期一期做的，可能一个需求里混了一些不相干或者零碎的其他功能内容在里面

如果每一期的用例混在一起，对应的测试用例集就混了一些不同方向或者归属的用例

测试人员的期望是测试用例后期可以按照功能或者什么标签之类的进行划分，需要的时候回归测试某些功能的用例，然后根据情况有一部分还要转化为自动化用例，作为保底

- 实际测试用例随着功能变更，过往的测试用例也需要变更

测试用例同时还要满足评审的需求，有评审的流程和结果

自动化用例和普通的手工用例可能还会混在一起，这里就需要再进一步进行标签上的区分

测试用例测试完成以后，还需要对应的报告输出。这些是基础测试的管理工具的需求，市面上是否有工具可以满足或者其他某些工具可以稍微改造一下来满足。



### Allure TestOps

> https://qameta.io/

![image-20260603170354995](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603170355101.png)

TestOps，界面比较简单，价格比较美丽，39刀/月/人，稍微有点贵的离谱了，体验sandbox里只有guest身份，很多东西不能操作，局限性太大了，还是要试用一下。

- 试用必须企业邮箱

左侧导航栏，中间是所有用例，右侧是测试用例的详细信息，具体怎么操作，预期结果是什么，如果点每个标签就可以自动进行同标签筛选

导航内的功能就有测试计划，测试每一轮的结果，

TestOps的试用稍微有点问题，激活以后无法进入激活的测试空间，DNS无法解析，这个是限制了中国？

- 国内默认不给解析，需要额外翻墙处理

![image-20260603172458228](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603172458253.png)

看样子，TestOps是每个用户给一个独立的实例去跑，这个实例启动要一会，所以账号激活以后还进不去，要等一会



### TestRail

![image-20260603173420874](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603173420907.png)

TestRail的注册激活就人性化一些，看起来也是要实例启动以后才能进入，但是他有一个界面给你展示，TestOps就缺少了这些

TestRail暂时没有对国内做限制，可以直接访问

![image-20260603173622052](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603173622110.png)

TestRail可以创建demo项目，类似样板项目，快速感知TestRail能做的事情

![image-20260603173854256](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603173854344.png)

一目了然，不过TestRail看起来页面还是比较老的技术，不是响应式的，每次全页面都重新加载，有点老气了。

- 这种重新加载用起来感觉好累，卡卡的感觉

用例一多，加载起来确实很慢，转圈都转半天

整体管理逻辑和TestOps差不多，就是难用了一些

![image-20260603175015777](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603175015807.png)

基本标签，是否可以自动化，分配给谁做，这些都有，用例是基于Section和Case进行管理的

![image-20260603175530475](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603175530527.png)

TestRun里面是每个用例可以手动切换状态，每次切换都需要commit一下，说明，确实有点太重了，一天测几百个用例，这里来回点还是挺麻烦的



### Xray

> https://www.getxray.app/test-management

Xray是基于Jira家的组件，这里就不测了，要绑定Jira



### MeterSphere

> https://metersphere.io/
>
> https://github.com/metersphere/metersphere

![image-20260603183148680](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603183148740.png)

不愧是国内的，符合中国体制的宝宝，demo演示直接给账号密码，本身有社区版，开源，功能看起来支持得也还行

![image-20260603183302180](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603183302224.png)

导入用例，有现成模板，用AI转化一下就行

![image-20260603183358681](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603183358713.png)

然后用例内可以关联需求，不过这个也是一个用例操作一下，有点傻了，缺少批量的那种关联，需求也只能关联一个链接，没有具体内容的展示

![image-20260603183600782](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603183600821.png)

用例执行，也是类似TestRail，每次执行都有一个commit

![image-20260603184214543](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603184214595.png)

MeterSphere也有一个评审的流程，可以大家过这个评审

但是关于怎么触发自动化测试，MeterSphere界面上至少是一点都没有，看不出来怎么触发。官方说法是可以通过jenkins插件触发

> 在MeterSphere中，可通过**Jenkins插件**实现特定条件或操作触发自动化测试，具体方式如下：
>
> 1. **Jenkins集成触发**
>    - 安装MeterSphere Jenkins插件后，在Jenkins任务中添加MeterSphere构建环节。
>    - 配置MeterSphere平台认证信息，选择指定项目下的接口测试用例。
>    - 通过Jenkins的定时任务、代码提交触发（如GitLab Webhook）或手动执行等方式启动测试。
> 2. **关键组件协作**
>    - **Task Runner**：统一调度接口测试任务。
>    - **Result Hub**：处理测试执行结果。
>    - **Kafka**：接收测试结果数据供后续分析。
> 3. **扩展触发方式**
>    - 通过**Chrome插件**录制Web请求生成JMeter脚本并导入MeterSphere，结合CI/CD流程触发。
>    - 使用**IDEA插件**同步接口定义，基于代码变更自动触发测试。
>
> 更多细节可参考架构图：[组件说明](https://metersphere.io/docs/v3.x/img/components.png)

用例上没有很明显的自动化标签，估计要实测看结果了



### Qase

> https://www.qase.io/

弱智东西，非企业邮箱输入会提示错误，但是就是不告诉你错误原因，企业邮箱立马就成功

![image-20260603194609871](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603194609911.png)

界面也还行，比较简单的，也算现代化的

![image-20260603194812544](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603194812583.png)

Qase的测试内容的描述更符合我预期一些，自动化的标签是有的，不过似乎没有和需求挂钩的地方



### AgileTest

> https://agiletest.app/

![image-20260603201047001](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603201047036.png)

AgileTest的这个价格稍微有点低，一个人1.5刀，这不是把其他人架起来烤嘛，不过Agile 也是ATLASSIAN公司的，需要配合Jira一起用，这个有点麻烦，我没有Jira，只能放弃了



### Testiny

![image-20260603201722835](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603201722902.png)

> https://app.testiny.io/

Testiny，没想到有国外的软件，中文适配的还行

![image-20260603201927125](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603201927184.png)

也有类似的问题，缺少自动化的标签，自定义标签没看出来哪里能设置，感觉他是靠树形结构去做归类的

Testiny的自动化也是通过接口来实现的，不过这里是把自动化的结果报告进行了同步收集，似乎并不能直接在Testiny这里直接触发自动化运行。



### aqua

> https://aqua-cloud.io/

aqua的价格有点逆天，产品89欧/人，测试管理89欧/人，测试19欧/人，注册有点麻烦要国外手机验证，虽然我有，但是我懒得注册了



### testmo

![image-20260603203806855](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603203806926.png)

> https://www.testmo.com/

testmo感觉还行，据说被testrail背后的公司收购了，然后一片唱衰，都说会被搞垮。

看了一下基础用例管理方式依然是通过文件夹的形式进行分类的



### QAlity Plus 

> https://soldevelo.com/products/test-management-for-jira/

只适配Jira



### Excel

传统测试工具，Excel其实是能满足上面所有内容的，无论是和需求关联、分组、打标签、评审、自动化，它都可以，只是有点没系统，所有都是人工约定的，没有很强的模板约束，其数据本身的历史追溯有点困难，文件存储本身也需要解决。



### 其他

其他类文本工具，比如notion、wolai、plane、各种智能表格等等，进行一定的改造也能满足测试的需求，就是有点不专业，很多流畅性的东西需要外部处理

其他一体的平台也包含一部分测试平台的内容，只不过这里我们已经有了其他内容的补充，暂时不需要那么重的一个平台，单纯能管好测试用例就够了，其他Devops有其他工具做了。



## Summary

目前看下来MeterSphere可能是其中较为好用的，至于迁移成本，现在有AI干活的情况下，只需要你能把以前的数据导出来，那么这个成本就非常低，给好上下文背景，测试平台的接口或者模板格式给好，让AI把用例转移一下形式，其实非常容易，很简单就能迁移到新平台上

测试管理平台还看到了一些别人的需求，这里还包含了普通的小白测试人员，对应的任务分配，时间管理等等也会被集成到这个管理平台上，相当于可以量化考核每个测试人员了



![image-20260603204423812](https://img.elmagnifico.tech/static/upload/elmagnifico/20260603204423841.png)

这个兄弟说得挺好的，测试是否需要管理工具，是否需要这么多细节流程来确认测试工作人员是否工作到位了，这个东西和产品的质量，成本需要找到一个平衡点，大多数公司都没有找到。挺无奈的，研发、测试一环扣着一环，都是对上一步结果的再次验证和纠正，只要有人在这里，只要你不是三体人，那表达一定会有出入，最终的路径一定要经过二次甚至三次验证才能出结果，这就无形中抬高了很多成本了。



还有一种方式这个测试体系或者架构从一开始就是自己构建的，那么在现代的情况下，结合一下AI，把excel表进行数据库化，然后加上一个前端作为展示和修改界面，其实就可以满足大多数测试的需求了，这个架构也不是很难，现在AI做其实很简单了。这种方式定制化程度很高，基本啥需求都可以自己搞定。



## Quote

> google
>
> https://www.reddit.com/r/QualityAssurance/comments/197qvo7/thoughts_on_best_test_case_management_tool/?show=original

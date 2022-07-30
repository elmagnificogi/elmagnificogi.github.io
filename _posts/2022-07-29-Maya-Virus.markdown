---
layout:     post
title:      "Maya病毒清理"
subtitle:   "你的文件贼健康,我就说一声没有别的意思"
date:       2022-07-29
update:     2022-07-29
author:     "elmagnifico"
header-img: "img/y2.jpg"
catalog:    true
tags:
    - Maya
---

## Forward

早就听说Maya场景被人植入了病毒，但是由于我们环境相对封闭，基本不会出现场景文件外流和流入，所以一直也没在意。

最近开了一个别人的场景，突然发现保存文件多了一个提示

![img](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207291057106.png)

这东北大渣滓味，明显不是maya官方提示，随便搜了一下就发现了这东西传播非常广



## 病毒由来

最初只是有人利用maya的机制，把脚本写在了自动加载里面，然后搞了一波恶作剧吧。但是这个脚本是具有传染性的，导致这东西扩散的满世界都是。后来就有了针对这个病毒的处理程序。但是呢，写这个程序的人，也把他的程序写成了传染性，也就变成了现在的贼健康。好家伙以毒攻毒是吧，这个牛皮癣就一直传播到现在。但是他本人给的检测程序的只能批量处理ma文件，对于mb文件就得手动操作了。

也正是这个病毒，导致maya从以前的不检测scripts文件变成了现在任何改动scripts都会有提示，可笑的是这个牛皮癣是不会触发maya的scripts检测机制，根本不提示脚本改变了。这就导致这个东西依然被传播。

![image-20220729142712896](http://img.elmagnifico.tech:9514/static/upload/elmagnifico/202207291427028.png)

好一个，一旦泄露，我不负责



## 清理脚本

清理思路很简单，hook maya的场景打开和保存事件，然后自动执行删除病毒节点和文件即可

```python
    def clean_virus(self):
        cmds.scriptJob(e=["PostSceneRead", lambda *args: self.scene_read_callback()])
        cmds.scriptJob(e=["SceneOpened", lambda *args: self.scene_read_callback()])
        cmds.scriptJob(e=["SceneSaved", lambda *args: self.scene_read_callback()])
        # Now display the job
        # jobs = cmds.scriptJob(listJobs=True)
        # print(jobs)

    def scene_read_callback(self):
        debug_print('clean_virus')
        if cmds.objExists("vaccine_gene"):
            debug_print("find vaccine_gene,try delete it")
            cmds.delete("vaccine_gene")
            debug_print("delete ok")
        if cmds.objExists("breed_gene"):
            debug_print("find breed_gene,try delete it")
            cmds.delete("breed_gene")
            debug_print("delete ok")

        plugin_paths = mel.eval("getenv MAYA_PLUG_IN_PATH")
        plugin_path = plugin_paths.split(';')[0]
        plugin_path = os.path.abspath(os.path.join(plugin_path, "..\.."))
        # print(plugin_path+"\scripts")
        vir1 = plugin_path + "\scripts\\userSetup.py"
        vir2 = plugin_path + "\scripts\\vaccine.py"
        if os.path.isfile(vir1):
            debug_print("find vir1,try delete it")
            os.remove(vir1)
            debug_print("delete ok")
        if os.path.isfile(vir2):
            debug_print("find vir2,try delete it")
            os.remove(vir2)
            debug_print("delete ok")
        debug_print('clean_virus ok')
```

非常简单，直接调用`clean_virus`就行了，只要这个maya还是打开的状态下，就会自动清理和vaccine相关的内容。不具有传染性，只要重启maya，这一套检测就会失效。



## Summary

maya这个还只是简单的机制，只是利用了默认启动流程的默认执行脚本而已。真的要写病毒，怕不是比这要厉害得多哦。

maya的防病毒这种东西又不能深度去做，做的话又会出现各种更深的问题，而正常谁会去写病毒为难一个做maya的呢



## Quote

> https://www.zhihu.com/question/411230807/answer/1445957932
>
> https://mp.weixin.qq.com/s/lFcsQjQdjVbMNgprdIEvLw


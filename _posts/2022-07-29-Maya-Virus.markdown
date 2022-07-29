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

这东北大渣滓味，明显不是maya官方提示，随便搜了一下就发现了这东西传播非常广。



## 清理脚本

清理思路很简单，hook maya的场景打开和保存事件，然后自动执行

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

非常简单，直接调用`clean_virus`就行了，只要这个maya还是打开的状态下，就会自动清理和vaccine相关的内容。



## Summary



## Quote

> https://www.zhihu.com/question/411230807/answer/1445957932
>
> https://mp.weixin.qq.com/s/lFcsQjQdjVbMNgprdIEvLw


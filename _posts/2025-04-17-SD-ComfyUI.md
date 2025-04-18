---
layout:     post
title:      "SD ComfyUI部署"
subtitle:   "Stable Diffusion,Python 虚拟环境管理工具,uv,annaconda"
date:       2026-04-18
update:     2026-04-18
author:     "elmagnifico"
header-img: "img/pen-head-bg.jpg"
catalog:    true
tobecontinued: true
tags:
    - AI
    - SD
    - ComfyUI
    - uv
---

## Foreword



## ComfyUI

> https://github.com/comfyanonymous/ComfyUI



### 部署

最好先安一下python 3.13的环境， ComfyUI的一些老库可能运行不了

拉取ComfyUI源码

```
git clone https://github.com/comfyanonymous/ComfyUI.git
git check v0.3.27
```

Put your SD checkpoints (the huge ckpt/safetensors files) in: models/checkpoints

Put your VAE in: models/vae



安装CUDA

```
wget https://developer.download.nvidia.com/compute/cuda/12.8.0/local_installers/cuda_12.8.0_570.86.10_linux.run
sudo sh cuda_12.8.0_570.86.10_linux.run
```



```
sudo vi ~/.bashrc
```

增加cuda到环境变量中

```
export PATH="/usr/local/cuda-12.4/bin:$PATH"
export LD_LIBRARY_PATH="/usr/local/cuda-12.4/lib64:$LD_LIBRARY_PATH"
```

验证 CUDA安装成功

```
nvcc -V
```



创建ComfyUI使用的python环境

```
cd ComfyUI
conda create -n comfyui python=3.10
conda activate comfyui 
```

安装依赖文件

```
pip install -r requirements.txt
```



修改端口启动

```
python main.py --port 15070 --listen 0.0.0.0
```



### 测试

访问就能看到界面了

```
http://主机IP:15070
```



## Python 虚拟环境管理工具

折腾AI相关内容，很容易涉及到各种python包和python本身的版本变动，以前是用anaconda，后来anaconda商业化了，对于商用需要授权了，所以很多使用直接就抛弃anaconda，投向其他新的环境管理阵营了

对比一下当前的几个虚拟环境管理工具

- venv，python自带的，如果只是需要做不同的包管理，用venv就够了，但是venv本身是和项目绑定的，换项目时需要再弄一个，这样就有点不方便，没有共用性了。
- pipenv，似乎有bug，不推荐
- anaconda，商用，本身也比较大，包含的工具很多
- poetry，类似venv缺少python本身的版本管理
- pdm，龟速，据说慢的要死
- uv，极速，支持python版本管理，也有一些缺点，但是“快”掩盖了其他问题



### uv

记录一点uv使用的操作，ComfyUI 这些就是用uv来完成了



强行安装uv进系统

```
pip install uv --break-system-packages
```



创建一个虚拟环境，本质上会创建一个`.venv`文件夹

```
uv venv
```

激活虚拟环境

```
source .venv/bin/activate
```



uv和pip结合，如果你只熟悉pip，那 只需要在原来pip前面加个uv就行了，剩下和以前一样

```
uv pip install flask pandas numpy
uv pip install -r requirements-dev.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```



如果是个新环境，可以通过这种方式记录下来当前所有依赖包，方便后续项目使用

```
uv pip freeze > requirements.txt
```

同理安装环境

```
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
```



uv 安装多个版本python

```
uv python install 3.10 3.11 3.12
```



切换项目python版本

```
# 项目A使用Python 3.8
cd project_a && uv venv --python 3.8

# 项目B使用Python 3.11 
cd project_b && uv venv --python 3.11

使用指定版本
uv python pin 3.13
```



## Summary



## Quote

> https://blog.csdn.net/u013440574/article/details/146447378
>
> https://blog.csdn.net/2301_77717148/article/details/146208611

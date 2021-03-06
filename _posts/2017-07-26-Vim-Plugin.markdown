---
layout:     post
title:      "Vim 插件"
subtitle:   "Linux"
date:       2017-07-26
author:     "elmagnifico"
header-img: "img/git-head-bg.jpg"
catalog:    true
tags:
    - Linux
    - Vim
---

## Vim 插件

Vim 中有些插件非常好用，这里记录一些我正在用的，以及当前配置。

#### NERDTree

>The NERD tree allows you to explore your filesystem and to open files and directories. It presents the filesystem to you in the form of a tree which you manipulate with the keyboard and/or mouse. It also allows you to perform simple filesystem operations.
>
> https://github.com/scrooloose/nerdtree

NERDTree 主要是给 vim 添加了一个目录树作为一个分屏，切换文件更加方便

###### 安装

1. 下载解压缩
2. 把 plugin/NERD_tree.vim 和 doc/NERD_tree.txt 分别拷贝到~/.vim/plugin 和  ~/.vim/doc 目录。
3. 如果完成上一步不行，那么把解压后的所有文件全部拷贝到 .vim/ 目录下

###### 快捷键

- ctrl + w + h    光标 focus 左侧树形目录
- ctrl + w + l    光标 focus 右侧文件显示窗口
- ctrl + w + w    光标自动在左右侧窗口切换
- ctrl + w + r    移动当前窗口的布局位置
- o       在已有窗口中打开文件、目录或书签，并跳到该窗口
- go      在已有窗口 中打开文件、目录或书签，但不跳到该窗口
- t       在新 Tab 中打开选中文件/书签，并跳到新 Tab
- T       在新 Tab 中打开选中文件/书签，但不跳到新 Tab
- i       split 一个新窗口打开选中文件，并跳到该窗口
- gi      split 一个新窗口打开选中文件，但不跳到该窗口
- s       vsplit 一个新窗口打开选中文件，并跳到该窗口
- gs      vsplit 一个新 窗口打开选中文件，但不跳到该窗口
- !       执行当前文件
- O       递归打开选中 结点下的所有目录
- x       合拢选中结点的父目录
- X       递归 合拢选中结点下的所有目录
- e       Edit the current dif


- 双击    相当于 NERDTree-o
- 中键    对文件相当于 NERDTree-i，对目录相当于 NERDTree-e


- D       删除当前书签
- P       跳到根结点
- p       跳到父结点
- K       跳到当前目录下同级的第一个结点
- J       跳到当前目录下同级的最后一个结点
- k       跳到当前目录下同级的前一个结点
- j       跳到当前目录下同级的后一个结点


- C       将选中目录或选中文件的父目录设为根结点
- u       将当前根结点的父目录设为根目录，并变成合拢原根结点
- U       将当前根结点的父目录设为根目录，但保持展开原根结点
- r       递归刷新选中目录
- R       递归刷新根结点
- m       显示文件系统菜单
- cd      将 CWD 设为选中目录


- I       切换是否显示隐藏文件
- f       切换是否使用文件过滤器
- F       切换是否显示文件
- B       切换是否显示书签


- q       关闭 NerdTree 窗口
- ?       切换是否显示 Quick Help


切换标签页

- :tabnew [++opt选项] ［＋cmd］ 文件      建立对指定文件新的tab
- :tabc   关闭当前的 tab
- :tabo   关闭所有其他的 tab
- :tabs   查看所有打开的 tab
- :tabn   后一个 tab
- :tabp   前一个 tab

标准模式下切换标签页

- gT      前一个 tab
- gt      后一个 tab


- cmd+w   关闭当前的 tab
- cmd+{   前一个 tab
- cmd+}   后一个 tab

###### 配置文件

在 vim 启动的时候默认开启 NERDTree

    autocmd VimEnter * NERDTree
    autocmd VimEnter * wincmd p

按下 F5 调出/隐藏 NERDTree

    nnoremap <silent> <F5> :NERDTreeToggle<CR>

将 NERDTree 的窗口设置在 vim 窗口的右侧（默认为左侧）

    let NERDTreeWinPos="right"

当打开 NERDTree 窗口时，自动显示 Bookmarks

    let NERDTreeShowBookmarks=1

#### Taglist

>The "Tag List" plugin is a source code browser plugin for Vim and
provides an overview of the structure of source code files and allows
you to efficiently browse through source code files for different
programming languages.
>
> https://github.com/vim-scripts/taglist.vim

Taglist 在 vim 上开了一个分屏，作为 Symbols 的一个导航，快速跳转函数或者宏定义等功能

###### 安装

1. Download the taglist.zip file and unzip the files to the $HOME/.vim

2. Change to the $HOME/.vim/doc directory, start Vim and run the ":helptags ."
command to process the taglist help file. Without this step,
you cannot jump to the taglist help topics.

###### 快捷键

- <CR>          跳到光标下tag所定义的位置，用鼠标双击此tag功能也一样
- o             在一个新打开的窗口中显示光标下tag
- <Space>       显示光标下tag的原型定义
- u             更新taglist窗口中的tag
- s             更改排序方式，在按名字排序和按出现顺序排序间切换
- x             taglist窗口放大和缩小，方便查看较长的tag
- \+            打开一个折叠，同zo
- \-            将tag折叠起来，同zc
- \*            打开所有的折叠，同zR
- =             将所有tag折叠起来，同zM
- [[            跳到前一个文件
- ]]            跳到后一个文件
- q             关闭taglist窗口
- <F1>          显示帮助

###### 配置文件

使用 F4 来开关 Tlist ，平常不用的时候默认是关闭的

    nnoremap <silent> <F4> :TlistToggle<CR>

设置 Tlist 窗口固定宽度

    let Tlist_Inc_Winwidth=0

设置在右侧显示

    let Tlist_Use_Right_Window=1

设置不自动启动

    let Tlist_File_Fold_Auto_Close=1

#### cscope

>Cscope is a developer's tool for browsing source code. It has an impeccable Unix pedigree, having been originally developed at Bell Labs back in the days of the PDP-11. Cscope was part of the official AT&T Unix distribution for many years, and has been used to manage projects involving 20 million lines of code!
>
> http://cscope.sourceforge.net/

cscope 主要是为了解决 函数跳转 函数被调用搜索 等等情况的，非常好用，基本是必备插件

要注意的是，打开 Vim 的路径必须是在 cscope 文件的文件夹内或者子文件夹内，否则会提示无
连接的情况

###### 安装

    sudo apt-get install cscope

在源码工程目录下 创建对应的 cscope 文件

    cscope -Rbkq

###### 快捷键

设置 F6 来寻找被调用的所有地方

    nnoremap <silent> <F6> :cs find c <C-R>=expand("<cword>")<CR><CR>

设置 F7 全局搜索

    nnoremap <silent> <F7> :cs find s <C-R>=expand("<cword>")<CR><CR>

###### 配置文件

通过下面的配置，自动连接 cscope 文件到打开的目录下

    if has("cscope") && filereadable("/usr/bin/cscope")
    	set csprg=/usr/bin/cscope
    	set csto=0
    	set cst
    	set nocsverb
    	"add any database in current directory"
    	if filereadable("cscope.out")
    		cs add cscope.out
    	" else add database pointed to by environment
    	elseif $CSCOPE_DB != ""
    		cs add $CSCOPE_DB
    	endif
    	set csverb
    endif

#### exuberant-ctags

> Ctags generates an index (or tag) file of language objects found in source files that allows these items to be quickly and easily located by a text editor or other utility. A tag signifies a language object for which an index entry is available (or, alternatively, the index entry created for that object).
Tag generation is supported for these programming languages.
>
> http://ctags.sourceforge.net/

ctags 提供的是各种函数、变量的跳转表，他不能提供函数反查调用的功能，所以不如 cscope 好用。

但是 cscope 也有问题，经常有一些函数使用跳转跳不进去，但是用搜索就能搜索到，而 ctags
就不存在这个问题，所以一般两个都安装相互补充吧

###### 安装

    sudo apt-get install exuberant-ctags

在源码工程目录下 创建对应的 ctags 文件

    ctags –R *

#### solarized

> Solarized is a sixteen color palette (eight monotones, eight accent colors) designed for use with terminal and gui applications. It has several unique properties. I designed this colorscheme with both precise CIELAB lightness relationships and a refined set of hues based on fixed color wheel relationships. It has been tested extensively in real world use on color calibrated displays (as well as uncalibrated/intentionally miscalibrated displays) and in a variety of lighting conditions.
>
> http://ethanschoonover.com/solarized

solarized 算是 Vim 中较为有名的主题，配色都比较护眼，但是我的屏幕颜色有问题，颜色并不正
，看着很难受。

###### 安装

下载解压以后，复制到color下

    $ cd vim-colors-solarized/colors
    $ mv solarized.vim ~/.vim/colors/

###### 快捷键

F2 一键切换到日间主题

    nnoremap <silent> <F2> :set bg=light<CR>、

F3 一键切换到夜间主题

    nnoremap <silent> <F3> :set bg=dark<CR>

一键切换主题，但是在我这里不起作用

    call togglebg#map("<F5>")


###### 配置文件

开启关键词高亮显示，颜色设置为256，设定主题为 solarized ，默认是夜间主题

    syntax enable
    set bg=dark
    colorscheme solarized

#### 其他配置

显示行号

    :set number

设置 tab 空格数 ，以及 tab 缩进空格数

    :set ts=4
    :set softtabstop=4
    :set autoindent
    :set cindent
    :set shiftwidth=4

设置 搜索内容高亮

    set hls
    set cuc
    set cul

设置 光标显示十字准星

    highlight CursorLine cterm=None ctermbg=darkred ctermfg=white guibg=darkred guifg=white
    highlight CursorColumn cterm=None ctermbg=darkred ctermfg=white guibg=darkred guifg=white

## Vundle

> Vundle is short for Vim bundle and is a Vim plugin manager.Vim
>
> https://github.com/VundleVim/Vundle.vim#quick-start

Vim 中用来管理插件的一个插件，很多插件通过他都可以比较快捷方便的安装

###### 安装

通过 git 直接把 Vundle 安装在 .vim 的目录下

$ git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim

###### 配置文件

需要把下面的内容添加到 .vimrc 的开头部分，保障所有插件都能正常运行

    set nocompatible              " be iMproved, required
    filetype off                  " required

    " set the runtime path to include Vundle and initialize
    set rtp+=~/.vim/bundle/Vundle.vim
    call vundle#begin()
    " alternatively, pass a path where Vundle should install plugins
    "call vundle#begin('~/some/path/here')

    " let Vundle manage Vundle, required
    Plugin 'VundleVim/Vundle.vim'

    " The following are examples of different formats supported.
    " Keep Plugin commands between vundle#begin/end.
    " plugin on GitHub repo
    Plugin 'tpope/vim-fugitive'
    " plugin from http://vim-scripts.org/vim/scripts.html
    " Plugin 'L9'
    " Git plugin not hosted on GitHub
    Plugin 'git://git.wincent.com/command-t.git'
    " git repos on your local machine (i.e. when working on your own plugin)
    Plugin 'file:///home/gmarik/path/to/plugin'
    " The sparkup vim script is in a subdirectory of this repo called vim.
    " Pass the path to set the runtimepath properly.
    Plugin 'rstacruz/sparkup', {'rtp': 'vim/'}
    " Install L9 and avoid a Naming conflict if you've already installed a
    " different version somewhere else.
    " Plugin 'ascenator/L9', {'name': 'newL9'}

    " All of your Plugins must be added before the following line
    call vundle#end()            " required
    filetype plugin indent on    " required
    " To ignore plugin indent changes, instead use:
    "filetype plugin on
    "
    " Brief help
    " :PluginList       - lists configured plugins
    " :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
    " :PluginSearch foo - searches for foo; append `!` to refresh local cache
    " :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
    "
    " see :h vundle for more details or wiki for FAQ
    " Put your non-Plugin stuff after this line

要安装 其他插件 打开 vim 然后运行：

    :PluginInstall

会安装你需要的插件

## YouCompleteMe

> YouCompleteMe is a fast, as-you-type, fuzzy-search code completion engine for Vim.
>
> https://github.com/Valloric/YouCompleteMe#full-installation-guide

vim 中最强大的补全插件，真的没有之一，而且名字也很有意思，很诗意，很美。

不过其安装难度真的很大，很容易因为各种环境不正确而出错，大概是他自身需要的相关东西太多了
吧，不过安好了还是非常好用的说，很值得。

###### 安装

1 . 确保 VIM 版本是 >=7.4 的

```
vim --version
VIM - Vi IMproved 7.4 (2013 Aug 10, compiled Nov 24 2016 16:44:48)
```

确保你的 vim 支持 python 2.6 以上版本

```
vim --version | grep python
+cryptv          +linebreak       -python          +vreplace
+cscope          +lispindent      +python3         +wildignore
```

加号表示支持，减号表示不支持，这里有 python3 就表示足够用了

因为使用 vundle 完全看不出来安装进度，所以这里只用 git 来安装 ，出错了也很明显。

2 . 拿到YCM的源码

```
git clone --recursive https://github.com/Valloric/YouCompleteMe.git
```

上一步如果失败了，没关系，再运行一次，肯定能成功，下面进行完整性检查

```
git submodule update --init --recursive
```

3 . 由于是 C 家族语言，需要语义补全，需要下面的库支持

```
sudo apt-get install llvm-3.9 clang-3.9 libclang-3.9-dev libboost-all-dev
```

4 . 创建编译过程文件目录，并且切换过去，然后运行 C 家族语言

```
mkdir ~/.ycm_build
cd ~/.ycm_build
cmake -G "Unix Makefiles" -DUSE_SYSTEM_BOOST=ON -DUSE_SYSTEM_LIBCLANG=ON . ~/.vim/bundle/YouCompleteMe/third_party/ycmd/cpp
```

这里可能会出很多错误，需要自行解决，我这里一个错都没出...运气太好了

5 . 构建 ycm_core

```
    cmake --build . --target ycm_core
```

6 . 复制 .ycm_extra_conf.py 文件到 .vim 下

```
    cp ~/.vim/bundle/YouCompleteMe/third_party/ycmd/examples/.ycm_extra_conf.py ~/.vim/
```

7 . 修改 .vimrc 文件，添加如下内容

```
    let g:ycm_server_python_interpreter='/usr/bin/python'
    let g:ycm_global_ycm_extra_conf='~/.vim/.ycm_extra_conf.py'
```

8 . 在 vim 中运行如下命令，检查是否有错误

```
:YcmToggleLogs stderr
```

如果没有任何提示，说明没有发生错误，那么就正常安装成功了

就可以正常使用，随便切到某个 .c 文件中，然后输入一下就发现补全已经自动出现了。

#### 最终的配置文件

```
set nocompatible              " be iMproved, required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'VundleVim/Vundle.vim'

" The following are examples of different formats supported.
" Keep Plugin commands between vundle#begin/end.
" plugin on GitHub repo
Plugin 'tpope/vim-fugitive'

" plugin from http://vim-scripts.org/vim/scripts.html
" Plugin 'L9'
" Git plugin not hosted on GitHub
Plugin 'git://git.wincent.com/command-t.git'

" git repos on your local machine (i.e. when working on your own plugin)
Plugin 'file:///home/gmarik/path/to/plugin'

" The sparkup vim script is in a subdirectory of this repo called vim.
" Pass the path to set the runtimepath properly.
Plugin 'rstacruz/sparkup', {'rtp': 'vim/'}

Plugin 'Valloric/YouCompleteMe'

" Install L9 and avoid a Naming conflict if you've already installed a
" different version somewhere else.
" Plugin 'ascenator/L9', {'name': 'newL9'}

" All of your Plugins must be added before the following line
call vundle#end()            " required
filetype plugin indent on    " required
" To ignore plugin indent changes, instead use:
"filetype plugin on
"
" Brief help
" :PluginList       - lists configured plugins
" :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
" :PluginSearch foo - searches for foo; append `!` to refresh local cache
" :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
"
" see :h vundle for more details or wiki for FAQ
" Put your non-Plugin stuff after this line

let g:ycm_server_python_interpreter='/usr/bin/python'
let g:ycm_global_ycm_extra_conf='~/.vim/.ycm_extra_conf.py'

nnoremap <silent> <F2> :set bg=light<CR>
nnoremap <silent> <F3> :set bg=dark<CR>
nnoremap <silent> <F4> :TlistToggle<CR>
nnoremap <silent> <F5> :NERDTreeToggle<CR>
nnoremap <silent> <F6> :cs find c <C-R>=expand("<cword>")<CR><CR>
nnoremap <silent> <F7> :cs find s <C-R>=expand("<cword>")<CR><CR>

autocmd vimenter * NERDTree
autocmd vimenter * wincmd p

:set number
:set ts=4
:set softtabstop=4
:set autoindent
:set cindent
:set shiftwidth=4

set hls
set cuc
set cul

highlight CursorLine cterm=None ctermbg=darkred ctermfg=white guibg=darkred guifg=white
highlight CursorColumn cterm=None ctermbg=darkred ctermfg=white guibg=darkred guifg=white

let NERDTreeShowBookmarks=1

syntax enable
set bg=dark
colorscheme solarized
let g:solarized_termcolors=256

let Tlist_Inc_Winwidth=0
let Tlist_Use_Right_Window=1
let Tlist_File_Fold_Auto_Close=1

if has("cscope") && filereadable("/usr/bin/cscope")
	set csprg=/usr/bin/cscope
	set csto=0
	set cst
	set nocsverb
	"add any database in current directory"
	if filereadable("cscope.out")
		cs add cscope.out
	" else add database pointed to by environment
	elseif $CSCOPE_DB != ""
		cs add $CSCOPE_DB
	endif
	set csverb
endif
```

## Quote

> http://easwy.com/blog/archives/advanced-vim-skills-cscope/
>
> http://cscope.sourceforge.net/
>
> http://blog.sina.com.cn/s/blog_684355870100jqz3.html
>
> http://blog.csdn.net/longerzone/article/details/7789581
>
> http://www.jianshu.com/p/d908ce81017a?nomobile=yes

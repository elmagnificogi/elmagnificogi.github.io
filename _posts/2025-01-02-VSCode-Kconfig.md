---
layout:     post
title:      "nRF-Kconfig插件解析"
subtitle:   "Kconfig、VScode、nRF、Extension"
date:       2025-01-02
update:     2025-01-09
author:     "elmagnifico"
header-img: "img/bg8.jpg"
catalog:    true
tobecontinued: false
tags:
    - build
---

## Foreword

之前刚好看过一点VScode插件原理，这里就能用上了，看一下nRF-Kconfig是怎么实现的，改一个通用版本来，方便大家使用



## nRF-Kconfig

Kconfig插件的安装目录在这里

```
C:\Users\用户名\.vscode\extensions\nordic-semiconductor.nrf-kconfig-2024.12.13
```

实际这个插件也没有加密或者混淆什么的，可以直接看



### 尝试build

```json
	"scripts": {
		"vscode:prepublish": "npm run build && npm run changelog",
		"build": "rimraf dist && tsx ./scripts/build.js --production",
		"watch": "tsx ./scripts/build.js --watch",
		"dev": "tsx ./scripts/build.js --watch",
		"type-check": "tsc --noEmit",
		"lint": "tsx ../scripts/lint.ts nrf-kconfig",
		"lintfix": "tsx ../scripts/lint.ts --fix nrf-kconfig",
		"changelog": "tsx ../scripts/changelog.ts kconfig",
		"copyright": "npm run --prefix ../ copyright",
		"buildHeaderFiles": "tsx ../scripts/buildHeaderFiles.ts",
		"update-build-number": "node ../scripts/updateBuildNumber.js kconfig",
		"copy-css": "copyfiles \"src/**/*.css\" \"src/**/*.scss\" out/nrf-kconfig && copyfiles \"../common/src/**/*.css\"  \"../common/src/**/*.scss\" out/common",
		"build-tests": "tsc -p . --outDir out",
		"watch-tests": "tsc -p . -w --outDir out",
		"pretest": "npm run build-tests && npm run build && npm run copy-css",
		"test": "node ./out/nrf-kconfig/test/runTests.js"
	},
```

直接使用Package.js中的script部分，可以直接build或者prepublish

可能会遇到下面的错误

```
npm : 无法加载文件 D:\nodejs\npm.ps1，因为在此系统上禁止运行脚本
```

查看脚本允许策略，可以看到返回值是严格，这样不允许npm调用ps1的脚本

```powershell
Get-ExecutionPolicy
```

![image-20250102163319155](https://img.elmagnifico.tech/static/upload/elmagnifico/20250102163319195.png)

修改策略，改为允许远程运行

```powershell
Set-ExecutionPolicy RemoteSigned
```

![image-20250102163501393](https://img.elmagnifico.tech/static/upload/elmagnifico/20250102163501426.png)

修改完成，再次进行build，正常了

![image-20250102163648400](https://img.elmagnifico.tech/static/upload/elmagnifico/20250102163648430.png)

依然提示缺少rimraf命令，但是至少说明脚本跑起来了，这个问题后面再处理

安装一下rimraf就行了，实际上后续还会有tsx也缺少，一起都安装了

```bash
npm install --save rimraf
npm install --save tsx
```

继续往下跑就会发现，这样copy的代码缺少一个script文件夹，这里面包含了各种打包的脚本文件，这里只能先到此为止了



### 源码分析

```json
{
	"contributes": {
        # 这里注册了各种使用的按钮
		"commands": [
			{
				"command": "kconfig.add",
				"category": "nRF Kconfig",
				"title": "Kconfig: Add build folder"
			},
			{
				"command": "kconfig.showGui",
				"category": "nRF Kconfig",
				"title": "Kconfig: Show Config GUI"
			},
			{
				"command": "kconfig.goToSymDefinition",
				"category": "nRF Kconfig",
				"title": "Go to Symbol Definition"
			},
			{
				"command": "kconfig.expandSubtree",
				"category": "nRF Kconfig",
				"title": "Expand Subtree"
			},
			{
				"command": "kconfig.collapseSubtree",
				"category": "nRF Kconfig",
				"title": "Collapse Subtree"
			},
			{
				"command": "kconfig.ctx.setActive",
				"category": "nRF Kconfig",
				"title": "Set Active Context",
				"icon": "$(edit)"
			}
		],
		"menus": {
			"webview/context": [
				{
					"command": "kconfig.goToSymDefinition",
					"when": "canGoToSymDefinition == true"
				},
				{
					"command": "kconfig.expandSubtree",
					"when": "canExpandSubtree == true"
				}, 
				{
					"command": "kconfig.collapseSubtree",
					"when": "canCollapseSubtree == true"
				}
			],
			"commandPalette": [
				{
					"command": "kconfig.goToSymDefinition",
					"when": "never"
				},
				{
					"command": "kconfig.expandSubtree",
					"when": "never"
				},
				{
					"command": "kconfig.collapseSubtree",
					"when": "never"
				}
			],
			"view/item/context": [],
			"editor/context": []
		},
		"submenus": [],
		# 这里是一些这个插件的一些设置参数
		"configuration": {
			"title": "nRF Kconfig",
			"type": "object",
			"description": "Settings for nRF Kconfig",
			"properties": {
				"kconfig.zephyr.base": {
					"type": "string",
					"description": "Override location of Zephyr. This is only necessary if you want to use nRF Kconfig by itself and the main extension is not installed.",
					"scope": "machine-overridable"
				},
				"kconfig.python": {
					"type": "string",
					"markdownDescription": "Location of Python executable. Python 3 is required to use nRF Kconfig. If no location is specified, then the `PATH` of the current workspace is used.",
					"scope": "machine-overridable"
				},
				"kconfig.liveValue": {
					"type": "boolean",
					"description": "Show changed values in conf files as ghost assignments on the same line as their original assignment.",
					"scope": "application",
					"default": true
				}
			}
		},
		# 这里主要是对文件解析和提示的配置，什么类型文件才会被调用解析器进行解析、高亮、补全等
		"languages": [
            # language定义一个数组，每个数组表示一种支持的语言类型
			{
         		# id是每个语言的标识符
				"id": "kconfig",
         		# 别名
				"aliases": [
					"Kconfig"
				],
				# 特指文件名
				"filenames": [
					"Kconfig"
				],
				# 特指符合某些规则的文件名
				"filenamePatterns": [
					"Kconfig.*"
				],
				# 这个里面是语言的具体规则，应该是内容识别的规则（折叠段识别）
				"configuration": "./language-configuration.json",
				"icon": {
					"dark": "./dist/images/dark/kconfig.svg",
					"light": "./dist/images/light/kconfig.svg"
				}
			},
			# 下面是特指了一些文件内容，相当于是exclude，排除了某些文件
			# 单独指定了他们是什么类型的语言文件，防止误识别
			{
				"id": "python",
				"filenamePatterns": [
					"Kconfig.py"
				]
			},
			{
				"id": "cmake",
				"filenamePatterns": [
					"Kconfig.cmake"
				]
			},
			{
				"id": "css",
				"filenamePatterns": [
					"Kconfig.css"
				]
			},
			{
				"id": "properties",
				"filenamePatterns": [
					"*_defconfig",
					"*.conf",
					".config",
					".config.sysbuild"
				]
			}
		],
		"viewsWelcome": []
	},
	"__metadata": {
		"id": "3c214a32-71ea-4549-a492-0f972af076a5",
		"publisherId": "c9e8387e-6a8a-4101-bcc0-52d8bf37ca83",
		"publisherDisplayName": "Nordic Semiconductor",
		"targetPlatform": "undefined",
		"isApplicationScoped": false,
		"isPreReleaseVersion": false,
		"hasPreReleaseVersion": false,
		"installedTimestamp": 1734425172758,
		"pinned": false,
		"preRelease": false,
		"source": "gallery",
		"size": 2490675
	},
	# 前面安装的几个依赖的模块，这里其实有提示
	"dependencies": {
		"rimraf": "^6.0.1",
		"tsx": "^4.19.2"
	}
}

```

重点还是看`kconfig.showGui`做了些啥



正常应该有一个js调用的脚本，但是没找到，只看到了py文件，找到了py的入口，直接让Copilot帮我分析了一下，大致是启动了一个LSP的语言分析（language symbol phrase）服务，然后这个服务和什么东西用的是rpc通信。

```python
if __name__ == "__main__":
    args = parse_args()

    srv = KconfigServer()
    sys.stdout = srv.log
    sys.stderr = srv.err

    print("Server starting")

    if args.debug:
        wait_for_debugger()

    if args.log:
        srv.logging = True

    srv.loop()
```

目前看起来这个LSP服务主要是用来做代码提示、符号信息、Kconfig内容查找？，不知道和具体文件解析有没有关系。

syntaxes下的kconfig.tmGrammar.json是kconfig高亮的配置文件



目前看应该还有一个前端或者是什么东西，通过rpc通信，将符号信息送给Kconfig进行分析，然后返回对应的信息

比如平常常用的查找定义，客户端发送请求，指定文件和符号所在行和字符（这里为啥不用指定字符的长度？不是很懂）

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "textDocument/definition",
    "params": {
        "textDocument": {"uri": "file:///path/to/file"},
        "position": {"line": 10, "character": 5}
    }
}
```

KconfigServer接收请求并处理

```python
@handler('textDocument/definition')
def handle_definition(self, params):
    sym = self.get_sym(params)
    if sym:
        return loc(sym)
```

KconfigServer接着发送响应

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": [
        {
            "uri": "file:///path/to/definition",
            "range": {
                "start": {"line": 5, "character": 0},
                "end": {"line": 5, "character": 10}
            }
        }
    ]
}
```

客户端接收并处理响应，跳转到符号定义位置，那么这次通信就算完成了

但是这个问题，似乎就是nRF Kconfig插件其实没加载，表面上看安装了，但是真正的加载和注册命令是需要extension的其他插件来完成的，虽然代码里写着独立运行，实际上并不可行

```json
    configuration: {
        title: 'nRF Kconfig',
        type: 'object',
        description: 'Settings for nRF Kconfig',
        properties: {
            'kconfig.zephyr.base': {
                type: 'string',
                description:
                    'Override location of Zephyr. This is only necessary if you want to use nRF Kconfig by itself and the main extension is not installed.',
                scope: 'machine-overridable',
            },
            'kconfig.python': {
                type: 'string',
                markdownDescription:
                    'Location of Python executable. Python 3 is required to use nRF Kconfig. If no location is specified, then the `PATH` of the current workspace is used.',
                scope: 'machine-overridable',
            },
            'kconfig.liveValue': {
                type: 'boolean',
                description:
                    'Show changed values in conf files as ghost assignments on the same line as their original assignment.',
                scope: 'application',
                default: true,
            },
        },
    },
```

![image-20250102193317336](https://img.elmagnifico.tech/static/upload/elmagnifico/20250102193317417.png)

`contributes.ts`中主要是用TS写的这个`contributes`的字段内容，打包过程中会被用来替换package.json中的内容。而`submenus`则是由build脚本填充的，由于缺少这一块，所以这里就空了



### 流程梳理

`kconfiglsp.py`中的`KconfigServer`类实现了一个Kconfig语言服务器协议（LSP）服务器。这个服务器通常由一个支持LSP的客户端（如Visual Studio Code或其他支持LSP的编辑器）调用和使用。以下是调用和使用`kconfiglsp.py`的典型流程：

#### 1. 客户端（如VS Code）启动LSP服务器

当用户在支持LSP的编辑器中打开一个Kconfig文件时，编辑器会根据配置启动相应的LSP服务器。

在VS Code中，这通常通过`package.json`中的`contributes`和`activationEvents`字段配置。例如：

```
{
  "contributes": {
    "languages": [
      {
        "id": "kconfig",
        "extensions": [".kconfig"],
        "configuration": "./language-configuration.json"
      }
    ],
    "commands": [
      {
        "command": "extension.kconfigServer",
        "title": "Start Kconfig Server"
      }
    ]
  },
  "activationEvents": [
    "onLanguage:kconfig"
  ]
}
```

- 这里的分析推敲，其实反向验证了package.json内的内容



#### 2. 启动LSP服务器

当满足激活条件（如打开Kconfig文件）时，编辑器会启动LSP服务器进程。

这个进程会运行`kconfiglsp.py`中的代码，创建并启动`KconfigServer`实例。



#### 3. 客户端与LSP服务器通信

启动后，客户端和LSP服务器通过JSON-RPC协议进行通信。

客户端发送各种LSP请求（如`textDocument/didOpen`、`textDocument/didChange`、`textDocument/completion`等）到服务器，`KconfigServer`类处理这些请求，并返回相应的响应。



#### 4. 处理请求和响应

`KconfigServer`类中的方法（如`handle_initialize`、`handle_completion`、`handle_definition`等）处理来自客户端的请求。



#### 5. 服务器发送通知

除了处理请求，`KconfigServer`还可以主动发送通知给客户端，例如发布诊断信息（`publish_diags`方法）或通知状态变化（`notify_status`方法）。



### nRF-connect-extension-pack

由于上面所有的逻辑都是copilot直接给出来的，实际在这份工程中并没有找到对应的代码，所以不是清楚是怎么一步步调用`kconfiglsp.py`的。怀疑这部分的JS代码是直接内嵌在了nRF的整体扩展中，所以单独只安装一个kconfig插件是无法直接显示kconfig的结果的，必须要配合大插件包才能正常启动

这里再把`nordic-semiconductor.nrf-connect-extension-pack-2024.9.5`的包拿出来分析一下，看看具体内容是怎么来的



看了一下pack的package.json，发现他好像只是一个整合包，实际并没有什么具体的代码

```json
{
	"name": "nrf-connect-extension-pack",
	"displayName": "nRF Connect for VS Code Extension Pack",
	"description": "Recommended extensions for development with the nRF Connect SDK",
	"publisher": "nordic-semiconductor",
	"homepage": "https://docs.nordicsemi.com/bundle/nrf-connect-vscode/page/index.html",
	"icon": "images/icon.png",
	"version": "2024.9.5",
	"bugs": {
		"url": "https://devzone.nordicsemi.com"
	},
	"engines": {
		"vscode": "^1.80.0"
	},
	"categories": [
		"Extension Packs"
	],
	"extensionPack": [
		"nordic-semiconductor.nrf-connect",
		"nordic-semiconductor.nrf-terminal",
		"nordic-semiconductor.nrf-devicetree",
		"nordic-semiconductor.nrf-kconfig",
		"ms-vscode.cpptools",
		"trond-snekvik.gnu-mapfiles",
		"twxs.cmake"
	],
	"main": "./dist/extension.js",
	"activationEvents": [
		"*"
	],
	"scripts": {
		"vscode:prepublish": "npm run build -- --notypecheck",
		"build": "rimraf dist && tsx ./scripts/build.js --production",
		"lint": "tsx ../scripts/lint.ts connect-extension-pack",
		"lintfix": "tsx ../scripts/lint.ts --fix connect-extension-pack",
		"copyright": "npm run --prefix ../ copyright",
		"dev": "tsx ./scripts/build.js --watch"
	},
	"__metadata": {
		"id": "50d64e34-3ee8-4e0c-b79d-97a3eab4581d",
		"publisherId": "c9e8387e-6a8a-4101-bcc0-52d8bf37ca83",
		"publisherDisplayName": "Nordic Semiconductor",
		"targetPlatform": "undefined",
		"isApplicationScoped": false,
		"isPreReleaseVersion": false,
		"hasPreReleaseVersion": false,
		"installedTimestamp": 1734424781886,
		"pinned": false,
		"preRelease": false,
		"source": "gallery",
		"size": 77034
	}
}
```



再仔细看一下extension.js的代码

```js
"use strict";
var objCreate = Object.create;
var objProperty = Object.defineProperty;
var objPropertyDescriptor = Object.getOwnPropertyDescriptor;
var objPropertyNames = Object.getOwnPropertyNames;
var objGet = Object.getPrototypeOf,
	objHasOP = Object.prototype.hasOwnProperty;
var b = (n, e) => {
		for (var t in e) objProperty(n, t, {
			get: e[t],
			enumerable: !0
		})
	},
	d = (n, e, t, s) => {
		if (e && typeof e == "object" || typeof e == "function")
			for (let i of objPropertyNames(e)) !objHasOP.call(n, i) && i !== t && objProperty(n, i, {
				get: () => e[i],
				enumerable: !(s = objPropertyDescriptor(e, i)) || s.enumerable
			});
		return n
	};
var f = (n, e, t) => (t = n != null ? objCreate(objGet(n)) : {}, d(e || !n || !n.__esModule ? objProperty(t, "default", {
		value: n,
		enumerable: !0
	}) : t, n)),
	C = n => d(objProperty({}, "__esModule", {
		value: !0
	}), n);
var y = {};
```

使用 b函数将属性从 `source` 对象定义到 `target` 对象上，而不是直接使用 `source` 对象，有几个好处：

**封装和模块化**：

- 通过将属性定义到 `target` 对象上，可以更好地封装和模块化代码。这样可以避免直接暴露 `source` 对象的内部实现细节。

**动态扩展对象**：

- 可以动态地将属性添加到 `target` 对象上，而不需要修改 `source` 对象。这在需要扩展对象功能时非常有用。

**控制属性访问**：

- 使用 `Object.defineProperty` 可以精确控制属性的行为，例如设置属性为只读、可枚举等。在这个例子中，属性被定义为 getter 函数，并且是可枚举的。

**避免命名冲突**：

- 如果直接使用 `source` 对象，可能会与现有对象的属性发生命名冲突。通过将属性定义到 `target` 对象上，可以避免这种冲突。

**灵活性**：

- 可以根据需要选择性地将某些属性定义到 `target` 对象上，而不是将整个 `source` 对象暴露出来。

就是通过Object.defineProperty实现一个代理类，后续代码基本都是围绕这个目标来做的。

最终把一些按钮或者触发器注册进了VSCode，这些id就对应上了具体的界面按钮和后续的事件触发机制



可以看到就是在这里把kconfig相关的指令注册进去了，前面报的kconfig不存在，也是因为connect没有启动，这里没有加载

![image-20250103120131588](https://img.elmagnifico.tech/static/upload/elmagnifico/20250103120131658.png)

所以还是得去看connect部分的代码



### nordic-semiconductor.nrf-connect

查看extension.js，格式化以后发现这个js的行数有12w，这就有点离谱了

![image-20250103163028633](https://img.elmagnifico.tech/static/upload/elmagnifico/20250103163028743.png)

copilot直接放弃工作了，让他读一下直接不会了

看了一下打包文件夹是dist，应该是套在某个框架上写完以后重新打包成了一个.js，所以这个内容就很难反向查了



## Summary

还是重写一个更快，这里能借鉴的只有Kconfig LSP这个部分了

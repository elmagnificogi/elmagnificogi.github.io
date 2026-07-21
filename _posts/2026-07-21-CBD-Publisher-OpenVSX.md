---
layout:     post
title:      "插件上架：Publisher 那些破事"
subtitle:   "VS Code、Cursor、Open VSX、命名空间"
date:       2026-07-21
update:     2026-07-21
author:     "elmagnifico"
header-img: "img/blackboard.jpg"
catalog:    true
mermaid:    false
tobecontinued: false
tags:
    - AI
    - Agent
    - VSCode
---

## Foreword

[CodeBind Docs](/2026/07/20/CBD-VSC-Plugin/) 写完、VS Marketplace 也挂上去了，本以为 Cursor 那边搜一下就能装。结果发现：**Cursor 扩展市场不跟 Microsoft 那套走**，得另发一份到 Open VSX。下面把 **VS Code 怎么发**、**Open VSX 怎么发**、以及这趟踩的坑一起记下来，免得下次又忘。



## 两套市场

Cursor和VS Code的插件市场原本是一套，但是后来微软收紧策略，导致分开了，变成了2个市场。

Cursor 里有两套完全不同的「市场」，名字都带 marketplace

| 名字 | 实际装啥 | 怎么上架 |
|--------|----------|----------|
| **Extensions**（扩展面板） | VS Code 那类插件，CBD 就是这个 | 发到 **Open VSX** |
| **Plugins**（Customize / cursor.com/marketplace） | rules、skills、MCP、hooks | 另搞一套 `.cursor-plugin/`，走人工审核 |

CBD 是正经 VS Code 扩展，跟 Cursor Plugin 那套无关。想让人在 Cursor 里 `Ctrl+Shift+X` 搜到，**只发 Microsoft Marketplace 不够**，必须再发 Open VSX。

官方也写明了：Cursor 第三方扩展走 Open VSX，中间再套一层他们自己的安全扫描代理。



## VS Code 插件（Microsoft Marketplace）

官方文档：[Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)。下面按我实际走过的顺序记。

### 0. 扩展本身先能装

本地 `npm run compile` 过，扩展开发宿主里跑得起来；上架前最好再过一遍测试。打包工具用官方的 `@vscode/vsce`（老包名 `vsce` 别再用）。

`package.json` 至少这些要齐，缺了会拒：

| 字段 | 说明 |
|------|------|
| `name` | 扩展名，小写、短横线，进 ID 的那截 |
| `publisher` | 发布者 ID，跟市场里建的一模一样 |
| `version` | semver，每次改内容再发必须升 |
| `engines.vscode` | 最低 VS Code 版本 |
| `displayName` / `description` | 市场展示用 |
| `icon` | 建议 128×128 PNG |
| `repository` | 仓库地址，市场页会挂链接 |

另外 README、CHANGELOG、LICENSE 建议都有；市场页长什么样，基本看 README。CBD 还补了 `keywords`、`categories`、`galleryBanner`，好看一点而已。

扩展完整 ID = `publisher.name`，例如 `codebind.codebind-docs`。**这个 ID 以后基本改不了**，起名字时想清楚。



### 1. Azure DevOps 搞一个 PAT

> Marketplace 认证挂在 Azure DevOps 上，所以要先搞 Personal Access Token：
>
> 1. 打开 [Azure DevOps](https://dev.azure.com/)，用微软账号登录（跟后面建 Publisher 用**同一个**）
> 2. 用户设置 → Personal access tokens → New Token
> 3. **Organizations** 选 **All accessible organizations**（选成某个具体 org 很容易发不出去）
> 4. **Scopes** 勾 **Marketplace → Manage**
> 5. 创建后**立刻复制**，关掉就再也看不见了

这完全是Agent的说法，实际个人作者根本不需要，直接走下步即可



### 2. 创建 Publisher

![image-20260721171135115](https://img.elmagnifico.tech/static/upload/elmagnifico/20260721171135182.png)

1. 打开 [https://marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Create publisher
3. **ID**：唯一标识，进 URL，**创建后不能改**（CBD 用的 `codebind`）
4. **Name**：市场上显示的名字，品牌文案，这个还能动

ID 别跟显示名搞混：ID 是机器认的，Name 是给人看的。



### 3. 打包 / 发布

**命令行一把梭：**

```bash
npm run compile
npx @vscode/vsce publish --no-dependencies
# CBD 仓库里等价于：npm run publish:vsce
```

`publish` 内部会跑 `vscode:prepublish`（一般就是 compile），再上传。

**先打 `.vsix` 再网页传（更稳，出问题好排查）：**

```bash
npm run package
# → codebind-docs-x.y.z.vsix
```

然后到 manage 页 → 你的 publisher → New Extension / 更新已有扩展 → 上传 `.vsix`。

![image-20260721171234190](https://img.elmagnifico.tech/static/upload/elmagnifico/20260721171331515.png)

本地试装：

```bash
code --install-extension codebind-docs-x.y.z.vsix
```

或命令面板：`Extensions: Install from VSIX...`。、



### 4. 更新版本时注意

- 改了 README 截图、描述、代码，都要 **bump `version`**，同一版本号覆盖不了
- `unpublish` 和「彻底删除」不是一回事；删除后名字可能被永久占用，慎用
- `.vscodeignore` 写清楚，别把 `node_modules`、测试产物、开发脚本打进包；反过来媒体、`out/`、README 别误忽略

CBD 这边 VS 市场页：

> https://marketplace.visualstudio.com/items?itemName=codebind.codebind-docs



## Open VSX （Cursor / VSCodium）

Cursor 扩展面板吃的是 Open VSX，步骤和 VS 平行、账号体系完全两套。

![image-20260721171455409](https://img.elmagnifico.tech/static/upload/elmagnifico/20260721171455437.png)

1. [open-vsx.org](https://open-vsx.org/) 用 **GitHub** 登录
2. 注册 **Eclipse Foundation** 账号，GitHub Username 填成**同一个** GitHub
3. 个人设置里 **Log in with Eclipse**，签 **Open VSX Publisher Agreement**（没签完一律发不出去）
4. 生成 Access Token
5. 创建 namespace（对应 `package.json` 的 `publisher`）
6. `ovsx publish` 或网页拖 `.vsix`

```bash
npx ovsx create-namespace codebinddocs -p <token>
npx ovsx publish codebind-docs-x.y.z.vsix -p <token>
# 或：npm run publish:ovsx
```

仓库里 `publish:vsce` / `publish:ovsx` 两边各发一遍就行。注意：Open VSX 的 namespace 可以和 VS 的 publisher **不同**（我就是因为撞名被迫拆开的）。

### 认领 namespace

发完以后页面上很可能还有一条警告，大意是：

> This version of the "CodeBind Docs" extension was published by elmagnificogi. That user account is not a verified publisher of the namespace "codebinddocs" of this extension.

意思是：**扩展已经发上去了，但 `codebinddocs` 这个命名空间还没被官方认定归你所有**。

Open VSX 和 VS Marketplace 不一样：

| | VS Marketplace | Open VSX |
|--|----------------|----------|
| 建 publisher / namespace | 你就是所有者 | 你只是 **contributor**，能发版 |
| 验证勾 | 建好就有 | 还要再 **claim ownership** 一次 |

所以：`elmagnificogi` 能发版，但还不是 `codebinddocs` 的 **verified owner**。扩展能用、Cursor 也能搜到，只是详情页带 ⚠️。

消掉警告的办法：去 [EclipseFdn/open-vsx.org](https://github.com/EclipseFdn/open-vsx.org/issues) **开一个 Issue**，申请命名空间所有权，大致写：

- Open VSX / GitHub 用户名：`elmagnificogi`
- 要认领的 namespace：`codebinddocs`
- 证明你是维护者，例如仓库、VS 市场页链接

标题可以写成：`Namespace Ownership Request: codebinddocs`。

管理员通过后，namespace 变成 verified，你就是 owner，警告会消失（有时再发一个新版本才完全干净）。

![image-20260721172645599](https://img.elmagnifico.tech/static/upload/elmagnifico/20260721172645643.png)



## 踩坑

#### 以为发了 VS 就能在 Cursor 搜到

社区里一堆人踩过：VS Marketplace 有货，Cursor 扩展面板搜不到。原因就是上面那条——Cursor 默认吃 Open VSX，不自动镜像 Microsoft 市场。

临时办法：本机装 `.vsix`（`Extensions: Install from VSIX...`）。长期还是得发 Open VSX。



#### 没签 Eclipse 协议

报错大意：

> You need to sign the Eclipse Foundation Open VSX Publisher Agreement...

Open VSX 是 Eclipse 基金会管的，发布者协议必须签。注意：

- 「Eclipse Contributor Agreement」和这个不是一回事
- 登录 Eclipse 时用的 GitHub，得和 open-vsx.org 登录的是**同一个**
- 签完回到 Profile，能看到协议相关入口才算过



#### namespace 太像，不让建

想建 `codebind`，直接被拒：

> Namespace name 'codebind' is too similar to existing namespace(s): CodeMind.

Open VSX 有 **typosquatting / 相似度检查**，名字撞得太近就不给你。跟 CodeMind 差几个字母，系统觉得用户会搞混——讲道理偏严，但也没地方跟机器人扯皮。

最后改成 `codebinddocs`，扩展 ID 变成：`codebinddocs.codebind-docs`。

显示名照样可以叫 CodeBind Docs，变的是 URL / ID 那截，不是产品名。



#### VS 那边改不了 publisher

第一反应：那我把 VS Marketplace 也改成 `codebinddocs`，两边统一？

**不行。** `publisher.name` 是扩展唯一身份：

- Publisher ID 创建后改不了
- 你自己改 `package.json` 再发，市场会当成**另一个新扩展**
- 老用户不会自动迁，下载量也不合并
- 真要迁移得找 Marketplace Support 申请 transfer，现在很少批，还一堆副作用

所以现实方案是：

- **VS Marketplace**：继续 `codebind.codebind-docs`
- **Open VSX / Cursor**：用 `codebinddocs.codebind-docs`

两边 ID 不一致，难看一点，但比下架重来强。下架还可能把名字永久占死，更亏。



## Summary

上架扩展本身不难，难的是**两个市场两套规矩，还都叫 marketplace**。Publisher 核心就三件事：身份（账号 / 协议）、命名空间（撞名真的会卡死）、版本与打包（升版本、`.vsix`、两边各发）。

CBD 现在：

- VS：[codebind.codebind-docs](https://marketplace.visualstudio.com/items?itemName=codebind.codebind-docs)
- Cursor：[codebind-docs](https://open-vsx.org/extension/codebinddocs/codebind-docs)

后续VS这边重新建publish，名字改成了一样的，就是删了之前的，需要等好一会才能上传新的，否则就一直提示插件已经存在了

![image-20260721172036019](https://img.elmagnifico.tech/static/upload/elmagnifico/20260721172036041.png)

## Quote

> https://github.com/eclipse-openvsx/openvsx/wiki/Namespace-Access
>
> https://github.com/EclipseFdn/open-vsx.org/wiki/Guidelines-on-Namespace-Requests

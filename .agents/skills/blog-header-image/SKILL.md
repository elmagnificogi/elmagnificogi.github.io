---
name: blog-header-image
description: 为 Jekyll 博文生成专属 header-img。用于给文章出封面、换封面、批量生成 header 图，或用户提到 header-img、标题图、封面图时。
---

# 博客封面图

给 `_posts` 里的文章生成一张和内容相关的 `header-img`，裁成站点规格，写回 frontmatter。

## 何时用

用户说「给这篇文章出封面」「按封面标准生图」「换 20xx 年的 header」时走这套流程。主题要对上文章，色调跟手挑旧图走。

## 主题必须对上这篇文章

色调可以像图库，**内容不能像万能封面**。先读 title / subtitle / tags，必要时扫一眼正文，再决定画什么。

- 看图要能猜出这是哪一类文：嵌入式、自驾、游记、游戏、MCP、审美课，各不一样
- 主题物从文章里来，不要每篇都是空白笔记本、咖啡杯、纸船、台灯
- 抽象概念用能对上的实物：Kconfig=带勾选的配置纸，CAN=线束/板卡，RSS=订阅打印件/天线，点阵字=LED 点阵（不要写成字），越南=河内/胡志明街，河源=万绿湖，骨折=石膏/医院浅色静物
- 禁止怪隐喻：金丝雀代表栈溢出、全息悬浮板、宇宙神经网络、无来由的水果静物
- 同一系列文（CMake 1/2/3、MCP 1/2）主题同类，但机位或物件要能分开
- 车文见下面「车」一节，不要用方向盘静物凑合（模拟器文除外）

先定主题，再套高调软光。主题不对 = 失败，即使够亮也重出。

## 色调：跟手挑旧图走

作者以前是从图库里手挑的，不是电影感渲染。新图要对齐那套观感，不要对齐已经生成的 `head-2025-*` / `head-2026-*`。

手挑长什么样：

- **高调、偏淡、软光**：浅木桌、白纸、奶油、牛皮纸、粉薄荷、阴天白。整体曝光足，略褪色/胶片感
- **一个跟文章有关的主题物 + 浅景深**，背景虚或干净。旧图里的本子/纸船/耳机只是色调样板，不是每篇都画这些
- **标题区是浅色空地**（浅木、白纸、天空、墙），不是堆满道具的英雄海报
- 俯拍静物或微距特写都可以，光线是均匀日光，没有轮廓光、霓虹、黑色棚拍

对照色调：`img/bg1.jpg` `img/bg3.jpg` `img/desk-head-bg.jpg` `img/Embedded-head-bg.jpg` `img/z6.jpg` `img/pcb-head-bg.jpg` `img/x8.jpg` `img/bg8.jpg`

不要学：暗机房、黑底神经网络、夜景只剩几点灯、3D 产品海报。AI / GPU / 服务器类也用浅桌、白纸、白天办公室，不要靠黑背景装科技。

标题是黑字，**够亮比托白导航更重要**。顶边略深一点可以，整张发黑直接重出。

## 页面叠字

封面是 `background-size: cover` 的横图。桌面文章头：

- 导航白字：顶栏 `Elmagnifico's Blog` / Home / Tags / About / 搜索
- 标题区黑字：标签胶囊、`h1`、subtitle、Views / Updated / Posted
- 标题区起点约 `x=560`（1870 宽、`container` 1170、`col-lg-offset-2`），上内边距 150px

挡字可以，只要标题整行还认得。白导航能认更好，但不要为了导航把整张压暗。

## 出图规格

1. `GenerateImage`，`aspect_ratio: 16:9`
2. 画面铺满；主题必须能对上这篇 title / subtitle / tags，禁止万能书桌
3. **禁止**图上出现任何字、字母、数字、Logo、车牌、水印、地面大字
4. 文件名：`head-YYYY-MM-DD.png`；同一天多篇加短后缀，如 `head-2025-09-30-heyuan.png`
5. 用仓库脚本裁成 1870×550 JPEG，并改 frontmatter：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/apply-header.ps1 `
  -Src "<generated-png>" `
  -Dst "img/head-YYYY-MM-DD.jpg" `
  -Post "_posts/YYYY-MM-DD-slug.md"
```

6. 需要验收时，按上面的坐标把导航（白）和标题（黑）叠到 1870×550 上再看

## Prompt 必须写上的约束

把这段意思写进每次 `description`：

- High-key stock-photo blog header, 16:9, soft even daylight, slight vintage fade
- Bright enough for black title text: light wood, paper, cream, pastel, or overcast sky
- One simple subject, shallow depth of field, airy title zone
- Not cinematic, not a 3D product render, not dark, not neon-on-black
- No words, letters, numbers, logos, license plates, or watermarks

然后用一句话写**这篇特有的**场景（物件名要具体）。不要写 cinematic / moody / night / dim / dramatic lighting / rim light。不要为了密度把画面堆成暗棚，也不要用空白笔记本凑数。

## 车：必须是 SU7 Ultra

文章里出现车、自驾、赛道、板车时，车只能是作者那辆小米 SU7 Ultra，不要生成 Taycan / Tesla / BMW / 普通轿车。

对照实拍（有就放进 `reference_image_paths`）：

- 雅灰 + 机盖/侧裙双黄条
- 椭圆小米标、极细环绕日行灯、封闭前脸、U 型风刀、大前铲、黑轮毂、黄卡钳、车顶传感器包
- 尾部：贯穿灯形状要对，量产 Ultra 是电动尾翼/小鸭尾，没有双排气、没有保时捷盾、没有巨大固定尾翼

**角度不限**：正前、3/4 前、侧面、3/4 后、正后、跟车、板车都可。哪张生成得像、没字、够亮，就用哪张。尾部模型容易画成 Taycan，出了后视要对照实拍看一眼，画错就换角度或重出，不要因为怕错而只拍前脸。

## 验收

叠字后看：

- 不看标题也能感到和这篇文章有关（万能本子/咖啡杯 = 失败）
- 黑字标题、标签、日期在图上能认（发黑或电影感暗调 = 失败）
- 色调接近手挑旧图（高调、软光、偏淡），不像 3D 海报
- 车文对得上 SU7 Ultra（哪个角度都行，形要对，日光下够亮）
- 图上没有字

失败就重出，不要靠后期把中间涂白。

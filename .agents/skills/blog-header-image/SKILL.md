---
name: blog-header-image
description: 为 Jekyll 博文生成专属 header-img。用于给文章出封面、换封面、批量生成 header 图，或用户提到 header-img、标题图、封面图时。
---

# 博客封面图

给 `_posts` 里的文章生成一张和内容相关的 `header-img`，裁成站点规格，写回 frontmatter。

## 何时用

用户说「给这篇文章出封面」「按封面标准生图」「换 20xx 年的 header」时走这套流程。不要只堆白底留白。

## 页面叠字（必须按这个排）

封面是 `background-size: cover` 的横图。桌面文章头：

- 导航白字：顶栏 `Elmagnifico's Blog` / Home / Tags / About / 搜索
- 标题区黑字：标签胶囊、`h1`、subtitle、Views / Updated / Posted
- 标题区起点约 `x=560`（1870 宽、`container` 1170、`col-lg-offset-2`），上内边距 150px

所以图要同时托住两种字：

- **中间（标题区）偏亮、偏暖**，黑字能看清
- **上沿和左右边缘可以偏暗**，白导航能看清
- 不要整张死黑，也不要挖一大块空白

挡字可以，只要不是标题整行或导航被糊掉。用叠字预览验收，不要为了保险把画面掏空。

## 出图规格

1. `GenerateImage`，`aspect_ratio: 16:9`
2. 画面铺满，主题对上 title / subtitle / tags
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

参考成品：`img/seo-head-bg.jpg`（密度）、`img/head-2026-01-12.jpg`（中间亮、四周可暗）。

## Prompt 必须写上的约束

把这段意思写进每次 `description`：

- Photorealistic 16:9 blog header, filled frame, not an empty white studio
- CENTER is bright and warm so black title text can sit on it
- TOP and SIDE edges may be darker so white navbar text stays readable
- No words, letters, numbers, logos, license plates, or watermarks

然后写具体场景。不要写「中间留白给字」。

## 车：必须是 SU7 Ultra

文章里出现车、自驾、赛道、板车时，车只能是作者那辆小米 SU7 Ultra，不要生成 Taycan / Tesla / BMW / 普通轿车。

对照实拍（有就放进 `reference_image_paths`）：

- 前 3/4：作者提车照（雅灰 + 机盖/侧裙双黄条）
- 正脸：椭圆小米标、极细环绕日行灯、封闭前脸、U 型风刀、大前铲、黑轮毂、黄卡钳、车顶传感器包

优先拍 **四分之三前脸**。模型画尾部容易画成 Taycan（贯穿灯形状错、排气、大尾翼），能避免正后视就避免。

禁止：保时捷盾标、双排气、巨大固定尾翼（量产 Ultra 是电动尾翼/小鸭尾）。

## 验收

叠字后看：

- 标题、标签、日期能认
- 导航在上沿能认
- 车文对得上 SU7 Ultra 前脸
- 图上没有字

失败就重出，不要靠后期把中间涂白。

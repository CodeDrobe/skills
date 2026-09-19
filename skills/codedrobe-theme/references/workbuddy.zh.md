# WorkBuddy 适配目标

> 本文件是 [`workbuddy.md`](./workbuddy.md) 的中文版，内容一一对应。

使用 app id `workbuddy`。用 `codedrobe apps --json` 读取当前默认值与最近验证过的应用版本。内置默认 CDP 端口目前是 `9336`，但显式传入的 `--port` 必须优先。

## 应用行为

WorkBuddy 目前只做渲染层主题，不需要 Codex 那套宿主外观设置。只要能连上渲染进程，通常无需重启应用即可换肤。

- 非标准安装路径用 `--app-path`。
- 不要修改 `WorkBuddy.app`、它的 Electron 资源或 `app.asar`。
- 一律通过 Core 应用与还原，这样图片 object URL、observer、样式与根节点标记才能被一致地清理干净。

## 验证面

适配器只保留稳定的跨路由地标：

- root：teams 容器
- sidebar：会话侧栏 / 列表
- workspace：teams 主内容区、主内容区，或 chat 容器
- composer：可编辑文本框

首页的布局规则留在主题包里。对于一个同时样式化 WorkBuddy 首页与会话页的主题，至少要验证：

在改写 `assets/theme-starter/workbuddy.css` 或 `assets/examples/miku-future-beats/workbuddy.css` 之前，先分别截取首页与会话页的快照。优先采用界面上现存的语义类名，而不是任何可能已过时的示例选择器。

1. 首页标题/hero、场景标签、快捷动作、首页输入框，以及具名图片。
2. 一个包含长文本、表格或代码、可滚动内容的会话，以及会话输入框外壳。
3. 侧栏选中态、悬停态、菜单、输入框、麦克风、模型选择器、发送按钮。
4. 无横向溢出，原生操作项没有被遮挡。

## 会盖住壁纸的不透明底板

一次 apply 可以完整报告成功，而窗口看起来毫无变化：渲染进程在注入的背景之上又画了自己的实色表面。在 **5.5.6 与 5.6.0** 上，只有清掉下面这些，壁纸才能真正显示出来。

| 元素 | 它原来的颜色 |
| --- | --- |
| `.conversation-shell` | 实色白 |
| `[class*="gridView"]`、`[class*="_grid_"]` | 实色白 —— 网格布局单元，CSS Module 生成的哈希类 |
| `.teams-grid-scroll-content` | 实色白，1256×746 —— **5.6.0 新增的一层**，5.5.6 上没有 |
| `.wb-home-route` | 实色白，972×734 —— **仅首页路由有** |
| `#workbuddy-menubar-container` | `rgb(242, 242, 242)`，顶部 30px 的条 |
| `.workbuddy-window-controls` | `--cb-panel-bg-primary` —— 最小化 / 最大化 / 关闭按钮下面的那条 |
| `.cr-input-container`、`.cr-input-toolbar__right` | 实色白，在输入框内层（会话页） |
| `.cr-input-box__main` | `linear-gradient(rgb(235,235,235), rgb(245,245,245))` —— **首页**输入框的底板，注意它画在 `background-image` 上，`background-color` 读出来是透明的 |
| `.collapsible-section-header`、`.conversation-section-label` | `rgb(242, 242, 242)` —— 侧栏分组标题（**需要更高优先级的选择器，见下**） |
| `[class*="cb-agent-card"]` | 白 / `rgb(230, 230, 230)` —— 侧栏会话卡片 |

梳理这张表时踩到三个坑：

- **`.wb-home-route` 只有首页有，而且它不是首页内容的祖先。** 它确实是 `<main class="wb-home-route">`，但在 5.5.6 上它是作为**兄弟层垫在下面的** —— 在首页界面之下、在你的背景之上。从 `document.elementFromPoint` 往上回溯永远到不了它，于是回溯链看起来干干净净、窗口却照样发白。只有全量枚举才能把它揪出来。这正是「会话页正常、首页发白」的准确机理。
- **不要用 `[class*="grid_"]`。** 它会误伤 `artifact-slot-panel__grid` 这类无关类名。
- **CSS Module 的哈希类名随构建变化，永远不要按全名匹配，也不要为了「更精确」而收窄成前缀更长的写法。** 5.5.6 上那块内容区白板是 `_gridViewItem_<hash>`，到 5.6.0 变成了 `_gridView_7xbcw_9`。如果当初写的是 `[class*="_gridViewItem_"]`，升级后一条都不命中，两块 1256×746 的纯白重新盖住整窗 —— 症状和「主题没生效」一模一样。按 `[class*="gridView"]` 这种稳定前缀匹配才跨版本。
  - 子串匹配没有"单词边界"：`_gridView_`（尾部带下划线）**匹配不到** `_gridViewItem_`，反之亦然。要同时兼容两个版本就两条都写。
  - 顺带一提，这条坑最早是**人为制造**的：把这份笔记里的 `[class*="gridView"]` 改写成 `[class*="_gridViewItem_"]` 看起来更严谨，实际是把选择器的覆盖面缩到了某一个版本。

选择器**不要带标签名** —— 写 `.wb-home-route`，不要写 `main.wb-home-route`。它碰巧是个 `<main>`，但要不要清掉这层，跟标签名能不能跨版本稳住是两回事。

`.collapsible-section-header` 是这张表里唯一需要**更高优先级选择器**的一条。应用方是这样画它的：

```css
.conversation-section-content [class^="collapsible-section"] > [class*="header"] {
  background: var(--wb-sidebar-bg, var(--cb-sidebar-bg, var(--vscode-sideBar-background, #fff))) !important;
}
```

特异性 `(0,3,0)` 且带 `!important`，所以最直观的 `html.codedrobe-host-workbuddy .collapsible-section-header`（`(0,2,1)`）会输，那 5 条标题就保留原生底色。加上外观属性与一个容器类就能越过去：

```css
html.codedrobe-host-workbuddy[data-theme] .conversation-list .collapsible-section-header {
  background-color: transparent !important;
  background-image: none !important;
}
```

`(0,4,1)` 即可清掉全部 5 条。深色外观下这个差别一点不含糊：原生 `rgb(31, 31, 31)` 的标题条压在蒙过纱的侧栏（约 72）上，就是 5 条平黑带，看起来像渲染故障，不像壁纸。

**真正值得记住的坑在「怎么测」，而不是「怎么写」。** 在**同一次 JS 求值里**「注入样式 + 读 `getComputedStyle`」会读到旧值。这个失效模式和「这条根本覆盖不了」长得一模一样 —— 这里那条 `(0,4,1)` 覆盖就是这么被误判为无效的。要分两次调用：先注入，隔一两帧，再读。

另外，在 `html.codedrobe-host-workbuddy` 上重定义 `--cb-sidebar-bg` / `--wb-sidebar-bg` **不起作用**：应用是在更高的优先级上定义这两个变量的，你设的那个不是它读的那个。直接覆盖起冲突的**属性**，比追着它的输入变量跑要简单。

这张表是绑定版本的。应用升级后要重新推导，不要直接照信。

## 路由与外观

- 会话容器是 `.conversation-shell`，首页路由是 `.wb-home-route`（是个 `<main>`，但选择器里不要带标签名）。`.chat-container` 已不存在。
- 外观由 **`<html>` 上的 `data-theme` 属性**驱动（`light` / `dark`），配套一整套语义 token（`--cb-text-primary`、`--cb-panel-bg-primary`、`--cb-bg-secondary`、`--sk-*`，合计数千个自定义属性）。只换 `light` / `cb-light` 这些 class 是没有任何效果的。
- 因此主题可以用 `html[data-theme="dark"] { … }` 跟随宿主外观 —— 它的特异性高于普通宿主选择器，所以**一个主题包就能自适应，而不是把某一种外观写死**。

## 壁纸明暗必须与宿主外观匹配

文字颜色跟着宿主外观走，所以当壁纸铺在界面之后时，它的明暗决定了文字还能不能读：深色图配浅色外观，就是深色文字压在深色画面上，反过来同理。**配对时零处理；不配对时才需要一层纱。**

把纱「解」出来比凭感觉调更可控。取壁纸的平均亮度 `L`（缩到约 48×48，按 `0.2126R + 0.7152G + 0.0722B` 求平均），然后

- 白纱 `a = (196 − L) / (255 − L)`，当 `L < 196` 时
- 黑纱 `a = 1 − 82 / L`，当 `L > 82` 时

上限截到 0.82，并为每种外观各输出一个值。实践中有两点补充：

- 平均亮度描述不了壁纸有多**繁密**。一张很亮但细节细碎的插画，仍然需要一层薄白纱（约 0.40），因为文字背后的细密花纹读起来就是噪点。
- 既然关键在「配对」，那么算出来的这组值正好可以用来告诉用户：**他这张图想要哪种外观** —— 以及当他正在用的外观不匹配时给出提醒。
- **不要让纱重到把图片自身的明暗关系反转掉。** 在双峰分布的壁纸上，这个坑会在深色外观下咬人。一条从左往右递增的纱，如果左端重到把图片的亮部按死（`.93`），那一侧会从 253 掉到 28；而图片的暗部在轻得多的 `.62` 之下落在 46。**亮部反而比暗部更暗**，而侧栏正好压在那片亮部上，于是塌成一条没有纹理的近乎纯黑带。用户会把这种现象读成渲染 bug，而不是壁纸。左端的取值要让亮部落在与窗口其余部分大致同档的亮度上：取 `.83` 时左端是 52，主内容区是 52–60，那条带就消失了。**这件事要测，不要靠眼睛估** —— 在截图上横着采一行像素，横跨侧栏与内容区，看两者之间的台阶。

  深色主题配浅色文字的粗略目标：整窗压在 110 亮度以下，且最亮与最暗区域相互差距控制在 10–15 以内，否则壁纸自身的结构就会被读成界面缺陷。

## 诊断「apply 成功但界面没变化」

apply 通过只能证明样式到达了渲染进程。如果窗口看起来毫无变化，先花 30 秒排除两种更根本的可能，再去抓遮挡：

- **这一次启动到底注入了没有？** 主题是运行时注入的。应用升级、或它自己重启之后，新进程往往是**裸启动**的（命令行里没有 `--remote-debugging-port`），注入根本无从发生 —— 界面会完全回到原生皮肤，看起来就像「主题失效了」。这时看进程命令行比看主题快：`Get-CimInstance Win32_Process -Filter "Name='WorkBuddy.exe'"`（macOS 用 `ps -ax -o command`）。没有调试端口就别去改 CSS，先带端口重启一次。
- **图和 CSS 是不是好的？** 读壁纸自定义属性 → 对它的 `blob:` URL 发一次 `fetch` 确认字节数 → 用 `new Image()` 解码确认尺寸。三项全过就说明素材和样式都没问题，剩下的只能是遮挡，直接往下走。这三步能省掉在 CSP 和 object URL 生命周期上瞎猜的弯路 —— 那几条我都怀疑过，全是错的。

如果上面都正常，那就是有祖先元素在画不透明背景。不要猜：

1. 从 `document.elementFromPoint(x, y)` 逐级向上回溯，打印每一层的 `backgroundColor` —— 这样就能看出是哪一层盖住了图。
2. 枚举所有 `backgroundColor` 的 alpha 大于 0.85、且与视口相交的元素，按可见面积排序。**不要用面积阈值去过滤** —— 尺寸过滤会漏掉窗口按钮条这类小组件。
3. **不要只信第 1 步。** 回溯法有个盲区：一块垫在内容之下、背景之上的实色**兄弟层**，它回溯不出来 —— 栈是干净的，窗口却照样发白。只要第 1 步查下来没问题但结果依然不对，就去跑第 2 步；`.wb-home-route` 就是这么被揪出来的。

修完之后用同样的方式确认：把清底清单上每个元素的实际 `backgroundColor` 读出来，确认它**真的**变成了 `rgba(0, 0, 0, 0)`。一条规则在源码里看着没问题，却可能输掉一场层叠博弈；只有计算值能证明它生效了。

## 不要用脚本切换外观来验证颜色

手动设置 `data-theme`（或替换外观 class）**不会**更新应用在自己那一趟渲染里写上去的颜色。紧接着读它们，拿到的还是**上一个外观的值** —— 看起来就像「这个颜色不跟随主题」，从而导出错误结论。脚本切换用来看背景和布局没问题；要验证文字对比度，请**在应用里真正切换外观**（头像 → 外观）之后再测量。

## 应当刻意保持不透明的表面

清背景不是一个「一刀切」的操作。下面这些要保持原样：

- **右侧详情面板**（`detail-panel`、`detail-main`、`sidebar-next`、`detail-layout`）。它的用途是预览文档与工件；背景一透明，画面就压在内容下面，反而影响阅读。
- **会话内的内容卡片**（`.cr-tool-exp__content`、`.cr-code-like-box` 等）、按钮与头像 —— 这些是内容与控件，不是窗口 chrome。

只清 chrome：侧栏、顶栏、菜单栏、窗口按钮条、输入框外壳。

## 「只换壁纸」的主题里没有几何属性

不是每个需求都想重做界面。「把壁纸换掉，别动我的界面」是个很正常的诉求，而它对应的是**另一种主题形态**：铺根节点、清底板、到此为止。

把尺寸和间距属性彻底挡在文件之外。一个主题如果在应用 chrome 上还写了 `width`、`max-width`、`gap`、`min-height`、`padding`、`border-radius`、`box-shadow`、`transform` 或 `border`，就会明显重构用户根本没要求你碰的表面。在 5.5.6 上，最先出问题的就是首页 —— 因为那块 hero 是一个**居中标题**，而底板就在它背后画底：

- `.wb-home-page` —— `width` / `max-width` / `gap` 会把整列重新定尺。
- `.wb-home-header` —— `min-height` / `padding` / `overflow` 会把 hero 撑大并裁掉它的内容。
- `.wb-home-header__title` —— 给一个 `width` 约束就会让居中标题重新折行。
- `.teams-content-wrapper`、`.wb-scene-tabs`、`.quick-actions__item` —— 圆角、边框和阴影会把本来好好的芯片挪位、改样。

症状很有辨识度：hero 标题**被上边缘裁掉**，场景标签**脱离卡片**飘在壁纸上。看到这个，就不是清底的问题 —— 是主题里有一条几何声明。删掉它，布局自己就回来了。

于是整个文件缩成两件事，而且值得就保持这么小：

```css
/* 1. 在窗口根节点铺壁纸，每种外观一层纱 */
html.codedrobe-host-workbuddy,
html.codedrobe-host-workbuddy body,
html.codedrobe-host-workbuddy #root {
  background-color: #fbfbfa !important;
  background-image: var(--ink-veil), var(--codedrobe-image-wallpaper, none) !important;
  background-repeat: no-repeat, no-repeat !important;
  background-position: center center, center 20% !important;
  background-size: 100% 100%, cover !important;
  background-attachment: fixed, fixed !important;
}

/* 2. 只清上面那张表里的底板，别的一律不动 */
html.codedrobe-host-workbuddy .teams-container,
html.codedrobe-host-workbuddy [class*="gridView"],
html.codedrobe-host-workbuddy .conversation-shell,
html.codedrobe-host-workbuddy .wb-home-route {
  background-color: transparent !important;
  background-image: none !important;
}
```

裁切补充：1236×764 的窗口比 1186×856 的参考图更宽，所以 `cover` 两个方向都由宽度定尺，横向没有自由度 —— `background-position` 只能纵向移动画面。按焦点去锚定（`center 20%` 保住了脸部），并接受被裁掉的是底部。

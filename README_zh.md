# CodeDrobe Codex Skill

[English](README.md)

官方网站：[codedrobe.app](https://codedrobe.app)

CodeDrobe Codex Skill 是一套开源 Codex 主题 Skill 与运行时，用于在 macOS 和 Windows 上为官方 Codex 桌面应用创建、应用、导出、验证和恢复自定义主题。

![CodeDrobe Desktop 管理 Codex 自定义主题](https://raw.githubusercontent.com/anhao/codedrobe-desktop/main/docs/images/desktop.png)

它通过本机 Chromium DevTools Protocol（CDP）修改渲染界面，不会修改 Codex 应用包、替换官方可执行文件或改写 `app.asar`。

## 这个 Skill 能做什么

- 在保留 Codex 原生控件和工作流的前提下应用装饰性主题。
- 根据设计描述、配色方案或本地参考图片创建新主题。
- 使用 AI 定制主题文案、CSS、图片素材和官方基础配色。
- 通过仅限本机访问的 CDP 连接启动官方 Codex 应用。
- 在页面跳转、渲染器重载或 Codex 更新后重新应用主题。
- 验证当前主题，并生成截图用于视觉检查。
- 导出和分享独立的 `.codex-theme` 主题文件。
- 安全移除注入主题，并恢复之前的 Codex 外观配置。

## 支持平台

- macOS 12 及以上版本
- Windows 10 或 Windows 11
- 直接运行脚本需要 Node.js 20 及以上版本
- 官方 Codex 桌面应用

## 使用 npx 安装

请先安装 [Node.js](https://nodejs.org/)，然后在终端中执行：

```bash
npx skills add anhao/codedrobe-codex-skill
```

安装程序会检测当前电脑支持的 AI 编程工具，并让你选择要安装到哪个工具中。在项目目录内运行时，可以安装为当前项目使用的 Skill。

如果希望当前用户的所有项目都能使用，可以全局安装：

```bash
npx skills add anhao/codedrobe-codex-skill --global
```

安装后可以运行以下命令检查：

```bash
npx skills list
npx skills list --global
```

以后需要更新 Skill 时运行：

```bash
npx skills update codedrobe-codex-theme
npx skills update codedrobe-codex-theme --global
```

注意命令中的 `skills` 是复数形式，应使用 `npx skills`，而不是 `npx skill`。

## 在 Codex 中使用

将本仓库安装为 Codex Skill 后，可以直接用自然语言提出需求：

```text
给 Codex 应用 Dream 主题。
根据这张参考图片创建一个深色海洋主题。
把 Dream 主题导出为 .codex-theme 文件。
验证当前主题并保存截图。
恢复 Codex 原生界面。
```

Codex 会读取 [`SKILL.md`](SKILL.md)，根据当前平台选择主题创建、启动、验证、导出或恢复流程。

## 命令行使用

在 macOS 上安装并启动现有主题：

```bash
scripts/install-codedrobe.sh --theme dream
scripts/start-codedrobe.sh --theme dream
```

在 Windows 上安装并启动现有主题：

```powershell
scripts/install-codedrobe.ps1 -Theme dream
scripts/start-codedrobe.ps1 -Theme dream
```

创建并导出可移植主题：

```bash
node scripts/create-theme.mjs --id ocean-calm --name "Ocean Calm" --art /absolute/cover.png
node scripts/export-theme.mjs --theme ocean-calm --output /absolute/ocean-calm.codex-theme
```

## 桌面软件

如果希望使用图形化、一键操作的主题管理器，请前往 [anhao/codedrobe-desktop](https://github.com/anhao/codedrobe-desktop)。

### 主题效果

| KUN Stage | Dream / Fiona | Dilraba Rose |
| --- | --- | --- |
| ![Codex KUN Stage 主题](https://raw.githubusercontent.com/anhao/codedrobe-desktop/main/docs/images/codex-01.png) | ![Codex Dream Fiona 主题](https://raw.githubusercontent.com/anhao/codedrobe-desktop/main/docs/images/codex-02.png) | ![Codex Dilraba Rose 主题](https://raw.githubusercontent.com/anhao/codedrobe-desktop/main/docs/images/codex-03.png) |

## 开发验证

运行 Core 测试并检查待发布包内容：

```bash
npm test
npm run pack:check
```

Skill 仓库：[anhao/codedrobe-codex-skill](https://github.com/anhao/codedrobe-codex-skill)

## 安全设计

- CDP 仅绑定到 `127.0.0.1`。
- 不修改官方 Codex 应用包。
- 主题包只包含数据、CSS 和本地图片，不接受主题 JavaScript。
- 导入主题时拒绝远程 CSS 资源。
- 应用和恢复主题时保留其他 Codex 配置。

## 许可证

除非文件中另有说明，本仓库的 Skill、运行时代码、主题格式和文档使用 [Apache License 2.0](LICENSE) 开源。

二进制图片、第三方素材和付费主题内容不会自动采用代码协议，具体参见 [ASSETS_LICENSE.md](ASSETS_LICENSE.md)。Apache 协议不会授予 CodeDrobe 名称和 Logo 的使用权，具体参见 [TRADEMARKS.md](TRADEMARKS.md)。

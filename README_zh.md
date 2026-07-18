# CodeDrobe Skills

[![GitHub stars](https://img.shields.io/github/stars/CodeDrobe/skills?style=flat-square)](https://github.com/CodeDrobe/skills/stargazers)
[![Validate Skills](https://github.com/CodeDrobe/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeDrobe/skills/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](LICENSE)

面向 Chromium/Electron AI 桌面软件的可安装 Agent Skills。实际换肤、应用发现、CDP、验证和恢复能力统一由 [`@codedrobe/core`](https://github.com/CodeDrobe/core) 提供；本仓库只保留精简工作流和按需加载的应用参考。

[English](README.md)

## Skill 目录

| Skill | 面向用户 | 状态 |
| --- | --- | --- |
| [`codedrobe-theme`](skills/codedrobe-theme/SKILL.md) | 普通用户、主题作者 | 可安装 |
| [`codedrobe-adapter-dev`](skills/codedrobe-adapter-dev/SKILL.md) | Core 维护者、贡献者 | 可安装 |
| `codedrobe-publish-theme` | 主题发布者 | 主题仓库认证完成后开放 |

`codedrobe-theme` 同时支持 Core 当前提供的应用目标，包括 OpenAI Codex 和腾讯 WorkBuddy。以后增加新软件时扩展 Core 适配器，不再为每个应用复制一个换肤 Skill。

## 安装

统一安装命令是复数形式的 `npx skills`。

查看本仓库可安装的 Skills：

```bash
npx skills add CodeDrobe/skills --list
```

为 Codex 全局安装普通用户换肤 Skill：

```bash
npx skills add CodeDrobe/skills \
  --skill codedrobe-theme \
  --global \
  --agent codex \
  --yes
```

按需单独安装适配器开发 Skill：

```bash
npx skills add CodeDrobe/skills \
  --skill codedrobe-adapter-dev \
  --global \
  --agent codex \
  --yes
```

`--agent codex` 表示把 Skill 安装给哪个 AI Agent，不表示要给哪个桌面软件换肤。运行时目标由 `codedrobe --app codex` 或 `codedrobe --app workbuddy` 选择。

## 直接告诉 AI 你的需求

安装 `codedrobe-theme` 后，可以附上参考图片，并明确目标软件。例如：

> 参考这张图片，帮我生成一个 Codex 皮肤。保留原生交互，生成可移植的主题包，并在真实应用中验证首页和会话页。

还可以这样说：

- “把这套视觉风格同时做成 Codex 和 WorkBuddy 皮肤。”
- “使用自带的玩偶姐姐示例作为起点，帮我改成蓝色 Codex 版本。”
- “WorkBuddy 更新后这个主题错位了，请分析实时 CDP DOM 并修复。”
- “帮我检查、应用并验证这个 `.codedrobe-theme` 文件。”
- “把 Codex 恢复到原生外观，并确认主题没有残留。”

Skill 会用参考图确定配色、材质和视觉元素，用保护隐私的实时 CDP DOM 快照选择节点；它修改真实应用样式，不会把截图作为覆盖层贴在界面上。应用主题可能需要用户以 CDP 模式启动软件；如果必须重启已经运行的软件，AI 仍需先取得明确授权。

## Core 运行时

推荐全局安装：

```bash
npm install --global @codedrobe/core
codedrobe apps
```

也可以直接运行 npm 或 Bun 包：

```bash
npx --yes @codedrobe/core@latest apps
bunx @codedrobe/core@latest apps
```

示例：

```bash
codedrobe dom snapshot --app workbuddy --output /absolute/workbuddy-dom.json
codedrobe apply --app workbuddy --theme /absolute/theme.codedrobe-theme
codedrobe verify --app workbuddy --theme /absolute/theme.codedrobe-theme --screenshot /absolute/preview.png
codedrobe restore --app workbuddy
```

## 主题制作资源

安装后的 `codedrobe-theme` Skill 包含两套可复制源码：

- `assets/theme-starter/`：覆盖 Codex/WorkBuddy 主要界面的完整中性 CSS 起始模板。
- `assets/examples/doll-sister/`：完整的“玩偶姐姐”双应用主题，包含生成的 hero 和 texture 素材。

模板不会被当作永久 DOM 合约。Skill 会在应用首页和会话页分别采集保护隐私的 `codedrobe dom snapshot`，从实机快照选择语义节点，再完成打包、预检、应用、截图和修正。

## 仓库结构

```text
skills/
├── codedrobe-theme/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── references/
│   └── assets/
└── codedrobe-adapter-dev/
    ├── SKILL.md
    ├── agents/openai.yaml
    └── references/
```

仓库根目录不再放 `SKILL.md`，确保 `npx skills` 可以按标准 `skills/<name>/SKILL.md` 结构发现和选择安装每个 Skill。

## 仓库职责

- [`CodeDrobe/core`](https://github.com/CodeDrobe/core)：CLI、适配器、CDP、主机设置、主题包校验和公共 API。
- [`CodeDrobe/skills`](https://github.com/CodeDrobe/skills)：可安装的 Agent 工作流和参考文档。
- [`CodeDrobe/desktop`](https://github.com/CodeDrobe/desktop)：基于 Core 的可视化主题管理器。
- 主题发布：认证、所有权、审核和撤销机制完成前不开放。

新增或修改 Skill 前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 开源协议与商标

指令和文档采用 [Apache License 2.0](LICENSE)。相关产品名称和商标归各自所有者所有。CodeDrobe 是独立项目，与 OpenAI、腾讯不存在官方隶属或背书关系。

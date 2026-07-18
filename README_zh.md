# CodeDrobe Skills

[![GitHub stars](https://img.shields.io/github/stars/CodeDrobe/skills?style=flat-square)](https://github.com/CodeDrobe/skills/stargazers)
[![Validate Skills](https://github.com/CodeDrobe/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeDrobe/skills/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](LICENSE)

面向 Chromium/Electron AI 桌面软件（包括 OpenAI Codex 和腾讯 WorkBuddy）的可安装 Agent Skills。实际换肤、应用发现、CDP、验证和恢复能力统一由 [`@codedrobe/core`](https://github.com/CodeDrobe/core) 提供；本仓库只保留精简工作流和按需加载的应用参考。

[English](README.md)

本仓库提供两个 Skill：

- [`codedrobe-theme`](skills/codedrobe-theme/SKILL.md) —— 创建、应用、验证、修复、恢复和[发布](skills/codedrobe-theme/references/publish.md)主题，面向普通用户和主题作者。
- [`codedrobe-adapter-dev`](skills/codedrobe-adapter-dev/SKILL.md) —— 适配器开发工作流，面向 Core 维护者和贡献者。

以后支持新软件时扩展 Core 适配器，不新增 Skill。

## 安装

统一安装命令是复数形式的 `npx skills`：

```bash
npx skills add CodeDrobe/skills \
  --skill codedrobe-theme \
  --global \
  --agent codex \
  --yes
```

`--agent codex` 表示把 Skill 安装给哪个 AI Agent，不表示要给哪个桌面软件换肤——运行时目标由 `codedrobe --app codex` 或 `codedrobe --app workbuddy` 选择。维护者用同样方式安装 `codedrobe-adapter-dev`；`npx skills add CodeDrobe/skills --list` 可列出全部可装项。

## 直接告诉 AI 你的需求

安装 `codedrobe-theme` 后，可以附上参考图片，并明确目标软件。例如：

> 参考这张图片，帮我生成一个 Codex 皮肤。保留原生交互，生成可移植的主题包，并在真实应用中验证首页和会话页。

还可以这样说：

- “把这套视觉风格同时做成 Codex 和 WorkBuddy 皮肤。”
- “使用自带的玩偶姐姐示例作为起点，帮我改成蓝色 Codex 版本。”
- “WorkBuddy 更新后这个主题错位了，请分析实时 CDP DOM 并修复。”
- “帮我检查、应用并验证这个 `.codedrobe-theme` 文件。”
- “在 CodeDrobe 商店找一个复古主题装到 Codex。”
- “把 Codex 恢复到原生外观，并确认主题没有残留。”
- “补全商店上架信息，把这个主题发布到 CodeDrobe 商店。”

Skill 会用参考图确定配色、材质和视觉元素，用保护隐私的实时 CDP DOM 快照选择节点——它修改的是真实应用样式，不会把截图作为覆盖层贴在界面上。应用主题可能需要以 CDP 模式启动软件；重启正在运行的软件始终需要你的明确授权。

## Core 运行时

Skill 依赖 `@codedrobe/core` CLI，全局安装一次即可（免安装的 `npx`/`bunx` 方式在 Skill 内文档中有说明）：

```bash
npm install --global @codedrobe/core
codedrobe apps
```

日常命令——快照、应用、验证、恢复——由 AI 替你执行。发布到 CodeDrobe 商店需要登录并经你本人确认：

```bash
codedrobe auth login
codedrobe theme publish /absolute/theme.codedrobe-theme --submit
```

## 主题制作资源

安装后的 `codedrobe-theme` Skill 包含两套可复制源码：

- `assets/theme-starter/`：覆盖 Codex/WorkBuddy 主要界面的完整中性 CSS 起始模板。
- `assets/examples/doll-sister/`：完整的“玩偶姐姐”双应用主题，包含生成的 hero 和 texture 素材。

模板不会被当作永久 DOM 合约：Skill 会在各应用上下文分别采集实时 `codedrobe dom snapshot`，从实机快照选择语义节点，再完成打包、预检、应用、截图和修正。

## 相关仓库

- [`CodeDrobe/core`](https://github.com/CodeDrobe/core)：CLI、适配器、CDP 运行时、主机设置、主题包校验和公共 API。
- [`CodeDrobe/desktop`](https://github.com/CodeDrobe/desktop)：基于 Core 的可视化主题管理器。
- 主题发布通过 `codedrobe theme publish` 完成：设备授权登录、服务端主题包校验、审核通过后才会上架。

新增或修改 Skill 前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 开源协议与商标

指令和文档采用 [Apache License 2.0](LICENSE)。相关产品名称和商标归各自所有者所有。CodeDrobe 是独立项目，与 OpenAI、腾讯不存在官方隶属或背书关系。

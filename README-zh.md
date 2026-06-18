# RJ号折跃门 (中文说明)

**RJ号折跃门** 是一款专为南+（South Plus）论坛设计的极客风油猴脚本。它以 RJ 号为魔法媒介，无缝串联了 DLsite 的元数据网络以及 ASMR ONE 的在线视听资源。

![RJ号折跃门 Demo](./assets/demo.png)

## 🌟 主要特性

- **悬浮预览卡片**：在南+论坛，只需将鼠标悬停在任何 RJ 号上，即可弹出一个极具现代毛玻璃（Glassmorphism）质感的精致卡片，直观展示 DLsite 封面、标题、社团、标签、声优以及销量等详尽信息。
- **ASMR ONE 互联**：自带跳转引擎，提供一键直达 ASMR ONE 免费在线试听资源的快捷按钮。
- **南+原生夜间模式**：脚本自带南+论坛的全局原生夜间模式开关，完美保护玻璃质感弹窗的色彩不受 Dark Reader 等第三方反色滤镜的破坏。
- **多语言智能支持**：根据您的浏览器语言环境，脚本的菜单和界面会自动在简体中文、繁体中文和英文之间智能切换。

## 🚀 安装指南

首先，请在浏览器中安装用户脚本管理器，强烈推荐使用 [Tampermonkey (油猴)](https://www.tampermonkey.net/)。然后，选择以下任意一种方式安装：

- **方式 A：通过 GreasyFork 安装（推荐）**
  点击 **[此处](https://greasyfork.org/zh-CN/scripts/583340-rj-warp-gate)** 安装，支持后续自动更新。

- **方式 B：通过 GitHub Release 安装**
  点击 **[此处](https://github.com/Leovikii/RJ-Warp-Gate/releases/latest/download/rj-warp-gate.user.js)** 安装由 GitHub Actions 全自动打包的最新主线版本。

## 🛠️ 本地编译

如果您希望自行编译或进行二次开发：

```bash
git clone https://github.com/Leovikii/RJ-Warp-Gate.git
cd RJ-Warp-Gate
npm install
npm run build
```
编译成功后，产物脚本将生成在 `dist/rj-warp-gate.user.js`。

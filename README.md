# RJ Warp Gate

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

[🇨🇳 简体中文说明 (Simplified Chinese)](./README-zh.md) | [🇭🇰/🇹🇼 繁體中文說明 (Traditional Chinese)](./README-zh-TW.md)

**RJ Warp Gate** is a powerful Tampermonkey script designed to connect South Plus forums, DLsite metadata, and ASMR ONE. It transforms static RJ codes into an interactive, beautifully designed experience.

![RJ Warp Gate Demo](./assets/demo.png)

## 🌟 Features

- **Click Previews**: Click on any RJ code on South Plus to instantly view a modern, glassmorphism popup containing DLsite metadata (Cover Image, Title, Tags, Voice Actors, Sales, etc.).
- **ASMR ONE Integration**: Provides one-click direct links to listen to ASMR works on ASMR ONE for free.
- **Native Dark Mode**: Beautifully overrides South Plus styles to provide a highly customized, native dark mode experience that perfectly complements the glass popup UI.
- **Auto-Localization**: Adapts to Simplified Chinese, Traditional Chinese, and English automatically.

## 🚀 Installation

First, install a user script manager such as [Tampermonkey](https://www.tampermonkey.net/). Then, choose one of the following methods to install RJ Warp Gate:

- **Method A: Install via GreasyFork (Recommended)**
  Click **[Here](https://greasyfork.org/scripts/583340-rj-warp-gate)** to install and get automatic updates.

- **Method B: Install via GitHub Release**
  Click **[Here](https://github.com/Leovikii/RJ-Warp-Gate/releases/latest/download/rj-warp-gate.user.js)** to install the latest build directly from our GitHub Actions CI/CD.

## 🛠️ Building from source

```bash
git clone https://github.com/Leovikii/RJ-Warp-Gate.git
cd RJ-Warp-Gate
npm install
npm run build
```
The compiled userscript will be located at `dist/rj-warp-gate.user.js`.

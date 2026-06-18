# RJ號折躍門 (繁體中文說明)

**RJ號折躍門** 是一款專為南+（South Plus）論壇設計的極客風油猴腳本。它以 RJ 號為魔法媒介，無縫串聯了 DLsite 的元數據網絡以及 ASMR ONE 的在線視聽資源。

![RJ號折躍門 Demo](./assets/demo.png)

## 🌟 主要特性

- **懸浮預覽卡片**：在南+論壇，只需將鼠標懸停在任何 RJ 號上，即可彈出一個極具現代毛玻璃（Glassmorphism）質感的精緻卡片，直觀展示 DLsite 封面、標題、社團、標籤、聲優以及銷量等詳盡信息。
- **ASMR ONE 互聯**：自帶跳轉引擎，提供一鍵直達 ASMR ONE 免費在線試聽資源的快捷按鈕。
- **南+原生夜間模式**：腳本自帶南+論壇的全局原生夜間模式開關，完美保護玻璃質感彈窗的色彩不受 Dark Reader 等第三方反色濾鏡的破壞。
- **多語言智能支持**：根據您的瀏覽器語言環境，腳本的菜單和界面會自動在簡體中文、繁體中文和英文之間智能切換。

## 🚀 安裝指南

首先，請在瀏覽器中安裝用戶腳本管理器，強烈推薦使用 [Tampermonkey (油猴)](https://www.tampermonkey.net/)。然後，選擇以下任意一種方式安裝：

- **方式 A：通過 GreasyFork 安裝（推薦）**
  點擊 **[此處](https://greasyfork.org/zh-TW/scripts/583340-rj-warp-gate)** 安裝，支持後續自動更新。

- **方式 B：通過 GitHub Release 安裝**
  點擊 **[此處](https://github.com/Leovikii/RJ-Warp-Gate/releases/latest/download/rj-warp-gate.user.js)** 安裝由 GitHub Actions 全自動打包的最新主線版本。

## 🛠️ 本地編譯

如果您希望自行編譯或進行二次開發：

```bash
git clone https://github.com/Leovikii/RJ-Warp-Gate.git
cd RJ-Warp-Gate
npm install
npm run build
```
編譯成功後，產物腳本將生成在 `dist/rj-warp-gate.user.js`。

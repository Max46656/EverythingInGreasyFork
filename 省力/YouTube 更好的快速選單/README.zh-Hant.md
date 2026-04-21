english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/YouTube%20%E6%9B%B4%E5%A5%BD%E7%9A%84%E5%BF%AB%E9%80%9F%E9%81%B8%E5%96%AE/README.md)

# YouTube 更好的快速選單 / YouTube Better Quick Menu

## Description

YouTube 在觀看影片頁面時，預設會把左側的迷你導覽選單（Mini Guide）隱藏，導致使用者必須點選左上角漢堡選單才能切換頁面，非常不方便。

這個腳本讓你在 **影片觀看頁面** 中，只要把滑鼠移到畫面最左側（100px 範圍內），就會自動顯示浮動的快速導覽選單，滑鼠移開後自動隱藏，讓你能像在首頁一樣快速切換「首頁、Shorts、訂閱內容、個人中心」等功能。

### Features

- 滑鼠移到畫面最左側 100px 範圍內 → 自動顯示浮動迷你導覽選單
- 滑鼠移開後自動淡出隱藏（帶有平滑動畫）
- 使用簡化但清晰的圖示與文字，高度還原 YouTube 固有風格
- 支援 SPA 動態路由（影片頁面切換影片時自動重新初始化）
- 半透明設計，不會過度遮擋影片畫面（可透過 CSS 調整）
- 多語言支援（中文、英文、日文、印地文、捷克文、立陶宛文等）
- 輕量且高效，不影響頁面效能

### Installation

1. 安裝 [Violentmonkey](https://violentmonkey.github.io) 或 Tampermonkey
2. 安裝 [YouTube 更好的快速選單](https://greasyfork.org/zh-TW/scripts/566549-youtube-%E6%9B%B4%E5%A5%BD%E7%9A%84%E5%BF%AB%E9%80%9F%E9%81%B8%E5%96%AE)（安裝後請重新整理 YouTube 影片頁面）
3. 完成！

### Usage

- 在任何 `https://www.youtube.com/watch?v=` 的影片觀看頁面，將滑鼠遊標移到 **畫面最左側** 即可喚出浮動導覽選單。
- 滑鼠離開左側區域後，選單會自動隱藏。
- 點選選單中的項目即可快速切換頁面。

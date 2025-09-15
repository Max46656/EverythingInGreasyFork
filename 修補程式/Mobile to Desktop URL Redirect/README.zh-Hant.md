[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E4%BF%AE%E8%A3%9C%E7%A8%8B%E5%BC%8F/Mobile%20to%20Desktop%20URL%20Redirect/README.md) | 中文


# 手機版網址重新導向到電腦版

當載入手機版網頁時，若電腦版存在，則自動重新導向到電腦版網址。

## 功能概述

此使用者腳本旨在自動將手機版網頁重新導向到對應的電腦版網址，改善桌面瀏覽體驗。主要功能包括：

- **自動重新導向**：檢測手機版網址（例如 `m.example.com` 或 `example.com/mobile`），並優先使用標準網址或使用者規則符合轉換為電腦版網址。
- **黑名單管理**：允許使用者將特定域名加入黑名單，阻止重新導向。
- **自訂規則**：支援為特定網站添加自訂正則表達式規則，以處理複雜的 URL 轉換。

## 安裝

1. 安裝瀏覽器擴充套件：
   - Firefox：安裝 [Greasemonkey](https://addons.mozilla.org/zh-TW/firefox/addon/greasemonkey/) 或 [Tampermonkey](https://addons.mozilla.org/zh-TW/firefox/addon/tampermonkey/)。
   - Chrome/Edge：安裝 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)。
2. 下載腳本：
   - 安裝腳本：[手機版網址重新導向到電腦版]([https://greasyfork.org/scripts/548125](https://greasyfork.org/zh-TW/scripts/548125-%E6%89%8B%E6%A9%9F%E7%89%88%E7%B6%B2%E5%9D%80%E9%87%8D%E6%96%B0%E5%B0%8E%E5%90%91%E5%88%B0%E9%9B%BB%E8%85%A6%E7%89%88)) 頁面安裝。

## 使用說明

1. **自動運行**：
   - 當您訪問手機版網頁（例如 `zh.m.wikipedia.org`），腳本會自動嘗試重新導向到電腦版（例如 `zh.wikipedia.org`）。
   - 優先檢查 `<link rel="canonical">`，若無效則使用自訂規則或內建模式符合。

2. **選單操作**：
   - 右鍵點選瀏覽器中的 Greasemonkey/Tampermonkey 圖標，開啟腳本菜單：
     - **加入黑名單**：將當前域名加入黑名單，阻止重新導向。
     - **從黑名單移除**：移除指定域名的黑名單限制。
     - **檢視黑名單**：顯示當前所有黑名單域名。
     - **新增自訂規則**：為當前域名輸入和替換字串。
     - **修改自訂規則**：更新現有規則的正則表達式或替換字串。
     - **刪除自訂規則**：移除指定域名的自訂規則。
     - **檢視自訂規則**：顯示所有自訂規則的詳細資訊。

3. **自訂規則範例**：
   - 網站： `m.gamer.com.tw`
   - 被替換字串：`m.gamer.com.tw/forum/`
   - 替換字串：`forum.gamer.com.tw/`
   - 效果：將 `https://m.gamer.com.tw/forum/B.php?bsn=73317` 重新導向到 `https://forum.gamer.com.tw/B.php?bsn=73317`。

## 問題回報

若遇到問題，請在 [GitHub Issues](https://github.com/Max46656/EverythingInGreasyFork/issues) 送出，包含以下資訊：
- 標題需包含是哪一個使用者腳本
- 問題描述
- 網址範例
- 控制台日誌（F12 > Console）
- 預期行為與實際行為

## 感謝
- 圖標來源：[Smashicons](https://www.flaticon.com/authors/smashicons)

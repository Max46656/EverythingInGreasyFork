[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/CleanYouTubeShortURLSharer/README.md) | 中文

# YouTube 乾淨短網址分享器

是否覺得 YouTube 分享網址過長、充滿如 `si=` 等不必要的追蹤參數？這個使用者腳本會取代原本的分享按鈕，產生乾淨的 `youtu.be` 短網址，並立即複製到你的剪貼簿中──沒有追蹤碼，沒有雜訊。

## 功能特色

* 自動取代 YouTube 固有的分享按鈕。
* 產生純粹的 `https://youtu.be/` 短網址（僅含影片 ID）。
* 點擊即自動複製短網址到剪貼簿。
* 畫面中顯示簡短通知，確認已複製成功。
* 支援多語系通知顯示（英文、中文、日文、西班牙文、德文）。

## 安裝方式

1. 安裝 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/) 瀏覽器擴充功能。
2. 安裝腳本：[YouTube 乾淨短網址分享器](https://greasyfork.org/zh-TW/scripts/535128-youtube-%E4%B9%BE%E6%B7%A8%E7%9F%AD%E7%B6%B2%E5%9D%80%E5%88%86%E4%BA%AB%E5%99%A8)。
3. 開啟任一 YouTube 影片頁面，測試新的分享按鈕！

## 使用說明

1. 前往任何 YouTube 影片頁面（例如 `https://www.youtube.com/watch?v=...`）。
2. 當網頁完全載入後，原本的分享按鈕會自動被取代。
3. 點擊新的分享按鈕。
4. 顯示如 `https://youtu.be/73_TiCJ-Wtc` 的短網址會被複製至剪貼簿（完全不含追蹤參數！）。
5. 螢幕上將短暫顯示提示訊息，確認已成功複製。

## 語言支援

本腳本已內建以下語言的通知訊息：
- 🇺🇸 英文
- 🇹🇼 中文（繁體）
- 🇯🇵 日文
- 🇪🇸 西班牙文
- 🇩🇪 德文

你可以在原始碼的 `LocalizationManager` 類別中自由擴充或修改語言內容。

你也可以自訂 `YouTubeShortUrlCopier` 類中的 `notificationDuration` 參數，來調整通知顯示的持續時間。

## 授權條款

採用 MPL2.0 授權。

---

想參與貢獻？歡迎回報問題或送出 PR：  
[GitHub Repo](https://github.com/Max46656/EverythingInGreasyFork/tree/main/YouTubeShortCleanShare)

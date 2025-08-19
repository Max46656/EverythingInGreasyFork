[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E7%BE%8E%E8%A7%80/Clean%20YT%20Shorts%20Video/README.md) | 中文

# 乾淨的YouTube Shorts影片

將 YouTube Shorts 影片中的標題、創作者資訊及其他元素設置為預設透明，當滑鼠懸停時顯示。

## 功能
使用基於類別的實現方式管理透明度設置，確保程式碼清晰且易於維護。
* 預設透明度設為 0，減少視覺幹擾。
* 滑鼠懸停時透明度提昇至 0.8，增強可見性。
* 動態應用樣式，適應 YouTube 的動態加載機制。
* 透明度變化採用平滑過渡效果。
* 防呆設計，確保與 YouTube Shorts 頁面的相容性。

## 安裝
1. 安裝 [Violentmonkey](https://github.com/violentmonkey/violentmonkey) (Firefox, Chrome, Vivaldi)
2. 安裝 [乾淨的YouTube Shorts影片](https://greasyfork.org/zh-TW/scripts/XXXXXX-clean-youtube-shorts-video)（將在上述用戶腳本管理器中加載）
3. 完成

## 使用方法
1. 確保 Tampermonkey 已啟用且腳本已安裝。
2. 前往任何 YouTube Shorts 頁面（例如：https://www.youtube.com/shorts）。
3. 腳本會自動將創作者資訊及其他元數據的透明度設為預設值。
4. 將滑鼠懸停在元數據區域以顯示內容。

## 注意事項
* 如需調整透明度，可修改腳本中的 `defaultOpacity` 和 `hoverOpacity` 變數。

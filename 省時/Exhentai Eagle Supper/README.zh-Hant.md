# 熊貓 Eagle 支援
此腳本能夠自動開啟 Exhentai/E-Hentai 的原圖並將其加入 Eagle，無需手動操作。支援 Exhentai 和 E-Hentai 的畫廊頁面和圖片頁面。

## 功能
* 在畫廊頁面添加按鈕以啟用/禁用自動功能。
* 自動開啟原圖頁面並保存圖片資訊。
* 自動將原圖添加到 Eagle 圖片管理軟體中。
* 清理舊數據的功能。

## 安裝
1. 安裝 [Violentmonkey](https://violentmonkey.github.io) 或 [Tampermonkey](https://www.tampermonkey.net/) 瀏覽器擴充套件。
2. 在上述用戶腳本管理器中加載 [熊貓 Eagle 支援](https://greasyfork.org/zh-TW/scripts/501634/熊貓-eagle-支援)。
3. 完成。

## 使用方法
1. 打開 Exhentai 或 E-Hentai 的畫廊頁面（URL 格式為 `https://exhentai.org/g/*` 或 `https://e-hentai.org/g/*`）。
2. 腳本將在畫廊頁面中添加一個按鈕，顯示 "AutoEagle: On" 或 "AutoEagle: Off"。點擊按鈕以啟用或禁用自動功能。
3. 打開 Exhentai 或 E-Hentai 的圖片頁面（URL 格式為 `https://exhentai.org/s/*` 或 `https://e-hentai.org/s/*`）。
4. 腳本將自動開啟原圖頁面並保存圖片資訊。
5. 當原圖頁面打開時，腳本將自動將圖片添加到 Eagle，並在成功後關閉頁面。

## 清理舊數據（如果你使用Tampermonkey）
1. 在瀏覽器中打開任意支援的頁面(AutoEagle: Off時的圖片頁面或AutoEagle: On/Off的畫廊頁面)。
2. 在腳本選單中，選擇 "Clean Old Data" 來清理舊數據。

## 注意事項
* 腳本默認設置為自動模式。如果需要更改，可以通過畫廊頁面中的按鈕進行設置。
* 確保 Eagle 圖片管理軟體正在運行，並且 API 服務已啟用（默認地址為 `http://localhost:41595`）。

## 授權
本腳本基於 [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/) 授權。


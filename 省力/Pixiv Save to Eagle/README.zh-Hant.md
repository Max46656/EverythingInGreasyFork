[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/Pixiv%20Save%20to%20Eagle/README.md) | 中文

# Pixiv 圖片儲存至 Eagle

在 Pixiv 作品頁面直接將圖片或動圖（GIF）儲存至 Eagle。

## 功能
- 一鍵將單張圖片、多頁圖片或動圖（Ugoira）儲存至 Eagle。
- 自動獲取作品元數據（藝術家名稱、標題、ID）以確保一致的檔案命名。
- 將 Pixiv 標籤添加至 Eagle 項目，便於組織管理。
- 透過下拉選單選擇 Eagle 資料夾，自動儲存上次選擇的資料夾。
- 適應 Pixiv 的動態載入機制，確保與作品頁面的相容性。
- 內建錯誤處理，當下載或 Eagle API 發生問題時，會在控制台記錄除錯資訊。

## 安裝
1. 安裝 [Violentmonkey](https://github.com/violentmonkey/violentmonkey)（適用於 Firefox、Chrome、Vivaldi 等瀏覽器）。
2. 安裝 [Pixiv 圖片儲存至 Eagle](https://greasyfork.org/zh-TW/scripts/546402-pixiv-save-to-eagle)（將在上述用戶腳本管理器中載入）。
3. 確保 Eagle 在本機運行（預設 API：http://localhost:41595）。
4. 完成。

## 使用方法
1. 開啟 Pixiv 的任意作品頁面（例如：https://www.pixiv.net/artworks/*）。
2. 等待「儲存至 Eagle」按鈕和資料夾下拉選單出現在分享按鈕旁。
3. 從下拉選單選擇 Eagle 資料夾（可選，預設儲存至 Eagle 根目錄）。
4. 點選「儲存至 Eagle」，將作品（單張圖片、多頁圖片或動圖）傳送至 Eagle。
5. 檢視瀏覽器控制台以確認成功或錯誤訊息。

## 注意事項
- **Eagle 需求**：Eagle 必須在本機運行並啟用 API（http://localhost:41595）。
- **動圖處理**：動圖使用 gif.js 在客戶端生成，對於幀數較多的作品可能需要較長時間。請保持 Pixiv 頁面可見。
- **網路限制**：腳本使用 Pixiv 的 API 並設置正確的 Referer 標頭以繞過限制。執行期間請勿打開開發者工具或調整視窗大小，以免中斷動態載入。
- **資料夾選擇**：腳本會動態獲取 Eagle 資料夾名稱。若未顯示資料夾，請確認 Eagle API 是否可訪問。
- **錯誤處理**：若儲存失敗（例如 Eagle 離線或 Pixiv API 變更），錯誤訊息將記錄至控制台以便除錯。

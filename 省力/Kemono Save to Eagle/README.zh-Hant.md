[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/Kemono%20Save%20to%20Eagle/README.md) | 中文

# Kemono 圖片儲存至 Eagle

直接從 Kemono 貼文頁面將圖片儲存至 Eagle，並支援自訂按鈕位置。

## 功能
- 單擊即可將 Kemono 貼文中的單張圖片儲存至 Eagle。
- 自動擷取貼文元數據（創作者名稱、標題、ID），確保檔案命名一致。
- 透過下拉選單選擇 Eagle 資料夾，並儲存上次選擇的資料夾以方便使用。
- 提供「全部儲存到 Eagle」按鈕，一次下載貼文中的所有圖片。
- 透過使用者選單自訂「儲存到 Eagle」按鈕的位置（例如左上角、右下角、圖片中央）。
- 支援 Kemono 的動態載入，確保按鈕正確顯示於貼文頁面。
- 包含錯誤處理機制，當下載或 Eagle API 發生問題時，會在控制台記錄錯誤訊息以便除錯。

## 安裝
1. 安裝 [Violentmonkey](https://github.com/violentmonkey/violentmonkey)（支援 Firefox、Chrome、Vivaldi 等瀏覽器）。
2. 安裝 [Kemono Save to Eagle](https://greasyfork.org/zh-TW/scripts/552924-kemono-save-to-eagle)（將自動載入至上述安裝的使用者腳本管理器）。
3. 確保 Eagle 在本機上運行（預設 API 位址：http://localhost:41595）。
4. 完成。

## 使用方法
1. 開啟任一 Kemono 貼文頁面（例如：https://kemono.su/*/user/*/post/*）。
2. 等待「儲存到 Eagle」按鈕出現在每張圖片上，以及資料夾下拉選單出現在貼文檔案區域附近。
3. 從下拉選單選擇 Eagle 資料夾（可選，預設為 Eagle 根目錄）。
4. 點擊單張圖片上的「儲存到 Eagle」按鈕將該圖片儲存至 Eagle，或點擊「全部儲存到 Eagle」按鈕一次儲存貼文中的所有圖片。
5. 透過 Violentmonkey 的腳本選單選擇「選擇按鈕位置」，從選單中挑選按鈕位置（例如左上角、中央上方），並點擊「⭘」按鈕確認。
6. 檢查瀏覽器控制台以查看成功或錯誤訊息。

## 注意事項
- **Eagle 需求**：Eagle 必須在本機運行並啟用 API（http://localhost:41595）。
- **動態載入**：腳本會監聽 DOM 變化，確保按鈕在動態載入的內容上正確顯示。執行期間請避免開啟開發者工具或調整視窗大小，以免中斷載入。
- **按鈕位置自訂**：使用「選擇按鈕位置」選單調整「儲存到 Eagle」按鈕在圖片上的位置（例如四角或中央）。
- **資料夾選擇**：腳本會動態獲取 Eagle 資料夾名稱。若選單未顯示資料夾，請確認 Eagle 的 API 是否可正常存取。
- **錯誤處理**：若儲存失敗（例如 Eagle 離線或 Kemono 頁面結構變更），錯誤訊息將記錄於控制台以便除錯。
- **效能**：使用「全部儲存到 Eagle」功能時，若貼文包含大量圖片，可能因圖片數量或網路狀況而需較長時間。

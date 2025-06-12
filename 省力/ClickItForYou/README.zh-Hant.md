[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/ClickItForYou/README.md) | 中文
# click it for you
幫你自動點擊那些不想自己點的按鈕。

## 功能特色
* 提供浮動選單，允許新增、編輯和刪除規則。
* 新增規則能夠自訂網址（接受正規表達式），以區分通用網域與某個特定頁面，甚至是跨網域。
* 支援 CSS 和 XPath 選擇器。
* 自訂重複尋找元素的延遲時間（毫秒），就算網頁使用動態加載，等待時間很久也沒問題。
* 可指定點擊第幾個符合元素（預設第 1 個）。
* 選單會顯示當前網址符合的所有規則，規則可縮小/展開檢視細節。
* 當規則過多時會自動出現滾動條。
* 支援自訂規則名稱。

## 安裝方式
1. 安裝 [Violentmonkey](https://violentmonkey.github.io)（支援 Firefox、Chrome、Vivaldi 等瀏覽器）。
2. 安裝 [click it for you](https://greasyfork.org/zh-TW/scripts/539191-click-it-for-you)（將自動載入至 ）。
3. 完成。

## 使用方法
1. 開啟任意想要設定自動點擊的網頁。
2. 在瀏覽器中點擊 Violentmonkey 圖標，選擇「自動點擊設定」開啟選單。
3. 在選單中：
   - **新增規則**：輸入規則名稱、網址正規表達式、選擇器類型（CSS 或 XPath）、選擇器、第幾個元素（從 1 開始）、點擊延遲（毫秒），點擊「新增規則」。
   - **檢視規則**：僅顯示當前網址符合的規則。點擊規則名稱展開/縮小詳情，展開時可檢視完整設定。
   - **更新規則**：展開規則後點擊任意需要修改的內容並修改，並點擊「儲存」按鈕更新規則。
   - **刪除規則**：展開規則後點擊「刪除」按鈕移除規則。
4. 腳本將在符合正規表達式的網址上自動點擊指定元素。
5. 關閉選單點擊「✕」按鈕。

## 注意事項
* 確保網址的正規表達式正確。
* 選擇器需精確符合目標元素，建議使用瀏覽器開發者工具檢驗 CSS 或 XPath是否能正確找到元素。

## 多語言支援
* 繁體中文 (zh-TW): 為你自動點擊 - 在符合正則表達式的網址上自動點擊指定的元素。
* 英文 (en): click it for you - Automatically clicks specified elements on URLs matching a regular expression.
* 日文 (ja): あなたのためにクリック - 正規表現に一致するURLで指定された要素を自動的にクリックします。
* 德文 (de): Für dich klicken - Klickt automatisch auf angegebene Elemente auf URLs, die mit einem regulären Ausdruck übereinstimmen.
* 西班牙文 (es): Clic automático para ti - Hace clic automáticamente en elementos especificados en URLs que coinciden con una expresión regular。

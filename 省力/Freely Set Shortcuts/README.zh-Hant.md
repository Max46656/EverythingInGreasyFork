[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/Freely%20Set%20Shortcuts/README.md) | 中文
# 自由設定快捷鍵

## 概述
本使用者腳本允許使用者定義單個或雙個修飾鍵的快捷鍵組合，以點選符合指定網址模式的網頁上的特定元素。  
## 功能

- **自訂快捷鍵**：支援單個或雙個修飾鍵（例如 `CapLock+A`、`Control+Alt+B`）的自訂快捷鍵來觸發網頁元素點選。
- **網址模式**：使用正規表達式檢查符合的網址上。
- **元素選擇器**：支援使用 CSS 選擇器（例如 `button.submit`）或 XPath（例如 `//button[@class="submit"]`）選擇元素。
- **元素索引**：按位元元元置選擇元素，並支援從最後一個符合條件的元素往回選取（例如`1`代表符合的第一個元素，`-1` 表示最後一個元素）。
- **衝突檢測**：檢查並顯示本網頁中快捷鍵或目標元素重疊的衝突（包含快捷鍵組合和目標選擇器＋索引）。
- **連結導航**：點選帶有有效 `href` 的 `<a>` 元素時可選擇開啟連結或是點選該元素（根據該網站對A元素的使用方式設定）。
- **多語言支援**：界面支援繁體中文 (zh-TW)、English (en)、日本語 (ja)、Deutsch (de) 和 Español (es)。
- **規則管理**:通過選單功能對規則進行新增、更新、刪除、啟用/禁用。
- **規則檢查與轉換**：僅允許並顯示各語言鍵盤能夠使用的字元與功能鍵作為快捷鍵。

## 安裝
1. **安裝用戶腳本管理器**：在你的瀏覽器（Chrome、Firefox、Edge 等）安裝使用者腳本管理器，例如 [Violentmonkey](https://violentmonkey.github.io)。
2. **安裝腳本**：從 [greasyfork](https://greasyfork.org/zh-TW/scripts/542829-%E8%87%AA%E7%94%B1%E8%A8%AD%E5%AE%9A%E5%BF%AB%E6%8D%B7%E9%8D%B5) 安裝本腳本。
3. **驗證安裝**：安裝後，你能在瀏覽器的使用者腳本選單中看到兩個選單功能：「新增快捷鍵規則」和「管理快捷鍵規則」。

## 使用方法

### 新增規則
1. 在瀏覽器中打開用戶腳本選單，選擇**新增快捷鍵規則**。
2. 輸入規則所需的欄位：
   - **規則名稱**：為規則命名（例如 `點選送出按鈕`）。
   - **網址正則表達式**：符合網址的正則表達式（例如 `https://example.com/.*`）。
   - **選擇器類型**：選擇 `CSS` 或 `XPath`。
   - **選擇器**：撰寫元素選取器（例如 [CSS](https://developer.mozilla.org/zh-TW/docs/Web/CSS/CSS_selectors) 的 `button.submit` 或 [XPath](https://developer.mozilla.org/zh-CN/docs/Web/XML/XPath) 的 `//button[@class="submit"]`）。
   - **第幾個元素**：元素的位置（例如 `1` 表示第一個，`-1` 表示最後一個）。
   - **快捷鍵修飾鍵組合**：選擇一或兩個修飾鍵（例如 `Control`、`CapsLock+Alt`）。
   - **快捷鍵主鍵**輸入單一字母或數字（例如 `A`、`F1`）。
   - **若為連結則開啟**：勾選以在點選 `<a>` 元素時開啟連結，若保持空則點選該連結（根據該網站對A元素的使用方式決定）。
   - **啟用規則**：保持勾選。
   - 點選**新增規則**儲存。若檢測到衝突會在控制台顯示衝突訊息。

### 管理規則
1. 從使用者腳本選單選擇**管理快捷鍵規則**。
2. 程式僅會顯示正規表達式與目前網址能相符的規則。
3. 點選規則名稱以展開詳情（若與其他顯示的規則衝突則會顯示於最後一欄）。
4. 編輯欄位（例如更改快捷鍵或選擇器），然後點選**儲存**。
5. 取消勾選**啟用規則**將使該規則暫時不起作用（除非你很確定該規則不再需要，否則選擇此欄位而非**刪除**以刪除規則）。

## 使用範例
新增規則⮄  
修改規則⮆(並顯示規則衝突)  
<img width="334" height="596" alt="image" src="https://github.com/user-attachments/assets/bd5b51fd-5872-461b-b77e-c71cf78e400d" /><img width="390" height="552" alt="image" src="https://github.com/user-attachments/assets/1c5883c5-4741-4858-b0de-807a836936be" />

### 控制台訊息

- 所有控制台訊息均以本使用者腳本名稱作為開頭（支援瀏覽器語言），並以使用繁體中文 (`zh-TW`) 顯示錯誤、警告和成功日誌。
- 範例警告：`自由設定快捷鍵: 規則 "點選送出" 的正則表達式無效: https://example.com/.*`
- 範例衝突：`自由設定快捷鍵: 新規則 "點選送出" 檢測到相同的快捷鍵組合: 與規則 "另一規則" 衝突 (快捷鍵: Control+B, 選擇器: button.submit, 第幾個元素: 1)`

## License
- 本項目採用 Mozilla Public License 2.0 許可

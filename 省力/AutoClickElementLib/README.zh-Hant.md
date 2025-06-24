# AutoClick 函式庫

greasyfork上有很多腳本的目的其實只是「幫我點X元素Y次」。  
本函式庫允許開發者定義基於網址模式（正規表達式）和 CSS/XPath 選擇器的自動點選規則，  
支援單次或持續點選、連結跳轉以及自訂點選間隔。  

## 功能

- **規則管理**：支援點選規則的CRUD，包含網址正規表達式和選擇器的驗證，與重複規則的檢查。
- **任務管理**：支援點選任務的排程與管理，包含防抖機制。
- **選擇器支援**：支援 CSS 和 XPath 選擇器，且支援指定該選擇器結果的索引，因此不需要是能搜尋出唯一值的選擇器。
- **可配置行為**：支援持續點選、連結跳轉和自訂點選間隔。

## 引入函式庫

1. 確保瀏覽器已安裝 Violentmonkey 或其他使用者腳本管理器。
2. 創建一個新的用戶腳本，並在元數據中加入以下內容：
```JavaScript
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_info
// @require      https://raw.githubusercontent.com/Max46656/EverythingInGreasyFork/refs/heads/main/%E7%9C%81%E5%8A%9B/AutoClickElementLib/AutoClickElementLib.js
```
3. 建立並初始化函式庫實例：`this.clickLib = new ClickItForYou();`。

## 規則

每個規則是一個物件，包含以下屬性：

| 屬性            | 類型    | 說明                                      | 必須 | 預設值        |
|-----------------|---------|-------------------------------------------|------|---------------|
| `ruleName`      | string  | 規則名稱，用於識別                        | 否   | `規則 N`（N 為索引+1） |
| `urlPattern`    | string  | 匹配網址的正規表達式                      | 是   | 無            |
| `selector`      | string  | CSS 或 XPath 選擇器                       | 是   | 無            |
| `selectorType`  | string  | 選擇器類型，必須為 `"css"` 或 `"xpath"`   | 是   | 無            |
| `nthElement`    | number  | 點選第幾個匹配元素（從 1 開始）           | 否   | 1             |
| `clickDelay`    | number  | 點選間隔（毫秒）                          | 否   | 1000          |
| `keepClicking`  | boolean | 是否在首次點選後繼續點選                  | 否   | false         |
| `ifLinkOpen`    | boolean | 若目標為 `<a>` 元素，是否跳轉至連結       | 否   | false         |

**注意**：
- `urlPattern` 必須是有效的正規表達式，否則會觸發驗證錯誤。
- `selectorType` 僅支援 `"css"` 或 `"xpath"`，其他值將導致規則無效。
- 當`ruleName`、`urlPattern`、`selector`三者一致時，將被判定為重複規則而不允許被`clickLib.addRule()`加入到`rules`中。

## API 參考

### `ClickItForYou` 方法

#### `addRule(rule)`
添加新點選規則，包含基礎驗證與防重複檢查。
- **參數**：`rule` (Object) - 規則物件，結構如上表。
- **返回值**：`{ success: boolean, error: string|null }`
  - `success`：`true` 表示添加成功，`false` 表示失敗。
  - `error`：失敗時的錯誤訊息（如規則已存在或無效正規表達式）。

#### `getRules([filter])`
獲取點選規則，可按網址過濾。
- **參數**：`filter` (string, 可選) - 網址過濾條件，預設為 `null`（返回所有規則）。
- **返回值**：`{ success: boolean, data: Array<Object>, error: string|null }`
  - `data`：符合條件的規則陣列。

#### `updateRule(index, rule)`
更新指定索引的規則，並重新啟動任務。
- **參數**：
  - `index` (number) - 規則索引（從 0 開始）。
  - `rule` (Object) - 更新後的規則物件。
- **返回值**：`{ success: boolean, error: string|null }`

#### `deleteRule(index)`
刪除指定索引的規則，並重新啟動任務。
- **參數**：`index` (number) - 規則索引（從 0 開始）。
- **返回值**：`{ success: boolean, error: string|null }`

#### `addTask(ruleIndex)`
為指定規則添加點選任務。
- **參數**：`ruleIndex` (number) - 規則索引（從 0 開始）。
- **返回值**：`{ success: boolean, taskId: number, error: string|null }`
  - `taskId`：任務的 `setInterval` ID。

#### `runTasks()`
啟動所有未運行任務的規則，使用防抖機制。
- **參數**：無。
- **返回值**：`{ success: boolean, error: string|null }`

#### `clearTasks()`
清除所有正在執行的任務。
- **參數**：無。
- **返回值**：`{ success: boolean, data: { clearedCount: number }, error: string|null }`
  - `clearedCount`：清除的任務數量。

## 使用範例
### 控制規則

```JavaScript
// 定義新規則
const newRule = {
  ruleName: "範例規則",
  urlPattern: "https://example.com/.*",
  selector: "button#submit",
  selectorType: "css",
  nthElement: 1,
  clickDelay: 1000,
  keepClicking: false,
  ifLinkOpen: false
};

// 添加規則
const addResult = clickLib.addRule(newRule);
if (addResult.success) {
  console.log("規則添加成功");
} else {
  console.error(addResult.error);
}

// 獲取當前網址的規則
const rules = clickLib.getRules(window.location.href);
console.log(rules.data);

// 更新規則
clickLib.updateRule(0, { ...newRule, clickDelay: 500 });

// 刪除規則
clickLib.deleteRule(0);
```

### 控制任務

```JavaScript
//啟動在rules中排序為0的任務
const oneTaskResult = clickLib.addTask(0);
if (oneTaskResult.success) {
  console.log(`任務添加成功，任務 ID: ${oneTaskResult.taskId}`);
} else {
  console.error("添加任務失敗:", oneTaskResult.error);
}

// 啟動所有符合當前網址模式的任務
const allTaskResult = clickLib.runTasks();
if (allTaskResult.success) {
  console.log("所有任務已啟動");
} else {
  console.error("啟動任務失敗:", allTaskResult.error);
}

// 清除任務(當你再次觸發啟動任務前要先清除啟動成功但未完成的任務)
const clearTasksResult = clickLib.clearTasks();
if (clearTasksResult.success) {
  console.log(`已清除 ${clearTasksResult.data.clearedCount} 個任務`);
} else {
  console.error("清除任務失敗:", clearTasksResult.error);
}
```

## 授權
本項目採用 Mozilla Public License 2.0 (MPL 2.0) 授權。詳見 [LICENSE](https://www.mozilla.org/en-US/MPL/2.0/)。
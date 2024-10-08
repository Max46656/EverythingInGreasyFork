[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E6%99%82/PixivIllustPopularitySortAndFilter/README.md) | 中文
# Pixiv作品熱門程度排序與篩選器
在關注的藝術家作品頁面、藝術家作品頁面和標籤作品頁面中，根據喜歡數排序插畫，並顯示高於閾值的插畫。

## 功能
使用策略模式適應不同的頁面設置和佈局。
* 根據喜歡數排序。
* 顯示喜歡數的閾值。
* 重置閾值並重新顯示插畫。
* 返回排序前的頁數。
* 設置作品表中的列數。
* 添加防呆設計，在最後一頁不會出現錯誤。

## 安裝
1. 安裝 Tampermonkey（適用於 Firefox、Chrome、Vivaldi）
2. 安裝 [Pixiv作品熱門程度排序與篩選器](https://greasyfork.org/zh-TW/scripts/497015-pixiv%E4%BD%9C%E5%93%81%E7%86%B1%E9%96%80%E7%A8%8B%E5%BA%A6%E6%8E%92%E5%BA%8F%E8%88%87%E7%AF%A9%E9%81%B8%E5%99%A8)（將在上述用戶腳本管理器中加載）
3. 完成

## 使用方法
1. 點擊 Tampermonkey 菜單並找到此腳本。
2. 在 Pixiv 頁面上，設置處理的頁數和喜歡數閾值。
3. StartButton 會提示您喜歡數閾值和處理的頁數。
4. 點擊“GO!”。

## 注意事項
* 本腳本使用 Pixiv 的動態加載機制，因此您需要保持 Pixiv 頁面在視野內。
* 在腳本執行期間，請勿打開開發者工具或調整窗口大小。
  這樣做可能會阻止某些縮略圖加載，導致腳本卡住，直到捕獲頁面上的所有縮略圖。

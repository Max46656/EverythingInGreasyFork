[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/InputPageTurnerForWebsite/README.md) | 中文

# Tampermonkey 的頁面翻頁腳本

瀏覽網頁時，不斷尋找小按鈕來快速跳轉到下一頁或上一頁是否很麻煩？
使用這個腳本，可以使用滑鼠滾輪或鍵盤按鈕可靠地切換頁面。
目前支援一些網站如 Pixiv，如果腳本不支援您想要的網站，您可以根據網域輕鬆設置，或者直接聯繫我。

## 功能

* 使用滑鼠滾輪滾動到頁面的頂部和底部來導航到上一頁和下一頁。
* 使用按鍵導航到上一頁和下一頁。
* 在選單中切換按鍵和滑鼠滾輪觸發方式。
* 在選單中自定義觸發按鍵。
* 擴展對網站的支援。

## 安裝

1. 安裝[Violentmonkey](https://violentmonkey.github.io) 或[Tampermonkey](https://www.tampermonkey.net/) 瀏覽器擴充套件。
2. 安裝[按鍵與滑鼠滾輪翻頁器](https://greasyfork.org/zh-TW/scripts/494851-%E6%8C%89%E9%8D%B5%E8%88%87%E6%BB%91%E9%BC%A0%E6%BB%BE%E8%BC%AA%E7%BF%BB%E9%A0%81%E5%99%A8)（將載入到上述安裝的使用者腳本管理器中）
3. 完成。

## 使用方法

1. 點擊 Tampermonkey 選單並找到這個腳本。
2. 選擇您需要的功能，如“切換頁面導航模式”或“自定義按鍵”，並按照指示進行操作。

## 如何為網域新增支援

1. 打開您想要新增支援的網站，然後打開開發者工具。
2. 選擇開發者控制台，複製控制台中返回的網域名稱。
3. 點擊開發者工具窗口左上角的檢查圖標。
4. 點擊網站上的上一頁和下一頁按鈕，然後在開發者工具的元素面板中找到 `<a>` 標籤內的 class 屬性並複製它。
5. 點擊 Tampermonkey 選單，右鍵單擊此腳本以打開 IDE。
6. 找到名為 `getPageButtonsByDomain()` 的函數，按照其他網站的格式，依次填寫網域和上一頁及下一頁按鈕的 class。記得在 class 名稱前添加 “.” 來表示它。
7. 記得保存文件並刷新您要應用的網站。

繁體中文 | [![Static Badge](https://img.shields.io/badge/lang-en-blue)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/GoogleSearchRsltLangLoc/README.md)
# Google 搜尋結果語言設定

厭倦了手動設定 Google 搜尋結果的語言？這個用戶腳本讓您可以設定 Google 搜尋的預設語言，通過自動將 `lr=` 參數添加到網址中，確保搜尋結果符合您的語言偏好。它還提供了一個選單，讓您從多種語言中選擇並切換自動語言應用的開關。

## 功能

* **為 Google 搜尋設定預設語言**，通過在搜尋網址中添加偏好的 `lr=<lang>` 參數。
* 提供選單指令，可從支援的語言選項中選擇偏好語言。
* 若在搜尋中啟用程式，則自動更新 Google 搜尋結果的語言設定。
* 切換語言時移除舊的語言參數，以保持 Google 搜尋結果的更新。
* 支援多語言選單提示（繁體中文、українська мова、English、日本語、한국어、Français、Español、Deutsch等常見語言）。

## 安裝

1. 安裝 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/) 瀏覽器擴充功能。
2. 安裝 [Google 搜尋預設語言選擇器](https://greasyfork.org/zh-TW/scripts/XXXXXX-language-manager) 用戶腳本。
3. 訪問 [Google 搜尋](https://www.google.com) 並使用腳本的選單指令來組態您的語言設定！

## 使用方法

1. 安裝完成後，通過瀏覽器的 Tampermonkey 或 Violentmonkey 選單訪問腳本選單。
2. 選擇 **選擇語言** 從清單中挑選您偏好的 Google 搜尋語言。
3. 使用 **切換自動應用語言** 啟用或禁用自動語言應用。
4. 若啟用自動應用，腳本會將您選擇的語言（例如 `lr=lang_zh-TW`）附加到 Google 搜尋網址。
5. 頁面將重新載入更新後的網址，確保 Google 搜尋結果反映您的語言偏好。

## 支援語言

此腳本包含以下語言的在地化選單提示和訊息：
- 🇹🇼 繁體中文
- 🇺🇸 English
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇫🇷 Français
- 🇪🇸 Español
- 🇩🇪 Deutsch
- 🇺🇦 українська мова
- 🇮🇹 Italiano
- 🇵🇹 Português
- 🇸🇦 العربية
- 🇹🇭 ไทย
- 🇮🇳 हिन्दी
- 🇳🇱 Nederlands

您可以通過編輯 `LanguageManager` 類中的 `_languages` 物件來修改或擴展語言選項。

## License

MPL2.0 License

english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/GoogleSearchRsltLangLoc/README.zh-Hant.md)
# Google Search Result Language Localization

Tired of manually setting the language for Google Search results? This user script allows you to define a preferred language for Google Search by automatically appending the `lr=` parameter to URLs, ensuring search results are tailored to your language preference. It also provides a menu to select from multiple languages and toggle automatic language application.

## Features

* **Sets the default language for Google Search** by appending the preferred `lr=<lang>` parameter to search URLs.
* Adds a menu command to select your preferred language from a list of supported options.
* Automatically updates Google Search Result with your selected language if enabled.
* Removes outdated language parameters when switching languages to updates Google Search Result.
* Multi-language menu support (繁體中文, українська мова, English, 日本語, 한국어, Français, Español, Deutsch, and more).

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) browser extension.
2. Install the [Google Search Result Language Localization](https://greasyfork.org/zh-TW/scripts/XXXXXX-language-manager) user script.
3. Visit [Google Search](https://www.google.com) and use the script’s menu commands to configure your language settings!

## Usage

1. After installation, access the script’s menu via your browser’s Tampermonkey/Violentmonkey menu.
2. Select **選擇語言** to pick your preferred language for Google Search from the list.
3. Enable or disable automatic language application with **切換自動應用語言**.
4. If automatic application is enabled, the script appends your selected language (e.g., `lr=lang_zh-TW`) to Google Search URLs.
5. The page will reload with the updated URL, ensuring Google Search results reflect your language preference.

## Supported Languages

This script includes localized menu prompts and messages for:
- 🇺🇸 English
- 🇹🇼 繁體中文
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

You can modify or extend the language options by editing the `_languages` object in the `LanguageManager` class.

## License

MPL2.0 License

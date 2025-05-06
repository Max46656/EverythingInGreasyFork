english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/CleanYouTubeShortURLSharer/README.zh-Hant.md)
# YouTube Short Clean Share Button

Do you find YouTube's share URLs unnecessarily long or bloated with tracking parameters like `si=`? This user script replaces the default share button with a custom one that generates a clean, short `youtu.be` URL and copies it to your clipboard instantly — no `si=` parameter, no clutter.

## Featrues

* Replaces YouTube’s native share button with a neat one.
* Generates a clean `https://youtu.be/` short URL with only the video ID.
* Automatically copies the short URL to your clipboard when clicked.
* Displays an in-page notification to confirm the link has been copied.
* Multi-language notification support (English, 中文, 日本語, Español, Deutsch).

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) browser extension.
2. Install the [YouTube Short Clean Share Button](https://greasyfork.org/zh-TW/scripts/535128-youtube-%E4%B9%BE%E6%B7%A8%E7%9F%AD%E7%B6%B2%E5%9D%80%E5%88%86%E4%BA%AB%E5%99%A8) user script.
3. Open a YouTube video page and try the new share button!

## Usage

1. Go to any YouTube video page (`https://www.youtube.com/watch?v=...`).
2. When the page is fully loaded, the original share button will be replaced automatically.
3. Click the new share button.
4. A short link like `https://youtu.be/73_TiCJ-Wtc` will be copied to your clipboard  
   (without tracking codes or unnecessary junk!).
6. A brief on-screen message will confirm the copy was successful.

## Supported Languages

This script includes localized notification messages for:
- 🇺🇸 English
- 🇹🇼 中文（繁體）
- 🇯🇵 日本語
- 🇪🇸 Español
- 🇩🇪 Deutsch

You can freely modify or extend localization through the `LocalizationManager` class in the source code.

Other configurable settings include the `notificationDuration` in the `YouTubeShortUrlCopier` class, which controls how long the confirmation message stays visible.

## License

MPL2.0 License

---

Want to contribute? Submit issues or pull requests at:  
[GitHub Repo](https://github.com/Max46656/EverythingInGreasyFork/tree/main/YouTubeShortCleanShare)

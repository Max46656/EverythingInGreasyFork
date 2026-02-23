english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/%E6%96%87%E6%9C%AC%E8%BD%89%E9%80%A3%E7%B5%90/README.zh-Hant.md)

# Text Linkify

## Description

On many websites, URLs in user-generated content are often displayed as plain text because they weren't formatted by the creator or the site lacks Markdown support. These non-clickable links are not only a minor inconvenience to open but are also easily overlooked.
Existing scripts and browser extensions often suffer from a lack of customization or high performance overhead.

### Features

This script automatically identifies URLs within the **plain text content** of a webpage and converts them into clickable `<a>` links.

* Automatically detects URLs starting with `http/https` and `www.`.
* Links open in a **new background tab** (keeping your current page active).
* Supports a **domain blacklist** for the current page (providing a simple way to resolve conflicts on specific sites).
* Supports **per-domain custom scan ranges** (e.g., limit processing only to `.post-body`).
* Supports **per-domain custom link styles** (default is underlined).
* Quick menu toggle to "Add/Remove current domain from blacklist."
* Multi-language menu and prompts (currently supports English, Chinese, Japanese, Spanish, German, Hindi, Czech, Lithuanian, etc.).
* Compatible with Violentmonkey / Tampermonkey on Chrome and Firefox.

### Installation

1. Install [Violentmonkey](https://violentmonkey.github.io) (supports Firefox, Chrome, Vivaldi, etc.).
2. Install [Text Linkify](https://www.google.com/search?q=https://greasyfork.org/scripts/567224-%25E6%2596%2587%25E6%259C%25AC%25E8%25BD%2589%25E9%2580%25A3%25E7%25B5%2590)
3. Done!

### Usage

* **Basic Use**: No configuration is needed after installation; URLs will be converted automatically on most forums and comment sections.
* **Quickly Disable on a Site**: Click the script icon → Menu → "Add [可疑連結已刪除] to Blacklist" → Reload the page. The script will now be disabled on that site.

### Settings & Options

| Menu Item | Description | Default Value |
| --- | --- | --- |
| Add/Remove [可疑連結已刪除] from Blacklist | Toggle the script on or off for the current site with one click. | — |
| Set Scan Range for this Domain | Enter a CSS selector to restrict link conversion to specific areas. | Entire Page |
| Set Link Style for this Domain | Customize the CSS for `.auto-text-link` (color, underline, etc.). | Blue underline |

### Notes

* Extremely long single text nodes (hundreds of thousands of characters) may still impact performance.
* The blacklist supports subdomain matching (entering `example.com` will also block `www.example.com` and `sub.example.com`).

---

Would you like me to help you draft the `contributing.md` file or perhaps a technical explanation of how the regex handles different URL formats?

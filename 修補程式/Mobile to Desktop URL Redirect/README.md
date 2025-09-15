english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E4%BF%AE%E8%A3%9C%E7%A8%8B%E5%BC%8F/Mobile%20to%20Desktop%20URL%20Redirect/README.zh-Hant.md)

# Mobile to Desktop URL Redirect

Automatically redirects mobile webpages to their desktop versions if available.

## Features

This user script is designed to automatically redirect mobile webpages to their corresponding desktop URLs, enhancing the browsing experience on desktop devices. Key features include:

- **Automatic Redirect**: Detects mobile URLs (e.g., `m.example.com` or `example.com/mobile`) and prioritizes using the canonical URL or user-defined rules to redirect to the desktop version.
- **Blacklist Management**: Allows users to add specific domains to a blacklist to prevent redirection.
- **Custom Rules**: Supports adding custom string replacement rules for specific websites to handle complex URL transformations.

## Installation

1. Install a browser extension:
   - Firefox: Install [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/).
   - Chrome/Edge: Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
2. Install the script:
   - Download the script from the [Mobile to Desktop URL Redirect](https://greasyfork.org/en/scripts/548125-mobile-to-desktop-url-redirect) page on Greasy Fork.

## Usage

1. **Automatic Operation**:
   - When visiting a mobile webpage (e.g., `zh.m.wikipedia.org`), the script automatically attempts to redirect to the desktop version (e.g., `zh.wikipedia.org`).
   - It prioritizes checking the `<link rel="canonical">` tag, falling back to custom rules or built-in pattern matching if invalid.

2. **Menu Commands**:
   - Right-click the Greasemonkey/Tampermonkey icon in your browser to access the script's menu:
     - **Add to Blacklist**: Adds the current domain to the blacklist to prevent redirection.
     - **Remove from Blacklist**: Removes the specified domain from the blacklist.
     - **View Blacklist**: Displays all blacklisted domains.
     - **Add Custom Rule**: Prompts for a match string and replacement string for the current domain.
     - **Update Custom Rule**: Updates an existing rule’s match or replacement string.
     - **Remove Custom Rule**: Deletes the custom rule for the specified domain.
     - **View Custom Rules**: Shows details of all custom rules.

3. **Custom Rule Example**:
   - Website: `m.gamer.com.tw`
   - Match String: `m.gamer.com.tw/forum/`
   - Replacement String: `forum.gamer.com.tw/`
   - Effect: Redirects `https://m.gamer.com.tw/forum/B.php?bsn=73317` to `https://forum.gamer.com.tw/B.php?bsn=73317`.

## Issue Reporting

If you encounter issues, please submit them on [GitHub Issues](https://github.com/Max46656/EverythingInGreasyFork/issues) with the following details:
- Title must include the name of the user script.
- Description of the issue.
- Example URL.
- Console logs (F12 > Console).
- Expected behavior vs. actual behavior.

## Acknowledgments

- Icon source: [Smashicons](https://www.flaticon.com/authors/smashicons)

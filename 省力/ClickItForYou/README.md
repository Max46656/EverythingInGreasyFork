english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/ClickItForYou/README.zh-Hant.md)
# click it for you
Automatically clicks buttons you don’t want to click yourself.

## Features
* Provides a floating menu to add, edit, and delete rules.
* Rules can be customized with URLs (accepts regular expressions) to distinguish between general domains, specific pages, or even across domains.
* Supports CSS and XPath selectors.
* Customizable delay for retrying element searches (in milliseconds), ensuring compatibility with dynamically loaded pages, even with long wait times.
* Specify which matching element to click (defaults to the 1st).
* The menu displays all rules matching the current URL, with rules collapsible/expandable to view details.
* A scrollbar automatically appears when there are many rules.
* Supports custom rule names.

## Installation
1. Install [Violentmonkey](https://violentmonkey.github.io) (supports Firefox, Chrome, Vivaldi, and other browsers).
2. Install [click it for you](https://greasyfork.org/en/scripts/539191-click-it-for-you) (will automatically load into Violentmonkey).
3. Done.

## Usage
1. Open any webpage where you want to set up automatic clicking.
2. Click the Violentmonkey icon in your browser and select 「Auto Click Configuration」 to open the menu.
3. In the menu:
   - **Add Rule**: Enter a rule name, URL regular expression, selector type (CSS or XPath), selector, element position (starting from 1), and click delay (in milliseconds), then click 「Add Rule.」
   - **View Rules**: Only rules matching the current URL are shown. Click a rule name to expand/collapse details, revealing the full configuration.
   - **Update Rules**: Expand a rule, modify any fields as needed, and click 「Save」 to update the rule.
   - **Delete Rules**: Expand a rule and click 「Delete」 to remove it.
4. The script will automatically click the specified element on URLs matching the regular expression.
5. Close the menu by clicking the 「✕」 button.

## Notes
* Ensure the URL regular expression is correct.
* The selector must precisely match the target element; it’s recommended to use browser developer tools to verify CSS or XPath selectors.

## Multi-Language Support
* Traditional Chinese (zh-TW): 為你自動點擊 - 在符合正則表達式的網址上自動點擊指定的元素。
* English (en): click it for you - Automatically clicks specified elements on URLs matching a regular expression.
* Japanese (ja): あなたのためにクリック - 正規表現に一致するURLで指定された要素を自動的にクリックします。
* German (de): Für dich klicken - Klickt automatisch auf angegebene Elemente auf URLs, die mit einem regulären Ausdruck übereinstimmen.
* Spanish (es): Clic automático para ti - Hace clic automáticamente en elementos especificados en URLs que coinciden con una expresión regular。

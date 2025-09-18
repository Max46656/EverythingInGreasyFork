english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/Freely%20Set%20Shortcuts/README.zh-Hant.md)
# Freely Set Shortcuts

Do you often click a button or link while browsing a webpage that isn't on the navigation bar?  
Or do you need to click through multiple layers of the navigation bar to reach the desired button?  
Or do you want to avoid minimizing a full-screen video or other multimedia element to click another button?

## Overview
This user script allows users to define shortcuts with single or double modifier keys to click specific elements on webpages matching specified URL patterns.

## Features
- **Custom Shortcuts**: Supports single or double modifier keys (e.g., `CapsLock+A`, `Control+Alt+B`) for custom shortcuts to trigger clicks on webpage elements.
- **URL Patterns**: Uses regular expressions to match URLs.
- **Element Selectors**: Supports CSS selectors (e.g., `button.submit`) or XPath (e.g., `//button[@class="submit"]`) for element selection.
- **Element Index**: Selects elements by position, supporting reverse selection (e.g., `1` for the first matching element, `-1` for the last).
- **Conflict Detection**: Checks and displays conflicts for shortcuts or target elements (including shortcut combinations and selector + index).
- **Link Navigation**: When clicking `<a>` elements with valid `href`, choose to open the link or click the element (based on the website’s usage of `<a>` elements).
- **Multilingual Support**: Interface supports 正體中文 (`zh-TW`), English (`en`), 日本語 (`ja`), Deutsch (`de`), and Español (`es`).
- **Rule Management**: Add, update, delete, or enable/disable rules via the menu.
- **Rule Validation and Conversion**: Only allows and displays characters and function keys usable by keyboards in each language as shortcuts.

## Installation
1. **Install a User Script Manager**: Install a user script manager on your browser (Chrome, Firefox, Edge, etc.), such as [Violentmonkey](https://violentmonkey.github.io).
2. **Install the Script**: Install this script from [GreasyFork](https://greasyfork.org/en/scripts/542829-freely-set-shortcuts).
3. **Verify Installation**: After installation, you will see two menu options in the browser’s user script menu: 「Add Shortcut Rule」 and 「Manage Shortcut Rules.」

## Usage

### Adding a Rule
1. Open the user script menu in your browser and select **Add Shortcut Rule**.
2. Fill in the required fields:
   - **Rule Name**: Name the rule (e.g., `Click Submit Button`).
   - **URL Regular Expression**: Regular expression to match URLs (e.g., `https://example.com/.*`).
   - **Selector Type**: Choose `CSS` or `XPath`.
   - **Selector**: Write the element selector (e.g., [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors) `button.submit` or [XPath](https://developer.mozilla.org/en-US/docs/Web/XML/XPath) `//button[@class="submit"]`).
   - **Element Index**: Position of the element (e.g., `1` for the first, `-1` for the last).
   - **Shortcut Modifier Key Combination**: Select one or two modifier keys (e.g., `Control`, `CapsLock+Alt`).
   - **Shortcut Main Key**: Enter a single letter or number (e.g., `A`, `F1`).
   - **Open Link if `<a>` Element**: Check to open the link when clicking an `<a>` element; leave unchecked to click the element (based on the website’s usage of `<a>` elements).
   - **Enable Rule**: Keep checked.
   - Click **Add Rule** to save. If a conflict is detected, a conflict message will appear in the console.

### Managing Rules
1. From the user script menu, select **Manage Shortcut Rules**.
2. Only rules with regular expressions matching the current URL will be displayed.
3. Click a rule name to view details (conflicts with other displayed rules will be shown in the last column).
4. Edit fields (e.g., change the shortcut or selector) and click **Save**.
5. Uncheck **Enable Rule** to temporarily disable the rule (prefer this over **Delete** unless you are certain the rule is no longer needed).

## Usage Examples
Adding a Rule ⮄  
Editing a Rule ⮆ (and displaying rule conflicts)  
<img width="334" height="596" alt="image" src="https://github.com/user-attachments/assets/bd5b51fd-5872-461b-b77e-c71cf78e400d" /><img width="390" height="552" alt="image" src="https://github.com/user-attachments/assets/1c5883c5-4741-4858-b0de-807a836936be" />

### Console Messages
- All console messages start with the user script name (in the browser’s language) and display errors, warnings, and success logs in Traditional Chinese (`zh-TW`).
- Example Warning: `Freely Set Shortcuts: The regular expression for rule "Click Submit" is invalid: https://example.com/.*`
- Example Conflict: `Freely Set Shortcuts: New rule "Click Submit" detected duplicate shortcut combination: Conflicts with rule "Another Rule" (shortcut: Control+B, selector: button.submit, element index: 1)`

## License
- This project is licensed under the Mozilla Public License 2.0.

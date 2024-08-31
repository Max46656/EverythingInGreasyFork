english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/InputPageTurnerForWebsite/README.zh-Hant.md)

# Key and Mouse Wheel Page Turner

Is it frustrating to constantly search for small buttons to quickly jump to the next or previous page while browsing a website? With this script, you can reliably switch pages using the mouse wheel or keyboard buttons. Currently, it supports some websites like Pixiv, and if the script doesn’t support the website you want, you can easily set it up using the menu functions.

## Features

* Navigate to the previous and next pages by scrolling to the top and bottom of the page with the mouse wheel.
* Navigate to the previous and next pages using keyboard keys.
* Toggle the trigger method between keys and the mouse wheel in the menu.
* Customize the trigger keys in the menu.
* Add support for different websites through the menu.

## Installation

1. Install the [Violentmonkey](https://violentmonkey.github.io) or [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Install the [Key and Mouse Wheel Page Turner](https://greasyfork.org/zh-TW/scripts/494851-%E6%8C%89%E9%8D%B5%E8%88%87%E6%BB%91%E9%BC%A0%E6%BB%BE%E8%BC%AA%E7%BF%BB%E9%A0%81%E5%99%A8) (which will be loaded into the user script manager you installed above).
3. Done.

## Usage

1. Click on the Tampermonkey menu and find this script.
2. Select the functions you need, such as "Customize Modifier Key," "Toggle Page Mode," and so on, and follow the instructions to operate.
3. Press the modifier key along with the trigger key simultaneously to turn pages in the webpage.

## How to Add Support for a Domain

1. Open the website you want to add support for, then open the developer tools.
2. Select the developer console and copy the domain name returned in the console.
3. Click the inspect icon at the top left of the developer tools window.
4. Click on the previous and next page buttons on the website, then find the class or id attribute within the `<a>` tag (or `<button>`, `<svg>`) in the elements panel of the developer tools and copy it.
5. Open the search function and paste the attribute you just got. Adjust the selector you choose to ensure the first value of the selector is "Previous Page," or the last value is "Next Page."
6. Click "Modify Page Up/Down Button Selectors" in the menu and fill in the domain (default to the page domain) and the element selectors for the previous and next page buttons. Remember to add a dot (.) before the class name (or a # if it’s an id) to indicate it.
7. Remember to save the file and refresh the website you want to apply it to.

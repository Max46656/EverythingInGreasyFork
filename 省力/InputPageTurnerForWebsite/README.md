# InputPageTurnerForTampermonkey

When browsing web pages,
is it bothersome to constantly looking for tiny buttons to quickly jump to the next or previous page?
Use this script to reliably switch pages with your mouse scroll wheel or keyboard buttons.
Currently supports some websites like Pivix,
if the script doesn't support the website you want,
you can easily set it up yourself based on the domain or DM me.

## Features

* Navigate to the previous and next pages by scrolling to the top and bottom of the page with the mouse wheel.
* Navigate to the previous and next pages by pressing keys.
* Toggle between key and mouse wheel triggers in the menu.
* Customize trigger keys in the menu.
* Expand support for websites.

## Installation

1. Install Tampermonkey (Firefox, Chrome, Vivaldi)
2. Install [Keyboard and Mouse Wheel Page Turner](https://greasyfork.org/zh-TW/scripts/494851-%E6%8C%89%E9%8D%B5%E8%88%87%E6%BB%91%E9%BC%A0%E6%BB%BE%E8%BC%AA%E7%BF%BB%E9%A0%81%E5%99%A8) (will load in userscript manager installed above)
3. Done

## Usage

1. Click on the Tampermonkey menu and locate this script.
2. Choose the function you need, such as "Toggle Page Navigation Mode" or "Customize Keys" and follow the instructions.

## How to Add Support for Domains

1. Open the website you want to add support for, then open DevTools.
2. Select the Developer Console, copy the domain name returned in the console.
3. Click on the Inspect Icon at the top left of the DevTools window.
4. Click on the previous and next page buttons on the website,
then find the class attribute within the <a> tag in the DevTools Elements panel and copy it.
5. Click on the Tampermonkey menu, right-click on this script to open the IDE.
6. Find function name getPageButtonsByDomain(), follow the format of other websites,
and sequentially fill in the domain and the class of the previous and next page buttons.
Remember to add "." before the class name to represent it.
7. Remember to save the file and refresh the website you want to apply it to.

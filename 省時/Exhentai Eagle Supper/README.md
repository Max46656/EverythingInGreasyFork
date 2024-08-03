english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E6%99%82/Exhentai%20Eagle%20Supper/README.zh-Hant.md)

# Exhentai Eagle Support
This script can automatically open original images from Exhentai/E-Hentai and add them to Eagle without manual operation. It supports gallery pages and image pages of Exhentai and E-Hentai.

## Features
* Adds a button on gallery pages to enable/disable the automatic function.
* Automatically opens the original image page and saves the image information.
* Automatically adds the original image to the Eagle image management software.
* Includes a function to clean up old data.

## Installation
1. Install the [Violentmonkey](https://violentmonkey.github.io) or [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Load [Exhentai Eagle Support](https://greasyfork.org/zh-TW/scripts/501634/熊貓-eagle-支援) into the above user script manager.
3. Done.

## Usage
1. Open a gallery page on Exhentai or E-Hentai (URL format: `https://exhentai.org/g/*` or `https://e-hentai.org/g/*`).
2. The script will add a button on the gallery page displaying "AutoEagle: On" or "AutoEagle: Off". Click the button to enable or disable the automatic function.
3. Open an image page on Exhentai or E-Hentai (URL format: `https://exhentai.org/s/*` or `https://e-hentai.org/s/*`).
4. The script will automatically open the original image page and save the image information.
5. When the original image page is opened, the script will automatically add the image to Eagle and close the page upon success.

## Clean Up Old Data (if you are using Tampermonkey)
1. Open any supported page in your browser (either an image page with AutoEagle off or a gallery page with the AutoEagle on/off button).
2. In the script menu, select "Clean Old Data" to clean up old data.

## Notes
* The script is set to automatic mode by default. If you need to change it, you can do so through the button on the gallery page.
* Ensure that the Eagle image management software is running and that the API service is enabled (default address: `http://localhost:41595`).

## License
This script is licensed under the [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

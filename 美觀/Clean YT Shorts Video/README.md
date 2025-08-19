english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E7%BE%8E%E8%A7%80/Clean%20YT%20Shorts%20Video/README.zh-Hant.md)

# Clean YouTube Shorts Video

Adjust the opacity of video titles, creator info, and other elements in YouTube Shorts to be transparent by default, becoming visible when hovered over.

## Features
Uses a class-based approach to manage opacity settings for a clean and maintainable implementation.
* Sets default opacity to 0 for minimal visual distraction.
* Increases opacity to 0.8 on hover for better visibility.
* Dynamically applies styles to handle YouTube's dynamic loading mechanism.
* Smooth transition effect for opacity changes.
* Fool-proof design to ensure compatibility with YouTube Shorts pages.

## Installation
1. Install [Violentmonkey](https://github.com/violentmonkey/violentmonkey) (Firefox, Chrome, Vivaldi)
2. Install [Clean YouTube Shorts Video](https://greasyfork.org/zh-TW/scripts/546321-%E4%B9%BE%E6%B7%A8%E7%9A%84youtube-shorts%E5%BD%B1%E7%89%87) (will load in userscript manager installed above)
3. Done

## Usage
1. Ensure Tampermonkey is enabled and the script is installed.
2. Navigate to any YouTube Shorts page (e.g., https://www.youtube.com/shorts).
3. The script automatically applies opacity changes to creator info and other metadata.
4. Hover over the metadata area to make it visible.

## Notes
* To adjust opacity levels, modify the `defaultOpacity` and `hoverOpacity` variables in the script.

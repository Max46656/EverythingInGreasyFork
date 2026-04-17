english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/tree/main/省時/Is%20CapsLock%20On%20Or%20What/README.zh-Hant.md)

# Caps Lock Sound Indicator

## Description

This userscript plays different sound alerts when you press the **Caps Lock** key, depending on whether it is turned on or off. It also displays a clean, floating Unicode indicator (🔠 / 🔡) that can be freely dragged to any position on the screen.

No more guessing whether Caps Lock is enabled — you’ll both **hear** and **see** the status instantly.

### Features

* Plays distinct sounds for Caps Lock **On** (higher tone) and **Off** (lower tone)
* Clean floating indicator showing only Unicode symbols:  
  **🔠** = Caps Lock ON  **🔡** = Caps Lock OFF
* Fully draggable indicator (can be placed anywhere on screen)
* Single menu command to quickly set indicator position via popup
* Adjustable volume and sound duration
* Toggle sound and indicator visibility via menu
* Works on all websites (no blacklist needed)
* Compatible with Violentmonkey / Tampermonkey on Chrome and Firefox

### Installation

1. Install [Violentmonkey](https://violentmonkey.github.io) (supports Chrome, Firefox, Vivaldi, etc.)
2. Click [here](https://greasyfork.org/scripts/XXXXXX) to install **Caps Lock Sound Indicator** (replace with actual GreasyFork link after upload)
3. Done!

### Usage

* Press **Caps Lock** — you will hear a different tone and see the indicator change.
* Drag the floating symbol to any corner or position you prefer.
* Double-click the symbol to hide/show it.
* Use the script menu (click the Violentmonkey icon) for more settings.

### Settings & Options

| Menu Item                        | Description                                      | Default |
|----------------------------------|--------------------------------------------------|---------|
| ✓ Enable Caps Lock Sound         | Enable/disable sound alerts                      | Enabled |
| ✓ Show Status Indicator          | Show/hide the floating indicator                 | Enabled |
| Set Indicator Position (Popup)   | Choose preset position or enter custom x,y       | —       |
| Adjust Volume (xx%)              | Adjust sound volume (0.1 ~ 1.0)                  | 0.6     |
| Adjust Sound Duration (xxx ms)   | Adjust sound duration                            | 120ms   |
| Reset Position to Top-Left       | Reset indicator to top-left corner               | —       |

### Notes

* The indicator is completely borderless and background-free (pure Unicode floating text) as per your request.
* Sound is generated using Web Audio API — no external files needed.
* Position, volume, and visibility settings are automatically saved.
* Works immediately after installation on all pages.

English  |  [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/YouTube%20Shorts%20%E8%87%AA%E5%8B%95%E6%92%AD%E6%94%BE%E4%B8%8B%E4%B8%80%E5%80%8B%E5%BD%B1%E7%89%87/README.zh-Hant.md)

# YouTube Shorts Auto Play Next

## Description

YouTube Shorts doesn't automatically move to the next video when one ends — you have to manually swipe or tap the "next" button every single time.  
This seriously interrupts my perfect couch potato experience.

This userscript fixes it by detecting when a Short finishes (via progress bar reset) and automatically simulates clicking the "next video" button.  
It also adds a simple toggle switch (Auto / Loop) right in the Shorts toolbar, so you can turn auto-play on or off whenever you want.

### Features

- Automatically plays the next Short when the current one ends
- Adds an **Auto / Loop** toggle button in the Shorts toolbar
- Built-in debounce protection to avoid accidental double-skips during manual switches
- Compatible with Violentmonkey / Tampermonkey (Chrome, Firefox, etc.)
- Cleans up all listeners and DOM changes when leaving the page (no memory leaks)
- Multi-language menu labels and tooltips

### Installation

1. Install [Violentmonkey](https://violentmonkey.github.io) or Tampermonkey browser extension
2. Click the direct install link below:  
   [Install YouTube Shorts Auto Play Next](https://greasyfork.org/zh-TW/scripts/567467-youtubeshorts-%E8%87%AA%E5%8B%95%E6%92%AD%E6%94%BE%E4%B8%8B%E4%B8%80%E5%80%8B%E5%BD%B1%E7%89%87)
3. Done! The toggle button should appear in the Shorts toolbar

### Usage

- Open any YouTube Shorts page (`https://www.youtube.com/shorts/...`)
- Look for the **Auto / Loop** button in the toolbar (near the like/share buttons)
- **Auto**: Automatically play the next Short when the current one finishes
- **Loop**: Disable auto-advance (back to default YouTube Shorts behavior)
- Click the button to toggle instantly

### Notes

- If YouTube updates the interface (progress bar or next button selector changes), the script may stop working → check the browser console for warnings
- Only active on `youtube.com/shorts/*` pages; does not affect regular YouTube videos
- Won't interfere with your normal YouTube experience

---

Got issues, found a bug, or have a feature suggestion?  
Use the menu command "[Provide Feedback](https://github.com/Max46656/EverythingInGreasyFork/issues/new?template=bug_report.yml&labels=bug,userscript&title=[YouTubeShorts%E8%87%AA%E5%8B%95%E6%92%AD%E6%94%BE%E4%B8%8B%E4%B8%80%E5%80%8B%E5%BD%B1%E7%89%87]Bug%20Report)" or open an [issue](https://github.com/Max46656/EverythingInGreasyFork/issues)  

[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/YouTube%20Shorts%20%E8%87%AA%E5%8B%95%E6%92%AD%E6%94%BE%E4%B8%8B%E4%B8%80%E5%80%8B%E5%BD%B1%E7%89%87/README.md) | 繁體中文

# YouTube Shorts 自動播放下一個影片

## 說明

YouTube Shorts 預設不會在影片播完後自動切換到下一支，使用者必須手動滑動或點擊「下一部」按鈕。打斷了我的沙發馬鈴薯體驗。

本腳本透過偵測進度條重置，自動模擬點擊「下一部」按鈕，並在工具列加入一個切換開關（Auto / Loop），讓你自由決定是否啟用自動播放。

### 功能

- 當目前 Shorts 播完時自動播放下一支
- 在 Shorts 工具列注入 Auto / Loop 切換按鈕
- 內建防誤觸機制（避免手動切換後立刻自動再切）
- 支援 Violentmonkey / Tampermonkey（Chrome、Firefox 等）
- 離開頁面時自動清理資源（無記憶體洩漏）
- 多語言選單與提示文字

### 安裝方式

1. 安裝 [Violentmonkey](https://violentmonkey.github.io) 或 Tampermonkey 瀏覽器擴充功能
2. 點擊以下連結直接安裝：  
   [安裝 YouTube Shorts 自動播放下一個影片](https://github.com/Max46656/EverythingInGreasyFork/raw/main/%E7%9C%81%E5%8A%9B/YouTube%20Shorts%20%E8%87%AA%E5%8B%95%E6%92%AD%E6%94%BE%E4%B8%8B%E4%B8%80%E5%80%8B%E5%BD%B1%E7%89%87/YouTubeShorts%20Auto%20Play%20Next.user.js)
3. 安裝完成！切換按鈕應出現在 Shorts 工具列

### 使用方法

- 進入任意 YouTube Shorts 頁面（`https://www.youtube.com/shorts/...`）
- 在工具列（讚好、分享按鈕附近）找到 **Auto / Loop** 按鈕
- **Auto**：播完自動播放下一支
- **Loop**：停用自動切換（恢復 YouTube 預設行為）
- 點擊按鈕即可即時切換模式

### 注意事項

- 若 YouTube 更新介面（進度條或下一部按鈕選擇器改變），腳本可能失效 → 請查看 Console 警告
- 僅在 `youtube.com/shorts/*` 頁面生效，不影響一般影片
- 不會干擾正常 YouTube 使用體驗

---

有問題、發現 Bug 或想建議新功能？
使用選單功能中的「[提供回饋](https://github.com/Max46656/EverythingInGreasyFork/issues/new?template=bug_report.yml&labels=bug,userscript&title=[YouTubeShorts自動播放下一個影片]Bug回報)」或是開[issue](https://github.com/Max46656/EverythingInGreasyFork/issues)

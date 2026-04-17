[![Static Badge](https://img.shields.io/badge/lang-en-red)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E6%99%82/Is%20CapsLock%20On%20Or%20What/README.md) | 中文

# 現在是大寫嗎

## 問題描述

很多人按下 Caps Lock 後常常忘記目前是開啟還是關閉狀態，導致輸入錯誤。這個腳本透過**不同提示音** + **純文字浮動指示器**，讓你同時用**聽覺**與**視覺**立刻知道 Caps Lock 狀態。

### 功能說明

- 按下 Caps Lock 時，根據開/關狀態發出**不同音調**的提示音
- 畫面上顯示純 Unicode 浮動指示器：
  - **🔠** 表示 Caps Lock 已開啟
  - **🔡** 表示 Caps Lock 已關閉
- 指示器完全無背景、無邊框（純文字浮動），可自由拖曳到畫面任意位置
- 雙擊指示器可快速隱藏/顯示
- 透過選單可快速設定位置、調整音量與持續時間
- 相容 Violentmonkey / Tampermonkey、Chrome / Firefox

### 安裝步驟

1. 安裝 [Violentmonkey](https://violentmonkey.github.io)（支援 Chrome、Firefox 等瀏覽器）
2. 安裝 [Caps Lock Sound Indicator](https://greasyfork.org/zh-TW/scripts/574275-%E7%8F%BE%E5%9C%A8%E6%98%AF%E5%A4%A7%E5%AF%AB%E5%97%8E)
3. 完成

### 使用方法

- 按下 **Caps Lock** 鍵即可聽到提示音並看到指示器變化
- 拖曳浮動符號到你喜歡的位置
- 雙擊符號可隱藏或顯示
- 點選 Violentmonkey 圖示開啟選單進行進階設定

### 設定選項

| 選單項目                        | 功能說明                                      | 預設值   |
|--------------------------------|-----------------------------------------------|----------|
| ✓ 啟用 Caps Lock 提示音         | 開啟/關閉提示音                                | 已啟用   |
| ✓ 顯示狀態指示器                | 顯示/隱藏浮動指示器                             | 已顯示   |
| 設定指示器位置 (跳出視窗)        | 選擇預設位置或輸入自訂座標 (x,y)                | —        |
| 調整音量 (xx%)                  | 調整提示音音量 (0.1 ~ 1.0)                     | 0.6      |
| 調整提示音長度 (xxx ms)         | 調整提示音持續時間                              | 120ms    |
| 重設位置為左上角                | 將指示器重設到左上角                            | —        |

### 注意事項

- 指示器採用純 Unicode 符號，無任何背景或邊框（已按你的要求調整為純文字浮動）
- 使用 Web Audio API 產生音效，無需額外檔案
- 所有設定（位置、音量、顯示狀態）都會自動儲存
- 安裝後立即在所有網頁生效

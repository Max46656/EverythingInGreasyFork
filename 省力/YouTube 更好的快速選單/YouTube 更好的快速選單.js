// ==UserScript==
// @name         YouTube 更好的快速選單
// @name:en      YouTube Better Quick Menu
// @name:ja      YouTube より良いクイックメニュー
// @description 當滑鼠指向迷你導覽列的「個人中心」時，彈出完整導覽列的「個人中心」
// @description:en When hovering over "You" in the mini-guide, show the full "You" section menu
// @description:ja ミニガイドの「マイページ」にマウスを合わせると、フルバージョンの「マイページ」セクションのメニューを表示します
//
// @author       Max
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues
// @license      MPL2.0
//
// @version 1.3.0
// @match https://www.youtube.com/*
// @grant GM_addStyle
// @run-at document-idle
// ==/UserScript==

/**
 * YouTube "You" Tab Hover Quick Menu
 * 功能：滑鼠移至側邊欄「本人 (You)」圖示時，自動彈出快速選單。
 */
class YouTubeYouHoverQuickMenu {
  constructor() {
    this.LOG_PREFIX = '[YT-QuickMenu]';
    this.menuDOM = null;
    this.anchorElement = null;
    this.anchorSelector = 'ytd-mini-guide-entry-renderer:has(> a[href="/feed/you"])';
    this.currentLang = this.#detectUserLanguage();
    this.i18n = this.#getLocaleStrings();
    this.menuItems = [
      { key: 'watchHistory', href: '/feed/history' },
      { key: 'playlists', href: '/feed/playlists' },
      { key: 'watchLater', href: '/playlist?list=WL' },
      { key: 'likedVideos', href: '/playlist?list=LL' },
      { key: 'yourVideos', href: '/channel_switcher' },
      { key: 'downloads', href: '/feed/downloads' },
      { key: 'podcasts', href: '/feed/podcasts' },
      { key: 'courses', href: '/feed/courses' },
    ];
    this.mouseSafeZone = null;
    this.init();
  }

  /**
   * 偵測使用者目前瀏覽器語言已處理本地化，預設語言為英文
   * @returns {string} 'zh-TW' | 'ja' | 'en'
   * @private
   */
  #detectUserLanguage() {
    const lang = (navigator.language || 'en').toLowerCase();
    if (lang.startsWith('zh-tw') || lang.startsWith('zh-hk')) return 'zh-TW';
    if (lang.startsWith('ja')) return 'ja';
    return 'en';
  }

  /**
   * 取得目前語言對應的多語言文字表
   * @returns {Object} 包含 zh-TW、en、ja 三種語言的翻譯物件
   * @private
   */
  #getLocaleStrings() {
    return {
      'zh-TW': {
        watchHistory: '觀看記錄',
        playlists: '播放清單',
        watchLater: '稍後觀看',
        likedVideos: '喜歡的影片',
        yourVideos: '你的影片',
        downloads: '已下載的內容',
        podcasts: 'Podcast',
        courses: '課程',
      },
      'en': {
        watchHistory: 'Watch history',
        playlists: 'Playlists',
        watchLater: 'Watch later',
        likedVideos: 'Liked videos',
        yourVideos: 'Your videos',
        downloads: 'Downloads',
        podcasts: 'Podcasts',
        courses: 'Courses',
      },
      'ja': {
        watchHistory: '視聴履歴',
        playlists: '再生リスト',
        watchLater: '後で再生',
        likedVideos: '高評価した動画',
        yourVideos: 'あなたの動画',
        downloads: 'ダウンロード済みコンテンツ',
        podcasts: 'ポッドキャスト',
        courses: 'コース',
      }
    };
  }

  /**
   * 腳本初始化入口
   * 負責注入樣式並開始監聽錨點元素
   */
  init() {
    this.#injectGlobalStyles();
    this.#observeAndBindAnchor();
  }

  /**
   * 注入全域必要的 CSS 樣式
   * 使用 GM_addStyle 將選單與項目樣式注入頁面
   * @private
   */
  #injectGlobalStyles() {
    GM_addStyle(`
      #yt-quick-hover-menu {
        position: absolute;
        z-index: 3002;
        background: var(--yt-spec-base-background);
        border: 1px solid var(--yt-spec-10-percent-layer);
        border-radius: 12px;
        box-shadow: 0 16px 24px 2px rgba(0,0,0,0.14),
                    0 6px 30px 5px rgba(0,0,0,0.12),
                    0 8px 10px -7px rgba(0,0,0,0.2);
        min-width: 240px;
        padding: 8px 0;
        pointer-events: auto;
      }
      .quick-menu-item {
        display: flex;
        align-items: center;
        padding: 0 24px;
        height: 40px;
        color: var(--yt-spec-text-primary);
        font-size: 14px;
        text-decoration: none;
        transition: background 0.2s;
      }
      .quick-menu-item:hover {
        background: var(--yt-spec-menu-background);
      }
      .quick-menu-item svg {
        width: 24px;
        height: 24px;
        margin-right: 24px;
        fill: currentColor;
        flex-shrink: 0;
      }
    `);
  }

  /**
   * 持續觀察並等待錨點元素出現，出現後綁定事件
   * 使用 MutationObserver 監聽 DOM 變化，直到找到目標元素
   * @private
   */
  #observeAndBindAnchor() {
    const findAndBind = () => {
      this.anchorElement = document.querySelector(this.anchorSelector);
      if (this.anchorElement) {
        this.#setupEventListeners();
        console.log(`${this.LOG_PREFIX} Anchor bound successfully.`);
        return true;
      }
      return false;
    };
    if (findAndBind()) return;
    const observer = new MutationObserver(() => {
      if (findAndBind()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * 為錨點元素與文件綁定所有 hover 相關事件監聽器
   * 包含 mouseenter、mouseleave、mousemove 等事件處理
   * @private
   */
  #setupEventListeners() {
    let hideTimer = null;
    const onEnter = () => {
      clearTimeout(hideTimer);
      this.#renderMenu();
    };
    const startHideTimer = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => this.#destroyMenu(), 100);
    };
    this.anchorElement.addEventListener('mouseenter', onEnter);
    this.anchorElement.addEventListener('mouseleave', (e) => {
      if (this.menuDOM && this.menuDOM.contains(e.relatedTarget)) return;
      startHideTimer();
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.menuDOM) return;
      const isOverAnchor = this.anchorElement.contains(e.target);
      const isOverMenu = this.menuDOM.contains(e.target);
      const isWithinSafeZone = this.#checkPointInSafeZone(e.clientX, e.clientY);
      if (isOverAnchor || isOverMenu || isWithinSafeZone) {
        clearTimeout(hideTimer);
      } else {
        startHideTimer();
      }
    });
  }

  /**
   * 建立並顯示懸浮選單
   * 若選單已存在則不重複建立
   * @private
   */
  #renderMenu() {
    if (this.menuDOM) return;
    this.menuDOM = this.#createMenuElement();
    document.body.appendChild(this.menuDOM);
    this.#alignMenuPosition(2);
    this.#calculateSafeZone();
  }

  /**
   * 移除並銷毀目前顯示的選單元素
   * 同時清除安全區域快取
   * @private
   */
  #destroyMenu() {
    if (this.menuDOM) {
      this.menuDOM.remove();
      this.menuDOM = null;
    }
    this.mouseSafeZone = null;
  }

  /**
   * 對齊選單位置：讓選單的第 alignIndex 個項目與錨點按鈕垂直中心對齊
   * 並進行視窗邊界修正，避免選單跑到畫面外
   * @param {number} [alignIndex=2] - 要與錨點對齊的選單項目索引（從 0 開始）
   * @private
   */
  #alignMenuPosition(alignIndex = 2) {
    if (!this.menuDOM || !this.anchorElement) return;
    const anchorRect = this.anchorElement.getBoundingClientRect();
    const menuRect = this.menuDOM.getBoundingClientRect();
    const items = this.menuDOM.querySelectorAll('.quick-menu-item');
    if (items.length === 0) return;
    const itemHeight = items[0].offsetHeight;
    const targetItemCenterOffset = (alignIndex * itemHeight) + (itemHeight / 2);
    const anchorCenterY = anchorRect.top + (anchorRect.height / 2) + window.scrollY;
    let topPos = anchorCenterY - targetItemCenterOffset;
    // 視窗邊界修正
    const viewportH = window.innerHeight;
    const scrollY = window.scrollY;
    if (topPos < scrollY + 8) topPos = scrollY + 8;
    if (topPos + menuRect.height > scrollY + viewportH - 8) {
      topPos = scrollY + viewportH - menuRect.height - 8;
    }
    const leftPos = anchorRect.right + window.scrollX + 8;
    this.menuDOM.style.top = `${topPos}px`;
    this.menuDOM.style.left = `${leftPos}px`;
  }

  /**
   * 計算滑鼠安全三角區域（用於防止快速移動時選單閃爍）
   * 三角形頂點：錨點左上角 → 選單左上角 → 選單左下角
   * @private
   */
  #calculateSafeZone() {
    if (!this.anchorElement || !this.menuDOM) return;
    const aRect = this.anchorElement.getBoundingClientRect();
    const mRect = this.menuDOM.getBoundingClientRect();
    // 定義安全三角形：錨點左側中點 -> 選單左上 -> 選單左下
    this.mouseSafeZone = {
      p1: { x: aRect.left, y: aRect.top + aRect.height / 2 },
      p2: { x: mRect.left, y: mRect.top },
      p3: { x: mRect.left, y: mRect.bottom }
    };
  }

  /**
   * 判斷某個座標點是否位於安全三角區域內
   * 使用重心座標法（barycentric coordinate）計算
   * @param {number} x - 滑鼠的 clientX 座標
   * @param {number} y - 滑鼠的 clientY 座標
   * @returns {boolean} 是否在安全三角形內
   * @private
   */
  #checkPointInSafeZone(x, y) {
    if (!this.mouseSafeZone) return false;
    const { p1, p2, p3 } = this.mouseSafeZone;
    const getArea = (a, b, c) => Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
    const mainArea = getArea(p1, p2, p3);
    const area1 = getArea({ x, y }, p2, p3);
    const area2 = getArea(p1, { x, y }, p3);
    const area3 = getArea(p1, p2, { x, y });
    return Math.abs(mainArea - (area1 + area2 + area3)) < 1;
  }

  /**
   * 建立完整的選單 DOM 元素
   * 包含所有項目、圖示與多語言文字
   * @returns {HTMLElement} 選單容器元素
   * @private
   */
  #createMenuElement() {
    const container = document.createElement('div');
    container.id = 'yt-quick-hover-menu';
    this.menuItems.forEach(item => {
      const link = document.createElement('a');
      link.className = 'quick-menu-item';
      link.href = item.href;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', this.#getIconData(item.key));
      svg.appendChild(path);
      const label = document.createElement('span');
      label.textContent = this.i18n[this.currentLang][item.key];
      link.append(svg, label);
      container.appendChild(link);
    });
    return container;
  }

  /**
   * 根據項目 key 取得對應的 SVG path 資料
   * @param {string} key - 選單項目識別鍵
   * @returns {string} SVG path 字串
   * @private
   */
  #getIconData(key) {
    const paths = {
      watchHistory: 'M8.76 1.487a11 11 0 11-7.54 12.706 1 1 0 011.96-.4 9 9 0 0014.254 5.38A9 9 0 0016.79 4.38 9 9 0 004.518 7H7a1 1 0 010 2H1V3a1 1 0 012 0v2.678a11 11 0 015.76-4.192ZM12 6a1 1 0 00-1 1v5.58l.504.288 3.5 2a1 1 0 10.992-1.736L13 11.42V7a1 1 0 00-1-1Z',
      playlists: 'M16 15.395a.5.5 0 01.762-.426L22.5 18.5l-5.738 3.531a.5.5 0 01-.762-.425v-6.212ZM14 19H4a1 1 0 110-2h10v2Zm6-8a1 1 0 110 2H4a1 1 0 110-2h16Zm0-6a1 1 0 110 2H4a1 1 0 010-2h16Z',
      watchLater: 'M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm0 2a9 9 0 110 18.001A9 9 0 0112 3Zm0 3a1 1 0 00-1 1v5.565l.485.292 3.33 2a1 1 0 001.03-1.714L13 11.435V7a1 1 0 00-1-1Z',
      likedVideos: 'M9.221 1.795a1 1 0 011.109-.656l1.04.173a4 4 0 013.252 4.784L14 9h4.061a3.664 3.664 0 013.576 2.868A3.68 3.68 0 0121 14.85l.02.087A3.815 3.815 0 0120 18.5v.043l-.01.227a2.82 2.82 0 01-.135.663l-.106.282A3.754 3.754 0 0116.295 22h-3.606l-.392-.007a12.002 12.002 0 01-5.223-1.388l-.343-.189-.27-.154a2.005 2.005 0 00-.863-.26l-.13-.004H3.5a1.5 1.5 0 01-1.5-1.5V12.5A1.5 1.5 0 013.5 11h1.79l.157-.013a1 1 0 00.724-.512l.063-.145 2.987-8.535Z',
      yourVideos: 'M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2ZM3 19V5h18v14H3Zm13-7L9.5 8v8l6.5-4Z',
      downloads: 'M12 2a1 1 0 00-1 1v11.586l-4.293-4.293a1 1 0 10-1.414 1.414L12 18.414l6.707-6.707a1 1 0 10-1.414-1.414L13 14.586V3a1 1 0 00-1-1Zm7 18H5a1 1 0 000 2h14a1 1 0 000-2Z',
      podcasts: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37V7z',
      courses: 'M12 3L2 8l10 5 10-5-10-5zM5.41 9L12 12.36 18.59 9 12 5.64 5.41 9zM4 11.5v5.09l8 4 8-4V11.5l-8 4-8-4z'
    };
    return paths[key] || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z';
  }
}

const johnTheAppDrawer = new YouTubeYouHoverQuickMenu();

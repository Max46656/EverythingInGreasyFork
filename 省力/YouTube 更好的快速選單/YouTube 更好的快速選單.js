// ==UserScript==
// @name         YouTube 更好的快速選單
// @name:en      YouTube Better Quick Menu
// @name:ja      YouTube より良いクイックメニュー
// @name:hi      YouTube बेहतर त्वरित मेनू
// @name:cs      YouTube Lepší rychlá nabídka
// @name:lt      YouTube Geresnis greitasis meniu
// @name:de      YouTube Besserer Schnellmenü
// @name:es      YouTube Mejor Menú Rápido

// @description  在影片頁面中繼續使用側邊選單
// @description:en  Continue using the sidebar menu on the video watch page
// @description:ja  動畫ページでもサイドバーメニューを使い続けます
// @description:hi  वीडियो पेज पर साइडबार मेनू का उपयोग जारी रखें
// @description:cs  Pokračujte v používání bočního menu na stránce s videem
// @description:lt  Tęskite šoninio meniu naudojimą vaizdo įrašų puslapyje
// @description:de  Weiterhin das Seitenmenü auf der Videoseite nutzen
// @description:es  Continuar usando el menú lateral en la página de reproducción de vídeo
//
// @author       Max
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues
// @license      MPL2.0
//
// @version      2.0.0
// @match        https://www.youtube.com/*
// @grant        GM_addStyle
// @require      https://update.greasyfork.org/scripts/569411/1804849/SPA%20%E5%8B%95%E6%85%8B%E8%B7%AF%E7%94%B1%E7%9B%A3%E8%81%BD%E5%99%A8.js#1.2.0
// ==/UserScript==

const PREFIX = '[YouTube Mini Guide Float]';
const TRIGGER_WIDTH = 100;

class YTFloatMiniGuide {
    constructor() {
        this.guideEl = null;
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.isVisible = false;
        this.timeout = null;
        this.init();
    }

    init() {
        this.injectStyles();
        this.createSimplifiedGuide();
        this.setupListeners();
        console.log(`${PREFIX} v1.0.1 初始化完成`);
    }

    injectStyles() {
        GM_addStyle(`
      #yt-float-mini-guide {
        position: fixed !important;
        top: 60px !important;
        left: 0 !important;
        width: auto !important;
        height: calc(100vh - 60px) !important;
        background: var(--yt-spec-base-background, #0f0f0f) !important;
        border-right: 1px solid var(--yt-spec-10-percent-layer, #333) !important;
        z-index: 99999 !important;
        overflow-y: auto !important;
        scrollbar-width: none !important;
        opacity: 0;
        transform: translateX(-100%);
        transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-shadow: 2px 0 8px rgba(0,0,0,0.3) !important;
      }
      #yt-float-mini-guide.visible {
        opacity: 0.7 !important;
        transform: translateX(0) !important;
      }
      #yt-float-mini-guide .guide-item {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        padding: 12px 8px !important;
        color: var(--yt-spec-text-primary, #fff) !important;
        text-decoration: none !important;
        cursor: pointer !important;
      }
      #yt-float-mini-guide .guide-item:hover {
        background: var(--yt-spec-10-percent-layer, #272727) !important;
      }
      #yt-float-mini-guide svg {
        width: 24px !important;
        height: 24px !important;
        fill: currentColor !important;
      }
    `);
    }

    createSimplifiedGuide() {
        if (this.guideEl) return;

        this.guideEl = document.createElement('div');
        this.guideEl.id = 'yt-float-mini-guide';

        const items = [
            { href: '/', icon: 'm11.485 2.143-8 4.8-2 1.2a1 1 0 001.03 1.714L3 9.567V20a2 2 0 002 2h6v-7h2v7h6a2 2 0 002-2V9.567l.485.29a1 1 0 001.03-1.714l-2-1.2-8-4.8a1 1 0 00-1.03 0ZM5 8.366l7-4.2 7 4.2V20h-4v-5.5a1.5 1.5 0 00-1.5-1.5h-3A1.5 1.5 0 009 14.5V20H5V8.366Z', text: '首頁' },
            { href: '/shorts/', icon: 'm13.467 1.19-8 4.7a5 5 0 00-.255 8.46 5 5 0 005.32 8.462l8-4.7a5 5 0 00.258-8.462 5 5 0 001.641-6.464l-.12-.217a5 5 0 00-6.844-1.78m5.12 2.79a2.999 2.999 0 01-1.067 4.107l-1.327.78a1 1 0 00.096 1.775l.943.423a3 3 0 01.288 5.323l-8 4.7a3 3 0 01-3.039-5.173l1.327-.78a1 1 0 00-.097-1.775l-.942-.423a3 3 0 01-.288-5.323l8-4.7a3 3 0 014.106 1.066ZM15 12l-5-3v6l5-3Z', text: 'Shorts' },
            { href: '/feed/subscriptions', icon: 'M18 1H6a2 2 0 00-2 2h16a2 2 0 00-2-2Zm3 4H3a2 2 0 00-2 2v13a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2ZM3 20V7h18v13H3Zm13-6.5L10 10v7l6-3.5Z', text: '訂閱內容' },
            { href: '/playlist?list=LL', icon: 'M9.221 1.795a1 1 0 011.109-.656l1.04.173a4 4 0 013.252 4.784L14 9h4.061a3.664 3.664 0 013.576 2.868A3.68 3.68 0 0121 14.85l.02.087A3.815 3.815 0 0120 18.5v.043l-.01.227a2.82 2.82 0 01-.135.663l-.106.282A3.754 3.754 0 0116.295 22h-3.606l-.392-.007a12.002 12.002 0 01-5.223-1.388l-.343-.189-.27-.154a2.005 2.005 0 00-.863-.26l-.13-.004H3.5a1.5 1.5 0 01-1.5-1.5V12.5A1.5 1.5 0 013.5 11h1.79l.157-.013a1 1 0 00.724-.512l.063-.145 2.987-8.535Zm-1.1 9.196A3 3 0 015.29 13H4v4.998h1.468a4 4 0 011.986.528l.27.155.285.157A10 10 0 0012.69 20h3.606c.754 0 1.424-.483 1.663-1.2l.03-.126a.819.819 0 00.012-.131v-.872l.587-.586c.388-.388.577-.927.523-1.465l-.038-.23-.02-.087-.21-.9.55-.744A1.663 1.663 0 0018.061 11H14a2.002 2.002 0 01-1.956-2.418l.623-2.904a2 2 0 00-1.626-2.392l-.21-.035-2.71 7.741Z', text: '喜歡的影片' },
            { href: '/feed/history', icon: 'M8.76 1.487a11 11 0 11-7.54 12.706 1 1 0 011.96-.4 9 9 0 0014.254 5.38A9 9 0 0016.79 4.38 9 9 0 004.518 7H7a1 1 0 010 2H1V3a1 1 0 012 0v2.678a11 11 0 015.76-4.192ZM12 6a1 1 0 00-1 1v5.58l.504.288 3.5 2a1 1 0 10.992-1.736L13 11.42V7a1 1 0 00-1-1Z', text: '觀看紀錄' },
            { href: '/feed/playlists', icon: 'M16 15.395a.5.5 0 01.762-.426L22.5 18.5l-5.738 3.531a.5.5 0 01-.762-.425v-6.212ZM14 19H4a1 1 0 110-2h10v2Zm6-8a1 1 0 110 2H4a1 1 0 110-2h16Zm0-6a1 1 0 110 2H4a1 1 0 010-2h16Z', text: '播放清單' },
            { href: '/playlist?list=WL', icon: 'M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm0 2a9 9 0 110 18.001A9 9 0 0112 3Zm0 3a1 1 0 00-1 1v5.565l.485.292 3.33 2a1 1 0 001.03-1.714L13 11.435V7a1 1 0 00-1-1Z', text: '稍後觀看' },
            { href: '/feed/downloads', icon: 'M12 2a1 1 0 00-1 1v11.586l-4.293-4.293a1 1 0 10-1.414 1.414L12 18.414l6.707-6.707a1 1 0 10-1.414-1.414L13 14.586V3a1 1 0 00-1-1Zm7 18H5a1 1 0 000 2h14a1 1 0 000-2Z', text: '已下載的內容' },
            { href: '/feed/you', icon: 'M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm0 2a9 9 0 016.447 15.276 7 7 0 00-12.895 0A9 9 0 0112 3Zm0 2a4 4 0 100 8 4 4 0 000-8Zm0 2a2 2 0 110 4 2 2 0 010-4Zm-.1 9.001L11.899 16a5 5 0 014.904 3.61A8.96 8.96 0 0112 21a8.96 8.96 0 01-4.804-1.391 5 5 0 014.704-3.608Z', text: '個人中心' },
            { href: 'https://studio.youtube.com', icon: 'M20 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2ZM4 20V4h16v16h-1.293a7 7 0 00-13.414 0H4Zm8-14a4 4 0 100 8 4 4 0 000-8Zm0 2a2 2 0 110 4 2 2 0 010-4Zm-.1 9.001h-.002A5 5 0 0116.581 20H7.417a5 5 0 014.483-2.999Z', text: '你的頻道' },
        ];

        items.forEach(item => {
            const div = document.createElement('a');
            div.className = 'guide-item';
            div.href = item.href;
            div.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${item.icon}"/></svg>
        <span style="font-size:11px;margin-top:4px;">${item.text}</span>
      `;
            if (item.hasMenu) {
                div.dataset.hasMenu = 'true';
            }
            this.guideEl.appendChild(div);
        });

        const content = document.querySelector('ytd-app #content') || document.querySelector('div#content') || document.body;
        content.appendChild(this.guideEl);
        console.log(`${PREFIX} 簡化浮動導覽已建立`);
    }

    handleMouseMove(e) {
        const shouldShow = e.clientX <= TRIGGER_WIDTH;
        if (shouldShow && !this.isVisible) {
            this.showGuide();
        } else if (!shouldShow && this.isVisible) {
            this.hideGuide();
        }
    }

    setupListeners() {
        document.addEventListener('mousemove', this.boundMouseMove);

    }

    showGuide() {
        if (this.timeout) clearTimeout(this.timeout);
        this.isVisible = true;
        if (this.guideEl) this.guideEl.classList.add('visible');
        console.log(`${PREFIX} 顯示浮動導覽選單`);
    }

    hideGuide() {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.isVisible = false;
            if (this.guideEl) this.guideEl.classList.remove('visible');
            console.log(`${PREFIX} 隱藏浮動導覽選單`);
        }, 120);
    }

    destroy() {
        document.removeEventListener('mousemove', this.boundMouseMove);
        this.mousemoveListener = null;
        this.guideEl = null;
    }
}
let johnTheAppDrawer = null;

const handler = new DynamicRouteHandler({
  matchPatterns: [/^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/],
   onEnter: () => johnTheAppDrawer = new YTFloatMiniGuide(),
   onLeave: () => {
     johnTheAppDrawer.destroy();
     johnTheAppDrawer = null;
   },
   debug: true
 });

handler.start();


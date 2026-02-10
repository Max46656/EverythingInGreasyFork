// ==UserScript==
// @name         Twitter-X 放大檢視圖片
// @name:en      Twitter-X Large Image Viewer
// @name:ja      Twitter-X 大きな画像ビューア
// @name:de      Twitter-X Großbild-Ansicht
// @name:cs      Twitter-X Velký náhled obrázků
// @name:lt      Twitter-X Didelių vaizdų peržiūra
//
// @description  提供圖片放大功能，支持四種顯示模式循環切換（適應視窗 / 原始尺寸 / 適應寬度 / 適應高度）、右鍵切換模式、左鍵開啟與關閉滑鼠拖移移動位置、滾輪協助檢視圖片、ESC 鍵關閉、支援僅限相片頁面啟用
// @description:en Provides image zoom functionality with 4 display modes cycling (fit window / original / fit width / fit height), right-click to switch mode, left-click to open/close, mouse drag to move, wheel to assist viewing, ESC to close, optional photo-page-only mode
// @description:ja 畫像拡大機能を提供。4つの表示モード循環切り替え（ウィンドウに合わせる / オリジナル / 幅に合わせる / 高さに合わせる）、右クリックでモード切替、左クリックで開閉、マウスドラッグ移動、ホイールで閱覧補助、ESCで閉じる、寫真ページ限定モード対応
// @description:de Bietet Bildvergrößerungsfunktion mit 4 zyklischen Anzeigemodi (Fenster anpassen / Original / Breite anpassen / Höhe anpassen), Rechtsklick zum Umschalten, Linksklick zum Öffnen/Schließen, Mausziehen zum Verschieben, Mausrad zur Ansichtshilfe, ESC zum Schließen, optional nur auf Fotoseiten
// @description:cs Poskytuje funkci zvětšení obrázků s cyklickým přepínáním 4 režimů zobrazení (přizpůsobení oknu / originál / přizpůsobení šířce / přizpůsobení výšce), pravý klik pro změnu režimu, levý klik pro otevření/zavření, tažení myší pro posun, kolečko myši pro pomoc při prohlížení, ESC pro zavření, volitelně pouze na foto-stránce
// @description:lt Teikia vaizdo didinimo funkciją su 4 rodymo režimų ciklu (tilpti į langą / originalus / tilpti pagal plotį / tilpti pagal aukštį), dešinysis pelės klavišas režimo keitimui, kairysis pelės klavišas atidaryti/uždaryti, vilkimas pelės perkėlimui, ratukas peržiūros pagalbai, ESC uždarymui, pasirenkamai tik nuotraukų puslapyje// @author       Max
//
// @author       Max
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues
// @license      MPL2.0
//
// @version      1.7.0
// @match        https://x.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==
class ImageMagnifierForTwitter {
  constructor() {
    this.modes = ['fit-window', 'original', 'fit-width', 'fit-height'];
    this.currentModeIndex = 0;
    this.onlyPhotoPage = GM_getValue('only_photo_page', false);
    this.viewer = null;
    this.img = null;
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;

    this.i18n = new I18nManager();
  }

  init() {
    this.injectStyles();
    this.registerMenu();
    this.monitorPage();
  }

  registerMenu() {
    GM_registerMenuCommand(
      this.onlyPhotoPage ? this.i18n.t('menu.onlyPhotoPage.on') : this.i18n.t('menu.onlyPhotoPage.off'),
      () => {
        this.onlyPhotoPage = !this.onlyPhotoPage;
        GM_setValue('only_photo_page', this.onlyPhotoPage);
        location.reload();
      }
    );

    // 語言設定 - 單一項目 + prompt 選擇
    GM_registerMenuCommand(this.i18n.t('menu.language'), () => {
      const avail = this.i18n.getAvailableLanguages();
      const list = avail.map(l => `${l.code.padEnd(6)} - ${l.name}`).join('\n');
      const input = prompt(
        `${this.i18n.t('menu.language')}（支援：${avail.map(l => l.code).join(', ')}）\n\n${list}`,
        this.i18n.currentLang
      );

      if (input) {
        const code = input.trim().toLowerCase();
        if (this.i18n.translations[code]) {
          this.i18n.setLanguage(code);
          alert(`語言已切換為：${avail.find(l => l.code === code)?.name || code}`);
          location.reload();
        } else {
          alert('不支援的語言代碼');
        }
      }
    });
  }

  injectStyles() {
    GM_addStyle(`
      #twitter-floating-viewer {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(0,0,0,0.95);
        overflow: hidden;
        cursor: grab;
        user-select: none;
      }
      #twitter-floating-viewer:active { cursor: grabbing; }
      #twitter-floating-viewer img {
        position: absolute;
        top: 0;
        left: 0;
        transition: none !important;
        pointer-events: auto;
        will-change: transform;
        transform-origin: 0 0;
        display: block;
      }
      .mode-fit-window { width: auto !important; height: auto !important; max-width: 100vw !important; max-height: 100vh !important; }
      .mode-original   { width: auto !important; height: auto !important; max-width: none  !important; max-height: none  !important; }
      .mode-fit-width  { width: 100vw !important; height: auto !important; max-width: none  !important; max-height: none  !important; }
      .mode-fit-height { height: 100vh !important; width: auto !important; max-width: none  !important; max-height: none  !important; }
    `);
  }

  monitorPage() {
    const observer = new MutationObserver(() => this.tryBindImages());
    observer.observe(document.body, { childList: true, subtree: true });
    this.tryBindImages();
  }

  isPhotoPage() {
    return /\/status\/\d+\/photo\/\d+$/.test(location.pathname);
  }

  tryBindImages() {
    const selector = 'img[src^="https://pbs.twimg.com/media/"]:not(#twitter-floating-viewer img)';
    document.querySelectorAll(selector).forEach(img => {
      if (img.dataset.floatingBound) return;
      img.dataset.floatingBound = 'true';
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (e) => {
        if (this.onlyPhotoPage && !this.isPhotoPage()) return;
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const url = new URL(img.src);
        url.searchParams.set('name', 'orig');
        this.openViewer(url.toString());
      }, { capture: true });
    });
  }

  openViewer(src) {
    if (this.viewer) this.closeViewer();

    this.viewer = document.createElement('div');
    this.viewer.id = 'twitter-floating-viewer';

    this.img = document.createElement('img');
    this.img.src = src;

    this.currentModeIndex = 0;
    this.applyModeStyles();

    this.viewer.appendChild(this.img);
    document.body.appendChild(this.viewer);

    this.img.onload = () => {
      this.resetToCenter();
      this.setupEvents();
    };
  }

  resetToCenter() {
    this.img.style.transform = '';
    this.scale = 1;
    requestAnimationFrame(() => {
      const rect = this.img.getBoundingClientRect();
      this.translateX = (window.innerWidth - rect.width) / 2;
      this.translateY = (window.innerHeight - rect.height) / 2;
      this.updateTransform();
    });
  }

  applyModeStyles() {
    this.modes.forEach(m => this.img.classList.remove(`mode-${m}`));
    this.img.classList.add(`mode-${this.modes[this.currentModeIndex]}`);
  }

  updateTransform() {
    if (this.img) {
      this.img.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
  }

  setupEvents() {
    // 滾輪行為依當前模式決定
    this.viewer.addEventListener('wheel', (e) => {
      e.preventDefault();

      const currentMode = this.modes[this.currentModeIndex];

      if (currentMode === 'fit-window' || currentMode === 'original') {
        // 放大縮小
        const factor = Math.pow(0.999, e.deltaY);
        const oldScale = this.scale;
        const newScale = Math.min(Math.max(0.01, oldScale * factor), 50);
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        this.translateX = mouseX - (mouseX - this.translateX) * (newScale / oldScale);
        this.translateY = mouseY - (mouseY - this.translateY) * (newScale / oldScale);
        this.scale = newScale;
      } else if (currentMode === 'fit-width') {
        this.translateY -= e.deltaY * 1.5;  // 可調整靈敏度
      } else if (currentMode === 'fit-height') {
        this.translateX -= e.deltaY * 1.5;  // 可調整靈敏度
      }

      this.updateTransform();
    }, { passive: false });

    this.viewer.onmousedown = (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
    };
    window.onmousemove = (e) => {
      if (!this.isDragging) return;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.updateTransform();
    };
    window.onmouseup = () => { this.isDragging = false; };

    this.viewer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.currentModeIndex = (this.currentModeIndex + 1) % this.modes.length;
      this.applyModeStyles();
      this.resetToCenter();
    });

    this.viewer.addEventListener('click', (e) => {
      if (this.isDragging) return;
      this.closeViewer();
    });

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeViewer();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  closeViewer() {
    if (this.viewer) {
      this.viewer.remove();
      this.viewer = null;
      this.img = null;
      this.isDragging = false;
    }
  }
}

class I18nManager {
  get translations() {
    return {
      'zh-TW': {
        'menu.onlyPhotoPage.on':  '點選限制：僅限相片分頁',
        'menu.onlyPhotoPage.off': '點選限制：任何分頁圖片',
        'menu.language':          '語言設定',
        'menu.language.prompt':   '請輸入語言代碼（支援：zh-TW, en, ja, de, cs, lt）：'
      },
      'en': {
        'menu.onlyPhotoPage.on':  'Click restriction: Photo pages only',
        'menu.onlyPhotoPage.off': 'Click restriction: Any page images',
        'menu.language':          'Language',
        'menu.language.prompt':   'Enter language code (supported: zh-TW, en, ja, de, cs, lt):'
      },
      'ja': {
        'menu.onlyPhotoPage.on':  'クリック制限：写真ページのみ',
        'menu.onlyPhotoPage.off': 'クリック制限：すべてのページの画像',
        'menu.language':          '言語',
        'menu.language.prompt':   '言語コードを入力してください（対応：zh-TW, en, ja, de, cs, lt）：'
      },
      'de': {
        'menu.onlyPhotoPage.on':  'Klickbeschränkung: Nur Fotoseiten',
        'menu.onlyPhotoPage.off': 'Klickbeschränkung: Bilder auf jeder Seite',
        'menu.language':          'Sprache',
        'menu.language.prompt':   'Sprachcode eingeben (unterstützt: zh-TW, en, ja, de, cs, lt):'
      },
      'cs': {
        'menu.onlyPhotoPage.on':  'Omezení kliknutí: Pouze foto stránky',
        'menu.onlyPhotoPage.off': 'Omezení kliknutí: Obrázky na jakékoli stránce',
        'menu.language':          'Jazyk',
        'menu.language.prompt':   'Zadejte kód jazyka (podporováno: zh-TW, en, ja, de, cs, lt):'
      },
      'lt': {
        'menu.onlyPhotoPage.on':  'Paspaudimo ribojimas: Tik nuotraukų puslapiai',
        'menu.onlyPhotoPage.off': 'Paspaudimo ribojimas: Bet kokio puslapio vaizdai',
        'menu.language':          'Kalba',
        'menu.language.prompt':   'Įveskite kalbos kodą (palaikoma: zh-TW, en, ja, de, cs, lt):'
      }
    };
  }

  constructor(fallbackLang = 'zh-TW') {
    this.fallbackLang = fallbackLang;

    let lang = GM_getValue('language', null);
    if (!lang) {
      const browserLang = navigator.language || navigator.userLanguage || 'zh-TW';
      const primary = browserLang.split('-')[0].toLowerCase();
      const supported = Object.keys(this.translations);

      lang = supported.find(l => l === browserLang) ||
            supported.find(l => l.startsWith(primary)) ||
            fallbackLang;

      GM_setValue('language', lang);
    }

    this.currentLang = lang;
  }

  t(key) {
    return this.translations[this.currentLang]?.[key] ||
           this.translations[this.fallbackLang]?.[key] ||
           key;
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      GM_setValue('language', lang);
    }
  }

  getAvailableLanguages() {
    return Object.keys(this.translations).map(code => ({
      code,
      name: {
        'zh-TW': '繁體中文',
        'en':    'English',
        'ja':    '日本語',
        'de':    'Deutsch',
        'cs':    'Čeština',
        'lt':    'Lietuvių'
      }[code] || code.toUpperCase()
    }));
  }
}

new ImageMagnifierForTwitter().init();

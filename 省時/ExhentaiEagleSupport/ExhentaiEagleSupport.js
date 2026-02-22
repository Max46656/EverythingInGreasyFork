// ==UserScript==
// @name         熊貓 Eagle 支援
// @name:ja      Exhentaiイーグルサポート
// @name:en      Exhentai Eagle Support
// @description  自動開啟 Exhentai 原圖並將其加入 Eagle + 支援批次加入 Eagle
// @description:ja Exhentaiのオリジナル画像を自動的に開き、Eagleに追加します（バッチ対応）
// @description:en Automatically open Exhentai original images and add them to Eagle (with batch support)
// @author       Max
// @namespace    https://greasyfork.org/zh-TW/users/1021017-max46656
// @version      1.3.0
// @match        *://exhentai.org/s/*
// @match        *://e-hentai.org/s/*
// @match        *://exhentai.org/g/*
// @match        *://e-hentai.org/g/*
// @match        *://*.hath.network*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @grant        GM_addStyle
// @grant        window.close
// @icon         https://exhentai.org/favicon.ico
// @license      MPL2.0
// @downloadURL  https://update.greasyfork.org/scripts/502195/%E7%86%8A%E8%B2%93%20Eagle%20%E6%94%AF%E6%8F%B4.user.js
// @updateURL    https://update.greasyfork.org/scripts/502195/%E7%86%8A%E8%B2%93%20Eagle%20%E6%94%AF%E6%8F%B4.meta.js
// ==/UserScript==

class PicTrioFactory {
  constructor() {
    this.url = window.location.href;
    this.observer = new MutationObserver(this.checkTitleChange.bind(this));
    this.observer.observe(document.querySelector('title'), { subtree: true, characterData: true, childList: true });
  }

  checkTitleChange(mutations) {
    if (this.url !== window.location.href) {
      this.url = window.location.href;
      this.getToWork();
    }
  }

  getToWork() {
    const currentUrl = window.location.href;

    if (currentUrl.match(/.*\.hath\.network.*\/(h|om)/)) {
      const eagleAdder = new EagleImageAdder();
      eagleAdder.addImageToEagle();
    }
    else if (currentUrl.match(/.*:\/\/(ex|e-)?hentai\.org\/s\/.*/)) {
      const opener = new OriginalPicOpener();
      opener.processPage();
    }
    else if (currentUrl.match(/.*:\/\/(ex|e-)?hentai\.org\/g\/.*/)) {
      const albumManager   = new AlbumPageManager();
      const batchDownloader = new BatchDownloader();

      albumManager.init();
      batchDownloader.init();
    }
  }
}

class AlbumPageManager {
  constructor() {
    this.isAuto = GM_getValue('isAuto', false);
    this.lastSavedTitle = null;
    this.titleObserver = null;
  }

  init() {
    this.saveAlbumInfo();
    this.addAutoButton();
    this.startTitleObserver();
  }

  /**
   * 監視 h1#gj 和 h1#gn 的文字內容變化，以應對自動翻譯器
   */
  startTitleObserver() {
    const titleContainer = document.querySelector('#gd2') || document.body;

    if (!titleContainer) return;

    this.titleObserver = new MutationObserver((mutations) => {
      let titleChanged = false;

      for (const mutation of mutations) {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          const gj = document.querySelector('h1#gj');
          const gn = document.querySelector('h1#gn');

          if (gj || gn) {
            titleChanged = true;
            break;
          }
        }
      }

      if (titleChanged) {
        this.saveAlbumInfo();
      }
    });

    this.titleObserver.observe(titleContainer, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  addAutoButton() {
    const container = document.querySelector('#gd2');
    if (!container) return;
    const button = document.createElement('button');
    button.id = 'eagleOnHathPage';
    this.updateButtonText(button);
    button.style.padding = '5px 10px';
    button.style.backgroundColor = 'rgb(79, 83, 91)';
    button.style.color = 'white';
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.margin = '4px';
    button.addEventListener('click', () => {
      this.isAuto = !this.isAuto;
      GM_setValue('isAuto', this.isAuto);
      this.updateButtonText(button);
    });
    container.appendChild(button);
  }

  updateButtonText(button) {
    button.textContent = this.isAuto ? 'AutoEagle: On' : 'AutoEagle: Off';
  }

  /**
   * 儲存相簿資訊 - 優先使用 h1#gj，若無則使用 h1#gn
   */
  saveAlbumInfo() {
    const urlID = window.location.pathname.split('/')[2];

    let albumTitle = document.querySelector('h1#gj')?.textContent?.trim() ||
                     document.querySelector('h1#gn')?.textContent?.trim()

    if (albumTitle === this.lastSavedTitle) return;

    this.lastSavedTitle = albumTitle;

    const albumData = GM_getValue('albumData', {});
    albumData[urlID] = {
      albumUrl: window.location.href,
      albumTitle
    };

    GM_setValue('albumData', albumData);
    console.log(`[AlbumPageManager] 相簿標題已更新為：${albumTitle}`);
  }
}

class BatchDownloader {
  constructor() {
    this.gdtObserver = null;
  }

  init() {
    this.injectStyles();

    this.addBatchButton();
    this.startGalleryObserver();

    this.processThumbnails();
  }

  /**
   * 注入必要的 CSS 樣式（只執行一次）
   */
  injectStyles() {
    if (document.getElementById('eagle-batch-css')) return;

    GM_addStyle(`
      .eagle-batch-wrapper {
        display: inline-block;
        vertical-align: top;
        text-align: center;
        position: relative;
      }
      .eagle-batch-wrapper input[type="checkbox"] {
        position: absolute;
        top: 4px;
        left: 4px;
        z-index: 10;
        width: 16px;
        height: 16px;
        opacity: 0.9;
        cursor: pointer;
      }
      #gdt.gdtc .eagle-batch-wrapper,
      #gdt.gdta .eagle-batch-wrapper {
        width: 100%;
        height: 100%;
      }
    `);

    const marker = document.createElement('style');
    marker.id = 'eagle-batch-css';
    document.head.appendChild(marker);
  }

  startGalleryObserver() {
    const gdt = document.querySelector('#gdt');
    if (!gdt) return;

    this.gdtObserver = new MutationObserver(() => {
      this.processThumbnails();
    });

    this.gdtObserver.observe(gdt, {
      childList: true,
      subtree: true
    });
  }


  processThumbnails() {
    const unprocessedLinks = document.querySelectorAll('#gdt a[href*="hentai.org/s/"]:not(.eagle-batch-wrapper *)');

    if (unprocessedLinks.length === 0) return;

    console.log(`[BatchDownloader] 發現 ${unprocessedLinks.length} 個尚未包裝的縮圖連結`);

    unprocessedLinks.forEach(link => {
      const wrapper = document.createElement('div');
      wrapper.className = 'eagle-batch-wrapper';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '6px';
      checkbox.style.verticalAlign = 'middle';

      wrapper.appendChild(checkbox);
      wrapper.appendChild(link.cloneNode(true));
      link.parentNode.replaceChild(wrapper, link);
    });
  }

  /**
   * 新增批次下載按鈕
   */
  addBatchButton() {
    const container = document.querySelector('#gd2');
    if (!container) return;

    const button = document.createElement('button');
    button.id = 'eagleOnSPage';
    button.textContent = 'Batch Add to Eagle';
    button.style.padding     = '5px 10px';
    button.style.backgroundColor = 'rgb(79, 83, 91)';
    button.style.color       = 'white';
    button.style.border      = '1px solid #ccc';
    button.style.borderRadius = '5px';
    button.style.cursor      = 'pointer';
    button.style.margin      = '4px';
    button.style.fontWeight  = '500';

    button.addEventListener('click', this.handleBatchClick.bind(this));
    container.appendChild(button);
  }

  /**
   * 處理「批次加入 Eagle」按鈕點擊
   */
  handleBatchClick() {
    const checked = document.querySelectorAll('.eagle-batch-wrapper input[type="checkbox"]:checked');

    if (checked.length === 0) {
      console.error('請先勾選至少一張圖片');
      return;
    }

    console.log(`[BatchDownloader] 開始批次開啟 ${checked.length} 個頁面`);

    checked.forEach(checkbox => {
      const wrapper = checkbox.closest('.eagle-batch-wrapper');
      const link = wrapper?.querySelector('a[href*="hentai.org/s/"]');
      if (link?.href) {
        GM_openInTab(link.href + '?batch=true', {
          active: false,
          insert: true,
          setParent: true
        });
      }
    });
  }
}

class OriginalPicOpener {
  constructor() {
    this.isAuto = GM_getValue('isAuto', false);
    this.batchMode = window.location.search.includes('batch=true');
  }

  processPage() {
    this.savePicInfo();
    if (this.batchMode) {
      this.downloadToEagle();
    } else if (this.isAuto) {
      this.openOriginalPic();
    }
  }

  openOriginalPic() {
    const link = [...document.querySelectorAll('a')].find(a => a.textContent.includes('original'));
    if (link) link.click();
  }

  downloadToEagle() {
    const img = document.querySelector('img#img');
    if (!img) return;

    const pageNumber = document.querySelector('div.sn span.cn')?.textContent ||
                       document.querySelector('div.sn span')?.textContent ||
                       'unknown';

    const currentUrl = window.location.href.replace(/\?batch=true$/, '');
    const picIDMatch = currentUrl.match(/\/s\/(.*?)\/(.*?)$/);
    if (!picIDMatch) return;

    const albumID = picIDMatch[2].split('-')[0];
    const albumData = GM_getValue('albumData', {});
    const albumInfo = albumData[albumID] || { albumTitle: 'Unknown Album' };

    const imageData = {
      url: img.src,
      name: `${albumInfo.albumTitle} - ${pageNumber}`,
      website: currentUrl
    };

    new EagleImageAdder().addImageToEagle(imageData, true);
  }

  savePicInfo() {
    const currentUrl = window.location.href.replace(/\?batch=true$/, '');
    const picIDMatch = currentUrl.match(/\/s\/(.*?)\/(.*?)$/);
    if (!picIDMatch) return;

    const albumID = picIDMatch[2].split('-')[0];
    const picID   = picIDMatch[1];

    const albumData = GM_getValue('albumData', {});
    const albumInfo = albumData[albumID] || {};

    const picData = GM_getValue('picData', {});
    picData[picID] = {
      albumUrl: albumInfo.albumUrl,
      albumTitle: albumInfo.albumTitle
    };
    GM_setValue('picData', picData);
  }
}

class EagleImageAdder {
  constructor() {
    this.EAGLE_SERVER_URL = "http://localhost:41595";
    this.EAGLE_IMPORT_API_URL = `${this.EAGLE_SERVER_URL}/api/item/addFromURL`;
  }

  addImageToEagle(imageData = null, closeAfter = false) {
    const data = imageData || this.getImageData();
    GM_xmlhttpRequest({
      url: this.EAGLE_IMPORT_API_URL,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(data),
      onload: (response) => {
        console.log('[熊貓 Eagle 支援] Image added:', response.status);
        if (response.status >= 200 && response.status < 300 && closeAfter) {
          window.close();
        }
      },
      onerror: (err) => console.error('[熊貓 Eagle 支援] Eagle API error:', err)
    });
  }

  getImageData() {
    const url = window.location.href;
    let picIDMatch = url.match(/\/h\/(.{10})/) || url.match(/\/om\/\d+\/(.{10})/);
    const picID = picIDMatch ? picIDMatch[1] : null;

    const picData = GM_getValue('picData', {});
    const info = picData[picID] || {};

    return {
      url,
      name: `${info.albumTitle || 'Unknown'} - ${url.split('/').pop()}`,
      website: info.albumUrl || url
    };
  }
}

class DataCleaner {
  constructor() {
    this.registerMenu();
  }

  registerMenu() {
    GM_registerMenuCommand('Clean Old Data (清除舊資料)', this.cleanOldData.bind(this));
  }

  cleanOldData() {
    GM_setValue('albumData', {});
    GM_setValue('picData', {});
    console.log('[熊貓 Eagle 支援] 已清除所有儲存的相簿與圖片對應資料');
    alert('已清除舊資料');
  }
}

const factory = new PicTrioFactory();
factory.getToWork();
new DataCleaner();

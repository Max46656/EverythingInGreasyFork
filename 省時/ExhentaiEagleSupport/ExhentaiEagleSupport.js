// ==UserScript==
// @name         熊貓 Eagle 支援
// @name:ja      Exhentaiイーグルサポート
// @name:en      Exhentai Eagle Support
// @description  自動開啟 Exhentai 原圖並將其加入 Eagle + 支援批次加入 Eagle
// @description:ja Exhentaiのオリジナル画像を自動的に開き、Eagleに追加します（バッチ対応）
// @description:en Automatically open Exhentai original images and add them to Eagle (with batch support)
// @author       Max
// @namespace    https://greasyfork.org/zh-TW/users/1021017-max46656
// @version      1.2.3
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

/**
 * 只負責「自動模式」與相簿資訊儲存
 */
class AlbumPageManager {
  constructor() {
    this.isAuto = GM_getValue('isAuto', false);
  }

  init() {
    this.saveAlbumInfo();
    this.addAutoButton();
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

  saveAlbumInfo() {
    const urlID = window.location.pathname.split('/')[2];

    let albumTitle = document.querySelector('h1#gj')?.textContent?.trim() ||
                     document.querySelector('h1#gn')?.textContent?.trim() ||
                     document.title.replace(/ - ExHentai\.org$/, '').replace(/ - E-Hentai\.org$/, '').trim() ||
                     'Unknown Album';

    const albumData = GM_getValue('albumData', {});
    albumData[urlID] = {
      albumUrl: window.location.href,
      albumTitle
    };
    GM_setValue('albumData', albumData);
  }
}

/**
 * 負責批次下載相關的所有功能（checkbox、監視、批次按鈕）
 */
class BatchDownloader {
  constructor() {
    this.processedLinks = new WeakSet();
    this.gdtObserver = null;
  }

  init() {
    this.addBatchButton();
    this.startGdtObserver();
    this.processExistingThumbnails();
  }

  startGdtObserver() {
    const gdt = document.querySelector('#gdt');
    if (!gdt) return;

    this.gdtObserver = new MutationObserver((mutations) => {
      let hasNew = false;
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.tagName === 'A' && node.href?.includes('/s/')) hasNew = true;
          else if (node.querySelectorAll) {
            if (node.querySelectorAll('a[href*="hentai.org/s/"]').length > 0) hasNew = true;
          }
        });
      }
      if (hasNew) this.processNewThumbnails();
    });

    this.gdtObserver.observe(gdt, { childList: true, subtree: true });
  }

  processExistingThumbnails() {
    this.processThumbnails(document.querySelectorAll('#gdt > a[href*="hentai.org/s/"]'));
  }

  processNewThumbnails() {
    const all = document.querySelectorAll('#gdt > a[href*="hentai.org/s/"]');
    const newlyAdded = Array.from(all).filter(link => !this.processedLinks.has(link));
    if (newlyAdded.length === 0) return;
    this.processThumbnails(newlyAdded);
  }

  processThumbnails(links) {
    links.forEach(link => {
      if (this.processedLinks.has(link)) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'eagle-batch-wrapper';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.style.marginRight = '6px';
      cb.style.verticalAlign = 'middle';

      wrapper.appendChild(cb);
      wrapper.appendChild(link.cloneNode(true));
      link.parentNode.replaceChild(wrapper, link);

      this.processedLinks.add(link);
    });

    if (!document.getElementById('eagle-batch-css')) {
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
      `, { id: 'eagle-batch-css' });
    }
  }

  addBatchButton() {
    const container = document.querySelector('#gd2');
    if (!container) return;

    const button = document.createElement('button');
    button.id = 'eagleOnSPage';
    button.textContent = 'Batch Add to Eagle';
    button.style.padding = '5px 10px';
    button.style.backgroundColor = 'rgb(79, 83, 91)';
    button.style.color = 'white';
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.margin = '4px';

    button.addEventListener('click', this.handleBatchClick.bind(this));
    container.appendChild(button);
  }

  handleBatchClick() {
    const checked = document.querySelectorAll('.eagle-batch-wrapper input[type="checkbox"]:checked');
    if (checked.length === 0) {
      alert('請先勾選至少一張圖片');
      return;
    }

    checked.forEach(cb => {
      const wrapper = cb.closest('.eagle-batch-wrapper');
      const link = wrapper?.querySelector('a[href*="hentai.org/s/"]');
      if (link?.href) {
        GM_openInTab(link.href + '?batch=1', {
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
    this.batchMode = window.location.search.includes('batch=1');
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

    const currentUrl = window.location.href.replace(/\?batch=1$/, '');
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
    const currentUrl = window.location.href.replace(/\?batch=1$/, '');
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

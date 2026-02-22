// ==UserScript==
// @name         熊貓 Eagle 支援
// @name:ja      Exhentaiイーグルサポート
// @name:en      Exhentai Eagle Support
// @description  自動開啟 Exhentai 原圖並將其加入 Eagle
// @description:ja Exhentaiのオリジナル画像を自動的に開き、Eagleに追加します
// @description:en Automatically open Exhentai original images and add them to Eagle
// @author       Max
// @namespace    https://greasyfork.org/zh-TW/users/1021017-max46656
// @version      1.2.2
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

/**
 * 腳本工廠類別，負責根據頁面類型建立對應處理器
 */
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
    } else if (currentUrl.match(/.*:\/\/(ex|e-)?hentai\.org\/s\/.*/)) {
      const opener = new OriginalPicOpener();
      opener.processPage();
    } else if (currentUrl.match(/.*:\/\/(ex|e-)?hentai\.org\/g\/.*/)) {
      const albumManager = new AlbumPageManager();
      albumManager.init();
    }
  }
}

/**
 * 相冊頁面管理器，處理 UI 注入和批次功能
 */
class AlbumPageManager {
  constructor() {
    this.isAuto = GM_getValue('isAuto', false);
    this.processedLinks = new WeakSet();
    this.gdtObserver = null;
  }

  init() {
    this.saveAlbumInfo();
    this.addAutoButton();
    this.addBatchButton();
    this.startGdtObserver();
    this.processExistingThumbnails();
  }

  startGdtObserver() {
    const gdt = document.querySelector('#gdt');
    if (!gdt) return;
    this.gdtObserver = new MutationObserver((mutations) => {
      let hasNewThumbnails = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.tagName === 'A' && node.href.includes('/s/')) {
              hasNewThumbnails = true;
            } else if (node.querySelector) {
              const newLinks = node.querySelectorAll('a[href*="hentai.org/s/"]');
              if (newLinks.length > 0) hasNewThumbnails = true;
            }
          });
        }
      }
      if (hasNewThumbnails) {
        this.processNewThumbnails();
      }
    });
    this.gdtObserver.observe(gdt, { childList: true, subtree: true });
  }

  processExistingThumbnails() {
    this.processThumbnails(document.querySelectorAll('#gdt > a[href*="hentai.org/s/"]'));
  }

  processNewThumbnails() {
    const allLinks = document.querySelectorAll('#gdt > a[href*="hentai.org/s/"]');
    const newLinks = Array.from(allLinks).filter(link => !this.processedLinks.has(link));
    if (newLinks.length === 0) return;
    this.processThumbnails(newLinks);
  }

  processThumbnails(links) {
    links.forEach(link => {
      if (this.processedLinks.has(link)) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'eagle-batch-wrapper';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '6px';
      checkbox.style.verticalAlign = 'middle';
      wrapper.appendChild(checkbox);
      wrapper.appendChild(link.cloneNode(true));
      link.parentNode.replaceChild(wrapper, link);
      this.processedLinks.add(link);
    });

    if (!document.querySelector('#eagle-batch-styles')) {
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
          opacity: 0.85;
          cursor: pointer;
        }
        #gdt.gdtc .eagle-batch-wrapper,
        #gdt.gdta .eagle-batch-wrapper {
          width: 100%;
          height: 100%;
        }
      `);
    }
  }

  addAutoButton() {
    const container = document.querySelector('#gd2');
    if (!container) return;
    const button = document.createElement('button');
    button.id = 'eagleOnHathPage';
    this.updateButtonText(button, 'auto');
    this.styleButton(button);
    button.addEventListener('click', () => {
      this.isAuto = !this.isAuto;
      GM_setValue('isAuto', this.isAuto);
      this.updateButtonText(button, 'auto');
    });
    container.appendChild(button);
  }

  addBatchButton() {
    const container = document.querySelector('#gd2');
    if (!container) return;
    const button = document.createElement('button');
    button.id = 'eagleOnSPage';
    button.textContent = 'Batch Add to Eagle';
    this.styleButton(button);
    button.addEventListener('click', this.handleBatchClick.bind(this));
    container.appendChild(button);
  }

  handleBatchClick() {
    const checkboxes = document.querySelectorAll('.eagle-batch-wrapper input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
      const wrapper = checkbox.closest('.eagle-batch-wrapper');
      const link = wrapper?.querySelector('a[href*="hentai.org/s/"]');
      if (link && link.href) {
        GM_openInTab(`${link.href}?batch=1`, {
          active: false,
          insert: true,
          setParent: true
        });
      }
    });
  }

  updateButtonText(button, type) {
    if (type === 'auto') {
      button.textContent = this.isAuto ? 'AutoEagle: On' : 'AutoEagle: Off';
    }
  }

  styleButton(button) {
    button.style.padding = '5px';
    button.style.backgroundColor = 'rgb(79, 83, 91)';
    button.style.color = 'rgb(241, 241, 242)';
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.margin = '5px';
  }

  /**
   * 儲存相冊資訊 - 優先使用 h1#gj，若無則使用 h1#gn
   */
  saveAlbumInfo() {
    const urlID = window.location.pathname.split('/')[2];

    // 優先抓取自訂標題 (gj = gallery japanese)
    let albumTitle = document.querySelector('h1#gj')?.textContent?.trim();

    // 若無 gj 則使用預設英文標題 (gn = gallery name)
    if (!albumTitle) {
      albumTitle = document.querySelector('h1#gn')?.textContent?.trim();
    }

    // 最後防線：從 document.title 去除後綴
    if (!albumTitle) {
      albumTitle = document.title
        .replace(/ - ExHentai\.org$/, '')
        .replace(/ - E-Hentai\.org$/, '')
        .trim();
    }

    const albumData = GM_getValue('albumData', {});
    albumData[urlID] = {
      albumUrl: window.location.href,
      albumTitle: albumTitle || 'Unknown Album'
    };
    GM_setValue('albumData', albumData);
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
    const links = document.querySelectorAll('a');
    for (const link of links) {
      if (link.textContent.includes('original')) {
        link.click();
        break;
      }
    }
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
    const albumInfo = albumData[albumID] || {};

    const imageData = {
      url: img.src,
      name: `${albumInfo.albumTitle} - ${pageNumber}`,
      website: currentUrl
    };

    const eagleAdder = new EagleImageAdder();
    eagleAdder.addImageToEagle(imageData, true);
  }

  savePicInfo() {
    const currentUrl = window.location.href.replace(/\?batch=1$/, '');
    const picIDMatch = currentUrl.match(/\/s\/(.*?)\/(.*?)$/);
    if (!picIDMatch) return;

    const albumID = picIDMatch[2].split('-')[0];
    const picID = picIDMatch[1];

    const albumData = GM_getValue('albumData', {});
    const albumInfo = albumData[albumID] || {};

    const picData = GM_getValue('picData', {});
    picData[picID] = {
      albumUrl: albumInfo.albumUrl,
      albumTitle: albumInfo.albumTitle,
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
        console.log('Image added to Eagle:', response);
        if (response.status >= 200 && response.status < 300 && closeAfter) {
          window.close();
        }
      },
      onerror: (error) => {
        console.error('Failed to add image to Eagle:', error);
      }
    });
  }

  getImageData() {
    const imageUrl = window.location.href;
    let picIDMatch = imageUrl.match(/\/h\/(.{10})/);
    if (!picIDMatch) {
      picIDMatch = imageUrl.match(/\/om\/\d+\/(.{10})/);
    }
    const picID = picIDMatch ? picIDMatch[1] : null;
    const picData = GM_getValue('picData', {});
    const picInfo = picData[picID] || {};
    return {
      url: imageUrl,
      name: `${picInfo.albumTitle || 'Unknown'} - ${imageUrl.split('/').pop()}`,
      website: picInfo.albumUrl ?? imageUrl
    };
  }
}

class DataCleaner {
  constructor() {
    this.registerMenu();
  }

  registerMenu() {
    GM_registerMenuCommand('Clean Old Data', this.cleanOldData.bind(this));
  }

  cleanOldData() {
    const albumData = GM_getValue('albumData', {});
    const picData = GM_getValue('picData', {});
    let albumDeleted = 0;
    let picDeleted = 0;
    for (const key in albumData) { delete albumData[key]; albumDeleted++; }
    for (const key in picData)   { delete picData[key];   picDeleted++;   }
    GM_setValue('albumData', albumData);
    GM_setValue('picData', picData);
    console.log(`Old data cleaned. Deleted ${albumDeleted} album entries and ${picDeleted} picture entries.`);
  }
}

// 啟動腳本
const picPage = new PicTrioFactory();
picPage.getToWork();
const dataCleaner = new DataCleaner();

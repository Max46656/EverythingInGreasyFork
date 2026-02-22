// ==UserScript==
// @name         熊貓 Eagle 支援
// @name:ja      ExhentaiイーグルサポートaddCheckboxes
// @name:en      Exhentai Eagle Support
// @description  自動開啟 Exhentai 原圖並將其加入 Eagle
// @description:ja Exhentaiのオリジナル画像を自動的に開き、Eagleに追加します
// @description:en Automatically open Exhentai original images and add them to Eagle
// @author       Max
// @namespace    https://greasyfork.org/zh-TW/users/1021017-max46656
// @version      1.1.0
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
// @grant        window.close
// @icon         https://exhentai.org/favicon.ico
// @license      MPL2.0addCheckboxes
// @downloadURL  https://update.greasyfork.org/scripts/502195/%E7%86%8A%E8%B2%93%20Eagle%20%E6%94%AF%E6%8F%B4.user.js
// @updateURL    https://update.greasyfork.org/scripts/502195/%E7%86%8A%E8%B2%93%20Eagle%20%E6%94%AF%E6%8F%B4.meta.js
// ==/UserScript==

/**
 * 腳本工廠類別，負責根據頁面類型建立對應處理器
 */
class PicTrioFactory {
    /**
   * 建立工廠實例
   */
    constructor() {
        this.url = window.location.href;
        this.observer = new MutationObserver(this.checkTitleChange.bind(this));
        this.observer.observe(document.querySelector('title'), { subtree: true, characterData: true, childList: true });
    }

    /**
   * 檢查標題變化以偵測 URL 更新
   * @param {Array<MutationRecord>} mutations - 變化記錄
   */
    checkTitleChange(mutations) {
        if (this.url !== window.location.href) {
            this.url = window.location.href;
            this.getToWork();
        }
    }

    /**
   * 根據頁面 URL 啟動對應處理器
   */
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
    }

    init() {
        this.saveAlbumInfo();
        this.addAutoButton();
        this.addBatchButton();
        this.addCheckboxes();
    }

    /**
   * 新增自動模式按鈕
   */
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

    /**
   * 新增批次下載按鈕
   */
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

    /**
 * 為每個圖片連結新增勾選框，並用 wrapper div 包裝以維持排版
 */
    addCheckboxes() {
        const items = document.querySelectorAll('#gdt > a');

        items.forEach(item => {
            const link = item.querySelector('a[href*="hentai.org/s/"]') ||
                  (item.tagName === 'A' ? item : null);
            if (!link) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'eagle-batch-wrapper';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '6px';
            checkbox.style.verticalAlign = 'middle';


            wrapper.appendChild(checkbox);
            wrapper.appendChild(item.cloneNode(true));
            item.parentNode.replaceChild(wrapper, item);

            if (item.tagName !== 'A') {
                Array.from(item.children)
                    .filter(child => child !== link)
                    .forEach(child => wrapper.appendChild(child));
            }
        });

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
        }
        #gdt.gdtc .eagle-batch-wrapper,
        #gdt.gdta .eagle-batch-wrapper {
            width: 100%;
            height: 100%;
        }
    `);
}

    /**
   * 處理批次按鈕點擊
   */
    handleBatchClick() {
        const checkboxes = document.querySelectorAll('.eagle-batch-wrapper input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            const link = checkbox.parentElement.querySelector('a[href*="hentai.org/s/"]');
            if (link && link.href) {
                GM_openInTab(`${link.href}?batch=1`, {
                    active: false,
                    insert: true,
                    setParent: true
                });
            }
        });
    }
    /**
   * 更新按鈕文字
   * @param {HTMLElement} button - 按鈕元素
   * @param {string} type - 按鈕類型 ('auto')
   */
    updateButtonText(button, type) {
        if (type === 'auto') {
            button.textContent = this.isAuto ? 'AutoEagle: On' : 'AutoEagle: Off';
        }
    }

    /**
   * 設定按鈕樣式
   * @param {HTMLElement} button - 按鈕元素
   */
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
   * 儲存相簿資訊
   */
    saveAlbumInfo() {
        const urlID = window.location.pathname.split('/')[2];
        let albumTitle = document.title.replace(/ - ExHentai\.org$/, '').replace(/ - E-Hentai\.org$/, '');
        const albumData = GM_getValue('albumData', {});
        albumData[urlID] = {
            albumUrl: window.location.href,
            albumTitle: albumTitle,
        };
        GM_setValue('albumData', albumData);
    }
}

/**
 * 原圖開啟器，處理單張圖片頁面邏輯
 */
class OriginalPicOpener {
    /**
   * 建立開啟器實例
   */
    constructor() {
        this.isAuto = GM_getValue('isAuto', false);
        this.batchMode = window.location.search.includes('batch=1');
    }

    /**
   * 處理圖片頁面邏輯
   */
    processPage() {
        this.savePicInfo();
        if (this.batchMode) {
            this.downloadToEagle();
        } else if (this.isAuto) {
            this.openOriginalPic();
        }
    }

    /**
   * 開啟原圖連結
   */
    openOriginalPic() {
        const links = document.querySelectorAll('a');
        for (const link of links) {
            if (link.textContent.includes('original')) {
                link.click();
                break;
            }
        }
    }

    /**
   * 下載顯示圖片至 Eagle (批次模式)
   */
    downloadToEagle() {
        const img = document.querySelector('img#img');
        if (!img) return;
        const pageNumber = document.querySelector('div.sn span.cn')?.textContent || document.querySelector('div.sn span')?.textContent || 'unknown';
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
        eagleAdder.addImageToEagle(imageData, true); // 傳入 batch 旗標以關閉分頁
    }

    /**
   * 儲存圖片資訊
   */
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

/**
 * Eagle 圖片加入器
 */
class EagleImageAdder {
    /**
   * 建立加入器實例
   */
    constructor() {
        this.EAGLE_SERVER_URL = "http://localhost:41595";
        this.EAGLE_IMPORT_API_URL = `${this.EAGLE_SERVER_URL}/api/item/addFromURL`;
    }

    /**
   * 加入圖片至 Eagle
   * @param {Object} [imageData=null] - 自訂圖片資料 (批次模式使用)
   * @param {boolean} [closeAfter=false] - 加入後是否關閉分頁
   */
    addImageToEagle(imageData = null, closeAfter = false) {
        const data = imageData || this.getImageData();
        GM_xmlhttpRequest({
            url: this.EAGLE_IMPORT_API_URL,
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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

    /**
   * 取得圖片資料 (自動模式)
   * @returns {Object} 圖片資料
   */
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
            name: `${picInfo.albumTitle} - ${imageUrl.split('/').pop()}`,
            website: picInfo.albumUrl ?? imageUrl
        };
    }
}

/**
 * 資料清理器
 */
class DataCleaner {
    /**
   * 建立清理器實例
   */
    constructor() {
        this.registerMenu();
    }

    /**
   * 註冊清理選單
   */
    registerMenu() {
        GM_registerMenuCommand('Clean Old Data', this.cleanOldData.bind(this));
    }

    /**
   * 清理舊資料
   */
    cleanOldData() {
        const albumData = GM_getValue('albumData', {});
        const picData = GM_getValue('picData', {});
        let albumDataDeleted = 0;
        let picDataDeleted = 0;
        for (const key in albumData) {
            delete albumData[key];
            albumDataDeleted++;
        }
        for (const key in picData) {
            delete picData[key];
            picDataDeleted++;
        }
        GM_setValue('albumData', albumData);
        GM_setValue('picData', picData);
        console.log(`Old data cleaned. Deleted ${albumDataDeleted} albumData and ${picDataDeleted} picData entries.`);
    }
}

// 啟動腳本
const picPage = new PicTrioFactory();
picPage.getToWork();
const dataCleaner = new DataCleaner();

// ==UserScript==
// @name         熊貓 Eagle 支援
// @name:en      Panda Eagle Support
// @name:ja      パンダ Eagle サポート
// @name:hi      पांडा ईगल सपोर्ट
// @name:es      Soporte Panda Eagle
// @name:sv      Panda Eagle Stöd
// @name:nl      Panda Eagle Ondersteuning
// @name:lt      Panda Eagle Palaikymas
// @name:cs      Podpora Panda Eagle
// @description  將Exhentai批次加入Eagle。將開啟Exhentai原圖改為將其加入Eagle
// @description:en Batch add Exhentai images to Eagle. Change opening original Exhentai images to adding them to Eagle instead.
// @description:ja Exhentaiの畫像を一括でEagleに追加。Exhentaiのオリジナル畫像を開く動作をEagleに追加する動作に変更。
// @description:hi Exhentai छवियों को बैच में Eagle में जोड़ें। मूल Exhentai छवियों को खोलने के बजाय उन्हें Eagle में जोड़ें।
// @description:es Añadir imágenes de Exhentai en lote a Eagle. Cambiar la acción de abrir imágenes originales de Exhentai por añadirlas a Eagle.
// @description:sv Lägg till Exhentai-bilder i batch till Eagle. Ändra öppning av original Exhentai-bilder till att lägga till dem i Eagle istället.
// @description:nl Exhentai-afbeeldingen in bulk toevoegen aan Eagle. Wijzig het openen van originele Exhentai-afbeeldingen naar toevoegen aan Eagle.
// @description:lt Pridėti Exhentai vaizdus grupėmis į Eagle. Pakeisti originalių Exhentai vaizdų atidarymą į pridėjimą prie Eagle.
// @description:cs Přidávat obrázky Exhentai hromadně do Eagle. Změnit otevírání originálních obrázků Exhentai na jejich přidávání do Eagle.
//
// @author       Max
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues
// @license      MPL2.0
//
// @version      1.3.2
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
    this.trackTitleChanges = GM_getValue('trackTitleChanges', false);
    this.lastSavedTitle = null;
    this.titleObserver = null;
    this.menuCommandId = 'track-title-changes';
  }

  init() {
    this.saveAlbumInfo();
    this.addAutoButton();
    this.registerTrackMenuCommand();
    if (this.trackTitleChanges) {
      this.startTitleObserver();
    }
  }

  /**
   * 註冊或更新「追蹤標題變化」選單項目
   */
  registerTrackMenuCommand() {
    const statusText = this.trackTitleChanges ? '開啟' : '關閉';
    const caption = `追蹤標題變化 (目前：${statusText})`;

    GM_registerMenuCommand(caption, () => {
      this.trackTitleChanges = !this.trackTitleChanges;
      GM_setValue('trackTitleChanges', this.trackTitleChanges);

      if (this.trackTitleChanges) {
        this.startTitleObserver();
      } else if (this.titleObserver) {
        this.titleObserver.disconnect();
        this.titleObserver = null;
        console.log('[AlbumPageManager] 已停止追蹤標題變化');
      }

      this.registerTrackMenuCommand();

      this.saveAlbumInfo();
    }, { id: this.menuCommandId });
  }

  startTitleObserver() {
    if (this.titleObserver) {
      this.titleObserver.disconnect();
    }

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

    console.log('[AlbumPageManager] 已開始追蹤標題變化');
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
                     document.title.replace(/ - ExHentai\.org$/, '')
                                   .replace(/ - E-Hentai\.org$/, '')
                                   .trim() ||
                     'Unknown Album';

    if (albumTitle === this.lastSavedTitle) {
      return;
    }

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

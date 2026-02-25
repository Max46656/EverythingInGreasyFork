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
// @version      1.5.5
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
            const batchDownloader = new BatchDownloader();
            const albumManager = new AlbumPageManager();

            batchDownloader.init();
            albumManager.init();
        }
    }
}

class AlbumPageManager {
    constructor() {
        this.isAuto = GM_getValue('isAuto', false);
        this.selectedFolderId = GM_getValue('selectedFolderId', '');
        this.trackTitleChanges = GM_getValue('trackTitleChanges', false);
        this.lastSavedTitle = null;
        this.titleObserver = null;
        this.menuCommandId = 'track-title-changes';
    }

    async init() {
        this.saveAlbumInfo();
        await this.addFolderSelector();
        this.addAutoButton();
        this.registerTrackMenuCommand();
        if (this.trackTitleChanges) {
            this.startTitleObserver();
        }
    }

    registerTrackMenuCommand() {
        const statusText = this.trackTitleChanges ? I18n.t('enabled') : I18n.t('disabled');
        const caption = I18n.t('trackTitle', statusText);

        GM_registerMenuCommand(caption, () => {
            this.trackTitleChanges = !this.trackTitleChanges;
            GM_setValue('trackTitleChanges', this.trackTitleChanges);

            if (this.trackTitleChanges) {
                this.startTitleObserver();
            } else if (this.titleObserver) {
                this.titleObserver.disconnect();
                this.titleObserver = null;
                console.log('[AlbumPageManager]', I18n.t('stopTracking'));
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

        console.log('[AlbumPageManager]', I18n.t('startTracking'));
    }

    async getFolderList() {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                url: "http://localhost:41595/api/folder/list",
                method: "GET",
                onload: res => {
                    try {
                        const folders = JSON.parse(res.responseText).data || [];
                        const list = [];
                        const appendFolder = (f, prefix = "") => {
                            list.push({ id: f.id, name: prefix + f.name });
                            if (f.children && f.children.length) {
                                f.children.forEach(c => appendFolder(c, "　" + prefix + "└─ "));
                            }
                        };
                        folders.forEach(f => appendFolder(f));
                        resolve(list);
                    } catch (e) {
                        console.error("解析資料夾列表失敗", e);
                        resolve([]);
                    }
                },
                onerror: () => resolve([])
            });
        });
    }

    /**
     * 新增資料夾選擇器
     * - 原位置：#taglist 內（inline）
     * - 額外浮動版：固定在左下或右下角，避免與批次按鈕重疊
     * @param {string} [position='right'] - 浮動選單的位置：'left' 或 'right'
     */
    async addFolderSelector(position = 'left') {
        const container = document.querySelector('#taglist');
        if (container && !document.querySelector('#eagleFolderSelector-inline')) {
            const folders = await this.getFolderList();
            const select = document.createElement('select');
            select.id = 'eagleFolderSelector-inline';
            select.style.margin = '4px';
            select.style.padding = '4px 8px';
            select.style.borderRadius = '5px';
            select.style.backgroundColor = 'rgb(79, 83, 91)';
            select.style.color = 'white';
            select.style.border = '1px solid #ccc';
            select.style.fontSize = '14px';

            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = '─ 選擇儲存資料夾 ─';
            select.appendChild(defaultOpt);

            folders.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = f.name;
                if (f.id === this.selectedFolderId) opt.selected = true;
                select.appendChild(opt);
            });

            select.addEventListener('change', (e) => {
                this.selectedFolderId = e.target.value;
                GM_setValue('selectedFolderId', this.selectedFolderId);
                const floatingSelect = document.querySelector('#eagleFolderSelector-floating');
                if (floatingSelect) floatingSelect.value = this.selectedFolderId;
                console.log('[AlbumPageManager] 已更新預設資料夾 ID:', this.selectedFolderId);
            });

            container.appendChild(select);
        }

        // ── 浮動版選擇器（fixed 定位） ──
        if (document.querySelector('#eagleFolderSelector-floating')) return;

        const folders = await this.getFolderList();
        const select = document.createElement('select');
        select.id = 'eagleFolderSelector-floating';

        Object.assign(select.style, {
            position: 'fixed',
            bottom: '50px',
            [position]: '20px',
            zIndex: '10000',
            padding: '8px 12px',
            backgroundColor: 'rgb(79, 83, 91)',
            color: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            outline: 'none',
            transition: 'all 0.2s ease'
        });

        select.addEventListener('mouseenter', () => {
            select.style.backgroundColor = 'rgb(99, 103, 111)';
            select.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
        });
        select.addEventListener('mouseleave', () => {
            select.style.backgroundColor = 'rgb(79, 83, 91)';
            select.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        });

        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '─ 選擇儲存資料夾 ─';
        select.appendChild(defaultOpt);

        folders.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = f.name;
            if (f.id === this.selectedFolderId) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            this.selectedFolderId = e.target.value;
            GM_setValue('selectedFolderId', this.selectedFolderId);
            const inlineSelect = document.querySelector('#eagleFolderSelector-inline');
            if (inlineSelect) inlineSelect.value = this.selectedFolderId;
            console.log('[AlbumPageManager] 已更新預設資料夾 ID:', this.selectedFolderId);
        });

        document.body.appendChild(select);

        console.log(`[AlbumPageManager] 已新增浮動資料夾選擇器，位置：${position}`);
    }

    addAutoButton() {
        const container = document.querySelector('#taglist');
        const buttonExist = document.querySelector('#eagleOnHathPage');
        if (!container || buttonExist) return;
        const button = document.createElement('button');
        button.id = 'eagleOnHathPage';
        this.updateButtonText(button);
        button.style.padding = '3px 5px';
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
        button.textContent = this.isAuto ? I18n.t('autoOn') : I18n.t('autoOff');
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

        console.log('[AlbumPageManager]',I18n.t('albumUpdated', albumTitle));
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
        width: 24px;
        height: 24px;
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

        console.log('[BatchDownloader]',I18n.t('foundThumbs',unprocessedLinks.length));

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
     * 新增批次下載按鈕 - 浮動在頁面左下或右下角
     * @param {string} [position='right'] - 按鈕位置：'left' 或 'right'
     */
    addBatchButton(position = 'left') {
        if (document.querySelector('#eagleOnSPage')) return;

        const button = document.createElement('button');
        button.id = 'eagleOnSPage';
        button.textContent = I18n.t('batchAdd');

        Object.assign(button.style, {
            position: 'fixed',
            bottom: '20px',
            [position]: '20px',
            zIndex: '9999',
            padding: '3px 5px',
            backgroundColor: 'rgb(79, 83, 91)',
            color: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            //boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
            //minWidth: '140px',
            textAlign: 'center'
        });

        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = 'rgb(99, 103, 111)';
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'rgb(79, 83, 91)';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });

        button.addEventListener('click', this.handleBatchClick.bind(this));

        document.body.appendChild(button);

        console.log(`[BatchDownloader] 已新增批次按鈕，位置：${position}`);
    }

    handleBatchClick() {
        const checked = document.querySelectorAll('.eagle-batch-wrapper input[type="checkbox"]:checked');

        if (checked.length === 0) {
            console.error(I18n.t('selectAtLeastOne'));
            return;
        }

        console.log('[BatchDownloader]',I18n.t('batchOpening', checked.length));

        checked.forEach(checkbox => {
            const wrapper = checkbox.closest('.eagle-batch-wrapper');
            const link = wrapper?.querySelector('a[href*="hentai.org/s/"]');
            if (link?.href) {
                GM_openInTab(link.href + '?batch=true', {
                    active: false,
                    insert: true,
                    setParent: true
                });
                checkbox.checked = false;
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
        const picID = picIDMatch[1];

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

        const folderId = GM_getValue('selectedFolderId', '');
        if (folderId) {
            data.folderId = [folderId];
        }

        GM_xmlhttpRequest({
            url: this.EAGLE_IMPORT_API_URL,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(data),
            onload: (response) => {
                console.log('[熊貓 Eagle 支援]', I18n.t('imageAdded'));
                if (response.status >= 200 && response.status < 300 && closeAfter) {
                    window.close();
                }
            },
            onerror: (err) => console.error('[熊貓 Eagle 支援]', I18n.t('eagleError'), err)
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
        GM_registerMenuCommand(I18n.t('cleanMenu'),this.cleanOldData.bind(this));
    }

    cleanOldData() {
        GM_setValue('albumData', {});
        GM_setValue('picData', {});
        alert(I18n.t('cleaned'));
    }
}

class I18n {
    static currentLang = I18n.detectLanguage();

    static detectLanguage() {
        const lang = (navigator.language || 'en').toLowerCase();
        return lang.split('-')[0];
    }

    static messages = {
        zh: {
            autoOn: 'AutoEagle：開啟',
            autoOff: 'AutoEagle：關閉',
            batchAdd: '批次加入 Eagle',
            selectAtLeastOne: '請先勾選至少一張圖片',
            batchOpening: (n) => `開始批次開啟 ${n} 個頁面`,
            trackTitle: (status) => `追蹤標題變化 (目前：${status})`,
            enabled: '開啟',
            disabled: '關閉',
            stopTracking: '已停止追蹤標題變化',
            startTracking: '已開始追蹤標題變化',
            albumUpdated: (title) => `相簿標題已更新為：${title}`,
            foundThumbs: (n) => `發現 ${n} 個尚未包裝的縮圖連結`,
            imageAdded: '圖片已加入 Eagle',
            eagleError: 'Eagle API 發生錯誤',
            cleaned: '已清除舊資料',
            cleanMenu: '清除舊資料',
            selectFolder: '─ 選擇儲存資料夾 ─',
            folderUpdated: (id) => `儲存資料夾已更新，ID: ${id}`
        },

        en: {
            autoOn: 'AutoEagle: On',
            autoOff: 'AutoEagle: Off',
            batchAdd: 'Batch Add to Eagle',
            selectAtLeastOne: 'Please select at least one image',
            batchOpening: (n) => `Opening ${n} pages in batch`,
            trackTitle: (status) => `Track Title Changes (Current: ${status})`,
            enabled: 'On',
            disabled: 'Off',
            stopTracking: 'Stopped tracking title changes',
            startTracking: 'Started tracking title changes',
            albumUpdated: (title) => `Album title updated: ${title}`,
            foundThumbs: (n) => `Found ${n} unwrapped thumbnails`,
            imageAdded: 'Image added to Eagle',
            eagleError: 'Eagle API error',
            cleaned: 'Old data cleaned',
            cleanMenu: 'Clean Old Data',
            selectFolder: '─ Select Folder ─',
            folderUpdated: (id) => `Target folder updated, ID: ${id}`
        },

        ja: {
            autoOn: 'AutoEagle：オン',
            autoOff: 'AutoEagle：オフ',
            batchAdd: 'Eagle に一括追加',
            selectAtLeastOne: '少なくとも1枚選択してください',
            batchOpening: (n) => `${n} ページを一括で開いています`,
            trackTitle: (status) => `タイトル変更を追跡 (現在：${status})`,
            enabled: 'オン',
            disabled: 'オフ',
            stopTracking: 'タイトル追跡を停止しました',
            startTracking: 'タイトル追跡を開始しました',
            albumUpdated: (title) => `アルバムタイトル更新：${title}`,
            foundThumbs: (n) => `未処理サムネイル ${n} 件`,
            imageAdded: 'Eagle に追加しました',
            eagleError: 'Eagle API エラー',
            cleaned: '古いデータを削除しました',
            cleanMenu: '古いデータを削除',
            selectFolder: '─ 保存先フォルダを選択 ─',
            folderUpdated: (id) => `保存先フォルダを更新しました、ID: ${id}`
        }
    };

    static t(key, ...args) {
        const pack = I18n.messages[I18n.currentLang] || I18n.messages.en;
        const value = pack[key] || I18n.messages.en[key];

        if (typeof value === 'function') {
            return value(...args);
        }
        return value || key;
    }
}

const factory = new PicTrioFactory();
factory.getToWork();
new DataCleaner();

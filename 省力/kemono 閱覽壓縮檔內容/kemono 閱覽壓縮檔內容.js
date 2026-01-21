// ==UserScript==
// @name                kemono 閱覽壓縮檔內容
// @name:en             Kemono View ZIP Contents
// @name:ja             Kemono 圧縮ファイル內容閱覧
// @name:de             Kemono ZIP-Inhalte anzeigen
// @name:cs             Kemono prohlížení obsahu archivu
// @name:lt             Kemono peržiūrėti suspaustų failų turinį
// @description         將壓縮檔中的圖片解壓縮至貼文中以提供直接檢視而無需下載
// @description:en      Extract and display images from ZIP files directly in the post without needing to download
// @description:ja      圧縮ファイル內の畫像を投稿內に解凍して表示し、ダウンロードせずに直接閱覧可能にします
// @description:de      Bilder aus ZIP-Dateien direkt im Beitrag entpacken und anzeigen, ohne dass ein Download erforderlich ist
// @description:cs      Rozbalit obrázky ze ZIP souborů přímo do příspěvku pro okamžité zobrazení bez nutnosti stahování
// @description:lt      Išarchyvuoti paveikslėlius iš ZIP failų tiesiai į įrašą, kad būtų galima peržiūrėti be atsisiuntimo
//
// @author       Max
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues
// @license      MPL2.0
//
// @version      1.2.0
// @match        https://kemono.cr/*/user/*/post/*
// @require      https://unpkg.com/@zip.js/zip.js@2.7.53/dist/zip-full.min.js
// @grant        GM_xmlhttpRequest
// @connect      self
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kemono.cr&size=64
// ==/UserScript==

/**
 * 在地化翻譯類別
 */
class I18n {
    constructor() {
        // 取得瀏覽器語系 (例如 "zh-TW" -> "zh")
        const navLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
        this.currentLang = navLang.split('-')[0];

        this.data = {
            zh: {
                read_images: '讀取圖片',
                confirm_retry: '[是否確定再次執行?]',
                downloading: '下載中',
                parsing: '解析中',
                no_images: '無圖片',
                unzipping: '解壓',
                done: '完成',
                failed: '失敗'
            },
            en: {
                read_images: 'Read Images',
                confirm_retry: '[Are you sure to run again?]',
                downloading: 'Downloading',
                parsing: 'Parsing',
                no_images: 'No images',
                unzipping: 'Extracting',
                done: 'Done',
                failed: 'Failed'
            },
            ja: {
                read_images: '畫像を読み込む',
                confirm_retry: '[もう一度実行しますか？]',
                downloading: 'ダウンロード中',
                parsing: '解析中',
                no_images: '畫像なし',
                unzipping: '解凍',
                done: '完了',
                failed: '失敗'
            },
            de: {
                read_images: 'Bilder laden',
                confirm_retry: '[Wirklich erneut ausführen?]',
                downloading: 'Herunterladen',
                parsing: 'Analysieren',
                no_images: 'Keine Bilder',
                unzipping: 'Entpacken',
                done: 'Fertig',
                failed: 'Fehlgeschlagen'
            },
            cs: {
                read_images: 'Načíst obrázky',
                confirm_retry: '[Opravdu spustit znovu?]',
                downloading: 'Stahování',
                parsing: 'Analýza',
                no_images: 'Žádné obrázky',
                unzipping: 'Rozbalování',
                done: 'Hotovo',
                failed: 'Selhalo'
            },
            lt: {
                read_images: 'Skaityti paveikslėlius',
                confirm_retry: '[Ar tikrai paleisti dar kartą?]',
                downloading: 'Atsisiunčiama',
                parsing: 'Analizuojama',
                no_images: 'Nėra paveikslėlių',
                unzipping: 'Išarchyvuojama',
                done: 'Atlikta',
                failed: 'Nepavyko'
            }
        };
    }

    /**
     * 取得翻譯文字，若無該語系則回傳英文
     */
    t(key) {
        const langData = this.data[this.currentLang] || this.data['en'];
        return langData[key] || this.data['en'][key] || key;
    }
}

class ZipImageExtractor {
    constructor() {
        this.CONFIG = {
            LOG_PREFIX: '[Kemono Zip Viewer]',
            EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.jfif'],
            POLLING_INTERVAL: 500,
            MAX_ATTEMPTS: 50
        };
        this.i18n = new I18n(); // 初始化翻譯類別
        this.processedElements = new WeakSet();
        this.attempts = 0;
        this.intervalId = null;
        this.toggleState = true;
    }

    init() {
        console.log(`${this.CONFIG.LOG_PREFIX} 啟動中...`);
        this.startPolling();
    }

    get zipLib() {
        return (typeof zip !== 'undefined') ? zip : (window.zip || self.zip);
    }

    startPolling() {
        this.intervalId = setInterval(() => {
            this.attempts++;
            const lib = this.zipLib;
            if (lib) this.scan();
            if (this.attempts >= this.CONFIG.MAX_ATTEMPTS) {
                clearInterval(this.intervalId);
                console.log(`${this.CONFIG.LOG_PREFIX} 輪詢掃描結束`);
            }
        }, this.CONFIG.POLLING_INTERVAL);
    }

    scan() {
        try {
            const links = document.querySelectorAll('li.post__attachment a:first-of-type');
            links.forEach(link => {
                const href = link.href.toLowerCase().split('?')[0];
                if (href.endsWith('.zip') && !this.processedElements.has(link)) {
                    this.injectButton(link);
                }
            });
        } catch (err) {
            console.error(`${this.CONFIG.LOG_PREFIX} 掃描錯誤:`, err);
        }
    }

    injectButton(link) {
        this.processedElements.add(link);
        const btn = document.createElement('button');
        btn.innerText = this.i18n.t('read_images');

        const btnStyle = {
            padding: "5px 10px",
            backgroundColor: "#282a2e",
            color: "#e8a17d",
            border: "2px solid #3b3e44CC",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            marginLeft: "10px",
            transition: "opacity 0.2s"
        };
        Object.assign(btn.style, btnStyle);

        btn.onmouseover = () => btn.style.opacity = "0.8";
        btn.onmouseout = () => btn.style.opacity = "1";

        btn.onclick = (e) => {
            e.preventDefault();
            this.handleButtonClick(link.href, link, btn);
        };

        link.parentNode.insertBefore(btn, link.nextSibling);
    }

    handleButtonClick(url, anchor, btn) {
        const confirmText = this.i18n.t('confirm_retry');
        if (btn.dataset.processed === 'true') {
            if (btn.innerText !== confirmText) {
                this.updateBtnState(btn, 'confirm', confirmText);
                return;
            }
            delete btn.dataset.processed;
        }
        this.handleUnzipProcess(url, anchor, btn);
    }

    async handleUnzipProcess(url, anchor, btn) {
        const lib = this.zipLib;
        const container = document.querySelector('.post__files');

        if (!lib || !container) return;

        try {
            const response = await this.downloadFile(url, (p) => {
                this.toggleState = !this.toggleState;
                const icon = this.toggleState ? '🈧' : '🈱';
                btn.innerText = `${icon} ${this.i18n.t('downloading')}...${p}%`;
                this.updateBtnState(btn, 'loading', btn.innerText);
            });

            this.updateBtnState(btn, 'loading', `🈵︎ ${this.i18n.t('parsing')}...`);

            const zipReader = new lib.ZipReader(new lib.Uint8ArrayReader(new Uint8Array(response)));
            const entries = await zipReader.getEntries();

            const images = entries.filter(entry =>
                !entry.directory && this.CONFIG.EXTENSIONS.some(ext => entry.filename.toLowerCase().endsWith(ext))
            );

            if (images.length === 0) {
                this.updateBtnState(btn, 'done', `🈳︎ ${this.i18n.t('no_images')}`);
            } else {
                for (let i = 0; i < images.length; i++) {
                    btn.innerText = `🉃 ${this.i18n.t('unzipping')} ${i + 1}/${images.length}`;
                    const blob = await images[i].getData(new lib.BlobWriter());
                    this.renderImage(blob, images[i].filename, container);
                }
                this.updateBtnState(btn, 'done', `🉇 ${this.i18n.t('done')} (${images.length})`);
            }

            await zipReader.close();
            btn.dataset.processed = 'true';

        } catch (err) {
            console.error(`${this.CONFIG.LOG_PREFIX} 錯誤:`, err);
            this.updateBtnState(btn, 'error', `🉈 ${this.i18n.t('failed')}`);
        }
    }

    downloadFile(url, onProgress) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                responseType: "arraybuffer",
                onprogress: (evt) => {
                    if (evt.lengthComputable) onProgress(Math.round((evt.loaded / evt.total) * 100));
                },
                onload: (res) => (res.status === 200) ? resolve(res.response) : reject(res),
                onerror: reject
            });
        });
    }

    renderImage(blob, filename, container) {
        const imageUrl = URL.createObjectURL(blob);
        const div = document.createElement('div');
        div.className = "post__thumbnail";
        const img = document.createElement('img');
        img.src = imageUrl;
        img.title = filename;
        img.style.maxWidth = "100%";
        img.style.display = "block";
        img.onload = () => URL.revokeObjectURL(imageUrl);
        div.appendChild(img);
        container.appendChild(div);
    }

    updateBtnState(btn, state, text) {
        btn.innerText = text;
        btn.disabled = (state === 'loading');

        if (state === 'error') {
            btn.style.borderColor = "#ff4444";
        } else if (state === 'done') {
            btn.style.borderColor = "#44ff44";
        } else if (state === 'confirm') {
            btn.style.borderColor = "#ffaa00";
            btn.style.backgroundColor = "#3a2a00";
        } else {
            btn.style.borderColor = "#3b3e44CC";
            btn.style.backgroundColor = "#282a2e";
        }
    }
}

const JonnTheImgRestocker = new ZipImageExtractor();
JonnTheImgRestocker.init();

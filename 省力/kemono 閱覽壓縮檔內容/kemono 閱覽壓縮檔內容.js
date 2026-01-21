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
// @version      1.0.1
// @match        https://kemono.cr/*/user/*/post/*
// @require      https://unpkg.com/@zip.js/zip.js@2.7.53/dist/zip-full.min.js
// @grant        GM_xmlhttpRequest
// @connect      self
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kemono.cr&size=64
// ==/UserScript==

class ZipImageExtractor {
    constructor() {
        this.CONFIG = {
            LOG_PREFIX: '[Kemono Zip Viewer]',
            EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.jfif'],
            POLLING_INTERVAL: 500,
            MAX_ATTEMPTS: 50
        };
        this.processedElements = new WeakSet();
        this.attempts = 0;
        this.intervalId = null;
    }

    /**
     * 入口點：開始定時掃描
     */
    init() {
        console.log(`${this.CONFIG.LOG_PREFIX} 啟動中...`);
        this.startPolling();
    }

    /**
     * 取得 zip.js 物件
     */
    get zipLib() {
        return (typeof zip !== 'undefined') ? zip : (window.zip || self.zip);
    }

    /**
     * 開始定時掃描（有限次數）
     */
    startPolling() {
        this.intervalId = setInterval(() => {
            this.attempts++;
            const lib = this.zipLib;

            if (lib) {
                //console.log(`${this.CONFIG.LOG_PREFIX} zip.js 已就緒，開始掃描 (${this.attempts}/${this.CONFIG.MAX_ATTEMPTS})`);
                this.scan();
            } else {
                //console.warn(`${this.CONFIG.LOG_PREFIX} 等待 zip.js 載入... (${this.attempts}/${this.CONFIG.MAX_ATTEMPTS})`);
            }

            if (this.attempts >= this.CONFIG.MAX_ATTEMPTS) {
                clearInterval(this.intervalId);
                console.log(`${this.CONFIG.LOG_PREFIX} 達到最大掃描次數，停止尋找`);
            }
        }, this.CONFIG.POLLING_INTERVAL);
    }

    /**
     * 掃描頁面尋找尚未處理的 ZIP 連結
     */
    scan() {
        try {
            const links = document.querySelectorAll('li.post__attachment a:first-of-type');
            links.forEach(link => {
                const href = link.href.toLowerCase().split('?')[0];
                const isZip = href.endsWith('.zip');
                if (isZip && !this.processedElements.has(link)) {
                    this.injectButton(link);
                }
            });
        } catch (err) {
            console.error(`${this.CONFIG.LOG_PREFIX} 掃描時發生錯誤:`, err);
        }
    }

    /**
     * 建立 UI 按鈕
     */
    injectButton(link) {
        this.processedElements.add(link);
        const btn = document.createElement('button');
        btn.innerText = '讀取圖片';
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
            this.handleUnzipProcess(link.href, link, btn);
        };

        link.parentNode.insertBefore(btn, link.nextSibling);
    }

    /**
     * 主處理流程
     */
    async handleUnzipProcess(url, anchor, btn) {
        const lib = this.zipLib;
        const container = document.querySelector('.post__files');

        if (!lib || !container) {
            alert('系統初始化失敗或找不到放置圖片的容器');
            return;
        }

        try {
            let toggle = true;
            const response = await this.downloadFile(url, (p) => {
                toggle = !toggle;
                const icon = toggle ? '🈧' : '🈱';
                this.updateBtnState(btn, 'loading', `${icon} 下載中...${p}%`);
            });

            this.updateBtnState(btn, 'loading', '🈵︎ 解析中...');

            const zipReader = new lib.ZipReader(new lib.Uint8ArrayReader(new Uint8Array(response)));
            const entries = await zipReader.getEntries();

            const images = entries.filter(entry =>
                !entry.directory && this.CONFIG.EXTENSIONS.some(ext => entry.filename.toLowerCase().endsWith(ext))
            );

            if (images.length === 0) {
                this.updateBtnState(btn, 'done', '🈳︎ 無圖片');
            } else {
                for (let i = 0; i < images.length; i++) {
                    btn.innerText = `🉃 解壓 ${i + 1}/${images.length}`;
                    const blob = await images[i].getData(new lib.BlobWriter());
                    this.renderImage(blob, images[i].filename, container);
                }
                this.updateBtnState(btn, 'done', `🉇 完成 (${images.length})`);
            }

            await zipReader.close();
        } catch (err) {
            console.error(`${this.CONFIG.LOG_PREFIX} 錯誤:`, err);
            this.updateBtnState(btn, 'error', '🉈 失敗');
        }
    }

    /**
     * 封裝下載邏輯
     */
    downloadFile(url, onProgress) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                responseType: "arraybuffer",
                onprogress: (evt) => {
                    if (evt.lengthComputable) {
                        onProgress(Math.round((evt.loaded / evt.total) * 100));
                    }
                },
                onload: (res) => (res.status === 200) ? resolve(res.response) : reject(res),
                onerror: reject
            });
        });
    }

    /**
     * 渲染圖片至 DOM
     */
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

    /**
     * 更新按鈕狀態 UI
     */
    updateBtnState(btn, state, text) {
        btn.innerText = text;
        btn.disabled = (state === 'loading');
        if (state === 'error') btn.style.borderColor = "#ff4444";
        if (state === 'done') btn.style.borderColor = "#44ff44";
    }
}

const JonnTheImgRestocker = new ZipImageExtractor();
JonnTheImgRestocker.init();

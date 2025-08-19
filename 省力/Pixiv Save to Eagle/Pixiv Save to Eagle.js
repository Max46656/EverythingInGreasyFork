// ==UserScript==
// @name         Pixiv Save to Eagle
// @name:zh-TW   Pixiv 圖片儲存至 Eagle
// @name:ja      Pixivの畫像を直接Eagleに儲存
// @name:en      Pixiv Save to Eagle
// @name:de      Pixiv-Bilder direkt in Eagle speichern
// @name:es      Guardar imágenes de Pixiv directamente en Eagle
// @description  將 Pixiv 作品圖片與動圖直接存入 Eagle
// @description:zh-TW 直接將 Pixiv 上的圖片與動圖儲存到 Eagle
// @description:ja Pixivの作品畫像とアニメーションを直接Eagleに儲存します
// @description:en  Save Pixiv images & animations directly into Eagle
// @description:de  Speichert Pixiv-Bilder und Animationen direkt in Eagle
// @description:es  Guarda imágenes y animaciones de Pixiv directamente en Eagle
//
// @match        https://www.pixiv.net/artworks/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixiv.net
// @grant        GM_xmlhttpRequest
// @require      https://greasyfork.org/scripts/2963-gif-js/code/gifjs.js?version=8596
// @version      1.0.0
//
// @author       Max
// @namespace    https://github.com/Max46656
// @license      MPL2.0
// ==/UserScript==


class PixivEagleSaver {
    constructor() {
        this.illust = null;
        this.init();
    }

    init() {
        this.addEagleButton();
        this.observeUrlChange(() => {
            this.addEagleButton();
            this.illustApi();
        });
    }

    illustApi() {
        const urlIllustId = location.href.match(/artworks\/(\d*)(#\d*)?$/)?.[1] || '';
        if (!this.illust || String(this.illust?.illustId) !== String(urlIllustId)) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `/ajax/illust/${urlIllustId}`, false);
            xhr.send();
            if (xhr.status === 200) {
                this.illust = JSON.parse(xhr.responseText).body;
            }
        }
        //console.log(this.illust)
        return this.illust;
    }

    isGif() { return this.illust.illustType === 2; }
    isSet() { return this.illust.pageCount > 1; }
    isSingle() {return (this.illust.illustType === 0 || this.illust.illustType === 1) && this.illust.pageCount === 1;}

    saveToEagle(urlOrBase64, name) {
        return new Promise(resolve => {
            const imageData = {
                url: urlOrBase64,
                name: name,
                folderId: [],
                tags: [],
                website: location.href,
                headers: { referer: "https://www.pixiv.net/" }
            };
            GM_xmlhttpRequest({
                url: "http://localhost:41595/api/item/addFromURL",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(imageData),
                onload: response => {
                    if (response.status >= 200 && response.status < 300) {
                        console.log("✅ Added to Eagle:", urlOrBase64);
                    } else {
                        console.error("Failed:", response);
                    }
                    resolve();
                },
                onerror: err => { console.error("Error:", err); resolve(); },
                ontimeout: err => { console.error("Timeout:", err); resolve(); }
            });
        });
    }

    async handleSingle() {
        const url = this.illust.urls.original;
        const name = `${this.illust.userName}_${this.illust.title}`;
        await this.saveToEagle(url, name);
        console.log("已送到 Eagle: " + name);
    }

    async handleSet() {
        const url = this.illust.urls.original;
        const imgUrls = Array.from({ length: this.illust.pageCount }, (_, i) =>
                                   url.replace(/_p\d\./, `_p${i}.`)
                                  );
        for (const [i, u] of imgUrls.entries()) {
            const name = `${this.illust.userName}_${this.illust.title}_${i}`;
            await this.saveToEagle(u, name);
        }
        console.log(`已送 ${this.illust.pageCount} 張到 Eagle`);
    }

    async handleGif() {
        try {
            const metaXhr = new XMLHttpRequest();
            metaXhr.open("GET", `/ajax/illust/${this.illust.illustId}/ugoira_meta`, false);
            metaXhr.send();
            const meta = JSON.parse(metaXhr.responseText).body;
            const frames = meta.frames;

            const gif = new GIF({
                workers: 1,
                quality: 10,
                workerScript: GIF_worker_URL,
            });

            const gifFrames = new Array(frames.length);

            await Promise.all(
                frames.map((frame, idx) => new Promise((resolve, reject) => {
                    const url = this.illust.urls.original.replace("ugoira0.", `ugoira${idx}.`);
                    GM_xmlhttpRequest({
                        method: "GET",
                        url,
                        headers: { referer: "https://www.pixiv.net/" },
                        responseType: "arraybuffer",
                        onload: res => {
                            if (res.status >= 200 && res.status < 300) {
                                const suffix = url.split(".").pop();
                                const mimeType = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" }[suffix];
                                const blob = new Blob([res.response], { type: mimeType });
                                const img = document.createElement("img");
                                const reader = new FileReader();
                                reader.onload = () => {
                                    img.src = reader.result;
                                    img.onload = () => {
                                        gifFrames[idx] = { frame: img, option: { delay: frame.delay } };
                                        resolve();
                                    };
                                    img.onerror = () => reject(new Error("圖片載入失敗: " + url));
                                };
                                reader.readAsDataURL(blob);
                            } else reject(new Error(`下載失敗 ${res.status}: ${url}`));
                        },
                        onerror: reject,
                        ontimeout: reject,
                    });
                }))
            );

            gifFrames.forEach(f => gif.addFrame(f.frame, f.option));

            //gif.on("progress", p => console.log(`GIF 進度: ${Math.round(p * 100)}%`));

            gif.on("finished", async blob => {
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64 = reader.result;
                    const name = `${this.illust.userName}_${this.illust.title}.gif`;
                    await this.saveToEagle(base64, name);
                    console.log("已送動圖到 Eagle: " + name);
                };
                reader.readAsDataURL(blob);
            });

            gif.render();

        } catch (e) {
            console.error("handleGif error:", e);
        }
    }

    waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                const elem = document.querySelector(selector);
                if (elem) {
                    observer.disconnect();
                    resolve(elem);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            if (timeout) {
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`等待元素超時: ${selector}`));
                }, timeout);
            }
        });
    }

    async addEagleButton() {
        try {
            const section = await this.waitForElement("section.gPBXUH");
            if (document.getElementById("save-to-eagle-btn")) return;

            const div = document.createElement("div");
            div.classList.add("cNcUof");

            const btn = document.createElement("button");
            btn.id = "save-to-eagle-btn";
            btn.textContent = "Save to Eagle";
            btn.className= "charcoal-button";
            btn.dataset.variant="Primary";

            btn.onclick = () => {
                if (this.isSingle()) this.handleSingle();
                else if (this.isSet()) this.handleSet();
                else if (this.isGif()) this.handleGif();
                else console.log("不支援此作品類型");
            };

            div.appendChild(btn);
            section.appendChild(div);
        } catch (e) {
            console.error(e);
        }
    }

    observeUrlChange(callback) {
        let oldHref = location.href;
        const title = document.querySelector("title");
        const observer = new MutationObserver(() => {
            if (oldHref !== location.href) {
                oldHref = location.href;
                callback();
            }
        });
        observer.observe(title, { childList: true,});
    }
}

new PixivEagleSaver();

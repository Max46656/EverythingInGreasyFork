// ==UserScript==
// @name         Kemono Save to Eagle
// @name:zh-TW   Kemono 圖片儲存至 Eagle
// @name:ja      Kemonoの畫像を直接Eagleに儲存
// @name:en      Kemono Save to Eagle
// @name:de      Kemono-Bilder direkt in Eagle speichern
// @name:es      Guardar imágenes de Kemono directamente en Eagle
// @description  將 Kemono 作品圖片與動圖直接存入 Eagle
// @description:zh-TW 直接將 Kemono 上的圖片與動圖儲存到 Eagle
// @description:ja Kemonoの作品畫像とアニメーションを直接Eagleに儲存します
// @description:en  Save Kemono images & animations directly into Eagle
// @description:de  Speichert Kemono-Bilder und Animationen direkt in Eagle
// @description:es  Guarda imágenes y animaciones de Kemono directamente en Eagle
//
// @version      1.1.0
// @match        https://kemono.cr/*/user/*/post/*
// @match        https://kemono.cr/*/user/*/post/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kemono.cr
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://greasyfork.org/scripts/2963-gif-js/code/gifjs.js?version=8596
// @run-at       document-end
//
// @author       Max
// @namespace    https://github.com/Max46656
// @license      MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/546402/Kemono%20Save%20to%20Eagle.user.js
// @updateURL https://update.greasyfork.org/scripts/546402/Kemono%20Save%20to%20Eagle.meta.js
// ==/UserScript==

class EagleClient {
    async save(urlOrBase64, name, folderId = []) {
        return new Promise(resolve => {
            const data = {
                url: urlOrBase64,
                name,
                folderId: Array.isArray(folderId) ? folderId : [folderId],
                tags: [],
                website: location.href,
                headers: { referer: "https://kemono.cr/" }
            }

            GM_xmlhttpRequest({
                url: "http://localhost:41595/api/item/addFromURL",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(data),
                onload: r => {
                    if (r.status >= 200 && r.status < 300) {
                        console.log("✅ 已新增:", name)
                    } else {
                        console.error("失敗:", r)
                    }
                    resolve()
                },
                onerror: e => {
                    console.error(e)
                    resolve()
                },
                ontimeout: e => {
                    console.error(e)
                    resolve()
                }
            })
        })
    }

    async getFolderList() {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                url: "http://localhost:41595/api/folder/list",
                method: "GET",
                onload: res => {
                    try {
                        const folders = JSON.parse(res.responseText).data || []
                        const list = []
                        const appendFolder = (f, prefix = "") => {
                            list.push({ id: f.id, name: prefix + f.name })
                            if (f.children && f.children.length) {
                                f.children.forEach(c => appendFolder(c, "└── " + prefix))
                            }
                        }
                        folders.forEach(f => appendFolder(f))
                        resolve(list)
                    } catch (e) {
                        console.error("解析資料夾列表失敗", e)
                        resolve([])
                    }
                },
                onerror: err => {
                    console.error(err)
                    resolve([])
                }
            })
        })
    }
}

class KemonoImage {
    constructor(eagleClient) {
        this.eagle = eagleClient
        this.images = this.fetchImages()
    }

    fetchImages() {
        return Array.from(document.querySelectorAll("div.post__files img")).map((img, index) => ({
            url: img.src,
            name: `${document.querySelector("title")?.textContent} P${index+1}` || `Kemono Image ${img.src.split('/').pop()}`
        }));
    }

    async handleImage(url, name, folderId) {
        await this.eagle.save(url, name, folderId)
        console.log("已送到 Eagle:", name)
    }
}

class KemonoEagleUI {
    constructor() {
        this.eagle = new EagleClient();
        this.kemono = new KemonoImage(this.eagle);
        this.buttonContainerSelector = "h2#Files";
        this.imageSelector = "div.post__files img";
        this.init();
    }

    async init() {
        this.registerPositionMenu()
        this.addButtons()
        await this.addFolderSelect()
        this.addDownloadAllButton()
        this.observeDomChange(() => {
            this.addButtons()
            this.kemono.images = this.kemono.fetchImages()
        })
    }

    async waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector)
            if (el) return resolve(el)
            const obs = new MutationObserver(() => {
                const e = document.querySelector(selector)
                if (e) {
                    obs.disconnect()
                    resolve(e)
                }
            })
            obs.observe(document.body, { childList: true, subtree: true })
            if (timeout) {
                setTimeout(() => {
                    obs.disconnect()
                    reject(new Error("Timeout:" + selector))
                }, timeout)
            }
        })
    }

    registerPositionMenu() {
        GM_registerMenuCommand("選擇按鈕位置", () => {
            const select = document.createElement("select");
            const options = [
                { value: "↖", text: "↖" },
                { value: "↗", text: "↗" },
                { value: "↙", text: "↙" },
                { value: "↘", text: "↘" }
            ];

            options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt.value;
                option.textContent = opt.text;
                if (opt.value === this.buttonPosition) option.selected = true;
                select.appendChild(option);
            });

            const container = document.createElement("div");
            container.style.position = "fixed";
            container.style.top = "50%";
            container.style.left = "50%";
            container.style.transform = "translate(-50%, -50%)";
            container.style.color = "black";
            container.style.backgroundColor = "white";
            container.style.padding = "20px";
            container.style.border = "1px solid #ccc";
            container.style.zIndex = "10000";
            container.style.display = "flex";
            container.style.alignItems = "center";
            container.style.gap = "10px";

            const label = document.createElement("label");
            label.textContent = "選擇按鈕位置：";
            label.style.marginRight = "10px";

            const confirmButton = document.createElement("button");
            confirmButton.textContent = "⭘";
            confirmButton.style.padding = "2px 8px";
            confirmButton.style.backgroundColor = "#28a745";
            confirmButton.style.color = "white";
            confirmButton.style.border = "none";
            confirmButton.style.borderRadius = "4px";
            confirmButton.style.cursor = "pointer";
            confirmButton.style.fontSize = "14px";
            confirmButton.title = "確定選擇";
            confirmButton.setAttribute("aria-label", "確定按鈕位置");
            confirmButton.onclick = async () => {
                this.buttonPosition = select.value;
                console.log("選中位置：", select.value);
                await GM.setValue("buttonPosition", this.buttonPosition);
                console.log("儲存位置：", await GM.getValue("buttonPosition"));
                document.querySelectorAll("[id^=save-to-eagle-btn]").forEach(btn => btn.parentElement.remove());
                this.addButtons(this.buttonPosition);
                container.remove();
            };

            select.onchange = async () => {
                this.buttonPosition = select.value;
                console.log(select.value);
                await GM.setValue("buttonPosition", this.buttonPosition);
                console.log(await GM.getValue("buttonPosition"));
                document.querySelectorAll("[id^=save-to-eagle-btn]").forEach(btn => btn.parentElement.remove());
                this.addButtons(this.buttonPosition);
            };

            container.appendChild(label);
            container.appendChild(select);
            container.appendChild(confirmButton);
            document.body.appendChild(container);
        });
    }
    async addFolderSelect() {
        try {
            const section = await this.waitForElement(this.buttonContainerSelector);
            if (document.getElementById("eagle-folder-select")) return;

            const container = document.createElement("div");
            container.style.margin = "10px 0";
            container.style.display = "flex";
            container.style.alignItems = "center";
            container.style.gap = "8px";

            const LABEL_TEXT = "Eagle 資料夾：";

            const folderLabel = document.createElement("label");
            folderLabel.textContent = LABEL_TEXT;
            folderLabel.htmlFor = "eagle-folder-select";
            folderLabel.style.fontSize = "14px";
            folderLabel.style.fontWeight = "500";
            folderLabel.style.color = "#FFFFFF";

            const select = document.createElement("select");
            select.id = "eagle-folder-select";
            select.style.padding = "5px";
            select.style.fontSize = "14px";

            const lastFolderId = await GM.getValue("eagle_last_folder");

            const folders = await this.eagle.getFolderList();
            folders.forEach(f => {
                const option = document.createElement("option");
                option.value = f.id;
                option.textContent = f.name;
                if (f.id === lastFolderId) option.selected = true;
                select.appendChild(option);
            });

            container.appendChild(folderLabel);
            container.appendChild(select);
            section.appendChild(container);
        } catch (e) {
            console.error("無法新增資料夾選擇器:", e);
        }
    }

    async addDownloadAllButton() {
        try {
            const section = await this.waitForElement(this.buttonContainerSelector);
            const select = document.getElementById("eagle-folder-select");
            console.log(select,document.getElementById("download-all-btn"))
            if (!select || document.getElementById("download-all-btn")) return;

            const container = document.createElement("div");
            container.style.margin = "10px 0";

            const btn = document.createElement("button");
            btn.id = "download-all-btn";
            btn.textContent = "全部儲存到 Eagle";
            btn.style.padding = "5px 10px";
            btn.style.backgroundColor = "#282a2e"
            btn.style.color = "#e8a17d"
            btn.style.border = "2px solid #3b3e44CC";
            btn.style.borderRadius = "4px";
            btn.style.cursor = "pointer";
            btn.style.fontSize = "14px";
            btn.style.marginLeft = "10px";

            btn.onclick = async () => {
                const folderId = select.value;
                await GM.setValue("eagle_last_folder", folderId);
                const images = this.kemono.images;
                for (const [index, image] of images.entries()) {
                    await this.kemono.handleImage(image.url, image.name, folderId);
                    console.log(`已儲存圖片 ${index + 1}/${images.length}`);
                }
                console.log(`已將 ${images.length} 張圖片儲存到 Eagle`);
            };

            container.appendChild(btn);
            select.parentElement.appendChild(container);
        } catch (e) {
            console.error("無法新增全部下載按鈕:", e);
        }
    }

    async addButtons() {
        try {
            const images = await this.waitForElement(this.imageSelector);
            const select = document.getElementById("eagle-folder-select");
            if (!select) return;

            const positionStyles = {
                "↖": { top: "10px", left: "10px" },
                "↗": { top: "10px", right: "10px" },
                "↙": { bottom: "10px", left: "10px" },
                "↘": { bottom: "10px", right: "10px" }
            };
            const position = await GM.getValue("buttonPosition", "↖")
            console.log("position",position, this.buttonPosition)
            document.querySelectorAll(this.imageSelector).forEach((img, index) => {
                if (img.parentElement.querySelector(`#save-to-eagle-btn-${index}`)) return;

                const container = document.createElement("div");
                container.style.position = "absolute";
                container.style.zIndex = "1000";
                Object.assign(container.style, positionStyles[position]);

                const btn = document.createElement("button");
                btn.id = `save-to-eagle-btn-${index}`;
                btn.textContent = "儲存到 Eagle";
                btn.style.padding = "5px 10px";
                btn.style.backgroundColor = "#00000080"
                btn.style.color = "#e8a17d"
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.cursor = "pointer";
                btn.style.fontSize = "12px";

                btn.onclick = async () => {
                    const folderId = select.value;
                    await GM.setValue("eagle_last_folder", folderId);
                    const image = this.kemono.images[index];
                    await this.kemono.handleImage(image.url, image.name, folderId);
                };

                container.appendChild(btn);
                img.parentElement.style.position = "relative";
                img.parentElement.appendChild(container);
            });
        } catch (e) {
            console.error("無法新增按鈕:", e);
        }
    }

    observeDomChange(callback) {
        const observer = new MutationObserver(() => {
            callback()
        })
        observer.observe(document.body, { childList: true, subtree: true })
    }
}

new KemonoEagleUI()

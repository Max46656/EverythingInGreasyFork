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
// @version      1.1.5
// @match        https://www.pixiv.net/artworks/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixiv.net
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://greasyfork.org/scripts/2963-gif-js/code/gifjs.js?version=8596
// @run-at       document-end
//
// @author       Max
// @namespace    https://github.com/Max46656
// @license      MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/546402/Pixiv%20Save%20to%20Eagle.user.js
// @updateURL https://update.greasyfork.org/scripts/546402/Pixiv%20Save%20to%20Eagle.meta.js
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
                headers: { referer: "https://www.pixiv.net/" }
            }

            GM_xmlhttpRequest({
                url: "http://localhost:41595/api/item/addFromURL",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(data),
                onload: r => {
                    if (r.status >= 200 && r.status < 300) {
                        console.log("✅ Added:", name)
                    } else {
                        console.error("Failed:", r)
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

class PixivIllust {
    constructor(eagleClient) {
        this.eagle = eagleClient
        this.illust = this.fetchIllust()
    }

    fetchIllust() {
        const illustId = location.href.match(/artworks\/(\d+)/)?.[1]
        if (!illustId) return null
        if (!this.illust || this.illust.illustId != illustId) {
            const xhr = new XMLHttpRequest()
            xhr.open("GET", `/ajax/illust/${illustId}`, false)
            xhr.send()
            if (xhr.status === 200) {
                this.illust = JSON.parse(xhr.responseText).body
            }
        }
        return this.illust
    }

    isSingle() {
        return (this.illust.illustType === 0 || this.illust.illustType === 1) && this.illust.pageCount === 1
    }

    isSet() {
        return this.illust.pageCount > 1
    }

    isGif() {
        return this.illust.illustType === 2
    }

    async handleSingle(folderId) {
        const illust = this.illust
        const url = illust.urls.original
        const name = `Pixiv @${illust.userName} ${illust.title}(${illust.illustId})`
      await this.eagle.save(url, name, folderId)
        console.log("已送到 Eagle:", name)
    }

    async handleSet(folderId) {
        const illust = this.illust
        const url = illust.urls.original
        const urls = Array.from({ length: illust.pageCount }, (_, i) => url.replace(/_p\d\./, `_p${i}.`))
        for (const [i, u] of urls.entries()) {
            const name = `Pixiv @${illust.userName} ${illust.title}(${illust.illustId})_p${i}`
        await this.eagle.save(u, name, folderId)
        }
        console.log(`已送 ${illust.pageCount} 張到 Eagle`)
    }

    async handleGif(folderId) {
        try {
            const illust = this.illust
            const xhr = new XMLHttpRequest()
            xhr.open("GET", `/ajax/illust/${illust.illustId}/ugoira_meta`, false)
            xhr.send()
            const frames = JSON.parse(xhr.responseText).body.frames

            const gif = new GIF({ workers: 1, quality: 10, workerScript: GIF_worker_URL })
            const gifFrames = new Array(frames.length)

            await Promise.all(frames.map((frame, idx) => new Promise((resolve, reject) => {
                const url = illust.urls.original.replace("ugoira0.", `ugoira${idx}.`)
                GM_xmlhttpRequest({
                    method: "GET",
                    url,
                    headers: { referer: "https://www.pixiv.net/" },
                    responseType: "arraybuffer",
                    onload: res => {
                        if (res.status >= 200 && res.status < 300) {
                            const suffix = url.split(".").pop()
                            const mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" }[suffix]
                            const blob = new Blob([res.response], { type: mime })
                            const img = document.createElement("img")
                            const reader = new FileReader()
                            reader.onload = () => {
                                img.src = reader.result
                                img.onload = () => {
                                    gifFrames[idx] = { frame: img, option: { delay: frame.delay } }
                                    resolve()
                                }
                                img.onerror = () => reject(new Error("圖片載入失敗:" + url))
                            }
                            reader.readAsDataURL(blob)
                        } else {
                            reject(new Error(`下載失敗 ${res.status}: ${url}`))
                        }
                    },
                    onerror: reject,
                    ontimeout: reject
                })
            })))

            gifFrames.forEach(f => gif.addFrame(f.frame, f.option))
            gif.on("finished", async blob => {
                const reader = new FileReader()
                reader.onload = async () => {
                    const base64 = reader.result
                    const name = `Pixiv @${illust.userName} ${illust.title}(${illust.illustId}).gif`
            await this.eagle.save(base64, name, folderId)
                    console.log("已送動圖到 Eagle:", name)
                }
                reader.readAsDataURL(blob)
            })
            gif.render()
        } catch (e) {
            console.error("handleGif error:", e)
        }
    }
}

class PixivEagleUI {
    constructor() {
        this.eagle = new EagleClient()
        this.illust = new PixivIllust(this.eagle)
        this.buttonContainerSelector = "section.kDUrpE"
        this.init()
    }

    init() {
        this.addButton()
        this.observeUrlChange(() => {
            this.addButton()
            this.illust.illust = this.illust.fetchIllust()
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

    async addButton() {
        try {
            const section = await this.waitForElement(this.buttonContainerSelector)
            if (document.getElementById("save-to-eagle-btn")) return

            const container = document.createElement("div")
            container.classList.add("cNcUof")

            const btn = document.createElement("button")
            btn.id = "save-to-eagle-btn"
            btn.textContent = "Save to Eagle"
            btn.className = "charcoal-button"
            btn.dataset.variant = "Primary"

            const select = document.createElement("select")
            select.id = "eagle-folder-select"
            select.style.marginLeft = "8px"

            const lastFolderId = await GM.getValue("eagle_last_folder")

            const folders = await this.eagle.getFolderList()
            folders.forEach(f => {
                const option = document.createElement("option")
                option.value = f.id
                option.textContent = f.name
                if (f.id === lastFolderId) option.selected = true
                select.appendChild(option)
            })

            btn.onclick = async () => {
                const folderId = select.value
                await GM.setValue("eagle_last_folder", folderId)
                this.illust.fetchIllust()
                if (this.illust.isSingle()) {
                    await this.illust.handleSingle(folderId)
                } else if (this.illust.isSet()) {
                    await this.illust.handleSet(folderId)
                } else if (this.illust.isGif()) {
                    await this.illust.handleGif(folderId)
                } else {
                    console.log("不支援此作品類型")
                }
            }

            container.appendChild(btn)
            container.appendChild(select)
            section.appendChild(container)
        } catch (e) {
            console.error(e)
        }
    }

    observeUrlChange(callback) {
        let oldHref = location.href
        const title = document.querySelector("title")
        const observer = new MutationObserver(() => {
            if (oldHref !== location.href) {
                oldHref = location.href
                callback()
            }
        })
        observer.observe(title, { childList: true })
    }
}

new PixivEagleUI()

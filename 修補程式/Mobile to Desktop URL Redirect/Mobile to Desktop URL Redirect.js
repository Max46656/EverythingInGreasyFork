// ==UserScript==
// @name         手機版網址重新導向到電腦版
// @name:en      Mobile to Desktop URL Redirect
// @name:ja      モバイル版URLからデスクトップ版へのリダイレクト
// @name:de      Umleitung von Mobil-URL zur Desktop-Version
// @name:uk      Перенаправлення URL з мобільної на десктопну версію
// @description  當載入手機版網頁時，若電腦版存在，則自動重新導向到電腦版網址。
// @description:en When a mobile webpage is loaded, automatically redirects to the desktop version if it exists.
// @description:ja モバイル版ウェブページが読み込まれた際、デスクトップ版が存在する場合、自動的にデスクトップ版のURLにリダイレクトします。
// @description:de Wenn eine mobile Webseite geladen wird, wird automatisch zur Desktop-Version umgeleitet, falls diese existiert.
// @description:uk Коли завантажується мобільна веб-сторінка, автоматично перенаправляє на десктопну версію, якщо вона існує。
//
// @author       Max
// @namespace    https://github.com/Max46656
//
// @version      1.2.0
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @icon         https://cdn-icons-png.flaticon.com/512/3559/3559356.png
// ==/UserScript==
// @icon from Smashicons

class DesktopSwitcher {
    constructor() {
        this.url = window.location.href;
        this.hostname = window.location.hostname;

        this.mobilePatterns = [
            { regex: /:\/\/m\./, replace: "://" },// https://m.example.com => https://example.com
            { regex: /\/m\//, replace: "/" },// https://example.com/m/page => https://example.com/page
            { regex: /\.mobile\./, replace: "." },// https://mobile.example.com => https://example.com
            { regex: /\/mobile\//, replace: "/" },// https://example.com/mobile/page => https://example.com/page
            { regex: /\.wap\./, replace: "." },// https://wap.example.com => https://example.com
            { regex: /\/wap\//, replace: "/" },// https://example.com/wap/page => https://example.com/page
        ];

        this.blacklist = GM_getValue("blacklist", []);
        this.registerMenu();
        this.switch2Desktop();
    }

    registerMenu() {
        GM_registerMenuCommand("⭘ 加入黑名單：" + this.hostname, () => this.addBlacklist());
        GM_registerMenuCommand("✕ 從黑名單移除：" + this.hostname, () => this.removeBlacklist());
        GM_registerMenuCommand("？ 檢視黑名單", () => this.showBlacklist());
    }

    addBlacklist() {
        const desktopUrl = this.getDesktopUrl();
        if (!desktopUrl || desktopUrl === this.url) {
            if (!this.blacklist.includes(this.hostname)) {
                this.blacklist.push(this.hostname);
                GM_setValue("blacklist", this.blacklist);
                alert("已將 " + this.hostname + " 加入黑名單");
            } else {
                alert(this.hostname + " 已在黑名單中");
            }
        } else {
            GM_xmlhttpRequest({
                method: "HEAD",
                url: desktopUrl,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 400) {
                        const finalUrl = response.finalUrl || desktopUrl;
                        const finalHostname = new URL(finalUrl).hostname;
                        if (!this.blacklist.includes(finalHostname)) {
                            this.blacklist.push(finalHostname);
                            GM_setValue("blacklist", this.blacklist);
                            alert("已將 " + finalHostname + " 加入黑名單");
                        } else {
                            alert(finalHostname + " 已在黑名單中");
                        }
                    } else {
                        alert("無法訪問電腦版，無法加入黑名單。");
                    }
                },
                onerror: () => {
                    alert("請求失敗，無法加入黑名單。");
                }
            });
        }
    }

    removeBlacklist() {
        const desktopUrl = this.getDesktopUrl();
        if (!desktopUrl || desktopUrl === this.url) {
            this.blacklist = this.blacklist.filter(domain => domain !== this.hostname);
            GM_setValue("blacklist", this.blacklist);
            alert("已將 " + this.hostname + " 從黑名單移除");
        } else {
            GM_xmlhttpRequest({
                method: "HEAD",
                url: desktopUrl,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 400) {
                        const finalUrl = response.finalUrl || desktopUrl;
                        const finalHostname = new URL(finalUrl).hostname;
                        this.blacklist = this.blacklist.filter(domain => domain !== finalHostname);
                        GM_setValue("blacklist", this.blacklist);
                        alert("已將 " + finalHostname + " 從黑名單移除");
                    } else {
                        alert("無法訪問電腦版，無法移除黑名單。");
                    }
                },
                onerror: () => {
                    alert("請求失敗，無法移除黑名單。");
                }
            });
        }
    }

    showBlacklist() {
        alert("目前黑名單：\n" + (this.blacklist.length ? this.blacklist.join("\n") : "（空）"));
    }

    getDesktopUrl() {
        for (const pattern of this.mobilePatterns) {
            if (pattern.regex.test(this.url)) {
                return this.url.replace(pattern.regex, pattern.replace);
            }
        }
        return null;
    }

    switch2Desktop() {
        console.log(`嘗試解析 canonical tag: ${this.url}`);
        GM_xmlhttpRequest({
            method: "GET",
            url: this.url,
            timeout: 3000,
            onload: (response) => {
                if (response.status >= 200 && response.status < 400) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, "text/html");
                    const canonical = doc.querySelector('link[rel="canonical"]');
                    if (canonical && canonical.href && canonical.href !== this.url) {
                        try {
                            const canonicalHostname = new URL(canonical.href).hostname;
                            if (this.blacklist.includes(canonicalHostname)) {
                                console.warn(`阻止重新導向，黑名單域名: ${canonicalHostname}`);
                                return;
                            }
                            console.log(`找到 canonical URL: ${canonical.href}`);
                            window.location.replace(canonical.href);
                            return;
                        } catch (error) {
                            console.error(`無效的 canonical URL: ${canonical.href}, 錯誤: ${error.message}`);
                        }
                    } else {
                        console.warn(`未找到有效 canonical tag，嘗試模式符合`);
                    }
                } else {
                    console.error(`無法載入頁面內容: ${response.status}`);
                }
                this.tryPatternMatch();
            },
            onerror: () => {
                console.error(`網絡錯誤: ${this.url}`);
                this.tryPatternMatch();
            },
            ontimeout: () => {
                console.error(`請求超時: ${this.url}`);
                this.tryPatternMatch();
            }
        });

        function tryPatternMatch() {
            const desktopUrl = this.getDesktopUrl();
            if (desktopUrl && desktopUrl !== this.url) {
                console.log(`嘗試切換到電腦版網址: ${desktopUrl}`);
                this.checkDesktopUrl(
                    desktopUrl,
                    (finalUrl, finalHostname) => {
                        if (this.blacklist.includes(finalHostname)) {
                            console.warn(`阻止重新導向，黑名單域名: ${finalHostname}`);
                            return;
                        }
                        console.log(`正在重新導向到電腦版: ${finalUrl}`);
                        window.location.replace(finalUrl);
                    },
                    (errorMessage) => {
                        console.error(`無法切換到電腦版: ${errorMessage}`);
                    }
                );
            } else {
                console.warn(`未找到有效電腦版 URL`);
            }
        }
    }
}

new DesktopSwitcher();

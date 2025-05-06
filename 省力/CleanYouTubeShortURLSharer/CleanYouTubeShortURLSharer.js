// ==UserScript==
// @name         YouTube 乾淨短網址分享器
// @name:en      Clean YouTube Short URL Sharer
// @name:zh-TW   YouTube 乾淨短網址分享器
// @name:ja      YouTubeクリーンショートURLシェア
// @name:es      Compartidor limpio de URL corta de YouTube
// @name:de      Sauberer YouTube-Kurzlink-Teiler
// @description  取代 YouTube 分享按鈕，複製不含追蹤參數的短網址到剪貼簿。
// @description:en Replaces the YouTube Share button with a cleaner version that copies a tracking-free short URL using GM_setClipboard.
// @description:zh-TW 取代 YouTube 分享按鈕，複製不含追蹤參數的短網址到剪貼簿。
// @description:ja YouTubeの共有ボタンを置き換え、トラッキングなしの短縮URLをクリップボードにコピーします。
// @description:es Reemplaza el botón de compartir de YouTube por uno que copia una URL corta sin rastreo al portapapeles.
// @description:de Ersetzt die YouTube-Teilen-Schaltfläche durch eine saubere Version, die einen trackingfreien Kurzlink kopiert.

// @author       Max
// @namespace    https://github.com/Max46656
// @license      MPL2.0

// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @match        https://www.youtube.com/*
// @match        https://www.youtube.com/watch*
// @grant        GM_setClipboard
// @grant        GM.info
// @version      1.0.0
// ==/UserScript==


class YouTubeShortUrlCopier {
    constructor() {
        this.shareButtonSelector = '#actions yt-button-view-model button-view-model button';
        this.notificationDuration = 1000;
        this.pollInterval = 100;
        this.maxAttempts = 30;
        this.attempts = 0;
        this.init();
    }

    init() {
        this.i18n = new LocalizationManager();
        this.waitForShareButton();
    }

    waitForShareButton() {
        const interval = setInterval(() => {
            const originalButton = document.querySelector(this.shareButtonSelector);
            this.attempts++;

            if (originalButton) {
                clearInterval(interval);
                this.replaceShareButton(originalButton);
            } else if (this.attempts >= this.maxAttempts) {
                clearInterval(interval);
                console.warn(this.i18n.get('max_retry', { name: GM_info.script.name }));
            }
        }, this.pollInterval);
    }

    replaceShareButton(originalButton) {
        const newButton = this.createCustomButton(originalButton);
        originalButton.parentNode.replaceChild(newButton, originalButton);
    }

    createCustomButton(originalButton) {
        const button = document.createElement('button');
        button.innerHTML = originalButton.innerHTML;
        button.className = originalButton.className;
        button.style.cssText = originalButton.style.cssText;

        button.addEventListener('click', () => this.handleButtonClick());
        return button;
    }

    handleButtonClick() {
        const shortUrl = this.getShortUrl();
        if (shortUrl) {
            this.copyToClipboard(shortUrl);
            this.showNotification(this.i18n.get('copied', {name: GM_info.script.name,url: shortUrl}));
        } else {
            this.showNotification(this.i18n.get('format_error', { name: GM_info.script.name }));
        }
    }

    getShortUrl() {
        const currentUrl = window.location.href;
        const videoId = new URL(currentUrl).searchParams.get('v');
        return videoId ? `https://youtu.be/${videoId}` : null;
    }

    copyToClipboard(text) {
        GM_setClipboard(text, 'text');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        Object.assign(notification.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: '1000'
        });

        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, this.notificationDuration);
    }
}

class LocalizationManager {
    constructor() {
        const lang = navigator.language.toLowerCase();
        console.log('lang',lang)
        if (lang.startsWith('zh')) this.lang = 'zh';
        else if (lang.startsWith('ja')) this.lang = 'ja';
        else if (lang.startsWith('es')) this.lang = 'es';
        else if (lang.startsWith('de')) this.lang = 'de';
        else this.lang = 'en';
    }

    get(key, replacements = {}) {
        const template = this.messages[this.lang][key] || this.messages['en'][key] || key;
        return template.replace(/\{(\w+)\}/g, (_, name) => replacements[name] || '');
    }

    messages = {
        en: {
            copied:        "{name}:short URL copied: {url}",
            format_error:  "{name}:short URL format changed, please wait for script update",
            no_title:      "{name}:could not find <title> element",
            max_retry:     "{name}:exceeded retry limit, share button not found"
        },
        zh: {
            copied:        "{name}：縮網址已被複製: {url}",
            format_error:  "{name}：縮網址格式改變，請等待腳本更新",
            no_title:      "{name}：找不到 <title> 元素",
            max_retry:     "{name}：超過最大重試次數，無法找到分享按鈕"
        },
        ja: {
            copied:        "{name}:の短縮URLをコピーしました: {url}",
            format_error:  "{name}:の短縮URL形式が変更されました。スクリプトの更新をお待ちください",
            no_title:      "{name}:は <title> 要素を見つけられませんでした",
            max_retry:     "{name}:は最大試行回數を超え、共有ボタンが見つかりません"
        },
        es: {
            copied:        "{name}:URL corta copiada por ${name}: ${url}",
            format_error:  "{name}:El formato de URL corta de ${name} ha cambiado. Espera una actualización del script",
            no_title:      "{name}:no pudo encontrar el elemento <title>",
            max_retry:     "{name}:superó el número máximo de intentos. Botón de compartir no encontrado"
        },
        de: {
            copied:        "{name}:Kurzlink wurde kopiert: ${url}",
            format_error:  "{name}:Kurzlink-Format wurde geändert. Bitte auf ein Skript-Update warten",
            no_title:      "{name}:konnte das <title>-Element nicht finden",
            max_retry:     "{name}:hat die maximale Anzahl an Versuchen überschritten. Teilen-Schaltfläche nicht gefunden"
        }
    };
}

class TitleObserver {
    constructor(onNavigate) {
        this.currentTitle = document.title;
        this.onNavigate = onNavigate;
        this.observe();
    }

    observe() {
        const titleElement = document.querySelector('title');
        if (!titleElement) {
            console.warn('找不到 <title> 元素');
            return;
        }

        const observer = new MutationObserver(() => {
            if (document.title !== this.currentTitle) {
                this.currentTitle = document.title;
                if (window.location.href.startsWith('https://www.youtube.com/watch?v=')) {
                    this.onNavigate();
                }
            }
        });

        observer.observe(titleElement, { childList: true });
    }
}


const johnTheTrackingStoper = new YouTubeShortUrlCopier();
new TitleObserver(() => johnTheTrackingStoper.waitForShareButton());

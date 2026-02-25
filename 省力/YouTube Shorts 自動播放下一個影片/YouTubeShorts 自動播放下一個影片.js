// ==UserScript==
// @name         YouTubeShorts 自動播放下一個影片
// @name:en      YouTubeShorts Auto Play Next
// @name:ja      YouTubeShorts 次の動畫を自動再生
// @name:hi      YouTubeShorts अगला वीडियो स्वचालित रूप से चलाएं
// @name:de      YouTubeShorts Automatisch nächstes Video abspielen
// @name:uk      YouTubeShorts Автоматичне відтворення наступного відео
// @name:cs      YouTubeShorts Automatické přehrávání dalšího videa
// @name:lt      YouTubeShorts Automatinis kito vaizdo įrašo grojimas
// @description  當Shorts播放完後自動播放下一個，附有切換按鈕於影片工具列
// @description:en  Automatically plays the next Short after the current one ends, with a toggle button in the video toolbar
// @description:ja  Shortsの再生が終わったら次の動畫を自動再生、動畫ツールバーに切り替えボタン付き
// @description:hi  Shorts वीडियो समाप्त होने पर अगला वीडियो स्वचालित रूप से चलता है, वीडियो टूलबार में टॉगल बटन के साथ
// @description:de  Spielt automatisch das nächste Short ab, sobald das aktuelle beendet ist – mit Umschalt-Button in der Videoleiste
// @description:uk  Автоматично відтворює наступне Shorts після завершення поточного, з кнопкою перемикання на панелі інструментів відео
// @description:cs  Automaticky přehraje další Short po skončení aktuálního, s přepínacím tlačítkem na panelu nástrojů videa
// @description:lt  Automatiškai groja kitą Short po dabartinio pabaigos, su perjungimo mygtuku vaizdo įrašo įrankių juostoje
//
// @author       Max
// @namespace    https://github.com/Max46656
// @license      MPL2.0
//
// @version      1.3.0
// @match        https://www.youtube.com/shorts/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

class ShortsAutoPlayer {
    constructor() {
        this.progressSelector = 'yt-progress-bar [role="slider"]';
        this.clickSelector    = 'div.yt-spec-touch-feedback-shape__fill';
        this.buttonbarSelector   = '#button-bar';

        this.highThreshold = 95;
        this.lowThreshold  = 0;
        this.lastProgress  = 0;

        this.enabled = GM_getValue('shortsAutoNextEnabled', true);
        this.progressObserver = null;
        this.titleObserver    = null;
        this.toggleButton     = null;

        this.init();
    }

    async init() {
        await this.addAutoNextToggle();

        await this.observeProgress();
        this.observeTitle();
    }

    async addAutoNextToggle() {
        if(document.querySelector("#autoNextToggle")) return;
        try {
            const Buttonbar = await this.waitForElement(this.buttonbarSelector, 20000);

            if (!Buttonbar) {
                console.warn(`${GM_info.script.name} 找不到按鈕的父容器`);
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '4px';
            wrapper.id = 'autoNextToggle';

            const toggle = document.createElement('button');
            toggle.className = 'ytp-autonav-toggle-button';
            toggle.setAttribute('role', 'switch');
            toggle.setAttribute('aria-checked', this.enabled ? 'true' : 'false');
            toggle.setAttribute('aria-label', '自動播放下一個 Shorts');
            toggle.style.background = this.enabled ? '#065fd4' : '#272727';

            const labelDiv = document.createElement('div');
            labelDiv.className = 'yt-spec-button-shape-with-label__label';
            labelDiv.setAttribute('aria-hidden', 'false');

            const span = document.createElement('span');
            span.className =
                'yt-core-attributed-string yt-core-attributed-string--white-space-pre-wrap ' +
                'yt-core-attributed-string--text-alignment-center yt-core-attributed-string--word-wrapping';
            span.setAttribute('role', 'text');
            span.textContent = this.enabled ? 'Auto' : 'Loop';

            labelDiv.appendChild(span);

            wrapper.appendChild(toggle);
            wrapper.appendChild(labelDiv);
            Buttonbar.appendChild(wrapper);

            toggle.addEventListener('click', () => {
                this.toggleAutoPlay();

                toggle.setAttribute('aria-checked', this.enabled ? 'true' : 'false');
                toggle.style.background = this.enabled ? '#065fd4' : '#272727';

                span.textContent = this.enabled ? 'Auto' : 'Loop';
            });

            this.toggleButton = toggle;
            this.statusSpan = span;

            //console.log(`${GM_info.script.name} 已插入自動播放切換器`);
        } catch (err) {
            console.warn(`${GM_info.script.name} 無法找到影片工具列`, err);
        }
    }

    toggleAutoPlay() {
        this.enabled = !this.enabled;
        GM_setValue('shortsAutoNextEnabled', this.enabled);
        //console.log(`${GM_info.script.name} 自動播放已${this.enabled ? '啟用' : '停用'}`);

        if (this.toggleButton) {
            this.toggleButton.setAttribute('aria-checked', this.enabled ? 'true' : 'false');
            this.toggleButton.style.background = this.enabled ? '#065fd4' : '#272727';
        }

        if (!this.enabled && this.progressObserver)
            this.progressObserver.disconnect();
        else if (this.enabled)
            this.observeProgress();
    }

    async observeProgress() {
        if (!this.enabled) return;

        if (this.progressObserver) {
            this.progressObserver.disconnect();
            this.progressObserver = null;
        }

        try {
            const progressEl = await this.waitForElement(this.progressSelector, 10000);
            //console.log(`${GM_info.script.name} 監聽進度條`);

            this.progressObserver = new MutationObserver(() => {
                const val = parseInt(progressEl.getAttribute('aria-valuenow') || '0', 10);

                if (this.lastProgress > this.highThreshold && val === this.lowThreshold) {
                    //console.log(`${GM_info.script.name} 偵測結束`);
                    this.clickToNext();
                }

                this.lastProgress = val;
            });

            this.progressObserver.observe(progressEl, {
                attributes: true,
                attributeFilter: ['aria-valuenow']
            });
        } catch (err) {
            console.warn(`${GM_info.script.name} 監聽進度條失敗`, err);
        }
    }

    observeTitle() {
        const titleEl = document.querySelector('title');
        if (!titleEl) return console.warn(`${GM_info.script.name} 找不到 <title> 元素`);

        let lastTitle = document.title;

        this.titleObserver = new MutationObserver(() => {
            if (document.title !== lastTitle) {
                lastTitle = document.title;
                //console.log(`${GM_info.script.name} 新 Shorts 載入`);
                this.addAutoNextToggle();
                this.observeProgress();
            }
        });

        this.titleObserver.observe(titleEl, { childList: true, subtree: true });
    }

    clickToNext() {
        const button = document.querySelectorAll(this.clickSelector);
        if (button.length === 0) return console.warn(`${GM_info.script.name} 找不到「下一部影片」按鈕`);

        const last = button[button.length - 1];
        last.click();
        //console.log(`${GM_info.script.name} 已點選下一個影片`);
    }

    waitForElement(selector, timeout = 15000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const obs = new MutationObserver(() => {
                const found = document.querySelector(selector);
                if (found) {
                    obs.disconnect();
                    clearTimeout(timer);
                    resolve(found);
                }
            });

            obs.observe(document.body, { childList: true, subtree: true });

            const timer = setTimeout(() => {
                obs.disconnect();
                reject(new Error(`Timeout waiting for ${selector}`));
            }, timeout);
        });
    }
}

new ShortsAutoPlayer();

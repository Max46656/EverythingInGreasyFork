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
// @namespace    https://github.com/Max46656/EverythingInGreasyFork/tree/main/省力/YouTube%20Shorts%20自動播放下一個影片
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues/new?template=bug_report.yml&labels=bug,userscript&title=[YouTubeShorts%20自動播放下一個影片]%20Bug回報
// @license      MPL2.0
//
// @version      1.4.6
// @match        https://www.youtube.com/*
// @match        https://www.youtube.com/shorts/*
// @require      https://update.greasyfork.org/scripts/569411/1772717/SPA%20動態路由監聽器.js#v1.0.2
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

class ShortsAutoPlayer {
    progressSelector = 'yt-progress-bar [role="slider"]';
    nextBtnSelector = 'button:has(path[d="M12 3a1 1 0 00-1 1v13.586l-5.293-5.293a1 1 0 10-1.414 1.414L12 21.414l7.707-7.707a1 1 0 10-1.414-1.414L13 17.586V4a1 1 0 00-1-1Z"])';
    buttonbarSelector = '#button-bar';

    highThreshold = 50;
    lowThreshold = 0;
    lastProgress = 0;

    enabled = GM_getValue('shortsAutoNextEnabled', true);
    nextBtnClickListener = null;
    progressObserver = null;
    toggleButton = null;
    constructor() {
        this.#init();
    }

    async #init() {
        await this.addAutoNextToggle();
        await this.listenNextClick();
        await this.observeProgress();
    }

    async listenNextClick() {
        try {
            if (this.nextBtnClickListener) {
                const oldBtn = document.querySelector(this.nextBtnSelector);
                if (oldBtn) oldBtn.removeEventListener('click', this.nextBtnClickListener);
                this.nextBtnClickListener = null;
            }

            const nextBtn = await this.waitForElement(this.nextBtnSelector, 20000);
            if (!nextBtn) throw new Error(nextBtn);

            this.nextBtnClickListener = () => {
                this.lastProgress = 0;
                console.info(`${GM_info.script.name} 下一部影片按鈕被點選`);
                setTimeout(() => { this.observeProgress() }, 1000);
            };

            nextBtn.addEventListener('click', this.nextBtnClickListener);
            console.info(`${GM_info.script.name} 找到下一部按鈕，已綁定 click 監聽`);
        } catch (err) {
            console.warn(`${GM_info.script.name} 監聽下一部按鈕失敗`, err);
            setTimeout(() => this.observeNext(), 100);
        }
    }

    async observeProgress() {
        if (!this.enabled) return;
        this.lastProgress = 0;
        try {
            if (this.progressObserver) {
                this.progressObserver.disconnect();
                this.progressObserver = null;
                console.log(`${GM_info.script.name} 重置監聽器 ${this.progressObserver}`);
            }

            const progressEl = await this.waitForElement(this.progressSelector, 5000);
            console.log(`${GM_info.script.name} 找到進度條` ,progressEl);

            this.progressObserver = new MutationObserver((mutation) => {
                try{
                    const val = Number(mutation[0].target.getAttribute('aria-valuenow'));
                    console.log(`${GM_info.script.name} 監聽進度條 ${typeof val}${val} ${typeof this.lastProgress}${this.lastProgress}`);
                    if (this.lastProgress >= this.highThreshold && val === this.lowThreshold) {
                        console.log(`${GM_info.script.name} 影片重播`);
                        this.clickToNext();
                        setTimeout(() => { this.listenNextClick() }, 400);
                    }
                    this.lastProgress = val;
                    //console.log(mutation,mutation[0].target,mutation[0].oldValue)
                }catch(err){
                    console.error(err)
                }
            });

            this.progressObserver.observe(progressEl, {
                attributes: true,
                attributeOldValue: true,
                attributeFilter:["aria-valuenow"]
            });
        } catch (err) {
            console.warn(`${GM_info.script.name} 監聽進度條失敗`, err);
        }
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

            //console.info(`${GM_info.script.name} 已插入自動播放切換器`);
        } catch (err) {
            console.warn(`${GM_info.script.name} 無法找到影片工具列`, err);
        }
    }

    toggleAutoPlay() {
        try{
            this.enabled = !this.enabled;
            GM_setValue('shortsAutoNextEnabled', this.enabled);
            console.info(`${GM_info.script.name} 自動播放已${this.enabled ? '啟用' : '停用'}`);

            if (this.toggleButton) {
                this.toggleButton.setAttribute('aria-checked', this.enabled ? 'true' : 'false');
                this.toggleButton.style.background = this.enabled ? '#065fd4' : '#272727';
            }

            if (!this.enabled && this.progressObserver){
                this.progressObserver.disconnect();
            }else if (this.enabled){
                this.observeProgress();
            }
        }catch(err){
            console.warn(`${GM_info.script.name} 切換模式失敗`, err);
        }
    }

    clickToNext() {
        const button = document.querySelector(this.nextBtnSelector);
        if (!button) return console.warn(`${GM_info.script.name} 找不到「下一部影片」按鈕`);
        //this.lastProgress = 0;
        button.click();
        console.info(`${GM_info.script.name} 已點選下一個影片 ${this.lastProgress}`);
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

    destroy() {
        console.info(`${GM_info.script.name} 開始銷毀實例`);

        if (this.progressObserver) {
            this.progressObserver.disconnect();
            this.progressObserver = null;
            console.info(`${GM_info.script.name} 已斷開進度條 MutationObserver`);
        }

        if (this.nextBtnClickListener) {
            const nextBtn = document.querySelector(this.nextBtnSelector);
            if (nextBtn) {
                nextBtn.removeEventListener('click', this.nextBtnClickListener);
                console.info(`${GM_info.script.name} 已移除下一部按鈕的 click 監聽器`);
            }
            this.nextBtnClickListener = null;
        }

        if (this.toggleButton?.parentElement) {
            const wrapper = this.toggleButton.closest('#autoNextToggle');
            if (wrapper && wrapper.parentElement) {
                wrapper.remove();
                console.info(`${GM_info.script.name} 已移除自訂自動播放切換器`);
            }
            this.toggleButton = null;
            this.statusSpan = null;
        }

        console.info(`${GM_info.script.name} 銷毀完成，所有監聽器與 DOM 修改已清理`);
    }
}

let shortsAutoPlayer = null;

const routeHandler = new window.DynamicRouteHandler({
    matchPatterns: [
        /^https?:\/\/(www\.)?youtube\.com\/shorts\/.+/i
    ],
    debug: true,

    onEnter: () => {
        console.info("進入 Shorts → 初始化自動播放");
        if (!shortsAutoPlayer) {
            shortsAutoPlayer = new ShortsAutoPlayer();
        }
    },

    onLeave: () => {
        console.info("離開 Shorts → 清理");
        if (shortsAutoPlayer) {
            shortsAutoPlayer.destroy();
            shortsAutoPlayer = null;
        }
    }
});

routeHandler.start();

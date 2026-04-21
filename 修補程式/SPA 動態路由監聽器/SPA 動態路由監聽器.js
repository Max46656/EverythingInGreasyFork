// ==UserScript==
// @name         SPA 動態路由監聽器
// @description  監聽 SPA 網站的動態路由變化，當網址更改時檢查進入/離開/維持特定網址模式時觸發回調
//
// @namespace    https://github.com/Max46656/EverythingInGreasyFork/edit/main/修補程式/SPA%20動態路由監聽器/SPA%20動態路由監聽器.js
// @version      1.2.0
// @author       Max
//
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

/**
 * Dynamic Route Handler
 * 用於解決使用者腳本在 SPA 網站無法因網址變化重新執行的問題
 *
 * 使用方式 1.直接在建構子當中輸入鍵值對作為參數(支援陣列)
 *
 * const handler = new DynamicRouteHandler({
 *   matchPatterns: [/^https?:\/\/(www\.)?youtube\.com\/shorts\/.+/],
 *   onEnter: () => console.log("進入 Shorts"),
 *   onLeave: () => console.log("離開 Shorts"),
 *   debug: true
 * });
 *
 * handler.start();
 * 或是
 */
/*
2. 新增物件之後以addRule()註冊(同樣支援鍵值對與陣列鍵值對)
const handler = new DynamicRouteHandler();
handler.addRule({
    matchPatterns: [/^https?:\/\/(www\.)?youtube\.com\/shorts\/.+/]
    onEnter: () => console.log("進入 Shorts"),
    onLeave: () => console.log("離開 Shorts"),
    debug: true
});

handler.start();
*/

class DynamicRouteHandler {
    #listeners = [];
    #lastUrl = location.href;
    #intervalId = null;
    #isStarted = false;
    #counter = 0; // 用於確保 ID 唯一性

    constructor(initialRules = null, { debug = false } = {}) {
        this.debug = debug;
        this._log = this.debug ? (...args) => console.log('[DynamicRouteHandler]', ...args) : () => {};

        if (initialRules) {
            const rulesArray = Array.isArray(initialRules) ? initialRules : [initialRules];
            rulesArray.forEach(rule => this.addRule(rule));
        }
    }

    /**
     * 生成唯一 ID
     * @returns {string}
     */
    #generateId() {
        this.#counter++;
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2, 5);
        return `rule-${timestamp}-${this.#counter}-${randomPart}`;
    }

    /**
     * 新增監聽規則
     * @returns {string} listenerId - 可用於 stopRule 的唯一標記
     */
    addRule({ matchPatterns, onEnter, onLeave, onRefresh }) {
        if (!Array.isArray(matchPatterns)) {
            throw new Error('DynamicRouteHandler: matchPatterns 必須為 RegExp 陣列');
        }

        const id = this.#generateId();
        const currentUrl = location.href;
        const isMatch = matchPatterns.some(p => p.test(currentUrl));

        const listener = {
            id,
            matchPatterns,
            onEnter: onEnter || (() => {}),
            onLeave: onLeave || (() => {}),
            onRefresh: onRefresh || null,
            isActive: isMatch
        };

        this.#listeners.push(listener);

        // 如果規則在添加時即符合網址，立即觸發
        if (isMatch) {
            // 使用 setTimeout 確保在回傳 ID 後才執行，避免回呼中拿不到 ID
            setTimeout(() => listener.onEnter(), 0);
        }

        this._log('新增規則:', id, matchPatterns);
        return id;
    }

    /**
     * 停止特定規則的監聽，若該規則目前是啟動狀態，停止前觸發一次 OnLeave
     * @param {string} id - addRule 回傳的唯一 ID
     */
    stopRule(id) {
        const index = this.#listeners.findIndex(l => l.id === id);
        if (index !== -1) {
            const rule = this.#listeners[index];

            if (rule.isActive) {
                rule.onLeave();
                this._log('規則停止：觸發 Leave 清理', id);
            }

            this.#listeners.splice(index, 1);
            this._log('規則已成功移除:', id);
            return true;
        }
        return false;
    }

    #checkAllRules = () => {
        const currentUrl = location.href;

        this.#listeners.forEach(rule => {
            const isMatch = rule.matchPatterns.some(p => p.test(currentUrl));

            if (isMatch && !rule.isActive) {
                rule.isActive = true;
                rule.onEnter();
                this._log('Enter:', rule.id, currentUrl);
            } else if (!isMatch && rule.isActive) {
                rule.isActive = false;
                rule.onLeave();
                this._log('Leave:', rule.id, currentUrl);
            } else if (isMatch && rule.isActive) {
                if (typeof rule.onRefresh === 'function') {
                    rule.onRefresh();
                    this._log('Refresh:', rule.id, currentUrl);
                }
            }
        });
    };

    #handleUrlChange = () => {
        const currentUrl = location.href;
        if (currentUrl !== this.#lastUrl) {
            this.#lastUrl = currentUrl;
            this.#checkAllRules();
        }
    };

    #patchHistory() {
        const wrap = (method) => {
            const original = history[method];
            if (!original || original.isPatched) return;

            history[method] = (...args) => {
                const result = original.apply(history, args);
                this.#handleUrlChange();
                return result;
            };
            history[method].isPatched = true;
        };
        wrap('pushState');
        wrap('replaceState');
    }

    start(checkInterval = 800) {
        if (this.#isStarted) return;
        this.#isStarted = true;

        this.#patchHistory();
        window.addEventListener('popstate', this.#handleUrlChange);
        this.#intervalId = setInterval(this.#handleUrlChange, checkInterval);

        this.#checkAllRules();
        this._log('監聽器已啟動');
    }

    stop() {
        this.#isStarted = false;
        window.removeEventListener('popstate', this.#handleUrlChange);
        if (this.#intervalId) clearInterval(this.#intervalId);
        this._log('監聽器已全面停止');
    }
}

window.DynamicRouteHandler = DynamicRouteHandler;
if(window.DynamicRouteHandler) console.log('[DynamicRouteHandler] v1.2.0 已載入');

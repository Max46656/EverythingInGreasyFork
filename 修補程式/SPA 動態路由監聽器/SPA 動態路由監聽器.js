// ==UserScript==
// @name         SPA 動態路由監聽器
// @description  監聽 SPA 網站的動態路由變化，在進入/離開特定頁面時觸發回調
//
// @namespace    https://github.com/userscripts
// @version      1.0.2
// @author       Max
//
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

/**
 * Dynamic Route Handler v1.0.2
 * 用於解決使用者腳本在 SPA 網站無法因網址變化重新執行的問題
 *
 * 使用範例：
 *
 * const handler = new DynamicRouteHandler({
 *   matchPatterns: [/^https?:\/\/(www\.)?youtube\.com\/shorts\/.+/],
 *   onEnter: () => console.log("進入 Shorts"),
 *   onLeave: () => console.log("離開 Shorts"),
 *   debug: true
 * });
 *
 * handler.start();
 */

if (window.DynamicRouteHandler) {
    console.warn('[DynamicRouteHandler] 已經存在，跳過重複載入');
    return;
}

  /**
   * @class DynamicRouteHandler
   * @description 動態路由變化監聽器
   */
class DynamicRouteHandler {
    #onUrlChange;
    #checkAndTrigger;
    #patchHistoryMethod;

    /**
     * @param {Object} options
     * @param {RegExp[]} options.matchPatterns - 要符合的網址正則陣列（必填）
     * @param {Function} [options.onEnter] - 進入符合頁面時呼叫
     * @param {Function} [options.onLeave] - 離開符合頁面時呼叫
     * @param {number} [options.checkInterval=800] - 備用定時檢查間隔（ms）
     * @param {boolean} [options.debug=false] - 是否輸出除錯訊息
     */
    constructor(options = {}) {
        if (!options.matchPatterns || !Array.isArray(options.matchPatterns) || options.matchPatterns.length === 0) {
            throw new Error('DynamicRouteHandler: 必須提供至少一個 matchPatterns (RegExp 陣列)');
        }

        this.options = {
            matchPatterns: options.matchPatterns,
            onEnter: options.onEnter || (() => {}),
            onLeave: options.onLeave || (() => {}),
            checkInterval: options.checkInterval ?? 800,
            debug: !!options.debug,
        };

        this.isListening = false;
        this.isActive = false;
        this.lastUrl = location.href;
        this.intervalId = null;

        this._log = this.options.debug
            ? (...args) => console.log('[DynamicRouteHandler]', ...args)
        : () => {};

        // 在 constructor 內綁定所有私有方法（箭頭函數確保 this 指向正確）
        this.#onUrlChange = () => {
            this.lastUrl = location.href;
            this.#checkAndTrigger();
        };

        this.#checkAndTrigger = () => {
            const currentUrl = location.href;
            const isMatch = this.options.matchPatterns.some(pattern => pattern.test(currentUrl));

            if (isMatch && !this.isActive) {
                this.isActive = true;
                this.options.onEnter();
                this._log('進入符合頁面', currentUrl);
            } else if (!isMatch && this.isActive) {
                this.isActive = false;
                this.options.onLeave();
                this._log('離開符合頁面', currentUrl);
            }
        };

        this.#patchHistoryMethod = (method) => {
            const original = history[method];
            if (!original) return;

            history[method] = (...args) => {
                const result = original.apply(history, args);
                this.#onUrlChange();
                return result;
            };
            history[method].original = original;
        };
    }

    /**
     * 開始監聽路由變化
     */
    start() {
        if (this.isListening) return;
        this.isListening = true;

        window.addEventListener('popstate', this.#onUrlChange);

        this.#patchHistoryMethod('pushState');
        this.#patchHistoryMethod('replaceState');

        this.intervalId = setInterval(() => {
            if (location.href !== this.lastUrl) {
                this.#onUrlChange();
            }
        }, this.options.checkInterval);

        this.#checkAndTrigger();

        this._log('監聽已啟動');
    }

    /**
     * 停止監聽並清理資源
     */
    stop() {
        if (!this.isListening) return;
        this.isListening = false;

        window.removeEventListener('popstate', this.#onUrlChange);

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this._log('監聽已停止');
    }

    /**
     * 手動觸發一次檢查
     */
    forceCheck() {
        this.#checkAndTrigger();
    }
}

window.DynamicRouteHandler = DynamicRouteHandler;
if(window.DynamicRouteHandler) console.log('[DynamicRouteHandler] v1.0.2 已載入');

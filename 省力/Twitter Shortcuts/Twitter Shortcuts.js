// ==UserScript==
// @name         Twitter快捷鍵
// @name:en      Twitter Shortcuts
// @name:ja      Twitterショートカット
// @name:de      Twitter-Tastenkombinationen
// @name:es      Atajos de Twitter
// @description  為Twitter提供導航選項和貼文互動的快捷鍵，允許使用者自定快捷鍵組合。
// @description:en Provides shortcuts for navigation and post interaction on Twitter, allowing users to customize shortcut combinations.
// @description:ja Twitterでのナビゲーションと投稿のインタラクションのためのショートカットを提供し、ユーザーがショートカットの組み合わせをカスタマイズできるようにします。
// @description:de Bietet Tastenkombinationen für Navigation und Interaktion mit Beiträgen auf Twitter, wobei Benutzer die Tastenkombinationen anpassen können.
// @description:es Proporciona atajos para la navegación y la interacción con publicaciones en Twitter, permitiendo a los usuarios personalizar combinaciones de atajos.

// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_info
// @require      https://update.greasyfork.org/scripts/542910/1632051/%E5%BF%AB%E6%8D%B7%E9%8D%B5%E5%87%BD%E5%BC%8F%E5%BA%AB.js
// @version      1.4.1

// @author       Max
// @namespace    https://github.com/Max46656
// @license      MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/543615/Twitter%E5%BF%AB%E6%8D%B7%E9%8D%B5.user.js
// @updateURL https://update.greasyfork.org/scripts/543615/Twitter%E5%BF%AB%E6%8D%B7%E9%8D%B5.meta.js
// ==/UserScript==

class TwitterShortcuts {
    RuleVersion = 1;
    shortcutLib = new ShortcutLibrary({
              RuleC: false,
              RuleR: true,
              RuleU: ['shortcut'],
              RuleD: false,
          });
    constructor() {
        this.twitterRules = [
            {
                "ruleName": "返回",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "button[data-testid='app-bar-back']",
                "nthElement": 1,
                "shortcut": "CapsLock+Q",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "首頁",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav a[href='/home']",
                "nthElement": 1,
                "shortcut": "CapsLock+w",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "使用者資料",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav a[data-testid='AppTabBar_Profile_Link']",
                "nthElement": 1,
                "shortcut": "CapsLock+e",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "Grok",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav a[href='/i/grok']",
                "nthElement": 1,
                "shortcut": "CapsLock+r",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "搜尋",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav a[href='/explore']",
                "nthElement": 1,
                "shortcut": "CapsLock+t",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "欄位1",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav[aria-live='polite'] a",
                "nthElement": 1,
                "shortcut": "CapsLock+g",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "欄位2",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav[aria-live='polite'] a",
                "nthElement": 2,
                "shortcut": "CapsLock+f",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "欄位3",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav[aria-live='polite'] a",
                "nthElement": 3,
                "shortcut": "CapsLock+d",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "欄位4",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav[aria-live='polite'] a",
                "nthElement": 4,
                "shortcut": "CapsLock+s",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "欄位5",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "nav[aria-live='polite'] a",
                "nthElement": 5,
                "shortcut": "CapsLock+a",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "追蹤/退追使用者",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "button[data-testid$='follow']",
                "nthElement": 1,
                "shortcut": "CapsLock+b",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "時間軸更新",
                "urlPattern": "https://x.com/.*",
                "selectorType": "css",
                "selector": "div[role='status'] button",
                "nthElement": 1,
                "shortcut": "CapsLock+z",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "轉推",
                "urlPattern": "https://x.com/.*/status/[0-9]*/photo/[0-9]*",
                "selectorType": "css",
                "selector": "div[role='group'] button[data-testid='retweet'],div[role='group'] button[data-testid='unretweet']",
                "nthElement": 1,
                "shortcut": "CapsLock+V",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "喜歡推文",
                "urlPattern": "https://x.com/.*/status/[0-9]*/photo/[0-9]*",
                "selectorType": "css",
                "selector": "div[role='group'] button[data-testid='like'],div[role='group'] button[data-testid='unlike']",
                "nthElement": 1,
                "shortcut": "CapsLock+C",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
                "ruleName": "展開推文",
                "urlPattern": "https://x.com/.*/status/[0-9]*/photo/[0-9]*",
                "selectorType": "css",
                "selector": "div[role='group'] button:has(path[d^='M11.59']),div[role='group'] button:has(path[d^='M12.04'])",
                "nthElement": 1,
                "shortcut": "CapsLock+X",
                "ifLinkOpen": false,
                "isEnabled": true
            },
            {
              "ruleName": "導向貼文原po頁面",
              "urlPattern": "https://x.com/.*/status/[0-9]+.*",
              "selectorType": "css",
              "selector": "div[data-testid='Tweet-User-Avatar'] a",
              "nthElement": 1,
              "shortcut": "CapsLock+b",
              "ifLinkOpen": false,
              "isEnabled": true
            },
            {
              "ruleName": "關閉貼文",
              "urlPattern": "https://x.com/.*/status/[0-9]*/photo/[0-9]*",
              "selectorType": "css",
              "selector": "div[role='dialog'] div[role='presentation'] button",
              "nthElement": 1,
              "shortcut": "CapsLock+q",
              "ifLinkOpen": false,
              "isEnabled": true
            }
        ];
        this.init();
    }

    // 初始化Twitter快捷鍵
    // 輸入參數: 無
    // 返回值: void
    init() {
        this.addTwitterRules();
        this.migrationTwitterRules();
    }

    // 新增Twitter規則（若規則尚未存在）
    // 輸入參數: 無
    // 返回值: void
    addTwitterRules() {
        const existingRules = this.shortcutLib.getRules();
        const hasTwitterRules = existingRules.some(rule =>
                                                   this.twitterRules.some(twitterRule =>
                                                                          twitterRule.ruleName === rule.ruleName &&
                                                                          twitterRule.urlPattern === rule.urlPattern &&
                                                                          twitterRule.selector === rule.selector
                                                                         )
                                                  );

        if (!hasTwitterRules) {
            this.twitterRules.forEach(rule => {
                const success = this.shortcutLib.addRule(rule);
                if (success) {
                    console.log(`${GM_info.script.name}: 成功新增規則 "${rule.ruleName}"`);
                }
            });
        } else {
            //console.log(`${GM_info.script.name}: Twitter規則已存在，跳過新增`);
        }
    }

    /**
     * 遷移 Twitter (X) 相關規則
     * 以程式碼中定義的 this.twitterRules 為準，強制更新已儲存的規則
     * 用於規則格式變更或內容更新時
     */
    migrationTwitterRules() {
        if (GM_getValue('clickRulesVersion', 0) >= this.RuleVersion) return;
        const existingRules = this.shortcutLib.getRules();
        let updatedCount = 0;

        this.twitterRules.forEach(newRule => {
            const existingIndex = existingRules.findIndex(existing =>
                existing.ruleName === newRule.ruleName &&
                existing.urlPattern === newRule.urlPattern
            );

            if (existingIndex !== -1) {
                this.shortcutLib.updateRule(existingIndex, newRule);
                updatedCount++;
                console.log(`${GM_info.script.name}: 已更新規則 "${newRule.ruleName}" (index: ${existingIndex})`);
            } else {
                const success = this.shortcutLib.addRule(newRule);
                if (success) {
                    console.log(`${GM_info.script.name}: 已新增規則 "${newRule.ruleName}"`);
                    updatedCount++;
                }
            }
        });

        GM_setValue('clickRulesVersion', this.RuleVersion);

        console.log(`${GM_info.script.name}: Twitter 規則遷移完成，共處理 ${updatedCount} 條規則 (新版本: ${this.RuleVersion})`);
    }
}

// 啟動Twitter快捷鍵
const twitterShortcuts = new TwitterShortcuts();

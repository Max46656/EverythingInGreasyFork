// ==UserScript==
// @name        流暢巴哈動畫瘋
// @description 我宣示我同意並滿足分級製度的年齡並已誠實的觀看廣告。
// @namespace    https://github.com/Max46656
// @version     1.1.0
// @author      Max
// @match       https://ani.gamer.com.tw/animeVideo.php*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=gamer.com.tw
// @grant       none
// @license MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/503557/%E6%B5%81%E6%9A%A2%E5%B7%B4%E5%93%88%E5%8B%95%E7%95%AB%E7%98%8B.user.js
// @updateURL https://update.greasyfork.org/scripts/503557/%E6%B5%81%E6%9A%A2%E5%B7%B4%E5%93%88%E5%8B%95%E7%95%AB%E7%98%8B.meta.js
// @require https://update.greasyfork.org/scripts/540506/1612671/Click%20It%20For%20You%20Library.js
// ==/UserScript==

const clickLib = new ClickItForYou();

const rules = [
    {
        ruleName: "我已滿18歲",
        urlPattern: "https://ani.gamer.com.tw/animeVideo.php\\?sn=.*",
        selectorType: "css",
        selector: "button.choose-btn-agree",
        nthElement: 1,
        clickDelay: 500,
        keepClicking: false,
        ifLinkOpen: true
    },
    {
        ruleName: "跳過廣告",
        urlPattern: "https://ani.gamer.com.tw/animeVideo.php\\?sn=.*",
        selectorType: "css",
        selector: "video-js div.enable,button[aria-label='Skip Ad'],[aria-label='關閉廣告'],button[aria-label='略過廣告']",
        nthElement: 1,
        clickDelay: 500,
        keepClicking: false,
        ifLinkOpen: true
    }
];

// 添加規則並檢查重複
rules.forEach((rule, index) => {
    const existingRules = clickLib.getRules().data;
    const exists = existingRules.some(r =>
                                      r.ruleName === rule.ruleName &&
                                      r.urlPattern === rule.urlPattern &&
                                      r.selector === rule.selector
                                     );
    if (!exists) {
        const result = clickLib.addRule(rule);
        if (result.success) {
            console.log(`[${GM_info.script.name}] 規則 "${rule.ruleName}" 添加成功 (索引: ${existingRules.length + index})`);
        } else {
            console.error(`[${GM_info.script.name}] 規則 "${rule.ruleName}" 添加失敗: ${result.error}`);
        }
    } else {
        console.log(`[${GM_info.script.name}] 規則 "${rule.ruleName}" 已存在，跳過添加`);
    }
});

const runResult = clickLib.runTasks();
console.log(`[${GM_info.script.name}] 初始任務執行: ${runResult.success ? '成功' : `失敗 (${runResult.error})`} (規則數: ${clickLib.getRules().data.length})`);

let lastSn = new URL(window.location.href).searchParams.get('sn');

const oldPushState = history.pushState;
history.pushState = function pushState() {
    const result = oldPushState.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return result;
};

const oldReplaceState = history.replaceState;
history.replaceState = function replaceState() {
    const result = oldReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return result;
};

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
});

window.addEventListener('locationchange', () => {
    const currentSn = new URL(window.location.href).searchParams.get('sn');
    if (currentSn !== lastSn) {
        console.log(`[${GM_info.script.name}] 檢測到 sn 變化: ${lastSn} -> ${currentSn}`);
        lastSn = currentSn;
        const clearResult = clickLib.clearTasks();
        console.log(`[${GM_info.script.name}] 清除任務: ${clearResult.success ? '成功' : `失敗 (${clearResult.error})`}`);
        const runResult = clickLib.runTasks();
        console.log(`[${GM_info.script.name}] 重新執行任務: ${runResult.success ? '成功' : `失敗 (${runResult.error})`}`);
    }
});
        console.log(`[${GM_info.script.name}] 重新執行任務: ${runResult.success ? '成功' : `失敗 (${runResult.error})`}`);
    }
});

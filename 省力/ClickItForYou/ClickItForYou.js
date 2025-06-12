// ==UserScript==
// @name         click it for you
// @name:zh-TW   click it for you
// @name:ja      あなたのためにクリック
// @name:en      click it for you
// @name:ko      당신을 위해 클릭
// @name:es      Clic automático para ti
// @description  在符合正則表達式的網址上自動點擊指定的元素。
// @description:zh-TW 在符合正則表達式的網址上自動點擊指定的元素。
// @description:ja 正規表現に一致するURLで指定された要素を自動的にクリックします。
// @description:en Automatically clicks specified elements on URLs matching a regular expression.
// @description:ko 정규 표현식과 일치하는 URL에서 지정된 요소를 자동으로 클릭합니다.
// @description:es Hace clic automáticamente en elementos especificados en URLs que coinciden con una expresión regular.

// @author       Max
// @namespace    https://github.com/Max46656

// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @version      1.0.0
// @license MPL2.0
// ==/UserScript==

class AutoClickManager {

    constructor() {
        this.clickRules = GM_getValue('clickRules', []);
        this.init();
    }

    clickRules;

    init(){
        this.registerMenu();
        this.runAutoClicks();
    }

    // 儲存組態至本地存儲
    saveConfigs() {
        GM_setValue('clickRules', this.clickRules);
    }

    // 根據選擇器類型獲取元素
    getElements(selectorType, selector) {
        if (selectorType === 'xpath') {
            const nodes = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            const elements = [];
            for (let i = 0; i < nodes.snapshotLength; i++) {
                elements.push(nodes.snapshotItem(i));
            }
            return elements;
        } else if (selectorType === 'css') {
            return Array.from(document.querySelectorAll(selector));
        }
        return [];
    }

    // 執行單條規則的自動點擊
    autoClick(rule) {
        const urlRegex = new RegExp(rule.urlPattern);
        if (!urlRegex.test(window.location.href)) {
            return;
        }

        const elements = this.getElements(rule.selectorType, rule.selector);
        if (elements.length === 0) {
            console.warn(`${GM_info.script.name}:"${rule.ruleName}" 未找到符合元素：`, rule.selector);
            return;
        }

        if (rule.nthElement < 1 || rule.nthElement > elements.length) {
            console.warn(`${GM_info.script.name}:"${rule.ruleName}" 的 nthElement 無效：${rule.nthElement}，找到 ${elements.length} 個元素`);
            return;
        }

        const targetElement = elements[rule.nthElement - 1];
        if (targetElement) {
            console.log(`${GM_info.script.name}:"${rule.ruleName}" 點擊元素：`, targetElement);
            targetElement.click();
        } else {
            console.warn(`${GM_info.script.name}:"${rule.ruleName}" 未找到目標元素`);
        }
    }

    // 執行所有符合規則的自動點擊
    runAutoClicks() {
        this.clickRules.rules.forEach((rule, index) => {
            if (rule.urlPattern && rule.selector) {
                setTimeout(() => this.autoClick(rule), rule.clickDelay || 1000);
            } else {
                console.warn(`${GM_info.script.name}:"${rule.ruleName}" 無效（索引 ${index}）：缺少 urlPattern 或 selector`);
            }
        });
    }

    // 創建組態選單
    createMenu() {
        const menu = document.createElement('div');
        menu.style.position = 'fixed';
        menu.style.top = '10px';
        menu.style.right = '10px';
        menu.style.background = 'rgb(36, 36, 36)';
        menu.style.color = 'rgb(204, 204, 204)';
        menu.style.border = '1px solid rgb(80, 80, 80)';
        menu.style.padding = '10px';
        menu.style.zIndex = '10000';
        menu.style.maxWidth = '400px';
        menu.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        menu.innerHTML = `
                <style>
                    #autoClickMenu input, #autoClickMenu select, #autoClickMenu button {
                        background: rgb(50, 50, 50);
                        color: rgb(204, 204, 204);
                        border: 1px solid rgb(80, 80, 80);
                        margin: 5px 0;
                        padding: 5px;
                        width: 100%;
                        box-sizing: border-box;
                    }
                    #autoClickMenu button {
                        cursor: pointer;
                        margin-right: 5px;
                    }
                    #autoClickMenu button:hover {
                        background: rgb(70, 70, 70);
                    }
                    #autoClickMenu label {
                        margin-top: 5px;
                        display: block;
                    }
                    #autoClickMenu .ruleHeader {
                        cursor: pointer;
                        background: rgb(50, 50, 50);
                        padding: 5px;
                        margin: 5px 0;
                        border-radius: 3px;
                    }
                    #autoClickMenu .ruleDetails {
                        padding: 5px;
                        border: 1px solid rgb(80, 80, 80);
                        border-radius: 3px;
                        margin-bottom: 5px;
                    }
                </style>
                <div id="autoClickMenu">
                    <h3>設定自動點擊</h3>
                    <div id="rulesList"></div>
                    <h4>新增規則</h4>
                    <label>規則名稱：</label>
                    <input type="text" id="ruleName" placeholder="例如：我的規則">
                    <label>網址正則表達式：</label>
                    <input type="text" id="urlPattern" placeholder="例如：https://example\\.com/.*">
                    <label>選擇器類型：</label>
                    <select id="selectorType">
                        <option value="css">CSS</option>
                        <option value="xpath">XPath</option>
                    </select>
                    <label>選擇器：</label>
                    <input type="text" id="selector" placeholder="例如：button.submit 或 //button[@class='submit']">
                    <label>第幾個元素（從 1 開始）：</label>
                    <input type="number" id="nthElement" min="1" value="1">
                    <label>點擊延遲（毫秒）：</label>
                    <input type="number" id="clickDelay" min="0" value="1000">
                    <button id="addRule" style="margin-top: 10px;">新增規則</button>
                    <button id="closeMenu" style="margin-top: 10px;">關閉</button>
                </div>
            `;
        document.body.appendChild(menu);

        // 更新規則列表
        this.updateRulesList();

        // 新增規則按鈕事件
        document.getElementById('addRule').addEventListener('click', () => {
            const newRule = {
                ruleName: document.getElementById('ruleName').value || `規則 ${this.clickRules.rules.length + 1}`,
                urlPattern: document.getElementById('urlPattern').value,
                selectorType: document.getElementById('selectorType').value,
                selector: document.getElementById('selector').value,
                nthElement: parseInt(document.getElementById('nthElement').value) || 1,
                clickDelay: parseInt(document.getElementById('clickDelay').value) || 1000
            };
            this.clickRules.rules.push(newRule);
            this.saveConfigs();
            this.updateRulesList();
            document.getElementById('ruleName').value = '';
            document.getElementById('urlPattern').value = '';
            document.getElementById('selector').value = '';
            document.getElementById('nthElement').value = '1';
            document.getElementById('clickDelay').value = '1000';
        });

        // 關閉選單按鈕事件
        document.getElementById('closeMenu').addEventListener('click', () => {
            menu.remove();
        });
    }

    // 更新規則列表（僅顯示當前網址符合的規則）
    updateRulesList() {
        const rulesList = document.getElementById('rulesList');
        rulesList.innerHTML = '<h4>符合的規則</h4>';
        const currentUrl = window.location.href;
        const matchingRules = this.clickRules.rules.filter(rule => {
            try {
                return new RegExp(rule.urlPattern).test(currentUrl);
            } catch (e) {
                console.error(`${GM_info.script.name}:規則 "${rule.ruleName}" 的正則表達式無效：`, rule.urlPattern);
                return false;
            }
        });

        if (matchingRules.length === 0) {
            rulesList.innerHTML += '<p>當前網址無符合的規則。</p>';
            return;
        }

        matchingRules.forEach((rule, index) => {
            const globalIndex = this.clickRules.rules.indexOf(rule);
            const ruleDiv = document.createElement('div');
            ruleDiv.innerHTML = `
                    <div class="ruleHeader" id="ruleHeader${globalIndex}">
                        <strong>${rule.ruleName || `規則 ${globalIndex + 1}`}</strong>
                    </div>
                    <div class="ruleDetails" id="ruleDetails${globalIndex}" style="display: none;">
                        <strong>規則 ${globalIndex + 1}</strong><br>
                        名稱：${rule.ruleName || '未命名'}<br>
                        網址：${rule.urlPattern}<br>
                        類型：${rule.selectorType}<br>
                        選擇器：${rule.selector}<br>
                        第幾個元素：${rule.nthElement}<br>
                        延遲：${rule.clickDelay}毫秒<br>
                        <button id="deleteRule${globalIndex}">刪除</button>
                    </div>
                `;
            rulesList.appendChild(ruleDiv);

            // 為規則標題添加點擊事件（縮小/展開）
            document.getElementById(`ruleHeader${globalIndex}`).addEventListener('click', () => {
                const details = document.getElementById(`ruleDetails${globalIndex}`);
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });

            // 為刪除按鈕添加點擊事件
            document.getElementById(`deleteRule${globalIndex}`).addEventListener('click', () => {
                this.clickRules.rules.splice(globalIndex, 1);
                this.saveConfigs();
                this.updateRulesList();
            });
        });
    }

    // 註冊選單命令
    registerMenu() {
        GM_registerMenuCommand('組態自動點擊', () => this.createMenu());
    }
}

const johnTheYubisaku = new AutoClickManager();

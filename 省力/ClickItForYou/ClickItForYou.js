// ==UserScript==
// @name         click it for you
// @name:zh-TW   click it for you
// @name:ja      あなたのためにクリック
// @name:en      click it for you
// @name:de      Für dich klicken
// @name:es      Clic automático para ti
// @description  在符合正則表達式的網址上自動點擊指定的元素。
// @description:zh-TW 在符合正則表達式的網址上自動點擊指定的元素。
// @description:ja 正規表現に一致するURLで指定された要素を自動的にクリックします。
// @description:en Automatically clicks specified elements on URLs matching a regular expression.
// @description:de Klickt automatisch auf angegebene Elemente auf URLs, die mit einem regulären Ausdruck übereinstimmen.
// @description:es Hace clic automáticamente en elementos especificados en URLs que coinciden con una expresión regular.

// @author       Max
// @namespace    https://github.com/Max46656

// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @version      1.0.1
// @license MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/539191/click%20it%20for%20you.user.js
// @updateURL https://update.greasyfork.org/scripts/539191/click%20it%20for%20you.meta.js
// ==/UserScript==

class AutoClickManager {

    clickRules;

    i18n = {
        'zh-TW': {
            title: '自動點擊設定',
            matchingRules: '符合的規則',
            noMatchingRules: '當前網址無符合的規則。',
            addRuleSection: '新增規則',
            ruleName: '規則名稱：',
            urlPattern: '網址正則表達式：',
            selectorType: '選擇器類型：',
            selector: '選擇器：',
            nthElement: '第幾個元素（從 1 開始）：',
            clickDelay: '點擊延遲（毫秒）：',
            addRule: '新增規則',
            save: '儲存',
            delete: '刪除',
            ruleNamePlaceholder: '例如：我的規則',
            urlPatternPlaceholder: '例如：https://example\\.com/.*',
            selectorPlaceholder: '例如：button.submit 或 //button[@class="submit"]'
        },
        'en': {
            title: 'Auto Click Configuration',
            matchingRules: 'Matching Rules',
            noMatchingRules: 'No rules match the current URL.',
            addRuleSection: 'Add New Rule',
            ruleName: 'Rule Name:',
            urlPattern: 'URL Pattern (Regex):',
            selectorType: 'Selector Type:',
            selector: 'Selector:',
            nthElement: 'Nth Element (1-based):',
            clickDelay: 'Click Delay (ms):',
            addRule: 'Add Rule',
            save: 'Save',
            delete: 'Delete',
            ruleNamePlaceholder: 'e.g., My Rule',
            urlPatternPlaceholder: 'e.g., https://example\\.com/.*',
            selectorPlaceholder: 'e.g., button.submit or //button[@class="submit"]'
        },
        'ja': {
            title: '自動クリック設定',
            matchingRules: '一致するルール',
            noMatchingRules: '現在のURLに一致するルールはありません。',
            addRuleSection: '新しいルールを追加',
            ruleName: 'ルール名：',
            urlPattern: 'URLパターン（正規表現）：',
            selectorType: 'セレクタタイプ：',
            selector: 'セレクタ：',
            nthElement: '何番目の要素（1から）：',
            clickDelay: 'クリック遅延（ミリ秒）：',
            addRule: 'ルールを追加',
            save: '保存',
            delete: '削除',
            ruleNamePlaceholder: '例：マイルール',
            urlPatternPlaceholder: '例：https://example\\.com/.*',
            selectorPlaceholder: '例：button.submit または //button[@class="submit"]'
        },
        'de': {
            title: 'Automatische Klick-Einstellungen',
            matchingRules: 'Passende Regeln',
            noMatchingRules: 'Keine Regeln passen zur aktuellen URL.',
            addRuleSection: 'Neue Regel hinzufügen',
            ruleName: 'Regelname:',
            urlPattern: 'URL-Muster (Regulärer Ausdruck):',
            selectorType: 'Selektortyp:',
            selector: 'Selektor:',
            nthElement: 'N-tes Element (ab 1):',
            clickDelay: 'Klickverzögerung (Millisekunden):',
            addRule: 'Regel hinzufügen',
            save: 'Speichern',
            delete: 'Löschen',
            ruleNamePlaceholder: 'Beispiel: Meine Regel',
            urlPatternPlaceholder: 'Beispiel: https://example\\.com/.*',
            selectorPlaceholder: 'Beispiel: button.submit oder //button[@class="submit"]'
        },
        'es': {
            title: 'Configuración de Clic Automático',
            matchingRules: 'Reglas Coincidentes',
            noMatchingRules: 'No hay reglas que coincidan con la URL actual.',
            addRuleSection: 'Agregar Nueva Regla',
            ruleName: 'Nombre de la Regla:',
            urlPattern: 'Patrón de URL (Regex):',
            selectorType: 'Tipo de Selector:',
            selector: 'Selector:',
            nthElement: 'N-ésimo Elemento (desde 1):',
            clickDelay: 'Retraso de Clic (ms):',
            addRule: 'Agregar Regla',
            save: 'Guardar',
            delete: 'Eliminar',
            ruleNamePlaceholder: 'Ejemplo: Mi Regla',
            urlPatternPlaceholder: 'Ejemplo: https://example\\.com/.*',
            selectorPlaceholder: 'Ejemplo: button.submit o //button[@class="submit"]'
        }
    };

    constructor() {
        this.clickRules = GM_getValue('clickRules', {rules: []});
        this.registerMenu();
        this.runAutoClicks();
    }

    // 執行所有匹配規則的自動點擊
    runAutoClicks() {
        this.clickRules.rules.forEach((rule, index) => {
            if (rule.urlPattern && rule.selector) {
                setTimeout(() => this.autoClick(rule), rule.clickDelay || 1000);
            } else {
                console.warn(`${GM_info.script.name}：規則 "${rule.ruleName}" 無效（索引 ${index}）：缺少 urlPattern 或 selector`);
            }
        });
    }

    // 執行單條規則的自動點擊
    autoClick(rule) {
        const urlRegex = new RegExp(rule.urlPattern);
        if (!urlRegex.test(window.location.href)) {
            return;
        }

        const elements = this.getElements(rule.selectorType, rule.selector);
        if (elements.length === 0) {
            console.warn(`${GM_info.script.name}：規則 "${rule.ruleName}" 未找到匹配元素：`, rule.selector);
            return;
        }

        if (rule.nthElement < 1 || rule.nthElement > elements.length) {
            console.warn(`${GM_info.script.name}：規則 "${rule.ruleName}" 的 nthElement 無效：${rule.nthElement}，找到 ${elements.length} 個元素`);
            return;
        }

        const targetElement = elements[rule.nthElement - 1];
        if (targetElement) {
            console.warn(`${GM_info.script.name}：規則 "${rule.ruleName}" 點擊元素：`, targetElement);
            targetElement.click();
        } else {
            console.warn(`${GM_info.script.name}：規則 "${rule.ruleName}" 未找到目標元素`);
        }
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

    // 創建配置選單
    createMenu() {
        const i18n = this.i18n[this.getLanguage()];
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
        #autoClickMenu {
            overflow-y: auto; /* 啟用垂直滾動條 */
            max-height: 80vh; /* 限制高度以啟用滾動 */
        }
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
            cursor: pointer; /* 設置滑鼠游標為指針 */
        }
        #autoClickMenu button:hover {
            background: rgb(70, 70, 70); /* 滑鼠懸停時更改背景色 */
        }
        #autoClickMenu label {
            margin-top: 5px;
            display: block; /* 標籤顯示為塊元素 */
        }
        #autoClickMenu .ruleHeader {
            cursor: pointer; /* 設置滑鼠游標為指針 */
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
        #autoClickMenu .headerContainer {
            display: flex; /* 使用彈性佈局 */
            justify-content: space-between; /* 內容兩端對齊 */
            align-items: center; /* 垂直居中對齊 */
            margin-bottom: 10px;
        }
        #autoClickMenu .closeButton {
            width: auto; /* 根據內容設定最小寬度 */
            padding: 5px 10px; /* 一致的垂直內距，最小的水平內距 */
            margin: 0; /* 移除外距以正確對齊 */
        }
        </style>
        <div id="autoClickMenu">
            <div class="headerContainer">
                <h3>${i18n.title}</h3>
                <button id="closeMenu" class="closeButton">✕</button>
            </div>
            <div id="rulesList"></div>
            <h4>${i18n.addRuleSection}</h4>
            <label>${i18n.ruleName}</label>
            <input type="text" id="ruleName" placeholder="${i18n.ruleNamePlaceholder}">
            <label>${i18n.urlPattern}</label>
            <input type="text" id="urlPattern" placeholder="${i18n.urlPatternPlaceholder}">
            <label>${i18n.selectorType}</label>
            <select id="selectorType">
                <option value="css">CSS</option>
                <option value="xpath">XPath</option>
            </select>
            <label>${i18n.selector}</label>
            <input type="text" id="selector" placeholder="${i18n.selectorPlaceholder}">
            <label>${i18n.nthElement}</label>
            <input type="number" id="nthElement" min="1" value="1">
            <label>${i18n.clickDelay}</label>
            <input type="number" id="clickDelay" min="0" value="1000">
            <button id="addRule" style="margin-top: 10px;">${i18n.addRule}</button>
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
            this.saveRules();
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

    // 更新規則列表（僅顯示當前網址匹配的規則）
    updateRulesList() {
        const rulesList = document.getElementById('rulesList');
        const i18n = this.i18n[this.getLanguage()];
        rulesList.innerHTML = `<h4>${i18n.matchingRules}</h4>`;
        const currentUrl = window.location.href;
        const matchingRules = this.clickRules.rules.filter(rule => {
            try {
                return new RegExp(rule.urlPattern).test(currentUrl);
            } catch (e) {
                console.warn(`${GM_info.script.name}：規則 "${rule.ruleName}" 的正則表達式無效：`, rule.urlPattern);
                return false;
            }
        });

        if (matchingRules.length === 0) {
            rulesList.innerHTML += `<p>${i18n.noMatchingRules}</p>`;
            return;
        }

        matchingRules.forEach((rule, index) => {
            const globalIndex = this.clickRules.rules.indexOf(rule);
            const lang = this.getLanguage();
            const i18n = this.i18n[lang];
            const ruleDiv = document.createElement('div');
            ruleDiv.innerHTML = `
                <div class="ruleHeader" id="ruleHeader${globalIndex}">
                    <strong>${rule.ruleName || `規則 ${globalIndex + 1}`}</strong>
                </div>
                <div class="ruleDetails" id="ruleDetails${globalIndex}" style="display: none;">
                    <label>${i18n.ruleName}</label>
                    <input type="text" id="editRuleName${globalIndex}" value="${rule.ruleName || ''}">
                    <label>${i18n.urlPattern}</label>
                    <input type="text" id="editUrlPattern${globalIndex}" value="${rule.urlPattern}">
                    <label>${i18n.selectorType}</label>
                    <select id="editSelectorType${globalIndex}">
                        <option value="css" ${rule.selectorType === 'css' ? 'selected' : ''}>CSS</option>
                        <option value="xpath" ${rule.selectorType === 'xpath' ? 'selected' : ''}>XPath</option>
                    </select>
                    <label>${i18n.selector}</label>
                    <input type="text" id="editSelector${globalIndex}" value="${rule.selector}">
                    <label>${i18n.nthElement}</label>
                    <input type="number" id="editNthElement${globalIndex}" min="1" value="${rule.nthElement}">
                    <label>${i18n.clickDelay}</label>
                    <input type="number" id="editClickDelay${globalIndex}" min="0" value="${rule.clickDelay}">
                    <button id="saveRule${globalIndex}">${i18n.save}</button>
                    <button id="deleteRule${globalIndex}">${i18n.delete}</button>
                </div>
            `;
                rulesList.appendChild(ruleDiv);

                // 為規則標題添加點擊事件（縮小/展開）
                document.getElementById(`ruleHeader${globalIndex}`).addEventListener('click', () => {
                    const details = document.getElementById(`ruleDetails${globalIndex}`);
                    details.style.display = details.style.display === 'none' ? 'block' : 'none';
                });

                // 為儲存按鈕添加點擊事件
                document.getElementById(`saveRule${globalIndex}`).addEventListener('click', () => {
                    this.clickRules.rules[globalIndex] = {
                        ruleName: document.getElementById(`editRuleName${globalIndex}`).value || `規則 ${globalIndex + 1}`,
                        urlPattern: document.getElementById(`editUrlPattern${globalIndex}`).value,
                        selectorType: document.getElementById(`editSelectorType${globalIndex}`).value,
                        selector: document.getElementById(`editSelector${globalIndex}`).value,
                        nthElement: parseInt(document.getElementById(`editNthElement${globalIndex}`).value) || 1,
                        clickDelay: parseInt(document.getElementById(`editClickDelay${globalIndex}`).value) || 1000
                    };
                    this.saveRules();
                    this.updateRulesList();
                });

                // 為刪除按鈕添加點擊事件
                document.getElementById(`deleteRule${globalIndex}`).addEventListener('click', () => {
                    this.clickRules.rules.splice(globalIndex, 1);
                    this.saveRules();
                    this.updateRulesList();
                });
            });
        }

    // 獲取當前語言
    getLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        if (lang.startsWith('zh')) return 'zh-TW';
        if (lang.startsWith('ja')) return 'ja';
        if (lang.startsWith('ko')) return 'ko';
        if (lang.startsWith('es')) return 'es';
        return 'en'; // 預設英文
    }

    // 儲存組態至本地存儲
    saveRules() {
        GM_setValue('clickRules', this.clickRules);
    }

    // 註冊選單命令
    registerMenu() {
        GM_registerMenuCommand(this.i18n[this.getLanguage()].title, () => this.createMenu());
    }
}

const johnTheYubisaku = new AutoClickManager();

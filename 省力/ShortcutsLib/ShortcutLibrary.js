/**name => ShortcutLibrary
description => 根據網址(正規表達式)聆聽按鍵事件點選指定元素的函式庫，提供點選規則與快捷鍵的 CRUD 操作。
version => 1.0.1
author => Max
namespace => https://github.com/Max46656
license => MPL2.0
本程式具有以下依賴，須添加在你使用的腳本中
@grant        GM_getValue
@grant        GM_setValue
@grant        GM_info
*/
class ShortcutAPI {
    constructor() {
        // 初始化：設定規則管理器和快捷鍵處理器
        this.ruleManager = new RuleManager();
        this.shortcutHandler = new ShortcutHandler(this.ruleManager);
    }

    // 新增快捷鍵規則
    // 輸入參數: rule (object) - 規則物件，包含 ruleName, urlPattern, selectorType, selector, nthElement, shortcut, ifLinkOpen, isEnabled
    // 返回值: boolean - 是否成功新增規則
    addRule(rule) {
        if (!this.validateRule(rule)) {
            console.warn(`${GM_info.script.name}: 無效的規則物件: ${JSON.stringify(rule)}`);
            return false;
        }
        const conflicts = this.checkConflicts(rule, window.location.href);
        if (conflicts.length > 0) {
            conflicts.forEach(conflict => {
                console.warn(`${GM_info.script.name}: 新規則 "${rule.ruleName}" 檢測到${conflict.type === 'shortcut' ? '相同的快捷鍵組合' : '相同的目標元素'}: 與規則 "${conflict.rule.ruleName}" 衝突 (快捷鍵: ${conflict.rule.shortcut}, 選擇器: ${conflict.rule.selector}, 第幾個元素: ${conflict.rule.nthElement})`);
            });
        }
        this.ruleManager.addRule(rule);
        return true;
    }

    // 更新指定索引的規則
    // 輸入參數: index (number) - 規則索引
    //           rule (object) - 更新後的規則物件
    // 返回值: boolean - 是否成功更新規則
    updateRule(index, rule) {
        if (!this.validateRule(rule)) {
            console.warn(`${GM_info.script.name}: 無效的更新規則物件: ${JSON.stringify(rule)}`);
            return false;
        }
        const conflicts = this.checkConflicts(rule, window.location.href, index);
        if (conflicts.length > 0) {
            conflicts.forEach(conflict => {
                console.warn(`${GM_info.script.name}: 更新規則 "${rule.ruleName}" 檢測到${conflict.type === 'shortcut' ? '相同的快捷鍵組合' : '相同的目標元素'}: 與規則 "${conflict.rule.ruleName}" 衝突 (快捷鍵: ${conflict.rule.shortcut}, 選擇器: ${conflict.rule.selector}, 第幾個元素: ${conflict.rule.nthElement})`);
            });
        }
        this.ruleManager.updateRule(index, rule);
        return true;
    }

    // 刪除指定索引的規則
    // 輸入參數: index (number) - 規則索引
    // 返回值: boolean - 是否成功刪除規則
    deleteRule(index) {
        if (index < 0 || index >= this.ruleManager.clickRules.rules.length) {
            console.warn(`${GM_info.script.name}: 無效的規則索引: ${index}`);
            return false;
        }
        this.ruleManager.deleteRule(index);
        return true;
    }

    // 獲取所有規則
    // 輸入參數: 無
    // 返回值: array - 包含所有規則的陣列
    getRules() {
        return this.ruleManager.clickRules.rules;
    }

    // 檢查規則是否與現有規則衝突
    // 輸入參數: rule (object) - 待檢查的規則物件
    //           url (string) - 檢查衝突的網址
    //           excludeIndex (number, optional) - 排除檢查的規則索引
    // 返回值: array - 包含衝突資訊的陣列
    checkConflicts(rule, url, excludeIndex = -1) {
        return this.ruleManager.checkConflicts(rule, url, excludeIndex);
    }

    // 啟用指定規則
    // 輸入參數: index (number) - 規則索引
    // 返回值: boolean - 是否成功啟用規則
    enableRule(index) {
        if (index < 0 || index >= this.ruleManager.clickRules.rules.length) {
            console.warn(`${GM_info.script.name}: 無效的規則索引: ${index}`);
            return false;
        }
        const rule = this.ruleManager.clickRules.rules[index];
        rule.isEnabled = true;
        this.ruleManager.updateRules();
        return true;
    }

    // 停用指定規則
    // 輸入參數: index (number) - 規則索引
    // 返回值: boolean - 是否成功停用規則
    disableRule(index) {
        if (index < 0 || index >= this.ruleManager.clickRules.rules.length) {
            console.warn(`${GM_info.script.name}: 無效的規則索引: ${index}`);
            return false;
        }
        const rule = this.ruleManager.clickRules.rules[index];
        rule.isEnabled = false;
        this.ruleManager.updateRules();
        return true;
    }

    // 驗證規則是否有效
    // 輸入參數: rule (object) - 規則物件
    // 返回值: boolean - 是否為有效規則
    validateRule(rule) {
        if (!rule || typeof rule !== 'object') return false;
        try {
            new RegExp(rule.urlPattern);
        } catch (e) {
            console.warn(`${GM_info.script.name}: 無效的正則表達式: ${rule.urlPattern}`);
            return false;
        }
        if (!rule.selector || !['css', 'xpath'].includes(rule.selectorType)) {
            console.warn(`${GM_info.script.name}: 無效的選擇器: ${rule.selector}`);
            return false;
        }
        if (!this.shortcutHandler.validateShortcut(rule.shortcut)) {
            console.warn(`${GM_info.script.name}: 無效的快捷鍵: ${rule.shortcut}`);
            return false;
        }
        return true;
    }
}

// 規則管理類，負責儲存、驗證和管理快捷鍵規則
class RuleManager {
    constructor() {
        // 初始化：從 GM_getValue 取得規則，若無則使用預設空規則集
        this.clickRules = this.sanitizeRules(GM_getValue('clickRules', { rules: [] }));
    }

    // 清理並驗證規則，確保規則格式正確
    // 輸入參數: clickRules (object) - 包含規則陣列的物件
    // 返回值: object - 清理後的規則物件
    sanitizeRules(clickRules) {
        const defaultRule = {
            ruleName: '',
            urlPattern: '.*',
            selectorType: 'css',
            selector: '',
            nthElement: 1,
            shortcut: 'Control+A',
            ifLinkOpen: false,
            isEnabled: true
        };
        const validRules = clickRules.rules.filter(rule => {
            return rule && typeof rule === 'object' && rule.shortcut && this.isValidShortcut(rule.shortcut);
        }).map(rule => ({
            ...defaultRule,
            ...rule,
            ruleName: rule.ruleName || `規則 ${clickRules.rules.indexOf(rule) + 1}`,
            isEnabled: rule.isEnabled !== undefined ? rule.isEnabled : true
        }));
        return { rules: validRules };
    }

    // 驗證快捷鍵格式是否有效
    // 輸入參數: shortcut (string) - 快捷鍵字串，例如 "Control+A"
    // 返回值: boolean - 是否為有效快捷鍵
    isValidShortcut(shortcut) {
        const validModifiers = ['Control', 'Alt', 'Shift', 'CapsLock', 'NumLock'];
        if (!shortcut || typeof shortcut !== 'string') return false;
        const parts = shortcut.split('+');
        if (parts.length < 2 || parts.length > 3) return false;
        const mainKey = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1);
        return modifiers.every(mod => validModifiers.includes(mod)) && mainKey.length === 1 && /^[a-zA-Z0-9]$/.test(mainKey);
    }

    // 檢查新規則是否與現有規則衝突
    // 輸入參數: newRule (object) - 新規則物件
    //           currentUrl (string) - 當前網址
    //           excludeIndex (number) - 排除檢查的規則索引（用於更新時）
    // 返回值: array - 包含衝突資訊的陣列
    checkConflicts(newRule, currentUrl, excludeIndex = -1) {
        const conflicts = [];
        this.clickRules.rules.forEach((rule, index) => {
            if (index === excludeIndex) return;
            try {
                if (new RegExp(rule.urlPattern).test(currentUrl)) {
                    if (rule.shortcut.toLowerCase() === newRule.shortcut.toLowerCase()) {
                        conflicts.push({ type: 'shortcut', rule, index });
                    } else if (rule.selector === newRule.selector && rule.nthElement === newRule.nthElement) {
                        conflicts.push({ type: 'element', rule, index });
                    }
                }
            } catch (e) {
                console.warn(`${GM_info.script.name}: 規則 "${rule.ruleName}" 的正則表達式無效: ${rule.urlPattern}`);
            }
        });
        return conflicts;
    }

    // 新增規則到規則集
    // 輸入參數: newRule (object) - 新規則物件
    // 返回值: void
    addRule(newRule) {
        this.clickRules.rules.push(newRule);
        this.updateRules();
    }

    // 更新指定索引的規則
    // 輸入參數: index (number) - 規則索引
    //           updatedRule (object) - 更新後的規則物件
    // 返回值: void
    updateRule(index, updatedRule) {
        this.clickRules.rules[index] = updatedRule;
        this.updateRules();
    }

    // 刪除指定索引的規則
    // 輸入參數: index (number) - 規則索引
    // 返回值: void
    deleteRule(index) {
        this.clickRules.rules.splice(index, 1);
        this.updateRules();
    }

    // 將規則集儲存到 GM_setValue
    // 輸入參數: 無
    // 返回值: void
    updateRules() {
        GM_setValue('clickRules', this.clickRules);
    }
}

// 快捷鍵處理類，負責監聽鍵盤事件並執行點選動作
class ShortcutHandler {
    constructor(ruleManager) {
        // 初始化：設定規則管理器並綁定鍵盤事件監聽器
        this.ruleManager = ruleManager;
        this.keydownHandler = (event) => this.handleKeydown(event);
        window.addEventListener('keydown', this.keydownHandler);
    }

    // 驗證快捷鍵格式是否有效
    // 輸入參數: shortcut (string) - 快捷鍵字串
    // 返回值: boolean - 是否為有效快捷鍵
    validateShortcut(shortcut) {
        const validModifiers = ['Control', 'Alt', 'Shift', 'CapsLock', 'NumLock'];
        if (!shortcut) return false;
        const parts = shortcut.split('+');
        if (parts.length < 2 || parts.length > 3) return false;
        const mainKey = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1);
        return modifiers.every(mod => validModifiers.includes(mod)) && mainKey.length === 1 && /^[a-zA-Z0-9]$/.test(mainKey);
    }

    // 處理鍵盤按下事件，檢查是否符合快捷鍵並執行動作
    // 輸入參數: event (KeyboardEvent) - 鍵盤事件物件
    // 返回值: void
    handleKeydown(event) {
        const currentUrl = window.location.href;
        this.ruleManager.clickRules.rules.forEach((rule, index) => {
            try {
                if (!rule.isEnabled || !new RegExp(rule.urlPattern).test(currentUrl)) return;

                const shortcutParts = rule.shortcut.split('+');
                const mainKey = shortcutParts[shortcutParts.length - 1];
                const modifiers = shortcutParts.slice(0, -1);

                const allModifiersPressed = modifiers.every(mod => event.getModifierState(mod));
                const mainKeyPressed = event.key.toUpperCase() === mainKey.toUpperCase();

                if (allModifiersPressed && mainKeyPressed) {
                    event.preventDefault();
                    this.clickElement(rule, index);
                }
            } catch (e) {
                console.warn(`${GM_info.script.name}: 處理規則 "${rule.ruleName}" 時發生錯誤: ${e}`);
            }
        });
    }

    // 執行點選指定元素的動作
    // 輸入參數: rule (object) - 規則物件
    //           ruleIndex (number) - 規則索引
    // 返回值: boolean - 是否成功點選元素
    clickElement(rule, ruleIndex) {
        try {
            const elements = this.getElements(rule.selectorType, rule.selector);
            if (elements.length === 0) {
                console.warn(`${GM_info.script.name}: 規則 "${rule.ruleName}" 未找到符合元素: ${rule.selector}`);
                return false;
            }

            let targetIndex;
            if (rule.nthElement > 0) {
                targetIndex = rule.nthElement - 1;
            } else if (rule.nthElement < 0) {
                targetIndex = elements.length + rule.nthElement;
            } else {
                console.warn(`${GM_info.script.name}: 規則 "${rule.ruleName}" 的 nthElement 無效: 0 不允許`);
                return false;
            }

            if (targetIndex < 0 || targetIndex >= elements.length) {
                console.warn(`${GM_info.script.name}: 規則 "${rule.ruleName}" 的 nthElement 無效: ${rule.nthElement}, 找到 ${elements.length} 個元素`);
                return false;
            }

            const targetElement = elements[targetIndex];
            if (targetElement) {
                console.log(`${GM_info.script.name}: 規則 "${rule.ruleName}" 成功點選元素:`, targetElement);
                if (rule.ifLinkOpen && targetElement.tagName === "A" && targetElement.href) {
                    window.location.href = targetElement.href;
                } else {
                    targetElement.click();
                }
                return true;
            } else {
                console.warn(`${GM_info.script.name}: 規則 "${rule.ruleName}" 的目標元素未找到`);
                return false;
            }
        } catch (e) {
            console.warn(`${GM_info.script.name}: 規則 "${rule.ruleName}" 執行失敗: ${e}`);
            return false;
        }
    }

    // 根據選擇器類型獲取元素
    // 輸入參數: selectorType (string) - 選擇器類型 ('css' 或 'xpath')
    //           selector (string) - 選擇器字串
    // 返回值: array - 符合的元素陣列
    getElements(selectorType, selector) {
        try {
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
        } catch (e) {
            console.warn(`${GM_info.script.name}: 選擇器 "${selector}" 無效: ${e}`);
            return [];
        }
    }
}

window.ShortcutLibrary = ShortcutAPI;

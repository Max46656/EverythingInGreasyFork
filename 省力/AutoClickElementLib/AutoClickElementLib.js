// ==UserScript==
// @name         自動點選元素函式庫
// @name:ja      自動クリック要素ライブラリ
// @name:en      Auto-Click Element Library
// @name:de      Automatische Klick-Bibliothek
// @name:es      Biblioteca de Clic Automático
// @description  根據網址(正規表達式)自動點選指定元素的函式庫，提供點選規則與點選任務的 CRUD 操作。
// @description:ja 正規表現に一致するURLで指定された要素を自動的にクリックするライブラリで、クリックルールとタスクのCRUD操作を提供します。
// @description:en A library for auto-clicking specified elements on URLs matching a regular expression, with CRUD operations for click rules and tasks.
// @description:de Eine Bibliothek zum automatischen Klicken von Elementen auf URLs, die einem regulären Ausdruck entsprechen, mit CRUD-Operationen für Klickregeln und -aufgaben.
// @description:es Una biblioteca para clics automáticos en elementos especificados en URLs que coinciden con una expresión regular, con operaciones CRUD para reglas y tareas de clic。
// @version      1.0.0
// @author       Max
// @namespace    https://github.com/Max46656
// @license      MPL2.0
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_info
// ==/UserScript==

class RuleManager {
    constructor() {
        this.clickRules = GM_getValue('clickRules', { rules: [] });
    }
 
    addRule(newRule) {
        this.clickRules.rules.push(newRule);
        this.updateRules();
    }
 
    updateRule(index, updatedRule) {
        if (index < 0 || index >= this.clickRules.rules.length) {
            throw new Error(`Invalid rule index: ${index}`);
        }
        this.clickRules.rules[index] = updatedRule;
        this.updateRules();
    }
 
    deleteRule(index) {
        if (index < 0 || index >= this.clickRules.rules.length) {
            throw new Error(`Invalid rule index: ${index}`);
        }
        this.clickRules.rules.splice(index, 1);
        this.updateRules();
    }
 
    getRules(filter = null) {
        if (!filter) return this.clickRules.rules;
        return this.clickRules.rules.filter(rule => {
            try {
                return new RegExp(rule.urlPattern).test(filter);
            } catch (e) {
                console.warn(`${GM_info.script.name}: Invalid regex in rule "${rule.ruleName}": ${rule.urlPattern}`);
                return false;
            }
        });
    }
 
    updateRules() {
        GM_setValue('clickRules', this.clickRules);
    }
}
 
class ClickTaskManager {
    constructor(ruleManager) {
        this.ruleManager = ruleManager;
        this.intervalIds = {};
    }
 
    addTask(ruleIndex) {
        const rule = this.ruleManager.getRules()[ruleIndex];
        if (!rule) {
            throw new Error(`Invalid rule index: ${ruleIndex}`);
        }
        if (!rule.urlPattern || !rule.selector) {
            throw new Error(`Invalid rule: missing urlPattern or selector`);
        }
        if (this.intervalIds[ruleIndex]) {
            clearInterval(this.intervalIds[ruleIndex]);
            delete this.intervalIds[ruleIndex];
            console.log(`${GM_info.script.name}: Cleared existing task for rule "${rule.ruleName}" (index: ${ruleIndex})`);
        }
        const intervalId = setInterval(() => {
            const clicked = this.autoClick(rule, ruleIndex);
            if (clicked && !rule.keepClicking) {
                clearInterval(this.intervalIds[ruleIndex]);
                delete this.intervalIds[ruleIndex];
                console.log(`${GM_info.script.name}: Task stopped for rule "${rule.ruleName}" (index: ${ruleIndex}) due to successful click and keepClicking=false`);
            }
        }, rule.clickDelay || 1000);
        this.intervalIds[ruleIndex] = intervalId;
        console.log(`${GM_info.script.name}: Task started for rule "${rule.ruleName}" (index: ${ruleIndex}, intervalId: ${intervalId})`);
        return intervalId;
    }
 
    runTasks() {
        this.ruleManager.getRules().forEach((rule, index) => {
            if (!this.intervalIds[index]) {
                try {
                    this.addTask(index);
                } catch (e) {
                    console.warn(`${GM_info.script.name}: Failed to start task for rule "${rule.ruleName}" (index: ${index}): ${e.message}`);
                }
            } else {
                console.log(`${GM_info.script.name}: Skipped task for rule "${rule.ruleName}" (index: ${index}) as it is already running`);
            }
        });
    }
 
    clearTasks() {
        Object.keys(this.intervalIds).forEach(index => {
            clearInterval(this.intervalIds[index]);
            console.log(`${GM_info.script.name}: Cleared task for rule index ${index}`);
            delete this.intervalIds[index];
        });
    }
 
    autoClick(rule, ruleIndex) {
        try {
            const urlRegex = new RegExp(rule.urlPattern);
            if (!urlRegex.test(window.location.href)) {
                return false;
            }
 
            const elements = this.getElements(rule.selectorType, rule.selector);
            if (elements.length === 0) {
                console.warn(`${GM_info.script.name}: No elements found for rule "${rule.ruleName}": ${rule.selector}`);
                return false;
            }
 
            if (rule.nthElement < 1 || rule.nthElement > elements.length) {
                console.warn(`${GM_info.script.name}: Invalid nthElement for rule "${rule.ruleName}": ${rule.nthElement}, found ${elements.length} elements`);
                return false;
            }
 
            const targetElement = elements[rule.nthElement - 1];
            if (targetElement) {
                console.log(`${GM_info.script.name}: Successfully clicked element for rule "${rule.ruleName}":`, targetElement);
                if (rule.ifLinkOpen && targetElement.tagName === "A" && targetElement.href) {
                    window.location.href = targetElement.href;
                } else {
                    targetElement.click();
                }
                return true;
            } else {
                console.warn(`${GM_info.script.name}: Target element not found for rule "${rule.ruleName}"`);
                return false;
            }
        } catch (e) {
            console.warn(`${GM_info.script.name}: Failed to execute rule "${rule.ruleName}": ${e.message}`);
            return false;
        }
    }
 
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
            console.warn(`${GM_info.script.name}: Invalid selector "${selector}": ${e.message}`);
            return [];
        }
    }
}
 
class ClickController {
    constructor() {
        this.ruleManager = new RuleManager();
        this.clickTaskManager = new ClickTaskManager(this.ruleManager);
    }
 
    validateRule(rule) {
        try {
            new RegExp(rule.urlPattern);
        } catch (e) {
            return { success: false, error: `Invalid regular expression: ${rule.urlPattern}` };
        }
        if (!rule.selector || !['css', 'xpath'].includes(rule.selectorType)) {
            return { success: false, error: `Invalid selector: ${rule.selector}` };
        }
        return { success: true };
    }
 
    addRule(rule) {
        const validation = this.validateRule(rule);
        if (!validation.success) {
            return validation;
        }
        try {
            this.ruleManager.addRule({
                ruleName: rule.ruleName || `Rule ${this.ruleManager.getRules().length + 1}`,
                urlPattern: rule.urlPattern,
                selectorType: rule.selectorType,
                selector: rule.selector,
                nthElement: parseInt(rule.nthElement) || 1,
                clickDelay: parseInt(rule.clickDelay) || 1000,
                keepClicking: Boolean(rule.keepClicking),
                ifLinkOpen: Boolean(rule.ifLinkOpen)
            });
            return { success: true };
        } catch (e) {
            return { success: false, error: `Failed to add rule: ${e.message}` };
        }
    }
 
    getRules(filter = null) {
        try {
            const rules = this.ruleManager.getRules(filter);
            return { success: true, data: rules };
        } catch (e) {
            return { success: false, error: `Failed to get rules: ${e.message}` };
        }
    }
 
    updateRule(index, rule) {
        const validation = this.validateRule(rule);
        if (!validation.success) {
            return validation;
        }
        try {
            this.ruleManager.updateRule(index, {
                ruleName: rule.ruleName || `Rule ${index + 1}`,
                urlPattern: rule.urlPattern,
                selectorType: rule.selectorType,
                selector: rule.selector,
                nthElement: parseInt(rule.nthElement) || 1,
                clickDelay: parseInt(rule.clickDelay) || 1000,
                keepClicking: Boolean(rule.keepClicking),
                ifLinkOpen: Boolean(rule.ifLinkOpen)
            });
            this.clickTaskManager.clearTasks();
            this.clickTaskManager.runTasks();
            return { success: true };
        } catch (e) {
            return { success: false, error: `Failed to update rule: ${e.message}` };
        }
    }
 
    deleteRule(index) {
        try {
            this.ruleManager.deleteRule(index);
            this.clickTaskManager.clearTasks();
            this.clickTaskManager.runTasks();
            return { success: true };
        } catch (e) {
            return { success: false, error: `Failed to delete rule: ${e.message}` };
        }
    }
 
    addTask(ruleIndex) {
        try {
            const taskId = this.clickTaskManager.addTask(ruleIndex);
            return { success: true, taskId };
        } catch (e) {
            return { success: false, error: `Failed to add task: ${e.message}` };
        }
    }
 
    runTasks() {
        try {
            this.clickTaskManager.runTasks();
            return { success: true };
        } catch (e) {
            return { success: false, error: `Failed to run tasks: ${e.message}` };
        }
    }
 
    clearTasks() {
        try {
            this.clickTaskManager.clearTasks();
            return { success: true };
        } catch (e) {
            return { success: false, error: `Failed to clear tasks: ${e.message}` };
        }
    }
}

window.ClickItForYou = ClickController;

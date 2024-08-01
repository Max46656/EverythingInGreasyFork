// ==UserScript==
// @name        getOutMyWay
// @name:en     Get Out My Way
// @name:ja     邪魔なものを取り除く
// @name:ko     거슬리는 것들을 없애기
// @name:de     Aus dem Weg räumen
// @description 把礙眼的東西掃掉，允許使用者自己新增元素選擇器(推薦搭配調整頁面顯示的腳本)
// @description:en Remove annoying elements, allowing users to add their own element selectors (recommended to use with scripts that adjust page display)
// @description:ja 目障りなものを取り除き、ユーザーが自分の要素セレクタを追加できるようにする（ページ表示を調整するスクリプトと併用推奨）
// @description:ko 거슬리는 요소를 제거하고 사용자가 자신의 요소 선택기를 추가할 수 있도록 합니다(페이지 표시를 조정하는 스크립트와 함께 사용하는 것을 권장합니다)
// @description:de Entfernt störende Elemente und ermöglicht es Benutzern, ihre eigenen Elementselektoren hinzuzufügen (empfohlen für die Verwendung mit Skripten, die die Seitendarstellung anpassen)
// @namespace   https://github.com/Max46656
// @match       *://*/*
// @version     1.0.0
// @author      Max
// @icon        https://cdn-icons-png.flaticon.com/512/867/867787.png
// @grant       GM_registerMenuCommand
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// @license     MPL2.0
// ==/UserScript==

class ElementHider {
    constructor(selectors) {
        this.selectors = selectors;
    }

    hideElements() {
        this.selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
            });
        });
    }
}

class DomainStrategy {
    constructor() {
        this.domainSelectorsMap = {};
    }

    async loadSelectors() {
        this.domainSelectorsMap = await GM.getValue('domainSelectorsMap', {});
    }

    async saveSelectors() {
        await GM.setValue('domainSelectorsMap', this.domainSelectorsMap);
    }

    getSelectorsForDomain(domain) {
        return this.domainSelectorsMap[domain] || [];
    }

    addSelectorToDomain(domain, selector) {
        if (!this.domainSelectorsMap[domain]) {
            this.domainSelectorsMap[domain] = [];
        }
        this.domainSelectorsMap[domain].push(selector);
        this.saveSelectors();
    }

    removeSelectorFromDomain(domain, selector) {
        if (this.domainSelectorsMap[domain]) {
            this.domainSelectorsMap[domain] = this.domainSelectorsMap[domain].filter(item => item !== selector);
            if (this.domainSelectorsMap[domain].length === 0) {
                delete this.domainSelectorsMap[domain];
            }
            this.saveSelectors();
        }
    }

    getAllDomains() {
        return Object.keys(this.domainSelectorsMap);
    }
}

// ==UserScript==
// @name        getOutMyWay
// @name:en     Get Out My Way
// @name:ja     邪魔なものを取り除く
// @name:ko     거슬리는 것들을 없애기
// @name:de     Aus dem Weg räumen
// @description 把礙眼的東西掃掉，允許使用者自己新增元素選擇器(推薦搭配調整頁面顯示的腳本)
// @description:en Remove annoying elements, allowing users to add their own element selectors (recommended to use with scripts that adjust page display)
// @description:ja 目障りなものを取り除き、ユーザーが自分の要素セレクタを追加できるようにする（ページ表示を調整するスクリプトと併用推奨）
// @description:ko 거슬리는 요소를 제거하고 사용자가 자신의 요소 선택기를 추가할 수 있도록 합니다(페이지 표시를 조정하는 스크립트와 함께 사용하는 것을 권장합니다)
// @description:de Entfernt störende Elemente und ermöglicht es Benutzern, ihre eigenen Elementselektoren hinzuzufügen (empfohlen für die Verwendung mit Skripten, die die Seitendarstellung anpassen)
// @namespace   https://github.com/Max46656
// @match       *://*/*
// @version     1.0.0
// @author      Max
// @icon        https://cdn-icons-png.flaticon.com/512/867/867787.png
// @grant       GM_registerMenuCommand
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// @license     MPL2.0
// ==/UserScript==

class ElementHider {
    constructor(selectors) {
        this.selectors = selectors;
    }

    hideElements() {
        this.selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
            });
        });
    }
}

class DomainStrategy {
    constructor() {
        this.domainSelectorsMap = {};
    }

    async loadSelectors() {
        this.domainSelectorsMap = await GM.getValue('domainSelectorsMap', {});
    }

    async saveSelectors() {
        await GM.setValue('domainSelectorsMap', this.domainSelectorsMap);
    }

    getSelectorsForDomain(domain) {
        return this.domainSelectorsMap[domain] || [];
    }

    addSelectorToDomain(domain, selector) {
        if (!this.domainSelectorsMap[domain]) {
            this.domainSelectorsMap[domain] = [];
        }
        this.domainSelectorsMap[domain].push(selector);
        this.saveSelectors();
    }

    removeSelectorFromDomain(domain, selector) {
        if (this.domainSelectorsMap[domain]) {
            this.domainSelectorsMap[domain] = this.domainSelectorsMap[domain].filter(item => item !== selector);
            if (this.domainSelectorsMap[domain].length === 0) {
                delete this.domainSelectorsMap[domain];
            }
            this.saveSelectors();
        }
    }

    getAllDomains() {
        return Object.keys(this.domainSelectorsMap);
    }
}

class MenuManager {
    constructor(strategy) {
        this.strategy = strategy;
        this.initMenu();
    }

    getMenuLabels() {
        const userLang = navigator.language || navigator.userLanguage;
        const labels = {
            'zh-TW': {
                viewAndAdd: '檢視並新增選擇器',
                viewAndRemove: '檢視並刪除選擇器',
                showAllDomains: '顯示所有網域',
                enterDomain: '輸入網域：',
                currentSelectors: '當前選擇器：',
                enterNewSelector: '輸入新的選擇器：',
                enterSelectorToDelete: '輸入要刪除的選擇器：',
                savedDomains: '已儲存的網域：',
                enterDomainToView: '輸入要檢視的網域：'
            },
            'en': {
                viewAndAdd: 'View and Add Selectors',
                viewAndRemove: 'View and Remove Selectors',
                showAllDomains: 'Show All Domains',
                enterDomain: 'Enter the domain:',
                currentSelectors: 'Current selectors:',
                enterNewSelector: 'Enter the new selector:',
                enterSelectorToDelete: 'Enter the selector to delete:',
                savedDomains: 'Saved domains:',
                enterDomainToView: 'Enter the domain to view:'
            },
            'ja': {
                viewAndAdd: 'セレクターを表示して追加',
                viewAndRemove: 'セレクターを表示して削除',
                showAllDomains: 'すべてのドメインを表示',
                enterDomain: 'ドメインを入力してください：',
                currentSelectors: '現在のセレクター：',
                enterNewSelector: '新しいセレクターを入力してください：',
                enterSelectorToDelete: '削除するセレクターを入力してください：',
                savedDomains: '保存されたドメイン：',
                enterDomainToView: '表示するドメインを入力してください：'
            }
        };

        // 回傳對應語言的選單文字，若使用者的語言不在支援列表中，回傳英文
        return labels[userLang] || labels['en'];
    }

    async initMenu() {
        await this.strategy.loadSelectors();

        const labels = this.getMenuLabels();

        GM_registerMenuCommand(labels.viewAndAdd, this.viewAndAddSelectors.bind(this));
        GM_registerMenuCommand(labels.viewAndRemove, this.viewAndDeleteSelectors.bind(this));
        GM_registerMenuCommand(labels.showAllDomains, this.showAllDomains.bind(this));
    }

    async viewAndAddSelectors() {
        const labels = this.getMenuLabels();
        const domain = prompt(labels.enterDomain, window.location.hostname);
        if (domain) {
            const currentSelectors = this.strategy.getSelectorsForDomain(domain);
            alert(`${labels.currentSelectors}\n${currentSelectors.join('\n')}`);
            const newSelector = prompt(labels.enterNewSelector);
            if (newSelector) {
                this.strategy.addSelectorToDomain(domain, newSelector);
                alert(`Added selector: ${newSelector}`);
            }
        }
    }

    async viewAndDeleteSelectors() {
        const labels = this.getMenuLabels();
        const domain = prompt(labels.enterDomain, window.location.hostname);
        if (domain) {
            const currentSelectors = this.strategy.getSelectorsForDomain(domain);
            alert(`${labels.currentSelectors}\n${currentSelectors.join('\n')}`);
            const selectorToDelete = prompt(labels.enterSelectorToDelete);
            if (selectorToDelete) {
                this.strategy.removeSelectorFromDomain(domain, selectorToDelete);
                alert(`Deleted selector: ${selectorToDelete}`);
            }
        }
    }

    async showAllDomains() {
        const labels = this.getMenuLabels();
        const allDomains = this.strategy.getAllDomains();
        const domain = prompt(`${labels.savedDomains}\n${allDomains.join('\n')}\n\n${labels.enterDomainToView}`);
        if (domain) {
            const selectors = this.strategy.getSelectorsForDomain(domain);
            alert(`Selectors for domain ${domain}:\n${selectors.join('\n')}`);
        }
    }
}

async function main() {
    const strategy = new DomainStrategy();
    await strategy.loadSelectors();

    const currentDomain = window.location.hostname;
    const selectors = strategy.getSelectorsForDomain(currentDomain);

    if (selectors.length > 0) {
        const hider = new ElementHider(selectors);
        hider.hideElements();
    }

    new MenuManager(strategy);
}

main();


async function main() {
    const strategy = new DomainStrategy();
    await strategy.loadSelectors();

    const currentDomain = window.location.hostname;
    const selectors = strategy.getSelectorsForDomain(currentDomain);

    if (selectors.length > 0) {
        const hider = new ElementHider(selectors);
        hider.hideElements();
    }

    new MenuManager(strategy);
}

main();

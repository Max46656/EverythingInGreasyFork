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

    async initMenu() {
        await this.strategy.loadSelectors();

        GM_registerMenuCommand('檢視並新增選擇器', this.viewAndAddSelectors.bind(this));
        GM_registerMenuCommand('檢視並刪除選擇器', this.viewAndDeleteSelectors.bind(this));
        GM_registerMenuCommand('顯示所有網域', this.showAllDomains.bind(this));
    }

    async viewAndAddSelectors() {
        const domain = prompt('請輸入網域：', window.location.hostname);
        if (domain) {
            const currentSelectors = this.strategy.getSelectorsForDomain(domain);
            alert(`當前選擇器：\n${currentSelectors.join('\n')}`);
            const newSelector = prompt('請輸入要新增的選擇器：');
            if (newSelector) {
                this.strategy.addSelectorToDomain(domain, newSelector);
                alert(`已新增選擇器：${newSelector}`);
            }
        }
    }

    async viewAndDeleteSelectors() {
        const domain = prompt('請輸入網域：', window.location.hostname);
        if (domain) {
            const currentSelectors = this.strategy.getSelectorsForDomain(domain);
            alert(`當前選擇器：\n${currentSelectors.join('\n')}`);
            const selectorToDelete = prompt('請輸入要刪除的選擇器：');
            if (selectorToDelete) {
                this.strategy.removeSelectorFromDomain(domain, selectorToDelete);
                alert(`已刪除選擇器：${selectorToDelete}`);
            }
        }
    }

    async showAllDomains() {
        const allDomains = this.strategy.getAllDomains();
        const domain = prompt(`已儲存的網域：\n${allDomains.join('\n')}\n\n請輸入要檢視的網域：`);
        if (domain) {
            const selectors = this.strategy.getSelectorsForDomain(domain);
            alert(`網域 ${domain} 的選擇器：\n${selectors.join('\n')}`);
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

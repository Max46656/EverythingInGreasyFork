// ==UserScript==
// @name         按鍵與滑鼠滾輪翻頁器
// @name:zh-TW   按鍵與滑鼠滾輪翻頁器
// @name:ja      キーとマウスホイールでのページめくり機
// @name:en      Keyboard and Mouse Wheel Page Turner
// @name:ko      키보드 및 마우스 휠 페이지 전환기
// @name:es      Navegador de Páginas con Teclado y Rueda del Ratón
// @namespace    https://github.com/Max46656
// @version      1.2.6
// @description  使用滑鼠滾輪或按鍵快速切換上下頁。
// @description:zh-TW 使用滑鼠滾輪或按鍵快速切換上下頁。
// @description:ja マウスホイールをスクロールするか、キーを押すことで、簡単にページを上下に切り替えることができます。
// @description:en Quickly navigate between pages by scrolling the mouse wheel or pressing keys.
// @description:ko 마우스 휠을 스크롤하거나 키를 눌러 페이지를 쉽게 전환할 수 있습니다.
// @description:es Navega rápidamente entre páginas desplazando la rueda del ratón o presionando teclas.
// @author       Max
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixiv.net
// @grant    GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @license MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/494851/%E6%8C%89%E9%8D%B5%E8%88%87%E6%BB%91%E9%BC%A0%E6%BB%BE%E8%BC%AA%E7%BF%BB%E9%A0%81%E5%99%A8.user.js
// @updateURL https://update.greasyfork.org/scripts/494851/%E6%8C%89%E9%8D%B5%E8%88%87%E6%BB%91%E9%BC%A0%E6%BB%BE%E8%BC%AA%E7%BF%BB%E9%A0%81%E5%99%A8.meta.js
// ==/UserScript==


class PageButtonManager {
    constructor() {
        this.pageButtonsMap = {};
        this.loadPageButtons();
    }

    loadPageButtons() {
        this.pageButtonsMap = GM_getValue('pageButtonsMap', {});
    }

    async savePageButtons() {
        await GM_setValue('pageButtonsMap', this.pageButtonsMap);
    }

    getButtonsForDomain(domain) {
        return this.pageButtonsMap[domain] || {
            nextButton: '.next',
            prevButton: '.prev'
        };
    }

    setButtonsForDomain(domain, buttons) {
        this.pageButtonsMap[domain] = buttons;
        this.savePageButtons();
    }

    getAllDomains() {
        return Object.keys(this.pageButtonsMap);
    }
}

class NavigationPaginationWithInput {
   constructor(buttonManager) {
        this.buttonManager = buttonManager;
        this.pageButtons = this.buttonManager.getButtonsForDomain(self.location.hostname);
        console.log(this.pageButtons);
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setEventListeners();
    }

    async loadSettings() {
        this.togglePaginationMode = await GM_getValue('togglePaginationMode', 'key');
        this.modifierKey = await GM_getValue('modifierKey', 'Control');
        this.nextPageKey = await GM_getValue('nextPageKey', 'W');
        this.prevPageKey = await GM_getValue('prevPageKey', 'Q');
        console.group("Settings");
        console.log("togglePaginationMode",this.togglePaginationMode);
        console.log("modifierKey",this.modifierKey);
        console.log("nextPageKey",this.nextPageKey);
        console.log("prevPageKey",this.prevPageKey);
        console.groupEnd();
        this.saveSettings();
    }

    async saveSettings() {
        await GM_setValue('togglePaginationMode', this.togglePaginationMode);
        await GM_setValue('modifierKey', this.modifierKey);
        await GM_setValue('nextPageKey', this.nextPageKey);
        await GM_setValue('prevPageKey', this.prevPageKey);
    }

    async toNextPage() {
        const pageButtons = document.querySelectorAll(this.pageButtons.nextButton);
        let nextPageButton = pageButtons[pageButtons.length-1];
        nextPageButton.click();
    }

    async toPrevPage() {
        const prevPageButton = document.querySelectorAll(this.pageButtons.prevButton)[0];
      console.log(this.pageButtons.prevButton,prevPageButton);
        prevPageButton.click();
    }

    async setEventListeners() {
        this.scrollHandler = () => this.handleScroll();
        this.keydownHandler = (event) => this.handleKeydown(event);

        if (this.togglePaginationMode !== "key") {
            self.addEventListener("scroll", this.scrollHandler);
        } else {
            self.addEventListener("keydown", this.keydownHandler);
        }
    }

    handleScroll(scrollThreshold=3) {
        const isBottom = document.documentElement.scrollHeight - self.innerHeight - self.pageYOffset <= scrollThreshold;
        if (isBottom) {
            this.toNextPage();
            console.log("滾輪下一頁");
        }
        if (self.pageYOffset <= 0) {
            this.toPrevPage();
            console.log("滾輪上一頁");
        }
    }

    handleKeydown(event) {
        if (event.getModifierState(this.modifierKey)) {
            if (event.key.toUpperCase() === this.nextPageKey.toUpperCase()) {
                event.preventDefault();
                this.toNextPage();
                console.log("快捷鍵下一頁");
            } else if (event.key.toUpperCase() === this.prevPageKey.toUpperCase()) {
                event.preventDefault();
                this.toPrevPage();
                console.log("快捷鍵上一頁");
            }
        }
    }
}

class MenuManager {
    constructor(buttonManager,navigation) {
        this.buttonManager = buttonManager;
        this.navigation = navigation;
        this.initMenu();
    }

    getMenuLabels() {
        const userLang = navigator.language || navigator.userLanguage;
        const labels = {
            'zh-TW': {
                viewAndModify: '修改上下頁的按鈕元素選取器',
                showAllDomains: '顯示所有網域',
                togglePageMode: '切換翻頁模式',
                customizeModifierKey: '自訂啟動快捷鍵',
                customizeNextPageKey: '自訂下一頁快捷鍵',
                customizePrevPageKey: '自訂上一頁快捷鍵',
                enterDomain: '輸入網域：',
                currentButtons: '當前按鈕：',
                enterNextButton: '輸入下一頁按鈕選擇器：',
                enterPrevButton: '輸入上一頁按鈕選擇器：',
                savedDomains: '已儲存的網域：',
                enterDomainToView: '輸入要檢視的網域：',
                enterModifierKey: '輸入啟動快捷鍵 (Control, Alt, Shift, CapsLock)：',
                enterNextPageKey: '輸入下一頁快捷鍵：',
                enterPrevPageKey: '輸入上一頁快捷鍵：',
                invalidInput: '無效的輸入，請重試。'
            },
            'en': {
                viewAndModify: 'Modify Page Up/Down Button Selectors',
                showAllDomains: 'Show All Domains',
                togglePageMode: 'Toggle Page Mode',
                customizeModifierKey: 'Customize Modifier Key',
                customizeNextPageKey: 'Customize Next Page Key',
                customizePrevPageKey: 'Customize Previous Page Key',
                enterDomain: 'Enter the domain:',
                currentButtons: 'Current buttons:',
                enterNextButton: 'Enter the next page button selector:',
                enterPrevButton: 'Enter the previous page button selector:',
                savedDomains: 'Saved domains:',
                enterDomainToView: 'Enter the domain to view:',
                enterModifierKey: 'Enter modifier key (Control, Alt, Shift, CapsLock):',
                enterNextPageKey: 'Enter next page key:',
                enterPrevPageKey: 'Enter previous page key:',
                invalidInput: 'Invalid input, please try again.'
            },
            'ja': {
                viewAndModify: 'ページの上下ボタン要素セレクターの変更',
                showAllDomains: 'すべてのドメインを表示',
                togglePageMode: 'ページモードを切り替える',
                customizeModifierKey: '修飾キーをカスタマイズ',
                customizeNextPageKey: '次のページキーをカスタマイズ',
                customizePrevPageKey: '前のページキーをカスタマイズ',
                enterDomain: 'ドメインを入力してください：',
                currentButtons: '現在のボタン：',
                enterNextButton: '次のページボタンのセレクタを入力してください：',
                enterPrevButton: '前のページボタンのセレクタを入力してください：',
                savedDomains: '保存されたドメイン：',
                enterDomainToView: '表示するドメインを入力してください：',
                enterModifierKey: '修飾キーを入力してください（Control、Alt、Shift、CapsLock）：',
                enterNextPageKey: '次のページキーを入力してください：',
                enterPrevPageKey: '前のページキーを入力してください：',
                invalidInput: '無効な入力です。もう一度お試しください。'
            },
            'ko': {
                viewAndModify: '페이지 위/아래 버튼 선택기 수정',
                showAllDomains: '모든 도메인 보기',
                togglePageMode: '페이지 모드 전환',
                customizeModifierKey: '수정 키 사용자화',
                customizeNextPageKey: '다음 페이지 키 사용자화',
                customizePrevPageKey: '이전 페이지 키 사용자화',
                enterDomain: '도메인을 입력하세요:',
                currentButtons: '현재 버튼:',
                enterNextButton: '다음 페이지 버튼 선택기 입력:',
                enterPrevButton: '이전 페이지 버튼 선택기 입력:',
                savedDomains: '저장된 도메인:',
                enterDomainToView: '보기할 도메인을 입력하세요:',
                enterModifierKey: '수정 키를 입력하세요 (Control, Alt, Shift, CapsLock):',
                enterNextPageKey: '다음 페이지 키 입력:',
                enterPrevPageKey: '이전 페이지 키 입력:',
                invalidInput: '잘못된 입력입니다. 다시 시도하세요.'
            },
            'es': {
                viewAndModify: 'Modificar Selectores de Botones de Página Arriba/Abajo',
                showAllDomains: 'Mostrar Todos los Dominios',
                togglePageMode: 'Alternar Modo de Página',
                customizeModifierKey: 'Personalizar Tecla Modificadora',
                customizeNextPageKey: 'Personalizar Tecla de Siguiente Página',
                customizePrevPageKey: 'Personalizar Tecla de Página Anterior',
                enterDomain: 'Ingrese el dominio:',
                currentButtons: 'Botones actuales:',
                enterNextButton: 'Ingrese el selector del botón de siguiente página:',
                enterPrevButton: 'Ingrese el selector del botón de página anterior:',
                savedDomains: 'Dominios guardados:',
                enterDomainToView: 'Ingrese el dominio a visualizar:',
                enterModifierKey: 'Ingrese tecla modificadora (Control, Alt, Shift, CapsLock):',
                enterNextPageKey: 'Ingrese tecla de siguiente página:',
                enterPrevPageKey: 'Ingrese tecla de página anterior:',
                invalidInput: 'Entrada inválida, por favor intente de nuevo.'
            }
        };
        return labels[userLang] || labels['en'];
    }

    initMenu() {
        const labels = this.getMenuLabels();
        GM_registerMenuCommand(labels.viewAndModify, this.viewAndModifyButtons.bind(this));
        GM_registerMenuCommand(labels.showAllDomains, this.showAllDomains.bind(this));
        GM_registerMenuCommand(labels.togglePageMode, this.inputModeSwitch.bind(this));
        GM_registerMenuCommand(labels.customizeModifierKey, this.customizeModifierKey.bind(this));
        GM_registerMenuCommand(labels.customizeNextPageKey, this.customizeNextPageKey.bind(this));
        GM_registerMenuCommand(labels.customizePrevPageKey, this.customizePrevPageKey.bind(this));
    }

    async viewAndModifyButtons() {
        const labels = this.getMenuLabels();
        const domain = prompt(labels.enterDomain, window.location.hostname);
        if (domain) {
            const currentButtons = this.buttonManager.getButtonsForDomain(domain);
            alert(`${labels.currentButtons}\nNext: ${currentButtons.nextButton}\nPrev: ${currentButtons.prevButton}`);
            const newNextButton = prompt(labels.enterNextButton, currentButtons.nextButton);
            const newPrevButton = prompt(labels.enterPrevButton, currentButtons.prevButton);
            if (newNextButton && newPrevButton) {
                this.buttonManager.setButtonsForDomain(domain, { nextButton: newNextButton, prevButton: newPrevButton });
                alert(`Updated buttons for ${domain}`);
            }
        }
    }

    async showAllDomains() {
        const labels = this.getMenuLabels();
        const allDomains = this.buttonManager.getAllDomains();
        const domain = prompt(`${labels.savedDomains}\n${allDomains.join('\n')}\n\n${labels.enterDomainToView}`);
        if (domain) {
            const buttons = this.buttonManager.getButtonsForDomain(domain);
            alert(`Buttons for domain ${domain}:\nNext: ${buttons.nextButton}\nPrev: ${buttons.prevButton}`);
        }
    }

    async inputModeSwitch() {
        if (this.togglePaginationMode === 'scroll') {
            this.togglePaginationMode = 'key';
            self.removeEventListener("scroll", this.scrollHandler);
            self.addEventListener("keydown", this.keydownHandler);
            console.log("切換為按鍵翻頁模式");
        } else {
            this.togglePaginationMode = 'scroll';
            self.addEventListener("scroll", this.scrollHandler);
            self.removeEventListener("keydown", this.keydownHandler);
            console.log("切換為滾輪翻頁模式");
        }
        this.saveSettings();
    }

    async customizeModifierKey() {
        const labels = this.getMenuLabels();
        const newModifierKey = prompt(labels.enterModifierKey, this.navigation.modifierKey);
        if (['Control', 'Alt', 'Shift', 'CapsLock'].includes(newModifierKey)) {
            this.navigation.modifierKey = newModifierKey;
            await this.navigation.saveSettings();
        } else {
            alert(labels.invalidInput);
        }
    }

    async customizeNextPageKey() {
        const labels = this.getMenuLabels();
        const newNextPageKey = prompt(labels.enterNextPageKey, this.navigation.nextPageKey);
        if (newNextPageKey && newNextPageKey.length === 1) {
            this.navigation.nextPageKey = newNextPageKey;
            await this.navigation.saveSettings();
        } else {
            alert(labels.invalidInput);
        }
    }

    async customizePrevPageKey() {
        const labels = this.getMenuLabels();
        const newPrevPageKey = prompt(labels.enterPrevPageKey, this.navigation.prevPageKey);
        if (newPrevPageKey && newPrevPageKey.length === 1) {
            this.navigation.prevPageKey = newPrevPageKey;
            await this.navigation.saveSettings();
        } else {
            alert(labels.invalidInput);
        }
    }
}

const buttonManager = new PageButtonManager();
const Navigation = new NavigationPaginationWithInput(buttonManager);
new MenuManager(buttonManager,Navigation);

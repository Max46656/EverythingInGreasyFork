// ==UserScript==
// @name         按鍵與滑鼠滾輪翻頁器
// @name:zh-TW   按鍵與滑鼠滾輪翻頁器
// @name:ja      キーとマウスホイールでのページめくり機
// @name:en      Keyboard and Mouse Wheel Page Turner
// @name:ko      키보드 및 마우스 휠 페이지 전환기
// @name:es      Navegador de Páginas con Teclado y Rueda del Ratón
// @namespace    https://github.com/Max46656
// @version      1.2.7
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
// @grant        GM.info
// @license MPL2.0
// ==/UserScript==


class PageButtonManager {
    constructor() {
        this.pageButtonsMap = {};
        this.domain = window.location.hostname;
        this.loadPageButtons();
    }

    loadPageButtons() {
        this.pageButtonsMap = GM_getValue('pageButtonsMap', {});
    }

    async savePageButtons() {
        await GM_setValue('pageButtonsMap', this.pageButtonsMap);
    }

    getButtonsByCommonCases() {
        let buttonsByUserSetting = this.getButtonsByDomain();
        if (buttonsByUserSetting !== null) {
            return buttonsByUserSetting;
        }
        let nextSelectorList = [
            "a.next",
            "a#next",
            ".next>a",
            ".next>button",
            "a[alt=next]",
            ".page-next>a",
            "a.next_page",
            "#next_page",
            ".curPage+a",
            ".nextPage",
            ".pagination-next>a",
            ".pagination>.active+a",
            "a[data-pagination=next]",
            ".pageButtonsCurrent+a",
            "a[class*=nextpage]",
            "li.page-current+li>a",
            "[class^=pag] a[rel=next]",
            "[class^=Pag] [aria-label=next]",
            "[class^=Pag] [aria-label=Next]",
            "[aria-label='Next Page']",
            "[aria-label='Next page']",
            "[aria-label$='next page']",
            ".pagination-nav__item--next>a",
            "a.pageright",
            ".pager_on+a.pager",
            ".pager__next>a",
            ".page-numbers.current+a",
            "a.page-numbers.next",
            "body [class*=paginat] li.active+span+li>a",
            "body [class*=paginat] li.active+li>a",
            "body [class^=pag] .current+a",
            "body [class*=-pag] .current+a",
            ".page_current+a",
            "input[value='next']",
            "input[value='Next page']",
            "input[value='下一頁']",
            "input[value='下一頁']",
            "a#pb_next",
            "a#rightFix",
            "a#btnPreGn",
            "a.page-next",
            "a.pages-next",
            "a.page.right",
            ".paging>.active+.item",
            ".pg_area>em+a",
            "button.next:not([disabled])",
            ".btn_next:not([disabled])",
            ".btn-next:not([disabled])",
            "a#linkNext",
            "body a[class*=page__next]",
            "body [class*=pager]>a.next",
            "body [class*=pagination-next]>a",
            "body [class*=pagination-next]>button",
            "body [class*=page--current]+li>a",
            "body [class*=Pages]>.curr+a",
            "body [class*=page]>.cur+a",
            "body [class*=paginat] [class*=current]+li>a",
            "body [class*=paginat] [class*=next-next]",
            "body [class*=paginat] [class*=next]",
            "body [class*=paginat] [class*=right]",
            ".page>em+a",
            "[name*=nextPage]",
            "a:has(polyline[points='1,2 5,6 9,2'])", //箭頭polyline
            //以下未測試
            "a.nav-next:not([disabled])",
            "button.pagination-arrow-right",
            "[data-page-direction='next']",
            ".carousel-control-next",
            "a.pagination-link[rel='next']",
            ".nav-item.next-item",
            "button.btn-arrow-right:not([disabled])",
            // ARIA 無障礙設計
            "[aria-label='Go to next']",
            "[role='button'][aria-label='Next page']:not([aria-disabled='true'])",
            "[aria-label='下一頁面']",
            "[aria-label='次のページ']",
            "[aria-label='Página siguiente']",
            // Icon
            ".next-btn > svg[class*='arrow-right']",
            "button > i[class*='chevron-right']:not([disabled])",
            "a > span[class*='icon-forward']",
            // XPath：文字與結構檢查
            "//button[contains(@class, 'Page')][text()='Next']",
            "//button[contains(@class, 'page')][text()='next']",
            "//a[contains(@class, 'next') and not(@aria-disabled='true')]",
            "//button[contains(text(), '下一頁')]",
            "//a[contains(text(), '次へ')]",
            "//div[contains(@class, 'pagination')]//a[text()='>']",
            "//button[contains(@class, 'btn') and text()='Suivant']", // 法文
            "//a[contains(@class, 'nav') and text()='Siguiente']", // 西班牙文
            "//li[contains(@class, 'current')]/following-sibling::li[1]/a", //可能有問題
        ];
        let prevSelectorList = [
            "a.previous",
            "a.prev",
            "a#prev",
            ".prev>a",
            ".prev>button",
            "a[alt=prev]",
            ".page-prev>a",
            "a.prev_page",
            "#prev_page",
            "//*[contains(@class, 'pag')]//*[@class='curPage']/preceding-sibling::*[1]/a", // 原 .curPage~a
            ".prevPage",
            ".pagination-prev>a",
            "//*[contains(@class, 'pagination')]//*[@class='active']/preceding-sibling::*[1]/a", // 原 .pagination>.active~a
            "a[data-pagination=prev]",
            "//*[contains(@class, 'pag')]//*[@class='pageButtonsCurrent']/preceding-sibling::*[1]/a", // 原 .pageButtonsCurrent~a
            "a[class*=prevpage]",
            "//li[contains(@class, 'page-current')]/preceding-sibling::li[1]/a", // 原 li.page-current~li>a
            "[class^=pag] a[rel=prev]",
            "[class^=Pag] [aria-label=prev]",
            "[class^=Pag] [aria-label=Prev]",
            "[aria-label='Previous Page']",
            "[aria-label='Previous page']",
            "[aria-label$='previous page']",
            ".pagination-nav__item--next>a",
            "a.pageleft",
            "//*[contains(@class, 'pager_on')]//*[@class='pager']/preceding-sibling::*[1]/a", // 原 .pager_on~a.pager
            ".pager__prev>a",
            "//*[contains(@class, 'page-numbers')]//*[@class='current']/preceding-sibling::*[1]/a", // 原 .page-numbers.current~a
            "a.page-numbers.prev",
            "//*[contains(@class, 'paginat')]//li[contains(@class, 'active')]/preceding-sibling::span[1]/preceding-sibling::li[1]/a", // 原 body [class*=paginat] li.active~span~li>a
            "//*[contains(@class, 'paginat')]//li[contains(@class, 'active')]/preceding-sibling::li[1]/a", // 原 body [class*=paginat] li.active~li>a
            "//body/*[contains(@class, 'pag')]//*[@class='current']/preceding-sibling::*[1]/a", // 原 body [class^=pag] .current~a
            "//body/*[contains(@class, '-pag')]//*[@class='current']/preceding-sibling::*[1]/a", // 原 body [class*=-pag] .current~a
            "//*[contains(@class, 'page_current')]/preceding-sibling::*[1]/a", // 原 .page_current~a
            "input[value='prev']",
            "input[value='Previous page']",
            "input[value='上一頁']",
            "a#pb_prev",
            "a#leftFix",
            "a#btnPreGp",
            "a.page-prev",
            "a.pages-prev",
            "a.page.left",
            "//*[contains(@class, 'paging')]//*[@class='active']/preceding-sibling::*[1]/*[contains(@class, 'item')]", // 原 .paging>.active~.item
            "//*[contains(@class, 'pg_area')]//em/preceding-sibling::*[1]/a", // 原 .pg_area>em~a
            "button.prev:not([disabled])",
            ".btn_prev:not([disabled])",
            ".btn-prev:not([disabled])",
            "a#linkPrev",
            "body a[class*=page__prev]",
            "body [class*=pager]>a.prev",
            "body [class*=pagination-prev]>a",
            "body [class*=pagination-prev]>button",
            "//body/*[contains(@class, 'page--current')]/preceding-sibling::li[1]/a", // 原 body [class*=page--current]~li>a
            "//body/*[contains(@class, 'Pages')]//*[@class='curr']/preceding-sibling::*[1]/a", // 原 body [class*=Pages]>.curr~a
            "//body/*[contains(@class, 'page')]//*[@class='cur']/preceding-sibling::*[1]/a", // 原 body [class*=page]>.cur~a
            "//body/*[contains(@class, 'paginat')]//*[@class and contains(@class, 'current')]/preceding-sibling::li[1]/a", // 原 body [class*=paginat] [class*=current]~li>a
            "body [class*=paginat] [class*=prev-prev]",
            "body [class*=paginat] [class*=prev]",
            "body [class*=paginat] [class*=left]",
            "//*[contains(@class, 'page')]//em/preceding-sibling::*[1]/a", // 原 .page>em~a
            "[name*=prevPage]",
            "a:has(polyline[points='1,2 5,6 9,2'])", //箭頭polyline
            //以下未測試
            "a.nav-prev:not([disabled])",
            "button.pagination-arrow-left",
            "[data-page-direction='prev']",
            ".carousel-control-prev",
            "a.pagination-link[rel='prev']",
            ".nav-item.prev-item",
            "button.btn-arrow-left:not([disabled])",
            // ARIA 無障礙設計
            "[aria-label='Go to previous']",
            "[role='button'][aria-label='Previous page']:not([aria-disabled='true'])",
            "[aria-label='上一頁面']",
            "[aria-label='前のページ']",
            "[aria-label='Página anterior']", // 西班牙文
            // Icon
            ".prev-btn > svg[class*='arrow-left']",
            "button > i[class*='chevron-left']:not([disabled])",
            "a > span[class*='icon-back']",
            // XPath：文字與結構檢查
            "//button[contains(@class, 'Page')][text()='Previous']",
            "//button[contains(@class, 'page')][text()='previous']",
            "//a[contains(@class, 'prev') and not(@aria-disabled='true')]",
            "//button[contains(text(), '上一頁')]",
            "//a[contains(text(), '前へ')]",
            "//div[contains(@class, 'pagination')]//a[text()='<']",
            "//button[contains(@class, 'btn') and text()='Précédent']", // 法文
            "//a[contains(@class, 'nav') and text()='Anterior']", // 西班牙文
            "//li[contains(@class, 'current')]/preceding-sibling::li[1]/a",
        ];
        let prevButton;
        let prevSelector;
        for (let selector of prevSelectorList) {
            if (selector.startsWith('//')) {
                let result = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (result.snapshotLength >= 1) {
                    prevButton = result.snapshotItem(0);
                    console.log("prev XPathSelector:",selector);
                    prevSelector = selector;
                    break;
                }
            } else {
                let elements = document.querySelectorAll(selector);
                if (elements.length >= 1) {
                    prevButton = elements[0];
                    console.log("prev CSSSelector:",selector);
                    prevSelector = selector;
                    break;
                }
            }
        }

        let nextButton;
        let nextSelcetor;
        for (let selector of nextSelectorList) {
            if (selector.startsWith('//')) {
                let result = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (result.snapshotLength >= 1) {
                    nextButton = result.snapshotItem(result.snapshotLength - 1);
                    console.log("next XPathSelector:",selector);
                    nextSelcetor = selector;
                    break;
                }
            } else {
                let elements = document.querySelectorAll(selector);
                if (elements.length >= 1) {
                    nextButton = elements[elements.length - 1];
                    console.log("next XPathSelector:",selector);
                    nextSelcetor = selector;
                    break;
                }
            }
        }
        console.log("prevButton,nextButton",[prevButton,nextButton]);
        if(prevButton == null && nextButton == null){
            console.error(`${GM_info.script.name} : 該網站不使用常見元素，請手動設定CSS或XPath選取器以設定上下頁元素`)
        }
        return {"prevSelector":prevSelector,"nextSelcetor":nextSelcetor,"prev":prevButton,"next":nextButton};
    }

    getButtonsByDomain() {
        let pageButtons = {"prev":null,"next":null};
        if(this.pageButtonsMap[this.domain]===undefined){
            return null;
        }
        const prevSelector = this.pageButtonsMap[this.domain].prevButton;
        const nextSelector = this.pageButtonsMap[this.domain].nextButton;
        if (prevSelector.startsWith('//')) {
            let xPathResult = document.evaluate(prevSelector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (xPathResult.snapshotLength >= 0) {
                pageButtons.prev = xPathResult.snapshotItem(0);
            }
        } else {
            let elements = document.querySelectorAll(prevSelector);
            if (elements.length >= 0) {
                pageButtons.prev = elements[0];
            }
        }

        if (nextSelector.startsWith('//')) {
            let xPathResult = document.evaluate(nextSelector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (xPathResult.snapshotLength >= 0) {
                pageButtons.next = xPathResult.snapshotItem(xPathResult.snapshotLength - 1);
            }
        } else {
            let elements = document.querySelectorAll(nextSelector);
            if (elements.length >= 0) {
                pageButtons.next = elements[elements.length - 1];
            }
        }

        return pageButtons;
    }

    getSelectorByDomain(domain){
        return this.pageButtonsMap[domain];
    }

    setButtonsForDomain(buttons) {
        this.pageButtonsMap[this.domain] = buttons;
        this.savePageButtons();
    }

    getAllDomains() {
        return Object.keys(this.pageButtonsMap);
    }
}

class NavigationPaginationWithInput {
    constructor(buttonManager) {
        this.buttonManager = buttonManager;
        this.init();
    }

    async init() {
        //this.buttonManager.getButtonsByCommonCases();
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

    toNextPage() {
        this.pageButtons = this.buttonManager.getButtonsByCommonCases();
        this.pageButtons.next.click();
    }

    toPrevPage() {
        this.pageButtons = this.buttonManager.getButtonsByCommonCases();
        this.pageButtons.prev.click();
    }

    setEventListeners() {
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
            //console.log("滾輪下一頁");
        }
        if (self.pageYOffset <= 0) {
            this.toPrevPage();
            //console.log("滾輪上一頁");
        }
    }

    handleKeydown(event) {
        if (event.getModifierState(this.modifierKey)) {
            if (event.key.toUpperCase() === this.nextPageKey.toUpperCase()) {
                event.preventDefault();
                this.toNextPage();
                //console.log("快捷鍵下一頁");
            } else if (event.key.toUpperCase() === this.prevPageKey.toUpperCase()) {
                event.preventDefault();
                this.toPrevPage();
                //console.log("快捷鍵上一頁");
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
                savedDomains: '儲存されたドメイン：',
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
        return labels[userLang] || labels.en;
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
        //const domain = prompt(labels.enterDomain, window.location.hostname);
        const domain = window.location.hostname;
        if (domain !== null) {
            const currentButtons = this.buttonManager.getSelectorByDomain(domain);
            console.log(currentButtons);
            let newPrevButton;
            let newNextButton;
            if(currentButtons !== undefined){
                alert(`${labels.currentButtons}\nNext: ${currentButtons.nextButton}\nPrev: ${currentButtons.prevButton}`);
                newNextButton = prompt(labels.enterNextButton, currentButtons.nextButton);
                newPrevButton = prompt(labels.enterPrevButton, currentButtons.prevButton);
            }else{
                console.log( this.buttonManager.getButtonsByCommonCases());
                const aotoSelcetor = this.buttonManager.getButtonsByCommonCases()
                newNextButton = prompt(labels.enterNextButton, aotoSelcetor.nextSelcetor);
                newPrevButton = prompt(labels.enterPrevButton, aotoSelcetor.prevSelector);
            }
            if (newNextButton && newPrevButton) {
                this.buttonManager.setButtonsForDomain({ nextButton: newNextButton, prevButton: newPrevButton });
                alert(`Updated buttons for ${domain}`);
            }

        }
    }

    async showAllDomains() {
        const labels = this.getMenuLabels();
        const allDomains = this.buttonManager.getAllDomains();
        const domain = prompt(`${labels.savedDomains}\n${allDomains.join('\n')}\n\n${labels.enterDomainToView}`,window.location.hostname);
        if (domain) {
            const buttons = this.buttonManager.getSelectorByDomain(domain);
            if(buttons){
                alert(`Buttons Selcetor for this domain ${domain}:\nNext: ${buttons.nextButton}\nPrev: ${buttons.prevButton}`);
            }else{
                alert(`User Selcetor for this domain is undefined`);
            }
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

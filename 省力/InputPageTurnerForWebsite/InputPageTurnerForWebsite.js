// ==UserScript==
// @name         按鍵與滑鼠滾輪翻頁器
// @name:zh-TW   按鍵與滑鼠滾輪翻頁器
// @name:ja      キーとマウスホイールでのページめくり機
// @name:en      Keyboard and Mouse Wheel Page Turner
// @namespace    https://github.com/Max46656
// @version      1.14
// @description  使用滑鼠滾輪或按鍵快速切換上下頁。在Pixiv頁面載入後自動展開所有作品。
// @description:zh-TW 使用滑鼠滾輪或按鍵快速切換上下頁。在Pixiv頁面載入後，自動展開所有作品。
// @description:ja マウスホイールをスクロールするか、キーを押すことで、簡単にページを上下に切り替えることができます。Pixivのページが完全に読み込まれた後、すべての作品を自動的に展開します。
// @description:en Quickly navigation between pages by scrolling the mouse wheel or pressing keys. Automatically expands all works after the Pixiv page is fully loaded.
// @author       Max
// @match        https://www.pixiv.net/*
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixiv.net
// @grant    GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @license MPL2.0
// ==/UserScript==


class pageInputNavigation {
    constructor() {
        this.pageButtons = this.getPageButtonsByDomain();
        this.buttonClicked = false;
        this.setEventListeners();
    }

    getPageButtonsByDomain(){

        const pageButtons=GM_getValue("pageButtons",null);
        const domain = self.location.hostname;
        //console.log(pageButtons);
        if(pageButtons[domain]!=null){
            console.log(domain);
            console.log(pageButtons[domain]);
            return pageButtons[domain];
        }
        console.log(domain,' not found ','use general website',pageButtons["general website"]);
        return pageButtons["general website"];
    }

    async toNextPage() {
        const pageButtons = document.querySelectorAll(this.pageButtons.nextButton);
        let nextPageButton=pageButtons[pageButtons.length-1];
        // console.log(nextPageButton);
        nextPageButton.click();
    }

    async toPrevPage() {
        const prevPageButton = document.querySelectorAll(this.pageButtons.prevButton)[0];
        // console.log(prevPageButton);
        prevPageButton.click();
    }

    setEventListeners() {
        this.scrollHandler = () => this.handleScroll();
        this.keyPressHandler = (event) => this.handleKeyPress(event);
        self.addEventListener("keypress", this.keyPressHandler);
        //console.log("開始聆聽");
    }

    handleScroll(scrollThreshold=3) {
        const isBottom = document.documentElement.scrollHeight - self.innerHeight - self.pageYOffset <= this.scrollThreshold;
        if (isBottom) {
            this.toNextPage();
            console.log("滾輪下一頁");
        }
        if (self.pageYOffset <= 0) {
            this.toPrevPage();
            console.log("滾輪上一頁");
        }
    }

    handleKeyPress(event) {
        const pageKey = GM_getValue("pageKey", ["Z", "X"]);
        let prevPageUpper = pageKey[0].toUpperCase();
        let nextPageUpper = pageKey[1].toUpperCase();
        let prevPageLower = pageKey[0].toLowerCase();
        let nextPageLower = pageKey[1].toLowerCase();
        if (event.key == prevPageUpper || event.key == prevPageLower) {
            this.toPrevPage();
            console.log("按鍵上一頁");
        } else if (event.key == nextPageUpper || event.key == nextPageLower) {
            this.toNextPage();
            console.log("按鍵下一頁");
        }
    }
}

class inputCustomMenu{
    constructor() {
        this.registerMenuCommand(this);
        this.loadPageKey();
    }
    async inputModeSwitch() {
        //console.log("切換模式"+this.buttonClicked);
        if (this.buttonClicked==true) {
            self.removeEventListener("scroll", this.scrollHandler);
            self.addEventListener("keypress", this.keyPressHandler);
            console.log("切換為按鍵翻頁模式");
            this.buttonClicked=false;
        } else {
            self.addEventListener("scroll", this.scrollHandler);
            self.removeEventListener("keypress", this.keyPressHandler);
            console.log("切換為滾輪翻頁模式");
            this.buttonClicked=true;
        }
    }

    async customizeKeys() {
        //console.log(this.getFeatureMessageLocalization("EnterNewPrevPageLetter"));
        const newPrevPage = prompt(`${this.getFeatureMessageLocalization("EnterNewPrevPageLetter")}${this.pageKey[0]}`);
        const newNextPage = prompt(`${this.getFeatureMessageLocalization("EnterNewNextPageLetter")}${this.pageKey[1]}`);

        if (newPrevPage && newPrevPage.length === 1 && newNextPage && newNextPage.length === 1) {
            this.pageKey[0] = newPrevPage;
            this.pageKey[1] = newNextPage;
            this.savePageKey();
        } else {
            alert(this.getFeatureMessageLocalization("CustomKeyError"));
        }
    }

    loadPageKey() {
        this.pageKey = GM_getValue("pageKey", ["Z", "X"]);
    }

    savePageKey() {
        GM_setValue("pageKey", this.pageKey);
    }

    getFeatureMessageLocalization(word) {
        let display = {
            "zh-TW": {
                "TogglePageMode": "切換翻頁模式",
                "CustomizeKeys": "自訂按鍵",
                "EnterNewPrevPageLetter": "請輸入要替換上一頁的一個英文字母或數字，目前為：",
                "EnterNewNextPageLetter": "請輸入要替換下一頁的一個英文字母或數字，目前為：",
                "CustomKeyError": "自訂按鍵錯誤：輸入無效，請確保輸入一個英文字母或數字。"
            },
            "en": {
                "TogglePageMode": "Toggle Page Navigation Mode",
                "CustomizeKeys": "Customize Keys",
                "EnterNewPrevPageLetter": "Enter a single English letter or number to replace the previous page,right now it's",
                "EnterNewNextPageLetter": "Enter a single English letter or number to replace the next page,now it's",
                "CustomKeyError": "Custom Key Error: Invalid input, please ensure to input a single English letter or number."
            },
            "ja": {
                "TogglePageMode": "ページ切り替えモードの切り替え",
                "CustomizeKeys": "キーのカスタマイズ",
                "EnterNewPrevPageLetter": "前のページを置き換える英字または數字を 1 つ入力してください。今のボタンは：",
                "EnterNewNextPageLetter": "次のページを置き換える英字または數字を 1 つ入力してください。今のボタンは：",
                "CustomKeyError": "カスタムキーエラー：入力が無効です。単一の英文字または數字を入力してください。"
            }
        };
        //console.log(navigator.language);
        //console.log(display[navigator.language][word]);
        return display[navigator.language][word];
    }

    registerMenuCommand(instance) {
        //console.log("註冊選單");
        GM_registerMenuCommand(instance.getFeatureMessageLocalization("TogglePageMode"), () => instance.inputModeSwitch());
        GM_registerMenuCommand(instance.getFeatureMessageLocalization("CustomizeKeys"), () => instance.customizeKeys());
    }
}

class pageButtonsOfDomain{
    constructor(){
        this.allPageButtons = GM_getValue("PageButtons",{
            "www.pixiv.net": {
                "nextButton": ".sc-d98f2c-0.sc-xhhh7v-2.cCkJiq.sc-xhhh7v-1-filterProps-Styled-Component.kKBslM",
                "prevButton": ".sc-d98f2c-0.sc-xhhh7v-2.cCkJiq.sc-xhhh7v-1-filterProps-Styled-Component.kKBslM",
            },
            "exhentai.org": {
                "nextButton": "#dnext",
                "prevButton": "#dprev",
            },
            "e-hentai.org": {
                "nextButton": "#dnext",
                "prevButton": "#dprev",
            },
            "nhentai.net": {
                "nextButton": ".next",
                "prevButton": ".previous",
            },
            "www.asmr.one": {
                "nextButton": ".ant-pagination-item-link",
                "prevButton": ".ant-pagination-item-link",
            },
            "www.bilibili.com": {
                "nextButton": ".vui_pagenation--btn-side",
                "prevButton": ".vui_pagenation--btn-side",
            },
            "search.bilibili.com": {
                "nextButton": ".vui_pagenation--btn-side",
                "prevButton": ".vui_pagenation--btn-side",
            },
            "www.goddessfantasy.net": {
                "nextButton": ".navPages",
                "prevButton": ".navPages",
            },
            "general website": {
                "nextButton": ".next",
                "prevButton": ".prev",
            },
        })
        GM_setValue('pageButtons', this.allPageButtons);
    }

    getAllPageButtons(){
        return this.allPageButtons;
    }
    addPageButtons(domain, buttons) {
        this.allPageButtons[domain] = buttons;
        this.savePageButtonsToStorage(this.allPageButtons);
    }

    getPageButtons(domain) {
        return this.pageButtonsOfDomain[domain];
    }

    savePageButtonsToStorage(pageButtons) {
        GM_setValue('pageButtons', JSON.stringify(pageButtons));
    }

    getPageButtonsFromStorage() {
        let storedPageButtons = GM_getValue('pageButtons');
        return storedPageButtons ? JSON.parse(storedPageButtons) : {};
    }

    getFeatureMessageLocalization(word) {
        let display = {
            "zh-TW": {
                "addNewDomainSupper": "新增支援網站",
            },
            "en": {
                "addNewDomainSupper": "Add new supper domain",
            },
            "ja": {
                "addNewDomainSupper": "サポートサイトを追加",
            }
        };
        return display[navigator.language][word];
    }
}

const johnTheButtonCollector = new pageButtonsOfDomain();
const johnTheAlmondHolder = new pageInputNavigation();
const johnTheRestaurantWaiter = new inputCustomMenu();

/* class addNewDomainSupper {
  constructor() {
    this.floatingWindow = this.createFloatingWindow();
    this.setupListeners();
    //this.registerMenuCommand(this);
  }

 registerMenuCommand(instance) {
    GM_registerMenuCommand(instance.getFeatureMessageLocalization("addNewDomainSupper"), () => instance.createFloatingWindow())
  }
    getFeatureMessageLocalization(word) {
    let display = {
      "zh-TW": {
        "addNewDomainSupper": "新增支援網站",
      },
      "en": {
        "addNewDomainSupper": "Add new supper domain",
      },
      "ja": {
        "addNewDomainSupper": "サポートサイトを追加",
      }
    };
    return display[navigator.language][word];
  }
  createFloatingWindow() {
    const floatingWindow = document.createElement('div');
    floatingWindow.style.position = 'fixed';
    floatingWindow.style.top = '50%';
    floatingWindow.style.left = '50%';
    floatingWindow.style.transform = 'translate(-50%, -50%)';
    floatingWindow.style.background = '#fff';
    floatingWindow.style.border = '1px solid #000';
    floatingWindow.style.color = '000';
    floatingWindow.style.padding = '20px';
    document.body.appendChild(floatingWindow);
    return floatingWindow;
  }

  setupListeners() {
    this.floatingWindow.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const target = event.target;
    if (target.tagName === 'BUTTON') {
      const action = target.textContent;
      if (action === '確認') {
        this.confirm();
      } else if (action === '取消') {
        this.cancel();
      }
    }
  }

  confirm() {
    const prevInput = this.floatingWindow.querySelector('.prev-input');
    const nextInput = this.floatingWindow.querySelector('.next-input');
    const selectOption = this.floatingWindow.querySelector('.select-option');
    const selectedOption = selectOption.value;
    const prevValue = prevInput.value;
    const nextValue = nextInput.value;
    const domain = window.location.hostname;

    let buttons = {};
    if (selectedOption === 'class') {
      buttons = {
        prevButton: `.${prevValue}`,
        nextButton: `.${nextValue}`
      };
    } else if (selectedOption === 'id') {
      buttons = {
        prevButton: `#${prevValue}`,
        nextButton: `#${nextValue}`
      };
    }

    PageButtonsOfDomain.addPageButtons(domain, buttons);
    this.floatingWindow.remove();
  }

  cancel() {
    this.floatingWindow.remove();
  }
} */

//const transferStudent = new addNewDomainSupper();
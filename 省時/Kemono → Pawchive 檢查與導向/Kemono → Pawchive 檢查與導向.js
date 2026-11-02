// ==UserScript==
// @name   Kemono ⇒ Pawchive 檢查與導向
// @name:en      Kemono ⇒ Pawchive Checker
// @name:ja      Kemono ⇒ Pawchive チェッカー
// @name:hi      Kemono ⇒ Pawchive चेकर
// @name:de      Kemono ⇒ Pawchive Prüfer
// @name:cs      Kemono ⇒ Pawchive Kontrolor
// @name:lt      Kemono ⇒ Pawchive Tikrintuvas
// @name:es      Verificador Kemono ⇒ Pawchive
// @description      在 kemono.cr 的 fanbox/patreon 作者與貼文頁檢查 pawchive.pw 對應頁面是否存在，顯示右下角狀態按鈕，點擊後導向。
// @description:en   Check if corresponding pawchive.pw page exists for kemono.cr fanbox/patreon user & post pages, show floating status button and redirect on click.
// @description:ja   kemono.cr の fanbox/patreon ユーザーおよび投稿ページに対応する pawchive.pw ページが存在するかを確認し、右下にステータスボタンを表示してクリックでリダイレクトします。
// @description:hi   kemono.cr के fanbox/patreon उपयोगकर्ता और पोस्ट पेज के लिए संबंधित pawchive.pw पेज मौजूद है या नहीं, इसकी जाँच करें, नीचे दाईं ओर स्टेटस बटन दिखाएँ और क्लिक पर रीडायरेक्ट करें।
// @description:de   Prüft, ob die entsprechende pawchive.pw-Seite für kemono.cr fanbox/patreon Benutzer- und Beitragseiten existiert, zeigt einen schwebenden Status-Button unten rechts und leitet beim Klick um.
// @description:cs   Zkontroluje, zda odpovídající stránka pawchive.pw existuje pro stránky uživatelů a příspěvků fanbox/patreon na kemono.cr, zobrazí plovoucí stavové tlačítko vpravo dole a přesměruje po kliknutí.
// @description:lt   Tikrina, ar atitinkamas pawchive.pw puslapis egzistuoja kemono.cr fanbox/patreon vartotojų ir įrašų puslapiams, rodo plaukiojantį būsenos mygtuką apačioje dešinėje ir peradresuoja paspaudus.
// @description:es   Comprueba si existe la página correspondiente en pawchive.pw para las páginas de usuario y publicaciones de fanbox/patreon en kemono.cr, muestra un botón de estado flotante en la esquina inferior derecha y redirige al hacer clic.
//
// @author       Max
// @namespace    https://github.com/Max46656/EverythingInGreasyFork
// @version      1.1.0
//
// @match        https://kemono.cr/fanbox/user/*
// @match        https://kemono.cr/patreon/user/*
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @run-at       document-idle
// @connect      pawchive.pw
// @license      MPL-2.0
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues/new?template=bug_report.yml&labels=bug%2Cuserscript&title=%5BKemono%20%E2%86%92%20Pawchive%20Checker%5D%20%20%E5%95%8F%E9%A1%8C%E5%9B%9E%E5%A0%B1
// ==/UserScript==

/**
 * Kemono ⇒ Pawchive 存在檢查與導向管理器
 * 負責解析當前頁面、檢查 pawchive.pw 對應狀態、顯示浮動按鈕並處理導向
 */
class KemonoToPawchiveChecker {
  static KEMONO_ORIGIN = 'https://kemono.cr';
  static PAWCHIVE_ORIGIN = 'https://pawchive.pw';

  /**
   * @type {string}
   */
  static STATUS = {
    MISSING: 'missing',
    FOUND: 'found',
    INCOMPLETE: 'incomplete'
  };

  /**
   * 建立實例並初始化
   */
  constructor() {
    this.prefix = `[${GM_info.script.name}]`;
    this.currentPath = location.pathname;
    this.isPostPage = /\/post\/\d+\/?$/.test(this.currentPath);
    this.pawUrl = this.buildPawUrl(this.currentPath);
    this.userPawUrl = this.isPostPage
      ? this.buildPawUrl(this.currentPath.replace(/\/post\/\d+\/?$/, ''))
      : this.pawUrl;
    this.status = KemonoToPawchiveChecker.STATUS.MISSING;
    this.button = null;

    if (!this.isSupportedPath()) {
      console.log(`${this.prefix} 非目標路徑，略過`);
      return;
    }

    this.init();
  }

  /**
   * 判斷是否為支援的 fanbox / patreon 路徑
   * @returns {boolean}
   */
  isSupportedPath() {
    return /^\/(fanbox|patreon)\/user\/\d+(\/post\/\d+)?\/?$/.test(this.currentPath);
  }

  /**
   * 將路徑轉換為 pawchive.pw 完整網址
   * @param {string} path
   * @returns {string}
   */
  buildPawUrl(path) {
    return `${KemonoToPawchiveChecker.PAWCHIVE_ORIGIN}${path}`;
  }

  /**
   * 初始化：注入樣式、建立按鈕、執行檢查
   */
  async init() {
    this.injectStyles();
    this.createButton();
    await this.checkStatus();
    this.updateButton();
  }

  /**
   * 注入浮動按鈕樣式
   */
  injectStyles() {
    GM_addStyle(`
      #k2p-checker-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        min-width: 10px;
        padding: 4px 6px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,.25);
        transition: background-color .2s, transform .15s;
        user-select: none;
      }
      #k2p-checker-btn:hover {
        transform: translateY(-2px);
      }
      #k2p-checker-btn[data-status="missing"] {
        background-color: #e53935;
      }
      #k2p-checker-btn[data-status="found"] {
        background-color: #43a047;
      }
      #k2p-checker-btn[data-status="incomplete"] {
        background-color: #f9a825;
        color: #212121;
      }
      #k2p-checker-btn[data-status="checking"] {
        background-color: #757575;
        cursor: wait;
      }
    `);
  }

/**
   * 建立右下角浮動按鈕
   */
  createButton() {
    this.button = document.createElement('button');
    this.button.id = 'k2p-checker-btn';
    this.button.type = 'button';
    this.button.dataset.status = 'checking';
    this.button.title = 'Checking pawchive.pw…';
    this.button.addEventListener('click', () => this.handleClick());

    this.button.innerHTML = `
      <span>⇒</span>
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQp+OdAAAABlBMVEX////+/v46op6MAAAAAXRSTlMAQObYZgAAAMVJREFUeNqF0c0JRCEMBOARDx4tIY0sWFos7ZViCR49iNlko+zPO+zA4AdBIghLgyeOjTR/kdcG3VD+ooAXWMGVV5CquHglgzReWS4HKYJilhf6G4MdpbNUREWTjUsEBqobgCwgKIKjaefBUPg+AAYruHpRtA98h/ywe44sDakqWFGaTaTDNidFMJDIiIaiSAZRZEVQTEM00CeSoyErVnnjOqggAwk2JnyUh0NCBZLBX7yBdAA6iAfhAHz7QTrIcyMeoAN4AoU31mkaAn/yAAAAAElFTkSuQmCC" alt="Pawchive" width="16" height="16" style="vertical-align:middle;margin-right:6px;border-radius:2px;">
      <span>↺</span>
    `;

    document.body.appendChild(this.button);
  }

  /**
   * 使用 GM.xmlHttpRequest 取得狀態碼
   * @param {string} url
   * @returns {Promise<number>}
   */
  fetchStatus(url) {
    return new Promise((resolve) => {
      GM.xmlHttpRequest({
        method: 'GET',
        url,
        timeout: 10000,
        anonymous: true,
        onload: (res) => resolve(res.status),
        onerror: () => resolve(0),
        ontimeout: () => resolve(0)
      });
    });
  }

  /**
   * 判斷狀態碼是否視為「存在」
   * @param {number} status
   * @returns {boolean}
   */
  isOk(status) {
    return status >= 200 && status < 400;
  }

  /**
   * 執行存在性檢查並更新 this.status
   */
  async checkStatus() {
    console.log(`${this.prefix} 開始檢查: ${this.pawUrl}`);

    const postOrUserStatus = await this.fetchStatus(this.pawUrl);

    if (this.isOk(postOrUserStatus)) {
      this.status = KemonoToPawchiveChecker.STATUS.FOUND;
      console.log(`${this.prefix} 結果: found (${postOrUserStatus})`);
      return;
    }

    if (this.isPostPage) {
      const userStatus = await this.fetchStatus(this.userPawUrl);
      if (this.isOk(userStatus)) {
        this.status = KemonoToPawchiveChecker.STATUS.INCOMPLETE;
        console.log(`${this.prefix} 結果: incomplete (post ${postOrUserStatus}, user ${userStatus})`);
        return;
      }
    }

    this.status = KemonoToPawchiveChecker.STATUS.MISSING;
    console.log(`${this.prefix} 結果: missing (${postOrUserStatus})`);
  }

  /**
   * 依狀態更新按鈕外觀與文字
   */
updateButton() {
    if (!this.button) return;

    const map = {
      [KemonoToPawchiveChecker.STATUS.FOUND]: {
        icon: '⭘',
        title: '對應頁面存在，點選導向 pawchive.pw'
      },
      [KemonoToPawchiveChecker.STATUS.INCOMPLETE]: {
        icon: '🛆',
        title: '作者頁存在但此貼文不存在，點選仍可導向'
      },
      [KemonoToPawchiveChecker.STATUS.MISSING]: {
        icon: '✕',
        title: '對應頁面不存在'
      }
    };

    const info = map[this.status] || map[KemonoToPawchiveChecker.STATUS.MISSING];
    this.button.dataset.status = this.status;
    this.button.title = info.title;

    this.button.innerHTML = `
      <span>⇒</span>
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQp+OdAAAABlBMVEX////+/v46op6MAAAAAXRSTlMAQObYZgAAAMVJREFUeNqF0c0JRCEMBOARDx4tIY0sWFos7ZViCR49iNlko+zPO+zA4AdBIghLgyeOjTR/kdcG3VD+ooAXWMGVV5CquHglgzReWS4HKYJilhf6G4MdpbNUREWTjUsEBqobgCwgKIKjaefBUPg+AAYruHpRtA98h/ywe44sDakqWFGaTaTDNidFMJDIiIaiSAZRZEVQTEM00CeSoyErVnnjOqggAwk2JnyUh0NCBZLBX7yBdAA6iAfhAHz7QTrIcyMeoAN4AoU31mkaAn/yAAAAAElFTkSuQmCC" alt="Pawchive" width="16" height="16" style="vertical-align:middle;margin-right:6px;border-radius:2px;">
      <span>${info.icon}</span>
    `;
  }

  /**
   * 按鈕點擊：非 missing 時以 location.assign 導向
   */
  handleClick() {
    if (this.status === KemonoToPawchiveChecker.STATUS.MISSING) {
      console.log(`${this.prefix} 狀態為 missing，不導向`);
      return;
    }
    console.log(`${this.prefix} 導向: ${this.pawUrl}`);
    location.assign(this.pawUrl);
  }
}

new KemonoToPawchiveChecker();

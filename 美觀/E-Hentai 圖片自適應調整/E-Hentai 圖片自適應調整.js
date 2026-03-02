// ==UserScript==
// @name         E-Hentai 圖片自適應調整
// @name:en      E-Hentai Image Auto Resize
// @name:ja      E-Hentai 畫像自動調整
// @name:de      E-Hentai Bild automatisch anpassen
// @name:cs      E-Hentai Automatické přizpůsobení obrázků
// @name:lt      E-Hentai Vaizdų automatinis prisitaikymas
// @description:en      Allows changing E-Hentai / ExHentai image size to 4 modes: Fit Window / Fit Height / Fit Width / Original Size
// @description:ja      E-Hentai / ExHentai の画像サイズを「ウィンドウに合わせる」「高さに合わせる」「幅に合わせる」「オリジナルサイズ」の4モードに変更可能
// @description:de      Ermöglicht das Ändern der Bildgröße bei E-Hentai / ExHentai in 4 Modi: An Fenster anpassen / An Höhe anpassen / An Breite anpassen / Originalgröße
// @description:cs      Umožňuje změnit velikost obrázků na E-Hentai / ExHentai do 4 režimů: Přizpůsobit oknu / Přizpůsobit výšce / Přizpůsobit šířce / Původní velikost
// @description:lt      Leidžia keisti E-Hentai / ExHentai paveikslėlių dydį į 4 režimus: Tinkinti langui / Tinkinti aukščiui / Tinkinti pločiui / Originalus dydis
// @description:uk      Дозволяє змінювати розмір зображень E-Hentai / ExHentai на 4 режими: Підігнати під вікно / Підігнати під висоту / Підігнати під ширину / Оригінальний розмір
//
// @author       Max
// @namespace    https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E7%BE%8E%E8%A7%80/E-Hentai%20%E5%9C%96%E7%89%87%E8%87%AA%E9%81%A9%E6%87%89%E8%AA%BF%E6%95%B4
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues/new?template=bug_report.yml&labels=bug,userscript&title=%5BE-Hentai%20%E5%9C%96%E7%89%87%E8%87%AA%E9%81%A9%E6%87%89%E8%AA%BF%E6%95%B4%5D%20%E5%95%8F%E9%A1%8C%E5%9B%9E%E5%A0%B1
// @license      MPL2.0
//
// @version      1.7.1
// @match        https://exhentai.org/s/*/*
// @match        https://e-hentai.org/s/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=e-hentai.org
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
class ImageResizer {
    constructor() {
        this.currentModeId = GM_getValue('img_mode_id', 'fit-window');
        this.menuId = null;
        this.imgElements = [];
        this.focusedIndex = 0;
        this.shortcuts = GM_getValue('shortcuts', {
            modifier: 'CapsLock',
            next: 'w',
            prev: 'q',
            first: 'e'
        });
    }

    get MODES() {
        return {
            '1': { id: 'fit-window', label: '🞎', mw: '100vw', mh: '100vh', w: 'auto', h: 'auto' },
            '2': { id: 'fit-height', label: '⭿', mw: 'none', mh: '100vh', w: 'auto', h: '100vh' },
            '3': { id: 'fit-width', label: '⭾', mw: '100%', mh: 'none', w: '100vw', h: 'auto' },
            '4': { id: 'original', label: '🞨', mw: 'none', mh: 'none', w: 'auto', h: 'auto' }
        };
    }

    init() {
        this.applyBaseStyles();
        this.registerMenu();
        this.registerKeyboardShortcuts();
        const loadHandler = () => {
            this.injectUI();
            this.collectImages();
            if (this.imgElements.length > 0) {
                this.focusedIndex = 0;
                this.scrollToCurrent(false);
            }
        };
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('eh-resizer-select')) {
                this.setModeById(e.target.value);
            }
        });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadHandler);
        else loadHandler();
    }

    setModeById(modeId) {
        this.currentModeId = modeId;
        GM_setValue('img_mode_id', modeId);
        this.updateCSSVariables();
        const select = document.querySelector('.eh-resizer-select');
        if (select) select.value = modeId;
        this.registerMenu();
    }

    updateCSSVariables() {
        const modeConfig = Object.values(this.MODES).find(m => m.id === this.currentModeId) || this.MODES['1'];
        const root = document.documentElement;
        root.style.setProperty('--eh-mw', modeConfig.mw);
        root.style.setProperty('--eh-mh', modeConfig.mh);
        root.style.setProperty('--eh-w', modeConfig.w);
        root.style.setProperty('--eh-h', modeConfig.h);
    }

    applyBaseStyles() {
        GM_addStyle(`
                :root {
                    --eh-mw: none; --eh-mh: none; --eh-w: auto; --eh-h: auto;
                }
                #i1 {
                    width: 100% !important;
                }
                #img {
                    max-width: var(--eh-mw) !important;
                    max-height: var(--eh-mh) !important;
                    width: var(--eh-w) !important;
                    height: var(--eh-h) !important;
                    display: block !important;
                    margin: 0 auto !important;
                    flex-shrink: 0;
                }
                .eh-resizer-select {
                    margin-left: 10px;
                    padding: 0 5px;
                    background: #34353b;
                    color: #fff;
                    border: 1px solid #5c5c5c;
                    cursor: pointer;
                    font-size: 14px;
                    vertical-align: middle;
                }
            `);
        this.updateCSSVariables();
    }

    registerMenu() {
        if (this.menuId !== null) {
            GM_unregisterMenuCommand(this.menuId);
        }
        const currentConfig = Object.values(this.MODES).find(m => m.id === this.currentModeId) || this.MODES['1'];
        const menuLabel = `Mode: [ ${currentConfig.label} ] Click to Change`;
        this.menuId = GM_registerMenuCommand(menuLabel, () => {
            let menuPrompt = "Select Mode / 切換模式 (Enter Number):\n";
            for (const [num, config] of Object.entries(this.MODES)) {
                const activeMarker = (config.id === this.currentModeId) ? " ▶ " : " ";
                menuPrompt += `${num}.${activeMarker}${config.label} (${config.id})\n`;
            }
            const choice = prompt(menuPrompt, "");
            if (choice && this.MODES[choice]) this.setModeById(this.MODES[choice].id);
        });
    }

    injectUI() {
        const target = document.querySelector('.sn');
        if (!target) return;
        const select = document.createElement('select');
        select.className = 'eh-resizer-select';
        Object.values(this.MODES).forEach(config => {
            const opt = document.createElement('option');
            opt.value = config.id;
            opt.textContent = config.label;
            if (config.id === this.currentModeId) opt.selected = true;
            select.appendChild(opt);
        });
        target.appendChild(select);
    }

    scrollToCurrent(center = true) {
        if (this.imgElements[this.focusedIndex]) {
            this.imgElements[this.focusedIndex].scrollIntoView({
                block: center ? 'center' : 'start',
                behavior: 'smooth'
            });
            // console.log(`[${GM_info.script.name}] Focused image #${this.focusedIndex + 1} of ${this.imgElements.length}`);
        }
    }

    collectImages() {
        this.imgElements = Array.from(document.querySelectorAll('#img'));
    }

    switchImage(direction) {
        this.collectImages();
        if (this.imgElements.length === 0) return;
        if(direction == 0)  this.focusedIndex = 0;
        else this.focusedIndex = (this.focusedIndex + direction + this.imgElements.length) % this.imgElements.length;
        this.scrollToCurrent(true);
    }

    registerKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            console.log(e.getModifierState,e.key)
            if (!e.getModifierState(this.shortcuts.modifier)) return;
            const key = e.key.toLowerCase();
            if (key === this.shortcuts.next.toLowerCase()) {
                e.preventDefault();
                this.switchImage(1);
            } else if (key === this.shortcuts.prev.toLowerCase()) {
                e.preventDefault();
                this.switchImage(-1);
            } else if (key === this.shortcuts.first.toLowerCase()) {
                e.preventDefault();
                this.switchImage(0);
            }
        });
    }
}

const resizer = new ImageResizer();
resizer.init();

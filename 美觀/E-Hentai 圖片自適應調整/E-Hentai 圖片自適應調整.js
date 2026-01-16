// ==UserScript==
// @name         E-Hentai 圖片自適應調整
// @name:en      E-Hentai Image Auto Resize
// @name:ja      E-Hentai 畫像自動調整
// @name:de      E-Hentai Bild automatisch anpassen
// @name:cs      E-Hentai Automatické přizpůsobení obrázků
// @name:lt      E-Hentai Vaizdų automatinis prisitaikymas
// @description  將 E-Hentai / ExHentai 單頁圖片 #img 高度固定為螢幕高度，並在維持原圖比例的前提下盡可能填滿寬度
// @description:en Resize #img to screen height while preserving aspect ratio and maximizing width on E-Hentai/ExHentai viewer pages
// @description:ja E-Hentai/ExHentai閱覧ページで#imgを畫面高さに固定し、アスペクト比を保持したまま幅を最大化
// @description:de Passt #img an Bildschirmhöhe an, behält das Seitenverhältnis bei und maximiert die Breite auf E-Hentai/ExHentai-Seiten
// @description:cs Na stránkách prohlížeče E-Hentai/ExHentai nastaví výšku obrázku #img na výšku obrazovky, zachová poměr stran a maximalizuje šířku
// @description:lt E-Hentai/ExHentai peržiūros puslapiuose nustato #img aukštį pagal ekrano aukštį, išlaiko proporcijas ir maksimaliai išnaudoja plotį
//
// @author       Max
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues
// @license      MPL2.0
//
// @version      1.2.0
// @match        https://exhentai.org/s/*/*
// @match        https://e-hentai.org/s/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=e-hentai.org
// @grant        GM_addStyle
// ==/UserScript==

class ImageResizer {
        constructor() {
            this.currentModeId = GM_getValue('img_mode_id', 'fit-window');
        }

        get MODES() {
            return {
                '1': { id: 'fit-window', label: '🞎', mw: '100vw', mh: '100vh', w: 'auto', h: 'auto' },
                '2': { id: 'fit-height', label: '⭿',  mw: 'none',  mh: '100vh', w: 'auto', h: '100vh' },
                '3': { id: 'fit-width',  label: '⭾',  mw: '100vw', mh: 'none',   w: '100vw', h: 'auto' },
                '4': { id: 'original',   label: '🞨',  mw: 'none',  mh: 'none',   w: 'auto', h: 'auto' }
            };
        }

        applyBaseStyles() {
            GM_addStyle(`
                :root {
                    --eh-mw: none; --eh-mh: none; --eh-w: auto; --eh-h: auto;
                }
                #img {
                    max-width: var(--eh-mw) !important;
                    max-height: var(--eh-mh) !important;
                    width: var(--eh-w) !important;
                    height: var(--eh-h) !important;
                    display: block;
                    margin: 0 auto;
                }
                .eh-resizer-select {
                    margin-left: 10px;
                    padding: 0 5px;
                    background: #34353b;
                    color: #fff;
                    border: 1px solid #5c5c5c;
                    cursor: pointer;
                    font-size: 14px;
                }
            `);
            this.updateCSSVariables();
        }

        updateCSSVariables() {
            const modeConfig = Object.values(this.MODES).find(m => m.id === this.currentModeId) || this.MODES['1'];
            const root = document.documentElement;
            root.style.setProperty('--eh-mw', modeConfig.mw);
            root.style.setProperty('--eh-mh', modeConfig.mh);
            root.style.setProperty('--eh-w', modeConfig.w);
            root.style.setProperty('--eh-h', modeConfig.h);
        }

        setModeById(modeId) {
            this.currentModeId = modeId;
            GM_setValue('img_mode_id', modeId);
            this.updateCSSVariables();

            const select = document.querySelector('.eh-resizer-select');
            if (select) select.value = modeId;
        }

        registerMenu() {
            GM_registerMenuCommand("Change Display Mode / 切換模式", () => {
                let menuText = "Select Mode (Enter Number):\n";
                for (const [num, config] of Object.entries(this.MODES)) {
                    menuText += `${num}. ${config.label} (${config.id})\n`;
                }

                const choice = prompt(menuText, "");
                if (choice && this.MODES[choice]) {
                    this.setModeById(this.MODES[choice].id);
                }
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

            select.addEventListener('change', (e) => this.setModeById(e.target.value));
            target.appendChild(select);
        }

        init() {
            this.applyBaseStyles();
            this.registerMenu();

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.injectUI());
            } else {
                this.injectUI();
            }
        }
    }

    const resizer = new ImageResizer();
    resizer.init();

// ==UserScript==
// @name         連結開啟管理器
// @name:ja      リンクオープンマネージャー
// @name:en      Link Open Manager
// @name:de      Link-Öffnungs-Manager
// @name:es      Gestor de Apertura de Enlaces
// @name:hi      लिंक ओपन मैनेजर
// @name:uk      Менеджер відкриття посилань
// @name:cs      Správce otevírání odkazů
// @name:lt      Nuorodų atidarymo tvarkytuvas
// @description  使用者能夠撰寫規則使其決定在某個網域點選連結時，能夠依照目的地執行不同的行為。若沒有規則限制，預設行為是同網域連結時、總是新頁面開啟、且新頁面為非活動標籤頁。
// @description:zh-TW 使用者能夠撰寫規則使其決定在某個網域點選連結時，能夠依照目的地執行不同的行為。若沒有規則限制，預設行為是同網域連結時、總是新頁面開啟、且新頁面為非活動標籤頁。
// @description:ja ユーザーはルールを記述して、特定のドメインでリンクをクリックしたときに、目的地に応じて異なる動作を実行できます。ルールがない場合、デフォルトの動作は同じドメインのリンクで常に新しいページを開き、新しいページを非アクティブタブにします。
// @description:en Users can write rules to determine different behaviors when clicking links in a certain domain based on the destination. If there are no rule restrictions, the default behavior is to always open same-domain links in a new page, and the new page is a non-active tab.
// @description:de Benutzer können Regeln schreiben, um unterschiedliche Verhaltensweisen beim Klicken auf Links in einer bestimmten Domain basierend auf dem Ziel zu bestimmen. Wenn es keine Regelbeschränkungen gibt, ist das Standardverhalten, Links derselben Domain immer in einer neuen Seite zu öffnen, und die neue Seite ist ein nicht aktiver Tab.
// @description:es Los usuarios pueden escribir reglas para determinar diferentes comportamientos al hacer clic en enlaces en un dominio determinado según el destino. Si no hay restricciones de reglas, el comportamiento predeterminado es abrir siempre enlaces del mismo dominio en una nueva página, y la nueva página es una pestaña no activa.
// @description:hi उपयोगकर्ता नियम लिख सकते हैं ताकि किसी विशेष डोमेन में लिंक क्लिक करने पर गंतव्य के आधार पर विभिन्न व्यवहार निर्धारित हो सकें। यदि कोई नियम प्रतिबंध नहीं है, तो डिफ़ॉल्ट व्यवहार है कि समान डोमेन लिंक हमेशा एक नए पेज में खोलें, और नया पेज एक गैर-सक्रिय टैब हो।
// @description:uk Користувачі можуть писати правила, щоб визначати різні поведінки при клацанні на посиланнях у певному домені на основі призначення. Якщо немає обмежень правил, стандартна поведінка - завжди відкривати посилання з того ж домену на новій сторінці, а нова сторінка є неактивною вкладкою.
// @description:cs Uživatelé mohou psát pravidla k určení různých chování při kliknutí na odkazy v určité doméně na základě cíle. Pokud nejsou žádná omezení pravidel, výchozí chování je vždy otevřít odkazy stejné domény na nové stránce a nová stránka je neaktivní karta.
// @description:lt Vartotojai gali rašyti taisykles, kad nustatytų skirtingus elgsenas spustelėjus nuorodas tam tikrame domene pagal paskirtį. Jei nėra taisyklių apribojimų, numatytasis elgsena yra visada atidaryti tos pačios domeno nuorodas naujame puslapyje, o naujas puslapis yra neaktyvus skirtukas.
//
// @author       Max
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E7%9C%81%E5%8A%9B/%E9%80%A3%E7%B5%90%E9%96%8B%E5%95%9F%E7%AE%A1%E7%90%86%E5%99%A8
// @license      MPL2.0
//
// @version      1.1.0
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_openInTab
// ==/UserScript==

const RULE_VERSION = 1;

class RuleManager {
    openRules;
    constructor() {
        this.openRules = GM_getValue('openRules', { rules: [], version: 0 });
        this.migrateRulesIfNeeded();
    }

    //依據規則更新更改
    migrateRulesIfNeeded() {
        if (this.openRules.version >= RULE_VERSION) return;

        console.log(`規則版本從 ${this.openRules.version} 升級至 ${RULE_VERSION}`);
        this.openRules.version = RULE_VERSION;
        this.updateRules();
    }

    addRule(newRule) {
        this.openRules.rules.push(newRule);
        this.updateRules();
    }

    updateRule(index, updatedRule) {
        this.openRules.rules[index] = updatedRule;
        this.updateRules();
    }

    deleteRule(index) {
        this.openRules.rules.splice(index, 1);
        this.updateRules();
    }

    updateRules() {
        GM_setValue('openRules', this.openRules);
    }
}

class WebElementHandler {
    constructor(ruleManager) {
        this.ruleManager = ruleManager;
        this.setupUrlChangeListener();
    }

    ruleManager;
    linkHandler;
    processedElements = new WeakSet();
    i18n = {
        'zh-TW': {
            title: '連結開啟設定',
            matchingRules: '符合的規則',
            noMatchingRules: '當前網頁無符合的規則。',
            addRuleSection: '新增規則',
            ruleName: '規則名稱：',
            urlPattern: '規則網址（正則表達式）：',
            sameDomainAll: '同網域皆符合規則：',
            isBlacklist: '黑名單（符合則不處理）：',
            targetUrl: '目標網址（正則表達式）：',
            openMethod: '開啟方式：',
            isBackground: '新頁面為非活動標籤頁：',
            enabled: '規則啟用：',
            addRule: '新增規則',
            save: '儲存',
            delete: '刪除',
            ruleNamePlaceholder: '例如：我的規則（可省略）',
            urlPatternPlaceholder: '例如：https://example.com/.*',
            targetUrlPlaceholder: '例如：https://example.com/target/.*',
            invalidRegex: '無效的正則表達式',
            sameTab: '同頁開啟',
            newTab: '新頁開啟',
            default: '預設'
        },
        'ja': {
            title: 'リンク開く設定',
            matchingRules: '一致するルール',
            noMatchingRules: '現在のページに一致するルールはありません。',
            addRuleSection: '新しいルールを追加',
            ruleName: 'ルール名：',
            urlPattern: 'ルールURL（正規表現）：',
            sameDomainAll: '同一ドメインすべてルール適用：',
            isBlacklist: 'ブラックリスト（一致したら無視）：',
            targetUrl: 'ターゲットURL（正規表現）：',
            openMethod: '開く方法：',
            isBackground: '新しいページを非アクティブタブ：',
            enabled: 'ルール有効：',
            addRule: 'ルールを追加',
            save: '儲存',
            delete: '削除',
            ruleNamePlaceholder: '例：私のルール（省略可能）',
            urlPatternPlaceholder: '例：https://example\\.com/.*',
            targetUrlPlaceholder: '例：https://example\\.com/target/.*',
            invalidRegex: '無効な正規表現',
            sameTab: '同じタブで開く',
            newTab: '新しいタブで開く',
            default: 'デフォルト'
        },
        'en': {
            title: 'Link Open Settings',
            matchingRules: 'Matching Rules',
            noMatchingRules: 'No rules match the current URL.',
            addRuleSection: 'Add New Rule',
            ruleName: 'Rule Name:',
            urlPattern: 'Rule URL (Regex):',
            sameDomainAll: 'Apply rule to all same-domain links:',
            isBlacklist: 'Blacklist (ignore if matched):',
            targetUrl: 'Target URL (Regex):',
            openMethod: 'Open Method:',
            isBackground: 'New Page as Background Tab:',
            enabled: 'Rule Enabled:',
            addRule: 'Add Rule',
            save: 'Save',
            delete: 'Delete',
            ruleNamePlaceholder: 'e.g., My Rule (optional)',
            urlPatternPlaceholder: 'e.g., https://example\\.com/.*',
            targetUrlPlaceholder: 'e.g., https://example\\.com/target/.*',
            invalidRegex: 'Invalid regular expression',
            sameTab: 'Same Tab',
            newTab: 'New Tab',
            default: 'Default'
        },
        'de': {
            title: 'Link-Öffnungs-Einstellungen',
            matchingRules: 'Passende Regeln',
            noMatchingRules: 'Keine Regeln passen zur aktuellen URL.',
            addRuleSection: 'Neue Regel hinzufügen',
            ruleName: 'Regelname:',
            urlPattern: 'Regel-URL (Regex):',
            sameDomainAll: 'Regel auf alle gleiche Domain anwenden:',
            isBlacklist: 'Blacklist (ignorieren, wenn übereinstimmt):',
            targetUrl: 'Ziel-URL (Regex):',
            openMethod: 'Öffnungsmethode:',
            isBackground: 'Neue Seite als Hintergrund-Tab:',
            enabled: 'Regel aktiviert:',
            addRule: 'Regel hinzufügen',
            save: 'Speichern',
            delete: 'Löschen',
            ruleNamePlaceholder: 'z.B. Meine Regel (optional)',
            urlPatternPlaceholder: 'z.B. https://example\\.com/.*',
            targetUrlPlaceholder: 'z.B. https://example\\.com/target/.*',
            invalidRegex: 'Ungültiger regulärer Ausdruck',
            sameTab: 'Gleicher Tab',
            newTab: 'Neuer Tab',
            default: 'Standard'
        },
        'hi': {
            title: 'लिंक ओपन सेटिंग्स',
            matchingRules: 'मिलान करने वाले नियम',
            noMatchingRules: 'वर्तमान URL से कोई नियम मेल नहीं खाता।',
            addRuleSection: 'नया नियम जोड़ें',
            ruleName: 'नियम नाम:',
            urlPattern: 'नियम URL (रेगेक्स):',
            sameDomainAll: 'सभी समान डोमेन पर नियम लागू करें:',
            isBlacklist: 'ब्लैकलिस्ट (मिलान होने पर अनदेखा करें):',
            targetUrl: 'लक्ष्य URL (रेगेक्स):',
            openMethod: 'ओपन विधि:',
            isBackground: 'नया पेज बैकग्राउंड टैब के रूप में:',
            enabled: 'नियम सक्षम:',
            addRule: 'नियम जोड़ें',
            save: 'सहेजें',
            delete: 'हटाएं',
            ruleNamePlaceholder: 'उदा. मेरा नियम (वैकल्पिक)',
            urlPatternPlaceholder: 'उदा. https://example\\.com/.*',
            targetUrlPlaceholder: 'उदा. https://example\\.com/target/.*',
            invalidRegex: 'अमान्य रेगुलर एक्सप्रेशन',
            sameTab: 'उसी टैब में',
            newTab: 'नए टैब में',
            default: 'डिफ़ॉल्ट'
        },
        'uk': {
            title: 'Налаштування відкриття посилань',
            matchingRules: 'Відповідні правила',
            noMatchingRules: 'Жодне правило не відповідає поточній URL.',
            addRuleSection: 'Додати нове правило',
            ruleName: 'Назва правила:',
            urlPattern: 'URL правила (регулярний вираз):',
            sameDomainAll: 'Застосовувати правило до всіх посилань того ж домену:',
            isBlacklist: 'Чорний список (ігнорувати, якщо збігається):',
            targetUrl: 'Цільова URL (регулярний вираз):',
            openMethod: 'Метод відкриття:',
            isBackground: 'Нова сторінка як фонова вкладка:',
            enabled: 'Правило ввімкнено:',
            addRule: 'Додати правило',
            save: 'Зберегти',
            delete: 'Видалити',
            ruleNamePlaceholder: 'Напр. Моє правило (опціонально)',
            urlPatternPlaceholder: 'Напр. https://example\\.com/.*',
            targetUrlPlaceholder: 'Напр. https://example\\.com/target/.*',
            invalidRegex: 'Недійсний регулярний вираз',
            sameTab: 'У тій самій вкладці',
            newTab: 'У новій вкладці',
            default: 'За замовчуванням'
        },
        'cs': {
            title: 'Nastavení otevírání odkazů',
            matchingRules: 'Odpovídající pravidla',
            noMatchingRules: 'Žádná pravidla neodpovídají aktuální URL.',
            addRuleSection: 'Přidat nové pravidlo',
            ruleName: 'Název pravidla:',
            urlPattern: 'URL pravidla (regex):',
            sameDomainAll: 'Aplikovat pravidlo na všechny odkazy stejné domény:',
            isBlacklist: 'Černá listina (ignorovat, pokud se shoduje):',
            targetUrl: 'Cílová URL (regex):',
            openMethod: 'Metoda otevření:',
            isBackground: 'Nová stránka jako pozadí karta:',
            enabled: 'Pravidlo povoleno:',
            addRule: 'Přidat pravidlo',
            save: 'Uložit',
            delete: 'Smazat',
            ruleNamePlaceholder: 'např. Moje pravidlo (volitelné)',
            urlPatternPlaceholder: 'např. https://example\\.com/.*',
            targetUrlPlaceholder: 'např. https://example\\.com/target/.*',
            invalidRegex: 'Neplatný regulární výraz',
            sameTab: 'Stejná karta',
            newTab: 'Nová karta',
            default: 'Výchozí'
        },
        'lt': {
            title: 'Nuorodų atidarymo nustatymai',
            matchingRules: 'Atitinkantys taisyklės',
            noMatchingRules: 'Jokia taisyklė neatitinka dabartinio URL.',
            addRuleSection: 'Pridėti naują taisyklę',
            ruleName: 'Taisyklės pavadinimas:',
            urlPattern: 'Taisyklės URL (regex):',
            sameDomainAll: 'Taikyti taisyklę visoms tos pačios domeno nuorodoms:',
            isBlacklist: 'Juodasis sąrašas (ignoruoti, jei atitinka):',
            targetUrl: 'Tikslinis URL (regex):',
            openMethod: 'Atidarymo metodas:',
            isBackground: 'Naujas puslapis kaip foninis skirtukas:',
            enabled: 'Taisyklė įjungta:',
            addRule: 'Pridėti taisyklę',
            save: 'Išsaugoti',
            delete: 'Ištrinti',
            ruleNamePlaceholder: 'pvz. Mano taisyklė (neprivaloma)',
            urlPatternPlaceholder: 'pvz. https://example\\.com/.*',
            targetUrlPlaceholder: 'pvz. https://example\\.com/target/.*',
            invalidRegex: 'Neteisingas reguliarusis reiškinys',
            sameTab: 'Tas pats skirtukas',
            newTab: 'Naujas skirtukas',
            default: 'Numatytoji'
        }
    };

    getMenuTitle() {
        return this.i18n[this.getLanguage()].title;
    }

    getLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        if (lang.startsWith('zh')) return 'zh-TW';
        if (lang.startsWith('ja')) return 'ja';
        if (lang.startsWith('de')) return 'de';
        if (lang.startsWith('es')) return 'es';
        return 'en';
    }

    validateRule(rule) {
        const i18n = this.i18n[this.getLanguage()];
        try {
            new RegExp(rule.urlPattern);
        } catch (e) {
            alert(`${i18n.invalidRegex}: ${rule.urlPattern}`);
            return false;
        }
        if (!rule.sameDomainAll && rule.targetUrl) {
            try {
                new RegExp(rule.targetUrl);
            } catch (e) {
                alert(`${i18n.invalidRegex}: ${rule.targetUrl}`);
                return false;
            }
        }
        return true;
    }

    createRuleElement(rule, ruleIndex) {
        const i18n = this.i18n[this.getLanguage()];
        const targetUrlInput = rule.sameDomainAll ? '' : `
            <label>${i18n.targetUrl}</label>
            <input type="text" id="updateTargetUrl${ruleIndex}" value="${rule.targetUrl || ''}">
        `;
        const ruleDiv = document.createElement('div');
        ruleDiv.innerHTML = `
            <div class="ruleHeader" id="ruleHeader${ruleIndex}">
                <strong>${rule.ruleName || `規則 ${ruleIndex + 1}`}</strong>
            </div>
            <div class="readRule" id="readRule${ruleIndex}" style="display: none;">
                <label>${i18n.ruleName}</label>
                <input type="text" id="updateRuleName${ruleIndex}" value="${rule.ruleName || ''}">
                <label>${i18n.urlPattern}</label>
                <input type="text" id="updateUrlPattern${ruleIndex}" value="${rule.urlPattern}">
                <div class="checkbox-container">
                    <label>${i18n.sameDomainAll}</label>
                    <input type="checkbox" id="updateSameDomainAll${ruleIndex}" ${rule.sameDomainAll ? 'checked' : ''}>
                </div>
                <div class="checkbox-container">
                    <label>${i18n.isBlacklist}</label>
                    <input type="checkbox" id="updateIsBlacklist${ruleIndex}" ${rule.isBlacklist ? 'checked' : ''}>
                </div>
                ${targetUrlInput}
                <label>${i18n.openMethod}</label>
                <select id="updateOpenMethod${ruleIndex}">
                    <option value="default" ${rule.openMethod === 'default' ? 'selected' : ''}>${i18n.default}</option>
                    <option value="same_tab" ${rule.openMethod === 'same_tab' ? 'selected' : ''}>${i18n.sameTab}</option>
                    <option value="new_tab" ${rule.openMethod === 'new_tab' ? 'selected' : ''}>${i18n.newTab}</option>
                </select>
                <div class="checkbox-container">
                    <label>${i18n.isBackground}</label>
                    <input type="checkbox" id="updateIsBackground${ruleIndex}" ${rule.isBackground ? 'checked' : ''}>
                </div>
                <div class="checkbox-container">
                    <label>${i18n.enabled}</label>
                    <input type="checkbox" id="updateEnabled${ruleIndex}" ${rule.enabled ? 'checked' : ''}>
                </div>
                <button id="updateRule${ruleIndex}">${i18n.save}</button>
                <button id="deleteRule${ruleIndex}">${i18n.delete}</button>
            </div>
        `;
        return ruleDiv;
    }

    createMenuElement() {
        const i18n = this.i18n[this.getLanguage()];
        const menu = document.createElement('div');
        menu.style.position = 'fixed';
        menu.style.top = '10px';
        menu.style.right = '10px';
        menu.style.background = 'rgb(36, 36, 36)';
        menu.style.color = 'rgb(204, 204, 204)';
        menu.style.border = '1px solid rgb(80, 80, 80)';
        menu.style.padding = '10px';
        menu.style.zIndex = '10000';
        menu.style.maxWidth = '400px';
        menu.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

        menu.innerHTML = `
            <style>
                #linkOpenMenu { overflow-y: auto; max-height: 80vh; }
                #linkOpenMenu input:not([type="checkbox"]), #linkOpenMenu select, #linkOpenMenu button {
                    background: rgb(50, 50, 50); color: rgb(204, 204, 204);
                    border: 1px solid rgb(80, 80, 80); margin: 5px 0; padding: 5px; width: 100%; box-sizing: border-box;
                }
                #linkOpenMenu input[type="checkbox"] { margin: 0 5px 0 0; vertical-align: middle; }
                #linkOpenMenu button { cursor: pointer; }
                #linkOpenMenu button:hover { background: rgb(70, 70, 70); }
                #linkOpenMenu label { margin-top: 5px; display: block; }
                #linkOpenMenu .checkbox-container { display: flex; align-items: center; margin-top: 5px; }
                #linkOpenMenu .ruleHeader { cursor: pointer; background: rgb(50, 50, 50); padding: 5px; margin: 5px 0; border-radius: 3px; }
                #linkOpenMenu .readRule { padding: 5px; border: 1px solid rgb(80, 80, 80); border-radius: 3px; margin-bottom: 5px; }
                #linkOpenMenu .headerContainer { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                #linkOpenMenu .closeButton { width: auto; padding: 5px 10px; margin: 0; }
            </style>
            <div id="linkOpenMenu">
                <div class="headerContainer">
                    <h3>${i18n.title}</h3>
                    <button id="closeMenu" class="closeButton">✕</button>
                </div>
                <div id="rulesList"></div>
                <h4>${i18n.addRuleSection}</h4>
                <label>${i18n.ruleName}</label>
                <input type="text" id="ruleName" placeholder="${i18n.ruleNamePlaceholder}">
                <label>${i18n.urlPattern}</label>
                <input type="text" id="urlPattern" value="${window.location.origin}/.*">
                <div class="checkbox-container">
                    <label>${i18n.sameDomainAll}</label>
                    <input type="checkbox" id="sameDomainAll" checked>
                </div>
                <div class="checkbox-container">
                    <label>${i18n.isBlacklist}</label>
                    <input type="checkbox" id="isBlacklist">
                </div>
                <label>${i18n.targetUrl}</label>
                <input type="text" id="targetUrl" placeholder="${i18n.targetUrlPlaceholder}" disabled>
                <label>${i18n.openMethod}</label>
                <select id="openMethod">
                    <option value="default">${i18n.default}</option>
                    <option value="same_tab">${i18n.sameTab}</option>
                    <option value="new_tab" selected>${i18n.newTab}</option>
                </select>
                <div class="checkbox-container">
                    <label>${i18n.isBackground}</label>
                    <input type="checkbox" id="isBackground" checked>
                </div>
                <div class="checkbox-container">
                    <label>${i18n.enabled}</label>
                    <input type="checkbox" id="enabled" checked>
                </div>
                <button id="addRule" style="margin-top: 10px;">${i18n.addRule}</button>
            </div>
        `;

        document.body.appendChild(menu);
        this.updateRulesElement();

        const sameDomainCheckbox = document.getElementById('sameDomainAll');
        const targetUrlInput = document.getElementById('targetUrl');
        sameDomainCheckbox.addEventListener('change', () => {
            targetUrlInput.disabled = sameDomainCheckbox.checked;
        });

        document.getElementById('addRule').addEventListener('click', () => {
            const newRule = {
                ruleName: document.getElementById('ruleName').value.trim() || null,
                urlPattern: document.getElementById('urlPattern').value.trim(),
                sameDomainAll: document.getElementById('sameDomainAll').checked,
                isBlacklist: document.getElementById('isBlacklist').checked,
                targetUrl: document.getElementById('sameDomainAll').checked ? null : document.getElementById('targetUrl').value.trim(),
                openMethod: document.getElementById('openMethod').value,
                isBackground: document.getElementById('isBackground').checked,
                enabled: document.getElementById('enabled').checked
            };

            if (!this.validateRule(newRule)) return;

            this.ruleManager.addRule(newRule);
            this.updateRulesElement();

            // 清空表單
            document.getElementById('ruleName').value = '';
            document.getElementById('urlPattern').value = window.location.origin + '/.*';
            document.getElementById('sameDomainAll').checked = true;
            document.getElementById('isBlacklist').checked = false;
            document.getElementById('targetUrl').value = '';
            document.getElementById('targetUrl').disabled = true;
            document.getElementById('openMethod').value = 'new_tab';
            document.getElementById('isBackground').checked = true;
            document.getElementById('enabled').checked = true;
        });

        document.getElementById('closeMenu').addEventListener('click', () => menu.remove());
    }

    updateRulesElement() {
        const rulesList = document.getElementById('rulesList');
        const i18n = this.i18n[this.getLanguage()];
        if (!rulesList) return;

        rulesList.innerHTML = `<h4>${i18n.matchingRules}</h4>`;
        const currentUrl = window.location.href;

        const matchingRules = this.ruleManager.openRules.rules.filter(rule => {
            try {
                return new RegExp(rule.urlPattern).test(currentUrl);
            } catch {
                return false;
            }
        });

        if (matchingRules.length === 0) {
            rulesList.innerHTML += `<p>${i18n.noMatchingRules}</p>`;
            return;
        }

        matchingRules.forEach((rule, idx) => {
            const globalIndex = this.ruleManager.openRules.rules.indexOf(rule);
            const ruleDiv = this.createRuleElement(rule, globalIndex);
            rulesList.appendChild(ruleDiv);

            document.getElementById(`ruleHeader${globalIndex}`).onclick = () => {
                const details = document.getElementById(`readRule${globalIndex}`);
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            };

            const updateSameDomain = document.getElementById(`updateSameDomainAll${globalIndex}`);
            const updateTargetInput = document.getElementById(`updateTargetUrl${globalIndex}`);
            if (updateSameDomain && updateTargetInput) {
                updateSameDomain.onchange = () => {
                    updateTargetInput.disabled = updateSameDomain.checked;
                };
            }

            document.getElementById(`updateRule${globalIndex}`).onclick = () => {
                const updated = {
                    ruleName: document.getElementById(`updateRuleName${globalIndex}`).value.trim() || null,
                    urlPattern: document.getElementById(`updateUrlPattern${globalIndex}`).value.trim(),
                    sameDomainAll: document.getElementById(`updateSameDomainAll${globalIndex}`).checked,
                    isBlacklist: document.getElementById(`updateIsBlacklist${globalIndex}`).checked,
                    targetUrl: document.getElementById(`updateSameDomainAll${globalIndex}`).checked ? null : document.getElementById(`updateTargetUrl${globalIndex}`)?.value.trim() ?? null,
                    openMethod: document.getElementById(`updateOpenMethod${globalIndex}`).value,
                    isBackground: document.getElementById(`updateIsBackground${globalIndex}`).checked,
                    enabled: document.getElementById(`updateEnabled${globalIndex}`).checked
                };

                if (!this.validateRule(updated)) return;
                this.ruleManager.updateRule(globalIndex, updated);
                this.updateRulesElement();
            };

            document.getElementById(`deleteRule${globalIndex}`).onclick = () => {
                this.ruleManager.deleteRule(globalIndex);
                this.updateRulesElement();
            };
        });
    }

    setupUrlChangeListener() {
        const events = ['pushstate', 'replacestate', 'popstate', 'hashchange', 'locationchange'];
        const handler = () => this.updateRulesElement();

        events.forEach(ev => window.addEventListener(ev, handler));

        const originalPushState = history.pushState;
        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            window.dispatchEvent(new Event('pushstate'));
            window.dispatchEvent(new Event('locationchange'));
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            window.dispatchEvent(new Event('replacestate'));
            window.dispatchEvent(new Event('locationchange'));
        };
    }
}

class LinkHandler {
    ruleManager;
    currentDomain = new URL(window.location.href).hostname;

    constructor(ruleManager) {
        this.ruleManager = ruleManager;
        this.setupLinkListeners();
    }

    setupLinkListeners() {
        document.addEventListener('click', (event) => {
            if (event.button !== 0) return;
            const a = event.target.closest('a');
            if (!a || !a.href) return;
            if (a.href.startsWith('javascript:') || !a.href.startsWith('http')) return;

            const rule = this.findMatchingRule(a.href);
            if (!rule || rule.isBlacklist) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            this.executeRule(rule, a.href);
        }, true);
    }

    findMatchingRule(targetUrl) {
        const currentUrl = window.location.href;
        for (const rule of this.ruleManager.openRules.rules) {
            if (!rule.enabled) continue;
            try {
                if (new RegExp(rule.urlPattern).test(currentUrl)) {
                    const matchTarget = rule.sameDomainAll
                    ? this.isSameDomain(targetUrl)
                    : (rule.targetUrl && new RegExp(rule.targetUrl).test(targetUrl));

                    if (matchTarget) return rule;
                }
            } catch (e) {
                console.warn(`${GM_info.script.name}: 規則符合失敗`, e);
            }
        }
        return null;
    }

    isSameDomain(url) {
        try {
            return new URL(url).hostname === this.currentDomain;
        } catch {
            return false;
        }
    }

    executeRule(rule, url) {
        let method = rule.openMethod
        const background = rule.isBackground ?? true;

        if (method === 'same_tab') {
            window.location.href = url;
        } else if (method === 'new_tab') {
            GM_openInTab(url, {
                active: !background,
                insert: true,
                setParent: true
            });
        }
    }
}

const ruleManager = new RuleManager();
const linkHandler = new LinkHandler(ruleManager);
const webHandler = new WebElementHandler(ruleManager);

GM_registerMenuCommand(webHandler.getMenuTitle(), () => {
    if (document.getElementById('linkOpenMenu')) return;
    webHandler.createMenuElement();
});

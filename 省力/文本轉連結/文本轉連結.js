// ==UserScript==
// @name         文本轉連結
// @name:en      Text Linkify
// @name:ja      テキストをリンクに変換
// @name:es      Convertir Texto en Enlaces
// @name:de      Text zu Links konvertieren
// @name:hi      टेक्स्ट को लिंक में बदलें
// @name:cs      Převod textu na odkazy
// @name:lt      Teksto konvertavimas į nuorodas
// @description  提供黑名單、選擇器等更多自訂功能。自動將文字中的網址轉為可點擊連結。
// @description:en Auto convert text URLs to clickable links. Supports blacklist, custom selectors and more customization features.
// @description:ja テキスト内のURLを自動でクリック可能なリンクに変換します。ブラックリスト、選択子などのカスタム機能対応。
// @description:es Convierte automáticamente URLs en texto a enlaces clicables. Soporta lista negra, selectores personalizados y más.
// @description:de Wandelt URLs im Text automatisch in anklickbare Links um. Unterstützt Blacklist, benutzerdefinierte Selektoren und mehr.
// @description:hi टेक्स्ट में URLs को स्वचालित रूप से क्लिक करने योग्य लिंक में बदलता है। ब्लैकलिस्ट, कस्टम सेलेक्टर आदि समर्थन।
// @description:cs Automaticky převádí URL v textu na klikatelné odkazy. Podpora blacklistu, vlastních selektorů a dalších možností.
// @description:lt Automatiškai paverčia tekste esančias URL į spustelėjamas nuorodas. Palaiko juodąjį sąrašą, pasirinktinius selektorius ir kt.
//
// @author       Max
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues
// @license      MPL2.0
//
// @version      1.4.0
// @match        *://*/*
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

class TextLinkifier {
    constructor() {
        this.scriptName = '[自動文字連結轉換器]';
        this.currentDomain = this.getCurrentDomain();
        this.blacklist = GM_getValue('blacklist', ['localhost', '127.0.0.1']);
        this.domainSelectors = GM_getValue('domainSelectors', {});
        this.domainStyles = GM_getValue('domainStyles', {});
        this.excludeTags = new Set([
            'A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT',
            'SCRIPT', 'STYLE', 'NOSCRIPT', 'CANVAS', 'VIDEO'
        ]);
        //嘗試排除ReDoS
        this.looseUrlRegex = /\b(?:https?:\/\/|www\.)[^\s<>'"()|[\]{}]*[^\s<>'"()|[\]{}.:;?!,]/gi;

        this.init();
    }

    #DEFAULT_SITE_NAMES = {
        'youtube.com': 'YouTube',
        'youtu.be': 'YouTube',
        'youtube-nocookie.com': 'YouTube',
        'google.com': 'Google',
        'googleusercontent.com': 'Google',
        'twitter.com': 'X',
        'x.com': 'X',
        'facebook.com': 'Facebook',
        'instagram.com': 'Instagram',
        'tiktok.com': 'TikTok',
        'reddit.com': 'Reddit',
        'github.com': 'GitHub',
        'wikipedia.org': '維基百科',
        'pixiv.net': 'Pixiv',
        'nicovideo.jp': 'Niconico',
        'twitch.tv': 'Twitch',
        'vimeo.com': 'Vimeo',
        'dailymotion.com': 'Dailymotion',
        'rumble.com': 'Rumble',
        'kick.com': 'Kick',
        'live.bilibili.com': 'Bilibili 直播',
        'discord.com': 'Discord',
        'discord.gg': 'Discord',
        'threads.net': 'Threads',
        'linkedin.com': 'LinkedIn',
        'bit.ly': 'Bitly',
        'tinyurl.com': 'TinyURL',
        'goo.gl': 'Google 短網址',
        't.co': 'Twitter 短網址',
        'amazon.com': 'Amazon',
        'amazon.co.jp': 'Amazon 日本',
        'shopee.tw': '蝦皮',
        'shopee.com': 'Shopee',
        'rakuten.co.jp': '樂天日本',
        'momo.tw': 'momo購物網',
        'pornhub.com': 'Pornhub',
        'xvideos.com': 'XVideos',
        'xnxx.com': 'XNXX',
        'onlyfans.com': 'OnlyFans',
        'steamcommunity.com': 'Steam',
        'steampowered.com': 'Steam',
        'patreon.com': 'Patreon',
        'fanbox.cc': 'pixivFANBOX',
        'fantia.jp': 'Fantia',
        'chatgpt.com': 'ChatGPT',
        'openai.com': 'OpenAI',
        'stackoverflow.com': 'Stack Overflow',
        'notion.so': 'Notion',
        'figma.com': 'Figma',
        'canva.com': 'Canva',
        'netflix.com': 'Netflix',
        'spotify.com': 'Spotify',
        'apple.com': 'Apple',
        'news.google.com': 'Google 新聞',
        'news.yahoo.co.jp': 'Yahoo! 新聞日本',
        'news.ltn.com.tw': '自由時報',
        'cna.com.tw': '中央社',
        'ptt.cc': 'PTT'
    };

    getCurrentDomain() {
        try { return location.hostname.toLowerCase().replace(/^www\./, ''); }
        catch { return 'unknown'; }
    }

    isCurrentDomainBlacklisted() {
        const host = this.currentDomain;
        return this.blacklist.some(item => {
            const b = item.toLowerCase().trim();
            return b && (host === b || host.endsWith('.' + b));
        });
    }

    init() {
        this.registerMenuCommands();
        if (this.isCurrentDomainBlacklisted()) return;
        this.injectDomainStyles();
        this.processDocument();
        this.startMutationObserver();
    }

    injectDomainStyles() {
        const style = document.createElement('style');
        let css = `
                .auto-text-link {
                    text-decoration: underline !important;
                    text-decoration-skip-ink: auto !important;
                    text-underline-offset: 2px !important;
                    cursor: pointer !important;
                    transition: text-decoration-thickness 0.2s !important;
                    color: inherit !important;
                }
                .auto-text-link:hover {
                    text-decoration-thickness: 2px !important;
                }
            `;
            const customCss = this.domainStyles[this.currentDomain];
            style.textContent = customCss || css;
            document.head.appendChild(style);
        }

        registerMenuCommands() {
                const toggleCaption = this.isCurrentDomainBlacklisted()
                    ? I18N.t('BlacklistR', this.currentDomain)
                    : I18N.t('BlacklistC', this.currentDomain);
                GM_registerMenuCommand(toggleCaption, () => this.toggleCurrentDomainInBlacklist());
                GM_registerMenuCommand(I18N.t('menuEditSelector'), () => this.editDomainSelector());
                GM_registerMenuCommand(I18N.t('menuEditStyle'), () => this.editDomainStyle());
        }

        processDocument() {
            const selector = this.domainSelectors[this.currentDomain];
            if (selector)
                document.querySelectorAll(selector).forEach(el => this.processNode(el));
            else
                this.processNode(document.body);
        }

        startMutationObserver() {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => this.processNode(node));
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (this.shouldSkip(node.parentElement)) return;
                this.convertTextNode(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (this.shouldSkip(node)) return;
                const selector = this.domainSelectors[this.currentDomain];
                if (selector && !node.closest(selector)) return;
                Array.from(node.childNodes).forEach(child => this.processNode(child));
            }
        }

        shouldSkip(el) {
            if (!el) return false;
            if (this.excludeTags.has(el.tagName?.toUpperCase())) return true;
            if (el.isContentEditable || el.getAttribute('aria-hidden') === 'true') return true;
            return false;
        }

        convertTextNode(textNode) {
            const text = textNode.textContent;
            if (!text || text.length < 5) return;

            const fragments = [];
            let lastIndex = 0;
            this.looseUrlRegex.lastIndex = 0;

            let match;
            while ((match = this.looseUrlRegex.exec(text)) !== null) {
                const raw = match[0];
                const validated = this.validateAndFixUrl(raw);

                if (validated) {
                    if (match.index > lastIndex) {
                        fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
                    }
                    fragments.push(this.createLinkElement(raw, validated.href));
                    lastIndex = this.looseUrlRegex.lastIndex;
                }
            }

            if (fragments.length > 0) {
                if (lastIndex < text.length) {
                    fragments.push(document.createTextNode(text.slice(lastIndex)));
                }
                const wrapper = document.createElement('span');
                wrapper.className = 'auto-link-wrapper';
                fragments.forEach(f => wrapper.appendChild(f));
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        }

        validateAndFixUrl(raw) {
            let urlStr = raw.trim();
            if (urlStr.toLowerCase().startsWith('www.')) urlStr = 'https://' + urlStr;

            try {
                const url = new URL(urlStr);
                if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

                const host = url.hostname;
                // 排除沒點的(localhost)或點後太短的(版本號 v1.1)
                if (!host.includes('.') || host.split('.').pop().length < 2) return null;
                // 排除純數字版本號 (如 1.2.3.4)
                if (/^[0-9.]+$/.test(host) && host.split('.').length > 2) {
                    if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return null; //IP
                }

                return url;
            } catch { return null; }
        }

        createLinkElement(displayText, href) {
            const a = document.createElement('a');
            a.className = 'auto-text-link';
            a.textContent = displayText;
            a.href = href;
            a.title = this.getFriendlyTitle(href);
            a.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                GM_openInTab(href, { active: false, insert: true });
            });
            return a;
        }

        getFriendlyTitle(url) {
            try {
                const u = new URL(url);
                const host = u.hostname.toLowerCase().replace(/^www\./, '');
                for (const [key, name] of Object.entries(this.#DEFAULT_SITE_NAMES)) {
                    if (host.includes(key)) return I18N.t('goTo', name);
                }
                return I18N.t('goToHost', host);
            } catch { return I18N.t('goToSite'); }
        }

        toggleCurrentDomainInBlacklist() {
            let newBlacklist = [...this.blacklist];
            const host = this.currentDomain.toLowerCase();

            if (this.isCurrentDomainBlacklisted()) {
                newBlacklist = newBlacklist.filter(item => {
                    const b = item.toLowerCase().trim();
                    return !(host === b || host.endsWith('.' + b));
                });
                console.log(I18N.t('blacklistRLog', this.currentDomain));
            } else {
                newBlacklist.push(this.currentDomain);
                console.log(I18N.t('blacklistCLog', this.currentDomain));
            }

            GM_setValue('blacklist', newBlacklist);
            location.reload();
        }

        editDomainSelector() {
            const current = this.domainSelectors[this.currentDomain] || '';
            const input = prompt( I18N.t('promptSelector', this.currentDomain), current);
            if (input !== null) {
                if (input.trim()) this.domainSelectors[this.currentDomain] = input.trim();
                else delete this.domainSelectors[this.currentDomain];
                GM_setValue('domainSelectors', this.domainSelectors);
                location.reload();
            }
        }

        editDomainStyle() {
            const current = this.domainStyles[this.currentDomain] || '';
            const input = prompt(I18N.t('promptStyle', this.currentDomain),current);
            if (input !== null) {
                if (input.trim()) this.domainStyles[this.currentDomain] = input.trim();
                else delete this.domainStyles[this.currentDomain];
                GM_setValue('domainStyles', this.domainStyles);
                location.reload();
            }
        }
    }

class I18N {
    static lang = (navigator.language || 'en').toLowerCase().split('-')[0];
    static dict = {
        zh: {
            BlacklistR: domain => `將 ${domain} 從黑名單移除`,
            BlacklistC: domain => `將 ${domain} 加入黑名單`,
            menuEditSelector: "設定此網域掃描範圍",
            menuEditStyle: "設定此網域連結樣式",
            blacklistRLog: domain =>
                `已將 ${domain} 從黑名單移除。\n頁面將重新整理以啟用腳本。`,
            blacklistCLog: domain =>
                `已將 ${domain} 加入黑名單。\n頁面將重新整理，腳本將在此頁面停用。`,
            promptSelector: domain =>
                `目前網域 ${domain} 的掃描選擇器 (例如 .article-content)：`,
            promptStyle: domain =>
                `目前網域 ${domain} 的 CSS：`,
            goTo: name => `前往 ${name}`,
            goToHost: host => `前往 ${host}`,
            goToSite: "前往網站"
        },
        en: {
            BlacklistR: domain => `Remove ${domain} from blacklist`,
            BlacklistC: domain => `Add ${domain} to blacklist`,
            menuEditSelector: "Set domain scan selector",
            menuEditStyle: "Set domain link style",
            blacklistRLog: domain =>
                `${domain} has been removed from blacklist.\nPage will reload to enable the script.`,
            blacklistCLog: domain =>
                `${domain} has been added to blacklist.\nPage will reload and the script will be disabled.`,
            promptSelector: domain =>
                `Scan selector for ${domain} (e.g. .article-content):`,
            promptStyle: domain =>
                `Custom CSS for ${domain}:`,
            goTo: name => `Go to ${name}`,
            goToHost: host => `Go to ${host}`,
            goToSite: "Go to website"
        },
        ja: {
            BlacklistR: domain => `${domain} をブラックリストから削除`,
            BlacklistC: domain => `${domain} をブラックリストに追加`,
            menuEditSelector: "このドメインのスキャン範囲を設定",
            menuEditStyle: "このドメインのリンクスタイルを設定",
            blacklistRLog: domain =>
                `${domain} をブラックリストから削除しました。\nページをリロードしてスクリプトを有効にします。`,
            blacklistCLog: domain =>
                `${domain} をブラックリストに追加しました。\nページをリロードし、このページでスクリプトを無効にします。`,
            promptSelector: domain =>
                `${domain} のスキャンセレクター（例：.article-content）：`,
            promptStyle: domain =>
                `${domain} のカスタムCSS：`,
            goTo: name => `${name} へ移動`,
            goToHost: host => `${host} へ移動`,
            goToSite: "ウェブサイトへ移動"
        },
        es: {
            BlacklistR: domain => `Eliminar ${domain} de la lista negra`,
            BlacklistC: domain => `Añadir ${domain} a la lista negra`,
            menuEditSelector: "Establecer selector de escaneo para este dominio",
            menuEditStyle: "Establecer estilo de enlace para este dominio",
            blacklistRLog: domain =>
                `${domain} ha sido eliminado de la lista negra.\nLa página se recargará para habilitar el script.`,
            blacklistCLog: domain =>
                `${domain} ha sido añadido a la lista negra.\nLa página se recargará y el script se desactivará en esta página.`,
            promptSelector: domain =>
                `Selector de escaneo para ${domain} (ejemplo: .article-content):`,
            promptStyle: domain =>
                `CSS personalizado para ${domain}:`,
            goTo: name => `Ir a ${name}`,
            goToHost: host => `Ir a ${host}`,
            goToSite: "Ir al sitio web"
        },
        de: {
            BlacklistR: domain => `${domain} aus der Blacklist entfernen`,
            BlacklistC: domain => `${domain} zur Blacklist hinzufügen`,
            menuEditSelector: "Scan-Selektor für diese Domain festlegen",
            menuEditStyle: "Link-Stil für diese Domain festlegen",
            blacklistRLog: domain =>
                `${domain} wurde aus der Blacklist entfernt.\nSeite wird neu geladen, um das Skript zu aktivieren.`,
            blacklistCLog: domain =>
                `${domain} wurde zur Blacklist hinzugefügt.\nSeite wird neu geladen und das Skript auf dieser Seite deaktiviert.`,
            promptSelector: domain =>
                `Scan-Selektor für ${domain} (z. B. .article-content):`,
            promptStyle: domain =>
                `Benutzerdefiniertes CSS für ${domain}:`,
            goTo: name => `Zu ${name} gehen`,
            goToHost: host => `Zu ${host} gehen`,
            goToSite: "Zur Website gehen"
        },
        hi: {
            BlacklistR: domain => `${domain} को ब्लैकलिस्ट से हटाएँ`,
            BlacklistC: domain => `${domain} को ब्लैकलिस्ट में जोड़ें`,
            menuEditSelector: "इस डोमेन के लिए स्कैन सेलेक्टर सेट करें",
            menuEditStyle: "इस डोमेन के लिए लिंक स्टाइल सेट करें",
            blacklistRLog: domain =>
                `${domain} को ब्लैकलिस्ट से हटा दिया गया है।\nस्क्रिप्ट को सक्षम करने के लिए पेज रीलोड होगा।`,
            blacklistCLog: domain =>
                `${domain} को ब्लैकलिस्ट में जोड़ दिया गया है।\nपेज रीलोड होगा और इस पेज पर स्क्रिप्ट अक्षम हो जाएगा।`,
            promptSelector: domain =>
                `${domain} के लिए स्कैन सेलेक्टर (उदाहरण: .article-content):`,
            promptStyle: domain =>
                `${domain} के लिए कस्टम CSS:`,
            goTo: name => `${name} पर जाएँ`,
            goToHost: host => `${host} पर जाएँ`,
            goToSite: "वेबसाइट पर जाएँ"
        },
        cs: {
            BlacklistR: domain => `Odebrat ${domain} z blacklistu`,
            BlacklistC: domain => `Přidat ${domain} do blacklistu`,
            menuEditSelector: "Nastavit selektor skenování pro tuto doménu",
            menuEditStyle: "Nastavit styl odkazů pro tuto doménu",
            blacklistRLog: domain =>
                `${domain} byl odebrán z blacklistu.\nStránka se znovu načte, aby se skript povolil.`,
            blacklistCLog: domain =>
                `${domain} byl přidán do blacklistu.\nStránka se znovu načte a skript bude na této stránce deaktivován.`,
            promptSelector: domain =>
                `Selektor skenování pro ${domain} (např. .article-content):`,
            promptStyle: domain =>
                `Vlastní CSS pro ${domain}:`,
            goTo: name => `Přejít na ${name}`,
            goToHost: host => `Přejít na ${host}`,
            goToSite: "Přejít na web"
        },
        lt: {
            BlacklistR: domain => `Pašalinti ${domain} iš juodojo sąrašo`,
            BlacklistC: domain => `Pridėti ${domain} į juodąjį sąrašą`,
            menuEditSelector: "Nustatyti šios domeno nuskaitymo selektorių",
            menuEditStyle: "Nustatyti šios domeno nuorodų stilių",
            blacklistRLog: domain =>
                `${domain} pašalintas iš juodojo sąrašo.\nPuslapis bus iš naujo įkeltas, kad būtų įjungtas scenarijus.`,
            blacklistCLog: domain =>
                `${domain} pridėtas į juodąjį sąrašą.\nPuslapis bus iš naujo įkeltas ir scenarijus bus išjungtas šioje puslapyje.`,
            promptSelector: domain =>
                `Nuskaitymo selektorius domenui ${domain} (pvz., .article-content):`,
            promptStyle: domain =>
                `Pasirinktinis CSS domenui ${domain}:`,
            goTo: name => `Eiti į ${name}`,
            goToHost: host => `Eiti į ${host}`,
            goToSite: "Eiti į svetainę"
        }
    };
    static t(key, ...args) {
        const langPack = this.dict[this.lang] || this.dict.zh;
        const value = langPack[key];

        if (typeof value === 'function') return value(...args);
        return value || key;
    }
}

new TextLinkifier();

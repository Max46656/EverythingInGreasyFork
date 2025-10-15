// ==UserScript==
// @name         Youtube留言區上色
// @name:en      make YT comments background colorful
// @description  將留言區的顯示顏色改為與影片描述相同(旨在改善DeveloperMDCM/Youtube-tools-extension的自定背景功能的暫時解決方案)

// @author       Max
// @namespace    https://github.com/Max46656

// @version      1.0.0
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

class HoverStyleManager {
    #propertiesToCopy = [
        '--yt-saturated-base-background',
        '--yt-saturated-raised-background',
        '--yt-saturated-additive-background',
        '--yt-saturated-text-primary',
        '--yt-saturated-text-secondary',
    ];

    #targetSelectors = [
        'ytd-item-section-renderer[section-identifier="comment-item-section"]'
    ];

    constructor() {
        this.observer = null;
        this.init();
    }

    isMetadataStyleReady(element) {
        const style = getComputedStyle(element);
        return style.getPropertyValue('--yt-saturated-base-background').trim() !== '' &&
               style.getPropertyValue('--yt-saturated-text-primary').trim() !== '';
    }

    createHoverStyles(metadataElement) {
        const style = getComputedStyle(metadataElement);
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        document.head.appendChild(styleSheet);

        let cssRules = '';
        this.#targetSelectors.forEach(selector => {
            cssRules += `${selector}:hover {\n`;
            this.#propertiesToCopy.forEach(prop => {
                const value = style.getPropertyValue(prop);
                if (value && value !== 'initial') {
                    cssRules += `    ${prop}: ${value};\n`;
                }
            });
            const bgColor = style.getPropertyValue('--yt-saturated-raised-background');
            const textColor = style.getPropertyValue('--yt-saturated-text-primary');
            if (bgColor && bgColor !== 'initial') {
                cssRules += `    background-color: ${bgColor};\n`;
            }
            if (textColor && textColor !== 'initial') {
                cssRules += `    color: ${textColor};\n`;
            }
            cssRules += '}\n';
        });

        styleSheet.textContent = cssRules;
    }

    setupObserver() {
        this.observer = new MutationObserver((mutations, obs) => {
            const metadataElement = document.querySelector('ytd-watch-metadata');
            if (metadataElement && this.isMetadataStyleReady(metadataElement)) {
                this.createHoverStyles(metadataElement);
                obs.disconnect();
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    init() {
        const initialCheck = document.querySelector('ytd-watch-metadata');
        if (initialCheck && this.isMetadataStyleReady(initialCheck)) {
            this.createHoverStyles(initialCheck);
        } else {
            this.setupObserver();
        }
    }
}

new HoverStyleManager();

// ==UserScript==
// @name        Pixiv作品自動點選「檢視全部」
// @name:ja     Pixiv作品「すべて見る」を自動クリック
// @name:en     Pixiv Artwork Auto-Click "Show All"
// @description 當Pixiv作品包含多張圖片時，自動展開，漫畫作品不受影響
// @description:en Automatically expands Pixiv artworks with multiple images, leaving manga artworks unaffected
// @description:ja Pixivの複數畫像の作品を自動的に展開し、漫畫作品には影響を與えない

// @match       https://www.pixiv.net/artworks/*
// @match       https://www.pixiv.net/en/artworks/*
// @match       https://www.pixiv.net/users/*
// @match       https://www.pixiv.net/en/artworks/*
// @grant       none
// @version     1.0.4
// @icon        https://www.google.com/s2/favicons?sz=64&domain=pixiv.net

// @author      Max
// @namespace   https://github.com/Max46656
// @license MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/542777/Pixiv%E4%BD%9C%E5%93%81%E8%87%AA%E5%8B%95%E9%BB%9E%E9%81%B8%E3%80%8C%E6%AA%A2%E8%A6%96%E5%85%A8%E9%83%A8%E3%80%8D.user.js
// @updateURL https://update.greasyfork.org/scripts/542777/Pixiv%E4%BD%9C%E5%93%81%E8%87%AA%E5%8B%95%E9%BB%9E%E9%81%B8%E3%80%8C%E6%AA%A2%E8%A6%96%E5%85%A8%E9%83%A8%E3%80%8D.meta.js
// ==/UserScript==

class ReadingStand {
    constructor() {
        this.notMangaTexts = ['查看全部', '檢視全部', 'すべて見る', 'Show all', '모두 보기'];
        this.setupUrlChangeListener();
    }

    expandArtwork() {
        const viewAllButton = Array.from(document.querySelectorAll('button:not(:disabled)'))
            .find(btn =>
                window.getComputedStyle(btn).display !== 'none' &&
                this.notMangaTexts.some(text => btn.textContent.includes(text))
            );
        if (viewAllButton) {
            viewAllButton.click();
        }
    }

    expandGallery() {
        const artistHomePattern = /^https:\/\/www\.pixiv\.net\/(en\/users|users)\/[0-9]*$/;
        const tagHomePattern = /^.*:\/\/www\.pixiv\.net\/(en\/tags|tags)\/.*$/;
        const tagPagePattern = /^.*:\/\/www\.pixiv\.net\/(en\/tags|tags)\/.*\/artworks*/;
        if (artistHomePattern.test(self.location.href) || (!tagPagePattern.test(self.location.href) && tagHomePattern.test(self.location.href))) {
            self.location.href = self.location.href + "/artworks?p=1";
        }
    }

    setupUrlChangeListener() {
        const delay = (n) => new Promise(r => setTimeout(r, n * 1000));

        const oldPushState = history.pushState;
        history.pushState = function pushState() {
            const result = oldPushState.apply(this, arguments);
            window.dispatchEvent(new Event('pushstate'));
            window.dispatchEvent(new Event('locationchange'));
            return result;
        };

        const oldReplaceState = history.replaceState;
        history.replaceState = function replaceState() {
            const result = oldReplaceState.apply(this, arguments);
            window.dispatchEvent(new Event('replacestate'));
            window.dispatchEvent(new Event('locationchange'));
            return result;
        };

        window.addEventListener('popstate', () => {
            window.dispatchEvent(new Event('locationchange'));
        });


        window.addEventListener("load", () => {
            window.dispatchEvent(new Event('locationchange'));
        });

        window.addEventListener('locationchange', () => {
            delay(0.7).then(() => {
                this.expandArtwork();
                this.expandGallery();
            });
        });
    }
}

const readingStand = new ReadingStand();

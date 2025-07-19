// ==UserScript==
// @name        Pixiv自動點選「檢視全部」
// @name:ja     Pixiv「すべて見る」を自動クリック
// @name:en     Pixiv Auto-Click "View All"
// @description 當Pixiv作品或頁面包含多張圖片時，自動展開(漫畫作品不受影響)
// @description:en Automatically expands Pixiv artworks or pages with multiple images (manga artworks are unaffected)
// @description:ja Pixivの作品またはページに複数の画像が含まれる場合、自動的に展開します（漫画作品には影響しません）

// @match       https://www.pixiv.net/artworks/*
// @match       https://www.pixiv.net/en/artworks/*
// @match       https://www.pixiv.net/users/*
// @match       https://www.pixiv.net/en/artworks/*
// @match       https://www.pixiv.net/tags/*
// @match       https://www.pixiv.net/en/tags/*
// @grant       none
// @version     1.0.3
// @icon        https://www.google.com/s2/favicons?sz=64&domain=pixiv.net

// @author      Max
// @namespace   https://github.com/Max46656
// @license MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/542777/Pixiv%E4%BD%9C%E5%93%81%E8%87%AA%E5%8B%95%E9%BB%9E%E9%81%B8%E3%80%8C%E6%AA%A2%E8%A6%96%E5%85%A8%E9%83%A8%E3%80%8D.user.js
// @updateURL https://update.greasyfork.org/scripts/542777/Pixiv%E4%BD%9C%E5%93%81%E8%87%AA%E5%8B%95%E9%BB%9E%E9%81%B8%E3%80%8C%E6%AA%A2%E8%A6%96%E5%85%A8%E9%83%A8%E3%80%8D.meta.js
// ==/UserScript==

class ReadingStand {
    static expandArtwork() {
        const notMangaTexts = ['檢視全部', 'すべて見る', 'Show all', '모두 보기'];

        const viewAllButton = Array.from(document.querySelectorAll('button:not(:disabled)'))
            .find(btn =>
                window.getComputedStyle(btn).display !== 'none' &&
                notMangaTexts.some(text => btn.textContent.includes(text))
                );

        if (viewAllButton) {
            viewAllButton.click();
        }
    }
  static expandGallery() {
        const artistHomePattern = /^https:\/\/www\.pixiv\.net\/(en\/users|users)\/[0-9]*$/;
        const tagHomePattern = /^.*:\/\/www\.pixiv\.net\/(en\/tags|tags)\/.*$/;
        const tagPagePattern = /^.*:\/\/www\.pixiv\.net\/(en\/tags|tags)\/.*\/artworks*/;
        if (artistHomePattern.test(self.location.href) || !tagPagePattern.test(self.location.href) && tagHomePattern.test(self.location.href)) {
            self.location.href = self.location.href + "/artworks?p=1";
        }
    }
}

window.addEventListener("load", () => {
    ReadingStand.expandArtwork();
    ReadingStand.expandGallery();
});

// ==UserScript==
// @name        Pixiv作品自動點選「檢視全部」
// @name:ja     Pixiv作品「すべて見る」を自動クリック
// @name:en     Pixiv Artwork Auto-Click "Show All"
// @description 自動展開Pixiv作品
// @description:en Automatically expand Pixiv artworks
// @description:ja Pixivの作品を自動的に展開

// @match       https://www.pixiv.net/artworks/*
// @match       https://www.pixiv.net/en/artworks/*
// @grant       none
// @version     1.0.0
// @icon        https://www.google.com/s2/favicons?sz=64&domain=pixiv.net

// @author      Max
// @namespace   https://github.com/Max46656
// @license MPL2.0
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
}

window.addEventListener("load", () => {
    ReadingStand.expandArtwork();
});

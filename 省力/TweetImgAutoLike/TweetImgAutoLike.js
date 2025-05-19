// ==UserScript==
// @name         Twitter貼文圖片自動按讚
// @name:en      TweetImgAutoLike
// @description  當點擊貼文圖片時，自動按讚
// @description:en  When clicking on a Tweet's image, automatically like it.

// @namespace    https://github.com/Max46656
// @version      1.0.0
// @author       Max

// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        https://mobile.twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @license MPL2.0
// ==/UserScript==

class TweetLiker {
    constructor() {
        this.observer = null;
    }

    init() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        node.querySelector('div[aria-labelledby="modal-header"] div.r-11yh6sk[style]')) {
                        this.clickLikeButton(node);
                    }
                });
            });
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        console.log('貼文圖片觀察者啟動');
    }

    clickLikeButton(node) {
        const likeButton = node.querySelector('button[data-testid="like"]');
        if (likeButton) {
            likeButton.click();
            console.log('已喜歡貼文圖片');
        } else {
            console.warn('未找到喜歡按鈕');
        }
    }
}


const johnThebardOfLove = new TweetLiker();
johnThebardOfLove.init();

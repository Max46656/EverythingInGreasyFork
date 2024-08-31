// ==UserScript==
// @name        流暢巴哈動畫瘋
// @description 我宣示我同意並滿足分級製度的年齡並已誠實的觀看廣告。
// @namespace    https://github.com/Max46656
// @version     1.0.4
// @author      Max
// @match       https://ani.gamer.com.tw/animeVideo.php*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=gamer.com.tw
// @grant       none
// @license MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/503557/%E6%B5%81%E6%9A%A2%E5%B7%B4%E5%93%88%E5%8B%95%E7%95%AB%E7%98%8B.user.js
// @updateURL https://update.greasyfork.org/scripts/503557/%E6%B5%81%E6%9A%A2%E5%B7%B4%E5%93%88%E5%8B%95%E7%95%AB%E7%98%8B.meta.js
// ==/UserScript==

class AutoClicker {
    constructor() {
        this.Button = {
            agree: ".choose-btn-agree",
            skip: ".vast-skip-button",
            mute: ".vjs-mute-control"
        };
        this.titleObserver = null;
        this.skipObserver = null;
        this.episode = null;
        this.init();
    }

    init() {
        this.observeTitleChanges();
    }

    observeTitleChanges() {
        this.titleObserver = new MutationObserver(() => {
            if(this.episode === document.querySelector('title')){
               return;
            }else{
                this.episode = document.querySelector('title');
            }

            const agreeButtonPromise = this.waitForElement(this.Button.agree);
            const muteButtonPromise = this.waitForElement(this.Button.skip);

            Promise.race([agreeButtonPromise, muteButtonPromise])
                .then(button => {
                    if (button.matches(this.Button.agree)) {
                        console.log("是，我已滿18歲");
                        button.click();
                    } else if (button.matches(this.Button.skip)) {
                        console.log("你又開始下一集？");
                    }
                    this.monitorSkipButton();
                });
        });

        this.titleObserver.observe(document.querySelector('title'), { childList: true });
    }

    waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    clearTimeout(timeoutId);
                    resolve(element);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject("上一集沒有廣告");
            }, timeout);
        });
    }

    monitorSkipButton(skipButton) {
        this.waitForElement(this.Button.skip)
            .then(skipButton => {
                const muteButton = document.querySelector(this.Button.mute);
                if (muteButton && !muteButton.classList.contains("vjs-vol-0")) {
                    console.log("我先倒杯可樂");
                    muteButton.click();
                }

                this.skipObserver = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        if (skipButton.classList.contains('enable')) {
                            console.log("廣告，閱畢");
                            skipButton.click();
                            if (muteButton && muteButton.classList.contains("vjs-vol-0")) {
                                console.log("炸雞拿在手上了");
                                muteButton.click();
                            }
                            this.skipObserver.disconnect();
                        }
                    });
                });

                this.skipObserver.observe(skipButton, { attributes: true, attributeFilter: ['class'] });
            });
    }
}

new AutoClicker();

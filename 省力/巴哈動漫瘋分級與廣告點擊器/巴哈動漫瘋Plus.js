// ==UserScript==
// @name        巴哈動漫瘋Plus
// @namespace
// @match       https://ani.gamer.com.tw/animeVideo.php*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=gamer.com.tw
// @grant       none
// @version     1.0.0
// @author      -
// @description 我宣示我同意並滿足分級製度的年齡並已誠實的觀看廣告。
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
        this.init();
    }

    init() {
        this.observeTitleChanges();
    }

    observeTitleChanges() {
        this.titleObserver = new MutationObserver(() => {
            const agreeButton = document.querySelector(this.Button.agree);
            if (agreeButton) {
                console.log("是，我已滿18歲");
                agreeButton.click();
                this.monitorSkipButton();
            } else {
                this.startAgreeButtonRetry();//同一部動畫中不同集的處理
            }
        });
        this.titleObserver.observe(document.querySelector('title'), { childList: true });
    }

    startAgreeButtonRetry() {
        const agreeInterval = setInterval(() => {
            const agreeButtonRetry = document.querySelector(this.Button.agree);
            if (agreeButtonRetry) {
                console.log("我在這集也滿18歲");
                agreeButtonRetry.click();
                clearInterval(agreeInterval);
                this.monitorSkipButton();
            }
        }, 500);
    }

    monitorSkipButton() {
        const skipInterval = setInterval(() => {
            const skipButton = document.querySelector(this.Button.skip);
            const muteButton = document.querySelector(this.Button.mute);
            if (skipButton) {
                if (muteButton && !muteButton.classList.contains("vjs-vol-0")) {//若非靜音則靜音
                    console.log("我先倒杯可樂");
                    muteButton.click();
                }
                this.skipObserver = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        if (skipButton.classList.contains('enable')) {
                            console.log("廣告，閱畢");
                            skipButton.click();
                            if (muteButton && muteButton.classList.contains("vjs-vol-0")) {//結束靜音
                                console.log("炸雞拿在手上了");
                                muteButton.click();
                            }
                            this.skipObserver.disconnect();
                        }
                    });
                });
                clearInterval(skipInterval);
                this.skipObserver.observe(skipButton, { attributes: true, attributeFilter: ['class'] });
            }
        }, 1000);
    }
}

new AutoClicker();

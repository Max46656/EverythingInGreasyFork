// ==UserScript==
// @name         隱藏youtube片尾畫面
// @name:ja      YouTubeの終了畫面を非表示にする。
// @name:en      Hide end-screens of YouTube.
// @namespace    https://github.com/Max46656
// @version      1.0
// @description  自動隱藏 YouTube 影片結尾
// @description:en Automatically hide end-screens at the end of YouTube videos.
// @description:ja YouTube動畫の最後にある終了畫面を自動的に非表示にします。
// @author       Max
// @license      MIT
// @match        https://www.youtube.com/
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

class youTubeRecommendationHider {
    constructor(recommendedVideosClass,maxRecommend,maxCheckCount,videoSrc = null,recommendedVideosCount=0) {
        this.recommendedVideosClass = recommendedVideosClass;
        this.maxRecommend = maxRecommend;
        this.maxCheckCount = maxCheckCount;
        this.maxCheckCountReseter=maxCheckCount;
        this.videoSrc = videoSrc;
        this.recommendedVideosCount = recommendedVideosCount;
        this.videoPlayer = document.querySelector('video');
    }

    hideRecommendVideos() {
        let allRecommendedViedo = document.querySelectorAll(this.recommendedVideosClass);
        allRecommendedViedo.forEach(element => {
            console.log('刪除' + element.querySelector('a').href);
            element.remove();
            this.recommendedVideosCount++;
            console.log('刪除推薦影片數' + this.recommendedVideosCount);
        });
        if (this.recommendedVideosCount < this.maxRecommend && this.maxCheckCount > 0) {
            this.maxCheckCount--;
            console.log('剩餘檢查次數' + this.maxCheckCount);
            setTimeout(() => this.hideRecommendVideos(), 1000);
        }
    }

    resetVariables() {
        console.log('重置變數');
        this.recommendedVideosCount = 0;
        this.maxCheckCount = this.maxCheckCountReseter;
        this.hideRecommendVideos();
    }

    newTab() {
        if (this.videoSrc == null) {
            console.log('新YouTube分頁');
            this.hideRecommendVideos();
        }
    }

    sameTab() {
        if (this.videoPlayer) {
            this.videoSrc = this.videoPlayer.src;
            console.log('影片偵測<video>' + this.videoSrc);
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === 'src' && this.videoPlayer.src !== this.videoSrc) {
                        console.log('新影片偵測' + this.videoPlayer.src);
                        this.videoSrc = this.videoPlayer.src;
                        this.resetVariables();
                    }
                });
            });
            observer.observe(this.videoPlayer, { attributes: true });
        }
    }
}

const johnTheCleaner=new youTubeRecommendationHider('.ytp-ce-element',4,3);
johnTheCleaner.newTab();
johnTheCleaner.sameTab();
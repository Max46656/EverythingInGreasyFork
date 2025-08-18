// ==UserScript==
// @name         乾淨的YouTube Shorts影片
// @name:en      Clean YouTube Shorts Video
// @name:ja      クリーンなYouTube Shorts動畫
// @name:de      Sauberes YouTube Shorts Video
// @name:uk      Чисте відео YouTube Shorts
// @description  把影片標題、創作者資訊與更多有的沒的改成透明，直到你將滑鼠指向該區域
// @description:en Makes the video title, creator info, and other elements transparent until you hover over the area
// @description:ja 動畫のタイトル、クリエイター情報、その他の要素をマウスをホバーするまで透明にします
// @description:de Macht den Videotitel, die Erstellerinformationen und andere Elemente transparent, bis Sie mit der Maus darüberfahren
// @description:uk Робить заголовок відео, інформацію про автора та інші елементи прозорими, доки ви не наведете на них курсор

// @author       Max
// @namespace    https://github.com/Max46656
// @license      MPL2.0

// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @match        https://www.youtube.com/shorts/*
// @version      1.0.0
// ==/UserScript==

class ShortsOpacityController{
    constructor(){
        this.defaultOpacity = 0;
        this.hoverOpacity = 0.8;
        this.setCSS();
    }

    setCSS(){
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
        ytd-reel-player-overlay-renderer .metadata-container.style-scope {
            opacity: ${this.defaultOpacity} !important;
            transition: opacity 0.3s ease !important;
        }
        ytd-reel-player-overlay-renderer .metadata-container.style-scope:hover {
            opacity: ${this.hoverOpacity} !important;
        }
    `;
        document.head.appendChild(style);
    }
}

new johnTheGlassCleaner = ShortsOpacityController()

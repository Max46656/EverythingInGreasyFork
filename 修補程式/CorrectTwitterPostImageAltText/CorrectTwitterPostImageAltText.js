// ==UserScript==
// @name         正確的Twitter貼文圖片替代文字
// @name:en      Correct Twitter Post Image Alt Text
// @name:ja      正確なTwitter投稿畫像代替テキスト
// @name:es      Texto Alternativo Correcto para Imágenes en Tweets de Twitter
// @name:fr      Texte Alternatif Correct pour les Images des Tweets sur Twitter
// @name:de      Korrekte Alternativtexte für Bilder in Twitter-Beiträgen
// @name:it      Testo Alternativo Corretto per Immagini nei Tweet di Twitter
// @name:ko      Twitter 게시물의 정확한 이미지 대체 텍스트

// @namespace    https://github.com/Max46656
// @version      1.0.1
// @author       Max
// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        https://mobile.twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @license MPL2.0

// @description  將Twitter貼文的圖片替代文字從單純的「圖片」改為帶有使用者名稱、帳號、網域的替代文字，以增加辨識度。
// @description:en  Updates alt text for Twitter images to include username, account, and domain for better recognition.
// @description:ja  Twitterの投稿の畫像のaltテキストを、ユーザー名、アカウント、ドメインを含むように変更し、識別性を向上させます。
// @description:es  Actualiza el texto alternativo de las imágenes de Twitter para incluir nombre de usuario, cuenta y dominio para una mejor identificación.
// @description:fr  Met à jour le texte alternatif des images sur Twitter pour inclure le nom d'utilisateur, le compte et le domaine pour une meilleure reconnaissance.
// @description:de  Aktualisiert den alternativen Text für Twitter-Bilder, um Benutzername, Konto und Domain für eine bessere Erkennung einzuschließen.
// @description:it  Aggiorna il testo alternativo delle immagini su Twitter per includere nome utente, account e dominio per una migliore identificazione.
// @description:ko  Twitter 게시물의 이미지 대체 텍스트를 사용자 이름, 계정 및 도메인을 포함하여 업데이트하여 인식률을 높입니다.
// ==/UserScript==

class AltTextUpdater {
    constructor() {
        this.selectors = {
            tweetWithImg: "article:has(img)",
            photoWithTweet: "div[aria-labelledby='modal-header']",
            textContainer: "div.css-175oi2r.r-1awozwy.r-18u37iz.r-1wbh5a2.r-dnmrzs span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3"
        };

        this.langPatterns = {
            'zh-Hant': { imgAlt: '圖片', connector: '的', domain: '來自推特'},
            'en': { imgAlt: 'Image', connector: '\'s ', domain: ' form Twitter' },
            'ja': { imgAlt: '畫像', connector: 'の', domain: 'Twitterから'},
            'es': { imgAlt: 'Imagen', connector: ' de ', domain: ' de Twitter' },
            'fr': { imgAlt: 'Image', connector: ' de ', domain: ' de Twitter' },
            'de': { imgAlt: 'Bild', connector: ' von ', domain: ' von Twitter' },
            'it': { imgAlt: 'Immagine', connector: ' di ', domain: ' da Twitter' },
            'ko': { imgAlt: '이미지', connector: '의 ', domain: 'Twitter에서' }
        };

        this.checkNowAndUpcomingTweets();
    }

    checkNowAndUpcomingTweets() {
        this.updateTweetsWithImages();
        this.observeSet();
    }

    observeSet() {
        let observer = new MutationObserver(this.handleMutations.bind(this));
        observer.observe(document, { childList: true, subtree: true });
    }

    handleMutations(mutations) {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                this.updateTweetsWithImages();
            }
        });
    }

    updateTweetsWithImages() {
        const tweetImgContainers = document.querySelectorAll(
          `${this.selectors.tweetWithImg}, ${this.selectors.photoWithTweet}`
        );
        tweetsWithImg.forEach((tweet) => {
            this.updateAltText(tweet);
        });
    }

    updateAltText(tweet) {
        const lang = this.detectLanguage();
        const { imgAlt, connector,domain} = this.langPatterns[lang];
        const img = tweet.querySelector(`img[alt="${imgAlt}"]`);
        //console.log(img);

        if (img) {
            const targetSpans = tweet.querySelectorAll(this.selectors.textContainer);
            const spansWithText = Array.from(targetSpans).filter(span => span.textContent);
            const userName = spansWithText[0];
            const account = spansWithText[2];
            img.setAttribute("alt", `${userName.textContent}(${account.textContent})${connector}${imgAlt}${domain}`);
        }
    }
        detectLanguage() {
        const htmlLang = document.documentElement.lang;
        return this.langPatterns[htmlLang] ? htmlLang : 'en';
    }
}
new AltTextUpdater();

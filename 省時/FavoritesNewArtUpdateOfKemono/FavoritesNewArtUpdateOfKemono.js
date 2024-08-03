// ==UserScript==
// @name         最愛「新作品」更新
// @name:ja      お気に入りの「新しいアート」更新
// @name:en      Favorites"NewArt"Update
// @namespace    https://greasyfork.org/zh-TW/users/1021017-max46656
// @version      1.0.1
// @description  為何要一個一個點擊進入追蹤的作者頁面才能看到最新的更新？讓這個腳本為你代勞。支援Kemono/Coomer。
// @description:ja それぞれのフォローアーティストのページに一つずつクリックして最新の更新を見る必要がありますか？このスクリプトに任せてください。Kemono/Coomerに対応しています。
// @description:en Why click into each followed artist's page one by one to see the latest updates? Let this script do it for you. Suppper Kemono/Coomer.
// @author       Max
// @match        *://kemono.su/favorites*
// @match        *://coomer.su/favorites*
// @match        *://*.kemono.su/favorites*
// @match        *://*.coomer.su/favorites*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kemono.su
// @grant        none
// @license MPL2.0
// @downloadURL https://update.greasyfork.org/scripts/501634/%E6%9C%80%E6%84%9B%E3%80%8C%E6%96%B0%E4%BD%9C%E5%93%81%E3%80%8D%E6%9B%B4%E6%96%B0.user.js
// @updateURL https://update.greasyfork.org/scripts/501634/%E6%9C%80%E6%84%9B%E3%80%8C%E6%96%B0%E4%BD%9C%E5%93%81%E3%80%8D%E6%9B%B4%E6%96%B0.meta.js
// ==/UserScript==

class ArtistUpdateCatcher {
    constructor(rateLimit, batchSize,timeRange) {
        this.rateLimit = rateLimit;
        this.batchSize = batchSize;
        this.timeRange = timeRange;
        this.queue = [];
        this.observer = null;
        this.init();
    }

    init() {
        this.loadArtistCards();
        this.setupMutationObserver();
    }

    loadArtistCards() {
        this.artistCards = document.querySelectorAll('a.user-card');
        this.queue = Array.from(this.artistCards);
        if (this.queue.length > 0) {
            this.start();
        }
    }

    setupMutationObserver() {
        const observer = new MutationObserver(() => {
            this.loadArtistCards(); // 每當 DOM 改變時重新載入 artistCards
        });
        observer.observe(document.body, { childList: true, subtree: true });
        this.observer = observer;
    }

    async fetchUpdateArticles(url) {
        const articles = [];
        try {
            const response = await fetch(url);
            if (response.status === 429) {
                await this.delay(2000);
                return this.fetchUpdateArticles(url); // 重新嘗試
            }
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const allArticles = doc.querySelectorAll('article');
            const firstArticleTime = new Date(allArticles[0].querySelector('time').getAttribute('datetime'));

            for (let article of allArticles) {
                const articleTime = new Date(article.querySelector('time').getAttribute('datetime'));
                if (firstArticleTime - articleTime <= this.timeRange) {
                    articles.push(article);
                } else {
                    break; // 超出時間範圍，停止添加
                }
            }
        } catch (error) {
            console.error(`Failed to fetch articles from ${url}:`, error);
        }
        return articles;
    }


    createArtistInfo(iconDiv, nameText, link) {
        const artistInfo = document.createElement('div');
        artistInfo.className = 'artist-info';

        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.className = 'artist-link';
        linkElement.style.display = 'block'; // 確保 a 元素能夠包住內容

        const iconHTML = iconDiv.outerHTML;
        const nameDiv = document.createElement('div');
        nameDiv.className = 'artist-name';
        nameDiv.textContent = nameText;

        linkElement.innerHTML = iconHTML;
        linkElement.appendChild(nameDiv);

        artistInfo.appendChild(linkElement);

        return artistInfo;
    }

    async replaceArtistCard(artistCard, articles) {
        if (articles.length > 0) {
            const iconDiv = artistCard.querySelector('.user-card__icon');
            const nameText = artistCard.querySelector('.user-card__name').textContent;
            const newArtistInfo = this.createArtistInfo(iconDiv, nameText, artistCard.href);

            const container = document.createElement('div');
            container.className = 'artist-update-container';
            container.style.position = 'relative';

            // 以最近的更新為主
            const firstArticle = this.processArticle(articles[0], newArtistInfo);

            if (articles.length > 1) {
                // 創建展開/縮小控製元素作為 footer
                const toggleControl = document.createElement('footer');
                toggleControl.className = 'post-card__footer';
                toggleControl.innerHTML = `<span style="float: right;"><span style="display: inline-block; width: 20px; text-align: center;">▼</span> 展開 ${articles.length - 1} 更新</span>`;
                toggleControl.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    cursor: pointer;
                    z-index: 1;
                `;

                const articlesContainer = document.createElement('div');
                articlesContainer.className = 'articles-container';
                articlesContainer.style.display = 'none'; // 預設隱藏

                // 處理剩餘的更新
                for (let i = 1; i < articles.length; i++) {
                    const processedArticle = this.processArticle(articles[i], newArtistInfo);
                    articlesContainer.appendChild(processedArticle);
                }

                // 添加展開/縮小功能
                toggleControl.addEventListener('click', (e) => {
                    e.preventDefault(); // 防止點擊事件傳播到 <a> 標籤
                    const isExpanded = articlesContainer.style.display !== 'none';
                    articlesContainer.style.display = isExpanded ? 'none' : 'block';
                    toggleControl.innerHTML = isExpanded
                        ? `<span style="float: right;"><span style="display: inline-block; width: 20px; text-align: center;">▼</span> 展開 ${articles.length - 1} 個更新</span>`
                    : `<span style="float: right;"><span style="display: inline-block; width: 20px; text-align: center;">▲</span> 縮小</span>`;
                });

                // 將 toggleControl 添加到第一個更新的 <a> 標籤中
                const firstArticleLink = firstArticle.querySelector('a');
                firstArticleLink.appendChild(toggleControl);

                container.appendChild(firstArticle);
                container.appendChild(articlesContainer);
            } else {
                container.appendChild(firstArticle);
            }

            artistCard.parentNode.replaceChild(container, artistCard);
        }
    }

    processArticle(article, artistInfo) {
        const clonedArticle = article.cloneNode(true);
        const existingFooter = clonedArticle.querySelector('footer');
        if (existingFooter) {
            existingFooter.remove();
        }
        clonedArticle.style.position = 'relative';
        const clonedArtistInfo = artistInfo.cloneNode(true);
        clonedArtistInfo.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 0;
            z-index: 2;
        `;
        clonedArticle.appendChild(clonedArtistInfo);
        return clonedArticle;
    }

    async processQueue() {
        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.batchSize);
            for (let card of batch) {
                const articles = await this.fetchUpdateArticles(card.href);
                try{
                    await this.replaceArtistCard(card, articles);
                    document.title = "[🈱favoritesReading]";
                }catch(e){
                    document.title = "[🈲waitForApi]";
                }
            }
        }
        document.title = "[🈵pageDone!]";
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    start() {
        this.processQueue();
    }
}

new ArtistUpdateCatcher(1000, 4,24*60*60*1000);

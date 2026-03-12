// ==UserScript==
// @name         最愛「新作品」更新
// @name:ja      お気に入りの「新しいアート」更新
// @name:en      Favorites"NewArt"Update
// @description  為何要一個一個點選進入追蹤的作者頁面才能看到最新的更新？讓這個腳本為你代勞。支援Kemono/Coomer。
// @description:ja それぞれのフォローアーティストのページに一つずつクリックして最新の更新を見る必要がありますか？このスクリプトに任せてください。Kemono/Coomerに対応しています。
// @description:en Why click into each followed artist's page one by one to see the latest updates? Let this script do it for you. Suppper Kemono/Coomer.
//
// @author       Max
// @namespace    https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E7%9C%81%E6%99%82/FavoritesNewArtUpdateOfKemono
// @license      MPL2.0
//
// @version      2.0.3
// @match        *://kemono.cr/*
// @match        *://coomer.st/*
// @require      https://update.greasyfork.org/scripts/569411/1772731/SPA%20動態路由監聽器.js#v1.0.3
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kemono.cr
// @downloadURL https://update.greasyfork.org/scripts/501634/%E6%9C%80%E6%84%9B%E3%80%8C%E6%96%B0%E4%BD%9C%E5%93%81%E3%80%8D%E6%9B%B4%E6%96%B0.user.js
// @updateURL https://update.greasyfork.org/scripts/501634/%E6%9C%80%E6%84%9B%E3%80%8C%E6%96%B0%E4%BD%9C%E5%93%81%E3%80%8D%E6%9B%B4%E6%96%B0.meta.js
// ==/UserScript==

class ArtistUpdateCatcher {
    timeRange;
    queue = [];
    observer = null;

    constructor(timeRange) {
        this.timeRange = timeRange;
        this.loadArtistCards();
    }

    loadArtistCards(attempt = 0, maxAttempts = 20) {
        const container = document.querySelector('div.card-list__items');
        if (!container) {
            if (attempt >= maxAttempts) {
                console.warn(`${GM_info.script.name} 等待 container 超過 ${maxAttempts} 次，放棄`);
                return;
            }
            console.debug(`${GM_info.script.name} container 尚未出現，第 ${attempt + 1} 次重試`);
            setTimeout(() => this.loadArtistCards(attempt + 1, maxAttempts), 500);
            return;
        }

        const cards = Array.from(document.querySelectorAll('a.user-card'));
        const validCards = cards.filter(card => card.href && card.href.trim() !== '');

        if (validCards.length === 0) {
            if (attempt >= maxAttempts) {
                console.warn(`${GM_info.script.name} 有效卡片數量一直為 0，已達最大重試次數`);
                return;
            }
            console.debug(`${GM_info.script.name} 找到 ${cards.length} 張卡，但無有效 href，第 ${attempt + 1} 次`);
            setTimeout(() => this.loadArtistCards(attempt + 1, maxAttempts), 1000);
            return;
        }

        console.log(`${GM_info.script.name} 找到 ${validCards.length} 張有效藝術家卡，開始處理`);
        this.artistCards = validCards;
        this.queue = [...validCards];
        this.processQueue();
    }

    async fetchUpdateArticles(url) {
        const articles = [];
        const isKemono = url.includes('kemono');
        let cleanUrl = url.replace(/^.*(?=\/[^\/]+\/user\/[^\/]+)/, "");
        let creatorPostsApi,creatorInfoApi;
        if(isKemono){
            creatorPostsApi ='https://kemono.cr/api/v1' + cleanUrl + '/posts';
            creatorInfoApi = 'https://kemono.cr/api/v1' + cleanUrl + '/profile';
            //console.log(creatorPostsApi)
        }else{
            creatorPostsApi ='https://coomer.st/api/v1' + cleanUrl + '/posts';
            creatorInfoApi = 'https://coomer.st/api/v1' + cleanUrl + '/profile';
        }
        try {
            const postsResponse = await fetch(creatorPostsApi, {
                headers: {
                    'Accept': 'text/css'
                }
            });
            if (!postsResponse.ok) {
                await this.delay(2000);
                return this.fetchUpdateArticles(url);
            }
            const posts = await postsResponse.json();
            //console.log(posts);
            if (posts.length === 0) {
                return articles;
            }

            const firstPostTime = new Date(posts[0].published || posts[0].added).getTime();
            const seventyTwoHoursLater = firstPostTime - this.timeRange;

            const newerPosts = posts.filter(post => {
                const postTime = new Date(post.published || post.added).getTime();
                return postTime >= seventyTwoHoursLater;
            });

            const infoResponse = await fetch(creatorInfoApi, {
                headers: {
                    'Accept': 'text/css'
                }
            });
            const info = await infoResponse.json();
            const userName = info.name;

            for (let post of newerPosts) {
                const articleId = post.id;
                const service = post.service;
                const user = post.user;
                const title = post.title;
                const filePath = post.file ? post.file.path : '';
                const timestamp = post.published || post.added;
                const attachmentsCount = post.attachments ? post.attachments.length : 0;

                const href = `/${service}/user/${user}/post/${articleId}`;
                const imgSrc = `${filePath}`;

                const articleHtml = `
                <article class="post-card post-card--preview" data-id=${articleId} data-service=${service} data-user=${user} style="position: relative; overflow: hidden; border-radius: 2%;font-size: larger;">
                  <a class="fancy-link fancy-link--kemono" href=${href}>
                      <header class="post-card__header">${userName}</header>
                      <div class="post-card__image-container"><img class="post-card__image" src=${imgSrc}></div>
                      <footer class="post-card__footer">
                          <div>
                    <div style="width: clamp(30px, 6%, 30px);display: flex; align-items: center; gap: 10%;">${attachmentsCount}
                                  <svg viewBox="0 0 10 10" style="width: 100%; height: 100%; fill: white;">
                                      <path d="M8,3 C8.55228475,3 9,3.44771525 9,4 L9,9 C9,9.55228475 8.55228475,10 8,10 L3,10
                                          C2.44771525,10 2,9.55228475 2,9 L6,9 C7.1045695,9 8,8.1045695 8,7 L8,3 Z M1,1 L6,1
                                          C6.55228475,1 7,1.44771525 7,2 L7,7 C7,7.55228475 6,8 6,8 L1,8 C0.44771525,8
                                          0,7.55228475 0,7 L0,2 C0,1.44771525 0.44771525,1 1,1 Z" transform="">
                                      </path>
                                  </svg>
                              </div>
                              <div>
                                  <div>${title}</div>
                              </div>
                          </div>
                      </footer>
                  </a>
                  <time class="timestamp" datetime=${timestamp}></time>
              </article>`;
                const parser = new DOMParser();
                const doc = parser.parseFromString(articleHtml, 'text/html');
                const articleElement = doc.body.firstChild;
                articles.push(articleElement);
            }
        } catch (error) {
            //console.error(`獲取字作品 ${url} 失敗:`, error);
        }
        return articles;
    }


    async replaceArtistCard(artistCard, articles) {
        const parentElement = document.querySelector('div.card-list__items');
        if(!parentElement.contains(artistCard)){
            return;
        }
        const userId = artistCard.getAttribute("data-id");
        const service = artistCard.getAttribute("data-service");
        const userName = artistCard.querySelector(".user-card__name").textContent.trim();
        const userIcon = artistCard.querySelector(".fancy-image__image").src;
        const userHref = `/${service}/user/${userId}`;

        parentElement.removeChild(artistCard);

        for (const article of articles) {
            const userProfile = document.createElement("a");
            userProfile.setAttribute("data-id",userId);
            userProfile.setAttribute("data-service",service);
            userProfile.setAttribute("href",userHref);
            userProfile.style = `
              position: absolute;
              top: 8%;
              left: 1%;
              z-index: 10;
              display: inline-flex;
              align-items: center;
              background: rgba(0, 0, 0, 0.01);
              border-radius: 5%;
              text-decoration: none;
              width: 15%;
              height:min-content`;

            userProfile.innerHTML=`
                    <div>
                        <span class="fancy-image">
                            <picture class="fancy-image__picture">
                                <img class="fancy-image__image" src=${userIcon} loading="lazy" style="width: 100%; border-radius: 50%;">
                            </picture>
                        </span>
                    </div>`;
            article.prepend(userProfile);
            parentElement.prepend(article);
        }
    }

    sortArticlesByDatetime() {
        const articles = Array.from(document.querySelectorAll('article'));
        articles.sort((a, b) => {
            const timeA = a.querySelector('time') ? a.querySelector('time').getAttribute('datetime') : '';
            const timeB = b.querySelector('time') ? b.querySelector('time').getAttribute('datetime') : '';

            return new Date(timeB) - new Date(timeA);
        });
        //console.log(articles);
        const container = articles[0].parentElement;
        articles.forEach(article => {
            container.appendChild(article);
        });
    }

    async processQueue(){
        while (this.queue.length > 0) {
            const card = this.queue.shift();
            try {
                if (!card.href) {
                    throw new Error("Card href 為null");
                }

                const articles = await this.fetchUpdateArticles(card.href);
                await this.replaceArtistCard(card, articles);
                document.title = "[🈱favoritesReading]";
            } catch (e){
                console.error(`${card}錯誤：`, e);
                document.title = "[🈲waitForApi]";
                if (card) this.queue.push(card);
                await this.delay(1000);
            }
        }
        this.sortArticlesByDatetime();
        document.title = "[🈵pageDone!]";
    }



    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

class PageIndicatorObserver {
    selector;
    checkInterval;
    pageIndicator = null;
    retryInterval = null;
    observer = null;

    constructor(selector, checkInterval = 1000) {
        this.selector = selector;
        this.checkInterval = checkInterval;
        this.init();
    }

    init() {
        this.retryInterval = setInterval(() => {
            this.pageIndicator = document.querySelector(this.selector);
            if (this.pageIndicator) {
                clearInterval(this.retryInterval);
                this.setupObserver();
            } else {
                console.log(`${this.selector} 頁數顯示器未獲取`);
            }
        }, this.checkInterval);
    }

    setupObserver() {
        if (!this.pageIndicator)
            return;

        console.log("pageIndicator:", this.pageIndicator);

        this.observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                //console.log("翻頁偵測:，");
                this.stop();
                window.location.reload();
            });
        });

        const observerOptions = {
            subtree: true,
            characterData: true,
        };

        this.observer.observe(this.pageIndicator, observerOptions);
    }

    stop() {
        if (this.retryInterval) {
            clearInterval(this.retryInterval);
            this.retryInterval = null;
        }
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        //console.log("停止觀察");
    }
}

let johnTheLibrarian;
let johnThePageTurner;

const routeHandler = new window.DynamicRouteHandler({
    matchPatterns: [/.*\/favorites\/artists/],
    debug: true,
    onEnter: () => {
        console.log("進入 favorites");
        johnTheLibrarian = new ArtistUpdateCatcher(1000, 4,24*60*60*1000);
        johnThePageTurner = new PageIndicatorObserver("#paginator-top", 500);
    },
    onLeave: () => {
        console.info("離開 favorites → 清理");
        johnThePageTurner.stop();
        johnThePageTurner = null;
        johnTheLibrarian = null;
    }
});

routeHandler.start();

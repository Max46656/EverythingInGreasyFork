// ==UserScript==
// @name kemono 閱覽壓縮檔內容
// @name:en Kemono View ZIP Contents
// @name:ja Kemono 圧縮ファイル內容閱覧
// @name:de Kemono ZIP-Inhalte anzeigen
// @name:cs Kemono prohlížení obsahu archivu
// @name:lt Kemono peržiūrėti suspaustų failų turinį
// @description 將壓縮檔中的圖片解壓縮至貼文中以提供直接檢視而無需下載
// @description:en Extract and display images from ZIP files directly in the post without needing to download
// @description:ja 圧縮ファイル內の畫像を投稿內に解凍して表示し、ダウンロードせずに直接閱覧可能にします
// @description:de Bilder aus ZIP-Dateien direkt im Beitrag entpacken und anzeigen, ohne dass ein Download erforderlich ist
// @description:cs Rozbalit obrázky ze ZIP souborů přímo do příspěvku pro okamžité zobrazení bez nutnosti stahování
// @description:lt Išarchyvuoti paveikslėlius iš ZIP failų tiesiai į įrašą, kad būtų galima peržiūrėti be atsisiuntimo
//
// @author Max
// @namespace https://github.com/Max46656
// @supportURL https://github.com/Max46656/EverythingInGreasyFork/issues
// @license MPL2.0
//
// @version 1.5.0
// @match https://kemono.cr/*/user/*/post/*
// @require https://unpkg.com/@zip.js/zip.js@2.7.53/dist/zip-full.min.js
// @grant GM_xmlhttpRequest
// @connect self
// @icon https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://kemono.cr&size=64
// ==/UserScript==

/**
 * ZIP 圖片解壓縮器
 * 負責處理 Kemono 網站上的 ZIP，將圖片解壓並顯示在頁面上
 */
class ZipImageExtractor {
  /**
   * 建立解壓縮器實例
   */
  constructor() {
    this.CONFIG = {
      LOG_PREFIX: '[Kemono Zip Viewer]',
      IMAGE_EXT: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.jfif'],
      VIDEO_EXT: ['.mp4', '.webm','.avi', '.mkv', '.mov', '.ogv'],
      AUDIO_EXT: ['.mp3', '.ogg', '.wav', '.flac', '.m4a','.aac'],
      POLLING_INTERVAL: 500,
      MAX_ATTEMPTS: 50
    };
    this.i18n = new I18n();
    this.processedElements = new WeakSet();
    this.attempts = 0;
    this.intervalId = null;
    this.toggleState = true;
  }

  /**
   * 初始化腳本
   */
  init() {
    console.log(`${this.CONFIG.LOG_PREFIX} 啟動中...`);
    this.startPolling();
  }

  /**
   * 取得 zip 函式庫
   * @returns {Object|null} zip 函式庫實例
   */
  get zipLib() {
    return (typeof zip !== 'undefined') ? zip : (window.zip || self.zip);
  }

  /**
   * 開始輪詢檢查頁面元素
   */
  startPolling() {
    this.intervalId = setInterval(() => {
      this.attempts++;
      const lib = this.zipLib;
      if (lib) this.scan();
      if (this.attempts >= this.CONFIG.MAX_ATTEMPTS) {
        clearInterval(this.intervalId);
        console.log(`${this.CONFIG.LOG_PREFIX} 搜尋結束`);
      }
    }, this.CONFIG.POLLING_INTERVAL);
  }

  /**
   * 掃描頁面上的壓縮檔連結
   */
  scan() {
    try {
      const links = document.querySelectorAll('li.post__attachment a:first-of-type');
      links.forEach(link => {
        const href = link.href.toLowerCase();
        if ((href.endsWith('.zip') || href.endsWith('.7z')) && !this.processedElements.has(link)) {
          this.createDownloadButton(link);
        }
      });
    } catch (err) {
      console.error(`${this.CONFIG.LOG_PREFIX} 搜尋錯誤:`, err);
    }
  }

  /**
   * 建立讀取圖片按鈕
   * @param {HTMLElement} link - 壓縮檔連結元素
   */
  createDownloadButton(link) {
    if (this.processedElements.has(link)) return;
    this.processedElements.add(link);
    const btn = document.createElement('button');
    btn.innerText = this.i18n.t('read_media');
    btn.id = "ZipRender";
    const btnStyle = {
      padding: "5px 10px",
      backgroundColor: "#282a2e",
      color: "#e8a17d",
      border: "2px solid #3b3e44CC",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      marginLeft: "10px",
      transition: "opacity 0.2s"
    };
    Object.assign(btn.style, btnStyle);
    btn.onmouseover = () => btn.style.opacity = "0.8";
    btn.onmouseout = () => btn.style.opacity = "1";
    btn.onclick = (e) => {
      e.preventDefault();
      const confirmText = this.i18n.t('confirm_retry');
      if (btn.dataset.processed === 'true') {
        if (btn.innerText !== confirmText) {
          this.updateBtnState(btn, 'confirm', confirmText);
          return;
        }
        delete btn.dataset.processed;
      }
      let url = link.href;
      this.downloadArchive(url, link, btn);
    };
    link.parentNode.insertBefore(btn, link.nextSibling);
  }

  /**
   * 下載並處理壓縮檔
   * @param {string} url - 壓縮檔 URL
   * @param {HTMLElement} anchor - 原連結元素
   * @param {HTMLElement} btn - 按鈕元素
   */
  async downloadArchive(url, anchor, btn) {
    const lib = this.zipLib;
    const container = document.querySelector('.post__files');
    if (!lib || !container) return;
    const cache = {
      buffer: null,
      password: null,
      processed: false
    };
    try {
      this.updateBtnState(btn, 'loading', `🈧 ${this.i18n.t('downloading')}...0%`);
      const response = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url,
          responseType: 'arraybuffer',
          onprogress: e => {
            if (e.lengthComputable) {
              const percent = Math.round(e.loaded / e.total * 100);
              this.toggleState = !this.toggleState;
              const icon = this.toggleState ? '🈧' : '🈱';
              btn.innerText = `${icon} ${this.i18n.t('downloading')}...${percent}%`;
              this.updateBtnState(btn, 'loading', btn.innerText);
            }
          },
          onload: res => {
            if (res.status === 200) {
              resolve(res.response);
            } else {
              reject(new Error(`下載失敗，狀態碼：${res.status}`));
            }
          },
          onerror: reject
        });
      });
      cache.buffer = response;
      this.updateBtnState(btn, 'loading', `🈵 ${this.i18n.t('parsing')}...`);
      await this.unzipArchive(cache, btn, container, url);
      btn.dataset.processed = 'true';
      cache.processed = true;
    } catch (err) {
      console.error(`${this.CONFIG.LOG_PREFIX} 處理失敗:`, err);
      this.updateBtnState(btn, 'error', `🉈 ${this.i18n.t('failed')}`);
    }
  }

  /**
   * 解壓壓縮檔
   * @param {Object} cache - 快取資料
   * @param {HTMLElement} btn - 按鈕元素
   * @param {HTMLElement} container - 容器元素
   * @param {string} url - 原始 URL
   */
async unzipArchive(cache, btn, container, url) {
    const lib = this.zipLib;
    const reader = new lib.ZipReader(
      new lib.Uint8ArrayReader(new Uint8Array(cache.buffer))
    );
    try {
      const entries = await reader.getEntries();
      const images = entries.filter(entry =>
        !entry.directory && this.CONFIG.IMAGE_EXT.some(ext => entry.filename.toLowerCase().endsWith(ext))
      );
      const videos = entries.filter(entry =>
        !entry.directory && this.CONFIG.VIDEO_EXT.some(ext => entry.filename.toLowerCase().endsWith(ext))
      );
      const audios = entries.filter(entry =>
        !entry.directory && this.CONFIG.AUDIO_EXT.some(ext => entry.filename.toLowerCase().endsWith(ext))
      );
      const totalMedia = images.length + videos.length + audios.length;
      if (totalMedia === 0) {
        this.updateBtnState(btn, 'done', `🈳 ${this.i18n.t('no_media')}`);
        return;
      }
      const isEncrypted = [...images, ...videos, ...audios].some(e => e.encrypted);
      if (isEncrypted && !cache.password) {
        this.updateBtnState(btn, 'waiting', this.i18n.t('password_required'));
        this.createPasswordInput(btn, (pwd) => {
          cache.password = pwd;
          this.unzipArchive(cache, btn, container, url);
        });
        return;
      }
      let current = 0;
      const options = isEncrypted ? { password: cache.password } : undefined;
      for (const entry of images) {
        current++;
        btn.innerText = `🉃 ${this.i18n.t('unzipping')} ${current}/${totalMedia}`;
        this.updateBtnState(btn, 'loading', btn.innerText);
        const blob = await entry.getData(new lib.BlobWriter(), options);
        this.renderImage(blob, entry.filename, container);
      }
      for (const entry of videos) {
        current++;
        btn.innerText = `🉃 ${this.i18n.t('unzipping')} ${current}/${totalMedia}`;
        this.updateBtnState(btn, 'loading', btn.innerText);
        const blob = await entry.getData(new lib.BlobWriter(), options);
        this.renderVideo(blob, entry.filename, container);
      }
      for (const entry of audios) {
        current++;
        btn.innerText = `🉃 ${this.i18n.t('unzipping')} ${current}/${totalMedia}`;
        this.updateBtnState(btn, 'loading', btn.innerText);
        const blob = await entry.getData(new lib.BlobWriter(), options);
        this.renderAudio(blob, entry.filename, container);
      }
      this.updateBtnState(btn, 'done', `🉇 ${this.i18n.t('done')} (${totalMedia})`);
    } catch (err) {
      if (err.message?.includes('password') || err.message?.includes('decrypt')) {
        this.updateBtnState(btn, 'error', `🉈 ${this.i18n.t('wrong_password')}`);
        cache.password = null;
        this.createPasswordInput(btn, (pwd) => {
          cache.password = pwd;
          this.unzipArchive(cache, btn, container, url);
        });
      } else {
        console.error(`${this.CONFIG.LOG_PREFIX} 解壓錯誤:`, err);
        this.updateBtnState(btn, 'error', `🉈 ${this.i18n.t('failed')}`);
      }
    } finally {
      await reader.close();
      this.sortMediaByTitle();
    }
  }

  /**
   * 建立密碼輸入框
   * @param {HTMLElement} btn - 按鈕元素
   * @param {Function} callback - 密碼回調函式
   */
  createPasswordInput(btn, callback) {
    if (btn.nextSibling?.classList?.contains('zip-password-input')) return;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'zip-password-input';
    input.placeholder = this.i18n.t('enter_password');
    Object.assign(input.style, {
      marginLeft: '8px',
      padding: '4px 8px',
      background: '#1e1f22',
      color: '#fff',
      border: '1px solid #666',
      borderRadius: '4px',
      width: '160px',
      fontSize: '14px'
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim()) {
        callback(input.value.trim());
        input.remove();
      }
    });
    btn.after(input);
    input.focus();
  }

  /**
   * 渲染圖片
   * @param {Blob} blob - 圖片 Blob
   * @param {string} filename - 檔案名稱
   * @param {HTMLElement} container - 容器元素
   */
  renderImage(blob, filename, container) {
    const imageUrl = URL.createObjectURL(blob);
    const div = document.createElement('div');
    div.className = "post__thumbnail";
    const img = document.createElement('img');
    img.src = imageUrl;
    img.title = filename;
    img.style.maxWidth = "100%";
    img.style.display = "block";
    img.onload = () => URL.revokeObjectURL(imageUrl);
    div.appendChild(img);
    container.appendChild(div);
  }

  /**
   * 渲染影片
   * @param {Blob} blob - Blob 物件
   * @param {string} filename - 檔案名稱
   * @param {HTMLElement} container - 容器元素
   */
  renderVideo(blob, filename, container) {
    const url = URL.createObjectURL(blob);
    const div = document.createElement('div');
    div.className = "post__thumbnail";
    const video = document.createElement('video');
    video.src = url;
    video.title = filename;
    video.controls = true;
    video.style.maxWidth = "100%";
    video.style.display = "block";
    video.onload = () => URL.revokeObjectURL(url);
    div.appendChild(video);
    container.appendChild(div);
  }

  /**
   * 渲染聲音
   * @param {Blob} blob - Blob 物件
   * @param {string} filename - 檔案名稱
   * @param {HTMLElement} container - 容器元素
   */
  renderAudio(blob, filename, container) {
    const url = URL.createObjectURL(blob);
    const div = document.createElement('div');
    div.className = "post__thumbnail";
    const audio = document.createElement('audio');
    audio.src = url;
    audio.title = filename;
    audio.controls = true;
    audio.style.width = "100%";
    audio.style.display = "block";
    audio.onload = () => URL.revokeObjectURL(url);
    div.appendChild(audio);
    container.appendChild(div);
  }

/**
 * 根據 blob: 元素的 title 屬性（通常為檔名）對 .post__files 內的媒體元素進行排序
 * 支援正確的數字排序
 * 使用 fragment 重新插入（效能較好，且不會閃動）
 * @param {string} [order='asc'] - 'asc'（升序）或 'desc'（降序）
 */
sortMediaByTitle(order = 'asc') {
  const container = document.querySelector('.post__files');
  if (!container) {
    console.warn(`${this.CONFIG.LOG_PREFIX} 找不到 .post__files 容器`);
    return;
  }

  const mediaElements = Array.from(
    container.querySelectorAll('div.post__thumbnail')
  );

  if (mediaElements.length <= 1) {
    return;
  }

  const naturalCompare = (a, b) => {
    const strA = (a.querySelector('[src^="blob:"]')?.title || '').trim().toLowerCase();
    const strB = (b.querySelector('[src^="blob:"]')?.title || '').trim().toLowerCase();

    if (strA === strB) return 0;

    // "img10a.jpg" → ["img", 10, "a", ".", "jpg"]
    const chunkify = str => {
      return str.match(/(\d+|\D+)/g) || [];
    };

    const chunksA = chunkify(strA);
    const chunksB = chunkify(strB);

    const len = Math.min(chunksA.length, chunksB.length);

    for (let i = 0; i < len; i++) {
      const chunkA = chunksA[i];
      const chunkB = chunksB[i];

      if (!isNaN(chunkA) && !isNaN(chunkB)) {
        const numA = Number(chunkA);
        const numB = Number(chunkB);
        if (numA !== numB) {
          return numA - numB;
        }
        continue;
      }

      const cmp = chunkA.localeCompare(chunkB);
      if (cmp !== 0) {
        return cmp;
      }
    }

    return chunksA.length - chunksB.length;
  };

  mediaElements.sort((a, b) => {
    const diff = naturalCompare(a, b);
    return order === 'desc' ? -diff : diff;
  });

  const fragment = document.createDocumentFragment();
  mediaElements.forEach(el => fragment.appendChild(el));
  container.innerHTML = '';
  container.appendChild(fragment);

  console.log(
    `${this.CONFIG.LOG_PREFIX} 已根據檔名進行自然排序 (${order})，共 ${mediaElements.length} 個媒體`
  );
}

  /**
   * 更新按鈕狀態
   * @param {HTMLElement} btn - 按鈕元素
   * @param {string} state - 狀態 (loading|done|error|confirm|waiting)
   * @param {string} text - 按鈕文字
   */
  updateBtnState(btn, state, text) {
    btn.innerText = text;
    btn.disabled = (state === 'loading');
    if (state === 'error') {
      btn.style.borderColor = "#ff4444";
    } else if (state === 'done') {
      btn.style.borderColor = "#44ff44";
    } else if (state === 'confirm') {
      btn.style.borderColor = "#ffaa00";
      btn.style.backgroundColor = "#3a2a00";
    } else {
      btn.style.borderColor = "#3b3e44CC";
      btn.style.backgroundColor = "#282a2e";
    }
  }
}

/**
 * 多語言管理器
 */
class I18n {
  /**
   * 建立多語言管理器實例
   */
  constructor() {
    let navLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    navLang = navLang.toLowerCase();
    if (navLang.startsWith('zh') || navLang === 'cmn') {
      this.currentLang = 'zh';
    } else {
      this.currentLang = navLang.split('-')[0];
    }
    this.data = {
zh: {
        read_media: '讀取媒體',
        confirm_retry: '[是否確定再次執行?]',
        downloading: '下載中',
        parsing: '解析中',
        no_media: '無媒體',
        unzipping: '解壓',
        enter_password: '輸入密碼',
        done: '完成',
        failed: '失敗',
        password_required: '需要密碼',
        wrong_password: '密碼錯誤'
      },
      en: {
        read_media: 'Read Media',
        confirm_retry: '[Confirm to run again?]',
        downloading: 'Downloading',
        parsing: 'Parsing',
        no_media: 'No Media',
        unzipping: 'Extracting',
        enter_password: 'Enter Password',
        done: 'Done',
        failed: 'Failed',
        password_required: 'Password Required',
        wrong_password: 'Wrong Password'
      },
      ja: {
        read_media: 'メディアを読み込む',
        confirm_retry: '[もう一度実行しますか？]',
        downloading: 'ダウンロード中',
        parsing: '解析中',
        no_media: 'メディアなし',
        unzipping: '解凍中',
        enter_password: 'パスワードを入力',
        done: '完了',
        failed: '失敗',
        password_required: 'パスワードが必要',
        wrong_password: 'パスワードが間違っています'
      },
      de: {
        read_media: 'Medien laden',
        confirm_retry: '[Erneut ausführen?]',
        downloading: 'Herunterladen',
        parsing: 'Analysieren',
        no_media: 'Keine Medien',
        unzipping: 'Entpacken',
        enter_password: 'Passwort eingeben',
        done: 'Fertig',
        failed: 'Fehlgeschlagen',
        password_required: 'Passwort erforderlich',
        wrong_password: 'Falsches Passwort'
      },
      cs: {
        read_media: 'Načíst média',
        confirm_retry: '[Opravdu spustit znovu?]',
        downloading: 'Stahování',
        parsing: 'Analýza',
        no_media: 'Žádná média',
        unzipping: 'Rozbalování',
        enter_password: 'Zadat heslo',
        done: 'Hotovo',
        failed: 'Selhalo',
        password_required: 'Vyžadováno heslo',
        wrong_password: 'Špatné heslo'
      },
      lt: {
        read_media: 'Skaityti mediją',
        confirm_retry: '[Ar tikrai paleisti dar kartą?]',
        downloading: 'Atsisiunčiama',
        parsing: 'Analizuojama',
        no_media: 'Nėra medijos',
        unzipping: 'Išarchyvuojama',
        enter_password: 'Įvesti slaptažodį',
        done: 'Atlikta',
        failed: 'Nepavyko',
        password_required: 'Reikalingas slaptažodis',
        wrong_password: 'Neteisingas slaptažodis'
      }
    };
  }

  /**
   * 取得翻譯文字
   * @param {string} key - 翻譯鍵值
   * @returns {string} 翻譯文字
   */
  t(key) {
    let langData = this.data[this.currentLang];
    if (!langData) {
      langData = this.data['zh'];
    }
    return langData[key] || this.data['en'][key] || key;
  }
}

const JonnTheImgRestocker = new ZipImageExtractor();
JonnTheImgRestocker.init();

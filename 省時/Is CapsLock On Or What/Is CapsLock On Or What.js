// ==UserScript==
// @name             現在是大寫嗎
// @name:en          Is CapsLock On Or What
// @name:ja          CapsLockの狀態は？
// @name:lt          Ar CapsLock įjungtas
// @name:cs          Je CapsLock zapnutý?
// @name:hi          क्या CapsLock ऑन है
// @description      按下 Caps Lock 時根據開/關狀態發出不同提示音，並以浮動的符號表示目前狀態
// @description:en   Plays different alert tones based on the Caps Lock state and displays a floating symbol to indicate the current status.
// @description:ja   Caps Lockを押すとオン/オフの狀態に応じて異なる通知音が鳴り、浮動シンボルで現在の狀態を表示します。
// @description:lt   Paspaudus „Caps Lock「, pasigirsta skirtingi garsiniai signalai priklausomai nuo būsenos, o slankiojantis simbolis rodo dabartinę padėtį.
// @description:cs   Při stisknutí klávesy Caps Lock přehraje různé tóny podle stavu zapnutí/vypnutí a zobrazí plovoucí symbol aktuálního stavu.
// @description:hi   Caps Lock दबाने पर ऑन/ऑफ स्थिति के आधार पर अलग-अलग अलर्ट टोन बजाता है और वर्तमान स्थिति को फ्लोटिंग सिंबल के साथ दिखाता है।
//
// @namespace    https://github.com/Max46656
// @supportURL   https://github.com/Max46656/EverythingInGreasyFork/issues/new?template=bug_report.yml&labels=bug,userscript&title=[現在是大寫嗎]Bug回報
// @author       Max
// @license      MPL2.0

// @version      1.4.1
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_info
// @icon         https://cdn-icons-png.flaticon.com/512/9096/9096962.png
// ==/UserScript==
//icon made by www.flaticon.com

class CapsLockIndicator {
    lastCapsState = null;
    ringBuzzer = GM_getValue('ringBuzzer', true);
    audioContext = null;
    volume = GM_getValue('volume', 0.6);
    duration = GM_getValue('duration', 120);

    showIndicator = GM_getValue('showIndicator', true);
    indicator = null;
    position = GM_getValue('position', { x: 20, y: 20 });
    isDragging = false;
    dragOffset = { x: 0, y: 0 };

    constructor() {
        this.i18n = new I18n();
        this.initializeCapsLockState();
        this.createAudioContext();
        this.createIndicator();
        this.registerMenuCommands();
        this.bindKeyboardEvents();

        console.info(`${GM_info.script.name} (${this.i18n.detectLanguage()}) 已初始化 | 音量:${this.volume} | 顯示圖示:${this.showIndicator}`);
    }

    initializeCapsLockState() {
        const detectState = (e) => {
          const state = e.getModifierState?.('CapsLock');
          if (typeof state === 'boolean' && state !== this.lastCapsState) {
            this.lastCapsState = state;
            this.updateIndicator(state);
            console.log(`${GM_info.script.name} 透過互動事件取得初始 Caps Lock 狀態: ${state}`);
          }
        };

        const events = ['mousemove', 'wheel', 'keydown'];
        events.forEach(eventType => {
          document.addEventListener(eventType, detectState, { once: true });
        });
    }

    createAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSound(isOn) {
        if (!this.ringBuzzer || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(isOn ? 880 : 440, this.audioContext.currentTime);
            gain.gain.value = this.volume;
            filter.type = 'lowpass';
            filter.frequency.value = isOn ? 1200 : 800;

            oscillator.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);

            oscillator.start();
            setTimeout(() => {
                gain.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
                setTimeout(() => oscillator.stop(), 100);
            }, this.duration);
        } catch (e) {
            console.error(`${GM_info.script.name} 播放音效失敗:`, e);
        }
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'CapsLock') {
                setTimeout(() => {
                    const currentState = e.getModifierState('CapsLock');
                    if (currentState !== this.lastCapsState) {
                        this.playSound(currentState);
                        this.updateIndicator(currentState);
                        this.lastCapsState = currentState;
                    }
                }, 10);
            }
        });
    }

    createIndicator() {
        if (this.indicator) this.indicator.remove();

        this.indicator = document.createElement('div');
        Object.assign(this.indicator.style, {
            position: 'fixed',
            display: this.showIndicator ? 'block' : 'none',
            fontSize: '20px',
            lineHeight: '1',
            opacity: 0.7,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            color: '#ffffff',
            zIndex: '2147483647',
            cursor: 'move',
            userSelect: 'none',
            left: `${this.position.x}px`,
            top: `${this.position.y}px`,
            transition: 'background-color 0.2s, opacity 0.2s',
            pointerEvents: 'auto'
        });

        this.indicator.title = this.i18n.t('titleIndicator');
        document.body.appendChild(this.indicator);

        this.makeDraggable();
        this.updateIndicator(this.lastCapsState);
    }

    updateIndicator(isOn) {
        if (!this.indicator) return;
        this.indicator.textContent = isOn ? '🔠' : '🔡';
    }

    makeDraggable() {
        this.indicator.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            this.isDragging = true;
            this.dragOffset.x = e.clientX - this.indicator.offsetLeft;
            this.dragOffset.y = e.clientY - this.indicator.offsetTop;
            this.indicator.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            let x = Math.max(0, Math.min(e.clientX - this.dragOffset.x, window.innerWidth - 60));
            let y = Math.max(0, Math.min(e.clientY - this.dragOffset.y, window.innerHeight - 50));

            this.indicator.style.left = `${x}px`;
            this.indicator.style.top = `${y}px`;
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.indicator.style.transition = 'background-color 0.2s, opacity 0.2s';
                this.position = {
                    x: parseInt(this.indicator.style.left) || 20,
                    y: parseInt(this.indicator.style.top) || 20
                };
                GM_setValue('position', this.position);
            }
        });

        this.indicator.addEventListener('dblclick', () => {
            this.showIndicator = !this.showIndicator;
            GM_setValue('showIndicator', this.showIndicator);
            this.indicator.style.display = this.showIndicator ? 'block' : 'none';
        });
    }

    setPosition(x, y) {
        this.position = {
            x: Math.max(0, Math.min(x, window.innerWidth - 60)),
            y: Math.max(0, Math.min(y, window.innerHeight - 50))
        };
        GM_setValue('position', this.position);
        if (this.indicator) {
            this.indicator.style.left = `${this.position.x}px`;
            this.indicator.style.top = `${this.position.y}px`;
        }
    }

    showPositionSelector() {
        const currentX = this.position.x;
        const currentY = this.position.y;

        const presets = [
            { name: '左上角', x: 20, y: 20 },
            { name: '右上角', x: window.innerWidth - 70, y: 20 },
            { name: '左下角', x: 20, y: window.innerHeight - 60 },
            { name: '右下角', x: window.innerWidth - 70, y: window.innerHeight - 60 },
            { name: '畫面中央', x: Math.floor(window.innerWidth / 2 - 30), y: Math.floor(window.innerHeight / 2 - 25) }
        ];

        let message = `${this.i18n.t('promptCurrentPos')}: (${currentX}, ${currentY})\n\n`;
        message += this.i18n.t('promptChoosePreset') + '\n';
        message += this.i18n.t('promptPreset1') + '\n';
        message += this.i18n.t('promptPreset2') + '\n';
        message += this.i18n.t('promptPreset3') + '\n';
        message += this.i18n.t('promptPreset4') + '\n';
        message += this.i18n.t('promptPreset5') + '\n\n';
        message += this.i18n.t('promptCustom');

        const input = prompt(message, `${currentX},${currentY}`);
        if (input === null) return;

        const num = parseInt(input);
        if (num >= 1 && num <= presets.length) {
            const preset = presets[num - 1];
            this.setPosition(preset.x, preset.y);
            return;
        }

        const match = input.match(/^(\d+),(\d+)$/);
        if (match) {
            const x = parseInt(match[1]);
            const y = parseInt(match[2]);
            if (!isNaN(x) && !isNaN(y)) {
                this.setPosition(x, y);
                return;
            }
        }

        alert(this.i18n.t('alertInvalidInput'));
    }

    registerMenuCommands() {
        GM_registerMenuCommand(`${this.ringBuzzer ? '✓' : '　'} ${this.i18n.t('menuRingBuzzer')}`, () => {
            this.ringBuzzer = !this.ringBuzzer;
            GM_setValue('ringBuzzer', this.ringBuzzer);
            location.reload();
        });

        GM_registerMenuCommand(`${this.showIndicator ? '✓' : '　'} ${this.i18n.t('menuShowIndicator')}`, () => {
            this.showIndicator = !this.showIndicator;
            GM_setValue('showIndicator', this.showIndicator);
            if (this.indicator) this.indicator.style.display = this.showIndicator ? 'block' : 'none';
        });

        GM_registerMenuCommand(this.i18n.t('menuSetPosition'), () => {
            this.showPositionSelector();
        });

        GM_registerMenuCommand(this.i18n.t('menuSoundSettings'), () => {});

        GM_registerMenuCommand(`${this.i18n.t('menuVolume')} (${Math.round(this.volume * 100)}%)`, () => {
            const val = parseInt(prompt(this.i18n.t('volumePrompt'), this.volume))/10;
            if (!isNaN(val) && val >= 0.1 && val <= 1.0) {
                this.volume = val;
                GM_setValue('volume', val);
            }
        });

        GM_registerMenuCommand(`${this.i18n.t('menuDuration')} (${this.duration}ms)`, () => {
            const val = parseInt(prompt(this.i18n.t('durationPrompt'), this.duration));
            if (!isNaN(val) && val >= 50 && val <= 300) {
                this.duration = val;
                GM_setValue('duration', val);
            }
        });

        GM_registerMenuCommand(this.i18n.t('menuResetPosition'), () => this.setPosition(20, 20));
    }
}

class I18n {
    translations = {
        'zh-TW': {
            menuRingBuzzer: '啟用 Caps Lock 提示音',
            menuShowIndicator: '顯示狀態指示器',
            menuSetPosition: '設定指示器位置 (跳出視窗)',
            menuSoundSettings: '── 音效設定 ──',
            menuVolume: '調整音量',
            menuDuration: '調整提示音長度',
            menuResetPosition: '重設位置為左上角',
            promptCurrentPos: '目前位置',
            promptChoosePreset: '請選擇預設位置：',
            promptPreset1: '1. 左上角',
            promptPreset2: '2. 右上角',
            promptPreset3: '3. 左下角',
            promptPreset4: '4. 右下角',
            promptPreset5: '5. 畫面中央',
            promptCustom: '或輸入自訂座標 (格式: x,y) 例如: 150,300',
            alertInvalidInput: '輸入格式錯誤！\n請輸入 1~5 或 自訂座標 (例如 150,300)',
            titleIndicator: 'Caps Lock 狀態指示器\n拖曳移動 • 雙擊隱藏/顯示',
            volumePrompt: '請輸入音量 (1 ~ 10)',
            durationPrompt: '提示音持續時間 (50 ~ 300 ms)'
        },
        'en': {
            menuRingBuzzer: 'Enable Caps Lock Sound',
            menuShowIndicator: 'Show Status Indicator',
            menuSetPosition: 'Set Indicator Position (Popup)',
            menuSoundSettings: '── Sound Settings ──',
            menuVolume: 'Adjust Volume',
            menuDuration: 'Adjust Sound Duration',
            menuResetPosition: 'Reset Position to Top-Left',
            promptCurrentPos: 'Current position',
            promptChoosePreset: 'Choose preset position:',
            promptPreset1: '1. Top-Left',
            promptPreset2: '2. Top-Right',
            promptPreset3: '3. Bottom-Left',
            promptPreset4: '4. Bottom-Right',
            promptPreset5: '5. Center',
            promptCustom: 'Or enter custom coordinates (x,y) e.g. 150,300',
            alertInvalidInput: 'Invalid input!\nPlease enter 1~5 or custom coordinates (e.g. 150,300)',
            titleIndicator: 'Caps Lock Status Indicator\nDrag to move • Double-click to hide/show',
            volumePrompt: 'Enter volume (1 ~ 10)',
            durationPrompt: 'Sound duration (50 ~ 300 ms)'
        },
        'ja': {
            menuRingBuzzer: 'Caps Lock 音を有効にする',
            menuShowIndicator: '狀態インジケーターを表示',
            menuSetPosition: 'インジケーター位置を設定 (ポップアップ)',
            menuSoundSettings: '── 音聲設定 ──',
            menuVolume: '音量を調整',
            menuDuration: '音の長さを調整',
            menuResetPosition: '位置を左上にリセット',
            promptCurrentPos: '現在の位置',
            promptChoosePreset: 'プリセット位置を選択:',
            promptPreset1: '1. 左上',
            promptPreset2: '2. 右上',
            promptPreset3: '3. 左下',
            promptPreset4: '4. 右下',
            promptPreset5: '5. 中央',
            promptCustom: 'またはカスタム座標を入力 (x,y) 例: 150,300',
            alertInvalidInput: '入力形式が正しくありません！\n1~5 または カスタム座標 (例: 150,300) を入力してください',
            titleIndicator: 'Caps Lock 狀態インジケーター\nドラッグで移動 • ダブルクリックで表示/非表示',
            volumePrompt: '音量を入力 (1 ~ 10)',
            durationPrompt: '音の長さ (50 ~ 300 ms)'
        },
        'lt': {
            menuRingBuzzer: 'Įjungti Caps Lock garsą',
            menuShowIndicator: 'Rodyti būsenos indikatorių',
            menuSetPosition: 'Nustatyti indikatoriaus poziciją (iššokantis langas)',
            menuSoundSettings: '── Garso nustatymai ──',
            menuVolume: 'Reguliuoti garsumą',
            menuDuration: 'Reguliuoti garso trukmę',
            menuResetPosition: 'Atstatyti poziciją į viršų kairėje',
            promptCurrentPos: 'Dabartinė pozicija',
            promptChoosePreset: 'Pasirinkite numatytąją poziciją:',
            promptPreset1: '1. Viršuje kairėje',
            promptPreset2: '2. Viršuje dešinėje',
            promptPreset3: '3. Apačioje kairėje',
            promptPreset4: '4. Apačioje dešinėje',
            promptPreset5: '5. Centre',
            promptCustom: 'Arba įveskite pasirinktines koordinates (x,y) pvz.: 150,300',
            alertInvalidInput: 'Neteisinga įvestis!\nĮveskite 1~5 arba pasirinktines koordinates (pvz. 150,300)',
            titleIndicator: 'Caps Lock būsenos indikatorius\nVilkite norėdami perkelti • Dukart spustelėkite norėdami paslėpti/rodyti',
            volumePrompt: 'Įveskite garsumą (1 ~ 10)',
            durationPrompt: 'Garso trukmė (50 ~ 300 ms)'
        },
        'cs': {
            menuRingBuzzer: 'Povolit zvuk Caps Lock',
            menuShowIndicator: 'Zobrazit indikátor stavu',
            menuSetPosition: 'Nastavit pozici indikátoru (vyskakovací okno)',
            menuSoundSettings: '── Nastavení zvuku ──',
            menuVolume: 'Upravit hlasitost',
            menuDuration: 'Upravit délku zvuku',
            menuResetPosition: 'Obnovit pozici do levého horního rohu',
            promptCurrentPos: 'Aktuální pozice',
            promptChoosePreset: 'Vyberte přednastavenou pozici:',
            promptPreset1: '1. Levý horní',
            promptPreset2: '2. Pravý horní',
            promptPreset3: '3. Levý dolní',
            promptPreset4: '4. Pravý dolní',
            promptPreset5: '5. Střed',
            promptCustom: 'Nebo zadejte vlastní souřadnice (x,y) např. 150,300',
            alertInvalidInput: 'Neplatný vstup!\nZadejte 1~5 nebo vlastní souřadnice (např. 150,300)',
            titleIndicator: 'Indikátor stavu Caps Lock\nTáhněte pro přesun • Dvojklik pro skrytí/zobrazení',
            volumePrompt: 'Zadejte hlasitost (1 ~ 10)',
            durationPrompt: 'Délka zvuku (50 ~ 300 ms)'
        },
        'hi': {
            menuRingBuzzer: 'Caps Lock ध्वनि सक्षम करें',
            menuShowIndicator: 'स्थिति संकेतक दिखाएं',
            menuSetPosition: 'संकेतक की स्थिति सेट करें (पॉपअप)',
            menuSoundSettings: '── ध्वनि सेटिंग्स ──',
            menuVolume: 'वॉल्यूम समायोजित करें',
            menuDuration: 'ध्वनि अवधि समायोजित करें',
            menuResetPosition: 'स्थिति को ऊपरी बाईं ओर रीसेट करें',
            promptCurrentPos: 'वर्तमान स्थिति',
            promptChoosePreset: 'प्रीसेट स्थिति चुनें:',
            promptPreset1: '1. ऊपरी बाईं',
            promptPreset2: '2. ऊपरी दाईं',
            promptPreset3: '3. निचली बाईं',
            promptPreset4: '4. निचली दाईं',
            promptPreset5: '5. केंद्र',
            promptCustom: 'या कस्टम निर्देशांक दर्ज करें (x,y) उदाहरण: 150,300',
            alertInvalidInput: 'अमान्य इनपुट!\nकृपया 1~5 दर्ज करें या कस्टम निर्देशांक (जैसे 150,300)',
            titleIndicator: 'Caps Lock स्थिति संकेतक\nखींचकर ले जाएं • दोहरी क्लिक छिपाने/दिखाने के लिए',
            volumePrompt: 'वॉल्यूम दर्ज करें (1 ~ 10)',
            durationPrompt: 'ध्वनि अवधि (50 ~ 300 ms)'
        }
    };
    constructor() {
        this.currentLang = GM_getValue('language', this.detectLanguage());
    }

    detectLanguage() {
        const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        if (lang.startsWith('zh')) return 'zh-TW';
        if (lang.startsWith('ja')) return 'ja';
        if (lang.startsWith('lt')) return 'lt';
        if (lang.startsWith('cs')) return 'cs';
        if (lang.startsWith('hi')) return 'hi';
        return 'en';
    }

    t(key, vars = {}) {
        const lang = this.translations[this.currentLang] ? this.currentLang : 'en';
        let text = this.translations[lang][key] || this.translations['en'][key] || key;
        Object.keys(vars).forEach(k => {
            text = text.replace(`{${k}}`, vars[k]);
        });
        return text;
    }
}

const johnTheFlagMarshal = new CapsLockIndicator();

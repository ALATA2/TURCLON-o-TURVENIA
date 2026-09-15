/**
 * TURCLON - Internationalization (i18n) Module
 * Supporta Inglese (Default), Italiano e Giapponese.
 */

export const TRANSLATIONS = {
    en: {
        // Password Gate
        pwdTitle: "SECURITY CLEARANCE REQUIRED",
        pwdSubtitle: "RESTRICTED NEO-GEO SYSTEM // ENTER ACCESS CODE",
        pwdPlaceholder: "ENTER PASSWORD...",
        pwdSubmit: "AUTHENTICATE",
        pwdError: "ACCESS DENIED // INVALID SECURITY CODE",
        pwdSuccess: "ACCESS GRANTED // INITIALIZING SYSTEM...",

        // Credits
        creditsText: "Created by Michele and Daniele",

        // Pause & Exit Modal (ESC)
        confirmExitTitle: "MISSION PAUSED",
        confirmExitDesc: "Are you sure you want to abort and return to the title screen?",
        btnYesExit: "YES, QUIT",
        btnNoResume: "NO, RESUME",

        // Game Start Screen
        gameSubtitle: "NEO-GEO 16-BIT RUN 'N' GUN",
        controlsDesktopHeader: "[ DESKTOP CONTROLS ]",
        controlsMove: "Move: <strong>WASD</strong> or <strong>Arrow Keys</strong>",
        controlsAction: "Jump: <strong>Space</strong> or <strong>Z</strong> | Fire: <strong>X</strong> or <strong>K</strong>",
        controlsDrop: "Drop through platforms: <strong>Down (S / Down Arrow) + Jump</strong>",
        controlsEsc: "Pause / Return to menu: <strong>ESC</strong>",
        controlsMobileHeader: "[ MOBILE TOUCH ]",
        controlsMobileDesc: "Virtual D-Pad on left | Jump (A) and Fire (B) on right",
        btnStart: "TAP OR PRESS SPACE TO START",
        btnEditor: "OPEN LEVEL EDITOR",

        // Game Over
        gameOverTitle: "MISSION FAILED",
        gameOverSubtitle: "ALL LIVES EXHAUSTED",
        btnRetry: "PRESS SPACE TO RETRY",

        // Victory
        victoryTitle: "STAGE CLEAR!",
        victorySubtitle: "SCORE: ",
        victoryDesc: "Sector 01 successfully secured!",
        btnPlayAgain: "PLAY AGAIN",
        btnCreateLevel: "CREATE YOUR OWN LEVEL",

        // Orientation Warning
        rotateTitle: "ROTATE YOUR DEVICE",
        rotateDesc: "For the authentic Neo-Geo arcade experience, please rotate to Landscape mode.",

        // In-game HUD
        hudLife: "LIFE:",
        hudLives: "LIVES:",
        hudScore: "SCORE: ",

        // Editor Toolbar & Actions
        edTitle: "LEVEL LAB",
        edWidth: "Width:",
        edHeight: "Height:",
        edApply: "Apply",
        edZoom: "Zoom:",
        edClear: "Clear",
        edLoadDefault: "Load Sector 1",
        edExport: "Export JSON",
        edImport: "Import JSON",
        edPlayNow: "▶ PLAY NOW!",
        edPaletteTitle: "ELEMENT PALETTE",
        edStatusCol: "Col: ",
        edStatusRow: ", Row: ",
        edStatusTool: " | Active Tool: ",

        // Editor Tips
        edTipsHeader: "QUICK GUIDE:",
        edTipsPaint: "• <strong>Left Click/Drag:</strong> Paint tile",
        edTipsErase: "• <strong>Right Click:</strong> Erase tile",
        edTipsScroll: "• <strong>Shift + Wheel:</strong> Horizontal scroll",

        // Palette Items
        tileSolidName: "Solid Block",
        tileSolidDesc: "Armored impenetrable barrier",
        tilePlatformName: "Platform",
        tilePlatformDesc: "Passable from below, walkable",
        tileHazardName: "Spikes / Laser",
        tileHazardDesc: "Lethal hazard on contact",
        tileCrateName: "Cyber Crate",
        tileCrateDesc: "Destructible with plasma blaster",
        tileSpawnName: "Player Spawn",
        tileSpawnDesc: "Initial spawn point (unique)",
        tileEnemyName: "Enemy Drone",
        tileEnemyDesc: "Bipedal patrol walker bot",
        tileGoalName: "Goal Warp Gate",
        tileGoalDesc: "Extraction warp portal (unique)",
        tileEnergyName: "Energy Capsule",
        tileEnergyDesc: "Restores +2 life points",
        tileEmptyName: "Eraser / Empty",
        tileEmptyDesc: "Clear tile slot",

        // Modal
        modalExportTitle: "Level Export (JSON)",
        modalImportTitle: "Level Import (Paste JSON)",
        btnCopy: "Copy to Clipboard",
        btnCopied: "✓ Copied!",
        btnDownload: "Download .json File",
        btnApplyImport: "Load into Canvas",
        confirmClear: "Are you sure you want to completely clear the level grid?",
        confirmLoadDefault: "Reload default Sector 01? Any unsaved changes will be lost.",
        invalidJson: "Invalid JSON format: must contain a 'data' 2D array.",
        parseError: "JSON parsing error: "
    },

    it: {
        // Password Gate
        pwdTitle: "AUTORIZZAZIONE DI SICUREZZA RICHIESTA",
        pwdSubtitle: "SISTEMA NEO-GEO RISERVATO // INSERISCI CODICE DI ACCESSO",
        pwdPlaceholder: "INSERISCI PASSWORD...",
        pwdSubmit: "AUTENTICA",
        pwdError: "ACCESSO NEGATO // CODICE DI SICUREZZA ERRATO",
        pwdSuccess: "ACCESSO CONSENTITO // AVVIO DEL SISTEMA...",

        // Credits
        creditsText: "Creato da Michele e Daniele",

        // Pause & Exit Modal (ESC)
        confirmExitTitle: "MISSIONE IN PAUSA",
        confirmExitDesc: "Sei sicuro di voler uscire e tornare alla schermata principale?",
        btnYesExit: "SÌ, ESCI",
        btnNoResume: "NO, CONTINUA",

        // Game Start Screen
        gameSubtitle: "RUN 'N' GUN 16-BIT NEO-GEO",
        controlsDesktopHeader: "[ COMANDI DESKTOP ]",
        controlsMove: "Movimento: <strong>WASD</strong> oppure <strong>Frecce</strong>",
        controlsAction: "Salto: <strong>Spazio</strong> o <strong>Z</strong> | Sparo: <strong>X</strong> o <strong>K</strong>",
        controlsDrop: "Scendi da piattaforme: <strong>Giù (S / Freccia Giù) + Salto</strong>",
        controlsEsc: "Pausa / Ritorna al menu: <strong>ESC</strong>",
        controlsMobileHeader: "[ CONTROLLI TOUCH MOBILE ]",
        controlsMobileDesc: "D-Pad virtuale a sinistra | Salto (A) e Sparo (B) a destra",
        btnStart: "TOCCA O PREMI SPAZIO PER INIZIARE",
        btnEditor: "APRI EDITOR LIVELLI",

        // Game Over
        gameOverTitle: "MISSION FAILED",
        gameOverSubtitle: "TUTTE LE VITE SONO ESAURITE",
        btnRetry: "PREMI SPAZIO PER RIPROVARE",

        // Victory
        victoryTitle: "STAGE CLEAR!",
        victorySubtitle: "PUNTEGGIO: ",
        victoryDesc: "Hai completato il Settore 01 con successo!",
        btnPlayAgain: "GIOCA ANCORA",
        btnCreateLevel: "CREA IL TUO LIVELLO",

        // Orientation Warning
        rotateTitle: "RUOTA IL DISPOSITIVO",
        rotateDesc: "Per la migliore esperienza arcade Neo-Geo, posiziona lo schermo in orizzontale (Landscape).",

        // In-game HUD
        hudLife: "VITA:",
        hudLives: "VITE:",
        hudScore: "PUNTI: ",

        // Editor Toolbar & Actions
        edTitle: "LEVEL LAB",
        edWidth: "Larghezza:",
        edHeight: "Altezza:",
        edApply: "Applica",
        edZoom: "Zoom:",
        edClear: "Pulisci",
        edLoadDefault: "Carica Settore 1",
        edExport: "Esporta JSON",
        edImport: "Importa JSON",
        edPlayNow: "▶ GIOCA SUBITO!",
        edPaletteTitle: "PALETTE ELEMENTI",
        edStatusCol: "Col: ",
        edStatusRow: ", Riga: ",
        edStatusTool: " | Strumento attivo: ",

        // Editor Tips
        edTipsHeader: "GUIDA VELOCE:",
        edTipsPaint: "• <strong>Click/Trascina Sx:</strong> Dipingi elemento",
        edTipsErase: "• <strong>Tasto Destro:</strong> Cancella blocco",
        edTipsScroll: "• <strong>Shift + Rotellina:</strong> Scorrimento orizzontale",

        // Palette Items
        tileSolidName: "Blocco Solido",
        tileSolidDesc: "Metallo corazzato invalicabile",
        tilePlatformName: "Piattaforma",
        tilePlatformDesc: "Passabile dal basso, calpestabile",
        tileHazardName: "Spuntoni / Laser",
        tileHazardDesc: "Pericolo letale al contatto",
        tileCrateName: "Cassa Cyber",
        tileCrateDesc: "Distruggibile con i colpi al plasma",
        tileSpawnName: "Spawn Giocatore",
        tileSpawnDesc: "Punto di partenza (unico)",
        tileEnemyName: "Nemico Drone",
        tileEnemyDesc: "Pattugliatore deambulatore",
        tileGoalName: "Traguardo Portale",
        tileGoalDesc: "Portale fine livello (unico)",
        tileEnergyName: "Ricarica Energia",
        tileEnergyDesc: "Capsula +2 punti vita",
        tileEmptyName: "Gomma / Vuoto",
        tileEmptyDesc: "Rimuove l'elemento",

        // Modal
        modalExportTitle: "Esportazione Livello (JSON)",
        modalImportTitle: "Importazione Livello (Incolla JSON)",
        btnCopy: "Copia negli Appunti",
        btnCopied: "✓ Copiato!",
        btnDownload: "Scarica File .json",
        btnApplyImport: "Carica nel Canvas",
        confirmClear: "Sei sicuro di voler svuotare completamente la griglia?",
        confirmLoadDefault: "Vuoi ricaricare il Settore 01 originale? Eventuali modifiche non esportate verranno perse.",
        invalidJson: "Formato JSON non valido: deve contenere una proprietà 'data' con array 2D.",
        parseError: "Errore di parsing del JSON: "
    },

    ja: {
        // Password Gate
        pwdTitle: "セキュリティ認証が必要です",
        pwdSubtitle: "機密ネオジオシステム // アクセスコードを入力",
        pwdPlaceholder: "パスワードを入力...",
        pwdSubmit: "認証する",
        pwdError: "アクセス拒否 // セキュリティコードが無効です",
        pwdSuccess: "アクセス承認 // システムを初期化中...",

        // Credits
        creditsText: "Michele & Daniele による制作",

        // Pause & Exit Modal (ESC)
        confirmExitTitle: "作戦一時停止",
        confirmExitDesc: "作戦を中断してタイトル画面に戻りますか？",
        btnYesExit: "はい、終了する",
        btnNoResume: "いいえ、続ける",

        // Game Start Screen
        gameSubtitle: "ネオジオ風 16ビット アクションシューティング",
        controlsDesktopHeader: "[ デスクトップ操作 ]",
        controlsMove: "移動: <strong>WASD</strong> または <strong>十字キー</strong>",
        controlsAction: "ジャンプ: <strong>スペース</strong> / <strong>Z</strong> | 射撃: <strong>X</strong> / <strong>K</strong>",
        controlsDrop: "足場を降りる: <strong>下キー (S / ↓) + ジャンプ</strong>",
        controlsEsc: "ポーズ / メニューへ戻る: <strong>ESC</strong>",
        controlsMobileHeader: "[ モバイルタッチ操作 ]",
        controlsMobileDesc: "左: 仮想D-Pad | 右: ジャンプ (A) & 射撃 (B)",
        btnStart: "画面タップ または スペースでスタート",
        btnEditor: "ステージエディタを開く",

        // Game Over
        gameOverTitle: "作戦失敗",
        gameOverSubtitle: "残機がなくなりました",
        btnRetry: "スペースキーでリトライ",

        // Victory
        victoryTitle: "ステージクリア！",
        victorySubtitle: "スコア: ",
        victoryDesc: "セクター01の制圧に成功しました！",
        btnPlayAgain: "もう一度プレイ",
        btnCreateLevel: "自作ステージを作る",

        // Orientation Warning
        rotateTitle: "画面を回転してください",
        rotateDesc: "本格的なアーケード体験のため、端末を横向き（ランドスケープ）にしてください。",

        // In-game HUD
        hudLife: "ライフ:",
        hudLives: "残機:",
        hudScore: "スコア: ",

        // Editor Toolbar & Actions
        edTitle: "LEVEL LAB",
        edWidth: "幅:",
        edHeight: "高さ:",
        edApply: "適用",
        edZoom: "ズーム:",
        edClear: "クリア",
        edLoadDefault: "セクター1をロード",
        edExport: "JSONエクスポート",
        edImport: "JSONインポート",
        edPlayNow: "▶ 今すぐプレイ！",
        edPaletteTitle: "エレメントパレット",
        edStatusCol: "列: ",
        edStatusRow: ", 行: ",
        edStatusTool: " | 選択中ツール: ",

        // Editor Tips
        edTipsHeader: "クイックガイド:",
        edTipsPaint: "• <strong>左クリック/ドラッグ:</strong> 配置",
        edTipsErase: "• <strong>右クリック:</strong> 削除",
        edTipsScroll: "• <strong>Shift + ホイール:</strong> 左右スクロール",

        // Palette Items
        tileSolidName: "装甲ブロック",
        tileSolidDesc: "破壊不可の頑丈な金属ブロック",
        tilePlatformName: "通り抜け足場",
        tilePlatformDesc: "下から通り抜け可能、上に乗れる",
        tileHazardName: "危険レーザー/トゲ",
        tileHazardDesc: "接触するとダメージを受けるトラップ",
        tileCrateName: "サイバーコンテナ",
        tileCrateDesc: "プラズマ弾で破壊可能な木箱",
        tileSpawnName: "プレイヤースポーン",
        tileSpawnDesc: "開始地点（1箇所のみ）",
        tileEnemyName: "敵ドローン",
        tileEnemyDesc: "地上を巡回する2足歩行ボット",
        tileGoalName: "脱出ワープゲート",
        tileGoalDesc: "ステージ脱出ポータル（1箇所のみ）",
        tileEnergyName: "エネルギーカプセル",
        tileEnergyDesc: "ライフを2ゲージ回復",
        tileEmptyName: "消しゴム / 空白",
        tileEmptyDesc: "ブロックを削除",

        // Modal
        modalExportTitle: "ステージエクスポート (JSON)",
        modalImportTitle: "ステージインポート (JSON貼り付け)",
        btnCopy: "クリップボードにコピー",
        btnCopied: "✓ コピー完了！",
        btnDownload: ".jsonファイルを保存",
        btnApplyImport: "キャンバスに読み込む",
        confirmClear: "ステージを完全にクリアしてもよろしいですか？",
        confirmLoadDefault: "初期のセクター01を再読み込みしますか？未保存の変更は失われます。",
        invalidJson: "無効なJSONフォーマット: 2次元の 'data' 配列が必要です。",
        parseError: "JSONパースエラー: "
    }
};

class I18nManager {
    constructor() {
        const savedLang = localStorage.getItem('turclon_lang');
        this.currentLang = (savedLang && TRANSLATIONS[savedLang]) ? savedLang : 'en';
        this.listeners = [];
    }

    setLanguage(lang) {
        if (TRANSLATIONS[lang]) {
            this.currentLang = lang;
            localStorage.setItem('turclon_lang', lang);
            this.notify();
        }
    }

    get(key) {
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
        return dict[key] || TRANSLATIONS.en[key] || key;
    }

    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    notify() {
        for (const cb of this.listeners) {
            cb(this.currentLang, this);
        }
    }
}

export const i18n = new I18nManager();

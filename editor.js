/**
 * TURCLON - Level Lab Editor Logic
 * Editor visuale a telecamera virtuale per mappe estese in stile Turrican (274x102 = 27.948 tile).
 * Supporta:
 * - Spostamento di visuale fluido (Panning) con Tasto Centrale del Mouse, Barra Spaziatrice o Strumento Mano (✋)
 * - Zoom out panoramico esteso da 0.05x a 3x con ingrandimento centrato sul puntatore
 * - Radar / Minimap interattivo in tempo reale con salto istantaneo
 * - Viewport Culling ad altissime prestazioni a 60 FPS senza limiti di texture GPU
 * - Supporto multilingua (EN / IT / JA) e salvataggio/esportazione JSON compatibile con il gioco
 */

import { TILE_TYPES, PALETTE } from './js/config.js';
import { LEVEL_1 } from './js/levels.js';
import { i18n } from './js/i18n.js';
import { AuthGate } from './js/auth.js';

function getPaletteDefinitions() {
    return [
        { type: 'PAN', nameKey: 'toolPanName', descKey: 'toolPanDesc', color: '#00e5ff', letter: '✋' },
        { type: TILE_TYPES.SOLID, nameKey: 'tileSolidName', descKey: 'tileSolidDesc', color: '#2a354b', letter: '■' },
        { type: TILE_TYPES.PLATFORM, nameKey: 'tilePlatformName', descKey: 'tilePlatformDesc', color: '#5d729a', letter: '═' },
        { type: TILE_TYPES.HAZARD, nameKey: 'tileHazardName', descKey: 'tileHazardDesc', color: PALETTE.DANGER_RED, letter: '▲' },
        { type: TILE_TYPES.CRATE, nameKey: 'tileCrateName', descKey: 'tileCrateDesc', color: '#a65b1c', letter: '☒' },
        { type: TILE_TYPES.SPAWN, nameKey: 'tileSpawnName', descKey: 'tileSpawnDesc', color: PALETTE.CYBER_BLUE, letter: 'P' },
        { type: TILE_TYPES.ENEMY, nameKey: 'tileEnemyName', descKey: 'tileEnemyDesc', color: PALETTE.HOT_PINK, letter: 'E' },
        { type: TILE_TYPES.GOAL, nameKey: 'tileGoalName', descKey: 'tileGoalDesc', color: PALETTE.NEO_YELLOW, letter: 'G' },
        { type: TILE_TYPES.ENERGY, nameKey: 'tileEnergyName', descKey: 'tileEnergyDesc', color: PALETTE.NEON_GREEN, letter: '+' },
        { type: TILE_TYPES.EMPTY, nameKey: 'tileEmptyName', descKey: 'tileEmptyDesc', color: '#121829', letter: '⌧' }
    ];
}

class LevelEditor {
    constructor() {
        this.canvas = document.getElementById('editor-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.viewport = document.getElementById('viewport');

        // Minimap / Radar
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
        if (this.minimapCtx) this.minimapCtx.imageSmoothingEnabled = false;
        this.isMinimapDragging = false;

        // Dimensioni griglia (Default Turrican: 274x102)
        this.cols = LEVEL_1.width;
        this.rows = LEVEL_1.height;
        this.baseTileSize = 16;

        // Livelli di zoom estesi da 0.05x (vista globale 219px) a 3x (dettaglio 48px)
        this.zoomLevels = [0.05, 0.08, 0.125, 0.18, 0.25, 0.35, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];
        this.zoomIndex = 8; // Default: 1x (indice 8)
        this.zoom = this.zoomLevels[this.zoomIndex];

        // Coordinate virtuali della telecamera (coordinate mondo visualizzate nell'angolo in alto a sinistra)
        this.cameraX = 0;
        this.cameraY = 0;

        // Matrice dati livello
        this.map = [];

        // Strumento selezionato (Default: Blocco Solido)
        this.selectedType = TILE_TYPES.SOLID;

        // Stati di input
        this.isPainting = false;
        this.paintButton = 0; // 0: sinistra, 2: destra
        this.isPanning = false;
        this.isSpacePressed = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Coordinate tile sotto il cursore
        this.hoverCol = -1;
        this.hoverRow = -1;

        // 1. Carica prima la mappa, localizzazione ed interfaccia
        this.init();

        // 2. Inizializza AuthGate SOLO dopo che la mappa e l'editor sono completamente pronti
        this.authGate = new AuthGate(() => {
            console.log("Accesso autorizzato all'Editor // TURCLON Level Lab");
            this.resizeCanvas();
            this.focusSpawn();
        });
    }

    init() {
        this.loadInitialLevel();
        this.initI18n();
        this.renderPaletteUI();
        this.setupEventListeners();
        this.resizeCanvas();
        this.focusSpawn();
    }

    /**
     * Inizializza i pulsanti lingua e la localizzazione
     */
    initI18n() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = btn.dataset.lang;
                i18n.setLanguage(lang);
                this.updateLanguageUI();
                this.renderPaletteUI();
                this.updateStatusBar();
            });
        });

        i18n.onLanguageChange(() => {
            this.updateLanguageUI();
            this.renderPaletteUI();
            this.updateStatusBar();
        });

        this.updateLanguageUI();
    }

    updateLanguageUI() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === i18n.currentLang);
        });

        const setTxt = (id, key) => {
            const el = document.getElementById(id);
            if (el) el.textContent = i18n.get(key);
        };
        const setHtml = (id, key) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = i18n.get(key);
        };

        // Gate
        setTxt('gate-title', 'pwdTitle');
        setTxt('gate-sub', 'pwdSubtitle');
        const pwdInput = document.getElementById('gate-password');
        if (pwdInput) pwdInput.placeholder = i18n.get('pwdPlaceholder');
        setTxt('gate-submit', 'pwdSubmit');

        // Header & Toolbars
        setTxt('lbl-width', 'edWidth');
        setTxt('lbl-height', 'edHeight');
        setTxt('btn-resize', 'edApply');
        setTxt('lbl-zoom', 'edZoom');
        setTxt('btn-clear', 'edClear');
        setTxt('btn-load-default', 'edLoadDefault');
        setTxt('btn-export', 'edExport');
        setTxt('btn-import', 'edImport');
        setTxt('btn-play-test', 'edPlayNow');

        // Sidebar & Tips
        setTxt('palette-heading', 'edPaletteTitle');
        setTxt('tips-header', 'edTipsHeader');
        setHtml('tips-paint', 'edTipsPaint');
        setHtml('tips-erase', 'edTipsErase');
        setHtml('tips-scroll', 'edTipsScroll');

        // Modal
        setTxt('btn-copy-json', 'btnCopy');
        setTxt('btn-download-json', 'btnDownload');
        setTxt('btn-apply-import', 'btnApplyImport');
    }

    loadInitialLevel() {
        const saved = localStorage.getItem('turclon_custom_level');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.cols = parsed.width;
                this.rows = parsed.height;
                this.map = JSON.parse(JSON.stringify(parsed.data));
                document.getElementById('input-width').value = this.cols;
                document.getElementById('input-height').value = this.rows;
                const coordEl = document.getElementById('minimap-coords');
                if (coordEl) coordEl.textContent = `${this.cols}x${this.rows}`;
                return;
            } catch (e) {
                console.warn('Impossibile caricare da localStorage, uso default:', e);
            }
        }

        // Carica Level 1 Turrican Scale (274x102)
        this.cols = LEVEL_1.width;
        this.rows = LEVEL_1.height;
        this.map = JSON.parse(JSON.stringify(LEVEL_1.data));
        document.getElementById('input-width').value = this.cols;
        document.getElementById('input-height').value = this.rows;
        const coordEl = document.getElementById('minimap-coords');
        if (coordEl) coordEl.textContent = `${this.cols}x${this.rows}`;
    }

    renderPaletteUI() {
        const container = document.getElementById('palette-container');
        if (!container) return;
        container.innerHTML = '';

        const defs = getPaletteDefinitions();

        defs.forEach((item) => {
            const el = document.createElement('div');
            el.className = `palette-item ${item.type === this.selectedType ? 'active' : ''}`;
            el.dataset.type = item.type;

            const name = i18n.get(item.nameKey);
            const desc = i18n.get(item.descKey);

            el.innerHTML = `
                <div class="palette-preview" style="background: ${item.color}; color: #fff;">
                    ${item.letter}
                </div>
                <div class="palette-info">
                    <span class="palette-name">${name}</span>
                    <span class="palette-desc">${desc}</span>
                </div>
            `;

            el.addEventListener('click', () => {
                document.querySelectorAll('.palette-item').forEach(p => p.classList.remove('active'));
                el.classList.add('active');
                this.selectedType = item.type;
                this.updateCursor();
                this.updateStatusBar();
            });

            container.appendChild(el);
        });
    }

    updateCursor() {
        if (this.isPanning) {
            this.canvas.style.cursor = 'grabbing';
        } else if (this.isSpacePressed || this.selectedType === 'PAN') {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }

    resizeCanvas() {
        if (!this.viewport) return;
        const w = this.viewport.clientWidth;
        const h = this.viewport.clientHeight;
        if (w > 0 && h > 0) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        document.getElementById('zoom-level').textContent = `${this.zoom}x`;
        this.updateStatusBar();
        this.draw();
    }

    /**
     * Zoom fluido con ancoraggio al cursore del mouse
     */
    zoomAt(newIndex, clientX, clientY) {
        newIndex = Math.max(0, Math.min(this.zoomLevels.length - 1, newIndex));
        if (newIndex === this.zoomIndex) return;

        const oldZoom = this.zoom;
        const oldTileSize = this.baseTileSize * oldZoom;

        const rect = this.canvas.getBoundingClientRect();
        const mouseCanvasX = (clientX !== undefined) ? (clientX - rect.left) : (this.canvas.width / 2);
        const mouseCanvasY = (clientY !== undefined) ? (clientY - rect.top) : (this.canvas.height / 2);

        // Coordinate nel mondo del punto sotto il cursore
        const worldPointX = mouseCanvasX + this.cameraX;
        const worldPointY = mouseCanvasY + this.cameraY;

        this.zoomIndex = newIndex;
        this.zoom = this.zoomLevels[this.zoomIndex];
        const newTileSize = this.baseTileSize * this.zoom;

        // Ricalcola la telecamera in modo che il punto sotto il mouse rimanga fermo
        const ratio = newTileSize / oldTileSize;
        this.cameraX = worldPointX * ratio - mouseCanvasX;
        this.cameraY = worldPointY * ratio - mouseCanvasY;

        document.getElementById('zoom-level').textContent = `${this.zoom}x`;
        this.updateStatusBar();
        this.draw();
    }

    zoomIn() {
        this.zoomAt(this.zoomIndex + 1);
    }

    zoomOut() {
        this.zoomAt(this.zoomIndex - 1);
    }

    /**
     * Centra la visuale sulla posizione di spawn del giocatore
     */
    focusSpawn() {
        let spawnR = -1, spawnC = -1;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.map[r][c] === TILE_TYPES.SPAWN) {
                    spawnR = r;
                    spawnC = c;
                    break;
                }
            }
            if (spawnR !== -1) break;
        }
        if (spawnR === -1) {
            spawnR = 34;
            spawnC = 5;
        }
        this.centerOnTile(spawnC, spawnR);
    }

    /**
     * Centra la telecamera su un tile specifico
     */
    centerOnTile(col, row) {
        const tileSize = this.baseTileSize * this.zoom;
        const targetWorldX = (col + 0.5) * tileSize;
        const targetWorldY = (row + 0.5) * tileSize;
        this.cameraX = targetWorldX - (this.canvas.width / 2);
        this.cameraY = targetWorldY - (this.canvas.height / 2);
        this.draw();
    }

    /**
     * Adatta l'intero livello all'interno della schermata visibile
     */
    fitMap() {
        const W = this.canvas.width;
        const H = this.canvas.height;
        if (W <= 0 || H <= 0) return;

        const neededTileW = (W - 40) / this.cols;
        const neededTileH = (H - 40) / this.rows;
        const neededTileSize = Math.min(neededTileW, neededTileH);
        const targetZoom = neededTileSize / this.baseTileSize;

        let bestIdx = 0;
        for (let i = 0; i < this.zoomLevels.length; i++) {
            if (this.zoomLevels[i] <= targetZoom) {
                bestIdx = i;
            }
        }
        this.zoomIndex = bestIdx;
        this.zoom = this.zoomLevels[this.zoomIndex];
        document.getElementById('zoom-level').textContent = `${this.zoom}x`;

        const tileSize = this.baseTileSize * this.zoom;
        const worldW = this.cols * tileSize;
        const worldH = this.rows * tileSize;
        this.cameraX = (worldW - W) / 2;
        this.cameraY = (worldH - H) / 2;
        this.draw();
    }

    setupEventListeners() {
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Inibisce l'autoscroll nativo di Windows col tasto centrale del mouse
        window.addEventListener('auxclick', (e) => {
            if (e.button === 1) e.preventDefault();
        });
        window.addEventListener('pointerdown', (e) => {
            if (e.button === 1) e.preventDefault();
        });

        // Ridimensionamento finestra -> adatta canvas
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Scorciatoia Spazio per panning rapido (come in Photoshop/Figma)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpacePressed) {
                const tag = document.activeElement ? document.activeElement.tagName : '';
                if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                    this.isSpacePressed = true;
                    this.updateCursor();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.isSpacePressed = false;
                this.updateCursor();
            }
        });

        // Gestione Rotellina Mouse:
        // - Ctrl + Rotellina: Zoom progressivo centrato sul cursore
        // - Rotellina normale: Scorrimento verticale
        // - Shift + Rotellina: Scorrimento orizzontale
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey) {
                if (e.deltaY < 0) {
                    this.zoomAt(this.zoomIndex + 1, e.clientX, e.clientY);
                } else if (e.deltaY > 0) {
                    this.zoomAt(this.zoomIndex - 1, e.clientX, e.clientY);
                }
            } else if (e.shiftKey) {
                this.cameraX += e.deltaY;
                this.draw();
            } else {
                this.cameraY += e.deltaY;
                this.draw();
            }
        }, { passive: false });

        // Pressione Mouse
        this.canvas.addEventListener('mousedown', (e) => {
            const gate = document.getElementById('security-gate');
            if (gate && !gate.classList.contains('hidden')) return;

            // 1. TASTO CENTRALE DEL MOUSE (button === 1) -> Panning Mappa
            if (e.button === 1) {
                e.preventDefault();
                e.stopPropagation();
                this.isPanning = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.updateCursor();
                return;
            }

            // 2. Se è attiva la barra spaziatrice o lo strumento 'PAN' -> Panning con click sinistro
            if ((this.isSpacePressed || this.selectedType === 'PAN') && e.button === 0) {
                e.preventDefault();
                this.isPanning = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.updateCursor();
                return;
            }

            // 3. Disegna o Cancella (Tasto Sinistro = 0, Tasto Destro = 2)
            if (e.button === 0 || e.button === 2) {
                this.isPainting = true;
                this.paintButton = e.button;
                this.applyPaintAtScreenPos(e.clientX, e.clientY, e.button === 2);
            }
        });

        // Movimento Mouse globale
        window.addEventListener('mousemove', (e) => {
            // Se in corso il Panning
            if (this.isPanning) {
                e.preventDefault();
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.cameraX -= dx;
                this.cameraY -= dy;
                this.draw();
                return;
            }

            // Calcolo posizione tile
            const rect = this.canvas.getBoundingClientRect();
            const mouseCanvasX = e.clientX - rect.left;
            const mouseCanvasY = e.clientY - rect.top;

            const tileSize = this.baseTileSize * this.zoom;
            const worldX = mouseCanvasX + this.cameraX;
            const worldY = mouseCanvasY + this.cameraY;

            if (mouseCanvasX >= 0 && mouseCanvasX < this.canvas.width && mouseCanvasY >= 0 && mouseCanvasY < this.canvas.height) {
                const c = Math.floor(worldX / tileSize);
                const r = Math.floor(worldY / tileSize);
                if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
                    this.hoverCol = c;
                    this.hoverRow = r;
                } else {
                    this.hoverCol = -1;
                    this.hoverRow = -1;
                }
            } else {
                this.hoverCol = -1;
                this.hoverRow = -1;
            }

            this.updateStatusBar();

            if (this.isPainting) {
                this.applyPaintAtScreenPos(e.clientX, e.clientY, this.paintButton === 2);
            } else {
                this.draw();
            }
        });

        // Rilascio Mouse globale
        window.addEventListener('mouseup', (e) => {
            if (this.isPanning) {
                this.isPanning = false;
                this.updateCursor();
            }
            if (this.isPainting) {
                this.isPainting = false;
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            if (!this.isPanning) {
                this.hoverCol = -1;
                this.hoverRow = -1;
                this.draw();
            }
        });

        // Radar / Minimap Eventi di navigazione rapida
        if (this.minimapCanvas) {
            const onMinimapJump = (e) => {
                const rect = this.minimapCanvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                const targetCol = (mx / this.minimapCanvas.width) * this.cols;
                const targetRow = (my / this.minimapCanvas.height) * this.rows;
                this.centerOnTile(targetCol, targetRow);
            };

            this.minimapCanvas.addEventListener('mousedown', (e) => {
                this.isMinimapDragging = true;
                onMinimapJump(e);
            });

            window.addEventListener('mousemove', (e) => {
                if (this.isMinimapDragging) {
                    onMinimapJump(e);
                }
            });

            window.addEventListener('mouseup', () => {
                this.isMinimapDragging = false;
            });
        }

        // Toolbar Buttons
        document.getElementById('btn-zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('btn-zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('btn-fit-map')?.addEventListener('click', () => this.fitMap());
        document.getElementById('btn-focus-spawn')?.addEventListener('click', () => this.focusSpawn());

        // Ridimensiona griglia
        document.getElementById('btn-resize')?.addEventListener('click', () => {
            const newW = parseInt(document.getElementById('input-width').value, 10);
            const newH = parseInt(document.getElementById('input-height').value, 10);
            if (newW >= 10 && newH >= 8) {
                this.resizeLevel(newW, newH);
            }
        });

        // Pulisci mappa
        document.getElementById('btn-clear')?.addEventListener('click', () => {
            if (confirm(i18n.get('confirmClear'))) {
                this.map = Array.from({ length: this.rows }, () => Array(this.cols).fill(TILE_TYPES.EMPTY));
                this.draw();
            }
        });

        // Carica Livello 1 Default (Turrican Scale 274x102)
        document.getElementById('btn-load-default')?.addEventListener('click', () => {
            if (confirm(i18n.get('confirmLoadDefault'))) {
                this.cols = LEVEL_1.width;
                this.rows = LEVEL_1.height;
                document.getElementById('input-width').value = this.cols;
                document.getElementById('input-height').value = this.rows;
                const coordEl = document.getElementById('minimap-coords');
                if (coordEl) coordEl.textContent = `${this.cols}x${this.rows}`;
                this.map = JSON.parse(JSON.stringify(LEVEL_1.data));
                this.resizeCanvas();
                this.focusSpawn();
            }
        });

        // Esporta JSON
        document.getElementById('btn-export')?.addEventListener('click', () => this.openExportModal());

        // Importa JSON
        document.getElementById('btn-import')?.addEventListener('click', () => this.openImportModal());

        // GIOCA SUBITO
        document.getElementById('btn-play-test')?.addEventListener('click', () => this.saveAndPlay());

        // Modale: Chiudi
        document.getElementById('modal-close-btn')?.addEventListener('click', () => {
            document.getElementById('json-modal')?.classList.add('hidden');
        });

        // Modale: Copia negli appunti
        document.getElementById('btn-copy-json')?.addEventListener('click', () => {
            const textarea = document.getElementById('json-output');
            navigator.clipboard.writeText(textarea.value).then(() => {
                const btn = document.getElementById('btn-copy-json');
                const prev = btn.textContent;
                btn.textContent = i18n.get('btnCopied');
                btn.style.color = PALETTE.NEON_GREEN;
                setTimeout(() => {
                    btn.textContent = prev;
                    btn.style.color = '';
                }, 1500);
            });
        });

        // Modale: Scarica File .json
        document.getElementById('btn-download-json')?.addEventListener('click', () => {
            const content = document.getElementById('json-output').value;
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'turclon_custom_level.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        // Modale: Applica Import
        document.getElementById('btn-apply-import')?.addEventListener('click', () => {
            const content = document.getElementById('json-output').value;
            try {
                const parsed = JSON.parse(content);
                if (parsed.data && Array.isArray(parsed.data)) {
                    this.cols = parsed.width || parsed.data[0].length;
                    this.rows = parsed.height || parsed.data.length;
                    this.map = parsed.data;
                    document.getElementById('input-width').value = this.cols;
                    document.getElementById('input-height').value = this.rows;
                    const coordEl = document.getElementById('minimap-coords');
                    if (coordEl) coordEl.textContent = `${this.cols}x${this.rows}`;
                    this.resizeCanvas();
                    this.focusSpawn();
                    document.getElementById('json-modal')?.classList.add('hidden');
                } else {
                    alert(i18n.get('invalidJson'));
                }
            } catch (err) {
                alert(i18n.get('parseError') + err.message);
            }
        });
    }

    applyPaintAtScreenPos(clientX, clientY, isErase) {
        if (this.selectedType === 'PAN' && !isErase) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseCanvasX = clientX - rect.left;
        const mouseCanvasY = clientY - rect.top;

        const tileSize = this.baseTileSize * this.zoom;
        const worldX = mouseCanvasX + this.cameraX;
        const worldY = mouseCanvasY + this.cameraY;

        const col = Math.floor(worldX / tileSize);
        const row = Math.floor(worldY / tileSize);

        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

        const typeToSet = isErase ? TILE_TYPES.EMPTY : this.selectedType;

        // Unicità per Spawn e Goal
        if (typeToSet === TILE_TYPES.SPAWN || typeToSet === TILE_TYPES.GOAL) {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.map[r][c] === typeToSet) {
                        this.map[r][c] = TILE_TYPES.EMPTY;
                    }
                }
            }
        }

        if (this.map[row][col] !== typeToSet) {
            this.map[row][col] = typeToSet;
            this.draw();
        }
    }

    resizeLevel(newW, newH) {
        const newMap = Array.from({ length: newH }, () => Array(newW).fill(TILE_TYPES.EMPTY));
        for (let r = 0; r < Math.min(this.rows, newH); r++) {
            for (let c = 0; c < Math.min(this.cols, newW); c++) {
                newMap[r][c] = this.map[r][c];
            }
        }
        this.cols = newW;
        this.rows = newH;
        this.map = newMap;
        const coordEl = document.getElementById('minimap-coords');
        if (coordEl) coordEl.textContent = `${this.cols}x${this.rows}`;
        this.draw();
    }

    saveAndPlay() {
        const exportObj = {
            name: "CUSTOM LEVEL",
            width: this.cols,
            height: this.rows,
            data: this.map
        };

        localStorage.setItem('turclon_custom_level', JSON.stringify(exportObj));
        window.open('index.html?custom=true', '_blank');
    }

    openExportModal() {
        const exportObj = {
            name: "CUSTOM SECTOR",
            width: this.cols,
            height: this.rows,
            data: this.map
        };

        document.getElementById('modal-title').textContent = i18n.get('modalExportTitle');
        document.getElementById('json-output').value = JSON.stringify(exportObj, null, 2);
        document.getElementById('json-output').readOnly = true;
        document.getElementById('btn-copy-json')?.classList.remove('hidden');
        document.getElementById('btn-download-json')?.classList.remove('hidden');
        document.getElementById('btn-apply-import')?.classList.add('hidden');
        document.getElementById('json-modal')?.classList.remove('hidden');
    }

    openImportModal() {
        document.getElementById('modal-title').textContent = i18n.get('modalImportTitle');
        document.getElementById('json-output').value = '';
        document.getElementById('json-output').readOnly = false;
        document.getElementById('btn-copy-json')?.classList.add('hidden');
        document.getElementById('btn-download-json')?.classList.add('hidden');
        document.getElementById('btn-apply-import')?.classList.remove('hidden');
        document.getElementById('json-modal')?.classList.remove('hidden');
    }

    updateStatusBar() {
        const status = document.getElementById('statusbar');
        if (!status) return;
        const defs = getPaletteDefinitions();
        const cur = defs.find(p => p.type === this.selectedType);
        const colStr = this.hoverCol >= 0 ? this.hoverCol : '-';
        const rowStr = this.hoverRow >= 0 ? this.hoverRow : '-';
        const toolName = cur ? i18n.get(cur.nameKey) : 'N/A';
        status.textContent = `${i18n.get('edStatusCol')}${colStr}${i18n.get('edStatusRow')}${rowStr} (${this.cols}x${this.rows}) | Zoom: ${this.zoom}x | ${i18n.get('edStatusTool')}${toolName}`;
    }

    /**
     * Disegna l'area di gioco e il radar con Viewport Culling e camera virtuale
     */
    draw() {
        const W = this.canvas.width;
        const H = this.canvas.height;
        if (W === 0 || H === 0) return;

        this.ctx.clearRect(0, 0, W, H);

        // Sfondo spazio scuro
        this.ctx.fillStyle = '#05070f';
        this.ctx.fillRect(0, 0, W, H);

        const tileSize = this.baseTileSize * this.zoom;
        const worldW = this.cols * tileSize;
        const worldH = this.rows * tileSize;

        // Coordinate a schermo dell'origine della mappa
        const mapScreenX = -this.cameraX;
        const mapScreenY = -this.cameraY;

        // Sfondo del livello giocabile
        this.ctx.fillStyle = '#0a0f1d';
        this.ctx.fillRect(mapScreenX, mapScreenY, worldW, worldH);

        // Viewport Culling: calcola esattamente l'intervallo di tile visibili
        const startCol = Math.max(0, Math.floor(this.cameraX / tileSize));
        const endCol = Math.min(this.cols - 1, Math.ceil((this.cameraX + W) / tileSize));
        const startRow = Math.max(0, Math.floor(this.cameraY / tileSize));
        const endRow = Math.min(this.rows - 1, Math.ceil((this.cameraY + H) / tileSize));

        // 1. Disegna i blocchi visibili
        if (this.map && this.map.length > 0) {
            for (let r = startRow; r <= endRow; r++) {
                if (!this.map[r]) continue;
                for (let c = startCol; c <= endCol; c++) {
                    const type = this.map[r][c];
                    if (type === undefined || type === TILE_TYPES.EMPTY) continue;
                    const sx = c * tileSize - this.cameraX;
                    const sy = r * tileSize - this.cameraY;
                    this.drawTile(type, sx, sy, tileSize, c, r);
                }
            }
        }

        // 2. Griglia visibile (se i tile sono sufficientemente grandi)
        if (tileSize >= 4) {
            this.ctx.lineWidth = 1;

            const gridTop = Math.max(0, mapScreenY);
            const gridBottom = Math.min(H, mapScreenY + worldH);
            const gridLeft = Math.max(0, mapScreenX);
            const gridRight = Math.min(W, mapScreenX + worldW);

            // Linee verticali
            for (let c = startCol; c <= endCol + 1; c++) {
                const sx = c * tileSize - this.cameraX;
                this.ctx.strokeStyle = (c % 10 === 0) ? '#283c66' : '#141d33';
                this.ctx.beginPath();
                this.ctx.moveTo(sx, gridTop);
                this.ctx.lineTo(sx, gridBottom);
                this.ctx.stroke();
            }

            // Linee orizzontali
            for (let r = startRow; r <= endRow + 1; r++) {
                const sy = r * tileSize - this.cameraY;
                this.ctx.strokeStyle = (r % 10 === 0) ? '#283c66' : '#141d33';
                this.ctx.beginPath();
                this.ctx.moveTo(gridLeft, sy);
                this.ctx.lineTo(gridRight, sy);
                this.ctx.stroke();
            }

            // Coordinate guida numeriche
            if (tileSize >= 10 && startRow === 0 && mapScreenY >= 0) {
                this.ctx.fillStyle = '#657ea8';
                this.ctx.font = `${Math.max(9, Math.round(tileSize * 0.35))}px monospace`;
                this.ctx.textAlign = 'center';
                for (let c = startCol; c <= endCol; c++) {
                    if (c % 10 === 0) {
                        this.ctx.fillText(`${c}`, c * tileSize - this.cameraX + tileSize * 0.5, mapScreenY + 12);
                    }
                }
            }
        }

        // Bordo esterno del livello
        this.ctx.strokeStyle = '#00e5ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(mapScreenX, mapScreenY, worldW, worldH);

        // Evidenziazione tile hover
        if (this.hoverCol >= 0 && this.hoverCol < this.cols && this.hoverRow >= 0 && this.hoverRow < this.rows && !this.isPanning) {
            const hx = this.hoverCol * tileSize - this.cameraX;
            const hy = this.hoverRow * tileSize - this.cameraY;
            this.ctx.strokeStyle = (this.selectedType === 'PAN') ? '#ffe600' : '#00e5ff';
            this.ctx.lineWidth = Math.max(1, Math.round(this.zoom));
            this.ctx.strokeRect(hx, hy, tileSize, tileSize);
        }

        // 3. Disegna il Radar / Minimap
        this.drawMinimap();
    }

    /**
     * Disegna il radar in tempo reale
     */
    drawMinimap() {
        if (!this.minimapCanvas || !this.minimapCtx) return;
        const mctx = this.minimapCtx;
        const mw = this.minimapCanvas.width;
        const mh = this.minimapCanvas.height;

        mctx.fillStyle = '#040711';
        mctx.fillRect(0, 0, mw, mh);

        if (!this.map || this.map.length === 0) return;

        const scaleX = mw / this.cols;
        const scaleY = mh / this.rows;

        // Disegna tutti i blocchi presenti
        for (let r = 0; r < this.rows; r++) {
            if (!this.map[r]) continue;
            for (let c = 0; c < this.cols; c++) {
                const type = this.map[r][c];
                if (type === undefined || type === TILE_TYPES.EMPTY) continue;

                switch (type) {
                    case TILE_TYPES.SOLID: mctx.fillStyle = '#425578'; break;
                    case TILE_TYPES.PLATFORM: mctx.fillStyle = '#00e5ff'; break;
                    case TILE_TYPES.HAZARD: mctx.fillStyle = '#ff1744'; break;
                    case TILE_TYPES.CRATE: mctx.fillStyle = '#a65b1c'; break;
                    case TILE_TYPES.SPAWN: mctx.fillStyle = '#39ff14'; break;
                    case TILE_TYPES.ENEMY: mctx.fillStyle = '#ff007f'; break;
                    case TILE_TYPES.GOAL: mctx.fillStyle = '#ffe600'; break;
                    case TILE_TYPES.ENERGY: mctx.fillStyle = '#39ff14'; break;
                    default: mctx.fillStyle = '#2a3a5a';
                }

                mctx.fillRect(c * scaleX, r * scaleY, Math.max(1, scaleX), Math.max(1, scaleY));
            }
        }

        // Rettangolo visuale della telecamera
        const tileSize = this.baseTileSize * this.zoom;
        const viewLeftCol = this.cameraX / tileSize;
        const viewTopRow = this.cameraY / tileSize;
        const viewCols = this.canvas.width / tileSize;
        const viewRows = this.canvas.height / tileSize;

        const rx = viewLeftCol * scaleX;
        const ry = viewTopRow * scaleY;
        const rw = viewCols * scaleX;
        const rh = viewRows * scaleY;

        mctx.strokeStyle = '#00e5ff';
        mctx.lineWidth = 1.5;
        mctx.strokeRect(rx, ry, rw, rh);
        mctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
        mctx.fillRect(rx, ry, rw, rh);
    }

    /**
     * Disegna il singolo blocco ingrandito o miniaturizzato
     */
    drawTile(type, x, y, s, c = 0, r = 0) {
        const z = this.zoom;

        // Se molto piccolo (s <= 6), usa colori pieni per nitidezza e prestazioni assolute
        if (s <= 6) {
            switch (type) {
                case TILE_TYPES.SOLID:
                    this.ctx.fillStyle = PALETTE.STEEL_GRAY;
                    this.ctx.fillRect(x, y, s, s);
                    break;
                case TILE_TYPES.PLATFORM:
                    this.ctx.fillStyle = PALETTE.CYBER_BLUE;
                    this.ctx.fillRect(x, y, s, Math.max(1, Math.round(s * 0.4)));
                    break;
                case TILE_TYPES.HAZARD:
                    this.ctx.fillStyle = PALETTE.DANGER_RED;
                    this.ctx.fillRect(x, y, s, s);
                    break;
                case TILE_TYPES.CRATE:
                    this.ctx.fillStyle = '#a65b1c';
                    this.ctx.fillRect(x, y, s, s);
                    break;
                case TILE_TYPES.SPAWN:
                    this.ctx.fillStyle = PALETTE.CYBER_BLUE;
                    this.ctx.fillRect(x, y, s, s);
                    break;
                case TILE_TYPES.ENEMY:
                    this.ctx.fillStyle = PALETTE.HOT_PINK;
                    this.ctx.fillRect(x, y, s, s);
                    break;
                case TILE_TYPES.GOAL:
                    this.ctx.fillStyle = PALETTE.NEO_YELLOW;
                    this.ctx.fillRect(x, y, s, s);
                    break;
                case TILE_TYPES.ENERGY:
                    this.ctx.fillStyle = PALETTE.NEON_GREEN;
                    this.ctx.fillRect(x, y, s, s);
                    break;
            }
            return;
        }

        // Rendering Neo-Geo rifinito per zoom normale e ravvicinato
        switch (type) {
            case TILE_TYPES.EMPTY:
                break;

            case TILE_TYPES.SOLID: {
                const isSolidOrCrate = (col, row) => {
                    if (col < 0 || col >= this.cols) return true;
                    if (row < 0) return true;
                    if (row >= this.rows) return false;
                    const t = this.map[row] ? this.map[row][col] : TILE_TYPES.EMPTY;
                    return t === TILE_TYPES.SOLID || t === TILE_TYPES.CRATE;
                };

                const topOpen = !isSolidOrCrate(c, r - 1);
                const bottomOpen = !isSolidOrCrate(c, r + 1);
                const leftOpen = !isSolidOrCrate(c - 1, r);
                const rightOpen = !isSolidOrCrate(c + 1, r);

                // Blocco interno
                if (!topOpen && !bottomOpen && !leftOpen && !rightOpen) {
                    this.ctx.fillStyle = '#182236';
                    this.ctx.fillRect(x, y, s, s);
                    this.ctx.fillStyle = '#111827';
                    this.ctx.fillRect(x, y, s, 1);
                    this.ctx.fillRect(x, y, 1, s);
                    if ((c + r) % 2 === 0 && s >= 12) {
                        this.ctx.fillStyle = '#22304d';
                        this.ctx.fillRect(x + Math.round(s * 0.25), y + Math.round(s * 0.25), Math.round(s * 0.5), Math.round(s * 0.5));
                        this.ctx.fillStyle = '#182236';
                        this.ctx.fillRect(x + Math.round(s * 0.3), y + Math.round(s * 0.3), Math.round(s * 0.4), Math.round(s * 0.4));
                    }
                    break;
                }

                // Blocco con facce esterne
                this.ctx.fillStyle = PALETTE.STEEL_GRAY;
                this.ctx.fillRect(x, y, s, s);

                if (topOpen) {
                    this.ctx.fillStyle = '#eaf4ff';
                    this.ctx.fillRect(x, y, s, 1);
                    this.ctx.fillStyle = '#53688e';
                    this.ctx.fillRect(x, y + 1, s, Math.max(1, Math.round(3 * z)));
                    this.ctx.fillStyle = '#2d3b54';
                    for (let px = 1; px < s; px += Math.max(2, Math.round(3 * z))) {
                        this.ctx.fillRect(x + px, y + 1, 1, Math.max(1, Math.round(3 * z)));
                    }
                    this.ctx.fillStyle = '#1e293e';
                    this.ctx.fillRect(x, y + 1 + Math.max(1, Math.round(3 * z)), s, 1);
                } else {
                    this.ctx.fillStyle = '#1b2438';
                    this.ctx.fillRect(x, y, s, 1);
                }

                if (leftOpen) {
                    this.ctx.fillStyle = PALETTE.STEEL_LIGHT;
                    this.ctx.fillRect(x, y, Math.max(1, Math.round(2 * z)), s);
                }
                if (rightOpen) {
                    this.ctx.fillStyle = PALETTE.DARK_NAVY;
                    this.ctx.fillRect(x + s - Math.max(1, Math.round(2 * z)), y, Math.max(1, Math.round(2 * z)), s);
                }
                if (bottomOpen) {
                    this.ctx.fillStyle = '#0a0e1a';
                    this.ctx.fillRect(x, y + s - Math.max(1, Math.round(2 * z)), s, Math.max(1, Math.round(2 * z)));
                }
                if (topOpen && leftOpen) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(x, y, Math.max(2, Math.round(2 * z)), Math.max(2, Math.round(2 * z)));
                }
                if (topOpen && rightOpen) {
                    this.ctx.fillStyle = '#c5d8f7';
                    this.ctx.fillRect(x + s - Math.max(2, Math.round(2 * z)), y, Math.max(2, Math.round(2 * z)), Math.max(2, Math.round(2 * z)));
                }
                break;
            }

            case TILE_TYPES.PLATFORM: {
                this.ctx.fillStyle = '#1c2842';
                this.ctx.fillRect(x, y, s, Math.max(2, Math.round(4 * z)));
                this.ctx.fillStyle = PALETTE.CYBER_BLUE;
                this.ctx.fillRect(x, y, s, Math.max(1, Math.round(1 * z)));
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 2, y, s - 4, 1);
                break;
            }

            case TILE_TYPES.HAZARD:
                this.ctx.fillStyle = PALETTE.DANGER_RED;
                for (let i = 0; i < 3; i++) {
                    const sx = x + i * (s / 3);
                    this.ctx.beginPath();
                    this.ctx.moveTo(sx, y + s);
                    this.ctx.lineTo(sx + s / 6, y + Math.max(2, 4 * z));
                    this.ctx.lineTo(sx + s / 3, y + s);
                    this.ctx.fill();
                }
                break;

            case TILE_TYPES.CRATE:
                this.ctx.fillStyle = '#a65b1c';
                this.ctx.fillRect(x, y, s, s);
                this.ctx.strokeStyle = '#6e380a';
                this.ctx.lineWidth = Math.max(1, 2 * z);
                this.ctx.beginPath();
                this.ctx.moveTo(x + 2, y + 2);
                this.ctx.lineTo(x + s - 2, y + s - 2);
                this.ctx.moveTo(x + s - 2, y + 2);
                this.ctx.lineTo(x + 2, y + s - 2);
                this.ctx.stroke();
                break;

            case TILE_TYPES.SPAWN:
                this.ctx.fillStyle = PALETTE.CYBER_BLUE;
                this.ctx.fillRect(x + 2 * z, y + s - Math.max(2, 4 * z), s - 4 * z, Math.max(2, 4 * z));
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = `bold ${Math.round(s * 0.55)}px monospace`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('P', x + s * 0.5, y + s * 0.65);
                break;

            case TILE_TYPES.ENEMY:
                this.ctx.fillStyle = 'rgba(255, 23, 68, 0.4)';
                this.ctx.fillRect(x, y, s, s);
                this.ctx.fillStyle = PALETTE.DANGER_RED;
                this.ctx.font = `bold ${Math.round(s * 0.55)}px monospace`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('E', x + s * 0.5, y + s * 0.65);
                break;

            case TILE_TYPES.GOAL:
                this.ctx.fillStyle = 'rgba(255, 230, 0, 0.3)';
                this.ctx.fillRect(x, y, s, s);
                this.ctx.strokeStyle = PALETTE.NEO_YELLOW;
                this.ctx.lineWidth = Math.max(1, 2 * z);
                this.ctx.strokeRect(x + 2 * z, y + 2 * z, s - 4 * z, s - 4 * z);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = `bold ${Math.round(s * 0.55)}px monospace`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('G', x + s * 0.5, y + s * 0.65);
                break;

            case TILE_TYPES.ENERGY:
                this.ctx.fillStyle = PALETTE.NEON_GREEN;
                this.ctx.fillRect(x + 4 * z, y + 4 * z, Math.max(4, 8 * z), Math.max(4, 8 * z));
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 7 * z, y + 5 * z, Math.max(1, 2 * z), Math.max(2, 6 * z));
                this.ctx.fillRect(x + 5 * z, y + 7 * z, Math.max(2, 6 * z), Math.max(1, 2 * z));
                break;
        }
    }
}

// Avvio dell'Editor all'apertura della pagina
window.addEventListener('DOMContentLoaded', () => {
    window.editorInstance = new LevelEditor();
});

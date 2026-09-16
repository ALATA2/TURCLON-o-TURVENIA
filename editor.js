/**
 * TURCLON - Level Lab Editor Logic
 * Editor visuale ottimizzato per mappe estese in stile Turrican (274x102 = 27.948 tile).
 * Supporta zoom out panoramico fino a 0.125x, panning con tasto centrale del mouse,
 * viewport culling ad alte prestazioni, zoom con Ctrl+Rotellina, esportazione e i18n.
 */

import { TILE_TYPES, PALETTE } from './js/config.js';
import { LEVEL_1 } from './js/levels.js';
import { i18n } from './js/i18n.js';
import { AuthGate } from './js/auth.js';

function getPaletteDefinitions() {
    return [
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

        // Dimensioni griglia (Default scala Turrican: 274x102)
        this.cols = LEVEL_1.width;
        this.rows = LEVEL_1.height;
        this.baseTileSize = 16;

        // Livelli di zoom estesi per zoom out panoramico completo:
        // 0.125x (2px/tile -> mappa intera 548x204px!), 0.2x, 0.25x, 0.35x, 0.5x, 0.75x, 1x, 1.5x, 2x, 3x, 4x
        this.zoomLevels = [0.125, 0.2, 0.25, 0.35, 0.5, 0.75, 1, 1.5, 2, 3, 4];
        this.zoomIndex = 6; // Default: 1x (indice 6)
        this.zoom = this.zoomLevels[this.zoomIndex];
        this.tileSize = Math.max(2, Math.round(this.baseTileSize * this.zoom));

        // Matrice dati livello
        this.map = [];

        // Stato strumento selezionato
        this.selectedType = TILE_TYPES.SOLID;
        this.isPainting = false;
        this.paintButton = 0; // 0 = sinistro, 2 = destro

        // Panning con tasto centrale del mouse
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.panStartScrollLeft = 0;
        this.panStartScrollTop = 0;

        // Cursore mouse
        this.hoverCol = -1;
        this.hoverRow = -1;

        // Security Clearance Gate
        this.authGate = new AuthGate(() => {
            console.log("Accesso autorizzato all'Editor // TURCLON Level Lab");
        });

        this.init();
    }

    init() {
        this.initI18n();
        this.loadInitialLevel();
        this.renderPaletteUI();
        this.setupEventListeners();
        this.resizeCanvas();
        this.draw();
    }

    /**
     * Configura il selettore lingue ed aggiorna l'interfaccia dell'editor
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

    /**
     * Carica il livello iniziale (se presente in localStorage o il predefinito)
     */
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
    }

    /**
     * Genera dinamicamente la palette laterale con i testi localizzati
     */
    renderPaletteUI() {
        const container = document.getElementById('palette-container');
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
                this.updateStatusBar();
            });

            container.appendChild(el);
        });
    }

    /**
     * Ridimensiona il canvas in base a zoom e dimensioni del livello
     */
    resizeCanvas() {
        this.tileSize = Math.max(2, Math.round(this.baseTileSize * this.zoom));
        this.canvas.width = this.cols * this.tileSize;
        this.canvas.height = this.rows * this.tileSize;
        document.getElementById('zoom-level').textContent = `${this.zoom}x`;
        this.updateStatusBar();
        this.draw();
    }

    zoomIn() {
        if (this.zoomIndex < this.zoomLevels.length - 1) {
            this.zoomIndex += 1;
            this.zoom = this.zoomLevels[this.zoomIndex];
            this.resizeCanvas();
        }
    }

    zoomOut() {
        if (this.zoomIndex > 0) {
            this.zoomIndex -= 1;
            this.zoom = this.zoomLevels[this.zoomIndex];
            this.resizeCanvas();
        }
    }

    /**
     * Registra gli ascoltatori eventi (mouse, tasti, zoom, scroll culling, panning tasto centrale)
     */
    setupEventListeners() {
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Previene il comportamento predefinito di autoscroll del tasto centrale
        window.addEventListener('auxclick', (e) => {
            if (e.button === 1) e.preventDefault();
        });

        // Viewport Scroll: esegue culling istantaneo durante lo scrolling
        if (this.viewport) {
            this.viewport.addEventListener('scroll', () => {
                this.draw();
            }, { passive: true });

            // Zoom fluido con Ctrl + Rotellina
            this.viewport.addEventListener('wheel', (e) => {
                if (e.ctrlKey) {
                    e.preventDefault();
                    if (e.deltaY < 0) {
                        this.zoomIn();
                    } else {
                        this.zoomOut();
                    }
                }
            }, { passive: false });
        }

        // Gestione pressione tasti mouse (tasto sinistro, destro e CENTRALE)
        const onMouseDown = (e) => {
            const gate = document.getElementById('security-gate');
            if (gate && !gate.classList.contains('hidden')) return;

            // Tasto centrale premuto (e.button === 1) -> ATTIVA PANNING MAPPA
            if (e.button === 1) {
                e.preventDefault();
                this.isPanning = true;
                this.panStartX = e.clientX;
                this.panStartY = e.clientY;
                this.panStartScrollLeft = this.viewport ? this.viewport.scrollLeft : 0;
                this.panStartScrollTop = this.viewport ? this.viewport.scrollTop : 0;
                document.body.style.cursor = 'grabbing';
                this.canvas.style.cursor = 'grabbing';
                return;
            }

            // Tasto sinistro (0) o destro (2) -> DIPINGI / CANCELLA
            if (e.button === 0 || e.button === 2) {
                this.isPainting = true;
                this.paintButton = e.button;
                this.applyPaintAtEvent(e);
            }
        };

        this.canvas.addEventListener('mousedown', onMouseDown);
        if (this.viewport) {
            this.viewport.addEventListener('mousedown', (e) => {
                if (e.button === 1) onMouseDown(e);
            });
        }

        // Movimento mouse su finestra per supportare trascinamento fluido
        window.addEventListener('mousemove', (e) => {
            // Se in panning con tasto centrale
            if (this.isPanning && this.viewport) {
                e.preventDefault();
                const dx = e.clientX - this.panStartX;
                const dy = e.clientY - this.panStartY;
                this.viewport.scrollLeft = this.panStartScrollLeft - dx;
                this.viewport.scrollTop = this.panStartScrollTop - dy;
                return;
            }

            // Calcolo posizione tile per hovering e pittura
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (mouseX >= 0 && mouseX < this.canvas.width && mouseY >= 0 && mouseY < this.canvas.height) {
                this.hoverCol = Math.floor(mouseX / this.tileSize);
                this.hoverRow = Math.floor(mouseY / this.tileSize);
            } else {
                this.hoverCol = -1;
                this.hoverRow = -1;
            }

            this.updateStatusBar();

            if (this.isPainting) {
                this.applyPaintAtEvent(e);
            }
            this.draw();
        });

        // Rilascio tasti mouse
        window.addEventListener('mouseup', (e) => {
            if (e.button === 1 || this.isPanning) {
                this.isPanning = false;
                document.body.style.cursor = '';
                this.canvas.style.cursor = 'crosshair';
            }
            this.isPainting = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            if (!this.isPanning) {
                this.hoverCol = -1;
                this.hoverRow = -1;
                this.draw();
            }
        });

        // Ridimensiona griglia
        document.getElementById('btn-resize').addEventListener('click', () => {
            const newW = parseInt(document.getElementById('input-width').value, 10);
            const newH = parseInt(document.getElementById('input-height').value, 10);
            if (newW >= 10 && newH >= 8) {
                this.resizeLevel(newW, newH);
            }
        });

        // Pulsanti Zoom In / Out
        document.getElementById('btn-zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('btn-zoom-out').addEventListener('click', () => this.zoomOut());

        // Pulisci
        document.getElementById('btn-clear').addEventListener('click', () => {
            if (confirm(i18n.get('confirmClear'))) {
                this.map = Array.from({ length: this.rows }, () => Array(this.cols).fill(TILE_TYPES.EMPTY));
                this.draw();
            }
        });

        // Carica Livello 1 Default (Turrican Scale 274x102)
        document.getElementById('btn-load-default').addEventListener('click', () => {
            if (confirm(i18n.get('confirmLoadDefault'))) {
                this.cols = LEVEL_1.width;
                this.rows = LEVEL_1.height;
                document.getElementById('input-width').value = this.cols;
                document.getElementById('input-height').value = this.rows;
                this.map = JSON.parse(JSON.stringify(LEVEL_1.data));
                this.resizeCanvas();
            }
        });

        // Esporta JSON
        document.getElementById('btn-export').addEventListener('click', () => {
            this.openExportModal();
        });

        // Importa JSON
        document.getElementById('btn-import').addEventListener('click', () => {
            this.openImportModal();
        });

        // GIOCA SUBITO
        document.getElementById('btn-play-test').addEventListener('click', () => {
            this.saveAndPlay();
        });

        // Modale: Chiudi
        document.getElementById('modal-close-btn').addEventListener('click', () => {
            document.getElementById('json-modal').classList.add('hidden');
        });

        // Modale: Copia
        document.getElementById('btn-copy-json').addEventListener('click', () => {
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

        // Modale: Scarica File
        document.getElementById('btn-download-json').addEventListener('click', () => {
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
        document.getElementById('btn-apply-import').addEventListener('click', () => {
            const content = document.getElementById('json-output').value;
            try {
                const parsed = JSON.parse(content);
                if (parsed.data && Array.isArray(parsed.data)) {
                    this.cols = parsed.width || parsed.data[0].length;
                    this.rows = parsed.height || parsed.data.length;
                    this.map = parsed.data;
                    document.getElementById('input-width').value = this.cols;
                    document.getElementById('input-height').value = this.rows;
                    this.resizeCanvas();
                    document.getElementById('json-modal').classList.add('hidden');
                } else {
                    alert(i18n.get('invalidJson'));
                }
            } catch (err) {
                alert(i18n.get('parseError') + err.message);
            }
        });
    }

    /**
     * Dipingi o cancella nella posizione del mouse
     */
    applyPaintAtEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const col = Math.floor((e.clientX - rect.left) / this.tileSize);
        const row = Math.floor((e.clientY - rect.top) / this.tileSize);

        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

        const typeToSet = (this.paintButton === 2) ? TILE_TYPES.EMPTY : this.selectedType;

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

        this.map[row][col] = typeToSet;
        this.draw();
    }

    /**
     * Ridimensiona la matrice preservando i blocchi esistenti
     */
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
        this.resizeCanvas();
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
        document.getElementById('btn-copy-json').classList.remove('hidden');
        document.getElementById('btn-download-json').classList.remove('hidden');
        document.getElementById('btn-apply-import').classList.add('hidden');
        document.getElementById('json-modal').classList.remove('hidden');
    }

    openImportModal() {
        document.getElementById('modal-title').textContent = i18n.get('modalImportTitle');
        document.getElementById('json-output').value = '';
        document.getElementById('json-output').readOnly = false;
        document.getElementById('btn-copy-json').classList.add('hidden');
        document.getElementById('btn-download-json').classList.add('hidden');
        document.getElementById('btn-apply-import').classList.remove('hidden');
        document.getElementById('json-modal').classList.remove('hidden');
    }

    updateStatusBar() {
        const status = document.getElementById('statusbar');
        const defs = getPaletteDefinitions();
        const cur = defs.find(p => p.type === this.selectedType);
        const colStr = this.hoverCol >= 0 ? this.hoverCol : '-';
        const rowStr = this.hoverRow >= 0 ? this.hoverRow : '-';
        const toolName = cur ? i18n.get(cur.nameKey) : 'N/A';
        status.textContent = `${i18n.get('edStatusCol')}${colStr}${i18n.get('edStatusRow')}${rowStr} (${this.cols}x${this.rows}) | Zoom: ${this.zoom}x | ${i18n.get('edStatusTool')}${toolName}`;
    }

    /**
     * Disegna l'area visibile del canvas con VIEWPORT CULLING ad alta efficienza.
     * Rendering fluido a 60fps anche su 274x102 (27.948 tile).
     */
    draw() {
        const scrollLeft = this.viewport ? this.viewport.scrollLeft : 0;
        const scrollTop = this.viewport ? this.viewport.scrollTop : 0;
        const viewW = this.viewport ? this.viewport.clientWidth : this.canvas.width;
        const viewH = this.viewport ? this.viewport.clientHeight : this.canvas.height;

        const margin = 2;
        const startCol = Math.max(0, Math.floor(scrollLeft / this.tileSize) - margin);
        const endCol = Math.min(this.cols - 1, Math.ceil((scrollLeft + viewW) / this.tileSize) + margin);
        const startRow = Math.max(0, Math.floor(scrollTop / this.tileSize) - margin);
        const endRow = Math.min(this.rows - 1, Math.ceil((scrollTop + viewH) / this.tileSize) + margin);

        const clearX = startCol * this.tileSize;
        const clearY = startRow * this.tileSize;
        const clearW = (endCol - startCol + 1) * this.tileSize;
        const clearH = (endRow - startRow + 1) * this.tileSize;

        this.ctx.fillStyle = '#080c16';
        this.ctx.fillRect(clearX, clearY, clearW, clearH);

        // 1. Disegna i blocchi visibili
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const type = this.map[r][c];
                if (type === TILE_TYPES.EMPTY) continue;

                const x = c * this.tileSize;
                const y = r * this.tileSize;
                this.drawTile(type, x, y);
            }
        }

        // 2. Griglia visibile (se tile >= 4px per non appesantire la vista a zoom out estremo)
        if (this.tileSize >= 4) {
            this.ctx.strokeStyle = '#18243c';
            this.ctx.lineWidth = 1;

            // Linee verticali
            for (let c = startCol; c <= endCol + 1; c++) {
                const x = c * this.tileSize;
                this.ctx.beginPath();
                this.ctx.moveTo(x, clearY);
                this.ctx.lineTo(x, clearY + clearH);
                if (c % 10 === 0) {
                    this.ctx.strokeStyle = '#2b3f66';
                    this.ctx.stroke();
                    this.ctx.strokeStyle = '#18243c';
                } else {
                    this.ctx.stroke();
                }
            }

            // Linee orizzontali
            for (let r = startRow; r <= endRow + 1; r++) {
                const y = r * this.tileSize;
                this.ctx.beginPath();
                this.ctx.moveTo(clearX, y);
                this.ctx.lineTo(clearX + clearW, y);
                if (r % 10 === 0) {
                    this.ctx.strokeStyle = '#2b3f66';
                    this.ctx.stroke();
                    this.ctx.strokeStyle = '#18243c';
                } else {
                    this.ctx.stroke();
                }
            }

            // 3. Numerazione colonne e righe di riferimento
            if (this.tileSize >= 8) {
                this.ctx.fillStyle = '#657ea8';
                this.ctx.font = `${Math.max(8, this.tileSize * 0.35)}px monospace`;
                this.ctx.textAlign = 'center';
                for (let c = startCol; c <= endCol; c++) {
                    if (c % 10 === 0 && startRow === 0) {
                        this.ctx.fillText(`${c}`, c * this.tileSize + this.tileSize * 0.5, 11);
                    }
                }
            }
        }

        // 4. Evidenziazione cursore attivo
        if (this.hoverCol >= 0 && this.hoverCol < this.cols && this.hoverRow >= 0 && this.hoverRow < this.rows && !this.isPanning) {
            const hx = this.hoverCol * this.tileSize;
            const hy = this.hoverRow * this.tileSize;

            this.ctx.strokeStyle = PALETTE.CYBER_BLUE;
            this.ctx.lineWidth = Math.max(1, Math.round(this.zoom));
            this.ctx.strokeRect(hx, hy, this.tileSize, this.tileSize);
        }
    }

    /**
     * Disegna il singolo blocco ingrandito o miniaturizzato a seconda del livello di zoom
     */
    drawTile(type, x, y) {
        const s = this.tileSize;
        const z = this.zoom;

        // Se molto rimpicciolito (s <= 6), usa il fast-path a colore pieno per la massima nitidezza panoramica
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

        // Rendering dettagliato stile Neo-Geo per zoom normale o ravvicinato (s > 6)
        switch (type) {
            case TILE_TYPES.EMPTY:
                break;

            case TILE_TYPES.SOLID:
                this.ctx.fillStyle = PALETTE.STEEL_GRAY;
                this.ctx.fillRect(x, y, s, s);
                this.ctx.fillStyle = PALETTE.STEEL_LIGHT;
                this.ctx.fillRect(x, y, s, Math.max(1, 2 * z));
                this.ctx.fillRect(x, y, Math.max(1, 2 * z), s);
                this.ctx.fillStyle = PALETTE.DARK_NAVY;
                this.ctx.fillRect(x, y + s - Math.max(1, 2 * z), s, Math.max(1, 2 * z));
                this.ctx.fillRect(x + s - Math.max(1, 2 * z), y, Math.max(1, 2 * z), s);
                if (z >= 1) {
                    this.ctx.fillStyle = PALETTE.STEEL_HIGHLIGHT;
                    this.ctx.fillRect(x + 2 * z, y + 2 * z, 2 * z, 2 * z);
                    this.ctx.fillRect(x + s - 4 * z, y + 2 * z, 2 * z, 2 * z);
                }
                break;

            case TILE_TYPES.PLATFORM:
                this.ctx.fillStyle = PALETTE.STEEL_LIGHT;
                this.ctx.fillRect(x, y, s, Math.max(2, 4 * z));
                this.ctx.fillStyle = PALETTE.CYBER_BLUE;
                this.ctx.fillRect(x, y, s, Math.max(1, 1 * z));
                break;

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

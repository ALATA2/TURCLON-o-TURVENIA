/**
 * TURCLON - Tilemap & Collision Engine
 * Gestisce il caricamento del livello, il rendering grafico 16-bit dei tile e le collisioni.
 */

import { TILE_SIZE, TILE_TYPES, PALETTE } from './config.js';

export class Tilemap {
    constructor(width, height, data = null) {
        this.width = width;   // Numero di colonne
        this.height = height; // Numero di righe
        this.tiles = data || [];
        this.animTimer = 0;

        // Inizializza con vuoto se i dati non sono forniti
        if (this.tiles.length === 0) {
            this.tiles = Array.from({ length: height }, () => Array(width).fill(TILE_TYPES.EMPTY));
        }
    }

    /**
     * Carica una matrice di livello (da array 2D o JSON)
     */
    load(data) {
        if (Array.isArray(data) && data.length > 0) {
            this.height = data.length;
            this.width = data[0].length;
            this.tiles = JSON.parse(JSON.stringify(data));
        }
    }

    getTile(col, row) {
        if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
            return TILE_TYPES.EMPTY;
        }
        return this.tiles[row][col];
    }

    setTile(col, row, type) {
        if (col >= 0 && col < this.width && row >= 0 && row < this.height) {
            this.tiles[row][col] = type;
        }
    }

    /**
     * Verifica se una cella è completamente solida (ostacolo per movimento e proiettili)
     */
    isSolid(col, row) {
        const t = this.getTile(col, row);
        return t === TILE_TYPES.SOLID || t === TILE_TYPES.CRATE;
    }

    /**
     * Verifica se una cella è una piattaforma semi-solida passabile dal basso
     */
    isPlatform(col, row) {
        return this.getTile(col, row) === TILE_TYPES.PLATFORM;
    }

    /**
     * Verifica se una cella è un pericolo mortale
     */
    isHazard(col, row) {
        return this.getTile(col, row) === TILE_TYPES.HAZARD;
    }

    update(dt) {
        this.animTimer += dt;
    }

    /**
     * Disegna i tile visibili all'interno dell'inquadratura della telecamera
     */
    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight, isEditor = false) {
        const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
        const endCol = Math.min(this.width - 1, Math.floor((cameraX + canvasWidth) / TILE_SIZE) + 1);
        const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
        const endRow = Math.min(this.height - 1, Math.floor((cameraY + canvasHeight) / TILE_SIZE) + 1);

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const type = this.tiles[r][c];
                if (type === TILE_TYPES.EMPTY) continue;

                const screenX = Math.round(c * TILE_SIZE - cameraX);
                const screenY = Math.round(r * TILE_SIZE - cameraY);

                this.drawTile(ctx, type, screenX, screenY, c, r, isEditor);
            }
        }
    }

    /**
     * Rendering stile 16-bit arcade per ogni tipologia di blocco
     */
    drawTile(ctx, type, x, y, col, row, isEditor) {
        ctx.save();

        switch (type) {
            case TILE_TYPES.SOLID: {
                // Piastra metallica cybercorazzata Neo-Geo
                ctx.fillStyle = PALETTE.STEEL_GRAY;
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                // Evidenziazione bordo superiore e sinistro (luce zenitale)
                ctx.fillStyle = PALETTE.STEEL_LIGHT;
                ctx.fillRect(x, y, TILE_SIZE, 2);
                ctx.fillRect(x, y, 2, TILE_SIZE);

                // Ombra inferiore e destra
                ctx.fillStyle = PALETTE.DARK_NAVY;
                ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);
                ctx.fillRect(x + TILE_SIZE - 2, y, 2, TILE_SIZE);

                // Rivetti d'angolo metallici
                ctx.fillStyle = PALETTE.STEEL_HIGHLIGHT;
                ctx.fillRect(x + 3, y + 3, 2, 2);
                ctx.fillRect(x + TILE_SIZE - 5, y + 3, 2, 2);
                ctx.fillRect(x + 3, y + TILE_SIZE - 5, 2, 2);
                ctx.fillRect(x + TILE_SIZE - 5, y + TILE_SIZE - 5, 2, 2);

                // Fessura centrale con circuito al neon
                ctx.fillStyle = '#141a29';
                ctx.fillRect(x + 5, y + 7, TILE_SIZE - 10, 2);
                ctx.fillStyle = PALETTE.CYBER_BLUE;
                ctx.fillRect(x + 7, y + 7, 2, 2);
                break;
            }

            case TILE_TYPES.PLATFORM: {
                // Piattaforma cyber passabile dal basso (sottile e tratteggiata)
                ctx.fillStyle = PALETTE.STEEL_LIGHT;
                ctx.fillRect(x, y, TILE_SIZE, 4);

                // Bordo superiore fluorescente
                ctx.fillStyle = PALETTE.CYBER_BLUE;
                ctx.fillRect(x, y, TILE_SIZE, 1);

                // Griglia di supporto inferiore a freccia
                ctx.fillStyle = PALETTE.DARK_NAVY;
                ctx.fillRect(x + 2, y + 4, 3, 4);
                ctx.fillRect(x + TILE_SIZE - 5, y + 4, 3, 4);
                break;
            }

            case TILE_TYPES.HAZARD: {
                // Spuntoni laser al plasma ardente
                const pulse = (Math.sin(this.animTimer * 10 + col) + 1) * 0.5;
                ctx.fillStyle = PALETTE.DANGER_RED;
                // Tre punte laser per tile
                for (let i = 0; i < 3; i++) {
                    const spikeX = x + i * 5;
                    ctx.beginPath();
                    ctx.moveTo(spikeX, y + TILE_SIZE);
                    ctx.lineTo(spikeX + 2.5, y + 4 - pulse * 2);
                    ctx.lineTo(spikeX + 5, y + TILE_SIZE);
                    ctx.fill();
                }
                // Base di alimentazione
                ctx.fillStyle = PALETTE.NEO_YELLOW;
                ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);
                break;
            }

            case TILE_TYPES.CRATE: {
                // Cyber Crate distruttibile
                ctx.fillStyle = '#a65b1c';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#e69a53';
                ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                // X rinforzata
                ctx.strokeStyle = '#6e380a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 3, y + 3);
                ctx.lineTo(x + TILE_SIZE - 3, y + TILE_SIZE - 3);
                ctx.moveTo(x + TILE_SIZE - 3, y + 3);
                ctx.lineTo(x + 3, y + TILE_SIZE - 3);
                ctx.stroke();
                break;
            }

            case TILE_TYPES.SPAWN: {
                // Piattaforma di teletrasporto iniziale
                ctx.fillStyle = PALETTE.CYBER_BLUE;
                ctx.fillRect(x + 2, y + TILE_SIZE - 4, TILE_SIZE - 4, 4);
                if (isEditor) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('P', x + TILE_SIZE * 0.5, y + 10);
                }
                break;
            }

            case TILE_TYPES.ENEMY: {
                // Marcatore nemico
                if (isEditor) {
                    ctx.fillStyle = 'rgba(255, 23, 68, 0.4)';
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = PALETTE.DANGER_RED;
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('E', x + TILE_SIZE * 0.5, y + 11);
                }
                break;
            }

            case TILE_TYPES.GOAL: {
                // Portale di fine livello animato
                const pulse = (Math.sin(this.animTimer * 5) + 1) * 0.5;
                ctx.strokeStyle = PALETTE.GOLD_GLOW;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                ctx.fillStyle = `rgba(255, 230, 0, ${0.3 + pulse * 0.4})`;
                ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                if (isEditor) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('G', x + TILE_SIZE * 0.5, y + 11);
                }
                break;
            }

            case TILE_TYPES.ENERGY: {
                // Capsula energetica fluttuante
                const floatY = Math.sin(this.animTimer * 6 + col) * 2;
                ctx.fillStyle = PALETTE.NEON_GREEN;
                ctx.fillRect(x + 4, y + 4 + floatY, 8, 8);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 7, y + 5 + floatY, 2, 6);
                ctx.fillRect(x + 5, y + 7 + floatY, 6, 2);
                break;
            }
        }

        ctx.restore();
    }
}

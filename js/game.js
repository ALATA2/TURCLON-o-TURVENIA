/**
 * TURCLON - Main Game Engine
 * Loop principale, Gestione Camera, HUD Arcade 16-Bit e Stati di Gioco.
 */

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, TILE_SIZE, TILE_TYPES, PALETTE } from './config.js';
import { audio } from './audio.js';
import { InputManager } from './input.js';
import { ParticleSystem } from './particles.js';
import { ParallaxBackground } from './parallax.js';
import { Tilemap } from './tilemap.js';
import { Player, Enemy, Goal } from './entities.js';
import { LEVEL_1 } from './levels.js';
import { i18n } from './i18n.js';
import { AuthGate } from './auth.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.input = new InputManager();
        this.particles = new ParticleSystem();
        this.parallax = new ParallaxBackground();

        // Stati di gioco: 'START', 'PLAYING', 'STAGE_CLEAR', 'GAME_OVER'
        this.state = 'START';
        this.stateTimer = 0;

        // Telecamera di gioco
        this.camera = { x: 0, y: 0 };

        // Entità
        this.player = null;
        this.spawnPoint = { x: 32, y: 160 };
        this.bullets = [];
        this.enemies = [];
        this.energyPickups = [];
        this.goal = null;

        this.levelData = null;
        this.tilemap = null;

        // Gestione temporale per delta time fisso/fluido
        this.lastTime = performance.now();

        // Inizializzazione Security Clearance Gate e Lingua
        this.authGate = new AuthGate(() => {
            console.log("Accesso autorizzato // Sistema TURCLON attivo");
        });

        this.initI18n();
        this.init();
    }

    /**
     * Configura il selettore di lingua e l'aggiornamento dinamico dell'interfaccia
     */
    initI18n() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = btn.dataset.lang;
                i18n.setLanguage(lang);
                this.updateLanguageUI();
            });
        });

        i18n.onLanguageChange(() => this.updateLanguageUI());
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

        setTxt('gate-title', 'pwdTitle');
        setTxt('gate-sub', 'pwdSubtitle');
        const pwdInput = document.getElementById('gate-password');
        if (pwdInput) pwdInput.placeholder = i18n.get('pwdPlaceholder');
        setTxt('gate-submit', 'pwdSubmit');

        setTxt('start-subtitle', 'gameSubtitle');
        setHtml('ctrl-desktop-header', 'controlsDesktopHeader');
        setHtml('ctrl-move', 'controlsMove');
        setHtml('ctrl-action', 'controlsAction');
        setHtml('ctrl-drop', 'controlsDrop');
        setHtml('ctrl-mobile-header', 'controlsMobileHeader');
        setTxt('ctrl-mobile-desc', 'controlsMobileDesc');
        setTxt('btn-start', 'btnStart');
        setTxt('btn-open-editor', 'btnEditor');

        setTxt('game-over-title', 'gameOverTitle');
        setTxt('game-over-subtitle', 'gameOverSubtitle');
        setTxt('btn-retry', 'btnRetry');

        setTxt('victory-title', 'victoryTitle');
        setTxt('victory-desc', 'victoryDesc');
        setTxt('btn-play-again', 'btnPlayAgain');
        setTxt('btn-create-level', 'btnCreateLevel');

        setTxt('rotate-title', 'rotateTitle');
        setTxt('rotate-desc', 'rotateDesc');
    }

    init() {
        // Verifica se è presente un livello personalizzato salvato dall'Editor
        const urlParams = new URLSearchParams(window.location.search);
        const useEditorLevel = urlParams.get('custom') === 'true';

        let loadedLevel = LEVEL_1;
        if (useEditorLevel) {
            const saved = localStorage.getItem('turclon_custom_level');
            if (saved) {
                try {
                    loadedLevel = JSON.parse(saved);
                    console.log('Livello personalizzato caricato con successo dall\'editor!');
                } catch (e) {
                    console.error('Errore nel caricamento del livello personalizzato:', e);
                }
            }
        }

        this.loadLevel(loadedLevel);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Gestione avvio al primo click / tap (sblocco AudioContext)
        const startTrigger = () => {
            // Blocca se l'overlay di password è ancora attivo
            const gate = document.getElementById('security-gate');
            if (gate && !gate.classList.contains('hidden')) {
                return;
            }

            if (this.state === 'START') {
                audio.init();
                this.state = 'PLAYING';
                document.getElementById('start-overlay').classList.add('hidden');
            } else if (this.state === 'GAME_OVER') {
                this.restartGame();
            } else if (this.state === 'STAGE_CLEAR') {
                this.restartGame();
            }
        };

        window.addEventListener('keydown', (e) => {
            // Ignora se l'utente sta digitando nella password
            const gate = document.getElementById('security-gate');
            if (gate && !gate.classList.contains('hidden')) return;

            if (e.code === 'Space' || e.code === 'KeyX' || e.code === 'Enter') {
                startTrigger();
            }
        });

        document.getElementById('start-overlay').addEventListener('click', startTrigger);
        document.getElementById('game-container').addEventListener('touchstart', startTrigger, { passive: true });

        // Avvio game loop
        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Carica e popola la mappa del livello e le entità
     */
    loadLevel(level) {
        this.levelData = level;
        this.tilemap = new Tilemap(level.width, level.height, level.data);
        this.enemies = [];
        this.energyPickups = [];
        this.bullets = [];
        this.particles.clear();

        // Scansione della matrice per individuare spawn, nemici, oggetti e traguardo
        for (let r = 0; r < level.height; r++) {
            for (let c = 0; c < level.width; c++) {
                const type = level.data[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                if (type === TILE_TYPES.SPAWN) {
                    this.spawnPoint = { x: x, y: y - 6 };
                    // Rimuovi il tile di spawn dalla mappa solida per renderlo calpestabile
                    this.tilemap.setTile(c, r, TILE_TYPES.EMPTY);
                } else if (type === TILE_TYPES.ENEMY) {
                    this.enemies.push(new Enemy(x, y));
                    this.tilemap.setTile(c, r, TILE_TYPES.EMPTY);
                } else if (type === TILE_TYPES.GOAL) {
                    this.goal = new Goal(x, y - 16);
                    this.tilemap.setTile(c, r, TILE_TYPES.EMPTY);
                } else if (type === TILE_TYPES.ENERGY) {
                    this.energyPickups.push({ x: x + 4, y: y + 4, col: c, row: r, collected: false });
                    this.tilemap.setTile(c, r, TILE_TYPES.EMPTY);
                }
            }
        }

        // Se non è stato trovato alcuno spawn, imposta default
        if (!this.player) {
            this.player = new Player(this.spawnPoint.x, this.spawnPoint.y);
        } else {
            this.player.respawn(this.spawnPoint.x, this.spawnPoint.y);
        }

        // Se nessun traguardo è stato impostato, mettilo alla fine del livello
        if (!this.goal) {
            this.goal = new Goal((level.width - 4) * TILE_SIZE, (level.height - 3) * TILE_SIZE - 16);
        }

        this.camera.x = 0;
        this.camera.y = 0;
    }

    restartGame() {
        this.player.lives = 3;
        this.player.score = 0;
        this.loadLevel(this.levelData);
        this.state = 'PLAYING';
        this.stateTimer = 0;
        document.getElementById('game-over-overlay').classList.add('hidden');
        document.getElementById('victory-overlay').classList.add('hidden');
    }

    /**
     * Ridimensiona la visuale mantenendo il rapporto 16:9 pixel-perfect
     */
    resizeCanvas() {
        const container = document.getElementById('game-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const targetAspect = VIRTUAL_WIDTH / VIRTUAL_HEIGHT;
        const containerAspect = containerWidth / containerHeight;

        let displayWidth, displayHeight;
        if (containerAspect > targetAspect) {
            displayHeight = containerHeight;
            displayWidth = displayHeight * targetAspect;
        } else {
            displayWidth = containerWidth;
            displayHeight = displayWidth / targetAspect;
        }

        this.canvas.style.width = `${Math.floor(displayWidth)}px`;
        this.canvas.style.height = `${Math.floor(displayHeight)}px`;
    }

    /**
     * Ciclo principale di gioco (RequestAnimationFrame con Delta Time)
     */
    loop(currentTime) {
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Limita il delta time massimo per evitare tunneling nei cali di frame
        if (dt > 0.05) dt = 0.05;

        this.update(dt);
        this.render();

        this.input.postUpdate();
        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Aggiornamento logico e fisico
     */
    update(dt) {
        this.stateTimer += dt;
        this.parallax.update(dt);
        this.particles.update(dt);
        this.tilemap.update(dt);

        if (this.state === 'START') {
            return;
        }

        if (this.state === 'PLAYING') {
            // Aggiorna giocatore
            this.player.update(dt, this.input, this.tilemap, this.particles, this.bullets);

            // Aggiorna proiettili
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                b.update(dt, this.tilemap, this.particles);
                if (!b.alive) {
                    this.bullets.splice(i, 1);
                }
            }

            // Aggiorna nemici e gestisci collisioni con i proiettili
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const e = this.enemies[i];
                e.update(dt, this.tilemap, this.particles);

                // Collisione proiettile vs nemico
                for (let j = this.bullets.length - 1; j >= 0; j--) {
                    const b = this.bullets[j];
                    if (this.checkAABB(b.x, b.y, b.width, b.height, e.x, e.y, e.width, e.height)) {
                        b.alive = false;
                        e.takeDamage(1, this.particles);
                        if (!e.alive) {
                            this.player.score += 200;
                        }
                        break;
                    }
                }

                // Collisione nemico vs giocatore
                if (e.alive && this.checkAABB(this.player.x, this.player.y, this.player.width, this.player.height, e.x, e.y, e.width, e.height)) {
                    this.player.takeDamage(1, this.particles);
                }

                if (!e.alive && e.flashTimer <= 0) {
                    this.enemies.splice(i, 1);
                }
            }

            // Controllo collisione con pericoli ambientali (spuntoni/acido)
            const playerCol = Math.floor((this.player.x + this.player.width * 0.5) / TILE_SIZE);
            const playerRow = Math.floor((this.player.y + this.player.height - 2) / TILE_SIZE);
            if (this.tilemap.isHazard(playerCol, playerRow)) {
                this.player.takeDamage(1, this.particles);
            }

            // Controllo raccolta capsule energetiche
            for (const item of this.energyPickups) {
                if (!item.collected && this.checkAABB(this.player.x, this.player.y, this.player.width, this.player.height, item.x, item.y, 8, 8)) {
                    item.collected = true;
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
                    this.player.score += 100;
                    this.particles.addPopup(item.x, item.y, '+100 HP', PALETTE.NEON_GREEN);
                    audio.playPickup();
                }
            }

            // Controllo traguardo (Goal / Portale)
            if (this.goal) {
                this.goal.update(dt);
                if (this.checkAABB(this.player.x, this.player.y, this.player.width, this.player.height, this.goal.x, this.goal.y, this.goal.width, this.goal.height)) {
                    this.state = 'STAGE_CLEAR';
                    this.stateTimer = 0;
                    audio.playGoal();
                    this.particles.emitExplosion(this.player.x + 8, this.player.y + 10, 35);
                    document.getElementById('victory-score').textContent = `${i18n.get('hudScore')}${this.player.score}`;
                    document.getElementById('victory-overlay').classList.remove('hidden');
                }
            }

            // Controllo morte giocatore
            if (this.player.hp <= 0) {
                this.player.lives -= 1;
                if (this.player.lives > 0) {
                    this.particles.emitExplosion(this.player.x + 8, this.player.y + 10, 30);
                    this.player.respawn(this.spawnPoint.x, this.spawnPoint.y);
                } else {
                    this.state = 'GAME_OVER';
                    this.stateTimer = 0;
                    document.getElementById('game-over-overlay').classList.remove('hidden');
                }
            }

            // Aggiornamento telecamera con inseguimento orizzontale fluido (Lerp)
            const targetCamX = this.player.x - VIRTUAL_WIDTH * 0.4;
            this.camera.x += (targetCamX - this.camera.x) * 0.12;

            // Limiti telecamera all'interno dei bordi del livello
            const maxCamX = Math.max(0, this.tilemap.width * TILE_SIZE - VIRTUAL_WIDTH);
            if (this.camera.x < 0) this.camera.x = 0;
            if (this.camera.x > maxCamX) this.camera.x = maxCamX;

            // Fissaggio telecamera verticale
            this.camera.y = Math.max(0, (this.tilemap.height * TILE_SIZE) - VIRTUAL_HEIGHT);
        }
    }

    /**
     * Utility di collisione AABB rettangolo-rettangolo
     */
    checkAABB(x1, y1, w1, h1, x2, y2, w2, h2) {
        return (
            x1 < x2 + w2 &&
            x1 + w1 > x2 &&
            y1 < y2 + h2 &&
            y1 + h1 > y2
        );
    }

    /**
     * Rendering del frame sul Canvas a 384x216
     */
    render() {
        this.ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        // 1. Disegna sfondo con effetto Parallasse
        this.parallax.draw(this.ctx, this.camera.x, this.camera.y);

        // 2. Disegna Tilemap (terreno solido, piattaforme passabili)
        this.tilemap.draw(this.ctx, this.camera.x, this.camera.y, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        // 3. Disegna Traguardo
        if (this.goal) {
            this.goal.draw(this.ctx, this.camera.x, this.camera.y);
        }

        // 4. Disegna Capsule energetiche non ancora raccolte
        for (const item of this.energyPickups) {
            if (!item.collected) {
                const sx = Math.round(item.x - this.camera.x);
                const sy = Math.round(item.y - this.camera.y);
                this.ctx.fillStyle = PALETTE.NEON_GREEN;
                this.ctx.fillRect(sx, sy, 8, 8);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(sx + 3, sy + 1, 2, 6);
                this.ctx.fillRect(sx + 1, sy + 3, 6, 2);
            }
        }

        // 5. Disegna Nemici
        for (const e of this.enemies) {
            e.draw(this.ctx, this.camera.x, this.camera.y);
        }

        // 6. Disegna Giocatore
        if (this.player && this.state !== 'STAGE_CLEAR') {
            this.player.draw(this.ctx, this.camera.x, this.camera.y);
        }

        // 7. Disegna Proiettili
        for (const b of this.bullets) {
            b.draw(this.ctx, this.camera.x, this.camera.y);
        }

        // 8. Disegna Particelle e Popups di punteggio
        this.particles.draw(this.ctx, this.camera.x, this.camera.y);

        // 9. HUD Arcade 16-Bit in sovrimpressione
        this.drawHUD();
    }

    /**
     * Disegna l'HUD arcade Neo-Geo (Health bar segmentata, Vite, Punti)
     */
    drawHUD() {
        this.ctx.save();

        // Barra nera semi-trasparente in alto per l'HUD
        this.ctx.fillStyle = 'rgba(10, 13, 26, 0.75)';
        this.ctx.fillRect(0, 0, VIRTUAL_WIDTH, 14);
        this.ctx.fillStyle = PALETTE.CYBER_BLUE;
        this.ctx.fillRect(0, 14, VIRTUAL_WIDTH, 1);

        // SEGMENTI VITA (HEALTH)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 8px monospace';
        this.ctx.textAlign = 'left';
        const lifeLabel = i18n.get('hudLife');
        this.ctx.fillText(lifeLabel, 6, 10);

        const lifeOffset = 6 + this.ctx.measureText(lifeLabel).width + 3;

        for (let i = 0; i < this.player.maxHp; i++) {
            const bx = lifeOffset + i * 8;
            if (i < this.player.hp) {
                this.ctx.fillStyle = (this.player.hp <= 1) ? PALETTE.DANGER_RED : (this.player.hp <= 2 ? PALETTE.NEO_YELLOW : PALETTE.CYBER_BLUE);
            } else {
                this.ctx.fillStyle = '#1c2438';
            }
            this.ctx.fillRect(bx, 4, 6, 7);
        }

        // VITE (LIVES)
        this.ctx.fillStyle = PALETTE.NEO_YELLOW;
        this.ctx.fillText(`${i18n.get('hudLives')} ${this.player.lives}`, lifeOffset + this.player.maxHp * 8 + 12, 10);

        // PUNTEGGIO (SCORE)
        const scoreStr = String(this.player.score).padStart(6, '0');
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${i18n.get('hudScore')}${scoreStr}`, VIRTUAL_WIDTH - 6, 10);

        this.ctx.restore();
    }
}

// Istanziazione del gioco all'avvio della pagina
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});

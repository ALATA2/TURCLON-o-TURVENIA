/**
 * TURCLON - Entities System
 * Classi per Player, Bullet, Enemy, Goal e Pickups in puro Canvas JS stile Neo-Geo.
 */

import { TILE_SIZE, PHYSICS, PALETTE, TILE_TYPES } from './config.js';
import { audio } from './audio.js';

/**
 * Proiettile al plasma sparato dal giocatore
 */
export class Bullet {
    constructor(x, y, dirX) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.vx = dirX * PHYSICS.BULLET_SPEED;
        this.vy = 0;
        this.width = 10;
        this.height = 4;
        this.life = PHYSICS.BULLET_LIFETIME;
        this.alive = true;
    }

    update(dt, tilemap, particleSystem) {
        this.life -= dt;
        if (this.life <= 0) {
            this.alive = false;
            return;
        }

        this.x += this.vx * dt;

        // Verifica collisione con blocchi solidi del tilemap
        const tileCol = Math.floor((this.dirX > 0 ? this.x + this.width : this.x) / TILE_SIZE);
        const tileRow = Math.floor((this.y + this.height * 0.5) / TILE_SIZE);

        if (tilemap.isSolid(tileCol, tileRow)) {
            this.alive = false;
            particleSystem.emitSparks(this.x + (this.dirX > 0 ? this.width : 0), this.y + 2, this.dirX);
            
            // Distruzione cassa cyber se colpita
            if (tilemap.getTile(tileCol, tileRow) === TILE_TYPES.CRATE) {
                tilemap.setTile(tileCol, tileRow, TILE_TYPES.EMPTY);
                particleSystem.emitExplosion(tileCol * TILE_SIZE + 8, tileRow * TILE_SIZE + 8, 14);
                particleSystem.addPopup(tileCol * TILE_SIZE + 8, tileRow * TILE_SIZE, '+50', PALETTE.CYBER_BLUE);
                audio.playExplosion();
            }
        }
    }

    draw(ctx, cameraX, cameraY) {
        const sx = Math.round(this.x - cameraX);
        const sy = Math.round(this.y - cameraY);

        ctx.save();
        // Nucleo centrale brillante
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, this.width, this.height);

        // Alone neon cyan/giallo attorno al plasma
        ctx.fillStyle = PALETTE.CYBER_BLUE;
        ctx.fillRect(sx - 2 * this.dirX, sy - 1, this.width, this.height + 2);

        // Coda scia energetica
        ctx.fillStyle = PALETTE.NEO_YELLOW;
        ctx.fillRect(sx - (this.dirX > 0 ? 5 : -this.width), sy + 1, 5, 2);
        ctx.restore();
    }
}

/**
 * Nemico: Drone Deambulatore Corazzato
 * Pattuglia le piattaforme orizzontalmente ed inverte la marcia a muri o burroni.
 */
export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.vx = 45; // Velocità di pattugliamento
        this.vy = 0;
        this.dir = 1; // 1: Destra, -1: Sinistra
        this.hp = 2;  // Colpi necessari per distruggerlo
        this.alive = true;
        this.flashTimer = 0;
        this.walkCycle = 0;
    }

    update(dt, tilemap, particleSystem) {
        if (!this.alive) return;

        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }

        // Gravità sul nemico
        this.vy += PHYSICS.GRAVITY * dt;
        if (this.vy > PHYSICS.MAX_FALL_SPEED) this.vy = PHYSICS.MAX_FALL_SPEED;

        // Movimento orizzontale
        this.vx = this.dir * 45;
        this.x += this.vx * dt;
        this.walkCycle += dt * 8;

        // Collisione orizzontale con blocchi solidi
        const checkFrontX = this.dir > 0 ? this.x + this.width : this.x;
        const frontCol = Math.floor(checkFrontX / TILE_SIZE);
        const midRow = Math.floor((this.y + this.height * 0.5) / TILE_SIZE);

        if (tilemap.isSolid(frontCol, midRow)) {
            this.dir = -this.dir; // Inverte marcia
            this.x = this.dir > 0 ? frontCol * TILE_SIZE + 1 : (frontCol + 1) * TILE_SIZE - this.width - 1;
        }

        // Controllo burrone (se non c'è terreno davanti, non cade ma inverte)
        const groundCol = Math.floor((this.dir > 0 ? this.x + this.width + 2 : this.x - 2) / TILE_SIZE);
        const groundRow = Math.floor((this.y + this.height + 2) / TILE_SIZE);
        const hasGround = tilemap.isSolid(groundCol, groundRow) || tilemap.isPlatform(groundCol, groundRow);

        if (!hasGround) {
            this.dir = -this.dir;
        }

        // Risoluzione asse Y (caduta e atterraggio)
        this.y += this.vy * dt;
        const bottomY = this.y + this.height;
        const bottomRow = Math.floor(bottomY / TILE_SIZE);
        const colLeft = Math.floor((this.x + 2) / TILE_SIZE);
        const colRight = Math.floor((this.x + this.width - 2) / TILE_SIZE);

        if (tilemap.isSolid(colLeft, bottomRow) || tilemap.isSolid(colRight, bottomRow)) {
            this.y = bottomRow * TILE_SIZE - this.height;
            this.vy = 0;
        }
    }

    takeDamage(amount, particleSystem) {
        this.hp -= amount;
        this.flashTimer = 0.12;

        if (this.hp <= 0) {
            this.alive = false;
            particleSystem.emitExplosion(this.x + 8, this.y + 8, 26);
            particleSystem.addPopup(this.x + 8, this.y, '+200', PALETTE.HOT_PINK);
            audio.playExplosion();
        } else {
            audio.playHit();
        }
    }

    draw(ctx, cameraX, cameraY) {
        if (!this.alive) return;

        const sx = Math.round(this.x - cameraX);
        const sy = Math.round(this.y - cameraY);

        ctx.save();

        // Lampeggio bianco quando subisce danno
        if (this.flashTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx, sy, this.width, this.height);
            ctx.restore();
            return;
        }

        // Corpo metallico del drone (Neo-Geo dark metal)
        ctx.fillStyle = '#222938';
        ctx.fillRect(sx + 2, sy + 2, 12, 9);

        // Bordo armatura superiore
        ctx.fillStyle = PALETTE.STEEL_LIGHT;
        ctx.fillRect(sx + 2, sy + 1, 12, 2);

        // Occhio / Sensore laser scanner rosso
        const eyeOffset = this.dir > 0 ? 8 : 4;
        ctx.fillStyle = PALETTE.DANGER_RED;
        ctx.fillRect(sx + eyeOffset, sy + 4, 4, 3);
        ctx.fillStyle = '#ff8899';
        ctx.fillRect(sx + eyeOffset + 1, sy + 5, 2, 1);

        // Zampe meccaniche animate
        const legAnim = Math.sin(this.walkCycle) * 3;
        ctx.fillStyle = PALETTE.STEEL_HIGHLIGHT;
        // Zampa sinistra
        ctx.fillRect(sx + 3, sy + 11, 3, 5 + legAnim);
        // Zampa destra
        ctx.fillRect(sx + 10, sy + 11, 3, 5 - legAnim);

        ctx.restore();
    }
}

/**
 * Portale di Fine Livello (Warp Gate)
 */
export class Goal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 32;
        this.timer = 0;
    }

    update(dt) {
        this.timer += dt;
    }

    draw(ctx, cameraX, cameraY) {
        const sx = Math.round(this.x - cameraX);
        const sy = Math.round(this.y - cameraY);

        ctx.save();
        // Colonne del portale
        ctx.fillStyle = PALETTE.STEEL_LIGHT;
        ctx.fillRect(sx, sy, 4, this.height);
        ctx.fillRect(sx + this.width - 4, sy, 4, this.height);

        // Arco superiore
        ctx.fillRect(sx, sy, this.width, 4);

        // Vortice energetico centrale animato
        const pulse = (Math.sin(this.timer * 6) + 1) * 0.5;
        const grad = ctx.createLinearGradient(sx + 4, sy, sx + this.width - 4, sy + this.height);
        grad.addColorStop(0, PALETTE.CYBER_BLUE);
        grad.addColorStop(0.5, PALETTE.NEO_YELLOW);
        grad.addColorStop(1, PALETTE.HOT_PINK);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.5 + pulse * 0.4;
        ctx.fillRect(sx + 4, sy + 4, this.width - 8, this.height - 4);

        // Anello di energia fluttuante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const ringY = sy + 8 + ((this.timer * 20) % (this.height - 12));
        ctx.ellipse(sx + this.width * 0.5, ringY, 7, 3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

/**
 * Giocatore: Commando Cibernetico Turrican/Metroid Style
 */
export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 14;
        this.height = 22;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1 = destra, -1 = sinistra

        // Stato di vita
        this.maxHp = 5;
        this.hp = this.maxHp;
        this.lives = 3;
        this.score = 0;

        // Flag fisici
        this.onGround = false;
        this.isJumping = false;
        this.dropThroughTimer = 0; // Quando > 0 ignora le piattaforme semi-solide (per scendere)

        // Meccaniche fluide di salto (Coyote Time & Jump Buffer)
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;

        // Meccanica di sparo
        this.shootCooldown = 0;
        this.muzzleFlashTimer = 0;

        // Invulnerabilità post-danno
        this.invulnerableTimer = 0;

        // Animazioni
        this.animTimer = 0;
        this.state = 'idle'; // idle, run, jump, fall
    }

    /**
     * Resetta la posizione al punto di spawn
     */
    respawn(spawnX, spawnY) {
        this.x = spawnX;
        this.y = spawnY;
        this.vx = 0;
        this.vy = 0;
        this.hp = this.maxHp;
        this.invulnerableTimer = 1.5;
    }

    update(dt, input, tilemap, particleSystem, bullets) {
        // Gestione timer interni
        if (this.shootCooldown > 0) this.shootCooldown -= dt;
        if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer -= dt;
        if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
        if (this.dropThroughTimer > 0) this.dropThroughTimer -= dt;

        // Aggiorna Coyote Time
        if (this.onGround) {
            this.coyoteTimer = PHYSICS.COYOTE_TIME;
        } else {
            this.coyoteTimer -= dt;
        }

        // Aggiorna Jump Buffer
        if (input.justPressed.jump) {
            this.jumpBufferTimer = PHYSICS.JUMP_BUFFER;
        } else {
            this.jumpBufferTimer -= dt;
        }

        // -------------------------------------------------------------
        // MOVIMENTO ORIZZONTALE
        // -------------------------------------------------------------
        let moveDir = 0;
        if (input.keys.left) moveDir -= 1;
        if (input.keys.right) moveDir += 1;

        if (moveDir !== 0) {
            this.facing = moveDir;
            // Accelerazione verso la velocità massima
            this.vx += moveDir * PHYSICS.MOVE_ACCEL * dt;
            if (Math.abs(this.vx) > PHYSICS.MAX_MOVE_SPEED) {
                this.vx = moveDir * PHYSICS.MAX_MOVE_SPEED;
            }
        } else {
            // Decelerazione / Attrito fluido
            if (this.vx > 0) {
                this.vx = Math.max(0, this.vx - PHYSICS.MOVE_DECEL * dt);
            } else if (this.vx < 0) {
                this.vx = Math.min(0, this.vx + PHYSICS.MOVE_DECEL * dt);
            }
        }

        // -------------------------------------------------------------
        // SALTO E DISCESA DA PIATTAFORME
        // -------------------------------------------------------------
        // Se si preme Giù + Salto mentre si è su una piattaforma passabile -> scendi
        if (input.keys.down && input.justPressed.jump) {
            this.dropThroughTimer = 0.25;
            this.onGround = false;
        } else if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
            // Esegui il salto
            this.vy = PHYSICS.JUMP_FORCE;
            this.isJumping = true;
            this.onGround = false;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            audio.playJump();
            particleSystem.emitDust(this.x + this.width * 0.5, this.y + this.height, 4);
        }

        // Taglio altezza salto variabile (se il giocatore rilascia il tasto prima del picco)
        if (!input.keys.jump && this.vy < 0) {
            this.vy += PHYSICS.GRAVITY * PHYSICS.VARIABLE_JUMP_CUTOFF * dt;
        }

        // Applicazione gravità continua
        this.vy += PHYSICS.GRAVITY * dt;
        if (this.vy > PHYSICS.MAX_FALL_SPEED) {
            this.vy = PHYSICS.MAX_FALL_SPEED;
        }

        // -------------------------------------------------------------
        // RISOLUZIONE COLLISIONI TILEMAP ASSE PER ASSE (AABB)
        // -------------------------------------------------------------
        // Movimento Asse X
        this.x += this.vx * dt;
        this.resolveCollisionX(tilemap);

        // Movimento Asse Y
        const prevY = this.y;
        this.y += this.vy * dt;
        this.resolveCollisionY(tilemap, prevY, particleSystem);

        // -------------------------------------------------------------
        // SPARO AL PLASMA
        // -------------------------------------------------------------
        if ((input.keys.shoot || input.justPressed.shoot) && this.shootCooldown <= 0) {
            this.shootCooldown = 0.16; // Cadenza di tiro
            this.muzzleFlashTimer = 0.08;

            const bulletX = this.facing > 0 ? this.x + this.width + 2 : this.x - 10;
            const bulletY = this.y + 11;
            bullets.push(new Bullet(bulletX, bulletY, this.facing));
            audio.playShoot();
        }

        // Controllo caduta nel baratro
        if (this.y > tilemap.height * TILE_SIZE + 50) {
            this.takeDamage(this.maxHp, particleSystem);
        }

        // Aggiorna stato animazione
        if (!this.onGround) {
            this.state = this.vy < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.vx) > 10) {
            this.state = 'run';
            this.animTimer += dt * 12;
        } else {
            this.state = 'idle';
            this.animTimer += dt * 3;
        }
    }

    /**
     * Risolve collisioni orizzontali contro blocchi solidi
     */
    resolveCollisionX(tilemap) {
        const topRow = Math.floor(this.y / TILE_SIZE);
        const bottomRow = Math.floor((this.y + this.height - 1) / TILE_SIZE);

        if (this.vx > 0) {
            const rightCol = Math.floor((this.x + this.width) / TILE_SIZE);
            for (let r = topRow; r <= bottomRow; r++) {
                if (tilemap.isSolid(rightCol, r)) {
                    this.x = rightCol * TILE_SIZE - this.width - 0.01;
                    this.vx = 0;
                    break;
                }
            }
        } else if (this.vx < 0) {
            const leftCol = Math.floor(this.x / TILE_SIZE);
            for (let r = topRow; r <= bottomRow; r++) {
                if (tilemap.isSolid(leftCol, r)) {
                    this.x = (leftCol + 1) * TILE_SIZE + 0.01;
                    this.vx = 0;
                    break;
                }
            }
        }
    }

    /**
     * Risolve collisioni verticali contro blocchi solidi e piattaforme semi-solide
     */
    resolveCollisionY(tilemap, prevY, particleSystem) {
        const leftCol = Math.floor(this.x / TILE_SIZE);
        const rightCol = Math.floor((this.x + this.width - 1) / TILE_SIZE);

        if (this.vy > 0) {
            // Caduta verso il basso
            const bottomRow = Math.floor((this.y + this.height) / TILE_SIZE);
            const prevBottomRow = Math.floor((prevY + this.height) / TILE_SIZE);

            let collided = false;

            for (let c = leftCol; c <= rightCol; c++) {
                // Controllo solidi standard
                if (tilemap.isSolid(c, bottomRow)) {
                    collided = true;
                    break;
                }
                // Controllo piattaforme semi-solide (solo se si proviene da sopra e non si sta scendendo volutamente)
                if (this.dropThroughTimer <= 0 && tilemap.isPlatform(c, bottomRow)) {
                    if (prevBottomRow <= bottomRow) {
                        collided = true;
                        break;
                    }
                }
            }

            if (collided) {
                this.y = bottomRow * TILE_SIZE - this.height;
                if (!this.onGround && this.vy > 180) {
                    audio.playLand();
                    particleSystem.emitDust(this.x + this.width * 0.5, this.y + this.height, 5);
                }
                this.vy = 0;
                this.onGround = true;
                this.isJumping = false;
            } else {
                this.onGround = false;
            }
        } else if (this.vy < 0) {
            // Salto verso l'alto (urto del soffitto)
            const topRow = Math.floor(this.y / TILE_SIZE);
            for (let c = leftCol; c <= rightCol; c++) {
                if (tilemap.isSolid(c, topRow)) {
                    this.y = (topRow + 1) * TILE_SIZE + 0.01;
                    this.vy = 0;
                    break;
                }
            }
            this.onGround = false;
        }
    }

    takeDamage(amount, particleSystem) {
        if (this.invulnerableTimer > 0) return;

        this.hp -= amount;
        this.invulnerableTimer = 1.6;
        audio.playHit();
        particleSystem.emitSparks(this.x + this.width * 0.5, this.y + this.height * 0.5, -this.facing, 12);

        // Piccolo balzo all'indietro per il contraccolpo (knockback)
        this.vy = -120;
        this.vx = -this.facing * 100;
    }

    draw(ctx, cameraX, cameraY) {
        // Se invulnerabile, lampeggio a 10Hz stile arcade
        if (this.invulnerableTimer > 0 && Math.sin(this.invulnerableTimer * 28) > 0) {
            return;
        }

        const sx = Math.round(this.x - cameraX);
        const sy = Math.round(this.y - cameraY);

        ctx.save();

        // Riflesso orizzontale in base a dove guarda il commando
        if (this.facing < 0) {
            ctx.translate(sx + this.width, sy);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(sx, sy);
        }

        // -------------------------------------------------------------
        // DISEGNO SPRITE 16-BIT PROCEDURALE DETTAGLIATO
        // -------------------------------------------------------------

        // 1. Gambe cibernetiche (con animazione di corsa o salto)
        let legL = 0, legR = 0;
        if (this.state === 'run') {
            const step = Math.sin(this.animTimer);
            legL = step * 4;
            legR = -step * 4;
        } else if (this.state === 'jump') {
            legL = -3;
            legR = -2;
        }

        ctx.fillStyle = PALETTE.STEEL_GRAY;
        // Cosce/Schinieri
        ctx.fillRect(2, 14, 4, 8 + legL);
        ctx.fillRect(8, 14, 4, 8 + legR);
        // Punti luce stivali
        ctx.fillStyle = PALETTE.STEEL_LIGHT;
        ctx.fillRect(2, 20 + legL, 4, 2);
        ctx.fillRect(8, 20 + legR, 4, 2);

        // 2. Torace / Armatura Pesante
        ctx.fillStyle = PALETTE.DARK_NAVY;
        ctx.fillRect(1, 6, 11, 9);
        ctx.fillStyle = PALETTE.CYBER_BLUE;
        ctx.fillRect(2, 7, 9, 3); // Piastra pettorale ciano brillante

        // Nucleo reattore sul petto
        ctx.fillStyle = PALETTE.NEO_YELLOW;
        ctx.fillRect(5, 9, 3, 3);

        // 3. Casco con Visore Turrican / Samus Aran
        ctx.fillStyle = PALETTE.STEEL_GRAY;
        ctx.fillRect(2, 0, 9, 6);
        // Visore arancione / oro riflettente
        ctx.fillStyle = PALETTE.GOLD_GLOW;
        ctx.fillRect(6, 2, 5, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, 2, 2, 1); // Riflesso luce sul visore

        // 4. Cannone al Braccio Cyber-Blaster
        ctx.fillStyle = PALETTE.STEEL_LIGHT;
        ctx.fillRect(8, 9, 7, 4);
        ctx.fillStyle = PALETTE.DARK_NAVY;
        ctx.fillRect(13, 9, 3, 4); // Bocca da fuoco del cannone

        // Effetto Vampa di sparo (Muzzle Flash)
        if (this.muzzleFlashTimer > 0) {
            ctx.fillStyle = PALETTE.NEO_YELLOW;
            ctx.fillRect(16, 8, 4, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(17, 9, 2, 4);
        }

        ctx.restore();
    }
}

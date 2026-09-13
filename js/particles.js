/**
 * TURCLON - Particle & FX System
 * Genera scintille, fumo ed esplosioni arcade 16-bit stile Neo-Geo.
 */

import { PALETTE } from './config.js';

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.popups = [];
    }

    /**
     * Aggiunge una singola particella
     */
    add(x, y, vx, vy, color, size, life, gravity = 150) {
        this.particles.push({
            x, y,
            vx, vy,
            color,
            size,
            maxLife: life,
            life: life,
            gravity
        });
    }

    /**
     * Emette scintille all'impatto di un proiettile
     */
    emitSparks(x, y, dirX = 0, count = 8) {
        const colors = [PALETTE.CYBER_BLUE, PALETTE.NEO_YELLOW, '#ffffff'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 0.5 * (Math.random() - 0.5)) + (dirX < 0 ? 0 : Math.PI);
            const speed = 40 + Math.random() * 100;
            const vx = Math.cos(angle) * speed;
            const vy = (Math.random() - 0.7) * 90;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.add(x, y, vx, vy, color, 2 + Math.random() * 2, 0.25 + Math.random() * 0.2, 200);
        }
    }

    /**
     * Emette un'esplosione retro al collasso di un nemico
     */
    emitExplosion(x, y, count = 22) {
        const colors = [PALETTE.HOT_PINK, PALETTE.NEO_YELLOW, PALETTE.DANGER_RED, '#ffffff'];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 140;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 2 + Math.random() * 4;
            const life = 0.3 + Math.random() * 0.35;
            this.add(x, y, vx, vy, color, size, life, 120);
        }
    }

    /**
     * Poff di polvere all'atterraggio o al salto del giocatore
     */
    emitDust(x, y, count = 6) {
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 60;
            const vy = -Math.random() * 30;
            this.add(x, y, vx, vy, PALETTE.STEEL_LIGHT, 2, 0.25, 40);
        }
    }

    /**
     * Testo fluttuante per punteggi o bonus (es. "+200")
     */
    addPopup(x, y, text, color = PALETTE.NEO_YELLOW) {
        this.popups.push({
            x, y,
            text,
            color,
            life: 0.8,
            maxLife: 0.8
        });
    }

    /**
     * Aggiorna posizione e ciclo vitale
     */
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }

        for (let i = this.popups.length - 1; i >= 0; i--) {
            const pop = this.popups[i];
            pop.life -= dt;
            if (pop.life <= 0) {
                this.popups.splice(i, 1);
                continue;
            }
            pop.y -= 25 * dt; // Sale verso l'alto
        }
    }

    /**
     * Renderizza tutte le particelle applicando l'offset della telecamera
     */
    draw(ctx, cameraX, cameraY) {
        ctx.save();

        // Disegno particelle
        for (const p of this.particles) {
            const alpha = Math.max(0, p.life / p.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            // Rettangolini pixel-perfect per estetica arcade
            ctx.fillRect(
                Math.round(p.x - cameraX),
                Math.round(p.y - cameraY),
                Math.max(1, Math.round(p.size * alpha)),
                Math.max(1, Math.round(p.size * alpha))
            );
        }

        // Disegno popups di testo
        ctx.textAlign = 'center';
        ctx.font = 'bold 10px monospace';
        for (const pop of this.popups) {
            const alpha = Math.max(0, pop.life / pop.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#000000';
            ctx.fillText(pop.text, Math.round(pop.x - cameraX) + 1, Math.round(pop.y - cameraY) + 1);
            ctx.fillStyle = pop.color;
            ctx.fillText(pop.text, Math.round(pop.x - cameraX), Math.round(pop.y - cameraY));
        }

        ctx.restore();
    }

    clear() {
        this.particles = [];
        this.popups = [];
    }
}

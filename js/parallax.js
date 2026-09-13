/**
 * TURCLON - Neo-Geo Multi-Layer Parallax Background
 * Crea uno sfondo ad alta profondità a 4 livelli a scorrimento indipendente.
 */

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, PALETTE } from './config.js';

export class ParallaxBackground {
    constructor() {
        this.time = 0;

        // Generazione procedurale di stelle per il Layer 0 (Cielo cosmico)
        this.stars = [];
        for (let i = 0; i < 70; i++) {
            this.stars.push({
                x: Math.random() * VIRTUAL_WIDTH * 2,
                y: Math.random() * (VIRTUAL_HEIGHT * 0.7),
                size: Math.random() > 0.8 ? 2 : 1,
                speed: 0.02,
                twinkleSpeed: 2 + Math.random() * 4,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Generazione edifici per il Layer 1 (Skyline cibernetica lontana)
        this.cityBuildings = [];
        let currX = 0;
        const totalCityWidth = VIRTUAL_WIDTH * 3;
        while (currX < totalCityWidth) {
            const w = 24 + Math.random() * 36;
            const h = 40 + Math.random() * 90;
            this.cityBuildings.push({
                x: currX,
                w: w,
                h: h,
                hasAntenna: Math.random() > 0.5,
                antennaHeight: 12 + Math.random() * 16,
                hasBeacon: Math.random() > 0.4
            });
            currX += w - 4;
        }

        // Generazione colonne e tubazioni per il Layer 2 (Condotti industriali intermedi)
        this.pipes = [];
        let pipeX = 0;
        const totalPipeWidth = VIRTUAL_WIDTH * 3;
        while (pipeX < totalPipeWidth) {
            const w = 18 + Math.random() * 26;
            const h = 80 + Math.random() * 100;
            this.pipes.push({
                x: pipeX,
                w: w,
                h: h
            });
            pipeX += w + 35 + Math.random() * 45;
        }
    }

    update(dt) {
        this.time += dt;
    }

    /**
     * Renderizza i layer di sfondo applicando il fattore di parallasse relativo a cameraX
     */
    draw(ctx, cameraX, cameraY) {
        ctx.save();

        // -------------------------------------------------------------
        // LAYER 0: Gradiente Cosmico + Pianeta / Luna Cyber + Stelle
        // -------------------------------------------------------------
        const skyGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
        skyGrad.addColorStop(0, '#04060f');
        skyGrad.addColorStop(0.5, '#0b142b');
        skyGrad.addColorStop(0.85, '#2b0b2e');
        skyGrad.addColorStop(1, '#421235');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        // Luna cibernetica gigante (spostamento parallasse impercettibile 0.01)
        const moonX = Math.round((VIRTUAL_WIDTH * 0.75) - (cameraX * 0.015) % (VIRTUAL_WIDTH * 2));
        const moonY = 38;
        ctx.fillStyle = '#ff71ce';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
        ctx.fill();

        // Cratere / anello neon sulla luna
        ctx.strokeStyle = '#01cdfe';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(moonX, moonY, 36, 9, -0.25, 0, Math.PI * 2);
        ctx.stroke();

        // Stelle scintillanti
        for (const star of this.stars) {
            const sx = (star.x - cameraX * star.speed) % VIRTUAL_WIDTH;
            const drawX = sx < 0 ? sx + VIRTUAL_WIDTH : sx;
            const twinkle = (Math.sin(this.time * star.twinkleSpeed + star.phase) + 1) * 0.5;
            ctx.fillStyle = twinkle > 0.4 ? '#ffffff' : PALETTE.CYBER_BLUE;
            ctx.globalAlpha = 0.4 + twinkle * 0.6;
            ctx.fillRect(Math.round(drawX), Math.round(star.y), star.size, star.size);
        }
        ctx.globalAlpha = 1.0;

        // -------------------------------------------------------------
        // LAYER 1: Skyline Mega-Città Cibernetica (Parallasse 0.12)
        // -------------------------------------------------------------
        const cityOffset = (cameraX * 0.12) % (VIRTUAL_WIDTH * 3);
        ctx.fillStyle = '#16192e';

        for (const b of this.cityBuildings) {
            let bx = b.x - cityOffset;
            while (bx < -b.w) bx += VIRTUAL_WIDTH * 3;
            while (bx > VIRTUAL_WIDTH) bx -= VIRTUAL_WIDTH * 3;

            const by = VIRTUAL_HEIGHT - b.h;

            // Sagoma edificio
            ctx.fillStyle = '#111425';
            ctx.fillRect(Math.round(bx), Math.round(by), Math.round(b.w), Math.round(b.h));

            // Finestrelle illuminate al neon
            ctx.fillStyle = (Math.floor(b.x) % 2 === 0) ? '#ff0055' : '#00e5ff';
            ctx.globalAlpha = 0.6;
            for (let wy = by + 8; wy < VIRTUAL_HEIGHT - 10; wy += 10) {
                for (let wx = bx + 4; wx < bx + b.w - 4; wx += 6) {
                    if ((Math.sin(wx * 2 + wy) > 0.2)) {
                        ctx.fillRect(Math.round(wx), Math.round(wy), 2, 3);
                    }
                }
            }
            ctx.globalAlpha = 1.0;

            // Antenna con luce di segnalazione intermittente
            if (b.hasAntenna) {
                const antX = Math.round(bx + b.w * 0.5);
                ctx.strokeStyle = '#111425';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(antX, by);
                ctx.lineTo(antX, by - b.antennaHeight);
                ctx.stroke();

                if (b.hasBeacon && Math.sin(this.time * 6) > 0) {
                    ctx.fillStyle = PALETTE.DANGER_RED;
                    ctx.fillRect(antX - 1, by - b.antennaHeight - 2, 3, 3);
                }
            }
        }

        // -------------------------------------------------------------
        // LAYER 2: Strutture Industriali / Travi metalliche (Parallasse 0.35)
        // -------------------------------------------------------------
        const pipeOffset = (cameraX * 0.35) % (VIRTUAL_WIDTH * 3);

        for (const p of this.pipes) {
            let px = p.x - pipeOffset;
            while (px < -p.w) px += VIRTUAL_WIDTH * 3;
            while (px > VIRTUAL_WIDTH) px -= VIRTUAL_WIDTH * 3;

            const py = VIRTUAL_HEIGHT - p.h;

            // Pilone/tubazione
            ctx.fillStyle = '#1c2438';
            ctx.fillRect(Math.round(px), Math.round(py), Math.round(p.w), Math.round(p.h));

            // Bordo illuminato di supporto
            ctx.fillStyle = '#2d3a5a';
            ctx.fillRect(Math.round(px), Math.round(py), 2, Math.round(p.h));
            ctx.fillRect(Math.round(px + p.w - 2), Math.round(py), 2, Math.round(p.h));

            // Scanalature orizzontali
            ctx.fillStyle = '#0f1420';
            for (let sy = py + 12; sy < VIRTUAL_HEIGHT; sy += 16) {
                ctx.fillRect(Math.round(px), Math.round(sy), Math.round(p.w), 2);
            }

            // Spia verde o ciano a scorrimento
            const pulseY = py + ((this.time * 40 + p.x) % p.h);
            ctx.fillStyle = PALETTE.CYBER_BLUE;
            ctx.fillRect(Math.round(px + p.w * 0.5 - 1), Math.round(pulseY), 3, 4);
        }

        ctx.restore();
    }
}

/**
 * TURCLON - 2D Multi-Layer Parallax Background Engine
 * Supporta scorrimento simultaneo orizzontale e verticale per mappe estese in stile Turrican (274x102).
 */

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, PALETTE } from './config.js';

export class ParallaxBackground {
    constructor() {
        this.time = 0;

        // Generazione procedurale di stelle per il Layer 0 (Cielo cosmico)
        this.stars = [];
        for (let i = 0; i < 90; i++) {
            this.stars.push({
                x: Math.random() * VIRTUAL_WIDTH * 2,
                y: Math.random() * (VIRTUAL_HEIGHT * 1.5),
                size: Math.random() > 0.8 ? 2 : 1,
                speedX: 0.02,
                speedY: 0.03,
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
            const h = 50 + Math.random() * 110;
            this.cityBuildings.push({
                x: currX,
                w: w,
                h: h,
                hasAntenna: Math.random() > 0.5,
                antennaHeight: 12 + Math.random() * 18,
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
            const h = 100 + Math.random() * 140;
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
     * Renderizza i layer di sfondo applicando il fattore di parallasse relativo sia a cameraX che cameraY
     */
    draw(ctx, cameraX, cameraY) {
        ctx.save();

        // -------------------------------------------------------------
        // LAYER 0: Gradiente Cosmico / Sotterraneo + Luna Cyber + Stelle
        // -------------------------------------------------------------
        // Se la camera scende nelle caverne sotterranee profonde (cameraY alta), il cielo diventa più scuro e cavernoso
        const depthFactor = Math.min(1.0, Math.max(0, (cameraY - 300) / 1000));

        const skyGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
        if (depthFactor < 0.8) {
            skyGrad.addColorStop(0, '#04060f');
            skyGrad.addColorStop(0.4, '#0b142b');
            skyGrad.addColorStop(0.85, '#2b0b2e');
            skyGrad.addColorStop(1, '#421235');
        } else {
            // Atmosfera sotterranea profonda stile caverna industriale
            skyGrad.addColorStop(0, '#020308');
            skyGrad.addColorStop(0.5, '#070c18');
            skyGrad.addColorStop(1, '#15081b');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        // Luna cibernetica gigante (visibile principalmente in superficie)
        const moonOffsetY = 38 - (cameraY * 0.04);
        if (moonOffsetY > -60 && moonOffsetY < VIRTUAL_HEIGHT + 30) {
            const moonX = Math.round((VIRTUAL_WIDTH * 0.75) - (cameraX * 0.015) % (VIRTUAL_WIDTH * 2));
            ctx.fillStyle = '#ff71ce';
            ctx.globalAlpha = Math.max(0, 1.0 - depthFactor * 1.2);
            ctx.beginPath();
            ctx.arc(moonX, moonOffsetY, 26, 0, Math.PI * 2);
            ctx.fill();

            // Cratere / anello neon sulla luna
            ctx.strokeStyle = '#01cdfe';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(moonX, moonOffsetY, 36, 9, -0.25, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        // Stelle scintillanti con parallasse X e Y
        for (const star of this.stars) {
            const sx = (star.x - cameraX * star.speedX) % VIRTUAL_WIDTH;
            const drawX = sx < 0 ? sx + VIRTUAL_WIDTH : sx;
            const sy = star.y - (cameraY * star.speedY);
            const drawY = ((sy % VIRTUAL_HEIGHT) + VIRTUAL_HEIGHT) % VIRTUAL_HEIGHT;

            const twinkle = (Math.sin(this.time * star.twinkleSpeed + star.phase) + 1) * 0.5;
            ctx.fillStyle = twinkle > 0.4 ? '#ffffff' : PALETTE.CYBER_BLUE;
            ctx.globalAlpha = (0.4 + twinkle * 0.6) * Math.max(0.15, 1.0 - depthFactor * 0.8);
            ctx.fillRect(Math.round(drawX), Math.round(drawY), star.size, star.size);
        }
        ctx.globalAlpha = 1.0;

        // -------------------------------------------------------------
        // LAYER 1: Skyline Mega-Città Cibernetica (Parallasse X: 0.12, Y: 0.15)
        // -------------------------------------------------------------
        const cityOffsetX = (cameraX * 0.12) % (VIRTUAL_WIDTH * 3);
        const cityOffsetY = Math.round(cameraY * 0.15);

        for (const b of this.cityBuildings) {
            let bx = b.x - cityOffsetX;
            while (bx < -b.w) bx += VIRTUAL_WIDTH * 3;
            while (bx > VIRTUAL_WIDTH) bx -= VIRTUAL_WIDTH * 3;

            const by = VIRTUAL_HEIGHT - b.h + 80 - cityOffsetY;

            if (by < VIRTUAL_HEIGHT && by + b.h > 0) {
                // Sagoma edificio
                ctx.fillStyle = '#111425';
                ctx.fillRect(Math.round(bx), Math.round(by), Math.round(b.w), Math.round(b.h + 200));

                // Finestrelle illuminate al neon
                ctx.fillStyle = (Math.floor(b.x) % 2 === 0) ? '#ff0055' : '#00e5ff';
                ctx.globalAlpha = 0.55;
                for (let wy = by + 8; wy < by + b.h; wy += 10) {
                    if (wy > 0 && wy < VIRTUAL_HEIGHT) {
                        for (let wx = bx + 4; wx < bx + b.w - 4; wx += 6) {
                            if (Math.sin(wx * 2 + wy) > 0.2) {
                                ctx.fillRect(Math.round(wx), Math.round(wy), 2, 3);
                            }
                        }
                    }
                }
                ctx.globalAlpha = 1.0;

                // Antenna con luce di segnalazione
                if (b.hasAntenna && by > 0 && by < VIRTUAL_HEIGHT) {
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
        }

        // -------------------------------------------------------------
        // LAYER 2: Travi Industriali e Piloni (Parallasse X: 0.35, Y: 0.35)
        // -------------------------------------------------------------
        const pipeOffsetX = (cameraX * 0.35) % (VIRTUAL_WIDTH * 3);
        const pipeOffsetY = Math.round(cameraY * 0.35);

        for (const p of this.pipes) {
            let px = p.x - pipeOffsetX;
            while (px < -p.w) px += VIRTUAL_WIDTH * 3;
            while (px > VIRTUAL_WIDTH) px -= VIRTUAL_WIDTH * 3;

            const py = VIRTUAL_HEIGHT - p.h + 120 - pipeOffsetY;

            if (py < VIRTUAL_HEIGHT && py + p.h + 400 > 0) {
                // Pilone / tubazione massiccia
                ctx.fillStyle = '#181f33';
                ctx.fillRect(Math.round(px), Math.round(py), Math.round(p.w), Math.round(p.h + 400));

                // Bordo illuminato
                ctx.fillStyle = '#2d3a5a';
                ctx.fillRect(Math.round(px), Math.round(py), 2, Math.round(p.h + 400));
                ctx.fillRect(Math.round(px + p.w - 2), Math.round(py), 2, Math.round(p.h + 400));

                // Scanalature
                ctx.fillStyle = '#0f1420';
                for (let sy = py + 12; sy < py + p.h + 400; sy += 18) {
                    if (sy > 0 && sy < VIRTUAL_HEIGHT) {
                        ctx.fillRect(Math.round(px), Math.round(sy), Math.round(p.w), 2);
                    }
                }

                // Spia ciano a scorrimento
                const pulseY = py + ((this.time * 45 + p.x) % (p.h + 200));
                if (pulseY > 0 && pulseY < VIRTUAL_HEIGHT) {
                    ctx.fillStyle = PALETTE.CYBER_BLUE;
                    ctx.fillRect(Math.round(px + p.w * 0.5 - 1), Math.round(pulseY), 3, 5);
                }
            }
        }

        ctx.restore();
    }
}

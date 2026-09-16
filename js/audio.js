/**
 * TURCLON - 16-Bit Retro Synthesizer (Web Audio API)
 * Genera effetti sonori stile arcade Neo-Geo senza bisogno di file audio esterni.
 */

class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    /**
     * Inizializza l'AudioContext al primo gesto dell'utente (richiesto dai browser moderni)
     */
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Suono di sparo al plasma (onda quadra con pitch drop rapido)
     */
    playShoot() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.13);
    }

    /**
     * Suono di salto (rampa di frequenza ascendente)
     */
    playJump() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(480, t + 0.15);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.16);
    }

    /**
     * Suono di atterraggio (thud sordo)
     */
    playLand() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, t);
        osc.frequency.linearRampToValueAtTime(40, t + 0.08);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.09);
    }

    /**
     * Suono di danno subito (impatto metallico + frequenza distorta)
     */
    playHit() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(60, t + 0.2);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.21);
    }

    /**
     * Esplosione di distruzione nemico (sintesi di rumore bianco filtrato)
     */
    playExplosion() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Rumore bianco
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    /**
     * Raccolta oggetto / energia (arpeggio squillante a 2 note)
     */
    playPickup() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(783.99, t + 0.08); // G5
        osc.frequency.setValueAtTime(1046.50, t + 0.16); // C6

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.29);
    }

    /**
     * Fanfara vittoria livello (accordo Neo-Geo arpeggiato)
     */
    playGoal() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const t = this.ctx.currentTime + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.26);
        });
    }

    /**
     * Beep leggero per navigazione menu (blip arcade)
     */
    playSelect() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1320, t + 0.04);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    /**
     * Suono di conferma selezione / inizio missione (chime a 2 toni)
     */
    playConfirm() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        [587.33, 880.00].forEach((freq, i) => {
            const time = t + i * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.16, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.13);
        });
    }

    /**
     * Attiva/Disattiva l'audio di gioco
     */
    toggleAudio() {
        this.enabled = !this.enabled;
        localStorage.setItem('turclon_audio_enabled', this.enabled ? '1' : '0');
        if (this.enabled) {
            this.playConfirm();
        }
        return this.enabled;
    }
}

export const audio = new SoundFX();
if (localStorage.getItem('turclon_audio_enabled') === '0') {
    audio.enabled = false;
}

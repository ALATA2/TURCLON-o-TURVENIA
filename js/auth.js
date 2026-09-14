/**
 * TURCLON - Security Clearance Gate (Password Protection)
 * Richiede la password "idspispopd" ad ogni accesso al sito.
 */

import { i18n } from './i18n.js';
import { audio } from './audio.js';

export const ACCESS_PASSWORD = "idspispopd";

export class AuthGate {
    constructor(onAuthenticated) {
        this.onAuthenticated = onAuthenticated;
        this.overlay = document.getElementById('security-gate');
        this.input = document.getElementById('gate-password');
        this.btnSubmit = document.getElementById('gate-submit');
        this.errorMsg = document.getElementById('gate-error');

        this.init();
    }

    init() {
        if (!this.overlay) return;

        // "ogni volta che si va sul sito": verifica se già autenticato nella sessione corrente
        const isAuthed = sessionStorage.getItem('turclon_access_granted') === 'true';

        if (isAuthed) {
            this.overlay.classList.add('hidden');
            if (this.onAuthenticated) this.onAuthenticated();
            return;
        }

        // Mostra l'overlay di sicurezza
        this.overlay.classList.remove('hidden');

        // Ascolto invio password
        const attemptLogin = () => {
            const entered = (this.input.value || '').trim().toLowerCase();
            if (entered === ACCESS_PASSWORD) {
                // Accesso consentito
                sessionStorage.setItem('turclon_access_granted', 'true');
                this.errorMsg.style.color = 'var(--neon-green)';
                this.errorMsg.textContent = i18n.get('pwdSuccess');
                this.input.classList.remove('error');
                this.input.classList.add('success');
                audio.playPickup();

                setTimeout(() => {
                    this.overlay.classList.add('fade-out');
                    setTimeout(() => {
                        this.overlay.classList.add('hidden');
                        this.overlay.classList.remove('fade-out');
                        if (this.onAuthenticated) this.onAuthenticated();
                    }, 400);
                }, 500);
            } else {
                // Accesso negato
                this.errorMsg.style.color = 'var(--danger-red)';
                this.errorMsg.textContent = i18n.get('pwdError');
                this.input.classList.add('error');
                this.input.select();
                audio.playHit();
            }
        };

        this.btnSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            audio.init();
            attemptLogin();
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                audio.init();
                attemptLogin();
            }
        });

        // Focus iniziale sul campo password
        setTimeout(() => {
            if (this.input) this.input.focus();
        }, 100);
    }
}

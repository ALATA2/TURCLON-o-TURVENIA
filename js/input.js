/**
 * TURCLON - Cross-Platform Input Controller
 * Gestisce Tastiera (Desktop) e Touch Overlay (Mobile) in modo unificato.
 */

export class InputManager {
    constructor() {
        // Stati continui (tasto premuto)
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            shoot: false
        };

        // Stati "just pressed" (attivi solo nel singolo frame in cui viene premuto il tasto)
        this.justPressed = {
            jump: false,
            shoot: false
        };

        // Rilevamento touch
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        this.initKeyboard();
        this.initTouch();
    }

    /**
     * Ascolto eventi tastiera Desktop
     */
    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            // Ignora se l'utente sta scrivendo in un input testuale
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = true;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = true;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.up = true;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.keys.down = true;
                    e.preventDefault();
                    break;
                case 'Space':
                case 'KeyZ':
                    if (!this.keys.jump) {
                        this.justPressed.jump = true;
                    }
                    this.keys.jump = true;
                    e.preventDefault();
                    break;
                case 'KeyX':
                case 'KeyK':
                case 'KeyJ':
                    if (!this.keys.shoot) {
                        this.justPressed.shoot = true;
                    }
                    this.keys.shoot = true;
                    e.preventDefault();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.up = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.keys.down = false;
                    break;
                case 'Space':
                case 'KeyZ':
                    this.keys.jump = false;
                    break;
                case 'KeyX':
                case 'KeyK':
                case 'KeyJ':
                    this.keys.shoot = false;
                    break;
            }
        });
    }

    /**
     * Inizializzazione controlli Touch per dispositivi mobili
     */
    initTouch() {
        const touchOverlay = document.getElementById('touch-controls');
        if (!touchOverlay) return;

        // Se è un dispositivo touch, rendi visibili i controlli
        if (this.isTouchDevice) {
            touchOverlay.classList.remove('hidden');
        }

        // Funzione helper per legare un elemento HTML a un'azione input
        const bindButton = (elementId, actionName, isTrigger = false) => {
            const btn = document.getElementById(elementId);
            if (!btn) return;

            const handlePress = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isTrigger && !this.keys[actionName]) {
                    this.justPressed[actionName] = true;
                }
                this.keys[actionName] = true;
                btn.classList.add('active');
            };

            const handleRelease = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.keys[actionName] = false;
                btn.classList.remove('active');
            };

            btn.addEventListener('touchstart', handlePress, { passive: false });
            btn.addEventListener('touchend', handleRelease, { passive: false });
            btn.addEventListener('touchcancel', handleRelease, { passive: false });

            // Supporto click per debug su desktop
            btn.addEventListener('mousedown', handlePress);
            btn.addEventListener('mouseup', handleRelease);
            btn.addEventListener('mouseleave', handleRelease);
        };

        bindButton('btn-left', 'left');
        bindButton('btn-right', 'right');
        bindButton('btn-down', 'down');
        bindButton('btn-jump', 'jump', true);
        bindButton('btn-shoot', 'shoot', true);
    }

    /**
     * Chiamato ad ogni fine frame dal game loop per resettare i tasti a scatto
     */
    postUpdate() {
        this.justPressed.jump = false;
        this.justPressed.shoot = false;
    }
}

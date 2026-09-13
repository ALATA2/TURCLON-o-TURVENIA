/**
 * TURCLON - Global Configuration & Constants
 * Estetica 16-Bit Neo-Geo / Turrican Style
 */

// Dimensioni virtuali del gioco (Risoluzione retro 16:9 con pixel perfetti)
export const VIRTUAL_WIDTH = 384;
export const VIRTUAL_HEIGHT = 216;
export const TILE_SIZE = 16;

// Mappatura ID delle tile nel livello
export const TILE_TYPES = {
    EMPTY: 0,
    SOLID: 1,           // Blocco metallico solido
    PLATFORM: 2,        // Piattaforma semi-solida passabile dal basso
    HAZARD: 3,          // Spuntoni laser / acido mortale
    CRATE: 4,           // Cassa cyber distruttibile
    SPAWN: 5,           // Punto di partenza del giocatore
    ENEMY: 6,           // Spawn nemico drone deambulatore
    GOAL: 7,            // Portale teletrasporto / Traguardo
    ENERGY: 8           // Ricarica energia vitale
};

// Parametri della fisica (in pixel al secondo o pixel/frame a 60fps)
export const PHYSICS = {
    GRAVITY: 850,              // Accelerazione verso il basso (px/s^2)
    MAX_FALL_SPEED: 420,       // Velocità terminale di caduta
    MOVE_ACCEL: 900,           // Accelerazione orizzontale
    MOVE_DECEL: 800,           // Attrito / decelerazione al rilascio
    MAX_MOVE_SPEED: 130,       // Velocità massima di corsa
    JUMP_FORCE: -290,          // Spinta iniziale del salto
    VARIABLE_JUMP_CUTOFF: 0.5, // Moltiplicatore se il tasto salto viene rilasciato prima
    COYOTE_TIME: 0.1,          // Finestra di tolleranza dopo essere caduti da un bordo (secondi)
    JUMP_BUFFER: 0.12,         // Buffer di pre-pressione del salto prima dell'atterraggio (secondi)
    BULLET_SPEED: 320,         // Velocità proiettile al plasma
    BULLET_LIFETIME: 1.2       // Durata massima del proiettile in secondi
};

// Palette cromatica NeoGeo vibrante (saturazione alta, contrasti forti)
export const PALETTE = {
    CYBER_BLUE: '#00e5ff',
    NEON_GREEN: '#39ff14',
    NEO_YELLOW: '#ffe600',
    HOT_PINK: '#ff007f',
    DANGER_RED: '#ff1744',
    DARK_NAVY: '#0a0d1a',
    STEEL_GRAY: '#2a354b',
    STEEL_LIGHT: '#5d729a',
    STEEL_HIGHLIGHT: '#9bb3de',
    GOLD_GLOW: '#ffb300'
};

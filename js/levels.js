/**
 * TURCLON - Level 1 Map Data (274 x 102 Tiles = 4384 x 1632 px)
 * Struttura autentica in stile Turrican: esplorazione non-lineare sia orizzontale che verticale.
 * 
 * Legenda Tile:
 * 0: Vuoto (Aria)
 * 1: Blocco metallico solido
 * 2: Piattaforma passabile dal basso (One-way)
 * 3: Spuntoni / Pericolo mortale (Hazard)
 * 4: Cassa cyber distruttibile (Crate)
 * 5: Spawn del Giocatore
 * 6: Spawn Nemico drone deambulatore
 * 7: Traguardo / Portale di fine livello
 * 8: Ricarica energia vitale
 */

export function createLevel1() {
    const W = 274;
    const H = 102;
    const map = Array.from({ length: H }, () => Array(W).fill(0));

    // -------------------------------------------------------------
    // BORDI DI CONFINE DEL LIVELLO
    // -------------------------------------------------------------
    for (let r = 0; r < H; r++) {
        map[r][0] = 1;
        map[r][W - 1] = 1;
    }
    for (let c = 0; c < W; c++) {
        map[0][c] = 1;         // Soffitto globale
        map[H - 1][c] = 3;     // Fondo mortale con acido/laser continuo a quota 101
    }

    // Helper per riempire blocchi rettangolari
    const fillRect = (x, y, w, h, tile) => {
        for (let r = y; r < y + h && r < H; r++) {
            for (let c = x; c < x + w && c < W; c++) {
                if (r >= 0 && c >= 0) map[r][c] = tile;
            }
        }
    };

    // -------------------------------------------------------------
    // ZONA 1: SUPERFICIE E BASE DI LANCIO (Y: 20 - 45, X: 1 - 70)
    // -------------------------------------------------------------
    // Terreno principale della superficie a quota Y=35
    fillRect(1, 35, 65, 3, 1);

    // Spawn Giocatore alla base
    map[34][5] = 5;

    // Casse iniziali e piattaforme sopraelevate
    map[34][10] = 4;
    map[33][10] = 4;
    fillRect(14, 30, 6, 1, 2); // Piattaforma semi-solida
    map[29][17] = 8;           // Energia

    // Primo drone di pattuglia
    map[34][22] = 6;

    // Torretta di vedetta (struttura verticale alta)
    fillRect(28, 20, 4, 15, 1);
    fillRect(25, 20, 10, 1, 2); // Piattaforma in cima alla torre
    map[19][26] = 8;
    map[19][32] = 6; // Cecchino / pattuglia sulla torre

    // Serie di piattaforme aeree tra le nuvole
    fillRect(38, 22, 5, 1, 2);
    fillRect(48, 25, 5, 1, 2);
    fillRect(58, 28, 5, 1, 2);
    map[27][60] = 6;

    // Gradoni di discesa verso il grande pozzo minerario
    fillRect(66, 36, 6, 2, 1);
    fillRect(72, 38, 6, 2, 1);

    // -------------------------------------------------------------
    // ZONA 2: IL GRANDE POZZO MINERARIO VERTICALE (Y: 35 - 85, X: 78 - 110)
    // Discesa profonda nelle viscere del pianeta
    // -------------------------------------------------------------
    // Parete sinistra del pozzo
    fillRect(78, 38, 3, 48, 1);
    // Parete destra del pozzo
    fillRect(108, 35, 3, 51, 1);

    // Piattaforme sospese a zigzag lungo la caduta del pozzo
    for (let y = 42; y < 82; y += 7) {
        const isLeft = (y / 7) % 2 === 0;
        const platX = isLeft ? 82 : 98;
        fillRect(platX, y, 8, 1, 2);

        // Nemici e bonus alternati
        if (isLeft) {
            map[y - 1][platX + 4] = 6;
        } else {
            map[y - 1][platX + 4] = 4;
            if (y === 63) map[y - 1][platX + 2] = 8;
        }
    }

    // Fondo del pozzo con spuntoni e passerella
    fillRect(81, 85, 27, 2, 1);
    map[84][94] = 6;

    // -------------------------------------------------------------
    // ZONA 3: LABIRINTO CIBERNETICO SOTTERRANEO (Y: 65 - 95, X: 109 - 190)
    // Cunicoli profondi con casse, piattaforme e pericoli
    // -------------------------------------------------------------
    // Tunnel orizzontale inferiore a quota Y=85
    fillRect(111, 85, 45, 2, 1);
    fillRect(111, 75, 40, 2, 1); // Soffitto del tunnel inferiore

    // Nemici nel corridoio buio
    map[84][120] = 6;
    map[84][135] = 6;
    map[84][145] = 4;
    map[83][145] = 4;

    // Camera segreta inferiore con scorta di capsule energetiche
    fillRect(125, 90, 12, 1, 2);
    map[89][128] = 8;
    map[89][131] = 8;

    // Risalita verticale verso il complesso dei generatori (X: 156 - 170)
    fillRect(156, 60, 3, 27, 1);
    fillRect(172, 55, 3, 32, 1);

    // Piattaforme per scalare verso l'alto
    for (let y = 80; y >= 58; y -= 6) {
        fillRect(160, y, 11, 1, 2);
        if (y === 74 || y === 62) {
            map[y - 1][165] = 6;
        }
    }

    // Sala dei Generatori (Y: 50 - 58, X: 173 - 215)
    fillRect(173, 58, 42, 2, 1);
    // Generatori metallici al plasma
    fillRect(182, 52, 4, 6, 1);
    fillRect(194, 52, 4, 6, 1);
    fillRect(206, 52, 4, 6, 1);

    map[57][188] = 6;
    map[57][200] = 6;
    map[51][184] = 8;

    // Burrone con spuntoni energetici nella sala generatori
    fillRect(188, 59, 4, 1, 3);
    fillRect(200, 59, 4, 1, 3);

    // -------------------------------------------------------------
    // ZONA 4: IL GRANDE PONTE SOSPESO E IL SANTUARIO D'ESTRAZIONE (Y: 25 - 65, X: 215 - 273)
    // Ritorno in superficie verso il portale di fine livello
    // -------------------------------------------------------------
    // Rampa ascensionale a gradoni verso la superficie
    fillRect(215, 55, 6, 2, 1);
    fillRect(222, 50, 6, 2, 1);
    fillRect(229, 45, 6, 2, 1);
    fillRect(236, 40, 6, 2, 1);

    // Grande Viadotto Sospeso a quota Y=35 (lungo 28 colonne)
    fillRect(242, 35, 28, 2, 1);

    // Piloni di supporto del ponte
    fillRect(248, 37, 3, 25, 1);
    fillRect(262, 37, 3, 25, 1);

    // Pattuglie d'élite a difesa del ponte finale
    map[34][245] = 6;
    map[34][254] = 6;
    map[34][263] = 6;

    // Blocchi di difesa e rifornimento finale
    map[34][250] = 4;
    map[33][250] = 4;
    map[32][250] = 8; // Ricarica vita prima del portale

    // Terrazza del Portale d'Estrazione (Warp Gate) a quota Y=33
    fillRect(265, 33, 7, 2, 1);
    map[32][268] = 7; // PORTALE TRAGUARDO FINALE

    return {
        name: "SECTOR 01 - CYBER PLANET (274x102 TURRICAN SCALE)",
        width: W,
        height: H,
        data: map
    };
}

export const LEVEL_1 = createLevel1();

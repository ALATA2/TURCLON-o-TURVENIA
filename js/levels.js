/**
 * TURCLON - Level 1 Map Data
 * Matrice del livello di default con spawn, piattaforme, nemici e portale di fine livello.
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

// Creazione strutturata di un livello lungo 100 colonne e alto 14 righe (16px per tile = 224px)
function createLevel1() {
    const W = 100;
    const H = 14;
    const map = Array.from({ length: H }, () => Array(W).fill(0));

    // Pavimento solido di base (riga 12 e 13) con interruzioni per burroni/spuntoni
    for (let c = 0; c < W; c++) {
        // Creazione burroni con spuntoni
        if ((c >= 22 && c <= 25) || (c >= 48 && c <= 52) || (c >= 74 && c <= 77)) {
            map[13][c] = 3; // Spuntoni sul fondo
        } else {
            map[12][c] = 1;
            map[13][c] = 1;
        }
    }

    // Muri di confine sinistro e destro
    for (let r = 0; r < H; r++) {
        map[r][0] = 1;
        map[r][W - 1] = 1;
    }

    // -------------------------------------------------------------
    // SEZIONE 1: ZONA DI LANCIO E INTRODUZIONE (colonne 1 - 20)
    // -------------------------------------------------------------
    map[11][3] = 5; // Spawn Giocatore

    // Casse cibernetiche
    map[11][7] = 4;
    map[10][7] = 4;

    // Piattaforme semi-solide per salti
    map[9][10] = 2; map[9][11] = 2; map[9][12] = 2;
    map[6][14] = 2; map[6][15] = 2; map[6][16] = 2;

    // Ricarica energia in alto
    map[5][15] = 8;

    // Primo nemico di pattuglia
    map[11][17] = 6;

    // -------------------------------------------------------------
    // SEZIONE 2: IL PRIMO BURRONE E SALTO SOPRA I LASER (colonne 21 - 38)
    // -------------------------------------------------------------
    // Piattaforma sospesa sopra il burrone
    map[9][23] = 2; map[9][24] = 2;

    // Piattaforma elevata con solido
    map[10][28] = 1; map[10][29] = 1; map[10][30] = 1;
    map[9][29] = 6; // Secondo nemico

    // Casse da sfondare sparando
    map[11][33] = 4;
    map[11][34] = 4;

    // Piattaforme multilivello
    map[8][35] = 2; map[8][36] = 2; map[8][37] = 2;
    map[5][32] = 2; map[5][33] = 2;
    map[4][33] = 8; // Energia segreta

    // -------------------------------------------------------------
    // SEZIONE 3: ZONA INDUSTRIALE CON DOPPIO PATTIUGLIAMENTO (colonne 39 - 65)
    // -------------------------------------------------------------
    map[11][42] = 6; // Nemico a terra

    // Struttura a gradoni solidi
    map[11][44] = 1;
    map[10][45] = 1;
    map[9][46] = 1;

    // Attraversamento grande burrone (colonne 48-52)
    map[8][49] = 2; map[8][50] = 2;
    map[6][51] = 2; map[6][52] = 2;

    map[9][55] = 1; map[9][56] = 1; map[9][57] = 1; map[9][58] = 1;
    map[8][56] = 6; // Nemico sopra la passerella metallica

    map[11][62] = 4;
    map[11][63] = 6; // Nemico prima della barriera

    // -------------------------------------------------------------
    // SEZIONE 4: CAMMINO FINALE VERSO L'ESTRAZIONE (colonne 66 - 99)
    // -------------------------------------------------------------
    map[9][68] = 2; map[9][69] = 2; map[9][70] = 2;
    map[7][72] = 2; map[7][73] = 2;

    // Piattaforma sopra l'ultimo burrone
    map[8][75] = 1; map[8][76] = 1;

    map[11][80] = 6;
    map[11][84] = 4;
    map[10][84] = 4;
    map[9][84] = 4;

    map[7][86] = 2; map[7][87] = 2; map[7][88] = 2;
    map[6][87] = 8; // Ricarica prima dell'uscita

    map[11][91] = 6;

    // PORTALE DI FINE LIVELLO (WARP GATE)
    map[10][95] = 7;

    return {
        name: "SECTOR 01 - CYBER OUTPOST",
        width: W,
        height: H,
        data: map
    };
}

export const LEVEL_1 = createLevel1();

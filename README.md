# TURCLON (o TURVENIA) — 16-Bit Neo-Geo Run 'n' Gun Engine & Level Lab

Prototipo giocabile del primo livello di un videogioco platformer / run 'n' gun ispirato a pietre miliari come *Turrican* e *Metroid*, con estetica arcade 16-bit dell'era Neo-Geo (palette cromatiche sature, parallasse multi-strato, audio sintetizzato e sprite ad alta definizione).

Sviluppato interamente in **HTML5 Canvas** e **Vanilla JavaScript puro** (nessun framework pesante o dipendenza esterna).

---

## 🚀 Caratteristiche Principali

### 1. Il Gioco (`index.html`)
- **Risoluzione Retro Pixel-Perfect**: Buffer virtuale 16:9 a **384x216** scalato dinamicamente mantenendo pixel nitidi (`image-rendering: pixelated`).
- **Sfondo Parallasse a 4 Strati**:
  - *Layer 0*: Cielo cosmico con stella cadente, gradiente al neon e luna aliena gigante.
  - *Layer 1*: Skyline cibernetica di grattacieli con luci di segnalazione rosse intermittenti sulle antenne.
  - *Layer 2*: Travi industriali e condotti metallici con indicatori al plasma pulsanti.
  - *Layer 3*: Livello giocabile metallico con piastre corazzate e rivetti.
- **Sprite 16-Bit Procedurali**:
  - Commando cibernetico armato di cannone al plasma con rinculo, vampa di sparo (*muzzle flash*), animazione di falcata e salto.
  - Drone deambulatore corazzato con zampe meccaniche animate e occhio sensore laser.
  - Portale di estrazione / Warp gate animato con anelli energetici rotanti.
- **Audio Sintetizzato Nativo (Web Audio API)**:
  - Effetti sonori stile arcade a zero file esterni (laser shot con sweep rapido, jump boing, crash di atterraggio, impatto metallico, distruzione nemico con rumore bianco, fanfara vittoria).
- **Fisica Fluida & Meccaniche**:
  - Gravità modulare con taglio dell'altezza del salto al rilascio del tasto (*variable jump height*).
  - *Coyote Time* e *Jump Buffer* per evitare input persi.
  - Piattaforme passabili dal basso (One-Way) con possibilità di scendere premendo **Giù + Salto**.
  - Casse cyber distruggibili a colpi di cannone.
- **Cross-Platform**:
  - **Desktop**: Tastiera (WASD / Frecce per muoversi, Spazio / Z per saltare, X / K per sparare, S / Giù + Salto per scendere dalle piattaforme).
  - **Mobile Touch**: Rilevamento automatico touchscreen con D-Pad virtuale a sinistra e pulsanti d'azione A (Salto) e B (Sparo) a destra con pieno supporto al multitouch contemporaneo.

---

### 2. Il Level Lab / Editor di Livelli (`editor.html`)
Un tool visuale per disegnare nuovi settori o modificare il Settore 01 di fabbrica:
- **Palette Elementi**:
  - `Blocco Solido (1)`: Terreno e pareti corazzate.
  - `Piattaforma (2)`: Piattaforma semi-solida passabile dal basso.
  - `Spuntoni / Laser (3)`: Pericolo letale.
  - `Cassa Cyber (4)`: Blocco distruggibile.
  - `Spawn Giocatore (5)`: Punto di partenza (con unicità automatica garantita).
  - `Nemico Drone (6)`: Posizionamento pattugliatori.
  - `Traguardo Portale (7)`: Portale di estrazione fine livello.
  - `Ricarica Energia (8)`: Capsula di recupero vita.
  - `Gomma (0)`: Rimozione tile.
- **Controlli Intuitivi**:
  - **Click & Trascina Sinistro**: dipinge l'elemento selezionato.
  - **Tasto Destro**: cancella istantaneamente.
  - **Shift + Rotellina**: scorrimento orizzontale rapido.
  - **Zoom 1x / 2x / 3x / 4x** e coordinate colonna/riga in tempo reale.
- **Esportazione & Test Immediato**:
  - **Esporta JSON**: genera il codice del livello per copia o download file `.json`.
  - **Importa JSON**: carica e ricostruisce qualsiasi livello salvato.
  - **▶ GIOCA SUBITO!**: salva il livello in `localStorage` e lo avvia direttamente in gioco (`index.html?custom=true`) in tempo reale!

---

## 📂 Struttura del Repository

```
TURCLON-o-TURVENIA/
├── index.html              # Entry point del gioco
├── style.css               # Stili del gioco, responsive canvas e touch overlay
├── editor.html             # Entry point del Level Lab
├── editor.css              # Stili dell'editor di livelli
├── editor.js               # Logica dell'editor
├── README.md               # Documentazione del progetto
└── js/
    ├── config.js           # Costanti globali, risoluzione, costanti fisiche
    ├── audio.js            # Sintetizzatore Web Audio API
    ├── input.js            # Input manager Desktop & Touch
    ├── particles.js        # Motore di particelle ed esplosioni
    ├── parallax.js         # Motore parallasse a 4 strati
    ├── tilemap.js          # Gestione matrice e collisioni AABB
    ├── entities.js         # Giocatore, Proiettili, Nemici, Portale
    ├── levels.js           # Matrice del Livello 1 (Sector 01)
    └── game.js             # Game loop e logica di gioco
```

---

## 🎮 Come Giocare in Locale

Poiché il gioco utilizza moduli ES standard (`import` / `export`), è sufficiente servire i file tramite un qualsiasi server web statico locale:

### Con Node.js:
```bash
npx serve .
```

### Con Python:
```bash
python -m http.server 8080
```

Poi apri nel browser:
- **Gioco**: `http://localhost:8080/index.html`
- **Editor di Livelli**: `http://localhost:8080/editor.html`

Oppure abilita **GitHub Pages** nelle impostazioni del repository (Source: `main` branch, root `/`) per giocarci direttamente online da qualsiasi dispositivo mobile o desktop!

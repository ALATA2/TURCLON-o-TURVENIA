# TURCLON (o TURVENIA) — 16-Bit Neo-Geo Run 'n' Gun Engine & Level Lab

Prototipo giocabile del primo livello di un videogioco platformer / run 'n' gun ispirato a pietre miliari come *Turrican* e *Metroid*, con estetica arcade 16-bit dell'era Neo-Geo (palette cromatiche sature, parallasse multi-strato 2D, illuminazione dinamica Hi-Bit, audio sintetizzato e sprite ad alta definizione).

Sviluppato interamente in **HTML5 Canvas** e **Vanilla JavaScript puro** (nessun framework pesante o dipendenza esterna).

---

## 🗺️ Dimensioni Autentiche Turrican (274 × 102 Tile)

Il livello non è un semplice corridoio lineare, ma riproduce le proporzioni e l'esplorazione verticale del leggendario *Turrican* originale:
- **Dimensioni totali**: **274 × 102 tile** (pari a **4384 × 1632 pixel** a 16px per tile).
- **Esplorazione Multilivello**: Base di lancio in superficie, torrette sopraelevate, pozzo minerario a caduta verticale (profondo oltre 800 pixel), labirinto industriale sotterraneo, sala generatori al plasma e viadotto sospeso finale.
- **Telecamera 2D con Inseguimento X & Y**: La telecamera segue il giocatore sia negli spostamenti orizzontali che nei salti o cadute verticali profonde, con interpolazione *Lerp* fluida.

---

## 💡 Illuminazione Dinamica Hi-Bit (Neon Glow)

- Effetto **Bloom e Luce Volumetrica 2D** in tempo reale su Canvas:
  - I proiettili al plasma emettono aloni ciano/gialli radiali che illuminano pareti e nemici.
  - La vampa del cannone (*muzzle flash*) e il visore del giocatore emettono fasci luminosi dinamici.
  - Il Portale Warp Gate pulsa con un'aura dorata/magenta avvolgente.
  - Le capsule energetiche e le trappole laser irradiano luce fluorescente al buio.

---

## 🔐 Accesso di Sicurezza (Password Gate)

Il gioco e l'editor sono protetti da un terminale di sicurezza Neo-Geo che richiede la password ad ogni accesso al sito:
- **Codice di Accesso / Password**: `idspispopd`

---

## 🌐 Supporto Multilingua (i18n)

L'interfaccia è interamente tradotta e include un selettore dinamico rapido (`EN` | `IT` | `JA`):
- **English** (Default)
- **Italiano**
- **日本語 (Giapponese)**

---

## 🚀 Caratteristiche Principali

### 1. Il Gioco (`index.html`)
- **Logo Ufficiale**: Logo arcade originale ad alta risoluzione con rendering pixel-perfect e bagliore neon.
- **Risoluzione Retro Pixel-Perfect**: Buffer virtuale 16:9 a **384x216** scalato dinamicamente con `image-rendering: pixelated`.
- **Sfondo Parallasse a 4 Strati Bidirezionale (2D)**:
  - *Layer 0*: Cielo cosmico con stella cadente, gradiente al neon e luna aliena gigante; transizione verso atmosfera cavernosa nelle profondità sotterranee.
  - *Layer 1*: Skyline cibernetica con luci di segnalazione rosse intermittenti sulle antenne (parallasse X e Y).
  - *Layer 2*: Travi industriali e condotti metallici con indicatori al plasma pulsanti.
  - *Layer 3*: Livello giocabile metallico da 274x102 celle con viewport culling a 60 FPS costanti.
- **Audio Sintetizzato Nativo (Web Audio API)**:
  - Effetti sonori arcade a zero file esterni (laser shot con sweep rapido, jump boing, crash di atterraggio, impatto metallico, distruzione nemico con rumore bianco, fanfara vittoria).
- **Fisica Fluida & Meccaniche**:
  - Gravità modulare con taglio dell'altezza del salto al rilascio del tasto (*variable jump height*).
  - *Coyote Time* e *Jump Buffer* per evitare input persi.
  - Piattaforme passabili dal basso (One-Way) con possibilità di scendere premendo **Giù + Salto**.
  - Casse cyber distruggibili a colpi di plasma.
- **Cross-Platform**:
  - **Desktop**: Tastiera (WASD / Frecce per muoversi, Spazio / Z per saltare, X / K per sparare, S / Giù + Salto per scendere dalle piattaforme).
  - **Mobile Touch**: Rilevamento automatico touchscreen con D-Pad virtuale a sinistra e pulsanti d'azione A (Salto) e B (Sparo) a destra con supporto al multitouch contemporaneo.

---

### 2. Il Level Lab / Editor di Livelli (`editor.html`)
Un tool visuale per progettare e collaudare mappe colossali:
- **Viewport Culling ad Alte Prestazioni**: Renderizza istantaneamente solo le celle visibili a schermo; zero lag anche su mappe da oltre 28.000 tile.
- **Zoom a 6 Livelli**: da **0.5x** (panoramica globale) fino a **3x** (editing di precisione).
- **Palette Elementi Completa**: Blocco Solido, Piattaforma passabile, Spuntoni/Laser, Cassa Cyber, Spawn Giocatore, Nemico Drone, Portale Warp Gate, Ricarica Energia e Gomma.
- **Controlli Intuitivi**:
  - **Click & Trascina Sinistro**: dipinge l'elemento selezionato.
  - **Tasto Destro**: cancella istantaneamente.
  - **Shift + Rotellina**: scorrimento orizzontale rapido.
- **Esportazione & Test Immediato**:
  - **Esporta JSON**: genera il codice del livello per copia o download file `.json`.
  - **Importa JSON**: carica e ricostruisce qualsiasi livello salvato.
  - **▶ GIOCA SUBITO!**: salva il livello in `localStorage` e lo avvia direttamente in gioco (`index.html?custom=true`) in tempo reale!

---

## 📂 Struttura del Repository

```
TURCLON-o-TURVENIA/
├── index.html              # Entry point del gioco (con Security Gate & i18n)
├── style.css               # Stili del gioco, responsive canvas, touch overlay e terminale
├── editor.html             # Entry point del Level Lab (supporto 274x102)
├── editor.css              # Stili dell'editor di livelli
├── editor.js               # Logica dell'editor (viewport culling a 60fps)
├── README.md               # Documentazione del progetto
├── assets/
│   ├── logo.png            # Immagine logo originale
│   └── logo_cropped.png    # Immagine logo trasparente ottimizzata
└── js/
    ├── config.js           # Costanti globali, risoluzione, costanti fisiche
    ├── audio.js            # Sintetizzatore Web Audio API
    ├── auth.js             # Terminale di autenticazione password idspispopd
    ├── i18n.js             # Modulo internazionalizzazione (EN, IT, JA)
    ├── input.js            # Input manager Desktop & Touch
    ├── particles.js        # Motore di particelle ed esplosioni
    ├── parallax.js         # Motore parallasse 2D a 4 strati
    ├── tilemap.js          # Gestione matrice e collisioni AABB
    ├── entities.js         # Giocatore, Proiettili, Nemici, Portale
    ├── levels.js           # Matrice autentica Turrican (274x102 = 4384x1632 px)
    └── game.js             # Game loop, telecamera 2D fluida e illuminazione Hi-Bit
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

All'apertura inserisci la password: **`idspispopd`** per sbloccare il sistema.

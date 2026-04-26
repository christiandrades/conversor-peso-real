# Tetris Retro

> Retro Tetris with colorful neon aesthetics and the exclusive **Prisma Pulse** feature.  
> Built with Angular · © 2026 Christian Andrade & KrDevs

---

## Features

- Classic Tetris gameplay (7 tetrominoes, wall kick, ghost piece, hold)
- Retro CRT scanline aesthetic with neon block glow
- Progressive speed — each 10 lines advances the level
- **Prisma Pulse** — exclusive mechanic (see below)

### ✦ Prisma Pulse — exclusive feature

Clear lines to fill the **Prisma Meter** (each line = 20 %).  
When the meter reaches 100 % **Prisma Mode** activates for **10 seconds**:

| Effect | Description |
|---|---|
| Rainbow board | The board pulses with a shifting neon halo |
| Prisma Explosion | Every line cleared detonates all same-color blocks on the board for bonus points |
| x2 score | All points earned during Prisma Mode are doubled |

Plan your placements to set up chain explosions for massive scores!

---

## Controls

| Key | Action |
|---|---|
| `← →` | Move piece |
| `↑` | Rotate |
| `↓` | Soft drop |
| `Space` | Hard drop |
| `C` | Hold piece |
| `P` | Pause / Resume |
| `Enter` | Restart (game over screen) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- Angular CLI 19+

```bash
npm install -g @angular/cli
```

### Install & Run

```bash
git clone https://github.com/christiandrades/tetris-retro.git
cd tetris-retro
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

### Production Build

```bash
ng build --configuration production
```

Static files are output to `dist/tetris-retro/browser/`. Serve with any static host (Nginx, GitHub Pages, Netlify, Vercel, etc.).

---

## Project Structure

```
src/
└── app/
    ├── game/
    │   ├── game.component.ts     # Game logic, rendering, Prisma Pulse
    │   ├── game.component.html   # Template
    │   └── game.component.scss   # Neon retro styles
    ├── app.ts                    # Root component
    ├── app.html
    └── app.scss
```

---

## License

[MIT](./LICENSE) © 2026 Christian Andrade & KrDevs

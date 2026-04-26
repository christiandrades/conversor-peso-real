import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Board dimensions and block pixel size
const COLS  = 10;
const ROWS  = 20;
const BLOCK = 32;

// Neon colors for each tetromino type (I O T S Z J L)
const COLORS = [
  '#00f0f0', '#f0f000', '#a000f0',
  '#00f000', '#f00000', '#0000f0', '#f0a000',
];

// Tetromino shapes indexed by [type][rotation]
const SHAPES: number[][][][] = [
  // I
  [[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
   [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
   [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
   [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]],
  // O
  [[[1,1],[1,1]]],
  // T
  [[[0,1,0],[1,1,1],[0,0,0]],[[0,1,0],[0,1,1],[0,1,0]],
   [[0,0,0],[1,1,1],[0,1,0]],[[0,1,0],[1,1,0],[0,1,0]]],
  // S
  [[[0,1,1],[1,1,0],[0,0,0]],[[0,1,0],[0,1,1],[0,0,1]],
   [[0,0,0],[0,1,1],[1,1,0]],[[1,0,0],[1,1,0],[0,1,0]]],
  // Z
  [[[1,1,0],[0,1,1],[0,0,0]],[[0,0,1],[0,1,1],[0,1,0]],
   [[0,0,0],[1,1,0],[0,1,1]],[[0,1,0],[1,1,0],[1,0,0]]],
  // J
  [[[1,0,0],[1,1,1],[0,0,0]],[[0,1,1],[0,1,0],[0,1,0]],
   [[0,0,0],[1,1,1],[0,0,1]],[[0,1,0],[0,1,0],[1,1,0]]],
  // L
  [[[0,0,1],[1,1,1],[0,0,0]],[[0,1,0],[0,1,0],[0,1,1]],
   [[0,0,0],[1,1,1],[1,0,0]],[[1,1,0],[0,1,0],[0,1,0]]],
];

class Piece {
  type:     number;
  rotation: number = 0;
  x:        number = 3;
  y:        number = 0;

  constructor(type: number) { this.type = type; }

  get shape(): number[][] {
    return SHAPES[this.type][this.rotation % SHAPES[this.type].length];
  }
  get color(): string { return COLORS[this.type]; }
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('nextCanvas', { static: true }) nextRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('holdCanvas', { static: true }) holdRef!:   ElementRef<HTMLCanvasElement>;

  private ctx!:     CanvasRenderingContext2D;
  private nextCtx!: CanvasRenderingContext2D;
  private holdCtx!: CanvasRenderingContext2D;

  board:   (string | null)[][] = [];
  current!: Piece;
  next!:    Piece;
  held:     Piece | null = null;
  canHold = true;

  score = 0;
  lines = 0;
  level = 1;

  // ── Prisma Pulse state ────────────────────────────────────────────────────
  // Unique feature: clearing lines fills a meter; when full, Prisma Mode
  // activates for 10 s — board pulses with rainbow neon and every line clear
  // detonates all same-color blocks remaining on the board for bonus points.
  prismaProgress = 0;   // 0–100 %
  prismaActive   = false;
  prismaTimeLeft = 0;
  // ─────────────────────────────────────────────────────────────────────────

  gameOver = false;
  paused   = false;

  private animFrame!:   number;
  private prismaTimer!: ReturnType<typeof setInterval>;
  private dropDelay  = 1000;
  private dropCounter = 0;
  private lastTime    = 0;

  ngOnInit(): void {
    this.ctx     = this.canvasRef.nativeElement.getContext('2d')!;
    this.nextCtx = this.nextRef.nativeElement.getContext('2d')!;
    this.holdCtx = this.holdRef.nativeElement.getContext('2d')!;
    this.restart();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrame);
    clearInterval(this.prismaTimer);
  }

  // ── Board helpers ─────────────────────────────────────────────────────────

  /** Reset board to empty cells */
  private initBoard(): void {
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  /** Place next piece at top; game over when collision occurs immediately */
  private spawn(): void {
    this.current = this.next;
    this.current.x = Math.floor(COLS / 2) - Math.floor(this.current.shape[0].length / 2);
    this.current.y = 0;
    this.next    = new Piece(Math.floor(Math.random() * 7));
    this.canHold = true;
    if (this.collides(this.current, 0, 0)) this.gameOver = true;
  }

  /** True when piece + offset would overlap wall, floor or locked cell */
  private collides(p: Piece, dx: number, dy: number, rot?: number): boolean {
    const shape = rot !== undefined
      ? SHAPES[p.type][rot % SHAPES[p.type].length]
      : p.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = p.x + c + dx;
        const ny = p.y + r + dy;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && this.board[ny][nx])       return true;
      }
    }
    return false;
  }

  /** Paint current piece onto board, clear lines, spawn next */
  private lock(): void {
    for (let r = 0; r < this.current.shape.length; r++) {
      for (let c = 0; c < this.current.shape[r].length; c++) {
        if (!this.current.shape[r][c]) continue;
        const y = this.current.y + r;
        const x = this.current.x + c;
        if (y >= 0) this.board[y][x] = this.current.color;
      }
    }
    this.clearLines();
    this.spawn();
  }

  /** Remove completed rows, update score/level, feed Prisma meter */
  private clearLines(): void {
    const cleared: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every(c => c !== null)) cleared.push(r);
    }
    if (!cleared.length) return;

    // Prisma Explosion fires before rows are removed
    if (this.prismaActive) this.prismaExplosion(cleared);

    for (const r of cleared) {
      this.board.splice(r, 1);
      this.board.unshift(Array(COLS).fill(null));
    }

    const base = [0, 100, 300, 500, 800];
    this.score += (base[cleared.length] ?? 800) * this.level * (this.prismaActive ? 2 : 1);
    this.lines += cleared.length;
    this.level  = Math.floor(this.lines / 10) + 1;
    this.dropDelay = Math.max(100, 1000 - (this.level - 1) * 90);

    // Each line cleared adds 20 % to the Prisma Meter
    if (!this.prismaActive) {
      this.prismaProgress = Math.min(100, this.prismaProgress + cleared.length * 20);
      if (this.prismaProgress >= 100) this.activatePrisma();
    }
  }

  // ── Prisma Pulse ──────────────────────────────────────────────────────────

  /** Start 10-second Prisma Mode */
  private activatePrisma(): void {
    this.prismaActive   = true;
    this.prismaTimeLeft = 10;
    this.prismaProgress = 0;
    this.prismaTimer = setInterval(() => {
      if (--this.prismaTimeLeft <= 0) {
        this.prismaActive = false;
        clearInterval(this.prismaTimer);
      }
    }, 1000);
  }

  /**
   * Prisma Explosion: find the dominant color in cleared rows and remove
   * every cell of that color still on the board, awarding 50 pts each.
   */
  private prismaExplosion(clearedRows: number[]): void {
    const freq: Record<string, number> = {};
    for (const r of clearedRows) {
      for (const cell of this.board[r]) {
        if (cell) freq[cell] = (freq[cell] ?? 0) + 1;
      }
    }
    const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!dominant) return;

    let bonus = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.board[r][c] === dominant) { this.board[r][c] = null; bonus += 50; }
      }
    }
    this.score += bonus * this.level;
  }

  // ── Input ─────────────────────────────────────────────────────────────────

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.gameOver) { if (e.key === 'Enter') this.restart(); return; }
    if (e.key === 'p' || e.key === 'P') { this.paused = !this.paused; return; }
    if (this.paused) return;

    switch (e.key) {
      case 'ArrowLeft':  if (!this.collides(this.current, -1, 0)) this.current.x--; break;
      case 'ArrowRight': if (!this.collides(this.current,  1, 0)) this.current.x++; break;
      case 'ArrowDown':
        if (!this.collides(this.current, 0, 1)) this.current.y++;
        else this.lock();
        break;
      case 'ArrowUp': this.rotate(); break;
      case ' ':       this.hardDrop(); break;
      case 'c': case 'C': this.hold(); break;
    }
    e.preventDefault();
  }

  /** Rotate with single-cell wall kick */
  private rotate(): void {
    const next = (this.current.rotation + 1) % SHAPES[this.current.type].length;
    if      (!this.collides(this.current,  0, 0, next)) { this.current.rotation = next; }
    else if (!this.collides(this.current,  1, 0, next)) { this.current.x++; this.current.rotation = next; }
    else if (!this.collides(this.current, -1, 0, next)) { this.current.x--; this.current.rotation = next; }
  }

  /** Instantly drop piece to lowest valid row */
  private hardDrop(): void {
    while (!this.collides(this.current, 0, 1)) this.current.y++;
    this.lock();
  }

  /** Swap current piece with held slot */
  private hold(): void {
    if (!this.canHold) return;
    if (!this.held) {
      this.held = this.current;
      this.spawn();
    } else {
      [this.current, this.held] = [this.held, this.current];
      this.current.x        = Math.floor(COLS / 2) - Math.floor(this.current.shape[0].length / 2);
      this.current.y        = 0;
      this.current.rotation = 0;
    }
    this.canHold = false;
  }

  /** Y position of ghost (shadow) piece */
  private ghostY(): number {
    let dy = 0;
    while (!this.collides(this.current, 0, dy + 1)) dy++;
    return this.current.y + dy;
  }

  // ── Game lifecycle ────────────────────────────────────────────────────────

  restart(): void {
    clearInterval(this.prismaTimer);
    cancelAnimationFrame(this.animFrame);
    this.score          = 0;
    this.lines          = 0;
    this.level          = 1;
    this.dropDelay      = 1000;
    this.dropCounter    = 0;
    this.lastTime       = 0;
    this.held           = null;
    this.canHold        = true;
    this.gameOver       = false;
    this.paused         = false;
    this.prismaProgress = 0;
    this.prismaActive   = false;
    this.prismaTimeLeft = 0;
    this.initBoard();
    this.next = new Piece(Math.floor(Math.random() * 7));
    this.spawn();
    this.animFrame = requestAnimationFrame(t => this.loop(t));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  /** Main animation loop — advances drop timer and redraws each frame */
  private loop(time: number): void {
    if (!this.gameOver && !this.paused) {
      this.dropCounter += time - this.lastTime;
      if (this.dropCounter >= this.dropDelay) {
        if (!this.collides(this.current, 0, 1)) this.current.y++;
        else this.lock();
        this.dropCounter = 0;
      }
    }
    this.lastTime = time;
    this.draw();
    this.animFrame = requestAnimationFrame(t => this.loop(t));
  }

  /** Full frame render */
  private draw(): void {
    const { ctx } = this;
    ctx.fillStyle = '#080810';
    ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth   = 0.5;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);

    this.drawBoard();
    this.drawGhost();
    this.drawPiece(ctx, this.current, this.current.x, this.current.y);
    this.drawPreviews();

    if (this.prismaActive) this.drawPrismaOverlay();
    if (this.gameOver)     this.drawScreen('GAME OVER', 'ENTER to restart', '#ff0055');
    if (this.paused)       this.drawScreen('PAUSED',    'P to resume',       '#00f0f0');
  }

  /** Draw all locked board cells */
  private drawBoard(): void {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (this.board[r][c]) this.drawBlock(this.ctx, c, r, this.board[r][c]!);
  }

  /** Draw translucent ghost outline showing where the piece will land */
  private drawGhost(): void {
    const gy    = this.ghostY();
    const shape = this.current.shape;
    this.ctx.globalAlpha = 0.25;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        this.ctx.strokeStyle = this.current.color;
        this.ctx.lineWidth   = 1.5;
        this.ctx.strokeRect(
          (this.current.x + c) * BLOCK + 2,
          (gy + r) * BLOCK + 2,
          BLOCK - 4, BLOCK - 4,
        );
      }
    }
    this.ctx.globalAlpha = 1;
  }

  /** Draw a tetromino at board-space coordinates (px, py) */
  private drawPiece(
    ctx: CanvasRenderingContext2D,
    piece: Piece, px: number, py: number,
  ): void {
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c]) this.drawBlock(ctx, px + c, py + r, piece.color);
  }

  /** Draw next-piece and hold-piece previews */
  private drawPreviews(): void {
    for (const [ctx, piece, dim] of [
      [this.nextCtx, this.next,   1] as const,
      [this.holdCtx, this.held,   this.canHold ? 1 : 0.35] as const,
    ]) {
      ctx.fillStyle = '#080810';
      ctx.fillRect(0, 0, 128, 128);
      if (!piece) continue;
      ctx.globalAlpha = dim as number;
      const ox = Math.floor((4 - piece.shape[0].length) / 2);
      const oy = Math.floor((4 - piece.shape.length)    / 2);
      this.drawPiece(ctx, piece, ox, oy);
      ctx.globalAlpha = 1;
    }
  }

  /** One neon block with highlight bevel and glow */
  private drawBlock(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, color: string,
  ): void {
    const x = cx * BLOCK + 1;
    const y = cy * BLOCK + 1;
    const s = BLOCK - 2;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, s, s);

    // Bevel highlight
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(x, y, s, 4);
    ctx.fillRect(x, y, 4, s);

    // Neon glow pass
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = color;
    ctx.fillRect(x, y, s, s);
    ctx.shadowBlur  = 0;
  }

  /** Rainbow pulsing overlay rendered during Prisma Mode */
  private drawPrismaOverlay(): void {
    const hue   = (Date.now() / 18) % 360;
    const pulse = 0.07 + Math.abs(Math.sin(Date.now() / 350)) * 0.07;
    this.ctx.fillStyle = `hsla(${hue},100%,60%,${pulse})`;
    this.ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK);

    this.ctx.strokeStyle = `hsl(${hue},100%,65%)`;
    this.ctx.lineWidth   = 3;
    this.ctx.shadowColor = `hsl(${hue},100%,65%)`;
    this.ctx.shadowBlur  = 20;
    this.ctx.strokeRect(2, 2, COLS * BLOCK - 4, ROWS * BLOCK - 4);
    this.ctx.shadowBlur  = 0;
  }

  /** Generic fullscreen overlay (game over / paused) */
  private drawScreen(title: string, sub: string, color: string): void {
    const W = COLS * BLOCK;
    const H = ROWS * BLOCK;
    this.ctx.fillStyle = 'rgba(0,0,0,0.72)';
    this.ctx.fillRect(0, 0, W, H);

    this.ctx.textAlign  = 'center';
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur  = 22;
    this.ctx.fillStyle   = color;
    this.ctx.font        = 'bold 26px "Press Start 2P", monospace';
    this.ctx.fillText(title, W / 2, H / 2 - 18);

    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle  = 'rgba(255,255,255,0.7)';
    this.ctx.font       = '9px "Press Start 2P", monospace';
    this.ctx.fillText(sub, W / 2, H / 2 + 22);
  }
}

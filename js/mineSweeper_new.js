/*
 * minesweeper_new.js
 * Minesweeper Game
 * Architecture, lifecycle, and persistence intentionally aligned with game2048_new.js
 *
 * Features:
 * - Difficulty-based grid (easy/normal/hard)
 * - Mine placement with first-click safety
 * - Recursive reveal / flood fill
 * - Flagging
 * - Timer, moves, pause
 * - IndexedDB persistence via GameStorageManager (login-aware)
 * - localStorage fallback for best score
 */

class MinesweeperGame {
  constructor() {
    // ---- Difficulty config ----
    this.config = {
      easy:   { size: 9, mines: 10 },
      normal: { size: 16, mines: 40 },
      hard:   { size: 20, mines: 80 }
    };

    this.difficulty = document.getElementById('difficulty-select').value;
    this.size = this.config[this.difficulty].size;
    this.mineCount = this.config[this.difficulty].mines;

    // ---- Game state ----
    this.grid = [];
    this.revealed = [];
    this.flags = [];
    this.mines = new Set();

    this.moves = 0;
    this.flagCount = 0;
    this.revealedCount = 0;
    this.bestTime = null;

    this.startTime = Date.now();
    this.timer = null;

    this.firstClick = true;
    this.isPaused = false;
    this.isGameOver = false;

    this.gameId = crypto.randomUUID();

    // ---- DOM ----
    this.gridEl = document.getElementById('mine-grid');
    this.minesEl = document.getElementById('remaining-mines');
    this.bestTimeEl = document.getElementById('best-time');
    this.timeEl = document.getElementById('game-time');
    this.flagCountEl = document.getElementById('flag-count');

    this.newGameBtn = document.getElementById('new-game-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.tryAgainBtn = document.getElementById('try-again-btn');
    this.closeModalBtn = document.getElementById('close-modal-btn');

    this.modal = document.getElementById('game-over-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.gameResultEl = document.getElementById('game-result');
    this.finalTimeEl = document.getElementById('final-time');
    this.cellsRevealedEl = document.getElementById('cells-revealed');
    this.finalFlagsEl = document.getElementById('final-flags');

    this.pauseOverlay = document.getElementById('pause-overlay');

    // ---- Storage ----
    try {
      this.storage = typeof GameStorageManager !== 'undefined' ? new GameStorageManager() : null;
    } catch {
      this.storage = null;
    }
    this.userId = null;
    
    // 检测是否为手机端
    this.isMobile = /mobile/i.test(navigator.userAgent);
    this.difficultySelect = document.getElementById('difficulty-select');

    this.init();
  }

  async init() {
    // 手机端限制：只允许 Easy (9x9)
    if (this.isMobile) {
      this.restrictMobileOptions();
    }
    await this.loadUser();
    await this.loadBestScore();
    this.bindEvents();
    this.newGame();
    this.startTimer();
  }
  
  // 手机端限制难度选项
  restrictMobileOptions() {
    // 禁用 normal 和 hard 选项
    const normalOption = this.difficultySelect.querySelector('option[value="normal"]');
    const hardOption = this.difficultySelect.querySelector('option[value="hard"]');
    
    if (normalOption) {
      normalOption.disabled = true;
      normalOption.textContent += ' (PC Only)';
    }
    if (hardOption) {
      hardOption.disabled = true;
      hardOption.textContent += ' (PC Only)';
    }
    
    // 强制使用 easy 难度
    this.difficultySelect.value = 'easy';
    this.difficulty = 'easy';
    this.size = this.config.easy.size;
    this.mineCount = this.config.easy.mines;
  }

  // ---- Storage (2048-style) ----
  async loadUser() {
    if (!this.storage) return;
    try {
      const uid = await this.storage.getCurrentUserId();
      if (uid) this.userId = uid;
    } catch {}
  }

  async loadBestScore() {
    try {
      if (this.storage && this.userId) {
        const records = await this.storage.getUserRecords(this.userId);
        const msRecords = records.filter(r => r.gameType === 'minesweeper' && r.meta?.difficulty === this.difficulty);
        if (msRecords.length) {
          // 扫雷的最佳成绩是最短时间
          const bestTime = Math.min(...msRecords.filter(r => r.result === 'won').map(r => r.duration));
          if (bestTime && bestTime !== Infinity) {
            this.bestTime = bestTime;
            this.bestTimeEl.textContent = this.formatTime(bestTime);
            return;
          }
        }
      }
      const local = localStorage.getItem(`minesweeper_best_time_${this.difficulty}`);
      this.bestTime = local ? parseInt(local, 10) : null;
      this.bestTimeEl.textContent = this.bestTime ? this.formatTime(this.bestTime) : '--:--';
    } catch {
      this.bestTimeEl.textContent = '--:--';
    }
  }

  async saveRecord(result, duration) {
    if (!this.userId) return;
    const record = {
      id: this.gameId,
      userId: this.userId,
      gameType: 'minesweeper',
      timestamp: Date.now(),
      startTime: this.startTime,
      result,
      score: this.score,
      moves: this.moves,
      duration,
      meta: { difficulty: this.difficulty }
    };
    try { await this.storage.saveRecord(record); } catch {}
  }

  // ---- Events ----
  bindEvents() {
    document.getElementById('difficulty-select').addEventListener('change', async e => {
      this.difficulty = e.target.value;
      this.size = this.config[this.difficulty].size;
      this.mineCount = this.config[this.difficulty].mines;
      await this.loadBestScore();
      this.newGame();
    });

    this.newGameBtn.addEventListener('click', () => this.newGame());
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    this.tryAgainBtn.addEventListener('click', () => {
      this.modal.classList.remove('show');
      this.newGame();
    });
    this.closeModalBtn.addEventListener('click', () => {
      this.modal.classList.remove('show');
    });

    document.addEventListener('keydown', e => {
      if (this.isPaused) {
        this.togglePause();
      }
    });

    this.pauseOverlay.addEventListener('click', () => {
      if (this.isPaused) {
        this.togglePause();
      }
    });
  }

  // ---- Game flow ----
  newGame() {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.revealed = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    this.flags = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    this.mines.clear();

    this.moves = 0;
    this.flagCount = 0;
    this.revealedCount = 0;
    this.firstClick = true;
    this.isGameOver = false;
    this.isPaused = false;
    this.startTime = Date.now();
    this.gameId = crypto.randomUUID();

    this.pauseOverlay.classList.remove('show');
    this.modal.classList.remove('show');

    this.updateUI();
    this.render();
    this.startTimer();
  }

  placeMines(safeX, safeY) {
    // 创建安全区域：点击位置及其周围8个格子都不能是地雷
    const safeZone = new Set();
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = safeX + dx;
        const ny = safeY + dy;
        if (nx >= 0 && ny >= 0 && nx < this.size && ny < this.size) {
          safeZone.add(ny * this.size + nx);
        }
      }
    }

    // 放置地雷，避开安全区域
    while (this.mines.size < this.mineCount) {
      const idx = Math.floor(Math.random() * this.size * this.size);
      // 跳过安全区域和已放置的地雷
      if (safeZone.has(idx) || this.mines.has(idx)) continue;
      this.mines.add(idx);
    }

    // 在格子中标记地雷并计算周围数字
    for (const idx of this.mines) {
      const x = idx % this.size;
      const y = Math.floor(idx / this.size);
      this.grid[y][x] = -1;
      this.forEachNeighbor(x, y, (nx, ny) => {
        if (this.grid[ny][nx] !== -1) this.grid[ny][nx]++;
      });
    }
  }

  reveal(x, y) {
    if (this.isGameOver || this.isPaused) return;
    if (this.revealed[y][x] || this.flags[y][x]) return;

    // 第一次点击时生成地图
    if (this.firstClick) {
      this.placeMines(x, y);
      this.firstClick = false;
    }

    this.revealed[y][x] = true;
    this.revealedCount++;
    this.moves++;

    // 踩到地雷，游戏结束
    if (this.grid[y][x] === -1) {
      this.lose();
      return;
    }

    // 如果是空格（周围没有地雷），自动扩散
    if (this.grid[y][x] === 0) {
      this.floodReveal(x, y);
    }

    this.render();

    if (this.checkWin()) this.win();
  }

  // 扩散揭开：空格会自动扩散到相邻的数字格
  floodReveal(x, y) {
    this.forEachNeighbor(x, y, (nx, ny) => {
      // 如果相邻格子未揭开且没有旗帜
      if (!this.revealed[ny][nx] && !this.flags[ny][nx]) {
        this.revealed[ny][nx] = true;
        this.revealedCount++;
        
        // 如果相邻格子也是空格，继续递归扩散
        if (this.grid[ny][nx] === 0) {
          this.floodReveal(nx, ny);
        }
        // 如果是数字格，揭开但不继续扩散（这样空格会扩散到数字边界）
      }
    });
  }

  toggleFlag(x, y) {
    if (this.isGameOver || this.isPaused) return;
    if (this.revealed[y][x]) return;
    
    if (this.flags[y][x]) {
      this.flags[y][x] = false;
      this.flagCount--;
    } else {
      this.flags[y][x] = true;
      this.flagCount++;
    }
    this.render();
  }

  // 双击和弦功能：当数字周围的旗帜数等于数字时，自动翻开其他未翻开的格子
  chordReveal(x, y) {
    if (this.isGameOver || this.isPaused) return;
    
    // 只对已揭开的数字格有效
    if (!this.revealed[y][x]) return;
    if (this.grid[y][x] <= 0) return; // 空格或地雷无效
    
    const number = this.grid[y][x];
    
    // 统计周围的旗帜数量
    let flagCount = 0;
    this.forEachNeighbor(x, y, (nx, ny) => {
      if (this.flags[ny][nx]) flagCount++;
    });
    
    // 旗帜数必须等于数字才能触发
    if (flagCount !== number) return;
    
    // 检查旗帜是否都标记正确，并收集要翻开的格子
    let hasWrongFlag = false;
    const toReveal = [];
    
    this.forEachNeighbor(x, y, (nx, ny) => {
      if (this.flags[ny][nx]) {
        // 如果旗帜标记的位置不是地雷，说明标错了
        if (this.grid[ny][nx] !== -1) {
          hasWrongFlag = true;
        }
      } else if (!this.revealed[ny][nx]) {
        // 未揭开且没有旗帜的格子需要翻开
        toReveal.push({ x: nx, y: ny });
      }
    });
    
    // 如果有错误的旗帜，触发失败
    if (hasWrongFlag) {
      // 找到一个被错误标记的地雷位置来触发失败
      this.forEachNeighbor(x, y, (nx, ny) => {
        if (!this.revealed[ny][nx] && !this.flags[ny][nx] && this.grid[ny][nx] === -1) {
          this.revealed[ny][nx] = true;
          this.revealedCount++;
        }
      });
      this.lose();
      return;
    }
    
    // 翻开所有未翻开的非旗帜格子
    for (const pos of toReveal) {
      if (!this.revealed[pos.y][pos.x]) {
        this.revealed[pos.y][pos.x] = true;
        this.revealedCount++;
        this.moves++;
        
        // 如果翻开的是空格，继续扩散
        if (this.grid[pos.y][pos.x] === 0) {
          this.floodReveal(pos.x, pos.y);
        }
      }
    }
    
    this.render();
    
    if (this.checkWin()) this.win();
  }

  checkWin() {
    let safe = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] !== -1 && this.revealed[y][x]) safe++;
      }
    }
    return safe === this.size * this.size - this.mineCount;
  }

  win() {
    this.isGameOver = true;
    this.stopTimer();
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    
    // 更新最佳时间
    if (!this.bestTime || duration < this.bestTime) {
      this.bestTime = duration;
      this.bestTimeEl.textContent = this.formatTime(duration);
      localStorage.setItem(`minesweeper_best_time_${this.difficulty}`, duration);
    }
    
    this.saveRecord('won', duration);
    this.showModal('🎉 You Win!', 'Won', duration);
  }

  lose() {
    this.isGameOver = true;
    this.stopTimer();
    
    // 显示所有地雷
    for (const idx of this.mines) {
      const x = idx % this.size;
      const y = Math.floor(idx / this.size);
      this.revealed[y][x] = true;
    }
    this.render();
    
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    this.saveRecord('lost', duration);
    this.showModal('💥 Game Over', 'Lost', duration);
  }

  // ---- UI ----
  render() {
    this.gridEl.innerHTML = '';
    this.gridEl.className = `mine-grid size-${this.difficulty}`;

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = document.createElement('div');
        cell.className = 'mine-cell';

        if (this.revealed[y][x]) {
          cell.classList.add('revealed');
          if (this.grid[y][x] === -1) {
            cell.textContent = '💣';
            cell.classList.add('mine');
          } else if (this.grid[y][x] > 0) {
            cell.textContent = this.grid[y][x];
            cell.classList.add(`num-${this.grid[y][x]}`);
          }
        } else if (this.flags[y][x]) {
          cell.textContent = '🚩';
          cell.classList.add('flagged');
        }

        cell.addEventListener('click', () => this.reveal(x, y));
        cell.addEventListener('dblclick', () => this.chordReveal(x, y));
        cell.addEventListener('contextmenu', e => {
          e.preventDefault();
          this.toggleFlag(x, y);
        });

        this.gridEl.appendChild(cell);
      }
    }
    this.updateUI();
  }

  updateUI() {
    this.minesEl.textContent = this.mineCount - this.flagCount;
    this.flagCountEl.textContent = this.flagCount;
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        const t = Math.floor((Date.now() - this.startTime) / 1000);
        this.timeEl.textContent = this.formatTime(t);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseOverlay.classList.toggle('show', this.isPaused);
    this.isPaused ? this.stopTimer() : this.startTimer();
  }

  showModal(title, result, duration) {
    this.modalTitle.textContent = title;
    this.gameResultEl.textContent = result;
    this.finalTimeEl.textContent = this.formatTime(duration);
    this.cellsRevealedEl.textContent = this.revealedCount;
    this.finalFlagsEl.textContent = this.flagCount;
    this.modal.classList.add('show');
  }

  // ---- Utils ----
  forEachNeighbor(x, y, fn) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < this.size && ny < this.size) fn(nx, ny);
      }
    }
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  window.minesweeperGame = new MinesweeperGame();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MinesweeperGame;
}

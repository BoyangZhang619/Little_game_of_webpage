/*
 * klotski_new.js
 * Sliding Puzzle (Klotski) — modeled after the structure of the provided 2048 implementation.
 * Features:
 *  - NxN sliding puzzle (3x3, 4x4, 5x5)
 *  - Move count, timer, pause, shuffle (solvable), undo (limited)
 *  - IndexedDB integration via GameStorageManager when available (same pattern as 2048)
 *  - Save best results per user (best = fewest moves) and save game record after win
 */

class KlotskiGame {
    constructor() {
        // Game state
        this.gridSize = parseInt(document.getElementById('grid-size-select').value || 4, 10);
        this.board = []; // flat array length = gridSize*gridSize, 0 is empty
        this.moves = 0;
        this.bestMoves = null;
        this.startTime = Date.now();
        this.gameTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : this._randomId();

        // Undo history
        this.history = [];
        this.maxHistory = 10;

        // DOM
        this.puzzleGrid = document.getElementById('puzzle-grid');
        this.moveCountEl = document.getElementById('move-count');
        this.bestMovesEl = document.getElementById('best-moves');
        this.gameTimeEl = document.getElementById('game-time');
        this.gridSizeSelect = document.getElementById('grid-size-select');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.pauseOverlay = document.getElementById('pause-overlay');

        // Modal
        this.gameOverModal = document.getElementById('game-over-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.finalMovesEl = document.getElementById('final-moves');
        this.finalTimeEl = document.getElementById('final-time');
        this.finalSizeEl = document.getElementById('final-size');
        this.finalScoreEl = document.getElementById('final-score');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn');

        // Storage
        try {
            if (typeof GameStorageManager !== 'undefined') {
                this.storage = new GameStorageManager();
            } else {
                throw new Error('GameStorageManager not available');
            }
        } catch (e) {
            console.warn('GameStorageManager not available, falling back to localStorage', e);
            this.storage = null;
        }
        this.userId = null; // will be loaded asynchronously

        // Timer
        this.timer = null;

        // Init
        this.init();
    }

    async init() {
        // load user id if possible
        await this._loadCurrentUserId();
        await this._loadBestMoves();
        this._setupEventListeners();
        this._createGridCells();
        this.newGame();
        this._startTimer();
    }

    // ------------ Storage helpers (mirror pattern in 2048) ------------
    async _loadCurrentUserId() {
        try {
            if (this.storage && this.storage.getCurrentUserId) {
                const id = await this.storage.getCurrentUserId();
                if (id) {
                    this.userId = id;
                    console.log('Loaded userId from storage:', id);
                    return;
                }
            }
        } catch (err) {
            console.warn('Could not get current user id:', err);
        }
        this.userId = null;
    }

    isUserLoggedIn() {
        return this.userId !== null;
    }

    async _loadBestMoves() {
        try {
            if (this.storage && this.userId && this.storage.getUserRecords) {
                const records = await this.storage.getUserRecords(this.userId);
                const klotskiRecords = records.filter(r => r.gameType === 'klotski' && r.meta && r.meta.gridSize === `${this.gridSize}x${this.gridSize}`);
                if (klotskiRecords.length) {
                    // best = fewest moves
                    this.bestMoves = Math.min(...klotskiRecords.map(r => r.moves));
                    this.bestMovesEl.textContent = this.bestMoves;
                    console.log('Loaded best moves from IndexedDB:', this.bestMoves);
                    return;
                }
            }
            // fallback to localStorage keyed by grid size
            const key = `klotski_best_moves_${this.gridSize}`;
            const best = localStorage.getItem(key);
            if (best) {
                this.bestMoves = parseInt(best, 10);
                this.bestMovesEl.textContent = this.bestMoves;
                console.log('Loaded best moves from localStorage:', this.bestMoves);
            } else {
                this.bestMovesEl.textContent = '--';
            }
        } catch (err) {
            console.error('Error loading best moves:', err);
        }
    }

    async _saveGameRecord(result, duration) {
        if (!this.isUserLoggedIn()) {
            console.log('Not logged in — record will not be saved to indexedDB. Using localStorage fallback.');
            // Save locally
            try {
                const rec = {
                    id: this.gameId,
                    userId: this.userId,
                    gameType: 'klotski',
                    timestamp: Date.now(),
                    startTime: this.startTime,
                    result: result,
                    moves: this.moves,
                    duration: duration,
                    meta: {
                        gridSize: `${this.gridSize}x${this.gridSize}`
                    }
                };
                const key = 'klotski_records';
                const arr = JSON.parse(localStorage.getItem(key) || '[]');
                arr.push(rec);
                if (arr.length > 100) arr.splice(0, arr.length - 100);
                localStorage.setItem(key, JSON.stringify(arr));
                console.log('Saved klotski record to localStorage');
            } catch (err) {
                console.error('Failed to save local record:', err);
            }
            return;
        }

        try {
            if (this.storage && this.storage.saveRecord) {
                const gameRecord = {
                    id: this.gameId,
                    userId: this.userId,
                    gameType: 'klotski',
                    timestamp: Date.now(),
                    startTime: this.startTime,
                    result: result,
                    moves: this.moves,
                    duration: duration,
                    meta: {
                        gridSize: `${this.gridSize}x${this.gridSize}`
                    }
                };
                const saved = await this.storage.saveRecord(gameRecord);
                if (saved) console.log('Game record saved to indexedDB:', saved);
            }
        } catch (err) {
            console.error('Failed to save game record to indexedDB:', err);
        }
    }

    // ------------ UI & grid setup ------------
    _createGridCells() {
        // create CSS grid structure inside puzzleGrid depending on gridSize
        this.puzzleGrid.innerHTML = '';
        this.puzzleGrid.style.position = 'relative';
        this.puzzleGrid.className = `puzzle-grid size-${this.gridSize}`;

        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            this.puzzleGrid.appendChild(cell);
        }
    }

    _setupEventListeners() {
        // Size change
        this.gridSizeSelect.addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value, 10);
            this._createGridCells();
            this._loadBestMoves();
            this.newGame();
        });

        // Buttons
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.shuffleBtn.addEventListener('click', () => this.shuffle());
        this.pauseBtn.addEventListener('click', () => this.togglePause());

        // Modal buttons
        this.playAgainBtn.addEventListener('click', () => {
            this._hideGameOverModal();
            this.newGame();
        });
        this.closeModalBtn.addEventListener('click', () => this._hideGameOverModal());

        // Click on puzzle grid
        this.puzzleGrid.addEventListener('click', (e) => {
            const tile = e.target.closest('.tile');
            if (!tile) return;
            const index = parseInt(tile.dataset.index, 10);
            this._tryMoveTile(index);
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => this._handleKeyPress(e));

        // Touch (simple swipe -> map to arrow)
        this._setupTouchControls();

        // Prevent arrow keys from scrolling page
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
        });

        // Resize: re-render
        window.addEventListener('resize', () => this._render());
    }

    _setupTouchControls() {
        let sx = 0, sy = 0;
        const min = 30;
        this.puzzleGrid.addEventListener('touchstart', (ev) => {
            const t = ev.touches[0]; sx = t.clientX; sy = t.clientY;
        }, { passive: true });
        this.puzzleGrid.addEventListener('touchend', (ev) => {
            const t = ev.changedTouches[0];
            const dx = t.clientX - sx; const dy = t.clientY - sy;
            if (Math.abs(dx) < min && Math.abs(dy) < min) return;
            if (Math.abs(dx) > Math.abs(dy)) {
                dx > 0 ? this.move('right') : this.move('left');
            } else {
                dy > 0 ? this.move('down') : this.move('up');
            }
        }, { passive: true });
    }

    // ------------ Game lifecycle ------------
    newGame() {
        this._stopTimer();
        this.board = [];
        this.moves = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.startTime = Date.now();
        this.gameId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : this._randomId();
        this.history = [];

        // initialize board solved state then shuffle
        for (let i = 1; i <= this.gridSize * this.gridSize - 1; i++) this.board.push(i);
        this.board.push(0); // empty

        // Immediately shuffle to start
        this.shuffle();

        this._updateMoves();
        this._render();
        this._startTimer();
    }

    shuffle() {
        // Generate random permutation until solvable and not already solved
        let arr;
        do {
            arr = this._randomPermutation(this.gridSize);
        } while (!this._isSolvable(arr) || this._isSolved(arr));
        this.board = arr.slice();
        this.history = [];
        this.moves = 0;
        this._updateMoves();
        this._render();
    }

    // ------------ Movement logic ------------
    _tryMoveTile(tileIndex) {
        if (this.isPaused || this.isGameOver) return;
        const emptyIndex = this.board.indexOf(0);
        const target = tileIndex;
        
        // Get row and column for both clicked tile and empty space
        const targetRow = Math.floor(target / this.gridSize);
        const targetCol = target % this.gridSize;
        const emptyRow = Math.floor(emptyIndex / this.gridSize);
        const emptyCol = emptyIndex % this.gridSize;
        
        // Only allow moves in same row or same column (not diagonal, not same cell)
        if ((targetRow !== emptyRow && targetCol !== emptyCol) || 
            (targetRow === emptyRow && targetCol === emptyCol)) {
            return;
        }
        
        this._saveHistory();
        
        // Move all tiles between clicked tile and empty space
        if (targetCol === emptyCol) {
            // Same column - vertical movement
            const distance = emptyRow - targetRow;
            if (distance < 0) {
                // Empty is above target, slide tiles up
                for (let i = 0; i < Math.abs(distance); i++) {
                    const fromIdx = (emptyRow + i + 1) * this.gridSize + targetCol;
                    const toIdx = (emptyRow + i) * this.gridSize + targetCol;
                    this.board[toIdx] = this.board[fromIdx];
                }
            } else {
                // Empty is below target, slide tiles down
                for (let i = Math.abs(distance); i > 0; i--) {
                    const fromIdx = (targetRow + i - 1) * this.gridSize + targetCol;
                    const toIdx = (targetRow + i) * this.gridSize + targetCol;
                    this.board[toIdx] = this.board[fromIdx];
                }
            }
            // Set clicked position to empty
            this.board[target] = 0;
        } else {
            // Same row - horizontal movement
            const distance = emptyCol - targetCol;
            if (distance < 0) {
                // Empty is to the left of target, slide tiles left
                for (let i = 0; i < Math.abs(distance); i++) {
                    const fromIdx = targetRow * this.gridSize + (emptyCol + i + 1);
                    const toIdx = targetRow * this.gridSize + (emptyCol + i);
                    this.board[toIdx] = this.board[fromIdx];
                }
            } else {
                // Empty is to the right of target, slide tiles right
                for (let i = Math.abs(distance); i > 0; i--) {
                    const fromIdx = targetRow * this.gridSize + (targetCol + i - 1);
                    const toIdx = targetRow * this.gridSize + (targetCol + i);
                    this.board[toIdx] = this.board[fromIdx];
                }
            }
            // Set clicked position to empty
            this.board[target] = 0;
        }
        
        this.moves++;
        this._updateMoves();
        this._render();
        
        // Check win
        if (this._isSolved(this.board)) {
            this._onWin();
        }
    }

    move(direction) {
        if (this.isPaused || this.isGameOver) return false;
        const empty = this.board.indexOf(0);
        const row = Math.floor(empty / this.gridSize);
        const col = empty % this.gridSize;
        let target = null;
        switch (direction) {
            case 'up':
                // move tile from below into empty (slide the bottom-most tile toward empty)
                if (row < this.gridSize - 1) target = (this.gridSize - 1) * this.gridSize + col;
                break;
            case 'down':
                // move tile from above into empty (slide the top-most tile toward empty)
                if (row > 0) target = col;
                break;
            case 'left':
                // move tile from right into empty (slide the right-most tile toward empty)
                if (col < this.gridSize - 1) target = row * this.gridSize + (this.gridSize - 1);
                break;
            case 'right':
                // move tile from left into empty (slide the left-most tile toward empty)
                if (col > 0) target = row * this.gridSize;
                break;
        }
        if (target === null) return false;
        // Use _tryMoveTile to handle the actual movement including multi-tile sliding
        this._tryMoveTile(target);
        return true;
    }

    _handleKeyPress(e) {
        if (this.isPaused) {
            if (e.code !== 'Escape') this.togglePause();
            return;
        }
        if (this.isGameOver) return;
        switch (e.code) {
            case 'ArrowUp': case 'KeyW': this.move('up'); break;
            case 'ArrowDown': case 'KeyS': this.move('down'); break;
            case 'ArrowLeft': case 'KeyA': this.move('left'); break;
            case 'ArrowRight': case 'KeyD': this.move('right'); break;
            case 'Escape': this.togglePause(); break;
            case 'KeyZ':
                if (e.ctrlKey) this.undo();
                break;
        }
    }

    _isAdjacent(i, j) {
        const ri = Math.floor(i / this.gridSize), ci = i % this.gridSize;
        const rj = Math.floor(j / this.gridSize), cj = j % this.gridSize;
        const dr = Math.abs(ri - rj), dc = Math.abs(ci - cj);
        return (dr + dc) === 1;
    }

    _swap(i, j) {
        const t = this.board[i]; this.board[i] = this.board[j]; this.board[j] = t;
    }

    // ------------ Undo/history ------------
    _saveHistory() {
        const snapshot = { board: this.board.slice(), moves: this.moves };
        this.history.push(snapshot);
        if (this.history.length > this.maxHistory) this.history.shift();
    }

    undo() {
        if (this.history.length === 0 || this.isGameOver) return;
        const last = this.history.pop();
        this.board = last.board.slice();
        this.moves = last.moves;
        this._updateMoves();
        this._render();
    }

    // ------------ Win handling ------------
    async _onWin() {
        this.isGameOver = true;
        this._stopTimer();
        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        // Update best moves
        if (this.bestMoves === null || this.moves < this.bestMoves) {
            this.bestMoves = this.moves;
            this.bestMovesEl.textContent = this.bestMoves;
            // Save to localStorage fallback
            const key = `klotski_best_moves_${this.gridSize}`;
            localStorage.setItem(key, this.bestMoves.toString());
        }

        // Save game record
        await this._saveGameRecord('won', duration);

        // Show modal
        this.modalTitle.textContent = '🎉 Congratulations!';
        this.finalMovesEl.textContent = this.moves;
        this.finalTimeEl.textContent = this._formatTime(duration);
        this.finalSizeEl.textContent = `${this.gridSize}×${this.gridSize}`;
        this.finalScoreEl.textContent = Math.max(0, 1000 - this.moves); // arbitrary score metric
        this._showGameOverModal();
    }

    _showGameOverModal() {
        this.gameOverModal.classList.add('show');
    }
    _hideGameOverModal() {
        this.gameOverModal.classList.remove('show');
    }

    // ------------ Timer & UI updates ------------
    _startTimer() {
        this._stopTimer();
        this.timer = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
                this.gameTimeEl.textContent = this._formatTime(this.gameTime);
            }
        }, 1000);
    }
    _stopTimer() {
        if (this.timer) clearInterval(this.timer); this.timer = null;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pauseOverlay.classList.add('show');
            this.pauseBtn.textContent = 'Resume';
            this._stopTimer();
        } else {
            this.pauseOverlay.classList.remove('show');
            this.pauseBtn.textContent = 'Pause';
            this._startTimer();
        }
    }

    _updateMoves() {
        this.moveCountEl.textContent = this.moves;
    }

    _formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // ------------ Rendering ------------
    _render() {
        // Clear puzzle grid, then create tile elements positioned by cell order
        // We'll create grid-cell placeholders (already created in _createGridCells) and fill with tiles
        const cells = Array.from(this.puzzleGrid.querySelectorAll('.grid-cell'));
        if (cells.length !== this.gridSize * this.gridSize) {
            // recreate if mismatch
            this._createGridCells();
        }

        // Clear cells
        for (const c of this.puzzleGrid.querySelectorAll('.grid-cell')) c.innerHTML = '';

        // Create tiles
        for (let i = 0; i < this.board.length; i++) {
            const val = this.board[i];
            if (val === 0) continue; // empty
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = val;
            tile.dataset.index = i;

            // Append to corresponding cell
            const cell = this.puzzleGrid.querySelector(`.grid-cell[data-index='${i}']`);
            if (cell) cell.appendChild(tile);
        }
    }

    // ------------ Utility: permutation, solvability ------------
    _randomPermutation(n) {
        const total = n * n;
        const arr = [];
        for (let i = 1; i <= total - 1; i++) arr.push(i);
        arr.push(0);
        // Fisher-Yates shuffle
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    _inversionCount(array) {
        const a = array.filter(x => x !== 0);
        let inv = 0;
        for (let i = 0; i < a.length; i++) {
            for (let j = i + 1; j < a.length; j++) {
                if (a[i] > a[j]) inv++;
            }
        }
        return inv;
    }

    _isSolvable(array) {
        // Standard solvability rules for sliding puzzle
        const inv = this._inversionCount(array);
        if (this.gridSize % 2 === 1) {
            // odd grid: inversions must be even
            return inv % 2 === 0;
        } else {
            // even grid: blank row counting from bottom (1-based)
            const blankIndex = array.indexOf(0);
            const blankRowFromBottom = this.gridSize - Math.floor(blankIndex / this.gridSize);
            // if blank on even row from bottom, inversions must be odd
            // if blank on odd row from bottom, inversions must be even
            return (blankRowFromBottom % 2 === 0) ? (inv % 2 === 1) : (inv % 2 === 0);
        }
    }

    _isSolved(array) {
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i] !== i + 1) return false;
        }
        return array[array.length - 1] === 0;
    }

    _randomId() { return 'id-' + Math.random().toString(36).slice(2, 10); }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.klotskiGame = new KlotskiGame();
});

// Export for unit tests or Node usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KlotskiGame;
}

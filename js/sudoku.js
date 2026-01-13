/**
 * Sudoku Game - Modern Clean Version
 * With integrated data storage and user progress tracking
 * - Difficulty: easy(4x4), normal(9x9), hard(16x16)
 * - Keyboard: Arrow keys to move selection; direct input (1-9, A-G for 16x16); Backspace/Delete to clear
 * - Mobile only: 5x2 keypad (two-page for 16x16)
 * - Validity checking: strict (block conflicting input), highlight conflicts
 * - Undo, Hint, Pause, New Game, Win modal
 *
 * Compatible with GameStorageManager.js (userId from UserDB; theme is handled by themeManager.js)
 */

class GameSudoku {
    constructor() {
        // Game state
        this.size = 9;            // 4 / 9 / 16
        this.boxSize = 3;         // 2 / 3 / 4
        this.difficulty = 'normal';

        this.solution = [];       // 1D array size*size
        this.puzzle = [];         // current grid, 0 = empty
        this.fixed = [];          // boolean array

        this.selectedIndex = 0;

        this.moves = 0;
        this.mistakes = 0;
        this.hints = 0;

        this.startTime = Date.now();
        this.gameTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameId = crypto.randomUUID();

        // Undo history
        this.gameHistory = [];
        this.maxHistory = 200;

        // Mobile keypad state (for 16x16)
        this.keypadPage = 1; // 1 or 2

        // DOM elements
        this.boardEl = document.getElementById('sudoku-board');
        this.mobileKeypadEl = document.getElementById('mobile-keypad');

        this.gameTimeElement = document.getElementById('game-time');
        this.moveCountElement = document.getElementById('move-count');
        this.mistakeCountElement = document.getElementById('mistake-count');
        this.hintCountElement = document.getElementById('hint-count');
        this.difficultySelect = document.getElementById('difficulty-select');

        // Buttons
        this.newGameBtn = document.getElementById('new-game-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.undoBtn = document.getElementById('undo-btn');
        this.hintBtn = document.getElementById('hint-btn');

        // Modal elements
        this.gameOverModal = document.getElementById('game-over-modal');
        this.pauseOverlay = document.getElementById('pause-overlay');
        this.tryAgainBtn = document.getElementById('try-again-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn');

        // Storage manager
        try {
            if (typeof GameStorageManager !== 'undefined') {
                this.storage = new GameStorageManager();
            } else {
                throw new Error('GameStorageManager not available');
            }
        } catch (error) {
            console.log("GameStorageManager not available, using localStorage fallback");
            this.storage = null;
        }
        this.userId = null; // will load async in init()

        // Timer
        this.gameTimer = null;

        this.init();
    }

    async init() {
        await this.loadCurrentUserId();
        this.setupEventListeners();

        // init game with current select
        const diff = this.difficultySelect?.value || 'normal';
        this.changeDifficulty(diff, /*restart*/ true);
    }

    /**
     * Asynchronously get current logged in userId from UserDB (GameStorageManager)
     */
    async loadCurrentUserId() {
        try {
            if (this.storage) {
                const userId = await this.storage.getCurrentUserId();
                if (userId) {
                    this.userId = userId;
                    console.log("已从 UserDB 获取用户ID:", userId);
                    return;
                }
            }
        } catch (error) {
            console.log("无法从 UserDB 获取用户ID:", error);
        }

        this.userId = null;
        console.log("用户未登录，游戏记录将不会保存");
    }

    isUserLoggedIn() {
        return this.userId !== null;
    }

    // ===== Event Listeners =====
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Buttons
        this.newGameBtn?.addEventListener('click', () => this.newGame());
        this.pauseBtn?.addEventListener('click', () => this.togglePause());
        this.undoBtn?.addEventListener('click', () => this.undo());
        this.hintBtn?.addEventListener('click', () => this.hint());

        // Difficulty change
        this.difficultySelect?.addEventListener('change', (e) => {
            this.changeDifficulty(e.target.value, /*restart*/ true);
        });

        // Modal controls
        this.tryAgainBtn?.addEventListener('click', () => {
            this.hideGameOverModal();
            this.newGame();
        });
        this.closeModalBtn?.addEventListener('click', () => this.hideGameOverModal());

        // Pause overlay click to resume
        this.pauseOverlay?.addEventListener('click', () => this.togglePause());

        // Prevent default scroll for arrow keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        // Resize: rerender keypad (breakpoints)
        window.addEventListener('resize', () => {
            this.renderMobileKeypad();
        });
    }

    handleKeyPress(e) {
        // Resume on any key except Escape behavior is consistent with your 2048
        if (this.isPaused) {
            if (e.code !== 'Escape') {
                this.togglePause();
            }
            return;
        }

        if (this.isGameOver) return;

        switch (e.code) {
            case 'ArrowUp':
                this.moveSelection(-1, 0);
                break;
            case 'ArrowDown':
                this.moveSelection(1, 0);
                break;
            case 'ArrowLeft':
                this.moveSelection(0, -1);
                break;
            case 'ArrowRight':
                this.moveSelection(0, 1);
                break;
            case 'Escape':
                this.togglePause();
                break;
            case 'Backspace':
            case 'Delete':
                this.clearSelected();
                break;
            case 'Tab':
                e.preventDefault();
                this.selectNextEditable(e.shiftKey ? -1 : 1);
                break;
            case 'KeyZ':
                if (e.ctrlKey) this.undo();
                break;
            default: {
                const val = this.keyToValue(e.key);
                if (val !== 0) {
                    this.applyInputValue(val);
                }
                break;
            }
        }
    }

    // ===== Difficulty / Setup =====
    changeDifficulty(newDifficulty, restart = false) {
        this.difficulty = newDifficulty;

        switch (newDifficulty) {
            case 'easy':
                this.size = 4;
                this.boxSize = 2;
                break;
            case 'normal':
                this.size = 9;
                this.boxSize = 3;
                break;
            case 'hard':
                this.size = 16;
                this.boxSize = 4;
                break;
            default:
                this.size = 9;
                this.boxSize = 3;
                this.difficulty = 'normal';
                break;
        }

        this.setupBoardContainer();
        if (restart) this.newGame();
    }

    setupBoardContainer() {
        if (!this.boardEl) return;
        this.boardEl.innerHTML = '';
        this.boardEl.className = `sudoku-board size-${this.size} cursor-game-zone`;

        // better touch handling on board
        this.boardEl.style.touchAction = 'manipulation';
    }

    // ===== New Game =====
    newGame() {
        // Reset game state
        this.solution = [];
        this.puzzle = [];
        this.fixed = [];

        this.moves = 0;
        this.mistakes = 0;
        this.hints = 0;

        this.isPaused = false;
        this.isGameOver = false;

        this.startTime = Date.now();
        this.gameTime = 0;
        this.gameId = crypto.randomUUID();

        this.gameHistory = [];
        this.keypadPage = 1;

        // Generate new puzzle
        this.solution = this.generateSolutionGrid();
        this.puzzle = this.makePuzzleFromSolution(this.solution, this.getRemoveRatioByDifficulty());
        this.fixed = this.puzzle.map(v => v !== 0);

        // Select first non-fixed cell if possible
        this.selectedIndex = this.findFirstSelectableIndex();

        // Update UI
        this.updateHUD();
        this.renderBoard();
        this.updateUndoButton();

        // Start timer
        this.startGameTimer();

        console.log('New Sudoku game started:', this.difficulty, `${this.size}x${this.size}`);
    }

    getRemoveRatioByDifficulty() {
        // you can tweak these
        switch (this.difficulty) {
            case 'easy':   return 0.45; // more clues for 4x4
            case 'normal': return 0.58;
            case 'hard':   return 0.68;
            default:       return 0.58;
        }
    }

    findFirstSelectableIndex() {
        const total = this.size * this.size;
        for (let i = 0; i < total; i++) {
            if (!this.fixed[i]) return i;
        }
        return 0;
    }

    // ===== Generation (pattern + shuffles) =====
    range(n) {
        return Array.from({ length: n }, (_, i) => i);
    }

    shuffled(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    basePattern(r, c) {
        // (r*boxSize + floor(r/boxSize) + c) % size
        return (r * this.boxSize + Math.floor(r / this.boxSize) + c) % this.size;
    }

    generateSolutionGrid() {
        const size = this.size;
        const box = this.boxSize;

        const rBase = this.range(box);

        const rows = [];
        const cols = [];

        // shuffle row bands + rows within each band
        const rowBands = this.shuffled(rBase);
        rowBands.forEach(b => {
            const inBand = this.shuffled(rBase).map(r => b * box + r);
            rows.push(...inBand);
        });

        // shuffle col stacks + cols within each stack
        const colStacks = this.shuffled(rBase);
        colStacks.forEach(s => {
            const inStack = this.shuffled(rBase).map(c => s * box + c);
            cols.push(...inStack);
        });

        // shuffle numbers 1..size
        const nums = this.shuffled(this.range(size)).map(x => x + 1);

        const grid = Array(size * size).fill(0);
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const v = nums[this.basePattern(rows[r], cols[c])];
                grid[r * size + c] = v;
            }
        }
        return grid;
    }

    makePuzzleFromSolution(sol, removeRatio) {
        const p = sol.slice();
        const total = this.size * this.size;
        const removeCount = Math.floor(total * removeRatio);

        const indices = this.shuffled(this.range(total));
        for (let k = 0; k < removeCount; k++) {
            p[indices[k]] = 0;
        }
        return p;
    }

    // ===== Validity / Conflicts =====
    idxToRC(idx) {
        return { r: Math.floor(idx / this.size), c: idx % this.size };
    }

    rcToIdx(r, c) {
        return r * this.size + c;
    }

    hasConflictAt(idx, val, grid) {
        if (val === 0) return false;

        const { r, c } = this.idxToRC(idx);

        // row
        for (let cc = 0; cc < this.size; cc++) {
            const j = this.rcToIdx(r, cc);
            if (j !== idx && grid[j] === val) return true;
        }

        // col
        for (let rr = 0; rr < this.size; rr++) {
            const j = this.rcToIdx(rr, c);
            if (j !== idx && grid[j] === val) return true;
        }

        // box
        const br = Math.floor(r / this.boxSize) * this.boxSize;
        const bc = Math.floor(c / this.boxSize) * this.boxSize;
        for (let rr = br; rr < br + this.boxSize; rr++) {
            for (let cc = bc; cc < bc + this.boxSize; cc++) {
                const j = this.rcToIdx(rr, cc);
                if (j !== idx && grid[j] === val) return true;
            }
        }

        return false;
    }

    computeConflicts(grid) {
        const total = this.size * this.size;
        const conflict = new Array(total).fill(false);

        for (let i = 0; i < total; i++) {
            const v = grid[i];
            if (v === 0) continue;
            if (this.hasConflictAt(i, v, grid)) conflict[i] = true;
        }
        return conflict;
    }

    isSolved() {
        const total = this.size * this.size;
        for (let i = 0; i < total; i++) {
            if (this.puzzle[i] === 0) return false;
            if (this.puzzle[i] !== this.solution[i]) return false;
        }
        return true;
    }

    // ===== Input (Keyboard / Mobile) =====
    valueToLabel(v) {
        if (v === 0) return '';
        if (this.size <= 9) return String(v);

        if (this.size === 16) {
            if (v >= 1 && v <= 9) return String(v);
            return String.fromCharCode('A'.charCodeAt(0) + (v - 10)); // 10..16 => A..G
        }
        return String(v);
    }

    keyToValue(key) {
        if (!key) return 0;
        const up = String(key).toUpperCase();

        // digits
        if (/^[0-9]$/.test(up)) {
            const d = parseInt(up, 10);
            if (this.size === 4) return (d >= 1 && d <= 4) ? d : 0;
            if (this.size === 9) return (d >= 1 && d <= 9) ? d : 0;
            if (this.size === 16) return (d >= 1 && d <= 9) ? d : 0;
        }

        // A..G for 16x16
        if (this.size === 16 && /^[A-G]$/.test(up)) {
            return 10 + (up.charCodeAt(0) - 'A'.charCodeAt(0));
        }

        return 0;
    }

    applyInputValue(val) {
        if (this.isPaused || this.isGameOver) return;
        if (val === 0) return;

        const idx = this.selectedIndex;
        if (this.fixed[idx]) return;
        if (val < 1 || val > this.size) return;

        const prev = this.puzzle[idx];
        if (prev === val) return;

        // Strict validity check: block conflicting input
        const temp = this.puzzle.slice();
        temp[idx] = val;

        if (this.hasConflictAt(idx, val, temp)) {
            this.mistakes++;
            this.updateHUD();
            this.shakeSelectedCell();
            this.renderBoard();
            return;
        }

        // Save state for undo
        this.saveGameState({
            idx,
            prev,
            next: val
        });

        // Commit
        this.puzzle[idx] = val;
        this.moves++;

        this.updateHUD();
        this.renderBoard();
        this.updateUndoButton();

        // Win check
        if (this.isSolved()) {
            this.endGame('won');
        }
    }

    clearSelected() {
        if (this.isPaused || this.isGameOver) return;

        const idx = this.selectedIndex;
        if (this.fixed[idx]) return;

        const prev = this.puzzle[idx];
        if (prev === 0) return;

        this.saveGameState({
            idx,
            prev,
            next: 0
        });

        this.puzzle[idx] = 0;
        this.moves++;

        this.updateHUD();
        this.renderBoard();
        this.updateUndoButton();
    }

    saveGameState(delta) {
        // delta: { idx, prev, next }
        this.gameHistory.push(delta);

        // Limit history size
        if (this.gameHistory.length > this.maxHistory) {
            this.gameHistory.shift();
        }
    }

    undo() {
        if (this.isPaused || this.isGameOver) return;
        if (this.gameHistory.length === 0) return;

        const last = this.gameHistory.pop();
        this.puzzle[last.idx] = last.prev;

        // moves: mimic 2048 behavior (revert the move count)
        this.moves = Math.max(0, this.moves - 1);

        this.updateHUD();
        this.renderBoard();
        this.updateUndoButton();
    }

    updateUndoButton() {
        if (!this.undoBtn) return;
        this.undoBtn.disabled = this.gameHistory.length === 0 || this.isGameOver;
    }

    hint() {
        if (this.isPaused || this.isGameOver) return;

        const idx = this.selectedIndex;
        if (this.fixed[idx]) return;
        if (this.puzzle[idx] !== 0) return;

        const prev = 0;
        const next = this.solution[idx];

        this.saveGameState({ idx, prev, next });

        this.puzzle[idx] = next;
        this.hints++;
        this.moves++;

        this.updateHUD();
        this.renderBoard();
        this.updateUndoButton();

        if (this.isSolved()) {
            this.endGame('won');
        }
    }

    moveSelection(dr, dc) {
        const { r, c } = this.idxToRC(this.selectedIndex);
        const nr = Math.max(0, Math.min(this.size - 1, r + dr));
        const nc = Math.max(0, Math.min(this.size - 1, c + dc));
        this.selectedIndex = this.rcToIdx(nr, nc);
        this.renderBoard();
    }

    selectNextEditable(dir) {
        let i = this.selectedIndex;
        const total = this.size * this.size;
        for (let step = 0; step < total; step++) {
            i = (i + dir + total) % total;
            if (!this.fixed[i]) {
                this.selectedIndex = i;
                this.renderBoard();
                return;
            }
        }
    }

    shakeSelectedCell() {
        const cell = this.boardEl?.querySelector(`.sudoku-cell[data-index="${this.selectedIndex}"]`);
        if (!cell) return;

        cell.classList.remove('error-shake');
        // force reflow
        void cell.offsetWidth;
        cell.classList.add('error-shake');
    }

    // ===== Rendering =====
    renderBoard() {
        if (!this.boardEl) return;

        // Clear existing
        this.boardEl.innerHTML = '';

        const conflicts = this.computeConflicts(this.puzzle);
        const total = this.size * this.size;

        const sel = this.selectedIndex;
        const { r: sr, c: sc } = this.idxToRC(sel);
        const selectedValue = this.puzzle[sel];

        for (let i = 0; i < total; i++) {
            const { r, c } = this.idxToRC(i);

            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.index = String(i);
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');

            const v = this.puzzle[i];
            cell.textContent = this.valueToLabel(v);

            if (this.fixed[i]) cell.classList.add('fixed');

            // subgrid separators
            if (this.shouldAddSubgridRight(c)) cell.classList.add('subgrid-right');
            if (this.shouldAddSubgridBottom(r)) cell.classList.add('subgrid-bottom');

            // selected
            if (i === sel) cell.classList.add('selected');

            // related cells (row/col/box)
            const inSameRow = (r === sr);
            const inSameCol = (c === sc);
            const inSameBox = (Math.floor(r / this.boxSize) === Math.floor(sr / this.boxSize)) &&
                              (Math.floor(c / this.boxSize) === Math.floor(sc / this.boxSize));

            if (i !== sel && (inSameRow || inSameCol || inSameBox)) {
                cell.classList.add('related');
            }

            // same value highlight
            if (selectedValue !== 0 && v === selectedValue) {
                cell.classList.add('same-value');
            }

            // conflicts
            if (conflicts[i]) cell.classList.add('conflict');

            // click select
            cell.addEventListener('click', () => {
                this.selectedIndex = i;
                this.renderBoard();
            });

            this.boardEl.appendChild(cell);
        }

        this.renderMobileKeypad();
    }

    shouldAddSubgridRight(c) {
        return ((c + 1) % this.boxSize === 0) && (c !== this.size - 1);
    }

    shouldAddSubgridBottom(r) {
        return ((r + 1) % this.boxSize === 0) && (r !== this.size - 1);
    }

    // ===== Mobile keypad (5x2, mobile-only via CSS) =====
    renderMobileKeypad() {
        if (!this.mobileKeypadEl) return;

        this.mobileKeypadEl.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'mobile-keypad-grid';

        const buttons = this.getKeypadButtons();
        // ensure exactly 10 slots (5x2)
        while (buttons.length < 10) buttons.push({ label: '', type: 'noop', disabled: true });

        buttons.slice(0, 10).forEach(btn => {
            const b = document.createElement('button');
            b.className = 'keypad-btn';
            b.type = 'button';
            b.textContent = btn.label;

            if (btn.variant === 'secondary') b.classList.add('secondary');
            if (btn.disabled) b.disabled = true;

            b.addEventListener('click', () => {
                if (this.isPaused || this.isGameOver) return;

                if (btn.type === 'value') {
                    const val = this.keyToValue(btn.label);
                    this.applyInputValue(val);
                } else if (btn.type === 'delete') {
                    this.clearSelected();
                } else if (btn.type === 'more') {
                    this.keypadPage = 2;
                    this.renderMobileKeypad();
                } else if (btn.type === 'back') {
                    this.keypadPage = 1;
                    this.renderMobileKeypad();
                } else if (btn.type === 'clearAll') {
                    this.clearAllNonFixed();
                }
            });

            grid.appendChild(b);
        });

        this.mobileKeypadEl.appendChild(grid);
    }

    getKeypadButtons() {
        // 4x4: 1..4 + ⌫
        if (this.size === 4) {
            return [
                { label: '1', type: 'value' },
                { label: '2', type: 'value' },
                { label: '3', type: 'value' },
                { label: '4', type: 'value' },
                { label: '⌫', type: 'delete', variant: 'secondary' },
            ];
        }

        // 9x9: 1..9 + ⌫
        if (this.size === 9) {
            return [
                { label: '1', type: 'value' },
                { label: '2', type: 'value' },
                { label: '3', type: 'value' },
                { label: '4', type: 'value' },
                { label: '5', type: 'value' },
                { label: '6', type: 'value' },
                { label: '7', type: 'value' },
                { label: '8', type: 'value' },
                { label: '9', type: 'value' },
                { label: '⌫', type: 'delete', variant: 'secondary' },
            ];
        }

        // 16x16: two pages, both 5x2
        if (this.size === 16) {
            if (this.keypadPage === 1) {
                return [
                    { label: '1', type: 'value' },
                    { label: '2', type: 'value' },
                    { label: '3', type: 'value' },
                    { label: '4', type: 'value' },
                    { label: '5', type: 'value' },
                    { label: '6', type: 'value' },
                    { label: '7', type: 'value' },
                    { label: '8', type: 'value' },
                    { label: '9', type: 'value' },
                    { label: 'More', type: 'more', variant: 'secondary' },
                ];
            }
            // page 2: A..G + ⌫ + 123 + Clear
            return [
                { label: 'A', type: 'value' },
                { label: 'B', type: 'value' },
                { label: 'C', type: 'value' },
                { label: 'D', type: 'value' },
                { label: 'E', type: 'value' },
                { label: 'F', type: 'value' },
                { label: 'G', type: 'value' },
                { label: '⌫', type: 'delete', variant: 'secondary' },
                { label: '123', type: 'back', variant: 'secondary' },
                { label: 'Clear', type: 'clearAll', variant: 'secondary' },
            ];
        }

        return [];
    }

    clearAllNonFixed() {
        if (this.isPaused || this.isGameOver) return;

        let changed = false;
        const total = this.size * this.size;

        for (let i = 0; i < total; i++) {
            if (!this.fixed[i] && this.puzzle[i] !== 0) {
                this.saveGameState({ idx: i, prev: this.puzzle[i], next: 0 });
                this.puzzle[i] = 0;
                changed = true;
            }
        }

        if (changed) {
            this.moves++;
            this.updateHUD();
            this.renderBoard();
            this.updateUndoButton();
        }
    }

    // ===== Timer / Pause =====
    startGameTimer() {
        this.stopGameTimer();
        this.gameTimer = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
                if (this.gameTimeElement) {
                    this.gameTimeElement.textContent = this.formatTime(this.gameTime);
                }
            }
        }, 1000);
    }

    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.pauseOverlay?.classList.add('show');
            if (this.pauseBtn) this.pauseBtn.textContent = 'Resume';
            this.stopGameTimer();
        } else {
            this.pauseOverlay?.classList.remove('show');
            if (this.pauseBtn) this.pauseBtn.textContent = 'Pause';
            this.startGameTimer();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateHUD() {
        if (this.gameTimeElement) this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        if (this.moveCountElement) this.moveCountElement.textContent = String(this.moves);
        if (this.mistakeCountElement) this.mistakeCountElement.textContent = String(this.mistakes);
        if (this.hintCountElement) this.hintCountElement.textContent = String(this.hints);
    }

    // ===== End Game / Save Record (GameStorageManager compatible) =====
    async endGame(result) {
        this.isGameOver = true;
        this.stopGameTimer();

        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        await this.saveGameRecord(result, duration);

        this.showGameOverModal(result, duration);
    }

    async saveGameRecord(result, duration) {
        // same behavior as 2048: only save when user logged in
        if (!this.isUserLoggedIn()) {
            console.log('用户未登录，游戏记录不会保存到数据库');
            return;
        }

        try {
            const gameRecord = {
                id: this.gameId,
                userId: this.userId,
                gameType: "sudoku",
                timestamp: Date.now(),
                startTime: this.startTime,
                result: result,
                score: this.computeScore(duration),
                duration: duration,
                moves: this.moves,
                difficulty: this.difficulty,
                meta: {
                    gridSize: `${this.size}x${this.size}`,
                    mistakes: this.mistakes,
                    hints: this.hints
                }
            };

            if (this.storage) {
                const savedRecord = await this.storage.saveRecord(gameRecord);
                if (savedRecord) {
                    console.log('Game record saved successfully:', savedRecord);
                } else {
                    console.log('游戏记录未保存（用户可能未登录）');
                }
            } else {
                // Fallback to localStorage - still requires login (consistent with 2048 code)
                const existingRecords = JSON.parse(localStorage.getItem('sudoku_records') || '[]');
                existingRecords.push(gameRecord);
                if (existingRecords.length > 50) {
                    existingRecords.splice(0, existingRecords.length - 50);
                }
                localStorage.setItem('sudoku_records', JSON.stringify(existingRecords));
                console.log('Game record saved to localStorage:', gameRecord);
            }
        } catch (error) {
            console.error('Failed to save game record:', error);
        }
    }

    computeScore(duration) {
        // A simple score model: bigger board -> more base points
        // Lower time/mistakes/hints -> higher score
        const base = (this.size === 4) ? 300 : (this.size === 9 ? 1000 : 2500);
        const timePenalty = Math.floor(duration * (this.size === 16 ? 1.2 : 1.0));
        const mistakePenalty = this.mistakes * 40;
        const hintPenalty = this.hints * 60;

        const raw = base + Math.max(0, base - timePenalty) - mistakePenalty - hintPenalty + Math.max(0, 200 - this.moves);
        return Math.max(0, raw);
    }

    showGameOverModal(result, duration) {
        const modalTitle = document.getElementById('modal-title');
        const finalTime = document.getElementById('final-time');
        const finalMoves = document.getElementById('final-moves');
        const finalMistakes = document.getElementById('final-mistakes');
        const finalHints = document.getElementById('final-hints');

        if (modalTitle) modalTitle.textContent = (result === 'won') ? 'You Win!' : 'Game Over!';
        if (finalTime) finalTime.textContent = this.formatTime(duration);
        if (finalMoves) finalMoves.textContent = String(this.moves);
        if (finalMistakes) finalMistakes.textContent = String(this.mistakes);
        if (finalHints) finalHints.textContent = String(this.hints);

        this.gameOverModal?.classList.add('show');
    }

    hideGameOverModal() {
        this.gameOverModal?.classList.remove('show');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameSudoku();
});

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameSudoku;
}

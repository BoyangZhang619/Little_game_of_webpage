/**
 * 2048 Game - Modern Clean Version
 * With integrated data storage and user progress tracking
 */

class Game2048 {
    constructor() {
        // Game state
        this.grid = [];
        this.gridSize = 4;
        this.score = 0;
        this.bestScore = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.gameTime = 0;
        this.isGameOver = false;
        this.isWon = false;
        this.isPaused = false;
        this.gameId = crypto.randomUUID();
        this.difficulty = 'normal';
        
        // Game history for undo functionality
        this.gameHistory = [];
        this.maxHistory = 5;
        
        // DOM elements
        this.gameGrid = document.getElementById('game-grid');
        this.tileContainer = document.getElementById('tile-container');
        this.currentScoreElement = document.getElementById('current-score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameTimeElement = document.getElementById('game-time');
        this.moveCountElement = document.getElementById('move-count');
        this.difficultySelect = document.getElementById('difficulty-select');
        
        // Buttons
        this.newGameBtn = document.getElementById('new-game-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.undoBtn = document.getElementById('undo-btn');
        
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
        this.userId = null; // 将在 init 中异步获取
        
        // Timer
        this.gameTimer = null;
        
        this.init();
    }
    
    async init() {
        // 异步获取当前登录用户ID
        await this.loadCurrentUserId();
        await this.loadBestScore();
        this.setupEventListeners();
        this.setupGrid();
        this.newGame();
        this.startGameTimer();
    }
    
    /**
     * 异步获取当前登录用户ID
     * 优先从 GameStorageManager 获取 UserDB 中的用户
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
        
        // 用户未登录或获取失败
        this.userId = null;
        console.log("用户未登录，游戏记录将不会保存");
    }
    
    /**
     * 检查用户是否已登录
     * @returns {boolean}
     */
    isUserLoggedIn() {
        return this.userId !== null;
    }
    
    async loadBestScore() {
        try {
            // 只有用户登录时才从 IndexedDB 加载最佳分数
            if (this.storage && this.userId) {
                // Load best score from IndexedDB
                const records = await this.storage.getUserRecords(this.userId);
                const game2048Records = records.filter(r => r.gameType === 'game2048');
                if (game2048Records.length > 0) {
                    this.bestScore = Math.max(...game2048Records.map(r => r.score));
                    this.bestScoreElement.textContent = this.bestScore;
                    console.log("从 IndexedDB 加载最佳分数:", this.bestScore);
                }
            } else {
                // Fallback to localStorage（未登录时使用）
                const bestScore = localStorage.getItem('game2048_best_score');
                if (bestScore) {
                    this.bestScore = parseInt(bestScore);
                    this.bestScoreElement.textContent = this.bestScore;
                    console.log("从 localStorage 加载最佳分数:", this.bestScore);
                }
            }
        } catch (error) {
            console.log("Could not load best score:", error);
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch controls
        this.setupTouchControls();
        
        // Button controls
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.undoBtn.addEventListener('click', () => this.undo());
        
        // Difficulty change
        this.difficultySelect.addEventListener('change', (e) => this.changeDifficulty(e.target.value));
        
        // Modal controls
        this.tryAgainBtn.addEventListener('click', () => {
            this.hideGameOverModal();
            this.newGame();
        });
        
        this.closeModalBtn.addEventListener('click', () => this.hideGameOverModal());
        
        // Pause overlay click to resume
        this.pauseOverlay.addEventListener('click', () => this.togglePause());
        
        // Prevent default for arrow keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateDisplay();
        });
    }
    
    setupTouchControls() {
        let startX, startY;
        const minSwipeDistance = 30;
        
        // 设置 touch-action 防止浏览器默认手势
        this.gameGrid.style.touchAction = 'none';
        
        this.gameGrid.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: false });
        
        this.gameGrid.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.gameGrid.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                startX = null;
                startY = null;
                return;
            }
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
            
            startX = null;
            startY = null;
        }, { passive: false });
    }
    
    handleKeyPress(e) {
        if (this.isPaused) {
            if (e.code !== 'Escape') {
                this.togglePause();
            }
            return;
        }
        
        if (this.isGameOver) return;
        
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.move('up');
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.move('down');
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.move('left');
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.move('right');
                break;
            case 'Escape':
                this.togglePause();
                break;
            case 'KeyZ':
                if (e.ctrlKey) {
                    this.undo();
                }
                break;
        }
    }
    
    changeDifficulty(newDifficulty) {
        this.difficulty = newDifficulty;
        
        // Update grid size
        switch (newDifficulty) {
            case 'easy':
                this.gridSize = 3;
                break;
            case 'normal':
                this.gridSize = 4;
                break;
            case 'hard':
                this.gridSize = 5;
                break;
        }
        
        this.setupGrid();
        this.newGame();
    }
    
    setupGrid() {
        // Clear existing grid
        this.gameGrid.innerHTML = '';
        this.gameGrid.className = `game-grid size-${this.gridSize}`;
        
        // Create grid cells
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gameGrid.appendChild(cell);
        }
    }
    
    newGame() {
        // Reset game state
        this.grid = [];
        this.score = 0;
        this.moves = 0;
        this.isGameOver = false;
        this.isWon = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.gameId = crypto.randomUUID();
        this.gameHistory = [];
        
        // Initialize empty grid
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0;
            }
        }
        
        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();
        
        // Update UI
        this.updateScore();
        this.updateMoves();
        this.updateDisplay();
        this.updateUndoButton();
        
        // Start/restart timer
        this.startGameTimer();
        
        console.log('New game started with grid size:', this.gridSize);
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% chance of 2, 10% chance of 4
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = value;
            return true;
        }
        
        return false;
    }
    
    saveGameState() {
        // Save current state for undo functionality
        const gameState = {
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score,
            moves: this.moves
        };
        
        this.gameHistory.push(gameState);
        
        // Limit history size
        if (this.gameHistory.length > this.maxHistory) {
            this.gameHistory.shift();
        }
        
        this.updateUndoButton();
    }
    
    undo() {
        if (this.gameHistory.length === 0 || this.isGameOver) return;
        
        const previousState = this.gameHistory.pop();
        this.grid = previousState.grid;
        this.score = previousState.score;
        this.moves = previousState.moves;
        
        this.updateScore();
        this.updateMoves();
        this.updateDisplay();
        this.updateUndoButton();
    }
    
    updateUndoButton() {
        this.undoBtn.disabled = this.gameHistory.length === 0 || this.isGameOver;
    }
    
    move(direction) {
        if (this.isGameOver || this.isPaused) return;
        
        // Save current state before moving
        this.saveGameState();
        
        const previousGrid = JSON.parse(JSON.stringify(this.grid));
        let moved = false;
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.moves++;
            this.updateMoves();
            this.updateScore(); // 更新分数显示
            
            // Add new tile
            if (!this.addRandomTile()) {
                // No more empty cells, check for game over
                if (this.isGameOverCondition()) {
                    this.endGame('lost');
                }
            } else {
                // Check for win condition
                if (!this.isWon && this.hasWinCondition()) {
                    this.isWon = true;
                    // Don't end game immediately, let player continue
                    this.showWinMessage();
                }
                
                // 添加新方块后也检查是否游戏结束（棋盘可能已满且无法合并）
                if (this.isGameOverCondition()) {
                    this.endGame('lost');
                }
            }
            
            this.updateDisplay();
        } else {
            // No valid move was made
            // Remove the saved state if no move was made
            this.gameHistory.pop();
            
            // 如果没有任何有效移动，检查游戏是否结束
            if (this.isGameOverCondition()) {
                this.endGame('lost');
            }
        }
        
        this.updateUndoButton();
    }
    
    moveUp() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            
            // Extract non-zero values
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== 0) {
                    column.push(this.grid[row][col]);
                }
            }
            
            // Merge tiles
            const merged = this.mergeTiles(column);
            
            // Fill the column back
            for (let row = 0; row < this.gridSize; row++) {
                const newValue = merged[row] || 0;
                if (this.grid[row][col] !== newValue) {
                    moved = true;
                }
                this.grid[row][col] = newValue;
            }
        }
        
        return moved;
    }
    
    moveDown() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            
            // Extract non-zero values (from bottom to top)
            for (let row = this.gridSize - 1; row >= 0; row--) {
                if (this.grid[row][col] !== 0) {
                    column.push(this.grid[row][col]);
                }
            }
            
            // Merge tiles
            const merged = this.mergeTiles(column);
            
            // Fill the column back (from bottom to top)
            for (let row = this.gridSize - 1; row >= 0; row--) {
                const newValue = merged[this.gridSize - 1 - row] || 0;
                if (this.grid[row][col] !== newValue) {
                    moved = true;
                }
                this.grid[row][col] = newValue;
            }
        }
        
        return moved;
    }
    
    moveLeft() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            const rowValues = [];
            
            // Extract non-zero values
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] !== 0) {
                    rowValues.push(this.grid[row][col]);
                }
            }
            
            // Merge tiles
            const merged = this.mergeTiles(rowValues);
            
            // Fill the row back
            for (let col = 0; col < this.gridSize; col++) {
                const newValue = merged[col] || 0;
                if (this.grid[row][col] !== newValue) {
                    moved = true;
                }
                this.grid[row][col] = newValue;
            }
        }
        
        return moved;
    }
    
    moveRight() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            const rowValues = [];
            
            // Extract non-zero values (from right to left)
            for (let col = this.gridSize - 1; col >= 0; col--) {
                if (this.grid[row][col] !== 0) {
                    rowValues.push(this.grid[row][col]);
                }
            }
            
            // Merge tiles
            const merged = this.mergeTiles(rowValues);
            
            // Fill the row back (from right to left)
            for (let col = this.gridSize - 1; col >= 0; col--) {
                const newValue = merged[this.gridSize - 1 - col] || 0;
                if (this.grid[row][col] !== newValue) {
                    moved = true;
                }
                this.grid[row][col] = newValue;
            }
        }
        
        return moved;
    }
    
    mergeTiles(tiles) {
        const merged = [];
        let i = 0;
        
        while (i < tiles.length) {
            if (i < tiles.length - 1 && tiles[i] === tiles[i + 1]) {
                // Merge tiles
                const mergedValue = tiles[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                i += 2; // Skip the next tile as it's been merged
            } else {
                merged.push(tiles[i]);
                i++;
            }
        }
        
        return merged;
    }
    
    hasWinCondition() {
        const winTarget = this.gridSize === 3 ? 1024 : (this.gridSize === 4 ? 2048 : 4096);
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] >= winTarget) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    isGameOverCondition() {
        // Check if there are any valid moves left
        
        // Check for empty cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const current = this.grid[row][col];
                
                // Check right neighbor
                if (col < this.gridSize - 1 && this.grid[row][col + 1] === current) {
                    return false;
                }
                
                // Check bottom neighbor
                if (row < this.gridSize - 1 && this.grid[row + 1][col] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    showWinMessage() {
        // Create a temporary win notification
        const winNotification = document.createElement('div');
        winNotification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #3f51b5;
            color: white;
            padding: 2rem;
            border-radius: 16px;
            z-index: 1001;
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        `;
        winNotification.innerHTML = `
            <h2>Congratulations!</h2>
            <p>You reached ${this.getWinTarget()}!</p>
            <p style="font-size: 1rem; margin-top: 1rem; opacity: 0.8;">You can continue playing...</p>
        `;
        
        document.body.appendChild(winNotification);
        
        setTimeout(() => {
            document.body.removeChild(winNotification);
        }, 3000);
    }
    
    getWinTarget() {
        return this.gridSize === 3 ? 1024 : (this.gridSize === 4 ? 2048 : 4096);
    }
    
    getHighestTile() {
        let highest = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                highest = Math.max(highest, this.grid[row][col]);
            }
        }
        return highest;
    }
    
    async endGame(result) {
        this.isGameOver = true;
        this.stopGameTimer();
        
        const finalTime = Math.floor((Date.now() - this.startTime) / 1000);
        const highestTile = this.getHighestTile();
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            
            // Save to localStorage as fallback
            if (!this.storage) {
                localStorage.setItem('game2048_best_score', this.bestScore.toString());
            }
        }
        
        // Save game record to database
        await this.saveGameRecord(result, finalTime, highestTile);
        
        // Show game over modal
        this.showGameOverModal(result, finalTime, highestTile);
    }
    
    async saveGameRecord(result, duration, highestTile) {
        // 检查用户是否登录，未登录则不保存记录
        if (!this.isUserLoggedIn()) {
            console.log('用户未登录，游戏记录不会保存到数据库');
            return;
        }
        
        try {
            const gameRecord = {
                id: this.gameId,
                userId: this.userId,
                gameType: "game2048",
                timestamp: Date.now(),
                startTime: this.startTime,
                result: result,
                score: this.score,
                duration: duration,
                moves: this.moves,
                difficulty: this.difficulty,
                meta: {
                    gridSize: `${this.gridSize}x${this.gridSize}`,
                    maxTile: highestTile,
                    winTarget: this.getWinTarget()
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
                // Fallback to localStorage - 但仍需登录
                const existingRecords = JSON.parse(localStorage.getItem('game2048_records') || '[]');
                existingRecords.push(gameRecord);
                // Keep only last 50 records
                if (existingRecords.length > 50) {
                    existingRecords.splice(0, existingRecords.length - 50);
                }
                localStorage.setItem('game2048_records', JSON.stringify(existingRecords));
                console.log('Game record saved to localStorage:', gameRecord);
            }
        } catch (error) {
            console.error('Failed to save game record:', error);
        }
    }
    
    showGameOverModal(result, duration, highestTile) {
        const modalTitle = document.getElementById('modal-title');
        const finalScore = document.getElementById('final-score');
        const finalTime = document.getElementById('final-time');
        const finalMoves = document.getElementById('final-moves');
        const highestTileElement = document.getElementById('highest-tile');
        
        modalTitle.textContent = result === 'won' ? 'Congratulations!' : 'Game Over!';
        finalScore.textContent = this.score;
        finalTime.textContent = this.formatTime(duration);
        finalMoves.textContent = this.moves;
        highestTileElement.textContent = highestTile;
        
        this.gameOverModal.classList.add('show');
    }
    
    hideGameOverModal() {
        this.gameOverModal.classList.remove('show');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseOverlay.classList.add('show');
            this.pauseBtn.textContent = 'Resume';
            this.stopGameTimer();
        } else {
            this.pauseOverlay.classList.remove('show');
            this.pauseBtn.textContent = 'Pause';
            this.startGameTimer();
        }
    }
    
    startGameTimer() {
        this.stopGameTimer();
        this.gameTimer = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
                this.gameTimeElement.textContent = this.formatTime(this.gameTime);
            }
        }, 1000);
    }
    
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateScore() {
        this.currentScoreElement.textContent = this.score;
        
        // Update best score if needed
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            
            // Save to localStorage as fallback
            if (!this.storage) {
                localStorage.setItem('game2048_best_score', this.bestScore.toString());
            }
        }
    }
    
    updateMoves() {
        this.moveCountElement.textContent = this.moves;
    }
    
    updateDisplay() {
        // Clear existing tiles
        this.tileContainer.innerHTML = '';
        
        // Create tiles for current grid state
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const value = this.grid[row][col];
                if (value !== 0) {
                    this.createTile(value, row, col);
                }
            }
        }
        
        console.log('Display updated, grid size:', this.gridSize, 'tiles:', this.tileContainer.children.length);
    }
    
    createTile(value, row, col) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
        tile.textContent = value;
        
        // Calculate position based on grid size and screen size
        let cellSize = this.gridSize === 3 ? 80 : (this.gridSize === 4 ? 70 : 60);
        
        // Responsive size adjustment
        if (window.innerWidth <= 600) {
            cellSize = this.gridSize === 3 ? 70 : (this.gridSize === 4 ? 60 : 50);
        }
        if (window.innerWidth <= 400) {
            cellSize = this.gridSize === 3 ? 70 : (this.gridSize === 4 ? 50 : 40);
        }
        
        const gap = 8;
        const left = col * (cellSize + gap);
        const top = row * (cellSize + gap);
        
        tile.style.cssText = `
            left: ${left}px;
            top: ${top}px;
            width: ${cellSize}px;
            height: ${cellSize}px;
            line-height: ${cellSize}px;
            font-size: ${cellSize * 0.35}px;
        `;
        
        this.tileContainer.appendChild(tile);
        return tile;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game2048;
}

/*
 * labyrinth_new.js
 * Maze (Labyrinth) Game
 * Architecture and persistence model deliberately aligned with Game2048.js
 *
 * Core features:
 * - Maze generation (odd-sized grid) using DFS backtracking
 * - Keyboard / touch movement
 * - Steps, timer, pause, hint
 * - IndexedDB persistence via GameStorageManager (login-aware)
 * - localStorage fallback
 */

class LabyrinthGame {
    constructor() {
        // -------- Game state --------
        this.size = parseInt(document.getElementById('maze-size-select').value, 10);
        this.maze = [];
        this.player = { x: 1, y: 1 };
        this.exit = { x: this.size - 2, y: this.size - 2 };

        this.steps = 0;
        this.bestSteps = null;
        this.startTime = Date.now();
        this.pausedTime = 0; // 累计暂停时间
        this.pauseStartTime = null; // 暂停开始时间
        this.gameTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameId = crypto.randomUUID();
        
        // 移动队列（用于连续滑动动画）
        this.moveQueue = [];
        this.isAnimating = false;

        // -------- DOM --------
        this.gridEl = document.getElementById('maze-grid');
        this.stepEl = document.getElementById('step-count');
        this.bestEl = document.getElementById('best-steps');
        this.timeEl = document.getElementById('game-time');
        this.sizeSelect = document.getElementById('maze-size-select');
        this.loadingOverlay = document.getElementById('loading-overlay');

        this.newGameBtn = document.getElementById('new-game-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.pauseOverlay = document.getElementById('pause-overlay');

        // Modal
        this.modal = document.getElementById('game-over-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.finalStepsEl = document.getElementById('final-steps');
        this.finalTimeEl = document.getElementById('final-time');
        this.finalSizeEl = document.getElementById('final-size');
        this.finalScoreEl = document.getElementById('final-score');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn');

        // -------- Storage --------
        try {
            this.storage = typeof GameStorageManager !== 'undefined' ? new GameStorageManager() : null;
        } catch {
            this.storage = null;
        }
        this.userId = null;

        this.timer = null;
        
        // 检测是否为手机端
        this.isMobile = /mobile/i.test(navigator.userAgent);
        
        this.init();
    }

    async init() {
        // 手机端限制：禁用 41x41 选项
        if (this.isMobile) {
            this.restrictMobileOptions();
        }
        await this.loadUser();
        await this.loadBestSteps();
        this.bindEvents();
        this.newGame();
        this.startTimer();
    }
    
    // 手机端限制难度选项
    restrictMobileOptions() {
        const option41 = this.sizeSelect.querySelector('option[value="41"]');
        if (option41) {
            option41.disabled = true;
            option41.textContent += ' (PC Only)';
        }
        // 如果当前选中的是 41，强制切换到 31
        if (this.sizeSelect.value === '41') {
            this.sizeSelect.value = '31';
            this.size = 31;
            this.exit = { x: this.size - 2, y: this.size - 2 };
        }
    }

    // -------- Storage (mirrors 2048.js logic) --------
    async loadUser() {
        if (!this.storage) return;
        try {
            const uid = await this.storage.getCurrentUserId();
            if (uid) {
                this.userId = uid;
                console.log('已从 UserDB 获取用户ID:', uid);
            }
        } catch (e) {
            console.log('无法从 UserDB 获取用户ID:', e);
        }
    }

    isLoggedIn() {
        return this.userId !== null;
    }

    async loadBestSteps() {
        // 重置最佳步数
        this.bestSteps = null;
        try {
            if (this.storage && this.userId) {
                const records = await this.storage.getUserRecords(this.userId);
                const mazeRecords = records.filter(r => r.gameType === 'labyrinth' && r.meta?.size === this.size);
                if (mazeRecords.length) {
                    this.bestSteps = Math.min(...mazeRecords.map(r => r.steps));
                    this.bestEl.textContent = this.bestSteps;
                    return;
                }
            }
            // 从 localStorage 加载
            const local = localStorage.getItem(`labyrinth_best_${this.size}`);
            if (local) {
                this.bestSteps = parseInt(local, 10);
                this.bestEl.textContent = this.bestSteps;
            } else {
                this.bestEl.textContent = '--';
            }
        } catch (e) {
            console.log('加载最佳步数失败:', e);
            this.bestEl.textContent = '--';
        }
    }

    async saveRecord(result, duration) {
        if (!this.isLoggedIn()) {
            console.log('用户未登录，游戏记录不会保存到数据库');
            return;
        }
        const record = {
            id: this.gameId,
            userId: this.userId,
            gameType: 'labyrinth',
            timestamp: Date.now(),
            startTime: this.startTime,
            result,
            steps: this.steps,
            duration,
            meta: { size: this.size }
        };
        try {
            await this.storage.saveRecord(record);
            console.log('游戏记录已保存:', record);
        } catch (e) {
            console.error('保存游戏记录失败:', e);
        }
    }

    // -------- Events --------
    bindEvents() {
        this.sizeSelect.addEventListener('change', async e => {
            this.size = parseInt(e.target.value, 10);
            this.exit = { x: this.size - 2, y: this.size - 2 };
            await this.loadBestSteps();
            this.newGame();
        });

        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.hintBtn.addEventListener('click', () => this.showHint());

        this.playAgainBtn.addEventListener('click', () => {
            this.hideModal();
            this.newGame();
        });
        this.closeModalBtn.addEventListener('click', () => this.hideModal());

        document.addEventListener('keydown', e => this.handleKey(e));
        
        // 阻止箭头键的默认行为（防止页面滚动）
        document.addEventListener('keydown', e => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        // 触摸控制
        this.setupTouchControls();
    }

    setupTouchControls() {
        let startX, startY;
        let lastMoveX, lastMoveY; // 上次触发移动的位置
        const minSwipeDistance = 30;
        
        // 设置 touch-action 防止浏览器默认手势
        this.gridEl.style.touchAction = 'none';
        
        // 计算每个格子的像素大小（用于连续滑动）
        const getCellSize = () => {
            const gridRect = this.gridEl.getBoundingClientRect();
            return gridRect.width / this.size;
        };

        this.gridEl.addEventListener('touchstart', e => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            lastMoveX = startX;
            lastMoveY = startY;
        }, { passive: false });
        
        this.gridEl.addEventListener('touchmove', e => {
            e.preventDefault();
            if (startX === null || startY === null) return;
            
            const touch = e.touches[0];
            const currentX = touch.clientX;
            const currentY = touch.clientY;
            
            // 计算从上次移动位置的偏移
            const deltaX = currentX - lastMoveX;
            const deltaY = currentY - lastMoveY;
            
            const cellSize = getCellSize();
            
            // 检查是否滑过了一个格子的距离
            if (Math.abs(deltaX) >= cellSize || Math.abs(deltaY) >= cellSize) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // 水平移动
                    const steps = Math.floor(Math.abs(deltaX) / cellSize);
                    const direction = deltaX > 0 ? 1 : -1;
                    for (let i = 0; i < steps; i++) {
                        this.moveQueue.push({ dx: direction, dy: 0 });
                    }
                    // 更新上次移动位置（只更新主方向）
                    lastMoveX += direction * steps * cellSize;
                } else {
                    // 垂直移动
                    const steps = Math.floor(Math.abs(deltaY) / cellSize);
                    const direction = deltaY > 0 ? 1 : -1;
                    for (let i = 0; i < steps; i++) {
                        this.moveQueue.push({ dx: 0, dy: direction });
                    }
                    // 更新上次移动位置（只更新主方向）
                    lastMoveY += direction * steps * cellSize;
                }
                
                // 如果没有正在处理的动画，开始处理队列
                if (!this.isAnimating) {
                    this.processNextMove();
                }
            }
        }, { passive: false });

        this.gridEl.addEventListener('touchend', e => {
            e.preventDefault();
            startX = null;
            startY = null;
            lastMoveX = null;
            lastMoveY = null;
        }, { passive: false });
    }
    
    // 连续移动多步，逐步动画
    moveMultiple(dx, dy, steps) {
        if (this.isPaused || this.isGameOver) return;
        
        // 将移动请求加入队列
        for (let i = 0; i < steps; i++) {
            this.moveQueue.push({ dx, dy });
        }
        
        // 如果没有正在处理的动画，开始处理队列
        if (!this.isAnimating) {
            this.processNextMove();
        }
    }
    
    // 处理移动队列中的下一步
    processNextMove() {
        if (this.moveQueue.length === 0 || this.isPaused || this.isGameOver) {
            this.isAnimating = false;
            return;
        }
        
        this.isAnimating = true;
        const { dx, dy } = this.moveQueue.shift();
        
        const nx = this.player.x + dx;
        const ny = this.player.y + dy;
        
        // 检查是否可以移动
        if (this.maze[ny]?.[nx] !== 0) {
            // 遇到障碍，清空同方向的后续移动
            this.moveQueue = this.moveQueue.filter(m => m.dx !== dx || m.dy !== dy);
            this.isAnimating = false;
            this.processNextMove(); // 处理其他方向的移动（如果有）
            return;
        }
        
        // 执行移动
        this.player.x = nx;
        this.player.y = ny;
        this.steps++;
        this.updateSteps();
        this.updatePlayerPosition();
        
        // 检查是否到达终点
        if (nx === this.exit.x && ny === this.exit.y) {
            this.moveQueue = []; // 清空队列
            this.isAnimating = false;
            this.win();
            return;
        }
        
        // 延迟处理下一步移动（动画间隔）
        setTimeout(() => this.processNextMove(), 60);
    }

    handleKey(e) {
        if (this.isPaused || this.isGameOver) {
            if (e.code === 'Escape') this.togglePause();
            return;
        }
        const dir = {
            ArrowUp: [0, -1], KeyW: [0, -1],
            ArrowDown: [0, 1], KeyS: [0, 1],
            ArrowLeft: [-1, 0], KeyA: [-1, 0],
            ArrowRight: [1, 0], KeyD: [1, 0]
        }[e.code];
        if (dir) this.move(dir[0], dir[1]);
        if (e.code === 'Escape') this.togglePause();
    }

    // -------- Game flow --------
    newGame() {
        this.showLoading();
        // 清空移动队列
        this.moveQueue = [];
        this.isAnimating = false;
        setTimeout(() => {
            this.generateMaze();
            this.player = { x: 1, y: 1 };
            this.steps = 0;
            this.isGameOver = false;
            this.isPaused = false;
            this.startTime = Date.now();
            this.pausedTime = 0;
            this.pauseStartTime = null;
            this.gameId = crypto.randomUUID();
            this.updateSteps();
            this.render();
            this.hideLoading();
            // 确保暂停按钮状态正确
            this.pauseBtn.textContent = 'Pause';
            this.pauseOverlay.classList.remove('show');
            // 重启计时器
            this.startTimer();
        }, 50);
    }

    move(dx, dy) {
        if (this.isPaused || this.isGameOver) return;
        const nx = this.player.x + dx;
        const ny = this.player.y + dy;
        if (this.maze[ny]?.[nx] !== 0) return;
        this.player.x = nx;
        this.player.y = ny;
        this.steps++;
        this.updateSteps();
        // 只更新玩家位置，不重新渲染整个迷宫
        this.updatePlayerPosition();
        if (nx === this.exit.x && ny === this.exit.y) this.win();
    }

    async win() {
        this.isGameOver = true;
        this.stopTimer();
        // 计算实际游戏时间（排除暂停时间）
        const duration = Math.floor((Date.now() - this.startTime - this.pausedTime) / 1000);
        if (this.bestSteps === null || this.steps < this.bestSteps) {
            this.bestSteps = this.steps;
            this.bestEl.textContent = this.bestSteps;
            localStorage.setItem(`labyrinth_best_${this.size}`, this.bestSteps);
        }
        await this.saveRecord('won', duration);
        this.showModal(duration);
    }

    // -------- Maze generation --------
    generateMaze() {
        const n = this.size;
        this.maze = Array.from({ length: n }, () => Array(n).fill(1));
        
        // DFS 起点为中心点（取整到奇数坐标）
        const centerX = Math.floor(n / 2);
        const centerY = Math.floor(n / 2);
        // 确保是奇数坐标（迷宫通道必须在奇数位置）
        const startX = centerX % 2 === 1 ? centerX : centerX - 1;
        const startY = centerY % 2 === 1 ? centerY : centerY - 1;
        
        const carve = (x, y) => {
            const dirs = [[2,0],[-2,0],[0,2],[0,-2]].sort(() => Math.random() - 0.5);
            for (const [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                if (nx > 0 && ny > 0 && nx < n-1 && ny < n-1 && this.maze[ny][nx] === 1) {
                    this.maze[y + dy/2][x + dx/2] = 0;
                    this.maze[ny][nx] = 0;
                    carve(nx, ny);
                }
            }
        };
        
        // 从中心开始生成
        // this.maze[startY][startX] = 0;
        carve(startX, startY);
        
        // 起点：左上角 (1,1)
        this.maze[1][1] = 0;
        // 终点：右下角 (n-2, n-2)
        this.maze[this.exit.y][this.exit.x] = 0;
    }

    // -------- UI --------
    render() {
        this.gridEl.innerHTML = '';
        this.gridEl.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.gridEl.style.position = 'relative';
        this.gridEl.classList.add('cursor-game-zone');
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                if (this.maze[y][x] === 1) {
                    cell.classList.add('wall');
                } else {
                    cell.classList.add('path');
                }
                // 标记起点
                if (x === 1 && y === 1) {
                    cell.classList.add('start');
                }
                // 标记终点
                if (x === this.exit.x && y === this.exit.y) {
                    cell.classList.add('exit');
                }
                this.gridEl.appendChild(cell);
            }
        }
        
        // 创建/更新玩家 div（独立定位）
        this.updatePlayerPosition();
    }
    
    updatePlayerPosition() {
        // 获取或创建玩家元素
        let playerEl = this.gridEl.querySelector('.player-marker');
        if (!playerEl) {
            playerEl = document.createElement('div');
            playerEl.className = 'player-marker';
            this.gridEl.appendChild(playerEl);
        }
        
        // 计算玩家位置
        const cellSize = this.gridEl.children[0]?.offsetWidth || 20;
        const left = this.player.x * cellSize;
        const top = this.player.y * cellSize;
        
        playerEl.style.left = `${left + 4}px`; // +4 是 grid 的 padding
        playerEl.style.top = `${top + 4}px`;
        playerEl.style.width = `${cellSize}px`;
        playerEl.style.height = `${cellSize}px`;
    }

    updateSteps() {
        this.stepEl.textContent = this.steps;
    }

    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                // 计算实际游戏时间（排除暂停时间）
                const t = Math.floor((Date.now() - this.startTime - this.pausedTime) / 1000);
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
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        if (this.isPaused) {
            // 记录暂停开始时间
            this.pauseStartTime = Date.now();
            this.stopTimer();
        } else {
            // 累加暂停时间
            if (this.pauseStartTime) {
                this.pausedTime += Date.now() - this.pauseStartTime;
                this.pauseStartTime = null;
            }
            this.startTimer();
        }
    }

    showHint() {
        // intentionally lightweight: highlight exit briefly
        const idx = this.exit.y * this.size + this.exit.x;
        const cell = this.gridEl.children[idx];
        if (!cell) return;
        cell.classList.add('hint');
        setTimeout(() => cell.classList.remove('hint'), 800);
    }

    showModal(duration) {
        this.modalTitle.textContent = '🎉 Congratulations!';
        this.finalStepsEl.textContent = this.steps;
        this.finalTimeEl.textContent = this.formatTime(duration);
        this.finalSizeEl.textContent = `${this.size}×${this.size}`;
        this.finalScoreEl.textContent = Math.max(0, 2000 - this.steps * 5 - duration);
        this.modal.classList.add('show');
    }

    hideModal() {
        this.modal.classList.remove('show');
    }

    showLoading() {
        this.loadingOverlay.classList.add('show');
    }
    hideLoading() {
        this.loadingOverlay.classList.remove('show');
    }

    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2,'0');
        const s = (sec % 60).toString().padStart(2,'0');
        return `${m}:${s}`;
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    window.labyrinthGame = new LabyrinthGame();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LabyrinthGame;
}

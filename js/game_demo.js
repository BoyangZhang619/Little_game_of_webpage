/**
 * 游戏演示动画系统
 * 为主页游戏预览区域提供动画演示
 */

class GameDemoManager {
    constructor() {
        this.demos = {};
        this.init();
    }

    init() {
        // 等待DOM加载完成后初始化所有演示
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeDemos());
        } else {
            this.initializeDemos();
        }
    }

    initializeDemos() {
        // 初始化华容道演示
        this.initKlotskiDemo();
        // 初始化2048演示
        this.init2048Demo();
        // 初始化扫雷演示
        this.initMinesweeperDemo();
        // 初始化迷宫演示
        this.initLabyrinthDemo();
    }

    /**
     * 华容道演示动画
     */
    initKlotskiDemo() {
        const klotskiMain = document.querySelector('#klotski .gameTypeMain');
        if (!klotskiMain) return;

        // 清除现有内容
        klotskiMain.innerHTML = '';
        
        // 创建游戏容器（2x2网格）
        const gameContainer = document.createElement('div');
        gameContainer.className = 'klotski-demo-container';
        
        // 创建4个位置（包括一个空位）
        const grid = [];
        for (let i = 0; i < 4; i++) {
            const cell = document.createElement('div');
            cell.className = 'klotski-cell';
            cell.dataset.position = i;
            
            // 前三个位置放置方块
            if (i < 3) {
                const block = document.createElement('div');
                block.className = 'klotski-block';
                block.textContent = i + 1;
                block.dataset.number = i + 1;
                cell.appendChild(block);
            }
            
            grid.push(cell);
            gameContainer.appendChild(cell);
        }

        klotskiMain.appendChild(gameContainer);

        // 初始化CSS样式
        this.setupKlotskiStyles();

        // 存储演示实例
        this.demos.klotski = new KlotskiDemo(gameContainer, grid);
        
        // 开始动画循环
        this.demos.klotski.startDemo();
    }

    /**
     * 2048演示动画
     */
    init2048Demo() {
        const game2048Main = document.querySelector('#game2048 .gameTypeMain');
        if (!game2048Main) return;

        // 清除现有内容
        game2048Main.innerHTML = '';
        
        // 创建游戏容器（3x3网格）
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-2048-demo-container';
        
        // 创建9个位置
        const grid = [];
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'game-2048-cell';
            cell.dataset.position = i;
            
            grid.push(cell);
            gameContainer.appendChild(cell);
        }

        game2048Main.appendChild(gameContainer);

        // 初始化2048 CSS样式
        this.setup2048Styles();

        // 存储演示实例
        this.demos.game2048 = new Game2048Demo(gameContainer, grid);
        
        // 开始动画循环
        this.demos.game2048.startDemo();
    }

    /**
     * 扫雷演示动画
     */
    initMinesweeperDemo() {
        const minesweeperMain = document.querySelector('#minesweaping .gameTypeMain');
        if (!minesweeperMain) return;

        // 清除现有内容
        minesweeperMain.innerHTML = '';
        
        // 创建游戏容器（4x4网格）
        const gameContainer = document.createElement('div');
        gameContainer.className = 'minesweeper-demo-container';
        
        // 创建16个位置
        const grid = [];
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'minesweeper-cell';
            cell.dataset.position = i;
            
            grid.push(cell);
            gameContainer.appendChild(cell);
        }

        minesweeperMain.appendChild(gameContainer);

        // 初始化扫雷CSS样式
        this.setupMinesweeperStyles();

        // 存储演示实例
        this.demos.minesweeper = new MinesweeperDemo(gameContainer, grid);
        
        // 开始动画循环
        this.demos.minesweeper.startDemo();
    }

    /**
     * 迷宫演示动画
     */
    initLabyrinthDemo() {
        const labyrinthMain = document.querySelector('#labyrinth .gameTypeMain');
        if (!labyrinthMain) return;

        // 清除现有内容
        labyrinthMain.innerHTML = '';
        
        // 创建游戏容器（5x5网格）
        const gameContainer = document.createElement('div');
        gameContainer.className = 'labyrinth-demo-container';
        
        // 创建25个位置
        const grid = [];
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'labyrinth-cell';
            cell.dataset.position = i;
            
            grid.push(cell);
            gameContainer.appendChild(cell);
        }

        labyrinthMain.appendChild(gameContainer);

        // 初始化迷宫CSS样式
        this.setupLabyrinthStyles();

        // 存储演示实例
        this.demos.labyrinth = new LabyrinthDemo(gameContainer, grid);
        
        // 开始动画循环
        this.demos.labyrinth.startDemo();
    }

    setupKlotskiStyles() {
        // 检查是否已经添加了样式
        if (document.getElementById('klotski-demo-styles')) return;

        const style = document.createElement('style');
        style.id = 'klotski-demo-styles';
        style.textContent = `
            .klotski-demo-container {
                position: absolute;
                width: 70%;
                max-width: 200px;
                aspect-ratio: 1;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 8px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 12px;
                backdrop-filter: blur(8px);
            }

            .klotski-cell {
                aspect-ratio: 1;
                background: rgba(0, 0, 0, 0.03);
                border-radius: 8px;
                position: relative;
            }

            .klotski-block {
                width: 100%;
                height: 100%;
                background: #ffffff;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #374151;
                font-weight: 600;
                font-size: 1.5rem;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                position: absolute;
                top: 0;
                left: 0;
                cursor: pointer;
            }

            .klotski-block:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            }

            .klotski-block.moving {
                z-index: 10;
                transform: scale(1.02);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }

            .klotski-block[data-number="1"] {
                background: linear-gradient(135deg, #fef3c7, #fcd34d);
                color: #92400e;
            }

            .klotski-block[data-number="2"] {
                background: linear-gradient(135deg, #e0e7ff, #a5b4fc);
                color: #3730a3;
            }

            .klotski-block[data-number="3"] {
                background: linear-gradient(135deg, #d1fae5, #6ee7b7);
                color: #065f46;
            }

            .klotski-demo-container.solved .klotski-block {
                animation: klotskiCelebration 0.5s ease-out;
            }

            @keyframes klotskiCelebration {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .klotski-cell:empty {
                background: rgba(0, 0, 0, 0.02);
            }
        `;
        document.head.appendChild(style);
    }

    setup2048Styles() {
        // 检查是否已经添加了样式
        if (document.getElementById('game-2048-demo-styles')) return;

        const style = document.createElement('style');
        style.id = 'game-2048-demo-styles';
        style.textContent = `
            .game-2048-demo-container {
                position: absolute;
                width: 70%;
                max-width: 200px;
                aspect-ratio: 1;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap: 6px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 12px;
                backdrop-filter: blur(8px);
            }

            .game-2048-cell {
                aspect-ratio: 1;
                background: rgba(0, 0, 0, 0.04);
                border-radius: 6px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .game-2048-tile {
                width: 100%;
                height: 100%;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 1.1rem;
                position: absolute;
                top: 0;
                left: 0;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            }

            .game-2048-tile[data-value="2"] { 
                background: #f8fafc; 
                color: #475569;
            }
            .game-2048-tile[data-value="4"] { 
                background: #e0f2fe; 
                color: #0369a1;
            }
            .game-2048-tile[data-value="8"] { 
                background: #bae6fd; 
                color: #0c4a6e;
            }
            .game-2048-tile[data-value="16"] { 
                background: #7dd3fc; 
                color: #ffffff;
            }
            .game-2048-tile[data-value="32"] { 
                background: #38bdf8; 
                color: #ffffff;
            }
            .game-2048-tile[data-value="64"] { 
                background: #0ea5e9; 
                color: #ffffff;
            }
            .game-2048-tile[data-value="128"] { 
                background: #0284c7; 
                color: #ffffff;
                font-size: 0.95rem;
            }
            .game-2048-tile[data-value="256"] { 
                background: #0369a1; 
                color: #ffffff;
                font-size: 0.95rem;
            }
            .game-2048-tile[data-value="512"] { 
                background: #075985; 
                color: #ffffff;
                font-size: 0.95rem;
            }

            .game-2048-tile:hover {
                transform: scale(1.02);
            }

            .game-2048-tile.new {
                animation: tile2048Appear 0.25s ease-out;
            }

            @keyframes tile2048Appear {
                0% { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }

            .game-2048-tile.merged {
                animation: tile2048Merge 0.25s ease-out;
            }

            @keyframes tile2048Merge {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .game-2048-tile.moving {
                z-index: 10;
            }
        `;
        document.head.appendChild(style);
    }

    setupMinesweeperStyles() {
        // 检查是否已经添加了样式
        if (document.getElementById('minesweeper-demo-styles')) return;

        const style = document.createElement('style');
        style.id = 'minesweeper-demo-styles';
        style.textContent = `
            .minesweeper-demo-container {
                position: absolute;
                width: 70%;
                max-width: 200px;
                aspect-ratio: 1;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: repeat(4, 1fr);
                gap: 4px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 12px;
                backdrop-filter: blur(8px);
            }

            .minesweeper-cell {
                aspect-ratio: 1;
                background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
                border-radius: 4px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            .minesweeper-cell:hover {
                background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
            }

            .minesweeper-cell.revealed {
                background: #ffffff;
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            .minesweeper-cell.revealed[data-number="1"] { color: #3b82f6; }
            .minesweeper-cell.revealed[data-number="2"] { color: #22c55e; }
            .minesweeper-cell.revealed[data-number="3"] { color: #ef4444; }
            .minesweeper-cell.revealed[data-number="4"] { color: #8b5cf6; }
            .minesweeper-cell.revealed[data-number="5"] { color: #f97316; }
            .minesweeper-cell.revealed[data-number="6"] { color: #06b6d4; }

            .minesweeper-cell.mine {
                background: linear-gradient(135deg, #fecaca, #fca5a5);
                animation: mineExplode 0.3s ease-out;
            }

            @keyframes mineExplode {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .minesweeper-cell.flagged {
                background: linear-gradient(145deg, #fef3c7, #fde68a);
            }

            .minesweeper-cell.safe {
                animation: mineSafeReveal 0.3s ease-out;
            }

            @keyframes mineSafeReveal {
                0% { transform: scale(1); background: linear-gradient(145deg, #e2e8f0, #cbd5e1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); background: #ffffff; }
            }
        `;
        document.head.appendChild(style);
    }

    setupLabyrinthStyles() {
        // 检查是否已经添加了样式
        if (document.getElementById('labyrinth-demo-styles')) return;

        const style = document.createElement('style');
        style.id = 'labyrinth-demo-styles';
        style.textContent = `
            .labyrinth-demo-container {
                position: absolute;
                width: 70%;
                max-width: 200px;
                aspect-ratio: 1;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-template-rows: repeat(5, 1fr);
                gap: 3px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 12px;
                backdrop-filter: blur(8px);
            }

            .labyrinth-cell {
                aspect-ratio: 1;
                background: linear-gradient(135deg, #9ca3af, #6b7280);
                border-radius: 3px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.7rem;
                color: #ffffff;
                transition: all 0.25s ease;
            }

            .labyrinth-cell.path {
                background: #f8fafc;
            }

            .labyrinth-cell.start {
                background: linear-gradient(135deg, #86efac, #22c55e);
                color: #ffffff;
                font-size: 0.65rem;
            }

            .labyrinth-cell.end {
                background: linear-gradient(135deg, #fca5a5, #ef4444);
                color: #ffffff;
                font-size: 0.65rem;
                animation: labyrinthEndPulse 2s ease-in-out infinite;
            }

            @keyframes labyrinthEndPulse {
                0%, 100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
                50% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
            }

            .labyrinth-cell.player {
                background: linear-gradient(135deg, #a5b4fc, #6366f1);
                color: #ffffff;
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
                z-index: 10;
                border-radius: 50%;
                animation: labyrinthPlayerMove 0.3s ease-out;
            }

            @keyframes labyrinthPlayerMove {
                0% { transform: scale(1.15); }
                100% { transform: scale(1.05); }
            }

            .labyrinth-cell.visited {
                background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
            }

            .labyrinth-cell.generating {
                animation: labyrinthCellGenerate 0.25s ease-out;
            }

            @keyframes labyrinthCellGenerate {
                0% { 
                    transform: scale(0) rotate(90deg);
                    opacity: 0;
                }
                100% { 
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                }
            }

            .labyrinth-demo-container.victory .labyrinth-cell.path,
            .labyrinth-demo-container.victory .labyrinth-cell.visited {
                animation: labyrinthVictory 0.6s ease-in-out;
            }

            @keyframes labyrinthVictory {
                0%, 100% { background: #f8fafc; }
                50% { background: #dcfce7; }
            }

            .labyrinth-cell.resetting {
                animation: labyrinthCellReset 0.2s ease-in-out;
            }

            @keyframes labyrinthCellReset {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.9); }
                100% { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 华容道演示类
 */
class KlotskiDemo {
    constructor(container, grid) {
        this.container = container;
        this.grid = grid; // 4个格子的数组
        this.state = [1, 2, 3, 0]; // 当前状态，0表示空位 [左上, 右上, 左下, 右下]
        this.targetState = [1, 2, 3, 0]; // 目标状态
        this.isAnimating = false;
        this.demoInterval = null;
    }

    startDemo() {
        // 初始化状态显示
        this.updateDisplay();
        
        // 等待一下再开始
        setTimeout(() => {
            this.demoInterval = setInterval(() => {
                this.runDemoSequence();
            }, 6000); // 每6秒一个循环，给更多时间观察
        }, 2000);
    }

    stopDemo() {
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
    }

    async runDemoSequence() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        try {
            // console.log('=== 开始新的演示循环 ===');
            
            // 确保状态是正确的，如果不是则重置
            if (!this.isInCorrectOrder()) {
                // console.log('重置状态到正确位置');
                this.state = [1, 2, 3, 0];
                this.updateDisplay();
                await this.delay(500);
            }
            
            // 打乱
            await this.shuffleBlocks();
            await this.delay(800);
            
            // 解决到正确位置
            await this.solveToCorrectOrder();
            
            // 添加庆祝效果
            this.container.classList.add('solved');
            await this.delay(1200);
            this.container.classList.remove('solved');
            
            await this.delay(500);
            
            // console.log('=== 演示循环完成 ===');
            
        } catch (error) {
            // console.warn('Demo animation error:', error);
            // 发生错误时重置状态
            this.state = [1, 2, 3, 0];
            this.updateDisplay();
        } finally {
            this.isAnimating = false;
        }
    }

    async shuffleBlocks() {
        // 更简单有效的打乱序列: [1,2,3,0] -> [2,1,0,3]
        // console.log('开始打乱，当前状态:', this.state);
        
        await this.moveBlock(2); // [1,2,3,0] -> [1,2,0,3] (3移动到空位)
        // console.log('步骤1:', this.state);
        await this.delay(600);
        
        await this.moveBlock(1); // [1,2,0,3] -> [1,0,2,3] (2移动到空位)
        // console.log('步骤2:', this.state);
        await this.delay(600);
        
        await this.moveBlock(0); // [1,0,2,3] -> [0,1,2,3] (1移动到空位)
        // console.log('步骤3:', this.state);
        await this.delay(600);
    }

    async solveToCorrectOrder() {
        // 从[0,1,2,3]解回[1,2,3,0]
        // console.log('开始解决，当前状态:', this.state);
        
        await this.moveBlock(1); // [0,1,2,3] -> [1,0,2,3] (1移动到空位)
        // console.log('解决步骤1:', this.state);
        await this.delay(600);
        
        await this.moveBlock(2); // [1,0,2,3] -> [1,2,0,3] (2移动到空位)
        // console.log('解决步骤2:', this.state);
        await this.delay(600);
        
        await this.moveBlock(3); // [1,2,0,3] -> [1,2,3,0] (3移动到空位)
        // console.log('解决步骤3:', this.state);
        await this.delay(600);
    }

    async moveBlock(fromPos) {
        const emptyPos = this.state.indexOf(0);
        
        // console.log(`尝试移动位置 ${fromPos} 的方块到空位 ${emptyPos}`);
        // console.log(`当前状态:`, this.state);
        
        // 检查是否可以移动（相邻位置）
        if (!this.canMove(fromPos, emptyPos)) {
            // console.warn(`无法移动: 位置 ${fromPos} 和空位 ${emptyPos} 不相邻`);
            return;
        }
        
        const blockElement = this.getBlockAtPosition(fromPos);
        if (!blockElement) {
            // console.warn(`位置 ${fromPos} 没有找到方块元素`);
            return;
        }
        
        // 添加移动效果
        blockElement.classList.add('moving');
        
        // 计算移动方向
        const fromCell = this.grid[fromPos];
        const toCell = this.grid[emptyPos];
        
        // 执行DOM移动
        toCell.appendChild(blockElement);
        
        // 更新状态
        [this.state[fromPos], this.state[emptyPos]] = [this.state[emptyPos], this.state[fromPos]];
        
        // console.log(`移动完成，新状态:`, this.state);
        
        // 等待动画完成
        await this.delay(400);
        
        // 移除移动效果
        blockElement.classList.remove('moving');
    }

    canMove(fromPos, emptyPos) {
        // 检查两个位置是否相邻（在2x2网格中）
        const adjacents = {
            0: [1, 2],    // 左上可以移动到右上、左下
            1: [0, 3],    // 右上可以移动到左上、右下
            2: [0, 3],    // 左下可以移动到左上、右下
            3: [1, 2]     // 右下可以移动到右上、左下
        };
        
        return adjacents[fromPos] && adjacents[fromPos].includes(emptyPos);
    }

    getBlockAtPosition(pos) {
        return this.grid[pos].querySelector('.klotski-block');
    }

    isInCorrectOrder() {
        return JSON.stringify(this.state) === JSON.stringify(this.targetState);
    }

    updateDisplay() {
        // 清空所有格子
        this.grid.forEach(cell => {
            cell.innerHTML = '';
        });
        
        // 根据当前状态重新放置方块
        for (let i = 0; i < this.state.length; i++) {
            const blockNumber = this.state[i];
            if (blockNumber !== 0) {
                const block = document.createElement('div');
                block.className = 'klotski-block';
                block.textContent = blockNumber;
                block.dataset.number = blockNumber;
                this.grid[i].appendChild(block);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 2048演示类
 */
class Game2048Demo {
    constructor(container, grid) {
        this.container = container;
        this.grid = grid; // 9个格子的数组
        this.board = Array(9).fill(0); // 游戏状态，0表示空位
        this.isAnimating = false;
        this.demoInterval = null;
        this.stepCount = 0; // 记录步数
        this.minSteps = 8; // 最少演示步数
        this.maxSteps = 63; // 最大演示步数，防止无限循环
        this.directions = ['right', 'down', 'left', 'up']; // 可选方向
    }

    startDemo() {
        // 初始化状态显示
        this.clearBoard();
        
        // 立即开始第一次演示，然后设置循环
        setTimeout(() => {
            this.runDemoSequence(); // 立即执行第一次
        }, 500); // 只延迟500ms开始第一次演示
        
        // 设置定期循环
        setTimeout(() => {
            this.demoInterval = setInterval(() => {
                this.runDemoSequence();
            }, 10000); // 每10秒一个循环
        }, 10500); // 第一次演示完成后开始循环
    }

    stopDemo() {
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
    }

    async runDemoSequence() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        try {
            // console.log('=== 开始2048演示循环 ===');
            
            // 重置计数器
            this.stepCount = 0;
            
            // 清空棋盘
            this.clearBoard();
            await this.delay(200);
            
            // 添加初始数字
            this.addRandomTile();
            await this.delay(200);
            this.addRandomTile();
            await this.delay(400);
            
            // 进行随机方向移动演示
            await this.demoRandomMoves();
            
            await this.delay(500);
            
            // console.log('=== 2048演示循环完成 ===');
            
        } catch (error) {
            // console.warn('2048 Demo animation error:', error);
            this.clearBoard();
        } finally {
            this.isAnimating = false;
        }
    }

    async demoRandomMoves() {
        // console.log(`开始随机移动演示，目标步数: ${this.minSteps}-${this.maxSteps}`);
        
        while (this.stepCount < this.maxSteps) {
            // 检查游戏状态
            if (this.isGameOver()) {
                // console.log('游戏结束，提前重置');
                break;
            }
            
            // 随机选择方向
            const direction = this.getRandomDirection();
            // console.log(`第${this.stepCount + 1}步: 向${direction}移动`);
            
            // 执行移动
            const moved = await this.moveInDirection(direction);
            
            if (moved) {
                this.stepCount++;
                await this.delay(750);
                
                // 添加新数字块
                this.addRandomTile();
                await this.delay(750);
                
                // 如果达到最少步数，有概率结束
                if (this.stepCount >= this.minSteps) {
                    // 30% 概率结束演示
                    if (Math.random() < 0.3) {
                        // console.log(`达到最少步数(${this.stepCount})，结束演示`);
                        break;
                    }
                }
            } else {
                // 如果移动无效，尝试其他方向
                // console.log('移动无效，尝试其他方向');
                await this.delay(0);
            }
        }
        
        // console.log(`随机演示完成，总步数: ${this.stepCount}`);
    }

    getRandomDirection() {
        return this.directions[Math.floor(Math.random() * this.directions.length)];
    }

    async moveInDirection(direction) {
        switch (direction) {
            case 'right':
                return await this.moveRight();
            case 'down':
                return await this.moveDown();
            case 'left':
                return await this.moveLeft();
            case 'up':
                return await this.moveUp();
            default:
                return false;
        }
    }

    isGameOver() {
        // 检查是否还有空位
        if (this.board.includes(0)) {
            return false;
        }
        
        // 检查是否还能移动（是否有相邻的相同数字）
        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            
            // 检查右边
            if (col < 2 && this.board[i] === this.board[i + 1]) {
                return false;
            }
            
            // 检查下边
            if (row < 2 && this.board[i] === this.board[i + 3]) {
                return false;
            }
        }
        
        return true; // 无法移动，游戏结束
    }

    async moveRight() {
        // console.log('向右移动');
        const newBoard = [...this.board];
        let moved = false;
        
        // 处理每一行（每行3个）
        for (let row = 0; row < 3; row++) {
            const rowStart = row * 3;
            const rowData = [
                newBoard[rowStart],
                newBoard[rowStart + 1], 
                newBoard[rowStart + 2]
            ];
            
            const newRow = this.slideRow(rowData);
            
            for (let col = 0; col < 3; col++) {
                if (newBoard[rowStart + col] !== newRow[col]) {
                    moved = true;
                    newBoard[rowStart + col] = newRow[col];
                }
            }
        }
        
        if (moved) {
            this.board = newBoard;
            this.updateDisplay();
        }
        
        return moved;
    }

    async moveDown() {
        // console.log('向下移动');
        const newBoard = [...this.board];
        let moved = false;
        
        // 处理每一列
        for (let col = 0; col < 3; col++) {
            const colData = [
                newBoard[col],
                newBoard[col + 3],
                newBoard[col + 6]
            ];
            
            const newCol = this.slideRow(colData);
            
            for (let row = 0; row < 3; row++) {
                if (newBoard[col + row * 3] !== newCol[row]) {
                    moved = true;
                    newBoard[col + row * 3] = newCol[row];
                }
            }
        }
        
        if (moved) {
            this.board = newBoard;
            this.updateDisplay();
        }
        
        return moved;
    }

    async moveLeft() {
        // console.log('向左移动');
        const newBoard = [...this.board];
        let moved = false;
        
        // 处理每一行，但向左滑动
        for (let row = 0; row < 3; row++) {
            const rowStart = row * 3;
            const rowData = [
                newBoard[rowStart + 2],
                newBoard[rowStart + 1], 
                newBoard[rowStart]
            ].reverse(); // 反转后滑动，再反转回来
            
            const newRow = this.slideRow(rowData).reverse();
            
            for (let col = 0; col < 3; col++) {
                if (newBoard[rowStart + col] !== newRow[col]) {
                    moved = true;
                    newBoard[rowStart + col] = newRow[col];
                }
            }
        }
        
        if (moved) {
            this.board = newBoard;
            this.updateDisplay();
        }
        
        return moved;
    }

    async moveUp() {
        // console.log('向上移动');
        const newBoard = [...this.board];
        let moved = false;
        
        // 处理每一列，但向上滑动
        for (let col = 0; col < 3; col++) {
            const colData = [
                newBoard[col + 6],
                newBoard[col + 3],
                newBoard[col]
            ].reverse(); // 反转后滑动，再反转回来
            
            const newCol = this.slideRow(colData).reverse();
            
            for (let row = 0; row < 3; row++) {
                if (newBoard[col + row * 3] !== newCol[row]) {
                    moved = true;
                    newBoard[col + row * 3] = newCol[row];
                }
            }
        }
        
        if (moved) {
            this.board = newBoard;
            this.updateDisplay();
        }
        
        return moved;
    }

    slideRow(row) {
        // 移除零
        const filtered = row.filter(val => val !== 0);
        
        // 合并相邻的相同数字
        for (let i = filtered.length - 1; i > 0; i--) {
            if (filtered[i] === filtered[i - 1]) {
                filtered[i] *= 2;
                filtered.splice(i - 1, 1);
            }
        }
        
        // 在开头补零到长度3
        while (filtered.length < 3) {
            filtered.unshift(0);
        }
        
        return filtered;
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === 0) {
                emptyCells.push(i);
            }
        }
        
        if (emptyCells.length > 0) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[randomIndex] = Math.random() < 0.9 ? 2 : 4;
            this.updateDisplay();
        }
    }

    clearBoard() {
        this.board = Array(9).fill(0);
        this.updateDisplay();
    }

    updateDisplay() {
        // 清空所有格子
        this.grid.forEach(cell => {
            cell.innerHTML = '';
        });
        
        // 根据当前状态重新放置数字块
        for (let i = 0; i < this.board.length; i++) {
            const value = this.board[i];
            if (value !== 0) {
                const tile = document.createElement('div');
                tile.className = 'game-2048-tile new';
                tile.textContent = value;
                tile.dataset.value = value;
                this.grid[i].appendChild(tile);
                
                // 移除new类
                setTimeout(() => {
                    tile.classList.remove('new');
                }, 300);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 扫雷演示类
 */
class MinesweeperDemo {
    constructor(container, grid) {
        this.container = container;
        this.grid = grid; // 16个格子的数组（4x4）
        this.board = Array(16).fill().map(() => ({
            isMine: false,
            number: 0,
            isRevealed: false,
            isFlagged: false
        }));
        this.isAnimating = false;
        this.demoInterval = null;
        this.mineCount = 3; // 4x4网格中放3个雷
    }

    startDemo() {
        // 初始化显示
        this.resetBoard();
        
        // 立即开始第一次演示
        setTimeout(() => {
            this.runDemoSequence();
        }, 800);
        
        // 设置定期循环
        setTimeout(() => {
            this.demoInterval = setInterval(() => {
                this.runDemoSequence();
            }, 8000); // 每8秒一个循环
        }, 8800);
    }

    stopDemo() {
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
    }

    async runDemoSequence() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        try {
            // console.log('=== 开始扫雷演示循环 ===');
            
            // 重置棋盘
            this.resetBoard();
            this.generateMines();
            this.calculateNumbers();
            this.updateDisplay();
            await this.delay(500);
            
            // 演示游戏过程
            await this.demoGameplay();
            
            await this.delay(1000);
            
            // console.log('=== 扫雷演示循环完成 ===');
            
        } catch (error) {
            // console.warn('Minesweeper Demo animation error:', error);
            this.resetBoard();
        } finally {
            this.isAnimating = false;
        }
    }

    async demoGameplay() {
        // 找到一个安全的起始位置
        const safeStart = this.findSafeStartPosition();
        
        // 点击安全的起始位置
        await this.clickCell(safeStart);
        await this.delay(800);
        
        // 标记一些雷
        await this.flagSomeMines();
        await this.delay(600);
        
        // 继续点击安全的位置
        await this.clickSafeAreas();
        await this.delay(600);
        
        // 最后展示所有雷的位置
        this.revealAllMines();
    }

    findSafeStartPosition() {
        // 找到一个不是雷且周围雷数较少的位置
        for (let i = 0; i < 16; i++) {
            if (!this.board[i].isMine && this.board[i].number <= 1) {
                return i;
            }
        }
        // 如果找不到理想位置，返回第一个非雷位置
        return this.board.findIndex(cell => !cell.isMine);
    }

    async clickCell(index) {
        if (this.board[index].isRevealed) return;
        
        const cell = this.grid[index];
        const boardCell = this.board[index];
        
        if (boardCell.isMine) {
            // 点到雷了
            cell.classList.add('mine');
            cell.textContent = '💣';
            // console.log('踩雷了！');
        } else {
            // 安全区域
            cell.classList.add('revealed', 'safe');
            boardCell.isRevealed = true;
            
            if (boardCell.number > 0) {
                cell.textContent = boardCell.number;
                cell.dataset.number = boardCell.number;
            }
            
            // 如果是空白区域，递归展开周围
            if (boardCell.number === 0) {
                await this.revealAdjacentCells(index);
            }
        }
    }

    async revealAdjacentCells(index) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                    const newIndex = newRow * 4 + newCol;
                    
                    if (!this.board[newIndex].isRevealed && !this.board[newIndex].isMine) {
                        await this.delay(150);
                        await this.clickCell(newIndex);
                    }
                }
            }
        }
    }

    async flagSomeMines() {
        // 标记1-2个雷
        const mines = [];
        for (let i = 0; i < 16; i++) {
            if (this.board[i].isMine) {
                mines.push(i);
            }
        }
        
        const flagCount = Math.min(2, mines.length);
        for (let i = 0; i < flagCount; i++) {
            const mineIndex = mines[Math.floor(Math.random() * mines.length)];
            if (!this.board[mineIndex].isFlagged) {
                this.flagCell(mineIndex);
                await this.delay(400);
            }
        }
    }

    flagCell(index) {
        const cell = this.grid[index];
        const boardCell = this.board[index];
        
        if (!boardCell.isRevealed) {
            boardCell.isFlagged = true;
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        }
    }

    async clickSafeAreas() {
        // 点击一些还未点击的安全区域
        const safeCells = [];
        for (let i = 0; i < 16; i++) {
            if (!this.board[i].isMine && !this.board[i].isRevealed && !this.board[i].isFlagged) {
                safeCells.push(i);
            }
        }
        
        const clickCount = Math.min(3, safeCells.length);
        for (let i = 0; i < clickCount; i++) {
            const cellIndex = safeCells[Math.floor(Math.random() * safeCells.length)];
            await this.clickCell(cellIndex);
            await this.delay(500);
        }
    }

    revealAllMines() {
        // 展示所有雷的位置
        for (let i = 0; i < 16; i++) {
            if (this.board[i].isMine && !this.board[i].isFlagged) {
                const cell = this.grid[i];
                cell.classList.add('mine');
                cell.textContent = '💣';
            }
        }
    }

    generateMines() {
        // 随机放置雷
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const index = Math.floor(Math.random() * 16);
            if (!this.board[index].isMine) {
                this.board[index].isMine = true;
                minesPlaced++;
            }
        }
    }

    calculateNumbers() {
        // 计算每个非雷格子周围的雷数
        for (let i = 0; i < 16; i++) {
            if (!this.board[i].isMine) {
                this.board[i].number = this.countAdjacentMines(i);
            }
        }
    }

    countAdjacentMines(index) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        let count = 0;
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                    const newIndex = newRow * 4 + newCol;
                    if (this.board[newIndex].isMine) {
                        count++;
                    }
                }
            }
        }
        
        return count;
    }

    resetBoard() {
        // 重置棋盘状态
        this.board = Array(16).fill().map(() => ({
            isMine: false,
            number: 0,
            isRevealed: false,
            isFlagged: false
        }));
        
        // 重置显示
        this.grid.forEach(cell => {
            cell.className = 'minesweeper-cell';
            cell.textContent = '';
            cell.removeAttribute('data-number');
        });
    }

    updateDisplay() {
        // 更新显示状态
        this.grid.forEach((cell, index) => {
            const boardCell = this.board[index];
            
            cell.className = 'minesweeper-cell';
            cell.textContent = '';
            cell.removeAttribute('data-number');
            
            if (boardCell.isRevealed) {
                cell.classList.add('revealed');
                if (boardCell.number > 0) {
                    cell.textContent = boardCell.number;
                    cell.dataset.number = boardCell.number;
                }
            }
            
            if (boardCell.isFlagged) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            }
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 迷宫演示类
 */
class LabyrinthDemo {
    constructor(container, grid) {
        this.container = container;
        this.grid = grid; // 25个格子的数组（5x5）
        this.maze = Array(5).fill().map(() => Array(5).fill(true)); // true=墙，false=路径
        this.startPos = [0, 0]; // 起点位置
        this.endPos = [4, 4]; // 终点位置
        this.playerPos = [0, 0]; // 当前玩家位置
        this.path = []; // 解决路径
        this.isAnimating = false;
        this.demoInterval = null;
        this.currentPathIndex = 0;
    }

    startDemo() {
        // 初始化显示
        this.resetMaze();
        
        // 立即开始第一次演示
        setTimeout(() => {
            this.runDemoSequence();
        }, 1000);
        
        // 设置定期循环
        setTimeout(() => {
            this.demoInterval = setInterval(() => {
                this.runDemoSequence();
            }, 12000); // 每12秒一个循环
        }, 13000);
    }

    stopDemo() {
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
    }

    async runDemoSequence() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        try {
            // console.log('=== 开始迷宫演示循环 ===');
            
            // 重置迷宫
            this.resetMaze();
            await this.delay(500);
            
            // 生成迷宫（从左上角到右下角的对角线动画）
            await this.generateMazeWithAnimation();
            await this.delay(800);
            
            // 寻找路径
            this.findPath();
            
            // 演示走迷宫过程
            await this.walkThroughMaze();
            await this.delay(1000);
            
            // 胜利效果
            this.container.classList.add('victory');
            await this.delay(1500);
            this.container.classList.remove('victory');
            
            // console.log('=== 迷宫演示循环完成 ===');
            
        } catch (error) {
            // console.warn('Labyrinth Demo animation error:', error);
            this.resetMaze();
        } finally {
            this.isAnimating = false;
        }
    }

    resetMaze() {
        // 重置迷宫为全墙
        this.maze = Array(5).fill().map(() => Array(5).fill(true));
        this.playerPos = [0, 0];
        this.currentPathIndex = 0;
        this.path = [];
        
        // 重置显示
        this.grid.forEach((cell, index) => {
            cell.className = 'labyrinth-cell';
            cell.textContent = '';
        });
        
        this.updateDisplay();
    }

    async generateMazeWithAnimation() {
        // console.log('开始生成迷宫...');
        
        // 使用随机DFS算法生成迷宫
        const mazePattern = this.generateRandomMaze();
        
        // 从左上角到右下角的对角线生成动画
        const animationOrder = [];
        for (let diagonal = 0; diagonal < 9; diagonal++) {
            for (let row = 0; row < 5; row++) {
                const col = diagonal - row;
                if (col >= 0 && col < 5) {
                    animationOrder.push([row, col]);
                }
            }
        }
        
        // 按顺序生成每个格子
        for (const [row, col] of animationOrder) {
            const index = row * 5 + col;
            const cell = this.grid[index];
            
            this.maze[row][col] = mazePattern[row][col];
            
            // 添加生成动画
            cell.classList.add('generating');
            
            // 设置格子类型
            if (row === 0 && col === 0) {
                cell.classList.add('start', 'path');
                cell.textContent = 'S';
                this.startPos = [row, col];
            } else if (row === 4 && col === 4) {
                cell.classList.add('end', 'path');
                cell.textContent = 'E';
                this.endPos = [row, col];
            } else if (!mazePattern[row][col]) {
                cell.classList.add('path');
            }
            
            // 移除生成动画
            setTimeout(() => {
                cell.classList.remove('generating');
            }, 300);
            
            await this.delay(120); // 平滑的生成动画
        }
        
        // console.log('迷宫生成完成');
    }

    /**
     * 随机生成迷宫 - 使用递归回溯算法变体
     * 确保从起点到终点有路径
     * @returns {boolean[][]} 5x5 的二维数组，true=墙，false=路径
     *                        保证 maze[0][0] 和 maze[4][4] 为 false（起点和终点）
     *                        保证从起点到终点存在有效路径
     */
    generateRandomMaze() {
        // 严格定义迷宫尺寸常量
        const MAZE_SIZE = 5;
        const MIN_ROW = 0;
        const MAX_ROW = MAZE_SIZE - 1; // 4
        const MIN_COL = 0;
        const MAX_COL = MAZE_SIZE - 1; // 4
        
        // 起点和终点位置（严格固定）
        const START_ROW = 0;
        const START_COL = 0;
        const END_ROW = MAX_ROW;
        const END_COL = MAX_COL;
        
        // 辅助函数：检查坐标是否在有效范围内
        const isValidPosition = (row, col) => {
            return row >= MIN_ROW && row <= MAX_ROW && col >= MIN_COL && col <= MAX_COL;
        };
        
        // 辅助函数：检查是否为起点或终点
        const isStartOrEnd = (row, col) => {
            return (row === START_ROW && col === START_COL) || 
                   (row === END_ROW && col === END_COL);
        };
        
        // 辅助函数：随机打乱数组
        const shuffleArray = (arr) => {
            const newArr = [...arr];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        };
        
        // 辅助函数：BFS检查从起点是否能到达终点
        const canReachEndFromStart = (maze) => {
            const visited = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(false));
            const queue = [[START_ROW, START_COL]];
            visited[START_ROW][START_COL] = true;
            
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            
            while (queue.length > 0) {
                const [row, col] = queue.shift();
                
                if (row === END_ROW && col === END_COL) {
                    return true;
                }
                
                for (const [dr, dc] of dirs) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    
                    if (isValidPosition(newRow, newCol) && 
                        !visited[newRow][newCol] && 
                        !maze[newRow][newCol]) {
                        visited[newRow][newCol] = true;
                        queue.push([newRow, newCol]);
                    }
                }
            }
            
            return false;
        };
        
        // 初始化迷宫为全墙（严格使用 MAZE_SIZE）
        const maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(true));
        
        // 起点和终点必须是路径
        maze[START_ROW][START_COL] = false;
        maze[END_ROW][END_COL] = false;
        
        // 使用随机DFS生成迷宫路径
        const visited = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(false));
        const stack = [[START_ROW, START_COL]];
        visited[START_ROW][START_COL] = true;
        
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 上下左右
        
        while (stack.length > 0) {
            const [row, col] = stack[stack.length - 1];
            const shuffledDirs = shuffleArray(directions);
            
            let found = false;
            for (const [dr, dc] of shuffledDirs) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                // 严格边界检查
                if (isValidPosition(newRow, newCol) && !visited[newRow][newCol]) {
                    visited[newRow][newCol] = true;
                    maze[newRow][newCol] = false; // 打通路径
                    stack.push([newRow, newCol]);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                stack.pop();
            }
        }
        
        // 随机添加一些额外的墙壁，增加迷宫复杂度
        const MIN_EXTRA_WALLS = 2;
        const MAX_EXTRA_WALLS = 5;
        const wallCount = Math.floor(Math.random() * (MAX_EXTRA_WALLS - MIN_EXTRA_WALLS + 1)) + MIN_EXTRA_WALLS;
        
        for (let i = 0; i < wallCount; i++) {
            // 严格使用 MAZE_SIZE 范围生成随机坐标
            const row = Math.floor(Math.random() * MAZE_SIZE);
            const col = Math.floor(Math.random() * MAZE_SIZE);
            
            // 不能封住起点和终点
            if (isStartOrEnd(row, col)) continue;
            
            // 临时设置墙壁
            const original = maze[row][col];
            maze[row][col] = true;
            
            // 检查是否仍然可达终点
            if (!canReachEndFromStart(maze)) {
                maze[row][col] = original; // 恢复
            }
        }
        
        // 确保有足够的路径使迷宫有趣
        // 在中间区域（1-3行，1-3列）随机打开一些格子增加多条路径
        const INNER_MIN = 1;
        const INNER_MAX = 3;
        const MIN_EXTRA_OPENINGS = 1;
        const MAX_EXTRA_OPENINGS = 3;
        const openCount = Math.floor(Math.random() * (MAX_EXTRA_OPENINGS - MIN_EXTRA_OPENINGS + 1)) + MIN_EXTRA_OPENINGS;
        
        for (let i = 0; i < openCount; i++) {
            // 严格限制在内部区域
            const row = Math.floor(Math.random() * (INNER_MAX - INNER_MIN + 1)) + INNER_MIN;
            const col = Math.floor(Math.random() * (INNER_MAX - INNER_MIN + 1)) + INNER_MIN;
            
            if (maze[row][col]) {
                maze[row][col] = false;
            }
        }
        
        // 最终验证：确保迷宫尺寸正确且路径可达
        if (maze.length !== MAZE_SIZE || maze[0].length !== MAZE_SIZE) {
            console.error('迷宫尺寸错误，重新生成');
            return this.generateRandomMaze();
        }
        
        if (!canReachEndFromStart(maze)) {
            console.warn('路径不可达，重新生成');
            return this.generateRandomMaze();
        }
        
        return maze;
    }

    /**
     * 检查从起点是否能到达终点
     */
    canReachEnd(maze) {
        const visited = Array(5).fill().map(() => Array(5).fill(false));
        const queue = [[0, 0]];
        visited[0][0] = true;
        
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        while (queue.length > 0) {
            const [row, col] = queue.shift();
            
            if (row === 4 && col === 4) {
                return true;
            }
            
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5 
                    && !visited[newRow][newCol] && !maze[newRow][newCol]) {
                    visited[newRow][newCol] = true;
                    queue.push([newRow, newCol]);
                }
            }
        }
        
        return false;
    }

    findPath() {
        // 使用简单的A*算法寻找从起点到终点的路径
        const start = this.startPos;
        const end = this.endPos;
        
        const openSet = [{pos: start, path: [start], cost: 0, heuristic: this.manhattanDistance(start, end)}];
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            // 找到f值最小的节点
            openSet.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));
            const current = openSet.shift();
            
            const posKey = `${current.pos[0]},${current.pos[1]}`;
            if (closedSet.has(posKey)) continue;
            closedSet.add(posKey);
            
            // 如果到达终点
            if (current.pos[0] === end[0] && current.pos[1] === end[1]) {
                this.path = current.path;
                // console.log('找到路径:', this.path);
                return;
            }
            
            // 探索相邻的格子
            const neighbors = this.getValidNeighbors(current.pos);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor[0]},${neighbor[1]}`;
                if (!closedSet.has(neighborKey)) {
                    openSet.push({
                        pos: neighbor,
                        path: [...current.path, neighbor],
                        cost: current.cost + 1,
                        heuristic: this.manhattanDistance(neighbor, end)
                    });
                }
            }
        }
        
        // console.log('无法找到路径');
    }

    getValidNeighbors(pos) {
        const [row, col] = pos;
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 上下左右
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5 && !this.maze[newRow][newCol]) {
                neighbors.push([newRow, newCol]);
            }
        }
        
        return neighbors;
    }

    manhattanDistance(pos1, pos2) {
        return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
    }

    async walkThroughMaze() {
        if (this.path.length === 0) {
            // console.log('没有找到路径');
            return;
        }
        
        // console.log('开始走迷宫...');
        
        // 重置起点显示
        const startIndex = this.startPos[0] * 5 + this.startPos[1];
        this.grid[startIndex].classList.remove('player');
        this.grid[startIndex].classList.add('start', 'path');
        this.grid[startIndex].textContent = 'S';
        
        for (let i = 0; i < this.path.length; i++) {
            const [row, col] = this.path[i];
            const index = row * 5 + col;
            const cell = this.grid[index];
            
            // 移除之前的玩家位置
            if (i > 0) {
                const prevPos = this.path[i - 1];
                const prevIndex = prevPos[0] * 5 + prevPos[1];
                const prevCell = this.grid[prevIndex];
                
                prevCell.classList.remove('player');
                prevCell.classList.add('visited');
                
                // 如果是起点，保持起点标记
                if (prevPos[0] === this.startPos[0] && prevPos[1] === this.startPos[1]) {
                    prevCell.textContent = 'S';
                } else {
                    prevCell.textContent = '';
                }
            }
            
            // 更新当前位置
            this.playerPos = [row, col];
            
            // 如果是终点
            if (row === this.endPos[0] && col === this.endPos[1]) {
                cell.classList.add('player', 'end');
                cell.textContent = '✓';
                // console.log('到达终点！');
            } else {
                cell.classList.remove('visited', 'start');
                cell.classList.add('player', 'path');
                cell.textContent = '●';
            }
            
            await this.delay(400); // 连贯但不太快的移动速度
        }
        
        // console.log('迷宫行走完成');
    }

    updateDisplay() {
        // 更新显示状态
        this.grid.forEach((cell, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            
            cell.className = 'labyrinth-cell';
            cell.textContent = '';
            
            if (this.maze[row][col]) {
                // 墙
                // 保持默认样式
            } else {
                // 路径
                cell.classList.add('path');
            }
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化演示管理器
const gameDemoManager = new GameDemoManager();

// 导出给其他脚本使用
window.GameDemoManager = GameDemoManager;
window.gameDemoManager = gameDemoManager;

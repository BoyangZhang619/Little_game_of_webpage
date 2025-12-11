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
        // 这里可以添加其他游戏的演示
        // this.initLabyrinthDemo();
        // this.initMinesweeperDemo();
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

    setupKlotskiStyles() {
        // 检查是否已经添加了样式
        if (document.getElementById('klotski-demo-styles')) return;

        const style = document.createElement('style');
        style.id = 'klotski-demo-styles';
        style.textContent = `
            .klotski-demo-container {
                position: relative;
                width: 170px;
                height: 170px;
                margin: auto;
                top: 50%;
                transform: translateY(-50%);
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 10px;
                padding: 12px;
            }

            .klotski-cell {
                width: 75px;
                height: 75px;
                background: rgba(0, 0, 0, 0.02);
                border-radius: 6px;
                position: relative;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }

            .klotski-block {
                width: 100%;
                height: 100%;
                background: #f8f9fa;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #495057;
                font-weight: 500;
                font-size: 18px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
                position: absolute;
                top: 0;
                left: 0;
                cursor: pointer;
                border: 1px solid rgba(0, 0, 0, 0.08);
            }

            .klotski-block:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
            }

            .klotski-block.moving {
                z-index: 10;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
                animation: moveGlow 0.3s ease-out;
            }

            @keyframes moveGlow {
                0% { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1); }
                50% { box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2), 0 6px 15px rgba(0, 0, 0, 0.15); }
                100% { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1); }
            }

            /* 统一的灰度配色方案 - 现代简约 */
            .klotski-block[data-number="1"] {
                background: #f1f3f4;
                color: #3c4043;
                border-left: 3px solid #5f6368;
            }

            .klotski-block[data-number="2"] {
                background: #e8eaed;
                color: #3c4043;
                border-left: 3px solid #80868b;
            }

            .klotski-block[data-number="3"] {
                background: #dadce0;
                color: #3c4043;
                border-left: 3px solid #9aa0a6;
            }

            .klotski-block[data-number="1"]:hover {
                background: #e8eaed;
            }

            .klotski-block[data-number="2"]:hover {
                background: #dadce0;
            }

            .klotski-block[data-number="3"]:hover {
                background: #bdc1c6;
            }

            /* 解决完成时的庆祝效果 - 更简约 */
            .klotski-demo-container.solved .klotski-block {
                animation: celebration 0.5s ease-out;
            }

            @keyframes celebration {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            /* 空位效果 - 极简 */
            .klotski-cell:empty {
                background: rgba(0, 0, 0, 0.01);
                border: 1px dashed rgba(0, 0, 0, 0.06);
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
                position: relative;
                width: 170px;
                height: 170px;
                margin: auto;
                top: 50%;
                transform: translateY(-50%);
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap: 10px;
                padding: 12px;
            }

            .game-2048-cell {
                width: 42px;
                height: 42px;
                background: rgba(0, 0, 0, 0.02);
                border-radius: 6px;
                position: relative;
                border: 1px solid rgba(0, 0, 0, 0.05);
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
                font-weight: 500;
                font-size: 14px;
                position: absolute;
                top: 0;
                left: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
                border: 1px solid rgba(0, 0, 0, 0.08);
            }

            /* 2048数字块颜色 - 借鉴华容道的现代灰度配色 */
            .game-2048-tile[data-value="2"] { 
                background: #f1f3f4; 
                color: #3c4043; 
                border-left: 3px solid #5f6368;
            }
            .game-2048-tile[data-value="4"] { 
                background: #e8eaed; 
                color: #3c4043; 
                border-left: 3px solid #80868b;
            }
            .game-2048-tile[data-value="8"] { 
                background: #dadce0; 
                color: #3c4043; 
                border-left: 3px solid #9aa0a6;
            }
            .game-2048-tile[data-value="16"] { 
                background: #bdc1c6; 
                color: #3c4043; 
                border-left: 3px solid #5f6368;
            }
            .game-2048-tile[data-value="32"] { 
                background: #9aa0a6; 
                color: #ffffff; 
                border-left: 3px solid #5f6368;
            }
            .game-2048-tile[data-value="64"] { 
                background: #80868b; 
                color: #ffffff; 
                border-left: 3px solid #5f6368;
            }
            .game-2048-tile[data-value="128"] { 
                background: #5f6368; 
                color: #ffffff; 
                border-left: 3px solid #3c4043;
                font-size: 12px;
            }
            .game-2048-tile[data-value="256"] { 
                background: #3c4043; 
                color: #ffffff; 
                border-left: 3px solid #202124;
                font-size: 12px;
            }
            .game-2048-tile[data-value="512"] { 
                background: #202124; 
                color: #ffffff; 
                border-left: 3px solid #000000;
                font-size: 12px;
            }

            /* 悬停效果 */
            .game-2048-tile:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
            }

            /* 新出现的块动画 */
            .game-2048-tile.new {
                animation: tileAppear 0.3s ease-out;
            }

            @keyframes tileAppear {
                0% { transform: scale(0); }
                100% { transform: scale(1); }
            }

            /* 合并动画 */
            .game-2048-tile.merged {
                animation: tileMerge 0.3s ease-out;
            }

            @keyframes tileMerge {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            /* 移动中的块 */
            .game-2048-tile.moving {
                z-index: 10;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
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
            console.log('=== 开始新的演示循环 ===');
            
            // 确保状态是正确的，如果不是则重置
            if (!this.isInCorrectOrder()) {
                console.log('重置状态到正确位置');
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
            
            console.log('=== 演示循环完成 ===');
            
        } catch (error) {
            console.warn('Demo animation error:', error);
            // 发生错误时重置状态
            this.state = [1, 2, 3, 0];
            this.updateDisplay();
        } finally {
            this.isAnimating = false;
        }
    }

    async shuffleBlocks() {
        // 更简单有效的打乱序列: [1,2,3,0] -> [2,1,0,3]
        console.log('开始打乱，当前状态:', this.state);
        
        await this.moveBlock(2); // [1,2,3,0] -> [1,2,0,3] (3移动到空位)
        console.log('步骤1:', this.state);
        await this.delay(600);
        
        await this.moveBlock(1); // [1,2,0,3] -> [1,0,2,3] (2移动到空位)
        console.log('步骤2:', this.state);
        await this.delay(600);
        
        await this.moveBlock(0); // [1,0,2,3] -> [0,1,2,3] (1移动到空位)
        console.log('步骤3:', this.state);
        await this.delay(600);
    }

    async solveToCorrectOrder() {
        // 从[0,1,2,3]解回[1,2,3,0]
        console.log('开始解决，当前状态:', this.state);
        
        await this.moveBlock(1); // [0,1,2,3] -> [1,0,2,3] (1移动到空位)
        console.log('解决步骤1:', this.state);
        await this.delay(600);
        
        await this.moveBlock(2); // [1,0,2,3] -> [1,2,0,3] (2移动到空位)
        console.log('解决步骤2:', this.state);
        await this.delay(600);
        
        await this.moveBlock(3); // [1,2,0,3] -> [1,2,3,0] (3移动到空位)
        console.log('解决步骤3:', this.state);
        await this.delay(600);
    }

    async moveBlock(fromPos) {
        const emptyPos = this.state.indexOf(0);
        
        console.log(`尝试移动位置 ${fromPos} 的方块到空位 ${emptyPos}`);
        console.log(`当前状态:`, this.state);
        
        // 检查是否可以移动（相邻位置）
        if (!this.canMove(fromPos, emptyPos)) {
            console.warn(`无法移动: 位置 ${fromPos} 和空位 ${emptyPos} 不相邻`);
            return;
        }
        
        const blockElement = this.getBlockAtPosition(fromPos);
        if (!blockElement) {
            console.warn(`位置 ${fromPos} 没有找到方块元素`);
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
        
        console.log(`移动完成，新状态:`, this.state);
        
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
    }

    startDemo() {
        // 初始化状态显示
        this.clearBoard();
        
        // 等待一下再开始
        setTimeout(() => {
            this.demoInterval = setInterval(() => {
                this.runDemoSequence();
            }, 6000); // 每6秒一个循环
        }, 250);
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
            console.log('=== 开始2048演示循环 ===');
            
            // 清空棋盘
            this.clearBoard();
            await this.delay(250);
            
            // 添加初始数字
            this.addRandomTile();
            await this.delay(250);
            this.addRandomTile();
            await this.delay(800);
            
            // 进行几步移动和合并
            await this.demoMoves();
            
            await this.delay(1000);
            
            console.log('=== 2048演示循环完成 ===');
            
        } catch (error) {
            console.warn('2048 Demo animation error:', error);
            this.clearBoard();
        } finally {
            this.isAnimating = false;
        }
    }

    async demoMoves() {
        // 演示一些典型的2048移动
        await this.moveRight();
        await this.delay(1000);
        
        this.addRandomTile();
        await this.delay(1000);
        
        await this.moveDown();
        await this.delay(1000);
        
        this.addRandomTile();
        await this.delay(1000);
        
        await this.moveLeft();
        await this.delay(1000);
    }

    async moveRight() {
        console.log('向右移动');
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
    }

    async moveDown() {
        console.log('向下移动');
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
    }

    async moveLeft() {
        console.log('向左移动');
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

// 初始化演示管理器
const gameDemoManager = new GameDemoManager();

// 导出给其他脚本使用
window.GameDemoManager = GameDemoManager;
window.gameDemoManager = gameDemoManager;

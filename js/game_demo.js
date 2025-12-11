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
                position: relative;
                width: 255px;
                height: 255px;
                margin: auto;
                top: 50%;
                transform: translateY(-50%);
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 15px;
                padding: 18px;
            }

            .klotski-cell {
                width: 112px;
                height: 112px;
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
                font-size: 27px;
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
                width: 255px;
                height: 255px;
                margin: auto;
                top: 50%;
                transform: translateY(-50%);
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap: 15px;
                padding: 18px;
            }

            .game-2048-cell {
                width: 63px;
                height: 63px;
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
                font-size: 21px;
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
                font-size: 18px;
            }
            .game-2048-tile[data-value="256"] { 
                background: #3c4043; 
                color: #ffffff; 
                border-left: 3px solid #202124;
                font-size: 18px;
            }
            .game-2048-tile[data-value="512"] { 
                background: #202124; 
                color: #ffffff; 
                border-left: 3px solid #000000;
                font-size: 18px;
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

    setupMinesweeperStyles() {
        // 检查是否已经添加了样式
        if (document.getElementById('minesweeper-demo-styles')) return;

        const style = document.createElement('style');
        style.id = 'minesweeper-demo-styles';
        style.textContent = `
            .minesweeper-demo-container {
                position: relative;
                width: 255px;
                height: 255px;
                margin: auto;
                top: 50%;
                transform: translateY(-50%);
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: repeat(4, 1fr);
                gap: 6px;
                padding: 18px;
            }

            .minesweeper-cell {
                width: 52px;
                height: 52px;
                background: #bdc1c6;
                border-radius: 4px;
                position: relative;
                border: 2px outset #bdc1c6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 500;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .minesweeper-cell:hover {
                background: #dadce0;
            }

            /* 已点击的格子 */
            .minesweeper-cell.revealed {
                background: #f8f9fa;
                border: 1px inset #e8eaed;
                color: #3c4043;
            }

            /* 数字颜色 */
            .minesweeper-cell.revealed[data-number="1"] { color: #1a73e8; }
            .minesweeper-cell.revealed[data-number="2"] { color: #34a853; }
            .minesweeper-cell.revealed[data-number="3"] { color: #ea4335; }
            .minesweeper-cell.revealed[data-number="4"] { color: #673ab7; }
            .minesweeper-cell.revealed[data-number="5"] { color: #ff5722; }
            .minesweeper-cell.revealed[data-number="6"] { color: #795548; }

            /* 雷 */
            .minesweeper-cell.mine {
                background: #ea4335;
                color: #ffffff;
                animation: explode 0.3s ease-out;
            }

            @keyframes explode {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            /* 旗帜标记 */
            .minesweeper-cell.flagged {
                background: #f1f3f4;
                color: #ea4335;
                border: 2px inset #e8eaed;
            }

            /* 安全区域动画 */
            .minesweeper-cell.safe {
                animation: safeReveal 0.4s ease-out;
            }

            @keyframes safeReveal {
                0% { transform: scale(1); background: #bdc1c6; }
                50% { transform: scale(1.05); background: #e8eaed; }
                100% { transform: scale(1); background: #f8f9fa; }
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
                position: relative;
                width: 255px;
                height: 255px;
                margin: auto;
                top: 50%;
                transform: translateY(-50%);
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-template-rows: repeat(5, 1fr);
                gap: 3px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid rgba(0, 0, 0, 0.08);
            }

            .labyrinth-cell {
                width: 41px;
                height: 41px;
                background: #84756a;
                border-radius: 2px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                color: #ffffff;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(0, 0, 0, 0.1);
            }

            /* 路径（通道） */
            .labyrinth-cell.path {
                background: #f8f7f0;
                color: #3c4043;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }

            /* 起点 */
            .labyrinth-cell.start {
                background: #58542f;
                color: #ffffff;
                font-size: 14px;
                animation: startPulse 2s ease-in-out infinite;
            }

            @keyframes startPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            /* 终点 */
            .labyrinth-cell.end {
                background: #564232;
                color: #ffffff;
                font-size: 14px;
                animation: endGlow 3s ease-in-out infinite;
            }

            @keyframes endGlow {
                0%, 100% { box-shadow: 0 0 0 rgba(86, 66, 50, 0.4); }
                50% { box-shadow: 0 0 10px rgba(86, 66, 50, 0.8); }
            }

            /* 当前位置（玩家） */
            .labyrinth-cell.player {
                background: rgba(86, 66, 50, 0.4);
                color: #ffffff;
                transform: scale(1.1);
                box-shadow: 0 4px 8px rgba(86, 66, 50, 0.2);
                z-index: 10;
                border-radius: 50%;
                animation: playerMove 0.4s ease-out;
            }

            @keyframes playerMove {
                0% { transform: scale(1.3); }
                100% { transform: scale(1.1); }
            }

            /* 已走过的路径 */
            .labyrinth-cell.visited {
                background: linear-gradient(135deg, #f8f7f0 0%, #e8eaed 100%);
                border: 1px solid rgba(26, 115, 232, 0.2);
            }

            /* 生成动画 */
            .labyrinth-cell.generating {
                animation: cellGenerate 0.3s ease-out;
            }

            @keyframes cellGenerate {
                0% { 
                    transform: scale(0) rotate(180deg);
                    opacity: 0;
                }
                70% { 
                    transform: scale(1.1) rotate(0deg);
                    opacity: 0.8;
                }
                100% { 
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                }
            }

            /* 获胜动画 */
            .labyrinth-demo-container.victory .labyrinth-cell.path {
                animation: victoryWave 0.8s ease-in-out;
            }

            @keyframes victoryWave {
                0%, 100% { background: #f8f7f0; }
                50% { background: #e8f5e8; }
            }

            /* 重置动画 */
            .labyrinth-cell.resetting {
                animation: cellReset 0.2s ease-in-out;
            }

            @keyframes cellReset {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(0.8); }
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
        
        // 创建简单但有趣的迷宫布局
        const mazePattern = [
            [false, false, true,  false, false],
            [true,  false, true,  false, true ],
            [false, false, false, false, false],
            [true,  false, true,  true,  false],
            [false, false, false, false, false]
        ];
        
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

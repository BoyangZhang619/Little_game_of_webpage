/**
 * 处理所有底层数据库交互
 */
class GameStorageManager {
    constructor(dbName = 'ArcadeZoneDB', storeName = 'game_records', version = 1) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this.db = null;
        
        // UserDB 配置（用于获取当前登录用户）
        this.userDBName = 'UserDB';
        this.currentUserStore = 'cntUserData';
        this.userDB = null;
    }

    /**
     * 打开 UserDB 以获取当前登录用户
     */
    async openUserDB() {
        if (this.userDB) return this.userDB;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.userDBName, 3);
            request.onsuccess = (event) => {
                this.userDB = event.target.result;
                resolve(this.userDB);
            };
            request.onerror = (event) => {
                console.warn('无法打开 UserDB:', event.target.error);
                resolve(null);
            };
        });
    }

    /**
     * 获取当前登录用户的 ID
     * @returns {Promise<string|null>} 用户ID，未登录返回 null
     */
    async getCurrentUserId() {
        try {
            const db = await this.openUserDB();
            if (!db || !db.objectStoreNames.contains(this.currentUserStore)) {
                console.warn('UserDB 或 cntUserData store 不存在');
                return null;
            }
            
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.currentUserStore, 'readonly');
                const store = tx.objectStore(this.currentUserStore);
                const request = store.get('.');
                
                request.onsuccess = () => {
                    const result = request.result;
                    if (!result || !result.data) {
                        resolve(null);
                        return;
                    }
                    // 解码 Base64 获取 uid
                    try {
                        const decoded = JSON.parse(decodeURIComponent(escape(atob(result.data))));
                        resolve(decoded?.uid || null);
                    } catch (e) {
                        console.warn('解码当前用户数据失败:', e);
                        resolve(null);
                    }
                };
                request.onerror = () => {
                    console.warn('获取当前用户失败');
                    resolve(null);
                };
            });
        } catch (error) {
            console.warn('获取当前用户ID时发生错误:', error);
            return null;
        }
    }

    /**
     * 检查用户是否已登录
     * @returns {Promise<boolean>}
     */
    async isUserLoggedIn() {
        const userId = await this.getCurrentUserId();
        return userId !== null;
    }

    // 打开数据库
    async open() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            console.log('Opening IndexedDB:', this.dbName);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('userId', 'userId', { unique: false });
                    store.createIndex('gameType', 'gameType', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('result', 'result', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            request.onerror = (event) => reject(`DB Error: ${event.target.error}`);
        });
    }

    // 保存记录 (自动生成UUID，自动获取当前登录用户ID)
    async saveRecord(recordData) {
        await this.open();
        
        // 如果没有提供 userId，自动从 UserDB 获取当前登录用户
        let userId = recordData.userId;
        if (!userId) {
            userId = await this.getCurrentUserId();
            if (!userId) {
                console.warn('用户未登录，游戏记录不会被保存');
                return null; // 未登录则不保存记录
            }
        }
        
        // 确保必要的字段存在
        const finalRecord = {
            id: recordData.id || crypto.randomUUID(),
            timestamp: Date.now(),
            meta: {}, // 默认空对象防止报错
            ...recordData,
            userId: userId // 确保使用正确的 userId
        };

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.put(finalRecord);

            request.onsuccess = () => resolve(finalRecord);
            request.onerror = () => reject(request.error);
        });
    }

    // 获取某用户的所有数据
    async getUserRecords(userId) {
        await this.open();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readonly');
            const store = tx.objectStore(this.storeName);
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // 批量删除
    async deleteRecords(ids) {
        await this.open();
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        
        const promises = ids.map(id => {
            return new Promise((resolve, reject) => {
                const req = store.delete(id);
                req.onsuccess = resolve;
                req.onerror = reject;
            });
        });
        
        return Promise.all(promises);
    }
}


/**
 * 生成随机测试数据并注入 IndexedDB
 * @param {string} userId - 目标用户ID
 * @param {number} count - 要生成的记录数量
 * @param {GameStorageManager} storageManager - 存储实例
 */
async function seedRandomData(userId, count, storageManager) {
    console.log(`🚀 开始为用户 [${userId}] 生成 ${count} 条随机数据...`);

    const gameTypes = ['klotski', 'game2048', 'labyrinth', 'minesweeping'];
    const difficulties = ['easy', 'normal', 'hard'];
    const results = ['won', 'won', 'won', 'lost', 'ongoing']; // 让赢的概率大一点，好看点

    // 辅助：生成范围随机整数
    const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    // 辅助：随机数组元素
    const rItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    // 辅助：生成过去30天内的随机时间戳
    const rTime = () => Date.now() - rInt(0, 30 * 24 * 60 * 60 * 1000);

    const records = [];

    for (let i = 0; i < count; i++) {
        const gameType = rItem(gameTypes);
        const difficulty = rItem(difficulties);
        const result = rItem(results);
        
        // 基础数据
        let baseData = {
            userId: userId,
            gameType: gameType,
            timestamp: rTime(),
            result: result,
            difficulty: difficulty,
            duration: rInt(30, 600), // 30秒到10分钟
            moves: 0,
            score: 0,
            meta: {}
        };

        // 根据游戏类型生成特定的 Meta 数据和分数逻辑
        switch (gameType) {
            case 'minesweeping':
                // 扫雷逻辑：难度决定雷数和网格
                const grids = { 'easy': '9x9', 'normal': '16x16', 'hard': '16x30' };
                const mines = { 'easy': 10, 'normal': 40, 'hard': 99 };
                
                baseData.meta = {
                    gridSize: grids[difficulty],
                    mineCount: mines[difficulty]
                };
                baseData.moves = rInt(5, 50); // 点击次数
                // 赢了分高，输了分低
                baseData.score = result === 'won' ? rInt(1000, 5000) : rInt(0, 500);
                break;

            case 'game2048':
                // 2048逻辑：分数与最大方块强相关
                const tiles = [512, 1024, 2048, 4096];
                const maxTile = rItem(tiles);
                
                baseData.meta = {
                    maxTile: maxTile,
                    combo: rInt(0, 5)
                };
                baseData.moves = rInt(500, 3000);
                // 简单的分数估算
                baseData.score = maxTile * rInt(8, 12) + rInt(0, 1000); 
                break;

            case 'klotski':
                // 华容道逻辑
                const layouts = ['横刀立马', '层层设防', '水泄不通', '插翅难飞'];
                baseData.meta = {
                    layoutName: rItem(layouts),
                    minMoves: 81 // 假设最优解
                };
                baseData.moves = rInt(81, 300); // 实际步数
                baseData.score = result === 'won' ? Math.max(0, 10000 - baseData.duration * 10) : 0;
                break;

            case 'labyrinth':
                // 迷宫逻辑
                baseData.meta = {
                    pathLength: rInt(20, 100),
                    wallDensity: rInt(20, 40) + '%'
                };
                baseData.moves = rInt(50, 200);
                baseData.score = rInt(100, 1000);
                break;
        }

        records.push(baseData);
    }

    // 批量写入
    const promises = records.map(record => storageManager.saveRecord(record));
    
    await Promise.all(promises);
    console.log(`✅ 成功生成并写入 ${count} 条记录！`);
    return records;
}
// // 1. 初始化存储管理器
// const storage = new GameStorageManager();

// // 2. 定义当前用户ID (和你的业务逻辑保持一致)
// const myUserId = "user_10086";

// // 3. 执行生成函数 (例如生成 50 条数据)
// // 注意：seedRandomData 是异步的，如果在控制台直接跑，可以直接 .then
// seedRandomData(myUserId, 50, storage).then(() => {
    
//     // 4. 数据生成完后，刷新你的界面
//     // 假设你已经在页面里初始化了 dashboard
//     if (window.dashboard) {
//         console.log("刷新仪表盘视图...");
//         window.dashboard.loadData();
//     } else {
//         // 如果还没初始化，现在初始化并加载
//         window.dashboard = new GameProgressDashboard(myUserId, storage);
//         window.dashboard.loadData();
//     }
    
// });
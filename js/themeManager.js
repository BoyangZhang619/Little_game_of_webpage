/**
 * 主题管理器 - 用于子页面获取和应用主题
 * 从 UserDB 读取当前用户的主题设置
 */
class ThemeManager {
    constructor() {
        this.userDBName = 'UserDB';
        this.currentUserStore = 'cntUserData';
        this.userStoreName = 'userStore';  // 修正：正确的 store 名称
        this.userDB = null;
    }

    /**
     * 打开 UserDB
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
     * Base64 解码
     */
    decodeBase64(encoded) {
        if (!encoded) return null;
        try {
            return JSON.parse(decodeURIComponent(escape(atob(encoded))));
        } catch (e) {
            console.warn('Base64 解码失败:', e);
            return null;
        }
    }

    /**
     * 获取当前用户的主题设置
     * @returns {Promise<string>} 'dark' 或 'light'
     */
    async getCurrentTheme() {
        try {
            const db = await this.openUserDB();
            if (!db) return 'light';

            // 获取当前登录用户ID
            const currentUserData = await this.dbGet(db, this.currentUserStore, '.');
            if (!currentUserData) return 'light';

            const decoded = this.decodeBase64(currentUserData);
            const userIdKey = decoded?.uid;
            if (!userIdKey) return 'light';

            // 获取用户数据
            let userData = await this.dbGet(db, this.userStoreName, userIdKey);
            if (!userData) {
                userData = await this.dbGetUserByUid(db, this.userStoreName, userIdKey);
            }
            if (!userData) return 'light';

            const user = this.decodeBase64(userData);
            return user?.theme || 'light';
        } catch (error) {
            console.warn('[ThemeManager] 获取主题失败:', error);
            return 'light';
        }
    }

    /**
     * 从数据库获取数据
     */
    dbGet(db, storeName, key) {
        return new Promise((resolve) => {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve(null);
                return;
            }
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result?.data || null);
            request.onerror = () => resolve(null);
        });
    }
    
    /**
     * 遍历数据库获取用户数据（备用方法）
     */
    dbGetUserByUid(db, storeName, targetUid) {
        return new Promise((resolve) => {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve(null);
                return;
            }
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.openCursor();
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.id === targetUid) {
                        resolve(cursor.value.data);
                        return;
                    }
                    cursor.continue();
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => resolve(null);
        });
    }

    /**
     * 应用主题到页面
     * @param {string} theme - 'dark' 或 'light'
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    /**
     * 初始化主题 - 自动获取并应用
     */
    async init() {
        const theme = await this.getCurrentTheme();
        this.applyTheme(theme);
        return theme;
    }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', async () => {
    window.themeManager = new ThemeManager();
    await window.themeManager.init();
});

document.querySelector("#navProgress").addEventListener('click', async () => {
    // 快捷方式跳转到设置中的进度页面
    if (!isSettingShow) {
        isSettingShow = true;
        setSetting("show");
    }
    // 切换到进度页面
    setTimeout(async () => {
        const progressTab = document.querySelector('[data-target="progress"]');
        if (progressTab) {
            // 移除其他tab的active状态
            document.querySelectorAll('.settingClass').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.settingContent').forEach(content => content.style.display = 'none');

            // 激活进度tab
            progressTab.classList.add('active');
            document.querySelector('#progressPart').style.display = 'block';

            // 加载进度数据
            // 1. 初始化存储层
            const storage = new GameStorageManager();

            // 2. 从 UserDB 获取当前登录用户ID
            const currentUserId = await storage.getCurrentUserId();
            console.log("Progress页面获取到的用户ID:", currentUserId);
            
            if (!currentUserId) {
                console.log('用户未登录，无法显示游戏进度');
                // 可以在这里显示一个提示让用户登录
                const tableBody = document.getElementById('progressTableBody');
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">请先登录以查看游戏进度</td></tr>';
                }
                return;
            }

            // 3. 初始化 UI 仪表盘
            const dashboard = new GameProgressDashboard(currentUserId, storage);
            
            // 保存到 window 供其他地方使用（如刷新按钮）
            window.dashboard = dashboard;

            // 4. 直接加载数据（页面已加载完成，不需要等待 DOMContentLoaded）
            await dashboard.loadData();
        }
    }, 800);
});
/*
{
  "id": "uuid-v4-string",           // 唯一记录ID
  "userId": "user_10086",           // 用户ID (用于多用户切换)
  "gameType": "minesweeping",       // 枚举: klotski, game2048, labyrinth, minesweeping
  "timestamp": 1703688000000,       // 游戏结束时间 (毫秒)
  "startTime": 1703687000000,       // 开始时间 (可选)
  
  // 核心表现数据
  "result": "won",                  // won, lost, ongoing, abandoned
  "score": 1200,                    // 统一数值分，用于排序
  "duration": 45,                   // 耗时 (秒)
  "moves": 12,                      // 操作步数
  
  // 难度定义
  "difficulty": "hard",             // easy, normal, hard, custom
  
  // 可拓展元数据 (针对不同游戏的特有参数打包在这里)
  "meta": {
    "gridSize": "16x30",            // 扫雷/2048/迷宫 通用
    "mineCount": 99,                // 扫雷特有
    "maxTile": 2048,                // 2048特有
    "layoutName": "横刀立马",       // 华容道特有
    "3bv": 150                      // 扫雷特有高阶数据
  }
}
*/
/**
 * 负责 UI 渲染、数据统计、筛选和分页
 */
class GameProgressDashboard {
    constructor(userId, storageManager) {
        this.userId = userId;
        this.storage = storageManager;
        this.allRecords = [];      // 原始数据
        this.currentRecords = [];  // 筛选后的数据

        // 分页状态
        this.pageSize = 10;
        this.currentPage = 1;

        // 缓存 DOM 元素
        this.dom = {
            tableBody: document.getElementById('progressTableBody'),
            pageInfo: document.getElementById('pageInfo'),
            prevBtn: document.getElementById('prevPage'),
            nextBtn: document.getElementById('nextPage'),
            currentPageSpan: document.getElementById('currentPage'),
            recordsCount: document.getElementById('recordsCount'),
            // Filters
            gameType: document.getElementById('gameTypeFilter'),
            sortBy: document.getElementById('sortByFilter'),
            result: document.getElementById('resultFilter'),
            applyBtn: document.getElementById('applyFilters'),
            refreshBtn: document.getElementById('refreshData'),
            clearSelectedBtn: document.getElementById('clearSelectedData'),
            selectAll: document.getElementById('selectAll')
        };

        this.initEvents();
    }

    initEvents() {
        this.dom.applyBtn.addEventListener('click', () => this.applyFilters());
        this.dom.refreshBtn.addEventListener('click', () => this.loadData());
        this.dom.prevBtn.addEventListener('click', () => this.changePage(-1));
        this.dom.nextBtn.addEventListener('click', () => this.changePage(1));

        // 全选/反选逻辑
        this.dom.selectAll.addEventListener('change', (e) => {
            const checks = document.querySelectorAll('.record-checkbox');
            checks.forEach(c => c.checked = e.target.checked);
        });

        this.dom.clearSelectedBtn.addEventListener('click', () => this.deleteSelected());
    }

    // 1. 加载数据的主入口
    async loadData() {
        try {
            console.log("正在加载用户记录，用户ID:", this.userId);
            this.allRecords = await this.storage.getUserRecords(this.userId);
            console.log("加载到的记录数量:", this.allRecords.length, this.allRecords);
            
            // 默认按时间倒序
            this.allRecords.sort((a, b) => b.timestamp - a.timestamp);

            this.updateGlobalStats(); // 更新顶部的卡片统计
            this.applyFilters();      // 应用筛选并渲染表格
        } catch (error) {
            console.error("Failed to load records:", error);
            this.renderEmptyState("Database connection error");
        }
    }

    // 2. 核心筛选逻辑
    applyFilters() {
        const typeFilter = this.dom.gameType.value;
        const resultFilter = this.dom.result.value;
        const sortFilter = this.dom.sortBy.value;

        // Step A: 过滤
        let filtered = this.allRecords.filter(r => {
            const matchType = typeFilter === 'all' || r.gameType === typeFilter;
            const matchResult = resultFilter === 'all' || r.result === resultFilter;
            return matchType && matchResult;
        });

        // Step B: 排序
        filtered.sort((a, b) => {
            switch (sortFilter) {
                case 'date': return b.timestamp - a.timestamp;
                case 'score': return b.score - a.score; // 假设分数越高越好
                case 'duration': return a.duration - b.duration; // 耗时越短越好
                case 'moves': return a.moves - b.moves;
                case 'difficulty': return a.difficulty.localeCompare(b.difficulty);
                default: return 0;
            }
        });

        this.currentRecords = filtered;
        this.currentPage = 1;
        this.renderTable();
        this.updatePagination();
    }

    // 3. 统计逻辑 (更新卡片)
    updateGlobalStats() {
        const games = ['klotski', 'game2048', 'labyrinth', 'minesweeping'];

        games.forEach(game => {
            const records = this.allRecords.filter(r => r.gameType === game);
            const wonRecords = records.filter(r => r.result === 'won');

            // 基础统计
            const total = records.length;
            const winRate = total > 0 ? Math.round((wonRecords.length / total) * 100) : 0;

            // 最佳分数 (不同游戏逻辑不同，这里做简化处理，假设Score字段通用)
            const bestScore = wonRecords.length > 0
                ? Math.max(...wonRecords.map(r => r.score))
                : '--';

            // 平均耗时
            const avgTimeVal = wonRecords.length > 0
                ? Math.round(wonRecords.reduce((acc, r) => acc + r.duration, 0) / wonRecords.length)
                : 0;

            // 更新 DOM (确保HTML里有对应的ID)
            const setText = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };

            setText(`${game}Total`, `${total} plays`);
            setText(`${game}BestScore`, bestScore);
            setText(`${game}WinRate`, `${winRate}%`);
            setText(`${game}AvgTime`, this.formatDuration(avgTimeVal));
        });
    }

    // 4. 表格渲染
    renderTable() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.currentRecords.slice(start, end);

        this.dom.recordsCount.innerText = `${this.currentRecords.length} records found`;
        this.dom.tableBody.innerHTML = '';

        if (pageData.length === 0) {
            this.renderEmptyState();
            return;
        }

        pageData.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" class="record-checkbox" value="${record.id}"></td>
                <td>
                    <div class="game-cell">
                        <span class="game-icon">${this.getGameIcon(record.gameType)}</span>
                        <span>${this.formatGameName(record.gameType)}</span>
                    </div>
                </td>
                <td>${new Date(record.timestamp).toLocaleString()}</td>
                <td>${this.formatDuration(record.duration)}</td>
                <td class="font-bold">${record.score}</td>
                <td>${record.moves}</td>
                <td><span class="status-badge ${record.result}">${record.result}</span></td>
                <td>
                    ${record.difficulty} 
                    <span class="meta-tooltip" title="${this.formatMetaTooltip(record.meta)}">ℹ️</span>
                </td>
                <td>
                    <button class="action-btn" onclick="deleteSingle('${record.id}')">🗑️</button>
                </td>
            `;
            this.dom.tableBody.appendChild(tr);
        });
    }

    // 辅助：格式化 Meta 信息为提示文本
    formatMetaTooltip(meta) {
        if (!meta) return '';
        return Object.entries(meta)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n');
    }

    // 辅助：时间格式化 (秒 -> MM:SS)
    formatDuration(seconds) {
        if (!seconds && seconds !== 0) return '--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    }

    // 辅助：图标映射
    getGameIcon(type) {
        const map = {
            'klotski': '🧩', 'game2048': '🎯',
            'labyrinth': '🌀', 'minesweeping': '💣'
        };
        return map[type] || '🎮';
    }

    formatGameName(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    renderEmptyState(msg = "No game records found") {
        this.dom.tableBody.innerHTML = `
            <tr class="no-data-row">
                <td colspan="9">
                    <div class="no-data"><div class="no-data-icon">📭</div><p>${msg}</p></div>
                </td>
            </tr>`;
    }

    // 分页控制
    changePage(delta) {
        const totalPages = Math.ceil(this.currentRecords.length / this.pageSize);
        const newPage = this.currentPage + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderTable();
            this.updatePagination();
        }
    }

    updatePagination() {
        const totalPages = Math.max(1, Math.ceil(this.currentRecords.length / this.pageSize));
        this.dom.currentPageSpan.innerText = `${this.currentPage} / ${totalPages}`;
        this.dom.prevBtn.disabled = this.currentPage === 1;
        this.dom.nextBtn.disabled = this.currentPage === totalPages;

        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.currentRecords.length);
        this.dom.pageInfo.innerText = this.currentRecords.length > 0
            ? `Showing ${start}-${end} of ${this.currentRecords.length}`
            : 'No records';
    }

    // 删除选中
    async deleteSelected() {
        const checks = document.querySelectorAll('.record-checkbox:checked');
        const ids = Array.from(checks).map(c => c.value);
        if (ids.length === 0) return;

        if (confirm(`Delete ${ids.length} records?`)) {
            await this.storage.deleteRecords(ids);
            this.loadData(); // 重新加载
            this.dom.selectAll.checked = false;
        }
    }
}
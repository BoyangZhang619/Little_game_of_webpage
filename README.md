# 🎮 RETROTOPIC - Little Game Collection

<p align="center">
  <img src="./img/iconB&Wpicture.png" alt="Retrotopic Logo" width="120">
</p>

<p align="center">
  <b>一个复古风格的网页小游戏合集</b><br>
  <i>A Retro-style Web Game Collection</i>
</p>

<p align="center">
  <a href="#游戏列表">游戏列表</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#项目结构">项目结构</a>
</p>

---

## 📖 简介

**Retrotopic** 是一个纯前端实现的网页小游戏合集，包含多款经典益智游戏。项目采用现代化的 UI 设计，支持深色/浅色主题切换，具备完整的用户系统和游戏数据管理功能。

## 🎯 游戏列表

| 游戏 | 描述 | 难度 |
|------|------|------|
| **🧩 Klotski（华容道）** | 经典的滑块益智游戏，源自中国三国时期曹操逃亡的历史故事。目标是将最大的方块移动到出口。 | ⭐⭐⭐ |
| **🔢 2048** | 风靡全球的数字滑块游戏。在 4×4 网格上合并相同数字，目标是创造出 2048！ | ⭐⭐ |
| **🌀 Labyrinth（迷宫）** | 迷宫探索游戏，从入口找到出口，考验你的导航和问题解决能力。 | ⭐⭐ |
| **💣 Minesweeper（扫雷）** | 经典的逻辑推理游戏，通过数字提示找出所有地雷的位置。支持三种难度等级。 | ⭐⭐⭐ |

## ✨ 功能特性

### 🎨 界面设计
- 现代化响应式布局，支持桌面端和移动端
- 炫酷的开场动画效果
- 深色/浅色主题自由切换
- 每个游戏都有独特的视觉风格

### 👤 用户系统
- 用户注册与登录
- 个人资料管理
- 用户偏好设置自动保存
- 主题设置跟随用户账户

### 📊 数据管理
- 游戏进度追踪与统计
- 游戏记录 IndexedDB 持久化存储
- 数据导出/导入（JSON 格式）
- 一键清除所有数据

### 🎮 游戏功能
- **2048**: 撤销功能、最高分记录
- **扫雷**: 三种难度、首击安全、双击快速揭开、计时器
- **华容道**: 多种经典布局、步数统计
- **迷宫**: 随机生成迷宫、路径追踪

### 🎉 彩蛋功能
- 🌈 彩虹雨动画效果
- � 随机名言展示
- 🎮 Konami 秘技代码
- ⏰ 时光机特效

## 🛠 技术栈

- **前端框架**: 纯原生 HTML5 + CSS3 + JavaScript (ES6+)
- **数据存储**: IndexedDB + LocalStorage
- **样式特性**: CSS Grid, Flexbox, CSS 动画, CSS 变量
- **无需后端**: 完全在浏览器端运行

## 🚀 快速开始

### 在线访问
直接访问部署后的网站即可开始游戏。

### 本地运行
```bash
# 克隆仓库
git clone https://github.com/BoyangZhang619/Little_game_of_webpage.git

# 进入项目目录
cd Little_game_of_webpage

# 使用任意本地服务器运行，例如：
# Python 3
python -m http.server 8080

# 或使用 VS Code Live Server 插件
# 或直接双击 index.html 在浏览器中打开
```

然后在浏览器中访问 `http://localhost:8080`

## 📁 项目结构

```
Little_game_of_webpage/
├── index.html              # 主页入口
├── README.md               # 项目说明
├── css/                    # 样式文件
│   ├── new_common.css      # 公共样式
│   ├── new_mainpage.css    # 主页样式
│   ├── game2048_new.css    # 2048 游戏样式
│   ├── klotski_new.css     # 华容道样式
│   ├── labyrinth_new.css   # 迷宫样式
│   └── mineSweeper_new.css # 扫雷样式
├── js/                     # JavaScript 文件
│   ├── new_mainpage.js     # 主页逻辑
│   ├── new_common.js       # 公共工具
│   ├── game2048_new.js     # 2048 游戏逻辑
│   ├── klotski_new.js      # 华容道逻辑
│   ├── labyrinth_new.js    # 迷宫逻辑
│   ├── mineSweeper_new.js  # 扫雷逻辑
│   ├── userData.js         # 用户数据管理
│   ├── gameStorageManager.js # 游戏存储管理
│   └── easterEgg.js        # 彩蛋功能
├── subpages/               # 游戏子页面
│   ├── game2048_new.html
│   ├── klotski_new.html
│   ├── labyrinth_new.html
│   └── mineSweeper_new.html
├── img/                    # 图片资源
│   └── ...
└── json/                   # 语言配置
    ├── lang_cn.json
    └── lang_en.json
```

## 🎮 操作说明

### 2048
- **键盘**: 方向键 ↑↓←→ 控制方块移动
- **触屏**: 滑动控制方向

### 扫雷
- **左键点击**: 揭开方格
- **右键点击**: 标记/取消标记地雷
- **双击**: 快速揭开已标记完成区域周围的方格

### 华容道
- **点击并拖动**: 移动方块
- **目标**: 将曹操（最大方块）移动到底部出口

### 迷宫
- **方向键/WASD**: 控制移动
- **目标**: 从起点到达终点

## 📝 开发计划

- [ ] 多语言支持 (i18n)
- [ ] 更多游戏类型
- [ ] 排行榜系统
- [ ] 成就系统
- [ ] PWA 支持

## 📄 许可证

本项目仅供学习和个人使用。

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/BoyangZhang619">BoyangZhang619</a>
</p>
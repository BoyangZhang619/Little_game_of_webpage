// ============================================
// 魔法光标系统 - 独立模块
// 使用方法：
// 1. 在HTML中引入 cursor.css 和 cursor.js
// 2. 调用 MagicCursor.init() 或直接使用（会自动初始化）
// ============================================

const MagicCursor = {
    cursor: {
        main: null,
        trail: null,
        wrapper: null
    },
    
    pos: { x: 0, y: 0 },
    prevPos: { x: 0, y: 0 },
    trailPos: { x: 0, y: 0 },
    
    // 粒子配置
    particleColors: ['#a78bfa', '#818cf8', '#f093fb', '#34d399', '#667eea', '#f5576c'],
    lastParticleTime: 0,
    particleInterval: 50,
    
    // 配置选项
    options: {
        enableParticles: true,
        enableCore: true,
        enableRing: true,
        darkMode: false
    },

    // localStorage键名
    STORAGE_KEY: 'magicCursorSettings',
    
    // 运行时标记：检测是否为移动设备并可以禁用
    isMobile: (/Mobi|Android|iPhone|iPad|Windows Phone|mobile/i.test(navigator.userAgent) || ('ontouchstart' in window && navigator.maxTouchPoints > 0)),
    disabled: false,
    
    // 游戏区域状态
    inGameZone: false,

    // 从localStorage加载设置
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const settings = JSON.parse(saved);
                this.options.enableParticles = settings.enableParticles !== false;
                this.options.enableCore = settings.enableCore !== false;
                this.options.enableRing = settings.enableRing !== false;
                console.log('✅ 光标设置已加载:', this.options);
            }
        } catch (e) {
            console.warn('加载光标设置失败:', e);
        }
    },

    // 保存设置到localStorage
    saveSettings() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                enableParticles: this.options.enableParticles,
                enableCore: this.options.enableCore,
                enableRing: this.options.enableRing
            }));
            console.log('💾 光标设置已保存');
        } catch (e) {
            console.warn('保存光标设置失败:', e);
        }
    },

    // 初始化
    init(options = {}) {
        // 加载已保存的设置
        this.loadSettings();
        
        // 合并配置（传入的选项优先级最低）
        this.options = { ...this.options, ...options };

        // 在移动设备上禁用魔法光标以避免干扰触摸体验
        if (this.isMobile) {
            console.log('⚠️ 魔法光标在移动设备上已禁用以避免影响触摸体验');
            this.disabled = true;
            return;
        }

        // 创建光标DOM
        this.createCursorElements();
        
        // 获取DOM引用
        this.cursor.main = document.querySelector('.cursor-main');
        this.cursor.trail = document.querySelector('.cursor-trail');
        this.cursor.wrapper = document.querySelector('.cursor-wrapper');
        
        if (!this.cursor.main) {
            console.warn('⚠️ 光标元素创建失败');
            return;
        }
        
        // 添加启用标记
        document.body.classList.add('cursor-enabled');
        
        // 深色模式 - 自动检测当前主题
        const isDarkMode = this.options.darkMode || 
            document.body.classList.contains('dark-theme') ||
            document.body.style.backgroundColor === 'rgb(47, 66, 86)' ||
            document.body.style.backgroundColor === '#2f4256';
        
        if (isDarkMode) {
            this.options.darkMode = true;
            this.cursor.wrapper.classList.add('cursor-dark');
        }
        
        // 应用初始设置
        this.applySettings();
        
        // 绑定事件
        this.bindEvents();
        
        // 启动动画
        this.animate();
        
        console.log('✨ 魔法光标已启用');
    },

    // 应用当前设置到DOM
    applySettings() {
        if (!this.cursor.main || !this.cursor.trail) return;
        
        // 圆心块
        if (this.options.enableCore) {
            this.cursor.main.classList.remove('cursor-element-hidden');
            document.body.classList.add('cursor-core-active');
        } else {
            this.cursor.main.classList.add('cursor-element-hidden');
            document.body.classList.remove('cursor-core-active');
        }
        
        // 旋转圆环 - 依赖圆心块
        if (this.options.enableRing && this.options.enableCore) {
            this.cursor.trail.classList.remove('cursor-element-hidden');
        } else {
            this.cursor.trail.classList.add('cursor-element-hidden');
        }
    },

    // 检测是否在游戏区域内
    isInGameZone(x, y) {
        const gameZones = document.querySelectorAll('.cursor-game-zone');
        for (const zone of gameZones) {
            const rect = zone.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return true;
            }
        }
        return false;
    },

    // 设置游戏区域内的光标隐藏状态
    setGameZoneState(inGameZone) {
        if (this.inGameZone === inGameZone) return; // 状态没变，不处理
        this.inGameZone = inGameZone;
        
        if (inGameZone) {
            this.cursor.wrapper?.classList.add('cursor-in-game-zone');
        } else {
            this.cursor.wrapper?.classList.remove('cursor-in-game-zone');
        }
    },
    
    // 创建光标DOM元素
    createCursorElements() {
        // 检查是否已存在
        if (document.querySelector('.cursor-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'cursor-wrapper';
        wrapper.innerHTML = `
            <div class="cursor-main"></div>
            <div class="cursor-trail"></div>
        `;
        document.body.appendChild(wrapper);
    },
    
    // 绑定事件
    bindEvents() {
        // 鼠标移动
        document.addEventListener('mousemove', (e) => {
            this.prevPos.x = this.pos.x;
            this.prevPos.y = this.pos.y;
            this.pos.x = e.clientX;
            this.pos.y = e.clientY;
            
            // 检测是否在游戏区域内
            const inGameZone = this.isInGameZone(this.pos.x, this.pos.y);
            this.setGameZoneState(inGameZone);
            
            // 主光标立即跟随
            this.cursor.main.style.left = this.pos.x + 'px';
            this.cursor.main.style.top = this.pos.y + 'px';
            
            // 生成粒子（游戏区域内不生成）
            if (this.options.enableParticles && !inGameZone) {
                this.maybeSpawnParticle();
            }
        });
        
        // 鼠标进入/离开窗口
        document.addEventListener('mouseenter', () => {
            this.cursor.wrapper?.classList.remove('cursor-hidden');
        });
        
        document.addEventListener('mouseleave', () => {
            this.cursor.wrapper?.classList.add('cursor-hidden');
        });
        
        // 点击效果
        document.addEventListener('mousedown', () => {
            // 游戏区域内不显示点击效果
            if (this.inGameZone) return;
            
            this.cursor.wrapper?.classList.add('cursor-click');
            if (this.options.enableParticles) {
                this.burstParticles(8);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.cursor.wrapper?.classList.remove('cursor-click');
        });
        
        // 检测可点击元素
        const clickableSelector = 'a, button, [role="button"], input, select, textarea, label, .clickable';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches(clickableSelector) || e.target.closest(clickableSelector)) {
                this.cursor.wrapper?.classList.add('cursor-hover');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.matches(clickableSelector) || e.target.closest(clickableSelector)) {
                this.cursor.wrapper?.classList.remove('cursor-hover');
            }
        });
    },
    
    // 根据移动速度生成粒子
    maybeSpawnParticle() {
        const now = Date.now();
        const dx = this.pos.x - this.prevPos.x;
        const dy = this.pos.y - this.prevPos.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        const interval = Math.max(20, this.particleInterval - speed * 2);
        
        if (now - this.lastParticleTime > interval && speed > 2) {
            this.spawnParticle(this.pos.x, this.pos.y);
            this.lastParticleTime = now;
        }
    },
    
    // 生成单个粒子
    spawnParticle(x, y, size = null) {
        const particle = document.createElement('div');
        particle.className = 'cursor-particle';
        
        const color = this.particleColors[Math.floor(Math.random() * this.particleColors.length)];
        const particleSize = size || (4 + Math.random() * 4);
        
        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${particleSize}px;
            height: ${particleSize}px;
            background: ${color};
            box-shadow: 0 0 ${particleSize}px ${color};
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 800);
    },
    
    // 点击时爆发粒子
    burstParticles(count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const distance = 10 + Math.random() * 20;
            const x = this.pos.x + Math.cos(angle) * distance;
            const y = this.pos.y + Math.sin(angle) * distance;
            
            setTimeout(() => {
                this.spawnParticle(x, y, 3 + Math.random() * 5);
            }, i * 20);
        }
    },
    
    // 动画循环
    animate() {
        const trailSpeed = 0.12;
        
        this.trailPos.x += (this.pos.x - this.trailPos.x) * trailSpeed;
        this.trailPos.y += (this.pos.y - this.trailPos.y) * trailSpeed;
        
        if (this.cursor.trail) {
            this.cursor.trail.style.left = this.trailPos.x + 'px';
            this.cursor.trail.style.top = this.trailPos.y + 'px';
        }
        
        requestAnimationFrame(() => this.animate());
    },
    
    // 切换深色模式
    setDarkMode(enabled) {
        this.options.darkMode = enabled;
        if (enabled) {
            this.cursor.wrapper?.classList.add('cursor-dark');
        } else {
            this.cursor.wrapper?.classList.remove('cursor-dark');
        }
    },
    
    // 切换粒子效果
    setParticles(enabled) {
        this.options.enableParticles = enabled;
        this.saveSettings();
    },

    // 切换圆心块
    setCore(enabled) {
        this.options.enableCore = enabled;
        // 如果关闭圆心块，也要关闭旋转圆环
        if (!enabled) {
            this.options.enableRing = false;
        }
        this.applySettings();
        this.saveSettings();
    },

    // 切换旋转圆环（必须圆心块开启才能生效）
    setRing(enabled) {
        if (enabled && !this.options.enableCore) {
            console.warn('⚠️ 旋转圆环需要圆心块开启才能生效');
            return false;
        }
        this.options.enableRing = enabled;
        this.applySettings();
        this.saveSettings();
        return true;
    },

    // 获取当前设置状态
    getSettings() {
        return {
            enableParticles: this.options.enableParticles,
            enableCore: this.options.enableCore,
            enableRing: this.options.enableRing
        };
    },
    
    // 销毁
    destroy() {
        document.body.classList.remove('cursor-enabled');
        this.cursor.wrapper?.remove();
    }
};

// 自动初始化（页面加载完成后）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { if (!MagicCursor.isMobile) MagicCursor.init(); });
} else {
    if (!MagicCursor.isMobile) MagicCursor.init();
}

// 导出到全局
window.MagicCursor = MagicCursor;

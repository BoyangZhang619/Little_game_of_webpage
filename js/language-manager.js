/**
 * 多语言管理器
 * 提供安全、可扩展的多语言功能
 * @version 2.0
 * @author System
 */

class LanguageManager {
    constructor() {
        this.currentLang = 'zh-CN';
        this.fallbackLang = 'en';
        this.langData = new Map();
        this.observers = [];
        this.isLoading = false;
        
        // UUID生成器
        this.uuidCounter = 0;
        
        // 初始化
        this.init();
    }

    /**
     * 生成UUID (基于crypto.randomUUID或polyfill)
     */
    generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        
        // Polyfill for older browsers
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 初始化语言管理器
     */
    async init() {
        try {
            // 从localStorage获取用户偏好
            const savedLang = localStorage.getItem('preferred-language');
            if (savedLang) {
                this.currentLang = savedLang;
            } else {
                // 检测浏览器语言
                this.currentLang = this.detectBrowserLanguage();
            }
            
            // 加载当前语言
            await this.loadLanguage(this.currentLang);
            
            console.log(`LanguageManager initialized with language: ${this.currentLang}`);
        } catch (error) {
            console.error('Failed to initialize LanguageManager:', error);
            // 尝试加载fallback语言
            await this.loadLanguage(this.fallbackLang);
        }
    }

    /**
     * 检测浏览器语言
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        
        // 支持的语言列表
        const supportedLangs = ['zh-CN', 'en'];
        
        // 精确匹配
        if (supportedLangs.includes(browserLang)) {
            return browserLang;
        }
        
        // 部分匹配 (zh-TW -> zh-CN)
        const langCode = browserLang.split('-')[0];
        for (const lang of supportedLangs) {
            if (lang.startsWith(langCode)) {
                return lang;
            }
        }
        
        return this.fallbackLang;
    }

    /**
     * 加载语言文件
     */
    async loadLanguage(langCode) {
        if (this.langData.has(langCode)) {
            return this.langData.get(langCode);
        }

        this.isLoading = true;
        
        try {
            const response = await fetch(`./json/lang_${langCode.split('-')[0]}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 验证数据结构
            this.validateLanguageData(data);
            
            this.langData.set(langCode, data);
            
            console.log(`Language data loaded for: ${langCode}`);
            return data;
            
        } catch (error) {
            console.error(`Failed to load language ${langCode}:`, error);
            
            if (langCode !== this.fallbackLang) {
                console.log(`Attempting to load fallback language: ${this.fallbackLang}`);
                return await this.loadLanguage(this.fallbackLang);
            }
            
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 验证语言数据结构
     */
    validateLanguageData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid language data: not an object');
        }
        
        if (!data.meta || !data.meta.version) {
            throw new Error('Invalid language data: missing meta information');
        }
        
        if (!data.validation || !data.validation.schema_version) {
            throw new Error('Invalid language data: missing validation information');
        }
        
        // 检查必需字段
        const requiredFields = data.validation.required_fields || ['uuid', 'text'];
        
        // 验证页面元素
        if (data.pages) {
            for (const [pageName, pageData] of Object.entries(data.pages)) {
                if (pageData.elements) {
                    for (const element of pageData.elements) {
                        for (const field of requiredFields) {
                            if (!element[field]) {
                                console.warn(`Missing required field "${field}" in page "${pageName}"`);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 切换语言
     */
    async switchLanguage(langCode) {
        try {
            await this.loadLanguage(langCode);
            
            const oldLang = this.currentLang;
            this.currentLang = langCode;
            
            // 保存用户偏好
            localStorage.setItem('preferred-language', langCode);
            
            // 更新页面内容
            this.updatePageContent();
            
            // 通知观察者
            this.notifyObservers(oldLang, langCode);
            
            console.log(`Language switched from ${oldLang} to ${langCode}`);
            
        } catch (error) {
            console.error(`Failed to switch language to ${langCode}:`, error);
            throw error;
        }
    }

    /**
     * 获取文本
     */
    getText(uuid, defaultText = '') {
        const langData = this.langData.get(this.currentLang);
        
        if (!langData) {
            console.warn(`No language data available for ${this.currentLang}`);
            return defaultText;
        }
        
        // 在页面元素中查找
        if (langData.pages) {
            for (const pageData of Object.values(langData.pages)) {
                if (pageData.elements) {
                    const element = pageData.elements.find(el => el.uuid === uuid);
                    if (element) {
                        return element.text;
                    }
                }
            }
        }
        
        // 在通用元素中查找
        if (langData.common) {
            for (const category of Object.values(langData.common)) {
                if (Array.isArray(category)) {
                    const element = category.find(el => el.uuid === uuid);
                    if (element) {
                        return element.text;
                    }
                }
            }
        }
        
        console.warn(`Text not found for UUID: ${uuid}`);
        return defaultText;
    }

    /**
     * 通过key获取文本 (用于通用元素)
     */
    getTextByKey(key, defaultText = '') {
        const langData = this.langData.get(this.currentLang);
        
        if (!langData || !langData.common) {
            return defaultText;
        }
        
        for (const category of Object.values(langData.common)) {
            if (Array.isArray(category)) {
                const element = category.find(el => el.key === key);
                if (element) {
                    return element.text;
                }
            }
        }
        
        console.warn(`Text not found for key: ${key}`);
        return defaultText;
    }

    /**
     * 更新页面内容
     */
    updatePageContent() {
        const langData = this.langData.get(this.currentLang);
        if (!langData) return;
        
        // 更新页面标题
        const currentPage = this.getCurrentPageKey();
        if (langData.pages && langData.pages[currentPage] && langData.pages[currentPage].meta) {
            const pageMeta = langData.pages[currentPage].meta;
            if (pageMeta.title) {
                document.title = pageMeta.title;
            }
        }
        
        // 更新页面元素
        if (langData.pages && langData.pages[currentPage] && langData.pages[currentPage].elements) {
            for (const element of langData.pages[currentPage].elements) {
                const domElement = document.querySelector(element.selector);
                if (domElement && element.text) {
                    // 根据元素类型更新内容
                    if (element.type === 'heading' || element.type === 'text') {
                        domElement.textContent = element.text;
                    } else if (element.type === 'html') {
                        domElement.innerHTML = element.text;
                    } else if (element.type === 'placeholder') {
                        domElement.placeholder = element.text;
                    } else if (element.type === 'title') {
                        domElement.title = element.text;
                    }
                }
            }
        }
    }

    /**
     * 获取当前页面key
     */
    getCurrentPageKey() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename === 'index.html' || filename === '') {
            return 'index';
        }
        
        return filename.replace('.html', '');
    }

    /**
     * 添加语言变更观察者
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * 移除语言变更观察者
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * 通知观察者
     */
    notifyObservers(oldLang, newLang) {
        for (const callback of this.observers) {
            try {
                callback(oldLang, newLang);
            } catch (error) {
                console.error('Error in language change observer:', error);
            }
        }
    }

    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return [
            { code: 'zh-CN', name: '简体中文' },
            { code: 'en', name: 'English' }
        ];
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// 全局实例
window.langManager = new LanguageManager();

// 导出 (如果使用模块化)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}

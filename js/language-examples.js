/**
 * 多语言系统使用示例
 * 演示如何在HTML页面中集成和使用多语言功能
 */

// 在HTML页面中引入语言管理器后，可以这样使用：

document.addEventListener('DOMContentLoaded', async function() {
    // 等待语言管理器初始化完成
    await langManager.init();
    
    // 示例1: 创建语言切换按钮
    createLanguageSwitcher();
    
    // 示例2: 监听语言变更事件
    langManager.addObserver((oldLang, newLang) => {
        console.log(`语言已从 ${oldLang} 切换到 ${newLang}`);
        
        // 可以在这里执行语言切换后的自定义逻辑
        updateCustomContent(newLang);
    });
    
    // 示例3: 动态添加多语言文本
    addDynamicContent();
});

/**
 * 创建语言切换器UI
 */
function createLanguageSwitcher() {
    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    switcher.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
        font-family: Arial, sans-serif;
    `;
    
    const title = document.createElement('div');
    title.textContent = '语言 / Language';
    title.style.marginBottom = '10px';
    
    const languages = langManager.getSupportedLanguages();
    
    languages.forEach(lang => {
        const button = document.createElement('button');
        button.textContent = lang.name;
        button.style.cssText = `
            margin: 2px;
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            background: ${lang.code === langManager.getCurrentLanguage() ? '#007ACC' : '#666'};
            color: white;
        `;
        
        button.addEventListener('click', async () => {
            try {
                await langManager.switchLanguage(lang.code);
                
                // 更新按钮状态
                switcher.querySelectorAll('button').forEach(btn => {
                    btn.style.background = '#666';
                });
                button.style.background = '#007ACC';
                
                // 显示切换成功消息
                showNotification(langManager.getTextByKey('language_switched', '语言切换成功'));
                
            } catch (error) {
                console.error('语言切换失败:', error);
                showNotification(langManager.getTextByKey('language_switch_error', '语言切换失败'));
            }
        });
        
        switcher.appendChild(title);
        switcher.appendChild(button);
    });
    
    document.body.appendChild(switcher);
}

/**
 * 显示通知消息
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #007ACC;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 2000;
        font-family: Arial, sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

/**
 * 更新自定义内容
 */
function updateCustomContent(language) {
    // 示例：更新游戏说明文本
    const gameDescriptions = document.querySelectorAll('.gameTypeExplanation');
    
    gameDescriptions.forEach(desc => {
        // 根据语言更新描述内容
        if (language === 'zh-CN') {
            // 显示中文描述
            updateGameDescription(desc, 'chinese');
        } else {
            // 显示英文描述
            updateGameDescription(desc, 'english');
        }
    });
}

/**
 * 动态添加多语言文本
 */
function addDynamicContent() {
    // 示例：动态创建带多语言支持的按钮
    const container = document.getElementById('content');
    if (!container) return;
    
    const dynamicButton = document.createElement('button');
    dynamicButton.className = 'lang-dynamic-btn';
    
    // 使用UUID标识符（在实际应用中，这些UUID应该在语言文件中定义）
    const buttonUUID = 'f1g2h3i4-j5k6-7l8m-9n0o-p1q2r3s4t5u6';
    
    // 设置按钮文本
    updateDynamicButtonText(dynamicButton, buttonUUID);
    
    // 监听语言变更，更新动态内容
    langManager.addObserver(() => {
        updateDynamicButtonText(dynamicButton, buttonUUID);
    });
    
    container.appendChild(dynamicButton);
}

/**
 * 更新动态按钮文本
 */
function updateDynamicButtonText(button, uuid) {
    const currentLang = langManager.getCurrentLanguage();
    
    // 模拟从语言数据中获取文本
    const texts = {
        'zh-CN': '开始游戏',
        'en': 'Start Game'
    };
    
    button.textContent = texts[currentLang] || texts['en'];
}

/**
 * 更新游戏描述
 */
function updateGameDescription(element, language) {
    // 这里可以实现具体的描述更新逻辑
    console.log(`更新游戏描述为: ${language}`);
}

// 导出常用功能
window.LanguageUtils = {
    /**
     * 快速获取文本
     */
    t: (uuid, defaultText = '') => langManager.getText(uuid, defaultText),
    
    /**
     * 通过key获取文本
     */
    tk: (key, defaultText = '') => langManager.getTextByKey(key, defaultText),
    
    /**
     * 获取当前语言
     */
    getCurrentLang: () => langManager.getCurrentLanguage(),
    
    /**
     * 切换语言
     */
    switchLang: (lang) => langManager.switchLanguage(lang),
    
    /**
     * 生成UUID
     */
    uuid: () => langManager.generateUUID()
};

// 简化的全局函数
window.t = LanguageUtils.t;
window.tk = LanguageUtils.tk;

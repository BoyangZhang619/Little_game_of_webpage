<!-- markdownlint-disable -->
# 多语言系统使用说明

## 📋 概述

这个多语言系统提供了一个安全、可扩展的解决方案，支持网站的国际化功能。主要特点：

- ✅ **UUID标识符**：每个文本都有唯一的UUID，避免冲突
- ✅ **安全验证**：数据结构验证和回退机制
- ✅ **自动生成**：可以自动提取页面文本生成JSON
- ✅ **易于集成**：简单的JS API，易于接入现有项目

## 🚀 快速开始

### 1. 文件结构
```
js/
├── language-manager.js     # 多语言管理器核心
├── language-examples.js   # 使用示例和工具函数
└── text-extractor.js      # 页面文本提取脚本

json/
├── lang_cn.json           # 中文语言文件
└── lang_en.json           # 英文语言文件
```

### 2. 在HTML中引入
```html
<!-- 引入多语言系统 -->
<script src="./js/language-manager.js"></script>
<script src="./js/language-examples.js"></script>
```

### 3. 基本使用
```javascript
// 等待初始化完成
document.addEventListener('DOMContentLoaded', async () => {
    await langManager.init();
    
    // 获取文本
    const title = langManager.getText('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', '默认标题');
    
    // 切换语言
    await langManager.switchLanguage('en');
});
```

## 📝 语言文件格式

```json
{
    "meta": {
        "version": "2.0",
        "language": "zh-CN",
        "languageName": "简体中文",
        "lastEdited": "2025-12-15"
    },
    "pages": {
        "index": {
            "elements": [
                {
                    "uuid": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
                    "selector": "#topCover h1",
                    "text": "小游戏合集",
                    "type": "heading",
                    "context": "main_title"
                }
            ]
        }
    },
    "common": {
        "ui": [
            {
                "uuid": "c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8",
                "key": "loading",
                "text": "加载中...",
                "context": "system_message"
            }
        ]
    }
}
```

## 🛠 API 参考

### 核心方法

```javascript
// 获取文本 (通过UUID)
langManager.getText(uuid, defaultText)

// 获取文本 (通过key，用于通用文本)
langManager.getTextByKey(key, defaultText)

// 切换语言
await langManager.switchLanguage(langCode)

// 获取当前语言
langManager.getCurrentLanguage()

// 生成UUID
langManager.generateUUID()

// 添加语言变更监听器
langManager.addObserver(callback)
```

### 简化函数

```javascript
// 简化的文本获取函数
t('uuid-here', '默认文本')
tk('key-here', '默认文本')

// 语言切换
LanguageUtils.switchLang('en')

// 生成UUID
LanguageUtils.uuid()
```

## 🔍 自动提取页面文本

### 快速提取方法（推荐）

**方法1: 使用快速提取脚本**
1. 打开要提取的网页
2. 按`F12`打开开发者工具
3. 复制 `js/quick-extract.js` 文件的全部内容
4. 粘贴到控制台并按回车
5. 直接复制输出的JSON内容到对应文件

**方法2: 一键复制到剪贴板**
```javascript
// 在控制台运行快速提取后，使用以下命令
copyChineseJSON()   // 自动复制中文JSON到剪贴板
copyEnglishJSON()   // 自动复制英文JSON到剪贴板
```

### 详细提取方法

**使用完整的text-extractor.js**
```javascript
// 运行完整提取脚本后，可以访问：
window.extractedLanguageData.chineseJSON  // 格式化的中文JSON字符串
window.extractedLanguageData.englishJSON  // 格式化的英文JSON字符串

// 或者使用便捷函数
copyChineseJSON()   // 复制中文JSON
copyEnglishJSON()   // 复制英文JSON
```

## 🎯 实际使用示例

### 1. 为现有HTML元素添加多语言支持

```html
<!-- 原始HTML -->
<h1 id="title">小游戏合集</h1>
<button onclick="startGame()">开始游戏</button>

<!-- JavaScript -->
<script>
document.addEventListener('DOMContentLoaded', async () => {
    await langManager.init();
    
    // 更新标题
    const titleElement = document.getElementById('title');
    titleElement.textContent = t('title-uuid', '小游戏合集');
    
    // 监听语言变更
    langManager.addObserver(() => {
        titleElement.textContent = t('title-uuid', '小游戏合集');
    });
});
</script>
```

### 2. 动态创建多语言内容

```javascript
function createMultiLangButton(parentElement) {
    const button = document.createElement('button');
    const buttonUUID = 'button-start-game-uuid';
    
    // 设置初始文本
    updateButtonText();
    
    // 监听语言变更
    langManager.addObserver(updateButtonText);
    
    function updateButtonText() {
        button.textContent = t(buttonUUID, '开始游戏');
    }
    
    parentElement.appendChild(button);
}
```

### 3. 创建语言切换器

```javascript
function createLanguageSwitcher() {
    const switcher = document.createElement('select');
    
    langManager.getSupportedLanguages().forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        option.selected = lang.code === langManager.getCurrentLanguage();
        switcher.appendChild(option);
    });
    
    switcher.addEventListener('change', async (e) => {
        await langManager.switchLanguage(e.target.value);
    });
    
    return switcher;
}
```

## ⚡ 性能优化建议

1. **按需加载**：只加载当前页面需要的语言数据
2. **缓存机制**：语言文件会自动缓存，避免重复加载
3. **批量更新**：语言切换时批量更新DOM元素
4. **延迟初始化**：在页面加载完成后再初始化多语言系统

## 🔒 安全特性

1. **数据验证**：加载语言文件时验证数据结构
2. **XSS防护**：使用textContent而非innerHTML更新文本
3. **回退机制**：找不到文本时使用默认值
4. **错误处理**：完善的错误处理和日志记录

## 📊 调试和监控

```javascript
// 启用调试模式
langManager.debug = true;

// 查看加载的语言数据
console.log(langManager.langData);

// 查看当前语言状态
console.log({
    currentLang: langManager.getCurrentLanguage(),
    supportedLangs: langManager.getSupportedLanguages(),
    isLoading: langManager.isLoading
});
```

## 🎨 自定义扩展

```javascript
// 扩展语言管理器
class CustomLanguageManager extends LanguageManager {
    constructor() {
        super();
        this.customFeature = true;
    }
    
    // 添加自定义方法
    getFormattedText(uuid, params = {}, defaultText = '') {
        let text = this.getText(uuid, defaultText);
        
        // 支持参数替换
        Object.keys(params).forEach(key => {
            text = text.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
        });
        
        return text;
    }
}

// 使用自定义管理器
window.langManager = new CustomLanguageManager();
```

## 📚 常见问题

### Q: 如何处理带参数的文本？
A: 在文本中使用占位符，然后在JavaScript中替换：
```json
{
    "text": "欢迎 {{username}}，您有 {{count}} 条新消息"
}
```

### Q: 如何处理复数形式？
A: 可以为不同的复数形式创建不同的UUID，或者扩展系统支持复数规则。

### Q: 如何实现文本的延迟加载？
A: 使用观察者模式，在需要时再加载对应的语言数据。

## 🔗 相关链接

- [语言代码标准 (RFC 5646)](https://tools.ietf.org/html/rfc5646)
- [国际化最佳实践](https://www.w3.org/International/techniques/authoring-html)
- [UUID 标准 (RFC 4122)](https://tools.ietf.org/html/rfc4122)

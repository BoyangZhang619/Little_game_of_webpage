/**
 * 页面文本提取脚本
 * 在浏览器控制台中运行，自动生成多语言JSON结构
 * 
 * 使用方法：
 * 1. 打开网页
 * 2. 按F12打开开发者工具
 * 3. 在控制台中粘贴并运行此脚本
 * 4. 复制输出的JSON到语言文件中
 */

(function() {
    'use strict';
    
    // UUID生成器
    function generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // 获取元素的唯一选择器
    function getUniqueSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        let selector = element.tagName.toLowerCase();
        
        if (element.className) {
            const classes = element.className.trim().split(/\s+/);
            selector += '.' + classes.join('.');
        }
        
        // 如果有父元素，添加父元素信息
        if (element.parentElement) {
            const parent = element.parentElement;
            let parentSelector = '';
            
            if (parent.id) {
                parentSelector = `#${parent.id}`;
            } else if (parent.className) {
                const classes = parent.className.trim().split(/\s+/);
                parentSelector = parent.tagName.toLowerCase() + '.' + classes[0];
            } else {
                parentSelector = parent.tagName.toLowerCase();
            }
            
            // 计算在同级元素中的位置
            const siblings = Array.from(parent.children).filter(el => 
                el.tagName.toLowerCase() === element.tagName.toLowerCase()
            );
            
            if (siblings.length > 1) {
                const index = siblings.indexOf(element) + 1;
                selector += `:nth-of-type(${index})`;
            }
            
            return `${parentSelector} > ${selector}`;
        }
        
        return selector;
    }
    
    // 判断元素类型
    function getElementType(element) {
        const tagName = element.tagName.toLowerCase();
        
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            return 'heading';
        }
        
        if (element.hasAttribute('placeholder')) {
            return 'placeholder';
        }
        
        if (element.hasAttribute('title')) {
            return 'title';
        }
        
        if (['button', 'a'].includes(tagName)) {
            return 'clickable';
        }
        
        if (['input', 'textarea'].includes(tagName)) {
            return 'form';
        }
        
        return 'text';
    }
    
    // 获取上下文描述
    function getContext(element) {
        const tagName = element.tagName.toLowerCase();
        
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            return 'heading';
        }
        
        if (element.closest('nav')) {
            return 'navigation';
        }
        
        if (element.closest('header')) {
            return 'header';
        }
        
        if (element.closest('footer')) {
            return 'footer';
        }
        
        if (element.closest('aside')) {
            return 'sidebar';
        }
        
        if (element.closest('.game-type, .gameType')) {
            return 'game_content';
        }
        
        return 'content';
    }
    
    // 提取页面文本
    function extractPageText() {
        const elements = [];
        const processedTexts = new Set();
        
        // 需要提取的元素选择器
        const selectors = [
            'h1, h2, h3, h4, h5, h6',           // 标题
            'p',                                // 段落
            'a',                                // 链接
            'button',                           // 按钮
            'span',                             // 行内文本
            'div',                              // div文本
            'li',                               // 列表项
            '[placeholder]',                    // 有placeholder的元素
            '[title]'                           // 有title属性的元素
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // 获取文本内容
                let text = '';
                let type = getElementType(element);
                
                if (type === 'placeholder') {
                    text = element.getAttribute('placeholder');
                } else if (type === 'title') {
                    text = element.getAttribute('title');
                } else {
                    // 只获取直接文本内容，不包括子元素
                    const clone = element.cloneNode(true);
                    const children = clone.querySelectorAll('*');
                    children.forEach(child => child.remove());
                    text = clone.textContent.trim();
                }
                
                // 过滤条件
                if (
                    !text ||                                    // 空文本
                    text.length < 2 ||                         // 太短
                    text.length > 200 ||                       // 太长
                    /^\d+$/.test(text) ||                      // 纯数字
                    /^[^\u4e00-\u9fa5a-zA-Z]*$/.test(text) ||  // 没有中英文字符
                    processedTexts.has(text)                   // 重复文本
                ) {
                    return;
                }
                
                processedTexts.add(text);
                
                elements.push({
                    uuid: generateUUID(),
                    selector: getUniqueSelector(element),
                    text: text,
                    type: type,
                    context: getContext(element),
                    tagName: element.tagName.toLowerCase(),
                    extracted_at: new Date().toISOString()
                });
            });
        });
        
        // 按重要性排序
        elements.sort((a, b) => {
            const importance = {
                'heading': 5,
                'navigation': 4,
                'clickable': 3,
                'form': 2,
                'text': 1
            };
            
            return (importance[b.type] || 0) - (importance[a.type] || 0);
        });
        
        return elements;
    }
    
    // 生成完整的语言文件结构
    function generateLanguageFile(language = 'zh-CN', languageName = '简体中文') {
        const elements = extractPageText();
        const currentPageKey = getCurrentPageKey();
        
        const structure = {
            meta: {
                version: "2.0",
                language: language,
                languageName: languageName,
                lastEdited: new Date().toISOString().split('T')[0],
                author: "Auto-generated",
                encoding: "UTF-8",
                generated_from: window.location.href
            },
            pages: {
                [currentPageKey]: {
                    meta: {
                        title: document.title,
                        description: document.querySelector('meta[name="description"]')?.content || '',
                        url: window.location.href
                    },
                    elements: elements
                }
            },
            common: {
                ui: [
                    {
                        uuid: generateUUID(),
                        key: "loading",
                        text: "加载中...",
                        context: "system_message"
                    },
                    {
                        uuid: generateUUID(),
                        key: "error",
                        text: "发生错误",
                        context: "system_message"
                    },
                    {
                        uuid: generateUUID(),
                        key: "confirm",
                        text: "确认",
                        context: "system_message"
                    },
                    {
                        uuid: generateUUID(),
                        key: "cancel",
                        text: "取消",
                        context: "system_message"
                    }
                ]
            },
            validation: {
                schema_version: "2.0",
                required_fields: ["uuid", "text"],
                total_elements: elements.length,
                checksum: "auto_generated"
            }
        };
        
        return structure;
    }
    
    // 获取当前页面键名
    function getCurrentPageKey() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename === 'index.html' || filename === '') {
            return 'index';
        }
        
        return filename.replace('.html', '');
    }
    
    // 自定义JSON格式化函数，确保输出可直接用于JSON文件
    function formatJSONForFile(data) {
        return JSON.stringify(data, null, 4)
            .replace(/\\"/g, '"')           // 移除转义引号
            .replace(/\\\\/g, '\\')         // 修正反斜杠
            .replace(/\\n/g, '\n')          // 处理换行符
            .replace(/\\t/g, '\t');         // 处理制表符
    }
    
    // 执行提取并输出结果
    console.log('🔍 开始提取页面文本...');
    
    const chineseData = generateLanguageFile('zh-CN', '简体中文');
    const englishData = generateLanguageFile('en', 'English');
    
    // 为英文版本更新文本（示例）
    englishData.pages[getCurrentPageKey()].elements.forEach(element => {
        // 这里可以添加自动翻译逻辑，或者保持中文待手动翻译
        if (element.text === '点击进入') {
            element.text = 'Click to enter';
        }
        if (element.text === '小游戏合集') {
            element.text = 'Little Game Collection';
        }
        if (element.text === '开始游戏') {
            element.text = 'Start Game';
        }
        // 可以添加更多翻译规则...
    });
    
    englishData.common.ui.forEach(item => {
        switch(item.key) {
            case 'loading': item.text = 'Loading...'; break;
            case 'error': item.text = 'An error occurred'; break;
            case 'confirm': item.text = 'Confirm'; break;
            case 'cancel': item.text = 'Cancel'; break;
        }
    });
    
    console.log('✅ 提取完成！');
    console.log(`📊 共提取 ${chineseData.pages[getCurrentPageKey()].elements.length} 个文本元素`);
    
    // 输出可直接复制到JSON文件的格式
    console.log('\n═══════════════════════════════════════');
    console.log('📋 中文语言文件内容 (可直接复制到 lang_cn.json):');
    console.log('═══════════════════════════════════════');
    console.log(formatJSONForFile(chineseData));
    
    console.log('\n═══════════════════════════════════════');
    console.log('📋 英文语言文件内容 (可直接复制到 lang_en.json):');
    console.log('═══════════════════════════════════════');
    console.log(formatJSONForFile(englishData));
    
    // 提供便捷的复制方法
    window.copyChineseJSON = function() {
        const text = formatJSONForFile(chineseData);
        navigator.clipboard.writeText(text).then(() => {
            console.log('✅ 中文JSON已复制到剪贴板，可直接粘贴到lang_cn.json文件');
        }).catch(() => {
            console.log('❌ 复制失败，请手动复制上方输出的内容');
        });
    };
    
    window.copyEnglishJSON = function() {
        const text = formatJSONForFile(englishData);
        navigator.clipboard.writeText(text).then(() => {
            console.log('✅ 英文JSON已复制到剪贴板，可直接粘贴到lang_en.json文件');
        }).catch(() => {
            console.log('❌ 复制失败，请手动复制上方输出的内容');
        });
    };
    
    // 保存到全局变量供后续使用
    window.extractedLanguageData = {
        chinese: chineseData,
        english: englishData,
        chineseJSON: formatJSONForFile(chineseData),
        englishJSON: formatJSONForFile(englishData)
    };
    
    console.log('\n💡 使用提示：');
    console.log('方法1: 直接复制上方输出的内容到对应的JSON文件');
    console.log('方法2: 运行 copyChineseJSON() 自动复制中文JSON到剪贴板');
    console.log('方法3: 运行 copyEnglishJSON() 自动复制英文JSON到剪贴板');
    console.log('方法4: 通过 window.extractedLanguageData.chineseJSON 访问格式化后的JSON字符串');
    
    return {
        chinese: chineseData,
        english: englishData,
        chineseJSON: formatJSONForFile(chineseData),
        englishJSON: formatJSONForFile(englishData)
    };
})();

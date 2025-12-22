/**
 * 简化版文本提取器 - 专门用于输出可直接复制的JSON
 * 在控制台粘贴运行此代码，直接输出可复制的JSON内容
 */
(function() {
    'use strict';
    
    // UUID生成器
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // 获取页面名称
    function getPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename === 'index.html' || filename === '' ? 'index' : filename.replace('.html', '');
    }
    
    // 提取文本元素
    function extractElements() {
        const elements = [];
        const seen = new Set();
        
        // 提取标题
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            const text = el.textContent.trim();
            if (text && !seen.has(text)) {
                seen.add(text);
                elements.push({
                    uuid: uuid(),
                    selector: getSelector(el),
                    text: text,
                    type: "heading",
                    context: "heading"
                });
            }
        });
        
        // 提取按钮文本
        document.querySelectorAll('button, .button, [role="button"]').forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 1 && !seen.has(text)) {
                seen.add(text);
                elements.push({
                    uuid: uuid(),
                    selector: getSelector(el),
                    text: text,
                    type: "button",
                    context: "interaction"
                });
            }
        });
        
        // 提取链接文本
        document.querySelectorAll('a').forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 1 && !seen.has(text)) {
                seen.add(text);
                elements.push({
                    uuid: uuid(),
                    selector: getSelector(el),
                    text: text,
                    type: "link",
                    context: "navigation"
                });
            }
        });
        
        // 提取其他文本
        document.querySelectorAll('p, span, div, li').forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 2 && text.length < 100 && !seen.has(text)) {
                // 检查是否只包含直接文本（不包括子元素的文本）
                const clone = el.cloneNode(true);
                const children = clone.querySelectorAll('*');
                children.forEach(child => child.remove());
                const directText = clone.textContent.trim();
                
                if (directText && directText === text) {
                    seen.add(text);
                    elements.push({
                        uuid: uuid(),
                        selector: getSelector(el),
                        text: text,
                        type: "text",
                        context: "content"
                    });
                }
            }
        });
        
        return elements;
    }
    
    // 获取CSS选择器
    function getSelector(el) {
        if (el.id) return `#${el.id}`;
        
        let selector = el.tagName.toLowerCase();
        if (el.className) {
            const classes = el.className.trim().split(/\s+/);
            if (classes[0]) selector += `.${classes[0]}`;
        }
        
        return selector;
    }
    
    // 生成JSON结构
    function generateJSON(lang, langName) {
        const elements = extractElements();
        const pageName = getPageName();
        
        return {
            "meta": {
                "version": "2.0",
                "language": lang,
                "languageName": langName,
                "lastEdited": new Date().toISOString().split('T')[0],
                "author": "Auto-extracted",
                "encoding": "UTF-8"
            },
            "pages": {
                [pageName]: {
                    "meta": {
                        "title": document.title,
                        "description": (document.querySelector('meta[name="description"]')?.content || "")
                    },
                    "elements": elements
                }
            },
            "common": {
                "ui": [
                    {
                        "uuid": uuid(),
                        "key": "loading",
                        "text": lang === 'zh-CN' ? "加载中..." : "Loading...",
                        "context": "system_message"
                    },
                    {
                        "uuid": uuid(),
                        "key": "error", 
                        "text": lang === 'zh-CN' ? "发生错误" : "An error occurred",
                        "context": "system_message"
                    },
                    {
                        "uuid": uuid(),
                        "key": "confirm",
                        "text": lang === 'zh-CN' ? "确认" : "Confirm", 
                        "context": "system_message"
                    },
                    {
                        "uuid": uuid(),
                        "key": "cancel",
                        "text": lang === 'zh-CN' ? "取消" : "Cancel",
                        "context": "system_message"
                    }
                ]
            },
            "validation": {
                "schema_version": "2.0",
                "required_fields": ["uuid", "text"],
                "checksum": "auto_generated"
            }
        };
    }
    
    // 执行提取
    const chineseData = generateJSON('zh-CN', '简体中文');
    const englishData = generateJSON('en', 'English');
    
    // 输出可直接复制的JSON
    console.clear();
    console.log('🎯 页面文本提取完成！直接复制下方内容到对应JSON文件：\n');
    
    console.log('╔══════════════════════════════════════════╗');
    console.log('║           中文语言文件 (lang_cn.json)        ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(JSON.stringify(chineseData, null, 4));
    
    console.log('\n\n╔══════════════════════════════════════════╗');
    console.log('║           英文语言文件 (lang_en.json)        ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(JSON.stringify(englishData, null, 4));
    
    // 复制函数
    window.copyChineseJSON = () => {
        const json = JSON.stringify(chineseData, null, 4);
        navigator.clipboard.writeText(json).then(() => {
            console.log('✅ 中文JSON已复制到剪贴板！');
        });
    };
    
    window.copyEnglishJSON = () => {
        const json = JSON.stringify(englishData, null, 4);
        navigator.clipboard.writeText(json).then(() => {
            console.log('✅ 英文JSON已复制到剪贴板！');
        });
    };
    
    console.log('\n💡 快速复制命令：');
    console.log('copyChineseJSON()  - 复制中文JSON到剪贴板');
    console.log('copyEnglishJSON()  - 复制英文JSON到剪贴板');
    console.log(`\n📊 提取统计: 共 ${chineseData.pages[getPageName()].elements.length} 个文本元素`);
    
})();

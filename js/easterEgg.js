// Easter Egg功能实现
class EasterEgg {
    constructor() {
        this.init();
        this.currentEffect = null;
    }

    init() {
        // 绑定彩蛋选项点击事件
        const easterOptions = document.querySelectorAll('.easter-option');
        easterOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const eggType = e.currentTarget.getAttribute('data-egg');
                this.activateEasterEgg(eggType);
            });
        });

        // 绑定关闭按钮事件
        const closeBtn = document.getElementById('closeEasterEgg');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeEasterEgg();
            });
        }
    }

    activateEasterEgg(type) {
        // 清除之前的效果
        this.clearCurrentEffect();

        switch (type) {
            case 'rainbow-rain':
                this.rainbowRain();
                break;
            case 'random-quote':
                this.randomQuote();
                break;
            case 'konami-code':
                this.konamiCode();
                break;
            case 'time-machine':
                this.timeMachine();
                break;
            default:
                console.log('未知的彩蛋类型:', type);
        }
    }

    clearCurrentEffect() {
        // 清除当前效果
        const contentArea = document.getElementById('easterEggContent');
        if (contentArea) {
            contentArea.innerHTML = '';
            contentArea.style.transform = "";
        }

        // 移除可能存在的动态元素
        const existingRaindrops = document.querySelectorAll('.rainbow-drop');
        existingRaindrops.forEach(drop => drop.remove());

        // 清除定时器
        if (this.currentEffect && this.currentEffect.cleanup) {
            this.currentEffect.cleanup();
        }
        this.currentEffect = null;
        
        // 清除可能存在的样式
        const stylesToRemove = ['rainbowRainStyles', 'quoteStyles', 'timeMachineStyles'];
        stylesToRemove.forEach(styleId => {
            const style = document.getElementById(styleId);
            if (style) {
                style.remove();
            }
        });
    }

    // 彩虹雨效果
    rainbowRain() {
        const contentArea = document.getElementById('easterEggContent');
        contentArea.innerHTML = `
            <div class="rainbow-rain-container">
                <h3>🌈 彩虹雨效果 🌈</h3>
                <p>享受美丽的彩虹雨吧！</p>
                <button id="stopRainbow" class="stop-effect-btn">停止效果</button>
            </div>
        `;

        // 创建彩虹雨动画
        const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        let rainInterval;
        
        const createRaindrop = () => {
            const drop = document.createElement('div');
            drop.className = 'rainbow-drop';
            drop.style.cssText = `
                position: fixed;
                width: 4px;
                height: 20px;
                background: linear-gradient(to bottom, ${colors[Math.floor(Math.random() * colors.length)]}, transparent);
                border-radius: 50px;
                left: ${Math.random() * window.innerWidth}px;
                top: -20px;
                z-index: 9999;
                pointer-events: none;
                animation: rainDrop 2s linear forwards;
            `;
            
            document.body.appendChild(drop);
            
            // 动画结束后移除元素
            setTimeout(() => {
                if (drop.parentNode) {
                    drop.parentNode.removeChild(drop);
                }
            }, 2000);
        };

        // 添加CSS动画
        if (!document.getElementById('rainbowRainStyles')) {
            const style = document.createElement('style');
            style.id = 'rainbowRainStyles';
            style.textContent = `
                @keyframes rainDrop {
                    to {
                        top: ${window.innerHeight + 20}px;
                        opacity: 0;
                    }
                }
                .rainbow-rain-container {
                    text-align: center;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 10px;
                    margin: 20px;
                }
                .stop-effect-btn {
                    background: #ff4757;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-top: 10px;
                }
                .stop-effect-btn:hover {
                    background: #ff3742;
                }
            `;
            document.head.appendChild(style);
        }

        // 开始彩虹雨
        rainInterval = setInterval(createRaindrop, 100);

        // 绑定停止按钮
        document.getElementById('stopRainbow').addEventListener('click', () => {
            this.clearCurrentEffect();
        });

        // 设置当前效果的清理函数
        this.currentEffect = {
            cleanup: () => {
                if (rainInterval) {
                    clearInterval(rainInterval);
                }
                const style = document.getElementById('rainbowRainStyles');
                if (style) {
                    style.remove();
                }
                const drops = document.querySelectorAll('.rainbow-drop');
                drops.forEach(drop => drop.remove());
            }
        };
    }

    // 随机名言效果
    randomQuote() {
        const contentArea = document.getElementById('easterEggContent');
        
        // 名言数据库
        const quotes = [
            { text: "生活就像骑自行车，要想保持平衡就得不停地前进。", author: "爱因斯坦" },
            { text: "今天的你是你过去习惯的结果；今天的习惯，将是你明天的命运。", author: "佛陀" },
            { text: "不要等待机会，而要创造机会。", author: "拿破仑·希尔" },
            { text: "成功不是终点，失败不是末日，继续前进的勇气才最可贵。", author: "丘吉尔" },
            { text: "你今天必须做别人不愿做的事，好让你明天可以拥有别人没有的东西。", author: "Les Brown" },
            { text: "人生最大的敌人是自己怯懦。", author: "拿破仑" },
            { text: "只有在开水里，茶叶才能展开生命浓郁的香气。", author: "易中天" },
            { text: "世界上只有一种真正的英雄主义，就是认清了生活的真相后还依然热爱它。", author: "罗曼·罗兰" },
            { text: "路是脚踏出来的，历史是人写出来的。人的每一步行动都在书写自己的历史。", author: "吉鸿昌" },
            { text: "天行健，君子以自强不息。", author: "《周易》" },
            { text: "落红不是无情物，化作春泥更护花。", author: "龚自珍" },
            { text: "山重水复疑无路，柳暗花明又一村。", author: "陆游" },
            { text: "宝剑锋从磨砺出，梅花香自苦寒来。", author: "古训" },
            { text: "千里之行，始于足下。", author: "老子" },
            { text: "海阔凭鱼跃，天高任鸟飞。", author: "古语" }
        ];

        let currentQuoteIndex = Math.floor(Math.random() * quotes.length);
        let quoteInterval;

        contentArea.innerHTML = `
            <div class="quote-container">
                <h3>💭 智慧名言 💭</h3>
                <div class="quote-display">
                    <div class="quote-text" id="quoteText">"${quotes[currentQuoteIndex].text}"</div>
                    <div class="quote-author" id="quoteAuthor">—— ${quotes[currentQuoteIndex].author}</div>
                </div>
                <div class="quote-controls">
                    <button id="nextQuote" class="quote-btn">🎲 换一句</button>
                    <button id="autoPlay" class="quote-btn">▶️ 自动播放</button>
                    <button id="stopQuote" class="quote-btn stop-btn">❌ 停止</button>
                </div>
                <div class="quote-stats">
                    <span>名言库：${quotes.length} 条 | 当前第 <span id="quoteNumber">${currentQuoteIndex + 1}</span> 条</span>
                </div>
            </div>
        `;

        // 添加样式
        if (!document.getElementById('quoteStyles')) {
            const style = document.createElement('style');
            style.id = 'quoteStyles';
            style.textContent = `
                .quote-container {
                    text-align: center;
                    padding: 25px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 15px;
                    margin: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                
                .quote-display {
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 10px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .quote-text {
                    font-size: 18px;
                    line-height: 1.6;
                    margin-bottom: 15px;
                    font-style: italic;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.8s ease-in-out;
                }
                
                .quote-author {
                    font-size: 14px;
                    opacity: 0.8;
                    font-weight: bold;
                    animation: slideUp 0.8s ease-in-out 0.3s both;
                }
                
                .quote-controls {
                    margin: 20px 0;
                }
                
                .quote-btn {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 12px 20px;
                    margin: 0 8px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                
                .quote-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                
                .quote-btn.stop-btn {
                    background: rgba(255,99,99,0.3);
                }
                
                .quote-btn.stop-btn:hover {
                    background: rgba(255,99,99,0.5);
                }
                
                .quote-btn.active {
                    background: rgba(76,175,80,0.4);
                    border-color: rgba(76,175,80,0.6);
                }
                
                .quote-stats {
                    font-size: 12px;
                    opacity: 0.7;
                    margin-top: 15px;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 0.8; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        // 显示新名言的函数
        const showQuote = (index) => {
            const quoteText = document.getElementById('quoteText');
            const quoteAuthor = document.getElementById('quoteAuthor');
            const quoteNumber = document.getElementById('quoteNumber');
            
            if (quoteText && quoteAuthor && quoteNumber) {
                quoteText.style.animation = 'none';
                quoteAuthor.style.animation = 'none';
                
                setTimeout(() => {
                    quoteText.textContent = `"${quotes[index].text}"`;
                    quoteAuthor.textContent = `—— ${quotes[index].author}`;
                    quoteNumber.textContent = index + 1;
                    
                    quoteText.style.animation = 'fadeIn 0.8s ease-in-out';
                    quoteAuthor.style.animation = 'slideUp 0.8s ease-in-out 0.3s both';
                }, 50);
            }
        };

        // 绑定按钮事件
        document.getElementById('nextQuote').addEventListener('click', () => {
            currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            showQuote(currentQuoteIndex);
        });

        const autoPlayBtn = document.getElementById('autoPlay');
        let isAutoPlaying = false;

        autoPlayBtn.addEventListener('click', () => {
            if (isAutoPlaying) {
                // 停止自动播放
                if (quoteInterval) {
                    clearInterval(quoteInterval);
                }
                autoPlayBtn.textContent = '▶️ 自动播放';
                autoPlayBtn.classList.remove('active');
                isAutoPlaying = false;
            } else {
                // 开始自动播放
                quoteInterval = setInterval(() => {
                    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
                    showQuote(currentQuoteIndex);
                }, 4000); // 每4秒切换一次
                
                autoPlayBtn.textContent = '⏸️ 暂停';
                autoPlayBtn.classList.add('active');
                isAutoPlaying = true;
            }
        });

        document.getElementById('stopQuote').addEventListener('click', () => {
            this.clearCurrentEffect();
        });

        // 设置当前效果的清理函数
        this.currentEffect = {
            cleanup: () => {
                if (quoteInterval) {
                    clearInterval(quoteInterval);
                }
                const style = document.getElementById('quoteStyles');
                if (style) {
                    style.remove();
                }
            }
        };
    }

    // 秘技代码效果
    konamiCode() {
        const contentArea = document.getElementById('easterEggContent');
        
        // Konami 代码序列
        const konamiSequence = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        
        let currentSequence = [];
        let isListening = false;
        let konamiTimeout;
        let successCount = 0;
        
        const keyNames = {
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'KeyB': 'B',
            'KeyA': 'A'
        };

        contentArea.innerHTML = `
            <div class="konami-container">
                <h3>🎮 经典秘技代码 🎮</h3>
                <div class="konami-info">
                    <p>输入经典的 Konami 代码来解锁秘密！</p>
                    <div class="konami-sequence">
                        <span class="sequence-label">秘技序列：</span>
                        <div class="key-sequence">
                            ${konamiSequence.map(key => `<span class="key-display">${keyNames[key]}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="konami-input-area">
                    <div class="input-status">
                        <p>当前输入：</p>
                        <div class="current-input" id="currentInput">
                            <span class="input-prompt">按下开始按钮后开始输入...</span>
                        </div>
                    </div>
                    
                    <div class="konami-controls">
                        <button id="startKonami" class="konami-btn start-btn">🎯 开始输入</button>
                        <button id="resetKonami" class="konami-btn reset-btn">🔄 重置</button>
                        <button id="stopKonami" class="konami-btn stop-btn">❌ 停止</button>
                    </div>
                </div>
                
                <div class="konami-stats">
                    <div class="stat-item">
                        <span class="stat-label">成功次数：</span>
                        <span class="stat-value" id="successCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">剩余时间：</span>
                        <span class="stat-value" id="timeLeft">--</span>
                    </div>
                </div>
                
                <div class="konami-result" id="konamiResult"></div>
            </div>
        `;

        // 添加样式
        if (!document.getElementById('konamiStyles')) {
            const style = document.createElement('style');
            style.id = 'konamiStyles';
            style.textContent = `
                .konami-container {
                    padding: 25px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 15px;
                    margin: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                
                .konami-info {
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .konami-sequence {
                    margin-top: 15px;
                }
                
                .sequence-label {
                    font-weight: bold;
                    margin-bottom: 10px;
                    display: block;
                }
                
                .key-sequence {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 10px;
                }
                
                .key-display {
                    background: rgba(255,255,255,0.3);
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    border: 1px solid rgba(255,255,255,0.4);
                    min-width: 30px;
                    text-align: center;
                }
                
                .key-display.correct {
                    background: rgba(76,175,80,0.5);
                    border-color: rgba(76,175,80,0.7);
                    animation: keySuccess 0.3s ease;
                }
                
                .key-display.wrong {
                    background: rgba(244,67,54,0.5);
                    border-color: rgba(244,67,54,0.7);
                    animation: keyError 0.3s ease;
                }
                
                .konami-input-area {
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                
                .input-status {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .current-input {
                    background: rgba(0,0,0,0.3);
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 10px;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Courier New', monospace;
                }
                
                .input-prompt {
                    opacity: 0.7;
                    font-style: italic;
                }
                
                .konami-controls {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .konami-btn {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                
                .konami-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }
                
                .konami-btn.start-btn:hover { background: rgba(76,175,80,0.4); }
                .konami-btn.reset-btn:hover { background: rgba(255,193,7,0.4); }
                .konami-btn.stop-btn:hover { background: rgba(244,67,54,0.4); }
                
                .konami-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none !important;
                }
                
                .konami-stats {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                
                .stat-item {
                    text-align: center;
                }
                
                .stat-label {
                    display: block;
                    font-size: 12px;
                    opacity: 0.8;
                    margin-bottom: 5px;
                }
                
                .stat-value {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .konami-result {
                    text-align: center;
                    margin-top: 20px;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .success-message {
                    background: rgba(76,175,80,0.3);
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px solid rgba(76,175,80,0.5);
                    animation: successPulse 0.6s ease;
                }
                
                .error-message {
                    background: rgba(244,67,54,0.3);
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px solid rgba(244,67,54,0.5);
                    animation: errorShake 0.6s ease;
                }
                
                @keyframes keySuccess {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                @keyframes keyError {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                @keyframes successPulse {
                    0% { transform: scale(0.9); opacity: 0; }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                @keyframes errorShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `;
            document.head.appendChild(style);
        }

        // 键盘监听函数
        const handleKeyPress = (event) => {
            if (!isListening) return;
            
            event.preventDefault();
            const key = event.code;
            
            if (konamiSequence.includes(key)) {
                currentSequence.push(key);
                updateInputDisplay();
                
                // 检查序列
                if (currentSequence.length <= konamiSequence.length) {
                    const isCorrect = currentSequence.every((inputKey, index) => 
                        inputKey === konamiSequence[index]
                    );
                    
                    if (isCorrect) {
                        // 序列正确
                        if (currentSequence.length === konamiSequence.length) {
                            // 完成整个序列
                            konamiSuccess();
                        }
                    } else {
                        // 序列错误
                        konamiError();
                    }
                }
                
                // 重置超时
                if (konamiTimeout) clearTimeout(konamiTimeout);
                startTimeout();
            }
        };

        const updateInputDisplay = () => {
            const inputDiv = document.getElementById('currentInput');
            if (currentSequence.length === 0) {
                inputDiv.innerHTML = '<span class="input-prompt">等待输入...</span>';
            } else {
                inputDiv.innerHTML = currentSequence.map(key => 
                    `<span class="key-display">${keyNames[key]}</span>`
                ).join(' ');
            }
        };

        const startTimeout = () => {
            let timeLeft = 10;
            document.getElementById('timeLeft').textContent = timeLeft + 's';
            
            konamiTimeout = setInterval(() => {
                timeLeft--;
                document.getElementById('timeLeft').textContent = timeLeft + 's';
                
                if (timeLeft <= 0) {
                    clearTimeout(konamiTimeout);
                    konamiError('超时！');
                }
            }, 1000);
        };

        const konamiSuccess = () => {
            isListening = false;
            successCount++;
            document.getElementById('successCount').textContent = successCount;
            
            if (konamiTimeout) clearTimeout(konamiTimeout);
            document.getElementById('timeLeft').textContent = '--';
            
            const messages = [
                '🎉 恭喜！你解锁了 Konami 代码！',
                '� 经典秘技！获得 30 条生命！',
                '🚀 代码大师！你掌握了古老的力量！',
                '⭐ 完美输入！真正的游戏玩家！',
                '🎮 传说中的秘技！你太厉害了！'
            ];
            
            document.getElementById('konamiResult').innerHTML = 
                `<div class="success-message">${messages[Math.floor(Math.random() * messages.length)]}</div>`;
            
            // 重置按钮状态
            document.getElementById('startKonami').disabled = false;
            resetSequence();
        };

        const konamiError = (message = '❌ 输入错误，请重新开始！') => {
            isListening = false;
            
            if (konamiTimeout) clearTimeout(konamiTimeout);
            document.getElementById('timeLeft').textContent = '--';
            
            document.getElementById('konamiResult').innerHTML = 
                `<div class="error-message">${message}</div>`;
            
            // 重置按钮状态
            document.getElementById('startKonami').disabled = false;
            resetSequence();
        };

        const resetSequence = () => {
            currentSequence = [];
            updateInputDisplay();
        };

        const startListening = () => {
            isListening = true;
            resetSequence();
            document.getElementById('konamiResult').innerHTML = '';
            document.getElementById('startKonami').disabled = true;
            document.getElementById('currentInput').innerHTML = '<span class="input-prompt">等待输入...</span>';
            startTimeout();
        };

        // 绑定按钮事件
        document.getElementById('startKonami').addEventListener('click', startListening);
        
        document.getElementById('resetKonami').addEventListener('click', () => {
            isListening = false;
            if (konamiTimeout) clearTimeout(konamiTimeout);
            document.getElementById('timeLeft').textContent = '--';
            document.getElementById('startKonami').disabled = false;
            document.getElementById('konamiResult').innerHTML = '';
            resetSequence();
        });
        
        document.getElementById('stopKonami').addEventListener('click', () => {
            this.clearCurrentEffect();
        });

        // 设置当前效果的清理函数
        this.currentEffect = {
            cleanup: () => {
                isListening = false;
                if (konamiTimeout) clearTimeout(konamiTimeout);
                document.removeEventListener('keydown', handleKeyPress);
                const style = document.getElementById('konamiStyles');
                if (style) {
                    style.remove();
                }
            }
        };

        // 添加键盘监听
        document.addEventListener('keydown', handleKeyPress);
    }

    // 时光机效果
    timeMachine() {
        const contentArea = document.getElementById('easterEggContent');
        
        // 历史年代数据
        const timeEras = [
            {
                year: "2024年",
                title: "AI革命时代",
                description: "人工智能技术飞速发展，ChatGPT引领大语言模型潮流",
                color: "#667eea",
                icon: "🤖",
                events: ["ChatGPT爆火", "AI绘画普及", "自动驾驶技术成熟", "元宇宙概念兴起"]
            },
            {
                year: "2020年",
                title: "疫情时代",
                description: "全球疫情改变了世界，远程办公和在线教育成为新常态",
                color: "#ff6b6b",
                icon: "😷",
                events: ["新冠疫情爆发", "远程办公普及", "在线教育兴起", "数字化转型加速"]
            },
            {
                year: "2010年",
                title: "移动互联网时代",
                description: "智能手机普及，移动应用改变生活方式",
                color: "#4ecdc4",
                icon: "📱",
                events: ["iPhone 4发布", "微信诞生", "移动支付兴起", "社交媒体爆发"]
            },
            {
                year: "2000年",
                title: "互联网泡沫时代",
                description: "互联网开始普及，网络经济初现端倪",
                color: "#45b7d1",
                icon: "💻",
                events: ["互联网泡沫", "搜索引擎兴起", "电子商务起步", "网络游戏流行"]
            },
            {
                year: "1990年",
                title: "个人电脑时代",
                description: "个人计算机开始普及，信息化革命拉开序幕",
                color: "#96ceb4",
                icon: "🖥️",
                events: ["Windows 95发布", "互联网诞生", "CD-ROM普及", "游戏机发展"]
            },
            {
                year: "1980年",
                title: "电子产品时代",
                description: "各种电子产品涌现，生活开始数字化",
                color: "#feca57",
                icon: "📺",
                events: ["个人电脑出现", "游戏机诞生", "录像机普及", "随身听流行"]
            },
            {
                year: "1970年",
                title: "太空探索时代",
                description: "人类登月成功，科技发展迅猛",
                color: "#ff9ff3",
                icon: "🚀",
                events: ["阿波罗登月", "微处理器发明", "互联网前身ARPANET", "第一台个人电脑"]
            },
            {
                year: "1960年",
                title: "文化革命时代",
                description: "社会变革，音乐和艺术蓬勃发展",
                color: "#54a0ff",
                icon: "🎸",
                events: ["披头士乐队", "嬉皮士文化", "民权运动", "冷战高峰"]
            }
        ];

        let currentEraIndex = 0;
        let timeInterval;
        let isAutoTraveling = false;

        contentArea.innerHTML = `
            <div class="time-machine-container">
                <h3>⏰ 时光机器 ⏰</h3>
                <div class="time-display">
                    <div class="time-era" id="timeEra">
                        <div class="era-icon" id="eraIcon">${timeEras[currentEraIndex].icon}</div>
                        <div class="era-year" id="eraYear">${timeEras[currentEraIndex].year}</div>
                        <div class="era-title" id="eraTitle">${timeEras[currentEraIndex].title}</div>
                        <div class="era-description" id="eraDescription">${timeEras[currentEraIndex].description}</div>
                    </div>
                </div>
                
                <div class="time-events">
                    <h4>📅 重要事件</h4>
                    <div class="events-list" id="eventsList">
                        ${timeEras[currentEraIndex].events.map(event => 
                            `<div class="event-item">• ${event}</div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="time-controls">
                    <button id="prevEra" class="time-btn prev-btn">⏪ 后退</button>
                    <button id="randomEra" class="time-btn random-btn">🎲 随机</button>
                    <button id="autoTravel" class="time-btn auto-btn">🔄 自动穿越</button>
                    <button id="nextEra" class="time-btn next-btn">⏩ 前进</button>
                </div>
                
                <div class="time-stats">
                    <div class="stat-item">
                        <span class="stat-label">当前时代：</span>
                        <span class="stat-value" id="currentIndex">${currentEraIndex + 1}/${timeEras.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">穿越状态：</span>
                        <span class="stat-value" id="travelStatus">静止</span>
                    </div>
                </div>
                
                <button id="stopTimeMachine" class="time-btn stop-btn">❌ 停止时光机</button>
            </div>
        `;

        // 添加样式
        if (!document.getElementById('timeMachineStyles')) {
            const style = document.createElement('style');
            style.id = 'timeMachineStyles';
            style.textContent = `
                .time-machine-container {
                    padding: 25px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 15px;
                    margin: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                
                .time-display {
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 15px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .time-display::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(transparent, rgba(255,255,255,0.1), transparent);
                    animation: rotate 3s linear infinite;
                }
                
                .time-era {
                    position: relative;
                    z-index: 2;
                }
                
                .era-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                    animation: float 2s ease-in-out infinite;
                }
                
                .era-year {
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #ffd700;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    animation: glow 2s ease-in-out infinite alternate;
                }
                
                .era-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    animation: slideIn 0.6s ease-out;
                }
                
                .era-description {
                    font-size: 16px;
                    opacity: 0.9;
                    line-height: 1.6;
                    animation: slideIn 0.6s ease-out 0.2s both;
                }
                
                .time-events {
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                
                .time-events h4 {
                    text-align: center;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .events-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                }
                
                .event-item {
                    background: rgba(255,255,255,0.1);
                    padding: 12px;
                    border-radius: 8px;
                    border-left: 4px solid #ffd700;
                    animation: slideUp 0.4s ease-out;
                }
                
                .time-controls {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin: 25px 0;
                    flex-wrap: wrap;
                }
                
                .time-btn {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    min-width: 100px;
                }
                
                .time-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                
                .time-btn.prev-btn:hover { background: rgba(255,193,7,0.4); }
                .time-btn.next-btn:hover { background: rgba(76,175,80,0.4); }
                .time-btn.random-btn:hover { background: rgba(156,39,176,0.4); }
                .time-btn.auto-btn:hover { background: rgba(33,150,243,0.4); }
                .time-btn.stop-btn:hover { background: rgba(244,67,54,0.4); }
                
                .time-btn.auto-btn.active {
                    background: rgba(33,150,243,0.5);
                    border-color: rgba(33,150,243,0.7);
                    animation: pulse 1s ease-in-out infinite;
                }
                
                .time-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none !important;
                }
                
                .time-stats {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                
                .stat-item {
                    text-align: center;
                }
                
                .stat-label {
                    display: block;
                    font-size: 12px;
                    opacity: 0.8;
                    margin-bottom: 5px;
                }
                
                .stat-value {
                    font-size: 16px;
                    font-weight: bold;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes glow {
                    from { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
                    to { text-shadow: 0 0 20px rgba(255,215,0,0.8), 2px 2px 4px rgba(0,0,0,0.3); }
                }
                
                @keyframes rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }

        // 更新时代显示
        const updateEra = (index, withAnimation = true) => {
            const era = timeEras[index];
            
            // 更新背景色
            const timeDisplay = document.querySelector('.time-display');
            timeDisplay.style.background = `linear-gradient(135deg, ${era.color}aa, ${era.color}66)`;
            
            // 更新内容
            if (withAnimation) {
                // 淡出效果
                const timeEra = document.getElementById('timeEra');
                timeEra.style.animation = 'none';
                timeEra.style.opacity = '0';
                
                setTimeout(() => {
                    document.getElementById('eraIcon').textContent = era.icon;
                    document.getElementById('eraYear').textContent = era.year;
                    document.getElementById('eraTitle').textContent = era.title;
                    document.getElementById('eraDescription').textContent = era.description;
                    
                    // 更新事件列表
                    document.getElementById('eventsList').innerHTML = 
                        era.events.map(event => `<div class="event-item">• ${event}</div>`).join('');
                    
                    // 淡入效果
                    timeEra.style.opacity = '1';
                    timeEra.style.animation = 'slideIn 0.6s ease-out';
                }, 200);
            } else {
                document.getElementById('eraIcon').textContent = era.icon;
                document.getElementById('eraYear').textContent = era.year;
                document.getElementById('eraTitle').textContent = era.title;
                document.getElementById('eraDescription').textContent = era.description;
                document.getElementById('eventsList').innerHTML = 
                    era.events.map(event => `<div class="event-item">• ${event}</div>`).join('');
            }
            
            // 更新统计信息
            document.getElementById('currentIndex').textContent = `${index + 1}/${timeEras.length}`;
            
            // 更新按钮状态
            document.getElementById('prevEra').disabled = index === 0;
            document.getElementById('nextEra').disabled = index === timeEras.length - 1;
        };

        // 绑定按钮事件
        document.getElementById('prevEra').addEventListener('click', () => {
            if (currentEraIndex > 0) {
                currentEraIndex--;
                updateEra(currentEraIndex);
            }
        });

        document.getElementById('nextEra').addEventListener('click', () => {
            if (currentEraIndex < timeEras.length - 1) {
                currentEraIndex++;
                updateEra(currentEraIndex);
            }
        });

        document.getElementById('randomEra').addEventListener('click', () => {
            const newIndex = Math.floor(Math.random() * timeEras.length);
            currentEraIndex = newIndex;
            updateEra(currentEraIndex);
        });

        const autoTravelBtn = document.getElementById('autoTravel');
        autoTravelBtn.addEventListener('click', () => {
            if (isAutoTraveling) {
                // 停止自动穿越
                if (timeInterval) {
                    clearInterval(timeInterval);
                }
                autoTravelBtn.textContent = '🔄 自动穿越';
                autoTravelBtn.classList.remove('active');
                document.getElementById('travelStatus').textContent = '静止';
                isAutoTraveling = false;
            } else {
                // 开始自动穿越
                timeInterval = setInterval(() => {
                    currentEraIndex = (currentEraIndex + 1) % timeEras.length;
                    updateEra(currentEraIndex);
                }, 3000); // 每3秒切换一个时代
                
                autoTravelBtn.textContent = '⏸️ 暂停穿越';
                autoTravelBtn.classList.add('active');
                document.getElementById('travelStatus').textContent = '穿越中...';
                isAutoTraveling = true;
            }
        });

        document.getElementById('stopTimeMachine').addEventListener('click', () => {
            this.clearCurrentEffect();
        });

        // 初始化显示
        updateEra(currentEraIndex, false);

        // 设置当前效果的清理函数
        this.currentEffect = {
            cleanup: () => {
                if (timeInterval) {
                    clearInterval(timeInterval);
                }
                const style = document.getElementById('timeMachineStyles');
                if (style) {
                    style.remove();
                }
            }
        };
    }

    closeEasterEgg() {
        this.clearCurrentEffect();
        // 这里可能需要隐藏整个彩蛋模态框
        // 具体实现取决于模态框的显示逻辑
    }
}

// 当DOM加载完成后初始化彩蛋功能
document.addEventListener('DOMContentLoaded', () => {
    window.easterEgg = new EasterEgg();
});

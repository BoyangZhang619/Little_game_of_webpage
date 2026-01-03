window.onload = () => {
    [isScroll, isRecover, isLangShow, theme, isPhone, isSettingShow, isLogin] = [false, false, false, false, /mobile/i.test(navigator.userAgent), false, false];
    if (isPhone) setStyleOfMobileDevice();
    initializeSettingsPage();
    console.log("你玩原神吗？");
}
// let db = null;
document.querySelector('#cover').addEventListener('click', () => {
    const cover = document.querySelector('#cover');
    Object.assign(cover.style, {
        opacity: '0',
        pointerEvents: 'none',
        transition: 'all 1.8s linear'
    });
    Object.assign(cover.children[1].children[0].style, {
        pointerEvents: 'none',
        transform: 'translateY(-650vh)',
        transition: 'all 1.8s linear'
    });
    Object.assign(cover.children[1].children[1].style, {
        pointerEvents: 'none',
        transform: 'translateY(350vh)',
        transition: 'all 1.8s linear'
    });
    Object.assign(cover.children[0].children[0].style, {
        pointerEvents: 'none',
        transform: 'scale(0.8)',
        transition: 'all 1.5s linear'
    });
    Object.assign(cover.children[0].children[1].style, {
        pointerEvents: 'none',
        transform: 'scale(0.8)',
        transition: 'all 1.5s linear'
    });
    setTimeout(showmainpage, 1000);
});
addEventListener('scroll', () => {
    if (scrollY > 70 && !isScroll) {
        navDisplay("Hide");
        isScroll = true;
        return 0
    }
    else if (scrollY < 70 && isScroll) {
        navDisplay("Show");
        isScroll = false;
        return 0
    }
});


// 彩蛋功能事件监听器
document.querySelector("#navEasterEgg").addEventListener('click', () => {
    showEasterEgg();
});

document.querySelector("#closeEasterEgg").addEventListener('click', () => {
    hideEasterEgg();
});

// 点击彩蛋模态框背景关闭
document.querySelector("#easterEggModal").addEventListener('click', (e) => {
    if (e.target.id === 'easterEggModal') {
        hideEasterEgg();
    }
});

// ESC键关闭彩蛋模态框
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector("#easterEggModal").classList.contains('show')) {
        hideEasterEgg();
    }
});

document.querySelector("#navSetting").addEventListener('click', async () => {
    isSettingShow = !isSettingShow;
    setSetting(isSettingShow ? "show" : "hide");
    await loadUser();
});
function showmainpage() {
    isRecover = true;
    scrollTo(0, 0);
    navDisplay("Show");
    setTimeout(() => { cover.style.display = 'none'; document.querySelector("#main").style.opacity = 1; }, 800);
}
function navDisplay(kind) {
    if (isRecover) document.querySelector("#nav").style.animation = `nav${kind} 1s ease-in-out forwards`;
}
function setStyleOfMobileDevice() {
    // 现代简约布局在 CSS 中通过媒体查询处理
    // 这里只需要处理一些 JS 需要控制的样式
    document.querySelector("#main").style.paddingTop = "0";
}
function setScreenBlock(mode = "show", title = "title", explanation = ["explanation"]) {
    document.querySelector("#screenBlock").style.display = mode === "show" ? "block" : "none";
}
function setNavLang(show = true, lang = "en-us") {
    document.documentElement.lang = lang;
    (show ? ["中", "𝐄𝐧"] : ["🌗", "🛠"]).forEach((item, index) => document.querySelectorAll(".notLang")[index].textContent = item);
}
function setSetting(mode = "show") {
    // if (isPhone) { alert("手机端因不支持该功能"); return 0; }
    document.querySelector("#setting").classList.add(isPhone ?"settingPhone":"settingComputer");
    if (mode == 'show') {
        document.querySelector("#main").style.opacity = '0';
        document.querySelector("#setting").style.display = 'block';
        setTimeout(() => {
            document.querySelector("#main").style.display = 'none';
            Object.assign(document.querySelector("#setting").style, {
                opacity: '1',
                transition: 'all 0.8s ease',
                width: 'min(90vw, 1000px)'
            })
        }, 600);
    }
    else {
        Object.assign(document.querySelector("#setting").style, {
            opacity: '0',
            transition: 'all 0.8s ease',
            width: '0px'
        })
        document.querySelector("#main").style.display = 'block';
        setTimeout(() => {
            document.querySelector("#setting").style.display = 'none';
            document.querySelector("#main").style.opacity = '1';
        }, 600);
    }
}

document.getElementById("toRegisterButton").addEventListener("click", () => {
    document.getElementById("waitforregist").style.display = "none";
    document.getElementsByClassName("accountShowInfo")[0].style.display = "block";
    document.getElementsByClassName("accountShowInfo")[1].style.display = "none";
});
document.getElementById("toLoginButton").addEventListener("click", () => {
    document.getElementById("waitforregist").style.display = "none";
    document.getElementsByClassName("accountShowInfo")[1].style.display = "block";
    document.getElementsByClassName("accountShowInfo")[0].style.display = "none";
});
Array.from(document.getElementsByClassName("returnAccountProgram")).forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("waitforregist").style.display = "block";
        document.getElementsByClassName("accountShowInfo")[0].style.display = "none";
        document.getElementsByClassName("accountShowInfo")[1].style.display = "none";
    });
});


class UserManager {
    constructor(userDBName = "UserDB", userStoreName = "userStore", currentUserStore = "cntUserData", userNameStore = "userNames") {
        this.userDBName = userDBName;
        this.userStoreName = userStoreName;
        this.currentUserStore = currentUserStore;
        this.userNameStore = userNameStore;
        this.db = null;
    }

    // 打开数据库
    async openDB(version = 3) {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.userDBName, version);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.userStoreName)) {
                    db.createObjectStore(this.userStoreName, { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains(this.currentUserStore)) {
                    db.createObjectStore(this.currentUserStore, { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains(this.userNameStore)) {
                    // 用户名仓库，用于快速检查重复
                    db.createObjectStore(this.userNameStore, { keyPath: "name" });
                }
            };

            request.onsuccess = event => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = e => reject("IndexedDB 打开失败: " + e.target.errorCode);
        });
    }

    // Base64 安全编码/解码（支持 Unicode）
    encodeBase64(obj) {
        return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    }
    decodeBase64(str) {
        try {
            return JSON.parse(decodeURIComponent(escape(atob(str))));
        } catch {
            return null;
        }
    }

    // 写入数据
    async dbSet(data, storeName) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            store.put({ id: storeName === this.userStoreName ? data[0] : ".", data: data[1] });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject("数据写入失败");
        });
    }

    // 读取数据
    async dbGet(storeName, id) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result?.data || null);
            request.onerror = () => reject("读取失败");
        });
    }

    // 删除数据
    async dbDelete(storeName, id) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            store.delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject("删除失败");
        });
    }

    // 检查用户名是否已存在
    async isUsernameExists(name) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.userNameStore, "readonly");
            const store = tx.objectStore(this.userNameStore);
            const request = store.get(name);
            
            request.onsuccess = () => {
                resolve(request.result !== undefined);
            };
            
            request.onerror = () => reject("检查用户名失败");
        });
    }

    // 添加用户名到用户名仓库
    async addUsername(name, userId) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.userNameStore, "readwrite");
            const store = tx.objectStore(this.userNameStore);
            store.put({ name: name, userId: userId, createdAt: new Date().toISOString() });
            
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject("添加用户名失败");
        });
    }

    // 从用户名仓库删除用户名
    async removeUsername(name) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.userNameStore, "readwrite");
            const store = tx.objectStore(this.userNameStore);
            store.delete(name);
            
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject("删除用户名失败");
        });
    }

    // 注册新用户
    async registerUser({ name, password, description = "" }) {
        if (!name?.trim()) throw new Error("请输入用户名");
        if (!password?.trim()) throw new Error("请输入密码");
        
        // 检查用户名长度和格式
        const trimmedName = name.trim();
        if (trimmedName.length < 2 || trimmedName.length > 20) {
            throw new Error("用户名长度必须在2-20个字符之间");
        }
        
        // 检查用户名是否包含特殊字符（只允许中文、英文、数字、下划线）
        if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(trimmedName)) {
            throw new Error("用户名只能包含中文、英文、数字和下划线");
        }
        
        // 检查用户名是否已存在
        const usernameExists = await this.isUsernameExists(trimmedName);
        if (usernameExists) {
            throw new Error(`用户名 "${trimmedName}" 已被注册，请选择其他用户名`);
        }
        
        if (!/^(?=.{9,18}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#_])[A-Za-z\d@#_]{9,18}$/.test(password)) {
            throw new Error("密码格式不正确: 9-18位，必须包含大写、小写、数字和@#_");
        }

        const user = {
            name: trimmedName,
            password,
            description: description.trim(),
            headSculpture: "default",
            email: "",
            phone: "",
            theme: theme ? "dark" : "light", // false为light，true为dark
            otherSettings: {},
            registeredAt: new Date().toISOString()
        };

        const userId = this.encodeBase64(crypto.randomUUID());
        const encoded = [userId, this.encodeBase64(user)];
        
        try {
            // 同时保存用户数据和用户名
            await this.dbSet(encoded, this.userStoreName);
            await this.addUsername(trimmedName, userId);
            
            // 注册后立即登录
            await this.setCurrentUser(userId);
            return user;
        } catch (error) {
            // 如果保存失败，清理已保存的数据
            try {
                await this.dbDelete(this.userStoreName, userId);
                await this.removeUsername(trimmedName);
            } catch (cleanupError) {
                console.warn("清理失败的注册数据时出错:", cleanupError);
            }
            throw new Error("注册失败: " + error.message);
        }
    }

    // 设置当前登录用户
    async setCurrentUser(userId) {
        await this.dbDelete(this.currentUserStore, ".");
        await this.dbSet([userId, this.encodeBase64({ uid: userId })], this.currentUserStore);
    }

    // 获取当前登录用户
    async getCurrentUser() {
        const raw = await this.dbGet(this.currentUserStore, ".");
        if (!raw) return null;
        const id = this.decodeBase64(raw)?.uid;
        if (!id) return null;
        const userData = await this.dbGet(this.userStoreName, id);
        return this.decodeBase64(userData);
    }

    // 登录验证
    async login(name, password) {
        console.log(`尝试登录用户: ${name}, 密码: ${password}`);
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.userStoreName, "readonly");
            const store = tx.objectStore(this.userStoreName);
            const request = store.openCursor();

            request.onsuccess = async event => {
                const cursor = event.target.result;
                if (cursor) {
                    const user = this.decodeBase64(cursor.value.data);
                    if (user.name === name && user.password === password) {
                        await this.setCurrentUser(cursor.value.id);
                        resolve(user);
                        return;
                    }
                    cursor.continue();
                } else {
                    reject("用户名或密码错误");
                }
            };

            request.onerror = () => reject("登录失败");
        });
    }

    // 退出登录（保留用户数据）
    async logout() {
        try {
            await this.dbDelete(this.currentUserStore, ".");
            
            // 重置主题为默认（浅色）
            theme = false;
            document.querySelector("body").style.backgroundColor = "aliceblue";
            if (!isPhone) document.querySelector("#content").style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            
            // 同步更新魔法光标的深色模式
            if (typeof MagicCursor !== 'undefined' && MagicCursor.setDarkMode) {
                MagicCursor.setDarkMode(false);
            }
            
            // 重置设置页面中的主题选项状态
            document.querySelectorAll(".themeOption").forEach(opt => {
                opt.classList.remove("active");
            });
            const lightThemeOption = document.querySelector(`.themeOption[data-theme="light"]`);
            if (lightThemeOption) {
                lightThemeOption.classList.add("active");
            }
            
            console.log("用户已退出登录");
            return true;
        } catch (error) {
            console.error("退出登录失败:", error);
            throw new Error("退出登录失败");
        }
    }

    // 注销账户（删除用户数据）
    async deleteAccount() {
        try {
            // 首先获取当前用户ID和数据
            const raw = await this.dbGet(this.currentUserStore, ".");
            if (!raw) throw new Error("没有找到当前登录用户");
            
            const userId = this.decodeBase64(raw)?.uid;
            if (!userId) throw new Error("无法获取用户ID");

            // 获取用户数据以获取用户名
            const userData = await this.dbGet(this.userStoreName, userId);
            const user = this.decodeBase64(userData);
            const username = user?.name;

            // 删除用户数据
            await this.dbDelete(this.userStoreName, userId);
            
            // 删除用户名记录
            if (username) {
                await this.removeUsername(username);
            }
            
            // 清除当前登录状态
            await this.dbDelete(this.currentUserStore, ".");
            
            console.log("用户账户已注销，用户名已释放");
            return true;
        } catch (error) {
            console.error("注销账户失败:", error);
            throw new Error("注销账户失败: " + error.message);
        }
    }

    // 检查用户是否已登录
    async isLoggedIn() {
        const user = await this.getCurrentUser();
        return user !== null;
    }

    // 获取所有用户列表
    async getAllUsers() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.userStoreName, "readonly");
            const store = tx.objectStore(this.userStoreName);
            const request = store.getAll();

            request.onsuccess = () => {
                const users = request.result.map(item => ({
                    id: item.id,
                    ...this.decodeBase64(item.data)
                }));
                resolve(users);
            };

            request.onerror = () => reject("获取用户列表失败");
        });
    }

    // 获取所有已注册的用户名（用于管理和调试）
    async getAllUsernames() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.userNameStore, "readonly");
            const store = tx.objectStore(this.userNameStore);
            const request = store.getAll();

            request.onsuccess = () => {
                const usernames = request.result.map(item => ({
                    name: item.name,
                    userId: item.userId,
                    createdAt: item.createdAt
                }));
                resolve(usernames);
            };

            request.onerror = () => reject("获取用户名列表失败");
        });
    }

    // 检查数据库数据一致性（调试用）
    async checkDataIntegrity() {
        try {
            const users = await this.getAllUsers();
            const usernames = await this.getAllUsernames();
            
            console.log("=== 数据库一致性检查 ===");
            console.log(`用户总数: ${users.length}`);
            console.log(`用户名记录总数: ${usernames.length}`);
            
            // 检查是否有用户没有对应的用户名记录
            const usersWithoutUsername = users.filter(user => 
                !usernames.some(un => un.name === user.name)
            );
            
            if (usersWithoutUsername.length > 0) {
                console.warn("发现没有用户名记录的用户:", usersWithoutUsername);
            }
            
            // 检查是否有用户名记录没有对应的用户
            const orphanUsernames = usernames.filter(un => 
                !users.some(user => user.name === un.name)
            );
            
            if (orphanUsernames.length > 0) {
                console.warn("发现孤立的用户名记录:", orphanUsernames);
            }
            
            return {
                userCount: users.length,
                usernameCount: usernames.length,
                usersWithoutUsername,
                orphanUsernames,
                isConsistent: usersWithoutUsername.length === 0 && orphanUsernames.length === 0
            };
        } catch (error) {
            console.error("数据一致性检查失败:", error);
            throw error;
        }
    }
}

const userManager = new UserManager();

// 注册用户
document.getElementById("saveAccountInfo").addEventListener("click", async () => {
    try {
        const name = document.querySelector(".accountShowNameInput").value.trim();
        const password = document.querySelector(".accountShowPasswordInput").value.trim();
        const passwordAgain = document.querySelector(".accountShowPasswordAgainInput").value.trim();
        const description = document.querySelector(".accountShowDescriptionInput").value.trim();

        // 基本验证
        if (!name) {
            alert("请输入用户名");
            return;
        }
        
        if (!password) {
            alert("请输入密码");
            return;
        }

        if (password !== passwordAgain) {
            alert("两次输入的密码不一致，请重新输入");
            return;
        }

        // 显示注册中状态
        const registerButton = document.getElementById("saveAccountInfo");
        const originalText = registerButton.textContent;
        registerButton.textContent = "registering...";
        registerButton.disabled = true;

        try {
            const user = await userManager.registerUser({ name, password, description });
            alert(`注册成功！欢迎 ${user.name}，已自动为您登录。`);
            updateUI(user);
            
            // 清空输入框
            document.querySelectorAll(".form-input")
                .forEach(input => input.value = "");
                
        } finally {
            // 恢复按钮状态
            registerButton.textContent = originalText;
            registerButton.disabled = false;
        }
        
    } catch (err) {
        alert(err.message);
        console.error("注册失败:", err);
    }
});

// 登录用户
document.getElementById("Login").addEventListener("click", async () => {
    try {
        const name = document.querySelectorAll(".accountShowNameInput")[1].value.trim();
        const password = document.querySelectorAll(".accountShowPasswordInput")[1].value.trim();
        
        // 基本验证
        if (!name) {
            alert("请输入用户名");
            return;
        }
        
        if (!password) {
            alert("请输入密码");
            return;
        }
        
        // 显示登录中状态
        const loginButton = document.getElementById("Login");
        const originalText = loginButton.textContent;
        loginButton.textContent = "logging in...";
        loginButton.disabled = true;
        
        try {
            const user = await userManager.login(name, password);
            alert(`登录成功！欢迎回来，${user.name}`);
            updateUI(user);
            
            // 清空登录输入框
            document.querySelectorAll(".accountShowNameInput")[1].value = "";
            document.querySelectorAll(".accountShowPasswordInput")[1].value = "";
            
        } finally {
            // 恢复按钮状态
            loginButton.textContent = originalText;
            loginButton.disabled = false;
        }
        
    } catch (err) {
        alert(err);
        console.error("登录失败:", err);
    }
});

// 页面加载时检查当前登录用户
window.addEventListener("load", async () => {
    try {
        const user = await userManager.getCurrentUser();
        if (user) {
            updateUI(user);
            console.log(`页面加载时发现用户 ${user.name} 已登录`);
        } else {
            // 如果没有登录用户，确保UI为默认状态
            resetUI();
            console.log("页面加载时未发现登录用户，UI已设置为默认状态");
        }
    } catch (error) {
        console.error("页面加载时检查用户状态失败:", error);
        // 发生错误时也重置为默认状态
        resetUI();
    }
});

// 退出登录按钮
document.getElementById("logoutButton")?.addEventListener("click", async () => {
    try {
        const confirmed = confirm("确定要退出登录吗？");
        if (!confirmed) return;
        
        await userManager.logout();
        alert("已退出登录");
        
        // 重置UI到未登录状态
        resetUI();
    } catch (err) {
        alert("退出登录失败: " + err.message);
    }
});

// 注销账户按钮
document.getElementById("deleteAccountButton")?.addEventListener("click", async () => {
    try {
        const confirmed = confirm("警告：注销账户将永久删除您的所有数据，此操作不可恢复！\n确定要注销账户吗？");
        if (!confirmed) return;
        
        const doubleConfirm = confirm("请再次确认：您真的要永久删除账户吗？");
        if (!doubleConfirm) return;
        
        await userManager.deleteAccount();
        alert("账户已注销");
        
        // 重置UI到未登录状态
        resetUI();
    } catch (err) {
        alert("注销账户失败: " + err.message);
    }
});

// 更新页面 UI
function updateUI(user) {
    document.querySelector("#accountGreeting").style.display = "block";
    document.querySelector("#waitforregist").style.display = "none";
    document.querySelectorAll(".accountShowInfo").forEach(el => el.style.display = "none");
    document.querySelector("#accountShowNameSpan").textContent = user.name;
    
    // 更新用户注册信息显示
    const registerNameElement = document.querySelector("#accountRegisterName");
    const registerDescriptionElement = document.querySelector("#accountRegisterDescription");
    
    if (registerNameElement) {
        registerNameElement.textContent = user.name;
    }
    
    if (registerDescriptionElement) {
        registerDescriptionElement.textContent = user.description || "This user is very lazy and hasn't written anything~~~";
    }
    
    // 根据用户主题设置更新全局主题
    const userTheme = user.theme;
    if (userTheme === "dark") {
        theme = true;
        document.querySelector("body").style.backgroundColor = "#2f4256";
        if (!isPhone) document.querySelector("#content").style.backgroundColor = "#0000";
    } else {
        theme = false;
        document.querySelector("body").style.backgroundColor = "aliceblue";
        if (!isPhone) document.querySelector("#content").style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    }
    
    // 同步更新魔法光标的深色模式
    if (typeof MagicCursor !== 'undefined' && MagicCursor.setDarkMode) {
        MagicCursor.setDarkMode(userTheme === "dark");
    }
    
    // 同步设置页面中的主题选项状态
    document.querySelectorAll(".themeOption").forEach(opt => {
        opt.classList.remove("active");
    });
    const activeThemeOption = document.querySelector(`.themeOption[data-theme="${userTheme}"]`);
    if (activeThemeOption) {
        activeThemeOption.classList.add("active");
    }
    
    console.log(`用户 ${user.name} 已登录，主题设置为: ${userTheme}`);
}

// 重置UI到未登录状态
function resetUI() {
    document.querySelector("#accountGreeting").style.display = "none";
    document.querySelector("#waitforregist").style.display = "block";
    document.querySelectorAll(".accountShowInfo").forEach(el => el.style.display = "none");
    document.querySelector("#accountShowNameSpan").textContent = "";
    
    // 重置用户注册信息显示为默认值
    const registerNameElement = document.querySelector("#accountRegisterName");
    const registerDescriptionElement = document.querySelector("#accountRegisterDescription");
    
    if (registerNameElement) {
        registerNameElement.textContent = "Unregistered";
    }
    
    if (registerDescriptionElement) {
        registerDescriptionElement.textContent = "This user is very lazy and hasn't written anything~~~";
    }
    
    // 重置主题为默认（浅色主题）
    theme = false;
    document.querySelector("body").style.transition = "all 0.3s ease";
    document.querySelector("body").style.backgroundColor = "aliceblue";
    if (!isPhone) {
        document.querySelector("#content").style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    }
    
    // 同步更新魔法光标的深色模式
    if (typeof MagicCursor !== 'undefined' && MagicCursor.setDarkMode) {
        MagicCursor.setDarkMode(false);
    }
    
    // 清空输入框
    document.querySelectorAll(".form-input")
        .forEach(input => input.value = "");
    
    console.log("UI已重置为默认状态，主题已设置为浅色");
}

// 兼容原有代码的 loadUser 函数
async function loadUser() {
    try {
        const user = await userManager.getCurrentUser();
        if (user) {
            updateUI(user);
            console.log("当前登录用户:", user.name);
        } else {
            console.log("没有用户登录");
            // 如果没有登录用户，重置为默认状态
            resetUI();
        }
    } catch (error) {
        console.error("加载用户失败:", error);
        // 发生错误时重置为默认状态
        resetUI();
    }
}

// 设置页面分类切换功能
document.querySelectorAll(".settingClass").forEach(settingTab => {
    settingTab.addEventListener("click", async () => {
        const targetSetting = settingTab.getAttribute("data-target");
        
        // 移除所有活跃状态
        document.querySelectorAll(".settingClass").forEach(tab => {
            tab.classList.remove("active");
        });
        
        // 添加当前活跃状态
        settingTab.classList.add("active");
        
        // 隐藏所有设置内容
        document.querySelectorAll(".settingContent").forEach(content => {
            content.style.display = "none";
        });
        
        // 显示对应的设置内容
        const targetContent = document.querySelector(`.settingContent[data-setting="${targetSetting}"]`);
        if (targetContent) {
            targetContent.style.display = "flex";
        }
        
        // 根据不同的设置页面加载对应数据
        if (targetSetting === 'progress') {
            await loadProgressData();
        } else if (targetSetting === 'data') {
            await updateStorageInfo();
        }
        
        console.log(`切换到设置页面: ${targetSetting}`);
    });
});

// 加载 Progress 页面数据
async function loadProgressData() {
    try {
        // 确保 GameStorageManager 存在
        if (typeof GameStorageManager === 'undefined') {
            console.warn('GameStorageManager 未定义');
            return;
        }

        const storage = new GameStorageManager();
        const currentUserId = await storage.getCurrentUserId();
        console.log("Progress页面获取到的用户ID:", currentUserId);
        
        if (!currentUserId) {
            console.log('用户未登录，无法显示游戏进度');
            const tableBody = document.getElementById('progressTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;">请先登录以查看游戏进度</td></tr>';
            }
            return;
        }

        // 检查 GameProgressDashboard 是否存在
        if (typeof GameProgressDashboard !== 'undefined') {
            const dashboard = new GameProgressDashboard(currentUserId, storage);
            window.dashboard = dashboard;
            await dashboard.loadData();
        } else {
            console.warn('GameProgressDashboard 未定义');
        }
    } catch (error) {
        console.error('加载进度数据失败:', error);
    }
}

// 主题选择功能
document.querySelectorAll(".themeOption").forEach(option => {
    option.addEventListener("click", async () => {
        const selectedTheme = option.getAttribute("data-theme");
        
        // 移除所有主题选项的活跃状态
        document.querySelectorAll(".themeOption").forEach(opt => {
            opt.classList.remove("active");
        });
        
        // 添加当前选项的活跃状态
        option.classList.add("active");
        
        // 应用主题
        if (selectedTheme === "dark") {
            theme = true;
            document.querySelector("body").style.backgroundColor = "#2f4256";
            if (!isPhone) document.querySelector("#content").style.backgroundColor = "#0000";
        } else {
            theme = false;
            document.querySelector("body").style.backgroundColor = "aliceblue";
            if (!isPhone) document.querySelector("#content").style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        }
        
        // 同步更新魔法光标的深色模式
        if (typeof MagicCursor !== 'undefined' && MagicCursor.setDarkMode) {
            MagicCursor.setDarkMode(selectedTheme === "dark");
        }
        
        // 如果用户已登录，保存主题设置到用户数据
        try {
            const currentUser = await userManager.getCurrentUser();
            if (currentUser) {
                // 更新用户的主题设置
                currentUser.theme = selectedTheme;
                const userId = await getCurrentUserId();
                if (userId) {
                    await userManager.dbSet([userId, userManager.encodeBase64(currentUser)], userManager.userStoreName);
                    console.log(`主题设置已保存到用户数据: ${selectedTheme}`);
                }
            }
        } catch (error) {
            console.log("未登录用户，主题设置仅在当前会话有效");
        }
        
        console.log(`主题已切换为: ${selectedTheme}`);
    });
});

// 语言选择功能（暂时禁用）
document.querySelectorAll(".languageOption").forEach(option => {
    option.addEventListener("click", () => {
        alert("语言切换功能正在制作中，敬请期待！");
    });
});

// ========================================
// 光标设置功能 - 仅PC端
// ========================================
(function initCursorSettings() {
    const particleToggle = document.getElementById('cursorParticleToggle');
    const coreToggle = document.getElementById('cursorCoreToggle');
    const ringToggle = document.getElementById('cursorRingToggle');
    const previewArea = document.getElementById('cursorPreviewArea');
    
    // 如果找不到这些元素（可能是移动端隐藏了），直接返回
    if (!particleToggle || !coreToggle || !ringToggle) {
        console.log('光标设置元素未找到（可能是移动端）');
        return;
    }

    // 初始化预览粒子
    function initPreviewParticles() {
        const particlesContainer = previewArea?.querySelector('.preview-particles');
        if (!particlesContainer) return;
        
        const colors = ['#a78bfa', '#818cf8', '#f093fb', '#34d399', '#667eea', '#f5576c'];
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'preview-particle';
            particle.style.background = colors[i % colors.length];
            particle.style.boxShadow = `0 0 6px ${colors[i % colors.length]}`;
            particle.style.left = `${30 + Math.random() * 40}%`;
            particle.style.top = `${30 + Math.random() * 40}%`;
            particle.style.animationDelay = `${i * 0.3}s`;
            particlesContainer.appendChild(particle);
        }
    }
    
    // 更新预览
    function updatePreview() {
        if (!previewArea) return;
        
        const coreEl = previewArea.querySelector('.preview-cursor-core');
        const ringEl = previewArea.querySelector('.preview-cursor-ring');
        const particlesEl = previewArea.querySelector('.preview-particles');
        
        if (coreEl) {
            coreEl.classList.toggle('hidden', !coreToggle.checked);
        }
        if (ringEl) {
            ringEl.classList.toggle('hidden', !ringToggle.checked || !coreToggle.checked);
        }
        if (particlesEl) {
            particlesEl.classList.toggle('hidden', !particleToggle.checked);
        }
    }
    
    // 从MagicCursor加载当前设置
    function loadCurrentSettings() {
        if (typeof MagicCursor !== 'undefined') {
            const settings = MagicCursor.getSettings();
            particleToggle.checked = settings.enableParticles;
            coreToggle.checked = settings.enableCore;
            ringToggle.checked = settings.enableRing;
        }
        updatePreview();
    }
    
    // 粒子开关
    particleToggle.addEventListener('change', () => {
        if (typeof MagicCursor !== 'undefined') {
            MagicCursor.setParticles(particleToggle.checked);
        }
        updatePreview();
        console.log('粒子效果:', particleToggle.checked ? '开启' : '关闭');
    });
    
    // 圆心块开关
    coreToggle.addEventListener('change', () => {
        if (typeof MagicCursor !== 'undefined') {
            MagicCursor.setCore(coreToggle.checked);
        }
        // 如果圆心块关闭，也关闭旋转圆环的复选框
        if (!coreToggle.checked) {
            ringToggle.checked = false;
            ringToggle.disabled = true;
        } else {
            ringToggle.disabled = false;
        }
        updatePreview();
        console.log('圆心块:', coreToggle.checked ? '开启' : '关闭');
    });
    
    // 旋转圆环开关
    ringToggle.addEventListener('change', () => {
        // 必须要有圆心块才能开启旋转圆环
        if (ringToggle.checked && !coreToggle.checked) {
            ringToggle.checked = false;
            alert('旋转圆环需要先开启圆心块！');
            return;
        }
        if (typeof MagicCursor !== 'undefined') {
            MagicCursor.setRing(ringToggle.checked);
        }
        updatePreview();
        console.log('旋转圆环:', ringToggle.checked ? '开启' : '关闭');
    });
    
    // 初始化
    initPreviewParticles();
    
    // 等待MagicCursor初始化完成后加载设置
    if (typeof MagicCursor !== 'undefined' && !MagicCursor.isMobile) {
        setTimeout(loadCurrentSettings, 100);
    } else {
        // 如果MagicCursor还没准备好，监听它
        const checkInterval = setInterval(() => {
            if (typeof MagicCursor !== 'undefined' && MagicCursor.cursor.main) {
                loadCurrentSettings();
                clearInterval(checkInterval);
            }
        }, 200);
        // 5秒后停止检查
        setTimeout(() => clearInterval(checkInterval), 5000);
    }
    
    // 初始化旋转圆环的禁用状态
    ringToggle.disabled = !coreToggle.checked;
})();

// 辅助函数：获取当前用户ID
async function getCurrentUserId() {
    try {
        const raw = await userManager.dbGet(userManager.currentUserStore, ".");
        return userManager.decodeBase64(raw)?.uid || null;
    } catch (error) {
        return null;
    }
}

// 初始化设置页面状态
function initializeSettingsPage() {
    // 设置默认活跃的主题选项
    const currentThemeOption = theme ? 
        document.querySelector('.themeOption[data-theme="dark"]') : 
        document.querySelector('.themeOption[data-theme="light"]');
    
    if (currentThemeOption) {
        currentThemeOption.classList.add("active");
    }
    
    // 清除语言选项的活跃状态（因为功能禁用）
    document.querySelectorAll(".languageOption").forEach(opt => {
        opt.classList.remove("active");
    });
}

// 在页面加载时初始化设置页面
// 放window.onload中调用了
// window.addEventListener("DOMContentLoaded", initializeSettingsPage);

// 数据管理功能
document.getElementById("exportDataButton")?.addEventListener("click", async () => {
    try {
        const exportData = {
            exportTime: new Date().toISOString(),
            version: "1.0.0",
            userData: null,
            gameRecords: [],
            localStorage: {}
        };

        // 获取当前用户数据
        const currentUser = await userManager.getCurrentUser();
        if (currentUser) {
            exportData.userData = {
                name: currentUser.name,
                description: currentUser.description,
                theme: currentUser.theme,
                registeredAt: currentUser.registeredAt
            };
        }

        // 获取游戏记录（如果有 GameStorageManager）
        if (typeof GameStorageManager !== 'undefined') {
            try {
                const storage = new GameStorageManager();
                const userId = await getCurrentUserId();
                if (userId) {
                    const records = await storage.getUserRecords(userId);
                    exportData.gameRecords = records;
                }
            } catch (e) {
                console.warn("获取游戏记录失败:", e);
            }
        }

        // 获取 localStorage 中的游戏相关数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('game') || key.includes('minesweeper') || key.includes('klotski') || key.includes('labyrinth') || key.includes('2048'))) {
                exportData.localStorage[key] = localStorage.getItem(key);
            }
        }

        // 创建下载文件
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `little_game_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert("数据导出成功！");
    } catch (error) {
        console.error("导出数据失败:", error);
        alert("导出数据失败: " + error.message);
    }
});

document.getElementById("importDataButton")?.addEventListener("click", () => {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            // 验证数据格式
            if (!importData.version || !importData.exportTime) {
                throw new Error("无效的备份文件格式");
            }

            const confirmed = confirm(
                `确定要导入此备份吗？\n` +
                `备份时间: ${new Date(importData.exportTime).toLocaleString()}\n` +
                `用户: ${importData.userData?.name || '未知'}\n` +
                `游戏记录: ${importData.gameRecords?.length || 0} 条\n\n` +
                `注意：导入将覆盖现有的 localStorage 数据！`
            );
            
            if (!confirmed) return;

            // 导入 localStorage 数据
            if (importData.localStorage) {
                for (const [key, value] of Object.entries(importData.localStorage)) {
                    localStorage.setItem(key, value);
                }
            }

            // 导入游戏记录（如果有）
            if (importData.gameRecords && importData.gameRecords.length > 0) {
                if (typeof GameStorageManager !== 'undefined') {
                    try {
                        const storage = new GameStorageManager();
                        for (const record of importData.gameRecords) {
                            await storage.saveRecord(record);
                        }
                    } catch (e) {
                        console.warn("导入游戏记录失败:", e);
                    }
                }
            }

            alert(`数据导入成功！\n导入了 ${Object.keys(importData.localStorage || {}).length} 个设置项和 ${importData.gameRecords?.length || 0} 条游戏记录。`);
            
            // 刷新页面以应用更改
            if (confirm("是否刷新页面以应用更改？")) {
                location.reload();
            }
        } catch (error) {
            console.error("导入数据失败:", error);
            alert("导入数据失败: " + error.message);
        }
    };
    
    input.click();
});

document.getElementById("clearDataButton")?.addEventListener("click", async () => {
    const confirmed = confirm("警告：此操作将清除所有本地数据，包括用户信息和游戏记录！\n确定要继续吗？");
    if (!confirmed) return;
    
    const doubleConfirmed = confirm("请再次确认：您真的要清除所有数据吗？此操作不可恢复！");
    if (!doubleConfirmed) return;

    try {
        // 清除 localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) keysToRemove.push(key);
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // 清除 IndexedDB
        const databases = ['UserDB', 'GameRecordsDB'];
        for (const dbName of databases) {
            try {
                await new Promise((resolve, reject) => {
                    const request = indexedDB.deleteDatabase(dbName);
                    request.onsuccess = resolve;
                    request.onerror = reject;
                    request.onblocked = () => {
                        console.warn(`数据库 ${dbName} 被阻塞，可能有其他连接`);
                        resolve();
                    };
                });
            } catch (e) {
                console.warn(`清除数据库 ${dbName} 失败:`, e);
            }
        }

        alert("所有数据已清除！页面将刷新。");
        location.reload();
    } catch (error) {
        console.error("清除数据失败:", error);
        alert("清除数据失败: " + error.message);
    }
});

// 更新存储信息显示
async function updateStorageInfo() {
    try {
        // 计算 localStorage 使用量
        let localStorageSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                localStorageSize += key.length + (localStorage.getItem(key)?.length || 0);
            }
        }
        
        const usedStorageEl = document.getElementById('usedStorage');
        if (usedStorageEl) {
            const sizeKB = (localStorageSize / 1024).toFixed(2);
            usedStorageEl.textContent = `${sizeKB} KB`;
        }

        // 计算游戏记录数
        let totalRecords = 0;
        if (typeof GameStorageManager !== 'undefined') {
            try {
                const storage = new GameStorageManager();
                const userId = await getCurrentUserId();
                if (userId) {
                    const records = await storage.getUserRecords(userId);
                    totalRecords = records.length;
                }
            } catch (e) {
                console.warn("获取记录数失败:", e);
            }
        }

        const totalRecordsEl = document.getElementById('totalRecords');
        if (totalRecordsEl) {
            totalRecordsEl.textContent = `${totalRecords} `;
        }
    } catch (error) {
        console.error("更新存储信息失败:", error);
    }
}

// 调试方法
window.debugUserManager = {
    async showAllUsers() {
        try {
            const users = await userManager.getAllUsers();
            console.table(users.map(user => ({
                用户名: user.name,
                描述: user.description,
                注册时间: user.registeredAt,
                主题: user.theme
            })));
        } catch (error) {
            console.error("获取用户列表失败:", error);
        }
    },
    
    async showAllUsernames() {
        try {
            const usernames = await userManager.getAllUsernames();
            console.table(usernames);
        } catch (error) {
            console.error("获取用户名列表失败:", error);
        }
    },
    
    async checkIntegrity() {
        try {
            const result = await userManager.checkDataIntegrity();
            console.log("数据一致性检查结果:", result);
            return result;
        } catch (error) {
            console.error("数据一致性检查失败:", error);
        }
    },
    
    async getCurrentUser() {
        try {
            const user = await userManager.getCurrentUser();
            console.log("当前用户:", user);
            return user;
        } catch (error) {
            console.error("获取当前用户失败:", error);
        }
    }
};

// console.log("调试工具已加载，使用 debugUserManager.方法名() 进行调试");
// console.log("可用方法: showAllUsers(), showAllUsernames(), checkIntegrity(), getCurrentUser()");

// 游戏导航功能
function initializeGameNavigation() {
    // 为所有游戏主区域添加点击事件
    document.querySelectorAll('.gameTypeMain').forEach(gameMain => {
        const gameUrl = gameMain.dataset.gameUrl;
        if (gameUrl) {
            gameMain.addEventListener('click', (e) => {
                // 导航到游戏页面（demo容器内的点击也会触发）
                window.location.href = gameUrl;
            });
            
            // 添加hover效果
            gameMain.style.cursor = 'pointer';
        }
    });
}

// 页面加载完成后初始化游戏导航
document.addEventListener('DOMContentLoaded', initializeGameNavigation);

// 如果已经加载完成，立即初始化
if (document.readyState !== 'loading') {
    initializeGameNavigation();
}

// 彩蛋显示函数
function showEasterEgg() {
    const modal = document.querySelector("#easterEggModal");
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
    
    // 初始化彩蛋功能
    if (typeof EasterEggFeatures !== 'undefined') {
        EasterEggFeatures.init();
    }
}

// 彩蛋隐藏函数
function hideEasterEgg() {
    const modal = document.querySelector("#easterEggModal");
    modal.classList.remove('show');
    document.body.style.overflow = ''; // 恢复背景滚动
    
    // 清理彩蛋功能
    if (typeof EasterEggFeatures !== 'undefined') {
        EasterEggFeatures.cleanup();
    }
}

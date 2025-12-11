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
document.querySelector("#navLang").addEventListener('click', () => {
    document.querySelectorAll(".notLang").forEach(item => item.style.animation = "showFadeShow 0.6s linear forwards");
    setTimeout(() => {
        setNavLang(!isLangShow, null);
        isLangShow = !isLangShow;
        document.querySelectorAll(".notLang").forEach(item => item.style.animation = "");
    }, 300);
});

document.querySelector("#navTheme").addEventListener('click', () => {
    if (isLangShow) return 0;
    document.querySelector("body").style.transition = "all 0.3s ease";
    document.querySelector("body").style.backgroundColor = theme ? "aliceblue" : "#2f4256";
    if (!isPhone) document.querySelector("#content").style.backgroundColor = theme ? "rgba(255, 255, 255, 0.3)" : "#0000";
    theme = !theme;
});
document.querySelector("#navSetting").addEventListener('click', async () => {
    if (isLangShow) return 0;
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
    Object.assign(document.querySelector("#content").style, {
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "transparent"
    });
    document.querySelectorAll(".gameType").forEach(item => {
        Object.assign(item.style, {
            width: "min(72vw, 800px)",
            height: "calc(min(72vw, 800px) * 1.5)",
            borderRadius: "calc(min(72vw, 800px) * 0.125)"
        })
    });
    document.querySelectorAll(".gameTypeFooter").forEach(item => {
        Object.assign(item.style, {
            borderRadius: "0 0 calc(min(72vw, 800px) * 0.125) calc(min(72vw, 800px) * 0.125)",
            padding: "20px"
        })
    });
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
    settingTab.addEventListener("click", () => {
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
            targetContent.style.display = "block";
        }
        
        console.log(`切换到设置页面: ${targetSetting}`);
    });
});

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
document.getElementById("exportDataButton")?.addEventListener("click", () => {
    console.log("导出数据功能（待实现）");
    alert("导出数据功能正在开发中...");
});

document.getElementById("importDataButton")?.addEventListener("click", () => {
    console.log("导入数据功能（待实现）");
    alert("导入数据功能正在开发中...");
});

document.getElementById("clearDataButton")?.addEventListener("click", () => {
    const confirmed = confirm("警告：此操作将清除所有本地数据，包括用户信息和游戏记录！\n确定要继续吗？");
    if (confirmed) {
        const doubleConfirmed = confirm("请再次确认：您真的要清除所有数据吗？此操作不可恢复！");
        if (doubleConfirmed) {
            // 清除数据的逻辑（待实现）
            console.log("清除所有数据功能（待实现）");
            alert("清除数据功能正在开发中...");
        }
    }
});

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
                // 如果点击的是演示动画元素，不触发导航
                if (e.target.closest('.klotski-demo-container') || 
                    e.target.classList.contains('klotski-block')) {
                    return;
                }
                
                // 导航到游戏页面
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

window.onload = () => {
    [isScroll, isRecover, isLangShow, theme, isPhone, isSettingShow, isLogin] = [false, false, false, false, /mobile/i.test(navigator.userAgent), false, false];
    if (isPhone) setStyleOfMobileDevice();
    console.log("你玩原神吗？");
}
let db = null;
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
// document.getElementById("saveAccountInfo").addEventListener("click", () => plusNewUser());
// // document.getElementById("Login").addEventListener("click", () => refreshLoginUser());
// document.getElementById("Login").addEventListener("click", () => detectUser());

// function plusNewUser() {
//     const name = document.getElementsByClassName("accountShowNameInput")[0].value.trim();
//     if (!name) { alert("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞"); return; }
//     const password = document.getElementsByClassName("accountShowPasswordInput")[0].value.trim();
//     if (!password) { alert("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐲𝐨𝐮𝐫 𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝"); return; }
//     if (!(/^(?=.{9,18}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#_])[A-Za-z\d@#_]{9,18}$/.test(password))) { alert("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝\n𝐋𝐞𝐧𝐠𝐭𝐡: 9-18 𝐜𝐡𝐚𝐫𝐚𝐜𝐭𝐞𝐫𝐬\n𝐂𝐨𝐦𝐩𝐨𝐧𝐞𝐧𝐭𝐬(𝐌𝐔𝐒𝐓): 𝘈-𝘡, 𝘢-𝘻, 0-9, @#_"); return; }
//     const passwordAgain = document.getElementsByClassName("accountShowPasswordAgainInput")[0].value.trim();
//     if (passwordAgain !== password) { alert("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐜𝐨𝐫𝐫𝐞𝐜𝐭 𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝"); return; }
//     const description = document.getElementsByClassName("accountShowDescriptionInput")[0].value.trim();
//     document.querySelector("#accountRegisterName>p").textContent = name;
//     document.querySelector("#accountRegisterDescription").textContent = description;
//     const user = { name, password, description ,headSculpture: "default", email: "", phone: "", theme: "light"};
//     const encoded = [encodeBase64(String(crypto.randomUUID())), encodeBase64(user)];
//     console.log(user);
//     openDB().then(() => dbSet(encoded).then(() => {
//         alert("𝐑𝐞𝐠𝐢𝐬𝐭𝐞𝐫 𝐒𝐮𝐜𝐜𝐞𝐬𝐬!");
//         refreshLoginUser(user,encoded[0]);
//     }));
// }
// function refreshLoginUser(data,id="userinfo") {
//     console.log(data,"has logged in");
//     // data = dbGet(objectStoreName="userStore",dbInstance=db,id=id).then(raw => {
//     //     data = decodeBase64(raw);
//     //     console.log("Decoded user data:", data);
//     // });
//     document.querySelector("#accountGreeting").style.display = "block";
//     document.getElementById("waitforregist").style.display = "none";
//     document.getElementsByClassName("accountShowInfo")[0].style.display = "none";
//     document.getElementsByClassName("accountShowInfo")[1].style.display = "none";
//     document.querySelector("#accountShowNameSpan").textContent = document.querySelector("#accountRegisterName>p").textContent;
//     const cntDB = openDB(indexedDBName="cntUser",objectStoreName="cntUserData");
//     cntDB.then(() => dbDelete(objectStoreName="cntUserData",id=".")).then(() => {console.log("Delete the previous current data");});
//     cntDB.then(() => dbSet(encodeBase64({uid:id}),objectStoreName="cntUserData")).then(() => {
//         console.log("User data initialized");
//     });
// }
// const encodeBase64=o=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))));
// const decodeBase64=s=>{try{return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0))))}catch{return null}};

// function openDB(indexedDBName = "UserDB", objectStoreName = "userStore") {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open(indexedDBName, 2);

//         request.onupgradeneeded = event => {
//             const db = event.target.result;
//             console.log("Database upgrade needed");
//             if (!db.objectStoreNames.contains("userStore")) {
//                 db.createObjectStore("userStore", { keyPath: "id" });
//             }
//             if (!db.objectStoreNames.contains("cntUserData")) {
//                 db.createObjectStore("cntUserData", { keyPath: "id" });
//             }
//         };
//         request.onsuccess = event => {
//             db = event.target.result;
//             resolve(db);
//         };

//         request.onerror = e => reject("IndexedDB 打开失败,请检查浏览器设置" + e.target.errorCode);
//     });
// }
// // 根据对应的openDB函数打开的数据库实例，进行后续的增删改查操作
// // // 写入数据
// function dbSet(data,objectStoreName="userStore") {
//     return new Promise((resolve, reject) => {
//         const tx = db.transaction(objectStoreName, "readwrite");
//         const store = tx.objectStore(objectStoreName);
//         store.put({ id: objectStoreName == "userStore" ?  data[0]: ".", data: data[1] });

//         tx.oncomplete = () => resolve();
//         tx.onerror = () => reject("数据写入失败");
//     });
// }

// // // 读取数据
// function dbGet(objectStoreName="userStore", dbInstance,id="userinfo") {
//     return new Promise((resolve, reject) => {
//         const tx = dbInstance.transaction(objectStoreName, "readonly");
//         const store = tx.objectStore(objectStoreName);
//         const request = store.get(id);
//         request.onsuccess = () => resolve(request.result ?.data);
//         request.onerror = () => reject("读取失败");
//     });
// }

// function dbDelete(objectStoreName = "userStore", id = "userinfo") {
//     return new Promise((resolve, reject) => {
//         const tx = db.transaction(objectStoreName, "readwrite");
//         const store = tx.objectStore(objectStoreName);
//         store.delete(id);
//         tx.oncomplete = () => resolve();
//         tx.onerror = () => reject("删除失败");
//     });
// }

// document.querySelectorAll("#settingUl .settingClass").forEach(li => {
//     li.addEventListener("click", () => {
//         const target = li.dataset.target;
//         document.querySelectorAll("#settingPart .settingContent")
//             .forEach(div => div.style.display = "none");

//         const targetDiv = document.querySelector(`#setting-${target}-content`);
//         if (targetDiv) targetDiv.style.display = "block";
//     });
// });

// async function loadUser(indexedDBName = "cntUser", objectStoreName = "cntUserData") {
//     console.log("Loading user data...");
//     const db = await openDB(indexedDBName, objectStoreName);
//     const raw = await dbGet(objectStoreName, db, id=".");
//     console.log("Raw user data:", raw);
//     if (!raw) return;

//     const id = decodeBase64(raw)?.uid;
//     console.log("Decoded user ID:", id);
//     if (!id) return;

//     refreshLoginUser({ id: id }, id);
// }


class UserManager {
    constructor(userDBName = "UserDB", userStoreName = "userStore", currentUserStore = "cntUserData") {
        this.userDBName = userDBName;
        this.userStoreName = userStoreName;
        this.currentUserStore = currentUserStore;
        this.db = null;
    }

    // 打开数据库
    async openDB(version = 2) {
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

    // 注册新用户
    async registerUser({ name, password, description = "" }) {
        if (!name?.trim()) throw new Error("请输入用户名");
        if (!password?.trim()) throw new Error("请输入密码");
        if (!/^(?=.{9,18}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#_])[A-Za-z\d@#_]{9,18}$/.test(password)) {
            throw new Error("密码格式不正确: 9-18位，必须包含大写、小写、数字和@#_");
        }

        const user = {
            name,
            password,
            description,
            headSculpture: "default",
            email: "",
            phone: "",
            theme: "light"
        };

        const encoded = [this.encodeBase64(crypto.randomUUID()), this.encodeBase64(user)];
        await this.dbSet(encoded, this.userStoreName);

        // 注册后立即登录
        await this.setCurrentUser(encoded[0]);
        return user;
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
}

const userManager = new UserManager();

// 注册用户
document.getElementById("saveAccountInfo").addEventListener("click", async () => {
    try {
        const name = document.querySelector(".accountShowNameInput").value.trim();
        const password = document.querySelector(".accountShowPasswordInput").value.trim();
        const passwordAgain = document.querySelector(".accountShowPasswordAgainInput").value.trim();
        const description = document.querySelector(".accountShowDescriptionInput").value.trim();

        if (password !== passwordAgain) throw new Error("两次输入密码不一致");

        const user = await userManager.registerUser({ name, password, description });
        alert("注册成功，已自动登录：" + user.name);

        updateUI(user);
    } catch (err) {
        alert(err.message);
    }
});

// 登录用户
document.getElementById("Login").addEventListener("click", async () => {
    try {
        const name = document.querySelector(".accountShowNameInput").value.trim();
        const password = document.querySelector(".accountShowPasswordInput").value.trim();
        const user = await userManager.login(name, password);
        alert("登录成功：" + user.name);
        updateUI(user);
    } catch (err) {
        alert(err);
    }
});

// 页面加载时检查当前登录用户
window.addEventListener("load", async () => {
    const user = await userManager.getCurrentUser();
    if (user) updateUI(user);
});

// 更新页面 UI
function updateUI(user) {
    document.querySelector("#accountGreeting").style.display = "block";
    document.querySelector("#waitforregist").style.display = "none";
    document.querySelectorAll(".accountShowInfo").forEach(el => el.style.display = "none");
    document.querySelector("#accountShowNameSpan").textContent = user.name;
}

window.onload = () => {
    [isScroll,isRecover] = [false,false]
    if (/mobile/i.test(navigator.userAgent)) setStyleOfMobileDevice();
    console.log("你玩原神吗？");
}
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
    if (scrollY > 70 && !isScroll){
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
function showmainpage() {
    isRecover = true;
    scrollTo(0,0);
    navDisplay("Show");
    setTimeout(() => {cover.style.display = 'none';document.querySelector("#main").style.opacity = 1;}, 800);
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


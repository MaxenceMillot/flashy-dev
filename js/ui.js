export const el = {
    img: document.getElementById("img"),
    answer: document.getElementById("answer"),
    btnShow: document.getElementById("btnShow"),
    gradeButtons: document.getElementById("gradeButtons"),
    card: document.getElementById("card"),
    deckContainer: document.getElementById("deckContainer"),
    menuBtn: document.getElementById("menuBtn"),
    mobileMenu: document.getElementById("mobileMenu")
};

export function initHeaderMenu() {
    if (!el.menuBtn || !el.mobileMenu) return;

    el.menuBtn.addEventListener("click", () => {
        el.mobileMenu.classList.toggle("open");
        el.menuBtn.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        const isClickInside =
            el.menuBtn.contains(e.target) ||
            el.mobileMenu.contains(e.target);

        if (!isClickInside) {
            el.mobileMenu.classList.remove("open");
            el.menuBtn.classList.remove("open");
        }
    });
}

const deckNames = {
    flowers: "Fleurs & Plantes",
    orchids: "Orchidées",
    foliages: "Feuillage"
};

// =======================
// RENDER
// =======================
export function render(card) {
    if (!card) return;

    el.answer.style.display = "none";
    el.answer.classList.remove("visible");

    el.btnShow.style.display = "inline-block";
    el.gradeButtons.style.display = "none";

    el.answer.innerHTML = `
        ${card.text}
        <div class="deck-label">${card.deck}</div>
    `;
}

export function setCardImage(src) {
    el.img.src = src;
}

export function startLoading() {
    el.card.classList.add("loading");
}

export function stopLoading() {
    el.card.classList.remove("loading");
}

// =======================
// UI ACTIONS
// =======================
export function showAnswer(){
    el.answer.style.display = "block";

    requestAnimationFrame(() => {
        el.answer.classList.add("visible");
    });

    el.btnShow.style.display = "none";
    el.gradeButtons.style.display = "flex";
}

export function setButtonsDisabled(disabled) {
    const buttons = el.gradeButtons.querySelectorAll("button");
    buttons.forEach(btn => btn.disabled = disabled);
}

// =======================
// ANIMATIONS
// =======================
export function fadeOut(callback){
    const card = el.card;

    function handleEnd(e){
        if (e.propertyName !== "opacity") return;
        card.removeEventListener("transitionend", handleEnd);
        callback();
    }

    card.addEventListener("transitionend", handleEnd);
    card.classList.add("fade-out");
}

export function fadeIn(callback){
    const card = el.card;

    let called = false;

    function done() {
        if (called) return;
        called = true;

        card.removeEventListener("transitionend", handleEnd);
        if (callback) callback();
    }

    function handleEnd(e){
        if (e.propertyName !== "opacity") return;
        done();
    }

    card.addEventListener("transitionend", handleEnd);

    requestAnimationFrame(() => {
        card.classList.remove("fade-out");
    });

    setTimeout(done, 300);
}
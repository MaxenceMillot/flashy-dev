import { getDeckLabel } from "./decks.js";

export const el = {
    img: document.getElementById("img"),
    answer: document.getElementById("answer"),
    btnShow: document.getElementById("btnShow"),
    btnSkip: document.getElementById("btnSkip"),
    gradeButtons: document.getElementById("gradeButtons"),
    card: document.getElementById("card"),
    deckContainer: document.getElementById("deckContainer"),
    menuBtn: document.getElementById("menuBtn"),
    mobileMenu: document.getElementById("mobileMenu"),
    btnDownload: document.getElementById("btnDownload")
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


export function setAnswerText(card) {
    if (!card) return;

    el.answer.style.display = "none";
    el.answer.classList.remove("visible");

    el.gradeButtons.style.display = "none";

    const finalText = formatAnswerText(card.text);

    el.answer.innerHTML = `
        ${finalText}
        <div class="deck-label">${getDeckLabel(card.deck)}</div>
    `;
}

function formatAnswerText(text) {
    const separator = " - ";

    if (!text.includes(separator)) return text;

    const [before, after] = text.split(separator);

    return `
        ${before} - 
        <span class="mandatory-latin">${after}</span>
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

export function showNormalMode() {
    el.btnSkip.style.display = "none";
    el.btnShow.style.display = "inline-block";
}

export function showSkipMode() {
    el.btnShow.style.display = "none";
    el.gradeButtons.style.display = "none";
    el.btnSkip.style.display = "inline-block";

    el.answer.innerHTML = `
        <div style="color:#888;font-size:14px;">
            Erreur : image non disponible
        </div>
    `;
    el.answer.style.display = "block";
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
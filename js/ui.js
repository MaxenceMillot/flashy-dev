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

export function render(card){
    if(!card) return;

    // Reset answer state
    el.answer.style.display = "none";
    el.answer.classList.remove("visible");

    el.btnShow.style.display = "inline-block";
    el.gradeButtons.style.display = "none";
    setButtonsDisabled(false);

    const deckLabel = deckNames[card.deck] || card.deck;

    el.answer.innerHTML = `
        ${card.text}
        <div class="deck-label">${deckLabel}</div>
    `;

    const wrapper = el.img.parentElement;

    // RESET STATE
    wrapper.classList.remove("loaded");
    el.img.classList.remove("loaded");

    let slowHintTimer;

    // SLOW LOADING HINT (NO TIMEOUT Fallback)
    slowHintTimer = setTimeout(() => {
        if (!el.img.classList.contains("loaded")) {
            wrapper.classList.add("slow"); // subtle visual cue
        }
    }, 2000); // 2s feels natural

    // LOAD SUCCESS
    el.img.onload = () => {
        clearTimeout(slowHintTimer);

        wrapper.classList.remove("slow");
        el.img.classList.add("loaded");
        wrapper.classList.add("loaded");
    };

    // ERROR FALLBACK
    el.img.onerror = () => {
        clearTimeout(slowHintTimer);

        el.img.onerror = null;
        el.img.src = "images/placeholder_image_not_found.png";

        wrapper.classList.remove("slow");
        el.img.classList.add("loaded");
        wrapper.classList.add("loaded");
    };

    // SET IMAGE
    el.img.src = card.img;

    // CACHED IMAGE SAFETY
    if (el.img.complete) {
        clearTimeout(slowHintTimer);
        el.img.classList.add("loaded");
        wrapper.classList.add("loaded");
    }
}

export function showAnswer(){
    el.answer.style.display = "block";

    requestAnimationFrame(() => {
        el.answer.classList.add("visible");
    });

    el.btnShow.style.display = "none";
    el.gradeButtons.style.display = "flex";
}

export function setButtonsDisabled(disabled) {
    // Show answer button
    el.btnShow.disabled = disabled;

    // Grade buttons
    const buttons = el.gradeButtons.querySelectorAll("button");
    buttons.forEach(btn => {
        btn.disabled = disabled;
    });
}

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

    // fallback safety
    setTimeout(done, 300);
}
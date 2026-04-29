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

// =======================
// RENDER
// =======================
export function render(card, { onImageReady, skeletonTimer } = {}) {
    if (!card) return;

    // Reset UI
    el.answer.style.display = "none";
    el.answer.classList.remove("visible");

    el.btnShow.style.display = "inline-block";
    el.gradeButtons.style.display = "none";

    el.answer.innerHTML = `
        ${card.text}
        <div class="deck-label">${card.deck}</div>
    `;

    // Reset handlers
    el.img.onload = null;
    el.img.onerror = null;

    let handled = false;
    let retryCount = 0;

    const FAILSAFE_TIMEOUT = 5000;

    const failSafe = setTimeout(() => {
        console.warn("Image load timeout:", card.img);

        el.img.onerror = null;
        el.img.src = "images/placeholder_image_not_found.png";

        done();
    }, FAILSAFE_TIMEOUT);

    function done() {
        if (handled) return;
        handled = true;

        clearTimeout(failSafe);
        if (skeletonTimer) clearTimeout(skeletonTimer);

        el.card.classList.remove("loading");

        if (onImageReady) onImageReady();
    }

    el.img.onload = done;

    el.img.onerror = () => {
        if (retryCount < 1) {
            retryCount++;

            console.warn("Retrying image:", card.img);

            setTimeout(() => {
                el.img.src = card.img + "?retry=" + Date.now();
            }, 300);

            return;
        }

        el.img.onerror = null;
        el.img.src = "images/placeholder_image_not_found.png";

        done();
    };

    // Set src LAST
    el.img.src = card.img;

    // Cached image case
    if (el.img.complete && el.img.naturalWidth !== 0) {
        requestAnimationFrame(done);
    }
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
    el.btnShow.disabled = disabled;

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
export const el = {
    img: document.getElementById("img"),
    answer: document.getElementById("answer"),
    btnShow: document.getElementById("btnShow"),
    gradeButtons: document.getElementById("gradeButtons"),
    card: document.getElementById("card"),
    deckContainer: document.getElementById("deckContainer")
};

const deckNames = {
    flowers: "Fleurs & Plantes",
    orchids: "Orchidées",
    foliages: "Feuillage"
};

export function render(card){
    if(!card) return;

    el.answer.style.display = "none";
    el.answer.classList.remove("visible");

    el.btnShow.style.display = "inline-block";
    el.gradeButtons.style.display = "none";

    const deckLabel = deckNames[card.deck] || card.deck;

    el.answer.innerHTML = `
        ${card.text}
        <div class="deck-label">${deckLabel}</div>
    `;

    el.img.src = card.img;

    el.img.onerror = () => {
        el.img.onerror = null;
        el.img.src = "images/placeholder_image_not_found.png";
    };
}

export function showAnswer(){
    el.answer.style.display = "block";

    requestAnimationFrame(() => {
        el.answer.classList.add("visible");
    });

    el.btnShow.style.display = "none";
    el.gradeButtons.style.display = "flex";
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

export function fadeIn(){
    // ensure next frame so browser registers state change
    requestAnimationFrame(() => {
        el.card.classList.remove("fade-out");
    });
}

import { initState, cards } from "./state.js";
import { getNext, gradeCard } from "./scheduler.js";
import { initHeaderMenu, render, showAnswer, fadeOut, fadeIn, el } from "./ui.js";
import { renderDecks, getSelectedDecks } from "./decks.js";
import { initZoom } from "./zoom.js";

let current = null;
let nextCard = null;

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service_worker.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.error("SW registration failed:", err));
}

// INIT
initState();
initHeaderMenu();
renderDecks(cards, el.deckContainer);
initZoom(el.img);

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = async () => {
            try { await img.decode(); } catch(e) {}
            resolve(src);
        };

        img.onerror = () => resolve(src);

        img.src = src;
    });
}

async function next() {
    const result = getNext(getSelectedDecks());
    if (!result) return;

    const newCard = result.current;
    nextCard = result.nextCard;

    // STEP 1: fade out current card
    fadeOut(async () => {

        // STEP 2: wait image BEFORE render
        await loadImage(newCard.img);

        current = newCard;
        render(current);

        // STEP 3: preload next card in background (no blocking)
        if (nextCard?.img) {
            loadImage(nextCard.img);
        }

        fadeIn();
    });
}

// EVENTS
el.btnShow.addEventListener("click", showAnswer);

el.gradeButtons.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if(!btn) return;

    const grade = Number(btn.dataset.grade);

    gradeCard(current, grade);
    next();
});

document.getElementById("resetBtn").addEventListener("click", () => {
    if(confirm("Reset all progress?")){
        localStorage.removeItem("cards");
        location.reload();
    }
});

// START
next();
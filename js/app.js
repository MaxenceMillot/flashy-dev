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

function next(){
    const result = getNext(getSelectedDecks());
    if(!result) return;

    const newCard = result.current;
    nextCard = result.nextCard;

    const img = new Image();

    const done = () => {
        current = newCard;
        render(current);

        // preload next card
        if (nextCard?.img) {
            const preloadNext = new Image();
            preloadNext.src = nextCard.img;
            preloadNext.decode().catch(() => {});
        }

        fadeIn();
    };

    img.onload = async () => {
        try {
            await img.decode();
        } catch(e) {
            // decode can fail on some browsers, safe to ignore
        }
        done();
    };

    img.onerror = done;

    fadeOut(() => {
        img.src = newCard.img;
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
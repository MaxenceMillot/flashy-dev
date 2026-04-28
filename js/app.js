import { initState, cards } from "./state.js";
import { getNext, gradeCard } from "./scheduler.js";
import { initHeaderMenu, render, showAnswer, setButtonsDisabled, fadeOut, fadeIn, el } from "./ui.js";
import { renderDecks, getSelectedDecks } from "./decks.js";
import { initZoom } from "./zoom.js";

let current = null;
let nextCard = null;
let isTransitioning = false;

/*
/ PRE LOAD AREA {
*/
// Detect PWA installed mode
function isInstalledPWA() {
    return window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true;
}

// Throttled preload
function preloadAllImages() {
    const images = cards.map(c => c.img);
    let i = 0;

    function queue() {
        if (i >= images.length) return;

        const img = new Image();
        img.src = images[i++];

        // small delay for smoother network usage
        setTimeout(queue, 15);
    }

    queue();
    console.log("Preloading DONE");
}

// Delayed preload trigger
setTimeout(() => {
    if (isInstalledPWA()) {
        console.log("Preloading all images...");
        preloadAllImages();
    }
}, 2000);

// Service worker registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service_worker.js")
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.error("SW registration failed:", err));
    });
}

/*
/ END OF PRE LOAD AREA }
*/

// INIT
initState();
initHeaderMenu();
renderDecks(cards, el.deckContainer);
initZoom(el.img);

// Load image with decode safety
function preloadImage(src) {
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

// NEXT CARD FLOW
function next() {
    const result = getNext(getSelectedDecks());
    if (!result) return;

    const newCard = result.current;
    nextCard = result.nextCard;

    fadeOut(() => {
        current = newCard;
        render(current);

        console.log("if (nextCard?.img)")
        if (nextCard?.img) {
        console.log("preloadImage")
            preloadImage(nextCard.img);
        console.log("preloadImage DONE")
        }

        console.log("fadeIn")
        console.log("isTransitioning: "+isTransitioning);
        fadeIn(() => {
            isTransitioning = false;
            setButtonsDisabled(false);
        });
        console.log("fadeIn DONE")
        console.log("isTransitioning: "+isTransitioning);
    });
}

// EVENTS
el.btnShow.addEventListener("click", showAnswer);

el.gradeButtons.addEventListener("click", (e) => {
    console.log("in click event");
    console.log("isTransitioning: "+isTransitioning);
    console.log("current: ");
    console.log(current);
    if (isTransitioning || !current) return;

    const btn = e.target.closest("button");
    if (!btn) return;

    isTransitioning = true;
    setButtonsDisabled(true);


    const grade = Number(btn.dataset.grade);

    gradeCard(current, grade);
    next();
});

document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Reset all progress?")) {
        localStorage.removeItem("cards");
        location.reload();
    }
});

// START APP
next();
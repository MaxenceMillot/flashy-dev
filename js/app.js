import { initState, cards } from "./state.js";
import { getScheduledCards, gradeCard } from "./scheduler.js";
import { loadImage, preloadAllImages, PLACEHOLDER } from "./imageLoader.js";
import { initHeaderMenu, setAnswerText, setCardImage, startLoading, stopLoading, showAnswer, showNormalMode, showSkipMode, fadeOut, fadeIn, el } from "./ui.js";
import { initDeckSelector, getSelectedDecks, setDeckChangeCallback, updateDeckScrollbar } from "./decks.js";
import { initZoom } from "./zoom.js";
import { isInStandaloneMode,isIos, multiClick } from "./utilities.js";
import { initVersion, registerServiceWorker, setVersionInFooter, checkForUpdate } from "./versionManager.js";

let current = null;
let nextCard = null;
let isTransitioning = false;
let deferredPrompt = null;
const isInStandalone = isInStandaloneMode();

// Prevent automatic prompt to install PWA app
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();

    // Save it for later
    deferredPrompt = e;
});

// REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
    registerServiceWorker();
}

// LOAD ICONS FROM LIBRARY
lucide.createIcons();

// AFTER 5s PRELOAD ALL IMAGES IF PWA
setTimeout(() => {
    if (isInStandalone) {
        console.log("Preloading all images...");
        preloadAllImages();
    }
}, 5000);

// INIT
(async () => {
    initState();
    initHeaderMenu();
    initDeckSelector(cards, el.deckContainer);
    initZoom(el.img);
    initEventListeners();

    // START the app
    nextCardFlow();
    
    await initVersion();
    setVersionInFooter();
})();

// =======================
// NEXT CARD FLOW
// =======================
async function nextCardFlow() {
    if (isTransitioning) return;

    isTransitioning = true;

    const cards = getScheduledCards(getSelectedDecks());
    if (!cards) return;

    const newCard = nextCard || cards.current;
    nextCard = cards.nextCard;

    // 1. Fadeout animation
    await new Promise(r => fadeOut(r));

    // 2. Start skeleton placeholder (delayed to avoid flash)
    const skeletonTimer = setTimeout(() => {
        startLoading();
    }, 80);

    // 3. Set answer text (hidden)
    current = newCard;
    setAnswerText(current);
    
    // 7. Fadein animation
    setTimeout(() => {
       new Promise(r => fadeIn(r));
    }, 80);

    // 4. Load image
    const finalSrc = await loadImage(newCard.img);

    // 5. Apply image
    clearTimeout(skeletonTimer);
    setTimeout(() => {
        setCardImage(finalSrc);
        stopLoading();
    }, 80);

    // 6. standard behavior OR skip mode 
    if (finalSrc === PLACEHOLDER) {
        showSkipMode();
    } else {
        showNormalMode();
    }

    // 8. Unlock UI
    isTransitioning = false;

    // 9. Preload next (non-blocking)
    if (nextCard?.img) {
        loadImage(nextCard.img);
    }
}

// DECK CHANGE CALLBACK (reload next image on deck change)
setDeckChangeCallback(() => {
    // Invalidate next preloaded image
    nextCard = null;

    // recompute next preloaded image
    const cards = getScheduledCards(getSelectedDecks());
    if (cards?.nextCard?.img) {
        nextCard = cards.nextCard;

        // preload correct image
        loadImage(nextCard.img);
    }
});

// HIDDEN RESET BUTTON
multiClick(document.getElementById("appVersion"), () => {
    if (confirm("Reset all progress?")) {
        localStorage.removeItem("cards");
        location.reload();
    }
});

// =======================
// INIT EVENT LISTENERS
// =======================
function initEventListeners() {
    // HIDE DOWNLOAD BUTTON IN STANDALONE (PWA)
    if(isInStandalone){
        el.btnDownload.style.display = "none";
    }
    
    // "SHOW ANSWER" BUTTON
    el.btnShow.addEventListener("click", () => {
        if (el.card.classList.contains("loading")) return;
        showAnswer();
    });

    // GRADE BUTTON
    el.gradeButtons.addEventListener("click", (e) => {
        if (isTransitioning || !current || el.card.classList.contains("loading")) return;

        const btn = e.target.closest("button");
        if (!btn) return;

        const grade = Number(btn.dataset.grade);

        gradeCard(current, grade);
        nextCardFlow();
    });

    // SKIP BUTTON
    el.btnSkip.addEventListener("click", () => {
        if (isTransitioning) return;

        el.btnSkip.style.display = "none";
        nextCardFlow();
    });

    // DOWNLOAD BUTTON
    el.btnDownload.addEventListener("click", async () => {
        if (isIos()) {
            alert("Pour installer l'application :\n\n1. Appuyez sur le bouton “Partager”\n2. Puis sur “Ajouter à l'écran d'accueil”");
            return;
        }

        if (!deferredPrompt){
            console.error("could not trigger manual download : deferredPrompt is null")
            alert("Pour installer l'application : utilisez le menu du navigateur ( ⋮ ) puis “Ajouter à l'écran d'accueil”")
            return;
        }

        await deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        deferredPrompt = null;
    });

    window.addEventListener("resize", () =>  {
        updateDeckScrollbar(el.deckContainer)
    });

    // When user comes back to tab
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            checkForUpdate();
        }
    });

    // Reload when new SW controls page
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        const isUpdating = sessionStorage.getItem("updating-app") === "true";

        if (!isUpdating) return;

        sessionStorage.removeItem("updating-app");
        window.location.reload();
    });
}
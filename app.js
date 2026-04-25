// =====================
// LOAD STATE
// =====================
let saved = JSON.parse(localStorage.getItem("cards") || "null");

if (typeof cards === "undefined") {
    alert("cards.js not loaded!");
}

if (saved && Array.isArray(saved)) {
    cards = saved;
} else {
    cards = cards.map(c => ({
        ...c,
        EF: 2.5,
        interval: 0,
        repetitions: 0,
        due: 0,
        score: 0
    }));
}

// =====================
let current = null;
let nextCard = null;
let now = Date.now();
let answerShown = false;

// =====================
function save(){
    localStorage.setItem("cards", JSON.stringify(cards));
}

// =====================
function goHome(){
    document.getElementById("stats").style.display = "none";
    document.getElementById("study").style.display = "block";
}

// =====================
function getSelectedDecks(){
    let boxes = document.querySelectorAll(".decks input");
    return [...boxes].filter(b => b.checked).map(b => b.value);
}

// =====================
function getNext(){
    now = Date.now();

    let decks = getSelectedDecks();

    let pool = cards.filter(c =>
        decks.includes(c.deck) && c.due <= now
    );

    if(pool.length === 0){
        pool = cards.filter(c => decks.includes(c.deck));
    }

    if(pool.length === 0){
        console.warn("No cards available");
        return;
    }

    // Use preloaded card if exists
    if(nextCard){
        current = nextCard;
    } else {
        current = pool[Math.floor(Math.random() * pool.length)];
    }

    // Pick and preload NEXT
    nextCard = pool[Math.floor(Math.random() * pool.length)];
    preloadImage(nextCard.img);

    render();
}

// =====================
function render(){

    const answer = document.getElementById("answer");
    const img = document.getElementById("img");

    const btnShow = document.getElementById("btnShow");
    const gradeButtons = document.getElementById("gradeButtons");

    if(!current) return;

    answerShown = false;

    // hide answer
    answer.style.display = "none";
    answer.classList.remove("visible");

    // reset buttons
    btnShow.style.display = "inline-block";
    gradeButtons.style.display = "none";

    void answer.offsetHeight;

    img.onerror = () => {
        img.onerror = null;
        img.src = "images/placeholder_image_not_found.png";
    };

    img.src = current.img;

    answer.innerHTML = `
        ${current.text}
        <div class="deck-label">${current.deck}</div>
    `;
}

function preloadImage(src){
    if(!src) return;

    const img = new Image();
    img.src = src;

    if (img.decode) {
        img.decode().catch(() => {});
    }
}

// =====================
function showAnswer(){
    if(answerShown) return;

    answerShown = true;

    const answer = document.getElementById("answer");
    const btnShow = document.getElementById("btnShow");
    const gradeButtons = document.getElementById("gradeButtons");

    answer.style.display = "block";

    requestAnimationFrame(() => {
        answer.classList.add("visible");
    });

    // 👇 SWITCH BUTTONS
    btnShow.style.display = "none";
    gradeButtons.style.display = "block";
}

// =====================
// SM-2
// =====================
function grade(q){

    if(!current) return;

    // FORCE RESET BEFORE NEXT CARD
    answerShown = false;

    if(q <= 2){
        current.repetitions = 0;
        current.interval = 1;
    }
    else if(q === 3){
        current.repetitions = Math.max(0, current.repetitions - 1);
        current.interval = 1;
    }
    else if(q === 4){
        current.repetitions++;
        if(current.repetitions === 1) current.interval = 1;
        else if(current.repetitions === 2) current.interval = 4;
        else current.interval = Math.round(current.interval * current.EF);
    }
    else if(q === 5){
        current.repetitions++;
        if(current.repetitions === 1) current.interval = 2;
        else if(current.repetitions === 2) current.interval = 6;
        else current.interval = Math.round(current.interval * current.EF * 1.2);
    }

    current.EF = current.EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02));
    if(current.EF < 1.3) current.EF = 1.3;

    current.due = Date.now() + current.interval * 86400000;

    save();
    getNext();
}

// =====================
function renderDecks(){

    const container = document.getElementById("deckContainer");
    const decks = [...new Set(cards.map(c => c.deck))];

    container.innerHTML = "";

    decks.forEach(deck => {
        const label = document.createElement("label");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = deck;
        input.checked = true;

        // Update state on change
        input.addEventListener("change", updateDeckCheckboxState);

        label.appendChild(input);
        label.append(" " + deck);

        container.appendChild(label);
    });

    // initialize state
    updateDeckCheckboxState();
}

function updateDeckCheckboxState(){

    const boxes = document.querySelectorAll(".decks input");
    const checked = [...boxes].filter(b => b.checked);

    // if only 1 checked → disable it
    boxes.forEach(b => b.disabled = false);

    if(checked.length === 1){
        checked[0].disabled = true;
    }
}

// =====================
function resetProgress(){
    if(!confirm("Reset all progress?")) return;
    localStorage.removeItem("cards");
    location.reload();
}

// =====================
function toggleStats(){
    let el = document.getElementById("stats");
    let study = document.getElementById("study");

    if(el.style.display==="block"){
        el.style.display="none";
        study.style.display="block";
    } else {
        study.style.display="none";
        el.style.display="block";
    }
}


// =====================
renderDecks();
getNext();

// =====================
// IMAGE ZOOM OVERLAY
// =====================
const zoomOverlay = document.createElement("div");
zoomOverlay.className = "zoom-overlay";

const zoomImg = document.createElement("img");

zoomOverlay.appendChild(zoomImg);
document.body.appendChild(zoomOverlay);

// open zoom
const mainImg = document.getElementById("img");

mainImg.addEventListener("click", () => {

    const src = mainImg.src;

    zoomImg.src = src;

    // Prevent zooming placeholder
    if(!src || src.includes("placeholder")){
        return;
    }

    // Detect PNG and add white background
    if(src.toLowerCase().endsWith(".png")){
        zoomImg.classList.add("has-bg");
    } else {
        zoomImg.classList.remove("has-bg");
    }

    zoomOverlay.classList.add("active");
});

// close zoom
zoomOverlay.addEventListener("click", () => {
    zoomOverlay.classList.remove("active");
});
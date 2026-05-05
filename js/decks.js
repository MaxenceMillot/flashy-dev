const deckNames = {
    flowers: "Fleurs & Plantes",
    orchids: "Orchidées",
    foliages: "Feuillages"
};
const deckConfig = {
    flowers: {
        label: "Fleurs & Plantes",
        icon: "flower-2"
    },
    orchids: {
        label: "Orchidées",
        icon: "sprout"
    },
    foliages: {
        label: "Feuillages",
        icon: "leaf"
    }
};
let selectedDecks = new Set();
let onDeckChange = null;

export function getDeckLabel(deck) {
    return deckNames[deck] || deck;
}

export function getSelectedDecks() {
    return Array.from(selectedDecks);
}

export function setDeckChangeCallback(cb) {
    onDeckChange = cb;
}

export function renderDecks(cards, container){
    const decks = [...new Set(cards.map(c => c.deck))];

    container.innerHTML = "";
    selectedDecks = new Set([decks[0]]);

    decks.forEach((deck, index) => {
        const chip = document.createElement("button");
         // Only first chip is "selected"
        chip.className = index === 0 ? "chip selected disabled" : "chip";
        chip.dataset.deck = deck;

        const config = deckConfig[deck] || { label: deck, icon: "tag" };

        chip.innerHTML = `
            <i data-lucide="${config.icon}" class="chip-icon"></i>
            <span>${config.label}</span>
        `;

        chip.addEventListener("click", () => {
            toggleDeck(deck, chip);
        });

        container.appendChild(chip);
    });

    lucide.createIcons();
}

function toggleDeck(deck, chip) {
    // Prevent removing last remaining deck
    if (selectedDecks.size === 1 && selectedDecks.has(deck)) {
        return;
    }

    if (selectedDecks.has(deck)) {
        selectedDecks.delete(deck);
        chip.classList.remove("selected");
    } else {
        selectedDecks.add(deck);
        chip.classList.add("selected");
        
         // Center selected chip
        chip.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
        });
    }

    updateStateUI();

    if (onDeckChange) {
        onDeckChange([...selectedDecks]);
    }
}

function updateStateUI() {
    const chips = document.querySelectorAll(".deck-filters .chip");

    chips.forEach(chip => {
        const deck = chip.dataset.deck;

        // Disable if it's the last selected
        if (selectedDecks.size === 1 && selectedDecks.has(deck)) {
            chip.classList.add("disabled");
        } else {
            chip.classList.remove("disabled");
        }
    });
}
import { cards, save } from "./state.js";

let current = null;
let nextCard = null;

export function getScheduledCards(selectedDecks){
    let now = Date.now();

    let pool = cards.filter(c =>
        selectedDecks.includes(c.deck) && c.due <= now
    );

    if(pool.length === 0){
        pool = cards.filter(c => selectedDecks.includes(c.deck));
    }

    if(pool.length === 0) return null;

    let next = nextCard || pool[Math.floor(Math.random() * pool.length)];
    let preload = pool[Math.floor(Math.random() * pool.length)];

    return { current: next, nextCard: preload };
}

export function gradeCard(card, q){
    if(q <= 2){
        card.repetitions = 0;
        card.interval = 1;
    }
    else if(q === 3){
        card.repetitions = Math.max(0, card.repetitions - 1);
        card.interval = 1;
    }
    else if(q === 5){
        card.repetitions++;
        if(card.repetitions === 1) card.interval = 2;
        else if(card.repetitions === 2) card.interval = 6;
        else card.interval = Math.round(card.interval * card.EF * 1.2);
    }

    card.EF = card.EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02));
    if(card.EF < 1.3) card.EF = 1.3;

    card.due = Date.now() + card.interval * 86400000;

    save();
}
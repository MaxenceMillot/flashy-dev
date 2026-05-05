import { cards as baseCards } from "../data/cards.js";
export let cards = [];
export let current = null;
export let nextCard = null;

export function initState(){
    const saved = JSON.parse(localStorage.getItem("cards") || "null");

    if (saved && Array.isArray(saved)) {
        cards = saved;
    } else {
        cards = baseCards.map(c => ({
            ...c,
            EF: 2.5,
            interval: 0,
            repetitions: 0,
            due: 0,
            score: 0
        }));
    }
}

export function save(){
    localStorage.setItem("cards", JSON.stringify(cards));
}
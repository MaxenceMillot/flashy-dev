import { cards as baseCards } from "../data/cards.js";

export let cards = [];

// Increment on breaking updates
// WARNING : delete user progression (as of version 0.2.0)
const STORAGE_VERSION = "2"; 

export function initState(){

    const savedVersion = localStorage.getItem("storageVersion");

    // FORCE RESET if schema changed
    if (savedVersion !== STORAGE_VERSION) {

        localStorage.removeItem("cards");
        localStorage.setItem("storageVersion", STORAGE_VERSION);
    }

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

        save();
    }
}

export function save(){
    localStorage.setItem("cards", JSON.stringify(cards));
}
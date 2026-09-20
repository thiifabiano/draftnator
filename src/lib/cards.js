// Base de cartas local (gerada por `npm run cards`)
let cache;

async function loadData() {
	if (!cache) {
		const response = await fetch('/data/cards.json');
		cache = await response.json();
	}
	return cache;
}

export async function loadCards() {
	return (await loadData()).cards;
}

// nome e descrição de cada arquétipo, geradas junto com as cartas
export async function loadTemas() {
	return (await loadData()).temas || {};
}

export function cardImage(card) {
	return `/images/cards/${card.id}.webp`;
}

// Base de cartas local (gerada por `npm run cards`)
let cache;

export async function loadCards() {
	if (!cache) {
		const response = await fetch('/data/cards.json');
		cache = (await response.json()).cards;
	}
	return cache;
}

export function cardImage(card) {
	return `/images/cards/${card.id}.webp`;
}

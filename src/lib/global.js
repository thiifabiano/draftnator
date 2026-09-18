import { Base64 } from 'js-base64';

export function randomNum(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function buildDeckCode(deck) {
	const deckCode = {
		Name: 'Draftnator',
		Cards: deck.map((card) => ({ CardDefId: card.id }))
	};
	return Base64.btoa(JSON.stringify(deckCode));
}

export function sortCards(deck) {
	deck.sort((a, b) => (a.name > b.name ? 1 : -1));
	deck.sort((a, b) => a.power - b.power);
	deck.sort((a, b) => a.energy - b.energy);
	return deck;
}

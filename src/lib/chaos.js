// Modo Caos: deck de 12 cartas sorteado de uma vez, com um mínimo de curva.
import { randomNum } from '$lib/global.js';

export const DECK_SIZE = 12;
export const ROLLS_POR_PARTIDA = 5; // trocas por gosto; o "Não tenho" é ilimitado

// Critério de curva. Sem nenhum critério, 1 em cada 5 decks vem com 4+ cartas de custo 5 ou mais.
// Exigir muitas cartas baratas espremia o miolo do deck (dava só 1 carta de custo 5 por deck),
// então o mínimo do meio é que sustenta a curva. Passa em ~45% dos sorteios: 2,2 sorteios em média.
const MIN_BARATAS = 3; // cartas de custo <= 2
const MIN_MIOLO = 6; // cartas de custo 3 a 5
const MIN_CINCO = 1; // cartas de custo 5
const MAX_PESADAS = 2; // cartas de custo >= 6
const MAX_GIGANTES = 1; // cartas de custo >= 7

const count = (deck, test) => deck.filter(test).length;

export function curvaOk(deck) {
	return count(deck, (c) => c.energy <= 2) >= MIN_BARATAS && count(deck, (c) => c.energy >= 3 && c.energy <= 5) >= MIN_MIOLO && count(deck, (c) => c.energy === 5) >= MIN_CINCO && count(deck, (c) => c.energy >= 6) <= MAX_PESADAS && count(deck, (c) => c.energy >= 7) <= MAX_GIGANTES;
}

export function custoMedio(deck) {
	if (!deck.length) return 0;
	return deck.reduce((soma, c) => soma + c.energy, 0) / deck.length;
}

const sortear = (pool) => pool[randomNum(0, pool.length - 1)];

// Sorteia um deck inteiro. Repete até a curva passar (63% passa de primeira).
export function sortearDeck(cards, ignoradas = new Set()) {
	const pool = cards.filter((c) => !ignoradas.has(c.id));
	let deck;
	do {
		const escolhidas = new Set();
		deck = [];
		while (deck.length < DECK_SIZE) {
			const card = sortear(pool);
			if (escolhidas.has(card.id)) continue;
			escolhidas.add(card.id);
			deck.push(card);
		}
	} while (!curvaOk(deck));
	return deck;
}

// Troca uma carta só, mantendo a curva válida.
export function trocarCarta(cards, deck, index, ignoradas = new Set()) {
	const noDeck = new Set(deck.map((c) => c.id));
	const pool = cards.filter((c) => !ignoradas.has(c.id) && !noDeck.has(c.id));
	if (!pool.length) return deck;

	for (let tentativas = 0; tentativas < 500; tentativas++) {
		const novo = deck.slice();
		novo[index] = sortear(pool);
		if (curvaOk(novo)) return novo;
	}

	// fallback: mesma faixa de custo da carta trocada, aí a curva não muda
	const faixa = pool.filter((c) => c.energy === deck[index].energy);
	if (faixa.length) {
		const novo = deck.slice();
		novo[index] = sortear(faixa);
		return novo;
	}
	return deck;
}

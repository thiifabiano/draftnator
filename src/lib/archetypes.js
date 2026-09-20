// Modo Arquétipo: 4 telas de 3 opções.
// Tela 1: cada opção são 3 cartas de um arquétipo diferente. A escolha define o tema.
// Telas 2 a 4: cada opção tem 1 carta do tema e 2 aleatórias.
// No fim: 12 cartas, 6 do tema.
import { randomNum } from '$lib/global.js';

export const TEMAS = {
	destruir: { nome: 'Destruir', desc: 'Destrói as suas próprias cartas e lucra com isso.' },
	descartar: { nome: 'Descartar', desc: 'Descarta cartas da sua mão e lucra com isso.' },
	mover: { nome: 'Mover', desc: 'Move as suas cartas entre locais e lucra com isso.' },
	bounce: { nome: 'Bounce', desc: 'Devolve as suas cartas pra mão e joga elas de novo.' },
	constante: { nome: 'Constante', desc: 'Efeitos ligados o tempo todo, sem precisar revelar.' },
	rampa: { nome: 'Rampa', desc: 'Ganha energia ou desconto pra jogar cartas caras antes da hora.' },
	controle: { nome: 'Controle', desc: 'Mexe no campo e nas cartas do oponente: remove, trava e atrapalha.' }
};

export const RODADAS = 4; // 1 de arquétipo + 3 mistas
export const CARTAS_POR_OPCAO = 3;
export const OPCOES = 3;

const sortear = (pool) => pool[randomNum(0, pool.length - 1)];

const doTema = (cards, tema) => cards.filter((c) => c.temas?.includes(tema));

// Garante os dois lados do arquétipo: motor faz acontecer, recompensa lucra.
// Temas como Constante e Controle não têm recompensa separada — aí não força nada.
function papelDesejado(cards, tema, deck) {
	const pool = doTema(cards, tema);
	const temMotor = pool.some((c) => c.papeis?.[tema] === 'motor');
	const temRecompensa = pool.some((c) => c.papeis?.[tema] === 'recompensa');
	if (!temMotor || !temRecompensa) return null;

	const noDeck = deck.filter((c) => c.temas?.includes(tema));
	const motores = noDeck.filter((c) => c.papeis?.[tema] === 'motor').length;
	const recompensas = noDeck.length - motores;
	if (motores > recompensas) return 'recompensa';
	if (recompensas > motores) return 'motor';
	return null;
}

function pega(pool, fora) {
	const livres = pool.filter((c) => !fora.has(c.id));
	if (!livres.length) return null;
	const card = sortear(livres);
	fora.add(card.id);
	return card;
}

// Tela 1: uma opção por arquétipo, com 3 cartas dele (1 motor + 1 recompensa quando dá).
export function opcoesDeTema(cards, temas) {
	const fora = new Set();
	return temas.map((tema) => {
		const pool = doTema(cards, tema);
		const motores = pool.filter((c) => c.papeis?.[tema] === 'motor');
		const recompensas = pool.filter((c) => c.papeis?.[tema] === 'recompensa');
		const escolhidas = [];
		if (motores.length && recompensas.length) {
			escolhidas.push(pega(motores, fora), pega(recompensas, fora));
		}
		while (escolhidas.length < CARTAS_POR_OPCAO) escolhidas.push(pega(pool, fora));
		return { tema, cartas: escolhidas.filter(Boolean).map((c) => ({ card: c, doTema: true })) };
	});
}

// Telas 2 a 4: 1 carta do tema + 2 aleatórias por opção.
// Na última, se o deck ainda não tem carta de custo 5, uma das aleatórias vem de custo 5.
export function opcoesMistas(cards, tema, deck, ultima = false) {
	const fora = new Set(deck.map((c) => c.id));
	const pool = doTema(cards, tema);
	const papel = papelDesejado(cards, tema, deck);
	const preferidas = papel ? pool.filter((c) => c.papeis?.[tema] === papel) : pool;
	const faltaCinco = ultima && !deck.some((c) => c.energy === 5);
	const cincos = cards.filter((c) => c.energy === 5);

	return Array.from({ length: OPCOES }, () => {
		const cartas = [{ card: pega(preferidas.length ? preferidas : pool, fora) || pega(pool, fora), doTema: true }];
		if (faltaCinco) cartas.push({ card: pega(cincos, fora), doTema: false });
		while (cartas.length < CARTAS_POR_OPCAO) cartas.push({ card: pega(cards, fora), doTema: false });
		return { tema, cartas: cartas.filter((c) => c.card) };
	});
}

// Roleta uma carta específica de uma opção, mantendo o papel dela:
// carta do tema vira outra do tema, carta aleatória vira outra aleatória.
export function trocaNaOpcao(cards, opcoes, indexOpcao, indexCarta, deck, recusadas) {
	const alvo = opcoes[indexOpcao].cartas[indexCarta];
	const tema = opcoes[indexOpcao].tema;
	const fora = new Set([...deck.map((c) => c.id), ...recusadas]);
	opcoes.forEach((o) => o.cartas.forEach((c) => fora.add(c.card.id)));

	const pool = alvo.doTema ? doTema(cards, tema) : cards;
	const nova = pega(pool, fora);
	if (!nova) return opcoes;

	const copia = opcoes.map((o) => ({ ...o, cartas: o.cartas.slice() }));
	copia[indexOpcao].cartas[indexCarta] = { ...alvo, card: nova };
	return copia;
}

export function sorteiaTemas(cards, quantos = OPCOES) {
	const disponiveis = Object.keys(TEMAS).filter((t) => doTema(cards, t).length >= 12);
	const escolhidos = [];
	while (escolhidos.length < quantos && escolhidos.length < disponiveis.length) {
		const t = sortear(disponiveis);
		if (!escolhidos.includes(t)) escolhidos.push(t);
	}
	return escolhidos;
}

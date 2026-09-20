// Modo Arquétipo: 4 telas de 3 opções.
// Tela 1: cada opção são 3 cartas de um arquétipo diferente. A escolha define o tema.
// Telas 2 a 4: cada opção tem 1 carta do tema e 2 aleatórias.
// No fim: 12 cartas, 6 do tema.
import { randomNum } from '$lib/global.js';

export const RODADAS = 4; // 1 de arquétipo + 3 mistas
export const CARTAS_POR_OPCAO = 3;
export const OPCOES = 3;

const sortear = (pool) => pool[randomNum(0, pool.length - 1)];

const doTema = (cards, tema) => cards.filter((c) => c.temas?.includes(tema));

// Só vale equilibrar papéis em tema com os dois lados de verdade.
// Toxic, Zombie, Controle, Rocks e Coringa são listas fechadas, sem recompensa separada.
const MIN_POR_PAPEL = 3;

const doPapel = (cards, tema, papel) => doTema(cards, tema).filter((c) => c.papeis?.[tema] === papel);

function temDoisLados(cards, tema) {
	return doPapel(cards, tema, 'motor').length >= MIN_POR_PAPEL && doPapel(cards, tema, 'recompensa').length >= MIN_POR_PAPEL;
}

// Garante os dois lados do arquétipo: motor faz acontecer, recompensa lucra.
function papelDesejado(cards, tema, deck) {
	if (!temDoisLados(cards, tema)) return null;
	const pool = doTema(cards, tema);

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
		const escolhidas = [];
		// nos temas com os dois lados, a opção já sai com 1 motor e 1 recompensa
		if (temDoisLados(cards, tema)) {
			for (const papel of ['motor', 'recompensa']) {
				const carta = pega(doPapel(cards, tema, papel), fora);
				if (carta) escolhidas.push(carta);
			}
		}
		// completa com qualquer carta do tema; o pool pode ter esvaziado em outra opção
		while (escolhidas.length < CARTAS_POR_OPCAO) {
			const carta = pega(pool, fora);
			if (!carta) break;
			escolhidas.push(carta);
		}
		return { tema, cartas: escolhidas.map((c) => ({ card: c, doTema: true })) };
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
	// 12 é o mínimo pra um draft não pegar sempre as mesmas cartas do arquétipo
	const todos = [...new Set(cards.flatMap((c) => c.temas || []))];
	const disponiveis = todos.filter((t) => doTema(cards, t).length >= 12);
	const escolhidos = [];
	while (escolhidos.length < quantos && escolhidos.length < disponiveis.length) {
		const t = sortear(disponiveis);
		if (!escolhidos.includes(t)) escolhidos.push(t);
	}
	return escolhidos;
}

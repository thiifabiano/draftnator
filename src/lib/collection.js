// Cartas que o jogador marcou como "Não tenho".
// Fica só no navegador dele (localStorage), sem login e sem servidor.
import { writable } from 'svelte/store';

const CHAVE = 'draftnator:naotenho';

function ler() {
	try {
		const bruto = localStorage.getItem(CHAVE);
		return new Set(bruto ? JSON.parse(bruto) : []);
	} catch {
		// aba anônima, storage bloqueado ou lixo salvo: segue sem memória
		return new Set();
	}
}

function gravar(ids) {
	try {
		localStorage.setItem(CHAVE, JSON.stringify([...ids]));
	} catch {
		// sem storage o draft continua funcionando, só não lembra depois
	}
}

export const IGNORADAS = writable(new Set());

export function carregaIgnoradas() {
	const ids = ler();
	IGNORADAS.set(ids);
	return ids;
}

export function marcaNaoTenho(id) {
	const ids = ler();
	ids.add(id);
	gravar(ids);
	IGNORADAS.set(ids);
	return ids;
}

export function voltaATer(id) {
	const ids = ler();
	ids.delete(id);
	gravar(ids);
	IGNORADAS.set(ids);
	return ids;
}

export function limpaIgnoradas() {
	gravar(new Set());
	IGNORADAS.set(new Set());
}

// Pool jogável: tira do sorteio o que o jogador disse não ter.
// Se sobrar pouca carta, devolve tudo — melhor sortear carta que ele não tem
// do que travar o draft.
export function poolJogavel(cards, minimo = 60) {
	const ids = ler();
	if (!ids.size) return cards;
	const pool = cards.filter((c) => !ids.has(c.id));
	return pool.length >= minimo ? pool : cards;
}

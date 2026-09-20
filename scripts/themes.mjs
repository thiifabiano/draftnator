// Classificação de arquétipos a partir do texto da carta.
// Cada carta pode estar em mais de um arquétipo. O papel ("motor" ou "recompensa")
// é o que evita deck quebrado: motor faz a coisa acontecer, recompensa lucra com ela.
//
// Onde a regra erra, corrija na mão em scripts/theme-overrides.json.

export const TEMAS = {
	destruir: {
		nome: 'Destruir',
		desc: 'Destrói as suas próprias cartas e lucra com isso.',
		motor: /destroy (a|an|your|another|the|all|up to|each)/i,
		recompensa: /destroyed/i,
		// Shang-Chi e cia destroem as cartas do oponente: é remoção, não é o tema
		nao: /destroy (a|an|the|all)? ?(enemy|opposing)/i
	},
	descartar: {
		nome: 'Descartar',
		desc: 'Descarta cartas da sua mão e lucra com isso.',
		motor: /discard (a|an|\d|your|the|random|up to)/i,
		recompensa: /discarded|discard pile/i
	},
	mover: {
		nome: 'Mover',
		desc: 'Move as suas cartas entre locais e lucra com isso.',
		motor: /you can move|move (a|an|one|your|this|it|each|all|up to)|swap/i,
		recompensa: /when (this|a card|you) moves?|moved|after you move/i
	},
	bounce: {
		nome: 'Bounce',
		desc: 'Devolve as suas cartas pra mão e joga elas de novo.',
		motor: /return [^.]{0,45}to (your|their|its owner.s) hand/i,
		recompensa: /when you play a card|after you play|each (other )?card you play|cards? you played (this|last) turn|when this returns|if this returned|returns? to your hand/i
	},
	constante: {
		nome: 'Constante',
		desc: 'Efeitos que ficam ligados o tempo todo, sem precisar revelar.',
		motor: /ongoing/i,
		recompensa: /ongoing/i
	},
	rampa: {
		nome: 'Rampa',
		desc: 'Ganha energia ou desconto pra jogar cartas caras antes da hora.',
		motor: /energy|costs? \d+ less|-\d cost|cost \d+ less/i,
		recompensa: /^(?!.*less).*(6-cost|5-cost|high.cost)/i
	},
	controle: {
		nome: 'Controle',
		desc: 'Mexe no campo e nas cartas do oponente: remove, trava e atrapalha.',
		motor: /(enemy|opponent|opposing)|can.t (be|play|use|move|activate)|cannot|won.t happen|only way|move away|remove the (abilities|text)|destroy all|flood|replace (this|each)? ?location|reset all|no (more )?abilit/i,
		recompensa: /(enemy|opponent|opposing)/i
	}
};

export function classifica(card, overrides = { include: {}, exclude: {} }) {
	const texto = card.ability || '';
	const temas = [];
	const papeis = {};

	for (const [chave, t] of Object.entries(TEMAS)) {
		const forcado = (overrides.include[chave] || []).includes(card.id);
		const barrado = (overrides.exclude[chave] || []).includes(card.id);
		if (barrado) continue;

		const motor = t.motor.test(texto) && !(t.nao && t.nao.test(texto));
		const recompensa = t.recompensa.test(texto) && !(t.nao && t.nao.test(texto));
		if (!forcado && !motor && !recompensa) continue;

		temas.push(chave);
		papeis[chave] = motor ? 'motor' : 'recompensa';
	}

	return { temas, papeis };
}

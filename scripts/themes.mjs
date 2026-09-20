// Classificação de arquétipos.
//
// Cada arquétipo tem duas fontes:
//   1. a lista fixa de scripts/theme-cards.json (Untapped.gg e escolhas manuais);
//   2. as palavras-chave do texto da carta, abaixo.
// A carta entra no arquétipo se bater em qualquer uma das duas, e pode estar em vários.
//
// O papel ("motor" faz a coisa acontecer, "recompensa" lucra com ela) evita deck quebrado.
// Ajustes pontuais ficam em scripts/theme-overrides.json.

// Temas sem palavra-chave (só lista) ficam de fora deste mapa.
export const PALAVRAS = {
	destruir: {
		motor: /destroy (a|an|your|another|the|all|up to|each)/i,
		recompensa: /destroyed/i,
		// Shang-Chi e cia destroem cartas do oponente: é remoção, não é o tema
		nao: /destroy (a|an|the|all)? ?(enemy|opposing)/i
	},
	descartar: {
		motor: /discard (a|an|\d|your|the|random|up to)/i,
		recompensa: /discarded|discard pile/i
	},
	mover: {
		motor: /you can move|move (a|an|one|your|this|it|each|all|up to)|swap/i,
		recompensa: /when (this|a card|you) moves?|moved|after you move/i,
		nao: /move (a|an|all|the)? ?(enemy|opposing)|move away/i
	},
	bounce: {
		motor: /return [^.]{0,45}to (your|their|its owner.s) hand/i,
		recompensa: /when you play a card|after you play|each (other )?card you play|cards? you played (this|last) turn|when this returns|if this returned/i
	},
	constante: {
		motor: /ongoing/i,
		recompensa: /ongoing/i
	},
	rampa: {
		motor: /\+?\d* ?energy|costs? \d+ less|-\d cost/i,
		recompensa: /6-cost|high.cost/i
	},
	buff: {
		motor: /give [^.]{0,40}\+\d+ power|\+\d+ power to|give .* cards? here \+/i,
		recompensa: /power (increases?|added|gained)|for each \+\d+|has been given/i
	},
	zombie: {
		motor: /zombie/i,
		recompensa: /zombie/i
	},
	antimove: {
		motor: /move (a|an|all|the)? ?(enemy|opposing)|move away|pull an enemy/i,
		recompensa: /(enemy|opposing) cards? (that )?moved?/i
	},
	rocks: {
		// só pedra/lixo de verdade: "add a card to your opponent's hand" pegava meio jogo
		motor: /\brocks?\b|rubble|shuffle [^.]{0,30} into your opponent.s deck/i,
		recompensa: /\brocks?\b/i
	}
};

export function classifica(card, temasFixos = {}, overrides = { include: {}, exclude: {} }) {
	const texto = card.ability || '';
	const temas = [];
	const papeis = {};

	for (const [chave, def] of Object.entries(temasFixos)) {
		const barrado = (overrides.exclude[chave] || []).includes(card.id);
		if (barrado) continue;

		const naLista = (def.ids || []).includes(card.id);
		const forcado = (overrides.include[chave] || []).includes(card.id);
		const p = PALAVRAS[chave];
		const bloqueado = p?.nao && p.nao.test(texto);

		const motor = !!p && p.motor.test(texto) && !bloqueado;
		const recompensa = !!p && p.recompensa.test(texto) && !bloqueado;

		if (!naLista && !forcado && !motor && !recompensa) continue;

		temas.push(chave);
		// carta da lista sem palavra-chave conta como motor: é carta central do arquétipo
		papeis[chave] = recompensa && !motor ? 'recompensa' : 'motor';
	}

	return { temas, papeis };
}

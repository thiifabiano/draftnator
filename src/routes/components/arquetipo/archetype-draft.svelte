<script>
	import { onMount } from 'svelte';
	import { loadCards, loadTemas, cardImage } from '$lib/cards.js';
	import { RODADAS, sorteiaTemas, opcoesDeTema, opcoesMistas, trocaNaOpcao } from '$lib/archetypes.js';
	import { buildDeckCode, sortCards } from '$lib/global.js';
	import { custoMedio } from '$lib/chaos.js';
	import { DECK } from '$lib/store.js';
	import PowerTable from '../power-table.svelte';
	import tippy from 'tippy.js';
	import 'tippy.js/dist/tippy.css';
	import 'tippy.js/themes/light-border.css';

	let allCards = [];
	let temas = {};
	let deck = [];
	let opcoes = [];
	let tema = null;
	let rodada = 1;
	let recusadas = new Set();
	let copied = false;

	$: DECK.set(deck);
	$: pronto = rodada > RODADAS;
	$: deckcode = pronto ? buildDeckCode(deck) : '';
	$: medio = custoMedio(deck).toFixed(2).replace('.', ',');

	onMount(async () => {
		[allCards, temas] = await Promise.all([loadCards(), loadTemas()]);
		opcoes = opcoesDeTema(allCards, sorteiaTemas(allCards));
		redesenhaTips();
	});

	let tippyInstance = null;
	function redesenhaTips() {
		setTimeout(() => {
			if (tippyInstance) tippyInstance.forEach((i) => i.destroy());
			tippyInstance = new tippy('[data-tippy-content]', {
				theme: 'light-border',
				delay: [150, 150],
				maxWidth: 240,
				placement: 'bottom'
			});
		}, 0);
	}

	function escolher(opcao) {
		new Audio('/sounds/card-open.wav').play();
		if (rodada === 1) tema = opcao.tema;
		deck = sortCards([...deck, ...opcao.cartas.map((c) => c.card)]);
		rodada++;
		opcoes = pronto ? [] : opcoesMistas(allCards, tema, deck, rodada === RODADAS);
		copied = false;
		redesenhaTips();
	}

	function trocar(io, ic) {
		recusadas.add(opcoes[io].cartas[ic].card.id);
		opcoes = trocaNaOpcao(allCards, opcoes, io, ic, deck, recusadas);
		redesenhaTips();
	}

	function copyDeckCode() {
		navigator.clipboard.writeText(deckcode);
		new Audio('/sounds/pop.mp3').play();
		copied = true;
	}
</script>

<div class="component-ui arq">
	{#if !allCards.length}
		<div class="info">Carregando...</div>
	{:else if !pronto}
		<div class="cabecalho">
			{#if rodada === 1}
				<div class="info">Escolha um arquétipo. Você leva as três cartas dele.</div>
			{:else}
				<div class="info">
					Arquétipo: <strong>{temas[tema].nome}</strong> — {temas[tema].desc}<br />
					Rodada {rodada} de {RODADAS} · <span class="selo">★</span> marca a carta do arquétipo
				</div>
			{/if}
		</div>

		<div class="corpo">
			<div class="opcoes">
				{#each opcoes as opcao, io (io + '-' + opcao.cartas.map((c) => c.card.id).join())}
					<div class="opcao">
						{#if rodada === 1}
							<div class="titulo">{temas[opcao.tema].nome}</div>
							<div class="sub">{temas[opcao.tema].desc}</div>
						{/if}
						<div class="cartas">
							{#each opcao.cartas as item, ic}
								<div class="carta">
									<img src={cardImage(item.card)} data-tippy-content={item.card.desc} alt={item.card.name} />
									{#if item.doTema && rodada > 1}<span class="selo" title="carta do arquétipo">★</span>{/if}
									<button class="button button-small" on:click={() => trocar(io, ic)}>Não tenho</button>
								</div>
							{/each}
						</div>
						<button class="button escolher" on:click={() => escolher(opcao)}>Escolher</button>
					</div>
				{/each}
			</div>

			<div class="painel">
				<div class="painel-titulo">Seu deck · {deck.length} de 12</div>
				<div class="miniaturas">
					{#each Array(12) as _, i (i)}
						{#if deck[i]}
							<div class="mini">
								<img src={cardImage(deck[i])} data-tippy-content={deck[i].desc} alt={deck[i].name} />
								{#if tema && deck[i].temas?.includes(tema)}<span class="selo mini-selo">★</span>{/if}
							</div>
						{:else}
							<div class="mini vazia" />
						{/if}
					{/each}
				</div>
				{#if deck.length}
					<div class="painel-info">Custo médio {medio}</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="cabecalho">
			<div class="info">
				Arquétipo: <strong>{temas[tema].nome}</strong> · custo médio <strong>{medio}</strong>
			</div>
			<PowerTable />
		</div>
		<div class="cartas final">
			{#each deck as card (card.id)}
				<div class="carta">
					<img src={cardImage(card)} data-tippy-content={card.desc} alt={card.name} />
					{#if card.temas?.includes(tema)}<span class="selo">★</span>{/if}
				</div>
			{/each}
		</div>
		<div class="acoes">
			<a data-sveltekit-reload href="/arquetipo/" class="button link">Novo draft</a>
		</div>
		<div id="deckcode">
			<input type="text" id="deck-code-input" readonly value={deckcode} />
			<input on:click={copyDeckCode} type="button" class="button-primary" value={copied ? 'Copiado!' : 'Copiar código'} />
		</div>
	{/if}
</div>

<style>
	.arq {
		flex-direction: column;
		max-width: 1330px;
	}
	.cabecalho {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 30px;
		margin-bottom: 16px;
	}
	.info {
		font-size: 17px;
		text-align: center;
		line-height: 1.7;
	}
	.corpo {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		gap: 18px;
		width: 100%;
	}
	.opcoes {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}
	.opcao {
		border: solid 2px #4a5699;
		border-radius: 14px;
		padding: 12px 10px;
		text-align: center;
		background-color: #2b2b2b;
	}
	.titulo {
		font-size: 20px;
		font-weight: bold;
	}
	.sub {
		font-size: 13px;
		opacity: 0.85;
		max-width: 290px;
		margin: 6px auto 10px;
		min-height: 36px;
		line-height: 1.4;
	}
	.cartas {
		display: flex;
		justify-content: center;
	}
	.cartas.final {
		flex-wrap: wrap;
		margin-bottom: 14px;
	}
	.carta {
		position: relative;
		width: 100px;
		margin: 2px;
		text-align: center;
	}
	.carta img {
		width: 96px;
	}
	.cartas.final .carta {
		width: 122px;
		margin: 3px;
	}
	.cartas.final .carta img {
		width: 118px;
	}
	.button-small {
		font-size: 11px !important;
		margin-top: 4px;
		padding: 4px 8px;
	}
	.escolher {
		margin-top: 10px;
		font-size: 15px;
		background-color: #2e7d32;
		border-color: #1b5e20;
		padding: 8px 22px;
	}
	.escolher:hover {
		background-color: #388e3c;
	}
	.selo {
		position: absolute;
		top: 3px;
		right: 8px;
		font-size: 17px;
		color: #ffd54a;
		text-shadow: 0 0 4px #000;
	}
	/* painel lateral com o que já foi escolhido */
	.painel {
		border: solid 2px #3b4470;
		border-radius: 14px;
		padding: 10px;
		background-color: #262626;
		width: 190px;
		flex-shrink: 0;
	}
	.painel-titulo {
		font-size: 13px;
		text-align: center;
		margin-bottom: 8px;
	}
	.miniaturas {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 5px;
	}
	.mini {
		position: relative;
	}
	.mini img {
		width: 100%;
		display: block;
	}
	.mini.vazia {
		background-color: #1e1e1e;
		border: dashed 1px #444;
		border-radius: 4px;
		aspect-ratio: 1;
	}
	.mini-selo {
		top: 0;
		right: 2px;
		font-size: 12px;
	}
	.painel-info {
		font-size: 12px;
		text-align: center;
		margin-top: 8px;
	}
	.acoes {
		margin: 16px 0;
	}
	.link {
		text-decoration: none;
	}
	#deckcode {
		display: flex;
		width: 100%;
	}
	#deck-code-input {
		width: 100%;
		border-radius: 10px 0 0 10px;
		font-size: 13px;
		padding: 12px;
		border: none;
	}
	.button-primary {
		border-radius: 0 10px 10px 0;
		margin-left: 0;
		border-left: 0;
	}
</style>

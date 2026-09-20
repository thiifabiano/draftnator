<script>
	import { onMount } from 'svelte';
	import { loadCards, cardImage } from '$lib/cards.js';
	import { TEMAS, RODADAS, sorteiaTemas, opcoesDeTema, opcoesMistas, trocaNaOpcao } from '$lib/archetypes.js';
	import { buildDeckCode, sortCards } from '$lib/global.js';
	import { custoMedio } from '$lib/chaos.js';
	import { DECK } from '$lib/store.js';
	import PowerTable from '../power-table.svelte';
	import tippy from 'tippy.js';
	import 'tippy.js/dist/tippy.css';
	import 'tippy.js/themes/light-border.css';

	let allCards = [];
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
		allCards = await loadCards();
		opcoes = opcoesDeTema(allCards, sorteiaTemas(allCards));
		redesenhaTips();
	});

	let tippyInstance = null;
	function redesenhaTips() {
		setTimeout(() => {
			if (tippyInstance) tippyInstance.forEach((i) => i.destroy());
			tippyInstance = new tippy('[data-tippy-content]', {
				theme: 'light-border',
				delay: [200, 200],
				maxWidth: 200,
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
		<div class="topo">
			{#if rodada === 1}
				<div class="info">Escolha um arquétipo. Você leva as três cartas dele.</div>
			{:else}
				<div class="info">
					Arquétipo: <strong>{TEMAS[tema].nome}</strong> — {TEMAS[tema].desc}<br />
					Rodada {rodada} de {RODADAS} · cada opção tem <span class="selo">★</span> uma carta do arquétipo
				</div>
			{/if}
		</div>

		<div class="opcoes">
			{#each opcoes as opcao, io (io + '-' + opcao.cartas.map((c) => c.card.id).join())}
				<div class="opcao">
					{#if rodada === 1}
						<div class="titulo">{TEMAS[opcao.tema].nome}</div>
						<div class="sub">{TEMAS[opcao.tema].desc}</div>
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
	{:else}
		<div class="topo">
			<div class="info">
				Arquétipo: <strong>{TEMAS[tema].nome}</strong><br />
				Custo médio do deck: <strong>{medio}</strong>
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
		max-width: 860px;
		margin: auto;
	}
	.topo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 30px;
		margin-bottom: 12px;
	}
	.info {
		font-size: 13px;
		text-align: center;
		line-height: 1.6;
	}
	.opcoes {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
	}
	.opcao {
		border: solid 2px #4a5699;
		border-radius: 12px;
		padding: 10px 8px;
		text-align: center;
		background-color: #2b2b2b;
	}
	.titulo {
		font-size: 15px;
		font-weight: bold;
	}
	.sub {
		font-size: 10px;
		opacity: 0.8;
		max-width: 250px;
		margin: 4px auto 8px;
		min-height: 26px;
	}
	.cartas {
		display: flex;
		justify-content: center;
	}
	.cartas.final {
		flex-wrap: wrap;
		margin-bottom: 12px;
	}
	.carta {
		position: relative;
		width: 82px;
		margin: 1px;
		text-align: center;
	}
	.carta img {
		width: 80px;
	}
	.cartas.final .carta {
		width: 92px;
		margin: 2px;
	}
	.cartas.final .carta img {
		width: 90px;
	}
	.selo {
		position: absolute;
		top: 2px;
		right: 6px;
		font-size: 13px;
		color: #ffd54a;
		text-shadow: 0 0 4px #000;
	}
	.button-small {
		font-size: 8px !important;
		margin-top: 2px;
	}
	.escolher {
		margin-top: 8px;
	}
	.acoes {
		margin: 14px 0;
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

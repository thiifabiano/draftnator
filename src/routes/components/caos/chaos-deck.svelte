<script>
	import { onMount } from 'svelte';
	import { loadCards, cardImage } from '$lib/cards.js';
	import { sortearDeck, trocarCarta, custoMedio } from '$lib/chaos.js';
	import { buildDeckCode, sortCards } from '$lib/global.js';
	import { DECK } from '$lib/store.js';
	import PowerTable from '../power-table.svelte';
	import tippy from 'tippy.js';
	import 'tippy.js/dist/tippy.css';
	import 'tippy.js/themes/light-border.css';

	let allCards = [];
	let deck = [];
	let ignoradas = new Set(); // cartas que o jogador disse não ter
	let sorteioUsado = false; // o "sortear tudo" vale uma vez por partida
	let copied = false;

	$: DECK.set(deck); // alimenta a tabela de curva
	$: deckcode = deck.length ? buildDeckCode(deck) : '';
	$: medio = custoMedio(deck).toFixed(2).replace('.', ',');

	onMount(async () => {
		allCards = await loadCards();
		deck = sortCards(sortearDeck(allCards));
		bindToolTips();
	});

	let tippyInstance = null;
	function bindToolTips() {
		if (tippyInstance) tippyInstance.forEach((i) => i.destroy());
		tippyInstance = new tippy('[data-tippy-content]', {
			theme: 'light-border',
			delay: [200, 200],
			maxWidth: 200,
			placement: 'bottom'
		});
	}

	function sortearTudo() {
		if (sorteioUsado) return;
		sorteioUsado = true;
		copied = false;
		deck = sortCards(sortearDeck(allCards, ignoradas));
		setTimeout(bindToolTips, 0);
	}

	function naoTenho(index) {
		ignoradas.add(deck[index].id);
		copied = false;
		deck = sortCards(trocarCarta(allCards, deck, index, ignoradas));
		setTimeout(bindToolTips, 0);
	}

	function copyDeckCode() {
		navigator.clipboard.writeText(deckcode);
		new Audio('/sounds/pop.mp3').play();
		copied = true;
	}
</script>

<div class="component-ui caos">
	{#if deck.length}
		<div class="topo">
			<div class="info">Custo médio do deck: <strong>{medio}</strong></div>
			<PowerTable />
		</div>

		<div class="cartas">
			{#each deck as card, index (card.id)}
				<div class="carta">
					<img src={cardImage(card)} data-tippy-content={card.desc} alt={card.name} />
					<button class="button button-small" on:click={() => naoTenho(index)}>Não tenho</button>
				</div>
			{/each}
		</div>

		<div class="acoes">
			<button class="button" on:click={sortearTudo} disabled={sorteioUsado}>
				{sorteioUsado ? 'Sorteio já usado' : 'Sortear tudo de novo (1x)'}
			</button>
			<a data-sveltekit-reload href="/caos/" class="button link">Nova partida</a>
		</div>

		<div id="deckcode">
			<input type="text" id="deck-code-input" readonly value={deckcode} />
			<input on:click={copyDeckCode} type="button" class="button-primary" value={copied ? 'Copiado!' : 'Copiar código'} />
		</div>
	{:else}
		<div class="info">Sorteando...</div>
	{/if}
</div>

<style>
	.caos {
		flex-direction: column;
		max-width: 800px;
		margin: auto;
	}
	.topo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 30px;
		margin-bottom: 10px;
	}
	.info {
		font-size: 13px;
	}
	.cartas {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	.carta {
		text-align: center;
		width: 120px;
		margin: 4px;
	}
	.carta img {
		width: 110px;
	}
	.button-small {
		font-size: 8px !important;
		margin-top: 2px;
	}
	.acoes {
		margin: 15px 0;
		display: flex;
		gap: 10px;
		justify-content: center;
	}
	.link {
		text-decoration: none;
		line-height: 1.6;
	}
	#deckcode {
		display: flex;
		width: 100%;
	}
	#deck-code-input {
		width: 100%;
		border-radius: 10px 0px 0px 10px;
		font-size: 13px;
		padding: 12px;
		margin-right: 0px;
		border: none;
	}
	.button-primary {
		border-radius: 0px 10px 10px 0px;
		margin-left: 0px;
		border-left: 0px;
	}
</style>

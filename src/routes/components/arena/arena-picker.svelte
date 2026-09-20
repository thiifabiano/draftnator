<script>
	import { onMount } from 'svelte';
	import { sortCards, randomNum } from '$lib/global.js';
	import { loadCards, cardImage } from '$lib/cards.js';
	import { poolJogavel, marcaNaoTenho } from '$lib/collection.js';
	import { DECK } from '$lib/store.js';

	let cards = [];
	let picks = [null, null, null];
	const taken = new Set();

	onMount(async () => {
		cards = poolJogavel(await loadCards()); // tira as marcadas como "Não tenho"
		$DECK = [];
		pickCards();
	});

	function drawCard(slot) {
		const shown = picks.filter((p, i) => p && i !== slot).map((p) => p.id);
		let card;
		do {
			card = cards[randomNum(0, cards.length - 1)];
		} while (taken.has(card.id) || shown.includes(card.id));
		picks[slot] = card;
	}

	// sem argumento sorteia as três; com índice troca só aquela
	function pickCards(slot) {
		if (slot === undefined) {
			picks = [null, null, null];
			[0, 1, 2].forEach(drawCard);
		} else {
			taken.add(picks[slot].id); // "não tenho" -> não volta mais
			marcaNaoTenho(picks[slot].id); // e o navegador lembra pros próximos drafts
			drawCard(slot);
		}
	}

	function cardPicked(card) {
		taken.add(card.id);
		$DECK.push(card);
		DECK.set(sortCards($DECK));
		pickCards();
	}
</script>

<div class="component-ui">
	{#each picks as card, i}
		{#if card}
			<div class="arena-pick">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<img on:click={() => cardPicked(card)} src={cardImage(card)} alt={card.name} />
				<div class="card-desc">{card.desc}</div>
				<button class="button" on:click={() => pickCards(i)}>Não tenho</button>
			</div>
		{/if}
	{/each}
</div>

<style>
	.arena-pick {
		text-align: center;
		margin: 0px;
		height: 350px;
	}

	.card-desc {
		font-size: 10px;
		margin-bottom: 5px;
		max-width: 180px;
		margin-left: auto;
		margin-right: auto;
		min-height: 50px;
		margin-top: 3px;
	}

	img:hover {
		cursor: pointer;
	}

	.button {
		margin-top: 3px;
	}
</style>

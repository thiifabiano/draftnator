<script>
	import { onMount } from 'svelte';
	import { loadCards, cardImage } from '$lib/cards.js';
	import { poolJogavel, marcaNaoTenho } from '$lib/collection.js';
	import { sortCards, randomNum } from '$lib/global.js';
	import { SEALED_CARDS } from '$lib/store.js';
	import { DECK } from '$lib/store.js';

	const displayedCards = [null, null, null, null, null];
	let allCards = [];
	let revealed = 0;
	let packs = 5;
	let cardsOpened = [];
	const skipped = new Set(); // cartas que o jogador disse não ter
	let hideCards = false;
	let openComplete = false;

	onMount(async () => {
		allCards = poolJogavel(await loadCards()); // tira as marcadas como "Não tenho"
		$DECK = [];
		$SEALED_CARDS = []; // reset any old data on reload
	});

	function handleClick(index, reroll) {
		new Audio('/sounds/card-open.wav').play();

		if ((displayedCards[index] != null || revealed === 5) && !reroll) return;

		if (reroll) {
			// remove the card already in our hands
			const old = displayedCards[index];
			skipped.add(old.id);
			marcaNaoTenho(old.id); // o navegador lembra pros próximos drafts
			cardsOpened.splice(
				cardsOpened.findIndex((x) => x.id === old.id),
				1
			);
			revealed--;
		}

		let card;
		do {
			card = allCards[randomNum(0, allCards.length - 1)];
		} while (skipped.has(card.id) || cardsOpened.some((x) => x.id === card.id));

		cardsOpened.push(card);
		displayedCards[index] = card;
		revealed += 1;
	}

	function handleDeal() {
		if (!hideCards) {
			hideCards = true;
			packs--;
		}

		if (packs === 0) return;
		new Audio('/sounds/pack-open.wav').play();

		if (revealed !== 5) return;

		for (let i = 0; i < displayedCards.length; i++) displayedCards[i] = null;
		revealed = 0;
		packs--;
	}

	// handles once all the cards are opened;
	function buildDeck() {
		$SEALED_CARDS = sortCards(cardsOpened.slice(0));
		openComplete = true;
	}
</script>

{#if !openComplete}
	<div class="component-ui">
		<div class="card-pack-container">
			<div class="card-pack">
				<div id="cardtray">
					{#if packs > 0}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<img src="/images/CardPack-LokiForAllTime.png" on:click={() => handleDeal()} alt="Card Pack " class="card-pack-image" />
					{/if}
				</div>
				<div id="packs-remaining">{packs} {packs === 1 ? 'pacote restante' : 'pacotes restantes'}</div>
				{#if packs == 0 && revealed == 5}
					<div class="build-deck"><button class="button" on:click={() => buildDeck()}>Montar o deck</button></div>
				{/if}
			</div>
			<div class="card-images-container">
				{#if hideCards}
					{#each displayedCards as card, index}
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<div class="card-image-container">
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<img src={card ? cardImage(card) : '/images/CardBack-LokiForAllTime.png'} class="card-image" alt={`Card ${index}`} on:click={() => handleClick(index, false)} />
							{#if card}
								<div class="card-description">{displayedCards[index].desc}</div>
								<div class="reroll"><button class="button-reroll button button-small" on:click={() => handleClick(index, true)}>Não tenho</button></div>
							{:else}
								<div class="card-description" />
								<div class="reroll" />
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.build-deck {
		margin-top: 15px;
	}
	.reroll {
		margin-bottom: 10px;
		min-height: 32px;
	}
	.reroll button {
		font-size: 10px;
		margin-bottom: 10px;
	}
	.card-description {
		text-align: center;
		max-width: 150px;
		font-size: 9px;
		min-height: 45px;
		max-height: 45px;
		margin-left: 5px;
		margin-right: 5px;
		overflow: hidden;
		margin-top: -5px;
	}
	.card-pack-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		margin: 20px;
	}

	.card-pack-image {
		width: 250px;
		height: auto;
		margin-right: 20px;
		cursor: pointer;
	}

	.card-images-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.card-image-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 270px;
	}

	.card-image {
		width: 180px;
		height: auto;
		margin-bottom: 10px;
		cursor: pointer;
	}

	.card-pack {
		text-align: center;
		margin: auto 0px;
	}

	@media screen and (max-width: 768px) {
		.card-pack-container {
			flex-direction: column;
			align-items: flex-start;
		}

		.card-pack-image {
			margin-right: 0;
			margin-bottom: 20px;
		}

		.card-images-container {
			flex-direction: column;
			align-items: flex-start;
		}

		.card-image {
			width: 175px;
			margin-right: 0;
			margin-bottom: 10px;
		}
	}

	.button-small {
		font-size: 8px !important;
	}

	#cardtray {
		background-image: url('/images/cardtray.png');
		width: 262px;
		height: 438px;
	}
	#packs-remaining {
		margin-top: -45px;
		margin-bottom: +45px;
	}
</style>

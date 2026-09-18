<script>
	import Footer from '../components/footer.svelte';
	import Header from '../components/header.svelte';
	import Deck from '../components/deck-view.svelte';

	import SealedPicker from '../components/sealed/sealed-picker.svelte';
	import OpenedCards from '../components/sealed/sealed-opened.svelte';
	import { DECK } from '$lib/store.js';
	import { SEALED_CARDS } from '$lib/store.js';

	let cardsDrafted = 0;
	SEALED_CARDS.subscribe((c) => {
		cardsDrafted = c.length;
	});

	let cards = [];
	DECK.subscribe((c) => {
		cards = c;
	});
</script>

<svelte:head>
	<title>Draftnator · Sealed</title>
</svelte:head>

<div>
	<Header />
</div>

{#if cardsDrafted == 0}
	<div>
		<SealedPicker />
	</div>
{/if}

{#if cardsDrafted > 0}
	<div>
		<Deck {cards} />
	</div>
{/if}

{#if cardsDrafted > 0}
	<div>
		<OpenedCards />
	</div>
{/if}

<div>
	<Footer />
</div>

<script>
	import { onMount } from 'svelte';
	import { buildDeckCode } from '$lib/global.js';
	import { DECK } from '$lib/store.js';

	let deckcode = '';
	let copied = false;
	onMount(async () => {
		deckcode = buildDeckCode($DECK);
	});

	function copyDeckCode() {
		navigator.clipboard.writeText(deckcode);
		new Audio('/sounds/pop.mp3').play();
		copied = true;
	}
</script>

<div class="component-ui">
	<div>Pelo martelo de Thor, draft completo! Copie o código e importe o deck no jogo.</div>
	<div class="break" />
	<div id="deckcode">
		<input type="text" id="deck-code-input" value={deckcode} /><input on:click={copyDeckCode} type="button" class="button-primary" value={copied ? 'Copiado!' : 'Copiar código'} />
	</div>
	<div class="break" />
	<div id="newdraft">
		<a data-sveltekit-reload href="/" class="button">Novo draft</a>
	</div>
</div>

<style>
	#deckcode {
		display: flex;
	}
	#newdraft {
		display: flex;
		margin-top: 15px;
	}
	.break {
		flex-basis: 100%;
		height: 25px;
	}
	#deckcode {
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
	.button {
		text-decoration: none;
	}
</style>

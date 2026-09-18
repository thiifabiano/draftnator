<script>
	import { onMount } from 'svelte';

	let updated = '';
	let total = 0;
	onMount(async () => {
		const data = await (await fetch('/data/cards.json')).json();
		updated = data.updated.split('-').reverse().join('/');
		total = data.cards.length;
	});
</script>

<div id="footer">
	{#if total}{total} cartas ● base atualizada em {updated} ●{/if}
	baseado no <a target="_blank" rel="noreferrer" href="https://github.com/hansenwebco/marvel-snap-draftanator">Draftanator</a> de stonedonkey
</div>

<style>
	#footer {
		font-family: 'Orbitron', Arial, Helvetica, sans-serif;
		margin-top: 60px;
		font-size: 10px;
		text-align: center;
		margin-bottom: 50px;
		opacity: 0.8;
	}
</style>

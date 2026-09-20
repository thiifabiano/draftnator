<script>
	import { onMount } from 'svelte';
	import Header from '../components/header.svelte';
	import Footer from '../components/footer.svelte';
	import { loadCards, cardImage } from '$lib/cards.js';
	import { IGNORADAS, carregaIgnoradas, voltaATer, limpaIgnoradas } from '$lib/collection.js';
	import tippy from 'tippy.js';
	import 'tippy.js/dist/tippy.css';
	import 'tippy.js/themes/light-border.css';

	let allCards = [];
	let confirmando = false;

	$: faltando = allCards.filter((c) => $IGNORADAS.has(c.id));

	onMount(async () => {
		allCards = await loadCards();
		carregaIgnoradas();
		setTimeout(() => {
			new tippy('[data-tippy-content]', { theme: 'light-border', delay: [150, 150], maxWidth: 240, placement: 'bottom' });
		}, 0);
	});
</script>

<svelte:head>
	<title>Draftnator · Cartas que não tenho</title>
</svelte:head>

<Header />

<div class="component-ui colecao">
	<div class="info">
		Cartas que você marcou como <strong>"Não tenho"</strong>. Elas não aparecem mais nos seus drafts.<br />
		A lista fica salva só neste navegador. Se conseguir a carta no jogo, clique nela pra voltar ao sorteio.
	</div>

	{#if faltando.length}
		<div class="contagem">{faltando.length} de {allCards.length} cartas fora do sorteio</div>
		<div class="cartas">
			{#each faltando as card (card.id)}
				<div class="carta">
					<img src={cardImage(card)} data-tippy-content={card.desc} alt={card.name} />
					<button class="button button-small" on:click={() => voltaATer(card.id)}>Tenho essa</button>
				</div>
			{/each}
		</div>
		<div class="acoes">
			{#if confirmando}
				<button
					class="button perigo"
					on:click={() => {
						limpaIgnoradas();
						confirmando = false;
					}}>Confirmar: liberar todas</button
				>
				<button class="button" on:click={() => (confirmando = false)}>Cancelar</button>
			{:else}
				<button class="button" on:click={() => (confirmando = true)}>Liberar todas de novo</button>
			{/if}
		</div>
	{:else}
		<div class="vazio">Você ainda não marcou nenhuma carta. Todas as {allCards.length} entram nos sorteios.</div>
	{/if}
</div>

<Footer />

<style>
	.colecao {
		flex-direction: column;
		max-width: 1100px;
	}
	.info {
		font-size: 15px;
		text-align: center;
		line-height: 1.7;
	}
	.contagem {
		font-size: 13px;
		margin: 14px 0 6px;
		opacity: 0.85;
	}
	.cartas {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	.carta {
		width: 108px;
		margin: 4px;
		text-align: center;
	}
	.carta img {
		width: 100px;
	}
	.button-small {
		font-size: 10px !important;
		margin-top: 3px;
		padding: 4px 8px;
	}
	.acoes {
		margin-top: 18px;
		display: flex;
		gap: 10px;
	}
	.perigo {
		background-color: #8b2020;
		border-color: #5e1414;
	}
	.vazio {
		margin-top: 16px;
		font-size: 14px;
		opacity: 0.85;
	}
</style>

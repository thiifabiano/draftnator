// Atualiza a base de cartas a partir do Marvel Snap Zone.
// Uso: npm run cards
//
// Gera static/data/cards.json e baixa as imagens que faltam em static/images/cards/{id}.webp
// (redimensionadas pra 260px). Imagens que já existem não são baixadas de novo.

import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';

const SOURCE = 'https://marvelsnapzone.com/getinfo/?searchtype=cards&searchcardstype=true';
const DATA_FILE = 'static/data/cards.json';
const IMG_DIR = 'static/images/cards';
const OVERRIDES_FILE = 'scripts/card-overrides.json';

// cartas colecionáveis (exclui tokens, variantes de modos especiais, "Champions", etc.)
const COLLECTIBLE = /^(Series|Starter|Recruit|Collection)/;

const stripTags = (s) =>
	(s || '')
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&#039;|&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/\s+/g, ' ')
		.trim();

const exists = (p) =>
	access(p).then(
		() => true,
		() => false
	);

async function main() {
	const overrides = JSON.parse(await readFile(OVERRIDES_FILE, 'utf8'));
	const include = new Set(overrides.include);
	const exclude = new Set(overrides.exclude);

	console.log('Baixando lista do Marvel Snap Zone...');
	const res = await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0 Draftnator' } });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const all = (await res.json()).success.cards;

	const picked = all.filter((c) => c.type === 'Character' && !exclude.has(c.carddefid) && (include.has(c.carddefid) || (c.status === 'released' && COLLECTIBLE.test(c.source))));

	const missingOverrides = [...include].filter((id) => !picked.some((c) => c.carddefid === id));
	if (missingOverrides.length) console.warn('Overrides não encontrados na fonte:', missingOverrides);

	const cards = picked
		.map((c) => ({
			id: c.carddefid,
			name: stripTags(c.name),
			energy: Number(c.cost),
			power: Number(c.power),
			desc: stripTags(c.ability) || stripTags(c.flavor),
			art: c.art
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	await mkdir(IMG_DIR, { recursive: true });
	await mkdir('static/data', { recursive: true });
	let downloaded = 0;
	const failed = [];
	const queue = [...cards];
	await Promise.all(
		Array.from({ length: 8 }, async () => {
			while (queue.length) {
				const card = queue.shift();
				const file = `${IMG_DIR}/${card.id}.webp`;
				if (await exists(file)) continue;
				try {
					const r = await fetch(card.art, { headers: { 'User-Agent': 'Mozilla/5.0 Draftnator' } });
					if (!r.ok) throw new Error(`HTTP ${r.status}`);
					const buf = Buffer.from(await r.arrayBuffer());
					await sharp(buf).resize(260, 260).webp({ quality: 80 }).toFile(file);
					downloaded++;
				} catch (e) {
					failed.push(`${card.name} (${e.message})`);
				}
			}
		})
	);

	const final = cards.filter((c) => !failed.some((f) => f.startsWith(c.name + ' ')));
	const out = final.map(({ art, ...c }) => c); // eslint-disable-line no-unused-vars
	await writeFile(DATA_FILE, JSON.stringify({ updated: new Date().toLocaleDateString('sv-SE'), cards: out }, null, '\t'));

	console.log(`${out.length} cartas salvas em ${DATA_FILE}. ${downloaded} imagens novas.`);
	if (failed.length) console.warn('Falharam (ficaram de fora):', failed);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});

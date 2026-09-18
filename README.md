# Draftnator

Drafts casuais de Marvel Snap. É um fork do [Marvel Snap Draftanator](https://github.com/hansenwebco/marvel-snap-draftanator), do stonedonkey, que foi abandonado.

- **Arena:** escolha uma entre três cartas, 12 vezes.
- **Sealed:** abra 5 pacotes de 5 cartas e monte um deck de 12 com o que saiu.

No fim, o site gera um código de deck pra importar no jogo. Cada draft é único, sem login.

## Rodar local

```bash
npm install
npm run dev
```

## Atualizar as cartas

```bash
npm run cards
```

Baixa a lista do [Marvel Snap Zone](https://marvelsnapzone.com) e salva em `static/data/cards.json`. Também baixa as imagens que faltam em `static/images/cards/`. Entram só as cartas colecionáveis lançadas: Series 1–5, iniciais, Recruit e Collection Level.

O Marvel Snap Zone às vezes demora pra marcar uma carta nova como lançada. Nesse caso, adicione o `carddefid` dela em `include` no arquivo [`scripts/card-overrides.json`](scripts/card-overrides.json). Pra tirar uma carta do draft, use `exclude`.

Depois é só commitar e dar push. A Vercel publica sozinha.

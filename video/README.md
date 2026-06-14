# Vídeos da GN Gelo (Remotion)

Vídeos promocionais da marca **GN Gelo** para o Instagram, criados com
[Remotion](https://www.remotion.dev) (vídeo feito com React).

Esta pasta é **independente** do sistema de gestão (o `index.html` na raiz não é
afetado).

## Pré-requisitos

- Node.js 18 ou superior instalado.

## Instalar

```bash
cd video
npm install
```

## Editar o conteúdo

Quase tudo que você vai querer mudar (textos, frase de impacto, diferenciais,
chamada final e @ do Instagram) está em **`src/content.ts`**. As cores da marca
ficam em `src/brand.ts`.

## Pré-visualizar (editor visual)

```bash
npm run dev
```

Abre o **Remotion Studio** no navegador, com timeline e preview em tempo real.
Lá você vê as duas composições:

- **PromoReel** — 1080×1920 (Reels e Stories)
- **PromoFeed** — 1080×1080 (Feed quadrado)

## Renderizar (gerar o MP4)

```bash
npm run build:reel   # gera out/gngelo-reel.mp4  (vertical 9:16)
npm run build:feed   # gera out/gngelo-feed.mp4  (quadrado 1:1)
npm run build:all    # gera os dois
```

Os arquivos saem na pasta `out/`. É só subir no Instagram.

## Estrutura

```
video/
├── public/             ← fotos e mídias (coloque a foto do produto aqui)
├── src/
│   ├── content.ts      ← textos + nome da foto (edite aqui)
│   ├── brand.ts        ← cores e fonte da marca
│   ├── Background.tsx   ← fundo dourado/preto
│   ├── ProductScene.tsx ← cena de foto do produto (zoom suave)
│   ├── PromoVideo.tsx   ← cenas e animações
│   ├── Root.tsx         ← define as composições (Reel + Feed)
│   └── index.ts
├── remotion.config.ts
├── package.json
└── tsconfig.json
```

## Fotos do produto

Há uma cena dedicada às fotos do produto (carrossel com zoom suave). Já vêm
duas fotos da marca em `public/`. Para trocar:

1. Copie a(s) foto(s) para `public/`.
2. Em `src/content.ts`, liste os nomes em `productPhotos`, ex:
   `productPhotos: ["embalagem-maracuja.jpg", "gelo-maracuja.jpg"]`.

Com a lista vazia (`[]`), a cena mostra um espaço reservado — o vídeo continua
renderizando.

## Próximos passos (ideias)

- Trocar o fundo por um **vídeo de fundo** (`<Video>`) ou foto do produto (`<Img>`).
- Adicionar **música** com `<Audio>` (atenção a direitos autorais no Instagram).
- Criar variações de campanha duplicando a composição no `Root.tsx`.

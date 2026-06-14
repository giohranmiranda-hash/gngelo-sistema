# Pasta de mídia (public/)

Coloque aqui as imagens/vídeos usados no projeto.

## Fotos do produto

Já vêm duas fotos da GN Gelo aqui: `embalagem-maracuja.jpg` e
`gelo-maracuja.jpg`.

Para trocar ou adicionar:

1. Copie a(s) foto(s) pra esta pasta (recomendado: vertical ou quadrada,
   pelo menos 1080px de largura).
2. Abra `../src/content.ts` e liste os nomes em `productPhotos`:

   ```ts
   productPhotos: ["embalagem-maracuja.jpg", "gelo-maracuja.jpg"],
   ```

3. Rode `npm run dev` pra ver no preview.

Com a lista vazia (`[]`), a cena mostra um espaço reservado.

// ─────────────────────────────────────────────────────────────
//  EDITE AQUI o texto do seu vídeo. Não precisa mexer no resto.
// ─────────────────────────────────────────────────────────────
export const content = {
  // Marca exibida na abertura
  brandTop: "GN",
  brandSubtitle: "GELO GOURMET",

  // Frase de impacto (cena principal)
  headline: ["Gelo que", "eleva", "o seu drink"],

  // Fotos do produto em destaque (carrossel com zoom suave).
  // Coloque os arquivos em `video/public/` e liste os nomes aqui.
  // Deixe a lista vazia ([]) para mostrar um espaço reservado.
  productPhotos: ["embalagem-maracuja.jpg", "gelo-maracuja.jpg"],
  productCaption: "Gelo para Drinks • Maracujá",

  // Diferenciais — aparecem um a um
  features: [
    "Cristalino e sem sabor",
    "Derrete devagar",
    "Feito sob encomenda",
  ],

  // Chamada final (call to action)
  ctaLine: "Peça o seu hoje",
  handle: "@gngelo",
} as const;

# Product

## Register

product

## Users

GN — dono(a) de um negócio de **gelo saborizado gourmet** (gelo/picolé saborizado artesanal). Usa o sistema majoritariamente **pelo celular**, no dia a dia corrido do negócio: registra vendas assim que acontecem, lança produção e compra de insumos, confere estoque e, no fim do dia/mês, olha o lucro. Não é uma pessoa técnica nem contábil — quer responder rápido "estou lucrando? quanto? com o quê?" sem montar planilha.

Tarefa primária por tela: **registrar** (venda, produção, gasto) em poucos toques, e **entender** (dashboard, DRE) sem precisar interpretar.

## Product Purpose

Sistema único de gestão do negócio, em **um único arquivo HTML** (offline-first / PWA, com sincronização opcional na nuvem via Supabase e isolamento por conta). Cobre vendas, produção, estoque e insumos com **custo real**, DRE e financeiro (operacional separado de investimentos), metas, contas a receber, comissões de vendedores, clientes e impressão de nota térmica (58/80mm).

Sucesso = o dono abre o app e **na hora** sabe se está lucrando, quanto, e de onde vem o custo — substituindo a planilha e o "achismo".

## Brand Personality

**Premium e artesanal.** Identidade dourado (#C9A84C) + preto + creme. Voz confiante, calorosa e direta, em português do Brasil — fala como quem entende do negócio, sem jargão corporativo. A sensação é a de um produto especial, feito à mão, em que se pode confiar. Premium não é frieza: é capricho no acabamento.

## Anti-references

- **Sistema corporativo frio** (o anti-modelo principal): cara de planilha/ERP, azul corporativo, tabelas cinzas, zero identidade. O app não pode parecer software genérico de escritório.
- App infantil / colorido demais (visual de brinquedo).
- Fast-food barato (vermelho/amarelo gritante, sensação de promoção descartável).
- O template de IA genérico (fundo creme + serifa + degradê em tudo). O dourado aqui é identidade real da marca, não enfeite — preservar a identidade vence, mas sem cair no clichê.

## Design Principles

1. **Identidade primeiro.** Toda tela respira a marca dourado/preto/creme. Se uma tela poderia ser de qualquer ERP, está errada.
2. **O número que decide vem na frente.** O dono abre e vê o lucro/saúde do mês imediatamente; o detalhe vem depois, não antes.
3. **Custo real, sempre.** Produção, venda e receita espelham o preço real dos insumos comprados — nada de estimativa solta que engana o lucro.
4. **Rápido no balcão.** Registrar venda/produção/gasto em poucos toques, no celular, com a mão ocupada.
5. **Confiável e sem perder dado.** Offline-first; a nuvem sincroniza sem sobrescrever e isola cada conta. Erro nunca é silencioso nem assustador.

## Accessibility & Inclusion

Padrão WCAG AA: contraste de texto ≥ 4.5:1 (≥ 3:1 para texto grande), alvos de toque confortáveis para uso no celular, layout responsivo mobile-first e `prefers-reduced-motion` respeitado. Sem necessidade específica além do padrão no momento; manter legibilidade boa em ambiente de uso variável (balcão, rua).

# Graph Report - .  (2026-06-19)

## Corpus Check
- Large corpus: 415 files · ~1,024,479 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 88 nodes · 75 edges · 23 communities (10 shown, 13 thin omitted)
- Extraction: 71% EXTRACTED · 28% INFERRED · 1% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.84)
- Token cost: 62,592 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Modelo de Dados gng_|Modelo de Dados gng_*]]
- [[_COMMUNITY_Manifest PWA|Manifest PWA]]
- [[_COMMUNITY_Custo Real & Insumos|Custo Real & Insumos]]
- [[_COMMUNITY_Estoque & FIFO de Lotes|Estoque & FIFO de Lotes]]
- [[_COMMUNITY_Proposito & Principios|Proposito & Principios]]
- [[_COMMUNITY_Identidade Visual (Toque de Ouro)|Identidade Visual (Toque de Ouro)]]
- [[_COMMUNITY_DRE  Financeiro|DRE / Financeiro]]
- [[_COMMUNITY_Producao & Logistica|Producao & Logistica]]
- [[_COMMUNITY_Nota Termica|Nota Termica]]
- [[_COMMUNITY_Assistente IA Local|Assistente IA Local]]
- [[_COMMUNITY_Comissoes|Comissoes]]
- [[_COMMUNITY_Service Worker  PWA Shell|Service Worker / PWA Shell]]
- [[_COMMUNITY_Graphify Workflow|Graphify Workflow]]
- [[_COMMUNITY_Calendario (antigo)|Calendario (antigo)]]
- [[_COMMUNITY_Fluxo de Caixa|Fluxo de Caixa]]
- [[_COMMUNITY_Receitas (antigo)|Receitas (antigo)]]
- [[_COMMUNITY_Backup Nuvem|Backup Nuvem]]
- [[_COMMUNITY_Calendario (premium)|Calendario (premium)]]
- [[_COMMUNITY_Clientes|Clientes]]
- [[_COMMUNITY_Metas|Metas]]
- [[_COMMUNITY_Receitas (premium)|Receitas (premium)]]
- [[_COMMUNITY_Relatorios|Relatorios]]
- [[_COMMUNITY_Vendas|Vendas]]

## God Nodes (most connected - your core abstractions)
1. `Modelo de dados localStorage gng_*` - 13 edges
2. `Propósito: sistema único de gestão GN Gelo` - 4 edges
3. `Custo real médio ponderado dos insumos comprados` - 4 edges
4. `salvarVenda — baixa estoque + FIFO (premium)` - 4 edges
5. `salvarProducao — custo real + baixa insumos (premium)` - 4 edges
6. `Paleta ouro/preto/creme` - 3 edges
7. `Rápido no balcão (mobile-first, poucos toques)` - 3 edges
8. `REGRAS §4 — Ordem do DRE do mês` - 3 edges
9. `REGRAS §8 — Baixa de estoque na venda` - 3 edges
10. `gng_estoque (estoque de picolés prontos)` - 3 edges

## Surprising Connections (you probably didn't know these)
- `renderIA — assistente IA local (premium)` --semantically_similar_to--> `renderDashboard (index.html)`  [AMBIGUOUS] [semantically similar]
  preview-dashboard-premium.html → index.html
- `renderFinanceiro — DRE (premium)` --semantically_similar_to--> `renderDRE (index.html)`  [INFERRED] [semantically similar]
  preview-dashboard-premium.html → index.html
- `renderEstoque (premium)` --semantically_similar_to--> `renderEst — estoque (index.html)`  [INFERRED] [semantically similar]
  preview-dashboard-premium.html → index.html
- `renderComissoes (premium)` --semantically_similar_to--> `renderComissoes (index.html)`  [INFERRED] [semantically similar]
  preview-dashboard-premium.html → index.html
- `custoSabor — custo real por sabor (premium)` --semantically_similar_to--> `custoUnidSabor — custo real por sabor (index.html)`  [INFERRED] [semantically similar]
  preview-dashboard-premium.html → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fluxo de venda: baixa de estoque + FIFO + reversão** — preview_dashboard_premium_salvarvenda, preview_dashboard_premium_delvenda, concept_fifo_lotes, data_gng_estoque, regras_baixa_de_estoque_na_venda [EXTRACTED 0.85]
- **Fluxo de produção: custo real + baixa de insumos** — preview_dashboard_premium_salvarproducao, preview_dashboard_premium_custosabor, concept_custo_real_ponderado, data_gng_insumoest, regras_baixa_de_insumos [EXTRACTED 0.85]
- **DRE: ordem do resultado do mês** — regras_dre_ordem, regras_marketing_linha_propria, preview_dashboard_premium_renderfinanceiro, index_renderdre [INFERRED 0.85]

## Communities (23 total, 13 thin omitted)

### Community 0 - "Modelo de Dados gng_*"
Cohesion: 0.18
Nodes (12): gng_clientes (clientes), gng_entregas / gng_agendamentos (logística), gng_gastos (gastos/despesas), gng_metas / gng_metasAnuais (metas), gng_producoes (produções/lotes), gng_vendas (vendas), gng_vendedores / gng_comissoes (comissões), Modelo de dados localStorage gng_* (+4 more)

### Community 1 - "Manifest PWA"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 2 - "Custo Real & Insumos"
Cohesion: 0.25
Nodes (9): Custo real médio ponderado dos insumos comprados, gng_insumoEst (estoque de insumos), custoUnidSabor — custo real por sabor (index.html), renderDREInsumos (index.html), custoSabor — custo real por sabor (premium), recIns — receita->qtd insumo por gelo (premium), renderInsumos — baixa automática (premium), salvarProducao — custo real + baixa insumos (premium) (+1 more)

### Community 3 - "Estoque & FIFO de Lotes"
Cohesion: 0.28
Nodes (9): FIFO de lotes (vende os mais antigos primeiro), gng_estoque (estoque de picolés prontos), gng_lotes (lotes FIFO), deletarVenda — reverte baixa FIFO (index.html), renderEst — estoque (index.html), delVenda — reverte baixa de estoque (premium), renderEstoque (premium), salvarVenda — baixa estoque + FIFO (premium) (+1 more)

### Community 4 - "Proposito & Principios"
Cohesion: 0.25
Nodes (8): Anti-referência: software corporativo frio, abrirVendaRapida — venda rápida (index.html), nuvemBaixar — sync Supabase (premium), Custo real, sempre, Rápido no balcão (mobile-first, poucos toques), Offline-first / PWA com Supabase opcional, Persona GN (dono de gelo saborizado gourmet), Propósito: sistema único de gestão GN Gelo

### Community 5 - "Identidade Visual (Toque de Ouro)"
Cohesion: 0.25
Nodes (8): Anti-referência: template de IA genérico, Herói do Dashboard (painel preto, lucro do mês), Cartão Métrica (componente assinatura), Paleta ouro/preto/creme, Regra do Plano em Repouso (elevation), Regra do Toque de Ouro (ouro <=15% da tela), Regra dos Dois Destaques (Space Grotesk / Georgia), O Toque de Ouro (creative north star)

### Community 6 - "DRE / Financeiro"
Cohesion: 0.50
Nodes (5): renderDRE (index.html), renderFinanceiro — DRE (premium), REGRAS §4 — Ordem do DRE do mês, Honestidade: mês no vermelho mostra no vermelho, DRE: Marketing em linha própria

### Community 7 - "Producao & Logistica"
Cohesion: 0.50
Nodes (4): avancarLote — fases de produção (premium), renderLogistica — mapa de rotas (premium), renderProducao — lotes/fases/ordens (premium), REGRAS §9 — Novos recursos (mapa, equipe, etapas, ordens, notificações)

### Community 8 - "Nota Termica"
Cohesion: 1.00
Nodes (3): Nota térmica (impressão 58/80mm), imprimirNota — nota térmica (index.html), imprimirVenda — nota térmica (premium)

### Community 9 - "Assistente IA Local"
Cohesion: 0.67
Nodes (3): renderDashboard (index.html), renderIA — assistente IA local (premium), REGRAS §5 — Assistente IA calculado localmente

## Ambiguous Edges - Review These
- `renderDashboard (index.html)` → `renderIA — assistente IA local (premium)`  [AMBIGUOUS]
  preview-dashboard-premium.html · relation: semantically_similar_to

## Knowledge Gaps
- **43 isolated node(s):** `name`, `short_name`, `description`, `start_url`, `scope` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `renderDashboard (index.html)` and `renderIA — assistente IA local (premium)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `Modelo de dados localStorage gng_*` connect `Modelo de Dados gng_*` to `Custo Real & Insumos`, `Estoque & FIFO de Lotes`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `gng_insumoEst (estoque de insumos)` connect `Custo Real & Insumos` to `Modelo de Dados gng_*`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `salvarVenda — baixa estoque + FIFO (premium)` (e.g. with `gng_lotes (lotes FIFO)` and `REGRAS §8 — Baixa de estoque na venda`) actually correct?**
  _`salvarVenda — baixa estoque + FIFO (premium)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `description` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
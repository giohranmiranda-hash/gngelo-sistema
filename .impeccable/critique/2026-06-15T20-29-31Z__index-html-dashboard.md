---
target: dashboard
total_score: 32
p0_count: 0
p1_count: 0
timestamp: 2026-06-15T20-29-31Z
slug: index-html-dashboard
---
# Critique — Dashboard (GN Gelo) — pós-melhorias

## Design Health Score

| # | Heurística | Nota | Mudança | Ponto-chave |
|---|-----------|------|---------|-------------|
| 1 | Visibilidade de status | 3 | = | Alertas, delta, meta, "Recebi" |
| 2 | Linguagem do mundo real | 4 | = | Português do dono, termos do negócio |
| 3 | Controle e liberdade | 3 | = | Filtros + toggle; collapse dá controle |
| 4 | Consistência | 4 | ↑ | Faixas laterais eliminadas; sistema coeso |
| 5 | Prevenção de erro | 3 | = | Validações nos formulários |
| 6 | Reconhecer > lembrar | 3 | = | Tudo visível; "Análises" rotulado |
| 7 | Flexibilidade | 3 | = | FAB Venda Rápida; sem atalhos (mobile) |
| 8 | Estético/minimalista | 4 | ↑ | Herói sólido + collapse cortou o "muro" |
| 9 | Recuperação de erro | 3 | = | Mensagens claras pt-BR |
| 10 | Ajuda/documentação | 2 | = | Sem ajuda contextual/onboarding |
| **Total** | | **32/40** | **+2** | **Bom (Good)** |

## Anti-Patterns Verdict
**LLM:** Agora passa no teste de slop — identidade dourado/preto/creme específica, herói sólido, dashboard enxuto. Não dá pra dizer "feito por IA" de cara.
**Detector:** 14 → **4**, todos menores/intencionais: layout-transition (barra de progresso), dark-glow (glow do logo na splash — proposital no DESIGN.md), broken-image (img de preview com display:none até subir logo — falso positivo), em-dash-overuse.

## O que melhorou
- **Faixas border-left:** 9 → 0. Era o P1 e o tell de IA nº1.
- **Gradient-text do herói:** removido; ouro sólido.
- **Comprimento:** −973px (~33%) por padrão; 6 análises atrás de "Análises detalhadas".

## Issues restantes
- **[P2] Ajuda/onboarding ausente (nota 2).** Sem estados vazios guiados nem primeira-vez. → `/impeccable onboard`
- **[P3] Ruídos menores** (transição de largura, glow, em-dash). Maioria proposital. → `/impeccable polish`

## Persona Red Flags
**Casey (dono no celular):** muito melhor — bate o olho, vê lucro/KPIs/meta/receber e fecha; detalhe fica a um toque.
**Sam (acessibilidade):** conferir contraste do texto translúcido do herói (branco .78 sobre preto = ok) e do esmaecido sobre creme.

## Questions to Consider
- Vale um onboarding/estado-vazio para o primeiro uso (quando não há vendas)?
- O `<summary>` "Análises detalhadas" deveria lembrar o último estado (aberto/fechado)?

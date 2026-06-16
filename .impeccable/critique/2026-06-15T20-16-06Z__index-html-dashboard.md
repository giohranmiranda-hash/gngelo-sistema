---
target: dashboard
total_score: 30
p0_count: 0
p1_count: 1
timestamp: 2026-06-15T20-16-06Z
slug: index-html-dashboard
---
# Critique — Dashboard (GN Gelo)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Bons sinais (alertas, delta vs mês, meta, "Recebi"); faltam estados de carregamento |
| 2 | Match System / Real World | 4 | Português do dono, termos do negócio (Faturamento, Ticket, DRE) |
| 3 | User Control and Freedom | 3 | Filtros de período e toggle "Recebi"; sem desfazer explícito (baixo risco) |
| 4 | Consistency and Standards | 3 | Coeso após redesign, mas faixas border-left legadas quebram o padrão |
| 5 | Error Prevention | 3 | Validações nos formulários; no dashboard há pouco a errar |
| 6 | Recognition Rather Than Recall | 3 | Tudo visível; bottom-nav só ícone em alguns pontos |
| 7 | Flexibility and Efficiency | 3 | FAB Venda Rápida + presets de período; sem atalhos de teclado (é mobile) |
| 8 | Aesthetic and Minimalist | 3 | Herói forte, mas dashboard muito longo: 10+ blocos empilhados |
| 9 | Error Recovery | 3 | Mensagens claras em pt-BR com o problema específico |
| 10 | Help and Documentation | 2 | Sem ajuda contextual/onboarding na primeira vez |
| **Total** | | **30/40** | **Bom (Good)** |

## Anti-Patterns Verdict

**LLM:** Depois do redesign NÃO grita "feito por IA" — ouro/preto/creme com numeral serifado e herói preto tem identidade real e específica. O que ainda denuncia: faixas coloridas border-left (side-stripe), o tell de IA mais reconhecível.

**Detector:** 14 achados — side-tab ×9 (faixa colorida na lateral de cartões; o pior é o cartão "Contas a receber" do dashboard, `border-left:3px var(--warning)`), gradient-text ×1 (o número do herói — exceção que documentamos), dark-glow ×1, em-dash-overuse ×1, broken-image ×1, layout-transition ×1.

## Priority Issues

- **[P1] Faixas border-left coloridas (×9).** O tell de IA nº1 e proibido no DESIGN.md. No dashboard está no cartão "Contas a receber". **Fix:** trocar por borda completa, fundo tonal sutil ou ícone à esquerda. → `/impeccable quieter`
- **[P2] Dashboard longo demais (carga cognitiva).** Herói + 4 métricas + meta + receber + 4 gráficos + ranking + insumos + gauge + top vendedor + comparação = 12+ blocos num scroll. Miller's Law (≤4) estourado. **Fix:** agrupar/colapsar o secundário, progressive disclosure. → `/impeccable layout`
- **[P2] Gradient-text no herói.** Documentado como exceção única, mas é flag. Decisão: manter como assinatura (permitido 1×) ou trocar por cor sólida dourada. → `/impeccable polish`
- **[P3] Ruídos menores:** dark-glow, em-dash em excesso, broken-image, transição de layout. → `/impeccable polish`

## Persona Red Flags

**Casey (dono no celular, balcão):** herói no topo é ótimo, mas o scroll é muito longo para "bater o olho e fechar"; o número que decide aparece, o resto compete. Alvos de toque OK.
**Sam (acessibilidade):** status usa cor + seta ▲▼ (bom, não é só cor); conferir contraste do esmaecido #6F6A60 sobre creme e o texto translúcido do herói (rgba branco .78) — pode ficar < 4.5:1.

## Minor Observations
- O herói e os 4 cards ficaram alinhados ao mockup; bom ganho de identidade.
- Charts têm aria-label — ponto positivo de acessibilidade.

## Questions to Consider
- O dashboard precisa mostrar TUDO de uma vez, ou os gráficos secundários podem ficar atrás de um "ver mais"?
- A faixa lateral pode virar um ícone dourado + borda completa, mantendo o significado sem o tell?

---
name: design-system
description: Sistema de design da GN Gelo (identidade dourado/preto premium). Use SEMPRE que for criar, alterar ou revisar telas, cards, botões, gráficos ou qualquer elemento visual do index.html — para manter consistência de cores, espaçamento, tipografia e componentes.
---

# GN Gelo — Design System

Identidade: **gestão premium, sóbria, dourado + preto sobre fundo creme**. Mobile-first.
Tudo vive em `index.html` (CSS no `<style>`, tokens em `:root`).

## 1. Tokens de cor (use SEMPRE as variáveis, nunca hex solto)

| Variável | Hex | Uso |
|---|---|---|
| `--gold` | #C9A84C | Cor de marca, destaques, valores principais, abas ativas |
| `--gold2` | #E8C97A | Gradientes/realces dourados |
| `--gold-light` | #FDF8EE | Fundo de blocos sutis |
| `--gold-border` | #E0C06A | Bordas douradas |
| `--black` | #0A0A0A | Nav, texto forte, fundo da logo |
| `--bg` | #F5F5F0 | Fundo da aplicação (creme) |
| `--surface` | #FFFFFF | Fundo de cards |
| `--text` | #0A0A0A | Texto padrão |
| `--muted` | #6B6B6B | Texto secundário/legendas |
| `--border` | #E8E4DC | Bordas neutras / divisórias |
| `--success` / `--success-bg` | #15803D / #F0FDF4 | Lucro, positivo, "recebido" |
| `--danger` / `--danger-bg` | #B91C1C / #FEF2F2 | Gastos, negativo, deletar |
| `--warning` / `--warning-bg` | #92400E / #FFFBEB | Alertas, "a receber", pendências |

### REGRA DE OURO de cor
- A paleta é **dourado + preto + creme**, com verde/vermelho/âmbar **apenas** para semântica financeira (lucro/gasto/alerta).
- **NÃO** introduzir cores fora da paleta (ex.: teal `#4ECDC4`, gradientes laranja/rosa). Elas quebram a identidade premium. Se um card antigo usa essas cores, prefira migrar para dourado/âmbar.
- Gráficos: barras/áreas em `--gold` (rgba 201,168,76,.8); séries semânticas em verde (lucro) e vermelho (gasto). Doughnut de sabores usa o mapa `CC`.

## 2. Tipografia
- Fonte: system stack (`-apple-system, Segoe UI, Roboto, sans-serif`). Não adicionar webfonts.
- Hierarquia: título de tela `.page-header h2` (~20px bold); rótulo de seção `.section-label` (12px, maiúsculas, `letter-spacing:.06em`, muted); valor de KPI `.metric .val` (grande, bold). Legendas em 10–11px `--muted`.
- Moeda **sempre** via `R(valor)` → "R$ 1.234,56". Percentual via `P(valor)` → "12,3%".

## 3. Espaçamento e layout
- Tela: `.screen` com `padding:14px` (mobile) / `28px 40px` (desktop ≥1024px), `max-width:600px` mobile.
- Respiro entre cards: ~12–16px. Padding interno de card: 12–16px.
- Grids: `.metric-grid` (KPIs), `.grid-cards` (auto-fit minmax 280px no desktop), `.form-row` (1 col mobile → 2 col desktop).
- Cantos: `border-radius` 6–8px em cards/inputs/botões.

## 4. Componentes (reutilize — não recrie)
- **Card**: `<div class="card">` (use `card-gold` para destaque dourado). Título interno: `<div class="section-label">`.
- **KPI**: dentro de `.metric-grid` → `.metric` com `.lbl`, `.val` (`.gold`/`.green`/`.red`), `.sub`.
- **Botões**: `.btn` base; `.btn-primary` (preto), `.btn-gold` (dourado), `.btn-full` (largura total), `.btn-sm`, `.btn-danger`. Ícone Tabler `<i class="ti ti-...">`.
- **Badge**: `.badge` + `b-gold`/`b-green`/`b-red` (só essas 3 existem — não invente classes; para outras cores use style inline com as variáveis).
- **Chips de sabor**: `<span class="fl fl-coco">` (mapa `SC`). Nome via `SB[k]`.
- **Linhas de DRE**: `.dre-sec` (cabeçalho de seção), `.dre-row`, `.dre-total`, `.dre-pos`/`.dre-neg`.
- **Item de lista**: `.item-card`.
- **Progresso/meta**: `.progress` + `.progress-fill`.
- **Alertas**: `.alert` + `a-danger`/`a-warn`.

## 5. Gráficos (Chart.js)
- Sempre destruir a instância antiga antes de recriar (`if(cX)cX.destroy()`).
- `responsive:true, maintainAspectRatio:false` dentro de `.chart-wrap`.
- Tooltip de dinheiro: usar o helper `_tipBRL`. Eixo Y: `callback:v=>"R$"+v`.
- Datalabels: registrados, mas `display:false` por padrão — ative só onde fizer sentido.
- Fonte do gráfico: `Chart.defaults.font.family` já configurado; cor `#6B6B6B`.

## 6. Acessibilidade & robustez visual
- Não bloquear zoom (viewport sem `maximum-scale`).
- `canvas` de gráfico deve ter `role="img"` + `aria-label` + texto fallback.
- Como Chart.js e os ícones Tabler vêm de CDN, prever degradação: se o ícone não carregar, o layout não pode "quebrar". Evite depender do ícone para entender a ação (use também texto no botão).
- Toda cor de status deve ter contraste suficiente sobre `--surface`/`--bg`.

## 7. Checklist antes de finalizar uma mudança visual
1. Usei variáveis de cor (sem hex fora da paleta)?
2. Reaproveitei `.card`/`.btn`/`.metric`/`.badge` em vez de criar estilo novo?
3. Moeda com `R()` e % com `P()`?
4. Funciona em 390px (mobile) e ≥1024px (desktop)?
5. Tirei screenshot (navegador headless 390px) e comparei antes/depois?

> Para auditar visualmente: renderizar `index.html` no Chromium (Playwright), `nav()` em cada tela e `screenshot({fullPage:true})`. Os gráficos/ícones podem aparecer vazios offline (CDN) — avaliar layout/cores/espaçamento mesmo assim.

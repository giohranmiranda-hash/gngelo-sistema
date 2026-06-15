---
name: GN Gelo
description: Gestão premium para um negócio de gelo saborizado — ouro, preto e creme.
colors:
  gold: "#C9A84C"
  gold-bright: "#E8C97A"
  gold-deep: "#A8852F"
  gold-tint: "#FBF6EA"
  gold-border: "#E2D2A6"
  ink: "#0E0E10"
  ink-soft: "#1A1A1E"
  cream-bg: "#F6F3EC"
  surface: "#FFFFFF"
  text: "#0A0A0A"
  muted: "#6F6A60"
  border: "#ECE6D8"
  danger: "#B91C1C"
  danger-bg: "#FEF2F2"
  success: "#15803D"
  success-bg: "#F0FDF4"
  warning: "#92400E"
  warning-bg: "#FFFBEB"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "18px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "14px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.gold-bright}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "14px 16px"
  metric:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "15px 14px"
  badge-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "3px 11px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "9px 11px"
---

# Design System: GN Gelo

## 1. Overview

**Creative North Star: "O Toque de Ouro"**

GN Gelo vende um gelo saborizado premium — o ingrediente dourado que transforma uma bebida comum em algo especial. O sistema de design faz com a gestão o que o produto faz com a bebida: pega o que normalmente é frio e burocrático (números, lançamentos, estoque) e dá a ele um toque de ouro. Fundo creme quente, preto profundo de assinatura e um ouro real que aparece com intenção, nunca espalhado. O número que importa — o lucro do mês — recebe tratamento de joia: serifa, gradiente dourado, em destaque sobre um painel preto.

A densidade é confortável para o polegar: este é um app usado de pé, no balcão ou na rua, registrando uma venda enquanto a outra mão está ocupada. Cartões respiram, alvos de toque são generosos, a hierarquia leva o olho direto ao essencial. O que o sistema rejeita explicitamente é o **software corporativo frio**: nada de azul de ERP, tabelas cinzas densas, ou aquela cara de planilha que não tem dono. Também recusa o **template de IA genérico** (creme + serifa + degradê em tudo) — aqui o ouro é a identidade real da marca, aplicado com disciplina, não um enfeite reflexo.

**Key Characteristics:**
- Ouro como evento, não como tinta de fundo — aparece em ≤15% de cada tela.
- Serifa (Georgia) reservada a números e títulos; o resto é sans neutra e legível.
- Preto profundo (#0E0E10) carrega a navegação e o herói; é a moldura, não o corpo.
- Superfícies planas com fio de sombra; relevo é resposta a estado, não decoração.
- Mobile-first: feito para o polegar, no balcão, com pressa.

## 2. Colors

Uma paleta de três vozes — ouro, preto e creme — onde o ouro fala pouco e por isso é ouvido.

### Primary
- **Ouro GN** (#C9A84C): a cor da marca. Usada em acentos de destaque — barra ativa, ícones de navegação, preenchimento de progresso, foco. É o "toque de ouro": presente em pouca área, sempre com propósito.
- **Ouro Claro** (#E8C97A): topo dos gradientes dourados (botões, selos) e o número do herói. Dá a sensação de luz batendo no metal.
- **Ouro Profundo** (#A8852F): ouro para texto sobre fundo claro (ex. valor "Custo/un"), onde o ouro-marca não teria contraste suficiente.

### Secondary
- **Preto Assinatura** (#0E0E10): fundo da barra de navegação, do bottom-nav e do painel-herói. É a moldura escura que faz o ouro brilhar; nunca o fundo do conteúdo.
- **Preto Suave** (#1A1A1E): topo do gradiente do herói, para dar profundidade ao painel preto.

### Neutral
- **Creme Quente** (#F6F3EC): o fundo do app. Quente o bastante para não ser clínico, neutro o bastante para deixar o ouro ser a estrela.
- **Superfície** (#FFFFFF): cartões, campos e métricas — o branco que segura o conteúdo sobre o creme.
- **Tinta** (#0A0A0A): texto principal. Quase preto, alto contraste.
- **Esmaecido** (#6F6A60): rótulos, legendas, texto secundário. Tom terroso, nunca cinza-gelo lavado.
- **Borda** (#ECE6D8): fios de 1px entre superfícies; divisores quentes, não cinzas.
- **Tinta Dourada** (#FBF6EA) e **Borda Dourada** (#E2D2A6): fundo e contorno de elementos "card-gold" e do selo de meta.

### Status
- **Sucesso** (#15803D / fundo #F0FDF4): lucro, margem saudável, variação positiva.
- **Perigo** (#B91C1C / fundo #FEF2F2): gastos, prejuízo, alertas críticos, contador do sino.
- **Atenção** (#92400E / fundo #FFFBEB): estoque baixo, contas a receber, avisos.

### Named Rules
**A Regra do Toque de Ouro.** O ouro (#C9A84C / #E8C97A) cobre no máximo ~15% de qualquer tela. Sua raridade é o ponto: aplicado em acento, número-chave e moldura — nunca como fundo de conteúdo nem em blocos grandes. Se a tela parece "dourada demais", tire ouro até sobrar só o que importa.

## 3. Typography

**Display Font:** Georgia (com 'Times New Roman', serif)
**Body Font:** Pilha de sistema (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)

**Character:** Um par por eixo de contraste — serifa editorial para o que tem valor (números, títulos), sans neutra de sistema para o trabalho do dia a dia. A serifa dá ao dinheiro um ar de coisa séria e feita à mão; a sans some de vista e deixa registrar rápido.

### Hierarchy
- **Display** (serif, 23px, line-height 1.05, letter-spacing -0.005em): valores de métrica, totais do DRE, o "big-num". O número como joia.
- **Headline** (serif, 600, ~28px, letter-spacing -0.01em): títulos de tela (`.page-header h2`, "Dashboard", "DRE — Junho de 2026").
- **Body** (sans, 14px, line-height 1.5): texto de interface, itens de lista, conteúdo de formulário.
- **Label** (sans, 700, 10–12px, letter-spacing 0.12em, MAIÚSCULAS): rótulos de campo, rótulos de métrica, abas, section-labels. Tracking largo é a assinatura tipográfica do sistema.

### Named Rules
**A Regra da Serifa Reservada.** Georgia é exclusiva de números e títulos. Nunca corpo de texto, nunca rótulo, nunca botão. Quando a serifa aparece, é porque aquilo vale dinheiro ou nomeia a tela.

## 4. Elevation

Sistema plano por padrão, com fios de sombra. As superfícies vivem sobre o creme separadas por borda de 1px (#ECE6D8) e uma sombra quase imperceptível — o suficiente para destacar do fundo sem peso. Profundidade real só aparece em dois lugares com propósito: o painel-herói (preto, que recua o conteúdo ao fundo) e o botão flutuante de venda rápida (halo dourado que pede o toque). Nada de sombras dramáticas de 2014.

### Shadow Vocabulary
- **Fio de cartão** (`box-shadow: 0 1px 2px rgba(20,16,8,.04)`): cartões e métricas em repouso. Apenas separa da superfície.
- **Halo de ação** (`box-shadow: 0 6px 18px rgba(201,168,76,.35)`): exclusivo do botão "Venda Rápida". O ouro vira luz para chamar o dedo.

### Named Rules
**A Regra do Plano em Repouso.** Superfícies são planas paradas. Sombra é resposta a estado (hover, foco) ou marca de um único elemento de ação — nunca decoração distribuída.

## 5. Components

### Buttons
- **Shape:** cantos suaves de 12px (`{rounded.md}`).
- **Primary:** fundo preto assinatura (#0E0E10), texto ouro claro (#E8C97A), padding 10px 20px. O botão escuro com letra dourada é a ação principal.
- **Gold:** gradiente vertical de ouro claro para ouro (#E8C97A → #C9A84C), texto quase-preto. Para a ação mais desejada (confirmar venda, selo).
- **Ghost / Secondary:** superfície branca, borda quente, texto tinta. Ações de apoio (Editar, Nota).
- **Hover / Focus:** transição suave de opacidade/elevação; foco visível sempre.

### Cards / Containers
- **Corner Style:** 18px (`{rounded.xl}`) nos cartões; 16px nas métricas.
- **Background:** superfície branca; variante **card-gold** usa gradiente creme (#FFFDF6 → #FFFFFF) com borda dourada (#E2D2A6) para destacar metas e seções especiais.
- **Shadow Strategy:** fio de cartão (ver Elevation). Plano por padrão.
- **Border:** 1px #ECE6D8.
- **Internal Padding:** 14–16px.

### Inputs / Fields
- **Style:** superfície branca, borda 1px #ECE6D8, raio 8px (`{rounded.sm}`), texto 14px.
- **Focus:** realce de borda dourada; rótulo em label MAIÚSCULA esmaecida acima do campo.

### Navigation
- **Top nav:** fundo preto (#0E0E10), borda inferior com fio dourado translúcido, logo circular com aro de ouro, ícones em ouro claro, sino de alerta com contador vermelho.
- **Bottom nav:** preto, 4 itens (Início · Venda · Estoque · Financeiro), item ativo em ouro claro (#E8C97A). "Mais" abre gaveta lateral.

### Métrica (signature)
Cartão branco, raio 16px, com rótulo MAIÚSCULO esmaecido + valor em serifa grande (23px). Variantes de valor coloridas por papel: ouro-profundo (faturamento/custo), verde (lucro/margem), vermelho (gastos). É o tijolo do dashboard.

### Herói do Dashboard (signature)
Painel preto com gradiente (#16151A → #0E0E10), fio dourado no topo, rótulo MAIÚSCULO em ouro translúcido, e o **lucro do mês** em serifa de 40px com gradiente dourado (#FFF → #E8C97A). Abaixo, uma linha de Faturamento · Vendido · Ticket e a variação vs. mês anterior. É a única tela onde o texto-gradiente é permitido — o número-joia sobre a moldura preta.

## 6. Do's and Don'ts

### Do:
- **Do** tratar o ouro como evento: acento, número-chave, moldura — ≤15% da tela (A Regra do Toque de Ouro).
- **Do** reservar a serifa Georgia para números e títulos; o resto é a sans de sistema.
- **Do** manter superfícies planas sobre o creme, separadas por fio de 1px #ECE6D8 e sombra quase nula.
- **Do** colocar o número que decide (lucro do mês) na frente e em destaque, no painel-herói preto.
- **Do** usar verde (#15803D) para ganho, vermelho (#B91C1C) para gasto/prejuízo, âmbar (#92400E) para avisos — sempre os mesmos papéis.
- **Do** desenhar para o polegar: alvos de toque generosos, mobile-first.

### Don't:
- **Don't** deixar o app parecer **sistema corporativo frio**: nada de azul de ERP, tabelas cinzas densas ou cara de planilha sem dono.
- **Don't** cair no **template de IA genérico** (creme + serifa + degradê em tudo). O ouro é identidade real, aplicado com disciplina.
- **Don't** usar texto-gradiente (`background-clip:text`) em lugar nenhum além do número-joia do herói. Em todo o resto, ênfase é por peso/tamanho, cor sólida.
- **Don't** banhar blocos grandes de ouro nem usar ouro como fundo de conteúdo — mata a raridade que dá o brilho.
- **Don't** usar cinza-gelo lavado em texto secundário; o esmaecido é terroso (#6F6A60) com contraste ≥4.5:1.
- **Don't** trazer de volta sombras pesadas de 2014; profundidade é o painel-herói e o halo do botão de venda, nada mais.

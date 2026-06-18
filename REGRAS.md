# Regras do sistema — GN Gelo

Decisões combinadas para guiar a evolução do sistema (`index.html`) e a integração
do novo visual "Premium Industrial".

## 1. Visual / Identidade
- Aproveitar **apenas o visual** do app gerado no Google AI Studio (`gn-gelo-erp`) —
  o estilo **Premium Industrial** (preto obsidiana + dourado).
- **Não** usar a parte falsa daquele app: nem a "IA" simulada, nem os dados fictícios.
- Manter a **identidade real da GN Gelo** (dourado/preto/creme, gelo gourmet saborizado).
- **Responsivo**: funcionar bem no celular e no computador.

## 2. Dados
- Ler sempre dos **dados reais** (mesmo armazenamento do sistema: chaves `gng_*`).
- Os números na tela são os meus de verdade, atualizando conforme eu registro.
- **Funcionar offline** (fontes e gráficos embutidos, sem depender de internet).

## 3. Telas (no mesmo visual)
- Início (dashboard), Vendas, Estoque, Financeiro, Produção, Clientes, Assistente IA.

## 4. DRE (Financeiro)
Ordem do resultado do mês:
1. Faturamento
2. (–) Impostos / taxas / frete
3. (=) Receita líquida
4. (–) Custo de produção (custo real dos insumos)
5. (=) Lucro das vendas
6. **(–) Marketing** *(linha própria, separada dos demais custos fixos)*
7. (–) Outros custos fixos
8. (=) Resultado operacional

## 5. Assistente IA
- Por enquanto, **calcular os sinais localmente** a partir dos meus dados
  (sabor campeão, estoque baixo, resultado do mês) — **sem enviar nada para fora**.
- Futuro opcional: ligar a Gemini de verdade.

## 6. Princípios gerais
- **Custo real, sempre** — nada de estimativa que engana o lucro.
- **Honestidade**: se o mês está no vermelho, mostrar no vermelho.
- Erro nunca é silencioso nem assustador.

## 7. Baixa de insumos (matéria-prima)
- Insumos (base, glicose, açúcar, xantana, embalagem) baixam **somente na produção** —
  cada lote consome os insumos pela receita.
- A **venda não baixa insumo**.
- Assim o custo do insumo entra **uma única vez**, preservando o custo real.

## 8. Baixa de estoque na venda
- Ao registrar uma **venda**, descontar **na hora** a quantidade vendida do
  **estoque de picolés prontos** (do sabor vendido).
- Se a venda for apagada/cancelada, o estoque **volta**.
- Estoque nunca fica negativo silenciosamente — se faltar, avisar.

## 9. Novos recursos a acrescentar (inspirados no app do AI Studio)

Recursos que o app do AI Studio (`gn-gelo-erp`) mostrou e que o sistema ainda
não tem. Aqui devem ser construídos **de verdade** (não só a tela), seguindo as
regras acima (dados reais, custo real, offline, identidade GN Gelo).

1. **Mapa / monitoramento de rotas (GPS)**
   Tela de logística com mapa mostrando as entregas "Em rota" ao vivo.
   O sistema já tem agendamento, frete e calendário — falta o mapa.

2. **Equipe com permissões**
   Cadastro de integrantes com papéis (Gerente / Analista / Operador) e opção de
   "bloquear acesso". Hoje é um login por conta, sem níveis de permissão.

3. **Acompanhamento de produção em etapas**
   "Lotes em andamento" passando por fases (Preparo → Maturação → Resfriamento).
   Hoje o sistema registra o lote pronto com custo, mas não acompanha o passo a
   passo da fabricação.

4. **Ordens de produção (fila com prioridade)**
   Planejar o que vai produzir, com prioridade ALTA/MÉDIA e status
   Iniciado / Em produção / Concluído. Hoje só registra a produção já feita.

5. **Notificações configuráveis**
   Tela para ligar/desligar tipos de aviso. Já existe o sino de alertas, falta a
   configuração.


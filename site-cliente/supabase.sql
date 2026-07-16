-- =====================================================================
--  GN Gelo — Site de Pedidos do Cliente
--  SQL da tabela `pedidos` + Row Level Security (RLS)
--  Rode este script no Supabase → SQL Editor (projeto wuqymzfzkxnxnddnrefa)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabela `pedidos`
-- ---------------------------------------------------------------------
create table if not exists public.pedidos (
  id             uuid primary key default gen_random_uuid(),
  criado_em      timestamptz     not null default now(),

  -- Dados do cliente
  cliente        text,
  whatsapp       text,
  endereco       text,
  cep            text,

  -- Geolocalização (para roteirizar a entrega)
  lat            float8,
  lng            float8,

  -- Entrega
  data_desejada  date,
  obs            text,

  -- Itens do pedido — array de objetos:
  --   [{ "sabor": "coco", "nome": "Coco", "qtd": 10, "preco": 1.10 }, ...]
  itens          jsonb           not null default '[]'::jsonb,

  -- Totais
  total          numeric(10,2)   not null default 0,
  qtd_total      int             not null default 0,

  -- Fluxo: novo → aceito | recusado → entregue
  status         text            not null default 'novo',

  -- Loja dona (fixo por enquanto)
  loja           text            not null default 'gngelo'
);

-- Índice para a caixa "Pedidos recebidos" (busca por loja + status + data)
create index if not exists pedidos_loja_status_idx
  on public.pedidos (loja, status, criado_em desc);

-- Garante que o status só assume valores válidos (mesmo vindo do painel)
alter table public.pedidos
  drop constraint if exists pedidos_status_check;
alter table public.pedidos
  add  constraint pedidos_status_check
  check (status in ('novo','aceito','recusado','entregue'));


-- ---------------------------------------------------------------------
-- 2) Ativar Row Level Security
-- ---------------------------------------------------------------------
alter table public.pedidos enable row level security;
-- Força RLS inclusive para o dono da tabela (defesa extra).
alter table public.pedidos force row level security;


-- ---------------------------------------------------------------------
-- 3) Policies
-- ---------------------------------------------------------------------
-- Limpa policies antigas se você rodar o script mais de uma vez.
drop policy if exists "anon pode criar pedido" on public.pedidos;
drop policy if exists "anon nao le pedidos"    on public.pedidos;

-- 3.1) INSERT liberado para o cliente (papel anon), MAS:
--      - o pedido nasce sempre com status = 'novo' (não dá pra forjar 'aceito');
--      - a loja é sempre 'gngelo'.
--      Não existe policy de SELECT/UPDATE/DELETE para anon, portanto essas
--      operações ficam TODAS bloqueadas por padrão (RLS nega o que não é liberado).
create policy "anon pode criar pedido"
  on public.pedidos
  for insert
  to anon
  with check (
    status = 'novo'
    and loja = 'gngelo'
  );

-- Observações:
--  • SELECT/UPDATE/DELETE para anon: NÃO criamos policy → ficam negados.
--    O cliente nunca consegue ler pedidos de outras pessoas.
--  • A dona (painel de gestão) deve acessar via usuário AUTENTICADO
--    (papel `authenticated`) ou via `service_role` (backend / chave secreta),
--    que ignora RLS. Se o painel usa login Supabase, crie as policies abaixo.


-- ---------------------------------------------------------------------
-- 4) (Opcional) Policies para o PAINEL DA DONA via login Supabase
--     Descomente se o sistema de gestão autentica com Supabase Auth.
--     Se o painel usa `service_role`, NÃO precisa disto (service role ignora RLS).
-- ---------------------------------------------------------------------
-- create policy "dona le pedidos"
--   on public.pedidos for select to authenticated
--   using (true);
--
-- create policy "dona atualiza pedidos"
--   on public.pedidos for update to authenticated
--   using (true) with check (true);
--
-- create policy "dona apaga pedidos"
--   on public.pedidos for delete to authenticated
--   using (true);


-- ---------------------------------------------------------------------
-- 5) (Opcional) Realtime — para a caixa "Pedidos recebidos" atualizar sozinha.
--     Habilite também em: Supabase → Database → Replication → supabase_realtime.
-- ---------------------------------------------------------------------
-- alter publication supabase_realtime add table public.pedidos;

-- =====================================================================
-- Fim. Depois de rodar, teste um INSERT anônimo pelo site do cliente.
-- =====================================================================

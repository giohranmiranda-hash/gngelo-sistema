-- =====================================================================
--  BOLÃO DA COPA — BRASIL  |  Esquema do banco (Supabase / PostgreSQL)
--  --------------------------------------------------------------------
--  Como usar:
--    1. No painel do Supabase, abra "SQL Editor".
--    2. Cole TODO este arquivo e clique em "Run".
--    3. Depois rode o seed.sql (opcional) para popular jogos de exemplo.
--
--  Inclui:
--    • Tabelas: profiles, matches, predictions, payments, settings
--    • Função e gatilho de pontuação automática
--    • View de ranking (v_ranking)
--    • Row Level Security (RLS) — usuário comum só mexe no que é dele;
--      o admin (profiles.is_admin = true) controla tudo.
-- =====================================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1) PROFILES  (espelha auth.users e guarda nome + flag de admin)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) MATCHES  (somente jogos do Brasil)
-- ---------------------------------------------------------------------
create table if not exists public.matches (
  id             uuid primary key default gen_random_uuid(),
  opponent       text not null,                         -- adversário
  opponent_flag  text,                                  -- emoji da bandeira
  phase          text not null default 'Fase de Grupos',-- fase da Copa
  round_number   int  not null default 1,               -- nº da rodada
  match_date     timestamptz not null,                  -- data e horário
  status         text not null default 'aberto'
                 check (status in ('aberto','encerrado','finalizado')),
  brazil_score   int,                                   -- placar oficial Brasil
  opponent_score int,                                   -- placar oficial adversário
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) PREDICTIONS  (palpites — 1 por usuário por jogo)
--    "points" e "is_exact" são preenchidos automaticamente pelo gatilho.
-- ---------------------------------------------------------------------
create table if not exists public.predictions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  match_id       uuid not null references public.matches(id)  on delete cascade,
  brazil_score   int not null check (brazil_score   >= 0),
  opponent_score int not null check (opponent_score >= 0),
  points         int not null default 0,                -- calculado pelo sistema
  is_exact       boolean not null default false,        -- acertou placar exato?
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, match_id)                            -- evita palpite duplicado
);

-- ---------------------------------------------------------------------
-- 4) PAYMENTS  (controle financeiro do bolão valendo dinheiro)
-- ---------------------------------------------------------------------
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      numeric(10,2) not null default 0,
  status      text not null default 'pendente'
              check (status in ('pendente','pago','recusado')),
  pix_key     text,
  receipt_url text,                                     -- comprovante (Storage)
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (user_id)                                      -- 1 pagamento por usuário
);

-- ---------------------------------------------------------------------
-- 5) SETTINGS  (configuração única do bolão — linha id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id             int primary key default 1 check (id = 1),
  app_name       text not null default 'Bolão Brasil',
  season_name    text not null default 'Copa do Mundo 2026',
  money_mode     boolean not null default false,        -- valendo dinheiro?
  entry_fee      numeric(10,2) not null default 0,
  pix_key        text default '',
  pix_copia_cola text default ''
);

-- Garante que exista a linha de configuração
insert into public.settings (id) values (1)
  on conflict (id) do nothing;

-- =====================================================================
--  PONTUAÇÃO AUTOMÁTICA
--  --------------------------------------------------------------------
--  Regras:
--    Placar exato ............... 10
--    Acertou vencedor/empate ..... 5   (parcial)
--    Acertou gols do Brasil ...... 2   (parcial)
--    Acertou gols do adversário .. 2   (parcial)
--    O placar exato NÃO soma com as parciais.
-- =====================================================================

-- Função: calcula os pontos de um palpite dado o placar oficial
create or replace function public.calc_points(
  g_brazil int, g_opp int,   -- palpite
  r_brazil int, r_opp int    -- resultado oficial
) returns table(points int, is_exact boolean)
language plpgsql immutable as $$
declare
  p int := 0;
  exact boolean := false;
begin
  if r_brazil is null or r_opp is null then
    return query select 0, false; return;
  end if;

  -- 1) Placar exato → 10
  if g_brazil = r_brazil and g_opp = r_opp then
    return query select 10, true; return;
  end if;

  -- 2) Parciais
  -- vencedor / empate (compara o "sinal" do placar)
  if sign(g_brazil - g_opp) = sign(r_brazil - r_opp) then
    p := p + 5;
  end if;
  if g_brazil = r_brazil then p := p + 2; end if;  -- gols do Brasil
  if g_opp    = r_opp    then p := p + 2; end if;  -- gols do adversário

  return query select p, exact;
end; $$;

-- Função do gatilho: recalcula TODOS os palpites de um jogo quando o
-- placar oficial é inserido/alterado (ou limpo no "resetar rodada").
create or replace function public.recalc_match_points()
returns trigger language plpgsql security definer as $$
begin
  update public.predictions pr
     set points   = c.points,
         is_exact = c.is_exact,
         updated_at = now()
    from lateral public.calc_points(pr.brazil_score, pr.opponent_score,
                                    new.brazil_score, new.opponent_score) c
   where pr.match_id = new.id;
  return new;
end; $$;

drop trigger if exists trg_recalc_points on public.matches;
create trigger trg_recalc_points
  after update of brazil_score, opponent_score on public.matches
  for each row execute function public.recalc_match_points();

-- Função do gatilho: ao salvar um palpite, já calcula os pontos caso o
-- jogo tenha placar; e impede palpite após o início/encerramento do jogo.
create or replace function public.score_prediction()
returns trigger language plpgsql security definer as $$
declare m public.matches%rowtype;
begin
  select * into m from public.matches where id = new.match_id;

  -- Trava: só aceita palpite com jogo aberto e antes do horário
  if m.status <> 'aberto' or m.match_date <= now() then
    raise exception 'Palpites encerrados para este jogo.';
  end if;

  select c.points, c.is_exact into new.points, new.is_exact
    from public.calc_points(new.brazil_score, new.opponent_score,
                            m.brazil_score, m.opponent_score) c;
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_score_prediction on public.predictions;
create trigger trg_score_prediction
  before insert or update on public.predictions
  for each row execute function public.score_prediction();

-- Função do gatilho: cria o profile automaticamente ao cadastrar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists trg_new_user on auth.users;
create trigger trg_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
--  VIEW DE RANKING (v_ranking)
--  --------------------------------------------------------------------
--  Soma os pontos de cada participante + nº de placares exatos + status
--  de pagamento. É a fonte do ranking geral no front-end.
-- =====================================================================
create or replace view public.v_ranking as
select
  p.id                              as user_id,
  p.name,
  p.email,
  p.is_admin,
  coalesce(sum(pr.points), 0)::int  as total_points,
  coalesce(sum((pr.is_exact)::int), 0)::int as exact_count,
  coalesce(pay.status, 'pendente')  as payment_status
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
left join public.payments    pay on pay.user_id = p.id
where p.is_admin = false
group by p.id, p.name, p.email, p.is_admin, pay.status
order by total_points desc, exact_count desc, p.name asc;

-- =====================================================================
--  ROW LEVEL SECURITY (RLS)
--  --------------------------------------------------------------------
--  Princípio: usuário comum lê dados públicos e só escreve no que é
--  dele; o admin pode tudo. O placar oficial e a pontuação NUNCA podem
--  ser alterados por usuário comum (sem policy de UPDATE em matches).
-- =====================================================================

-- Função auxiliar: o usuário logado é admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles    enable row level security;
alter table public.matches     enable row level security;
alter table public.predictions enable row level security;
alter table public.payments    enable row level security;
alter table public.settings    enable row level security;

-- ---- PROFILES ----
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true); -- nomes visíveis no ranking
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert
  with check (id = auth.uid() or public.is_admin());

-- ---- MATCHES ----  (leitura: todos | escrita: só admin)
drop policy if exists matches_select on public.matches;
create policy matches_select on public.matches for select using (true);
drop policy if exists matches_admin_all on public.matches;
create policy matches_admin_all on public.matches for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- PREDICTIONS ----  (cada um lê todos p/ ranking; escreve só o seu)
drop policy if exists predictions_select on public.predictions;
create policy predictions_select on public.predictions for select using (true);
drop policy if exists predictions_write_own on public.predictions;
create policy predictions_write_own on public.predictions for insert
  with check (user_id = auth.uid());
drop policy if exists predictions_update_own on public.predictions;
create policy predictions_update_own on public.predictions for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- PAYMENTS ----  (usuário vê/insere o seu; admin gerencia tudo)
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists payments_insert_own on public.payments;
create policy payments_insert_own on public.payments for insert
  with check (user_id = auth.uid());
drop policy if exists payments_update on public.payments;
create policy payments_update on public.payments for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---- SETTINGS ----  (leitura: todos | escrita: só admin)
drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select using (true);
drop policy if exists settings_admin_update on public.settings;
create policy settings_admin_update on public.settings for update
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
--  DICA: para tornar um usuário ADMIN, rode (com o e-mail dele):
--    update public.profiles set is_admin = true
--    where email = 'voce@email.com';
-- =====================================================================

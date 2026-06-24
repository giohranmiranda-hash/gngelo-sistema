-- =====================================================================
--  SEED — jogos de exemplo do Brasil (opcional)
--  --------------------------------------------------------------------
--  Rode DEPOIS do schema.sql. Ajuste datas/adversários conforme a tabela
--  oficial da Copa. As datas usam horário do servidor (UTC) — adapte se
--  necessário.
-- =====================================================================

insert into public.matches (opponent, opponent_flag, phase, round_number, match_date, status, brazil_score, opponent_score)
values
  ('Sérvia',   '🇷🇸', 'Fase de Grupos',   1, now() - interval '5 days',  'finalizado', 2, 0),
  ('Suíça',    '🇨🇭', 'Fase de Grupos',   2, now() - interval '2 days',  'finalizado', 1, 0),
  ('Camarões', '🇨🇲', 'Fase de Grupos',   3, now() + interval '2 days',  'aberto',     null, null),
  ('Croácia',  '🇭🇷', 'Quartas de Final', 4, now() + interval '6 days',  'aberto',     null, null);

-- Atualiza a configuração do bolão (exemplo: valendo dinheiro, R$ 20)
update public.settings set
  app_name       = 'Bolão Brasil',
  season_name    = 'Copa do Mundo 2026',
  money_mode     = true,
  entry_fee      = 20.00,
  pix_key        = 'bolao@brasil.com.br',
  pix_copia_cola = '00020126360014BR.GOV.BCB.PIX0114bolao@brasil5204000053039865802BR5909BolaoCopa6009SAO PAULO62070503***6304ABCD'
where id = 1;

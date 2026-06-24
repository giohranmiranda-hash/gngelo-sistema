-- =====================================================================
--  SEED — jogos REAIS do Brasil na Copa do Mundo 2026 (Grupo C)
--  --------------------------------------------------------------------
--  Rode DEPOIS do schema.sql.
--  Resultados:
--    Brasil 1 x 1 Marrocos  (13/06/2026) — finalizado
--    Brasil 3 x 0 Haiti     (19/06/2026) — finalizado
--    Brasil x Escócia       (24/06/2026, 19h Brasília / 22:00 UTC) — aberto
--  Datas em UTC. Ajuste conforme a tabela oficial / fase eliminatória.
-- =====================================================================

insert into public.matches (opponent, opponent_flag, phase, round_number, match_date, status, brazil_score, opponent_score)
values
  ('Marrocos', '🇲🇦', 'Fase de Grupos', 1, '2026-06-13T22:00:00Z', 'finalizado', 1, 1),
  ('Haiti',    '🇭🇹', 'Fase de Grupos', 2, '2026-06-19T22:00:00Z', 'finalizado', 3, 0),
  ('Escócia',  '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Fase de Grupos', 3, '2026-06-24T22:00:00Z', 'aberto',     null, null);

-- Identidade do bolão (gratuito)
update public.settings set
  app_name     = 'Bolão Brasil',
  season_name  = 'Copa do Mundo 2026',
  auto_refresh = 30
where id = 1;

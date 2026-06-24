-- =====================================================================
--  AGENDAMENTO AUTOMÁTICO (cron) da sincronização de placares
--  --------------------------------------------------------------------
--  Faz o Supabase chamar a função sync-brazil sozinho a cada 5 minutos,
--  para o placar oficial entrar automaticamente quando o jogo acaba.
--
--  Rode no SQL Editor DEPOIS de publicar a função sync-brazil.
--  Substitua:
--    <SEU-PROJETO>   pela referência do projeto (ex.: abcdxyz)
--    <ANON-KEY>      pela anon public key (Project Settings > API)
-- =====================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove agendamento anterior (se já existir), evita duplicar
select cron.unschedule('sync-brazil-job')
where exists (select 1 from cron.job where jobname = 'sync-brazil-job');

-- Agenda: a cada 5 minutos chama a Edge Function
select cron.schedule(
  'sync-brazil-job',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://<SEU-PROJETO>.supabase.co/functions/v1/sync-brazil',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON-KEY>'
    )
  );
  $$
);

-- Para conferir os agendamentos:   select * from cron.job;
-- Para ver execuções recentes:      select * from cron.job_run_details order by start_time desc limit 10;

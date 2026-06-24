// =====================================================================
//  Edge Function: sync-brazil
//  --------------------------------------------------------------------
//  Busca os jogos do Brasil na API de futebol (football-data.org) e
//  atualiza/insere na tabela `matches`. Quando um jogo termina, grava o
//  placar oficial — e o GATILHO do banco recalcula os pontos sozinho.
//  É isso que faz "o jogo acaba e o sistema atualiza automaticamente".
//
//  Como publicar (resumo — passo a passo completo no README):
//    1. Pegue um token grátis em https://www.football-data.org/ (My Account).
//    2. Configure os segredos no projeto Supabase:
//         supabase secrets set FOOTBALL_API_TOKEN=seu_token
//       (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem por padrão)
//    3. Deploy:
//         supabase functions deploy sync-brazil --no-verify-jwt
//    4. Agende (cron) — ver README (pg_cron + net.http_post).
//
//  Observação: na football-data.org, o time "Brazil" tem id 764.
//  A função traz os jogos do Brasil e mapeia o status/placar.
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BRAZIL_TEAM_ID = 764; // football-data.org

// Tradução de adversários (EN -> PT) e bandeira (emoji)
const TEAMS: Record<string, { pt: string; flag: string }> = {
  Morocco: { pt: "Marrocos", flag: "🇲🇦" },
  Haiti: { pt: "Haiti", flag: "🇭🇹" },
  Scotland: { pt: "Escócia", flag: "🏴" },
  Argentina: { pt: "Argentina", flag: "🇦🇷" },
  France: { pt: "França", flag: "🇫🇷" },
  Spain: { pt: "Espanha", flag: "🇪🇸" },
  Germany: { pt: "Alemanha", flag: "🇩🇪" },
  Portugal: { pt: "Portugal", flag: "🇵🇹" },
  England: { pt: "Inglaterra", flag: "🏴" },
  Croatia: { pt: "Croácia", flag: "🇭🇷" },
  Netherlands: { pt: "Holanda", flag: "🇳🇱" },
};

// Tradução de fase (football-data.org -> nosso rótulo)
const STAGES: Record<string, string> = {
  GROUP_STAGE: "Fase de Grupos",
  LAST_16: "Oitavas de Final",
  QUARTER_FINALS: "Quartas de Final",
  SEMI_FINALS: "Semifinal",
  THIRD_PLACE: "Disputa de 3º lugar",
  FINAL: "Final",
};

// Status da API -> status do nosso bolão
function mapStatus(s: string): string {
  if (s === "FINISHED") return "finalizado";
  if (s === "IN_PLAY" || s === "PAUSED") return "encerrado";
  return "aberto"; // SCHEDULED, TIMED, POSTPONED...
}

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const TOKEN = Deno.env.get("FOOTBALL_API_TOKEN");
    if (!TOKEN) throw new Error("Defina o segredo FOOTBALL_API_TOKEN.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Busca os jogos do Brasil na API
    const resp = await fetch(
      `https://api.football-data.org/v4/teams/${BRAZIL_TEAM_ID}/matches`,
      { headers: { "X-Auth-Token": TOKEN } },
    );
    if (!resp.ok) throw new Error(`API retornou ${resp.status}`);
    const json = await resp.json();
    const apiMatches = json.matches ?? [];

    let updated = 0, created = 0;
    let round = 1;

    for (const g of apiMatches) {
      const brazilHome = g.homeTeam?.id === BRAZIL_TEAM_ID;
      const oppRaw = (brazilHome ? g.awayTeam?.name : g.homeTeam?.name) ?? "Adversário";
      const t = TEAMS[oppRaw] || { pt: oppRaw, flag: "🏳️" };

      const brazil_score = brazilHome ? g.score?.fullTime?.home : g.score?.fullTime?.away;
      const opponent_score = brazilHome ? g.score?.fullTime?.away : g.score?.fullTime?.home;
      const status = mapStatus(g.status);

      const row = {
        ext_id: g.id,
        opponent: t.pt,
        opponent_flag: t.flag,
        phase: STAGES[g.stage] || "Fase de Grupos",
        round_number: round++,
        match_date: g.utcDate,
        status,
        brazil_score: status === "finalizado" ? (brazil_score ?? null) : null,
        opponent_score: status === "finalizado" ? (opponent_score ?? null) : null,
      };

      // Existe esse jogo (por ext_id)?
      const { data: existing } = await supabase
        .from("matches").select("id").eq("ext_id", g.id).maybeSingle();

      if (existing) {
        await supabase.from("matches").update(row).eq("ext_id", g.id);
        updated++;
      } else {
        await supabase.from("matches").insert(row);
        created++;
      }
    }

    return new Response(JSON.stringify({ ok: true, updated, created }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});

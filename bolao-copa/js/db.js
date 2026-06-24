/* =====================================================================
   CAMADA DE DADOS (DB)
   ---------------------------------------------------------------------
   API única (window.DB) usada por todo o app. Escolhe a implementação:
     • SupabaseDB → produção (credenciais em config.js)
     • LocalDB    → modo demo (localStorage)

   • Login por NOME DE USUÁRIO (não e-mail).
   • Bolão gratuito (sem pagamento).
   • Atualização automática (Realtime/abas) + sincronização de placares
     via API de futebol (função do Supabase) — ver syncNow() e README.
   ===================================================================== */

(function () {
  const cfg = window.APP_CONFIG;
  const hasSupabase = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const uid = () => "id_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  // Normaliza o usuário e gera um "e-mail interno" (o Supabase Auth exige
  // e-mail; o usuário nunca vê isso — ele entra só com nome de usuário).
  const cleanUser = (u) => String(u || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  const synthEmail = (u) => `${cleanUser(u)}@${cfg.USERNAME_EMAIL_DOMAIN || "bolao.local"}`;

  /* =================================================================
     IMPLEMENTAÇÃO 1 — LOCAL (MODO DEMO)
     ================================================================= */
  function LocalDB() {
    const K = { session: "bolao_session", users: "bolao_users", matches: "bolao_matches",
                preds: "bolao_predictions", settings: "bolao_settings" };
    const read = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
    const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const wait = (v) => new Promise((r) => setTimeout(() => r(v), 90));

    const SEED_VERSION = "2026wc-c-v3-user";
    function seed() {
      if (read(K.settings)?._seed === SEED_VERSION) return;

      const users = [
        { id: "u_admin", name: "Organizador",   username: "admin",   password: "admin123", is_admin: true },
        { id: "u_mari",  name: "Mariana Silva",  username: "mariana", password: "123456", is_admin: false },
        { id: "u_carlos",name: "Carlos Eduardo", username: "carlos",  password: "123456", is_admin: false },
        { id: "u_joao",  name: "João Marques",   username: "joao",    password: "123456", is_admin: false },
        { id: "u_rafa",  name: "Rafael Costa",   username: "rafael",  password: "123456", is_admin: false },
        { id: "u_amanda",name: "Amanda Torres",  username: "amanda",  password: "123456", is_admin: false },
      ];

      // Jogos REAIS do Brasil — Copa 2026, Grupo C
      const matches = [
        { id: "m1", ext_id: null, opponent: "Marrocos", flag: "🇲🇦", phase: "Fase de Grupos", round_number: 1,
          match_date: "2026-06-13T22:00:00Z", status: "finalizado", brazil_score: 1, opponent_score: 1 },
        { id: "m2", ext_id: null, opponent: "Haiti", flag: "🇭🇹", phase: "Fase de Grupos", round_number: 2,
          match_date: "2026-06-19T22:00:00Z", status: "finalizado", brazil_score: 3, opponent_score: 0 },
        { id: "m3", ext_id: null, opponent: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", phase: "Fase de Grupos", round_number: 3,
          match_date: "2026-06-24T22:00:00Z", status: "aberto", brazil_score: null, opponent_score: null },
      ];

      const rawPreds = [
        { u: "u_mari",  m: "m1", b: 1, o: 1 }, { u: "u_carlos", m: "m1", b: 2, o: 2 },
        { u: "u_joao",  m: "m1", b: 0, o: 0 }, { u: "u_rafa",   m: "m1", b: 1, o: 2 },
        { u: "u_amanda",m: "m1", b: 2, o: 0 },
        { u: "u_mari",  m: "m2", b: 3, o: 0 }, { u: "u_carlos", m: "m2", b: 2, o: 0 },
        { u: "u_joao",  m: "m2", b: 3, o: 1 }, { u: "u_rafa",   m: "m2", b: 1, o: 0 },
        { u: "u_amanda",m: "m2", b: 3, o: 0 },
      ];
      const fm = (id) => matches.find((x) => x.id === id);
      const preds = rawPreds.map((p) => {
        const m = fm(p.m);
        const r = window.Scoring.calculate({ brazil: p.b, opp: p.o }, { brazil: m.brazil_score, opp: m.opponent_score });
        return { id: uid(), user_id: p.u, match_id: p.m, brazil_score: p.b, opponent_score: p.o,
                 points: r.points, is_exact: r.exact, updated_at: new Date().toISOString() };
      });

      write(K.users, users);
      write(K.matches, matches);
      write(K.preds, preds);
      write(K.settings, { id: 1, _seed: SEED_VERSION, app_name: cfg.APP_NAME, season_name: cfg.SEASON_NAME });
    }
    seed();

    const users = () => read(K.users, []);
    const matches = () => read(K.matches, []);
    const preds = () => read(K.preds, []);
    const publicUser = (u) => u && ({ id: u.id, name: u.name, username: u.username, is_admin: u.is_admin });

    function recalcMatch(matchId) {
      const m = matches().find((x) => x.id === matchId);
      if (!m) return;
      const all = preds();
      all.forEach((p) => {
        if (p.match_id !== matchId) return;
        if (m.brazil_score == null || m.opponent_score == null) { p.points = 0; p.is_exact = false; }
        else {
          const r = window.Scoring.calculate({ brazil: p.brazil_score, opp: p.opponent_score },
                                             { brazil: m.brazil_score, opp: m.opponent_score });
          p.points = r.points; p.is_exact = r.exact;
        }
      });
      write(K.preds, all);
    }

    return {
      mode: "demo",

      /* ----- Autenticação (por usuário) ----- */
      async signUp(name, username, password) {
        await wait();
        const uname = cleanUser(username);
        if (!uname) throw new Error("Escolha um nome de usuário válido.");
        const list = users();
        if (list.some((u) => u.username === uname)) throw new Error("Este nome de usuário já existe.");
        const u = { id: uid(), name: name || username, username: uname, password,
                    is_admin: uname === cleanUser(cfg.DEMO_ADMIN_USER) };
        list.push(u); write(K.users, list); write(K.session, u.id);
        return publicUser(u);
      },
      async signIn(username, password) {
        await wait();
        const u = users().find((x) => x.username === cleanUser(username));
        if (!u || u.password !== password) throw new Error("Usuário ou senha inválidos.");
        write(K.session, u.id);
        return publicUser(u);
      },
      async signOut() { await wait(); localStorage.removeItem(K.session); },
      async getCurrentUser() {
        const id = read(K.session, null);
        if (!id) return null;
        return publicUser(users().find((u) => u.id === id));
      },

      /* ----- Configurações ----- */
      async getSettings() { await wait(); return read(K.settings, {}); },
      async updateSettings(patch) { await wait(); const s = { ...read(K.settings, {}), ...patch }; write(K.settings, s); return s; },

      /* ----- Jogos ----- */
      async listMatches() { await wait(); return matches().slice().sort((a, b) => new Date(a.match_date) - new Date(b.match_date)); },
      async createMatch(data) { await wait(); const list = matches(); const m = { id: uid(), ext_id: null, brazil_score: null, opponent_score: null, status: "aberto", ...data }; list.push(m); write(K.matches, list); return m; },
      async updateMatch(id, patch) {
        await wait();
        const list = matches(); const m = list.find((x) => x.id === id);
        if (!m) throw new Error("Jogo não encontrado.");
        Object.assign(m, patch); write(K.matches, list);
        if ("brazil_score" in patch || "opponent_score" in patch) recalcMatch(id);
        return m;
      },
      async deleteMatch(id) { await wait(); write(K.matches, matches().filter((m) => m.id !== id)); write(K.preds, preds().filter((p) => p.match_id !== id)); },
      async resetRound(id) { await wait(); await this.updateMatch(id, { brazil_score: null, opponent_score: null, status: "aberto" }); },

      /* ----- Palpites ----- */
      async getMyPredictions(userId) { await wait(); return preds().filter((p) => p.user_id === userId); },
      async getPrediction(userId, matchId) { await wait(); return preds().find((p) => p.user_id === userId && p.match_id === matchId) || null; },
      async savePrediction(userId, matchId, brazil, opp) {
        await wait();
        const m = matches().find((x) => x.id === matchId);
        if (!m || m.status !== "aberto" || new Date(m.match_date) <= new Date()) throw new Error("Palpites encerrados para este jogo.");
        const list = preds();
        let p = list.find((x) => x.user_id === userId && x.match_id === matchId);
        if (p) { p.brazil_score = brazil; p.opponent_score = opp; p.updated_at = new Date().toISOString(); }
        else { p = { id: uid(), user_id: userId, match_id: matchId, brazil_score: brazil, opponent_score: opp, points: 0, is_exact: false, updated_at: new Date().toISOString() }; list.push(p); }
        write(K.preds, list); return p;
      },

      /* ----- Ranking ----- */
      async getRanking() {
        await wait();
        const rows = users().filter((u) => !u.is_admin).map((u) => {
          const my = preds().filter((p) => p.user_id === u.id);
          return { user_id: u.id, name: u.name, username: u.username,
                   total: my.reduce((s, p) => s + (p.points || 0), 0), exact_count: my.filter((p) => p.is_exact).length };
        });
        return rankSort(rows);
      },
      async getRoundRanking(matchId) {
        await wait();
        const rows = users().filter((u) => !u.is_admin).map((u) => {
          const p = preds().find((x) => x.user_id === u.id && x.match_id === matchId);
          return { user_id: u.id, name: u.name, username: u.username, total: p ? p.points : 0,
                   exact_count: p && p.is_exact ? 1 : 0, guess: p ? `${p.brazil_score}x${p.opponent_score}` : "—" };
        });
        return rankSort(rows);
      },

      /* ----- Admin ----- */
      async listUsers() {
        await wait();
        return users().map((u) => { const my = preds().filter((p) => p.user_id === u.id); return { ...publicUser(u), points: my.reduce((s, p) => s + (p.points || 0), 0) }; });
      },

      /* ----- Sincronização automática de placares ----- */
      async syncNow() {
        // No modo demo não há servidor para consultar a API de futebol.
        throw new Error("A sincronização automática via API funciona no modo Supabase (produção). Veja o README.");
      },

      /* ----- Tempo real (entre abas do navegador) ----- */
      onDataChange(cb) {
        const handler = (e) => { if (!e.key || [K.matches, K.preds, K.settings, K.users].includes(e.key)) cb(); };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
      },
    };
  }

  /* =================================================================
     IMPLEMENTAÇÃO 2 — SUPABASE (PRODUÇÃO)
     ================================================================= */
  function SupabaseDB() {
    const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

    async function profileFromAuth(authUser) {
      if (!authUser) return null;
      const { data } = await sb.from("profiles").select("*").eq("id", authUser.id).single();
      if (data) return { id: data.id, name: data.name, username: data.username, is_admin: data.is_admin };
      return { id: authUser.id, name: authUser.user_metadata?.name || authUser.user_metadata?.username, username: authUser.user_metadata?.username, is_admin: false };
    }
    const mapMatch = (m) => ({ id: m.id, ext_id: m.ext_id, opponent: m.opponent, flag: m.opponent_flag, phase: m.phase,
      round_number: m.round_number, match_date: m.match_date, status: m.status, brazil_score: m.brazil_score, opponent_score: m.opponent_score });

    return {
      mode: "supabase",
      _sb: sb,

      async signUp(name, username, password) {
        const uname = cleanUser(username);
        if (!uname) throw new Error("Escolha um nome de usuário válido.");
        const { data, error } = await sb.auth.signUp({ email: synthEmail(uname), password, options: { data: { name: name || username, username: uname } } });
        if (error) throw new Error(error.message.includes("already") ? "Este nome de usuário já existe." : error.message);
        if (data.user) await sb.from("profiles").upsert({ id: data.user.id, name: name || username, username: uname }).then(() => {});
        return profileFromAuth(data.user);
      },
      async signIn(username, password) {
        const { data, error } = await sb.auth.signInWithPassword({ email: synthEmail(username), password });
        if (error) throw new Error("Usuário ou senha inválidos.");
        return profileFromAuth(data.user);
      },
      async signOut() { await sb.auth.signOut(); },
      async getCurrentUser() { const { data } = await sb.auth.getUser(); return profileFromAuth(data.user); },

      async getSettings() { const { data } = await sb.from("settings").select("*").eq("id", 1).single(); return data || {}; },
      async updateSettings(patch) { const { data, error } = await sb.from("settings").update(patch).eq("id", 1).select().single(); if (error) throw new Error(error.message); return data; },

      async listMatches() { const { data, error } = await sb.from("matches").select("*").order("match_date", { ascending: true }); if (error) throw new Error(error.message); return (data || []).map(mapMatch); },
      async createMatch(d) { const { data, error } = await sb.from("matches").insert({ opponent: d.opponent, opponent_flag: d.flag, phase: d.phase, round_number: d.round_number, match_date: d.match_date, status: d.status || "aberto" }).select().single(); if (error) throw new Error(error.message); return mapMatch(data); },
      async updateMatch(id, patch) {
        const p = {};
        if ("opponent" in patch) p.opponent = patch.opponent;
        if ("flag" in patch) p.opponent_flag = patch.flag;
        if ("phase" in patch) p.phase = patch.phase;
        if ("match_date" in patch) p.match_date = patch.match_date;
        if ("status" in patch) p.status = patch.status;
        if ("brazil_score" in patch) p.brazil_score = patch.brazil_score;
        if ("opponent_score" in patch) p.opponent_score = patch.opponent_score;
        const { data, error } = await sb.from("matches").update(p).eq("id", id).select().single();
        if (error) throw new Error(error.message); return mapMatch(data);
      },
      async deleteMatch(id) { const { error } = await sb.from("matches").delete().eq("id", id); if (error) throw new Error(error.message); },
      async resetRound(id) { return this.updateMatch(id, { brazil_score: null, opponent_score: null, status: "aberto" }); },

      async getMyPredictions(userId) { const { data, error } = await sb.from("predictions").select("*").eq("user_id", userId); if (error) throw new Error(error.message); return data || []; },
      async getPrediction(userId, matchId) { const { data } = await sb.from("predictions").select("*").eq("user_id", userId).eq("match_id", matchId).maybeSingle(); return data || null; },
      async savePrediction(userId, matchId, brazil, opp) {
        const { data, error } = await sb.from("predictions").upsert({ user_id: userId, match_id: matchId, brazil_score: brazil, opponent_score: opp }, { onConflict: "user_id,match_id" }).select().single();
        if (error) throw new Error(error.message); return data;
      },

      async getRanking() {
        const { data, error } = await sb.from("v_ranking").select("*"); if (error) throw new Error(error.message);
        return rankSort((data || []).map((r) => ({ user_id: r.user_id, name: r.name, username: r.username, total: r.total_points || 0, exact_count: r.exact_count || 0 })));
      },
      async getRoundRanking(matchId) {
        const { data, error } = await sb.from("predictions").select("user_id, points, is_exact, brazil_score, opponent_score, profiles(name, username)").eq("match_id", matchId);
        if (error) throw new Error(error.message);
        return rankSort((data || []).map((r) => ({ user_id: r.user_id, name: r.profiles?.name || "—", username: r.profiles?.username, total: r.points || 0, exact_count: r.is_exact ? 1 : 0, guess: `${r.brazil_score}x${r.opponent_score}` })));
      },

      async listUsers() {
        const { data, error } = await sb.from("v_ranking").select("*"); if (error) throw new Error(error.message);
        return (data || []).map((u) => ({ id: u.user_id, name: u.name, username: u.username, is_admin: u.is_admin, points: u.total_points || 0 }));
      },

      /* ----- Sincronização automática de placares (chama a Edge Function) ----- */
      async syncNow() {
        const { data, error } = await sb.functions.invoke("sync-brazil");
        if (error) throw new Error("Falha ao sincronizar: " + error.message);
        return data; // { updated: n, created: n }
      },

      /* ----- Tempo real (Supabase Realtime) ----- */
      onDataChange(cb) {
        const ch = sb.channel("bolao-live")
          .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, cb)
          .on("postgres_changes", { event: "*", schema: "public", table: "predictions" }, cb)
          .subscribe();
        return () => sb.removeChannel(ch);
      },
    };
  }

  function rankSort(rows) {
    rows.sort((a, b) => b.total - a.total || b.exact_count - a.exact_count || a.name.localeCompare(b.name));
    rows.forEach((r, i) => (r.position = i + 1));
    return rows;
  }

  window.DB = hasSupabase ? SupabaseDB() : LocalDB();
  window.DB.isDemo = !hasSupabase;
})();

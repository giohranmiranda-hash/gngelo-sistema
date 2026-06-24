/* =====================================================================
   CAMADA DE DADOS (DB)
   ---------------------------------------------------------------------
   Expõe uma API única (window.DB) usada por todo o app. Internamente
   escolhe a implementação:

     • SupabaseDB → quando há credenciais em config.js (produção)
     • LocalDB    → modo demo, dados no localStorage (sem backend)

   Assim a interface não muda: trocar de demo para produção é só
   preencher as credenciais no config.js.
   ===================================================================== */

(function () {
  const cfg = window.APP_CONFIG;
  const hasSupabase = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  /* =================================================================
     UTILIDADES COMPARTILHADAS
     ================================================================= */
  const uid = () => "id_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  /* =================================================================
     IMPLEMENTAÇÃO 1 — LOCAL (MODO DEMO)
     ================================================================= */
  function LocalDB() {
    const K = {
      session: "bolao_session",
      users: "bolao_users",
      matches: "bolao_matches",
      preds: "bolao_predictions",
      pays: "bolao_payments",
      settings: "bolao_settings",
    };
    const read = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
    const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const wait = (v) => new Promise((r) => setTimeout(() => r(v), 120)); // simula latência

    // -------- Semente inicial (executa apenas uma vez) --------
    function seed() {
      if (read(K.users)) return;

      const now = Date.now();
      const day = 86400000;

      const adminId = "u_admin", uMari = "u_mari", uCarlos = "u_carlos",
            uJoao = "u_joao", uRafa = "u_rafa", uAmanda = "u_amanda";

      const users = [
        { id: adminId, name: "Organizador", email: cfg.DEMO_ADMIN_EMAIL, password: "admin123", is_admin: true },
        { id: uMari,   name: "Mariana Silva",   email: "mariana@demo.com", password: "123456", is_admin: false },
        { id: uCarlos, name: "Carlos Eduardo",  email: "carlos@demo.com",  password: "123456", is_admin: false },
        { id: uJoao,   name: "João Marques",    email: "joao@demo.com",    password: "123456", is_admin: false },
        { id: uRafa,   name: "Rafael Costa",    email: "rafael@demo.com",  password: "123456", is_admin: false },
        { id: uAmanda, name: "Amanda Torres",   email: "amanda@demo.com",  password: "123456", is_admin: false },
      ];

      const matches = [
        { id: "m1", opponent: "Sérvia",   flag: "🇷🇸", phase: "Fase de Grupos", round_number: 1,
          match_date: new Date(now - 5 * day).toISOString(), status: "finalizado", brazil_score: 2, opponent_score: 0 },
        { id: "m2", opponent: "Suíça",    flag: "🇨🇭", phase: "Fase de Grupos", round_number: 2,
          match_date: new Date(now - 2 * day).toISOString(), status: "finalizado", brazil_score: 1, opponent_score: 0 },
        { id: "m3", opponent: "Camarões", flag: "🇨🇲", phase: "Fase de Grupos", round_number: 3,
          match_date: new Date(now + 2 * day + 14 * 3600000).toISOString(), status: "aberto", brazil_score: null, opponent_score: null },
        { id: "m4", opponent: "Croácia",  flag: "🇭🇷", phase: "Quartas de Final", round_number: 4,
          match_date: new Date(now + 6 * day).toISOString(), status: "aberto", brazil_score: null, opponent_score: null },
      ];

      // Palpites de demonstração nos jogos já finalizados
      const rawPreds = [
        // m1 (real 2x0)
        { user_id: uMari,   match_id: "m1", brazil: 2, opp: 0 }, // exato
        { user_id: uCarlos, match_id: "m1", brazil: 2, opp: 1 }, // vencedor + gols Brasil
        { user_id: uJoao,   match_id: "m1", brazil: 1, opp: 0 }, // vencedor + gols adv
        { user_id: uRafa,   match_id: "m1", brazil: 3, opp: 0 }, // vencedor + gols adv
        { user_id: uAmanda, match_id: "m1", brazil: 0, opp: 1 }, // errou
        // m2 (real 1x0)
        { user_id: uMari,   match_id: "m2", brazil: 1, opp: 0 }, // exato
        { user_id: uCarlos, match_id: "m2", brazil: 2, opp: 0 }, // vencedor + gols adv
        { user_id: uJoao,   match_id: "m2", brazil: 1, opp: 1 }, // gols Brasil
        { user_id: uRafa,   match_id: "m2", brazil: 1, opp: 0 }, // exato
        { user_id: uAmanda, match_id: "m2", brazil: 0, opp: 0 }, // errou (empate)
      ];
      const findMatch = (id) => matches.find((m) => m.id === id);
      const preds = rawPreds.map((p) => {
        const m = findMatch(p.match_id);
        const r = window.Scoring.calculate({ brazil: p.brazil, opp: p.opp }, { brazil: m.brazil_score, opp: m.opponent_score });
        return { id: uid(), user_id: p.user_id, match_id: p.match_id, brazil_score: p.brazil, opponent_score: p.opp,
                 points: r.points, is_exact: r.exact, updated_at: new Date().toISOString() };
      });

      const payments = [
        { id: uid(), user_id: uMari,   amount: 20, status: "pago",     pix_key: "", receipt_url: "comprovante-demo.jpg", created_at: new Date(now - 4 * day).toISOString() },
        { id: uid(), user_id: uCarlos, amount: 20, status: "pago",     pix_key: "", receipt_url: "comprovante-demo.jpg", created_at: new Date(now - 4 * day).toISOString() },
        { id: uid(), user_id: uRafa,   amount: 20, status: "pago",     pix_key: "", receipt_url: "comprovante-demo.jpg", created_at: new Date(now - 3 * day).toISOString() },
        { id: uid(), user_id: uJoao,   amount: 20, status: "pendente", pix_key: "", receipt_url: "comprovante-demo.jpg", created_at: new Date(now - 1 * day).toISOString() },
        { id: uid(), user_id: uAmanda, amount: 20, status: "pendente", pix_key: "", receipt_url: "comprovante-demo.jpg", created_at: new Date(now - 1 * day).toISOString() },
      ];

      const settings = {
        id: 1,
        app_name: cfg.APP_NAME,
        season_name: cfg.SEASON_NAME,
        money_mode: true,
        entry_fee: 20,
        pix_key: "bolao@brasil.com.br",
        pix_copia_cola: "00020126360014BR.GOV.BCB.PIX0114bolao@brasil5204000053039865802BR5909BolaoCopa6009SAO PAULO62070503***6304ABCD",
      };

      write(K.users, users);
      write(K.matches, matches);
      write(K.preds, preds);
      write(K.pays, payments);
      write(K.settings, settings);
    }
    seed();

    // -------- Helpers internos --------
    const users = () => read(K.users, []);
    const matches = () => read(K.matches, []);
    const preds = () => read(K.preds, []);
    const pays = () => read(K.pays, []);
    const publicUser = (u) => u && ({ id: u.id, name: u.name, email: u.email, is_admin: u.is_admin });

    function recalcMatch(matchId) {
      const m = matches().find((x) => x.id === matchId);
      if (!m) return;
      const all = preds();
      all.forEach((p) => {
        if (p.match_id !== matchId) return;
        if (m.brazil_score == null || m.opponent_score == null) {
          p.points = 0; p.is_exact = false;
        } else {
          const r = window.Scoring.calculate(
            { brazil: p.brazil_score, opp: p.opponent_score },
            { brazil: m.brazil_score, opp: m.opponent_score }
          );
          p.points = r.points; p.is_exact = r.exact;
        }
      });
      write(K.preds, all);
    }

    // -------- API pública --------
    return {
      mode: "demo",

      /* ----- Autenticação ----- */
      async signUp(name, email, password) {
        await wait();
        const list = users();
        if (list.some((u) => u.email.toLowerCase() === email.toLowerCase()))
          throw new Error("Este e-mail já está cadastrado.");
        const u = { id: uid(), name, email, password, is_admin: email.toLowerCase() === cfg.DEMO_ADMIN_EMAIL.toLowerCase() };
        list.push(u); write(K.users, list);
        write(K.session, u.id);
        return publicUser(u);
      },
      async signIn(email, password) {
        await wait();
        const u = users().find((x) => x.email.toLowerCase() === email.toLowerCase());
        if (!u || u.password !== password) throw new Error("E-mail ou senha inválidos.");
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
      async updateSettings(patch) {
        await wait();
        const s = { ...read(K.settings, {}), ...patch };
        write(K.settings, s); return s;
      },

      /* ----- Jogos ----- */
      async listMatches() {
        await wait();
        return matches().slice().sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
      },
      async createMatch(data) {
        await wait();
        const list = matches();
        const m = { id: uid(), brazil_score: null, opponent_score: null, status: "aberto", ...data };
        list.push(m); write(K.matches, list); return m;
      },
      async updateMatch(id, patch) {
        await wait();
        const list = matches();
        const m = list.find((x) => x.id === id);
        if (!m) throw new Error("Jogo não encontrado.");
        Object.assign(m, patch);
        write(K.matches, list);
        // Se mexeu no placar, recalcula a pontuação de todos os palpites do jogo
        if ("brazil_score" in patch || "opponent_score" in patch) recalcMatch(id);
        return m;
      },
      async deleteMatch(id) {
        await wait();
        write(K.matches, matches().filter((m) => m.id !== id));
        write(K.preds, preds().filter((p) => p.match_id !== id));
      },
      async resetRound(id) {
        await wait();
        await this.updateMatch(id, { brazil_score: null, opponent_score: null, status: "aberto" });
      },

      /* ----- Palpites ----- */
      async getMyPredictions(userId) {
        await wait();
        return preds().filter((p) => p.user_id === userId);
      },
      async getPrediction(userId, matchId) {
        await wait();
        return preds().find((p) => p.user_id === userId && p.match_id === matchId) || null;
      },
      async savePrediction(userId, matchId, brazil, opp) {
        await wait();
        const m = matches().find((x) => x.id === matchId);
        // Trava de segurança: só permite palpite com jogo aberto e antes do horário
        if (!m || m.status !== "aberto" || new Date(m.match_date) <= new Date())
          throw new Error("Palpites encerrados para este jogo.");
        const list = preds();
        let p = list.find((x) => x.user_id === userId && x.match_id === matchId);
        if (p) {
          p.brazil_score = brazil; p.opponent_score = opp; p.updated_at = new Date().toISOString();
        } else {
          p = { id: uid(), user_id: userId, match_id: matchId, brazil_score: brazil, opponent_score: opp,
                points: 0, is_exact: false, updated_at: new Date().toISOString() };
          list.push(p);
        }
        write(K.preds, list); return p;
      },

      /* ----- Ranking ----- */
      async getRanking() {
        await wait();
        const s = read(K.settings, {});
        const payByUser = {}; pays().forEach((p) => { payByUser[p.user_id] = p.status; });
        const rows = users().filter((u) => !u.is_admin).map((u) => {
          const my = preds().filter((p) => p.user_id === u.id);
          return {
            user_id: u.id, name: u.name, email: u.email,
            total: my.reduce((s2, p) => s2 + (p.points || 0), 0),
            exact_count: my.filter((p) => p.is_exact).length,
            payment_status: payByUser[u.id] || (s.money_mode ? "pendente" : "pago"),
          };
        });
        return rankSort(rows);
      },
      async getRoundRanking(matchId) {
        await wait();
        const rows = users().filter((u) => !u.is_admin).map((u) => {
          const p = preds().find((x) => x.user_id === u.id && x.match_id === matchId);
          return { user_id: u.id, name: u.name, total: p ? p.points : 0, exact_count: p && p.is_exact ? 1 : 0,
                   guess: p ? `${p.brazil_score}x${p.opponent_score}` : "—", payment_status: "pago" };
        });
        return rankSort(rows);
      },

      /* ----- Pagamentos ----- */
      async getMyPayment(userId) {
        await wait();
        return pays().filter((p) => p.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
      },
      async submitPayment(userId, receiptName) {
        await wait();
        const s = read(K.settings, {});
        const list = pays();
        let p = list.find((x) => x.user_id === userId);
        if (p) { p.status = "pendente"; p.receipt_url = receiptName; p.created_at = new Date().toISOString(); }
        else { p = { id: uid(), user_id: userId, amount: s.entry_fee, status: "pendente", pix_key: s.pix_key, receipt_url: receiptName, created_at: new Date().toISOString() }; list.push(p); }
        write(K.pays, list); return p;
      },
      async listPayments() {
        await wait();
        const byId = {}; users().forEach((u) => (byId[u.id] = u));
        return pays().map((p) => ({ ...p, user: publicUser(byId[p.user_id]) }))
                     .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      },
      async updatePayment(id, status) {
        await wait();
        const list = pays();
        const p = list.find((x) => x.id === id);
        if (p) { p.status = status; p.reviewed_at = new Date().toISOString(); }
        write(K.pays, list); return p;
      },

      /* ----- Admin: usuários ----- */
      async listUsers() {
        await wait();
        const payByUser = {}; pays().forEach((p) => { payByUser[p.user_id] = p.status; });
        return users().map((u) => {
          const my = preds().filter((p) => p.user_id === u.id);
          return { ...publicUser(u), points: my.reduce((s, p) => s + (p.points || 0), 0),
                   payment_status: payByUser[u.id] || "—" };
        });
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
      if (data) return { id: data.id, name: data.name, email: data.email, is_admin: data.is_admin };
      return { id: authUser.id, name: authUser.user_metadata?.name || authUser.email, email: authUser.email, is_admin: false };
    }

    const mapMatch = (m) => ({
      id: m.id, opponent: m.opponent, flag: m.opponent_flag, phase: m.phase,
      round_number: m.round_number, match_date: m.match_date, status: m.status,
      brazil_score: m.brazil_score, opponent_score: m.opponent_score,
    });

    return {
      mode: "supabase",
      _sb: sb,

      /* ----- Autenticação ----- */
      async signUp(name, email, password) {
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw new Error(error.message);
        // Cria/garante o perfil (também coberto por trigger no banco)
        if (data.user) {
          await sb.from("profiles").upsert({ id: data.user.id, name, email }).then(() => {});
        }
        return profileFromAuth(data.user);
      },
      async signIn(email, password) {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        return profileFromAuth(data.user);
      },
      async signOut() { await sb.auth.signOut(); },
      async getCurrentUser() {
        const { data } = await sb.auth.getUser();
        return profileFromAuth(data.user);
      },

      /* ----- Configurações ----- */
      async getSettings() {
        const { data } = await sb.from("settings").select("*").eq("id", 1).single();
        return data || {};
      },
      async updateSettings(patch) {
        const { data, error } = await sb.from("settings").update(patch).eq("id", 1).select().single();
        if (error) throw new Error(error.message);
        return data;
      },

      /* ----- Jogos ----- */
      async listMatches() {
        const { data, error } = await sb.from("matches").select("*").order("match_date", { ascending: true });
        if (error) throw new Error(error.message);
        return (data || []).map(mapMatch);
      },
      async createMatch(d) {
        const { data, error } = await sb.from("matches").insert({
          opponent: d.opponent, opponent_flag: d.flag, phase: d.phase,
          round_number: d.round_number, match_date: d.match_date, status: d.status || "aberto",
        }).select().single();
        if (error) throw new Error(error.message);
        return mapMatch(data);
      },
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
        if (error) throw new Error(error.message);
        // O recálculo dos pontos é feito por TRIGGER no banco (ver schema.sql)
        return mapMatch(data);
      },
      async deleteMatch(id) {
        const { error } = await sb.from("matches").delete().eq("id", id);
        if (error) throw new Error(error.message);
      },
      async resetRound(id) {
        return this.updateMatch(id, { brazil_score: null, opponent_score: null, status: "aberto" });
      },

      /* ----- Palpites ----- */
      async getMyPredictions(userId) {
        const { data, error } = await sb.from("predictions").select("*").eq("user_id", userId);
        if (error) throw new Error(error.message);
        return data || [];
      },
      async getPrediction(userId, matchId) {
        const { data } = await sb.from("predictions").select("*").eq("user_id", userId).eq("match_id", matchId).maybeSingle();
        return data || null;
      },
      async savePrediction(userId, matchId, brazil, opp) {
        const { data, error } = await sb.from("predictions")
          .upsert({ user_id: userId, match_id: matchId, brazil_score: brazil, opponent_score: opp },
                  { onConflict: "user_id,match_id" })
          .select().single();
        if (error) throw new Error(error.message);
        return data;
      },

      /* ----- Ranking (lê a view v_ranking) ----- */
      async getRanking() {
        const { data, error } = await sb.from("v_ranking").select("*");
        if (error) throw new Error(error.message);
        return rankSort((data || []).map((r) => ({
          user_id: r.user_id, name: r.name, email: r.email,
          total: r.total_points || 0, exact_count: r.exact_count || 0,
          payment_status: r.payment_status || "pendente",
        })));
      },
      async getRoundRanking(matchId) {
        const { data, error } = await sb.from("predictions")
          .select("user_id, points, is_exact, brazil_score, opponent_score, profiles(name)")
          .eq("match_id", matchId);
        if (error) throw new Error(error.message);
        return rankSort((data || []).map((r) => ({
          user_id: r.user_id, name: r.profiles?.name || "—", total: r.points || 0,
          exact_count: r.is_exact ? 1 : 0, guess: `${r.brazil_score}x${r.opponent_score}`, payment_status: "pago",
        })));
      },

      /* ----- Pagamentos ----- */
      async getMyPayment(userId) {
        const { data } = await sb.from("payments").select("*").eq("user_id", userId)
          .order("created_at", { ascending: false }).limit(1).maybeSingle();
        return data || null;
      },
      async submitPayment(userId, receiptName) {
        const s = await this.getSettings();
        const { data, error } = await sb.from("payments")
          .upsert({ user_id: userId, amount: s.entry_fee, status: "pendente", receipt_url: receiptName },
                  { onConflict: "user_id" })
          .select().single();
        if (error) throw new Error(error.message);
        return data;
      },
      async listPayments() {
        const { data, error } = await sb.from("payments").select("*, profiles(name, email)").order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []).map((p) => ({ ...p, user: { id: p.user_id, name: p.profiles?.name, email: p.profiles?.email } }));
      },
      async updatePayment(id, status) {
        const { data, error } = await sb.from("payments").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id).select().single();
        if (error) throw new Error(error.message);
        return data;
      },

      /* ----- Admin: usuários ----- */
      async listUsers() {
        const { data, error } = await sb.from("v_ranking").select("*");
        if (error) throw new Error(error.message);
        return (data || []).map((u) => ({
          id: u.user_id, name: u.name, email: u.email, is_admin: u.is_admin,
          points: u.total_points || 0, payment_status: u.payment_status || "—",
        }));
      },
    };
  }

  /* =================================================================
     Ordenação de ranking compartilhada:
     pontos desc → placares exatos desc → nome asc
     ================================================================= */
  function rankSort(rows) {
    rows.sort((a, b) =>
      b.total - a.total ||
      b.exact_count - a.exact_count ||
      a.name.localeCompare(b.name)
    );
    rows.forEach((r, i) => (r.position = i + 1));
    return rows;
  }

  // Exporta a instância escolhida
  window.DB = hasSupabase ? SupabaseDB() : LocalDB();
  window.DB.isDemo = !hasSupabase;
})();

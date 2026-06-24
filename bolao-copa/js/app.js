/* =====================================================================
   APP — controlador principal (telas, navegação e ações)
   ---------------------------------------------------------------------
   SPA simples sem framework. Cada "tela" é uma função que devolve HTML;
   os eventos são religados após cada render. TODOS os botões executam
   uma ação real (nada é apenas decorativo).
   ===================================================================== */

const App = (function () {
  const I = (n) => UI.icon(n);
  const $ = (sel, root = document) => root.querySelector(sel);

  // Estado em memória
  const state = {
    user: null,
    settings: {},
    tab: "inicio",
    rankingMode: "geral", // 'geral' | 'rodada'
    rankingMatchId: null,
    adminTab: "jogos",    // 'jogos' | 'usuarios' | 'config'
    matches: [],
    myPreds: {},          // match_id -> prediction
    _refreshTimer: null,  // timer do polling automático
    _unsub: null,         // cancela a assinatura de tempo real
  };

  const root = () => document.getElementById("app");

  /* ===================================================================
     BOOTSTRAP
     =================================================================== */
  async function init() {
    root().innerHTML = `<div class="loading-screen"><span class="spinner"></span><span>Carregando o bolão…</span></div>`;
    try {
      state.settings = await DB.getSettings();
      state.user = await DB.getCurrentUser();
    } catch (e) {
      console.error(e);
    }
    if (DB.isDemo) {
      UI.toast("Modo DEMO ativo — dados salvos no navegador. Configure o Supabase no config.js para produção.", "warning");
    }
    if (state.user) renderApp();
    else renderAuth();
  }

  /* ===================================================================
     TELA DE LOGIN / CADASTRO
     =================================================================== */
  function renderAuth(mode = "login") {
    const isLogin = mode === "login";
    root().innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="auth-logo">${I("ball")}</div>
          <h1 class="auth-title">${UI.esc(state.settings.app_name || "Bolão Brasil")}</h1>
          <p class="auth-sub">${isLogin ? "Bem-vindo de volta! Faça seu palpite." : "Crie sua conta e participe do bolão."}</p>
          <form id="auth-form">
            ${!isLogin ? `
            <div class="field">
              <label>Nome completo</label>
              <div class="input-wrap">${I("user")}<input class="input has-icon" name="name" placeholder="Seu nome" required></div>
            </div>` : ""}
            <div class="field">
              <label>E-mail</label>
              <div class="input-wrap">${I("mail")}<input class="input has-icon" type="email" name="email" placeholder="seu@email.com" required></div>
            </div>
            <div class="field">
              <div class="between"><label>Senha</label>${isLogin ? `<a href="#" id="forgot">Esqueceu a senha?</a>` : ""}</div>
              <div class="input-wrap">${I("lock")}<input class="input has-icon" type="password" name="password" placeholder="••••••••" minlength="6" required></div>
            </div>
            <button class="btn btn-primary" type="submit" id="auth-submit">
              ${isLogin ? I("login") + " ENTRAR" : I("check") + " CRIAR CONTA"}
            </button>
          </form>
          <button class="btn btn-secondary" style="margin-top:12px" id="auth-toggle">
            ${isLogin ? "CRIAR CONTA" : "JÁ TENHO CONTA"}
          </button>
          ${DB.isDemo && isLogin ? `<p class="auth-switch">Demo: <b>${UI.esc(APP_CONFIG.DEMO_ADMIN_EMAIL)}</b> / <b>admin123</b> (admin)<br>ou <b>mariana@demo.com</b> / <b>123456</b></p>` : ""}
        </div>
      </div>`;

    $("#auth-toggle").onclick = () => renderAuth(isLogin ? "signup" : "login");
    const forgot = $("#forgot");
    if (forgot) forgot.onclick = (e) => { e.preventDefault(); UI.toast("Recuperação de senha: verifique seu e-mail (configure no Supabase Auth).", "info"); };

    $("#auth-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      const btn = $("#auth-submit");
      btn.disabled = true; btn.innerHTML = `<span class="spinner"></span>`;
      try {
        if (isLogin) {
          state.user = await DB.signIn(f.email.value.trim(), f.password.value);
        } else {
          state.user = await DB.signUp(f.name.value.trim(), f.email.value.trim(), f.password.value);
        }
        if (!state.user) throw new Error("Não foi possível autenticar. Em produção, confirme o e-mail se exigido pelo Supabase.");
        state.settings = await DB.getSettings();
        UI.toast(`Olá, ${state.user.name.split(" ")[0]}! 👋`);
        renderApp();
      } catch (err) {
        UI.toast(err.message || "Erro ao autenticar.", "error");
        btn.disabled = false;
        btn.innerHTML = isLogin ? I("login") + " ENTRAR" : I("check") + " CRIAR CONTA";
      }
    };
  }

  /* ===================================================================
     SHELL DO APP (topbar + conteúdo + bottom nav)
     =================================================================== */
  function navItems() {
    const items = [
      { id: "inicio", label: "Início", icon: "home" },
      { id: "palpites", label: "Palpites", icon: "flag" },
      { id: "ranking", label: "Ranking", icon: "chart" },
    ];
    if (state.user.is_admin) items.push({ id: "admin", label: "Admin", icon: "shield" });
    items.push({ id: "perfil", label: "Perfil", icon: "user" });
    return items;
  }

  function renderApp() {
    root().innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <button class="brand" id="brand-btn">${I("ball")} ${UI.esc(state.settings.app_name || "Bolão Brasil")}</button>
          <button class="icon-btn" id="bell-btn" title="Notificações">${I("bell")}</button>
        </header>
        <main class="content" id="screen"></main>
        <nav class="bottom-nav" id="bottom-nav"></nav>
      </div>`;

    $("#brand-btn").onclick = () => go("inicio");
    $("#bell-btn").onclick = showNotifications;
    renderNav();
    renderScreen();
    setupAutoRefresh();
    setupRealtime();
  }

  /* ===================================================================
     ATUALIZAÇÃO AUTOMÁTICA
     -------------------------------------------------------------------
     • Realtime: assina mudanças no banco (Supabase) ou entre abas (demo);
       quando um placar é salvo, a tela atualiza na hora para todos.
     • Polling: como rede de segurança, recarrega a tela a cada N segundos
       (configurável pelo admin). Nunca atrapalha quem está digitando um
       palpite (pula o refresh se há modal aberto ou input em foco).
     =================================================================== */
  function setupAutoRefresh() {
    if (state._refreshTimer) { clearInterval(state._refreshTimer); state._refreshTimer = null; }
    const secs = Number(state.settings.auto_refresh ?? 30);
    if (secs > 0) state._refreshTimer = setInterval(softRefresh, secs * 1000);
  }

  function setupRealtime() {
    if (state._unsub || !DB.onDataChange) return;
    try {
      state._unsub = DB.onDataChange(() => {
        // recarrega configurações (caso admin tenha mudado) e atualiza tela
        DB.getSettings().then((s) => { state.settings = s; softRefresh(true); });
      });
    } catch (e) { console.warn("Realtime indisponível:", e); }
  }

  async function softRefresh(announce = false) {
    if (!state.user) return;
    // Não atrapalha o usuário: pula se há modal aberto ou campo em foco
    if (document.getElementById("modal-overlay")) return;
    const ae = document.activeElement;
    if (ae && (ae.tagName === "INPUT" || ae.tagName === "SELECT" || ae.tagName === "TEXTAREA")) return;
    await renderScreen(true);
    if (announce) UI.toast("Resultados atualizados! 🔄");
  }

  function renderNav() {
    const nav = $("#bottom-nav");
    nav.innerHTML = navItems().map((it) => `
      <button data-tab="${it.id}" class="${state.tab === it.id ? "active" : ""}">
        <span class="nav-ico">${I(it.icon)}</span>${it.label}
      </button>`).join("");
    nav.querySelectorAll("button").forEach((b) => (b.onclick = () => go(b.dataset.tab)));
  }

  function go(tab) {
    state.tab = tab;
    renderNav();
    renderScreen();
    $("#screen")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }

  async function renderScreen(soft = false) {
    const screen = $("#screen");
    if (!screen) return;
    // Em refresh "soft" não mostra spinner (evita piscar a tela a cada atualização)
    if (!soft) screen.innerHTML = `<div class="loading-screen" style="min-height:50vh"><span class="spinner"></span></div>`;
    try {
      switch (state.tab) {
        case "inicio":   await renderDashboard(screen); break;
        case "palpites": await renderPalpites(screen); break;
        case "ranking":  await renderRanking(screen); break;
        case "perfil":   await renderPerfil(screen); break;
        case "admin":    await renderAdmin(screen); break;
      }
    } catch (e) {
      console.error(e);
      screen.innerHTML = `<div class="empty">${I("warn")}<p>Erro ao carregar: ${UI.esc(e.message)}</p></div>`;
    }
  }

  /* ===================================================================
     DASHBOARD (INÍCIO)
     =================================================================== */
  async function loadMatchesAndPreds() {
    state.matches = await DB.listMatches();
    const my = await DB.getMyPredictions(state.user.id);
    state.myPreds = {};
    my.forEach((p) => (state.myPreds[p.match_id] = p));
  }

  async function renderDashboard(el) {
    await loadMatchesAndPreds();
    const ranking = await DB.getRanking();
    const me = ranking.find((r) => r.user_id === state.user.id);
    const myPoints = me ? me.total : 0;
    const myPos = me ? me.position : "—";

    // Próximo jogo aberto (data futura)
    const next = state.matches.find((m) => m.status === "aberto" && new Date(m.match_date) > new Date());

    el.innerHTML = `
      <div class="hero-greeting">
        <h1>Olá, ${UI.esc(state.user.name.split(" ")[0])}! 👋</h1>
        <p>Pronto para a rodada?</p>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <span class="label">${I("star")} Pontos</span>
          <div class="value">${myPoints}</div>
        </div>
        <div class="stat-card blue">
          <span class="label">${I("trophy")} Ranking</span>
          <div class="value">#${myPos}</div>
        </div>
      </div>

      <div class="section-head">
        <h2>Próximo Jogo</h2>
        <a href="#" id="see-all">Ver todos ${""}</a>
      </div>
      ${next ? matchCardHtml(next, state.myPreds[next.id], { compact: true }) : `<div class="card center muted">Nenhum jogo aberto no momento. 🏆</div>`}

      <div class="banner info">${I("info")}<div><div class="b-title">Bolão gratuito 💚</div><div class="b-sub">Participe e dispute o ranking sem custo nenhum.</div></div></div>
    `;

    $("#see-all").onclick = (e) => { e.preventDefault(); go("palpites"); };
    bindMatchCard(el, next);
  }

  /* ===================================================================
     CARD DE JOGO (reutilizado em Dashboard e Palpites)
     =================================================================== */
  function matchCardHtml(m, pred, opts = {}) {
    const now = new Date();
    const locked = m.status !== "aberto" || new Date(m.match_date) <= now;
    const finished = m.status === "finalizado" && m.brazil_score != null;
    const headClass = m.status === "finalizado" ? "finished" : (locked ? "closed" : "open");
    const cd = UI.countdown(m.match_date);

    const statusChip = m.status === "aberto" ? "Aberto" : (m.status === "encerrado" ? "Encerrado" : "Finalizado");

    // Bloco central: inputs (aberto) ou placares
    let center;
    if (finished) {
      center = `<div class="score-final">${m.brazil_score}</div><div class="vs">x</div><div class="score-final">${m.opponent_score}</div>`;
    } else if (!locked) {
      center = `
        <input class="score-input" id="bs-${m.id}" type="number" min="0" max="20" inputmode="numeric" value="${pred?.brazil_score ?? ""}" placeholder="-">
        <div class="vs">x</div>
        <input class="score-input" id="os-${m.id}" type="number" min="0" max="20" inputmode="numeric" value="${pred?.opponent_score ?? ""}" placeholder="-">`;
    } else {
      // Encerrado, sem placar oficial ainda: mostra o palpite (travado)
      center = `<input class="score-input" disabled value="${pred?.brazil_score ?? "-"}"><div class="vs">x</div><input class="score-input" disabled value="${pred?.opponent_score ?? "-"}">`;
    }

    // Rodapé: botão salvar (aberto) ou resultado (finalizado)
    let foot = "";
    if (!locked) {
      foot = `<button class="btn btn-primary" data-save="${m.id}">${I("save")} ${pred ? "Atualizar palpite" : "Salvar palpite"}</button>`;
    } else if (finished && pred) {
      const r = Scoring.calculate({ brazil: pred.brazil_score, opp: pred.opponent_score }, { brazil: m.brazil_score, opp: m.opponent_score });
      const cls = r.exact ? "hit" : (r.points > 0 ? "partial" : "miss");
      const ic = r.points > 0 ? "checkCircle" : "x";
      foot = `<div class="pred-result ${cls}">${I(ic)} Seu palpite: ${pred.brazil_score}x${pred.opponent_score} — ${r.detail}</div>`;
    } else if (finished && !pred) {
      foot = `<div class="pred-result miss">${I("x")} Você não palpitou neste jogo (0 pts).</div>`;
    } else if (pred) {
      foot = `<div class="pred-result partial">${I("clock")} Palpite registrado: ${pred.brazil_score}x${pred.opponent_score}. Aguardando o resultado.</div>`;
    } else {
      foot = `<div class="pred-result miss">${I("clock")} Palpites encerrados — você não palpitou.</div>`;
    }

    return `
      <div class="card match-card" data-match="${m.id}">
        <div class="match-head ${headClass}">
          <span class="chip ${m.status === "aberto" ? "chip-green" : (m.status === "finalizado" ? "chip-yellow" : "chip-gray")}" style="background:rgba(255,255,255,.15);color:inherit">${statusChip}</span>
          <span class="when">${I(opts.compact && cd ? "clock" : "calendar")} ${opts.compact && cd ? cd : UI.fmtDate(m.match_date)} ${opts.compact ? "" : "· " + UI.esc(m.phase)}</span>
        </div>
        <div class="match-body">
          ${!opts.compact ? `<div class="label center" style="margin-bottom:12px">${UI.esc(m.phase)}</div>` : ""}
          <div class="match-teams">
            <div class="team"><div class="flag">🇧🇷</div><div class="name">Brasil</div></div>
            <div class="score-set">${center}</div>
            <div class="team"><div class="flag">${m.flag || "🏳️"}</div><div class="name">${UI.esc(m.opponent)}</div></div>
          </div>
          <div class="match-foot">${foot}</div>
        </div>
      </div>`;
  }

  function bindMatchCard(el, m) {
    if (!m) return;
    const btn = el.querySelector(`[data-save="${m.id}"]`);
    if (btn) btn.onclick = () => savePalpite(m.id);
  }

  async function savePalpite(matchId) {
    const bs = $(`#bs-${matchId}`), os = $(`#os-${matchId}`);
    const b = parseInt(bs.value, 10), o = parseInt(os.value, 10);
    if (Number.isNaN(b) || Number.isNaN(o) || b < 0 || o < 0) {
      UI.toast("Informe os dois placares (números ≥ 0).", "error");
      return;
    }
    try {
      await DB.savePrediction(state.user.id, matchId, b, o);
      UI.toast("Palpite salvo com sucesso! ⚽");
      // Atualiza a tela atual
      renderScreen();
    } catch (e) {
      UI.toast(e.message, "error");
    }
  }

  /* ===================================================================
     PALPITES (lista de todos os jogos)
     =================================================================== */
  async function renderPalpites(el) {
    await loadMatchesAndPreds();
    const open = state.matches.filter((m) => m.status === "aberto" && new Date(m.match_date) > new Date());
    const others = state.matches.filter((m) => !(m.status === "aberto" && new Date(m.match_date) > new Date()));

    el.innerHTML = `
      <h1 style="font-size:26px">Meus Palpites</h1>
      <p class="muted">Jogos do Brasil — ${UI.esc(state.settings.season_name || "")}</p>
      ${open.length ? `<div class="section-head"><h2 style="font-size:18px">Abertos para palpite</h2></div>` : ""}
      ${open.map((m) => matchCardHtml(m, state.myPreds[m.id])).join("")}
      ${others.length ? `<div class="section-head"><h2 style="font-size:18px">${I("history")} Histórico</h2></div>` : ""}
      ${others.map((m) => matchCardHtml(m, state.myPreds[m.id])).join("")}
      ${!state.matches.length ? `<div class="empty">${I("flag")}<p>Nenhum jogo cadastrado ainda.</p></div>` : ""}
    `;

    // Liga todos os botões "salvar palpite"
    state.matches.forEach((m) => bindMatchCard(el, m));
  }

  /* ===================================================================
     RANKING
     =================================================================== */
  async function renderRanking(el) {
    const isRound = state.rankingMode === "rodada";
    if (isRound && !state.rankingMatchId) {
      const ms = (await DB.listMatches()).filter((m) => m.status === "finalizado");
      state.rankingMatchId = ms.length ? ms[ms.length - 1].id : null;
    }
    const rows = isRound && state.rankingMatchId
      ? await DB.getRoundRanking(state.rankingMatchId)
      : await DB.getRanking();

    const ranked = rows;
    ranked.forEach((r, i) => (r.position = i + 1));

    const finishedMatches = (state.matches.length ? state.matches : await DB.listMatches()).filter((m) => m.status === "finalizado");
    state.matches = state.matches.length ? state.matches : await DB.listMatches();

    const top3 = ranked.slice(0, 3);

    el.innerHTML = `
      <h1 style="font-size:24px;text-align:center" class="" >${UI.esc(state.settings.app_name)}</h1>
      <p class="muted center">${UI.esc(state.settings.season_name || "")}</p>

      <div class="toggle">
        <button data-mode="rodada" class="${isRound ? "active" : ""}">Por Rodada</button>
        <button data-mode="geral" class="${!isRound ? "active" : ""}">Geral</button>
      </div>

      ${isRound ? roundSelector(finishedMatches) : ""}

      ${top3.length >= 1 ? podiumHtml(top3) : ""}

      <table class="rank-table">
        <thead><tr><th>#</th><th>Participante</th>${isRound ? "<th>Palpite</th>" : ""}<th style="text-align:right">Pts</th><th style="text-align:center">★</th></tr></thead>
        <tbody>
          ${ranked.length ? ranked.map((r) => rankRow(r, isRound)).join("") : `<tr><td colspan="5" class="center muted" style="padding:24px">Ninguém pontuou ainda.</td></tr>`}
        </tbody>
      </table>
    `;

    el.querySelectorAll("[data-mode]").forEach((b) => (b.onclick = () => {
      state.rankingMode = b.dataset.mode; renderScreen();
    }));
    const sel = $("#round-select");
    if (sel) sel.onchange = () => { state.rankingMatchId = sel.value; renderScreen(); };
  }

  function roundSelector(matches) {
    if (!matches.length) return `<div class="card center muted">Nenhuma rodada finalizada ainda.</div>`;
    return `<div class="field"><select class="input" id="round-select">
      ${matches.map((m) => `<option value="${m.id}" ${m.id === state.rankingMatchId ? "selected" : ""}>Brasil ${m.brazil_score}x${m.opponent_score} ${UI.esc(m.opponent)} — ${UI.esc(m.phase)}</option>`).join("")}
    </select></div>`;
  }

  function podiumHtml(top) {
    const order = [top[1], top[0], top[2]].filter(Boolean); // 2º, 1º, 3º
    return `<div class="podium">${order.map((r) => {
      const pos = r.position;
      return `<div class="podium-spot p${pos}">
        <div class="podium-avatar">${UI.initials(r.name)}<span class="medal">${pos}</span></div>
        <div class="podium-name">${UI.esc(r.name.split(" ")[0])}</div>
        <div class="podium-pts">${r.total} pts</div>
      </div>`;
    }).join("")}</div>`;
  }

  function rankRow(r, isRound) {
    const me = r.user_id === state.user.id;
    const posCls = r.position === 1 ? "gold" : r.position === 2 ? "silver" : r.position === 3 ? "bronze" : "";
    return `<tr class="${me ? "me" : ""}">
      <td class="pos ${posCls}">${r.position}</td>
      <td><div class="rank-name">${UI.esc(r.name.split(" ").slice(0,2).join(" "))}${me ? " ⭐" : ""}</div></td>
      ${isRound ? `<td class="muted">${UI.esc(r.guess || "—")}</td>` : ""}
      <td class="pts">${r.total}</td>
      <td class="center">${r.exact_count || 0}</td>
    </tr>`;
  }

  /* ===================================================================
     PIX / PAGAMENTO
     =================================================================== */
  /* ===================================================================
     PERFIL
     =================================================================== */
  async function renderPerfil(el) {
    const ranking = await DB.getRanking();
    const me = ranking.find((r) => r.user_id === state.user.id);
    const myPreds = await DB.getMyPredictions(state.user.id);

    el.innerHTML = `
      <div class="profile-head">
        <div class="profile-avatar">${UI.initials(state.user.name)}</div>
        <div class="profile-name">${UI.esc(state.user.name)}</div>
        <div class="muted">${UI.esc(state.user.email)}</div>
        ${state.user.is_admin ? `<span class="chip chip-green">${I("shield")} Administrador</span>` : ""}
      </div>

      <div class="stat-grid mt">
        <div class="stat-card"><span class="label">${I("star")} Pontos</span><div class="value">${me?.total || 0}</div></div>
        <div class="stat-card blue"><span class="label">${I("trophy")} Posição</span><div class="value">#${me?.position || "—"}</div></div>
      </div>
      <div class="stat-grid mt">
        <div class="stat-card"><span class="label">${I("flag")} Palpites</span><div class="value" style="font-size:32px">${myPreds.length}</div></div>
        <div class="stat-card blue"><span class="label">${I("check")} Exatos</span><div class="value" style="font-size:32px">${me?.exact_count || 0}</div></div>
      </div>

      <div class="card mt-lg" style="padding:0">
        <div class="list-row" id="row-rank">${I("chart")}<span class="grow">Ver meu ranking</span><span class="arrow">${I("chevron")}</span></div>
        ${state.user.is_admin ? `<div class="list-row" id="row-admin">${I("shield")}<span class="grow">Painel do Organizador</span><span class="arrow">${I("chevron")}</span></div>` : ""}
        <div class="list-row" id="row-about">${I("info")}<span class="grow">Regras de pontuação</span><span class="arrow">${I("chevron")}</span></div>
      </div>

      <button class="btn btn-danger mt-lg" id="logout-btn">${I("logout")} Sair da conta</button>
      <p class="dim center" style="margin-top:18px;font-size:12px">${UI.esc(state.settings.app_name)} · ${DB.isDemo ? "Modo Demo" : "Supabase"}</p>
    `;

    $("#row-rank").onclick = () => go("ranking");
    const rowAdmin = $("#row-admin"); if (rowAdmin) rowAdmin.onclick = () => go("admin");
    $("#row-about").onclick = showRules;
    $("#logout-btn").onclick = async () => {
      if (!(await UI.confirm("Sair", "Deseja realmente sair da sua conta?", "Sair", true))) return;
      await DB.signOut();
      if (state._refreshTimer) { clearInterval(state._refreshTimer); state._refreshTimer = null; }
      if (state._unsub) { state._unsub(); state._unsub = null; }
      state.user = null; state.tab = "inicio";
      UI.toast("Você saiu da conta.");
      renderAuth();
    };
  }

  function showRules() {
    UI.modal(`
      <h3>${I("star")} Regras de Pontuação</h3>
      <div style="margin-top:14px;display:flex;flex-direction:column;gap:10px">
        <div class="between"><span>🎯 Placar exato</span><b class="status-pago">10 pts</b></div>
        <div class="between"><span>✅ Acertou o vencedor / empate</span><b class="status-pago">5 pts</b></div>
        <div class="between"><span>⚽ Acertou os gols do Brasil</span><b class="status-pago">2 pts</b></div>
        <div class="between"><span>🥅 Acertou os gols do adversário</span><b class="status-pago">2 pts</b></div>
        <div class="between"><span>❌ Errou tudo</span><b class="status-recusado">0 pts</b></div>
      </div>
      <p class="muted" style="margin-top:14px;font-size:13px">O placar exato (10) não soma com as parciais. Palpites só são aceitos antes do início do jogo.</p>
      <button class="btn btn-primary" style="margin-top:18px" onclick="UI.closeModal()">Entendi</button>
    `);
  }

  function showNotifications() {
    const items = [];
    state.matches.forEach((m) => {
      if (m.status === "aberto" && new Date(m.match_date) > new Date() && !state.myPreds[m.id])
        items.push(`${I("flag")} Faça seu palpite: Brasil x ${UI.esc(m.opponent)}`);
      if (m.status === "finalizado" && state.myPreds[m.id]) {
        const r = Scoring.calculate({ brazil: state.myPreds[m.id].brazil_score, opp: state.myPreds[m.id].opponent_score }, { brazil: m.brazil_score, opp: m.opponent_score });
        items.push(`${I("checkCircle")} Brasil ${m.brazil_score}x${m.opponent_score} ${UI.esc(m.opponent)}: você fez ${r.points} pts`);
      }
    });
    UI.modal(`
      <div class="between"><h3>${I("bell")} Notificações</h3><button class="icon-btn" onclick="UI.closeModal()">${I("x")}</button></div>
      <div style="margin-top:14px;display:flex;flex-direction:column;gap:12px">
        ${items.length ? items.map((t) => `<div class="row gap-sm" style="font-size:14px">${t}</div>`).join("") : `<p class="muted">Sem novidades por enquanto. 🎉</p>`}
      </div>
    `);
  }

  /* ===================================================================
     PAINEL ADMIN
     =================================================================== */
  async function renderAdmin(el) {
    if (!state.user.is_admin) { el.innerHTML = `<div class="empty">${I("lock")}<p>Acesso restrito ao organizador.</p></div>`; return; }

    el.innerHTML = `
      <div class="between">
        <h1 style="font-size:24px;color:var(--primary-bright)">Painel do Organizador</h1>
      </div>
      <div class="admin-warn">${I("info")}<div><div class="t">Cálculo automático</div><div class="d">Ao inserir o placar oficial, o sistema calcula vencedor, pontos e rankings automaticamente.</div></div></div>
      <div class="admin-tabs">
        <button data-atab="jogos" class="${state.adminTab === "jogos" ? "active" : ""}">Jogos</button>
        <button data-atab="usuarios" class="${state.adminTab === "usuarios" ? "active" : ""}">Participantes</button>
        <button data-atab="config" class="${state.adminTab === "config" ? "active" : ""}">Configurações</button>
      </div>
      <div id="admin-body"></div>
    `;
    el.querySelectorAll("[data-atab]").forEach((b) => (b.onclick = () => { state.adminTab = b.dataset.atab; renderAdmin(el); }));

    const body = $("#admin-body", el);
    if (state.adminTab === "jogos") await adminJogos(body);
    else if (state.adminTab === "usuarios") await adminUsuarios(body);
    else await adminConfig(body);
  }

  /* ---------- Admin: Jogos ---------- */
  async function adminJogos(body) {
    const matches = await DB.listMatches();
    body.innerHTML = `
      <button class="btn btn-primary" id="new-match">${I("plus")} Novo Jogo</button>
      <div class="mt">
        ${matches.length ? matches.map(adminMatchRow).join("") : `<div class="empty">${I("flag")}<p>Nenhum jogo cadastrado.</p></div>`}
      </div>`;
    $("#new-match").onclick = () => matchForm();
    body.querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => matchForm(matches.find((m) => m.id === b.dataset.edit))));
    body.querySelectorAll("[data-score]").forEach((b) => (b.onclick = () => scoreForm(matches.find((m) => m.id === b.dataset.score))));
    body.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => {
      if (await UI.confirm("Excluir jogo", "Isso remove o jogo e todos os palpites dele. Continuar?", "Excluir", true)) {
        await DB.deleteMatch(b.dataset.del); UI.toast("Jogo excluído."); adminJogos(body);
      }
    }));
    body.querySelectorAll("[data-reset]").forEach((b) => (b.onclick = async () => {
      if (await UI.confirm("Resetar rodada", "Apaga o placar oficial e reabre o jogo (recalcula pontos). Continuar?", "Resetar", true)) {
        await DB.resetRound(b.dataset.reset); UI.toast("Rodada resetada."); adminJogos(body);
      }
    }));
  }

  function adminMatchRow(m) {
    const statusChip = m.status === "aberto" ? `<span class="chip chip-green">Aberto</span>`
      : m.status === "finalizado" ? `<span class="chip chip-yellow">Finalizado</span>`
      : `<span class="chip chip-blue">Aguardando placar</span>`;
    const score = m.brazil_score != null ? `<b class="status-pago">${m.brazil_score} x ${m.opponent_score}</b>` : `<span class="muted">— x —</span>`;
    return `
      <div class="card">
        <div class="between" style="margin-bottom:10px"><span class="label">${UI.esc(m.phase)} · ${UI.fmtDate(m.match_date)}</span>${statusChip}</div>
        <div class="admin-match-row">
          <div class="row gap-sm"><span style="font-size:24px">🇧🇷</span></div>
          <div class="teams center" style="text-align:center">Brasil ${score} ${UI.esc(m.opponent)}</div>
          <div class="row gap-sm"><span style="font-size:24px">${m.flag || "🏳️"}</span></div>
        </div>
        <div class="row gap-sm mt">
          <button class="btn btn-primary btn-sm flex-1" data-score="${m.id}">${I("edit")} ${m.brazil_score != null ? "Editar placar" : "Inserir placar"}</button>
          <button class="btn btn-ghost btn-sm" data-edit="${m.id}">${I("settings")}</button>
          ${m.brazil_score != null ? `<button class="btn btn-ghost btn-sm" data-reset="${m.id}" title="Resetar rodada">${I("refresh")}</button>` : ""}
          <button class="btn btn-danger btn-sm" data-del="${m.id}">${I("trash")}</button>
        </div>
      </div>`;
  }

  function matchForm(m) {
    const isEdit = !!m;
    const dt = m ? new Date(m.match_date) : new Date();
    const localDt = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    UI.modal(`
      <h3>${isEdit ? "Editar Jogo" : "Novo Jogo"}</h3>
      <form id="match-form" style="margin-top:16px">
        <div class="field"><label>Adversário</label><input class="input" name="opponent" value="${UI.esc(m?.opponent || "")}" placeholder="Ex.: Argentina" required></div>
        <div class="field"><label>Bandeira (emoji)</label><input class="input" name="flag" value="${UI.esc(m?.flag || "")}" placeholder="🇦🇷"></div>
        <div class="field"><label>Fase</label>
          <select class="input" name="phase">
            ${["Fase de Grupos","Oitavas de Final","Quartas de Final","Semifinal","Disputa de 3º lugar","Final"].map((p) => `<option ${m?.phase === p ? "selected" : ""}>${p}</option>`).join("")}
          </select></div>
        <div class="field"><label>Data e horário</label><input class="input" type="datetime-local" name="when" value="${localDt}" required></div>
        <div class="field"><label>Status</label>
          <select class="input" name="status">
            ${["aberto","encerrado","finalizado"].map((s) => `<option ${m?.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select></div>
        <div class="row gap-sm mt"><button type="button" class="btn btn-ghost" onclick="UI.closeModal()">Cancelar</button><button class="btn btn-primary" type="submit">${I("save")} Salvar</button></div>
      </form>`);
    $("#match-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      const data = {
        opponent: f.opponent.value.trim(),
        flag: f.flag.value.trim(),
        phase: f.phase.value,
        match_date: new Date(f.when.value).toISOString(),
        status: f.status.value,
        round_number: m?.round_number || ((await DB.listMatches()).length + 1),
      };
      try {
        if (isEdit) await DB.updateMatch(m.id, data); else await DB.createMatch(data);
        UI.closeModal(); UI.toast("Jogo salvo!"); renderAdmin($("#screen"));
      } catch (err) { UI.toast(err.message, "error"); }
    };
  }

  function scoreForm(m) {
    UI.modal(`
      <h3>Placar Oficial</h3>
      <p class="muted" style="margin:6px 0 18px">Brasil x ${UI.esc(m.opponent)} · ${UI.esc(m.phase)}</p>
      <form id="score-form">
        <div class="match-teams" style="margin-bottom:18px">
          <div class="team"><div class="flag">🇧🇷</div><div class="name">Brasil</div></div>
          <div class="score-set">
            <input class="score-input" name="bs" type="number" min="0" max="20" value="${m.brazil_score ?? ""}" placeholder="-" required>
            <div class="vs">x</div>
            <input class="score-input" name="os" type="number" min="0" max="20" value="${m.opponent_score ?? ""}" placeholder="-" required>
          </div>
          <div class="team"><div class="flag">${m.flag || "🏳️"}</div><div class="name">${UI.esc(m.opponent)}</div></div>
        </div>
        <p class="dim center" style="font-size:13px;margin-bottom:14px">${I("info")} Ao salvar, o jogo é marcado como <b>finalizado</b> e os pontos são recalculados.</p>
        <div class="row gap-sm"><button type="button" class="btn btn-ghost" onclick="UI.closeModal()">Cancelar</button><button class="btn btn-primary" type="submit">${I("check")} Salvar placar</button></div>
      </form>`);
    $("#score-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      const b = parseInt(f.bs.value, 10), o = parseInt(f.os.value, 10);
      if (Number.isNaN(b) || Number.isNaN(o)) { UI.toast("Informe os dois placares.", "error"); return; }
      try {
        await DB.updateMatch(m.id, { brazil_score: b, opponent_score: o, status: "finalizado" });
        UI.closeModal();
        UI.toast(`Placar salvo! Vencedor: ${b > o ? "Brasil" : b < o ? m.opponent : "Empate"}. Pontos recalculados. ⚽`);
        renderAdmin($("#screen"));
      } catch (err) { UI.toast(err.message, "error"); }
    };
  }

  /* ---------- Admin: Participantes ---------- */
  async function adminUsuarios(body) {
    const users = await DB.listUsers();
    const participants = users.filter((u) => !u.is_admin);
    body.innerHTML = `
      <div class="between">
        <h2 style="font-size:18px">${participants.length} participantes</h2>
        <button class="btn btn-ghost btn-sm" id="export-csv">${I("download")} CSV</button>
      </div>
      <div class="field mt"><div class="input-wrap">${I("search")}<input class="input has-icon" id="user-search" placeholder="Buscar participante…"></div></div>
      <div class="card" id="user-list" style="padding:0"></div>`;

    const listEl = $("#user-list", body);
    const draw = (term = "") => {
      const filtered = participants.filter((u) => u.name.toLowerCase().includes(term) || (u.email || "").toLowerCase().includes(term));
      listEl.innerHTML = filtered.length ? filtered.map((u) => `
        <div class="list-row">
          <div class="pay-avatar">${UI.initials(u.name)}</div>
          <div class="grow"><div style="font-weight:700">${UI.esc(u.name)}</div><div class="s muted" style="font-size:12px">${UI.esc(u.email || "")}</div></div>
          <div style="text-align:right"><div class="pts" style="font-family:var(--font-display);font-weight:800;color:var(--primary-bright)">${u.points} pts</div></div>
        </div>`).join("") : `<p class="muted center" style="padding:18px">Nenhum participante encontrado.</p>`;
    };
    draw();
    $("#user-search").oninput = (e) => draw(e.target.value.toLowerCase());
    $("#export-csv").onclick = () => exportRankingCSV();
  }

  async function exportRankingCSV() {
    const rows = await DB.getRanking();
    const header = ["Posicao", "Nome", "Email", "Pontos", "Placares_Exatos"];
    const lines = rows.map((r) => [r.position, `"${r.name}"`, r.email || "", r.total, r.exact_count].join(","));
    const csv = "﻿" + header.join(",") + "\n" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ranking-${(state.settings.season_name || "copa").replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    UI.toast("Ranking exportado em CSV! 📄");
  }

  /* ---------- Admin: Configurações ---------- */
  async function adminConfig(body) {
    const s = await DB.getSettings();
    body.innerHTML = `
      <form id="config-form">
        <div class="card">
          <div class="banner info" style="margin-bottom:16px">${I("info")}<div><div class="b-title">Bolão gratuito 💚</div><div class="b-sub">Sem pagamento — todos os participantes entram no ranking.</div></div></div>
          <div class="field"><label>Nome do bolão</label><input class="input" name="app_name" value="${UI.esc(s.app_name || "")}"></div>
          <div class="field"><label>Temporada</label><input class="input" name="season_name" value="${UI.esc(s.season_name || "")}"></div>
          <div class="field">
            <label>Atualização automática (segundos)</label>
            <input class="input" type="number" min="0" name="auto_refresh" value="${s.auto_refresh ?? 30}">
            <p class="dim" style="font-size:12px;margin-top:6px">Telas atualizam sozinhas neste intervalo (0 = desligado). Quando um placar é salvo, o ranking de todos atualiza automaticamente.</p>
          </div>
          <button class="btn btn-primary" type="submit">${I("save")} Salvar configurações</button>
        </div>
      </form>`;
    $("#config-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      try {
        state.settings = await DB.updateSettings({
          app_name: f.app_name.value.trim(),
          season_name: f.season_name.value.trim(),
          auto_refresh: Math.max(0, parseInt(f.auto_refresh.value, 10) || 0),
        });
        UI.toast("Configurações salvas! ⚙️");
        setupAutoRefresh();
        renderApp();
        state.tab = "admin"; state.adminTab = "config"; renderNav(); renderScreen();
      } catch (err) { UI.toast(err.message, "error"); }
    };
  }

  return { init };
})();

// Inicializa quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", App.init);

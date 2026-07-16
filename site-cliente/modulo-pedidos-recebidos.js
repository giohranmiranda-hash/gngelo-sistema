/* =====================================================================
   GN Gelo — Módulo "Pedidos Recebidos" (lado da DONA / sistema de gestão)
   ---------------------------------------------------------------------
   O QUE FAZ:
   • Busca em `pedidos` os registros com status = 'novo' da loja 'gngelo'.
   • Mostra cada pedido (cliente, itens, total, endereço, data desejada)
     num card dourado, com botões [Aceitar] e [Recusar].
   • Badge com o contador de novos pedidos.
   • (Opcional) Realtime: atualiza sozinho quando chega pedido novo.

   COMO ENCAIXAR NO SEU SISTEMA:
   1) Você precisa de um cliente Supabase AUTENTICADO (ou service role).
      O `anon` NÃO consegue ler/atualizar pedidos (a RLS bloqueia) — isso é
      de propósito. Passe o SEU client já logado em `opts.supabase`.
   2) Coloque um container no seu HTML, ex.:  <div id="caixa-pedidos"></div>
      E, se quiser o badge no menu:            <span id="badge-pedidos"></span>
   3) Chame:
        PedidosRecebidos.init({
          supabase: sb,                 // seu client Supabase (autenticado)
          container: "#caixa-pedidos",
          badge: "#badge-pedidos",      // opcional
          onAceitar: (pedido) => {      // opcional: crie a ENTREGA no seu sistema aqui
             // ex.: criarEntregaNoSistema(pedido);
          }
        });
   ===================================================================== */
(function (global) {
  "use strict";

  const LOJA = "gngelo";

  // ---- CSS do módulo (injeta só uma vez) — estilo dourado premium ----
  const CSS = `
  .gnpr-wrap{--g:#C9A84C;--gs:#e6c364;--gn:#46b17b;--rd:#d4604f;
    --pnl:#16150f;--pnl2:#1c1b13;--bd:#2a2820;--tx:#f5f1e6;--mut:#8a8170;
    font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--tx)}
  .gnpr-head{display:flex;align-items:center;gap:10px;margin:0 0 14px}
  .gnpr-head h3{font-size:16px;font-weight:800;letter-spacing:.3px;margin:0}
  .gnpr-badge{background:linear-gradient(180deg,var(--gs),var(--g));color:#1a1508;
    font-weight:800;font-size:12px;min-width:22px;height:22px;border-radius:999px;
    display:inline-flex;align-items:center;justify-content:center;padding:0 7px}
  .gnpr-badge.zero{background:var(--bd);color:var(--mut)}
  .gnpr-refresh{margin-left:auto;background:var(--pnl2);border:1px solid var(--bd);
    color:var(--gs);border-radius:10px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer}
  .gnpr-card{background:linear-gradient(180deg,var(--pnl2),var(--pnl));
    border:1px solid var(--bd);border-radius:16px;padding:14px 16px;margin-bottom:12px;
    border-left:3px solid var(--g)}
  .gnpr-card .top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
  .gnpr-card .cli{font-weight:800;font-size:15px}
  .gnpr-card .cli small{display:block;color:var(--mut);font-weight:500;font-size:12px;margin-top:1px}
  .gnpr-card .tot{text-align:right;white-space:nowrap}
  .gnpr-card .tot b{font-size:18px;color:var(--gs);font-variant-numeric:tabular-nums}
  .gnpr-card .tot small{display:block;color:var(--mut);font-size:10px;text-transform:uppercase;letter-spacing:.1em}
  .gnpr-itens{margin:10px 0;padding:10px 0;border-top:1px dashed var(--bd);border-bottom:1px dashed var(--bd);
    font-size:13px;line-height:1.7}
  .gnpr-itens .q{color:var(--gs);font-weight:700}
  .gnpr-meta{font-size:12.5px;color:var(--mut);line-height:1.6}
  .gnpr-meta b{color:var(--tx)}
  .gnpr-meta a{color:var(--gs);text-decoration:none}
  .gnpr-actions{display:flex;gap:10px;margin-top:12px}
  .gnpr-btn{flex:1;border:none;border-radius:12px;padding:11px;font-weight:800;font-size:14px;cursor:pointer;
    transition:transform .1s,filter .12s}
  .gnpr-btn:active{transform:scale(.97)}
  .gnpr-btn:disabled{opacity:.5;cursor:default}
  .gnpr-accept{background:linear-gradient(180deg,#57c98d,var(--gn));color:#062012}
  .gnpr-reject{background:var(--pnl2);border:1px solid var(--rd);color:var(--rd)}
  .gnpr-empty{color:var(--mut);text-align:center;padding:24px 0;font-size:13px}
  `;

  function injectCSS() {
    if (document.getElementById("gnpr-css")) return;
    const s = document.createElement("style");
    s.id = "gnpr-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const fmt = (v) => BRL.format(Number(v) || 0);

  function fmtData(iso) {
    if (!iso) return "—";
    const [y, m, d] = String(iso).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
      weekday: "short", day: "2-digit", month: "long",
    });
  }
  function zap(whats) {
    const n = String(whats || "").replace(/\D/g, "");
    return n ? `https://wa.me/55${n.replace(/^55/, "")}` : "#";
  }

  const PedidosRecebidos = {
    _opts: null,
    _channel: null,

    async init(opts) {
      injectCSS();
      this._opts = opts || {};
      if (!this._opts.supabase) {
        console.error("[PedidosRecebidos] passe opts.supabase (client autenticado).");
        return;
      }
      const el = document.querySelector(this._opts.container);
      if (!el) { console.error("[PedidosRecebidos] container não encontrado."); return; }

      el.innerHTML = `
        <div class="gnpr-wrap">
          <div class="gnpr-head">
            <h3>🧾 Pedidos recebidos</h3>
            <span class="gnpr-badge zero" id="gnpr-count">0</span>
            <button class="gnpr-refresh" id="gnpr-refresh">Atualizar</button>
          </div>
          <div id="gnpr-list"></div>
        </div>`;
      el.querySelector("#gnpr-refresh").addEventListener("click", () => this.carregar());

      await this.carregar();
      this._subscribe(); // realtime opcional (silencioso se não habilitado)
    },

    async carregar() {
      const sb = this._opts.supabase;
      const list = document.querySelector(this._opts.container + " #gnpr-list");
      list.innerHTML = `<div class="gnpr-empty">Carregando...</div>`;
      try {
        const { data, error } = await sb
          .from("pedidos")
          .select("*")
          .eq("loja", LOJA)
          .eq("status", "novo")
          .order("criado_em", { ascending: false });
        if (error) throw error;
        this._render(data || []);
      } catch (e) {
        console.error(e);
        list.innerHTML = `<div class="gnpr-empty">Erro ao carregar pedidos.<br>${e.message || ""}</div>`;
      }
    },

    _render(pedidos) {
      const list = document.querySelector(this._opts.container + " #gnpr-list");
      this._setBadge(pedidos.length);

      if (!pedidos.length) {
        list.innerHTML = `<div class="gnpr-empty">Nenhum pedido novo por enquanto. ✨</div>`;
        return;
      }

      list.innerHTML = pedidos.map((p) => {
        const itens = Array.isArray(p.itens) ? p.itens : [];
        const itensHTML = itens
          .map((it) => `<div><span class="q">${it.qtd}×</span> ${it.nome}</div>`)
          .join("");
        const maps = (p.lat && p.lng)
          ? ` · <a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">📍 mapa</a>`
          : "";
        return `
        <div class="gnpr-card" data-id="${p.id}">
          <div class="top">
            <div class="cli">${escapeHTML(p.cliente || "Cliente")}
              <small><a href="${zap(p.whatsapp)}" target="_blank" rel="noopener">${escapeHTML(p.whatsapp || "")}</a></small>
            </div>
            <div class="tot"><small>Total</small><b>${fmt(p.total)}</b></div>
          </div>
          <div class="gnpr-itens">${itensHTML || "<i>sem itens</i>"}</div>
          <div class="gnpr-meta">
            📅 <b style="text-transform:capitalize">${fmtData(p.data_desejada)}</b><br>
            📦 ${escapeHTML(p.endereco || "—")}${maps}
            ${p.obs ? `<br>📝 ${escapeHTML(p.obs)}` : ""}
          </div>
          <div class="gnpr-actions">
            <button class="gnpr-btn gnpr-accept" data-act="aceitar" data-id="${p.id}">✓ Aceitar</button>
            <button class="gnpr-btn gnpr-reject" data-act="recusar" data-id="${p.id}">✕ Recusar</button>
          </div>
        </div>`;
      }).join("");

      // Liga os botões
      list.querySelectorAll(".gnpr-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const pedido = pedidos.find((x) => String(x.id) === String(id));
          if (btn.dataset.act === "aceitar") this._aceitar(pedido, btn);
          else this._recusar(pedido, btn);
        });
      });
    },

    async _aceitar(pedido, btn) {
      const card = btn.closest(".gnpr-card");
      card.querySelectorAll(".gnpr-btn").forEach((b) => (b.disabled = true));
      btn.textContent = "Aceitando...";
      try {
        // 1) (opcional) cria a ENTREGA no sistema da dona
        if (typeof this._opts.onAceitar === "function") {
          await this._opts.onAceitar(pedido);
        }
        // 2) marca o pedido como aceito (precisa de client autenticado/service role)
        await this._setStatus(pedido.id, "aceito");
        this._remove(card);
      } catch (e) {
        console.error(e);
        alert("Não foi possível aceitar o pedido: " + (e.message || e));
        card.querySelectorAll(".gnpr-btn").forEach((b) => (b.disabled = false));
        btn.textContent = "✓ Aceitar";
      }
    },

    async _recusar(pedido, btn) {
      if (!confirm("Recusar este pedido?")) return;
      const card = btn.closest(".gnpr-card");
      card.querySelectorAll(".gnpr-btn").forEach((b) => (b.disabled = true));
      btn.textContent = "Recusando...";
      try {
        if (typeof this._opts.onRecusar === "function") await this._opts.onRecusar(pedido);
        await this._setStatus(pedido.id, "recusado");
        this._remove(card);
      } catch (e) {
        console.error(e);
        alert("Não foi possível recusar: " + (e.message || e));
        card.querySelectorAll(".gnpr-btn").forEach((b) => (b.disabled = false));
        btn.textContent = "✕ Recusar";
      }
    },

    async _setStatus(id, status) {
      const { error } = await this._opts.supabase
        .from("pedidos")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },

    _remove(card) {
      card.style.transition = "opacity .25s, transform .25s";
      card.style.opacity = "0";
      card.style.transform = "translateX(20px)";
      setTimeout(() => {
        card.remove();
        const list = document.querySelector(this._opts.container + " #gnpr-list");
        const n = list.querySelectorAll(".gnpr-card").length;
        this._setBadge(n);
        if (n === 0) list.innerHTML = `<div class="gnpr-empty">Nenhum pedido novo por enquanto. ✨</div>`;
      }, 250);
    },

    _setBadge(n) {
      const c = document.querySelector(this._opts.container + " #gnpr-count");
      if (c) { c.textContent = n; c.classList.toggle("zero", n === 0); }
      if (this._opts.badge) {
        const b = document.querySelector(this._opts.badge);
        if (b) { b.textContent = n > 0 ? n : ""; b.style.display = n > 0 ? "" : "none"; }
      }
    },

    // Realtime opcional: recarrega quando entra pedido novo.
    // Requer habilitar Realtime na tabela (ver supabase.sql, seção 5).
    _subscribe() {
      try {
        this._channel = this._opts.supabase
          .channel("pedidos-novos")
          .on("postgres_changes",
            { event: "INSERT", schema: "public", table: "pedidos", filter: `loja=eq.${LOJA}` },
            () => this.carregar())
          .subscribe();
      } catch (e) { /* Realtime desabilitado — segue no botão Atualizar */ }
    },
  };

  // Escapa HTML pra evitar injeção via campos do cliente
  function escapeHTML(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  global.PedidosRecebidos = PedidosRecebidos;
})(window);

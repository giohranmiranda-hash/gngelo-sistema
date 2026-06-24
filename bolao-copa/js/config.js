/* =====================================================================
   CONFIGURAÇÃO
   ---------------------------------------------------------------------
   Preencha SUPABASE_URL e SUPABASE_ANON_KEY com os dados do seu projeto
   (painel Supabase > Project Settings > API).

   • Se os dois campos estiverem preenchidos, o app usa o Supabase.
   • Se ficarem vazios, o app roda em MODO DEMO (dados no localStorage),
     permitindo testar tudo sem backend.

   Bolão GRATUITO — sem pagamento. Veja o README.md.
   ===================================================================== */

window.APP_CONFIG = {
  // === Supabase ===
  SUPABASE_URL: "",       // ex.: "https://xxxxxxxx.supabase.co"
  SUPABASE_ANON_KEY: "",  // ex.: "eyJhbGciOi..."

  // === Identidade do bolão (também editável pelo admin) ===
  APP_NAME: "Bolão Brasil",
  SEASON_NAME: "Copa do Mundo 2026",

  // === E-mail tratado como ADMIN no modo demo ===
  // (No Supabase, o admin é definido pela coluna is_admin na tabela profiles.)
  DEMO_ADMIN_EMAIL: "admin@bolao.com",
};

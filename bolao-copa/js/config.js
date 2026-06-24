/* =====================================================================
   CONFIGURAÇÃO
   ---------------------------------------------------------------------
   • Preencha SUPABASE_URL e SUPABASE_ANON_KEY para usar o Supabase.
   • Vazio = MODO DEMO (dados no localStorage).
   • Login é por NOME DE USUÁRIO (não e-mail).
   ===================================================================== */

window.APP_CONFIG = {
  // === Supabase ===
  SUPABASE_URL: "",       // ex.: "https://xxxxxxxx.supabase.co"
  SUPABASE_ANON_KEY: "",  // ex.: "eyJhbGciOi..."

  // === Identidade do bolão (editável pelo admin) ===
  APP_NAME: "Bolão Brasil",
  SEASON_NAME: "Copa do Mundo 2026",

  // === Login por usuário ===
  // O Supabase Auth exige e-mail internamente; o usuário entra só com o
  // nome de usuário e o sistema usa "usuario@este-dominio" por baixo.
  USERNAME_EMAIL_DOMAIN: "bolao.local",

  // Usuário tratado como ADMIN no modo demo:
  DEMO_ADMIN_USER: "admin",
};

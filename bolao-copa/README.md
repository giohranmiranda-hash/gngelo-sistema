# 🇧🇷 Bolão Brasil — Copa do Mundo 2026

Sistema completo de **bolão da Copa focado nos jogos do Brasil**, **gratuito** (sem pagamento). Cada participante faz login, dá seus palpites, e o sistema calcula a pontuação e o ranking **automaticamente** — inclusive **atualizando sozinho quando um jogo acaba**. Design estilo Copa do Mundo (tema escuro "Champion's Field").

> **Funciona em 2 modos:**
> - **Modo Demo** (padrão): roda direto no navegador, dados no `localStorage`. Ótimo para testar.
> - **Modo Produção**: conectado ao **Supabase** (login + banco). Basta preencher as credenciais em `js/config.js`.

---

## ✨ Funcionalidades

- 🔐 **Login e cadastro por nome de usuário** (sem e-mail). Cada usuário só vê/edita os próprios palpites; admin vê tudo.
- ⚽ **Jogos reais do Brasil** (Copa 2026, Grupo C): adversário, data/horário, fase, status e placar oficial.
- 🎯 **Palpites** com trava automática: só é possível palpitar **antes do início do jogo**. Histórico por usuário.
- 🧮 **Pontuação automática** ao registrar o placar oficial: calcula vencedor, pontos e rankings.
- 🔄 **Atualização automática quando o jogo acaba**: assim que o placar é salvo, o ranking de **todos** atualiza ao vivo (Supabase Realtime) + atualização periódica configurável — sem precisar recarregar a página.
- 🏆 **Ranking** por rodada e geral, com pódio e medalhas para o top 3.
- 🛠️ **Painel Admin**: cadastrar/editar jogos, inserir placar oficial, ver participantes, resetar rodada, exportar **CSV** e configurar o bolão.
- 📱 **Responsivo** mobile-first nas cores da Copa.

### 📊 Regras de pontuação
| Acerto | Pontos |
|---|---|
| Placar exato | **10** |
| Vencedor / empate | 5 |
| Gols do Brasil | 2 |
| Gols do adversário | 2 |
| Errou tudo | 0 |

> O placar exato (10) **não soma** com as parciais.

### 🗓️ Jogos do Brasil já incluídos (Grupo C — Copa 2026)
- 🇧🇷 Brasil **1 x 1** Marrocos 🇲🇦 — 13/06 (finalizado)
- 🇧🇷 Brasil **3 x 0** Haiti 🇭🇹 — 19/06 (finalizado)
- 🇧🇷 Brasil x Escócia 🏴 — 24/06, 19h (Brasília) — aberto

Novos jogos (oitavas, quartas etc.) são adicionados pelo admin conforme a Copa avança.

---

## 📁 Estrutura

```
bolao-copa/
├── index.html          # Página única (SPA)
├── css/styles.css      # Tema escuro "Champion's Field"
├── js/
│   ├── config.js       # ⚙️ Credenciais do Supabase (edite aqui)
│   ├── scoring.js      # Regras de pontuação
│   ├── ui.js           # Ícones, toasts, modais
│   ├── db.js           # Dados (Supabase OU demo) + tempo real
│   └── app.js          # Telas, navegação, auto-atualização
├── supabase/
│   ├── schema.sql      # Tabelas, RLS, gatilhos, view, realtime
│   ├── seed.sql        # Jogos reais do Brasil
│   ├── cron.sql        # Agendamento da sincronização automática
│   └── functions/
│       └── sync-brazil/index.ts   # Edge Function: busca placares na API
└── README.md
```

---

## ▶️ Rodar localmente (modo demo)

```bash
cd bolao-copa
python3 -m http.server 8080
# abra http://localhost:8080
```

**Contas de teste (usuário / senha):**
- Admin: `admin` / `admin123`
- Participante: `mariana` / `123456`

> Para zerar os dados de demonstração: console do navegador → `localStorage.clear()`.
> Dica: abra duas abas (uma como admin, outra como participante). Ao salvar um placar no admin, a outra aba **atualiza sozinha**. 🔄

---

## 🟢 Conectar ao Supabase (produção)

1. **Crie o projeto** em [supabase.com](https://supabase.com) → *New project*.
2. **Crie as tabelas**: SQL Editor → cole `supabase/schema.sql` → *Run*. Depois cole `supabase/seed.sql` → *Run*.
3. **Pegue as credenciais** em *Project Settings → API* (Project URL e anon public key).
4. **Configure** em `js/config.js`:
   ```js
   window.APP_CONFIG = {
     SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
     SUPABASE_ANON_KEY: "SUA-ANON-KEY",
     // ...
   };
   ```
5. **Login por usuário**: o app já entra só com nome de usuário e senha. Por baixo, o Supabase Auth usa `usuario@bolao.local` (configurável em `config.js`). Em *Authentication → Providers → Email*, **desative "Confirm email"** (senão o cadastro fica pendente de confirmação, e esses e-mails internos não existem de verdade).
6. **Defina o admin**: cadastre-se pelo app e rode no SQL Editor:
   ```sql
   update public.profiles set is_admin = true where username = 'seuusuario';
   ```

O `schema.sql` já habilita o **Supabase Realtime** em `matches` e `predictions` — é o que faz o placar e o ranking atualizarem ao vivo para todos quando um jogo acaba.

---

## 🤖 Placar automático (o jogo acaba e o sistema atualiza sozinho)

O sistema busca o **resultado oficial do Brasil** numa API de futebol e atualiza o placar; o gatilho do banco recalcula os pontos e o Realtime avisa todo mundo. Funciona no modo **Supabase**. Passos:

1. **Pegue um token grátis** em [football-data.org](https://www.football-data.org/) → crie conta → *My Account* (copie o API Token).
2. **Instale a CLI do Supabase** e faça login (uma vez):
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref SEU-PROJETO
   ```
3. **Configure o token e publique a função** (`supabase/functions/sync-brazil`):
   ```bash
   supabase secrets set FOOTBALL_API_TOKEN=seu_token_aqui
   supabase functions deploy sync-brazil --no-verify-jwt
   ```
4. **Agende o cron** (roda sozinho a cada 5 min): abra `supabase/cron.sql`, troque `<SEU-PROJETO>` e `<ANON-KEY>`, e rode no SQL Editor.
5. Pronto! Quando um jogo do Brasil termina, o placar entra automaticamente. No painel admin há também o botão **"Sincronizar resultados"** para forçar a atualização na hora.

> Sem essa configuração, o bolão continua 100% funcional: o admin lança o placar com 1 toque e o ranking de todos atualiza ao vivo.
> O app, quando em produção, também tenta sincronizar sozinho ao detectar um jogo que já passou do horário (rede de segurança além do cron).

---

## 🚀 Publicar no Netlify

O projeto já tem um **`netlify.toml` na raiz** apontando para a pasta `bolao-copa`. Conectando o repositório ao Netlify, ele publica o bolão automaticamente (sem build).

- **Deploy manual:** [app.netlify.com/drop](https://app.netlify.com/drop) → arraste a pasta `bolao-copa`.
- **Conectado ao Git:** *Add new site → Import* → selecione o repositório. O `netlify.toml` da raiz já define `publish = "bolao-copa"`. A cada `git push`, republica.

> A `SUPABASE_ANON_KEY` é pública por natureza (feita para o front-end). A segurança vem das políticas **RLS** do `schema.sql`.

---

## 🔒 Segurança (resumo)

- Usuário comum **não** altera placar oficial nem pontos (escrita em `matches` só p/ admin; `points` calculado por **gatilho**).
- Palpite só é aceito **antes do jogo** (gatilho `score_prediction`).
- Cada um só insere/edita os próprios palpites (RLS).

---

Feito com 💚💛 para a torcida do Brasil. Boa sorte no bolão! 🏆

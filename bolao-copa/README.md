# 🇧🇷 Bolão Brasil — Copa do Mundo

Sistema completo de **bolão da Copa focado nos jogos do Brasil**. Cada participante faz login, dá seus palpites, e o sistema calcula a pontuação, o ranking da rodada e o ranking geral **automaticamente**. Inclui painel administrativo, controle de pagamentos via Pix e design estilo Copa do Mundo (tema escuro "Champion's Field").

> **Funciona em 2 modos:**
> - **Modo Demo** (padrão): roda direto no navegador, dados salvos no `localStorage`. Ótimo para testar sem backend.
> - **Modo Produção**: conectado ao **Supabase** (auth + banco de dados). Basta preencher as credenciais em `js/config.js`.

---

## ✨ Funcionalidades

- 🔐 **Login e cadastro** por e-mail/senha. Cada usuário só vê/edita os próprios palpites; admin vê tudo.
- ⚽ **Jogos do Brasil**: adversário, data/horário, fase, status (aberto/encerrado/finalizado), placar oficial e vencedor automático.
- 🎯 **Palpites** com trava automática: só é possível palpitar **antes do início do jogo**. Histórico de palpites por usuário.
- 🧮 **Pontuação automática** ao inserir o placar oficial: calcula vencedor, pontos, ranking da rodada e ranking geral.
- 🏆 **Ranking** por rodada e geral, com pódio e medalhas para o top 3, pontos e nº de placares exatos.
- 💰 **Bolão valendo dinheiro** (ativável pelo admin): valor de entrada, Pix (chave + copia e cola + QR), envio de comprovante e status (pendente/pago/recusado). Só entra no ranking oficial quem está **pago**.
- 🛠️ **Painel Admin**: cadastrar/editar jogos, inserir placar oficial, aprovar pagamentos, ver participantes, resetar rodada, exportar ranking em **CSV** e configurar o bolão.
- 📱 **Design responsivo** mobile-first nas cores da Copa (verde, amarelo, azul e branco).

### 📊 Regras de pontuação
| Acerto | Pontos |
|---|---|
| Placar exato | **10** |
| Vencedor / empate | 5 |
| Gols do Brasil | 2 |
| Gols do adversário | 2 |
| Errou tudo | 0 |

> O placar exato (10) **não soma** com as parciais. O máximo sem ser exato é 9 pts.

---

## 📁 Estrutura do projeto

```
bolao-copa/
├── index.html              # Página única (SPA)
├── css/styles.css          # Tema escuro "Champion's Field"
├── js/
│   ├── config.js           # ⚙️ Credenciais do Supabase (edite aqui)
│   ├── scoring.js          # Regras de pontuação
│   ├── ui.js               # Ícones, toasts, modais, formatadores
│   ├── db.js               # Camada de dados (Supabase OU demo local)
│   └── app.js              # Telas, navegação e ações
├── supabase/
│   ├── schema.sql          # Tabelas, RLS, gatilhos e view de ranking
│   └── seed.sql            # Jogos de exemplo (opcional)
├── netlify.toml            # Configuração de deploy
└── README.md
```

---

## ▶️ Rodar localmente (modo demo)

Não precisa de instalação. Como o navegador bloqueia `import`/`fetch` em `file://`, sirva a pasta com um servidor estático simples:

```bash
cd bolao-copa
python3 -m http.server 8080
# abra http://localhost:8080
```

**Contas de teste (modo demo):**
- Admin: `admin@bolao.com` / `admin123`
- Participante: `mariana@demo.com` / `123456`

> Para zerar os dados de demonstração, abra o console do navegador e rode `localStorage.clear()`.

---

## 🟢 Conectar ao Supabase (produção)

### 1. Criar o projeto
1. Acesse [supabase.com](https://supabase.com) → **New project**.
2. Escolha nome, senha do banco e região. Aguarde provisionar.

### 2. Criar as tabelas
1. No menu lateral: **SQL Editor** → **New query**.
2. Cole **todo** o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
3. (Opcional) Cole e rode [`supabase/seed.sql`](supabase/seed.sql) para criar jogos de exemplo.

Isso cria as tabelas `profiles`, `matches`, `predictions`, `payments`, `settings`, além dos gatilhos de pontuação automática, da view `v_ranking` e das políticas de segurança (RLS).

### 3. Pegar as credenciais
Em **Project Settings → API**, copie:
- **Project URL** → `SUPABASE_URL`
- **anon public key** → `SUPABASE_ANON_KEY`

### 4. Configurar o app
Edite [`js/config.js`](js/config.js):

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "SUA-ANON-KEY",
  // ...
};
```

Pronto — ao recarregar, o app passa a usar o Supabase automaticamente (o aviso de "Modo Demo" desaparece).

### 5. Definir o administrador
Cadastre-se normalmente pelo app e depois, no **SQL Editor**, promova seu usuário:

```sql
update public.profiles set is_admin = true
where email = 'voce@email.com';
```

### 6. (Opcional) Confirmação de e-mail
Por padrão o Supabase pede confirmação de e-mail. Para testes rápidos, desative em **Authentication → Providers → Email → "Confirm email"**.

### 7. (Opcional) Comprovantes de pagamento via Storage
O envio de comprovante registra o **nome do arquivo**. Para guardar a imagem de fato:
1. Crie um bucket em **Storage** (ex.: `comprovantes`).
2. Faça upload no `submitPayment` (em `js/db.js`) e salve a URL pública em `receipt_url`.

---

## 🚀 Publicar no Netlify

Como é um site **estático** (sem build), o deploy é direto.

### Opção A — Deploy manual (mais rápido)
1. Acesse [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**.
2. Arraste a pasta `bolao-copa` para a área de upload.
3. Pronto! O site fica no ar em segundos.

### Opção B — Conectado ao Git (deploy automático)
1. **Add new site → Import an existing project** e conecte o repositório.
2. Configure:
   - **Base directory**: `bolao-copa`
   - **Build command**: *(deixe vazio)*
   - **Publish directory**: `bolao-copa`
3. **Deploy site**. A cada `git push`, o Netlify republica.

> ⚠️ A `SUPABASE_ANON_KEY` é pública por natureza (feita para o front-end). A segurança real vem das políticas **RLS** definidas no `schema.sql` — por isso elas são essenciais.

---

## 🔒 Segurança (resumo)

- Usuário comum **não** altera placar oficial nem pontos (tabela `matches` só tem policy de escrita para admin; `points`/`is_exact` são calculados por **gatilho** no banco).
- Palpite só é aceito **antes do jogo** (validado por gatilho `score_prediction`).
- Cada um só insere/edita os próprios palpites e o próprio pagamento (RLS).
- Admin é controlado pela coluna `profiles.is_admin`.

---

Feito com 💚💛 para a torcida do Brasil. Boa sorte no bolão! 🏆

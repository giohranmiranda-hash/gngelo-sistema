# GN Gelo — Site de Pedidos do Cliente 🍧

PWA (site instalável) onde o **cliente final** monta o próprio pedido pelo celular.
O pedido cai direto na tabela `pedidos` do Supabase, e a dona aceita pelo painel de gestão.

> Este é um site **separado** do sistema de gestão. Tudo dele vive nesta pasta `site-cliente/`.

---

## 📁 Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app do cliente (HTML + CSS + JS embutidos, vanilla). |
| `manifest.json` | Metadados do PWA (nome, ícones, cores). |
| `sw.js` | Service worker — cache offline básico do app. |
| `_headers` | Cabeçalhos de segurança + CSP (para Netlify). |
| `icon-*.png`, `icon.svg`, `logo-gngelo.png` | Ícones da marca. |
| `supabase.sql` | SQL da tabela `pedidos` + policies RLS. **Rode primeiro.** |
| `modulo-pedidos-recebidos.js` | Módulo "Pedidos recebidos" pra colar no sistema de gestão. |

---

## ✅ Passo a passo

### 1) Banco de dados (Supabase)
1. Abra o projeto no Supabase → **SQL Editor**.
2. Cole e rode o conteúdo de **`supabase.sql`**.
3. Isso cria a tabela `pedidos`, ativa RLS e libera **só INSERT** pro cliente (`anon`).
   - O cliente **não** consegue ler pedidos dos outros. ✔️
   - O status nasce sempre como `novo` (não dá pra forjar). ✔️

### 2) Configurar o app (`index.html`)
No topo do `<script>` tem um bloco **⚙️ CONFIGURAÇÃO**. Ajuste:

```js
const LOJA_WHATSAPP = "5599999999999"; // ⚠️ WhatsApp da loja: 55 + DDD + número (só dígitos)
const PRECO_UN = 1.10;                 // preço por unidade dos sabores avulsos
const PRECO_COMBO = { "combo-10":10.00, "combo-20":18.00, "combo-50":45.00, "combo-100":85.00 };
```

- **`LOJA_WHATSAPP`** é o único obrigatório de trocar (hoje está com um número de exemplo).
- `SUPABASE_URL` / `SUPABASE_ANON` já vêm preenchidos com o projeto certo.
- Preços e catálogo de sabores também ficam nesse bloco.

### 3) Publicar no Netlify
**Opção A — arrastar e soltar (mais rápido):**
1. Entre em [app.netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually**.
2. Arraste a pasta **`site-cliente/`** inteira pra área de upload.
3. Pronto — o Netlify te dá uma URL tipo `https://gngelo-pedidos.netlify.app`.
4. (Opcional) **Site settings → Change site name** pra deixar a URL bonita.

**Opção B — via Git (deploy automático):**
1. Netlify → **Add new site → Import from Git** → escolha este repositório.
2. Em **Build settings**:
   - **Base directory:** `site-cliente`
   - **Build command:** *(deixe vazio — é site estático)*
   - **Publish directory:** `site-cliente`
3. Deploy. A cada `git push`, o Netlify republica sozinho.

> O arquivo `_headers` (a CSP) é aplicado **automaticamente** pelo Netlify. Não precisa configurar nada à mão.

### 4) Divulgar
Cole a URL do Netlify na **bio do Instagram** e mande no **WhatsApp**.
O cliente abre no celular e pode **instalar** o app ("Adicionar à tela inicial").

### 5) Receber os pedidos (lado da dona)
No sistema de gestão, cole o módulo **`modulo-pedidos-recebidos.js`** e chame:

```html
<div id="caixa-pedidos"></div>
<script src="modulo-pedidos-recebidos.js"></script>
<script>
  PedidosRecebidos.init({
    supabase: sb,               // seu client Supabase JÁ AUTENTICADO (login da dona)
    container: "#caixa-pedidos",
    badge: "#badge-pedidos",    // opcional: <span id="badge-pedidos"></span> no menu
    onAceitar: (pedido) => {
      // crie a ENTREGA no seu sistema aqui, ex.:
      // criarEntregaAPartirDoPedido(pedido);
    }
  });
</script>
```

> ⚠️ **Importante:** ler e atualizar pedidos exige um client **autenticado** (login da dona)
> ou a **service role**. O `anon` do site do cliente **não** tem esse acesso — é de propósito.
> Se o seu painel já usa login Supabase, descomente as policies da **seção 4** do `supabase.sql`.

---

## 🔒 Segurança em resumo
- **Cliente (`anon`)**: só consegue **criar** pedido. Não lê, não edita, não apaga.
- **Status travado**: todo pedido nasce `novo`; a dona muda pra `aceito`/`recusado`/`entregue`.
- **CSP** restrita: o app só fala com Supabase, ViaCEP, LocationIQ e Nominatim.
- **LGPD**: o app avisa o cliente que os dados são usados só pra entrega.

## 🧪 Testar localmente
```bash
cd site-cliente
python3 -m http.server 8080
# abra http://localhost:8080 no celular (mesma rede) ou no navegador
```
> Service worker e `insert` no Supabase funcionam em `http://localhost`. Em produção, o Netlify já serve por HTTPS.

## 🗺️ Fase 2 (já preparado)
- Pagamento online (hoje é **na entrega**).
- Notificação push de novos pedidos.
- Mapa com a rota das entregas (a CSP já libera as tiles do OpenStreetMap).

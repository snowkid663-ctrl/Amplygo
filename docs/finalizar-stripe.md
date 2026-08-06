# Finalizar o tracking de vendas com Stripe (NovaVision)

O lado da AmplyGo **já está pronto e testado**. Pra ligar de verdade na
NovaVision, faltam 3 passos do seu lado. Leva ~15 min.

## Como funciona (resumo)
1. Cada criador recebe um link único: `amplygo.com/r/<code>`.
2. Esse link redireciona pro seu produto com `?ref=<code>`.
3. No checkout, você guarda esse `ref` e passa pro Stripe.
4. O Stripe avisa a AmplyGo (webhook) → a venda é creditada ao criador certo.
5. Aparece no painel da campanha em **"Verified sales"** (receita real por criador).

---

## Passo 1 — Definir a URL do produto na campanha
Ao criar a campanha na AmplyGo, preencha **"Product / landing URL"** com a página
pra onde o criador manda o público (ex.: `https://novavision.com/`).
Sem isso, o link de rastreio não redireciona.

## Passo 2 — Guardar o `ref` e mandar pro Stripe (no seu backend)
Quando alguém cai no seu site com `?ref=...`, salve num cookie (dura ~30 dias).
Na hora de criar a sessão de checkout no Stripe, passe esse valor:

```js
// 1) Na landing (qualquer página de entrada): salvar o ref
const ref = new URLSearchParams(location.search).get("ref");
if (ref) document.cookie = `amplygo_ref=${ref}; Max-Age=2592000; Path=/`;

// 2) No backend, ao criar o checkout:
const ref = readCookie("amplygo_ref"); // do request do cliente
const session = await stripe.checkout.sessions.create({
  mode: "payment", // ou "subscription"
  line_items: [/* ...seus itens... */],
  success_url: "https://novavision.com/obrigado",
  cancel_url: "https://novavision.com/",
  client_reference_id: ref || undefined,   // <-- o carimbo do criador
  // alternativa: metadata: { amplygo_ref: ref }
});
```

> É só isso de código. O `client_reference_id` é o campo oficial do Stripe pra
> esse tipo de rastreio.

### Funil com várias páginas / criação de conta (caso NovaVision)
A URL da campanha é só a **entrada** — pode ser qualquer página. Não precisa
cadastrar 2 URLs. O que importa é o `ref` **sobreviver** até o checkout, mesmo
passando por landing → site → criar conta → planos → Stripe.

Como o seu funil **exige criar conta antes de pagar**, o jeito mais robusto é
**grudar o `ref` na conta** (melhor que só cookie — sobrevive a outro dispositivo
e a cookie expirado):

```
landing (?ref)  → salva ref num cookie (.novavision.com, 30–90 dias)
   → criar conta → grava user.amplygo_ref = ref  (no seu banco)
   → escolher plano → checkout: client_reference_id = user.amplygo_ref
```

```js
// no cadastro
await db.users.update(userId, { amplygo_ref: readCookie("amplygo_ref") || null });

// no checkout (lê da conta; cai pro cookie se faltar)
const ref = user.amplygo_ref || readCookie("amplygo_ref") || undefined;
const session = await stripe.checkout.sessions.create({ /* ... */, client_reference_id: ref });
```

> **Domínios diferentes?** Se a landing e o app estão em domínios distintos
> (ex.: `novavision.com` vs `app.novavision.com`), use `Domain=.novavision.com`
> no cookie pra valer nos subdomínios; se forem domínios totalmente diferentes,
> passe o `ref` na URL ao pular de um site pro outro.

## Passo 3 — Criar o webhook no Stripe
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://amplygo.com/api/webhooks/stripe`
3. Evento: **`checkout.session.completed`** (pode marcar só esse).
4. Salve e copie o **Signing secret** (começa com `whsec_...`).
5. No **Render** (serviço `amplygo`) → **Environment** → adicione:
   - `STRIPE_WEBHOOK_SECRET` = o `whsec_...`
6. Save (o Render redeploya).

---

## Testar
1. Crie uma campanha com a URL do produto.
2. Como criador, entre na campanha e copie o seu **tracking link**.
3. Abra o link → deve cair no seu site com `?ref=...`.
4. Faça uma compra de teste (modo test do Stripe).
5. Veja a venda aparecer em **Verified sales** na campanha.

Dica: no Stripe dá pra usar o **modo de teste** + o botão "Send test webhook"
pra validar sem compra real.

## Observações
- A `STRIPE_WEBHOOK_SECRET` fica **só no Render** (nunca no código/repo público).
- A assinatura de cada webhook é **verificada** antes de gravar a venda — chamadas
  falsas são rejeitadas (HTTP 400).
- Vendas são idempotentes (o mesmo checkout não conta duas vezes).
- Detalhe técnico completo: [features/sales-tracking.md](features/sales-tracking.md).

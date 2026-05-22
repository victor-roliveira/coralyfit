# Coraly Fit - Arquitetura do MVP

## Objetivo

A Coraly Fit sera um e-commerce mobile-first para roupas de academia, com checkout externo via AbacatePay, autenticacao Supabase, painel administrativo protegido e atualizacoes em tempo real para pedidos.

## Stack

- Next.js App Router com TypeScript.
- Supabase Auth, Postgres, Storage e Realtime.
- Shadcn/ui como base de componentes.
- AbacatePay v2 para checkout hospedado.
- Tailwind CSS com a paleta `#FFFFFF`, `#6367FF`, `#8494FF`, `#C9BEFF`.

## Organizacao

```txt
src/
  app/                 Rotas, layouts, route handlers e server actions
  components/          Componentes compartilhados e Shadcn-style UI
  features/            Dominios da aplicacao: catalogo, carrinho, auth, admin
  hooks/               Hooks reutilizaveis de client components
  lib/                 Clientes, env, seguranca, helpers e services
  types/               Tipos compartilhados
supabase/
  migrations/          Schema, RLS, funcoes e seeds iniciais
docs/
  architecture.md      Decisoes tecnicas do projeto
```

## Modelo de dados

Tabelas principais:

- `profiles`: espelha `auth.users`, guarda nome, avatar e role (`customer` ou `admin`).
- `categories`: categorias administraveis.
- `products`: produto comercial, preco em centavos, imagens como `text[]` com URLs do Supabase Storage e status ativo.
- `product_variants`: combinacao de tamanho e cor com estoque proprio.
- `orders`: pedido do usuario, total, status operacional, status de pagamento e dados do checkout AbacatePay.
- `order_items`: snapshot dos itens comprados, preservando nome/preco mesmo se o produto mudar.
- `stock_reservations`: reservas temporarias de estoque por pedido e variacao.

## Estoque e concorrencia

O estoque usa duas colunas por variacao: `stock_quantity` e `reserved_quantity`.

Fluxo recomendado:

1. Usuario inicia checkout.
2. Backend chama uma funcao transacional no Postgres.
3. A funcao bloqueia cada variacao com `FOR UPDATE`.
4. Se `stock_quantity - reserved_quantity` for insuficiente, a transacao falha.
5. Caso contrario, cria pedido `pending_payment` e aumenta `reserved_quantity`.
6. Backend cria o checkout AbacatePay com `externalId = order.id`.
7. Webhook `checkout.completed` valida o segredo e confirma o pagamento.
8. A funcao de confirmacao decrementa `stock_quantity`, reduz `reserved_quantity` e marca reservas como `converted`.

Isso evita vender a mesma variacao para duas pessoas ao mesmo tempo e mantem estoque definitivo apenas apos pagamento aprovado.

## Seguranca

- RLS habilitado em todas as tabelas publicas.
- Clientes anonimos leem apenas produtos ativos e categorias ativas.
- Usuarios leem apenas seus proprios pedidos.
- Admins acessam catalogo completo, usuarios e pedidos por politica baseada em `profiles.role`.
- Rotas administrativas tambem sao protegidas por middleware/server checks.
- Webhooks usam `ABACATEPAY_WEBHOOK_SECRET` e service role somente no servidor.
- Chaves sensiveis nunca usam prefixo `NEXT_PUBLIC_`.
- Rotas sensiveis terao rate limiting incremental no backend.

## AbacatePay

A documentacao atual indica:

- Criar checkout: `POST https://api.abacatepay.com/v2/checkouts/create`.
- Autenticacao: header `Authorization: Bearer <token>`.
- O checkout retorna `data.url`, usada para redirecionar o cliente.
- `externalId` deve apontar para o pedido interno.
- Webhook de pagamento aprovado: `checkout.completed`.
- O webhook pode ser protegido por segredo na query string, por exemplo `?webhookSecret=...`.

## Tempo real

O MVP usara Supabase Realtime:

- Cliente assina alteracoes do proprio pedido em `orders`.
- Admin assina novos pedidos e atualizacoes de status.
- O servidor segue sendo a fonte da verdade; realtime apenas reflete mudancas ja persistidas.

## Fases do MVP

1. Base do projeto, tema, arquitetura, schema e catalogo publico.
2. Auth completa com email/senha, Google, recuperacao e rotas privadas.
3. Checkout com reserva de estoque, criacao do pedido e AbacatePay.
4. Webhook seguro e atualizacao de pedido em tempo real.
5. Painel admin de produtos, categorias, pedidos e dashboard.
6. Polimento: testes, observabilidade, performance, acessibilidade e hardening.

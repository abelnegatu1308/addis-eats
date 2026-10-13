# Addis Eats

Next.js App Router restaurant app with a public dish catalog, signed customer
and staff sessions, owner-scoped order reads, staff-only status updates,
debounced menu search, and polled order status. The security and data boundaries
are documented in [AUTH.md](./AUTH.md) and [DATA.md](./DATA.md).

## Run from a fresh clone

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Local demo accounts are shown on the sign-in
page. With no `DATABASE_URL`, development uses in-memory order and menu stores;
changes to either store are disposable and are never used as production
storage. To persist local orders and menu changes, put the Neon connection
string in the ignored `.env.local` and run `npm run db:migrate`.

For production, configure `DATABASE_URL`, `SESSION_SECRET` (at least 32 random
characters), `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `STAFF_EMAIL`, and
`STAFF_PASSWORD` in the deployment environment. Never use the example values
from `.env.example`.

### Neon setup

Create a Neon Postgres database, save its connection string as `DATABASE_URL`
in the ignored local `.env.local`, and run `npm run db:migrate`. The migration
creates the order and menu tables and seeds the existing dish catalog without
overwriting dishes that are already in the database. Add that same
database URL and the production session/account values to the Vercel project's
Production environment, then redeploy. Keep connection strings and passwords
out of source control and chat.

## Validate

```powershell
npm run lint
npm test
npm run build
npm run start
```

The order-status and ownership tests use the development-only in-memory store.
Production order reads and mutations use Neon Postgres once `DATABASE_URL` is
configured and the schema migration has run.

## Staff dashboard

Sign in at `/admin/login` using the configured staff account. The staff-only
`/admin` dashboard reports order counts, delivered order totals, a seven-day
order trend, and best-selling items from delivered orders. `/admin/orders`
provides paginated search/status filters and the existing validated order
status workflow with Pending, Preparing, and Delivering counts. `/admin/menu`
supports creating, editing, availability toggling, and deleting dishes from the
database-backed public catalog. New dishes get an ID derived from their name;
existing IDs stay stable when editing so historical order snapshots remain
consistent. Dish images are selected from existing local assets, not uploaded.
The dashboard counts "ordering accounts" from distinct
account IDs on orders; it does not imply a full customer directory.

Delivered sales are defined as the `total` on orders whose fulfillment status
is `delivered`; cancelled orders are excluded. The current schema does not
separately represent payment settlement, refunds, discounts, delivery fees,
delivery-completion timestamps, or costs, so the dashboard does not claim
reconciled revenue, profit, delivery analytics, or payment reports. The
customer cancellation button is shown for pending orders only; the server
enforces the same ownership and status restriction. No customer/rider
directory, coupon, notification, inventory, or settings page is exposed.

The existing account system uses a signed HttpOnly session cookie and checks
the staff role on the server. It currently uses configured shared credentials
and has no persistent administrator/staff directory, password reset, granular
roles, or distributed login rate limiter. For production, use a strong unique
staff password and configure rate limiting at the hosting/edge layer before
exposing the login publicly.

## Deployment status

Existing Ready deployment: [addis-eats-eta.vercel.app](https://addis-eats-eta.vercel.app).
It currently serves an earlier build, not the account, authorization, search,
and polling changes in this working tree. Redeployment is intentionally
blocked until a real Neon database is configured/migrated and production
account settings are set. Do not treat the current deployment as production-ready.

## Search and metadata

Menu pages include route-specific metadata, dish pages emit `MenuItem`
structured data, and sitemap/robots routes use the current dish catalog.
Vercel supplies the production origin; on other hosts set `NEXT_PUBLIC_APP_URL`
to the public origin so canonical and social URLs are absolute.

## Order tracking and exports

- `GET /track/[id]` shows the authenticated customer’s delivery page with a Leaflet map, tracking timeline, delivery details, and a live status panel.
- Delivery maps use the stored area as a stable geo anchor because the current schema records the delivery area, not a live courier GPS feed; no fake moving courier positions are generated.
- `GET /api/orders/[id]/stream` streams the current `pending`, `preparing`, `delivering`, `delivered`, and `cancelled` order states back to the customer over SSE. It uses polling because the project does not currently have a persistent shared event bus, keeping it compatible with Vercel serverless deployments.
- The orders history page exposes an export button that downloads a CSV with safe quoting for customer orders and item names.

## Order API

- `GET /api/orders?id=...` requires a signed-in session and returns only an order owned by that account.
- `POST /api/orders` requires a signed-in session, same-origin request, and validated order; item details and totals are derived from the server catalog.
- `PATCH /api/orders?id=...` requires a staff session, same-origin request, and a valid status transition.
- Unauthenticated requests receive `401`; customer status updates receive `403`; foreign or missing order IDs return `404`.
- Order API responses are private and not cached.

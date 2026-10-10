# Authentication and authorization decisions

## Protected-route decision table

| Route or operation | Layer 1: request gate | Layer 2: server identity/role check | Layer 3: operation/data check |
| --- | --- | --- | --- |
| `/checkout` | Proxy requires the signed-in cookie | Page verifies its signature and account | `placeOrder` re-reads the account, validates submitted data and derives ownership on the server |
| `/orders` and `/orders/[id]` | Proxy requires the signed-in cookie | Page verifies its signature and account | The order query is scoped by the account ID; status reads verify ownership |
| `/favorites` | Proxy requires the signed-in cookie | Page verifies its signature and account | Favorite IDs remain a browser-local preference; they are not server-side account data |
| `/kitchen` | Proxy requires the signed-in cookie | Page requires the staff role | Any kitchen mutation rechecks staff role and validates the target record |
| `/admin/login` | Public staff-only sign-in form | Sign-in accepts only the configured staff role | Failed customer credentials do not create an admin session |
| `/admin` and `/admin/orders` | Proxy redirects missing cookies to `/admin/login` | Admin layout verifies the session signature and staff role | Order filtering is bounded/paginated; status mutations independently recheck staff role and transition validity |
| `POST /api/orders` | Proxy requires the signed-in cookie | Handler verifies the signed-in account | Schema validation and account-derived ownership precede persistence |
| `GET /api/orders?id=...` | Handler rejects a missing account session with 401 | Handler verifies the signed-in account | Lookup returns only the caller's order; unknown and foreign IDs are not disclosed |
| `GET /api/dishes` and dish detail | Public | Not applicable | Read-only public catalog; query and pagination inputs are bounded |
| Sign-in | Public | Credential verifier establishes identity | Session is signed, HttpOnly, SameSite, Secure in production, and time-limited |

The Next.js proxy is an early rejection layer, not the authorization boundary. Server
pages and every mutation/read handler must independently verify identity and
role/ownership. A cookie's mere presence is never proof of identity.

## Attack tests and expected evidence

| Attack | Attempt | Required result and what stops it |
| --- | --- | --- |
| Direct unauthenticated request | Request `/orders`, `/checkout`, and `POST /api/orders` without a cookie | Page requests redirect to sign-in at layer 1; the API returns 401 at its own handler check |
| Forged/role-escalated cookie | Send a malformed or edited customer cookie to `/admin` and `/kitchen` | Signature verification rejects the forgery; valid customer identity still fails the staff-role check |
| Cross-account object access | Read or cancel another account's order using its guessed ID | The server scopes the query/mutation to the signed-in account ID and returns no foreign record; the record remains unchanged |

## Attack results (production build)

| Attack | Observed result | Stopped by |
| --- | --- | --- |
| Request `/orders` without a cookie | `307` to `/signin?next=%2Forders`; direct `GET /api/orders?id=...` returned `401` | Proxy page gate and independent API session verification |
| Send `addis-eats-session=forged.token` to `/admin` and the order API | `/admin` returned `307` to sign-in; order API returned `401` | Server-side signature and expiry validation; cookie presence only passes the early proxy gate |
| Sign in as a valid customer and request `/admin` or attempt `PATCH /api/orders` | `/admin` redirected to `/`; status mutation returned `403` | Page-level staff-role check and independent API role check |
| As the staff account, request a customer-owned order ID | `GET /api/orders?id=<customer-order>` returned `404`; unit test also confirmed owner cancellation rejects the foreign account and leaves the order pending | Account-scoped lookup and mutation ownership check |
| Send a cross-origin `POST /api/orders` | Returned `403` | Same-origin mutation check |

The test order was created by signing in as the customer, and its ID was
queried while signed in as staff. The test server's in-memory map retained it
for the duration of that production-server process.

## Deployment boundary

The checked-in demo accounts are for local development only. Production must
configure real account credentials, a random `SESSION_SECRET`, and a durable
database connection; it must not use the fallback development secret or the
development-only in-memory order store.

The admin dashboard uses the configured shared staff account and signed
session; it does not currently provide a staff directory, individual admin
credentials, password reset, granular roles, or distributed login rate
limiting. Configure rate limiting at the hosting/edge layer before public
production exposure.

Production account settings are `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`,
`STAFF_EMAIL`, `STAFF_PASSWORD`, a `SESSION_SECRET` of at least 32 characters,
and `DATABASE_URL`. The database schema must be migrated with `npm run
db:migrate` before accepting orders. Local credentials are never rendered on
a production sign-in page.

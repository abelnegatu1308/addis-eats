# Data boundary decisions

| Data/query | Runs on | Key and ownership | Seed/refresh rule | Reasoning |
| --- | --- | --- | --- | --- |
| Public dish catalog | Server | Catalog IDs; no user key | Server-render the initial catalog; revalidate after one hour | Public, mostly static data should not require an initial browser fetch |
| Menu search | Server API, called by a client control | Normalized query and bounded page; public data only | Seed the input/results from the server catalog; debounce subsequent query requests by 300 ms; keep prior results while validating | Search remains responsive without sending a request for every keystroke |
| Category filter | Client presentation over server-seeded dishes | Category slug | Filter immediately from the already-rendered catalog | This is a local view operation and does not need a network request |
| Order status | Server query; client polls | Order ID plus signed-in account ID | Seed the status from the server-rendered record; poll every five seconds while the page is visible; stop on terminal state or unmount | The first paint is useful without JavaScript and polling never bypasses ownership |
| Order history | Server | Signed-in account ID | Query only the current account's records from Neon on each request; development without `DATABASE_URL` uses a process-local demo store | Prevents users from downloading other users' order data; production reads share durable state |
| Cart and favorite controls | Client state | Browser storage key; not an authorization identity | Hydrate after mount; persist local edits | These are convenience preferences, not proof of account or order ownership |
| Account/session | Server | Signed session subject and expiry | Verify on each protected request; clear on sign-out or invalid signature | Identity and role must not come from client-controlled state |
| Order creation/cancellation | Server mutation | Signed session subject and order ID | Validate every submission; re-read identity and ownership for every mutation; persist to Neon in production | Client-supplied totals, ownership, and role are untrusted |

## Capstone boundary

The Module 2 capstone is a static HTML/JavaScript application. Its existing
menu, cart, favorites, and order history are localStorage data, so those values
are browser-local and cannot be treated as authenticated or shared server
records. Search can be debounced locally and status can refresh from the
browser's local order list, but this does not provide cross-device polling or
server authorization. The companion `AUTH.md` records that security boundary
instead of claiming localStorage is a secure account system.

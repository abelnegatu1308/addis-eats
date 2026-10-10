# Addis Eats API

## Dishes

- `GET /api/dishes` returns `{ "dishes": [...] }`.
- `GET /api/dishes/[id]` returns `{ "dish": ... }` or `404` with `{ "error": { "code": "NOT_FOUND", "message": "Dish not found." } }`.

## Orders

`POST /api/orders` accepts JSON with `name`, `phone`, `area`, and optional `notes`. The shared Zod schema in `lib/schema.js` is used by both this endpoint and the checkout server action.

- `201`: `{ "order": ... }`; a new HttpOnly `checkout-session` cookie is issued when needed.
- `400`: malformed JSON.
- `422`: `{ "error": { "code": "VALIDATION_ERROR", "message": ... }, "fieldErrors": ... }`.

Checkout submits through `placeOrder` in `app/actions.js`, not through a client-side fetch. The action uses the same schema, returns field errors to the form, creates the order, and revalidates `/checkout` and `/cart`.

`cancelOrder` reads `checkout-session` on the server and verifies that its value matches the stored order owner before changing a pending order to cancelled. Missing sessions, unknown orders, non-owners, and already-cancelled orders are rejected.

## Storage Note

This learning project uses a process-local in-memory Map so the API and server actions can share order records without adding an unconfigured database. Records disappear when the server process restarts and are not suitable for multi-instance production deployment; replace `lib/orders.js` with a persistent database repository before production use.

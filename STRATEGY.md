# Day 40 Build Plan

## Planned Folder Tree

```text
app/
	actions.js
	api/
		dishes/route.js
		dishes/[id]/route.js
		orders/route.js
	cart/page.js
	checkout/page.js
	checkout/CheckoutForm.jsx
	orders/page.js
	orders/CancelOrderButton.jsx
	components/SiteHeader.jsx
	layout.js
	menu/
		[id]/page.js
		CategoryBar.jsx
		data.js
		DishList.jsx
		error.js
		layout.js
		loading.js
		page.js
	not-found.js
	page.js
	providers.jsx
lib/
	orders.js
	schema.js
	session.js
public/
	images/
```

## Route Strategy

| Route | Strategy | Why |
| --- | --- | --- |
| `/` | Static | The hero and editorial sections use shared content only. |
| `/menu` | Static with one-hour revalidation | The catalog is public and changes infrequently. |
| `/menu/[id]` | Static generation for known dishes | `generateStaticParams` builds the current catalog IDs at build time. |
| `/cart` | Static shell with client hydration | Cart contents are browser-localStorage state, not request data. |
| `/checkout` | Dynamic | Checkout reads the HttpOnly session cookie and submits a server action. |
| `/orders` | Dynamic | The server filters orders by the HttpOnly session owner before rendering. |
| `/api/dishes` | Dynamic route handler | Returns the current dish collection as JSON. |
| `/api/dishes/[id]` | Dynamic route handler | Resolves a requested dish ID and returns 404 for unknown IDs. |
| `/api/orders` | Dynamic route handler | Validates each request body and creates a session-owned order. |
| `/_not-found` | Static | Shared fallback, independent of request data. |
| `/favicon.ico` | Static asset | Served as a build asset. |

## Six Ordered Build Checkpoints

1. Root shell, real hero and dish photography; build and reconcile document shell routes.
2. Server-rendered menu, category filter, and dynamic dish details; build and reconcile menu markers.
3. Cart state, cart page and delivery estimate; build and reconcile cart strategy.
4. Shared schema, dishes/orders APIs and direct HTTP probes; build and reconcile API routes.
5. Checkout action, pending/error state, ownership-checked cancellation; build and reconcile checkout rendering.
6. Failure-check coverage, accessibility and final docs; build and compare every route with this table.

## Final Production Build

`npm run build` passed after checkpoint 6. The production route table matches the strategy above: menu ISR is one hour, the three catalog details are SSG, the cart shell is static, and checkout/orders/API handlers are dynamic.

```text
Route (app)           Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/dishes
├ ƒ /api/dishes/[id]
├ ƒ /api/orders
├ ○ /cart
├ ƒ /checkout
├ ○ /menu                     1h      1y
├   /menu/[id]
│ ├ ● /menu/kitfo
│ ├ ● /menu/shiro
│ └ ● /menu/doro-wat
└ ƒ /orders

○  Static
●  SSG via generateStaticParams
ƒ  Dynamic
```

## Production Failure Checks

| Check | Production result |
| --- | --- |
| Unknown route | `404` |
| Unknown dish detail | `404` after `dynamicParams = false` |
| Dish error probe | `500` before strict static-param guard; after guard an unknown ID is correctly `404` |
| Malformed order JSON | `400` |
| Schema-invalid order JSON | `422` with field errors |
| Missing-session cancel action | `unauthorized`; no mutation |
| Foreign-session cancel action attack | `forbidden`; victim record stayed `pending` |
| Checkout with JavaScript disabled | Form, name field and phone field rendered; native Server Action form remains available |
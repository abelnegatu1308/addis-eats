# Day 40 Component Boundary Plan

| Component/module | Runs on | Why |
| --- | --- | --- |
| `RootLayout`, `SiteHeader` | Server | Static document and navigation shell. |
| `Providers`, cart state controls | Client | Own only interactive cart/session presentation state. |
| `HomePage`, `MenuPage`, `DishPage`, `DishList` | Server | Render catalog and route data without shipping the whole screen to the browser. |
| `FilterShell` | Client | Owns category/search controls and receives `DishList` through `children`. |
| `CartView` | Client | Hydrates local cart state and handles quantity, removal, delivery selection, and clear actions. |
| `CheckoutForm` | Client | `useActionState` pending/validation feedback; invokes server action directly. |
| `OrdersPage` | Server | Reads the HttpOnly session and only renders records owned by that session. |
| `CancelOrderButton` | Client | Submits the server action and reports pending/cancel outcome; server still checks ownership. |
| `app/actions.js`, `lib/orders.js`, `lib/session.js`, `lib/schema.js` | Server | Mutations, authorization, persistence adapter, session and validation must not enter client bundles. |
| API route handlers | Server | Validate request inputs and return honest HTTP status codes. |
| `MenuError` | Client | Next error boundary reset callback requires client runtime. |
| Other route views | Server unless explicitly marked | Keep static markup/data server-side and move browser-only behavior to leaves. |

## Route Audit

The implementation must keep the actual production route table consistent with `STRATEGY.md`. Client directives are limited to interactive leaves and framework-required error boundaries.
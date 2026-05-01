# NEXUS E-COMMERCE FRONTEND APPLICATION

## OVERVIEW

This repository encompasses the frontend user interface for the Nexus E-Commerce platform. It serves both routine consumers targeting intuitive interactions to browse, purchase, and review products, and administrative sellers who require a dedicated dashboard to control their inventories, trace orders, and engage directly with their customers.

This documentation serves as an essential manual detailing project boundaries, dynamic routing strategies, application structure, and feature layouts.

---

## ARCHITECTURE AND TECHNOLOGY STACK

The front-end client acts as a Single Page Application (SPA), emphasizing state continuity, rapid interactions, and modern web application security practices.

| Layer / Domain | Technology Used | Description |
|---|---|---|
| Framework | React 18 | Declarative, component-based user interface framework. |
| System Builder | Vite | Next-generation frontend tooling providing extremely fast Hot Module Replacement. |
| Programming Language| TypeScript | Superset of JavaScript enforcing strict typing checks. |
| CSS Framework | Tailwind CSS | Utility-first CSS framework for rapid and responsive visual alignments. |
| Routing Protocol | React Router DOM | Declarative routing defining public and highly secured URL patterns. |
| HTTP Client | Axios | Promise-based HTTP client designated for consuming our Backend REST API. |
| State Management | React Context | Native context distribution eliminating extensive prop-drilling for core states. |

---

## PROJECT DIRECTORY STRUCTURE

The project is structured deliberately to segregate generic informative layouts from deeply embedded analytical dashboards. 

```text
nexus-react/
├── public/                 Static media such as placeholder images, favicons.
├── src/
│   ├── components/         Reusable, atomic interface building blocks.
│   │   └── layout/         Shared wrappers like Footer, Navbar, and Responsive Sidebars.
│   ├── contexts/           Global Context Providers.
│   │   ├── PopupContext    Centralized toast notifications and modal overlay controllers.
│   │   └── UserContext     Global session holding the JWT configuration and Profile details.
│   ├── lib/
│   │   └── api.ts          Global Axios instance with interceptors for Token Authorization.
│   ├── pages/              Route-Specific major views and business requirements.
│   │   ├── admin/          Seller Dashboard files (Overview, Inventory, Categories, Analytics).
│   │   ├── auth/           Authentication gates (Login, Register).
│   │   ├── dashboard/      Consumer Dashboard files (Order Histories, Shipping Addresses).
│   │   ├── home/           Landing platform elements and carousels.
│   │   ├── info/           Static informative pages (Terms of Service, Policies).
│   │   └── shop/           E-commerce critical path pages (Cart, Checkout, Product Detail, Seller Profiles).
│   ├── types/
│   │   └── index.ts        Strict TypeScript interfaces unifying backend mappings (Product, CartItem, Order).
│   ├── App.tsx             Global Route Map injecting Context Providers.
│   ├── main.tsx            DOM Entry point attaching React to `index.html`.
│   └── index.css           Tailwind injection and global CSS resets.
├── .env.example            Blueprint for environment parameters.
├── package.json            Dependencies and runtime scripts.
├── tailwind.config.js      Extended color palettes mapping Nexus-specific theme variables.
└── vite.config.ts          Vite builder configurations.
```

---

## ENVIRONMENT VARIABLES

The frontend communicates aggressively with external services. Rename `.env.example` to `.env` and fill the parameters. In Vite, environment variables exposed to the browser must strictly use the `VITE_` prefix.

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:5000/api` | Absolute path targeting the Nexus Backend API. |
| `VITE_SOCKET_URL` | Yes | `http://localhost:5000` | Absolute path targeting the Socket.io WebSocket port. |
| `VITE_FILE_URL` | Yes | `http://localhost:5000` | Static asset URL provider for backend-hosted uploaded files. |

---

## ROUTING TOPOLOGY

The application isolates unauthorized users from dashboard access dynamically via Component Wrappers.

### Public Routes
Unrestricted operations tailored for generic browsing.
| Path Variable | Destined Component | Description |
|---|---|---|
| `/` | `Home` | Landing hero component with featured selections. |
| `/{login, register}-page` | `Login`, `Register`| Primary authentication gates. |
| `/categories` | `Categories` | Grid displaying all product taxonomy. |
| `/product/:id` | `ProductDetail` | Singular product overview containing descriptions and reviews. |
| `/seller/:id` | `SellerDetail` | Specific storefront mapping containing paginated seller inventories. |
| `/shopping-cart` | `Cart` | Volatile shopping list calculating aggregate costs and dynamic shop vouchers. |
| `/shop-catalogue` | `Catalogue` | Extensive listing of all general products unfiltered. |

### Protected User Dashboard Routes
These routes mandate an active and verified JWT token. Access without authorization forcibly redirects to `/login-page`.
| Path Variable | Destined Component | Description |
|---|---|---|
| `/user-dashboard` | `DashboardOverview` | Summary of ongoing transactions and recent favorites. |
| `/user-dashboard-addresses`| `Addresses` | CRUD operations for shipping coordinates. |
| `/user-dashboard-orders` | `Orders` | Historical data on previous transactions. |
| `/user-dashboard-chat` | `ChatPage` | Realtime communication with specific Sellers. |
| `/checkout-flow` | `Checkout` | Finalizes order confirmation drawing data from `nexus_cart`. |

### Protected Seller Administration Routes
Access is solely permitted if the user context validates `role === 'seller'`. Standard users will be prohibited from observing these structures.
| Path Variable | Destined Component | Description |
|---|---|---|
| `/admin-dashboard-overview`| `AdminOverview` | Immediate statistical look onto revenue metrics. |
| `/admin-product-management`| `ProductsAdmin` | Add, update, archive inventory items. |
| `/admin-category-management`|`CategoriesAdmin` | Establish or delete grouping configurations. |
| `/admin-order-management` | `OrdersAdmin` | Monitor incoming customer receipts and shift logistic tracking states. |
| `/admin-reports-analytics` | `AnalyticsAdmin` | Render specific aggregations of performance histories. |
| `/admin-dashboard-chat` | `SellerChatPage` | Communication funnel listening explicitly to buyer demands. |

---

## STATE MANAGEMENT CONVENTIONS

To avoid massive prop-drilling without adding complex external dependencies like Redux, Nexus React utilizes several strategies based on volatility.

### 1. Persistent Caching (Local Storage)
- **`nexus_token`**: Commits the JWT payload to client browser to retain session across reloads. Monitored closely via Axios Interceptors.
- **`nexus_cart`**: A stringified array of item hashes. This enables anonymous generic cart viewing until the checkout phase demands hard user persistence.

### 2. Context Application
- **`UserContext`**: Wraps the entirety of `App.tsx`. Exposes `{ currentUser, login(), logout() }`. Automatically checks token validity against the backend on first mount.
- **`PopupContext`**: Provides a global instance ensuring `toast()` popups manifest consistently at the absolute root stacking level, independently of what component generated the prompt.

### 3. Client Pagination Mechanism
Used explicitly in grids anticipating massive outputs (e.g., Seller Profiles). Slices array mappings relative to static page lengths (const index bounds) retaining fast browser-centric computational sorting rendering large elements virtually unnecessary.

---

## KEY FEATURE WORKFLOWS

### The Cart and Dynamic Vouchers
Because carts can be comprised of items spanning multiple detached sellers, `Cart.tsx` implements complex aggregate logic evaluating `item.seller_id`. 
Instead of rigid percentage discounts, the frontend isolates matching elements related to specific vendors, generating isolated voucher buttons dynamically (e.g., generating `TOKOAHEMAT` automatically evaluating to exact array scopes instead of global totals).

### Authentication Verification Cycle
Rather than executing raw fetches on every protected component, `src/lib/api.ts` implements interceptors:
1. Rejects outward requests omitting `Authorization: Bearer`.
2. Inspects inward validations. If the server throws a `401 Unauthorized` claiming key expiration, the `api` silently tries querying `/api/auth/refresh`.
3. Following token renewal, the initial blocked call is repeated autonomously achieving invisible session rotation.

### Realtime Communication Bridge
The Chat functionality integrates `socket.io-client` connected via a React `useEffect` hook. Connection scopes target a predetermined backend URL, listening and responding primarily for `receive_message`. Emitting messages sends JSON objects wrapping payload strings bypassing classic HTTP REST constraints achieving zero-latency feedback.

---

## INITIATION AND STARTUP GUIDELINES

1. Ensure Node.js and NPM are present on the local machine.
2. Prepare the `.env` settings based on the available Backend port.
3. Install package distributions:
   ```bash
   npm install
   ```
4. Deploy the Local Development Server:
   ```bash
   npm run dev
   ```
5. Navigate explicitly to `http://localhost:5173` inside a modern web browser to interact with the Nexus Web application.
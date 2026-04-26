# Nexus

A full-stack e-commerce web application built with React, TypeScript, Vite, Supabase, and Tailwind CSS. The platform supports two distinct user roles: buyers who browse products, manage carts and wishlists, and place orders; and sellers who administer inventory, categories, orders, discounts, and view analytics through a dedicated dashboard.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Available Scripts](#available-scripts)
- [Routing Overview](#routing-overview)
- [Authentication and Authorization](#authentication-and-authorization)
- [Deployment](#deployment)

---

## Features

### Buyer (User)

- Browse products by category or via the shop catalogue
- View detailed product pages with stock status
- Add and remove items from a persistent shopping cart (localStorage)
- Manage a wishlist (Supabase-backed)
- Checkout with saved shipping addresses
- View order history with real-time status tracking
- Manage multiple shipping addresses including a default selection
- Update profile information (name, phone, gender)

### Seller (Admin)

- Dashboard overview with real-time statistics
- Full product management: create, read, update, delete with category assignment
- Category management with auto-generated URL slugs
- Order management with inline status updates (pending, shipped, delivered, cancelled)
- Discount and promotion management
- Analytics report: revenue, top products by revenue, order status distribution, financial summary

### General

- Role-based access control enforced on every protected route
- Responsive layout for desktop use
- Material Symbols icon integration
- Authentication-aware navbar with user dropdown

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 3 with custom design tokens |
| Routing | React Router DOM 7 |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth) |
| Linting | ESLint 9 with typescript-eslint |

---

## Project Structure

```
nexus-react/
├── public/                     Static assets served as-is
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── DashboardSidebar.tsx   Shared sidebar for buyer dashboard pages
│   │       ├── SellerSidebar.tsx      Shared sidebar for seller/admin pages
│   │       └── Navbar.tsx             Auth-aware top navigation bar
│   ├── lib/
│   │   └── supabase.ts               Supabase client initialisation
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Analytics.tsx          Reports and analytics
│   │   │   ├── Categories.tsx         Category management
│   │   │   ├── Discounts.tsx          Discount and promotion management
│   │   │   ├── LayoutWrapper.tsx      Admin layout wrapper
│   │   │   ├── Orders.tsx             Order management
│   │   │   ├── Overview.tsx           Admin dashboard overview
│   │   │   └── Products.tsx           Product management
│   │   ├── auth/
│   │   │   ├── Login.tsx              Login page
│   │   │   └── Register.tsx           Registration page
│   │   ├── dashboard/
│   │   │   ├── Addresses.tsx          Shipping address management
│   │   │   ├── Orders.tsx             Buyer order history
│   │   │   ├── Overview.tsx           Buyer dashboard overview
│   │   │   ├── Profile.tsx            Profile settings
│   │   │   └── Wishlist.tsx           Saved products / wishlist
│   │   ├── home/
│   │   │   └── LandingPage.tsx        Public homepage
│   │   ├── info/
│   │   │   └── About.tsx              About page
│   │   └── shop/
│   │       ├── Cart.tsx               Shopping cart
│   │       ├── Catalogue.tsx          Full product catalogue
│   │       ├── Categories.tsx         Category listing
│   │       ├── CategoryProducts.tsx   Products filtered by category
│   │       ├── Checkout.tsx           Checkout flow
│   │       └── ProductDetail.tsx      Individual product page
│   ├── types/
│   │   └── index.ts                  Shared TypeScript interfaces
│   ├── App.tsx                       Root component with route definitions
│   ├── main.tsx                      Application entry point
│   └── index.css                     Global styles and Tailwind directives
├── supabase/                         Supabase configuration and migrations
├── .env.example                      Example environment variable file
├── tailwind.config.js                Tailwind configuration with custom tokens
├── tsconfig.json                     TypeScript root configuration
├── vite.config.ts                    Vite build configuration
└── package.json
```

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Supabase project (free tier is sufficient)

---

## Getting Started

**1. Clone the repository**

```bash
git clone <repository-url>
cd nexus-react
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with values from your Supabase project dashboard under Settings > API.

**4. Set up the Supabase database**

Apply the schema migrations found in the `supabase/` directory to your Supabase project, or run:

```bash
npx supabase db push
```

Ensure Row Level Security policies are configured appropriately for the `profiles`, `products`, `categories`, `orders`, `order_items`, `addresses`, and `wishlists` tables.

**5. Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Environment Variables

All environment variables used by the client must be prefixed with `VITE_` so that Vite exposes them at build time.

| Variable | Description | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | The URL of your Supabase project | Yes |
| `VITE_SUPABASE_ANON_KEY` | The public anonymous key from your Supabase project | Yes |
| `VITE_MIDTRANS_CLIENT_KEY` | Midtrans client key for payment processing | Yes |
| `VITE_MIDTRANS_IS_PRODUCTION` | Set to `true` in production, `false` for sandbox | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for social login | Optional |
| `VITE_GOOGLE_CALLBACK_URL` | OAuth callback URL — must match the one configured in Supabase Auth providers | Optional |

See `.env.example` for a template. Never commit the `.env` file.

---

## Database Schema

The following tables are expected in Supabase:

**profiles** — Extended user data linked to `auth.users`
- `id` uuid (primary key, references auth.users)
- `email` text
- `full_name` text
- `avatar_url` text
- `role` text — `'user'` or `'seller'`
- `phone` text
- `gender` text

**categories**
- `id` uuid
- `name` text
- `slug` text (unique)
- `icon` text (Material Symbols name)
- `description` text
- `image_url` text

**products**
- `id` uuid
- `category_id` uuid (references categories)
- `name` text
- `description` text
- `price` numeric
- `stock` integer
- `image_url` text
- `created_at` timestamptz

**orders**
- `id` uuid
- `user_id` uuid (references auth.users)
- `status` text — `pending | shipped | delivered | completed | cancelled`
- `total_amount` numeric
- `shipping_address_id` uuid
- `created_at` timestamptz

**order_items**
- `id` uuid
- `order_id` uuid (references orders)
- `product_id` uuid (references products)
- `quantity` integer
- `price_at_purchase` numeric

**addresses**
- `id` uuid
- `user_id` uuid (references auth.users)
- `label` text
- `full_name` text
- `phone` text
- `address_line` text
- `city` text
- `province` text
- `postal_code` text
- `is_default` boolean

**wishlists**
- `id` uuid
- `user_id` uuid (references auth.users)
- `product_id` uuid (references products)
- `created_at` timestamptz

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot module replacement |
| `npm run build` | Type-check and produce an optimised production build in `dist/` |
| `npm run preview` | Serve the production build locally for verification |
| `npm run lint` | Run ESLint across all source files |

---

## Routing Overview

| Path | Component | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login-page` | Login | Public |
| `/register-page` | Register | Public |
| `/about` | About | Public |
| `/shop-catalogue` | Catalogue | Public |
| `/categories` | Categories | Public |
| `/categories/:slug` | CategoryProducts | Public |
| `/product/:id` | ProductDetail | Public |
| `/shopping-cart` | Cart | Public |
| `/checkout` | Checkout | Authenticated user |
| `/user-dashboard` | Dashboard Overview | Authenticated user |
| `/user-dashboard/orders` | Orders | Authenticated user |
| `/user-dashboard/wishlist` | Wishlist | Authenticated user |
| `/user-dashboard/profile` | Profile | Authenticated user |
| `/user-dashboard/addresses` | Addresses | Authenticated user |
| `/admin-dashboard-overview` | Admin Overview | Seller only |
| `/admin-product-management` | Products | Seller only |
| `/admin-category-management` | Categories | Seller only |
| `/admin-order-management` | Orders | Seller only |
| `/admin-discounts` | Discounts | Seller only |
| `/admin-reports-analytics` | Analytics | Seller only |

---

## Authentication and Authorization

Authentication is handled entirely by Supabase Auth. The application uses `supabase.auth.getUser()` on every protected page to verify the session server-side.

Role enforcement works as follows:

- Pages under `/user-dashboard/*` redirect to `/login-page` if no session is found.
- Pages under `/admin-*` redirect to `/login-page` if no session exists, or to `/user-dashboard` if the user's `role` in the `profiles` table is not `'seller'`.
- The navbar reads the session via `onAuthStateChange` to show authenticated UI (user avatar, dropdown with dashboard link and logout) versus unauthenticated UI (login and register buttons).

Cart data is persisted in `localStorage` under the key `nexus_cart` and synchronised across tabs via a custom `nexus:cart-updated` DOM event.

---

## Deployment

The application is a standard Vite SPA and can be deployed to any static hosting provider.

**Build for production:**

```bash
npm run build
```

The output is placed in the `dist/` directory.

**Recommended platforms:** Vercel, Netlify, Cloudflare Pages.

When deploying, set the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the platform's environment settings. Configure the hosting platform to redirect all requests to `index.html` to support client-side routing.

**Vercel example (`vercel.json`):**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify example (`public/_redirects`):**

```
/*  /index.html  200
```

# E-Commerce Nexus

E-Commerce Nexus is a professional-grade, high-performance marketplace platform designed for a premium shopping experience. This project serves as a full-stack solution integrating modern frontend technologies with a serverless backend and secure payment processing.

## System Architecture

The application follows a modern decoupled architecture:

| Layer | Responsibility | Technology |
|---|---|---|
| **Frontend** | User Interface, Routing, State Management | React 19, Vite, Tailwind CSS |
| **Logic** | Interactions, Animations, API Client | Framer Motion, Supabase JS |
| **Backend** | Database, Authentication, Payments | Supabase (PostgreSQL, Edge Functions) |
| **Payment Gateway** | Transaction Processing, Payment UI | Midtrans |

---

## Project Structure

The codebase is organized into modular directories for scalability:

```text
E-Commerce/
├── src/
│   ├── components/       # Reusable UI elements and layouts
│   │   ├── layout/       # Shared components like Navbar, Footer
│   │   └── ui/           # Atomic components (Buttons, Inputs, Cards)
│   ├── context/          # React contexts for Auth, Cart, Favorites
│   ├── data/             # Static configurations and constants
│   ├── lib/              # Client initializations (Supabase, Midtrans)
│   ├── pages/            # View components (Home, Shop, Dashboard, Info)
│   └── types/            # TypeScript interface definitions
├── supabase/
│   ├── functions/        # Edge Functions (Pay, Webhooks)
│   └── migrations/       # SQL scripts for database versioning
└── README.md             # Project documentation
```

---

## Database Schema

The system uses a PostgreSQL database hosted on Supabase. Below is a summary of the core tables:

### Products
Stores all items available for sale in the marketplace.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique identifier for each product |
| `name` | TEXT | Product name for display |
| `description` | TEXT | Detailed product overview |
| `price` | NUMERIC | Transactional price (USD) |
| `category` | TEXT | Product categorization |
| `stock` | INTEGER | Current inventory level |
| `seller_id` | UUID (FK) | Reference to the product owner |

### Orders
Manages the lifecycle of customer transactions.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique identifier for the order |
| `user_id` | UUID (FK) | Reference to the buyer |
| `status` | TEXT | Order state (Pending, Paid, Shipped, Delivered) |
| `total_amount` | NUMERIC | Grand total including shipping |
| `shipping_address`| TEXT | Delivery destination details |

### Order Items
Provides line-item detail for each order.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Reference for the specific item |
| `order_id` | UUID (FK) | Reference to the parent order |
| `product_id` | UUID (FK) | Reference to the item purchased |
| `quantity` | INTEGER | Number of units purchased |
| `price_at_time` | NUMERIC | Price of the item at purchase |

---

## Core Workflows

### 1. Authentication and Security
- **Auth Provider**: Uses Supabase GoTrue for secure JWT-based sessions.
- **Row Level Security (RLS)**: Fine-grained access control where users can only read their own orders and sellers can only view items related to their store.
- **Security Definer Functions**: Custom SQL functions to safely check permissions without policy recursion.

### 2. Payment Flow
1. **Frontend**: Collects order details and initiates payment via `/checkout`.
2. **Edge Function**: The `pay` function on Supabase calculates the final price and creates a Midtrans Snap transaction.
3. **Midtrans**: Displays the payment UI and processes the transaction.
4. **Synchronization**: Real-time status updates from Midtrans to the Supabase database.

### 3. Seller Dashboard
- **Analytics**: Calculates Total Revenue, Active Orders, and Sales Trends dynamically from the `orders` and `order_items` tables.
- **Package Tracker**: Visual pipeline for order fulfillment (Processing -> To Ship -> In Transit -> Delivered).

---

## Technical Setup Guide

### Local Environment
1. **Dependencies**: Run `npm install` to install React and Vite dependencies.
2. **Configuration**: Copy `.env.example` to `.env` and provide your Supabase URL and keys.
3. **Development**: Use `npm run dev` to start the local server.

### Supabase Integration
1. **Migrations**: Apply the SQL files in `supabase/migrations/` to set up tables and RLS policies.
2. **Secrets**: Set the `MIDTRANS_SERVER_KEY` in Supabase using `supabase secrets set`.

---

## License
Licensed under the MIT License. See [LICENSE](LICENSE) for details.
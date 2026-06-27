# AB Accessories — Premium Mobile Accessories Store

A complete, production-ready e-commerce storefront + admin dashboard for a mobile accessories brand.
Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL** (Neon-compatible),
**Drizzle ORM**, and a secure **JWT + bcrypt** credentials auth system.

---

## ✨ Features

### Storefront
- Premium, fully responsive design (2-up mobile → 5-up desktop product grid)
- Hero banner, category showcase, featured & latest product sections
- Compact product cards: image, brand, price, **discount badge**, rating stars, stock status,
  **Quick view** modal, **Add to cart**, and **WhatsApp order** button
- Search + category filtering, product detail page with gallery & specifications
- Persistent cart (localStorage) with slide-in drawer + free-shipping progress
- Checkout (Cash on Delivery / Bank / WhatsApp) that creates real orders
- Floating WhatsApp button, contact & about pages

### Admin Dashboard (`/admin`)
- Stats: total products, total orders, revenue, visitors (+ pending & low-stock alerts)
- **Product CRUD** — add / edit / delete, multiple images (by URL), pricing, stock, specifications,
  featured toggle, enable/disable
- **Category management** — add / edit / delete inline
- **Order management** — list + change status
- **Store settings** — logo, hero, title, contact info, WhatsApp, social links, footer links,
  brand colour, currency, shipping rules
- Protected by **middleware** route protection (`/admin/*`)

### Auth
- Credentials login (email + password) with **bcrypt** hashing and **JWT** sessions
- "Remember me" (30 days) vs session (8 hours)
- `middleware.ts` blocks unauthorised access to the admin area
- Edge-compatible token verification (no Node-only deps in the middleware bundle)

---

## 🧰 Tech Stack
- **Next.js 16** App Router · **TypeScript** · **Tailwind CSS v4**
- **PostgreSQL** (works with local Postgres **or Neon** — same `DATABASE_URL`)
- **Drizzle ORM** (schema in `src/db/schema.ts`)
- **jose** (JWT) · **bcryptjs** (password hashing) · **zod** (validation) · **lucide-react** (icons)

> **Note on ORM:** the project uses **Drizzle ORM** (configured in this environment) instead of Prisma.
> Drizzle targets the exact same PostgreSQL database, so it is fully **Neon-compatible** — just point
> `DATABASE_URL` at your Neon connection string. The schema (`User`, `Product`, `Category`, `Order`,
> `Settings`, `ProductImage`) maps 1:1 to the requested data model.

---

## 🚀 Getting Started (local)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env and set DATABASE_URL + AUTH_SECRET

# 3. Create the database tables (Drizzle)
npx drizzle-kit push

# 4. Seed the database (admin user, settings, categories, products)
npx tsx scripts/seed.ts

# 5. Run the dev server
npm run dev
```

Open http://localhost:3000

### Admin login
- URL: http://localhost:3000/login
- Email: `arrehmanshahid78678@gmail.com`
- Password: `mani158`

---

## 🗄️ Database Schema
Defined with Drizzle in `src/db/schema.ts`. Tables:
`users`, `categories`, `products`, `product_images`, `orders`, `settings`, `visitors`

Apply changes with `npx drizzle-kit push` (no migration files needed) or generate migrations with
`npx drizzle-kit generate`.

---

## 🔌 API Reference
All admin write endpoints require a valid admin JWT session.

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/auth/login` | – | Credentials login → sets session cookie |
| POST | `/api/auth/logout` | – | Destroy session |
| GET | `/api/products` | – | List products (`?search=&category=&featured=&limit=`) |
| POST | `/api/products` | ✅ | Create product |
| GET | `/api/products/[id]` | – | Get one product |
| PATCH | `/api/products/[id]` | ✅ | Update product |
| DELETE | `/api/products/[id]` | ✅ | Delete product |
| GET | `/api/categories` | – | List categories |
| POST | `/api/categories` | ✅ | Create category |
| PATCH | `/api/categories/[id]` | ✅ | Update category |
| DELETE | `/api/categories/[id]` | ✅ | Delete category |
| POST | `/api/checkout` | – | Place an order |
| GET | `/api/orders` | ✅ | List orders |
| PATCH | `/api/orders` | ✅ | Update order status |
| GET/PATCH | `/api/settings` | ✅ | Read / update store settings |
| GET | `/api/stats` | ✅ | Dashboard statistics |

---

## ☁️ Deploy to Vercel + Neon

1. **Create a Neon database** at https://neon.tech and copy the connection string.
2. **Push the schema** to Neon:
   ```bash
   DATABASE_URL="your-neon-url" npx drizzle-kit push
   ```
3. **Seed Neon** (optional but recommended the first time):
   ```bash
   DATABASE_URL="your-neon-url" npx tsx scripts/seed.ts
   ```
4. **Deploy on Vercel:**
   - Import the repo at https://vercel.com/new
   - Add environment variables in **Project → Settings → Environment Variables**:
     - `DATABASE_URL` → your Neon connection string
     - `AUTH_SECRET` → a long random string (`openssl rand -base64 32`)
     - `NEXT_PUBLIC_SITE_URL` → `https://your-domain.vercel.app`
   - Build command: `npm run build` (default). Deploy.
5. The app automatically **self-seeds** on first load (admin user, settings, demo catalog) if the
   database is empty, so `/login` and the storefront work immediately.

---

## 📁 Project Structure
```
src/
  app/
    (shop)/            # public storefront (navbar + footer chrome)
      page.tsx         # homepage
      products/        # listing + [slug] detail
      category/[slug]  # category page
      cart/ checkout/ about/ contact/ track-order/
    admin/             # protected admin dashboard
      page.tsx products/ categories/ orders/ settings/
    login/             # admin login
    api/               # auth, products, categories, orders, checkout, settings, stats
    layout.tsx globals.css
  components/
    site/   # Navbar, Footer, ProductCard, QuickViewModal, Hero, CartDrawer, …
    admin/  # Sidebar, ProductForm, CategoryManager, OrdersTable, SettingsForm, …
    cart/   # CartProvider (context + localStorage)
    auth/   # LoginForm
  db/       # schema.ts + drizzle client
  lib/      # auth, data access, validations, utils, seed, actions
  middleware.ts
scripts/seed.ts
```

---

© AB Accessories. Built for production.

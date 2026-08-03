# NextJS-ERP

Frontend ERP application built with Next.js, React and TypeScript — the user interface for
a manufacturing ERP covering production, inventory, point-of-sale and reporting.

## Repository Scope
This repository contains the **frontend only**.

- Backend repository: https://github.com/PLLV99/Spring-Boot-ERP

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS
- axios
- SweetAlert2

## Actual Project Structure

```text
app/
├── erp/
│   ├── accounting/page.tsx        # set product prices (admin)
│   ├── bill-sale/page.tsx         # invoices: view, cancel, restore (admin)
│   ├── components/
│   │   └── Modal.tsx              # shared modal used by every screen
│   ├── dashboard/page.tsx         # totals: output, revenue, products, scrap (admin)
│   ├── formula/[id]/page.tsx      # bill of materials for one product
│   ├── inventory/page.tsx         # warehouses, stock intake, transfers
│   ├── material/page.tsx          # raw materials
│   ├── production/
│   │   ├── log/[id]/page.tsx      # output recorded per batch
│   │   ├── loss/[id]/page.tsx     # scrap recorded per batch
│   │   └── page.tsx               # products
│   ├── report/page.tsx            # revenue per month (admin)
│   ├── sale/page.tsx              # point of sale: cart and checkout
│   ├── user/
│   │   ├── edit/page.tsx          # edit own profile
│   │   └── page.tsx               # user management (admin)
│   ├── Sidebar.tsx                # navigation, rendered per role
│   └── layout.tsx
├── interface/                     # 14 TypeScript interfaces mirroring the API
├── Config.ts                      # API base URL + axios interceptors
├── favicon.ico
├── globals.css
├── layout.tsx
└── page.tsx                       # sign-in screen

public/
├── file.svg
├── globe.svg
├── next.svg
├── vercel.svg
└── window.svg

Root files:
.env.example, .gitignore, eslint.config.mjs, middleware.disabled.ts, next.config.ts,
package.json, package-lock.json, postcss.config.mjs, proxy.ts, tailwind.config.ts,
tsconfig.json, vercel.json
```

## ERP Modules

| Module | Visible to |
|---|---|
| Inventory, Production, Sales | admin + employee |
| Dashboard, Invoice, Accounting, Reports, Users | admin only |

Material and Formula are reached from the Production screen rather than the sidebar.

## How Authentication Works

1. The sign-in form posts to `/api/users/admin-signin` and receives `{token, role}`.
2. The token is stored **twice on purpose**: in `localStorage` for axios to read in the
   browser, and in a cookie so `proxy.ts` — which runs on the server — can read it too.
3. `app/Config.ts` registers a **request interceptor** that attaches
   `Authorization: Bearer <token>` to every axios call, so no page has to do it by hand.
4. `proxy.ts` guards `/erp/*`: a request without the cookie is redirected to the sign-in
   page. Note this only checks that a token exists — role enforcement is the backend's job.

> Hiding a menu item is a user-experience choice, not a security control. Every rule is
> enforced again on the server; see the role matrix in the backend README.

## Error Handling

`app/Config.ts` also registers a **response interceptor**:

- The API answers failures with `{status, error, message}`, but axios only ever puts
  `"Request failed with status code 409"` on `error.message` — which is what the screens
  display. The interceptor copies the server message over it, so every page shows the real
  reason without any per-page changes.
- A **401** means the token is missing, invalid or expired. The interceptor clears the
  stored token and returns the user to the sign-in page — except on the sign-in page
  itself, where 401 simply means the password was wrong.

## Getting Started

The frontend needs the backend API to log in, so start the backend first
(see `PLLV99/Spring-Boot-ERP` — Docker database + `mvnw spring-boot:run` on port 8080).

```bash
git clone https://github.com/PLLV99/NextJS-ERP.git
cd NextJS-ERP
npm install
npm run dev
```

Open: http://localhost:3000

If port 3000 is already taken, start it elsewhere:

```bash
npm run dev -- -p 3001
```

### API routing

In development `next.config.ts` forwards `/api/*` to `http://localhost:8080`
(override with the `BACKEND_URL` environment variable). In production on Vercel the rewrite
in `vercel.json` routes `/api/*` to the deployed backend instead. Because the browser only
ever calls a same-origin `/api` path, there is no CORS preflight in either environment.

### Build

```bash
npm run build
```

The build fetches Geist from Google Fonts, so it needs network access.

## Notes
- `proxy.ts` replaces the `middleware.ts` convention, which Next.js 16 renamed;
  `middleware.disabled.ts` is kept only as a reference to the previous version.
- Every screen is a client component (`'use client'`) because each one holds form state.
  Server components would suit the read-only Report and Dashboard screens.
- The JWT is kept in `localStorage`, which is readable by JavaScript; an httpOnly cookie
  would be the stronger choice.
- Backend APIs are served by `PLLV99/Spring-Boot-ERP`.

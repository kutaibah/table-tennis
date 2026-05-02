# Table Tennis Tournament App

Knockout-only table tennis tournaments: create events, add players, generate a random bracket, enter match results, and crown a champion. Data is stored in **MongoDB** via **Mongoose**.

## Requirements

- Node.js **20.9+**
- **pnpm**
- A running **MongoDB** instance (local or Atlas)

## Setup

```bash
pnpm install
cp .env.example .env.local
# Edit .env.local — set MONGODB_URI
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable                 | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `MONGODB_URI`            | MongoDB connection string                                                   |
| `AUTH_SECRET`            | Secret for signing session cookies (JWT). Use at least 32 random bytes.  |
| `ALLOW_ADMIN_REGISTER`   | Set to `true` to allow `/register` after the first admin exists.          |

Passwords are stored with **bcrypt** (salt embedded in the hash). Sessions use an **http-only cookie** with a short-lived **JWT** (via `jose`), not reversible encryption of passwords.

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Development server       |
| `pnpm build` | Production build         |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

## Routes

| Path                       | Description                     |
| -------------------------- | ------------------------------- |
| `/`                        | Public tournament list          |
| `/tournaments/[id]`      | Public bracket & results        |
| `/login`                   | Admin sign-in                   |
| `/register`                | Create first (or extra) admin   |
| `/admin/tournaments`       | Admin tournament list           |
| `/admin/tournaments/new`   | Create tournament               |
| `/admin/tournaments/[id]`  | Manage players, draw, results   |

**Admin auth:** `/admin/*` requires a signed-in user (`middleware.ts`). Register the first account at `/register`; further accounts require `ALLOW_ADMIN_REGISTER=true`.

## Product rules (MVP)

- Player counts: **4, 8, 16, or 32** only (power of two, no byes).
- **Games per match:** `1` (one number per player = total points) or **best-of 3 / 5 / 7** (numbers = **games won**).
- **Score threshold:** When games-per-match is `1`, the winner must lead by at least this many points (e.g. 2 means 11–9 is OK, 11–10 is not). For best-of 3/5/7, standard games-won rules apply (e.g. Bo5: 3–0, 3–1, or 3–2 only).
- Bracket and **All matches** table on admin and public pages after the draw.
- After **Generate draw**, the roster is locked and the bracket is persisted.
- Winners advance automatically; the final sets **status: completed** and **champion**.

## Known limitations

- No point-by-point or per-set breakdown inside a game; totals or games-won only.
- No seeding logic or byes.
- No double elimination or group stages.

## Suggested next features

- OAuth or SSO for admins
- Set-by-set scoring / ITTF-style results
- Seeding and optional byes for non–power-of-two sizes
- Double elimination, live updates, QR for public bracket, export bracket image

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui
- MongoDB + Mongoose

# LevelUp Pickleball — Live Tournament Bracket

A custom live tournament bracket maker for **LevelUp Pickleball Club**, built for the
**Three Rivers Championship**. Round robin → top 4 advance to single-elimination
playoffs, with live scoring that spectators can follow on their phones.

- **Format:** Round robin (first to 15, win by 2) → top 4 single-elim. Semifinals
  to 15; Gold & Bronze medal matches are best of 3 to 11, win by 2.
- **Singles & doubles** supported per division.
- **Live:** scores sync in real time. With Firebase configured, updates appear on
  every device instantly. Without it, the app runs in a local demo mode that syncs
  across browser tabs.
- **Admin / viewer split:** anyone with the link can watch; editing scores and
  managing divisions is gated behind an admin passcode.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). It works immediately in
**local demo mode** with sample Three Rivers divisions.

To act as a scorekeeper, click **Admin** (top right) and enter the passcode
(default `levelup` — see below to change it).

## Configuration

Copy `.env.example` to `.env` and edit:

```bash
cp .env.example .env
```

- `VITE_ADMIN_PASSCODE` — the scorekeeper passcode. Change this before your event.
- `VITE_FIREBASE_*` — leave blank for demo mode, or fill in to go live (below).

Restart `npm run dev` after editing `.env`.

## Going live with Firebase

The "Live" badge shows **Live (demo)** until Firebase is connected, then **Live**.

1. Create a project at https://console.firebase.google.com.
2. Add a **Web app** (`</>`), and copy the config values into `.env`
   (Project settings → General → Your apps → SDK setup and configuration).
   Include the **databaseURL** (`VITE_FIREBASE_DATABASE_URL`).
3. In the console, create a **Realtime Database** and start it in **test mode**.
4. Restart the dev server. The whole tournament is stored as one JSON tree at
   `tournaments/three-rivers-2026` and every client gets real-time updates.

### Security note

Editing is gated by a client-side passcode, which the database can't verify. The
included `database.rules.json` allows open read/write under `tournaments` — fine
for a private event on an unlisted link. Test mode also auto-expires after ~30
days. For real protection, switch to Firebase Auth and require `auth != null` on
writes.

## Deploy (Firebase Hosting)

```bash
npm run build                 # outputs to dist/
npm install -g firebase-tools # if not already installed
firebase login
firebase use --add            # select your project
firebase deploy               # deploys hosting + firestore.rules
```

`firebase.json` is already configured (public dir `dist`, SPA rewrites, and the
Realtime Database rules). You can deploy hosting and rules separately with
`firebase deploy --only hosting` / `--only database`.

## How to run an event

1. **Admin → Add division** on the home page (pick the event, e.g. "Men's Doubles",
   a name like `4.0`, and singles/doubles).
2. Open the division and **add teams** — the round-robin schedule generates
   automatically.
3. Enter scores as matches finish. Standings (wins → head-to-head → point
   differential) update live, and the top 4 are highlighted.
4. When pool play is done, hit **Lock standings · Start playoffs** to seed the
   bracket (1v4, 2v3 → Gold final + Bronze match).
5. Finish the medal matches; medalists 🥇🥈🥉 appear automatically.

## Swapping in the real logo

The logo is an SVG recreation in `src/components/Logo.tsx`. To use the official
asset, drop a PNG/SVG in `public/` and replace `<ArrowMark/>` with an `<img>` in
that file. The favicon is `public/favicon.svg`.

## Brand colors

Defined in `src/index.css` under `@theme` (`--color-lu-green` and friends). Adjust
those hex values to fine-tune the green to match the official brand.

---

Built with Vite + React + TypeScript + Tailwind CSS v4 + Firebase.

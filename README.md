# Berlijn

Kleine mobiele PWA voor ons vriendenweekend in Berlijn (13–16 november 2026).
Alle info op één plek: planning met tickets, pubgolf, Kingen-scores en gedeelde kosten.

Spelers: Benjamin, Bent, Senne, Aaron, Lander.

## Stack

Vite + React + TypeScript, Tailwind CSS, `vite-plugin-pwa`, Supabase (Postgres + Realtime).

## Opzetten

1. **Supabase**: maak een (gratis) project aan op [supabase.com](https://supabase.com).
   Open de SQL Editor en voer [`supabase/schema.sql`](supabase/schema.sql) uit.
   Dat maakt de tabellen, seedt de spelers en de 7 café-holes, en zet RLS (open policy) en Realtime aan.
2. **Env vars**: kopieer `.env.example` naar `.env` en vul in
   (Project Settings → API):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. **Lokaal draaien**:
   ```bash
   npm install
   npm run dev
   ```
   Op je telefoon testen in hetzelfde wifi-netwerk: `npm run dev -- --host`.

## Deployen (GitHub Pages)

De app draait op **https://bentj-01.github.io/berlijnbierweekend/**.
Elke push naar `main` bouwt en deployt automatisch via `.github/workflows/deploy.yml`.

Eenmalig instellen in de repo:

1. **Settings → Pages → Source**: kies **GitHub Actions**.
2. **Actions → Deploy naar GitHub Pages → Run workflow** (of push iets naar `main`).

De Supabase-URL en publishable key staan in `.env.production`. Die zijn publiek
(ze zitten toch in de gebouwde JavaScript), dus geen GitHub-secrets nodig.

Lokaal draait de app op `http://localhost:5173/berlijnbierweekend/` (zelfde pad als op Pages).

Daarna op de telefoon openen en installeren:
- **Android (Chrome)**: menu → "App installeren".
- **iOS (Safari)**: Delen → "Zet op beginscherm" (de app toont hier zelf een banner voor).

## Structuur

```
src/
  App.tsx                 header, tabs, "Wie ben jij?"
  data/
    planning.ts           planning, eventinfo en tickets (hardcoded)
    parcours.ts           pubgolf-parcours: cultuurstops en cafés
    kingen.ts             rondes en puntentelling van Kingen
  components/             onderbalk, toast, modal, QR-code, iOS-banner
  screens/                Planning, Pubgolf, Kingen, Kosten
  lib/
    useRealtimeTable.ts   tabel laden + live houden via Realtime
    money.ts              bedragen, verdelen en afrekenen
supabase/schema.sql       schema + seed
```

## Hoe het werkt

- **Geen login**: je kiest je naam, die wordt bewaard in `localStorage` (`currentPlayerId`).
- **Planning**: staat in `src/data/planning.ts`. Per dag, per dagdeel, met een detailpagina per item.
  Tickets worden als QR-code getoond, enkel aan wie ze toebehoren (groepstickets aan iedereen).
- **Pubgolf**: het parcours staat in `src/data/parcours.ts`. Naam, par en opdracht van elk café
  staan in `golf_holes` (aanpasbaar in de app), scores in `golf_scores`.
- **Kingen**: spellen in `kingen_games` (met de gekozen spelers), per ronde de ingave in `kingen_rounds`.
  6 min-spellen + één troefronde per speler; de punten worden in de app berekend (`src/data/kingen.ts`).
- **Kosten**: uitgaven in `expenses`, gelijk verdeeld over wie meedeed. Saldo en "wie betaalt wie"
  worden in de app berekend.
- **PWA**: de service worker cachet enkel de app shell. Data komt altijd live van Supabase.

## Veiligheid

Iedereen met de URL en anon key kan alles lezen en schrijven. Prima voor een privé weekendapp,
niet gebruiken voor gevoelige data. Na het weekend mag het Supabase-project weg.

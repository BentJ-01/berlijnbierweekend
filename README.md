# Berlijn 🍺

Kleine mobiele PWA voor ons vriendenweekend in Berlijn (13–16 november 2026).
Pinten tellen, pubgolf scoren en een simpele planning. Alles live gedeeld via Supabase.

Spelers: Benjamin, Bent, Senne, Aaron, Lander.

## Stack

Vite + React + TypeScript, Tailwind CSS, `vite-plugin-pwa`, Supabase (Postgres + Realtime).

## Opzetten

1. **Supabase**: maak een (gratis) project aan op [supabase.com](https://supabase.com).
   Open de SQL Editor en voer [`supabase/schema.sql`](supabase/schema.sql) uit.
   Dat maakt de tabellen, seedt de spelers, 9 placeholder holes en de 2 vluchten, en zet RLS (open policy) en Realtime aan.
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

## Deployen

Statische hosting met HTTPS, bv. **Netlify** (er staat een `netlify.toml` klaar) of Vercel:

- Build command: `npm run build`
- Publish directory: `dist`
- Zet `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` als environment variables bij de host.

Daarna op de telefoon openen en installeren:
- **Android (Chrome)**: menu → "App installeren".
- **iOS (Safari)**: Delen → "Zet op beginscherm" (de app toont hier zelf een banner voor).

## Structuur

```
src/
  App.tsx                 header, tabs, "Wie ben jij?"
  components/             onderbalk, toast, modal, iOS-banner
  screens/                Pinten, Pubgolf, Planning
  lib/
    useRealtimeTable.ts   tabel laden + live houden via Realtime
    useDrinks.ts          pinten met optimistic UI en retry-queue
    rules.ts              regels voor de random pubgolf-regel
supabase/schema.sql       schema + seed
```

## Hoe het werkt

- **Geen login**: je kiest je naam, die wordt bewaard in `localStorage` (`currentPlayerId`).
- **Pinten**: elke pint is een rij in `drinks`. Eén tik = +1 (optimistic), toast met "Ongedaan maken".
  "−" haalt de laatste pint van die speler weg. Mislukte inserts blijven in een lokale queue
  (`localStorage`) en worden opnieuw verstuurd bij reconnect.
- **Pubgolf**: scores worden direct opgeslagen (upsert op `hole_id + player_id`).
  De huidige hole is de eerste waar nog niet iedereen een score heeft.
- **Planning**: gegroepeerd per dag, gesorteerd op tijd (zonder tijd onderaan).
- **PWA**: de service worker cachet enkel de app shell. Data komt altijd live van Supabase.

## Veiligheid

Iedereen met de URL en anon key kan alles lezen en schrijven. Prima voor een privé weekendapp,
niet gebruiken voor gevoelige data. Na het weekend mag het Supabase-project weg.

## Fase 2 (optioneel)

Quests als 4e tab. De tabellen `quests` en `quest_completions` staan al in het schema.

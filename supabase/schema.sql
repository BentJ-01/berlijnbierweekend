-- Berlijn vriendenweekend: schema + seed
-- Uitvoeren in Supabase: SQL Editor > New query > plakken > Run

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

insert into players (name, sort_order) values
  ('Benjamin', 1), ('Bent', 2), ('Senne', 3), ('Aaron', 4), ('Lander', 5);

create table golf_holes (
  id uuid primary key default gen_random_uuid(),
  position int not null,
  kind text not null default 'cafe' check (kind in ('cafe', 'cultuur')),
  bar_name text not null default '',
  description text not null default '',
  par int not null default 3,
  rule text not null default '',
  created_at timestamptz not null default now()
);

insert into golf_holes (position, bar_name, par, rule)
select n, 'Hole ' || n, 3, '' from generate_series(1, 9) as n;

create table golf_scores (
  id uuid primary key default gen_random_uuid(),
  hole_id uuid not null references golf_holes(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  strokes int not null check (strokes >= 0),
  unique (hole_id, player_id)
);

create table plan_items (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  part text not null default 'Namiddag',
  position int not null default 0,
  time time,
  title text not null,
  location text,
  note text,
  details text,
  url text,
  status text not null default 'vast' check (status in ('vast', 'optioneel')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tickets bij een planningsitem (player_id null = groepsticket).
-- De ticketcodes zelf staan NIET in deze (publieke) repo: die zitten enkel in de database.
create table tickets (
  id uuid primary key default gen_random_uuid(),
  plan_item_id uuid not null references plan_items(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  label text not null,
  code text not null,
  info text
);

-- Kosten (Tricount): gelijk verdeeld over split_between
create table expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount_cents int not null check (amount_cents > 0),
  paid_by uuid not null references players(id) on delete cascade,
  split_between uuid[] not null,
  created_at timestamptz not null default now()
);

-- Planning: enkel concrete uren waar het vastligt, de rest per dagdeel.
insert into plan_items (day, part, position, time, title, note, location, url, status, details) values
-- ───────── VRIJDAG 13 NOV ─────────
('2026-11-13', 'Ochtend', 1, '09:40', '✈️ Vlucht SN 2581 naar Berlijn', 'Brussel 09:40 → Berlin BER 11:05', 'Brussels Airport', null, 'vast',
$$## Vlucht
- Brussels Airlines **SN 2581**
- Vertrek Brussels Airport **09:40**
- Landen in Berlin Brandenburg (BER) om **11:05**$$),

('2026-11-13', 'Middag', 2, null, '🎒 Naar het hostel, shit droppen', 'Bagage weg en direct terug buiten.', 'Stresemannstraße 66, 10963 Berlin', null, 'vast',
$$## Van BER naar het hostel
- Ge hebt een ticket voor **zone ABC** nodig (BER ligt in zone C). Kopen in de BVG-app of aan de automaat. Papieren ticket? Niet vergeten afstempelen.
- Trein van BER naar het centrum, en dan naar **Anhalter Bahnhof** (S-Bahn). Het hostel ligt daar om de hoek.
- Reken ±45 min tot aan de deur.

## Hostel
- Stresemannstraße 66, 10963 Berlin (Kreuzberg)
- De knop **🏠 Naar huis** bovenaan in de app brengt u altijd terug.$$),

('2026-11-13', 'Middag', 3, null, '🍔 Snelle lunch + 1 of 2 grosses bier', 'Om in de stemming te komen 🍻', null, null, 'vast', null),

('2026-11-13', 'Namiddag', 4, null, '🖼️ Neue Nationalgalerie', 'Tickets zitten in de app, geldig heel de dag. Senne gaat niet mee.', 'Neue Nationalgalerie, Potsdamer Straße 50, 10785 Berlin', 'https://www.smb.museum/en/museums-institutions/neue-nationalgalerie/home/', 'vast',
$$## Praktisch
- Ons ticket is een **Hausticket**: binnen in alle tentoonstellingen, heel de dag geldig (vr 13 nov).
- 3 tickets zijn **ermäßigt** (€10, studententarief): **studentenkaart meepakken**, ze kunnen ernaar vragen. 1 ticket is **regulär** (€20).
- Vanaf het hostel ±20 min te voet.
- Grote rugzakken moeten waarschijnlijk in de vestiaire of een locker.

## Het gebouw
Het glazen paviljoen van **Ludwig Mies van der Rohe** uit 1968, een icoon van de moderne architectuur. Tussen 2015 en 2021 grondig gerenoveerd door David Chipperfield. Boven staat de grote glazen hal voor grote installaties, onder zitten de collectie en de andere tentoonstellingszalen.

## Vaste collectie
Kunst uit de 20e eeuw: expressionisme (Kirchner, Nolde), Neue Sachlichkeit (Otto Dix, George Grosz), Max Beckmann, en ook werk van o.a. Picasso, Klee en Kandinsky. Delen van de collectie worden soms heringericht, dus check ter plaatse welke zalen open zijn.

## Tijdelijke expo: Maurizio Cattelan, NIGHT
- Loopt van **10 sep 2026 tot 7 maart 2027**.
- Cattelan krijgt de **Preis der Nationalgalerie 2026**, en dit is zijn eerste grote solo-expo in Duitsland.
- Cattelan is de Italiaan van de banaan die met tape aan de muur hangt (*Comedian*) en het gouden wc (*America*). Reken op provocerend en grappig werk.
- Bekende werken samen met nieuwe stukken die hij speciaal voor het gebouw van Mies van der Rohe maakte.$$),

('2026-11-13', 'Namiddag', 5, null, '🍺 Welverdiende grosses bier', 'Na al die cultuur.', null, null, 'vast', null),

('2026-11-13', 'Avond', 6, null, '🌆 Op ''t gemak terrassen rond Hackescher Markt', 'Eten, pinten, geen stress.', 'Hackescher Markt', null, 'vast',
$$- Met het OV ±15 à 20 min vanaf Potsdamer Platz.
- Rond de **Hackesche Höfe** en in de straten errond (Rosenthaler Straße, Oranienburger Straße) zitten veel bars en restaurants.
- 't Is november: zoek een terras met heaters, of ga gewoon binnen zitten.$$),

-- ───────── ZATERDAG 14 NOV ─────────
('2026-11-14', 'Ochtend', 1, null, '🥐 Ontbijten', 'Op het gemak, maar om 09:30 staan we buiten!', null, null, 'vast', null),

('2026-11-14', 'Ochtend', 2, '09:30', '🚇 Buiten staan, richting Gesundbrunnen', '±30 min OV, en we moeten er 10 min op voorhand zijn. Te laat = niet binnen!', 'S+U Gesundbrunnen', null, 'vast',
$$- Bestemming: station **Gesundbrunnen** (U8, S1, S2, S25, S26, S41, S42).
- Meetingpoint: **Brunnenstraße 105**, vóór het metrostation Gesundbrunnen.
- Om **10:50** moeten we daar staan. Te laat komen kan niet.$$),

('2026-11-14', 'Ochtend', 3, '11:00', '🕳️ Berliner Unterwelten: Dark Worlds', 'Engelstalige tour van 90 min onder de grond. Ticket zit in de app.', 'Brunnenstraße 105, 13355 Berlin', 'https://www.berliner-unterwelten.de/en/', 'vast',
$$## Praktisch
- **Dark Worlds** (Tour English), za 14 nov om **11:00**, duurt **90 min**
- Boeking **60364 / 537991**, op naam van Bent, voor 5 personen
- Meetingpoint: Brunnenstraße 105, vóór het metrostation Gesundbrunnen. **10 min op voorhand** zijn, te laat = niet binnen
- **Stevige schoenen** aandoen
- **Geen foto's of filmen**, en geen grote tassen of bagage mee

## Wat is het?
Berliner Unterwelten is een vereniging die de ondergrondse gebouwen van Berlijn onderzoekt en openstelt. Met Dark Worlds ga je onder station Gesundbrunnen een **schuilbunker uit de Tweede Wereldoorlog** in. De gids vertelt hoe Berlijners de bombardementen beleefden en hoe zo'n bunker werkte.

Na de tour zit ge vlak bij het **Mauerpark** en de **Bernauer Straße** (Berlijnse Muur).$$),

('2026-11-14', 'Middag', 4, null, '🍽️ Lunch in de buurt + eerste grosses bier van de dag', 'Rond Gesundbrunnen of richting Mauerpark.', null, null, 'vast', null),

('2026-11-14', 'Namiddag', 5, null, '⛳ Pubgolf', 'Mix van cultuurstops en cafés met opdrachten. Parcours en scores: zie de Pubgolf-tab.', null, null, 'vast',
$$- Het parcours (cultuurstops + cafés) staat in de **Pubgolf-tab**.
- In elk café vult ge de slagen in. Laagste totaal wint.
- Strafpunten tellen gewoon als extra slagen.$$),

('2026-11-14', 'Avond', 6, null, '🥙 Kebab vatten', 'Berlijn = kebabhoofdstad.', null, null, 'vast',
$$Bekende adressen (lange rij = goed teken):
- **Mustafa's Gemüse Kebap**, Mehringdamm 32 (Kreuzberg)
- **Rüyam Gemüse Kebab**, Hauptstraße 133 (Schöneberg)
- Of gewoon de eerste Imbiss op de weg. Zelden slecht hier.$$),

('2026-11-14', 'Nacht', 7, null, '🪩 Club proberen binnen te geraken', 'Eventueel. Aan de deur is niks zeker.', null, null, 'optioneel',
$$## Tips voor de deur
- In kleine groepjes van 2 à 3 aanschuiven, niet met 5 tegelijk
- Rustig blijven in de rij: niet te zat, niet luid Nederlands roepen
- Casual en donker gekleed
- Weten wie er draait helpt: vooraf eens checken op Resident Advisor

## Bekende clubs
- **Berghain**, Am Wriezener Bahnhof (Friedrichshain): de bekendste, en de moeilijkste deur
- **Sisyphos**, Hauptstraße 15 (Lichtenberg)
- **Kater Blau**, Holzmarktstraße 25
- **Tresor**, Köpenicker Straße 70$$),

-- ───────── ZONDAG 15 NOV: volgt nog ─────────

-- ───────── MAANDAG 16 NOV ─────────
('2026-11-16', 'Ochtend', 1, null, '🧳 Uitchecken en naar BER', 'Rond 10:00 op de luchthaven zijn.', 'Berlin Brandenburg Airport', null, 'vast',
$$- Zelfde weg terug: Anhalter Bahnhof → trein naar BER. Ticket **zone ABC**.
- Reken ±45 min.$$),

('2026-11-16', 'Middag', 2, '11:55', '✈️ Vlucht SN 2582 naar Brussel', 'BER 11:55 → Brussel 13:20', 'Berlin Brandenburg Airport', null, 'vast',
$$## Vlucht
- Brussels Airlines **SN 2582**
- Vertrek Berlin Brandenburg (BER) **11:55**
- Landen in Brussel om **13:20**$$);

-- Fase 2
create table quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  points int not null default 1
);

create table quest_completions (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references quests(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (quest_id, player_id)
);

-- Open toegang (privé weekendapp) en realtime aan
do $$
declare t text;
begin
  foreach t in array array[
    'players','golf_holes','golf_scores','plan_items',
    'tickets','expenses','quests','quest_completions'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "open_all" on %I for all using (true) with check (true)', t);
    execute format('alter publication supabase_realtime add table %I', t);
  end loop;
end $$;

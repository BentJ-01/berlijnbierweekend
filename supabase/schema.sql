-- Berlijn vriendenweekend: schema + seed
-- Uitvoeren in Supabase: SQL Editor > New query > plakken > Run

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

insert into players (name, sort_order) values
  ('Benjamin', 1), ('Bent', 2), ('Senne', 3), ('Aaron', 4), ('Lander', 5);

create table drinks (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  kind text not null default 'pint',
  created_at timestamptz not null default now()
);
create index drinks_player_idx on drinks(player_id);

create table golf_holes (
  id uuid primary key default gen_random_uuid(),
  position int not null,
  bar_name text not null default '',
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
  time time,
  title text not null,
  location text,
  note text,
  status text not null default 'vast' check (status in ('vast', 'optioneel')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Planning: elke dag één buurt, niks zots voor 11u.
-- Vr = Mitte-Oost/Noord, Za = West (winkels zijn zondag dicht) + uitgaan, Zo = Mitte + Muur.
insert into plan_items (day, time, title, location, note, status) values
  -- Vrijdag 13 nov: aankomst, Muur-gedenkplaats, Alex, pubgolf
  ('2026-11-13', '09:40', 'Vlucht SN 2581 Brussel naar Berlijn', 'Brussels Airport', 'Aankomst 11:05', 'vast'),
  ('2026-11-13', '11:30', 'Trein naar het centrum', 'Berlin Brandenburg Airport', 'FEX of S-Bahn, ±35 min. Ticket zone ABC nodig (of Welcome Card 48u/72u ABC).', 'vast'),
  ('2026-11-13', '12:30', 'Inchecken / bagage droppen', null, null, 'vast'),
  ('2026-11-13', '13:30', 'Lunch: currywurst bij Konnopke''s', 'Konnopke''s Imbiss, Schönhauser Allee 44B', 'Klassieker sinds 1930, onder de metro.', 'vast'),
  ('2026-11-13', '14:30', 'Gedenkstätte Berliner Mauer', 'Bernauer Straße 111', 'Bewaard stuk Muur + uitkijktoren. Reken 1 à 2u, voor het donker wordt (±16:30).', 'vast'),
  ('2026-11-13', '16:30', 'Hackesche Höfe', 'Rosenthaler Straße 40', 'Binnenkoertjes met winkeltjes en café''s.', 'vast'),
  ('2026-11-13', '17:30', 'Fernsehturm', 'Panoramastraße 1A', 'Berlijn by night vanop 203 m. Tickets met tijdslot vooraf boeken!', 'vast'),
  ('2026-11-13', '19:30', 'Avondeten rond Hackescher Markt', 'Hackescher Markt', null, 'vast'),
  ('2026-11-13', '21:00', 'Pubgolf ⛳🍺', 'Mitte', 'Holes invullen in de Pubgolf-tab.', 'vast'),
  -- Zaterdag 14 nov: West-Berlijn, daarna uitgaan
  ('2026-11-14', '11:00', 'Schloss Charlottenburg', 'Spandauer Damm 10', 'Paleis + tuin (tuin is gratis).', 'vast'),
  ('2026-11-14', '12:15', 'Bröhan-Museum of Sammlung Scharf-Gerstenberg', 'Schloßstraße 1a', 'Recht tegenover het paleis. Art nouveau of surrealisme, voor wie zin heeft.', 'optioneel'),
  ('2026-11-14', '13:30', 'Lunch op de Kurfürstendamm', 'Kurfürstendamm', null, 'vast'),
  ('2026-11-14', '14:30', 'Kaiser-Wilhelm-Gedächtniskirche', 'Breitscheidplatz', 'Kapotgebombde kerktoren, bewust zo gelaten.', 'vast'),
  ('2026-11-14', '15:00', 'Bikini Berlin', 'Budapester Straße 38', 'Conceptmall, dakterras met zicht op de apen van de Zoo.', 'optioneel'),
  ('2026-11-14', '15:45', 'KaDeWe', 'Tauentzienstraße 21', 'Grootste warenhuis van Europa. 6e verdieping = food hall, pintje pakken. Zondag dicht!', 'vast'),
  ('2026-11-14', '17:30', 'Terug naar hotel, even platliggen', null, 'Krachten sparen voor vanavond.', 'optioneel'),
  ('2026-11-14', '20:00', 'Avondeten in Friedrichshain', 'Simon-Dach-Straße', null, 'vast'),
  ('2026-11-14', '23:00', 'Uitgaan 🎉', 'RAW-Gelände, Revaler Straße 99', 'Bars en clubs op één terrein. Berghain voor wie durft (Am Wriezener Bahnhof).', 'vast'),
  -- Zondag 15 nov: Mitte en de Muur (rustig starten)
  ('2026-11-15', '11:00', 'Reichstag: koepel', 'Platz der Republik 1', 'Gratis, maar VOORAF registreren op bundestag.de! ID meenemen.', 'vast'),
  ('2026-11-15', '12:00', 'Brandenburger Tor', 'Pariser Platz', null, 'vast'),
  ('2026-11-15', '12:20', 'Holocaust-Mahnmal', 'Cora-Berliner-Straße 1', '5 min stappen vanaf de Brandenburger Tor.', 'vast'),
  ('2026-11-15', '13:00', 'Lunch: döner', 'Friedrichstraße', null, 'vast'),
  ('2026-11-15', '14:00', 'Checkpoint Charlie', 'Friedrichstraße 43', 'Oude grensovergang Oost/West.', 'vast'),
  ('2026-11-15', '14:45', 'Unter den Linden en Bebelplatz', 'Bebelplatz', 'Via de Gendarmenmarkt. Op Bebelplatz: monument boekverbranding 1933.', 'vast'),
  ('2026-11-15', '15:15', 'Museumsinsel en Berliner Dom', 'Am Lustgarten', 'Pergamonmuseum is dicht voor renovatie.', 'vast'),
  ('2026-11-15', '15:45', 'Humboldt Forum', 'Schloßplatz', 'Veel gratis te bezoeken, dakterras met uitzicht.', 'optioneel'),
  ('2026-11-15', '17:00', 'East Side Gallery', 'Mühlenstraße', 'Langste stuk Muur (1,3 km schilderingen). S-Bahn naar Warschauer Straße.', 'vast'),
  ('2026-11-15', '19:30', 'Avondeten in Kreuzberg', 'Schlesisches Tor', 'Over de Oberbaumbrücke stappen.', 'vast'),
  ('2026-11-15', '21:30', 'Rustige pint of toch nog uitgaan', 'Kreuzberg', 'Zien hoe we ons voelen.', 'optioneel'),
  -- Maandag 16 nov: naar huis
  ('2026-11-16', '09:15', 'Uitchecken en trein naar BER', 'Berlin Brandenburg Airport', 'FEX of S-Bahn, ±35 min. Rond 10:00 op de luchthaven.', 'vast'),
  ('2026-11-16', '11:55', 'Vlucht SN 2582 Berlijn naar Brussel', 'Berlin Brandenburg Airport', 'Aankomst 13:20', 'vast');

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
    'players','drinks','golf_holes','golf_scores',
    'plan_items','quests','quest_completions'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "open_all" on %I for all using (true) with check (true)', t);
    execute format('alter publication supabase_realtime add table %I', t);
  end loop;
end $$;

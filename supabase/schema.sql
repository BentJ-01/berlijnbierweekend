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

insert into plan_items (day, time, title, location, note, status) values
  ('2026-11-13', '09:40', 'Vlucht SN 2581 Brussel naar Berlijn', 'Brussels Airport', 'Aankomst 11:05', 'vast'),
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

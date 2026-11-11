-- Berlijn vriendenweekend: database voor wat we tijdens het weekend zelf ingeven.
-- De planning, tickets en het pubgolf-parcours staan in de code (src/data/).
-- Uitvoeren in Supabase: SQL Editor > New query > plakken > Run

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

insert into players (name, sort_order) values
  ('Benjamin', 1), ('Bent', 2), ('Senne', 3), ('Aaron', 4), ('Lander', 5);

-- Café-holes van de pubgolf. De id's komen overeen met src/data/parcours.ts.
create table golf_holes (
  id uuid primary key default gen_random_uuid(),
  position int not null,
  bar_name text not null default '',
  par int not null default 3,
  rule text not null default '',
  created_at timestamptz not null default now()
);

insert into golf_holes (id, position, bar_name, par, rule) values
  ('702b63b4-351b-4c9d-bbb2-4520c83278e3', 0, '', 3, 'Drink staand'),
  ('768e523d-46ea-4230-a09c-8ceb1ec0e2f1', 1, '', 3, 'Bestel in het Duits'),
  ('9e48080e-b5ee-44e0-bdd1-19c950dee121', 2, '', 3, 'Drink met je zwakke hand'),
  ('150e636c-22ff-4624-ad05-97d0be86839a', 3, '', 3, 'Proost met iedereen in de bar'),
  ('959f401d-70f8-44c9-8356-544752de852b', 4, '', 3, 'Geen woord Nederlands tot je glas leeg is'),
  ('61af575d-2e94-434c-9bf0-2d90715853a3', 5, '', 3, 'Laatste die klaar is, krijgt +1'),
  ('d5f04112-a58e-483a-98f1-7371cd577bea', 6, '', 3, 'Elke slok begint met een toast');

create table golf_scores (
  id uuid primary key default gen_random_uuid(),
  hole_id uuid not null references golf_holes(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  strokes int not null check (strokes >= 0),
  unique (hole_id, player_id)
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

-- Open toegang (privé weekendapp) en realtime aan
do $$
declare t text;
begin
  foreach t in array array['players','golf_holes','golf_scores','expenses'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "open_all" on %I for all using (true) with check (true)', t);
    execute format('alter publication supabase_realtime add table %I', t);
  end loop;
end $$;

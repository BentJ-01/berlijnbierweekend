// Het pubgolf-parcours van zaterdag. De cultuurstops staan vast in de code.
// De cafés (holes) hebben een vaste id: naam, par en opdracht kan je ter plaatse
// aanpassen in de app (tabel golf_holes), de scores staan in golf_scores.

export type CultuurStop = {
  kind: 'cultuur'
  name: string
  location: string
  description: string
}

export type CafeStop = {
  kind: 'cafe'
  id: string
  hint: string
  defaultRule: string
}

export type Stop = CultuurStop | CafeStop

export const PARCOURS: Stop[] = [
  {
    kind: 'cafe',
    id: '702b63b4-351b-4c9d-bbb2-4520c83278e3',
    hint: 'Kan meteen bij de Späti van Harmonie: blikje kopen en op de stoep drinken. Snel en goedkoop.',
    defaultRule: 'Drink staand',
  },
  {
    kind: 'cultuur',
    name: 'The Berlin Wall and its Fall',
    location: 'Schwedter Straße, 10119 Berlin',
    description: 'Expo over de Muur en hoe die gevallen is, aan de Schwedter Straße (rand van het Mauerpark).',
  },
  { kind: 'cafe', id: '768e523d-46ea-4230-a09c-8ceb1ec0e2f1', hint: 'Café in de buurt, op weg naar de Bernauer Straße.', defaultRule: 'Bestel in het Duits' },
  {
    kind: 'cultuur',
    name: 'Gedenkstätte Berliner Mauer',
    location: 'Gedenkstätte Berliner Mauer, Bernauer Straße 111, 13355 Berlin',
    description:
      'Het best bewaarde stuk Muur, met de dodenstrook en een wachttoren. Vanaf het uitkijkplatform aan het documentatiecentrum (Bernauer Str. 111, gratis) zie je alles van bovenaf.',
  },
  {
    kind: 'cafe',
    id: '9e48080e-b5ee-44e0-bdd1-19c950dee121',
    hint: 'Café in de buurt van de Bernauer Straße. Daarna S-Bahn van Nordbahnhof naar Brandenburger Tor (S1, S2 of S25, 2 haltes). Om 17:15 aan de Reichstag!',
    defaultRule: 'Drink met je zwakke hand',
  },
  {
    kind: 'cultuur',
    name: 'Weiße Kreuze',
    location: 'Gedenkstätte Weiße Kreuze, Reichstagufer, 10117 Berlin',
    description:
      'Witte kruisen aan de Spree, vlak bij de Reichstag, voor mensen die stierven bij een vluchtpoging over de Muur. Ligt op de wandeling van station Brandenburger Tor naar de ingang van de Reichstag: 5 min, geen eigen hole.',
  },
  {
    kind: 'cultuur',
    name: 'Reichstag: koepel (17:30)',
    location: 'Reichstagsgebäude, Platz der Republik 1, 11011 Berlin',
    description: 'Gereserveerd om 17:30. Om 17:15 aan de bezoekersingang (Platz der Republik), Bent toont de bevestiging, iedereen ID mee. Geen flessen meenemen!',
  },
  { kind: 'cafe', id: '150e636c-22ff-4624-ad05-97d0be86839a', hint: 'Café in de buurt.', defaultRule: 'Proost met iedereen in de bar' },
  {
    kind: 'cultuur',
    name: 'Brandenburger Tor',
    location: 'Brandenburger Tor, Pariser Platz, 10117 Berlin',
    description: 'Hét symbool van Berlijn. Stond tot 1989 net in het niemandsland tussen Oost en West.',
  },
  { kind: 'cafe', id: '959f401d-70f8-44c9-8356-544752de852b', hint: 'Café in de buurt.', defaultRule: 'Geen woord Nederlands tot je glas leeg is' },
  {
    kind: 'cultuur',
    name: 'Holocaust-Mahnmal',
    location: 'Denkmal für die ermordeten Juden Europas, Cora-Berliner-Straße 1, 10117 Berlin',
    description: '2711 betonblokken ter nagedachtenis van de vermoorde Joden van Europa. Even rustig doen hier, en niet op de blokken klimmen.',
  },
  { kind: 'cafe', id: '61af575d-2e94-434c-9bf0-2d90715853a3', hint: 'Café in de buurt.', defaultRule: 'Laatste die klaar is, krijgt +1' },
  {
    kind: 'cultuur',
    name: 'Checkpoint Charlie',
    location: 'Checkpoint Charlie, Friedrichstraße 43-45, 10117 Berlin',
    description: 'De bekendste grensovergang tussen Oost- en West-Berlijn. Het wachthuisje is een replica.',
  },
  { kind: 'cafe', id: 'd5f04112-a58e-483a-98f1-7371cd577bea', hint: 'Café in de buurt.', defaultRule: 'Elke slok begint met een toast' },
  {
    kind: 'cultuur',
    name: 'Unter den Linden en Bebelplatz',
    location: 'Bebelplatz, 10117 Berlin',
    description:
      'Statige boulevard van de Brandenburger Tor tot aan het Museumsinsel. Op de Bebelplatz: een glazen raam in de grond met lege boekenkasten, ter herdenking van de boekverbranding van 1933.',
  },
]

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
  quiz?: QuizVraag[]
}

export type QuizVraag = { q: string; a: string }

/** Quiz voor hole 4, over de Reichstag (en de Muur) die we net gezien hebben. */
const REICHSTAG_QUIZ: QuizVraag[] = [
  { q: 'In welk jaar werd de Reichstag geopend?', a: '1894' },
  { q: 'Welke tekst staat er boven de ingang?', a: '"Dem deutschen Volke" (aan het Duitse volk)' },
  { q: 'Wat gebeurde er met het gebouw in februari 1933?', a: 'Het brandde: de Reichstagsbrand. De nazi\'s gebruikten die om grondrechten af te schaffen.' },
  { q: 'Welk leger hees in 1945 zijn vlag op het dak?', a: 'Het Rode Leger (Sovjet-Unie)' },
  { q: 'Welk kunstenaarskoppel pakte de Reichstag in 1995 helemaal in?', a: 'Christo en Jeanne-Claude' },
  { q: 'Welke architect ontwierp de glazen koepel?', a: 'Norman Foster' },
  { q: 'In welk jaar ging de koepel open en kwam de Bundestag hier terug samen?', a: '1999' },
  { q: 'Welke stad was vóór Berlijn de hoofdstad van West-Duitsland?', a: 'Bonn' },
  { q: 'Waarvoor dient de spiegelkegel in het midden van de koepel?', a: 'Hij weerkaatst daglicht naar de vergaderzaal eronder (en helpt bij de ventilatie).' },
  { q: 'Wie is de huidige bondskanselier van Duitsland?', a: 'Friedrich Merz' },
  { q: 'Voor wie staan de witte kruisen aan de Spree?', a: 'Voor mensen die stierven bij een vluchtpoging over de Muur' },
  { q: 'In welk jaar werd de Berlijnse Muur gebouwd?', a: '1961 (13 augustus)' },
  { q: 'Op welke datum viel de Muur?', a: '9 november 1989' },
  { q: 'Hoe heet het Duitse parlement dat in de Reichstag zetelt?', a: 'De Bundestag' },
]

export type Stop = CultuurStop | CafeStop

export const PARCOURS: Stop[] = [
  {
    kind: 'cafe',
    id: '702b63b4-351b-4c9d-bbb2-4520c83278e3',
    hint: 'Kan meteen bij de Späti van Harmonie: blikje kopen en op de stoep drinken. Snel en goedkoop.',
    defaultRule: 'Laatste met een leeg glas: +1',
  },
  {
    kind: 'cultuur',
    name: 'The Berlin Wall and its Fall',
    location: 'Schwedter Straße, 10119 Berlin',
    description: 'Expo over de Muur en hoe die gevallen is, aan de Schwedter Straße (rand van het Mauerpark).',
  },
  { kind: 'cafe', id: '768e523d-46ea-4230-a09c-8ceb1ec0e2f1', hint: 'Café in de buurt, op weg naar de Bernauer Straße.', defaultRule: 'Geen woord Nederlands tot uw glas leeg is. Elke keer dat iemand toch Nederlands praat: +1' },
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
    hint: 'Café in de buurt van de Bernauer Straße. Daarna S-Bahn van Nordbahnhof naar Brandenburger Tor (S1, S2 of S25, 2 haltes).',
    defaultRule: 'Stille hole: niemand praat tot het glas leeg is. Elke keer dat iemand iets zegt: +1',
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
    name: 'Reichstag: koepel',
    location: 'Reichstagsgebäude, Platz der Republik 1, 11011 Berlin',
    description: 'Geen reservatie: we gaan langs en zien of er plek is (vraag het aan het bezoekerscentrum ernaast). Iedereen ID mee, geen flessen meenemen. Geen plek? Door naar de volgende hole.',
  },
  {
    kind: 'cafe',
    id: '150e636c-22ff-4624-ad05-97d0be86839a',
    hint: 'Café in de buurt van de Reichstag.',
    defaultRule: 'Quiz over de Reichstag: fout antwoord = je valt af. Eerste afvaller +2, tweede en derde afvaller +1, de rest niets',
    quiz: REICHSTAG_QUIZ,
  },
  {
    kind: 'cultuur',
    name: 'Brandenburger Tor',
    location: 'Brandenburger Tor, Pariser Platz, 10117 Berlin',
    description: 'Hét symbool van Berlijn. Stond tot 1989 net in het niemandsland tussen Oost en West.',
  },
  { kind: 'cafe', id: '959f401d-70f8-44c9-8356-544752de852b', hint: 'Café in de buurt.', defaultRule: 'Thumb-king: de leider van het scorebord is Thumb-king. Legt die stiekem de duim op tafel, dan krijgt wie het laatst volgt +1. Geldt tot aan het volgende café' },
  {
    kind: 'cultuur',
    name: 'Holocaust-Mahnmal',
    location: 'Denkmal für die ermordeten Juden Europas, Cora-Berliner-Straße 1, 10117 Berlin',
    description: '2711 betonblokken ter nagedachtenis van de vermoorde Joden van Europa. Even rustig doen hier, en niet op de blokken klimmen.',
  },
  { kind: 'cafe', id: '61af575d-2e94-434c-9bf0-2d90715853a3', hint: 'Café in de buurt.', defaultRule: '' },
  {
    kind: 'cultuur',
    name: 'Checkpoint Charlie',
    location: 'Checkpoint Charlie, Friedrichstraße 43-45, 10117 Berlin',
    description: 'De bekendste grensovergang tussen Oost- en West-Berlijn. Het wachthuisje is een replica.',
  },
  { kind: 'cafe', id: 'd5f04112-a58e-483a-98f1-7371cd577bea', hint: 'Café in de buurt.', defaultRule: '' },
  {
    kind: 'cultuur',
    name: 'Unter den Linden en Bebelplatz',
    location: 'Bebelplatz, 10117 Berlin',
    description:
      'Statige boulevard van de Brandenburger Tor tot aan het Museumsinsel. Op de Bebelplatz: een glazen raam in de grond met lege boekenkasten, ter herdenking van de boekverbranding van 1933.',
  },
]

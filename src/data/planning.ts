// De planning van het weekend. Staat bewust in de code, niet in de database:
// aanpassen = dit bestand wijzigen en pushen.

export type Part = 'Ochtend' | 'Middag' | 'Namiddag' | 'Avond' | 'Nacht'

export type PlanItem = {
  id: string
  day: string
  part: Part
  time?: string
  title: string
  note?: string
  location?: string
  url?: string
  optional?: boolean
  details?: string
}

/** Ticket bij een planningsitem. player = naam, of null voor een groepsticket. */
export type Ticket = {
  itemId: string
  player: string | null
  label: string
  code: string
  info: string
}

export const DAYS = [
  { date: '2026-11-13', label: 'Vrijdag', short: 'Vr 13' },
  { date: '2026-11-14', label: 'Zaterdag', short: 'Za 14' },
  { date: '2026-11-15', label: 'Zondag', short: 'Zo 15' },
  { date: '2026-11-16', label: 'Maandag', short: 'Ma 16' },
]

export const PLANNING: PlanItem[] = [
  // ───────── VRIJDAG 13 NOV ─────────
  {
    id: 'vlucht-heen',
    day: '2026-11-13',
    part: 'Ochtend',
    time: '09:40',
    title: 'Vlucht SN 2581 naar Berlijn',
    note: 'Brussel 09:40 → Berlin BER 11:05',
    location: 'Brussels Airport',
    details: `## Vlucht
- Brussels Airlines **SN 2581**
- Vertrek Brussels Airport **09:40**
- Landen in Berlin Brandenburg (BER) om **11:05**`,
  },
  {
    id: 'hostel',
    day: '2026-11-13',
    part: 'Middag',
    title: 'Naar het hostel, shit droppen',
    note: 'Bagage weg en direct terug buiten.',
    location: 'Stresemannstraße 66, 10963 Berlin',
    details: `## Van BER naar het hostel
- Ge hebt een ticket voor **zone ABC** nodig (BER ligt in zone C). Kopen in de BVG-app of aan de automaat. Papieren ticket? Niet vergeten afstempelen.
- Trein van BER naar het centrum, en dan naar **Anhalter Bahnhof** (S-Bahn). Het hostel ligt daar om de hoek.
- Reken ±45 min tot aan de deur.

## Hostel
- Stresemannstraße 66, 10963 Berlin (Kreuzberg)
- De knop **Naar huis** bovenaan in de app brengt u altijd terug.`,
  },
  {
    id: 'lunch-vr',
    day: '2026-11-13',
    part: 'Middag',
    title: 'Snelle lunch + 1 of 2 grosses bier',
    note: 'Om in de stemming te komen.',
  },
  {
    id: 'nationalgalerie',
    day: '2026-11-13',
    part: 'Namiddag',
    title: 'Neue Nationalgalerie',
    note: 'Tickets zitten in de app, geldig heel de dag. Senne gaat niet mee.',
    location: 'Neue Nationalgalerie, Potsdamer Straße 50, 10785 Berlin',
    url: 'https://www.smb.museum/en/museums-institutions/neue-nationalgalerie/home/',
    details: `## Praktisch
- Ons ticket is een **Hausticket**: binnen in alle tentoonstellingen, heel de dag geldig (vr 13 nov).
- 3 tickets zijn **ermäßigt** (€10, studententarief): **studentenkaart meepakken**, ze kunnen ernaar vragen. Het ticket van Aaron is **regulär** (€20).
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
- Bekende werken samen met nieuwe stukken die hij speciaal voor het gebouw van Mies van der Rohe maakte.`,
  },
  {
    id: 'pint-vr',
    day: '2026-11-13',
    part: 'Namiddag',
    title: 'Welverdiende grosses bier',
    note: 'Na al die cultuur.',
  },
  {
    id: 'kudamm',
    day: '2026-11-13',
    part: 'Avond',
    title: 'Ronddalken op de Kurfürstendamm',
    note: 'Dé shoppingboulevard van het oude West-Berlijn.',
    location: 'Kurfürstendamm, Berlin',
    details: `- Vanaf de Neue Nationalgalerie ±15 min met de bus of het OV richting **Zoologischer Garten**.
- De Ku'damm is ±3,5 km lang: vroeger de etalage van West-Berlijn, nu winkels, cafés en oude Berlijnse gevels.
- **KaDeWe** (Tauentzienstraße 21) ligt om de hoek: het grootste warenhuis van Europa, met een food hall op de 6e verdieping.`,
  },
  {
    id: 'gedachtniskirche',
    day: '2026-11-13',
    part: 'Avond',
    title: 'Kaiser-Wilhelm-Gedächtniskirche',
    note: 'De kapotgebombde kerktoren aan de Breitscheidplatz.',
    location: 'Kaiser-Wilhelm-Gedächtniskirche, Breitscheidplatz, 10789 Berlin',
    details: `- De oude toren werd in 1943 zwaar geraakt en bewust als ruïne bewaard, als monument tegen de oorlog. Berlijners noemen hem de **"Hohler Zahn"** (holle kies).
- Ernaast staat de nieuwe kerk uit de jaren '60 met muren vol **blauw glas**. Even binnenspringen: vooral 's avonds is dat licht zot.`,
  },
  {
    id: 'bikini',
    day: '2026-11-13',
    part: 'Avond',
    title: 'Pint met zicht op de apen van de Zoo',
    note: 'Op het dak van Bikini Berlin. Andere apen dan Lander, normaal gezien.',
    location: 'Bikini Berlin, Budapester Straße 38-50, 10787 Berlin',
    details: `- **Bikini Berlin** is een conceptmall vlak naast de Gedächtniskirche. Het dakterras kijkt uit over het apenverblijf van de **Zoologischer Garten**.
- Pint erbij? In hetzelfde gebouw zit de **Monkey Bar** van het 25hours Hotel (10e verdieping), met hetzelfde zicht op de Zoo en over de stad.
- In november kan het terras vroeger dicht zijn, of helemaal bij slecht weer. Dan is de Monkey Bar het plan B.`,
  },

  // ───────── ZATERDAG 14 NOV ─────────
  {
    id: 'ontbijt-za',
    day: '2026-11-14',
    part: 'Ochtend',
    title: 'Ontbijten',
    note: 'Op het gemak, maar om 09:30 staan we buiten!',
  },
  {
    id: 'vertrek-za',
    day: '2026-11-14',
    part: 'Ochtend',
    time: '09:30',
    title: 'Buiten staan, richting Gesundbrunnen',
    note: '±30 min OV, en we moeten er 10 min op voorhand zijn. Te laat = niet binnen!',
    location: 'S+U Gesundbrunnen',
    details: `- Bestemming: station **Gesundbrunnen** (U8, S1, S2, S25, S26, S41, S42).
- Meetingpoint: **Brunnenstraße 105**, vóór het metrostation Gesundbrunnen.
- Om **10:50** moeten we daar staan. Te laat komen kan niet.`,
  },
  {
    id: 'unterwelten',
    day: '2026-11-14',
    part: 'Ochtend',
    time: '11:00',
    title: 'Berliner Unterwelten: Dark Worlds',
    note: 'Engelstalige tour van 90 min onder de grond. Ticket zit in de app.',
    location: 'Brunnenstraße 105, 13355 Berlin',
    url: 'https://www.berliner-unterwelten.de/en/',
    details: `## Praktisch
- **Dark Worlds** (Tour English), za 14 nov om **11:00**, duurt **90 min**
- Boeking **60364 / 537991**, op naam van Bent, voor 5 personen
- Meetingpoint: Brunnenstraße 105, vóór het metrostation Gesundbrunnen. **10 min op voorhand** zijn, te laat = niet binnen
- **Stevige schoenen** aandoen
- **Geen foto's of filmen**, en geen grote tassen of bagage mee

## Wat is het?
Berliner Unterwelten is een vereniging die de ondergrondse gebouwen van Berlijn onderzoekt en openstelt. Met Dark Worlds ga je onder station Gesundbrunnen een **schuilbunker uit de Tweede Wereldoorlog** in. De gids vertelt hoe Berlijners de bombardementen beleefden en hoe zo'n bunker werkte.

Na de tour zit ge vlak bij het **Mauerpark** en de **Bernauer Straße** (Berlijnse Muur).`,
  },
  {
    id: 'harmonie',
    day: '2026-11-14',
    part: 'Middag',
    title: 'Lunch + koffie bij Harmonie Bäckerei & Späti',
    note: 'Skere Duitse bakker: snel, goed en goedkoop.',
    location: 'Harmonie Bäckerei & Späti, Ruppiner Str. 10-11, 10115 Berlin',
    details: `- Ruppiner Straße 10-11, 10115 Berlin
- Ligt vlak bij de Bernauer Straße, dus perfect om daarna aan de pubgolf te beginnen.`,
  },
  {
    id: 'pubgolf',
    day: '2026-11-14',
    part: 'Namiddag',
    title: 'Culturele pubgolf',
    note: 'Van de Muur tot Unter den Linden, met telkens een café ertussen. Scores in de Pubgolf-tab.',
    details: `## Parcours
- Hole 1: Späti van Harmonie of café in de buurt
- The Berlin Wall and its Fall (Schwedter Straße)
- Hole 2: café
- Gedenkstätte Berliner Mauer
- Hole 3: café
- S-Bahn Nordbahnhof → Brandenburger Tor
- Weiße Kreuze (op weg naar de ingang, 5 min)
- Reichstag: koepel (**17:30, gereserveerd**)
- Hole 4: café
- Brandenburger Tor
- Hole 5: café
- Holocaust-Mahnmal
- Hole 6: café
- Checkpoint Charlie
- Hole 7: café
- Unter den Linden en Bebelplatz

## Regels
- In elk café: slagen invullen in de **Pubgolf-tab**. Laagste totaal wint.
- Elk café heeft een opdracht. Strafpunten tellen als extra slagen.
- Welk café? Gewoon het eerste goeie in de buurt.`,
  },
  {
    id: 'reichstag',
    day: '2026-11-14',
    part: 'Namiddag',
    time: '17:30',
    title: 'Reichstag: koepel',
    note: 'Om 17:15 aan de bezoekersingang staan, Bent toont de bevestiging. ID mee!',
    location: 'Reichstagsgebäude, Platz der Republik 1, 11011 Berlin',
    url: 'https://www.bundestag.de/en',
    details: `## Let op: datum klopt niet!
De bevestiging van de Bundestag staat op **zaterdag 21 november 2026**, niet op 14 november. Nog aanpassen via **kuppelbesuch@bundestag.de** (vermeld boekingsnummer SYS-20261111-180928) of opnieuw boeken op bundestag.de.

## Boeking
- **Boekingsnummer SYS-20261111-180928**, op naam van Bent Jacobs
- Bezoek aan het dakterras en de koepel, gratis, voor **5 personen**
- Tijdstip: **17:30** (geplande toegang)
- Bent heeft de bevestiging (pdf in de mail) en moet die bij de ingang tonen. We gaan **samen als groep** binnen.

## Aan de ingang
- Ten laatste om **17:15** aan de **centrale bezoekersingang (ZEB)** op de Platz der Republik, ter hoogte van het westportaal van de Reichstag.
- Iedereen een geldig **identiteitsbewijs of paspoort** mee, anders kom je niet binnen.
- Controle zoals op de luchthaven: tassen en jassen door de röntgen, metaaldetector.
- **Niet meenemen:** flessen (dus geen bier van de pubgolf mee), messen, pepperspray, laserpointers, fluitjes.
- Kleding en gedrag moeten "passend" zijn: niet te zat aankomen dus.

## Goed om te weten
- De koepel kan op het laatste moment dicht zijn (zittingen, evenementen, slecht weer). Een annulering komt enkel per mail, dus check de mail van Bent die dag.
- Gratis **audiogids** op het dakterras, ook in het Nederlands.

## Wat is het?
Het Duitse parlement, de Bundestag. Op het dak staat de glazen koepel van Norman Foster (1999): een wandelpad draait naar boven met zicht over heel de stad, en door het glas kijk je naar beneden in de vergaderzaal.`,

  },
  {
    id: 'kebab',
    day: '2026-11-14',
    part: 'Avond',
    title: 'Kebab vatten',
    note: 'Berlijn = kebabhoofdstad.',
    details: `Bekende adressen (lange rij = goed teken):
- **Mustafa's Gemüse Kebap**, Mehringdamm 32 (Kreuzberg)
- **Rüyam Gemüse Kebab**, Hauptstraße 133 (Schöneberg)
- Of gewoon de eerste Imbiss op de weg. Zelden slecht hier.`,
  },
  {
    id: 'club',
    day: '2026-11-14',
    part: 'Nacht',
    title: 'Club proberen binnen te geraken',
    note: 'Banja leidt ons. Aan de deur is niks zeker.',
    optional: true,
    details: `**Banja** is onze gids voor de nacht: kiest de club en zegt hoe we het aanpakken.

## Tips voor de deur
- In kleine groepjes van 2 à 3 aanschuiven, niet met 5 tegelijk
- Rustig blijven in de rij: niet te zat, niet luid Nederlands roepen
- Casual en donker gekleed
- Weten wie er draait helpt: vooraf eens checken op Resident Advisor

## Bekende clubs
- **Berghain**, Am Wriezener Bahnhof (Friedrichshain): de bekendste, en de moeilijkste deur
- **Sisyphos**, Hauptstraße 15 (Lichtenberg)
- **Kater Blau**, Holzmarktstraße 25
- **Tresor**, Köpenicker Straße 70`,
  },

  // ───────── ZONDAG 15 NOV ─────────
  {
    id: 'east-side-gallery',
    day: '2026-11-15',
    part: 'Middag',
    title: 'East Side Gallery',
    note: 'Als we ooit wakker worden. De rest zien we wel.',
    location: 'East Side Gallery, Mühlenstraße, 10243 Berlin',
    details: `- Het langste stuk Berlijnse Muur dat nog overeind staat: ±1,3 km, beschilderd door kunstenaars uit de hele wereld na de val van de Muur.
- Bekendste werk: de **broederkus** van Brezjnev en Honecker.
- Dichtste stations: **Warschauer Straße** of **Ostbahnhof**.
- Aan het einde ligt de **Oberbaumbrücke** over de Spree, richting Kreuzberg.`,
  },

  // ───────── MAANDAG 16 NOV ─────────
  {
    id: 'naar-ber',
    day: '2026-11-16',
    part: 'Ochtend',
    title: 'Uitchecken en naar BER',
    note: 'Rond 10:00 op de luchthaven zijn.',
    location: 'Berlin Brandenburg Airport',
    details: `- Zelfde weg terug: Anhalter Bahnhof → trein naar BER. Ticket **zone ABC**.
- Reken ±45 min.`,
  },
  {
    id: 'vlucht-terug',
    day: '2026-11-16',
    part: 'Middag',
    time: '11:55',
    title: 'Vlucht SN 2582 naar Brussel',
    note: 'BER 11:55 → Brussel 13:20',
    location: 'Berlin Brandenburg Airport',
    details: `## Vlucht
- Brussels Airlines **SN 2582**
- Vertrek Berlin Brandenburg (BER) **11:55**
- Landen in Brussel om **13:20**`,
  },
]

const NG_ERM = 'Vr 13 nov · heel de dag · €10 · studentenkaart mee!'

export const TICKETS: Ticket[] = [
  { itemId: 'nationalgalerie', player: 'Bent', label: 'Neue Nationalgalerie · Hausticket ermäßigt', code: '203wyXaln8g2EB7W7', info: NG_ERM },
  { itemId: 'nationalgalerie', player: 'Benjamin', label: 'Neue Nationalgalerie · Hausticket ermäßigt', code: '203ajm4G2ne0gOxqV', info: NG_ERM },
  { itemId: 'nationalgalerie', player: 'Lander', label: 'Neue Nationalgalerie · Hausticket ermäßigt', code: '203B54Mq3Y146ar3r', info: NG_ERM },
  { itemId: 'nationalgalerie', player: 'Aaron', label: 'Neue Nationalgalerie · Hausticket regulär', code: '203y9DMnmP7xV9nmj', info: 'Vr 13 nov · heel de dag · €20' },
  { itemId: 'unterwelten', player: null, label: 'Dark Worlds · 5 personen', code: '201zjyDY9ARNJZV_K', info: 'Za 14 nov 11:00 · boeking 60364 / 537991' },
]

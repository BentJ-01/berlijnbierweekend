// Extra opdrachten voor de knop "Random opdracht" bij een café.
export const GOLF_RULES = [
  'Gebarentaal: bestel je drankje zonder één woord te zeggen. Lukt het niet: +1',
  'Barman kiest: laat de barman kiezen wat je drinkt. Weigeren: +2',
  'Lokale tip: vraag een Berlijner naar de beste kroeg of döner. Wie niks loskrijgt: +1',
  'Groepsfoto met het personeel. Lukt het niet: iedereen +1',
  'Prijs raden: iedereen gokt wat het rondje kost. Wie er het verst naast zit: +1',
  'Kop of munt: gooi voor je eerste slok een muntje. Kop +1, munt −1',
  'Bierviltje: wip een viltje van de tafelrand en vang het. Niet gelukt na 3 pogingen: +1',
  'Schaar-steen-papier-toernooi: verliezer van de finale +1, winnaar −1',
  'Tongbreker: zeg foutloos "Fischers Fritz fischt frische Fische". Mislukt: +1',
  'Gids van dienst: iemand vertelt 1 minuut over de volgende stop. Stilvallen of onzin: +1',
  'Laatste kiest: wie onderaan staat, kiest de drank van de leider',
  'Gênant verhaal: vertel een gênant verhaal over iemand anders aan tafel. Weigeren: +1',
]

export function randomRule(current?: string) {
  const options = GOLF_RULES.filter((r) => r !== current)
  return options[Math.floor(Math.random() * options.length)]
}

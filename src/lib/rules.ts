export const GOLF_RULES = [
  'Drink met je zwakke hand',
  'Bestel in het Duits',
  'Geen woord Nederlands tot je glas leeg is',
  'Proost met iedereen in de bar',
  'Drink staand',
  'Tafel niet aanraken met je glas tot het leeg is',
  'Praat in een accent naar keuze',
  'Laatste die klaar is, krijgt +1',
  'Bestel zonder te wijzen of te zeggen wat je wil',
  'Elke slok begint met een toast',
]

export function randomRule(current?: string) {
  const options = GOLF_RULES.filter((r) => r !== current)
  return options[Math.floor(Math.random() * options.length)]
}

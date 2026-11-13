// Kingen: 6 min-spellen (samen −52 met 4 spelers) en een troefronde per speler (+1 per slag).

/** Wat er per ronde ingegeven wordt (opgeslagen als jsonb in kingen_rounds.input). */
export type RoundInput = {
  counts?: Record<string, number> // aantal slagen/kaarten per speler
  heartKing?: string // wie de hartenheer pakte
  seventh?: string // wie de 7de slag pakte
  last?: string // wie de laatste slag pakte
}

export type RoundDef = {
  key: string
  name: string
  rule: string
  kind: 'count' | 'heartKing' | 'seventhLast'
  /** Punten per slag/kaart (negatief voor min-spellen). */
  perUnit?: number
  unit?: string
  /** Totaal aantal slagen/kaarten met 4 spelers, om te controleren. */
  total4?: number
  troefBy?: string
  /** Korte uitleg van de ronde (info-knopje). */
  explain: string
}

/** Basisregels die voor elke ronde gelden. */
export const BASIS_UITLEG =
  'Iedereen krijgt evenveel kaarten. Wie uitkomt legt een kaart, de rest moet die kleur volgen als het kan. Kan je niet volgen, dan leg je een andere kaart. De hoogste kaart van de gevraagde kleur wint de slag (of de hoogste troef in een troefronde). Wie de slag wint, komt de volgende keer uit.'

export const MIN_ROUNDS: RoundDef[] = [
  { key: 'slagen', name: 'Geen slagen', rule: '−1 per slag', kind: 'count', perUnit: -1, unit: 'slagen', total4: 13, explain: 'Haal zo weinig mogelijk slagen binnen. Elke slag die je wint, kost 1 punt. Er is geen troef.' },
  { key: 'harten', name: 'Geen harten', rule: '−1 per harten', kind: 'count', perUnit: -1, unit: 'harten', total4: 13, explain: 'Elke harten-kaart in de slagen die je wint, kost 1 punt. Probeer harten dus bij anderen te dumpen als je een kleur niet kan volgen. Geen troef.' },
  { key: 'herenboeren', name: 'Geen heren en boeren', rule: '−1 per heer of boer', kind: 'count', perUnit: -1, unit: 'heren/boeren', total4: 8, explain: 'Elke heer en elke boer in de slagen die je wint, kost 1 punt (8 in totaal). Geen troef.' },
  { key: 'dames', name: 'Geen dames', rule: '−2 per dame', kind: 'count', perUnit: -2, unit: 'dames', total4: 4, explain: 'Elke dame in de slagen die je wint, kost 2 punten (4 dames, dus −8 in totaal). Geen troef.' },
  { key: 'hartenheer', name: 'Geen hartenheer', rule: '−5 voor wie de hartenheer pakt', kind: 'heartKing', explain: 'Wie de slag wint waar de hartenheer in zit, krijgt −5. Meestal stop je de ronde zodra de hartenheer gevallen is. Geen troef.' },
  { key: 'zevenlaatste', name: 'Geen 7de en laatste slag', rule: '7de slag −2, laatste slag −3', kind: 'seventhLast', explain: 'Enkel twee slagen tellen: wie de 7de slag wint, krijgt −2, wie de laatste slag wint, krijgt −3. De andere slagen maken niet uit. Geen troef.' },
]

export function troefRound(playerId: string, name: string): RoundDef {
  return {
    key: `troef-${playerId}`,
    name: `Troef: ${name} kiest`,
    rule: '+1 per slag',
    kind: 'count',
    perUnit: 1,
    unit: 'slagen',
    total4: 13,
    troefBy: playerId,
    explain: `${name} kiest de troefkleur. Kan je de gevraagde kleur niet volgen, dan mag je troeven: de hoogste troef wint de slag. Nu wil je zoveel mogelijk slagen: elke slag is +1.`,
  }
}

export function roundsFor(players: { id: string; name: string }[]): RoundDef[] {
  return [...MIN_ROUNDS, ...players.map((p) => troefRound(p.id, p.name))]
}

/** Punten per speler voor één ronde. */
export function roundPoints(def: RoundDef, input: RoundInput, playerIds: string[]): Map<string, number> {
  const pts = new Map(playerIds.map((id) => [id, 0]))
  if (def.kind === 'count') {
    for (const id of playerIds) pts.set(id, (input.counts?.[id] ?? 0) * (def.perUnit ?? 0))
  } else if (def.kind === 'heartKing') {
    if (input.heartKing && pts.has(input.heartKing)) pts.set(input.heartKing, -5)
  } else {
    if (input.seventh && pts.has(input.seventh)) pts.set(input.seventh, (pts.get(input.seventh) ?? 0) - 2)
    if (input.last && pts.has(input.last)) pts.set(input.last, (pts.get(input.last) ?? 0) - 3)
  }
  return pts
}

export function isComplete(def: RoundDef, input: RoundInput | undefined) {
  if (!input) return false
  if (def.kind === 'heartKing') return Boolean(input.heartKing)
  if (def.kind === 'seventhLast') return Boolean(input.seventh && input.last)
  return Boolean(input.counts)
}

export function formatEuro(cents: number) {
  const sign = cents < 0 ? '−' : ''
  return `${sign}€${(Math.abs(cents) / 100).toFixed(2).replace('.', ',')}`
}

/** "12,50" of "12.5" of "€ 12" → 1250. Ongeldig → null. */
export function parseEuro(input: string): number | null {
  const clean = input.replace(/[€\s]/g, '').replace(',', '.')
  if (!/^\d+(\.\d{0,2})?$/.test(clean)) return null
  const cents = Math.round(parseFloat(clean) * 100)
  return cents > 0 ? cents : null
}

/** Verdeelt een bedrag gelijk; de restcenten gaan naar de eersten in de lijst. */
export function splitCents(amount: number, people: string[]): Map<string, number> {
  const out = new Map<string, number>()
  if (people.length === 0) return out
  const base = Math.floor(amount / people.length)
  let rest = amount - base * people.length
  for (const p of people) {
    out.set(p, base + (rest > 0 ? 1 : 0))
    rest -= 1
  }
  return out
}

export type Transfer = { from: string; to: string; cents: number }

/** Zo weinig mogelijk overschrijvingen om alle saldi op nul te krijgen. */
export function settle(balances: Map<string, number>): Transfer[] {
  const debtors = [...balances].filter(([, v]) => v < 0).map(([id, v]) => ({ id, v: -v }))
  const creditors = [...balances].filter(([, v]) => v > 0).map(([id, v]) => ({ id, v }))
  debtors.sort((a, b) => b.v - a.v)
  creditors.sort((a, b) => b.v - a.v)
  const out: Transfer[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const cents = Math.min(debtors[i].v, creditors[j].v)
    if (cents > 0) out.push({ from: debtors[i].id, to: creditors[j].id, cents })
    debtors[i].v -= cents
    creditors[j].v -= cents
    if (debtors[i].v === 0) i++
    if (creditors[j].v === 0) j++
  }
  return out
}

/** Verdeelt een bedrag volgens delen (bv. 2:1:1); de restcenten gaan naar de grootste resten. */
export function splitByShares(amount: number, shares: Record<string, number>, people: string[]): Map<string, number> {
  const ids = people.filter((p) => (shares[p] ?? 0) > 0)
  const total = ids.reduce((s, p) => s + shares[p], 0)
  const out = new Map<string, number>()
  if (!total) return out
  const exact = ids.map((p) => ({ p, v: (amount * shares[p]) / total }))
  let rest = amount
  for (const { p, v } of exact) {
    out.set(p, Math.floor(v))
    rest -= Math.floor(v)
  }
  exact
    .map((e, i) => ({ ...e, frac: e.v - Math.floor(e.v), i }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
    .slice(0, rest)
    .forEach(({ p }) => out.set(p, (out.get(p) ?? 0) + 1))
  return out
}

/** Verdeling van een uitgave: in delen als die er zijn, anders gelijk. */
export function splitExpense(amount: number, people: string[], shares?: Record<string, number> | null) {
  return shares ? splitByShares(amount, shares, people) : splitCents(amount, people)
}

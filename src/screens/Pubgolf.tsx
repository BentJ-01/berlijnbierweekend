import { useEffect, useMemo, useState } from 'react'
import { Navigation, Pencil } from 'lucide-react'
import { Field, Modal, inputClass } from '../components/Modal'
import { PARCOURS, type CafeStop } from '../data/parcours'
import { mapsRouteUrl, withBerlin } from '../lib/maps'
import { randomRule } from '../lib/rules'
import { supabase, uuid, vibrate } from '../lib/supabase'
import type { Hole, Player, Score, ShowToast, TableApi } from '../lib/types'

type Props = {
  players: Player[]
  me: string
  holes: TableApi<Hole>
  scores: TableApi<Score>
  toast: ShowToast
}

/** Een café uit het parcours, aangevuld met wat er in de database staat. */
type Cafe = CafeStop & { n: number; name: string; par: number; rule: string }

const CAFES = PARCOURS.filter((s): s is CafeStop => s.kind === 'cafe')
const scoreKey = (holeId: string, playerId: string) => `${holeId}:${playerId}`

function formatPar(diff: number) {
  if (diff === 0) return 'par'
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`
}

/** Zorgt dat de hole bestaat in golf_holes (nodig voor de scores). */
async function ensureHole(cafe: Cafe, holes: TableApi<Hole>) {
  if (holes.rows.some((h) => h.id === cafe.id)) return true
  const row = { id: cafe.id, position: cafe.n, bar_name: '', par: cafe.par, rule: cafe.rule }
  const { data, error } = await supabase.from('golf_holes').upsert(row).select().single()
  if (error) return false
  holes.upsertLocal(data as Hole)
  return true
}

export function Pubgolf({ players, me, holes, scores, toast }: Props) {
  const cafes: Cafe[] = useMemo(() => {
    const byId = new Map(holes.rows.map((h) => [h.id, h]))
    return CAFES.map((c, i) => {
      const row = byId.get(c.id)
      return { ...c, n: i + 1, name: row?.bar_name ?? '', par: row?.par ?? 3, rule: row ? row.rule : c.defaultRule }
    })
  }, [holes.rows])
  const cafeById = useMemo(() => new Map(cafes.map((c) => [c.id, c])), [cafes])
  const scoreMap = useMemo(() => new Map(scores.rows.map((s) => [scoreKey(s.hole_id, s.player_id), s])), [scores.rows])

  const current = cafes.find((c) => players.some((p) => !scoreMap.has(scoreKey(c.id, p.id))))

  // undefined = volg de huidige hole, null = alles dicht, string = manueel gekozen
  const [manualOpen, setManualOpen] = useState<string | null | undefined>(undefined)
  useEffect(() => setManualOpen(undefined), [current?.id])
  const openId = manualOpen === undefined ? current?.id : manualOpen

  const [editing, setEditing] = useState<Cafe | null>(null)

  const board = useMemo(() => {
    return players
      .map((p) => {
        let total = 0
        let diff = 0
        let played = 0
        for (const s of scores.rows) {
          const cafe = cafeById.get(s.hole_id)
          if (s.player_id !== p.id || !cafe) continue
          total += s.strokes
          diff += s.strokes - cafe.par
          played++
        }
        return { player: p, total, diff, played }
      })
      // Wie nog niet speelde onderaan, de rest op verschil met par (zoals bij echt golf)
      .sort((a, b) => Number(!a.played) - Number(!b.played) || a.diff - b.diff || a.total - b.total || a.player.sort_order - b.player.sort_order)
  }, [players, scores.rows, cafeById])

  async function setStrokes(cafe: Cafe, player: Player, strokes: number) {
    if (strokes < 0) return
    vibrate()
    const existing = scoreMap.get(scoreKey(cafe.id, player.id))
    scores.upsertLocal({ id: existing?.id ?? uuid(), hole_id: cafe.id, player_id: player.id, strokes })
    const ok =
      (await ensureHole(cafe, holes)) &&
      !(await supabase.from('golf_scores').upsert({ hole_id: cafe.id, player_id: player.id, strokes }, { onConflict: 'hole_id,player_id' }))
        .error
    if (!ok) {
      toast('Niet gelukt, probeer opnieuw')
      void scores.reload()
    }
  }

  return (
    <div className="px-4 pt-4">
      <section className="mb-6 rounded-2xl border border-line bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Scorebord</h2>
        <ol className="flex flex-col">
          {board.map(({ player, total, diff, played }, i) => (
            <li key={player.id} className="flex items-center gap-3 py-1.5">
              <span className="w-5 text-zinc-500">{i + 1}</span>
              <span className={`flex-1 text-lg font-semibold ${player.id === me ? 'text-amber-300' : ''}`}>
                {i === 0 && played > 0 && '👑 '}
                {player.name}
              </span>
              <span className="w-14 text-right text-sm text-zinc-400">{played ? formatPar(diff) : ''}</span>
              <span className="w-10 text-right text-2xl font-black tabular-nums">{played ? total : <span className="text-zinc-600">–</span>}</span>
            </li>
          ))}
        </ol>
      </section>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Parcours zaterdag</h2>

      <ol className="relative ml-4 border-l-2 border-line">
        {PARCOURS.map((stop) => {
          if (stop.kind === 'cultuur') {
            return (
              <li key={stop.name} className="relative mb-3 pl-6">
                <span className="absolute -left-[7px] top-5 h-3 w-3 rounded-full bg-zinc-400" />
                <div className="rounded-2xl border border-line bg-bg px-4 py-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">Cultuurstop</div>
                  <div className="font-bold">{stop.name}</div>
                  <p className="mt-1 text-sm text-zinc-400">{stop.description}</p>
                  <a
                    href={mapsRouteUrl(stop.location)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-amber-300"
                  >
                    <Navigation size={15} />
                    Route in Maps
                  </a>
                </div>
              </li>
            )
          }

          const cafe = cafeById.get(stop.id)!
          const open = cafe.id === openId
          const isCurrent = cafe.id === current?.id
          const filled = players.filter((p) => scoreMap.has(scoreKey(cafe.id, p.id))).length
          const done = filled === players.length
          return (
            <li key={cafe.id} className="relative mb-3 pl-6">
              <span
                className={`absolute -left-[15px] top-4 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black ${
                  isCurrent ? 'bg-amber-400 text-bg' : done ? 'bg-emerald-500 text-bg' : 'bg-zinc-700 text-zinc-200'
                }`}
              >
                {done ? '✓' : cafe.n}
              </span>
              <div className={`rounded-2xl border ${isCurrent ? 'border-amber-400 bg-amber-400/10' : 'border-line bg-card'}`}>
                <div className="flex items-stretch">
                  <button className="min-w-0 flex-1 px-4 py-3 text-left" onClick={() => setManualOpen(open ? null : cafe.id)}>
                    <span className="block text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Hole {cafe.n} · par {cafe.par} · {filled}/{players.length}
                    </span>
                    <span className="block text-lg font-bold">{cafe.name || `Café ${cafe.n}`}</span>
                    {!cafe.name && <span className="block text-sm text-zinc-400">{cafe.hint}</span>}
                    {cafe.rule && <span className="mt-1 block text-amber-200">Opdracht: {cafe.rule}</span>}
                  </button>
                  <button
                    className="flex w-14 shrink-0 items-center justify-center text-zinc-500 active:bg-line"
                    onClick={() => setEditing(cafe)}
                    aria-label="Café wijzigen"
                  >
                    <Pencil size={18} />
                  </button>
                </div>

                {open && (
                  <div className="border-t border-line px-4 py-2">
                    {players.map((p) => {
                      const s = scoreMap.get(scoreKey(cafe.id, p.id))
                      return (
                        <div key={p.id} className="flex items-center gap-2 py-1.5">
                          <span className={`flex-1 text-lg font-semibold ${p.id === me ? 'text-amber-300' : ''}`}>{p.name}</span>
                          <button
                            className="h-14 w-14 rounded-xl bg-line text-2xl font-bold active:bg-zinc-600 disabled:opacity-30"
                            disabled={!s || s.strokes === 0}
                            onClick={() => s && setStrokes(cafe, p, s.strokes - 1)}
                            aria-label={`Slag eraf voor ${p.name}`}
                          >
                            −
                          </button>
                          <span className="w-12 text-center text-3xl font-black tabular-nums">
                            {s ? s.strokes : <span className="text-zinc-600">–</span>}
                          </span>
                          <button
                            className="h-14 w-14 rounded-xl bg-amber-400 text-2xl font-bold text-bg active:bg-amber-300"
                            onClick={() => setStrokes(cafe, p, (s?.strokes ?? 0) + 1)}
                            aria-label={`Slag erbij voor ${p.name}`}
                          >
                            +
                          </button>
                        </div>
                      )
                    })}
                    {cafe.name && (
                      <a
                        href={mapsRouteUrl(withBerlin(cafe.name))}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-amber-300"
                      >
                        <Navigation size={15} />
                        Route naar {cafe.name}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {editing && <CafeForm cafe={editing} holes={holes} toast={toast} onClose={() => setEditing(null)} />}
    </div>
  )
}

function CafeForm({ cafe, holes, toast, onClose }: { cafe: Cafe; holes: TableApi<Hole>; toast: ShowToast; onClose: () => void }) {
  const [name, setName] = useState(cafe.name)
  const [par, setPar] = useState(cafe.par)
  const [rule, setRule] = useState(cafe.rule)
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    const row = { id: cafe.id, position: cafe.n, bar_name: name.trim(), par, rule: rule.trim() }
    const { data, error } = await supabase.from('golf_holes').upsert(row).select().single()
    setBusy(false)
    if (error) return toast('Opslaan niet gelukt, probeer opnieuw')
    holes.upsertLocal(data as Hole)
    onClose()
  }

  return (
    <Modal title={`Hole ${cafe.n}`} onClose={onClose}>
      <Field label="Naam café">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Welk café is het geworden?" />
      </Field>
      <Field label="Par">
        <div className="flex items-center gap-3">
          <button className="h-14 w-14 rounded-xl bg-line text-2xl" onClick={() => setPar(Math.max(1, par - 1))}>
            −
          </button>
          <span className="w-10 text-center text-3xl font-black">{par}</span>
          <button className="h-14 w-14 rounded-xl bg-line text-2xl" onClick={() => setPar(par + 1)}>
            +
          </button>
        </div>
      </Field>
      <Field label="Opdracht">
        <textarea className={inputClass} rows={2} value={rule} onChange={(e) => setRule(e.target.value)} placeholder="Optioneel" />
      </Field>
      <button
        className="mb-5 min-h-12 w-full rounded-xl border border-line font-semibold text-amber-300 active:bg-line"
        onClick={() => setRule(randomRule(rule))}
      >
        Random opdracht
      </button>
      <button
        className="min-h-14 w-full rounded-xl bg-amber-400 text-lg font-bold text-bg active:bg-amber-300 disabled:opacity-50"
        onClick={save}
        disabled={busy}
      >
        Opslaan
      </button>
    </Modal>
  )
}

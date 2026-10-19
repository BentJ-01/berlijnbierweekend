import { useEffect, useMemo, useState } from 'react'
import { Field, Modal, inputClass } from '../components/Modal'
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

const scoreKey = (holeId: string, playerId: string) => `${holeId}:${playerId}`

function formatPar(diff: number) {
  if (diff === 0) return 'par'
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`
}

export function Pubgolf({ players, me, holes, scores, toast }: Props) {
  const sortedHoles = useMemo(() => [...holes.rows].sort((a, b) => a.position - b.position), [holes.rows])
  const scoreMap = useMemo(() => new Map(scores.rows.map((s) => [scoreKey(s.hole_id, s.player_id), s])), [scores.rows])

  const currentHole = sortedHoles.find((h) => players.some((p) => !scoreMap.has(scoreKey(h.id, p.id))))

  // undefined = volg de huidige hole, null = alles dicht, string = manueel gekozen
  const [manualOpen, setManualOpen] = useState<string | null | undefined>(undefined)
  useEffect(() => setManualOpen(undefined), [currentHole?.id])
  const openId = manualOpen === undefined ? currentHole?.id : manualOpen

  const [editing, setEditing] = useState<Hole | 'new' | null>(null)

  const board = useMemo(() => {
    const parById = new Map(sortedHoles.map((h) => [h.id, h.par]))
    return players
      .map((p) => {
        let total = 0
        let diff = 0
        for (const s of scores.rows) {
          const par = parById.get(s.hole_id)
          if (s.player_id !== p.id || par === undefined) continue
          total += s.strokes
          diff += s.strokes - par
        }
        return { player: p, total, diff }
      })
      .sort((a, b) => a.total - b.total || a.diff - b.diff || a.player.sort_order - b.player.sort_order)
  }, [players, scores.rows, sortedHoles])

  async function setStrokes(hole: Hole, player: Player, strokes: number) {
    if (strokes < 0) return
    vibrate()
    const existing = scoreMap.get(scoreKey(hole.id, player.id))
    scores.upsertLocal({ id: existing?.id ?? uuid(), hole_id: hole.id, player_id: player.id, strokes })
    const { error } = await supabase
      .from('golf_scores')
      .upsert({ hole_id: hole.id, player_id: player.id, strokes }, { onConflict: 'hole_id,player_id' })
    if (error) {
      toast('Niet gelukt, probeer opnieuw')
      void scores.reload()
    }
  }

  return (
    <div className="px-4 pt-4">
      <section className="mb-6 rounded-2xl border border-line bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Scorebord</h2>
        <ol className="flex flex-col">
          {board.map(({ player, total, diff }, i) => (
            <li key={player.id} className="flex items-center gap-3 py-1.5">
              <span className="w-5 text-zinc-500">{i + 1}</span>
              <span className={`flex-1 text-lg font-semibold ${player.id === me ? 'text-amber-300' : ''}`}>
                {i === 0 && total > 0 && '🏆 '}
                {player.name}
              </span>
              <span className="w-14 text-right text-sm text-zinc-400">{formatPar(diff)}</span>
              <span className="w-10 text-right text-2xl font-black tabular-nums">{total}</span>
            </li>
          ))}
        </ol>
      </section>

      <ul className="flex flex-col gap-3">
        {sortedHoles.map((hole, idx) => {
          const open = hole.id === openId
          const isCurrent = hole.id === currentHole?.id
          const filled = players.filter((p) => scoreMap.has(scoreKey(hole.id, p.id))).length
          return (
            <li
              key={hole.id}
              className={`rounded-2xl border ${isCurrent ? 'border-amber-400 bg-amber-400/10' : 'border-line bg-card'}`}
            >
              <div className="flex items-stretch">
                <button
                  className="flex min-h-16 flex-1 items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setManualOpen(open ? null : hole.id)}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                      isCurrent ? 'bg-amber-400 text-bg' : 'bg-line text-zinc-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-bold">{hole.bar_name || `Hole ${idx + 1}`}</span>
                    <span className="block text-sm text-zinc-400">
                      Par {hole.par} · {filled}/{players.length} ingevuld
                    </span>
                  </span>
                  <span className="text-zinc-500">{open ? '▴' : '▾'}</span>
                </button>
                <button
                  className="w-14 text-xl text-zinc-400 active:bg-line"
                  aria-label="Hole bewerken"
                  onClick={() => setEditing(hole)}
                >
                  ✏️
                </button>
              </div>

              {hole.rule && (
                <p className={`px-4 text-amber-200 ${open ? 'pb-2' : 'pb-3 text-sm'}`}>📜 {hole.rule}</p>
              )}

              {open && (
                <div className="border-t border-line px-4 py-2">
                  {players.map((p) => {
                    const s = scoreMap.get(scoreKey(hole.id, p.id))
                    return (
                      <div key={p.id} className="flex items-center gap-2 py-1.5">
                        <span className={`flex-1 text-lg font-semibold ${p.id === me ? 'text-amber-300' : ''}`}>
                          {p.name}
                        </span>
                        <button
                          className="h-14 w-14 rounded-xl bg-line text-2xl font-bold active:bg-zinc-600 disabled:opacity-30"
                          disabled={!s || s.strokes === 0}
                          onClick={() => s && setStrokes(hole, p, s.strokes - 1)}
                          aria-label={`Slag eraf voor ${p.name}`}
                        >
                          −
                        </button>
                        <span className="w-12 text-center text-3xl font-black tabular-nums">
                          {s ? s.strokes : <span className="text-zinc-600">–</span>}
                        </span>
                        <button
                          className="h-14 w-14 rounded-xl bg-amber-400 text-2xl font-bold text-bg active:bg-amber-300"
                          onClick={() => setStrokes(hole, p, (s?.strokes ?? 0) + 1)}
                          aria-label={`Slag erbij voor ${p.name}`}
                        >
                          +
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <button
        className="mt-4 min-h-14 w-full rounded-2xl border border-dashed border-zinc-600 font-semibold text-zinc-300 active:bg-card"
        onClick={() => setEditing('new')}
      >
        + Hole toevoegen
      </button>

      {editing && (
        <HoleForm
          hole={editing === 'new' ? null : editing}
          nextPosition={(sortedHoles[sortedHoles.length - 1]?.position ?? 0) + 1}
          onClose={() => setEditing(null)}
          holes={holes}
          toast={toast}
        />
      )}
    </div>
  )
}

type FormProps = {
  hole: Hole | null
  nextPosition: number
  onClose: () => void
  holes: TableApi<Hole>
  toast: ShowToast
}

function HoleForm({ hole, nextPosition, onClose, holes, toast }: FormProps) {
  const [barName, setBarName] = useState(hole?.bar_name ?? '')
  const [par, setPar] = useState(hole?.par ?? 3)
  const [rule, setRule] = useState(hole?.rule ?? '')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    const values = { bar_name: barName.trim(), par, rule: rule.trim() }
    const { data, error } = hole
      ? await supabase.from('golf_holes').update(values).eq('id', hole.id).select().single()
      : await supabase.from('golf_holes').insert({ ...values, position: nextPosition }).select().single()
    setBusy(false)
    if (error) return toast('Opslaan niet gelukt, probeer opnieuw')
    holes.upsertLocal(data as Hole)
    onClose()
  }

  async function del() {
    if (!hole || !confirm('Deze hole en alle scores ervan verwijderen?')) return
    setBusy(true)
    const { error } = await supabase.from('golf_holes').delete().eq('id', hole.id)
    setBusy(false)
    if (error) return toast('Verwijderen niet gelukt')
    holes.removeLocal(hole.id)
    onClose()
  }

  return (
    <Modal title={hole ? 'Hole bewerken' : 'Nieuwe hole'} onClose={onClose}>
      <Field label="Barnaam">
        <input className={inputClass} value={barName} onChange={(e) => setBarName(e.target.value)} placeholder="Bv. Kneipe om de hoek" />
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
      <Field label="Regel">
        <textarea className={inputClass} rows={2} value={rule} onChange={(e) => setRule(e.target.value)} placeholder="Optioneel" />
      </Field>
      <button
        className="mb-5 min-h-12 w-full rounded-xl border border-line font-semibold text-amber-300 active:bg-line"
        onClick={() => setRule(randomRule(rule))}
      >
        🎲 Random regel
      </button>
      <div className="flex gap-3">
        {hole && (
          <button className="min-h-14 rounded-xl px-4 font-semibold text-red-400 active:bg-line" onClick={del} disabled={busy}>
            Verwijderen
          </button>
        )}
        <button
          className="min-h-14 flex-1 rounded-xl bg-amber-400 text-lg font-bold text-bg active:bg-amber-300 disabled:opacity-50"
          onClick={save}
          disabled={busy}
        >
          Opslaan
        </button>
      </div>
    </Modal>
  )
}

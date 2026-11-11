import { useEffect, useMemo, useState } from 'react'
import { Field, Modal, inputClass } from '../components/Modal'
import { mapsRouteUrl, withBerlin } from '../lib/maps'
import { randomRule } from '../lib/rules'
import { supabase, uuid, vibrate } from '../lib/supabase'
import type { Hole, HoleKind, Player, Score, ShowToast, TableApi } from '../lib/types'

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
  const stops = useMemo(() => [...holes.rows].sort((a, b) => a.position - b.position), [holes.rows])
  const cafes = useMemo(() => stops.filter((s) => s.kind === 'cafe'), [stops])
  const holeNumber = useMemo(() => new Map(cafes.map((c, i) => [c.id, i + 1])), [cafes])
  const scoreMap = useMemo(() => new Map(scores.rows.map((s) => [scoreKey(s.hole_id, s.player_id), s])), [scores.rows])

  const currentHole = cafes.find((h) => players.some((p) => !scoreMap.has(scoreKey(h.id, p.id))))

  // undefined = volg de huidige hole, null = alles dicht, string = manueel gekozen
  const [manualOpen, setManualOpen] = useState<string | null | undefined>(undefined)
  useEffect(() => setManualOpen(undefined), [currentHole?.id])
  const openId = manualOpen === undefined ? currentHole?.id : manualOpen

  const [editing, setEditing] = useState<Hole | 'new' | null>(null)

  const board = useMemo(() => {
    const parById = new Map(cafes.map((h) => [h.id, h.par]))
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
  }, [players, scores.rows, cafes])

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
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Scorebord · laagste wint</h2>
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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Parcours</h2>

      <ol className="relative ml-4 border-l-2 border-line">
        {stops.map((stop) => {
          if (stop.kind === 'cultuur') {
            return (
              <li key={stop.id} className="relative mb-3 pl-6">
                <span className="absolute -left-[13px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-line text-xs">🏛️</span>
                <div className="flex items-start rounded-2xl border border-line bg-bg">
                  <div className="min-w-0 flex-1 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">Cultuurstop</div>
                    <div className="font-bold">{stop.bar_name || 'Stop'}</div>
                    {stop.description && <p className="mt-1 text-sm text-zinc-400">{stop.description}</p>}
                    <a
                      href={mapsRouteUrl(withBerlin(stop.location || stop.bar_name))}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-amber-300"
                    >
                      🧭 Route
                    </a>
                  </div>
                  <EditButton onClick={() => setEditing(stop)} />
                </div>
              </li>
            )
          }

          const n = holeNumber.get(stop.id) ?? 0
          const open = stop.id === openId
          const isCurrent = stop.id === currentHole?.id
          const filled = players.filter((p) => scoreMap.has(scoreKey(stop.id, p.id))).length
          const done = filled === players.length
          return (
            <li key={stop.id} className="relative mb-3 pl-6">
              <span
                className={`absolute -left-[15px] top-4 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black ${
                  isCurrent ? 'bg-amber-400 text-bg' : done ? 'bg-emerald-500 text-bg' : 'bg-zinc-700 text-zinc-200'
                }`}
              >
                {done ? '✓' : n}
              </span>
              <div className={`rounded-2xl border ${isCurrent ? 'border-amber-400 bg-amber-400/10' : 'border-line bg-card'}`}>
                <div className="flex items-stretch">
                  <button className="min-w-0 flex-1 px-4 py-3 text-left" onClick={() => setManualOpen(open ? null : stop.id)}>
                    <span className="block text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Hole {n} · par {stop.par} · {filled}/{players.length}
                    </span>
                    <span className="block text-lg font-bold">{stop.bar_name || `Café ${n}`}</span>
                    {stop.rule && <span className="mt-1 block text-amber-200">📜 {stop.rule}</span>}
                  </button>
                  <EditButton onClick={() => setEditing(stop)} />
                </div>

                {open && (
                  <div className="border-t border-line px-4 py-2">
                    {stop.description && <p className="py-1 text-sm text-zinc-400">{stop.description}</p>}
                    {players.map((p) => {
                      const s = scoreMap.get(scoreKey(stop.id, p.id))
                      return (
                        <div key={p.id} className="flex items-center gap-2 py-1.5">
                          <span className={`flex-1 text-lg font-semibold ${p.id === me ? 'text-amber-300' : ''}`}>{p.name}</span>
                          <button
                            className="h-14 w-14 rounded-xl bg-line text-2xl font-bold active:bg-zinc-600 disabled:opacity-30"
                            disabled={!s || s.strokes === 0}
                            onClick={() => s && setStrokes(stop, p, s.strokes - 1)}
                            aria-label={`Slag eraf voor ${p.name}`}
                          >
                            −
                          </button>
                          <span className="w-12 text-center text-3xl font-black tabular-nums">
                            {s ? s.strokes : <span className="text-zinc-600">–</span>}
                          </span>
                          <button
                            className="h-14 w-14 rounded-xl bg-amber-400 text-2xl font-bold text-bg active:bg-amber-300"
                            onClick={() => setStrokes(stop, p, (s?.strokes ?? 0) + 1)}
                            aria-label={`Slag erbij voor ${p.name}`}
                          >
                            +
                          </button>
                        </div>
                      )
                    })}
                    {(stop.location || stop.bar_name) && (
                      <a
                        href={mapsRouteUrl(withBerlin(stop.location || stop.bar_name))}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-h-11 items-center text-sm font-semibold text-amber-300"
                      >
                        🧭 Route naar {stop.bar_name || 'café'}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <button
        className="mt-2 min-h-14 w-full rounded-2xl border border-dashed border-zinc-600 font-semibold text-zinc-300 active:bg-card"
        onClick={() => setEditing('new')}
      >
        + Stop toevoegen
      </button>

      {editing && (
        <StopForm
          stop={editing === 'new' ? null : editing}
          nextPosition={(stops[stops.length - 1]?.position ?? 0) + 1}
          onClose={() => setEditing(null)}
          holes={holes}
          toast={toast}
        />
      )}
    </div>
  )
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="w-12 shrink-0 text-lg text-zinc-500 active:bg-line" aria-label="Bewerken" onClick={onClick}>
      ✏️
    </button>
  )
}

type FormProps = {
  stop: Hole | null
  nextPosition: number
  onClose: () => void
  holes: TableApi<Hole>
  toast: ShowToast
}

function StopForm({ stop, nextPosition, onClose, holes, toast }: FormProps) {
  const [kind, setKind] = useState<HoleKind>(stop?.kind ?? 'cafe')
  const [name, setName] = useState(stop?.bar_name ?? '')
  const [description, setDescription] = useState(stop?.description ?? '')
  const [location, setLocation] = useState(stop?.location ?? '')
  const [par, setPar] = useState(stop?.par ?? 3)
  const [rule, setRule] = useState(stop?.rule ?? '')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    const values = { kind, bar_name: name.trim(), description: description.trim(), location: location.trim() || null, par, rule: kind === 'cafe' ? rule.trim() : '' }
    const { data, error } = stop
      ? await supabase.from('golf_holes').update(values).eq('id', stop.id).select().single()
      : await supabase.from('golf_holes').insert({ ...values, position: nextPosition }).select().single()
    setBusy(false)
    if (error) return toast('Opslaan niet gelukt, probeer opnieuw')
    holes.upsertLocal(data as Hole)
    onClose()
  }

  async function del() {
    if (!stop || !confirm('Deze stop (en eventuele scores) verwijderen?')) return
    setBusy(true)
    const { error } = await supabase.from('golf_holes').delete().eq('id', stop.id)
    setBusy(false)
    if (error) return toast('Verwijderen niet gelukt')
    holes.removeLocal(stop.id)
    onClose()
  }

  return (
    <Modal title={stop ? 'Stop bewerken' : 'Nieuwe stop'} onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {(['cafe', 'cultuur'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`min-h-12 rounded-xl font-semibold ${kind === k ? 'bg-amber-400 text-bg' : 'border border-line text-zinc-400'}`}
          >
            {k === 'cafe' ? '🍺 Café (hole)' : '🏛️ Cultuurstop'}
          </button>
        ))}
      </div>
      <Field label={kind === 'cafe' ? 'Naam café' : 'Naam stop'}>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === 'cafe' ? 'Bv. Kneipe X' : 'Bv. Mauerpark'} />
      </Field>
      <Field label="Adres (voor de route, optioneel)">
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Leeg = zoeken op naam" />
      </Field>
      <Field label="Uitleg">
        <textarea className={inputClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optioneel" />
      </Field>
      {kind === 'cafe' && (
        <>
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
          <Field label="Opdracht / regel">
            <textarea className={inputClass} rows={2} value={rule} onChange={(e) => setRule(e.target.value)} placeholder="Optioneel" />
          </Field>
          <button
            className="mb-5 min-h-12 w-full rounded-xl border border-line font-semibold text-amber-300 active:bg-line"
            onClick={() => setRule(randomRule(rule))}
          >
            🎲 Random regel
          </button>
        </>
      )}
      <div className="flex gap-3">
        {stop && (
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

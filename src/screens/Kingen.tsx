import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Field, Modal, inputClass } from '../components/Modal'
import { isComplete, roundPoints, roundsFor, type RoundDef, type RoundInput } from '../data/kingen'
import { supabase } from '../lib/supabase'
import type { KingenGame, KingenRound, Player, ShowToast, TableApi } from '../lib/types'

type Props = {
  players: Player[]
  me: string
  games: TableApi<KingenGame>
  rounds: TableApi<KingenRound>
  toast: ShowToast
}

const fmt = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')

export function Kingen({ players, me, games, rounds, toast }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const open = games.rows.find((g) => g.id === openId)

  if (open) {
    return (
      <GameView
        game={open}
        players={players}
        me={me}
        rounds={rounds}
        games={games}
        toast={toast}
        onBack={() => setOpenId(null)}
      />
    )
  }

  const sorted = [...games.rows].sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <div className="px-4 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Kingen ♠️</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex min-h-12 items-center gap-1.5 rounded-2xl bg-amber-400 px-4 font-bold text-bg active:bg-amber-300"
        >
          <Plus size={18} strokeWidth={2.5} />
          Nieuw spel
        </button>
      </div>

      {sorted.length === 0 && (
        <p className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center text-zinc-500">
          Nog geen spellen. Start er een met "Nieuw spel".
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {sorted.map((g) => {
          const summary = gameSummary(g, players, rounds.rows)
          const leader = summary.ranking[0]
          return (
            <li key={g.id}>
              <button
                onClick={() => setOpenId(g.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card p-4 text-left active:bg-line"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-bold">{g.name}</div>
                  <div className="text-sm text-zinc-400">
                    {summary.ps.map((p) => p.name).join(', ')}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">
                    {summary.done}/{summary.defs.length} rondes
                    {summary.done > 0 && leader && ` · 👑 ${leader.player.name} (${fmt(leader.total)})`}
                  </div>
                </div>
                <ChevronRight className="shrink-0 text-zinc-600" size={22} />
              </button>
            </li>
          )
        })}
      </ul>

      {creating && (
        <NewGameForm
          players={players}
          defaultName={`Spel ${games.rows.length + 1}`}
          games={games}
          toast={toast}
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false)
            setOpenId(id)
          }}
        />
      )}
    </div>
  )
}

function gameSummary(game: KingenGame, players: Player[], allRounds: KingenRound[]) {
  const ps = players.filter((p) => game.players.includes(p.id))
  const ids = ps.map((p) => p.id)
  const defs = roundsFor(ps)
  const byKey = new Map(allRounds.filter((r) => r.game_id === game.id).map((r) => [r.round_key, r]))
  const totals = new Map(ids.map((id) => [id, 0]))
  let done = 0
  for (const def of defs) {
    const r = byKey.get(def.key)
    if (!r || !isComplete(def, r.input)) continue
    done++
    for (const [id, p] of roundPoints(def, r.input, ids)) totals.set(id, (totals.get(id) ?? 0) + p)
  }
  const ranking = ps.map((p) => ({ player: p, total: totals.get(p.id) ?? 0 })).sort((a, b) => b.total - a.total)
  return { ps, ids, defs, byKey, ranking, done }
}

type GameProps = {
  game: KingenGame
  players: Player[]
  me: string
  rounds: TableApi<KingenRound>
  games: TableApi<KingenGame>
  toast: ShowToast
  onBack: () => void
}

function GameView({ game, players, me, rounds, games, toast, onBack }: GameProps) {
  const [editing, setEditing] = useState<RoundDef | null>(null)
  const { ps, ids, defs, byKey, ranking, done } = useMemo(() => gameSummary(game, players, rounds.rows), [game, players, rounds.rows])

  async function deleteGame() {
    if (!confirm(`"${game.name}" en alle scores verwijderen?`)) return
    const { error } = await supabase.from('kingen_games').delete().eq('id', game.id)
    if (error) return toast('Verwijderen niet gelukt')
    games.removeLocal(game.id)
    onBack()
  }

  const section = (title: string, list: RoundDef[]) => (
    <section className="mb-5">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      <ul className="flex flex-col gap-2">
        {list.map((def) => {
          const r = byKey.get(def.key)
          const complete = isComplete(def, r?.input)
          const pts = complete && r ? roundPoints(def, r.input, ids) : null
          return (
            <li key={def.key}>
              <button
                onClick={() => setEditing(def)}
                className={`w-full rounded-2xl border p-4 text-left active:bg-line ${complete ? 'border-line bg-bg' : 'border-line bg-card'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1 font-bold">{def.name}</span>
                  {complete ? (
                    <Check size={20} className="text-emerald-400" />
                  ) : (
                    <ChevronRight size={20} className="text-zinc-600" />
                  )}
                </div>
                <div className="text-sm text-zinc-500">{def.rule}</div>
                {pts && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {ps
                      .filter((p) => pts.get(p.id))
                      .map((p) => (
                        <span key={p.id} className="text-zinc-300">
                          {p.name} <b className={pts.get(p.id)! > 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt(pts.get(p.id)!)}</b>
                        </span>
                      ))}
                    {ps.every((p) => !pts.get(p.id)) && <span className="text-zinc-500">niemand punten</span>}
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )

  return (
    <div className="px-4 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={onBack} className="-ml-2 flex min-h-11 items-center px-2 font-semibold text-amber-300 active:opacity-60">
          <ChevronLeft size={20} /> Spellen
        </button>
        <button onClick={deleteGame} className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 active:bg-line" aria-label="Spel verwijderen">
          <Trash2 size={18} />
        </button>
      </div>
      <h1 className="mb-3 text-2xl font-black">{game.name}</h1>

      <section className="mb-6 rounded-2xl border border-line bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Stand · {done}/{defs.length} rondes
        </h2>
        {ranking.map(({ player, total }, i) => (
          <div key={player.id} className="flex items-center gap-3 py-1.5">
            <span className="w-5 text-zinc-500">{i + 1}</span>
            <span className={`flex-1 text-lg font-semibold ${player.id === me ? 'text-amber-300' : ''}`}>
              {i === 0 && done > 0 && '👑 '}
              {player.name}
            </span>
            <span className={`text-2xl font-black tabular-nums ${total > 0 ? 'text-emerald-400' : total < 0 ? 'text-red-400' : ''}`}>
              {fmt(total)}
            </span>
          </div>
        ))}
      </section>

      {section('Min-spellen', defs.filter((d) => !d.troefBy))}
      {section('Troef', defs.filter((d) => d.troefBy))}

      {editing && (
        <RoundForm
          def={editing}
          game={game}
          ps={ps}
          existing={byKey.get(editing.key)}
          rounds={rounds}
          toast={toast}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

type RoundProps = {
  def: RoundDef
  game: KingenGame
  ps: Player[]
  existing?: KingenRound
  rounds: TableApi<KingenRound>
  toast: ShowToast
  onClose: () => void
}

function RoundForm({ def, game, ps, existing, rounds, toast, onClose }: RoundProps) {
  const [input, setInput] = useState<RoundInput>(existing?.input ?? (def.kind === 'count' ? { counts: {} } : {}))
  const [busy, setBusy] = useState(false)
  const ids = ps.map((p) => p.id)
  const pts = roundPoints(def, input, ids)
  const sum = Object.values(input.counts ?? {}).reduce((a, b) => a + b, 0)
  const expected = ps.length === 4 ? def.total4 : undefined

  function setCount(id: string, n: number) {
    if (n < 0) return
    setInput((i) => ({ ...i, counts: { ...(i.counts ?? {}), [id]: n } }))
  }

  async function save() {
    if (!isComplete(def, input)) return toast('Nog niet alles ingevuld')
    setBusy(true)
    const { data, error } = await supabase
      .from('kingen_rounds')
      .upsert({ game_id: game.id, round_key: def.key, input }, { onConflict: 'game_id,round_key' })
      .select()
      .single()
    setBusy(false)
    if (error) return toast('Opslaan niet gelukt, probeer opnieuw')
    rounds.upsertLocal(data as KingenRound)
    onClose()
  }

  async function clear() {
    if (!existing || !confirm('Scores van deze ronde wissen?')) return
    setBusy(true)
    const { error } = await supabase.from('kingen_rounds').delete().eq('id', existing.id)
    setBusy(false)
    if (error) return toast('Wissen niet gelukt')
    rounds.removeLocal(existing.id)
    onClose()
  }

  const pick = (selected: string | undefined, onPick: (id: string) => void) => (
    <div className="grid grid-cols-2 gap-2">
      {ps.map((p) => (
        <button
          key={p.id}
          onClick={() => onPick(p.id)}
          className={`min-h-12 rounded-xl font-semibold ${selected === p.id ? 'bg-amber-400 text-bg' : 'border border-line text-zinc-300'}`}
        >
          {p.name}
        </button>
      ))}
    </div>
  )

  return (
    <Modal title={def.name} onClose={onClose}>
      <p className="-mt-2 mb-4 text-sm text-zinc-400">{def.rule}</p>

      {def.kind === 'count' && (
        <>
          {ps.map((p) => {
            const n = input.counts?.[p.id] ?? 0
            const pt = pts.get(p.id) ?? 0
            return (
              <div key={p.id} className="flex items-center gap-2 py-1.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold">{p.name}</span>
                  <span className={`text-sm ${pt > 0 ? 'text-emerald-400' : pt < 0 ? 'text-red-400' : 'text-zinc-500'}`}>{fmt(pt)} punten</span>
                </span>
                <button className="h-14 w-14 rounded-xl bg-line text-2xl font-bold disabled:opacity-30" disabled={n === 0} onClick={() => setCount(p.id, n - 1)}>
                  −
                </button>
                <span className="w-10 text-center text-3xl font-black tabular-nums">{n}</span>
                <button className="h-14 w-14 rounded-xl bg-amber-400 text-2xl font-bold text-bg active:bg-amber-300" onClick={() => setCount(p.id, n + 1)}>
                  +
                </button>
              </div>
            )
          })}
          <p className={`mt-2 text-sm ${expected != null && sum !== expected ? 'text-amber-300' : 'text-zinc-500'}`}>
            Samen: {sum} {def.unit}
            {expected != null && ` (moet ${expected} zijn)`}
          </p>
        </>
      )}

      {def.kind === 'heartKing' && (
        <Field label="Wie pakte de hartenheer?">{pick(input.heartKing, (id) => setInput({ heartKing: id }))}</Field>
      )}

      {def.kind === 'seventhLast' && (
        <>
          <Field label="Wie pakte de 7de slag? (−2)">{pick(input.seventh, (id) => setInput((i) => ({ ...i, seventh: id })))}</Field>
          <Field label="Wie pakte de laatste slag? (−3)">{pick(input.last, (id) => setInput((i) => ({ ...i, last: id })))}</Field>
        </>
      )}

      <div className="mt-5 flex gap-3">
        {existing && (
          <button className="min-h-14 rounded-xl px-4 font-semibold text-red-400 active:bg-line" onClick={clear} disabled={busy}>
            Wissen
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

type NewProps = {
  players: Player[]
  defaultName: string
  games: TableApi<KingenGame>
  toast: ShowToast
  onClose: () => void
  onCreated: (id: string) => void
}

function NewGameForm({ players, defaultName, games, toast, onClose, onCreated }: NewProps) {
  const [name, setName] = useState(defaultName)
  const [selected, setSelected] = useState<string[]>(players.map((p) => p.id))
  const [busy, setBusy] = useState(false)

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function create() {
    if (selected.length < 3) return toast('Minstens 3 spelers')
    setBusy(true)
    const ordered = players.map((p) => p.id).filter((id) => selected.includes(id))
    const { data, error } = await supabase
      .from('kingen_games')
      .insert({ name: name.trim() || defaultName, players: ordered })
      .select()
      .single()
    setBusy(false)
    if (error) return toast('Aanmaken niet gelukt, probeer opnieuw')
    games.upsertLocal(data as KingenGame)
    onCreated((data as KingenGame).id)
  }

  return (
    <Modal title="Nieuw spel" onClose={onClose}>
      <Field label="Naam">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <div className="mb-5">
        <span className="mb-1 block text-sm font-medium text-zinc-400">Wie speelt mee?</span>
        <div className="grid grid-cols-2 gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`min-h-12 rounded-xl font-semibold ${selected.includes(p.id) ? 'bg-amber-400 text-bg' : 'border border-line text-zinc-400'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          {selected.length} spelers: 6 min-spellen + {selected.length} troefrondes
        </p>
      </div>
      <button
        className="min-h-14 w-full rounded-xl bg-amber-400 text-lg font-bold text-bg active:bg-amber-300 disabled:opacity-50"
        onClick={create}
        disabled={busy}
      >
        Start spel
      </button>
    </Modal>
  )
}

import { useMemo } from 'react'
import { vibrate } from '../lib/supabase'
import type { Drink, Player, ShowToast } from '../lib/types'

type Props = {
  players: Player[]
  me: string
  drinks: Drink[]
  queued: number
  add: (playerId: string) => Promise<{ drink: Drink; ok: boolean }>
  remove: (id: string) => Promise<boolean>
  toast: ShowToast
}

export function Pinten({ players, me, drinks, queued, add, remove, toast }: Props) {
  const ranking = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of drinks) counts.set(d.player_id, (counts.get(d.player_id) ?? 0) + 1)
    return players
      .map((p) => ({ player: p, count: counts.get(p.id) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.player.sort_order - b.player.sort_order)
  }, [players, drinks])

  const top = ranking[0]?.count ?? 0

  async function onAdd(p: Player) {
    vibrate()
    const { drink, ok } = await add(p.id)
    const undo = { label: 'Ongedaan maken', run: () => void remove(drink.id) }
    toast(ok ? `+1 pint voor ${p.name}` : 'Niet gelukt, opnieuw proberen', undo)
  }

  async function onMinus(p: Player) {
    const latest = drinks
      .filter((d) => d.player_id === p.id)
      .reduce<Drink | null>((a, d) => (!a || d.created_at > a.created_at ? d : a), null)
    if (!latest) return
    vibrate()
    const ok = await remove(latest.id)
    toast(ok ? `−1 pint voor ${p.name}` : 'Niet gelukt, probeer opnieuw')
  }

  return (
    <div className="px-4 pt-4">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-zinc-400">
          Samen: <span className="text-3xl font-black text-zinc-100">{drinks.length}</span> pinten
        </h1>
        {queued > 0 && <span className="text-xs text-amber-300">⏳ {queued} wacht op netwerk</span>}
      </div>

      <ul className="flex flex-col gap-3">
        {ranking.map(({ player, count }) => {
          const isMe = player.id === me
          const isKing = count > 0 && count === top
          return (
            <li
              key={player.id}
              className={`flex overflow-hidden rounded-2xl border ${
                isMe ? 'border-amber-400 bg-amber-400/10' : 'border-line bg-card'
              }`}
            >
              <button
                onClick={() => onAdd(player)}
                className="flex min-h-20 flex-1 items-center gap-3 px-4 py-3 text-left active:bg-amber-400/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xl font-bold">
                    {isKing && <span aria-hidden>👑</span>}
                    {player.name}
                    {isMe && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-bg">jij</span>
                    )}
                  </div>
                  {isKing && <div className="text-sm font-medium text-amber-300">Koning van de tap</div>}
                </div>
                <span className="text-5xl font-black tabular-nums">{count}</span>
              </button>
              <button
                onClick={() => onMinus(player)}
                disabled={count === 0}
                aria-label={`Pint weghalen bij ${player.name}`}
                className="w-14 border-l border-line text-2xl text-zinc-500 active:bg-line disabled:opacity-30"
              >
                −
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 text-center text-sm text-zinc-500">Tik op een naam voor +1 pint</p>
    </div>
  )
}

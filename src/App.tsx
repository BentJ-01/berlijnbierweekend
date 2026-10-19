import { useState, type ReactNode } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { IosBanner } from './components/IosBanner'
import { useToast } from './components/Toast'
import { WhoAreYou } from './components/WhoAreYou'
import { readString, writeString } from './lib/storage'
import { isConfigured } from './lib/supabase'
import type { Hole, PlanItem, Player, Score } from './lib/types'
import { useDrinks } from './lib/useDrinks'
import { useRealtimeTable } from './lib/useRealtimeTable'
import { Pinten } from './screens/Pinten'
import { Planning } from './screens/Planning'
import { Pubgolf } from './screens/Pubgolf'

const PLAYER_KEY = 'currentPlayerId'
const scoreKeyOf = (s: Score) => `${s.hole_id}:${s.player_id}`

export default function App() {
  if (!isConfigured) {
    return (
      <Centered>
        <p className="text-xl font-bold">Supabase is nog niet ingesteld</p>
        <p className="mt-2 text-zinc-400">
          Zet <code>VITE_SUPABASE_URL</code> en <code>VITE_SUPABASE_ANON_KEY</code> in je <code>.env</code>.
        </p>
      </Centered>
    )
  }
  return <Main />
}

function Main() {
  const [tab, setTab] = useState<Tab>('pinten')
  const [me, setMe] = useState<string | null>(() => readString(PLAYER_KEY))
  const toast = useToast()

  const playersTable = useRealtimeTable<Player>('players')
  const drinks = useDrinks()
  const holes = useRealtimeTable<Hole>('golf_holes')
  const scores = useRealtimeTable<Score>('golf_scores', scoreKeyOf)
  const plan = useRealtimeTable<PlanItem>('plan_items')

  const players = [...playersTable.rows].sort((a, b) => a.sort_order - b.sort_order)
  const current = players.find((p) => p.id === me)

  function pick(id: string | null) {
    writeString(PLAYER_KEY, id)
    setMe(id)
  }

  if (!playersTable.loaded) {
    return (
      <Centered>
        {playersTable.error ? (
          <>
            <p className="text-xl font-bold">Geen verbinding 😬</p>
            <p className="mt-2 text-zinc-400">Check uw internet en probeer opnieuw.</p>
            <button
              className="mt-6 min-h-14 rounded-2xl bg-amber-400 px-6 font-bold text-bg"
              onClick={() => void playersTable.reload()}
            >
              Opnieuw proberen
            </button>
          </>
        ) : (
          <p className="text-zinc-400">Even laden…</p>
        )}
      </Centered>
    )
  }

  if (!current) return <WhoAreYou players={players} onPick={pick} />

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/95 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
        <span className="text-lg font-black">
          Berlijn <span aria-hidden>🍺</span>
        </span>
        <button
          className="min-h-11 rounded-full border border-line px-3 text-sm text-zinc-300 active:bg-line"
          onClick={() => pick(null)}
        >
          {current.name} ⇄
        </button>
      </header>

      <IosBanner />

      {tab === 'pinten' && (
        <Pinten
          players={players}
          me={current.id}
          drinks={drinks.drinks}
          queued={drinks.queued}
          add={drinks.add}
          remove={drinks.remove}
          toast={toast.show}
        />
      )}
      {tab === 'pubgolf' && <Pubgolf players={players} me={current.id} holes={holes} scores={scores} toast={toast.show} />}
      {tab === 'planning' && <Planning items={plan} toast={toast.show} />}

      {toast.node}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">{children}</div>
}

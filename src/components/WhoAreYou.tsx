import type { Player } from '../lib/types'

type Props = { players: Player[]; onPick: (id: string) => void }

export function WhoAreYou({ players, onPick }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-2 text-5xl">🍺</div>
      <h1 className="mb-1 text-3xl font-black">Wie ben jij?</h1>
      <p className="mb-8 text-zinc-400">Kies uw naam. Ge kunt later altijd wisselen.</p>
      <div className="flex flex-col gap-3">
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p.id)}
            className="min-h-16 rounded-2xl border border-line bg-card px-5 text-left text-2xl font-bold active:border-amber-400 active:bg-amber-400 active:text-bg"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}

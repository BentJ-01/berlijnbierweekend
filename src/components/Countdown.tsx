import { Lock } from 'lucide-react'

type Props = { until: Date; now: Date; title: string }

export function Countdown({ until, now, title }: Props) {
  const left = Math.max(0, until.getTime() - now.getTime())
  const parts = [
    { label: 'dagen', value: Math.floor(left / 86_400_000) },
    { label: 'uur', value: Math.floor(left / 3_600_000) % 24 },
    { label: 'min', value: Math.floor(left / 60_000) % 60 },
    { label: 'sec', value: Math.floor(left / 1000) % 60 },
  ]

  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
        <Lock size={30} />
      </div>
      <h1 className="text-2xl font-black">{title}</h1>
      <div className="mt-8 grid w-full max-w-xs grid-cols-4 gap-2">
        {parts.map((p) => (
          <div key={p.label} className="rounded-2xl border border-line bg-card py-3">
            <div className="text-3xl font-black tabular-nums">{String(p.value).padStart(2, '0')}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{p.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-2xl">🤫</p>
    </div>
  )
}

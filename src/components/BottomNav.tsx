export type Tab = 'pinten' | 'pubgolf' | 'planning'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'pinten', label: 'Pinten', icon: '🍺' },
  { id: 'pubgolf', label: 'Pubgolf', icon: '⛳' },
  { id: 'planning', label: 'Planning', icon: '📅' },
]

type Props = { tab: Tab; onChange: (t: Tab) => void }

export function BottomNav({ tab, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-semibold ${
                active ? 'text-amber-400' : 'text-zinc-500'
              }`}
            >
              <span className={`text-2xl ${active ? '' : 'opacity-60 grayscale'}`}>{t.icon}</span>
              {t.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

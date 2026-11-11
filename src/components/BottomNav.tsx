import { CalendarDays, Flag, Wallet, type LucideIcon } from 'lucide-react'

export type Tab = 'planning' | 'pubgolf' | 'kosten'


const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'planning', label: 'Planning', icon: CalendarDays },
  { id: 'pubgolf', label: 'Pubgolf', icon: Flag },
  { id: 'kosten', label: 'Kosten', icon: Wallet },
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
              <t.icon size={24} strokeWidth={active ? 2.5 : 2} />
              {t.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

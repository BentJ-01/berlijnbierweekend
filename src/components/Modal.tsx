import type { ReactNode } from 'react'

type Props = { title: string; onClose: () => void; children: ReactNode }

export function Modal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-line bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button className="h-11 w-11 rounded-full text-2xl text-zinc-400 active:bg-line" onClick={onClose} aria-label="Sluiten">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl border border-line bg-bg px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ShowToast } from '../lib/types'

type ToastState = { id: number; message: string; action?: { label: string; run: () => void } }

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const counter = useRef(0)

  const show: ShowToast = useCallback((message, action) => {
    counter.current += 1
    setToast({ id: counter.current, message, action })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(t)
  }, [toast])

  const node = toast ? (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
      <div
        key={toast.id}
        className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-zinc-100 px-4 py-3 text-zinc-900 shadow-xl"
      >
        <span className="flex-1 font-medium">{toast.message}</span>
        {toast.action && (
          <button
            className="min-h-11 rounded-xl px-3 font-bold text-amber-700 active:bg-zinc-200"
            onClick={() => {
              toast.action?.run()
              setToast(null)
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  ) : null

  return { show, node }
}

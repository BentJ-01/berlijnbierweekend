import { Component, type ReactNode } from 'react'

/** Wist de service worker en cache, en laadt de app opnieuw. */
export async function hardReload() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations()
    await Promise.all((regs ?? []).map((r) => r.unregister()))
    const keys = await caches?.keys()
    await Promise.all((keys ?? []).map((k) => caches.delete(k)))
  } finally {
    location.reload()
  }
}

type State = { error: Error | null }

/** Toont de fout in plaats van een zwart scherm als er iets crasht. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
        <p className="text-xl font-bold">Oeps, er liep iets mis</p>
        <p className="mt-2 text-zinc-400">Herladen lost het meestal op.</p>
        <button className="mt-6 min-h-14 rounded-2xl bg-amber-400 px-6 font-bold text-bg" onClick={() => void hardReload()}>
          Opnieuw laden
        </button>
        <pre className="mt-6 whitespace-pre-wrap break-words rounded-xl bg-card p-3 text-left text-xs text-zinc-500">
          {this.state.error.message}
        </pre>
      </div>
    )
  }
}

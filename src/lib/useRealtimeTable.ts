import { useCallback, useEffect, useState } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from './supabase'

type Row = { id: string }

export const byId = (r: Row) => r.id

/**
 * Laadt een volledige tabel en houdt ze up-to-date via Supabase Realtime.
 * `keyOf` bepaalt wanneer twee rijen dezelfde zijn (standaard op id).
 */
export function useRealtimeTable<T extends Row>(table: string, keyOf: (r: T) => string = byId) {
  const [rows, setRows] = useState<T[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from(table).select('*')
    if (error) {
      setError(true)
      return
    }
    setRows(data as T[])
    setLoaded(true)
    setError(false)
  }, [table])

  useEffect(() => {
    void reload()

    const channel = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (p: RealtimePostgresChangesPayload<T>) => {
        setRows((prev) => {
          if (p.eventType === 'DELETE') {
            const id = (p.old as Partial<T>).id
            return prev.filter((r) => r.id !== id)
          }
          const row = p.new as T
          const k = keyOf(row)
          const exists = prev.some((r) => keyOf(r) === k)
          return exists ? prev.map((r) => (keyOf(r) === k ? row : r)) : [...prev, row]
        })
      })
      .subscribe((status) => {
        // Na (her)verbinden alles opnieuw ophalen, zodat we niets missen.
        if (status === 'SUBSCRIBED') void reload()
      })

    const onWake = () => {
      if (document.visibilityState === 'visible') void reload()
    }
    window.addEventListener('online', onWake)
    document.addEventListener('visibilitychange', onWake)

    return () => {
      window.removeEventListener('online', onWake)
      document.removeEventListener('visibilitychange', onWake)
      void supabase.removeChannel(channel)
    }
  }, [table, keyOf, reload])

  const upsertLocal = useCallback(
    (row: T) =>
      setRows((prev) => {
        const k = keyOf(row)
        return prev.some((r) => keyOf(r) === k) ? prev.map((r) => (keyOf(r) === k ? row : r)) : [...prev, row]
      }),
    [keyOf],
  )

  const removeLocal = useCallback((id: string) => setRows((prev) => prev.filter((r) => r.id !== id)), [])

  return { rows, loaded, error, reload, upsertLocal, removeLocal }
}

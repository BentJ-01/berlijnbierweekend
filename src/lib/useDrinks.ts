import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, uuid } from './supabase'
import { readJson, writeJson } from './storage'
import { useRealtimeTable } from './useRealtimeTable'
import type { Drink } from './types'

const QUEUE_KEY = 'pintQueue'

/**
 * Pinten met optimistic UI. Elke nieuwe pint gaat eerst in een lokale queue
 * (bewaard in localStorage) en verdwijnt daaruit zodra Supabase hem heeft.
 * Mislukt het, dan blijft hij staan en proberen we opnieuw bij reconnect.
 */
export function useDrinks() {
  const table = useRealtimeTable<Drink>('drinks')
  const { upsertLocal, removeLocal, reload } = table
  const [queue, setQueue] = useState<Drink[]>(() => readJson<Drink[]>(QUEUE_KEY, []))
  const queueRef = useRef(queue)
  const cancelled = useRef(new Set<string>())
  const flushing = useRef(false)

  const updateQueue = useCallback((fn: (q: Drink[]) => Drink[]) => {
    queueRef.current = fn(queueRef.current)
    writeJson(QUEUE_KEY, queueRef.current)
    setQueue(queueRef.current)
  }, [])

  const send = useCallback(
    async (d: Drink): Promise<boolean> => {
      const { error } = await supabase.from('drinks').insert(d)
      // 23505 = bestaat al, dus eerder toch gelukt
      if (error && error.code !== '23505') return false
      updateQueue((q) => q.filter((x) => x.id !== d.id))
      if (cancelled.current.has(d.id)) {
        // Ongedaan gemaakt terwijl de insert onderweg was
        await supabase.from('drinks').delete().eq('id', d.id)
      } else {
        upsertLocal(d)
      }
      return true
    },
    [updateQueue, upsertLocal],
  )

  const flush = useCallback(async () => {
    if (flushing.current) return
    flushing.current = true
    try {
      for (const d of [...queueRef.current]) {
        if (!(await send(d))) break
      }
    } finally {
      flushing.current = false
    }
  }, [send])

  useEffect(() => {
    void flush()
    window.addEventListener('online', flush)
    const timer = window.setInterval(() => {
      if (queueRef.current.length) void flush()
    }, 10000)
    return () => {
      window.removeEventListener('online', flush)
      window.clearInterval(timer)
    }
  }, [flush])

  const add = useCallback(
    async (playerId: string) => {
      const drink: Drink = { id: uuid(), player_id: playerId, kind: 'pint', created_at: new Date().toISOString() }
      updateQueue((q) => [...q, drink])
      const ok = await send(drink)
      return { drink, ok }
    },
    [send, updateQueue],
  )

  const remove = useCallback(
    async (id: string) => {
      cancelled.current.add(id)
      updateQueue((q) => q.filter((x) => x.id !== id))
      removeLocal(id)
      const { error } = await supabase.from('drinks').delete().eq('id', id)
      if (error) void reload()
      return !error
    },
    [removeLocal, updateQueue, reload],
  )

  const drinks = useMemo(() => {
    const ids = new Set(table.rows.map((r) => r.id))
    return [...table.rows, ...queue.filter((q) => !ids.has(q.id) && !cancelled.current.has(q.id))]
  }, [table.rows, queue])

  return { drinks, queued: queue.length, add, remove, loaded: table.loaded }
}

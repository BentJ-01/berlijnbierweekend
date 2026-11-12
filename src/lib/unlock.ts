import { useEffect, useState } from 'react'

/** De pubgolf blijft geheim tot zaterdag 14/11 om 13:00, Berlijnse tijd. */
export const PUBGOLF_OPEN = new Date('2026-11-14T13:00:00+01:00')

/** Huidige tijd, elke seconde bijgewerkt zolang `until` nog niet bereikt is. */
export function useNow(until: Date) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (now >= until) return
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [now, until])
  return now
}

export const isPubgolfOpen = (now = new Date()) => now >= PUBGOLF_OPEN

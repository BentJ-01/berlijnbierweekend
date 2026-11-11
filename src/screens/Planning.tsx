import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Globe, Info, MapPin, Navigation, Ticket as TicketIcon } from 'lucide-react'
import { QrCode } from '../components/QrCode'
import { RichText } from '../components/RichText'
import { DAYS, PLANNING, TICKETS, type PlanItem, type Ticket } from '../data/planning'
import { mapsRouteUrl, withBerlin } from '../lib/maps'
import type { Player } from '../lib/types'

type Props = { players: Player[]; me: string }

function todayInTrip() {
  const d = new Date()
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return DAYS.find((x) => x.date === iso)?.date ?? DAYS[0].date
}

const ticketsFor = (item: PlanItem) => TICKETS.filter((t) => t.itemId === item.id)
const isMine = (t: Ticket, myName: string) => t.player === null || t.player === myName

export function Planning({ players, me }: Props) {
  const [day, setDay] = useState(todayInTrip)
  const [openId, setOpenId] = useState<string | null>(null)
  const top = useRef<HTMLDivElement>(null)
  const myName = players.find((p) => p.id === me)?.name ?? ''

  const dayItems = PLANNING.filter((i) => i.day === day)
  const open = PLANNING.find((i) => i.id === openId) ?? null

  // Blok-body: scrollIntoView geeft in nieuwe browsers een Promise terug, en die mag
  // niet als opruimfunctie van het effect terugkomen (crasht bij het wisselen van tab).
  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start' })
  }, [day])

  return (
    <div ref={top} className="scroll-mt-20">
      <div className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-10 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur">
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-card p-1">
          {DAYS.map((d) => (
            <button
              key={d.date}
              onClick={() => setDay(d.date)}
              className={`min-h-12 rounded-xl text-sm font-bold ${
                d.date === day ? 'bg-amber-400 text-bg' : 'text-zinc-400 active:bg-line'
              }`}
            >
              {d.short}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <h1 className="mb-4 text-2xl font-black">{DAYS.find((d) => d.date === day)?.label}</h1>

        {dayItems.length === 0 && (
          <p className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center text-zinc-500">Nog niks gepland.</p>
        )}

        <ol>
          {dayItems.map((item, idx) => {
            const newPart = idx === 0 || dayItems[idx - 1].part !== item.part
            const myTicket = ticketsFor(item).some((t) => isMine(t, myName))
            const hasMore = Boolean(item.details || item.url || myTicket)
            return (
              <li key={item.id}>
                {newPart && (
                  <div className={`mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500 ${idx ? 'mt-5' : ''}`}>
                    {item.part}
                  </div>
                )}
                <button
                  onClick={() => setOpenId(item.id)}
                  className={`mb-2 flex w-full items-start gap-3 rounded-2xl border p-4 text-left active:bg-line ${
                    hasMore ? 'border-amber-400/40 bg-amber-400/5' : 'border-line bg-card'
                  } ${item.optional ? 'border-dashed' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {item.time && (
                        <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-sm font-black tabular-nums text-bg">{item.time}</span>
                      )}
                      <span className={`text-lg font-bold leading-snug ${item.optional ? 'text-zinc-300' : ''}`}>{item.title}</span>
                    </div>
                    {item.note && <p className="mt-1 text-sm text-zinc-400">{item.note}</p>}
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                      {item.optional && <span className="rounded-full border border-zinc-600 px-2 py-0.5 text-zinc-400">eventueel</span>}
                      {myTicket && <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-amber-300"><TicketIcon size={12} />ticket</span>}
                      {item.details && <span className="inline-flex items-center gap-1 rounded-full bg-line px-2 py-0.5 text-zinc-300"><Info size={12} />info</span>}
                      {item.location && <span className="inline-flex items-center gap-1 rounded-full bg-line px-2 py-0.5 text-zinc-300"><MapPin size={12} />{item.location.split(',')[0]}</span>}
                    </div>
                  </div>
                  <ChevronRight className="mt-1 shrink-0 text-zinc-600" size={22} />
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {open && <EventSheet item={open} myName={myName} onClose={() => setOpenId(null)} />}
    </div>
  )
}

function EventSheet({ item, myName, onClose }: { item: PlanItem; myName: string; onClose: () => void }) {
  const [big, setBig] = useState<Ticket | null>(null)
  const tickets = ticketsFor(item)
  const mine = tickets.filter((t) => isMine(t, myName))
  const holders = tickets.map((t) => t.player).filter(Boolean)
  const dayLabel = DAYS.find((d) => d.date === item.day)?.label ?? item.day

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg">
      <div className="mx-auto max-w-md px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <button onClick={onClose} className="-ml-2 mb-4 flex min-h-11 items-center px-2 font-semibold text-amber-300 active:opacity-60">
          <ChevronLeft size={20} /> Terug
        </button>

        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {dayLabel} · {item.part}
          {item.time && ` · ${item.time}`}
        </p>
        <h1 className="mb-2 mt-1 text-3xl font-black leading-tight">{item.title}</h1>
        {item.note && <p className="mb-4 text-lg text-zinc-300">{item.note}</p>}

        {(item.location || item.url) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {item.location && (
              <a
                href={mapsRouteUrl(withBerlin(item.location))}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center gap-2 rounded-xl bg-amber-400 px-4 font-bold text-bg active:bg-amber-300"
              >
                <Navigation size={18} strokeWidth={2.5} />
                Route in Maps
              </a>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center gap-2 rounded-xl border border-line px-4 font-semibold text-zinc-200 active:bg-line"
              >
                <Globe size={18} />
                Website
              </a>
            )}
          </div>
        )}

        {item.location && (
          <p className="-mt-3 mb-6 flex items-start gap-1.5 text-sm text-zinc-500">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            {item.location}
          </p>
        )}

        {mine.map((t) => (
          <section key={t.code} className="mb-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-500">{t.player ? 'Jouw ticket' : 'Groepsticket'}</h2>
            <button onClick={() => setBig(t)} className="w-full rounded-2xl bg-white p-4 text-left text-zinc-900 active:opacity-80">
              <div className="flex items-center gap-4">
                <QrCode value={t.code} size={110} />
                <div className="min-w-0">
                  <div className="font-bold leading-snug">{t.label}</div>
                  <div className="mt-1 text-sm text-zinc-600">{t.info}</div>
                  <div className="mt-2 break-all font-mono text-xs text-zinc-500">{t.code}</div>
                  <div className="mt-2 text-sm font-semibold text-amber-700">Tik om te scannen ›</div>
                </div>
              </div>
            </button>
          </section>
        ))}

        {tickets.length > 0 && mine.length === 0 && (
          <p className="mb-6 rounded-2xl border border-line p-4 text-zinc-400">
            Geen ticket voor jou hier. Tickets zijn voor {holders.join(', ')}.
          </p>
        )}

        {item.details && <RichText text={item.details} />}
      </div>

      {big && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6 text-zinc-900" onClick={() => setBig(null)}>
          <QrCode value={big.code} size={Math.min(320, window.innerWidth - 48)} />
          <p className="mt-4 text-center text-lg font-bold">{big.label}</p>
          {big.player && <p className="text-zinc-600">{big.player}</p>}
          <p className="mt-1 font-mono text-sm text-zinc-500">{big.code}</p>
          <p className="mt-8 text-sm text-zinc-400">Zet je scherm op max helderheid · tik om te sluiten</p>
        </div>
      )}
    </div>
  )
}

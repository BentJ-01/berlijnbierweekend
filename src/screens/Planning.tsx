import { useEffect, useMemo, useRef, useState } from 'react'
import { Field, Modal, inputClass } from '../components/Modal'
import { QrCode } from '../components/QrCode'
import { RichText } from '../components/RichText'
import { mapsRouteUrl, withBerlin } from '../lib/maps'
import { supabase } from '../lib/supabase'
import type { PlanItem, PlanStatus, Player, ShowToast, TableApi, Ticket } from '../lib/types'

type Props = {
  items: TableApi<PlanItem>
  tickets: Ticket[]
  players: Player[]
  me: string
  toast: ShowToast
}

const DAYS = [
  { date: '2026-11-13', label: 'Vrijdag', short: 'Vr 13' },
  { date: '2026-11-14', label: 'Zaterdag', short: 'Za 14' },
  { date: '2026-11-15', label: 'Zondag', short: 'Zo 15' },
  { date: '2026-11-16', label: 'Maandag', short: 'Ma 16' },
]

const PARTS = ['Ochtend', 'Middag', 'Namiddag', 'Avond', 'Nacht']

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '')
const partIndex = (p: string) => (PARTS.includes(p) ? PARTS.indexOf(p) : PARTS.length)

function sortItems(a: PlanItem, b: PlanItem) {
  return (
    partIndex(a.part) - partIndex(b.part) ||
    a.position - b.position ||
    hhmm(a.time).localeCompare(hhmm(b.time)) ||
    a.created_at.localeCompare(b.created_at)
  )
}

function todayInTrip() {
  const d = new Date()
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return DAYS.find((x) => x.date === iso)?.date ?? DAYS[0].date
}

export function Planning({ items, tickets, players, me, toast }: Props) {
  const [day, setDay] = useState(todayInTrip)
  const [openId, setOpenId] = useState<string | null>(null)
  const [editing, setEditing] = useState<PlanItem | 'new' | null>(null)
  const top = useRef<HTMLDivElement>(null)

  const dayItems = useMemo(() => items.rows.filter((i) => i.day === day).sort(sortItems), [items.rows, day])
  const open = items.rows.find((i) => i.id === openId) ?? null

  useEffect(() => top.current?.scrollIntoView({ block: 'start' }), [day])

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
          <p className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center text-zinc-500">
            Nog niks gepland. Volgt nog!
          </p>
        )}

        <ol className="relative">
          {dayItems.map((item, idx) => {
            const newPart = idx === 0 || dayItems[idx - 1].part !== item.part
            const myTicket = tickets.some((t) => t.plan_item_id === item.id && (t.player_id === me || t.player_id === null))
            const hasMore = Boolean(item.details || item.url || myTicket)
            const optional = item.status === 'optioneel'
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
                  } ${optional ? 'border-dashed' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {item.time && (
                        <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-sm font-black tabular-nums text-bg">
                          {hhmm(item.time)}
                        </span>
                      )}
                      <span className={`text-lg font-bold leading-snug ${optional ? 'text-zinc-300' : ''}`}>{item.title}</span>
                    </div>
                    {item.note && <p className="mt-1 text-sm text-zinc-400">{item.note}</p>}
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                      {optional && <span className="rounded-full border border-zinc-600 px-2 py-0.5 text-zinc-400">eventueel</span>}
                      {myTicket && <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-amber-300">🎟️ ticket</span>}
                      {item.details && <span className="rounded-full bg-line px-2 py-0.5 text-zinc-300">ℹ️ info</span>}
                      {item.location && <span className="rounded-full bg-line px-2 py-0.5 text-zinc-300">📍 {shortPlace(item.location)}</span>}
                    </div>
                  </div>
                  <span className="mt-1 text-xl text-zinc-600">›</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <button
        onClick={() => setEditing('new')}
        aria-label="Item toevoegen"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-20 h-14 w-14 rounded-full bg-amber-400 text-3xl font-bold text-bg shadow-xl active:bg-amber-300"
      >
        +
      </button>

      {open && (
        <EventSheet
          item={open}
          tickets={tickets.filter((t) => t.plan_item_id === open.id)}
          players={players}
          me={me}
          onClose={() => setOpenId(null)}
          onEdit={() => setEditing(open)}
        />
      )}

      {editing && (
        <PlanForm
          item={editing === 'new' ? null : editing}
          defaultDay={day}
          items={items}
          toast={toast}
          onClose={() => setEditing(null)}
          onDeleted={() => setOpenId(null)}
        />
      )}
    </div>
  )
}

function shortPlace(location: string) {
  return location.split(',')[0]
}

type SheetProps = {
  item: PlanItem
  tickets: Ticket[]
  players: Player[]
  me: string
  onClose: () => void
  onEdit: () => void
}

function EventSheet({ item, tickets, players, me, onClose, onEdit }: SheetProps) {
  const [big, setBig] = useState<Ticket | null>(null)
  const mine = tickets.filter((t) => t.player_id === me || t.player_id === null)
  const othersHave = tickets.length > 0 && mine.length === 0
  const dayLabel = DAYS.find((d) => d.date === item.day)?.label ?? item.day
  const holders = tickets.filter((t) => t.player_id).map((t) => players.find((p) => p.id === t.player_id)?.name)

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg">
      <div className="mx-auto max-w-md px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onClose} className="-ml-2 flex min-h-11 items-center px-2 font-semibold text-amber-300 active:opacity-60">
            ‹ Terug
          </button>
          <button onClick={onEdit} className="min-h-11 rounded-full px-3 text-sm text-zinc-400 active:bg-line">
            ✏️ Bewerken
          </button>
        </div>

        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {dayLabel} · {item.part}
          {item.time && ` · ${hhmm(item.time)}`}
        </p>
        <h1 className="mb-2 mt-1 text-3xl font-black leading-tight">{item.title}</h1>
        {item.note && <p className="mb-4 text-lg text-zinc-300">{item.note}</p>}

        <div className="mb-6 flex flex-wrap gap-2">
          {item.location && (
            <a
              href={mapsRouteUrl(withBerlin(item.location))}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center rounded-xl bg-amber-400 px-4 font-bold text-bg active:bg-amber-300"
            >
              🧭 Route
            </a>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center rounded-xl border border-line px-4 font-semibold text-zinc-200 active:bg-line"
            >
              🌐 Website
            </a>
          )}
        </div>

        {item.location && <p className="-mt-3 mb-6 text-sm text-zinc-500">📍 {item.location}</p>}

        {mine.map((t) => (
          <section key={t.id} className="mb-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-500">
              {t.player_id ? 'Jouw ticket' : 'Groepsticket'}
            </h2>
            <button onClick={() => setBig(t)} className="w-full rounded-2xl bg-white p-4 text-left text-zinc-900 active:opacity-80">
              <div className="flex items-center gap-4">
                <QrCode value={t.code} size={110} />
                <div className="min-w-0">
                  <div className="font-bold leading-snug">{t.label}</div>
                  {t.info && <div className="mt-1 text-sm text-zinc-600">{t.info}</div>}
                  <div className="mt-2 break-all font-mono text-xs text-zinc-500">{t.code}</div>
                  <div className="mt-2 text-sm font-semibold text-amber-700">Tik om te scannen ›</div>
                </div>
              </div>
            </button>
          </section>
        ))}

        {othersHave && (
          <p className="mb-6 rounded-2xl border border-line p-4 text-zinc-400">
            Geen ticket voor jou hier. Tickets zijn voor {holders.filter(Boolean).join(', ')}.
          </p>
        )}

        {item.details && <RichText text={item.details} />}
      </div>

      {big && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6 text-zinc-900" onClick={() => setBig(null)}>
          <QrCode value={big.code} size={Math.min(320, window.innerWidth - 48)} />
          <p className="mt-4 text-center text-lg font-bold">{big.label}</p>
          {big.player_id && <p className="text-zinc-600">{players.find((p) => p.id === big.player_id)?.name}</p>}
          <p className="mt-1 font-mono text-sm text-zinc-500">{big.code}</p>
          <p className="mt-8 text-sm text-zinc-400">Zet je scherm op max helderheid · tik om te sluiten</p>
        </div>
      )}
    </div>
  )
}

type FormProps = {
  item: PlanItem | null
  defaultDay: string
  items: TableApi<PlanItem>
  toast: ShowToast
  onClose: () => void
  onDeleted: () => void
}

function PlanForm({ item, defaultDay, items, toast, onClose, onDeleted }: FormProps) {
  const [day, setDay] = useState(item?.day ?? defaultDay)
  const [part, setPart] = useState(item?.part ?? 'Namiddag')
  const [time, setTime] = useState(hhmm(item?.time ?? null))
  const [title, setTitle] = useState(item?.title ?? '')
  const [location, setLocation] = useState(item?.location ?? '')
  const [note, setNote] = useState(item?.note ?? '')
  const [details, setDetails] = useState(item?.details ?? '')
  const [url, setUrl] = useState(item?.url ?? '')
  const [status, setStatus] = useState<PlanStatus>(item?.status ?? 'vast')
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!title.trim()) return toast('Geef het wel een titel')
    setBusy(true)
    const values = {
      day,
      part,
      time: time || null,
      title: title.trim(),
      location: location.trim() || null,
      note: note.trim() || null,
      details: details.trim() || null,
      url: url.trim() || null,
      status,
    }
    const position =
      item && item.day === day && item.part === part
        ? item.position
        : Math.max(0, ...items.rows.filter((i) => i.day === day && i.part === part).map((i) => i.position)) + 1
    const { data, error } = item
      ? await supabase.from('plan_items').update({ ...values, position }).eq('id', item.id).select().single()
      : await supabase.from('plan_items').insert({ ...values, position }).select().single()
    setBusy(false)
    if (error) return toast('Opslaan niet gelukt, probeer opnieuw')
    items.upsertLocal(data as PlanItem)
    onClose()
  }

  async function del() {
    if (!item || !confirm(`"${item.title}" verwijderen?`)) return
    setBusy(true)
    const { error } = await supabase.from('plan_items').delete().eq('id', item.id)
    setBusy(false)
    if (error) return toast('Verwijderen niet gelukt')
    items.removeLocal(item.id)
    onDeleted()
    onClose()
  }

  return (
    <Modal title={item ? 'Bewerken' : 'Nieuw item'} onClose={onClose}>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Dag">
            <select className={inputClass} value={day} onChange={(e) => setDay(e.target.value)}>
              {DAYS.map((d) => (
                <option key={d.date} value={d.date}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Dagdeel">
            <select className={inputClass} value={part} onChange={(e) => setPart(e.target.value)}>
              {PARTS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>
      <Field label="Titel">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bv. Kebab vatten" />
      </Field>
      <Field label="Uur (enkel als het vastligt)">
        <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
      </Field>
      <Field label="Korte uitleg">
        <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optioneel" />
      </Field>
      <Field label="Locatie (adres of naam)">
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optioneel" />
      </Field>
      <Field label="Meer info">
        <textarea
          className={inputClass}
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={'Optioneel. "- " voor een opsomming, "## " voor een kopje'}
        />
      </Field>
      <Field label="Website">
        <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" inputMode="url" />
      </Field>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {(['vast', 'optioneel'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`min-h-12 rounded-xl font-semibold ${status === s ? 'bg-zinc-100 text-bg' : 'border border-line text-zinc-400'}`}
          >
            {s === 'vast' ? 'Vast' : 'Eventueel'}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        {item && (
          <button className="min-h-14 rounded-xl px-4 font-semibold text-red-400 active:bg-line" onClick={del} disabled={busy}>
            Verwijderen
          </button>
        )}
        <button
          className="min-h-14 flex-1 rounded-xl bg-amber-400 text-lg font-bold text-bg active:bg-amber-300 disabled:opacity-50"
          onClick={save}
          disabled={busy}
        >
          Opslaan
        </button>
      </div>
    </Modal>
  )
}

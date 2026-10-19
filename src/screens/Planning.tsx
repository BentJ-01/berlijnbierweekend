import { useMemo, useState } from 'react'
import { Field, Modal, inputClass } from '../components/Modal'
import { supabase } from '../lib/supabase'
import type { PlanItem, PlanStatus, ShowToast, TableApi } from '../lib/types'


type Props = { items: TableApi<PlanItem>; toast: ShowToast }

const DAYS = [
  { date: '2026-11-13', label: 'Vrijdag 13 nov' },
  { date: '2026-11-14', label: 'Zaterdag 14 nov' },
  { date: '2026-11-15', label: 'Zondag 15 nov' },
  { date: '2026-11-16', label: 'Maandag 16 nov' },
]

const dayLabel = (date: string) => DAYS.find((d) => d.date === date)?.label ?? date
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '')

function mapsUrl(item: PlanItem) {
  const q = `${item.location?.trim() || item.title} Berlin`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

export function Planning({ items, toast }: Props) {
  const [editing, setEditing] = useState<PlanItem | 'new' | null>(null)

  const groups = useMemo(() => {
    const days = Array.from(new Set([...DAYS.map((d) => d.date), ...items.rows.map((i) => i.day)])).sort()
    return days.map((day) => ({
      day,
      items: items.rows
        .filter((i) => i.day === day)
        .sort((a, b) => {
          if (!a.time !== !b.time) return a.time ? -1 : 1
          return (a.time ?? '').localeCompare(b.time ?? '') || a.created_at.localeCompare(b.created_at)
        }),
    }))
  }, [items.rows])

  async function patch(item: PlanItem, values: Partial<PlanItem>) {
    items.upsertLocal({ ...item, ...values })
    const { error } = await supabase.from('plan_items').update(values).eq('id', item.id)
    if (error) {
      toast('Niet gelukt, probeer opnieuw')
      void items.reload()
    }
  }

  return (
    <div className="px-4 pt-4">
      {groups.map(({ day, items: dayItems }) => (
        <section key={day} className="mb-6">
          <h2 className="mb-2 text-lg font-bold text-amber-300">{dayLabel(day)}</h2>
          {dayItems.length === 0 && <p className="text-sm text-zinc-600">Nog niks gepland</p>}
          <ul className="flex flex-col gap-2">
            {dayItems.map((item) => {
              const optional = item.status === 'optioneel'
              return (
                <li
                  key={item.id}
                  className={`rounded-2xl border p-3 ${
                    optional ? 'border-dashed border-zinc-700 bg-transparent' : 'border-line bg-card'
                  } ${item.done ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => patch(item, { done: !item.done })}
                      aria-label={item.done ? 'Niet meer afgevinkt' : 'Afvinken'}
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-lg font-black ${
                        item.done ? 'border-amber-400 bg-amber-400 text-bg' : 'border-zinc-600'
                      }`}
                    >
                      {item.done && '✓'}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`font-semibold ${optional ? 'text-zinc-400' : ''} ${item.done ? 'line-through' : ''}`}>
                        {item.time && <span className="mr-2 tabular-nums text-amber-300">{hhmm(item.time)}</span>}
                        {item.title}
                      </div>
                      {item.location && <div className="text-sm text-zinc-400">📍 {item.location}</div>}
                      {item.note && <div className="mt-1 whitespace-pre-line text-sm text-zinc-400">{item.note}</div>}
                    </div>
                    <button
                      className="-mr-1 -mt-1 h-11 w-11 shrink-0 rounded-full text-lg text-zinc-400 active:bg-line"
                      aria-label="Bewerken"
                      onClick={() => setEditing(item)}
                    >
                      ✏️
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2 pl-11">
                    <button
                      onClick={() => patch(item, { status: optional ? 'vast' : 'optioneel' })}
                      className={`min-h-10 rounded-full px-3 text-sm font-semibold ${
                        optional ? 'border border-zinc-600 text-zinc-400' : 'bg-zinc-100 text-bg'
                      }`}
                    >
                      {optional ? 'Optioneel' : 'Vast'}
                    </button>
                    <a
                      href={mapsUrl(item)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-10 items-center rounded-full border border-line px-3 text-sm font-semibold text-zinc-300 active:bg-line"
                    >
                      🗺️ Open in Maps
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <button
        onClick={() => setEditing('new')}
        aria-label="Item toevoegen"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-20 h-16 w-16 rounded-full bg-amber-400 text-4xl font-bold text-bg shadow-xl active:bg-amber-300"
      >
        +
      </button>

      {editing && (
        <PlanForm item={editing === 'new' ? null : editing} items={items} toast={toast} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

type FormProps = { item: PlanItem | null; items: TableApi<PlanItem>; toast: ShowToast; onClose: () => void }

function PlanForm({ item, items, toast, onClose }: FormProps) {
  const [day, setDay] = useState(item?.day ?? DAYS[0].date)
  const [time, setTime] = useState(hhmm(item?.time ?? null))
  const [title, setTitle] = useState(item?.title ?? '')
  const [location, setLocation] = useState(item?.location ?? '')
  const [note, setNote] = useState(item?.note ?? '')
  const [status, setStatus] = useState<PlanStatus>(item?.status ?? 'vast')
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!title.trim()) return toast('Geef het wel een titel')
    setBusy(true)
    const values = {
      day,
      time: time || null,
      title: title.trim(),
      location: location.trim() || null,
      note: note.trim() || null,
      status,
    }
    const { data, error } = item
      ? await supabase.from('plan_items').update(values).eq('id', item.id).select().single()
      : await supabase.from('plan_items').insert(values).select().single()
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
    onClose()
  }

  return (
    <Modal title={item ? 'Item bewerken' : 'Nieuw item'} onClose={onClose}>
      <div className="flex gap-3">
        <div className="flex-[3]">
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
        <div className="flex-[2]">
          <Field label="Tijd">
            <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
      </div>
      <Field label="Titel">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bv. Currywurst eten" />
      </Field>
      <Field label="Locatie">
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optioneel" />
      </Field>
      <Field label="Notitie">
        <textarea className={inputClass} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optioneel" />
      </Field>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {(['vast', 'optioneel'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`min-h-12 rounded-xl font-semibold capitalize ${
              status === s ? 'bg-zinc-100 text-bg' : 'border border-line text-zinc-400'
            }`}
          >
            {s}
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

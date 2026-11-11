import { useMemo, useState } from 'react'
import { Field, Modal, inputClass } from '../components/Modal'
import { formatEuro, parseEuro, settle, splitCents } from '../lib/money'
import { supabase } from '../lib/supabase'
import type { Expense, Player, ShowToast, TableApi } from '../lib/types'

type Props = {
  players: Player[]
  me: string
  expenses: TableApi<Expense>
  toast: ShowToast
}

export function Kosten({ players, me, expenses, toast }: Props) {
  const [editing, setEditing] = useState<Expense | 'new' | null>(null)
  const name = (id: string) => players.find((p) => p.id === id)?.name ?? '?'

  const { balances, total, transfers } = useMemo(() => {
    const bal = new Map(players.map((p) => [p.id, 0]))
    let sum = 0
    for (const e of expenses.rows) {
      if (!isRefund(e)) sum += e.amount_cents
      bal.set(e.paid_by, (bal.get(e.paid_by) ?? 0) + e.amount_cents)
      for (const [pid, share] of splitCents(e.amount_cents, e.split_between)) bal.set(pid, (bal.get(pid) ?? 0) - share)
    }
    return { balances: bal, total: sum, transfers: settle(bal) }
  }, [players, expenses.rows])

  const sorted = useMemo(() => [...expenses.rows].sort((a, b) => b.created_at.localeCompare(a.created_at)), [expenses.rows])
  const myBalance = balances.get(me) ?? 0

  async function markPaid(from: string, to: string, cents: number) {
    if (!confirm(`${name(from)} heeft ${formatEuro(cents)} aan ${name(to)} betaald?`)) return
    const { data, error } = await supabase
      .from('expenses')
      .insert({ title: REFUND_TITLE, amount_cents: cents, paid_by: from, split_between: [to] })
      .select()
      .single()
    if (error) return toast('Niet gelukt, probeer opnieuw')
    expenses.upsertLocal(data as Expense)
    toast('Terugbetaling genoteerd 👍')
  }

  return (
    <div className="px-4 pt-4">
      <section className="mb-4 rounded-2xl border border-line bg-card p-5 text-center">
        <p className="text-sm text-zinc-400">{myBalance === 0 ? 'Jij staat quitte' : myBalance > 0 ? 'Jij krijgt nog' : 'Jij moet nog'}</p>
        <p className={`text-5xl font-black tabular-nums ${myBalance > 0 ? 'text-emerald-400' : myBalance < 0 ? 'text-red-400' : ''}`}>
          {formatEuro(Math.abs(myBalance))}
        </p>
        <p className="mt-2 text-sm text-zinc-500">Samen uitgegeven: {formatEuro(total)}</p>
      </section>

      <section className="mb-4 rounded-2xl border border-line bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Saldo</h2>
        {players.map((p) => {
          const b = balances.get(p.id) ?? 0
          return (
            <div key={p.id} className="flex items-center justify-between py-1.5">
              <span className={`text-lg font-semibold ${p.id === me ? 'text-amber-300' : ''}`}>{p.name}</span>
              <span className={`text-lg font-bold tabular-nums ${b > 0 ? 'text-emerald-400' : b < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                {b > 0 ? '+' : ''}
                {formatEuro(b)}
              </span>
            </div>
          )
        })}
      </section>

      {transfers.length > 0 && (
        <section className="mb-6 rounded-2xl border border-line bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Wie betaalt wie</h2>
          {transfers.map((t) => (
            <div key={`${t.from}-${t.to}`} className="flex items-center gap-2 py-1.5">
              <span className="flex-1">
                <b className={t.from === me ? 'text-amber-300' : ''}>{name(t.from)}</b>
                <span className="text-zinc-500"> → </span>
                <b className={t.to === me ? 'text-amber-300' : ''}>{name(t.to)}</b>
              </span>
              <span className="font-bold tabular-nums">{formatEuro(t.cents)}</span>
              <button
                onClick={() => markPaid(t.from, t.to, t.cents)}
                className="min-h-10 rounded-lg border border-line px-2 text-sm text-zinc-300 active:bg-line"
              >
                Betaald ✓
              </button>
            </div>
          ))}
        </section>
      )}

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Uitgaven</h2>
      {sorted.length === 0 && (
        <p className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center text-zinc-500">
          Nog niks. Tik op + als ge iets betaald hebt voor de groep.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {sorted.map((e) => {
          const refund = isRefund(e)
          const everyone = e.split_between.length === players.length
          return (
            <li key={e.id}>
              <button
                onClick={() => setEditing(e)}
                className={`flex w-full items-center gap-3 rounded-2xl border border-line p-4 text-left active:bg-line ${refund ? 'opacity-60' : 'bg-card'}`}
              >
                <span className="text-2xl">{refund ? '↩️' : '🧾'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{refund ? `${name(e.paid_by)} → ${name(e.split_between[0])}` : e.title}</span>
                  <span className="block text-sm text-zinc-400">
                    {refund
                      ? 'Terugbetaling'
                      : `${name(e.paid_by)} betaalde · ${everyone ? 'iedereen' : e.split_between.map(name).join(', ')}`}
                  </span>
                </span>
                <span className="text-lg font-black tabular-nums">{formatEuro(e.amount_cents)}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        onClick={() => setEditing('new')}
        aria-label="Uitgave toevoegen"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-20 h-14 w-14 rounded-full bg-amber-400 text-3xl font-bold text-bg shadow-xl active:bg-amber-300"
      >
        +
      </button>

      {editing && (
        <ExpenseForm
          expense={editing === 'new' ? null : editing}
          players={players}
          me={me}
          expenses={expenses}
          toast={toast}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

const REFUND_TITLE = 'Terugbetaling'
const isRefund = (e: Expense) => e.title === REFUND_TITLE && e.split_between.length === 1

type FormProps = {
  expense: Expense | null
  players: Player[]
  me: string
  expenses: TableApi<Expense>
  toast: ShowToast
  onClose: () => void
}

function ExpenseForm({ expense, players, me, expenses, toast, onClose }: FormProps) {
  const [title, setTitle] = useState(expense?.title ?? '')
  const [amount, setAmount] = useState(expense ? (expense.amount_cents / 100).toFixed(2).replace('.', ',') : '')
  const [paidBy, setPaidBy] = useState(expense?.paid_by ?? me)
  const [split, setSplit] = useState<string[]>(expense?.split_between ?? players.map((p) => p.id))
  const [busy, setBusy] = useState(false)

  const cents = parseEuro(amount)
  const perPerson = cents && split.length ? splitCents(cents, split).values().next().value : null

  function toggle(id: string) {
    setSplit((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function save() {
    if (!title.trim()) return toast('Waarvoor was het?')
    if (!cents) return toast('Geef een geldig bedrag in')
    if (!split.length) return toast('Kies voor wie het was')
    setBusy(true)
    const ordered = players.map((p) => p.id).filter((id) => split.includes(id))
    const values = { title: title.trim(), amount_cents: cents, paid_by: paidBy, split_between: ordered }
    const { data, error } = expense
      ? await supabase.from('expenses').update(values).eq('id', expense.id).select().single()
      : await supabase.from('expenses').insert(values).select().single()
    setBusy(false)
    if (error) return toast('Opslaan niet gelukt, probeer opnieuw')
    expenses.upsertLocal(data as Expense)
    onClose()
  }

  async function del() {
    if (!expense || !confirm('Deze uitgave verwijderen?')) return
    setBusy(true)
    const { error } = await supabase.from('expenses').delete().eq('id', expense.id)
    setBusy(false)
    if (error) return toast('Verwijderen niet gelukt')
    expenses.removeLocal(expense.id)
    onClose()
  }

  const chip = (active: boolean) =>
    `min-h-12 rounded-xl px-3 font-semibold ${active ? 'bg-amber-400 text-bg' : 'border border-line text-zinc-400'}`

  return (
    <Modal title={expense ? 'Uitgave bewerken' : 'Nieuwe uitgave'} onClose={onClose}>
      <Field label="Waarvoor">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bv. Rondje grosses bier" />
      </Field>
      <Field label="Bedrag">
        <input
          className={`${inputClass} text-2xl font-bold`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          inputMode="decimal"
        />
      </Field>
      <div className="mb-4">
        <span className="mb-1 block text-sm font-medium text-zinc-400">Betaald door</span>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <button key={p.id} className={chip(paidBy === p.id)} onClick={() => setPaidBy(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Voor wie</span>
          <button
            className="text-sm font-semibold text-amber-300"
            onClick={() => setSplit(split.length === players.length ? [] : players.map((p) => p.id))}
          >
            {split.length === players.length ? 'Niemand' : 'Iedereen'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <button key={p.id} className={chip(split.includes(p.id))} onClick={() => toggle(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
        {perPerson != null && (
          <p className="mt-2 text-sm text-zinc-500">
            ±{formatEuro(perPerson)} per persoon ({split.length})
          </p>
        )}
      </div>
      <div className="flex gap-3">
        {expense && (
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

export type Player = { id: string; name: string; sort_order: number }

export type HoleKind = 'cafe' | 'cultuur'

export type Hole = {
  id: string
  position: number
  kind: HoleKind
  bar_name: string
  description: string
  par: number
  rule: string
  created_at: string
}

export type Score = { id: string; hole_id: string; player_id: string; strokes: number }

export type PlanStatus = 'vast' | 'optioneel'

export type PlanItem = {
  id: string
  day: string
  part: string
  position: number
  time: string | null
  title: string
  location: string | null
  note: string | null
  details: string | null
  url: string | null
  status: PlanStatus
  done: boolean
  created_at: string
}

/** Ticket bij een planningsitem. player_id null = groepsticket voor iedereen. */
export type Ticket = {
  id: string
  plan_item_id: string
  player_id: string | null
  label: string
  code: string
  info: string | null
}

export type Expense = {
  id: string
  title: string
  amount_cents: number
  paid_by: string
  split_between: string[]
  created_at: string
}

export type ShowToast = (message: string, action?: { label: string; run: () => void }) => void

export type TableApi<T> = {
  rows: T[]
  reload: () => Promise<void>
  upsertLocal: (row: T) => void
  removeLocal: (id: string) => void
}

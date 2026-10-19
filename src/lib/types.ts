export type Player = { id: string; name: string; sort_order: number }

export type Drink = { id: string; player_id: string; kind: string; created_at: string }

export type Hole = {
  id: string
  position: number
  bar_name: string
  par: number
  rule: string
  created_at: string
}

export type Score = { id: string; hole_id: string; player_id: string; strokes: number }

export type PlanStatus = 'vast' | 'optioneel'

export type PlanItem = {
  id: string
  day: string
  time: string | null
  title: string
  location: string | null
  note: string | null
  status: PlanStatus
  done: boolean
  created_at: string
}

export type ShowToast = (message: string, action?: { label: string; run: () => void }) => void

export type TableApi<T> = {
  rows: T[]
  reload: () => Promise<void>
  upsertLocal: (row: T) => void
  removeLocal: (id: string) => void
}

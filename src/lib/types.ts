export type Player = { id: string; name: string; sort_order: number }

/** Een café-hole van de pubgolf: de id's staan vast in src/data/parcours.ts. */
export type Hole = { id: string; position: number; bar_name: string; par: number; rule: string; created_at: string }

export type Score = { id: string; hole_id: string; player_id: string; strokes: number }

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

export type KingenGame = { id: string; name: string; players: string[]; created_at: string }

export type KingenRound = {
  id: string
  game_id: string
  round_key: string
  input: import('../data/kingen').RoundInput
  created_at: string
}

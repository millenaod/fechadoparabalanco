import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
)

// mappers DB ↔ app
export function lunchFromDb(row) {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    attendees: row.attendees,
    payers: row.payers,
    total: row.total,
    splitPerPerson: row.split_per_person,
    createdAt: row.created_at,
  }
}

export function settlementFromDb(row) {
  return {
    id: row.id,
    from: row.from_name,
    to: row.to_name,
    amount: row.amount,
    paidAt: row.paid_at,
  }
}

import { FAMILIES } from './families'

export function computeSettlements(lunches, paidSettlements) {
  const balance = {}

  for (const lunch of lunches) {
    const share = lunch.total / lunch.attendees.length
    for (const person of lunch.attendees) {
      balance[person] = (balance[person] || 0) - share
    }
    for (const payer of lunch.payers) {
      balance[payer.name] = (balance[payer.name] || 0) + payer.amount
    }
  }

  for (const s of paidSettlements) {
    balance[s.from] = (balance[s.from] || 0) + s.amount
    balance[s.to]   = (balance[s.to]   || 0) - s.amount
  }

  // Abate dívidas dentro da mesma família antes de calcular entre famílias
  for (const family of FAMILIES) {
    if (!family.name) continue // membros sem família são tratados individualmente

    const debtors   = family.members.filter(m => (balance[m] || 0) < -0.01)
                        .sort((a, b) => (balance[a] || 0) - (balance[b] || 0))
    const creditors = family.members.filter(m => (balance[m] || 0) >  0.01)
                        .sort((a, b) => (balance[b] || 0) - (balance[a] || 0))

    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
      const debtor   = debtors[i]
      const creditor = creditors[j]
      const amount   = Math.min(-(balance[debtor] || 0), balance[creditor] || 0)

      balance[debtor]   = (balance[debtor]   || 0) + amount
      balance[creditor] = (balance[creditor] || 0) - amount

      if (Math.abs(balance[debtor])   < 0.01) i++
      if (Math.abs(balance[creditor]) < 0.01) j++
    }
  }

  // Greedy entre famílias diferentes
  const debtors   = Object.entries(balance).filter(([, v]) => v < -0.01).sort((a, b) => a[1] - b[1])
  const creditors = Object.entries(balance).filter(([, v]) => v >  0.01).sort((a, b) => b[1] - a[1])

  const result = []
  let i = 0, j = 0

  while (i < debtors.length && j < creditors.length) {
    const [debtor, debt]     = debtors[i]
    const [creditor, credit] = creditors[j]
    const amount = Math.min(-debt, credit)

    result.push({ from: debtor, to: creditor, amount: Math.round(amount * 100) / 100 })

    debtors[i][1]   += amount
    creditors[j][1] -= amount

    if (Math.abs(debtors[i][1])   < 0.01) i++
    if (Math.abs(creditors[j][1]) < 0.01) j++
  }

  return result
}

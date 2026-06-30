export function computeSettlements(lunches, paidSettlements) {
  // pairDebt[from][to] = { amount, sources: [{id, description, date, amount}] }
  const pairDebt = {}

  function add(from, to, amount, source) {
    if (from === to || amount < 0.005) return
    if (!pairDebt[from]) pairDebt[from] = {}
    if (!pairDebt[from][to]) pairDebt[from][to] = { amount: 0, sources: [] }
    pairDebt[from][to].amount += amount
    pairDebt[from][to].sources.push({ ...source, amount: Math.round(amount * 100) / 100 })
  }

  // Calcula dívidas dentro de cada evento — nunca cruza eventos
  for (const lunch of lunches) {
    const share = lunch.total / lunch.attendees.length
    const balance = {}

    for (const person of lunch.attendees) {
      balance[person] = -share
    }
    for (const payer of lunch.payers) {
      balance[payer.name] = (balance[payer.name] || 0) + payer.amount
    }

    const debtors   = Object.entries(balance).filter(([, v]) => v < -0.01)
    const creditors = Object.entries(balance).filter(([, v]) => v >  0.01)
    const totalCredit = creditors.reduce((s, [, v]) => s + v, 0)
    const source = { id: lunch.id, description: lunch.description || 'Almoço', date: lunch.date }

    for (const [debtor, debt] of debtors) {
      for (const [creditor, credit] of creditors) {
        add(debtor, creditor, Math.abs(debt) * (credit / totalCredit), source)
      }
    }
  }

  // Desconta pagamentos já quitados — nunca cria dívida reversa
  for (const s of paidSettlements) {
    if (!pairDebt[s.from]) pairDebt[s.from] = {}
    if (!pairDebt[s.from][s.to]) pairDebt[s.from][s.to] = { amount: 0, sources: [] }
    pairDebt[s.from][s.to].amount = Math.max(0, pairDebt[s.from][s.to].amount - s.amount)
  }

  // Acerta direção e acumula por par sem duplicar
  const result = []
  const seen = new Set()

  for (const from of Object.keys(pairDebt)) {
    for (const to of Object.keys(pairDebt[from] || {})) {
      const key = [from, to].sort().join('|||')
      if (seen.has(key)) continue
      seen.add(key)

      const ab = pairDebt[from]?.[to]?.amount || 0
      const ba = pairDebt[to]?.[from]?.amount || 0
      const net = ab - ba

      if (net > 0.01) {
        result.push({ from, to, amount: Math.round(net * 100) / 100, sources: pairDebt[from][to].sources })
      } else if (net < -0.01) {
        result.push({ from: to, to: from, amount: Math.round(-net * 100) / 100, sources: pairDebt[to][from].sources })
      }
    }
  }

  return result
}

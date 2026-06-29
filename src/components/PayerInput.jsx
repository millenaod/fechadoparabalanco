export default function PayerInput({ attendees, payers, onChange }) {
  function toggle(name) {
    const exists = payers.find((p) => p.name === name)
    if (exists) {
      onChange(payers.filter((p) => p.name !== name))
    } else {
      onChange([...payers, { name, amount: '' }])
    }
  }

  function setAmount(name, amount) {
    onChange(payers.map((p) => (p.name === name ? { ...p, amount } : p)))
  }

  return (
    <div className="space-y-2">
      {attendees.map((name) => {
        const payer = payers.find((p) => p.name === name)
        const active = Boolean(payer)
        return (
          <div key={name} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggle(name)}
              className={`h-10 px-4 rounded-full text-sm font-medium border transition-colors flex-shrink-0 ${
                active
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              {name}
            </button>
            {active && (
              <div className="flex items-center gap-1 flex-1">
                <span className="text-gray-500 text-sm">R$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={payer.amount}
                  onChange={(e) => setAmount(name, e.target.value)}
                  placeholder="0,00"
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

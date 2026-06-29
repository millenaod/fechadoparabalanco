import { useState } from 'react'
import DebtCard from '../components/DebtCard'
import { computeSettlements } from '../lib/settlement'

export default function Balance({ lunches, settlements, activeUser, onPay }) {
  const [onlyMine, setOnlyMine] = useState(false)
  const [showPaid, setShowPaid] = useState(false)

  const pending = computeSettlements(lunches, settlements)
  const paid = settlements

  const filteredPending = onlyMine
    ? pending.filter((d) => d.from === activeUser || d.to === activeUser)
    : pending

  const totalPending = pending.reduce((s, d) => s + d.amount, 0)
  const totalPaid = paid.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 py-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Balanço</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Em aberto</p>
            <p className="text-lg font-bold text-red-500 mt-1">
              R$ {totalPending.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Já quitado</p>
            <p className="text-lg font-bold text-brand mt-1">
              R$ {totalPaid.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Dívidas pendentes</p>
          <button
            onClick={() => setOnlyMine((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              onlyMine ? 'bg-brand text-white border-brand' : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Só minhas
          </button>
        </div>

        {filteredPending.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-sm text-gray-500">Tudo quitado!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPending.map((debt, i) => (
              <DebtCard
                key={i}
                debt={debt}
                activeUser={activeUser}
                onPay={() => onPay(debt)}
              />
            ))}
          </div>
        )}

        {paid.length > 0 && (
          <div>
            <button
              onClick={() => setShowPaid((v) => !v)}
              className="text-sm text-gray-400 underline underline-offset-2"
            >
              {showPaid ? 'Ocultar' : 'Ver'} pagamentos quitados ({paid.length})
            </button>
            {showPaid && (
              <div className="mt-3 space-y-2">
                {paid.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 opacity-60">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold flex-shrink-0">
                      {s.from[0]}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">
                      <span className="font-semibold">{s.from}</span>
                      {' pagou '}
                      <span className="font-semibold text-brand">R$ {s.amount.toFixed(2).replace('.', ',')}</span>
                      {' para '}
                      <span className="font-semibold">{s.to}</span>
                    </p>
                    <span className="text-xs text-gray-300">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

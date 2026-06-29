import { useState } from 'react'

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function LunchCard({ lunch, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        className="w-full text-left px-4 py-4 flex items-center gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {lunch.description || 'Almoço'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">{formatDate(lunch.date)}</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-400">{lunch.attendees.length} pessoas</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-gray-900">
            R$ {lunch.total.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-brand">
            R$ {lunch.splitPerPerson.toFixed(2).replace('.', ',')} / pessoa
          </p>
        </div>
        <span className="text-gray-300 text-lg">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Presentes</p>
            <div className="flex flex-wrap gap-1">
              {lunch.attendees.map((name) => (
                <span key={name} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Pagadores</p>
            <div className="space-y-1">
              {lunch.payers.map((p) => (
                <div key={p.name} className="flex justify-between text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-medium text-gray-900">R$ {p.amount.toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Cada um devia</p>
            <div className="space-y-1">
              {lunch.attendees.map((name) => {
                const paid = lunch.payers.find((p) => p.name === name)?.amount || 0
                const diff = paid - lunch.splitPerPerson
                return (
                  <div key={name} className="flex justify-between text-sm">
                    <span className="text-gray-700">{name}</span>
                    <span className={diff >= -0.01 ? 'text-brand font-medium' : 'text-red-500 font-medium'}>
                      {diff >= -0.01 ? '+' : ''}R$ {Math.abs(diff).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center gap-1 text-xs text-red-400 mt-2"
            >
              🗑 Excluir este almoço
            </button>
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-600">Excluir este almoço?</span>
              <button
                onClick={() => onDelete(lunch.id)}
                className="text-xs font-semibold text-red-500"
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-xs text-gray-400"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function History({ lunches, onDelete }) {
  const sorted = [...lunches].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <p className="text-gray-500 text-sm">Nenhum almoço registrado ainda.</p>
        <p className="text-gray-400 text-sm mt-1">Registre o primeiro.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 py-6 space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Histórico</h2>
        {sorted.map((lunch) => (
          <LunchCard key={lunch.id} lunch={lunch} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

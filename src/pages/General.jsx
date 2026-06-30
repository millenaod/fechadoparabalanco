import { useEffect, useState } from 'react'
import { computeSettlements } from '../lib/settlement'
import { FAMILIES } from '../lib/families'
import { supabase } from '../lib/supabase'

function familyOf(name) {
  const f = FAMILIES.find((fam) => fam.members.includes(name))
  return f?.name || null
}

export default function General({ lunches, settlements, activeUser, onPay, paying }) {
  const [pixMap, setPixMap] = useState({})

  useEffect(() => {
    supabase.from('members').select('name, pix_key').not('pix_key', 'is', null)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach((r) => { if (r.pix_key) map[r.name] = r.pix_key })
          setPixMap(map)
        }
      })
  }, [])

  const pending = computeSettlements(lunches, settlements)

  const totalGasto = lunches.reduce((s, l) => s + l.total, 0)
  const totalQuitado = settlements.reduce((s, p) => s + p.amount, 0)
  const totalAberto = pending.reduce((s, d) => s + d.amount, 0)

  // Agrupa dívidas por família do devedor
  const byFamily = {}
  for (const debt of pending) {
    const key = familyOf(debt.from) || '—'
    if (!byFamily[key]) byFamily[key] = []
    byFamily[key].push(debt)
  }

  return (
    <div className="flex flex-col pb-24 px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Resumo Geral</h2>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Almoços</p>
          <p className="text-lg font-bold text-gray-800">{lunches.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Total gasto</p>
          <p className="text-base font-bold text-gray-800">
            R${totalGasto.toFixed(0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Quitado</p>
          <p className="text-base font-bold text-brand">
            R${totalQuitado.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Dívidas em aberto agrupadas por família */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Dívidas pendentes</p>
          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
            R$ {totalAberto.toFixed(2).replace('.', ',')} em aberto
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-sm text-gray-400">Tudo quitado!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byFamily).map(([familia, debts]) => (
              <div key={familia} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{familia}</p>
                  <p className="text-xs font-bold text-red-400">
                    R$ {debts.reduce((s, d) => s + d.amount, 0).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {debts.map((debt, i) => {
                    const isMe = debt.from === activeUser || debt.to === activeUser
                    const isCreditor = debt.to === activeUser
                    return (
                      <div key={i} className={`px-4 py-3 flex items-center gap-3 ${isMe ? 'bg-brand-light/30' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                          {debt.from[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">{debt.from}</span>
                            <span className="text-gray-400"> → </span>
                            <span className="font-semibold">{debt.to}</span>
                          </p>
                          {pixMap[debt.to] && (
                          <p className="text-xs text-brand mt-0.5">
                            Pix: <span className="font-medium">{pixMap[debt.to]}</span>
                          </p>
                        )}
                        </div>
                        <p className="text-sm font-bold text-red-500 flex-shrink-0">
                          R$ {debt.amount.toFixed(2).replace('.', ',')}
                        </p>
                        {isMe && onPay && (
                          <button
                            onClick={() => onPay(debt)}
                            disabled={paying}
                            className={`flex-shrink-0 min-h-[48px] px-4 text-sm font-bold rounded-xl transition-opacity ${
                              isCreditor ? 'bg-brand text-white' : 'bg-white text-brand border-2 border-brand'
                            } ${paying ? 'opacity-50' : ''}`}
                          >
                            {paying ? '...' : isCreditor ? 'Recebi' : 'Paguei'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de quitados */}
      {settlements.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Já quitados ✓</p>
          <div className="space-y-1">
            {settlements.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-2 opacity-60">
                <span className="text-xs text-gray-600 flex-1">
                  <span className="font-semibold">{s.from}</span>
                  {' pagou R$ '}
                  <span className="font-semibold text-brand">{s.amount.toFixed(2).replace('.', ',')}</span>
                  {' para '}
                  <span className="font-semibold">{s.to}</span>
                </span>
                <span className="text-brand text-xs">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

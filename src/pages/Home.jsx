import { useNavigate } from 'react-router-dom'
import { computeSettlements } from '../lib/settlement'

function sourceLunch(from, to, lunches) {
  return [...lunches]
    .sort((a, b) => b.date.localeCompare(a.date))
    .find((l) => l.attendees.includes(from) && l.attendees.includes(to))
}

function fmtDate(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

export default function Home({ activeUser, lunches, settlements, readOnly }) {
  const navigate = useNavigate()

  const pending = computeSettlements(lunches, settlements)

  const iOwe = pending.filter((d) => d.from === activeUser)
  const theyOweMe = pending.filter((d) => d.to === activeUser)

  const totalIOwe = iOwe.reduce((s, d) => s + d.amount, 0)
  const totalOwedToMe = theyOweMe.reduce((s, d) => s + d.amount, 0)
  const balance = totalOwedToMe - totalIOwe

  return (
    <div className="flex flex-col pb-28 px-4 py-6 space-y-6">
      {/* Saudação */}
      <div>
        <p className="text-gray-400 text-sm">Olá,</p>
        <h2 className="text-2xl font-bold text-gray-900">{activeUser} 👋</h2>
      </div>

      {/* Resumo financeiro */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Seu saldo</p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-50">
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-1">Você deve</p>
            <p className={`text-lg font-bold ${totalIOwe > 0 ? 'text-red-500' : 'text-gray-300'}`}>
              R$ {totalIOwe.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-1">Te devem</p>
            <p className={`text-lg font-bold ${totalOwedToMe > 0 ? 'text-brand' : 'text-gray-300'}`}>
              R$ {totalOwedToMe.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        <div className={`px-4 py-3 border-t border-gray-50 flex items-center justify-between ${balance >= 0 ? 'bg-brand-light' : 'bg-red-50'}`}>
          <p className="text-sm font-medium text-gray-600">Saldo líquido</p>
          <p className={`text-base font-bold ${balance >= 0 ? 'text-brand' : 'text-red-500'}`}>
            {balance >= 0 ? '+' : ''}R$ {Math.abs(balance).toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Dívidas pendentes do usuário */}
      {iOwe.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Você deve</p>
          {iOwe.map((d, i) => {
            const lunch = sourceLunch(d.from, d.to, lunches)
            return (
              <div key={i} className="bg-white rounded-2xl border border-red-100 px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-700">para <span className="font-semibold">{d.to}</span></p>
                  {lunch && (
                    <p className="text-xs text-gray-400 mt-0.5">{lunch.description || 'Almoço'} · {fmtDate(lunch.date)}</p>
                  )}
                </div>
                <p className="text-sm font-bold text-red-500 flex-shrink-0">R$ {d.amount.toFixed(2).replace('.', ',')}</p>
              </div>
            )
          })}
        </div>
      )}

      {theyOweMe.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Te devem</p>
          {theyOweMe.map((d, i) => {
            const lunch = sourceLunch(d.from, d.to, lunches)
            return (
              <div key={i} className="bg-white rounded-2xl border border-brand/20 px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 font-semibold">{d.from}</p>
                  {lunch && (
                    <p className="text-xs text-gray-400 mt-0.5">{lunch.description || 'Almoço'} · {fmtDate(lunch.date)}</p>
                  )}
                </div>
                <p className="text-sm font-bold text-brand flex-shrink-0">R$ {d.amount.toFixed(2).replace('.', ',')}</p>
              </div>
            )
          })}
        </div>
      )}

      {iOwe.length === 0 && theyOweMe.length === 0 && (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm text-gray-400">Tudo quitado por aqui!</p>
        </div>
      )}

      {!readOnly && (
        <button
          onClick={() => navigate('/novo')}
          className="w-full h-14 bg-brand text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-sm"
        >
          <span className="text-xl">+</span>
          Adicionar almoço
        </button>
      )}
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin({ settlements, lunches, onDeleteSettlement, onDeleteLunch }) {
  const [confirmId, setConfirmId] = useState(null)
  const [tab, setTab] = useState('settlements')

  async function confirmDelete() {
    if (!confirmId) return
    if (tab === 'settlements') {
      await onDeleteSettlement(confirmId)
    } else {
      await onDeleteLunch(confirmId)
    }
    setConfirmId(null)
  }

  return (
    <div className="px-4 py-6 pb-24 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Painel Admin</h2>
        <p className="text-xs text-gray-400 mt-1">Gerencie pagamentos e almoços registrados</p>
      </div>

      <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
        {['settlements', 'lunches'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setConfirmId(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? 'bg-white text-brand shadow-sm' : 'text-gray-500'
            }`}
          >
            {t === 'settlements' ? `Pagamentos (${settlements.length})` : `Almoços (${lunches.length})`}
          </button>
        ))}
      </div>

      {tab === 'settlements' && (
        <div className="space-y-2">
          {settlements.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhum pagamento registrado</p>
          ) : (
            settlements.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{s.from}</span>
                    <span className="text-gray-400"> → </span>
                    <span className="font-semibold">{s.to}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    R$ {s.amount.toFixed(2).replace('.', ',')} · {new Date(s.paidAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {confirmId === s.id ? (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={confirmDelete}
                      className="min-h-[44px] px-3 bg-red-500 text-white text-sm font-bold rounded-xl"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="min-h-[44px] px-3 border border-gray-200 text-gray-600 text-sm rounded-xl"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(s.id)}
                    className="min-h-[44px] px-3 border border-red-200 text-red-500 text-sm font-semibold rounded-xl flex-shrink-0"
                  >
                    Excluir
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'lunches' && (
        <div className="space-y-2">
          {lunches.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhum almoço registrado</p>
          ) : (
            lunches.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{l.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(l.date + 'T12:00:00').toLocaleDateString('pt-BR')} · R$ {l.total.toFixed(2).replace('.', ',')} · {l.attendees.length} pessoas
                  </p>
                </div>
                {confirmId === l.id ? (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={confirmDelete}
                      className="min-h-[44px] px-3 bg-red-500 text-white text-sm font-bold rounded-xl"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="min-h-[44px] px-3 border border-gray-200 text-gray-600 text-sm rounded-xl"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(l.id)}
                    className="min-h-[44px] px-3 border border-red-200 text-red-500 text-sm font-semibold rounded-xl flex-shrink-0"
                  >
                    Excluir
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

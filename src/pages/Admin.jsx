import { useState } from 'react'
import { ALL_MEMBERS } from '../lib/families'

export default function Admin({ settlements, lunches, onDeleteSettlement, onDeleteLunch, onEditSettlement, onEditLunch }) {
  const [confirmId, setConfirmId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [tab, setTab] = useState('settlements')
  const [saving, setSaving] = useState(false)

  // --- settlement edit ---
  function startEditSettlement(s) {
    setConfirmId(null)
    setEditId(s.id)
    setEditData({ type: 'settlement', from: s.from, to: s.to, amount: s.amount.toFixed(2) })
  }

  async function saveSettlementEdit() {
    if (saving) return
    const amount = parseFloat(String(editData.amount).replace(',', '.'))
    if (isNaN(amount) || amount <= 0) return
    setSaving(true)
    await onEditSettlement(editId, { from: editData.from, to: editData.to, amount })
    setSaving(false)
    setEditId(null)
  }

  // --- lunch payers edit ---
  function startEditLunch(l) {
    setConfirmId(null)
    setEditId(l.id)
    setEditData({
      type: 'lunch',
      attendeesCount: l.attendees.length,
      payers: l.payers.map((p) => ({ name: p.name, amount: p.amount.toFixed(2) })),
    })
  }

  function updatePayer(i, field, value) {
    setEditData((d) => {
      const payers = [...d.payers]
      payers[i] = { ...payers[i], [field]: value }
      return { ...d, payers }
    })
  }

  function addPayer() {
    setEditData((d) => ({ ...d, payers: [...d.payers, { name: ALL_MEMBERS[0], amount: '' }] }))
  }

  function removePayer(i) {
    setEditData((d) => ({ ...d, payers: d.payers.filter((_, idx) => idx !== i) }))
  }

  async function saveLunchEdit() {
    if (saving) return
    const payers = editData.payers
      .map((p) => ({ name: p.name, amount: parseFloat(String(p.amount).replace(',', '.')) }))
      .filter((p) => !isNaN(p.amount) && p.amount > 0)
    if (payers.length === 0) return
    const total = Math.round(payers.reduce((s, p) => s + p.amount, 0) * 100) / 100
    const splitPerPerson = Math.round((total / editData.attendeesCount) * 100) / 100
    setSaving(true)
    await onEditLunch(editId, { payers, total, splitPerPerson })
    setSaving(false)
    setEditId(null)
  }

  async function confirmDelete() {
    if (!confirmId) return
    if (tab === 'settlements') await onDeleteSettlement(confirmId)
    else await onDeleteLunch(confirmId)
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
            onClick={() => { setTab(t); setConfirmId(null); setEditId(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? 'bg-white text-brand shadow-sm' : 'text-gray-500'
            }`}
          >
            {t === 'settlements' ? `Pagamentos (${settlements.length})` : `Almoços (${lunches.length})`}
          </button>
        ))}
      </div>

      {/* ---- SETTLEMENTS ---- */}
      {tab === 'settlements' && (
        <div className="space-y-2">
          {settlements.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhum pagamento registrado</p>
          ) : (
            settlements.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {editId === s.id ? (
                  <div className="px-4 py-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Editar pagamento</p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">De</label>
                        <select value={editData.from} onChange={(e) => setEditData((d) => ({ ...d, from: e.target.value }))}
                          className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                          {ALL_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Para</label>
                        <select value={editData.to} onChange={(e) => setEditData((d) => ({ ...d, to: e.target.value }))}
                          className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                          {ALL_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Valor (R$)</label>
                        <input type="number" inputMode="decimal" step="0.01" min="0"
                          value={editData.amount}
                          onChange={(e) => setEditData((d) => ({ ...d, amount: e.target.value }))}
                          className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveSettlementEdit} disabled={saving}
                        className={`flex-1 h-11 bg-brand text-white text-sm font-bold rounded-xl ${saving ? 'opacity-50' : ''}`}>
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="flex-1 h-11 border border-gray-200 text-gray-600 text-sm rounded-xl">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 flex items-center gap-3">
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
                        <button onClick={confirmDelete} className="min-h-[44px] px-3 bg-red-500 text-white text-sm font-bold rounded-xl">Confirmar</button>
                        <button onClick={() => setConfirmId(null)} className="min-h-[44px] px-3 border border-gray-200 text-gray-600 text-sm rounded-xl">Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEditSettlement(s)} className="min-h-[44px] px-3 border border-brand/40 text-brand text-sm font-semibold rounded-xl">Editar</button>
                        <button onClick={() => setConfirmId(s.id)} className="min-h-[44px] px-3 border border-red-200 text-red-500 text-sm font-semibold rounded-xl">Excluir</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- LUNCHES ---- */}
      {tab === 'lunches' && (
        <div className="space-y-2">
          {lunches.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhum almoço registrado</p>
          ) : (
            lunches.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {editId === l.id ? (
                  <div className="px-4 py-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Quem pagou — {l.description}
                    </p>
                    <div className="space-y-2">
                      {editData.payers?.map((p, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <select
                            value={p.name}
                            onChange={(e) => updatePayer(i, 'name', e.target.value)}
                            className="flex-1 h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          >
                            {ALL_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            placeholder="R$"
                            value={p.amount}
                            onChange={(e) => updatePayer(i, 'amount', e.target.value)}
                            className="w-24 h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                          <button
                            onClick={() => removePayer(i)}
                            className="w-11 h-11 flex items-center justify-center text-red-400 border border-red-100 rounded-xl flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addPayer}
                        className="w-full h-10 border border-dashed border-gray-300 text-gray-400 text-sm rounded-xl"
                      >
                        + Adicionar pagador
                      </button>
                      {editData.payers?.length > 0 && (
                        <p className="text-xs text-gray-400 text-right">
                          Total: R$ {editData.payers.reduce((s, p) => s + (parseFloat(String(p.amount).replace(',', '.')) || 0), 0).toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveLunchEdit} disabled={saving}
                        className={`flex-1 h-11 bg-brand text-white text-sm font-bold rounded-xl ${saving ? 'opacity-50' : ''}`}>
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="flex-1 h-11 border border-gray-200 text-gray-600 text-sm rounded-xl">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{l.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(l.date + 'T12:00:00').toLocaleDateString('pt-BR')} · R$ {l.total.toFixed(2).replace('.', ',')} · {l.attendees.length} pessoas
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Pago por: {l.payers.map((p) => p.name).join(', ')}
                      </p>
                    </div>
                    {confirmId === l.id ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={confirmDelete} className="min-h-[44px] px-3 bg-red-500 text-white text-sm font-bold rounded-xl">Confirmar</button>
                        <button onClick={() => setConfirmId(null)} className="min-h-[44px] px-3 border border-gray-200 text-gray-600 text-sm rounded-xl">Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEditLunch(l)} className="min-h-[44px] px-3 border border-brand/40 text-brand text-sm font-semibold rounded-xl">Editar</button>
                        <button onClick={() => setConfirmId(l.id)} className="min-h-[44px] px-3 border border-red-200 text-red-500 text-sm font-semibold rounded-xl">Excluir</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

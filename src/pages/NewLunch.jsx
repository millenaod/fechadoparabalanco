import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAMILIES } from '../lib/families'
import MemberSelect from '../components/MemberSelect'
import PayerInput from '../components/PayerInput'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function NewLunch({ members, activeUser, onSave, hasPending }) {
  const navigate = useNavigate()
  const [date, setDate] = useState(today())
  const [description, setDescription] = useState('')
  const [attendees, setAttendees] = useState([activeUser])
  const [payers, setPayers] = useState([])
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const total = payers.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

  // Build family groups filtered to current members
  const families = FAMILIES.map((f) => ({
    ...f,
    members: f.members.filter((m) => members.includes(m)),
  })).filter((f) => f.members.length > 0)

  // Extra members not in predefined families
  const knownSet = new Set(FAMILIES.flatMap((f) => f.members))
  const extra = members.filter((m) => !knownSet.has(m))
  if (extra.length > 0) families.push({ name: 'Outros', members: extra })

  function handleAttendeeChange(newAttendees) {
    setAttendees(newAttendees)
    setPayers((prev) => prev.filter((p) => newAttendees.includes(p.name)))
  }

  function validate() {
    if (attendees.length < 2) return 'Selecione ao menos 2 pessoas.'
    if (payers.length === 0) return 'Selecione quem pagou.'
    if (total <= 0) return 'Informe os valores pagos.'
    if (payers.some((p) => !parseFloat(p.amount))) return 'Preencha o valor de cada pagador.'
    return null
  }

  function handleSave() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')

    const lunch = {
      id: crypto.randomUUID(),
      date,
      description,
      attendees,
      payers: payers.map((p) => ({ name: p.name, amount: parseFloat(p.amount) })),
      total,
      splitPerPerson: total / attendees.length,
      createdAt: new Date().toISOString(),
    }

    onSave(lunch)
    setToast('Almoço registrado!')
    setTimeout(() => {
      setToast('')
      navigate('/historico')
    }, 1200)
  }

  return (
    <div className="flex flex-col pb-24">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-brand text-white text-sm px-5 py-3 rounded-2xl shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="px-4 py-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Novo almoço</h2>

        {hasPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
            <p className="text-sm text-yellow-800 font-medium">Ainda há dívidas em aberto do evento anterior.</p>
            <p className="text-xs text-yellow-600 mt-0.5">Recomendamos quitar antes de registrar um novo almoço.</p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              inputMode="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Casa da vó"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Quem estava?</label>
              {attendees.length > 0 && (
                <span className="text-xs text-brand font-semibold">{attendees.length} selecionados</span>
              )}
            </div>
            <MemberSelect families={families} selected={attendees} onChange={handleAttendeeChange} />
          </div>

          {attendees.length >= 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quem pagou?</label>
              <PayerInput attendees={attendees} payers={payers} onChange={setPayers} />
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between bg-brand-light rounded-2xl px-4 py-3">
              <div>
                <p className="text-xs text-brand-dark">Total</p>
                {attendees.length > 0 && (
                  <p className="text-xs text-brand mt-0.5">
                    R$ {(total / attendees.length).toFixed(2).replace('.', ',')} por pessoa
                  </p>
                )}
              </div>
              <span className="text-xl font-bold text-brand">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full h-12 bg-brand text-white rounded-xl font-semibold text-sm"
        >
          Salvar
        </button>
      </div>
    </div>
  )
}

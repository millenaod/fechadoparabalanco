import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MemberSelect from '../components/MemberSelect'
import PayerInput from '../components/PayerInput'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function NewLunch({ members, activeUser, onSave }) {
  const navigate = useNavigate()
  const [date, setDate] = useState(today())
  const [description, setDescription] = useState('')
  const [attendees, setAttendees] = useState([activeUser])
  const [payers, setPayers] = useState([])
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const total = payers.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

  function handleAttendeeChange(newAttendees) {
    setAttendees(newAttendees)
    setPayers((prev) => prev.filter((p) => newAttendees.includes(p.name)))
  }

  function validate() {
    if (attendees.length < 2) return 'Selecione ao menos 2 pessoas.'
    if (payers.length === 0) return 'Selecione quem pagou.'
    if (total <= 0) return 'Informe os valores pagos.'
    const hasEmpty = payers.some((p) => !parseFloat(p.amount))
    if (hasEmpty) return 'Preencha o valor de cada pagador.'
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

        <div className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição <span className="text-gray-400 font-normal">(opcional)</span></label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Quem estava?</label>
            <MemberSelect members={members} selected={attendees} onChange={handleAttendeeChange} />
          </div>

          {attendees.length >= 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quem pagou?</label>
              <PayerInput attendees={attendees} payers={payers} onChange={setPayers} />
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between bg-brand-light rounded-2xl px-4 py-3">
              <span className="text-sm font-medium text-brand-dark">Total</span>
              <span className="text-lg font-bold text-brand">
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

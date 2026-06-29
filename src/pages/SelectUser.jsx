import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAMILIES } from '../lib/families'

export default function SelectUser({ members, onSelect, onAddMember, consultaKey }) {
  const [newName, setNewName] = useState('')
  const [open, setOpen] = useState({})
  const navigate = useNavigate()

  function handleSelect(name) {
    onSelect(name)
    navigate('/')
  }

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed || members.includes(trimmed)) return
    onAddMember(trimmed)
    setNewName('')
  }

  function toggleFamily(name) {
    setOpen((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="flex flex-col min-h-svh bg-gray-50">
      <div className="flex-1 px-5 py-10 space-y-6 max-w-sm mx-auto w-full">
        <div className="text-center">
          <img src="/logo.svg" alt="Rachaí" className="w-28 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Quem é você?</h1>
          <p className="mt-1 text-sm text-gray-400">Toque no seu nome para entrar</p>
        </div>

        <div className="space-y-2">
          {FAMILIES.map((family, i) => {
            const key = family.name || `solo-${i}`
            const isOpen = open[key]

            if (!family.name) {
              return (
                <div key={key} className="flex flex-wrap gap-2 py-1">
                  {family.members.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSelect(name)}
                      className="h-11 px-5 rounded-2xl bg-white border border-gray-200 text-gray-800 font-medium text-sm shadow-sm active:bg-brand-light active:border-brand transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )
            }

            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleFamily(key)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-gray-700">{family.name}</span>
                  <span className="text-gray-300 text-sm">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-gray-50 pt-3">
                    {family.members.map((name) => (
                      <button
                        key={name}
                        onClick={() => handleSelect(name)}
                        className="h-11 px-5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 font-medium text-sm active:bg-brand-light active:border-brand transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={() => onSelect(consultaKey)}
          className="w-full py-3 text-sm text-gray-400 underline underline-offset-2"
        >
          👁️ Só quero consultar
        </button>

        <form onSubmit={handleAdd} className="space-y-2 pt-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Adicionar pessoa</p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome"
              className="flex-1 h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              className="h-12 px-5 bg-brand text-white rounded-xl text-sm font-semibold"
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

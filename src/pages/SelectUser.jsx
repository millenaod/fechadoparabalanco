import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SelectUser({ members, activeUser, onSelect, onAddMember }) {
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()

  function handleSelect(name) {
    onSelect(name)
    navigate('/novo')
  }

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed || members.includes(trimmed)) return
    onAddMember(trimmed)
    setNewName('')
  }

  return (
    <div className="flex flex-col min-h-svh bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="text-5xl mb-4">🍽️</div>
            <h1 className="text-2xl font-bold text-gray-900">Quem é você?</h1>
            <p className="mt-2 text-sm text-gray-500">Selecione seu nome para continuar</p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {members.map((name) => (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                className="h-12 px-6 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 font-medium text-sm shadow-sm active:bg-brand-light active:border-brand transition-colors"
              >
                {name}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="space-y-3">
            <p className="text-xs text-gray-400 text-center uppercase tracking-wide">Adicionar pessoa</p>
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
    </div>
  )
}

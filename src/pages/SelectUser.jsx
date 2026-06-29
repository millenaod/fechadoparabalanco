import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAMILIES } from '../lib/families'

const KNOWN_MEMBERS = new Set(FAMILIES.flatMap((f) => f.members))

export default function SelectUser({ members, onSelect, onAddMember }) {
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

  const extraMembers = members.filter((m) => !KNOWN_MEMBERS.has(m))
  const allFamilies = [
    ...FAMILIES,
    ...(extraMembers.length > 0 ? [{ name: 'Outros', members: extraMembers }] : []),
  ]

  return (
    <div className="flex flex-col min-h-svh bg-gray-50">
      <div className="flex-1 px-5 py-10 space-y-8 max-w-sm mx-auto w-full">
        <div className="text-center">
          <img src="/logo.svg" alt="Rachaí" className="w-28 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Quem é você?</h1>
          <p className="mt-1 text-sm text-gray-400">Toque no seu nome para entrar</p>
        </div>

        <div className="space-y-5">
          {allFamilies.map((family, i) => (
            <div key={i}>
              {family.name && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {family.name}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
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
            </div>
          ))}
        </div>

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

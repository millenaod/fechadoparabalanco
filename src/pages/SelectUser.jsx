import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAMILIES, ADMIN_USER } from '../lib/families'

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

  // Build family groups from current members, preserving order
  const knownSet = new Set(FAMILIES.flatMap((f) => f.members))
  const extraMembers = members.filter((m) => !knownSet.has(m))
  const allFamilies = [
    ...FAMILIES.map((f) => ({
      ...f,
      members: f.members.filter((m) => members.includes(m)),
    })).filter((f) => f.members.length > 0),
    ...(extraMembers.length > 0 ? [{ name: 'Outros', members: extraMembers }] : []),
  ]

  return (
    <div className="flex flex-col min-h-svh bg-gray-50">
      <div className="flex-1 px-5 py-10 space-y-8 max-w-sm mx-auto w-full">
        <div className="text-center">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-900">Quem é você?</h1>
          <p className="mt-1 text-sm text-gray-400">Toque no seu nome para entrar</p>
        </div>

        {/* Admin destaque */}
        <button
          onClick={() => handleSelect(ADMIN_USER)}
          className="w-full h-14 bg-brand text-white rounded-2xl font-bold text-base shadow-sm flex items-center justify-center gap-2"
        >
          <span>👑</span>
          {ADMIN_USER}
        </button>

        <div className="space-y-5">
          {allFamilies
            .map((family) => ({
              ...family,
              members: family.members.filter((m) => m !== ADMIN_USER),
            }))
            .filter((f) => f.members.length > 0)
            .map((family, i) => (
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

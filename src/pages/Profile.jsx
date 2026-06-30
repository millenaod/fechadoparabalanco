import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ADMIN_USER } from '../lib/families'

export default function Profile({ activeUser }) {
  const navigate = useNavigate()
  const [pixKey, setPixKey] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const isAdmin = activeUser === ADMIN_USER

  useEffect(() => {
    supabase.from('members').select('pix_key').eq('name', activeUser).single()
      .then(({ data }) => {
        if (data?.pix_key) setPixKey(data.pix_key)
        setLoading(false)
      })
  }, [activeUser])

  async function handleSave(e) {
    e.preventDefault()
    const trimmed = draft.trim()
    await supabase.from('members').update({ pix_key: trimmed }).eq('name', activeUser)
    setPixKey(trimmed)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function startEdit() {
    setDraft(pixKey)
    setEditing(true)
  }

  if (loading) return null

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Meu perfil</h2>
        <p className="text-sm text-gray-400 mt-1">{activeUser}</p>
      </div>

      {/* Pix */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Minha chave Pix</p>
        <p className="text-xs text-gray-400">
          Quem te deve usa essa chave para te pagar. Sem ela, precisam te procurar pessoalmente.
        </p>

        {!editing ? (
          pixKey ? (
            <div className="bg-brand-light border border-brand/20 rounded-2xl px-4 py-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-brand text-lg">✓</span>
                <p className="text-sm font-semibold text-brand">Chave cadastrada</p>
              </div>
              <p className="text-base font-bold text-gray-900 break-all">{pixKey}</p>
              <button
                onClick={startEdit}
                className="text-sm text-brand underline underline-offset-2"
              >
                Alterar chave
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-lg">!</span>
                <p className="text-sm font-semibold text-yellow-800">Nenhuma chave cadastrada</p>
              </div>
              <p className="text-xs text-yellow-700">
                Sem a chave Pix, as pessoas não sabem como te pagar.
              </p>
              <button
                onClick={startEdit}
                className="w-full h-12 bg-brand text-white rounded-xl font-semibold text-sm"
              >
                Cadastrar chave Pix
              </button>
            </div>
          )
        ) : (
          <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm text-gray-600">Digite sua chave (CPF, e-mail, telefone ou chave aleatória):</p>
            <input
              type="text"
              inputMode="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ex: 123.456.789-00"
              autoFocus
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 h-12 border border-gray-200 text-gray-500 rounded-xl font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 h-12 bg-brand text-white rounded-xl font-semibold text-sm"
              >
                {saved ? 'Salvo ✓' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>

      {isAdmin && (
        <button
          onClick={() => navigate('/admin')}
          className="w-full h-12 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
        >
          ⚙️ Painel Admin
        </button>
      )}
    </div>
  )
}

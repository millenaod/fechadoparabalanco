import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ADMIN_USER } from '../lib/families'

export default function Profile({ activeUser }) {
  const navigate = useNavigate()
  const [pixKey, setPixKey] = useState('')
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
    await supabase.from('members').update({ pix_key: pixKey.trim() }).eq('name', activeUser)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return null

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Meu perfil</h2>
        <p className="text-sm text-gray-400 mt-1">{activeUser}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Minha chave Pix</p>
          <p className="text-xs text-gray-400 mb-3">
            Cadastre sua chave para as pessoas saberem para onde te pagar.
          </p>
          <form onSubmit={handleSave} className="space-y-3">
            <input
              type="text"
              inputMode="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              className="w-full h-12 bg-brand text-white rounded-xl font-semibold text-sm"
            >
              {saved ? 'Salvo ✓' : 'Salvar chave Pix'}
            </button>
          </form>
        </div>
      </div>

      <p className="text-xs text-gray-300 text-center">
        Sua chave Pix fica visível para toda a família quando alguém precisar te pagar.
      </p>

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

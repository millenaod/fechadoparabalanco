import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ADMIN_USER, FAMILIES } from '../lib/families'

function formatDate(iso) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function familyOf(name) {
  return FAMILIES.find((f) => f.name && f.members.includes(name)) || null
}

function PaymentItem({ s, activeUser }) {
  const isIPaid    = s.from === activeUser
  const isIReceived = s.to === activeUser

  let label, tag, tagColor

  if (isIPaid) {
    label = <>Você pagou para <strong>{s.to}</strong></>
    tag = 'Você pagou'
    tagColor = 'bg-red-50 text-red-500'
  } else if (isIReceived) {
    label = <><strong>{s.from}</strong> te pagou</>
    tag = 'Você recebeu'
    tagColor = 'bg-brand-light text-brand'
  } else {
    const fromFam = familyOf(s.from)
    if (fromFam) {
      label = <><strong>{s.from}</strong> pagou para <strong>{s.to}</strong></>
    } else {
      label = <><strong>{s.from}</strong> pagou para <strong>{s.to}</strong></>
    }
    tag = 'Sua família pagou'
    tagColor = 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor}`}>{tag}</span>
          <span className="text-xs text-gray-400">{formatDate(s.paidAt)}</span>
        </div>
      </div>
      <p className="text-sm font-bold text-gray-700 flex-shrink-0">
        R$ {s.amount.toFixed(2).replace('.', ',')}
      </p>
    </div>
  )
}

export default function Profile({ activeUser, settlements = [] }) {
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

  const myFamily = familyOf(activeUser)
  const familyMembers = myFamily?.members || []

  const mySettlements = settlements
    .filter((s) =>
      s.from === activeUser ||
      s.to === activeUser ||
      familyMembers.includes(s.from) ||
      familyMembers.includes(s.to)
    )
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))

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

      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">O que já foi pago</h3>
        {mySettlements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-6 text-center">
            <p className="text-sm text-gray-400">Nenhum pagamento registrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mySettlements.map((s) => (
              <PaymentItem key={s.id} s={s} activeUser={activeUser} />
            ))}
          </div>
        )}
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

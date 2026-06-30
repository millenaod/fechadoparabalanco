import { useState, useEffect } from 'react'
import { computeSettlements } from '../lib/settlement'
import { FAMILIES } from '../lib/families'
import { supabase } from '../lib/supabase'

function sourceLunch(from, to, lunches) {
  return [...lunches]
    .sort((a, b) => b.date.localeCompare(a.date))
    .find((l) => l.attendees.includes(from) && l.attendees.includes(to))
}

function fmtDate(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

function familyOf(name) {
  const f = FAMILIES.find((fam) => fam.name && fam.members.includes(name))
  return f?.name || null
}

function myFamily(activeUser) {
  return familyOf(activeUser)
}

// Agrega dívidas individuais em dívidas entre famílias
function aggregateByFamily(pending) {
  const map = {}
  for (const debt of pending) {
    const fromFam = familyOf(debt.from) || debt.from
    const toFam   = familyOf(debt.to)   || debt.to
    if (fromFam === toFam) continue // intra-família já foi abatido pelo algoritmo
    const key = `${fromFam}|||${toFam}`
    if (!map[key]) map[key] = { fromFam, toFam, amount: 0, debts: [] }
    map[key].amount += debt.amount
    map[key].debts.push(debt)
  }
  return Object.values(map).map((g) => ({
    ...g,
    amount: Math.round(g.amount * 100) / 100,
  }))
}

export default function Balance({ lunches, settlements, activeUser, onPay, paying }) {
  const [showPaid, setShowPaid] = useState(false)
  const [pixMap, setPixMap] = useState({})

  useEffect(() => {
    supabase.from('members').select('name, pix_key').not('pix_key', 'is', null)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach((r) => { if (r.pix_key) map[r.name] = r.pix_key })
          setPixMap(map)
        }
      })
  }, [])

  const pending  = computeSettlements(lunches, settlements)
  const paid     = settlements
  const myFam    = myFamily(activeUser)

  const groups   = aggregateByFamily(pending)

  // Filtra só os grupos que envolvem minha família
  const myGroups = myFam
    ? groups.filter((g) => g.fromFam === myFam || g.toFam === myFam)
    : groups

  const weOwe    = myGroups.filter((g) => g.fromFam === myFam)
  const owedToUs = myGroups.filter((g) => g.toFam   === myFam)

  const totalAberto = pending.reduce((s, d) => s + d.amount, 0)
  const totalPago   = paid.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 py-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Balanço</h2>
          {myFam && <p className="text-sm text-gray-400 mt-0.5">{myFam}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm text-gray-400">Em aberto</p>
            <p className="text-lg font-bold text-red-500 mt-1">
              R$ {totalAberto.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm text-gray-400">Já quitado</p>
            <p className="text-lg font-bold text-brand mt-1">
              R$ {totalPago.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {myGroups.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-base text-gray-500">Tudo quitado!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {owedToUs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-brand">Devem para vocês</p>
                {owedToUs.map((g, i) => (
                  <FamilyDebtCard key={i} group={g} activeUser={activeUser} myFam={myFam} onPay={onPay} paying={paying} pixMap={pixMap} isCredit lunches={lunches} />
                ))}
              </div>
            )}

            {weOwe.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-red-500">Vocês devem</p>
                {weOwe.map((g, i) => (
                  <FamilyDebtCard key={i} group={g} activeUser={activeUser} myFam={myFam} onPay={onPay} paying={paying} pixMap={pixMap} isCredit={false} lunches={lunches} />
                ))}
              </div>
            )}
          </div>
        )}

        {paid.length > 0 && (
          <div>
            <button
              onClick={() => setShowPaid((v) => !v)}
              className="text-sm text-gray-400 underline underline-offset-2"
            >
              {showPaid ? 'Ocultar' : 'Ver'} pagamentos quitados ({paid.length})
            </button>
            {showPaid && (
              <div className="mt-3 space-y-2">
                {paid.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 opacity-60">
                    <p className="text-sm text-gray-700 flex-1">
                      <span className="font-semibold">{s.from}</span>
                      {' pagou '}
                      <span className="font-semibold text-brand">R$ {s.amount.toFixed(2).replace('.', ',')}</span>
                      {' para '}
                      <span className="font-semibold">{s.to}</span>
                    </p>
                    <span className="text-brand text-sm">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PixPanel({ pixKey, onConfirm, paying }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(pixKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mt-2 bg-brand-light border border-brand/20 rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-brand">Chave Pix para pagamento:</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-gray-900 break-all flex-1">{pixKey}</p>
        <button
          onClick={copy}
          className="flex-shrink-0 h-10 px-3 bg-brand text-white text-xs font-bold rounded-xl"
        >
          {copied ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>
      <button
        onClick={onConfirm}
        disabled={paying}
        className={`w-full h-11 border-2 border-brand text-brand text-sm font-bold rounded-xl ${paying ? 'opacity-50' : ''}`}
      >
        {paying ? '...' : 'Já transferi ✓'}
      </button>
    </div>
  )
}

function FamilyDebtCard({ group, activeUser, myFam, onPay, paying, pixMap = {}, isCredit, lunches = [] }) {
  const [expanded, setExpanded] = useState(false)
  const [showPixFor, setShowPixFor] = useState(null)

  const otherFam = isCredit ? group.fromFam : group.toFam
  const canPay   = onPay && group.debts.some(
    (d) => d.from === activeUser || d.to === activeUser
  )

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${isCredit ? 'border-brand/30' : 'border-red-200'}`}>
      <div className="px-4 py-4 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${isCredit ? 'bg-brand-light text-brand' : 'bg-red-50 text-red-500'}`}>
          {otherFam[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900">{otherFam}</p>
          <p className="text-sm text-gray-500">
            {isCredit ? 'deve para vocês' : 'vocês devem'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-lg font-bold ${isCredit ? 'text-brand' : 'text-red-500'}`}>
            R$ {group.amount.toFixed(2).replace('.', ',')}
          </p>
          <button onClick={() => setExpanded(v => !v)} className="text-xs text-gray-400 mt-0.5">
            {expanded ? 'menos ▲' : 'detalhes ▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-3 pt-2 space-y-2">
          {group.debts.map((debt, i) => {
            const isMe = debt.from === activeUser || debt.to === activeUser
            return (
              <div key={i} className={`py-1.5 ${isMe ? 'font-semibold' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">{debt.from} → {debt.to}</p>
                    {(() => { const l = sourceLunch(debt.from, debt.to, lunches); return l ? <p className="text-xs text-gray-400 mt-0.5">{l.description || 'Almoço'} · {fmtDate(l.date)}</p> : null })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800">R$ {debt.amount.toFixed(2).replace('.', ',')}</p>
                    {isMe && onPay && (
                      debt.to === activeUser ? (
                        <button
                          onClick={() => onPay(debt)}
                          disabled={paying}
                          className={`min-h-[44px] px-3 text-sm font-bold rounded-xl bg-brand text-white transition-opacity ${paying ? 'opacity-50' : ''}`}
                        >
                          {paying ? '...' : 'Recebi'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowPixFor(showPixFor === i ? null : i)}
                          className="min-h-[44px] px-3 text-sm font-bold rounded-xl bg-white text-brand border-2 border-brand"
                        >
                          Pagar
                        </button>
                      )
                    )}
                  </div>
                </div>
                {isMe && debt.from === activeUser && showPixFor === i && (
                  pixMap[debt.to] ? (
                    <PixPanel
                      pixKey={pixMap[debt.to]}
                      onConfirm={() => { setShowPixFor(null); onPay(debt) }}
                      paying={paying}
                    />
                  ) : (
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                      <p className="text-xs text-gray-500">{debt.to} ainda não cadastrou a chave Pix.</p>
                      <button
                        onClick={() => { setShowPixFor(null); onPay(debt) }}
                        disabled={paying}
                        className={`w-full h-11 border-2 border-brand text-brand text-sm font-bold rounded-xl ${paying ? 'opacity-50' : ''}`}
                      >
                        {paying ? '...' : 'Já acertei pessoalmente ✓'}
                      </button>
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

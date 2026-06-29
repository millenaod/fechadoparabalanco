export default function DebtCard({ debt, activeUser, onPay }) {
  const isDebtor   = debt.from === activeUser   // eu devo
  const isCreditor = debt.to   === activeUser   // me devem
  const isInvolved = isDebtor || isCreditor

  const btnLabel = isCreditor ? 'Recebi ✓' : 'Paguei ✓'
  const btnStyle = isCreditor
    ? 'bg-brand text-white'
    : 'bg-white text-brand border border-brand'

  return (
    <div className={`bg-white rounded-2xl border p-4 flex items-center gap-3 ${isInvolved ? 'border-brand/40' : 'border-gray-100'}`}>
      <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
        {debt.from[0]}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">
          <span className={`font-semibold ${isDebtor ? 'text-red-500' : ''}`}>{debt.from}</span>
          {' deve '}
          <span className="font-semibold text-brand">
            R$ {debt.amount.toFixed(2).replace('.', ',')}
          </span>
          {' para '}
          <span className={`font-semibold ${isCreditor ? 'text-brand' : ''}`}>{debt.to}</span>
        </p>
        {isInvolved && (
          <p className="text-xs text-gray-400 mt-0.5">
            {isCreditor ? 'te devem' : 'você deve'}
          </p>
        )}
      </div>

      {isInvolved && onPay && (
        <button
          onClick={onPay}
          className={`flex-shrink-0 h-9 px-3 text-xs font-semibold rounded-xl ${btnStyle}`}
        >
          {btnLabel}
        </button>
      )}
    </div>
  )
}

export default function DebtCard({ debt, activeUser, onPay, paying }) {
  const isDebtor   = debt.from === activeUser
  const isCreditor = debt.to   === activeUser
  const isInvolved = isDebtor || isCreditor

  const btnLabel = paying ? '...' : isCreditor ? 'Recebi ✓' : 'Paguei ✓'
  const btnStyle = isCreditor
    ? 'bg-brand text-white'
    : 'bg-white text-brand border-2 border-brand'

  return (
    <div className={`bg-white rounded-2xl border p-4 flex items-center gap-3 ${isInvolved ? 'border-brand/40' : 'border-gray-100'}`}>
      <div className="w-11 h-11 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-base flex-shrink-0">
        {debt.from[0]}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base text-gray-800 leading-snug">
          <span className={`font-bold ${isDebtor ? 'text-red-500' : ''}`}>{debt.from}</span>
          <span className="text-gray-400"> → </span>
          <span className={`font-bold ${isCreditor ? 'text-brand' : ''}`}>{debt.to}</span>
        </p>
        <p className="text-sm font-semibold text-gray-700 mt-0.5">
          R$ {debt.amount.toFixed(2).replace('.', ',')}
        </p>
        {isInvolved && (
          <p className="text-xs text-gray-400 mt-0.5">
            {isCreditor ? 'estão te devendo' : 'você deve'}
          </p>
        )}
      </div>

      {isInvolved && onPay && (
        <button
          onClick={onPay}
          disabled={paying}
          className={`flex-shrink-0 min-h-[48px] px-4 text-sm font-bold rounded-xl transition-opacity ${btnStyle} ${paying ? 'opacity-50' : ''}`}
        >
          {btnLabel}
        </button>
      )}
    </div>
  )
}

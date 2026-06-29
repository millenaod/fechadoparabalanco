export default function DebtCard({ debt, activeUser, onPay }) {
  const isInvolved = debt.from === activeUser || debt.to === activeUser

  return (
    <div className={`bg-white rounded-2xl border p-4 flex items-center gap-3 ${isInvolved ? 'border-brand' : 'border-gray-100'}`}>
      <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
        {debt.from[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{debt.from}</span>
          {' deve '}
          <span className="font-semibold text-brand">R$ {debt.amount.toFixed(2).replace('.', ',')}</span>
          {' para '}
          <span className="font-semibold">{debt.to}</span>
        </p>
      </div>
      {(debt.from === activeUser || debt.to === activeUser) && (
        <button
          onClick={onPay}
          className="flex-shrink-0 h-9 px-3 text-xs font-medium bg-brand text-white rounded-xl"
        >
          Pago
        </button>
      )}
    </div>
  )
}

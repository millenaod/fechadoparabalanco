export default function UserChip({ user, readOnly, onSwitch }) {
  const displayName = readOnly ? 'Modo consulta' : user
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
      {readOnly && <span className="text-sm">👁️</span>}
      <span className="text-sm text-gray-500">você:</span>
      <span className="text-sm font-semibold text-brand">{displayName}</span>
      <button onClick={onSwitch} className="ml-auto text-xs text-gray-400 underline underline-offset-2">
        Trocar
      </button>
    </div>
  )
}

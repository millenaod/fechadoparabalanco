export default function UserChip({ user, readOnly, onSwitch }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
      {readOnly ? (
        <span className="text-sm font-semibold text-gray-500">👁️ Modo consulta</span>
      ) : (
        <span className="text-sm font-semibold text-gray-800">{user}</span>
      )}
      <button
        onClick={onSwitch}
        className="ml-auto text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1"
      >
        Trocar usuário
      </button>
    </div>
  )
}

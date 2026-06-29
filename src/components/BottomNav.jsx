import { NavLink } from 'react-router-dom'

export default function BottomNav({ badgeCount }) {
  const base = 'flex flex-col items-center gap-1 flex-1 py-2 text-xs font-medium text-gray-400 transition-colors'
  const active = 'text-brand'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex pb-safe z-50">
      <NavLink to="/novo" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Novo
      </NavLink>

      <NavLink to="/historico" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
        </svg>
        Histórico
      </NavLink>

      <NavLink to="/balanco" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0-4-4m4 4-4 4M4 17h12m0 0-4-4m4 4-4 4" />
          </svg>
          {badgeCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          )}
        </div>
        Balanço
      </NavLink>
    </nav>
  )
}

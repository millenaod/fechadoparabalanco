import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStorage } from './hooks/useStorage'
import { computeSettlements } from './lib/settlement'
import { ALL_MEMBERS } from './lib/families'
import SelectUser from './pages/SelectUser'
import Home from './pages/Home'
import NewLunch from './pages/NewLunch'
import History from './pages/History'
import Balance from './pages/Balance'
import BottomNav from './components/BottomNav'
import UserChip from './components/UserChip'

function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 2800)
    const t3 = setTimeout(() => onDone(), 3500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 bg-brand flex flex-col items-center justify-center z-50 transition-opacity duration-700 ${
        phase === 2 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src="/logo.svg"
        alt="Rachaí"
        className="transition-all duration-500"
        style={{
          width: 180,
          transform: phase === 0 ? 'scale(0.5)' : 'scale(1)',
          opacity: phase === 0 ? 0 : 1,
        }}
      />
      <div
        className={`text-center px-8 mt-6 transition-all duration-500 ${
          phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-white/80 text-base font-medium">
          Vem almoçar na porta, pô! 😄
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [members, setMembers] = useStorage('rachai_members', ALL_MEMBERS)
  const [activeUser, setActiveUser] = useStorage('rachai_active_user', '')
  const [lunches, setLunches] = useStorage('rachai_lunches', [])
  const [settlements, setSettlements] = useStorage('rachai_settlements', [])
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('rachai_splash_shown')
  })

  function hideSplash() {
    sessionStorage.setItem('rachai_splash_shown', '1')
    setShowSplash(false)
  }

  function handleAddMember(name) {
    setMembers((prev) => [...prev, name])
  }

  function handleSaveLunch(lunch) {
    setLunches((prev) => [...prev, lunch])
  }

  function handleDeleteLunch(id) {
    setLunches((prev) => prev.filter((l) => l.id !== id))
  }

  function handlePay(debt) {
    setSettlements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        from: debt.from,
        to: debt.to,
        amount: debt.amount,
        paidAt: new Date().toISOString(),
      },
    ])
  }

  const pendingDebts = computeSettlements(lunches, settlements)
  const myPendingCount = activeUser
    ? pendingDebts.filter((d) => d.from === activeUser || d.to === activeUser).length
    : 0

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onDone={hideSplash} />}

      {!activeUser ? (
        <SelectUser
          members={members}
          onSelect={setActiveUser}
          onAddMember={handleAddMember}
        />
      ) : (
        <div className="flex flex-col min-h-svh bg-gray-50">
          <UserChip user={activeUser} onSwitch={() => setActiveUser('')} />

          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    activeUser={activeUser}
                    lunches={lunches}
                    settlements={settlements}
                  />
                }
              />
              <Route
                path="/novo"
                element={
                  <NewLunch
                    members={members}
                    activeUser={activeUser}
                    onSave={handleSaveLunch}
                  />
                }
              />
              <Route
                path="/historico"
                element={<History lunches={lunches} onDelete={handleDeleteLunch} />}
              />
              <Route
                path="/balanco"
                element={
                  <Balance
                    lunches={lunches}
                    settlements={settlements}
                    activeUser={activeUser}
                    onPay={handlePay}
                  />
                }
              />
            </Routes>
          </main>

          <BottomNav badgeCount={myPendingCount} />
        </div>
      )}
    </BrowserRouter>
  )
}

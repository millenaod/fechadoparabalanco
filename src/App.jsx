import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStorage } from './hooks/useStorage'
import { computeSettlements } from './lib/settlement'
import SelectUser from './pages/SelectUser'
import NewLunch from './pages/NewLunch'
import History from './pages/History'
import Balance from './pages/Balance'
import BottomNav from './components/BottomNav'
import UserChip from './components/UserChip'

const DEFAULT_MEMBERS = ['Ana', 'Beto', 'Carla', 'Duda']

export default function App() {
  const [members, setMembers] = useStorage('rachai_members', DEFAULT_MEMBERS)
  const [activeUser, setActiveUser] = useStorage('rachai_active_user', '')
  const [lunches, setLunches] = useStorage('rachai_lunches', [])
  const [settlements, setSettlements] = useStorage('rachai_settlements', [])

  function handleAddMember(name) {
    setMembers((prev) => [...prev, name])
  }

  function handleSelectUser(name) {
    setActiveUser(name)
  }

  function handleSwitchUser() {
    setActiveUser('')
  }

  function handleSaveLunch(lunch) {
    setLunches((prev) => [...prev, lunch])
  }

  function handleDeleteLunch(id) {
    setLunches((prev) => prev.filter((l) => l.id !== id))
  }

  function handlePay(debt) {
    const settlement = {
      id: crypto.randomUUID(),
      from: debt.from,
      to: debt.to,
      amount: debt.amount,
      paidAt: new Date().toISOString(),
    }
    setSettlements((prev) => [...prev, settlement])
  }

  const pendingDebts = computeSettlements(lunches, settlements)
  const myPendingCount = activeUser
    ? pendingDebts.filter((d) => d.from === activeUser || d.to === activeUser).length
    : 0

  if (!activeUser) {
    return (
      <BrowserRouter>
        <SelectUser
          members={members}
          activeUser={activeUser}
          onSelect={handleSelectUser}
          onAddMember={handleAddMember}
        />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-svh bg-gray-50">
        <UserChip user={activeUser} onSwitch={handleSwitchUser} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/novo" replace />} />
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
              element={
                <History
                  lunches={lunches}
                  onDelete={handleDeleteLunch}
                />
              }
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
    </BrowserRouter>
  )
}

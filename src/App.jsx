import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStorage } from './hooks/useStorage'
import { computeSettlements } from './lib/settlement'
import { ALL_MEMBERS } from './lib/families'
import { supabase, lunchFromDb, settlementFromDb } from './lib/supabase'
import SelectUser from './pages/SelectUser'
import Home from './pages/Home'
import NewLunch from './pages/NewLunch'
import History from './pages/History'
import Balance from './pages/Balance'
import BottomNav from './components/BottomNav'
import UserChip from './components/UserChip'

const CONSULTA = '__consulta__'

function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 2800)
    const t3 = setTimeout(() => onDone(), 3500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div className={`fixed inset-0 bg-brand flex flex-col items-center justify-center z-50 transition-opacity duration-700 ${phase === 2 ? 'opacity-0' : 'opacity-100'}`}>
      <img
        src="/logo.svg"
        alt="Rachaí"
        className="transition-all duration-500"
        style={{ width: 180, transform: phase === 0 ? 'scale(0.5)' : 'scale(1)', opacity: phase === 0 ? 0 : 1 }}
      />
      <div className={`text-center px-8 mt-6 transition-all duration-500 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-white/80 text-base font-medium">Vem almoçar na porta, pô! 😄</p>
      </div>
    </div>
  )
}

export default function App() {
  const [members, setMembers] = useStorage('rachai_members', ALL_MEMBERS)
  const [activeUser, setActiveUser] = useStorage('rachai_active_user', '')
  const [lunches, setLunches] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('rachai_splash_shown'))

  function hideSplash() {
    sessionStorage.setItem('rachai_splash_shown', '1')
    setShowSplash(false)
  }

  // Carrega dados e assina atualizações em tempo real
  useEffect(() => {
    async function loadData() {
      const [{ data: lData }, { data: sData }, { data: mData }] = await Promise.all([
        supabase.from('lunches').select('*').order('created_at', { ascending: false }),
        supabase.from('settlements').select('*').order('paid_at', { ascending: false }),
        supabase.from('members').select('name'),
      ])
      if (lData) setLunches(lData.map(lunchFromDb))
      if (sData) setSettlements(sData.map(settlementFromDb))
      if (mData && mData.length > 0) setMembers(mData.map((r) => r.name))
      setLoading(false)
    }
    loadData()

    const lunchChannel = supabase
      .channel('lunches-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lunches' }, () => {
        supabase.from('lunches').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setLunches(data.map(lunchFromDb)) })
      })
      .subscribe()

    const settlementChannel = supabase
      .channel('settlements-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settlements' }, () => {
        supabase.from('settlements').select('*').order('paid_at', { ascending: false })
          .then(({ data }) => { if (data) setSettlements(data.map(settlementFromDb)) })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(lunchChannel)
      supabase.removeChannel(settlementChannel)
    }
  }, [])

  async function handleSaveLunch(lunch) {
    await supabase.from('lunches').insert({
      id: lunch.id,
      date: lunch.date,
      description: lunch.description,
      attendees: lunch.attendees,
      payers: lunch.payers,
      total: lunch.total,
      split_per_person: lunch.splitPerPerson,
      created_at: lunch.createdAt,
    })
  }

  async function handleDeleteLunch(id) {
    await supabase.from('lunches').delete().eq('id', id)
  }

  async function handlePay(debt) {
    await supabase.from('settlements').insert({
      id: crypto.randomUUID(),
      from_name: debt.from,
      to_name: debt.to,
      amount: debt.amount,
      paid_at: new Date().toISOString(),
    })
  }

  const readOnly = activeUser === CONSULTA
  const pendingDebts = computeSettlements(lunches, settlements)
  const myPendingCount = activeUser && !readOnly
    ? pendingDebts.filter((d) => d.from === activeUser || d.to === activeUser).length
    : 0

  if (loading) {
    return (
      <div className="fixed inset-0 bg-brand flex items-center justify-center">
        <img src="/logo.svg" alt="Rachaí" className="w-32 animate-pulse" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onDone={hideSplash} />}

      {!activeUser ? (
        <SelectUser
          members={members}
          onSelect={setActiveUser}
          onAddMember={async (name) => {
          await supabase.from('members').insert({ name, family_name: null })
          setMembers((prev) => [...prev, name])
        }}
          consultaKey={CONSULTA}
        />
      ) : (
        <div className="flex flex-col min-h-svh bg-gray-50">
          <UserChip user={activeUser} readOnly={readOnly} onSwitch={() => setActiveUser('')} />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={
                <Home activeUser={readOnly ? null : activeUser} lunches={lunches} settlements={settlements} readOnly={readOnly} />
              } />
              <Route path="/novo" element={
                readOnly ? <Home activeUser={null} lunches={lunches} settlements={settlements} readOnly /> :
                <NewLunch members={members} activeUser={activeUser} onSave={handleSaveLunch} />
              } />
              <Route path="/historico" element={
                <History lunches={lunches} onDelete={readOnly ? null : handleDeleteLunch} />
              } />
              <Route path="/balanco" element={
                <Balance lunches={lunches} settlements={settlements} activeUser={readOnly ? null : activeUser} onPay={readOnly ? null : handlePay} />
              } />
            </Routes>
          </main>

          <BottomNav badgeCount={myPendingCount} readOnly={readOnly} />
        </div>
      )}
    </BrowserRouter>
  )
}

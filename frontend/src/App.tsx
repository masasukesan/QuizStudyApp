import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { useState, useCallback } from 'react'
import LoginPage from './pages/LoginPage'
import SubjectPage from './pages/SubjectPage'
import CoursePage from './pages/CoursePage'
import QuizPage from './pages/QuizPage'
import ProfilePage from './pages/ProfilePage'
import RankingPage from './pages/RankingPage'
import BottomNav from './components/BottomNav'
import MagicCircle from './components/MagicCircle'
import SplashScreen from './components/SplashScreen'
import SchoolTypeSelector from './components/SchoolTypeSelector'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

/* ── 学校種別未設定ガード ──
   ログイン済みユーザーが school_type を持っていない場合に選択モーダルを表示する */
function SchoolTypeGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile(user?.id)

  if (isLoading || !profile) return <>{children}</>

  if (profile.school_type == null) {
    return (
      <>
        {children}
        <SchoolTypeSelector userId={user!.id} />
      </>
    )
  }

  return <>{children}</>
}

export default function App() {
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashDone = useCallback(() => setShowSplash(false), [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }
  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <MagicCircle />
      <SchoolTypeGuard>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/subject" replace /> : <LoginPage />} />
          <Route path="/subject" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
          <Route path="/course/:subject" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
          <Route path="/quiz/:subject" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? '/subject' : '/login'} replace />} />
        </Routes>
      </SchoolTypeGuard>
      {user && <BottomNav />}
    </>
  )
}

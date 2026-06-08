import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import SubjectPage from './pages/SubjectPage'
import CoursePage from './pages/CoursePage'
import QuizPage from './pages/QuizPage'
import ProfilePage from './pages/ProfilePage'
import RankingPage from './pages/RankingPage'
import BottomNav from './components/BottomNav'
import MagicCircle from './components/MagicCircle'
import SplashScreen from './components/SplashScreen'
import { supabase } from './lib/supabase'
import { PENDING_PROFILE_KEY } from './pages/LoginPage'
import type { SchoolType } from './components/SchoolTypeSelector'

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

/* ── 登録直後のプロフィール INSERT を確実に実行するハンドラ ──
   signUp 後の認証状態変化によりページ遷移が発生しても、
   sessionStorage の pending data を使って INSERT を完了させる */
function PendingProfileHandler() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return
    const raw = sessionStorage.getItem(PENDING_PROFILE_KEY)
    if (!raw) return

    let parsed: { username: string; avatarId: string; recoveryCode: string; schoolType: string }
    try { parsed = JSON.parse(raw) } catch { sessionStorage.removeItem(PENDING_PROFILE_KEY); return }

    supabase.from('user_profiles').insert({
      id:            user.id,
      username:      parsed.username,
      avatar_id:     parsed.avatarId,
      recovery_code: parsed.recoveryCode,
      school_type:   parsed.schoolType as SchoolType,
    }).then(({ error }) => {
      if (!error || error.code === '23505') {
        // 成功 or 既存（重複）= どちらも OK
        sessionStorage.removeItem(PENDING_PROFILE_KEY)
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
      }
    })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

/* ── 学校種別未設定ガード ──
   school_type の選択は SubjectPage が直接担当するため、ここでは素通しする */
function SchoolTypeGuard({ children }: { children: React.ReactNode }) {
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
      <PendingProfileHandler />
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

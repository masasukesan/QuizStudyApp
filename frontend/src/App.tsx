import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
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
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/subject" replace /> : <LoginPage />} />
        <Route path="/subject" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
        <Route path="/course/:subject" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
        <Route path="/quiz/:subject" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? '/subject' : '/login'} replace />} />
      </Routes>
      {user && <BottomNav />}
    </>
  )
}

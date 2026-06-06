import { useLocation, useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

const NAV_ITEMS = [
  { path: '/subject',  label: 'コース' },
  { path: '/profile',  label: 'マイページ' },
  { path: '/ranking',  label: '偏差値' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate  = useNavigate()

  if (location.pathname.startsWith('/quiz') || location.pathname === '/login') {
    return null
  }

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.path ||
          (item.path === '/subject' && location.pathname.startsWith('/course'))
        return (
          <button
            key={item.path}
            className={styles.item + (active ? ' ' + styles.active : '')}
            onClick={() => navigate(item.path)}
          >
            <span className={styles.ornament} aria-hidden="true" />
            <span className={styles.label}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

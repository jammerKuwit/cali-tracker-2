import { Outlet } from 'react-router-dom'
import { useData } from '../context/data'
import BottomNav from './BottomNav'

export default function Layout() {
  const { ready, error } = useData()

  if (!ready) {
    return <div className="splash">CALI</div>
  }

  return (
    <div className="app-shell">
      {error ? <div className="error-banner">{error}</div> : null}
      <Outlet />
      <BottomNav />
    </div>
  )
}

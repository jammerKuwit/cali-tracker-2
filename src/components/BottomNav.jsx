import { NavLink } from 'react-router-dom'

const items = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M4 12h10M4 18h16" />
      </svg>
    ),
  },
  {
    to: '/log',
    label: 'Log',
    fab: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    to: '/calendar',
    label: 'Cal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V9M10 19V5M16 19v-7M20 19H4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            item.fab
              ? `nav-log${isActive ? ' active' : ''}`
              : `nav-item${isActive ? ' active' : ''}`
          }
          aria-label={item.label}
        >
          {item.icon}
          {item.fab ? null : item.label}
        </NavLink>
      ))}
    </nav>
  )
}

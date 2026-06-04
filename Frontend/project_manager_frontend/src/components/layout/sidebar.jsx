import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'; //  New path pointing directly to the hook file

import { toast } from 'sonner'

const links = [
  { path: '/dashboard', label: '🏠 Dashboard' },
  { path: '/projects', label: '📁 Projects' },
  { path: '/tasks', label: '✅ My Tasks' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div style={{
      width: 220,
      height: '100vh',
      background: 'white',
      borderRight: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: '24px 16px'
    }}>
      {/* App name */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#4f7c5f' }}>Planify</h2>
        <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Project Manager</p>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {links.map(link => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 4,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#4f7c5f' : '#555',
                background: isActive ? '#eef3f0' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 2 }}>{user?.name}</p>
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>{user?.email}</p>
        <button
          onClick={handleLogout}
          style={{
            fontSize: 13,
            color: '#e05c5c',
            background: 'none',
            border: 'none',
            padding: 0
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}


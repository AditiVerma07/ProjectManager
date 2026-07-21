import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner'

const links = [
  { path: '/dashboard', label: '🏠 Dashboard' },
  { path: '/projects', label: '📁 Projects' },
  { path: '/tasks', label: '✅ My Tasks' },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div
      className={`app-sidebar ${isOpen ? 'open' : ''}`}
      style={{
        height: '100vh',
        background: '#1B1F2B',
        borderRight: '1px solid #2C3244',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        padding: '24px 16px',
        zIndex: 60
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F0883E' }}>Planify</h2>
        <p style={{ fontSize: 12, color: '#7C8296', marginTop: 2 }}>Project Manager</p>
      </div>

      <nav style={{ flex: 1 }}>
        {links.map(link => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 4,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#F0883E' : '#B4B9C6',
                background: isActive ? 'rgba(240, 136, 62, 0.12)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ borderTop: '1px solid #2C3244', paddingTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#F4F4F6', marginBottom: 2 }}>{user?.name}</p>
        <p style={{ fontSize: 12, color: '#7C8296', marginBottom: 12 }}>{user?.email}</p>
        <button
          onClick={handleLogout}
          style={{
            fontSize: 13,
            color: '#F87171',
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
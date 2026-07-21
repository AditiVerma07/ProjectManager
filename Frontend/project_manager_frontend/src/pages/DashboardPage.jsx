import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get('/projects')
      .then(res => setProjects(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const active = projects.filter(p => p.status === 'active').length
  const completed = projects.filter(p => p.status === 'completed').length
  const planning = projects.filter(p => p.status === 'planning').length

  if (loading) return <p style={{ color: '#7C8296' }}>Loading...</p>

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: '#F4F4F6' }}>
        Hey {user?.name?.split(' ')[0]} 👋
      </h1>
      <p style={{ color: '#B4B9C6', fontSize: 14, marginBottom: 28 }}>Here's a quick overview</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Projects', value: projects.length, bg: 'rgba(240, 136, 62, 0.12)', color: '#F0883E' },
          { label: 'Active', value: active, bg: 'rgba(96, 165, 250, 0.12)', color: '#60A5FA' },
          { label: 'Completed', value: completed, bg: 'rgba(74, 222, 128, 0.12)', color: '#4ADE80' },
          { label: 'Planning', value: planning, bg: 'rgba(251, 191, 36, 0.12)', color: '#FBBF24' },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1,
            background: '#1B1F2B',
            border: '1px solid #2C3244',
            borderRadius: 10,
            padding: '18px 20px'
          }}>
            <p style={{ fontSize: 12, color: '#B4B9C6', marginBottom: 8 }}>{stat.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div style={{ background: '#1B1F2B', border: '1px solid #2C3244', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2C3244', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F6' }}>Recent Projects</h2>
          <button onClick={() => navigate('/projects')} style={{ fontSize: 13, color: '#F0883E', background: 'none', border: 'none', fontWeight: 500 }}>
            View all →
          </button>
        </div>

        {projects.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: '#7C8296', fontSize: 14, marginBottom: 12 }}>No projects yet</p>
            <button onClick={() => navigate('/projects')} style={{ padding: '8px 16px', background: '#F0883E', color: '#12141C', border: 'none', borderRadius: 8, fontSize: 13 }}>
              Create a project
            </button>
          </div>
        ) : (
          projects.slice(0, 5).map(project => (
            <div
              key={project._id}
              onClick={() => navigate(`/tasks?project=${project._id}&name=${project.name}`)}
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #242A3A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#242A3A'}
              onMouseLeave={e => e.currentTarget.style.background = '#1B1F2B'}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F6' }}>{project.name}</p>
                {project.description && (
                  <p style={{ fontSize: 12, color: '#7C8296', marginTop: 2 }}>{project.description.slice(0, 60)}</p>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#B4B9C6', background: '#242A3A', padding: '3px 10px', borderRadius: 20 }}>
                {project.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
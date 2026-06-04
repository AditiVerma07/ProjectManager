import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../api/client'
import { useAuth } from '../hooks/useAuth' // Updated path to use the new hook location

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

  if (loading) return <p style={{ color: '#aaa' }}>Loading...</p>

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
        Hey {user?.name?.split(' ')[0]} 👋
      </h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>Here's a quick overview</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Projects', value: projects.length, bg: '#eef3f0', color: '#4f7c5f' },
          { label: 'Active', value: active, bg: '#fff8ee', color: '#c4893a' },
          { label: 'Completed', value: completed, bg: '#f0f0ff', color: '#6b6bb0' },
          { label: 'Planning', value: planning, bg: '#fff0f0', color: '#c05c5c' },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1,
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: 10,
            padding: '18px 20px'
          }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{stat.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Recent Projects</h2>
          <button onClick={() => navigate('/projects')} style={{ fontSize: 13, color: '#4f7c5f', background: 'none', border: 'none', fontWeight: 500 }}>
            View all →
          </button>
        </div>

        {projects.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: '#aaa', fontSize: 14, marginBottom: 12 }}>No projects yet</p>
            <button onClick={() => navigate('/projects')} style={{ padding: '8px 16px', background: '#4f7c5f', color: 'white', border: 'none', borderRadius: 8, fontSize: 13 }}>
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
                borderBottom: '1px solid #f5f5f5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{project.name}</p>
                {project.description && (
                  <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{project.description.slice(0, 60)}</p>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#888', background: '#f5f5f5', padding: '3px 10px', borderRadius: 20 }}>
                {project.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
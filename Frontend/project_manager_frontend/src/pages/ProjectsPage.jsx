import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post } from '../api/client'
import { toast } from 'sonner'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    get('/projects')
      .then(res => setProjects(res.data || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function createProject(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await post('/projects', { name, description, priority })
      setProjects([res.data, ...projects])
      setShowModal(false)
      setName('')
      setDescription('')
      setPriority('medium')
      toast.success('Project created!')
    } catch (err) {
      toast.error(err.message)
    }
    setSaving(false)
  }

  const priorityColors = { low: '#60A5FA', medium: '#FBBF24', high: '#F0883E', critical: '#F87171' }

  if (loading) return <p style={{ color: '#7C8296' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#F4F4F6' }}>Projects</h1>
          <p style={{ color: '#B4B9C6', fontSize: 13, marginTop: 2 }}>{projects.length} total</p>
        </div>
        <button onClick={() => setShowModal(true)} style={btnStyle}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#1B1F2B', borderRadius: 10, border: '1px solid #2C3244' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>📁</p>
          <p style={{ color: '#B4B9C6', marginBottom: 16 }}>No projects yet. Create one to get started.</p>
          <button onClick={() => setShowModal(true)} style={btnStyle}>+ New Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {projects.map(project => (
            <div
              key={project._id}
              onClick={() => navigate(`/tasks?project=${project._id}&name=${project.name}`)}
              style={{
                background: '#1B1F2B',
                border: '1px solid #2C3244',
                borderRadius: 10,
                padding: '18px 20px',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#F0883E'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2C3244'}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#F4F4F6' }}>{project.name}</h3>
              {project.description && (
                <p style={{ fontSize: 13, color: '#B4B9C6', marginBottom: 12 }}>{project.description.slice(0, 80)}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#B4B9C6', background: '#242A3A', padding: '3px 10px', borderRadius: 20 }}>
                  {project.status}
                </span>
                <span style={{ fontSize: 12, color: priorityColors[project.priority] || '#B4B9C6', fontWeight: 500 }}>
                  {project.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1B1F2B', borderRadius: 12, padding: 28, width: 400, border: '1px solid #2C3244' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#F4F4F6' }}>New Project</h2>
            <form onSubmit={createProject}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Project name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="My project" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this about?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={inputStyle}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={ghostBtnStyle}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...btnStyle, flex: 1 }}>
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#B4B9C6' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #2C3244', borderRadius: 8, fontSize: 14, outline: 'none', background: '#12141C', color: '#F4F4F6', boxSizing: 'border-box' }
const btnStyle = { padding: '9px 16px', background: '#F0883E', color: '#12141C', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500 }
const ghostBtnStyle = { padding: '9px 16px', background: 'transparent', color: '#B4B9C6', border: '1px solid #2C3244', borderRadius: 8, fontSize: 13 }
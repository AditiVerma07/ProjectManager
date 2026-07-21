import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post, del } from '../api/client'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [saving, setSaving] = useState(false)

  // Member management state
  const [manageProject, setManageProject] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviting, setInviting] = useState(false)


  function loadProjects() {
    get('/projects')
      .then(res => setProjects(res.data || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProjects()
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

  function openManageMembers(e, project) {
    e.stopPropagation()
    setManageProject(project)
    setInviteEmail('')
    setInviteRole('member')
  }

  async function handleInvite(e) {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    try {
      const res = await post(`/projects/${manageProject._id}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole
      })
      setManageProject(res.data)
      setProjects(projects.map(p => p._id === res.data._id ? res.data : p))
      setInviteEmail('')
      toast.success('Member added')
    } catch (err) {
      toast.error(err.message)
    }
    setInviting(false)
  }

  async function handleRemoveMember(userId) {
    if (!confirm('Remove this member from the project?')) return
    try {
      const res = await del(`/projects/${manageProject._id}/members/${userId}`)
      setManageProject(res.data)
      setProjects(projects.map(p => p._id === res.data._id ? res.data : p))
      toast.success('Member removed')
    } catch (err) {
      toast.error(err.message)
    }
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
          {projects.map(project => {
            const isOwner = project.owner?._id === user?._id || project.owner === user?._id
            return (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isOwner ? 12 : 0 }}>
                  <span style={{ fontSize: 12, color: '#B4B9C6', background: '#242A3A', padding: '3px 10px', borderRadius: 20 }}>
                    {project.status}
                  </span>
                  <span style={{ fontSize: 12, color: priorityColors[project.priority] || '#B4B9C6', fontWeight: 500 }}>
                    {project.priority}
                  </span>
                </div>
                {isOwner && (
                  <button
                    onClick={(e) => openManageMembers(e, project)}
                    style={{
                      width: '100%',
                      padding: '7px 0',
                      background: 'transparent',
                      border: '1px solid #2C3244',
                      borderRadius: 8,
                      color: '#B4B9C6',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    👥 Manage members ({project.members?.length || 0})
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create Project Modal */}
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

      {/* Manage Members Modal */}
      {manageProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setManageProject(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#1B1F2B', borderRadius: 12, padding: 28, width: 440, border: '1px solid #2C3244' }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: '#F4F4F6' }}>Manage members</h2>
            <p style={{ fontSize: 13, color: '#B4B9C6', marginBottom: 20 }}>{manageProject.name}</p>

            {/* Invite form */}
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                required
                style={{ ...inputStyle, flex: 1 }}
              />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ ...inputStyle, width: 110 }}>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <button type="submit" disabled={inviting} style={btnStyle}>
                {inviting ? '...' : 'Invite'}
              </button>
            </form>

            {/* Member list */}
            <div style={{ borderTop: '1px solid #2C3244', paddingTop: 14 }}>
              <p style={{ fontSize: 12, color: '#7C8296', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Current members
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <p style={{ fontSize: 13, color: '#F4F4F6', fontWeight: 500 }}>{manageProject.owner?.name}</p>
                  <p style={{ fontSize: 12, color: '#7C8296' }}>{manageProject.owner?.email}</p>
                </div>
                <span style={{ fontSize: 11, color: '#F0883E', background: 'rgba(240,136,62,0.12)', padding: '3px 10px', borderRadius: 20 }}>
                  owner
                </span>
              </div>

              {manageProject.members && manageProject.members.length > 0 ? (
                manageProject.members.map(m => (
                  <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #242A3A' }}>
                    <div>
                      <p style={{ fontSize: 13, color: '#F4F4F6', fontWeight: 500 }}>{m.user.name}</p>
                      <p style={{ fontSize: 12, color: '#7C8296' }}>{m.user.email}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: '#B4B9C6', background: '#242A3A', padding: '3px 10px', borderRadius: 20 }}>
                        {m.role}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(m.user._id)}
                        style={{ background: 'none', border: 'none', color: '#F87171', fontSize: 12, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 13, color: '#7C8296', padding: '10px 0' }}>No members yet — invite someone above.</p>
              )}
            </div>

            <button
              onClick={() => setManageProject(null)}
              style={{ ...ghostBtnStyle, width: '100%', marginTop: 20 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#B4B9C6' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #2C3244', borderRadius: 8, fontSize: 14, outline: 'none', background: '#12141C', color: '#F4F4F6', boxSizing: 'border-box' }
const btnStyle = { padding: '9px 16px', background: '#F0883E', color: '#12141C', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }
const ghostBtnStyle = { padding: '9px 16px', background: 'transparent', color: '#B4B9C6', border: '1px solid #2C3244', borderRadius: 8, fontSize: 13, cursor: 'pointer' }
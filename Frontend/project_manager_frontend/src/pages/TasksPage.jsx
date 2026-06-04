import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { get, post, put, del } from '../api/client'
import TaskTable from '../components/tasks/TaskTable'
import KanbanBoard from '../components/tasks/KanbanBoard'
import { toast } from 'sonner'

export default function TasksPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')
  const projectName = searchParams.get('name')

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('table')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [saving, setSaving] = useState(false)

  // form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('todo')
  const [dueDate, setDueDate] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')

  // Fetch tasks based on context
  useEffect(() => {
    const url = projectId ? `/tasks?project=${projectId}` : '/tasks'
    get(url)
      .then(res => setTasks(res.data || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [projectId])

  // Fetch available projects to populate the creation dropdown list
  useEffect(() => {
    get('/projects')
      .then(res => {
        const projectList = res.data || []
        setProjects(projectList)
        if (projectList.length > 0 && !projectId) {
          setSelectedProjectId(projectList[0]._id) 
        }
      })
      .catch(err => console.error('Failed to load projects list:', err.message))
  }, [projectId])


  
  function openCreate() {
    setEditTask(null)
    setTitle(''); setDescription(''); setPriority('medium'); setStatus('todo'); setDueDate('')
    setSelectedProjectId(projectId || (projects[0]?._id || ''))
    setShowModal(true)
  }

  function openEdit(task) {
    setEditTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setPriority(task.priority)
    setStatus(task.status)
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
    setSelectedProjectId(task.project?._id || task.project || '')
    setShowModal(true)
  }

  function openFromChat(task) {
  setEditTask(null)
  setTitle(task.title || '')
  setDescription(task.description || '')
  setPriority(task.priority || 'medium')
  setStatus(task.status || 'todo')
  setDueDate(task.dueDate || '')
  setSelectedProjectId(projectId || (projects[0]?._id || ''))
  setShowModal(true)
}

useEffect(() => {
  function handleChatTask(e) {
    openFromChat(e.detail)
  }
  window.addEventListener('use-chat-task', handleChatTask)
  return () => window.removeEventListener('use-chat-task', handleChatTask)
}, [projects, projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e) {
    e.preventDefault()
    
    const activeTargetProject = projectId || selectedProjectId
    if (!activeTargetProject) {
      toast.error('Please select or create a project first before creating tasks.')
      return
    }

    setSaving(true)
    try {
      const body = { title, description, priority, status, dueDate }
      if (editTask) {
        const res = await put(`/tasks/${editTask._id}`, body)
        const updatedTask = res.data || res;
        setTasks(tasks.map(t => t._id === editTask._id ? updatedTask : t))
        toast.success('Task updated')
      } else {
        const res = await post('/tasks', { ...body, project: activeTargetProject })
         const newTask = res.data || res;
        setTasks([newTask, ...tasks])
        toast.success('Task created')
      }
      setShowModal(false)
    } catch (err) {
      toast.error(err.message)
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return
    try {
      await del(`/tasks/${id}`)
      setTasks(tasks.filter(t => t._id !== id))
      toast.success('Task deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

async function handleStatusChange(taskId, newStatus) {
  try {
    await put(`/tasks/${taskId}`, { status: newStatus })
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t))
  } catch (err) {
    toast.error(err.message || 'Failed to update task status')
  }
}

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: '#aaa', fontSize: 14 }}>Loading tasks...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header Layout UI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>{projectName || 'All My Tasks'}</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Layout view configuration elements */}
          <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => setView('table')} style={{ padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: 13, background: view === 'table' ? '#4f7c5f' : 'white', color: view === 'table' ? 'white' : '#555' }}>
              Table
            </button>
            <button onClick={() => setView('kanban')} style={{ padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: 13, background: view === 'kanban' ? '#4f7c5f' : 'white', color: view === 'kanban' ? 'white' : '#555' }}>
              Kanban
            </button>
          </div>
          
          {(projectId || projects.length > 0) && (
            <button onClick={openCreate} style={{ padding: '9px 16px', background: '#4f7c5f', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
              + New Task
            </button>
          )}
        </div>
      </div>

      {/* Grid Content Wrapper */}
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <p style={{ fontSize: 16, marginBottom: 6 }}>📝</p>
          <p style={{ color: '#aaa', fontSize: 14 }}>No active tasks found. Click "+ New Task" to begin logging work.</p>
        </div>
      ) : view === 'table' ? (
        <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
          <TaskTable tasks={tasks} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      ) : (
        <KanbanBoard tasks={tasks} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
      )}

      {/* Task Creation/Editing Management Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 420, border: '1px solid #e5e5e5' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSave}>
              
              {!projectId && !editTask && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Assign to Project</label>
                  <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} style={inputStyle} required>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="More details..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} style={inputStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={ghostBtnStyle}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...btnStyle, flex: 1 }}>{saving ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#444' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const btnStyle = { padding: '10px 16px', background: '#4f7c5f', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500 }
const ghostBtnStyle = { padding: '10px 16px', background: 'none', color: '#555', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }
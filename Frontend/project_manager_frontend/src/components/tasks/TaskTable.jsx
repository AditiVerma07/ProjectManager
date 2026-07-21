export default function TaskTable({ tasks, onEdit, onDelete, readOnly }) {
  if (tasks.length === 0) {
    return <p style={{ padding: '30px 20px', color: '#7C8296', textAlign: 'center', fontSize: 14 }}>No tasks yet. Create one!</p>
  }

  const priorityColor = { low: '#60A5FA', medium: '#FBBF24', high: '#F0883E', critical: '#F87171' }
  const statusColor = { backlog: '#7C8296', todo: '#60A5FA', in_progress: '#F0883E', in_review: '#A78BFA', done: '#4ADE80', cancelled: '#3A4256' }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #2C3244' }}>
          {['Task', 'Status', 'Priority', 'Due Date', ''].map(h => (
            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#7C8296', fontWeight: 600, fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tasks.map(task => (
          <tr
            key={task._id}
            style={{ borderBottom: '1px solid #242A3A' }}
            onMouseEnter={e => e.currentTarget.style.background = '#242A3A'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ padding: '12px 16px' }}>
              <p style={{ fontWeight: 500, color: task.status === 'done' ? '#7C8296' : '#F4F4F6', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                {task.title}
              </p>
              {task.description && <p style={{ fontSize: 12, color: '#7C8296', marginTop: 2 }}>{task.description.slice(0, 60)}</p>}
            </td>
            <td style={{ padding: '12px 16px' }}>
              <span style={{ fontSize: 12, color: statusColor[task.status] || '#7C8296', background: '#12141C', padding: '3px 10px', borderRadius: 20 }}>
                {task.status.replace('_', ' ')}
              </span>
            </td>
            <td style={{ padding: '12px 16px' }}>
              <span style={{ fontSize: 12, color: priorityColor[task.priority] || '#7C8296', fontWeight: 500 }}>
                {task.priority}
              </span>
            </td>
            <td style={{ padding: '12px 16px', color: '#B4B9C6', fontSize: 12 }}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
            </td>
            <td style={{ padding: '12px 16px' }}>
              {!readOnly && (
                <>
                  <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', color: '#B4B9C6', marginRight: 8, fontSize: 13, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => onDelete(task._id)} style={{ background: 'none', border: 'none', color: '#F87171', fontSize: 13, cursor: 'pointer' }}>Delete</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
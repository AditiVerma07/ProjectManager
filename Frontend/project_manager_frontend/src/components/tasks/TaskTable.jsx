export default function TaskTable({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return <p style={{ padding: '30px 20px', color: '#aaa', textAlign: 'center', fontSize: 14 }}>No tasks yet. Create one!</p>
  }

  const priorityColor = { low: '#7ea8be', medium: '#c4893a', high: '#d4614a', critical: '#a83232' }
  const statusColor = { backlog: '#aaa', todo: '#7ea8be', in_progress: '#c4893a', in_review: '#9b7eb8', done: '#4f7c5f', cancelled: '#ccc' }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #eee' }}>
          {['Task', 'Status', 'Priority', 'Due Date', ''].map(h => (
            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa', fontWeight: 600, fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tasks.map(task => (
          <tr
            key={task._id}
            style={{ borderBottom: '1px solid #f5f5f5' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <td style={{ padding: '12px 16px' }}>
              <p style={{ fontWeight: 500, color: task.status === 'done' ? '#aaa' : '#1a1a1a', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                {task.title}
              </p>
              {task.description && <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{task.description.slice(0, 60)}</p>}
            </td>
            <td style={{ padding: '12px 16px' }}>
              <span style={{ fontSize: 12, color: statusColor[task.status] || '#aaa', background: '#f5f5f5', padding: '3px 10px', borderRadius: 20 }}>
                {task.status.replace('_', ' ')}
              </span>
            </td>
            <td style={{ padding: '12px 16px' }}>
              <span style={{ fontSize: 12, color: priorityColor[task.priority] || '#aaa', fontWeight: 500 }}>
                {task.priority}
              </span>
            </td>
            <td style={{ padding: '12px 16px', color: '#888', fontSize: 12 }}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
            </td>
            <td style={{ padding: '12px 16px' }}>
              <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', color: '#888', marginRight: 8, fontSize: 13, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => onDelete(task._id)} style={{ background: 'none', border: 'none', color: '#e05c5c', fontSize: 13, cursor: 'pointer' }}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
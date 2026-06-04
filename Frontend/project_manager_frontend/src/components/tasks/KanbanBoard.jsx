import { useState, useEffect, useRef } from 'react'
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core' // ✅ Added for empty column drops
import { CSS } from '@dnd-kit/utilities'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#aaa' },
  { id: 'todo', label: 'To Do', color: '#7ea8be' },
  { id: 'in_progress', label: 'In Progress', color: '#c4893a' },
  { id: 'in_review', label: 'In Review', color: '#9b7eb8' },
  { id: 'done', label: 'Done', color: '#4f7c5f' },
]

// Separate component for the column so dnd-kit can trace drops even if it's empty
function ColumnContainer({ id, colTasks, children }) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: { type: 'Column' } // Makes it easy to identify column nodes in handlers
  })

  return (
    <div ref={setNodeRef} style={{ background: '#f9f9f7', borderRadius: 10, padding: 10, minHeight: 400 }}>
      {children}
      {colTasks.length === 0 && (
        <p style={{ fontSize: 12, color: '#ccc', textAlign: 'center', paddingTop: 40 }}>Drop here</p>
      )}
    </div>
  )
}

function TaskCard({ task, onEdit, onDelete, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: 'Task', task }
  })

  if (isDragging && !isOverlay) {
    return (
      <div ref={setNodeRef} style={{ height: 80, border: '2px dashed #ddd', borderRadius: 8, marginBottom: 8, background: '#f5f5f2' }} />
    )
  }

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <div style={{
        background: 'white',
        border: '1px solid #e5e5e5',
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 8,
        boxShadow: isOverlay ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
        opacity: isOverlay ? 0.9 : 1
      }}>
        {/* Grabbing handle bar */}
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#ddd', fontSize: 12, marginBottom: 6 }}>⠿</div>
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          color: task.status === 'done' ? '#aaa' : '#1a1a1a',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          marginBottom: 8
        }}>
          {task.title}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: 20 }}>
            {task.priority}
          </span>
          <div>
            <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', marginRight: 6 }}>Edit</button>
            <button onClick={() => onDelete(task._id)} style={{ background: 'none', border: 'none', color: '#e05c5c', fontSize: 12, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange }) {
  const [boardTasks, setBoardTasks] = useState(tasks)
  const [activeTask, setActiveTask] = useState(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!isDraggingRef.current) {
      setBoardTasks(tasks)
    }
  }, [tasks])

  // Added a small constraint so clicking edit buttons won't accidentally start a drag trigger
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragStart(event) {
    isDraggingRef.current = true
    const activeData = event.active.data.current
    if (activeData && activeData.type === 'Task') {
      setActiveTask(activeData.task)
    }
  }

  function handleDragOver(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeData = active.data.current
    if (!activeData || activeData.type !== 'Task') return

    const overId = over.id
    
    // Check if we are hovering directly over another task card
    const isOverATask = boardTasks.some(t => t._id === overId)
    if (isOverATask) {
      const overTask = boardTasks.find(t => t._id === overId)
      if (overTask && activeData.task.status !== overTask.status) {
        setBoardTasks(prev => prev.map(t => {
          if (t._id === active.id) return { ...t, status: overTask.status }
          return t
        }))
      }
    }

    // Check if we are hovering over an empty column wrapper
    const isOverAColumn = COLUMNS.some(col => col.id === overId)
    if (isOverAColumn) {
      setBoardTasks(prev => prev.map(t => {
        if (t._id === active.id) return { ...t, status: overId }
        return t
      }))
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveTask(null)
    isDraggingRef.current = false

    if (!over) {
      setBoardTasks(tasks)
      return
    }

    const draggedTask = boardTasks.find(t => t._id === active.id)
    const originalTask = tasks.find(t => t._id === active.id)

    // Fire the save action back to our database endpoint if the list state updated
    if (draggedTask && originalTask && draggedTask.status !== originalTask.status) {
      onStatusChange(active.id, draggedTask.status)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, userSelect: 'none' }}>
        {COLUMNS.map(col => {
          const colTasks = boardTasks.filter(t => t.status === col.id)
          return (
            <div key={col.id} style={{ minWidth: 220, flex: 1 }}>
              {/* Header block details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{col.label}</span>
                <span style={{ fontSize: 12, color: '#aaa', marginLeft: 'auto' }}>{colTasks.length}</span>
              </div>

              {/* Context container feeding dnd listings */}
             <SortableContext id={col.id} items={colTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  {/* ✅ Clean and direct wrapper connection */}
                  <ColumnContainer id={col.id} colTasks={colTasks}>
                    {colTasks.map(task => (
                      <TaskCard key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                  </ColumnContainer>
                </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} onEdit={onEdit} onDelete={onDelete} isOverlay={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

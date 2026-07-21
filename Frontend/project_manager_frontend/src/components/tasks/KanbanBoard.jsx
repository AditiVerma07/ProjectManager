import { useState, useEffect, useRef } from 'react'
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#7C8296' },
  { id: 'todo', label: 'To Do', color: '#60A5FA' },
  { id: 'in_progress', label: 'In Progress', color: '#F0883E' },
  { id: 'in_review', label: 'In Review', color: '#A78BFA' },
  { id: 'done', label: 'Done', color: '#4ADE80' },
]

function ColumnContainer({ id, colTasks, children }) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: { type: 'Column' }
  })

  return (
    <div ref={setNodeRef} style={{ background: '#1B1F2B', borderRadius: 10, padding: 10, minHeight: 400 }}>
      {children}
      {colTasks.length === 0 && (
        <p style={{ fontSize: 12, color: '#3A4256', textAlign: 'center', paddingTop: 40 }}>Drop here</p>
      )}
    </div>
  )
}

function TaskCard({ task, onEdit, onDelete, isOverlay, readOnly }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: 'Task', task },
    disabled: readOnly
  })

  if (isDragging && !isOverlay) {
    return (
      <div ref={setNodeRef} style={{ height: 80, border: '2px dashed #3A4256', borderRadius: 8, marginBottom: 8, background: '#242A3A' }} />
    )
  }

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <div style={{
        background: '#242A3A',
        border: '1px solid #2C3244',
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 8,
        boxShadow: isOverlay ? '0 8px 16px rgba(0,0,0,0.4)' : 'none',
        opacity: isOverlay ? 0.9 : 1
      }}>
        {!readOnly && (
          <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#3A4256', fontSize: 12, marginBottom: 6 }}>⠿</div>
        )}
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          color: task.status === 'done' ? '#7C8296' : '#F4F4F6',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          marginBottom: 8
        }}>
          {task.title}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#B4B9C6', background: '#12141C', padding: '2px 8px', borderRadius: 20 }}>
            {task.priority}
          </span>
          {!readOnly && (
            <div>
              <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', color: '#7C8296', fontSize: 12, cursor: 'pointer', marginRight: 6 }}>Edit</button>
              <button onClick={() => onDelete(task._id)} style={{ background: 'none', border: 'none', color: '#F87171', fontSize: 12, cursor: 'pointer' }}>✕</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange, readOnly }) {
  const [boardTasks, setBoardTasks] = useState(tasks)
  const [activeTask, setActiveTask] = useState(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!isDraggingRef.current) {
      setBoardTasks(tasks)
    }
  }, [tasks])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragStart(event) {
    if (readOnly) return
    isDraggingRef.current = true
    const activeData = event.active.data.current
    if (activeData && activeData.type === 'Task') {
      setActiveTask(activeData.task)
    }
  }

  function handleDragOver(event) {
    if (readOnly) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeData = active.data.current
    if (!activeData || activeData.type !== 'Task') return

    const overId = over.id
    
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

    const isOverAColumn = COLUMNS.some(col => col.id === overId)
    if (isOverAColumn) {
      setBoardTasks(prev => prev.map(t => {
        if (t._id === active.id) return { ...t, status: overId }
        return t
      }))
    }
  }

  function handleDragEnd(event) {
    if (readOnly) return
    const { active, over } = event
    setActiveTask(null)
    isDraggingRef.current = false

    if (!over) {
      setBoardTasks(tasks)
      return
    }

    const draggedTask = boardTasks.find(t => t._id === active.id)
    const originalTask = tasks.find(t => t._id === active.id)

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F4F4F6' }}>{col.label}</span>
                <span style={{ fontSize: 12, color: '#7C8296', marginLeft: 'auto' }}>{colTasks.length}</span>
              </div>

              <SortableContext id={col.id} items={colTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <ColumnContainer id={col.id} colTasks={colTasks}>
                  {colTasks.map(task => (
                    <TaskCard key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} readOnly={readOnly} />
                  ))}
                </ColumnContainer>
              </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} onEdit={onEdit} onDelete={onDelete} isOverlay={true} readOnly={readOnly} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
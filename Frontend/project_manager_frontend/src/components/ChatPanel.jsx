import { useState, useRef, useEffect } from 'react'
import { post } from '../api/client'
import { toast } from 'sonner'

// Parses task suggestion from AI response
// Parses task suggestion from AI response and normalizes values
function parseTaskSuggestion(text) {
  if (!text.includes('---TASK SUGGESTION---')) return null

  const block = text.split('---TASK SUGGESTION---')[1]?.split('---END---')[0]
  if (!block) return null

  const get = (key) => {
    const line = block.split('\n').find(l => l.startsWith(key + ':'))
    return line ? line.replace(key + ':', '').trim() : ''
  }

  // Get raw values from AI string
  const rawStatus = get('Status').toLowerCase()
  const rawPriority = get('Priority').toLowerCase()

  // Map AI outputs to your exact database enum variations
  let validatedStatus = 'todo' // Default fallback
  if (rawStatus.includes('progress') || rawStatus === 'in_progress') validatedStatus = 'in_progress'
  if (rawStatus.includes('backlog')) validatedStatus = 'backlog'
  if (rawStatus === 'todo') validatedStatus = 'todo'

  // Map AI priorities to match database expectations
  let validatedPriority = 'medium' // Default fallback
  if (rawPriority.includes('low')) validatedPriority = 'low'
  if (rawPriority.includes('med')) validatedPriority = 'medium'
  if (rawPriority.includes('high')) validatedPriority = 'high'
  if (rawPriority.includes('crit')) validatedPriority = 'critical'

  return {
    title: get('Title'),
    description: get('Description'),
    priority: validatedPriority,
    status: validatedStatus,
    dueDate: get('Due Date'),
  }
}


// Cleans the task suggestion block from the visible message
function cleanMessage(text) {
  return text.split('---TASK SUGGESTION---')[0].trim()
}

export default function ChatPanel({ isOpen, onClose, onUseTask }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! Tell me what you're working on and I'll help you plan tasks and deadlines." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      // Only send role + content to backend, skip the first assistant greeting
      const toSend = updatedMessages.slice(1).map(m => ({ role: m.role, content: m.content }))
      const res = await post('/chat', { messages: toSend })
      setMessages([...updatedMessages, { role: 'assistant', content: res.reply }])
    } catch (err) {
      toast.error(err.message)
    }

    setLoading(false)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 150 }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : -420,
        width: 400,
        height: '100vh',
        background: 'white',
        borderLeft: '1px solid #e5e5e5',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        transition: 'right 0.3s ease',
        boxShadow: isOpen ? '-4px 0 20px rgba(0,0,0,0.08)' : 'none'
      }}>

        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>AI Assistant</h2>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Powered by Groq</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 18, color: '#aaa', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            const suggestion = !isUser ? parseTaskSuggestion(msg.content) : null
            const displayText = !isUser ? cleanMessage(msg.content) : msg.content

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: isUser ? '#4f7c5f' : '#f5f5f0',
                  color: isUser ? 'white' : '#1a1a1a',
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {displayText}
                </div>

                {/* Task suggestion card */}
                {suggestion && suggestion.title && (
                  <div style={{
                    marginTop: 8,
                    padding: '12px 14px',
                    background: '#eef3f0',
                    border: '1px solid #c8ddd1',
                    borderRadius: 10,
                    maxWidth: '85%',
                    width: '100%'
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#4f7c5f', marginBottom: 8 }}>📋 Suggested Task</p>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{suggestion.title}</p>
                    {suggestion.description && <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{suggestion.description}</p>}
                    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#888', marginBottom: 10 }}>
                      <span>Priority: {suggestion.priority}</span>
                      <span>·</span>
                      <span>Due: {suggestion.dueDate}</span>
                    </div>
                    <button
                      onClick={() => onUseTask(suggestion)}
                      style={{
                        padding: '7px 14px',
                        background: '#4f7c5f',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Use this task →
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px 14px', background: '#f5f5f0', borderRadius: '12px 12px 12px 4px', fontSize: 13, color: '#aaa' }}>
                Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{ padding: '14px 20px', borderTop: '1px solid #eee', display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me to plan your tasks..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 13,
              outline: 'none',
              background: '#fafafa'
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 16px',
              background: loading || !input.trim() ? '#ccc' : '#4f7c5f',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </>
  )
}
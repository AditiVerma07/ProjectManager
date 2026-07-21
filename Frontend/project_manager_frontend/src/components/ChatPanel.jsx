import { useState, useRef, useEffect } from 'react'
import { post } from '../api/client'
import { toast } from 'sonner'

function parseTaskSuggestion(text) {
  if (!text.includes('---TASK SUGGESTION---')) return null

  const block = text.split('---TASK SUGGESTION---')[1]?.split('---END---')[0]
  if (!block) return null

  const get = (key) => {
    const line = block.split('\n').find(l => l.startsWith(key + ':'))
    return line ? line.replace(key + ':', '').trim() : ''
  }

  const rawStatus = get('Status').toLowerCase()
  const rawPriority = get('Priority').toLowerCase()

  let validatedStatus = 'todo'
  if (rawStatus.includes('progress') || rawStatus === 'in_progress') validatedStatus = 'in_progress'
  if (rawStatus.includes('backlog')) validatedStatus = 'backlog'
  if (rawStatus === 'todo') validatedStatus = 'todo'

  let validatedPriority = 'medium'
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
      const toSend = updatedMessages.slice(1).map(m => ({ role: m.role, content: m.content }))
      const res = await post('/chat', { messages: toSend })
      setMessages([...updatedMessages, { role: 'assistant', content: res.reply }])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150 }}
        />
      )}

      <div style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : -420,
        width: 400,
        height: '100vh',
        background: '#1B1F2B',
        borderLeft: '1px solid #2C3244',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        transition: 'right 0.3s ease',
        boxShadow: isOpen ? '-4px 0 20px rgba(0,0,0,0.3)' : 'none'
      }}>

        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2C3244', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F6' }}>AI Assistant</h2>
            <p style={{ fontSize: 12, color: '#7C8296', marginTop: 2 }}>Powered by Groq</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 18, color: '#7C8296', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

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
                  background: isUser ? '#F0883E' : '#242A3A',
                  color: isUser ? '#12141C' : '#F4F4F6',
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {displayText}
                </div>

                {suggestion && suggestion.title && (
                  <div style={{
                    marginTop: 8,
                    padding: '12px 14px',
                    background: 'rgba(240, 136, 62, 0.1)',
                    border: '1px solid rgba(240, 136, 62, 0.3)',
                    borderRadius: 10,
                    maxWidth: '85%',
                    width: '100%'
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#F0883E', marginBottom: 8 }}>📋 Suggested Task</p>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#F4F4F6' }}>{suggestion.title}</p>
                    {suggestion.description && <p style={{ fontSize: 12, color: '#B4B9C6', marginBottom: 6 }}>{suggestion.description}</p>}
                    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#7C8296', marginBottom: 10 }}>
                      <span>Priority: {suggestion.priority}</span>
                      <span>·</span>
                      <span>Due: {suggestion.dueDate}</span>
                    </div>
                    <button
                      onClick={() => onUseTask(suggestion)}
                      style={{
                        padding: '7px 14px',
                        background: '#F0883E',
                        color: '#12141C',
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
              <div style={{ padding: '10px 14px', background: '#242A3A', borderRadius: '12px 12px 12px 4px', fontSize: 13, color: '#7C8296' }}>
                Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} style={{ padding: '14px 20px', borderTop: '1px solid #2C3244', display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me to plan your tasks..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #2C3244',
              borderRadius: 8,
              fontSize: 13,
              outline: 'none',
              background: '#12141C',
              color: '#F4F4F6'
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 16px',
              background: loading || !input.trim() ? '#3A4256' : '#F0883E',
              color: loading || !input.trim() ? '#7C8296' : '#12141C',
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
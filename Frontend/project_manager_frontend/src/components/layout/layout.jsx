import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import Header from './header'
import ChatPanel from '../ChatPanel'

export default function Layout() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9f9f7' }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>

      {/* Chat button */}
      <button
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#4f7c5f',
          color: 'white',
          border: 'none',
          fontSize: 22,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100
        }}
      >
        💬
      </button>

     <ChatPanel
  isOpen={chatOpen}
  onClose={() => setChatOpen(false)}
  onUseTask={(task) => {
    setChatOpen(false)
    window.dispatchEvent(new CustomEvent('use-chat-task', { detail: task }))
  }}
/>
    </div>
  )
}
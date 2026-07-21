import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import Header from './header'
import ChatPanel from '../ChatPanel'

export default function Layout() {
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#12141C' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50
          }}
        />
      )}

      <div className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>

      <button
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#F0883E',
          color: '#12141C',
          border: 'none',
          fontSize: 22,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 70
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
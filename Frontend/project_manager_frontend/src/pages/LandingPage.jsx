import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#F4F4F6', background: '#12141C' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 60px',
        borderBottom: '1px solid #2C3244',
        position: 'sticky',
        top: 0,
        background: '#12141C',
        zIndex: 10
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F0883E' }}>Planify</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={ghostBtn}>
            Sign in
          </button>
          <button onClick={() => navigate('/register')} style={solidBtn}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '90px 20px 80px',
        background: '#1B1F2B'
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#F0883E', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>
          Project Management
        </p>
        <h2 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.2, marginBottom: 20, maxWidth: 600, margin: '0 auto 20px' }}>
          Manage your projects without the chaos
        </h2>
        <p style={{ fontSize: 16, color: '#B4B9C6', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Planify helps you and your team stay organized, track tasks and hit deadlines — all in one simple place.
        </p>
        <button onClick={() => navigate('/register')} style={{ ...solidBtn, fontSize: 15, padding: '13px 32px' }}>
          Start for free →
        </button>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 60px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#F0883E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          How it works
        </p>
        <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 50 }}>
          Up and running in 3 steps
        </h3>

        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { step: '01', title: 'Create an account', desc: 'Sign up for free in less than a minute. No credit card needed.' },
            { step: '02', title: 'Set up your project', desc: 'Create a project, add a description and invite your team members.' },
            { step: '03', title: 'Start tracking tasks', desc: 'Add tasks, set deadlines and move them across your Kanban board.' },
          ].map(item => (
            <div key={item.step} style={{
              width: 260,
              textAlign: 'left',
              padding: '28px 24px',
              border: '1px solid #2C3244',
              borderRadius: 12,
              background: '#1B1F2B'
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#F0883E', marginBottom: 12 }}>{item.step}</p>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{item.title}</h4>
              <p style={{ fontSize: 14, color: '#B4B9C6', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: '#F0883E',
        padding: '70px 20px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: 30, fontWeight: 700, color: '#12141C', marginBottom: 14 }}>
          Ready to get organized?
        </h3>
        <p style={{ fontSize: 15, color: 'rgba(18,20,28,0.75)', marginBottom: 32 }}>
          Join teams who use Planify to ship projects on time.
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '13px 32px',
            background: '#12141C',
            color: '#F0883E',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Get started for free →
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 60px',
        borderTop: '1px solid #2C3244',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#F0883E' }}>Planify</p>
        <p style={{ fontSize: 13, color: '#7C8296' }}>© 2025 Planify. All rights reserved.</p>
      </footer>

    </div>
  )
}

const solidBtn = {
  padding: '9px 18px',
  background: '#F0883E',
  color: '#12141C',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer'
}

const ghostBtn = {
  padding: '9px 18px',
  background: 'transparent',
  color: '#B4B9C6',
  border: '1px solid #2C3244',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer'
}
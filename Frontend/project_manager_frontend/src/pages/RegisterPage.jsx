import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

// Static phrases for the typewriter animation loop
const phrases = [
  'plan your entire day and manage all your team goals with absolute ease.', 
  'take control of your busy schedule and transform your daily ideas into achievements.', 
  'bring your creative projects to life and stay organized without feeling overwhelmed by work.', 
  'streamline your morning routine and seamlessly master your task list from one single dashboard.', 
  'clear the mental clutter, reduce your stress, and focus entirely on what matters today.'  
]

export default function RegisterPage() {
  const { register } = useAuth() // Uses the register method from your AuthContext
  const navigate = useNavigate()
  
  // Form states (Added 'name' for registration)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)

  // Typewriter states
  const [displayText, setDisplayText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(60)

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]
    
    const handleTyping = () => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.substring(0, charIndex + 1))
        setCharIndex(prev => prev + 1)
        setTypingSpeed(60)

        if (charIndex + 1 === currentPhrase.length) {
          setTypingSpeed(2500)
          setIsDeleting(true)
        }
      } else {
        setDisplayText(currentPhrase.substring(0, charIndex - 1))
        setCharIndex(prev => prev - 1)
        setTypingSpeed(30)

        if (charIndex - 1 === 0) {
          setIsDeleting(false)
          setPhraseIndex(prev => (prev + 1) % phrases.length)
          setTypingSpeed(200)
        }
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, phraseIndex, typingSpeed])

  const isEmailInvalid = emailTouched && email.length > 0 && !email.includes('@')

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address containing @')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f5f5f0',
      padding: '20px'
    }}>
      
      {/* Brand Header */}
      <div style={{ 
        width: 400, 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 14, 
        marginBottom: 24, 
        paddingLeft: 4 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: 40, 
          height: 40, 
          background: '#4f7c5f', 
          borderRadius: 10,
          boxShadow: '0 4px 12px rgba(79, 124, 95, 0.15)',
          marginTop: 2 
        }}>
          <span style={{ fontSize: 18, color: 'white' }}>📋</span>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2a4434', margin: 0, letterSpacing: '-0.02em' }}>Planify</h1>
          <p style={{ 
            color: '#70706a', 
            fontSize: 13.5, 
            margin: 0, 
            marginTop: 4, 
            lineHeight: 1.45, 
            minHeight: '40px' 
          }}>
            Hello! Welcome to your new clear workspace built to{' '}
            <span style={{ color: '#385944', fontWeight: 500 }}>{displayText}</span>
            <span style={{ 
              fontWeight: 'bold', 
              color: '#4f7c5f', 
              animation: 'blink 1s step-end infinite',
              marginLeft: '2px'
            }}>|</span>
          </p>
          
          <style>{`
            @keyframes blink {
              from, to { opacity: 1 }
              50% { opacity: 0 }
            }
          `}</style>
        </div>
      </div>

      {/* Registration Card Container */}
      <div style={{ width: 400, background: 'white', borderRadius: 16, padding: 36, border: '1px solid #e5e5e5', boxShadow: '0 4px 18px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: '#1a1a1a' }}>Get started</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Create your free workspace account</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#444' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              required
              style={inputStyle}
            />
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#444' }}>Email Address</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@example.com"
              required
              style={{
                ...inputStyle,
                border: isEmailInvalid ? '1px solid #e05c5c' : '1px solid #ddd' 
              }}
            />
            {isEmailInvalid && (
              <p style={{ color: '#e05c5c', fontSize: 12, marginTop: 4 }}>
                An '@' is required in the email address.
              </p>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#444' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="•••••••• (Min. 6 characters)"
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Creating Workspace...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#888', marginBottom: 0 }}>
          Already have an account? <Link to="/login" style={{ color: '#4f7c5f', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  background: '#fafafa',
  boxSizing: 'border-box'
}

const btnStyle = {
  width: '100%',
  padding: '11px',
  background: '#4f7c5f',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer'
}

// src/context/AuthProvider.jsx
import { useState, useEffect } from 'react'
import { get, post } from '../api/client'
import { AuthContext } from './AuthContext' // Import it from the new file

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('token')
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    get('/auth/me')
      .then(res => setUser(res.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await post('/auth/login', { email, password })
    localStorage.setItem('token', res.token)
    setUser(res.user)
  }

  async function register(name, email, password) {
    const res = await post('/auth/register', { name, email, password })
    localStorage.setItem('token', res.token)
    setUser(res.user)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// src/hooks/useAuth.js
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext' // Double check this path points to your context file

export function useAuth() {
  return useContext(AuthContext)
}

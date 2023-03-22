import { useRouter } from 'next/router'
import React, { createContext, useContext, useState, useEffect } from 'react'

import { AppContext } from './AppContext'

const AuthContext = createContext('')

function AuthProvider({ children }) {
  const { pathname, events } = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [pathname])

  const values = { loading, isAuthenticated, setIsAuthenticated }
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

const useAuth = () => useContext(AuthContext)

export { AuthProvider, useAuth }

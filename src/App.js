"use client"

import { useState, useEffect } from "react"
import LoginPage from "./components/LoginPage"
import Dashboard from "./components/Dashboard"
import "./app.css"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isSignup, setIsSignup] = useState(false)

  useEffect(() => {
    // Check for existing JWT token
    const token = localStorage.getItem("jwt_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem("user_data", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem("jwt_token")
    localStorage.removeItem("user_data")
  }

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem("user_data", JSON.stringify(updatedUser))
  }

  const handleSignup = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem("user_data", JSON.stringify(userData))
  }

  const toggleAuthMode = () => {
    setIsSignup(!isSignup)
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} onSignup={handleSignup} isSignup={isSignup} onToggleMode={toggleAuthMode} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />
      )}
    </div>
  )
}

export default App

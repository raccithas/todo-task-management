"use client"

import { useState } from "react"
import { auth, googleProvider, facebookProvider, database } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { ref, set, get } from "firebase/database"
import "./LoginPage.css"

const LoginPage = ({ onLogin, onSignup, isSignup, onToggleMode }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const buildUserData = (user, overrideName = null) => ({
    uid: user.uid,
    name: overrideName || user.displayName || "Anonymous User",
    email: user.email,
    avatar: user.photoURL || "👤",
    phone: user.phoneNumber || "N/A",
    bio: "Passionate developer who loves organizing tasks efficiently.",
    createdAt: Date.now(),
    lastLogin: Date.now()
  })

  // Function to store/update user data in Realtime Database
  const storeUserInDatabase = async (userData) => {
    try {
      const userRef = ref(database, `users/${userData.uid}/profile`)
      
      // Check if user already exists
      const snapshot = await get(userRef)
      
      if (snapshot.exists()) {
        // User exists, update last login time
        const existingData = snapshot.val()
        await set(userRef, {
          ...existingData,
          lastLogin: Date.now()
        })
      } else {
        // New user, store complete profile
        await set(userRef, userData)
      }
    } catch (error) {
      console.error("Error storing user data:", error)
      throw error
    }
  }

  // Function to fetch user data from Realtime Database
  const fetchUserFromDatabase = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}/profile`)
      const snapshot = await get(userRef)
      
      if (snapshot.exists()) {
        return snapshot.val()
      }
      return null
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      let userCredential
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const userData = buildUserData(userCredential.user, name)
        
        // Store user data in Realtime Database
        await storeUserInDatabase(userData)
        
        // Store JWT token
        localStorage.setItem("jwt_token", await userCredential.user.getIdToken())
        onSignup(userData)
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // Fetch user data from database
        let userData = await fetchUserFromDatabase(userCredential.user.uid)
        
        if (!userData) {
          // Fallback: create user data if not found in database
          userData = buildUserData(userCredential.user)
          await storeUserInDatabase(userData)
        } else {
          // Update last login
          await storeUserInDatabase({ ...userData, lastLogin: Date.now() })
        }
        
        // Store JWT token
        localStorage.setItem("jwt_token", await userCredential.user.getIdToken())
        onLogin(userData)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      
      // Check if user exists in database
      let userData = await fetchUserFromDatabase(result.user.uid)
      
      if (!userData) {
        // New user from Google
        userData = buildUserData(result.user, name || result.user.displayName)
        await storeUserInDatabase(userData)
      } else {
        // Existing user, update last login and any new info from Google
        const updatedData = {
          ...userData,
          name: userData.name || result.user.displayName || "Google User",
          avatar: result.user.photoURL || userData.avatar,
          lastLogin: Date.now()
        }
        await storeUserInDatabase(updatedData)
        userData = updatedData
      }
      
      // Store JWT token
      localStorage.setItem("jwt_token", await result.user.getIdToken())
      isSignup ? onSignup(userData) : onLogin(userData)
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookAuth = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, facebookProvider)
      
      // Check if user exists in database
      let userData = await fetchUserFromDatabase(result.user.uid)
      
      if (!userData) {
        // New user from Facebook
        userData = buildUserData(result.user, name || result.user.displayName)
        await storeUserInDatabase(userData)
      } else {
        // Existing user, update last login and any new info from Facebook
        const updatedData = {
          ...userData,
          name: userData.name || result.user.displayName || "Facebook User",
          avatar: result.user.photoURL || userData.avatar,
          lastLogin: Date.now()
        }
        await storeUserInDatabase(updatedData)
        userData = updatedData
      }
      
      // Store JWT token
      localStorage.setItem("jwt_token", await result.user.getIdToken())
      isSignup ? onSignup(userData) : onLogin(userData)
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-illustration">
          <div className="illustration-wrapper">
            <div className="phone-mockup">
              <div className="phone-screen"></div>
            </div>
            <div className="character">
              <div className="character-body"></div>
              <div className="character-head"></div>
            </div>
          </div>
        </div>

        <div className="login-content">
          <h1 className="login-title">{isSignup ? "Join Katomaran" : "Katomaran ToDo App"}</h1>
          <p className="login-subtitle">
            {isSignup
              ? "Create your account to organize your work with priority and do everything without stress."
              : "Let's organize your work with priority and do everything without stress."}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {isSignup && (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="login-input"
                />
                <span className="input-icon">👤</span>
              </div>
            )}

            <div className="input-group">
              <input
                type="email"
                placeholder="Username or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
              <span className="input-icon">✉️</span>
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (isSignup ? "Creating Account..." : "Logging in...") : isSignup ? "Sign Up" : "Login"}
            </button>
          </form>

          <div className="social-login">
            {/* <button className="social-button facebook" onClick={handleFacebookAuth}>
              <span className="social-icon">📘</span>
              Facebook
            </button> */}
            <button className="social-button google" onClick={handleGoogleAuth}>
              <span className="social-icon">🔍</span>
              Google
            </button>
          </div>

          <div className="auth-toggle">
            <p>
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button type="button" className="toggle-link" onClick={onToggleMode}>
                {isSignup ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
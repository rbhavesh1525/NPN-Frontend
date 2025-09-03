import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email and password
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // Don't redirect automatically, we'll handle OTP verification
          emailRedirectTo: `${window.location.origin}/pages/dashboard`
        },
      })
      
      if (error) {
        console.error('Signup error:', error)
        return { data: null, error }
      }
      
      console.log('Signup successful:', data)
      return { data, error: null }
    } catch (err) {
      console.error('Signup exception:', err)
      return { data: null, error: { message: err.message } }
    }
  }

  // Verify OTP for email confirmation
  const verifyOtp = async (email, token, type = 'signup') => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: type
      })
      
      if (error) {
        console.error('OTP verification error:', error)
        return { data: null, error }
      }
      
      console.log('OTP verification successful:', data)
      return { data, error: null }
    } catch (err) {
      console.error('OTP verification exception:', err)
      return { data: null, error: { message: err.message } }
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Signin error:', error)
        return { data: null, error }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Signin exception:', err)
      return { data: null, error: { message: err.message } }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/pages/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('Google OAuth error:', error)
      }
      
      return { data, error }
    } catch (err) {
      console.error('Google OAuth exception:', err)
      return { data: null, error: { message: err.message } }
    }
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Resend email confirmation
  const resendConfirmation = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    return { data, error }
  }

  // Reset password
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  // Update password
  const updatePassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })
    return { data, error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    verifyOtp,
    resendConfirmation,
    resetPassword,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

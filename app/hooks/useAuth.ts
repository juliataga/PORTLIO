'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: number
  user_id: string
  full_name: string | null
  email: string
  plan_id: string
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user }))
  }, [])

  const setProfile = useCallback((profile: UserProfile | null) => {
    setState(prev => ({ ...prev, profile }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            const newProfile = {
              user_id: userId,
              email: userData.user.email || '',
              full_name: userData.user.user_metadata?.full_name || null,
              plan_id: 'free',
              trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            }

            const { data: createdProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert(newProfile)
              .select()
              .single()

            if (createError) {
              console.error('Error creating profile:', createError)
              setError(createError.message)
            } else {
              setProfile(createdProfile)
              
              // Track signup event
              await supabase.from('user_events').insert({
                user_id: userId,
                event_type: 'signup',
                event_data: { 
                  source: 'direct',
                  trial_started: true 
                }
              })
            }
          }
        } else {
          console.error('Error loading profile:', error)
          setError(error.message)
        }
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [setProfile, setError])

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setError(error.message)
        setUser(null)
        setProfile(null)
        return
      }
      
      setUser(user)
      
      if (user) {
        await loadUserProfile(user.id)
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize auth')
    } finally {
      setLoading(false)
    }
  }, [setUser, setProfile, setLoading, setError, loadUserProfile])

  useEffect(() => {
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        console.log('Auth state changed:', event)
        
        const user = session?.user ?? null
        setUser(user)
        
        if (user) {
          await loadUserProfile(user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [initializeAuth, setUser, setProfile, setLoading, loadUserProfile])

  const signOut = useCallback(async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        return false
      }
      
      // Clear state
      setUser(null)
      setProfile(null)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setError(message)
      return false
    }
  }, [setUser, setProfile, setError])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.user || !state.profile) {
      const error = 'No user logged in'
      setError(error)
      return { error }
    }

    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', state.user.id)
        .select()
        .single()

      if (error) {
        setError(error.message)
        return { error: error.message }
      }

      setProfile(data)
      return { data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed'
      setError(message)
      return { error: message }
    }
  }, [state.user, state.profile, setProfile, setError])

  const isTrialActive = useCallback(() => {
    if (!state.profile?.trial_ends_at) return false
    return new Date(state.profile.trial_ends_at) > new Date()
  }, [state.profile?.trial_ends_at])

  const getTrialDaysLeft = useCallback(() => {
    if (!state.profile?.trial_ends_at) return 0
    const trialEnd = new Date(state.profile.trial_ends_at)
    const now = new Date()
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }, [state.profile?.trial_ends_at])

  const refresh = useCallback(() => {
    initializeAuth()
  }, [initializeAuth])

  return {
    // State
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    
    // Actions
    signOut,
    updateProfile,
    refresh,
    
    // Helper functions
    isTrialActive,
    getTrialDaysLeft,
    isAuthenticated: !!state.user,
    isPro: state.profile?.plan_id === 'pro' || state.profile?.plan_id === 'agency',
    isAgency: state.profile?.plan_id === 'agency',
    isFree: state.profile?.plan_id === 'free' || !state.profile?.plan_id,
    
    // User info helpers
    displayName: state.profile?.full_name || state.user?.email || 'User',
    email: state.user?.email || '',
    planName: state.profile?.plan_id || 'free',
    
    // Trial status
    trialEnded: !isTrialActive() && state.profile?.trial_ends_at,
    trialDaysLeft: getTrialDaysLeft(),
  }
}
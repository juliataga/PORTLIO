import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export type UserType = 'freelancer' | 'client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUserType(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId)

      // Check if user is a client FIRST
      const { data: clientProfile, error: clientError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('Client profile check:', clientProfile, clientError)

      if (clientProfile && !clientError) {
        console.log('User is a CLIENT')
        setUserType('client')
        setProfile(clientProfile)
        return 'client'
      }

      // If not a client, check freelancer profile
      const { data: freelancerProfile, error: freelancerError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('Freelancer profile check:', freelancerProfile, freelancerError)

      if (freelancerProfile && !freelancerError) {
        console.log('User is a FREELANCER')
        setUserType('freelancer')
        setProfile(freelancerProfile)
        return 'freelancer'
      }

      // Default to freelancer for new users
      console.log('Defaulting to FREELANCER')
      setUserType('freelancer')
      await ensureFreelancerProfile(userId)
      return 'freelancer'

    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserType('freelancer')
      await ensureFreelancerProfile(userId)
      return 'freelancer'
    }
  }

  const ensureFreelancerProfile = async (userId: string) => {
    try {
      await supabase
        .from('user_subscriptions')
        .upsert(
          {
            user_id: userId,
            plan_id: 'free',
            status: 'active'
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: true
          }
        )
    } catch (error) {
      console.error('Error creating freelancer subscription:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUserType(null)
    setProfile(null)
    router.push('/')
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // If login successful, determine user type and redirect
    if (data.user && !error) {
      const accountType = await loadUserProfile(data.user.id)
      
      // Redirect based on account type
      setTimeout(() => {
        if (accountType === 'client') {
          router.push('/client-dashboard')
        } else {
          router.push('/dashboard')
        }
      }, 500)
    }

    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string, accountType: UserType = 'freelancer') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (data.user && !error) {
      if (accountType === 'client') {
        await createClientProfile(data.user.id)
        setUserType('client')
      } else {
        await ensureFreelancerProfile(data.user.id)
        setUserType('freelancer')
      }
    }

    return { data, error }
  }

  const createClientProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .insert({
          user_id: userId,
          contact_person: '',
          company_name: '',
          is_client: true
        })
        .select()
        .single()

      console.log('Created client profile:', data, error)
      
      if (!error) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error creating client profile:', error)
    }
  }

  const redirectToDashboard = () => {
    console.log('Redirecting based on user type:', userType)
    if (userType === 'client') {
      router.push('/client-dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  return {
    user,
    userType,
    profile,
    loading,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    isAuthenticated: !!user,
    isClient: userType === 'client',
    isFreelancer: userType === 'freelancer',
    redirectToDashboard,
  }
}
// app/onboarding/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole)
    setStep(2)
  }

  const handleGoalToggle = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    )
  }

  const completeOnboarding = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          role,
          company,
          team_size: teamSize,
          goals,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      await supabase.from('user_events').insert({
        user_id: user.id,
        event_type: 'onboarding_completed',
        event_data: { role, company, team_size: teamSize, goals }
      })

      toast.success("Welcome to Portlio! Let's create your first portal.")
      router.push('/dashboard/create?onboarding=true')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { id: 'freelancer', title: 'Freelancer', desc: 'Independent contractor or consultant', icon: '👤' },
    { id: 'agency_owner', title: 'Agency Owner', desc: 'Running a creative or marketing agency', icon: '🏢' },
    { id: 'consultant', title: 'Consultant', desc: 'Business or technical consultant', icon: '🎯' },
    { id: 'other', title: 'Other', desc: 'Something else entirely', icon: '✨' }
  ]

  const goalOptions = [
    'Streamline client onboarding',
    'Collect payments faster',
    'Reduce back-and-forth emails',
    'Look more professional',
    'Organize client files',
    'Track project progress',
    'Automate workflows',
    'Scale my business'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress bar and conditional steps go here */}
        {/* Skipping for brevity; you can paste full JSX and I’ll indent it */}
      </div>
    </div>
  )
}

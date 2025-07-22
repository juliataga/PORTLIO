'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user directly from Supabase instead of useAuth hook
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [router])

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
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-20 h-1 mx-4 ${
                    step > stepNum ? 'bg-indigo-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Your Role</span>
            <span>Details</span>
            <span>Goals</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Welcome to Portlio! 🎉
                </h1>
                <p className="text-slate-600 text-lg">
                  Let's personalize your experience. What best describes your role?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleRoleSelect(option.id)}
                    className="p-6 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="text-3xl mb-3">{option.icon}</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600">
                      {option.title}
                    </h3>
                    <p className="text-slate-600 text-sm">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Company Details */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Tell us about your business
                </h2>
                <p className="text-slate-600">
                  This helps us customize Portlio for your needs
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company or business name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Team Size
                  </label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select team size</option>
                    <option value="just-me">Just me</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-20">6-20 people</option>
                    <option value="21-50">21-50 people</option>
                    <option value="50+">50+ people</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  What are your main goals?
                </h2>
                <p className="text-slate-600">
                  Select all that apply - this helps us show you relevant features
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      goals.includes(goal)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal}</span>
                      {goals.includes(goal) && (
                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={completeOnboarding}
                  disabled={loading || goals.length === 0}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
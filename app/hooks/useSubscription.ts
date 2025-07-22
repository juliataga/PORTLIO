import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type PlanLimits = {
  plan_id: string
  max_portals: number
  max_monthly_views: number
  has_custom_branding: boolean
  has_analytics: boolean
}

export type UsageStats = {
  portals_created: number
  monthly_views: number
  files_uploaded: number
}

export type Subscription = {
  id: number
  plan_id: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
}

const DEFAULT_PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    plan_id: 'free',
    max_portals: 2,
    max_monthly_views: 50,
    has_custom_branding: false,
    has_analytics: false
  },
  pro: {
    plan_id: 'pro',
    max_portals: 999999, // "unlimited"
    max_monthly_views: 999999,
    has_custom_branding: true,
    has_analytics: true
  },
  agency: {
    plan_id: 'agency',
    max_portals: 999999,
    max_monthly_views: 999999,
    has_custom_branding: true,
    has_analytics: true
  }
}

export function useSubscription() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadSubscriptionData(user)
      } else {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const loadSubscriptionData = async (currentUser: any) => {
    if (!currentUser) return

    try {
      // Load user profile to get plan_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('plan_id')
        .eq('user_id', currentUser.id)
        .single()

      const planId = profile?.plan_id || 'free'

      // Set plan limits (use defaults for now, can be database-driven later)
      setPlanLimits(DEFAULT_PLAN_LIMITS[planId] || DEFAULT_PLAN_LIMITS.free)

      // Load subscription if exists
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      if (!subError) {
        setSubscription(subData)
      }

      // Load usage stats
      await loadUsageStats(currentUser)

    } catch (err) {
      console.error('Error loading subscription:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Set default free plan if error
      setPlanLimits(DEFAULT_PLAN_LIMITS.free)
    } finally {
      setLoading(false)
    }
  }

  const loadUsageStats = async (currentUser: any) => {
    try {
      // Get portals count
      const { count: portalsCount } = await supabase
        .from('portals')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id)

      // Get monthly views (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: monthlyViews } = await supabase
        .from('portal_analytics')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id)
        .eq('event_type', 'view')
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Get files count (approximate)
      const { count: filesCount } = await supabase
        .from('uploaded_files')
        .select('*', { count: 'exact' })
        .eq('uploaded_by', currentUser.id)

      setUsage({
        portals_created: portalsCount || 0,
        monthly_views: monthlyViews || 0,
        files_uploaded: filesCount || 0
      })

    } catch (err) {
      console.error('Error loading usage stats:', err)
      setUsage({
        portals_created: 0,
        monthly_views: 0,
        files_uploaded: 0
      })
    }
  }

  const canCreatePortal = () => {
    if (!planLimits || !usage) return false
    return usage.portals_created < planLimits.max_portals
  }

  const getUsagePercentage = (type: 'portals' | 'views') => {
    if (!planLimits || !usage) return 0
    
    if (type === 'portals') {
      return Math.min(100, (usage.portals_created / planLimits.max_portals) * 100)
    }
    
    if (type === 'views') {
      return Math.min(100, (usage.monthly_views / planLimits.max_monthly_views) * 100)
    }
    
    return 0
  }

  const upgrade = async (planId: string) => {
    // This will integrate with Stripe later
    // For now, just a placeholder
    console.log(`Upgrading to plan: ${planId}`)
    
    // Redirect to Stripe checkout or show upgrade modal
    // Implementation depends on your Stripe setup
    throw new Error('Stripe integration not yet implemented')
  }

  const isOverLimit = (type: 'portals' | 'views') => {
    if (!planLimits || !usage) return false
    
    if (type === 'portals') {
      return usage.portals_created >= planLimits.max_portals
    }
    
    if (type === 'views') {
      return usage.monthly_views >= planLimits.max_monthly_views
    }
    
    return false
  }

  return {
    subscription,
    planLimits,
    usage,
    loading,
    error,
    canCreatePortal,
    getUsagePercentage,
    upgrade,
    isOverLimit,
    // Helper functions
    isPro: planLimits?.plan_id === 'pro' || planLimits?.plan_id === 'agency',
    isFree: planLimits?.plan_id === 'free',
    hasCustomBranding: planLimits?.has_custom_branding || false,
    hasAnalytics: planLimits?.has_analytics || false,
  }
}
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

export function useSubscription() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get user directly instead of using useAuth hook
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadSubscriptionData(user)
      }
    }
    getUser()
  }, [])

  const loadSubscriptionData = async (currentUser: any) => {
    if (!currentUser) return

    try {
      // Load subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      if (subError && subError.code !== 'PGRST116') { // Not found is OK
        console.error('Subscription error:', subError)
      } else {
        setSubscription(subData)
      }

      // Load plan limits - try direct query first
      const { data: limitsData, error: limitsError } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan_id', subData?.plan_id || 'free')
        .single()

      if (limitsError) {
        console.error('Plan limits error:', limitsError)
        // Set default free plan limits if error
        setPlanLimits({
          plan_id: 'free',
          max_portals: 2,
          max_monthly_views: 50,
          has_custom_branding: false,
          has_analytics: false
        })
      } else {
        setPlanLimits(limitsData)
      }

      // Load usage stats
      await loadUsageStats(currentUser)

    } catch (err) {
      console.error('Error loading subscription:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const loadUsageStats = async (currentUser: any) => {
    if (!currentUser) return

    try {
      // Count portals
      const { count: portalCount } = await supabase
        .from('portals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)

      // Count monthly views (simplified)
      const { count: viewCount } = await supabase
        .from('portal_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      setUsage({
        portals_created: portalCount || 0,
        monthly_views: viewCount || 0,
        files_uploaded: 0 // TODO: implement file counting
      })
    } catch (error) {
      console.error('Error loading usage stats:', error)
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

  const getUsagePercentage = (metric: 'portals' | 'views') => {
    if (!planLimits || !usage) return 0
    
    if (metric === 'portals') {
      return Math.round((usage.portals_created / planLimits.max_portals) * 100)
    }
    if (metric === 'views') {
      return Math.round((usage.monthly_views / planLimits.max_monthly_views) * 100)
    }
    return 0
  }

  const upgrade = async (planId: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      // TODO: Implement Stripe checkout
      console.log(`Upgrading to ${planId}`)
      // This would typically redirect to Stripe checkout
      window.location.href = `/api/stripe/checkout?plan=${planId}`
    } catch (error) {
      console.error('Upgrade error:', error)
      throw error
    }
  }

  return {
    subscription,
    planLimits,
    usage,
    loading,
    error,
    canCreatePortal,
    getUsagePercentage,
    upgrade
  }
}
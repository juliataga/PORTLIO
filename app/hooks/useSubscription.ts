import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

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
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSubscriptionData()
    }
  }, [user])

  const loadSubscriptionData = async () => {
    if (!user) return

    try {
      // Load subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subError && subError.code !== 'PGRST116') { // Not found is OK
        throw subError
      }

      setSubscription(subData)

      // Load plan limits
      const { data: limitsData, error: limitsError } = await supabase
        .rpc('get_user_plan_limits', { user_uuid: user.id })
        .single()

      if (limitsError) throw limitsError
      setPlanLimits(limitsData)

      // Load usage stats
      await loadUsageStats()

    } catch (err) {
      console.error('Error loading subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  const loadUsageStats = async () => {
    if (!user) return

    try {
      // Get portals count
      const { count: portalsCount } = await supabase
        .from('portals')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      // Get monthly views (this month)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: viewsCount } = await supabase
        .from('portal_analytics')
        .select('*', { count: 'exact' })
        .gte('created_at', startOfMonth.toISOString())
        .eq('event_type', 'view')

      // Get files uploaded count
      const { count: filesCount } = await supabase
        .from('uploaded_files')
        .select('*', { count: 'exact' })
        .in('portal_slug', 
          (await supabase
            .from('portals')
            .select('slug')
            .eq('user_id', user.id)
          ).data?.map(p => p.slug) || []
        )

      setUsage({
        portals_created: portalsCount || 0,
        monthly_views: viewsCount || 0,
        files_uploaded: filesCount || 0
      })

    } catch (err) {
      console.error('Error loading usage stats:', err)
    }
  }

  const canCreatePortal = () => {
    if (!planLimits || !usage) return false
    return usage.portals_created < planLimits.max_portals
  }

  const isAtViewLimit = () => {
    if (!planLimits || !usage) return false
    return usage.monthly_views >= planLimits.max_monthly_views
  }

  const getUsagePercentage = (type: 'portals' | 'views') => {
    if (!planLimits || !usage) return 0

    if (type === 'portals') {
      return planLimits.max_portals === 999999 ? 0 : 
        (usage.portals_created / planLimits.max_portals) * 100
    } else {
      return planLimits.max_monthly_views === 999999 ? 0 :
        (usage.monthly_views / planLimits.max_monthly_views) * 100
    }
  }

  const upgrade = async (planId: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Error creating checkout:', err)
      throw err
    }
  }

  const manageBilling = async () => {
    if (!subscription?.stripe_customer_id) {
      throw new Error('No customer ID found')
    }

    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL returned')
      }
    } catch (err) {
      console.error('Error creating portal session:', err)
      throw err
    }
  }

  return {
    subscription,
    planLimits,
    usage,
    loading,
    error,
    canCreatePortal,
    isAtViewLimit,
    getUsagePercentage,
    upgrade,
    manageBilling,
    refresh: loadSubscriptionData
  }
}
// hooks/useFeatureAccess.ts
import { useSubscription } from './useSubscription'

export function useFeatureAccess() {
  const { planLimits, usage, loading } = useSubscription()

  const hasFeature = (feature: string): boolean => {
    if (loading || !planLimits) return false

    const features: Record<string, boolean> = {
      custom_branding: planLimits.has_custom_branding,
      analytics: planLimits.has_analytics,
      password_protection: planLimits.plan_id !== 'free',
      custom_domains: planLimits.plan_id !== 'free',
      api_access: planLimits.plan_id === 'agency',
      team_collaboration: planLimits.plan_id === 'agency',
      white_label: planLimits.plan_id === 'agency',
      priority_support: planLimits.plan_id !== 'free',
      file_uploads: true, // All plans
      basic_templates: true, // All plans
    }

    return features[feature] || false
  }

  const canUseFeature = (feature: string): { allowed: boolean; reason?: string } => {
    if (loading) return { allowed: false, reason: 'Loading...' }

    if (!hasFeature(feature)) {
      return { 
        allowed: false, 
        reason: `${feature.replace('_', ' ')} is available in paid plans` 
      }
    }

    // Check usage limits
    if (!usage || !planLimits) return { allowed: true }

    switch (feature) {
      case 'create_portal':
        if (usage.portals_created >= planLimits.max_portals) {
          return { 
            allowed: false, 
            reason: `Portal limit reached (${planLimits.max_portals})` 
          }
        }
        break
      
      case 'portal_views':
        if (usage.monthly_views >= planLimits.max_monthly_views) {
          return { 
            allowed: false, 
            reason: `Monthly view limit reached (${planLimits.max_monthly_views})` 
          }
        }
        break
    }

    return { allowed: true }
  }

  const getUpgradeMessage = (feature: string): string => {
    const planName = planLimits?.plan_id === 'free' ? 'Professional' : 'Agency'
    const price = planLimits?.plan_id === 'free' ? '$29' : '$79'
    
    return `Upgrade to ${planName} (${price}/mo) to unlock ${feature.replace('_', ' ')}`
  }

  return {
    hasFeature,
    canUseFeature,
    getUpgradeMessage,
    currentPlan: planLimits?.plan_id || 'free',
    isLoading: loading
  }
}
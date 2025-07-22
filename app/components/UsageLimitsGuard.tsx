// components/UsageLimitsGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UsageLimitsGuardProps {
  children: React.ReactNode
  action: 'create_portal' | 'view_portal' | 'upload_file'
  portalId?: string
  onLimitReached?: () => void
}

export default function UsageLimitsGuard({ 
  children, 
  action, 
  portalId,
  onLimitReached 
}: UsageLimitsGuardProps) {
  const { 
    planLimits, 
    usage, 
    loading, 
    canCreatePortal, 
    isAtViewLimit,
    upgrade 
  } = useSubscription()
  const router = useRouter()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const checkLimits = () => {
    if (loading || !planLimits || !usage) return true

    switch (action) {
      case 'create_portal':
        if (!canCreatePortal()) {
          setShowUpgradeModal(true)
          onLimitReached?.()
          return false
        }
        break
      
      case 'view_portal':
        if (isAtViewLimit()) {
          toast.error('Monthly view limit reached. Upgrade to continue serving clients.')
          onLimitReached?.()
          return false
        }
        break
      
      case 'upload_file':
        // Check file upload limits based on plan
        const maxFileSize = planLimits.plan_id === 'free' ? 10 : // 10MB for free
                           planLimits.plan_id === 'professional' ? 100 : // 100MB for pro
                           500 // 500MB for agency
        // This would be used in file upload component
        break
    }

    return true
  }

  const handleUpgrade = async (planId: string) => {
    try {
      await upgrade(planId)
    } catch (error) {
      toast.error('Failed to start upgrade process')
    }
  }

  if (loading) {
    return <div className="animate-pulse">{children}</div>
  }

  return (
    <>
      <div 
        onClick={(e) => {
          if (!checkLimits()) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        className={checkLimits() ? '' : 'pointer-events-none opacity-50'}
      >
        {children}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Portal Limit Reached</h3>
              <p className="text-slate-600">
                You've reached your limit of {planLimits?.max_portals} portals. 
                Upgrade to create more professional client portals.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleUpgrade('professional')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Upgrade to Professional - $29/mo
                <div className="text-sm text-indigo-100 mt-1">10 portals + custom branding</div>
              </button>
              
              <button
                onClick={() => handleUpgrade('agency')}
                className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                Upgrade to Agency - $79/mo
                <div className="text-sm text-slate-500 mt-1">Unlimited portals + team features</div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/pricing')}
                className="flex-1 bg-slate-100 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors"
              >
                View All Plans
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


// components/UpgradePrompt.tsx
'use client'

import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'

interface UpgradePromptProps {
  trigger: 'usage_warning' | 'feature_lock' | 'limit_reached'
  feature?: string
  currentUsage?: number
  limit?: number
}

export function UpgradePrompt({ trigger, feature, currentUsage, limit }: UpgradePromptProps) {
  const { planLimits, upgrade } = useSubscription()
  const router = useRouter()
  const [isUpgrading, setIsUpgrading] = useState(false)

  if (planLimits?.plan_id !== 'free') return null

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true)
    try {
      await upgrade(planId)
    } catch (error) {
      setIsUpgrading(false)
    }
  }

  const getPromptContent = () => {
    switch (trigger) {
      case 'usage_warning':
        return {
          title: 'You\'re approaching your limit',
          description: `You've used ${currentUsage} of ${limit} ${feature}. Upgrade to avoid interruption.`,
          urgency: 'medium'
        }
      case 'feature_lock':
        return {
          title: `${feature} is a Pro feature`,
          description: 'Upgrade to unlock custom branding, analytics, and more professional features.',
          urgency: 'low'
        }
      case 'limit_reached':
        return {
          title: 'Limit reached',
          description: `You've reached your ${feature} limit. Upgrade to continue.`,
          urgency: 'high'
        }
    }
  }

  const content = getPromptContent()
  
  return (
    <div className={`rounded-xl p-4 border ${
      content.urgency === 'high' ? 'bg-red-50 border-red-200' :
      content.urgency === 'medium' ? 'bg-orange-50 border-orange-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          content.urgency === 'high' ? 'bg-red-100' :
          content.urgency === 'medium' ? 'bg-orange-100' :
          'bg-blue-100'
        }`}>
          {content.urgency === 'high' ? '🚨' : content.urgency === 'medium' ? '⚠️' : '✨'}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 mb-1">{content.title}</h4>
          <p className="text-sm text-slate-600 mb-3">{content.description}</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpgrade('professional')}
              disabled={isUpgrading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isUpgrading ? 'Processing...' : 'Upgrade Now'}
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Sparkles, Globe, Shield, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

type Template = {
  id: string
  name: string
  description: string
  preview: string
  features: string[]
  isPopular?: boolean
}

const templates: Template[] = [
  {
    id: 'freelancer',
    name: 'Freelancer Pro',
    description: 'Perfect for freelancers and consultants collecting project requirements and payments.',
    preview: '👋 Welcome → 💰 Payment → 📁 Files → ✅ Approval',
    features: ['Welcome message', 'Project payment', 'File upload', 'Contract approval'],
    isPopular: true
  },
  {
    id: 'agency',
    name: 'Agency Complete',
    description: 'Comprehensive onboarding for agencies with multiple deliverables and team collaboration.',
    preview: '🚀 Project Brief → 💰 Invoice → 📊 Assets → 🎯 Goals → ✅ Kickoff',
    features: ['Project briefing', 'Multi-stage payments', 'Asset collection', 'Goal setting', 'Team introductions'],
  },
  {
    id: 'minimal',
    name: 'Simple & Clean',
    description: 'Minimalist approach for quick client onboarding with essential elements only.',
    preview: '👋 Welcome → 📝 Info → 💰 Payment → ✅ Done',
    features: ['Clean welcome', 'Client information', 'Single payment', 'Completion confirmation'],
  }
]

export default function CreatePortalPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Step 1: Basic Info
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  
  // Step 2: Template
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  
  // Step 3: Settings
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [password, setPassword] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4f46e5')

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        toast.error('Portal title is required')
        return
      }
      // Auto-generate slug if not provided
      if (!customSlug) {
        setCustomSlug(generateSlug(title))
      }
    }
    
    if (currentStep === 2) {
      if (!selectedTemplate) {
        toast.error('Please select a template')
        return
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleCreate = async () => {
    if (!title.trim() || !selectedTemplate) {
      toast.error('Please complete all required fields')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create unique slug
      const baseSlug = customSlug || generateSlug(title)
      const finalSlug = `${baseSlug}-${Date.now()}`

      // Create portal
      const { data: portal, error: portalError } = await supabase
        .from('portals')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: description.trim(),
            slug: finalSlug,
            is_published: false,
            password: isPasswordProtected ? password : null,
            branding: {
              primary_color: primaryColor,
              template: selectedTemplate
            }
          }
        ])
        .select()
        .single()

      if (portalError) throw portalError

      // Create default content blocks based on template
      const template = templates.find(t => t.id === selectedTemplate)
      if (template && portal) {
        const defaultBlocks = getDefaultBlocksForTemplate(selectedTemplate, portal.id)
        
        const { error: blocksError } = await supabase
          .from('content_blocks')
          .insert(defaultBlocks)

        if (blocksError) {
          console.error('Error creating default blocks:', blocksError)
          // Don't fail the whole operation for this
        }
      }

      toast.success('Portal created successfully!')
      router.push(`/dashboard/edit/${portal.id}`)

    } catch (error: any) {
      console.error('Portal creation error:', error)
      toast.error(error.message || 'Failed to create portal')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultBlocksForTemplate = (templateId: string, portalId: number) => {
    const baseBlocks = [
      {
        portal_id: portalId,
        type: 'text',
        title: 'Welcome to Your Project',
        content: 'We\'re excited to work with you! Please complete the items below to get started.',
        block_order: 1,
        settings: {}
      }
    ]

    if (templateId === 'freelancer') {
      return [
        ...baseBlocks,
        {
          portal_id: portalId,
          type: 'payment',
          title: 'Project Payment',
          content: 'Please complete your project payment to begin work.',
          block_order: 2,
          settings: { amount: 1000, currency: 'USD' }
        },
        {
          portal_id: portalId,
          type: 'upload',
          title: 'Upload Your Files',
          content: 'Please upload any brand assets, logos, or materials we\'ll need.',
          block_order: 3,
          settings: { max_files: 10, max_size: '10MB' }
        }
      ]
    }

    if (templateId === 'agency') {
      return [
        ...baseBlocks,
        {
          portal_id: portalId,
          type: 'text',
          title: 'Project Brief',
          content: 'Let\'s start by understanding your project goals and requirements.',
          block_order: 2,
          settings: {}
        },
        {
          portal_id: portalId,
          type: 'payment',
          title: 'Initial Payment',
          content: 'First milestone payment to begin the project.',
          block_order: 3,
          settings: { amount: 2500, currency: 'USD' }
        },
        {
          portal_id: portalId,
          type: 'upload',
          title: 'Brand Assets',
          content: 'Upload your brand guidelines, logos, and inspiration materials.',
          block_order: 4,
          settings: { max_files: 20, max_size: '25MB' }
        }
      ]
    }

    // Minimal template
    return [
      ...baseBlocks,
      {
        portal_id: portalId,
        type: 'payment',
        title: 'Payment',
        content: 'Complete payment to proceed.',
        block_order: 2,
        settings: { amount: 500, currency: 'USD' }
      }
    ]
  }

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Portal details' },
    { number: 2, title: 'Template', description: 'Choose your style' },
    { number: 3, title: 'Settings', description: 'Customize & create' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <div className="h-6 w-px bg-slate-300"></div>
            <h1 className="text-xl font-bold text-slate-900">Create New Portal</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                  currentStep >= step.number
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 ml-4 transition-colors ${
                    currentStep > step.number + 1 ? 'bg-indigo-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className={`text-sm font-medium transition-colors ${
                  currentStep >= step.number ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 shadow-lg">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Let's create your portal</h2>
                <p className="text-slate-600">Start by giving your portal a name and description</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Portal Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      if (!customSlug) {
                        setCustomSlug(generateSlug(e.target.value))
                      }
                    }}
                    placeholder="e.g., Welcome to Your Website Project"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this portal is for..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Portal URL
                  </label>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-sm mr-2">portlio.com/</span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(generateSlug(e.target.value))}
                      placeholder="your-portal-name"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Your clients will access the portal at this URL</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose your template</h2>
                <p className="text-slate-600">Select a template that matches your workflow</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {template.isPopular && (
                      <div className="absolute -top-3 left-4">
                        <span className="bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-slate-600 mb-4">{template.description}</p>
                      <div className="text-xs text-slate-500 bg-slate-100 rounded-lg p-3 font-mono">
                        {template.preview}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 mb-2">Includes:</div>
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="w-3 h-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {selectedTemplate === template.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Configure your portal</h2>
                <p className="text-slate-600">Customize security and branding settings</p>
              </div>

              <div className="space-y-8 max-w-2xl mx-auto">
                {/* Password Protection */}
                <div className="p-6 bg-slate-50 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Password Protection</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Require a password for clients to access this portal
                      </p>
                      {isPasswordProtected && (
                        <input
                          type="text"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter portal password"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPasswordProtected}
                        onChange={(e) => setIsPasswordProtected(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* Primary Color */}
                <div className="p-6 bg-slate-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Brand Color</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Choose a primary color that matches your brand
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-white shadow-lg cursor-pointer"
                    />
                    <div className="flex gap-2">
                      {['#4f46e5', '#dc2626', '#059669', '#ea580c', '#7c3aed'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setPrimaryColor(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            primaryColor === color ? 'border-slate-400 scale-110' : 'border-white'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Portal Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Title:</span> {title}</div>
                    <div><span className="font-medium">URL:</span> portlio.com/{customSlug || 'your-portal'}</div>
                    <div><span className="font-medium">Template:</span> {templates.find(t => t.id === selectedTemplate)?.name}</div>
                    <div><span className="font-medium">Password:</span> {isPasswordProtected ? 'Protected' : 'Public'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Create Portal
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
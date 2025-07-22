import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Database types - you can generate these from Supabase CLI
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: number
          user_id: string
          full_name: string | null
          email: string
          plan_id: string
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          email: string
          plan_id?: string
          trial_ends_at?: string | null
        }
        Update: {
          full_name?: string | null
          plan_id?: string
          trial_ends_at?: string | null
        }
      }
      portals: {
        Row: {
          id: number
          user_id: string
          title: string
          description: string | null
          slug: string
          is_published: boolean
          password: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          slug: string
          is_published?: boolean
          password?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          slug?: string
          is_published?: boolean
          password?: string | null
        }
      }
      content_blocks: {
        Row: {
          id: number
          portal_id: number
          type: 'text' | 'payment' | 'upload' | 'link'
          title: string
          content: string
          block_order: number
          settings: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          portal_id: number
          type: 'text' | 'payment' | 'upload' | 'link'
          title: string
          content: string
          block_order: number
          settings?: Record<string, any> | null
        }
        Update: {
          title?: string
          content?: string
          block_order?: number
          settings?: Record<string, any> | null
        }
      }
    }
  }
}

// Helper functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const createPortal = async (portal: Database['public']['Tables']['portals']['Insert']) => {
  const { data, error } = await supabase
    .from('portals')
    .insert(portal)
    .select()
    .single()
  
  return { data, error }
}

export const getPortalBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('portals')
    .select(`
      *,
      content_blocks (
        id,
        type,
        title,
        content,
        block_order,
        settings
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  
  return { data, error }
}

export const updatePortal = async (
  id: number, 
  updates: Database['public']['Tables']['portals']['Update']
) => {
  const { data, error } = await supabase
    .from('portals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}
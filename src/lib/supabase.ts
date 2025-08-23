import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const createSupabaseClient = () => createClientComponentClient()

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_type: 'free' | 'premium'
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_type?: 'free' | 'premium'
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_type?: 'free' | 'premium'
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          ip_address: string | null
          action_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          action_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          action_type?: string
          created_at?: string
        }
      }
      usage_limits: {
        Row: {
          id: string
          user_type: 'guest' | 'free' | 'premium'
          daily_limit: number
          monthly_limit: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_type: 'guest' | 'free' | 'premium'
          daily_limit: number
          monthly_limit?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_type?: 'guest' | 'free' | 'premium'
          daily_limit?: number
          monthly_limit?: number | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string | null
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}

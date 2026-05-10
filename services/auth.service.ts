import { supabase } from '@/lib/supabase'

export const signUp = (email: string, password: string, full_name: string) =>
  supabase.auth.signUp({ email, password, options: { data: { full_name } } })

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()
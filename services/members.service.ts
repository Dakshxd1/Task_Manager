import { supabase } from '@/lib/supabase'

export const getMembers = () =>
  supabase.from('profiles').select('*').order('created_at')

export const updateMemberRole = (id: string, role: 'admin' | 'member') =>
  supabase.from('profiles').update({ role }).eq('id', id)
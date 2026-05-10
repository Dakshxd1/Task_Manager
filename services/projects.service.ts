import { supabase } from '@/lib/supabase'

export const getProjects = () =>
  supabase.from('projects').select('*').is('deleted_at', null)

export const createProject = (data: any) =>
  supabase.from('projects').insert(data).select().single()

export const updateProject = (id: string, data: any) =>
  supabase.from('projects').update(data).eq('id', id)

export const deleteProject = (id: string) =>
  supabase.from('projects')
    .update({ deleted_at: new Date().toISOString() }).eq('id', id)
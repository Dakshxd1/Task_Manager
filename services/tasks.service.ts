import { supabase } from '@/lib/supabase'

export const getTasks = (projectId?: string) => {
  let q = supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assigned_to_fkey(*)')
    .is('deleted_at', null)
  if (projectId) q = q.eq('project_id', projectId)
  return q
}

export const createTask = (data: any) =>
  supabase.from('tasks').insert(data).select().single()

export const updateTask = (id: string, data: any) =>
  supabase.from('tasks').update(data).eq('id', id)

export const deleteTask = (id: string) =>
  supabase.from('tasks')
    .update({ deleted_at: new Date().toISOString() }).eq('id', id)
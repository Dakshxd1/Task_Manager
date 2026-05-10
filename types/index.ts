export type UserRole = 'admin' | 'member'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived'

export interface Profile {
  id: string; full_name: string; email: string
  avatar_url?: string; role: UserRole; created_at: string
}
export interface Project {
  id: string; name: string; description?: string; status: ProjectStatus
  owner_id: string; deadline?: string; created_at: string
  owner?: Profile; members?: ProjectMember[]; tasks?: Task[]
  task_count?: number; completed_count?: number
}
export interface ProjectMember {
  id: string; project_id: string; user_id: string; role: UserRole; profile?: Profile
}
export interface Task {
  id: string; title: string; description?: string; status: TaskStatus
  priority: TaskPriority; project_id: string; assigned_to?: string
  due_date?: string; created_by: string; created_at: string
  project?: Project; assignee?: Profile; creator?: Profile; comments?: TaskComment[]
}
export interface TaskComment {
  id: string; task_id: string; user_id: string; content: string
  created_at: string; author?: Profile
}
export interface Notification {
  id: string; user_id: string; title: string
  message: string; is_read: boolean; created_at: string
}
export interface Database { public: { Tables: Record<string, unknown> } }

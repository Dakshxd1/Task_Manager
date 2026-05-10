import { supabase } from '@/lib/supabase'
import { signIn, signOut } from '@/services/auth.service'
import { getProjects, createProject, updateProject as updateProjectDB, deleteProject as deleteProjectDB } from '@/services/projects.service'
import { getTasks, createTask, updateTask as updateTaskDB, deleteTask as deleteTaskDB } from '@/services/tasks.service'
import { getMembers, updateMemberRole as updateRoleDB } from '@/services/members.service'
import { create } from 'zustand'
import { Profile, Project, Task, Notification } from '@/types'

const mockNotifications: Notification[] = [
  { id: 'n1', user_id: 'u1', title: 'Task Completed', message: 'Sam Chen marked "Implement auth flow" as done ✓', is_read: false, created_at: new Date(Date.now()-1800000).toISOString() },
  { id: 'n2', user_id: 'u1', title: 'New Comment', message: 'Jordan commented on "Design hero section"', is_read: false, created_at: new Date(Date.now()-3600000).toISOString() },
  { id: 'n3', user_id: 'u1', title: 'Task Assigned', message: 'You were assigned to "Setup CI/CD pipeline"', is_read: true, created_at: new Date(Date.now()-86400000).toISOString() },
  { id: 'n4', user_id: 'u1', title: 'Project Updated', message: 'API Gateway Migration moved to On Hold', is_read: true, created_at: new Date(Date.now()-172800000).toISOString() },
]

interface AppStore {
  user: Profile | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  projects: Project[]
  addProject: (p: Omit<Project, 'id'|'created_at'>) => void
  updateProject: (id: string, u: Partial<Project>) => void
  deleteProject: (id: string) => void
  tasks: Task[]
  addTask: (t: Omit<Task, 'id'|'created_at'>) => void
  updateTask: (id: string, u: Partial<Task>) => void
  deleteTask: (id: string) => void
  notifications: Notification[]
  markAllRead: () => void
  markRead: (id: string) => void
  members: Profile[]
  updateMemberRole: (id: string, role: 'admin'|'member') => void
  loadData: () => Promise<void>
}

export const useStore = create<AppStore>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data, error } = await signIn(email, password)
    if (error || !data.user) return false
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single()
    set({ user: profile, isAuthenticated: true })
    return true
  },

  logout: async () => {
    await signOut()
    set({ user: null, isAuthenticated: false })
  },

  // ── PROJECTS ────────────────────────────────────────────────
  projects: [],

  addProject: async (p) => {
    const { user } = get()
    const { data } = await createProject({ ...p, owner_id: user?.id })
    if (data) set(s => ({ projects: [...s.projects, data] }))
  },

  updateProject: async (id, u) => {
    await updateProjectDB(id, u)
    set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...u } : p) }))
  },

  deleteProject: async (id) => {
    await deleteProjectDB(id)
    set(s => ({
      projects: s.projects.filter(p => p.id !== id),
      tasks: s.tasks.filter(t => t.project_id !== id),
    }))
  },

  // ── TASKS ────────────────────────────────────────────────────
  tasks: [],

  addTask: async (t) => {
    const { user } = get()
    const { data } = await createTask({ ...t, created_by: user?.id })
    if (data) {
      const { members } = get()
      const assignee = members.find(m => m.id === data.assigned_to)
      set(s => ({
        tasks: [...s.tasks, { ...data, assignee }],
        projects: s.projects.map(p =>
          p.id === data.project_id ? { ...p, task_count: (p.task_count || 0) + 1 } : p
        ),
      }))
    }
  },

  updateTask: async (id, u) => {
    await updateTaskDB(id, u)
    set(s => {
      const old = s.tasks.find(t => t.id === id)
      const assignee = u.assigned_to ? s.members.find(m => m.id === u.assigned_to) : old?.assignee
      const tasks = s.tasks.map(t => t.id === id ? { ...t, ...u, assignee } : t)
      let projects = s.projects
      if (u.status && old) {
        projects = s.projects.map(p => {
          if (p.id !== old.project_id) return p
          const delta = (u.status === 'done' ? 1 : 0) - (old.status === 'done' ? 1 : 0)
          return { ...p, completed_count: Math.max(0, (p.completed_count || 0) + delta) }
        })
      }
      return { tasks, projects }
    })
  },

  deleteTask: async (id) => {
    await deleteTaskDB(id)
    set(s => {
      const task = s.tasks.find(t => t.id === id)
      return {
        tasks: s.tasks.filter(t => t.id !== id),
        projects: s.projects.map(p => {
          if (!task || p.id !== task.project_id) return p
          return {
            ...p,
            task_count: Math.max(0, (p.task_count || 0) - 1),
            completed_count: task.status === 'done'
              ? Math.max(0, (p.completed_count || 0) - 1)
              : p.completed_count,
          }
        }),
      }
    })
  },

  // ── NOTIFICATIONS ────────────────────────────────────────────
  notifications: mockNotifications,
  markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, is_read: true })) })),
  markRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: true } : n) })),

  // ── MEMBERS ──────────────────────────────────────────────────
  members: [],

  updateMemberRole: async (id, role) => {
    await updateRoleDB(id, role)
    set(s => ({ members: s.members.map(m => m.id === id ? { ...m, role } : m) }))
  },

  // ── LOAD ALL DATA FROM SUPABASE ──────────────────────────────
  loadData: async () => {
    const [{ data: projects }, { data: tasks }, { data: members }] =
      await Promise.all([getProjects(), getTasks(), getMembers()])
    set({
      projects: projects ?? [],
      tasks:    tasks    ?? [],
      members:  members  ?? [],
    })
  },
}))
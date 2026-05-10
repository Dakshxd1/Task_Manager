import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TaskPriority, TaskStatus, ProjectStatus } from '@/types'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
  return `${Math.floor(diff/86400000)}d ago`
}

export function isOverdue(due?: string, status?: TaskStatus) {
  if (!due || status === 'done') return false
  return new Date(due) < new Date()
}

export function getInitials(name: string) {
  return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
}

export function formatStatus(s: string) {
  return s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function getPriorityDot(p: TaskPriority) {
  return { low: '#0EA5E9', medium: '#F59E0B', high: '#F97316', critical: '#F43F5E' }[p]
}

export function getStatusDot(s: TaskStatus) {
  return { todo: '#475569', in_progress: '#818CF8', review: '#F59E0B', done: '#10B981' }[s]
}

export function getProjectProgress(p: { task_count?: number; completed_count?: number }) {
  if (!p.task_count) return 0
  return Math.round((p.completed_count||0) / p.task_count * 100)
}

export const chartData = [
  { name: 'Mon', completed: 4, created: 6, velocity: 67 },
  { name: 'Tue', completed: 7, created: 5, velocity: 100 },
  { name: 'Wed', completed: 3, created: 8, velocity: 38 },
  { name: 'Thu', completed: 9, created: 7, velocity: 100 },
  { name: 'Fri', completed: 6, created: 4, velocity: 100 },
  { name: 'Sat', completed: 2, created: 3, velocity: 67 },
  { name: 'Sun', completed: 5, created: 6, velocity: 83 },
]
